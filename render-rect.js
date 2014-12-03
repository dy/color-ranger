/**
 * Cartesian coordinate system renderer
 *
 * @module  color-ranger/render-rect
 */

var render = require('./render');

module.exports = renderRect;



/**
 * A wrapper over the `render` for rectangular coords rendering
 *
 * @param {array} rgba List of rgba values
 * @param {string} space Space name (taken from the color-space module)
 * @param {array} channels Channel indexes to render
 * @param {array} mins left values for the channels
 * @param {array} maxes right values for the channels
 * @param {UInt8CappedArray} buffer An image data buffer
 * @param {ImageData} imgData An target image data in which to render range
 */
function renderRect(rgba, buffer, opts){
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

	return render(rgba, buffer, calcRectStep, opts);
}