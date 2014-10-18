/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var assert = require('chai').assert;
var range = require('../index');
var Color = require('color');


var c = new Color('green');
var direction = 'to right';


function createBg(){
	var bg = document.createElement('div');
	bg.className = 'range-case';
	document.body.appendChild(bg);

	return bg;
}



describe('helpers', function(){
	it('interpolate', function(){
		var c = new Color('gray');
		var l = range.interpolate(c.clone().red(0), c.clone().red(255), 5);
		assert.equal(l.length, 5);
		assert.equal(l[0].red(), 0);
		assert.equal(l[4].red(), 255);
		assert.equal(c.red(), 128);
		assert.equal(c.green(), 128);
		assert.notEqual(l[0], l[1]);
		assert.notEqual(l[1], l[4]);
	});

	it('gradient', function(){
		var div = document.createElement('div');
		div.style.background = range.gradient([new Color('black'), new Color('white')]);
		var bg1 = div.style.background;
		div.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(255, 255, 255, 1) 100%)';
		var bg2 = div.style.background;

		assert.equal(bg1, bg2);
	});
});



describe('linear',function(){
	it("hue", function(){
		createBg().style.background = range.linear.hue(c, direction);
	});

	it("saturation", function(){
		createBg().style.background = range.linear.saturation(c, direction);
	});

	it("lightness", function(){
		createBg().style.background = range.linear.lightness(c, direction);
	});

	it("red", function(){
		createBg().style.background = range.linear.red(c, direction);
	});

	it("green", function(){
		createBg().style.background = range.linear.green(c, direction);
	});

	it("blue", function(){
		createBg().style.background = range.linear.blue(c, direction);
	});

	it("alpha", function(){
		console.log(range.linear.alpha(c, direction))
		createBg().style.background = range.linear.alpha(c, direction);
	});
});