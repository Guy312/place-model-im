package com.place_tree;

import com.esri.core.geometry.*;
import com.sun.org.apache.bcel.internal.generic.RETURN;
import org.apache.http.*;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;

import org.apache.http.client.methods.HttpPost;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.*;
import org.apache.http.impl.client.*;
import org.apache.http.impl.conn.PoolingClientConnectionManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.WildcardFileFilter;


import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import javax.servlet.ServletContext;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.*;
import java.io.*;
import java.util.Collection;


/**
 * Created by 502669124 on 21/03/2017.
 */

@Controller

public class StartController {
    @Autowired
    private Environment env;

    @Autowired
    ServletContext context;

    @RequestMapping(value = "/test")
    public String test(Model model) {
        model.addAttribute("title", "Place model - IntelligentMapping Demo");
        return "test";
    }


    @RequestMapping(value = "/place_tree")
    @ResponseBody
    public String placeTree() {
        Place plc = new Place("Earth");
        Place us = new Place("United States of America");
        Place pennsylvania = new Place("Pennsylvania");
        Place luzerne = new Place("Luzerne");
        Place tioga = new Place("Tioga");

        Place station = new Place("Susquehanna Steam Electric Station");
        //station.addChild(new Place("sector001"));
        station.addChild(new Place("Section002"));
        station.addChild(new Place("Section003"));
        station.addChild(new Place("Section004"));
        station.addChild(new Place("Section005"));
        station.addChild(new Place("Section006"));
        station.addChild(new Place("Section007"));
        station.addChild(new Place("Section008"));

        luzerne.addChild(station);
        pennsylvania.addChild(luzerne);
        pennsylvania.addChild(tioga);
        us.addChild(pennsylvania);
        us.addChild(new Place("Wyoming"));
        plc.addChild(us);
        return plc.getJqtreeArray("#");
    }


    /*
        Returns geojson string for given file name and polygon name
     */
    @RequestMapping(value = "/polygon/file/{filename}/{polygonname}")
    @ResponseBody
    public String getByName2(@PathVariable("filename") String fileName, @PathVariable("polygonname") String polyname) {

        String polygonName = polyname.replaceAll("%20", " ");
        String filename = fileName.replaceAll(" ", "%20");

        JSONParser parser = new JSONParser();
        JSONObject jsonObject = null;
        String geojson = "";
        try {
            String url = env.getProperty("application.root") + "/resources/data/" + filename + ".geo.json";
            URL oracle = new URL(url);
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(oracle.openStream()));
            Object obj = parser.parse(in);
            jsonObject = (JSONObject) obj;

            if ((!jsonObject.containsKey("features")) && jsonObject.containsKey("geometry")) {
                // one feature in file

                if (fileName.equals(polygonName)) {
                    geojson = jsonObject.toString();
                } else if (jsonObject.containsKey("properties")) {
                    JSONObject props = (JSONObject) jsonObject.get("properties");
                    String name = (String) props.get("name");
                    if (name != null) {
                        if (name.equals(polygonName)) {
                            geojson = jsonObject.toString();
                        }
                    }
                }
            } else if (jsonObject.containsKey("features")) {
                // many features in file - find feature by name
                JSONArray ja = (JSONArray) jsonObject.get("features");
                for (Object object : ja) {
                    JSONObject aJson = (JSONObject) object;
                    JSONObject props = (JSONObject) aJson.get("properties");
                    String name = (String) props.get("name");
                    if (name.equals(polygonName)) {
                        geojson = aJson.toString();
                        //geojson = aJson.get("geometry").toString();
                        break;
                    }
                }
            }

        } catch (FileNotFoundException e) {
            geojson = "";
            e.printStackTrace();
        } catch (IOException e) {
            geojson = "";
            e.printStackTrace();
        } catch (Exception e) {
            geojson = "";
            e.printStackTrace();
        } finally {
            return geojson;
        }
    }


    /*
        Searching polygon by name in resource files and returns geojson
     */
    @RequestMapping(value = "/polygon/{polygonname}")
    @ResponseBody
    public String getByName(@PathVariable("polygonname") String polygonName) {
        String polygonname = polygonName.replaceAll(" ", "%20");

        JSONParser parser = new JSONParser();
        JSONObject jsonObject = null;
        String geojson = "";
        try {
            // getting list of all *.geo.json files
            String path = context.getRealPath("/resources/data");
            File folder = new File(path);
            Collection<File> geoJsonfiles = FileUtils.listFiles(folder, new WildcardFileFilter("*.geo.json"), null);

            // loop the files list
            for (File file : geoJsonfiles) {
                String fileName = file.getName().replaceAll(".geo.json", "");
                String filename = fileName.replaceAll(" ", "%20");
//
                String url = env.getProperty("application.root") + "/polygon/file/" + filename + "/" + polygonname;
                URL oracle = new URL(url);
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(oracle.openStream()));
                try {
                    if (in.ready()) {
                        Object obj = parser.parse(in);
                        jsonObject = (JSONObject) obj;
                        geojson = jsonObject.toString();
                        break;
                    }
                    // System.out.println("not found");
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
            geojson = "";
        } finally {
            return geojson;
        }

    }

}

