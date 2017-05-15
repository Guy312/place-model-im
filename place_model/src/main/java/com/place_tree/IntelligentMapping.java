package com.place_tree;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

/**
 * Created by 502669124 on 5/8/2017.
 */
@Controller
@RequestMapping(value = "/im")
@PropertySource("classpath:application.properties")
public class IntelligentMapping {


    @Autowired
    private Environment env;


    @RequestMapping(value = "/test/*")
    @ResponseBody
    public String test() {
        System.out.print("Hi");


        return "SO";
    }

    @RequestMapping(value = "/getToken")
    @ResponseBody
    public String requestToken() {
        BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();

        String clientCredentials = env.getProperty("predix.oauth.clientId");
        String[] credentials = clientCredentials.split(":");

        credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(credentials[0], credentials[1]));

        CloseableHttpClient httpClient = HttpClientBuilder.create()
                .setSSLHostnameVerifier(new NoopHostnameVerifier())
                .setProxy(new HttpHost(env.getProperty("proxy.hostname"), env.getProperty("proxy.port", int.class), env.getProperty("proxy.scheme")))
                .setDefaultCredentialsProvider(credentialsProvider)
                .build();

        HttpComponentsClientHttpRequestFactory requestFactory
                = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        String urlOverHttps = env.getProperty("predix.oauth.restHost") + "/oauth/token?grant_type={grant_type}";


        JSONParser parser = new JSONParser();
        try {
            ResponseEntity<String> response
                    = new RestTemplate(requestFactory).exchange(
                    urlOverHttps, HttpMethod.GET, null, String.class, env.getProperty("predix.oauth.grantType"));

            Object obj = parser.parse(response.getBody().toString());
            JSONObject jsonObject = (JSONObject) obj;

            return jsonObject.get("access_token").toString();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "getToken failed";
    }

    public String getToken() {
        String token = "";
        try {
            String url = env.getProperty("application.root") + "/im/getToken";
            URL oracle = new URL(url);
            HttpURLConnection huc = (HttpURLConnection) oracle.openConnection();
            int responseCode = huc.getResponseCode();
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(oracle.openStream()));
                token = in.readLine();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "failed to get token";
        }
        return token;
    }

    @RequestMapping(value = "/collections")
    @ResponseBody
    public String collections() {
        String token = this.getToken();

        CloseableHttpClient httpClient = HttpClientBuilder.create()
                .setSSLHostnameVerifier(new NoopHostnameVerifier())
                .setProxy(new HttpHost(env.getProperty("proxy.hostname"), env.getProperty("proxy.port", int.class), env.getProperty("proxy.scheme")))
                .build();

        HttpComponentsClientHttpRequestFactory requestFactory
                = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        String urlOverHttps = env.getProperty("intelligentmapping.basicEndPoint") + "/collections";

        try {
            URI uri = new URI(urlOverHttps);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Predix-Zone-Id", env.getProperty("intelligentmapping.predix_zone_id"));
            headers.add("X-Subtenant-Id", env.getProperty("intelligentmapping.x_subtenant_id"));
            headers.add("Authorization", "Bearer " + token);
            headers.add("Content-Type", "application/json");


            RequestEntity<String> requestEntity = new RequestEntity<String>(headers, HttpMethod.GET, uri);

            JSONParser parser = new JSONParser();
            ResponseEntity<String> response
                    = new RestTemplate(requestFactory).exchange(
                    urlOverHttps, HttpMethod.GET, requestEntity, String.class);
            return response.getBody().toString();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "test2 failed";
    }


    // Add a collection named transformers, with one feature id:TX001
    @RequestMapping(value = "/test2")
    @ResponseBody
    public String collections_transformers() {
        String token = this.getToken();

        CloseableHttpClient httpClient = HttpClientBuilder.create()
                .setSSLHostnameVerifier(new NoopHostnameVerifier())
                .setProxy(new HttpHost(env.getProperty("proxy.hostname"), env.getProperty("proxy.port", int.class), env.getProperty("proxy.scheme")))
                .build();

        HttpComponentsClientHttpRequestFactory requestFactory
                = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        String urlOverHttps = env.getProperty("intelligentmapping.basicEndPoint") + "/collections/transformers";

        try {
            URI uri = new URI(urlOverHttps);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Predix-Zone-Id", env.getProperty("intelligentmapping.predix_zone_id"));
            headers.add("X-Subtenant-Id", env.getProperty("intelligentmapping.x_subtenant_id"));
            headers.add("Authorization", "Bearer " + token);
            headers.add("Content-Type", "application/json");

            String input = "{\"type\":\"FeatureCollection\",\"features\":[{\n" +
                    "  \"type\": \"Feature\",\"id\":\"TX001\",\"properties\": {\"amenity\":\"Doctor\"},\n" +
                    "  \"geometry\": {\"type\": \"LineString\",\n" +
                    "  \"coordinates\": [[2.109375,45.1510532655634],\n" +
                    "    [5.712890625,43.45291889355465],\n" +
                    "    [7.03125,42.68243539838623]\n" +
                    "  ]}}]\n" +
                    "}";
            RequestEntity<String> requestEntity = new RequestEntity<String>(input, headers, HttpMethod.POST, uri);


            JSONParser parser = new JSONParser();

            RestTemplate restTemplate = new RestTemplate(requestFactory);
            restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
            ResponseEntity<String> response = restTemplate.exchange(urlOverHttps, HttpMethod.POST, requestEntity, String.class);
            return response.getBody().toString();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "test2 failed";
    }


    // Get feature form a collection named transformers, with one feature id:TX001
    @RequestMapping(value = "/test3")
    @ResponseBody
    public String collections_transformers_get() {
        String token = this.getToken();

        CloseableHttpClient httpClient = HttpClientBuilder.create()
                .setSSLHostnameVerifier(new NoopHostnameVerifier())
                .setProxy(new HttpHost(env.getProperty("proxy.hostname"), env.getProperty("proxy.port", int.class), env.getProperty("proxy.scheme")))
                .build();

        HttpComponentsClientHttpRequestFactory requestFactory
                = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);

        String urlOverHttps = env.getProperty("intelligentmapping.basicEndPoint") + "/collections/transformers/features?id=TX001";

        try {
            URI uri = new URI(urlOverHttps);
            HttpHeaders headers = new HttpHeaders();
            headers.add("Predix-Zone-Id", env.getProperty("intelligentmapping.predix_zone_id"));
            headers.add("X-Subtenant-Id", env.getProperty("intelligentmapping.x_subtenant_id"));
            headers.add("Authorization", "Bearer " + token);
            headers.add("Content-Type", "application/json");


            JSONParser parser = new JSONParser();

            RestTemplate restTemplate = new RestTemplate(requestFactory);
            RequestEntity<String> requestEntity = new RequestEntity<String>(headers, HttpMethod.GET, uri);


            ResponseEntity<String> response = restTemplate.exchange(urlOverHttps, HttpMethod.GET, requestEntity, String.class);
            return response.getBody().toString();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "test3 failed";
    }
}
