/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var renderRange = require('../');



//create range case
function createRangeCase(str){
	var bg = document.createElement('div');
	bg.className = 'range-case';

	bg.setAttribute('data-channel', str || '');

	if (/-/.test(str)) bg.className += ' rect-case';

	document.body.appendChild(bg);

	return bg;
}


//virtual canvas
var cnv = document.createElement('canvas');
cnv.width = 37;
cnv.height = 37;
var ctx = cnv.getContext('2d');
var data = ctx.getImageData(0,0,cnv.width,cnv.height);

//color to take as a basis
var color = new Color('red');


describe('linear',function(){
	it('hue', function(){
		renderRange(color, 'hsl', [0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation', function(){
		renderRange(color, 'hsl', [1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('lightness', function(){
		renderRange(color, 'hsl', [2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('brightness', function(){
		renderRange(color, 'hsv', [2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red', function(){
		renderRange(color, 'rgb', [0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green', function(){
		renderRange(color, 'rgb', [1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('blue', function(){
		renderRange(color, 'rgb', [2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it.skip('alpha', function(){
		createRangeCase('alpha').style.background = range.linear.alpha(c, direction);
		createRangeCase('alphac').style.background = range.canvasify(c, 'alpha', [0]);
	});

	it('cyan', function(){
		renderRange(color, 'cmyk', [0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta', function(){
		renderRange(color, 'cmyk', [1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow', function(){
		renderRange(color, 'cmyk', [2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('black', function(){
		renderRange(color, 'cmyk', [3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('rectangular', function(){
	// it.skip('canvas', function(){
	// 	range.canvasify(c, 'hsv', ['hue', 'value']);
	// });

	it('hue-lightness', function(){
		renderRange(color, 'hsl', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-brightness', function(){
		renderRange(color, 'hsv', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturation', function(){
		renderRange(color, 'hsl', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturationv', function(){
		renderRange(color, 'hsv', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-sv').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-lightness', function(){
		renderRange(color, 'hsl', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-brightness', function(){
		renderRange(color, 'hsv', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-green', function(){
		renderRange(color, 'rgb', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-g').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-blue', function(){
		renderRange(color, 'rgb', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green-blue', function(){
		renderRange(color, 'rgb', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('g-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-magenta', function(){
		renderRange(color, 'cmyk', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-m').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-yellow', function(){
		renderRange(color, 'cmyk', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-black', function(){
		renderRange(color, 'cmyk', [0,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-black', function(){
		renderRange(color, 'cmyk', [0,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-yellow', function(){
		renderRange(color, 'cmyk', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-black', function(){
		renderRange(color, 'cmyk', [1,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow-black', function(){
		renderRange(color, 'cmyk', [2,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});