// Создание карты (Чеченская республика)
var map = L.map('map').setView([43.305784, 45.747667], 9);

/* Данные для формирования растровых слоёв */
var osm_TileLayer_urlTemplate = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osm_TileLayer_options = {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    };
var esriWSM_TileLayer_urlTemplate = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    esriWSM_TileLayer_options = {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    };
var esriWI_TileLayer_urlTemplate = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    esriWI_TileLayer_options = {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    };
/* Создание растровых слоёв */
var osm_TileLayer = L.tileLayer(osm_TileLayer_urlTemplate, osm_TileLayer_options),
    esriWSM_TileLayer = L.tileLayer(esriWSM_TileLayer_urlTemplate, esriWSM_TileLayer_options),
    esriWI_TileLayer = L.tileLayer(esriWI_TileLayer_urlTemplate, esriWI_TileLayer_options);

/* Векторные данные */
var highlight = L.geoJson(null);
highlight.addTo(map);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

function onEachFeature_PlacesPoints (feature, layer) {
    if (feature.properties) {
        var content = "<div id='panorama'></div>";
        layer.on({
        click: function (e) {
            $("#feature-title").html(feature.properties.name);
            $("#feature-info").html(content);
            $("#featureModal").modal("show");
            highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));            
            pannellum.viewer('panorama', feature.properties.panoOptions);
        }
        });
    }
};

var placeIcon = L.Icon.extend({
    options: {
        iconUrl: './assets/img/marker-icon.png',
        iconSize:     [25, 41], // size of the icon
        shadowSize:   [18, 20], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [-5, 15]  // the same for the shadow
    }
});

/* Формирование шаблонов для слоёв из GeoJSON файлов */
var placesPoints = L.geoJson(placesData_GeoJson, {
    onEachFeature: onEachFeature_PlacesPoints,
    pointToLayer: function(feature, latlng) {
        if(feature.properties.isAvailableForPeopleWithDisabilities)
            return L.marker(latlng, {icon: new placeIcon({shadowUrl: './assets/img/disabled.png'})});
        else
            return L.marker(latlng);
    }
});
var placesPointsCluster = L.markerClusterGroup();
placesPointsCluster.addLayer(placesPoints);

var chechenRepublicBoundary = L.geoJson(ChechenRepublicBoundaries_GeoJson, {
    style: function(feature){
        return {
            color : "red",
            opacity : 1,
            weight : 1,
            fillColor : "red",
            fillOpacity : 0.3
        }
    },
    filter : function(feature) {
        return(feature.properties.ADMIN_LVL == 4);
    }
});
var chechenRepublicAtdBoundary = L.geoJson(ChechenRepublicBoundaries_GeoJson, {
    style: function(feature){
        return {
            color : "green",
            opacity : 1,
            weight : 1,
            fillColor : "green",
            fillOpacity : 0.3
        }
    },
    filter : function(feature) {
        return(feature.properties.ADMIN_LVL == 6);
    }
});

/* Чтение данных из GeoJSON файлов с помощью jQuery и их загрузка в слои */
/* $.getJSON("data/pano_tours_data/placesData.geojson", function (data) {
    placesPoints.addData(data);
});
$.getJSON("data/ChechenRepublicBoundaries.geojson", function (data) {
    chechenRepublicBoundary.addData(data);
    chechenRepublicAtdBoundary.addData(data);
}); */

/*ФОРМИРУЮТСЯ ГРУППЫ СЛОЁВ для Инструмента Layers*/
var baseMaps = {
    "OpenStreetMap": osm_TileLayer,
    "ESRI World Street Map": esriWSM_TileLayer,
    "ESRI World Imagery": esriWI_TileLayer
};
var overlayMaps = {
    "Места": placesPointsCluster,
    "Границы Чеченской Республики": chechenRepublicBoundary,
    "Административно-территориальное деление Чеченской Республики": chechenRepublicAtdBoundary
};

/*ДОБАВЛЯЮТСЯ ИНСТРУМЕНТЫ*/
// Управление слоями
var layerControl = L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
});
layerControl.addTo(map);
// Выбор исходных слоёв для визуализации
baseMaps["OpenStreetMap"].addTo(map);
overlayMaps["Границы Чеченской Республики"].addTo(map);
overlayMaps["Места"].addTo(map);

/* События */
/* Убрать выделение маркера, когда был совершён клик курсором по карте */
map.on("click", function(e) {
    highlight.clearLayers();
  });