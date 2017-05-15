/**
 * Created by 502669124 on 4/25/2017.
 */
var map;
var vectorSource;
var formatter;
function init() {
    vectorSource = new ol.source.Vector();
    formatter = new ol.format.GeoJSON();
    var mapLayers = [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 100, 50, 0.0)'
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'rgba(255, 50, 50, 1)'
                })
            })
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

    $("#test001").click(function () {
        $.get("http://localhost:8080/im/test3", function(data,status) {
            console.log(data);
            var d = JSON.parse(data);
            console.log(d.features);
            var P = d.features[0];
            vectorSource.clear();
            vectorSource.addFeatures(formatter.readFeatures(P, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }));
            map.getView().fit(vectorSource.getExtent(), map.getSize());

        })
    });

    function addFeatureToMapAndZoom(Feature) {
        var features = formatter.readFeatures(Feature, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        vectorSource.addFeatures(features);
        map.getView().fit(features[0].getGeometry().getExtent(), map.getSize());
    }

    $.get("/place_tree", function (data, status) {

        $('#jstree_demo_div').jstree({
            'core': {
                'data': JSON.parse(data)
            }
        }).bind("loaded.jstree", function () {
            console.log("loaded.jstree");
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

            console.log(result);
            currentPlaceName = result[0].text;
            $.get("/polygon/".concat(result[0].text), function (data, status) {
                var dataJson = JSON.parse(data);
                console.log(dataJson);
                addFeatureToMapAndZoom(dataJson.geometry);
            });
        });
    });

}