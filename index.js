var Color = require('color');


/** Default settings */
var options = {
	/** default color space
	 * used as a gradient stop value
	 */
	space: 'rgb',

	/** default direction */
	direction: 'to right',

	/** transparency grid settings */
	gridColor: 'rgba(0,0,0,.4)',
	gridSize: 14
};



/* ----------------------------  L  I  N  E  A  R  ----------------------------------- */


var linear = {
	/**
	 * Render linear hue background based on the color passed
	 *
	 * @param {Color} color A color instance {@ref|harthur/color}
	 * @param {string} direction A direction to render the bg
	 *
	 * @return {string} rendered css background-image
	 */
	hue: function(color, direction){
		direction = direction || options.direction;
		var c1 = color.clone();
		var c2 = color.clone();
		var seq = interpolate(c1.hue(0), c2.hue(360), 7, 'hsl');

		return grad(direction, seq);
	},

	saturation: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [color.clone().saturation(0), color.clone().saturation(100)]);
	},

	lightness: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().lightness(0), c.clone().lightness(50) , c.clone().lightness(100)]);
	},

	red: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().red(0), c.clone().red(255)]);
	},

	green: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().green(0), c.clone().green(255)]);
	},

	blue: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().blue(0), c.clone().blue(255)]);
	},

	/**
	 * Return set of rules to apply to the target element
	 *
	 * @param {Color} color Main color to calc range from
	 * @param {string} direction A direction to follow
	 *
	 * @todo Think up the more graceful way of renderind this
	 *
	 * @return {string} Background
	 */
	alpha: function(color, direction) {
		var gc = options.gridColor;
		var s = options.gridSize;

		return [grad(direction, [c.clone().alpha(0), c.clone().alpha(1)]) + ' 0 0 / 100% 100%,',

		//chess gradient
		'linear-gradient(45deg, ' + gc + ' 25%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, ' + gc + ' 75%) 0 0 / ' + s + 'px ' + s + 'px ,',
		'linear-gradient(45deg, ' + gc + ' 25%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, ' + gc + ' 75%) ' + s/2 + 'px ' + s/2 + 'px / ' + s + 'px ' + s + 'px'].join('');
	},

	cyan: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().cyan(0), c.clone().cyan(100)]);
	},

	magenta: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().magenta(0), c.clone().magenta(100)]);
	},

	yellow: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().yellow(0), c.clone().yellow(100)]);
	},

	black: function(color, direction){
		direction = direction || options.direction;
		return grad(direction, [c.clone().black(0), c.clone().black(100)]);
	}
};



/* ------------------------  R  E  C  T  A  N  G  U  L  A  R  ------------------------ */


var rectangular = {
	hue: {
		saturation: function() {
		},
		saturationv: function() {
		},
		lightness: function(c, directions) {
			var result = '';

			//create hue horizontally
			result += linear.hue(c, directions[0]);

			//apply lightness verticallly
			result = grad(directions[1], [c.clone().lightness(0).alpha(1), [c.clone().lightness(0).alpha(0), 50], [c.clone().lightness(100).alpha(0), 50], c.clone().lightness(100).alpha(1)]) + ', ' + result;

			return result;
		},
		value: function() {
		},
		brightness: function() {
		},

		//TODO: think to use a separate worker to calculate chroma image
		chroma: function(){

		}
	},
	saturation: {
		lightness: function() {
		},
		value: function(){

		},
		brightness: function() {
		},
		hue: function() {
		},
	},
	red: {
		green: function() {
		},
		blue: function() {
		}
	},
	green: {
		red: function() {
		},
		blue: function() {
		}
	},
	L: {
		a: function() {
		},
		b: function() {
		}
	}
};



/* --------------------------  C  I  R  C  U  L  A  R  ------------------------------- */


/**
 * Circular pickers - values depend on angle
 */
var circular = {
	hue: function(color, direction){

	}
};



/* --------------------------------  P  O  L  A  R  ---------------------------------- */


var polar = {

};



/* -----------------------------  H  E  L  P  E  R  S  ------------------------------- */


/**
 * Return sequence of colors evenly distributed between the color A and color B in the space
 *
 * @param {Color} colorA Left color
 * @param {Color} colorB Right color
 * @param {number} steps Final number of steps in sequence
 * @param {string} space Target space to do interpolation by
 *
 * @return {Array} List of colors
 */
function interpolate(colorA, colorB, steps, space){
	var result = [], c = colorA.clone();
	for (var i = 0; i < steps; i++){
		result.push(colorA.clone().mix(colorB, i/(steps - 1), space));
	}
	return result;
}


/**
 * Generate linear gradient
 * with evenly distributed colors
 * @todo Browser-prefixes - it is a mucss task or this one?
 *
 * @param {Array} list A sequence of colors
 *                     - strings/object with toString/valueOf method defined
 *
 * @return {string} A string representing gradient
 */
function grad(direction, list, space){
	space = space || options.space;
	var strMeth = space + 'String';

	if (direction instanceof Array){
		list = direction;
		direction = options.direction;
	}

	var result = 'linear-gradient(' + direction + ', ';

	var l = list.length - 1, r = 100/l;

	for (var i = 0, step, color; i <= l; i++) {
		//color-step
		if (list[i].length){
			color = list[i][0][strMeth]();
			step = list[i][1];
		}
		else {
			color = list[i][strMeth]();
			step = (i*r);
		}
		//shorten 0%/100% values?
		step = step === 0 || step === 100 ? '' : step.toFixed(3) + '%';

		result += color + ' ' + step + ', ';
	}

	result = result.slice(0, -2) + ')';

	return result;
}



/**
 * @module color-range
 */
module.exports = {
	linear: linear,
	polar: polar,
	rectangular: rectangular,
	circular: circular,

	interpolate: interpolate,
	gradient: grad,

	options: options
};