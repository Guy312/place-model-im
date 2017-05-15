/*
    Place model - demo #4
    Drone route, minimal flight height
 */

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
    "esri/symbols/TextSymbol",
    "dojo/domReady!"
], function(
    Map, MapView,
    Graphic, Point, Polyline, Polygon, PictureMarkerSymbol,
    SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,TextSymbol
) {

    var map = new Map({basemap: "hybrid"});

    var view = new MapView({
        center: [-80, 35],
        container: "mapDiv",
        map: map,
        zoom: 3
    });


    var droneSymbol = new PictureMarkerSymbol('/resources/img/drone.png', 20, 20);

    var markerSymbol = new SimpleMarkerSymbol({
        color: [225, 25, 0],
        outline: { // autocasts as new SimpleLineSymbol()
            color: [25, 0, 0],
            width: 2
        }
    });

    var dronePathSymbol = new SimpleLineSymbol({
        color: [226, 119, 40, 0.6],
        width: 4
    });

    var sectionSymbol = new SimpleFillSymbol({
        color: [255, 25, 0, 0.0],
        outline: { color: [255, 255, 255], width: 1 }
    });

    var restrictedFillSymbol = new SimpleFillSymbol({
        outline: { color: [115, 0, 0, 1] },
        color: [255, 127, 127, 0.26]
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
            symbol: droneSymbol
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


    $.get("/place_tree", function(data, status){

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
            $.get("/zone/name/".concat(result[0].text), function(data, status){
                var dataJson = JSON.parse(data);
                var p = new Polygon(dataJson.geometry);
                $('#props').html(JSON.stringify(dataJson.properties, null, 2));
                view.goTo(p.extent)
                view.graphics.add(new Graphic(p, sectionSymbol));
            });
        });
    });


    var a = ['Section002', 'Section003','Section004', 'Section005','Section006', 'Section007','Section008'];
    a.forEach(function(element) {
        $.get("/zone/name/"+element, function(data, status){
            console.log(element);
            console.log("Data: " + data + "\"Status: " + status);
            var dataJson = JSON.parse(data);
            var p = new Polygon(dataJson.geometry);

            var props = dataJson.properties;
            console.log(p);
            console.log(p.centroid);
            if (props.flightPermission == "restricted") {
                view.graphics.add(new Graphic(p, restrictedFillSymbol));
            } else {
                view.graphics.add(new Graphic(p, sectionSymbol));
                cent = p.centroid;
                var h = "0m";
                if (props.flightPermission == "minHeight") {
                    h = props.minHeight;
                }
                var textSymbol = new TextSymbol({
                    color: "black",
                    haloColor: "black",
                    haloSize: "1px",
                    text: h,
                    xoffset: 3,
                    yoffset: 3,
                    font: {  // autocast as esri/symbols/Font
                        size: 12,
                        family: "sans-serif",
                        weight: "bolder"
                    }
                });

                view.graphics.add(new Graphic(cent, textSymbol));
            }
        });
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




