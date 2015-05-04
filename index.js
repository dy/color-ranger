/**
 * A somewhat abstract renderer.
 *
 * @module color-ranger/render
 */

var convert = require('color-space');

module.exports = render;


//default options for default rendering
var defaults = {
	channel: [0,1],
	space: 'rgb'
};


//37 is the most optimal calc size
//you can scale resulting image with no significant quality loss

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
function render(rgba, buffer, opts){
	// console.time('canv');
	var size = opts.size = opts.size || [Math.floor(Math.sqrt(buffer.length / 4))];
	if (size.length === 1) {
		size[1] = size[0];
	}

	var space = opts.space = opts.space || defaults.space;
	var channels = opts.channel = opts.channel !== undefined ? opts.channel : defaults.channel;

	var mins = opts.min = opts.min || [],
		maxes = opts.maxes = opts.max || [];

	var calc = opts.type === 'polar' ?  calcPolarStep : calcRectStep;

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


	/**
	 * Calculate polar step
	 *
	 * @param {[type]} x [description]
	 * @param {[type]} y [description]
	 * @param {[type]} vals [description]
	 * @param {[type]} size [description]
	 * @param {[type]} channels [description]
	 * @param {[type]} mins [description]
	 * @param {[type]} maxes [description]
	 *
	 * @return {[type]} [description]
	 */
	function calcPolarStep(x,y, vals, size, channels, mins, maxes){
		//cet center
		var cx = size[0]/2, cy = size[1]/2;

		//get radius
		var r = Math.sqrt((cx-x)*(cx-x) + (cy-y)*(cy-y));

		//normalize radius
		var nr = r / cx;

		//get angle
		var a = Math.atan2( cy-y, cx-x );

		//get normalized angle (avoid negative values)
		var na = (a + Math.PI)/Math.PI/2;


		//ch 1 is radius
		if (channels[1] || channels[1] === 0) {
			vals[channels[1]] = mins[1] + (maxes[1] - mins[1]) * nr;
		}

		//ch 2 is angle
		if (channels[0] || channels[0] === 0) {
			vals[channels[0]] = mins[0] + (maxes[0] - mins[0]) * na;
		}

		return vals;
	}


	/**
	 * Calculate step values for a rectangular range
	 *
	 * @param {array} vals step values to calc
	 * @param {array} size size of rect
	 * @param {array} mins min c1,c2
	 * @param {array} maxes max c1,c2
	 *
	 * @return {array} [description]
	 */
	function calcRectStep(x,y, vals, size, channels, mins, maxes){
		if (channels[1] || channels[1] === 0) {
			vals[channels[1]] = mins[1] + (maxes[1] - mins[1]) * (1 - y / (size[1] - 1));
		}
		if (channels[0] || channels[0] === 0) {
			vals[channels[0]] = mins[0] + (maxes[0] - mins[0]) * x / (size[0] - 1);
		}
		return vals;
	}
}