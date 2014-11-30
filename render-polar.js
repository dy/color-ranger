/**
 * Polar coordinate system renderer
 *
 * @module  color-ranger/render-rect
 */

var render = require('./render');

module.exports = renderPolar;



/**
 * A wrapper over the `render` for polar coords rendering
 *
 * @param {array} rgba List of rgba values
 * @param {string} space Space name (taken from the color-space module)
 * @param {array} channels Channel indexes to render
 * @param {array} mins left values for the channels
 * @param {array} maxes right values for the channels
 * @param {ImageData} imgData An target image data in which to render range
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

	return render(rgba, space, channels, mins, maxes, imgData, calcPolarStep);
}