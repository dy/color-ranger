/**
 * @module color-ranger
 */
var convert = require('color-space');


//TODO: paint limits, esp. lch
//TODO: readme
//TODO: jsfiddle get started chunk
//TODO: base64d API images
//TODO: acclimatize code
//TODO: add full tests coverage
//TODO: asmjsify
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