var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(function (data) {
    console.log(data)
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    function onEachFeature(features, layer) {
      layer.bindPopup(`<h3>${features.properties.place}</h3><hr><p>${new Date(features.properties.time)}</p>`);
    }
  // Creating colors for earthquake size chart according to the earthquake size and magnitude(0-2.5, 2.5-5, 5-7, 7+)
    function changeColor(features) {
      if (features.properties.mag > 7)
      return 'red'
      else if (features.properties.mag > 5)
      return 'yellow'
      else if (features.properties.mag > 2.5)
      return 'yellowgreen'
      else 
      return 'green'
    };

    function changeSize(features) {
        if (features.geometry.coordinates[2] > 100)
        return 0
        else return features.geometry.coordinates[2]
      };
    // Returning a colored circle marker according to the size of the earthquake and of the effected area of it / setting opacity, radius, fillcolor, etc.
      let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(features, latlng) {
            return L.circleMarker(latlng)
        },
        style: function geojsonMarkerOptions(features) {
            return {
                radius: changeSize(features),
                fillColor: changeColor(features),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.6
            }
        }
      });

  // Creating the earthquakes map with our data
  createMap(earthquakes);
}

function createMap(earthquakes) {

    // Creating the tileLayers
    var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Creating the baseMap giving optional Street Map / Topographic Map views alongside optional Earthquakes / Tectonic Plates data
    var baseMaps = {
      "Street Map": streetMap,
      "Topographic Map": topoMap
    };
  
    let tectPlates = new L.LayerGroup()
    let overlayMaps = {
      Earthquakes: earthquakes,
      'Tectonic Plates': tectPlates
    };
    
  // Creating a map with the effected earthquake area layers displayed with colored circle markers overlapping the street layers
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetMap, earthquakes]
  });

  // Creating and adding layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Creating a legend displaying earthquake size associated with certain colors
  let legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function(myMap) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 2.5, 5, 7],
        colors = ['green', 'yellowgreen', 'yellow', 'red'];

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' + 
        grades[i] + (grades[i+1] ? `&ndash;` + grades[i+1] +'<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

  d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(function (data) {

    L.geoJSON(data, {

    }).addTo(tectPlates);

  tectPlates.addTo(myMap)
  });
}