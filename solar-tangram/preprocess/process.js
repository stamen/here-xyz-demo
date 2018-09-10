const fs = require('fs');
const turf = require('@turf/turf');
const d3 = require('d3');

const NEIGHBORHOODS_FILE = './GEBIED_BUURTCOMBINATIES_EXWATER.json';
const SOLAR_FILE = './ZONNEPANELEN2017.json';
const OUT_FILE = './heatmap.json';

var nhoods = JSON.parse(fs.readFileSync(NEIGHBORHOODS_FILE, {encoding: 'utf8'}));
var solar = JSON.parse(fs.readFileSync(SOLAR_FILE, {encoding: 'utf8'}));

nhoods.features.forEach(function(feature) {
    var points = turf.pointsWithinPolygon(solar, feature)
    feature.properties.count = points.features.length;
    feature.properties.totalPower = 0;
    points.features.forEach(function(point) {
        feature.properties.totalPower += +point.properties.Vermogen;
    });
});

// save the colors to the geojson
var powerRange = d3.extent(nhoods.features, function(feature) { return feature.properties.totalPower });
var colorScale = d3.scaleSequential(d3.interpolateOrRd).domain(powerRange);
nhoods.features.forEach(function (feature) {
    var c = d3.rgb(colorScale(feature.properties.totalPower))
    c.opacity = 0.3;
    feature.properties.color = c.toString();
});

// process the color space into 10 bins

console.log(powerRange);


fs.writeFileSync(OUT_FILE, JSON.stringify(nhoods), {encoding: 'utf8'})
