var Color = require('color');


/**
 * Render passed color range in imageData.
 * Can be used in a separate web-worker, then pass imgData by reference.
 *
 * @param {Color} color A color to build range
 * @param {string} space A space to render
 * @param {array} channels List of channel indexes to render
 * @param {ImageData} imgData An image data which might be passed from outside
 *
 * @return {string} base-64 FIXME
 */
function renderRange(color, space, channels, imgData){
	// console.time('canv');

	var h = imgData.height,
		w = imgData.width;

	var c1idx = channels[0];
	var c2idx = channels[1];
	var c1max = Color.maxes[space][c1idx];
	var c2max = Color.maxes[space][c2idx];

	for (var x, y = h, row, col, c; y--;){

		row = y * w * 4;

		for (x = 0; x < w; x++){
			col = row + x * 4;

			c = color.clone();
			if (c2idx !== undefined) c.setChannel(space, c2idx, c2max * (1 - y / (h - 1)));

			//calc color
			c.setChannel(space, c1idx, c1max * x / (w - 1));

			//fill image data
			imgData.data[col + 0] = c.red();
			imgData.data[col + 1] = c.green();
			imgData.data[col + 2] = c.blue();
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