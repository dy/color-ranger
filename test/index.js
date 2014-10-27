/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var assert = require('chai').assert;
var range = require('../index');
var Color = require('color');


var c = new Color('red');
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
	if (/c$/.test(str)){
		bg.className += ' canvas-case';
		bg.setAttribute('data-channel', '');
		document.body.appendChild(document.createElement('br'));
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

	it.skip('radial grad', function(){

	});

	it('canvas 1-dim', function(){
		range.canvasify(color, 'Lab', ['L']);
	});

	it('canvas 2-dim', function(){
		range.canvasify(color, 'rgb', [0, 1]);
	});
});



describe('linear',function(){
	it('hue', function(){
		createBg('hue').style.background = range.linear.hue(c, direction);
		createBg('huec').style.background = range.canvasify(c, 'hsl', [0]);
	});

	it('saturation', function(){
		createBg('saturation').style.background = range.linear.saturation(c, direction);
		createBg('saturationc').style.background = range.canvasify(c, 'hsl', [1]);
	});

	it('lightness', function(){
		createBg('lightness').style.background = range.linear.lightness(c, direction);
		createBg('lightnessc').style.background = range.canvasify(c, 'hsl', [2]);
	});

	it('brightness', function(){
		createBg('brightness').style.background = range.linear.brightness(c, direction);
		createBg('brightnessc').style.background = range.canvasify(c, 'hsv', [2]);
	});

	it('red', function(){
		createBg('red').style.background = range.linear.red(c, direction);
		createBg('redc').style.background = range.canvasify(c, 'rgb', [0]);
	});

	it('green', function(){
		createBg('green').style.background = range.linear.green(c, direction);
		createBg('greenc').style.background = range.canvasify(c, 'rgb', [1]);
	});

	it('blue', function(){
		createBg('blue').style.background = range.linear.blue(c, direction);
		createBg('bluec').style.background = range.canvasify(c, 'rgb', [2]);
	});

	it('alpha', function(){
		createBg('alpha').style.background = range.linear.alpha(c, direction);
		createBg('alphac').style.background = range.canvasify(c, 'alpha', [0]);
	});

	it('cyan', function(){
		createBg('cyan').style.background = range.linear.cyan(c, direction);
		createBg('cyanc').style.background = range.canvasify(c, 'cmyk', [0]);
	});

	it('magenta', function(){
		createBg('magenta').style.background = range.linear.magenta(c, direction);
		createBg('magentac').style.background = range.canvasify(c, 'cmyk', [1]);
	});

	it('yellow', function(){
		createBg('yellow').style.background = range.linear.yellow(c, direction);
		createBg('yellowc').style.background = range.canvasify(c, 'cmyk', [2]);
	});

	it('black', function(){
		createBg('black').style.background = range.linear.black(c, direction);
		createBg('blackc').style.background = range.canvasify(c, 'cmyk', [3]);
	});
});


describe('rectangular', function(){
	// it('canvas', function(){
	// 	range.canvasify(c, 'hsv', ['hue', 'value']);
	// });

	it('hue-lightness', function(){
		createBg('hue-lightness').style.background = range.rectangular.hue.lightness(c);
		createBg('hue-lightness-c').style.background = range.canvasify(c, 'hsl', [0,2]);
	});

	it('hue-brightness', function(){
		createBg('hue-brightness').style.background = range.rectangular.hue.brightness(c);
		createBg('hue-brightness-c').style.background = range.canvasify(c, 'hsv', [0, 2]);
	});

	it('hue-saturation', function(){
		createBg('hue-saturation').style.background = range.rectangular.hue.saturation(c);
		createBg('hue-saturation-c').style.background = range.canvasify(c, 'hsl', [0, 1]);
	});

	it('hue-saturationv', function(){
		createBg('hue-saturationv').style.background = range.rectangular.hue.saturationv(c);
		createBg('hue-saturation-c').style.background = range.canvasify(c, 'hsv', [0, 1]);
	});

	it('saturation-lightness', function(){
		createBg('saturation-lightness').style.background = range.rectangular.saturation.lightness(c);
		createBg('saturation-lightness-c').style.background = range.canvasify(c, 'hsl', [1, 2]);
	});

	it('saturation-brightness', function(){
		createBg('saturation-brightness').style.background = range.rectangular.saturation.brightness(c);
		createBg('saturation-brightness-c').style.background = range.canvasify(c, 'hsv', [1, 2]);
	});

	it('red-green', function(){
		createBg('red-green').style.background = range.rectangular.red.green(c);
		createBg('red-green-c').style.background = range.canvasify(c, 'rgb', [0,1]);
	});

	it('red-blue', function(){
		createBg('red-blue').style.background = range.rectangular.red.blue(c);
		createBg('red-blue-c').style.background = range.canvasify(c, 'rgb', [0,2]);
	});

	it('green-blue', function(){
		createBg('green-blue').style.background = range.rectangular.green.blue(c);
		createBg('green-blue-c').style.background = range.canvasify(c, 'rgb', [1,2]);
	});
});