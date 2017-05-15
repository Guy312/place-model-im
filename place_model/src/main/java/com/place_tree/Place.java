package com.place_tree;

import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

import com.esri.core.geometry.*;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Created by 502669124 on 22/03/2017.
 */

public class Place {
    String id;
    String name;
    List<Place> childs;
    Place parent;
    Polygon boundary;

    public Place(String name){
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.childs = new ArrayList<Place>();
    }

    public void setBoundary(String geojson) {
        MapGeometry obj = OperatorImportFromGeoJson.local().execute(GeoJsonImportFlags.geoJsonImportDefaults, Geometry.Type.Polygon, geojson, null);
        Polygon plg = (Polygon)obj.getGeometry();
        boundary = plg;
    }

    public String getJqtreeArray(String parent){
        JSONObject obj = new JSONObject();
        obj.put("id" , id);
        obj.put("parent" , parent);
        obj.put("text" , name);
        obj.put("icon" , "/resources/img/place.png");

        JSONArray jsonArray = new JSONArray();
        jsonArray.put(obj);

        for(Place plc : childs) {
            JSONArray childJA = new JSONArray(plc.getJqtreeArray(id));
            for (int i = 0; i < childJA.length(); i++) {
                jsonArray.put(childJA.getJSONObject(i));
            }
        }

        return jsonArray.toString();
    }


    public void addChild(Place plc){
        this.childs.add(plc);
    }

    public Place getChild(String id){
        for(Place plc : childs) {
            if(plc.id.equals(id)) {
                return plc;
            }
        }
        return null;
    }
    
    public void removePlace(String id){
        Iterator<Place> i = childs.iterator();
        while (i.hasNext()) {
            Place plc = i.next();
            if(plc.id.equals(id)) {
                i.remove();
            }
        }
    }

}
