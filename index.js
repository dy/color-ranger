var converter = require('color-convert/conversions');


//TODO: all spaces
//TODO: circular range
//TODO: readme
//TODO: demo page


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
function renderRect(rgba, space, channels, mins, maxes, imgData){
	// console.time('canv');

	var isCMYK = space === 'cmyk';

	//add alpha
	if (rgba.length === 3) rgba[3] = 255;

	//specific space values
	var values;
	if (space === 'rgb') {
		values = rgba.slice();
	} else {
		values = converter['rgb2' + space](rgba);
		if (!isCMYK && values.length === 3) values[3] = rgba[3];
	}


	var h = imgData.height,
		w = imgData.width;

	var c1idx = channels[0];
	var c2idx = channels[1];
	var noIdx = [];
	for (var i = space.length; i--;){
		if (i !== c1idx && i !== c2idx) noIdx.push(i);
	}
	var noIdx1 = noIdx[0];
	var noIdx2 = noIdx[1];
	var noIdx3 = noIdx[2];

	var c1max = maxes[0];
	var c2max = maxes[1];
	var c1min, c2min;
	if (mins) {
		c1min = mins[0] || 0;
		c2min = mins[1] || 0;
	} else {
		c1min = c2min = 0;
	}

	var convert = space === 'rgb' ? function(a){return a} : converter[space + '2rgb'];

	for (var x, y = h, row, col, res, preset = values.slice(); y--;) {
		row = y * w * 4;

		for (x = 0; x < w; x++) {
			col = row + x * 4;

			//calculate color
			if (c2idx || c2idx === 0) {
				preset[c2idx] = c1min + (c2max - c1min) * (1 - y / (h - 1));
				// c.setChannel(space, c2idx, c2max * (1 - y / (h - 1)));
			}
			if (c1idx || c1idx === 0) {
				preset[c1idx] = c1min + (c1max - c1min) * x / (w - 1);
				// c.setChannel(space, c1idx, c1max * x / (w - 1));
			}
			if (noIdx1 || noIdx1 === 0) preset[noIdx1] = values[noIdx1];
			if (noIdx2 || noIdx2 === 0) preset[noIdx2] = values[noIdx2];
			if (noIdx3 || noIdx3 === 0) preset[noIdx3] = values[noIdx3];

			//fill image data
			res = convert(preset);
			if (isCMYK) res[3] = 255;
			else res[3] = preset[3];

			imgData.data.set(res, col);
		}
	}

	return imgData;
}


/**
 * Render polar coords range
 *
 * @return {ImageData}
 */
function renderPolar(){

}





/**
 * @module color-ranger
 */
module.exports = {
	rect: renderRect,
	polar: renderPolar,
	grid: renderGrid
};