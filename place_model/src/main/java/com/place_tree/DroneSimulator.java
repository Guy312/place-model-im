package com.place_tree;

import org.json.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by 502669124 on 5/15/2017.
 */
@Controller
@RequestMapping(value = "/drone")
public class DroneSimulator {
    @RequestMapping(value = "/{percent}")
    @ResponseBody
    public String getPos(@PathVariable("percent") String percent) {
        double p = Double.parseDouble(percent);
        JSONArray coordinates = new JSONArray();
        coordinates.put(-76.14639043807983);
        coordinates.put(41.095 + p * 0.0001);

        JSONObject geometry = new JSONObject();
        geometry.put("type","Point");
        geometry.put("coordinates",coordinates);

        JSONObject pnt = new JSONObject();
        pnt.put("type","Feature");
        pnt.put("geometry", geometry);

        return pnt.toString();
    }

}
