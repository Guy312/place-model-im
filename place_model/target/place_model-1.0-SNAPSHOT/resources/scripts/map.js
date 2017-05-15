
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "dojo/domReady!"
], function(
    Map, MapView,
    Graphic, Point, Polyline, Polygon, PictureMarkerSymbol,
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol
) {

    var map = new Map({
        basemap: "hybrid"
    });

    var view = new MapView({
        center: [-80, 35],
        container: "mapDiv",
        map: map,
        zoom: 3
    });


    var droneSymbol = new PictureMarkerSymbol('/resources/img/drone.png', 20, 20);



    /**********************
     * Create a point graphic
     **********************/

        // First create a point geometry (this is the location of the Titanic)
    var point = new Point({
            longitude: -49.97,
            latitude: 41.73
        });

    // Create a symbol for drawing the point
    var markerSymbol = new SimpleMarkerSymbol({
        color: [225, 25, 0],
        outline: { // autocasts as new SimpleLineSymbol()
            color: [25, 0, 0],
            width: 2
        }
    });

    // Create a graphic and add the geometry and symbol to it
    var pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
    });

    /*************************
     * Create a polyline graphic
     *************************/

        // First create a line geometry (this is the Keystone pipeline)
    var polyline = new Polyline({
            paths: [
                [-111.30, 52.68],
                [-98, 49.5],
                [-93.94, 29.89]
            ]
        });

    // Create a symbol for drawing the line
    var lineSymbol = new SimpleLineSymbol({
        color: [226, 119, 40],
        width: 4
    });

    // Create an object for storing attributes related to the line
    var lineAtt = {
        Name: "Keystone Pipeline",
        Owner: "TransCanada",
        Length: "3,456 km"
    };

    /*******************************************
     * Create a new graphic and add the geometry,
     * symbol, and attributes to it. You may also
     * add a simple PopupTemplate to the graphic.
     * This allows users to view the graphic's
     * attributes when it is clicked.
     ******************************************/
    var polylineGraphic = new Graphic({
        geometry: polyline,
        symbol: lineSymbol,
        attributes: lineAtt,
        popupTemplate: { // autocasts as new PopupTemplate()
            title: "{Name}",
            content: [{
                type: "fields",
                fieldInfos: [{
                    fieldName: "Name"
                }, {
                    fieldName: "Owner"
                }, {
                    fieldName: "Length"
                }]
            }]
        }
    });

    /************************
     * Create a polygon graphic
     ************************/

        // Create a polygon geometry
    var polygon = new Polygon({
            rings: [
                [-64.78, 32.3],
                [-66.07, 18.45],
                [-80.21, 25.78],
                [-64.78, 32.3]
            ]
        });

    // Create a symbol for rendering the graphic
    var fillSymbol = new SimpleFillSymbol({
        color: [255, 25, 0, 0.0],
        outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 1
        }
    });



    // Add the geometry and symbol to a new graphic
    var polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: fillSymbol
    });

    function alertDroneOutside(){
        clearInterval(myVar);

        droneSymbol = markerSymbol;
        $("#alert").html("DRONE OUTSIDE FACILITY BOUNDARY !!");
        $("#alert").css("display", "block")
        var droneGraphic = new Graphic({
            geometry: currentDronePos,
            symbol: droneSymbol
        });

        if (droneIndex>=0){
            view.graphics.removeAt(droneIndex);
        }

        view.graphics.add(droneGraphic);
        droneIndex = view.graphics.indexOf(droneGraphic);

    }


    var droneIndex = -1;
    var percent = 0;
    var myVar;
    var currentPlaceName;
    var currentDronePos;

    function myTimer() {
        percent ++;

        $.get("/drone/"+percent, function(data, status){
            var obj = {"location": data,
                "place":currentPlaceName};

            if (currentPlaceName!='') {
                $.ajax({
                    type: 'POST',
                    url: "/isin",
                    data: JSON.stringify(obj),
                    success: function (sdata) {
                        console.log(sdata);
                        if (sdata.isin == false) {
                            alertDroneOutside();
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.log((xhr.status));
                        console.log((thrownError));
                        clearInterval(myVar);
                    },
                    contentType: "application/json",
                    dataType: 'json'
                });
            }


            currentDronePos = new Point(JSON.parse(data));
            var droneGraphic = new Graphic({
                geometry: currentDronePos,
                symbol: droneSymbol
            });

            if (droneIndex>=0){
                view.graphics.removeAt(droneIndex);
            }
            //view.goTo(p)
            view.graphics.add(droneGraphic);
            droneIndex = view.graphics.indexOf(droneGraphic);
        });
    }

    view.on("click", clickMap);

    function clickMap(evt) {
        console.log("Map clicked");
        console.log(evt.x+" "+evt.y);
        $("#alert").html("");
        $("#alert").css("display", "none");
        droneSymbol = new PictureMarkerSymbol('/resources/img/drone.png', 20, 20);

        myVar = setInterval(myTimer, 1000);
        percent = 0;
    }


        $.get("/place_tree", function(data, status){
        console.log("Data: " + data + "\nStatus: " + status);

        $('#jstree_demo_div').jstree({ 'core' : {
            'data' : JSON.parse(data)
        } });

        $('#jstree_demo_div').on("changed.jstree", function (e, sdata) {
            id = sdata.selected[0];
            var result = $.grep(JSON.parse(data), function(e){ console.log(e); return e.id == id; });
            currentPlaceName = result[0].text;
            $.get("/polygon/name/".concat(result[0].text), function(data, status){
                console.log("Data: " + data + "\"Status: " + status);
                var p = new Polygon(JSON.parse(data));

                view.goTo(p.extent)
                view.graphics.add(new Graphic(p, fillSymbol));
            });
        });
    });

});



