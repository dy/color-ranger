/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var assert = require('chai').assert;
var range = require('../index');
var Color = require('color');


var c = new Color('green');
var direction = 'to right';


//create range case, build up canvas renderer
function createBg(str){
	var bg = document.createElement('div');
	bg.className = 'range-case';

	if (/-/.test(str)){
		bg.className += ' rect-case';
		bg.setAttribute('data-channel', str || '');
	}
	document.body.appendChild(bg);

	//canvas case
	if (/-c/.test(str)){
		bg.className += ' canvas-case';
		bg.setAttribute('data-channel', '');
	}


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
	// it('canvas', function(){
	// 	range.canvasify(c, 'hsv', ['hue', 'value']);
	// });

	it('hue-lightness', function(){
		createBg('hue-lightness').style.background = range.rectangular.hue.lightness(c);
		createBg('hue-lightness-c').style.background = range.canvasify(c, 'hsl', ['hue', 'lightness']);
	});

	it('hue-brightness', function(){
		createBg('hue-brightness').style.background = range.rectangular.hue.brightness(c);
		createBg('hue-brightness-c').style.background = range.canvasify(c, 'hsv', ['hue', 'value']);
	});

	it('hue-saturation', function(){
		createBg('hue-saturation').style.background = range.rectangular.hue.saturation(c);
		createBg('hue-saturation-c').style.background = range.canvasify(c, 'hsl', ['hue', 'saturation']);
	});

	it('hue-saturationv', function(){
		createBg('hue-saturationv').style.background = range.rectangular.hue.saturationv(c);
		createBg('hue-saturation-c').style.background = range.canvasify(c, 'hsv', [0, 1]);
	});

	it('saturation-lightness', function(){
		createBg('saturation-lightness').style.background = range.rectangular.saturation.lightness(c);
		createBg('saturation-lightness-c').style.background = range.canvasify(c, 'hsl', ['saturation', 'lightness']);
	});

	it('saturation-brightness', function(){
		createBg('saturation-brightness').style.background = range.rectangular.saturation.brightness(c);
		createBg('saturation-brightness-c').style.background = range.canvasify(c, 'hsv', [1, 'value']);
	});
});