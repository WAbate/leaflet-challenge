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