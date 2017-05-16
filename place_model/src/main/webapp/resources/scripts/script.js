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
        this.myVar = setInterval(this.mytick.bind(this), 300);
        this.vs = vs;
    }

    mytick() {
        for (var i = 0; i < this.mos.length; i++) {
            if (this.mos[i].OnMoving) {
                this.mos[i].nextPosition(this.vs);
            }
        }
    }

    clear(){
        for (var i = 0; i < this.mos.length; i++) {
            this.mos[i].remove(this.vs);
        }
        this.mos = [];
    }

}


class MovingObject {
    constructor(lat, lon) {
        this.pos = [lat, lon];
        this.path = [];
        this.OnPointRequest = false;
        this.OnMoving = true;
        this.id = guid();
        this.percent = 0;
        this.color = '#000000';
    }

    addPathPoint(lat, lon) {
        this.path.push([lat, lon]);
        //  console.log("ADD POINT TO PATH");
        //  console.log(this.path);
    }

    requestNextPoint() {
        this.percent = (this.percent + 1) % 100;

        $.get("/drone/" + this.percent, function (data, status) {
            // console.log("PATH POINT");
            // console.log(data);
            var pnt = JSON.parse(data)
            this.addPathPoint(pnt.geometry.coordinates[0], pnt.geometry.coordinates[1]);
            this.OnPointRequest = false;
        }.bind(this));

    }

    nextPosition(vectorSource) {
        if (this.path.length < 3 && (!this.OnPointRequest)) {
            this.OnPointRequest = true;
            this.requestNextPoint();

        } else if (this.path.length >= 2) {

            var d = 0.00005;
            if (this.pos == []) {
                this.pos = this.path[0];
            }

            var x0 = this.pos[0];
            var y0 = this.pos[1];
            var x1 = this.path[1][0];
            var y1 = this.path[1][1];
            var l = Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2));
            if (l < d) {
                this.path.shift();
                this.pos = this.path[0];
            } else {
                var x = x0 + (x1 - x0) * d / l;
                var y = y0 + (y1 - y0) * d / l;
                this.pos = [x, y];
            }
            this.updatePosition(vectorSource);
        }
    }

    updatePosition(vectorSource) {
        // console.log("UPDATE POSITION");
        //  console.log(this.pos);
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


var map;
var vectorSource;
var formatter;
var vectorImageColor = '#000000';
function init() {
    vectorSource = new ol.source.Vector();
    formatter = new ol.format.GeoJSON();
    var mapLayers = [
        new ol.layer.Tile({
            source: new ol.source.OSM()
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
            center: ol.proj.transform([-0.083825, 52.21668333], 'EPSG:4326', 'EPSG:3857'),
            zoom: 14,
            maxZoom: 21
        })
    });
    //
    // vectorImageColor= '#0000ff';
    // var style1 =  new ol.style.Style({
    //     image: new ol.style.Circle({
    //         radius: 4,
    //         fill: new ol.style.Fill({color: vectorImageColor}),
    //         stroke: new ol.style.Stroke({color: '#bada55', width: 1})
    //     })
    // });
    // map.getLayers().item(1).setStyle(style1);


    var data = {
        "type": "FeatureCollection", "features": [{
            "type": "Feature", "id": "TX001", "properties": {"amenity": "DoctorKuzia"},
            "geometry": {
                "type": "LineString",
                "coordinates": [[2.109375, 45.1510532655634],
                    [5.712890625, 43.45291889355465],
                    [7.03125, 42.68243539838623]
                ]
            }
        }]
    };

    var P = {
        "type": "Feature", "properties": {
            "Status": "Operational",
            "Commission date": "Unit 1: November 12, 1982, Unit 2: June 27, 1984[1]",
            "Owner(s)": "Talen Energy (90%), Allegheny Electric, Cooperative (10%)",
            "Type": "Nuclear power station",
            "Reactor type": "BWR-4",
            "Reactor supplier": "General Electric",
            "Cooling source": "Susquehanna River",
            "Cooling towers": "2"
        },


        "geometry": {
            "type": "Polygon",
            "coordinates": [[[-76.1363697052002, 41.09633249383675], [-76.13628387451172, 41.092839547254705], [-76.13679885864258, 41.08963751640092], [-76.14555358886719, 41.087470396873286], [-76.14757061004639, 41.087567433604576], [-76.1482572555542, 41.08743805126434], [-76.1482572555542, 41.08679113574182], [-76.1506175994873, 41.08692051935585], [-76.1506175994873, 41.087793852086975], [-76.15091800689697, 41.08802026978915], [-76.15091800689697, 41.08876420817452], [-76.15314960479736, 41.088699518214504], [-76.15336418151855, 41.09064018930939], [-76.15499496459961, 41.09044612477936], [-76.15499496459961, 41.0913517543486], [-76.15460872650146, 41.0913517543486], [-76.15456581115723, 41.09151347260093], [-76.15345001220703, 41.09157815979037], [-76.15366458892821, 41.09497414779079], [-76.14868640899658, 41.09578269048751], [-76.14542484283446, 41.095976739253885], [-76.1407470703125, 41.09617078744703], [-76.1363697052002, 41.09633249383675]]]
        }
    }
    var mo = new MovingObject(-76.1455, 41.094);
    var mos = new MovingThings(vectorSource);

    $("#test001").click(function () {
        mo.show(vectorSource);
        mos.mos.push(mo);
    });

    $("#test002").click(function () {
        mos.clear();
        mo = new MovingObject(-76.1455, 41.094);
        $("#alert").html("");
        $("#alert").css("display", "none");
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

    $.get("/place_tree", function (data, status) {

        $('#jstree_demo_div').jstree({
            'core': {
                'data': JSON.parse(data)
            }
        }).bind("loaded.jstree", function () {
            //console.log("loaded.jstree");
            // var sus = $.grep(JSON.parse(data), function (e) {
            //     return e.text == "Susquehanna Steam Electric Station";
            // });
            // $('#jstree_demo_div').jstree("select_node", sus[0].id.toString()).trigger("select_node.jstree");

        });


        $('#jstree_demo_div').on("changed.jstree", function (e, sdata) {
            id = sdata.selected[0];
            var result = $.grep(JSON.parse(data), function (e) {
                return e.id == id;
            });

            //console.log(result);
            currentPlaceName = result[0].text;
            $.get("/polygon/".concat(result[0].text), function (data, status) {
                var dataJson = JSON.parse(data);
                // console.log(dataJson);
                $('#props').html(JSON.stringify(dataJson.properties, null, 2));
                addFeatureToMapAndZoom(dataJson.geometry);
            });
        });


    });

}