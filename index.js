var converter = require('color-convert/conversions');

/**
 * Render passed color range in imageData.
 * Can be used in a separate web-worker, then pass imgData by reference.
 *
 * @param {array} rgb A list of values
 * @param {string} space A space to render
 * @param {array} channels List of channel indexes to render
 * @param {array} maxes Max values to render range
 * @param {ImageData} imgData An image data which might be passed from outside
 *
 * @return {string} base-64 FIXME
 */
function renderRange(rgb, space, channels, maxes, imgData){
	// console.time('canv');

	var values = space === 'rgb' ? rgb : converter['rgb2' + space](rgb);

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

	var convert = space === 'rgb' ? function(a){return a} : converter[space + '2rgb'];

	for (var x, y = h, row, col, res, preset = values.slice(); y--;) {
		row = y * w * 4;

		for (x = 0; x < w; x++) {
			col = row + x * 4;

			//calculate color
			if (c2idx || c2idx === 0) {
				preset[c2idx] = c2max * (1 - y / (h - 1));
				// c.setChannel(space, c2idx, c2max * (1 - y / (h - 1)));
			}
			if (c1idx || c1idx === 0) {
				preset[c1idx] = c1max * x / (w - 1);
				// c.setChannel(space, c1idx, c1max * x / (w - 1));
			}
			if (noIdx1 || noIdx1 === 0) preset[noIdx1] = values[noIdx1];
			if (noIdx2 || noIdx2 === 0) preset[noIdx2] = values[noIdx2];
			if (noIdx3 || noIdx3 === 0) preset[noIdx3] = values[noIdx3];

			//fill image data
			res = convert(preset);
			imgData.data[col + 0] = res[0];
			imgData.data[col + 1] = res[1];
			imgData.data[col + 2] = res[2];
			imgData.data[col + 3] = 255;
			// data.data[row + x + 3] = lc.alpha();
		}
	}

	return imgData;
}


/**
 * @module color-ranger
 */
module.exports = renderRange;