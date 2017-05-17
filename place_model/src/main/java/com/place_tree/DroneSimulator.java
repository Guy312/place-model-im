package com.place_tree;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;

/**
 * Created by 502669124 on 5/15/2017.
 */
@Controller
@RequestMapping(value = "/drone")
public class DroneSimulator {
    @Autowired
    private Environment env;

    @RequestMapping(value = "/{percent}")
    @ResponseBody
    public String getPos(@PathVariable("percent") String percent) {
        double p = Double.parseDouble(percent);
        JSONArray coordinates = new JSONArray();
        coordinates.add(0, -76.14639043807983);
        coordinates.add(1, 41.095 + p * 0.0001);

        JSONObject geometry = new JSONObject();
        geometry.put("type", "Point");
        geometry.put("coordinates", coordinates);

        JSONObject pnt = new JSONObject();
        pnt.put("type", "Feature");
        pnt.put("geometry", geometry);

        return pnt.toString();
    }

    @RequestMapping(value = "/path/{filename}/{percent}")
    @ResponseBody
    public String getForkliftPos(@PathVariable("filename") String fileName, @PathVariable("percent") String percent) {


        if (fileName.equals("none")) {
            double p = Double.parseDouble(percent);
            JSONArray coordinates = new JSONArray();
            coordinates.add(0, -76.14639043807983);
            coordinates.add(1, 41.095 + p * 0.0001);
            return coordinates.toString();
        }


        String filename = fileName.replaceAll(" ", "%20");

        JSONParser parser = new JSONParser();
        String out = "";
        try {
            String url = env.getProperty("application.root") + "/resources/data/" + filename + ".geo.json";
            URL oracle = new URL(url);
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(oracle.openStream()));
            Object obj = parser.parse(in);
            JSONObject jsonObject = (JSONObject) obj;
            JSONObject geometry = (JSONObject) jsonObject.get("geometry");
            JSONArray coords = (JSONArray) geometry.get("coordinates");

            int index = Integer.parseInt(percent);
            JSONArray pnt = (JSONArray) coords.get(index);
            out = pnt.toString();
        } catch (Exception e) {
            out = "";
            e.printStackTrace();
        } finally {
            return out;
        }
    }

}
