/**
 * Created by 502669124 on 4/25/2017.
 */
/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }

    return _p8() + _p8(true) + _p8(true) + _p8();
}

class MovingThings {
    constructor(vs) {
        this.mos = [];
        this.myVar = setInterval(this.mytick.bind(this), 100);
        this.vs = vs;
    }

    mytick() {
        for (var i = 0; i < this.mos.length; i++) {
            if (this.mos[i].OnMoving) {
                this.mos[i].nextPosition(this.vs);
            }
        }
    }

    clear() {
        for (var i = 0; i < this.mos.length; i++) {
            this.mos[i].remove(this.vs);
        }
        this.mos = [];
    }

}


class MovingObject {
    constructor(lat, lon) {
        if ((lat == undefined) || (lon == undefined)) {
            this.pos = undefined;
        } else {
            this.pos = [lat, lon];
        }
        this.path = [];
        this.OnPointRequest = false;
        this.OnMoving = true;
        this.id = guid();
        this.percent = 0;
        this.color = '#000000';
        this.pathName = "none";
        this.d = 0.00005;
        this.perFunc = function (x) {
            if (x > 100) {
                return x - 100;
            } else {
                return x;
            }
        }
    }

    addPathPoint(lat, lon) {
        this.path.push([lat, lon]);
        //  console.log("ADD POINT TO PATH");
        //  console.log(this.path);
    }

    requestNextPoint() {
        this.percent = this.perFunc(this.percent + 1);

        $.get("/drone/path/" + this.pathName + "/" + this.percent, function (data, status) {
            console.log("PATH POINT");
            console.log(data);
            var pnt = JSON.parse(data)
            this.addPathPoint(pnt[0], pnt[1]);
            this.OnPointRequest = false;
        }.bind(this));

    }

    nextPosition(vectorSource) {
        if (this.path.length < 3 && (!this.OnPointRequest)) {
            this.OnPointRequest = true;
            this.requestNextPoint();

        } else if (this.path.length >= 2) {


            console.log("this.pos:");
            console.log(this.pos);
            if (this.pos == undefined) {
                console.log("in");
                this.pos = this.path[0];
            }
            console.log("out");

            var x0 = this.pos[0];
            var y0 = this.pos[1];
            var x1 = this.path[1][0];
            var y1 = this.path[1][1];
            var l = Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2));
            if (l < this.d) {
                this.path.shift();
                this.pos = this.path[0];
            } else {
                var x = x0 + (x1 - x0) * this.d / l;
                var y = y0 + (y1 - y0) * this.d / l;
                this.pos = [x, y];
            }
            this.updatePosition(vectorSource);
        }
    }

    updatePosition(vectorSource) {
        console.log("UPDATE POSITION");
        console.log(this.pos);
        if (this.pos[1] > 41.09595) {
            $("#alert").html("DRONE OUTSIDE FACILITY BOUNDARY !!");
            $("#alert").css("display", "block");
            this.color = '#ff0000';
            this.OnMoving = false;
        }
        this.remove(vectorSource);
        this.show(vectorSource);
    }

    show(vectorSource) {
        var feature1 = new ol.Feature({
            'geometry': new ol.geom.Point(ol.proj.fromLonLat(this.pos))
        });
        feature1.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({color: this.color}),
                stroke: new ol.style.Stroke({color: '#000000', width: 1})
            })
        }));
        feature1.setId(this.id);
        vectorSource.addFeature(feature1);
    }

    remove(vectorSource) {
        var feature = vectorSource.getFeatureById(this.id);

        // console.log(feature);
        if (feature != null) {
            vectorSource.removeFeature(feature);
        }
    }

}

class DataBlock {
    constructor(data) {
        this.time_flight = data.time_flight || 0;
        this.time_photo = data.time_photo || 0;
        this.time_flight_on = data.time_flight_on || false;
        this.time_photo_on = data.time_photo_on || false;
        this.myVar = null;
    }

    turnOff() {
        $('#data_block').css("display", "none");
        clearInterval(this.myVar);
    }

    turnOn() {
        this.update();
        $('#data_block').css("display", "block");
        this.myVar = setInterval(this.mytick.bind(this), 1000);
    }

    mytick() {
        if (this.time_flight_on) {
            this.time_flight++;
        }
        if (this.time_photo_on) {
            this.time_photo++;
        }
        this.update();
    }

