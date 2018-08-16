var async = require('async')
var request = require('request')
var fs = require('fs')
var _ = require('underscore')

/* ===========================================================================*/
var config = {
  spaceId: 'l9F3RBfX'
}
/* ===========================================================================*/

// Only query for the airports of interest, to avoid swamping the server
function queryData() {
  var airports = [
    'KSFO',
    'KJFK',
    'SBGR',
    'EGLL',
    'FAOR',
    'OMDB',
    'ZBAA',
    'RJTT',
    'RJAA',
    'YSSY'
  ];

  airports.forEach(function(airport) {
    queryAirport(airport);
  });
}

function queryAirport(airport) {
  console.log('fetching data for ' + airport + '...');
  var geojson = {
    "type": "FeatureCollection",
    "features": []
  }
  request('https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?fAirQ=' + airport,
  function (error, response, body) {

    var json = JSON.parse(response.body)
    _.each(json.acList, function(row, index) {
      if (row.Lat & row.Long) {
        // check for invalid points
        if (row.Lat > -90 && row.Lat < 90
          && row.Long > -180 && row.Long < 180) {
        geojson.features.push({
          type: "Feature",
          //id: row.Id.toString(),
          properties: row,
          geometry: {
            type: "Point",
            coordinates: [row.Long, row.Lat]
          }
        })
       }
     }
    })
    console.log(airport + " got " + geojson.features.length + " features")
    addDataToSpace(geojson)
  })
}


function addDataToSpace(geojson) {

  async.eachLimit(geojson.features, 10, feature => {

    // here we'll upload each record with its own sets of tags.
    // Tags:
    //   To airport
    //   From airport
    //   date, time (maybe separate these out)
    //   aircraft registration ID

    var posTime = new Date(feature.properties.PosTime);
    //console.log(posTime);
    //console.log(posTime.getHours()); // the hours tag is not zero-padded

    var tags = [
      "from-" + (feature.properties.From ? feature.properties.From.substring(0,4) : ""),
      "to-" + (feature.properties.To ? feature.properties.To.substring(0,4) : ""),
      "reg-" + (feature.properties.Reg ? feature.properties.Reg : ""),
      "month-" + (posTime.getMonth() + 1),
      "day-" + posTime.getDate(),
      "hour-" + posTime.getHours(),
    ]
    //console.log('adding to space with tags: ' + tags)

    feature.properties["@ns:com:here:xyz"] = {
      "tags": tags
    }

    var options = {
      method: 'PUT',
      url: 'https://xyz.api.here.com/hub/spaces/' + config.spaceId + '/features', // instead of adding the tags here, I'll write them into the geojson object above
      headers:
       {
         'Authorization': 'Bearer tY73HaInq0Vc4CvQb-ANAQ',
         'Content-Type': 'application/geo+json'
       },
      body: JSON.stringify(feature)
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error)
      }
    })
  }, function() {
    console.log('done ' + geojson.features.length + ' features!')
  });
}

queryData();

setInterval(function() {
  queryData()
}, 60000) // 60 seconds, aka 1 minute(s)
