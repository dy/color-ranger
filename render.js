/**
 * A somewhat abstract renderer.
 *
 * @module color-ranger/render
 */

var convert = require('color-space');


module.exports = render;

/**
 * Render passed rectangular range for the color to imageData.
 *
 * @param {array} rgb A list of rgb values + optional alpha
 * @param {string} space A space to render, no alpha-suffix
 * @param {array} channels List of channel indexes to render
 * @param {array} mins Min values to render range (can be different than space mins)
 * @param {array} maxes Max values to render range (can be different than space maxes)
 * @param {ImageData} imgData An image data object
 * @param {function} calc A calculator for the step color
 *
 * @return {ImageData} ImageData containing a range
 */
function render(rgba, space, channels, mins, maxes, imgData, calc){
	// console.time('canv');

	var isCMYK = space === 'cmyk';

	//add alpha
	if (rgba.length === 4) rgba[3] *= 255;
	if (rgba.length === 3) rgba[3] = 255;

	//get specific space values
	var values;
	if (space === 'rgb') {
		values = rgba.slice();
	} else {
		values = convert.rgb[space](rgba);
		if (!isCMYK && values.length === 3) {
			values[3] = rgba[3];
		}
	}

	//resolve channel indexes
	var h = imgData.height,
		w = imgData.width,
		size = [w,h];

	var noIdx = [];
	for (var i = space.length; i--;){
		if (i !== channels[0] && i !== channels[1]) {
			noIdx.push(i);
		}
	}
	var noIdx1 = noIdx[0];
	var noIdx2 = noIdx[1];
	var noIdx3 = noIdx[2];

	//get converting fn
	var converter = space === 'rgb' ? function(a){return a} : convert[space].rgb;

	for (var x, y = h, row, col, res, stepVals = values.slice(); y--;) {
		row = y * w * 4;

		for (x = 0; x < w; x++) {
			col = row + x * 4;

			//calculate color
			stepVals = calc(x,y, stepVals, size, channels, mins, maxes);

			if (noIdx1 || noIdx1 === 0) {
				stepVals[noIdx1] = values[noIdx1];
			}
			if (noIdx2 || noIdx2 === 0) {
				stepVals[noIdx2] = values[noIdx2];
			}
			if (noIdx3 || noIdx3 === 0) {
				stepVals[noIdx3] = values[noIdx3];
			}

			//fill image data
			res = converter(stepVals);
			res[3] = isCMYK ? 255 : stepVals[3];

			imgData.data.set(res, col);
		}
	}

	return imgData;
}