    formatTime(sec) {
        var minutes = Math.floor(sec / 60);
        var seconds = sec - (minutes * 60);
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes + ':' + seconds;
    }

    update() {
        [['#time_flight', this.time_flight],
            ['#time_photo', this.time_photo]].forEach(function (time) {
            if (undefined != time[1]) {
                $(time[0]).html(this.formatTime(time[1]));
            } else {
                $(time[0]).html('0:00');
            }
        }.bind(this))

    }
}

class CountDataBlock {
    constructor(data) {
        this.forkliftCount = data.forkliftCount || 0;
        this.trackCount = data.trackCount || 0;
    }

    turnOff() {
        $('#data_block_2').css("display", "none");
    }

    turnOn() {
        $('#data_block_2').css("display", "block");
    }

    addForklift() {
        this.forkliftCount++;
        this.update();
    }

    update() {
        [['#forklifts', this.forkliftCount],
            ['#tracks', this.trackCount]].forEach(function (cnt) {
            if (undefined != cnt[1]) {
                $(cnt[0]).html(cnt[1]);
            } else {
                $(cnt[0]).html('0');
            }
        }.bind(this))

    }
}


var map;
var vectorSource;
var formatter;
var dataBlock = new DataBlock({time_flight: 0, time_photo: 0});
var mo = new MovingObject(-76.1455, 41.094);
var mos = new MovingThings(vectorSource);
var countDataBlock;

function init() {
    vectorSource = new ol.source.Vector();
    formatter = new ol.format.GeoJSON();

    var url = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";

    var mapLayers = [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Image({
            source: new ol.source.ImageArcGISRest({
                ratio: 1,
                params: {},
                url: url
            })
        }),
        new ol.layer.Vector({
            source: vectorSource,
            style: null
        })
    ];

    map = new ol.Map({
        layers: mapLayers,
        target: 'mapDiv',
        view: new ol.View({
            center: ol.proj.transform([-76.1472675204277, 41.090747328856416], 'EPSG:4326', 'EPSG:3857'),
            zoom: 14,
            maxZoom: 21
        })
    });


    // deploy drone
    $("#test001").click(function () {
        dataBlock.time_flight_on = true;
        dataBlock.turnOn();
        mo.show(vectorSource);
        mos.mos.push(mo);
    });

    // reset
    $("#test002").click(function () {
        dataBlock.turnOff();
        dataBlock = new DataBlock({});
        mos.clear();
        mo = new MovingObject(-76.1455, 41.094);
        $("#alert").html("");
        $("#alert").css("display", "none");
    });

    // start photo
    $("#test003").click(function () {
        if (dataBlock.time_photo_on) {
            dataBlock.time_photo_on = false;
            $("#test003").val("Start photo");
        } else {
            dataBlock.time_photo_on = true;
            $("#test003").val("End photo");
        }

    });

    $("#sendForklift").click(function () {
        if (countDataBlock == undefined) {
            countDataBlock = new CountDataBlock({trackCount: 2});
            countDataBlock.turnOn();
        }
        countDataBlock.addForklift();

        var mo2 = new MovingObject();
        mo2.pathName = "forklift_path001";
        mo2.d = 0.000005;
        mo2.perFunc = function (x) {
            if (x > 32) {
                return (x - 32) % 55 + 32;
            } else {
                return x;
            }
        };
        mos.mos.push(mo2);
    });

    function addFeatureToMapAndZoom(Feature) {
        var features = formatter.readFeatures(Feature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        features[0].setStyle(
            new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 100, 50, 0.0)'
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'rgba(255, 50, 50, 1)'
                })
            })
        );
        vectorSource.addFeatures(features);

        map.getView().fit(features[0].getGeometry().getExtent(), map.getSize());
    }


    // load the place tree
    $.get("/place_tree", function (data, status) {

        $('#jstree_demo_div').jstree({
            'core': {
                'data': JSON.parse(data)
            }
        }).bind("loaded.jstree", function () {
        });


        $('#jstree_demo_div').on("changed.jstree", function (e, sdata) {
            id = sdata.selected[0];
            var result = $.grep(JSON.parse(data), function (e) {
                return e.id == id;
            });

            currentPlaceName = result[0].text;
            $.get("/polygon/".concat(result[0].text), function (data, status) {
                var dataJson = JSON.parse(data);
                $('#props').html(JSON.stringify(dataJson.properties, null, 2));
                addFeatureToMapAndZoom(dataJson.geometry);
            });
        });


    });

}