var colorString = require('color-string');
var splitKeys = require('split-keys');
var Color = require('color');


/** Default settings */
var options = {
	/** default color space */
	space: 'rgb',

	/** default direction */
	direction: '0deg',

	/** transparency grid settings */
	gridColor: new Color('rgba(0,0,0,.4)'),
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
		//hardcode version
		// var s = color.saturation(),
		// 	l = color.lightness();
		// var bg = ['linear-gradient(to ' + direction + ',',
		// 	'hsl(0,' + s + '%,' + l + '%) 0%,',
		// 	'hsl(60,' + s + '%,' + l + '%) 16.666%,',
		// 	'hsl(120,' + s + '%,' + l + '%) 33.333%,',
		// 	'hsl(180,' + s + '%,' + l + '%) 50%,',
		// 	'hsl(240,' + s + '%,' + l + '%) 66.666%,',
		// 	'hsl(300,' + s + '%,' + l + '%) 83.333%,',
		// 	'hsl(360,' + s + '%,' + l + '%) 100%)'].join('');
		// return bg;

		//softcode version
		var c = color.clone();
		var seq = interpolate(color.hue(0), color.hue(360), 7, 'hsl');

		return grad(direction, seq);
	},

	saturation: function(color, direction){
		var c = color.clone();
		return grad(direction, interpolate(c.saturation(0), c.saturation(100), 2, 'hsl'));
	},

	lightness: function(color, direction){
		var c = color.clone();
		return grad(direction, interpolate(c.lightness(0), c.lightness(100), 3, 'hsl'));
	},

	red: function(color, direction){
		var c = color.clone();
		return grad(direction, [c.red(0), c.red(255)]);
	},

	green: function(color, direction){
		var c = color.clone();
		return grad(direction, [c.green(0), c.green(255)]);
	},

	blue: function(color, direction){
		var c = color.clone();
		return grad(direction, [c.blue(0), c.blue(255)]);
	},

	/**
	 * Return set of rules to apply to the target element
	 *
	 * @param {Color} color Main color to calc range from
	 * @param {string} direction A direction to follow
	 * @param {string} gridColor Transparent grid color
	 * @param {number} gridSize Grid size
	 *
	 * @todo Think up the more graceful way of renderind this
	 *
	 * @return {[type]} [description]
	 */
	alpha: function(color, direction) {
		var c = color.clone();

		var gc = options.gridColor;
		var s = options.gridSize;

		return [grad(direction, [c.alpha(0), c.alpha(1)]) + ' 0 0 / 100% 100%,',

		//chess gradient
		'linear-gradient(45deg, ' + gc + ' 25%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, ' + gc + ' 75%) 0 0 / ' + s + 'px ' + s + 'px ,',
		'linear-gradient(45deg, ' + gc + ' 25%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, ' + gc + ' 75%) ' + s/2 + 'px ' + s/2 + 'px / ' + s + 'px ' + s + 'px'].join('');
	}
};



/* ------------------------  R  E  C  T  A  N  G  U  L  A  R  ------------------------ */


var rectangular = {
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
	hue: {
		saturation: function() {
		},
		saturationv: function() {
		},
		lightness: function() {
		},
		'value, brightness': function() {
		}
	},
	saturation: {
		lightness: function() {
		},
		'value, brightness': function() {
		},
		hue: function() {
		},
	},
	L: {
		a: function() {
		},
		b: function() {
		}
	}
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
		result.push(colorA.mix(colorB, i/steps, space));
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
function grad(direction, list){
	var result = 'linear-gradient(to ' + direction + ', ';

	var l = list.length - 1, r = (100/l).toFixed(3);

	for (var i = 0; i < l; i++){
		result += list[i] + i*r + '%,';
	}

	result += list[l] + '100%)';

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