/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var assert = require('assert');
var range = require('../index');


var c = new Color('green');

//hardcode version
var s = color.saturation(),
	l = color.lightness();
var hueBg = ['linear-gradient(to ' + direction + ',',
	'hsl(0,' + s + '%,' + l + '%) 0%,',
	'hsl(60,' + s + '%,' + l + '%) 16.666%,',
	'hsl(120,' + s + '%,' + l + '%) 33.333%,',
	'hsl(180,' + s + '%,' + l + '%) 50%,',
	'hsl(240,' + s + '%,' + l + '%) 66.666%,',
	'hsl(300,' + s + '%,' + l + '%) 83.333%,',
	'hsl(360,' + s + '%,' + l + '%) 100%)'].join('');

assert.equal(range.linear.hue(c), hueBg);