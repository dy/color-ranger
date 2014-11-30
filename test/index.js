/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var ranger = require('../');
var Emmy = require('emmy');
var convert = require('color-space');


var demo = document.getElementById('demo');

//create range case
function createRangeCase(str, type){
	var bg = document.createElement('div');
	bg.className = 'range-case';

	bg.setAttribute('data-channel', str || '');
	bg.title = str;

	if (type) {
		bg.className += ' ' + type;
	}

	demo.appendChild(bg);

	return bg;
}


function createSection(str){
	var title = document.createElement('h2');
	title.innerHTML = str;
	demo.appendChild(title);
}


//virtual canvas
var cnv = document.createElement('canvas');
cnv.width = 101//37;
cnv.height = 101//37;
var ctx = cnv.getContext('2d');
var data = ctx.getImageData(0,0,cnv.width,cnv.height);

//color to take as a basis
var color = new Color('red');


describe('axis', function(){
	before(function(){
		createSection(this.test.parent.title);
	});

	it('[x]', function(){
		ranger.renderRect(color.rgbArray(), 'hsl', [0], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('[null, y]', function(){
		ranger.renderRect(color.rgbArray(), 'hsl', [null, 0], [0,0], [null, 360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('[x,y]', function(){
		ranger.renderRect(color.rgbArray(), 'hsl', [0, 1], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-y', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('alpha', function(){
	var gridBg;

	before(function(){
		createSection(this.test.parent.title);


		//render grid
		var iw = cnv.width, ih = cnv.height;

		cnv.width = 12; cnv.height = 12;
		var gridData = ctx.getImageData(0,0,cnv.width,cnv.height);
		ctx.putImageData(ranger.renderGrid([120,120,120,.4], [0,0,0,0], gridData), 0, 0);

		gridBg = 'url(' + cnv.toDataURL() + ')';

		cnv.width = iw; cnv.height = ih;
	});

	it('alpha', function(){
		ranger.renderRect(color.rgbaArray(), 'rgb', [3], [0], [255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('alpha').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
	it('red-alpha', function(){
		ranger.renderRect(color.rgbaArray(), 'rgb', [0,3], [0,0], [255,255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('red-alpha', 'rect').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
	it('hue-alpha', function(){
		ranger.renderRect(color.rgbaArray(), 'hsl', [0,3], [0,0], [360,255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('hue-alpha', 'rect').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
});


describe('horizontal',function(){
	before(function(){
			createSection(this.test.parent.title);
		});
	describe('hsl, hsv, hwb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('hue', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [0], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [0], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [1], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [2], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [3], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [0], [0], [95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [2], [0], [108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [1], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [2], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [2], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('υ', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [1], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('ν', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [2], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [2], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});
});



describe('vertical',function(){
	before(function(){
			createSection(this.test.parent.title);
		});
	describe('hsl, hsb, hsw', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('hue', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [null, 0], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hue', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('saturation', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lightness', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('brightness', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('whiteness', function(){
			ranger.renderRect(color.rgbArray(), 'hwb', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('whiteness', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blackness', function(){
			ranger.renderRect(color.rgbArray(), 'hwb', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('blackness', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [null, 0], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('red', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [null, 1], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('green', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [null, 2], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('blue', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cyan', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('magenta', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('yellow', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 3], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('black', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [null, 0], [null, 0], [null, 95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [null, 2], [null, 0], [null, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('z', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('b', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('v', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h', 'vertical').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});
});


describe('rectangular', function(){
	before(function(){
			createSection(this.test.parent.title);
		});
	describe('hsl, hsv, hwb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('hue-lightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [0, 2], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-l', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [0,2], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-b', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturation', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [0,1], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-s', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturationv', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [0,1], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-sv', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation-lightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s-l', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation-brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s-b', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [0,1], [0,0], [255,255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-g', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('red-blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [0,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-b', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green-blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [1,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('g-b', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-m', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-y', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-k', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-y', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [1,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-k', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow-black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [2,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-k', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [0,1], [0,0], [95.047,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-y', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('x-z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [0,2], [0,0], [95.047,108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-z', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y-z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [1,2], [0,0], [100, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-z', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-a', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-b', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a-b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a-b', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-c', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-c', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [0,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-h', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c-h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [1,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-h', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-u', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-v', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-v', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u-v', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u-v', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-cυν', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-cυν', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-hυν', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [0,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-hυν', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c-hυν', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [1,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-hυν', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			ranger.renderRect(color.rgbArray(), 'husl', [0,1], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hs', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-hl', function(){
			ranger.renderRect(color.rgbArray(), 'husl', [0,2], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hl', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-sl', function(){
			ranger.renderRect(color.rgbArray(), 'husl', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-sl', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});


		it('huslp-hs', function(){
			ranger.renderRect(color.rgbArray(), 'huslp', [0,1], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hs', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-hl', function(){
			ranger.renderRect(color.rgbArray(), 'huslp', [0,2], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hl', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-sl', function(){
			ranger.renderRect(color.rgbArray(), 'huslp', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-sl', 'rect').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});
});




describe('conical', function(){
	before(function(){
		createSection(this.test.parent.title);
	});

	describe('hsl, hsv, hwb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('hue', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [0], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hue', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('saturation', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lightness', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('brightness', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [0], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('red', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [1], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('green', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [2], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('blue', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cyan', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('magenta', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('yellow', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [3], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('black', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [0], [0], [95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [2], [0], [108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('z', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [1], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [2], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [2], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [1], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [2], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lυν', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cυν', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [2], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hυν', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hue', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [0], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-sat', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-l', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});


		it('huslp-hue', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [0], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-sat', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-l', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});
});


describe('radial', function(){
	before(function(){
			createSection(this.test.parent.title);
		});

	describe('hsl, hsv, hwb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('hue', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [null, 0], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hue', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('saturation', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lightness', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('brightness', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [null, 0], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('red', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [null, 1], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('green', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [null, 2], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('blue', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cyan', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('magenta', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('yellow', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 3], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('black', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [null, 0], [null, 0], [null, 95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [null, 2], [null, 0], [null, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('z', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('L', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('lυν', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('cυν', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('hυν', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});
});



describe('polar', function(){
	before(function(){
			createSection(this.test.parent.title);
		});

	describe('hsl, hsv, hwb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('hue-lightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [0, 2], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-l', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [0,2], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [0,1], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-s', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturationv', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [0,1], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-sv', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness-saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [2,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-s', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation-brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s-b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [0,1], [0,0], [255,255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-g', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('red-blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [0,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green-blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [1,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('g-b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-m', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-y', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-k', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-y', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [1,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-k', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow-black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [2,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-k', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [0,1], [0,0], [95.047,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-y', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('x-z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [0,2], [0,0], [95.047,108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-z', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y-z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [1,2], [0,0], [100, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-z', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-a', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a-b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a-b', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-c', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-l', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [2,0], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [2,1], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-u', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-v', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u-v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u-v', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-cuv', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-c', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-luv', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [2,0], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-cuv', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [2,1], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-h', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [0,1], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hs', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-hl', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [0,2], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hl', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-sl', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-sl', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});


		it('huslp-hs', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [0,1], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hs', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-hl', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [0,2], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hl', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-sl', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-sl', 'polar').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});
});



describe('performance', function(){
	before(function(){
			createSection(this.test.parent.title);
		});
	var worker;


	//hook up worker
	before(function(done){
		console.time('create-webworker');

		worker = ranger.getWorker(convert);

		worker.postMessage('');
		Emmy.one(worker, 'message', function(){
			done();
			console.timeEnd('create-webworker');
		});
	});


	it('no-webworker', function(){
		var bg = createRangeCase('no-webworker', 'rect')

		console.time('no-webworker');
		ranger.renderRect(color.rgbArray(), 'lchab', [0,2], [0,0], [100,360], data);
		ctx.putImageData(data, 0, 0);
		console.timeEnd('no-webworker');

		bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});


	it('webworker clone', function(done){
		var bg = createRangeCase('webworker-clone', 'rect');

		//listen for response
		Emmy.on(worker, 'message', function(e){
			if (e.data.id !== 1) return;
			console.timeEnd('webworker-clone');

			ctx.putImageData(e.data.data, 0, 0);

			done();
			bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		//send request
		console.time('webworker-clone');
		worker.postMessage({rgb: color.rgbArray(), space: 'lchab', channel: [0,2], max: [100, 360], data: data, min:[0,0], id: 1});
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
	it.skip('webGL shaders', function(){

	});
});
