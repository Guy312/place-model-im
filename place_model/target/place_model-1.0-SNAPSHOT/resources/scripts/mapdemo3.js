
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


   // var forkliftSymbol = new PictureMarkerSymbol('/resources/img/forklift.png', 10, 10);
    var forkliftSymbol = new SimpleMarkerSymbol({
        color: [25, 25, 25],
        size: 10,
        outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 1
        }
    });


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
        //alert("DRONE OUTSIDE FACILITY BOUDARY !!");
        forkliftSymbol = markerSymbol;
        $("#alert").html("DRONE OUTSIDE FACILITY BOUNDARY !!");
        $("#alert").css("display", "block")
        var forkliftGraphic = new Graphic({
            geometry: currentDronePos,
            symbol: forkliftSymbol
        });

        if (forkliftIndex>=0){
            view.graphics.removeAt(forkliftIndex);
        }

        view.graphics.add(forkliftGraphic);
        forkliftIndex = view.graphics.indexOf(forkliftGraphic);

    }


    var forkliftCount = 0;
    var forkliftPath = [];
    var forkliftPosition = [];
    var posAsked = [];
    var percent = [];
    var myVar;
    var currentPlaceName;
    var currentDronePos;

    function getNextPoint(index) {

        percent[index]++;
        if (percent[index]>87) {
            percent[index] = 32;
        }
       // console.log(index +") percent = " + percent[index] + "|"+ forkliftPath[index].length);
        $.get("/forklift/" + percent[index], function (data, status) {
            //console.log("Data: " + data + "\nStatus: " + status);

            currentDronePos = new Point(JSON.parse(data));
            if (forkliftPath[index]!=undefined) {
                forkliftPath[index].push(currentDronePos);

                posAsked[index] = false;
            }

        });
    }

    function updatePosition(index, pnt){
        var forkliftGraphic = new Graphic({
            geometry: pnt,
            symbol: forkliftSymbol
        });

        view.graphics.removeAt(index + 1);
        view.graphics.add(forkliftGraphic,index + 1);
    }

    function myTimer() {

        for(var ind = 0; ind < forkliftCount; ind++)
        {
            if (forkliftPath[ind].length<3 && (!posAsked[ind])) {
                posAsked[ind] = true;
                getNextPoint(ind);
            } else {
                if (forkliftPath[ind].length<2) continue;

                var d = 0.000005;
                if (forkliftPosition[ind]==null){
                    forkliftPosition[ind] = forkliftPath[ind][0];
                }
                var x0 = forkliftPosition[ind].x;
                var y0 = forkliftPosition[ind].y;
                var x1 = forkliftPath[ind][1].x;
                var y1 = forkliftPath[ind][1].y;
                var l = Math.sqrt(Math.pow((x0-x1),2)+Math.pow((y0-y1),2));
                //console.log("0 ->" + x0 + "," +  y0 );
                //console.log("1 ->" +x1 + "," +  y1 );
                //console.log(ind +") l = " + l);
                if (l<d) {
                    forkliftPath[ind].shift();
                    forkliftPosition[ind] = forkliftPath[ind][0];
                } else {
                    var x = x0+(x1-x0)*d/l;
                    var y = y0+(y1-y0)*d/l;
                    //console.log(x + "," +  y );
                    forkliftPosition[ind] = new Point(x, y);
                }
                updatePosition(ind, forkliftPosition[ind]);
            }

        }
    }

    $("#return").click(function(){
       // console.log("return forklift");
        $("#alert").html("");
        $("#alert").css("display", "none");
        $("#data_block").css("display", "block");

        if (forkliftCount>0) {
            view.graphics.removeAt(forkliftCount);
            percent.pop();
            forkliftPath.pop();
            forkliftPosition.pop();
            posAsked.pop();
            forkliftCount--;
            $("#forklifts").html(forkliftCount);

        }

        if (forkliftCount>=4) {
            $("#alert").html("Too many forklift vehicles in section");
            $("#alert").css("display", "block");
        }
        myVar = setInterval(myTimer, 300);

    })

    $("#deploy").click(function(){
       // console.log("Deploy forklift");
        $("#alert").html("");
        $("#alert").css("display", "none");
        $("#data_block").css("display", "block");

        forkliftCount++;
        $("#forklifts").html(forkliftCount);
        if (forkliftCount>=4) {
            $("#alert").html("Too many forklift vehicles in section");
            $("#alert").css("display", "block");
        }
        percent.push(0);
        forkliftPath.push([]);
        posAsked.push(false);
        //forkliftIndex.push(-1);
        myVar = setInterval(myTimer, 300);

    })
    // Add the graphics to the view's graphics layer
   // view.graphics.addMany([pointGraphic, polylineGraphic, polygonGraphic]);
    //console.log('OK');
    //console.log(view.graphics);

    $.get("/place_tree", function(data, status){
        //console.log("Data: " + data + "\nStatus: " + status);

        $('#jstree_demo_div').jstree({ 'core' : {
            'data' : JSON.parse(data)
        } }).bind("loaded.jstree", function ()
        {
        var sus = $.grep(JSON.parse(data), function(e){ return e.text == "Susquehanna Steam Electric Station"; });
        $('#jstree_demo_div').jstree("select_node", sus[0].id.toString()).trigger("select_node.jstree");

        });


        $('#jstree_demo_div').on("changed.jstree", function (e, sdata) {
            id = sdata.selected[0];
            var result = $.grep(JSON.parse(data), function(e){ return e.id == id; });
            currentPlaceName = result[0].text;
            $.get("/polygon/name/".concat(result[0].text), function(data, status){
                //console.log("Data: " + data + "\"Status: " + status);
                var p = new Polygon(JSON.parse(data));

                view.goTo(p.extent)
                view.graphics.add(new Graphic(p, fillSymbol));
            });
        });
    });

});




