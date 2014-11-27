/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var renderRange = require('../');
var Emmy = require('emmy');
var convert = require('color-space');


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
cnv.width = 101//37;
cnv.height = 101//37;
var ctx = cnv.getContext('2d');
var data = ctx.getImageData(0,0,cnv.width,cnv.height);

//color to take as a basis
var color = new Color('red');


describe('directions', function(){
	it('[x]', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [0], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('only-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('[null, y]', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [null, 0], [0,0], [null, 360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('only-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('[x,y]', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [0, 1], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('linear',function(){
	it('hue', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [0], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('lightness', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [2], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('brightness', function(){
		renderRange.rect(color.rgbArray(), 'hsv', [2], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red', function(){
		renderRange.rect(color.rgbArray(), 'rgb', [0], [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green', function(){
		renderRange.rect(color.rgbArray(), 'rgb', [1], [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('blue', function(){
		renderRange.rect(color.rgbArray(), 'rgb', [2], [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [2], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('black', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [3], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('x', function(){
		renderRange.rect(color.rgbArray(), 'xyz', [0], [0], [95.047], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('y', function(){
		renderRange.rect(color.rgbArray(), 'xyz', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('z', function(){
		renderRange.rect(color.rgbArray(), 'xyz', [2], [0], [108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('L', function(){
		renderRange.rect(color.rgbArray(), 'lab', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('a', function(){
		renderRange.rect(color.rgbArray(), 'lab', [1], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('b', function(){
		renderRange.rect(color.rgbArray(), 'lab', [2], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l', function(){
		renderRange.rect(color.rgbArray(), 'lch', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c', function(){
		renderRange.rect(color.rgbArray(), 'lch', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h', function(){
		renderRange.rect(color.rgbArray(), 'lch', [2], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('L(uv)', function(){
		renderRange.rect(color.rgbArray(), 'lab', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('u', function(){
		renderRange.rect(color.rgbArray(), 'lab', [1], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('v', function(){
		renderRange.rect(color.rgbArray(), 'lab', [2], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l(uv)', function(){
		renderRange.rect(color.rgbArray(), 'lch', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c(uv)', function(){
		renderRange.rect(color.rgbArray(), 'lch', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h(uv)', function(){
		renderRange.rect(color.rgbArray(), 'lch', [2], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('rectangular', function(){
	it('hue-lightness', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [0, 2], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-brightness', function(){
		renderRange.rect(color.rgbArray(), 'hsv', [0,2], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturation', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [0,1], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturationv', function(){
		renderRange.rect(color.rgbArray(), 'hsv', [0,1], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-sv').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-lightness', function(){
		renderRange.rect(color.rgbArray(), 'hsl', [1,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-brightness', function(){
		renderRange.rect(color.rgbArray(), 'hsv', [1,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-green', function(){
		renderRange.rect(color.rgbArray(), 'rgb', [0,1], [0,0], [255,255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-g').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-blue', function(){
		renderRange.rect(color.rgbArray(), 'rgb', [0,2], [0,0], [255,255],  data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green-blue', function(){
		renderRange.rect(color.rgbArray(), 'rgb', [1,2], [0,0], [255,255],  data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('g-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-magenta', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [0,1], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-m').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-yellow', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [0,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-black', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [0,3], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-yellow', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [1,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-black', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [1,3], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow-black', function(){
		renderRange.rect(color.rgbArray(), 'cmyk', [2,3], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('x-y', function(){
		renderRange.rect(color.rgbArray(), 'xyz', [0,1], [0,0], [95.047,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('x-z', function(){
		renderRange.rect(color.rgbArray(), 'xyz', [0,2], [0,0], [95.047,108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('y-z', function(){
		renderRange.rect(color.rgbArray(), 'xyz', [1,2], [0,0], [100, 108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l-a', function(){
		renderRange.rect(color.rgbArray(), 'lab', [0,1], [0,-100], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('l-b', function(){
		renderRange.rect(color.rgbArray(), 'lab', [0,2], [0,-100], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('a-b', function(){
		renderRange.rect(color.rgbArray(), 'lab', [1,2], [-100,-100], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('a-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l-c', function(){
		renderRange.rect(color.rgbArray(), 'lch', [0,1], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('l-h', function(){
		renderRange.rect(color.rgbArray(), 'lch', [0,2], [0,0], [100,360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c-h', function(){
		renderRange.rect(color.rgbArray(), 'lch', [1,2], [0,0], [100,360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('alphas', function(){
	var gridBg;
	before(function(){
		//render grid
		var iw = cnv.width, ih = cnv.height;

		cnv.width = 12; cnv.height = 12;
		var gridData = ctx.getImageData(0,0,cnv.width,cnv.height);
		ctx.putImageData(renderRange.grid([120,120,120,.4], [0,0,0,0], gridData), 0, 0);

		gridBg = 'url(' + cnv.toDataURL() + ')';

		cnv.width = iw; cnv.height = ih;
	});

	it('alpha', function(){
		renderRange.rect(color.rgbaArray(), 'rgb', [3], [0], [255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('alpha').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
	it('red-alpha', function(){
		renderRange.rect(color.rgbaArray(), 'rgb', [0,3], [0,0], [255,255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('red-alpha').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
	it('hue-alpha', function(){
		renderRange.rect(color.rgbaArray(), 'hsl', [0,3], [0,0], [360,255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('hue-alpha').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
});



describe('conical', function(){
	it('hue', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [0], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('lightness', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [2], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('brightness', function(){
		renderRange.polar(color.rgbArray(), 'hsv', [2], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [0], [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [1], [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('blue', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [2], [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [2], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('black', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [3], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('x', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [0], [0], [95.047], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('y', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('z', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [2], [0], [108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('L', function(){
		renderRange.polar(color.rgbArray(), 'lab', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('a', function(){
		renderRange.polar(color.rgbArray(), 'lab', [1], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('b', function(){
		renderRange.polar(color.rgbArray(), 'lab', [2], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l', function(){
		renderRange.polar(color.rgbArray(), 'lch', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c', function(){
		renderRange.polar(color.rgbArray(), 'lch', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h', function(){
		renderRange.polar(color.rgbArray(), 'lch', [2], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('L(uv)', function(){
		renderRange.polar(color.rgbArray(), 'luv', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('u', function(){
		renderRange.polar(color.rgbArray(), 'luv', [1], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('v', function(){
		renderRange.polar(color.rgbArray(), 'luv', [2], [-100], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l(uv)', function(){
		renderRange.polar(color.rgbArray(), 'lchuv', [0], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-lυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c(uv)', function(){
		renderRange.polar(color.rgbArray(), 'lchuv', [1], [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h(uv)', function(){
		renderRange.polar(color.rgbArray(), 'lchuv', [2], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('radial', function(){
		it('hue', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [null, 0], [null, 0], [null, 360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('lightness', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [null, 2], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('brightness', function(){
		renderRange.polar(color.rgbArray(), 'hsv', [null, 2], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [null, 0], [null, 0], [null, 255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [null, 1], [null, 0], [null, 255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('blue', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [null, 2], [null, 0], [null, 255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [null, 0], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [null, 2], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('black', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [null, 3], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('x', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [null, 0], [null, 0], [null, 95.047], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('y', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('z', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [null, 2], [null, 0], [null, 108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('L', function(){
		renderRange.polar(color.rgbArray(), 'lab', [null, 0], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('a', function(){
		renderRange.polar(color.rgbArray(), 'lab', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('b', function(){
		renderRange.polar(color.rgbArray(), 'lab', [null, 2], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l', function(){
		renderRange.polar(color.rgbArray(), 'lch', [null, 0], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c', function(){
		renderRange.polar(color.rgbArray(), 'lch', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h', function(){
		renderRange.polar(color.rgbArray(), 'lch', [null, 2], [null, 0], [null, 360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('L(uv)', function(){
		renderRange.polar(color.rgbArray(), 'luv', [null, 0], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('u', function(){
		renderRange.polar(color.rgbArray(), 'luv', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('v', function(){
		renderRange.polar(color.rgbArray(), 'luv', [null, 2], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l(uv)', function(){
		renderRange.polar(color.rgbArray(), 'lchuv', [null, 0], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-lυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('c(uv)', function(){
		renderRange.polar(color.rgbArray(), 'lchuv', [null, 1], [null, 0], [null, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h(uv)', function(){
		renderRange.polar(color.rgbArray(), 'lchuv', [null, 2], [null, 0], [null, 360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('p-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});



describe('polar', function(){
	it('hue-lightness', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [0, 2], [0,100], [360, 0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-brightness', function(){
		renderRange.polar(color.rgbArray(), 'hsv', [0,2], [0,100], [360, 0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturation', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [0,1], [0,100], [360, 0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturationv', function(){
		renderRange.polar(color.rgbArray(), 'hsv', [0,1], [0,100], [360, 0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-sv').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('lightness-saturation', function(){
		renderRange.polar(color.rgbArray(), 'hsl', [2,1], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-brightness', function(){
		renderRange.polar(color.rgbArray(), 'hsv', [1,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-green', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [0,1], [0,0], [255,255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-g').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-blue', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [0,2], [0,0], [255,255],  data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green-blue', function(){
		renderRange.polar(color.rgbArray(), 'rgb', [1,2], [0,0], [255,255],  data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('g-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-magenta', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [0,1], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-m').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-yellow', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [0,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-black', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [0,3], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-yellow', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [1,2], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-black', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [1,3], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow-black', function(){
		renderRange.polar(color.rgbArray(), 'cmyk', [2,3], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('x-y', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [0,1], [0,0], [95.047,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('x-z', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [0,2], [0,0], [95.047,108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('y-z', function(){
		renderRange.polar(color.rgbArray(), 'xyz', [1,2], [0,0], [100, 108.883], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l-a', function(){
		renderRange.polar(color.rgbArray(), 'lab', [0,1], [0,-100], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('l-b', function(){
		renderRange.polar(color.rgbArray(), 'lab', [0,2], [0,-100], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('a-b', function(){
		renderRange.polar(color.rgbArray(), 'lab', [1,2], [-100,-100], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('a-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('l-c', function(){
		renderRange.polar(color.rgbArray(), 'lch', [0,1], [0,0], [100,100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h-l', function(){
		renderRange.polar(color.rgbArray(), 'lch', [2,0], [0,100], [360,0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('l-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
	it('h-c', function(){
		renderRange.polar(color.rgbArray(), 'lch', [2,1], [0,100], [360,0], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});



describe('performance', function(){
	var worker;


	//hook up worker
	before(function(done){
		console.time('blobStart');
		/*
		//inline worker - isn’t slower on init & work than file loader
		var blobURL = URL.createObjectURL( new Blob([
			//export color-ranger
			'var render = ', renderRange.render.toString() + '\n',
			'var renderRect = ', renderRange.rect.toString() + '\n',
			'var renderPolar = ', renderRange.polar.toString() + '\n',

			//export color-space
			(function(c){
				var res = 'var convert = {};\n';
				for (var space in c) {
					res += '\nvar ' + space + ' = convert.' + space + ' = {\n';

					for (var prop in c[space]) {
						if (typeof c[space][prop] === 'object') {
							res += prop + ':' + JSON.stringify(c[space][prop]) + ',\n';
						} else {
							res += prop + ':' + c[space][prop].toString() + ',\n';
						}
					}

					res += '}\n';
				}

				return res;
			})(convert),

			';(',
			function(){
				self.onmessage = function(e){
					var data = e.data;
					// console.log('got request', data);
					if (!data) return postMessage(false);


					var data = renderRect(data.rgb, data.space, data.channels, data.mins, data.maxes, data.data);

					postMessage({
						data: data,
						id: e.data.id
					});
				};
			}.toString(),
			')();'
		], { type: 'application/javascript' } ) );

		worker = new Worker(blobURL);

		//external worker
		// worker = new Worker( '../worker.js' );
		*/

		worker.postMessage('');
		Emmy.one(worker, 'message', function(){
			done();
			console.timeEnd('blobStart');
		});

	});


	it('no-webworker', function(){
		var bg = createRangeCase('no-webworker')

		console.time('no-webworker');
		renderRange.rect(color.rgbArray(), 'lch', [0,2], [0,0], [100,360], data);
		ctx.putImageData(data, 0, 0);
		console.timeEnd('no-webworker');

		bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});


	it('webworker clone', function(done){
		var bg = createRangeCase('webworker-clone');

		Emmy.on(worker, 'message', function(e){
			if (e.data.id !== 1) return;
			console.timeEnd('webworker-clone');

			ctx.putImageData(e.data.data, 0, 0);

			done();
			bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		console.time('webworker-clone');
		worker.postMessage({rgb: color.rgbArray(), space: 'lch', channels: [0,2], maxes: [100, 360], data: data, mins:[0,0], id: 1});
	});


	//image data isn’t transferable yet
	it.skip('webworker transfer', function(done){
		var bg = createRangeCase('webworker-transfer');

		console.time('transfer');
		worker.postMessage({rgb: color.rgbArray(), space: 'hsl', channels: [0,2], maxes: [360, 100]}, [data.data]);

		Emmy.one(worker, 'message', function(e){
			console.log('got transfer response', e.data);
			ctx.putImageData(e.data, 0, 0);
			console.timeEnd('transfer');

			done();
			bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	//TODO
	it.skip('WebGL shaders', function(){

	});


	// URL.revokeObjectURL( blobURL );
});
