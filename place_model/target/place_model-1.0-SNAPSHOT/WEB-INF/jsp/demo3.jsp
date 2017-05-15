
<%@ taglib prefix="c" uri="http://www.springframework.org/tags" %>
<%--
  Created by IntelliJ IDEA.
  User: 502669124
  Date: 1/17/2017
  Time: 2:12 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">


    <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
    <title>${title}</title>

    <link rel="stylesheet" href="https://js.arcgis.com/3.19/esri/css/esri.css">


    <link rel="stylesheet" href="https://js.arcgis.com/4.2/esri/css/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/themes/default/style.min.css" />
    <link rel="stylesheet" href='<c:url value="${pageContext.request.contextPath}/resources/css/layout.css"/>'>


    <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.1.1.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js"></script>
    <script src="https://js.arcgis.com/4.2/"></script>
    <script type="text/javascript" src='<c:url value="${pageContext.request.contextPath}/resources/scripts/mapdemo3.js"/>'></script>
</head>

<body>
    <div id="left_menu">
        <div id="jstree_demo_div"></div>
        <div class="button_block"><input id="deploy" type="button" value="Send forklift"/></div>
        <div class="button_block"><input id="return" type="button" value="Return forklift"/></div>
        <div id="data_block">
            <div id="data">
                <div id="text">
                    <h2>Sector 3</h2>
                    <p>
                        <span class="row-header">Forklifts:</span>
                        <span id="forklifts">0</span>
                    </p>
                    <p>
                        <span class="row-header">Tracks:</span>
                        <span id="tracks">3</span>
                    </p>
                </div>
            </div>
        </div>
        <div id="alert_block"><div id="alert"></div></div>
        <div class="time_block"><div id="time"></div></div>
    </div>
    <div id="mapDiv"></div>
</body>
</html>

