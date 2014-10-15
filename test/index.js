/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var assert = require('assert');
var range = require('../index');
var Color = require('color');


/* Interpolation */
var c = new Color('gray');
var l = range.interpolate(c.red(0), c.red(255), 5);
assert.equal(l.length, 5);


/* Gradient */
assert.equal(range.gradient([new Color('black'), new Color('white')]), 'linear-gradient(0deg, black, white)');

/* Rendering */
var c = new Color('green');

//hardcode version
var s = c.saturation(),
	l = c.lightness();

var hueBg = ['linear-gradient(' + range.options.direction + ', ',
	'hsl(0,' + s + '%,' + l + '%) 0%, ',
	'hsl(60,' + s + '%,' + l + '%) 16.666%, ',
	'hsl(120,' + s + '%,' + l + '%) 33.333%, ',
	'hsl(180,' + s + '%,' + l + '%) 50%, ',
	'hsl(240,' + s + '%,' + l + '%) 66.666%, ',
	'hsl(300,' + s + '%,' + l + '%) 83.333%, ',
	'hsl(360,' + s + '%,' + l + '%) 100%)'].join('');

assert.equal(hueBg, range.linear.hue(c));