/**
 * @module color-ranger
 */
var convert = require('color-space');


//TODO: paint limits, esp. lch
//TODO: readme
//TODO: demo page
//TODO: shaders approach https://github.com/rosskettle/color-space-canvas
//TODO: statistical range (expanded popular areas, shrunk less needed areas)


/**
 * @module color-ranger
 */
module.exports = {
	renderRect: require('./render-rect'),
	renderPolar: require('./render-polar'),
	renderGrid: require('./render-grid'),
	getWorker: require('./get-worker')
};