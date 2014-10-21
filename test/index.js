/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var assert = require('chai').assert;
var range = require('../index');
var Color = require('color');


var c = new Color('green');
var direction = 'to right';


function createBg(str){
	var bg = document.createElement('div');
	bg.className = 'range-case';
	if (/-/.test(str)){
		bg.className += ' rect-case';
	}
	document.body.appendChild(bg);

	bg.setAttribute('data-channel', str || '')

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

	it('even gradient', function(){
		var div = document.createElement('div');
		div.style.background = range.gradient([new Color('black'), new Color('white')]);
		var bg1 = div.style.background;
		div.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 1), rgba(255, 255, 255, 1))';
		var bg2 = div.style.background;
		assert.equal(bg1, bg2);
	});

	it('stepped gradient', function(){
		var div = document.createElement('div');
		div.style.background = range.gradient([[new Color('black'), 10], [new Color('white'), 20]]);
		var bg1 = div.style.background;
		div.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 1) 10%, rgba(255, 255, 255, 1) 20%)';
		var bg2 = div.style.background;

		assert.equal(bg1, bg2);
	});

	it('textual colors in grad', function(){
		var div = document.createElement('div');
		div.style.background = range.gradient(['black', 'white']);
		var bg1 = div.style.background;
		div.style.background = 'linear-gradient(to right, black, white)';
		var bg2 = div.style.background;

		assert.equal(bg1, bg2);
	});
});



describe('linear',function(){
	it('hue', function(){
		createBg('hue').style.background = range.linear.hue(c, direction);
	});

	it('saturation', function(){
		createBg('saturation').style.background = range.linear.saturation(c, direction);
	});

	it('lightness', function(){
		createBg('lightness').style.background = range.linear.lightness(c, direction);
	});

	it('brightness', function(){
		createBg('brightness').style.background = range.linear.brightness(c, direction);
	});

	it('red', function(){
		createBg('red').style.background = range.linear.red(c, direction);
	});

	it('green', function(){
		createBg('green').style.background = range.linear.green(c, direction);
	});

	it('blue', function(){
		createBg('blue').style.background = range.linear.blue(c, direction);
	});

	it('alpha', function(){
		createBg('alpha').style.background = range.linear.alpha(c, direction);
	});

	it('cyan', function(){
		createBg('cyan').style.background = range.linear.cyan(c, direction);
	});

	it('magenta', function(){
		createBg('magenta').style.background = range.linear.magenta(c, direction);
	});

	it('yellow', function(){
		createBg('yellow').style.background = range.linear.yellow(c, direction);
	});

	it('black', function(){
		createBg('black').style.background = range.linear.black(c, direction);
	});
});


describe('rectangular', function(){
	it('hue-lightness', function(){
		createBg('hue-lightness').style.background = range.rectangular.hue.lightness(c);
	});

	it('hue-brightness', function(){
		createBg('hue-brightness').style.background = range.rectangular.hue.brightness(c);
	});

	it('hue-saturation', function(){
		createBg('hue-saturation').style.background = range.rectangular.hue.saturation(c);
	});
});