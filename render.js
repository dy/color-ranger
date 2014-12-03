/**
 * A somewhat abstract renderer.
 *
 * @module color-ranger/render
 */

var convert = require('color-space');

module.exports = render;


//default options for default rendering
var defaults = {
	//37 is the most optimal calc size
	//you can scale resulting image with no significant quality loss
	channel: [0,1],
	space: 'rgb'
};


/**
 * Render passed rectangular range for the color to imageData.
 *
 * @param {array} rgb A list of rgb values + optional alpha
 * @param {string} space A space to render, no alpha-suffix
 * @param {array} channels List of channel indexes to render
 * @param {array} mins Min values to render range (can be different than space mins)
 * @param {array} maxes Max values to render range (can be different than space maxes)
 * @param {UInt8CappedArray} buffer An image data buffer
 * @param {function} calc A calculator for the step color
 *
 * @return {ImageData} ImageData containing a range
 */
function render(rgba, buffer, calc, opts){
	// console.time('canv');
	var size = opts.size = opts.size || [Math.floor(Math.sqrt(buffer.length / 4))];
	if (size.length === 1) {
		size[1] = size[0];
	}

	var space = opts.space = opts.space || defaults.space;
	var channels = opts.channel = opts.channel !== undefined ? opts.channel : defaults.channel;

	var mins = opts.min = opts.min || [],
		maxes = opts.maxes = opts.max || [];

	//take mins/maxes of target space’s channels
	for (var i = 0; i < channels.length; i++){
		if (mins.length < channels.length) {
			mins[i] = convert[space].min[channels[i]] || 0;
		}
		if (maxes.length < channels.length) {
			maxes[i] = convert[space].max[channels[i]] || 255;
		}
	}

	var isCMYK = space === 'cmyk';

	//add alpha
	if (rgba.length === 4) {rgba[3] *= 255;}
	if (rgba.length === 3) {rgba[3] = 255;}

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

	//resolve absent indexes
	var noIdx = [];
	for (i = space.length; i--;){
		if (i !== channels[0] && i !== channels[1]) {
			noIdx.push(i);
		}
	}
	var noIdx1 = noIdx[0];
	var noIdx2 = noIdx[1];
	var noIdx3 = noIdx[2];

	//get converting fn
	var converter = space === 'rgb' ? function(a){return a;} : convert[space].rgb;

	for (var x, y = size[1], row, col, res, stepVals = values.slice(); y--;) {
		row = y * size[0] * 4;

		for (x = 0; x < size[0]; x++) {
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

			buffer.set(res, col);
		}
	}

	return buffer;
}