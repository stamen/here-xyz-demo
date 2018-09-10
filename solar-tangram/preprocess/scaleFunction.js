const d3 = require('d3');

const NUM_STEPS = 10;
// var domain = [0, 1267538]
var domain = [0, 997440];

// function out(value) {
//   var colorScale = d3.scaleSequential(d3.interpolateOrRd).domain(domain);
//   var c = d3.rgb(colorScale(value));
//   c.opacity = 0.3;
//   return '"' + c.toString() + '"';
// }

var out = d3.scaleLinear().domain(domain).range([3, 50])

var step = (domain[1] - domain[0]) * 1.0 / NUM_STEPS;

for (var i = 0; i < NUM_STEPS; i++) {
  var v = domain[1] - (step * i);
  console.log('value >= ' + v + ' ? ' + out(v) + ' :');
}
console.log(out(domain[0]) + ';' )
