/*
 Place model - demo #5
 Drone route, minimal flight height
 */

require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/symbols/PointSymbol3D",
    "esri/symbols/IconSymbol3DLayer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/TextSymbol",
    "esri/symbols/MeshSymbol3D",
    "esri/symbols/FillSymbol3DLayer",
    "dojo/domReady!"
], function (Map, SceneView,
             Graphic, Point, Polyline, Polygon, PointSymbol3D, IconSymbol3DLayer, PictureMarkerSymbol,
             SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, MeshSymbol3D, FillSymbol3DLayer) {

    var map = new Map({
        basemap: "hybrid",
        ground: "world-elevation"
    });
    var view = new SceneView({
        container: "mapDiv",  // Reference to the DOM node that will contain the view
        map: map  // References the map object created in step 3
    });

    var pointSymbol3D = new PointSymbol3D({
        symbolLayers: [new IconSymbol3DLayer({
            anchor: "center",
            material: {
                color: [230, 0, 0, 0.51]
            }
        })]
    });

    var sectionSymbol = new SimpleFillSymbol({
        color: [255, 25, 0, 0.0],
        outline: {color: [255, 255, 255], width: 1}
    });

    // First create a point geometry (this is the location of the Titanic)
    var point = new Point({
        latitude: 41.09357130260002,
        longitude: -76.14526927471161,
        height: 20
    });

    // Create a polygon geometry
    var polygon = new Polygon({
        hasZ: true,
        rings: [[
            [-76.14526927471161, 41.09357130260002, 10],
            [-77.14526927471161, 41.09357130260002, 10],
            [-76.14526927471161, 40.09357130260002, 10],
            [-77.14526927471161, 40.09357130260002, 10]
        ]]
    });


    var meshSymbol3D = new MeshSymbol3D({
        symbolLayers: [new FillSymbol3DLayer({
            material: {
                color: [25, 25,255, 0.56]
            }
        })]
    });

    var restrictedfillSymbol = new MeshSymbol3D({
        symbolLayers: [new FillSymbol3DLayer({
            material: {
                color: [255, 25, 25, 0.56]
            }
        })]
    });

    /*new SimpleFillSymbol({
     outline: { color: [115, 0, 0, 1] },
     color: [255, 127, 127, 0.26]
     });*/

    // Add the geometry and symbol to a new graphic
    var polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: meshSymbol3D
    });

    var forkliftGraphic = new Graphic({
        geometry: point,
        symbol: pointSymbol3D
    });


    var forkliftCount = 0;
    var forkliftPath = [];
    var forkliftPosition = [];
    var forkliftIndex = [];
    var posAsked = [];
    var percent = [];
    var myVar;
    var currentPlaceName;
    var currentDronePos;

    function getNextPoint(index) {
        percent[index]++;
        if (percent[index]>11) {
            console.log("STOP");
            return false;
        }
        $.get("/dronepath/" + percent[index], function (data, status) {
            currentDronePos = new Point(JSON.parse(data));
            if (forkliftPath[index]!=undefined) {
                forkliftPath[index].push(currentDronePos);
                posAsked[index] = false;
            }
        });
    }
    function toFixed(num, fixed) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
        return num.toString().match(re)[0];
    }
    function dms(a0){
        a = Math.abs(a0);
        var d = Math.trunc(a);
        var m = Math.trunc((a-d)*60);
        var s = toFixed((a-d-m/60)*60*60,2);

        return Math.sign(a0)*d+'\u00B0'+m+"'"+s+"\"";
    }
    function height(h){
        return toFixed(h,2)+"m";
    }
    function updatePosition(index, pnt){
        $("#lat").html(dms(pnt.x));
        $("#lon").html(dms(pnt.y));
        $("#height").html(height(pnt.z));

        var forkliftGraphic = new Graphic({
            geometry: pnt,
            symbol: pointSymbol3D
        });
        drawindex = forkliftIndex[index];
        grph = view.graphics.getItemAt(drawindex);
        if (grph.symbol.url == "/resources/img/drone.png") {
            view.graphics.removeAt(drawindex);
        }
        view.graphics.add(forkliftGraphic,drawindex);
    }

    function myTimer() {
        for(var ind = 0; ind < forkliftCount; ind++)
        {
            if (forkliftPath[ind].length<3 && (!posAsked[ind])) {
                posAsked[ind] = true;

                if (getNextPoint(ind)==false){
                    clearInterval(myVar);

                    drawindex = forkliftIndex[ind];
                    grph = view.graphics.getItemAt(drawindex);
                    // console.log(grph.symbol.url);
                    if (grph.symbol.url == "/resources/img/drone.png") {
                        console.log("OK >>"+drawindex);
                        view.graphics.removeAt(drawindex);
                        percent.pop();
                        forkliftPath.pop();
                        forkliftPosition.pop();
                        posAsked.pop();
                        forkliftCount--;
                    }
                    return;
                };
            } else {
                if (forkliftPath[ind].length<2) continue;

                var d = 0.00005;
                if (forkliftPosition[ind]==null){
                    forkliftPosition[ind] = forkliftPath[ind][0];
                }
                var x0 = forkliftPosition[ind].x;
                var y0 = forkliftPosition[ind].y;
                var z0 = forkliftPosition[ind].z;
                var x1 = forkliftPath[ind][1].x;
                var y1 = forkliftPath[ind][1].y;
                var z1 = forkliftPath[ind][1].z;
                var l = Math.sqrt(Math.pow((x0-x1),2)+Math.pow((y0-y1),2));
                if (l<d) {
                    forkliftPath[ind].shift();
                    forkliftPosition[ind] = forkliftPath[ind][0];
                } else {
                    var x = x0+(x1-x0)*d/l;
                    var y = y0+(y1-y0)*d/l;
                    var z = z0+(z1-z0)*d/l;
                    forkliftPosition[ind] = new Point(x, y,z);
                }
                updatePosition(ind, forkliftPosition[ind]);
            }

        }
    }

    $("#return").click(function(){
        $("#alert").html("");
        $("#alert").css("display", "none");
        $("#data_block").css("display", "block");

        if (forkliftCount>0) {
            drawindex = forkliftIndex[forkliftCount-1];
            grph = view.graphics.getItemAt(drawindex);
            if (grph.symbol.url == "/resources/img/drone.png") {
                console.log(grph.symbol.url);
                view.graphics.removeAt(drawindex);
            }
            percent.pop();
            forkliftPath.pop();
            forkliftPosition.pop();
            posAsked.pop();
            forkliftCount--;
        }

        if (forkliftCount>=4) {
            $("#alert").html("Too many forklift vehicles in section");
            $("#alert").css("display", "block");
        }
        myVar = setInterval(myTimer, 300);
    });

    $("#deploy").click(function(){
        $("#alert").html("");
        $("#alert").css("display", "none");
        $("#data_block").css("display", "block");

        forkliftCount++;
        if (forkliftCount>=4) {
            $("#alert").html("Too many drone vehicles in section");
            $("#alert").css("display", "block");
        }
        percent.push(0);
        forkliftPath.push([]);
        posAsked.push(false);

        forkliftIndex[forkliftCount-1] = view.graphics.length-1;
        myVar = setInterval(myTimer, 300);

    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // view.goTo(point);
    view.graphics.add(forkliftGraphic);
    view.graphics.add(polygonGraphic)


    $.get("/place_tree", function (data, status) {

        $('#jstree_demo_div').jstree({
            'core': {
                'data': JSON.parse(data)
            }
        }).bind("loaded.jstree", function () {
            var sus = $.grep(JSON.parse(data), function (e) {
                return e.text == "Susquehanna Steam Electric Station";
            });
            $('#jstree_demo_div').jstree("select_node", sus[0].id.toString()).trigger("select_node.jstree");

        });


        $('#jstree_demo_div').on("changed.jstree", function (e, sdata) {
            id = sdata.selected[0];
            var result = $.grep(JSON.parse(data), function (e) {
                return e.id == id;
            });
            currentPlaceName = result[0].text;
            $.get("/zone/name/".concat(result[0].text), function (data, status) {
                var dataJson = JSON.parse(data);
                var p = new Polygon(dataJson.geometry);
                $('#props').html(JSON.stringify(dataJson.properties, null, 2));
                view.goTo(p.extent)
                view.graphics.add(new Graphic(p, sectionSymbol));
            });
        });
    });


    //var a = ['Section002', 'Section003','Section004', 'Section005','Section006', 'Section007','Section008'];
    var a = [['Section002', '270'], ['Section003', '230'], ['Section004', '210'],
        ['Section005', '1000'], ['Section006', '1000'], ['Section007', '220'], ['Section008', '220']];
    //var a = ['Section002'];
    a.forEach(function (element) {
        $.get("/make3d/" + element[0] + "/" + element[1], function (data, status) {
            //console.log(element);
            console.log("Data: " + data + "\"Status: " + status);
            var dataJson = JSON.parse(data);
            var p = new Polygon(dataJson.geometry);
            //var props = dataJson.properties;
            view.graphics.add(new Graphic(p, meshSymbol3D));

        });
    });

    var dronePathSymbol = new SimpleLineSymbol({
        color: [226, 119, 40, 0.6],
        width: 3
    });

    $.get("/polyline/name/dronepath_path001", function(data, status){

        console.log("Data: " + data + "\"Status: " + status);
        var dataJson = JSON.parse(data);
        var p = new Polyline(dataJson);
        view.graphics.add(new Graphic(p, dronePathSymbol));

        var startSymbol = new PictureMarkerSymbol({
            url: "/resources/img/dest.png",
            width: 20,
            height: 20,
            yoffset: 10
        });

        var pnt = p.getPoint(0,0);
        view.graphics.add(new Graphic(pnt, startSymbol));
        var pnt = p.getPoint(0,11);
        view.graphics.add(new Graphic(pnt, startSymbol));
    });

});




