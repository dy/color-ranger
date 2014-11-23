var convert = require('color-space');


//TODO: use color-space to get maxes & channels
//TODO: readme
//TODO: demo page
//TODO: paint limits, esp. lch
//TODO: statistical range (expanden popular areas, shrunk less needed areas)
//TODO: implement shaders approach https://github.com/rosskettle/color-space-canvas


/**
 * Render transparency grid
 *
 * @param {array} a A list of values representing first cell
 * @param {array} b A list of values representing second cell
 * @param {ImageData} imgData A data taken as a base for grid
 *
 * @return {ImageData} Return updated imageData
 */
function renderGrid(a, b, imgData){
	var h = imgData.height,
		w = imgData.width;

	var cellH = ~~(h/2);
	var cellW = ~~(w/2);

	//convert alphas to 255
	if (a.length === 4) a[3] *= 255;
	if (b.length === 4) b[3] *= 255;

	for (var y=0, col, row; y < h; y++){
		row = y * w * 4;
		for ( var x=0; x < w; x++){
			col = row + x * 4;
			imgData.data.set(x >= cellW ? (y >= cellH ? a : b) : (y >= cellH ? b : a), col);
		}
	}

	return imgData;
};



/**
 * Render passed color rectangular range in imageData.
 * Can be used in a separate web-worker, then pass imgData by reference.
 *
 * @param {array} rgb A list of values + optional alpha
 * @param {string} space A space to render, no alpha-suffix
 * @param {array} channels List of channel indexes to render
 * @param {array} mins Min values to render range
 * @param {array} maxes Max values to render range
 * @param {ImageData} imgData An image data which might be passed from outside
 *
 * @return {string} base-64 FIXME
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
		if (!isCMYK && values.length === 3) values[3] = rgba[3];
	}

	//resolve channel indexes
	var h = imgData.height,
		w = imgData.width,
		size = [w,h];

	var noIdx = [];
	for (var i = space.length; i--;){
		if (i !== channels[0] && i !== channels[1]) noIdx.push(i);
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

			if (noIdx1 || noIdx1 === 0) stepVals[noIdx1] = values[noIdx1];
			if (noIdx2 || noIdx2 === 0) stepVals[noIdx2] = values[noIdx2];
			if (noIdx3 || noIdx3 === 0) stepVals[noIdx3] = values[noIdx3];

			//fill image data
			res = converter(stepVals);
			res[3] = isCMYK ? 255 : stepVals[3];

			imgData.data.set(res, col);
		}
	}

	return imgData;
}


/**
 * A wrapper over the render for rectangular coords render
 */
function renderRect(rgba, space, channels, mins, maxes, imgData){
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

	return render(rgba, space, channels, mins, maxes, imgData, calcRectStep);
}


/**
 * A wrapper over the render for polar coords render
 */
function renderPolar(rgba, space, channels, mins, maxes, imgData){
	/**
	 * Calculate step values for a polar range
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

		//get normalized angle
		//FIXME: why 1.73?
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

	return render(rgba, space, channels, mins, maxes, imgData, calcPolarStep);
}




/**
 * @module color-ranger
 */
module.exports = {
	render: render,
	rect: renderRect,
	polar: renderPolar,
	grid: renderGrid
};