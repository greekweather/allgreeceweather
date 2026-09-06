(function () {
  'use strict';

  var map = L.map('weather-map', {
    center: [38.5, 24.0],
    zoom: 6,
    minZoom: 4,
    maxZoom: 12,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  var radarLayer = L.tileLayer('', {
    attribution: 'Radar data &copy; <a href="https://www.rainviewer.com/">RainViewer</a>',
    opacity: 0.65,
  });

  fetch('https://api.rainviewer.com/public/weather-maps.json')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('RainViewer API error: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
        var latestRadar = data.radar.past[data.radar.past.length - 1];
        radarLayer.setUrl('https://tilecache.rainviewer.com' + latestRadar.path + '/256/{z}/{x}/{y}/2/1_1.png');
        radarLayer.addTo(map);
      }
    })
    .catch(function (error) {
      console.error('Could not load weather layers:', error);
    });

  L.control.layers(null, {
    'Ραντάρ βροχόπτωσης': radarLayer,
  }, {
    position: 'topright',
    collapsed: false,
  }).addTo(map);
})();
