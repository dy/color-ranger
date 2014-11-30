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
function createRangeCase(str){
	var bg = document.createElement('div');
	bg.className = 'range-case';

	bg.setAttribute('data-channel', str || '');

	if (/v-/.test(str)) bg.className += ' vertical-case';
	else if (/p-/.test(str)) bg.className += ' polar-case';
	else if (/-/.test(str)) bg.className += ' rect-case';

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


describe('direction', function(){
	before(function(){
		createSection(this.test.parent.title);
	});

	it('[x]', function(){
		ranger.renderRect(color.rgbArray(), 'hsl', [0], [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('only-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('[null, y]', function(){
		ranger.renderRect(color.rgbArray(), 'hsl', [null, 0], [0,0], [null, 360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('only-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('[x,y]', function(){
		ranger.renderRect(color.rgbArray(), 'hsl', [0, 1], [0,0], [360, 100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('x-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
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

		createRangeCase('red-alpha').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
	});
	it('hue-alpha', function(){
		ranger.renderRect(color.rgbaArray(), 'hsl', [0,3], [0,0], [360,255], data);
		ctx.putImageData(data, 0, 0);

		createRangeCase('hue-alpha').style.background = 'url(' + cnv.toDataURL() + ') no-repeat 0 0 / cover, ' + gridBg;
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
			createRangeCase('v-hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('whiteness', function(){
			ranger.renderRect(color.rgbArray(), 'hwb', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-whiteness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blackness', function(){
			ranger.renderRect(color.rgbArray(), 'hwb', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-blackness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [null, 0], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [null, 1], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [null, 2], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [null, 3], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [null, 0], [null, 0], [null, 95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [null, 2], [null, 0], [null, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('v', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-lυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('v-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
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
			createRangeCase('h-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [0,2], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturation', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [0,1], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturationv', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [0,1], [0,0], [360, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-sv').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation-lightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsl', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation-brightness', function(){
			ranger.renderRect(color.rgbArray(), 'hsv', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [0,1], [0,0], [255,255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-g').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('red-blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [0,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green-blue', function(){
			ranger.renderRect(color.rgbArray(), 'rgb', [1,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('g-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-m').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [0,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-yellow', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [1,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow-black', function(){
			ranger.renderRect(color.rgbArray(), 'cmyk', [2,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [0,1], [0,0], [95.047,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('x-z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [0,2], [0,0], [95.047,108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y-z', function(){
			ranger.renderRect(color.rgbArray(), 'xyz', [1,2], [0,0], [100, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a-b', function(){
			ranger.renderRect(color.rgbArray(), 'lab', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-c', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [0,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c-h', function(){
			ranger.renderRect(color.rgbArray(), 'lchab', [1,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-v', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u-v', function(){
			ranger.renderRect(color.rgbArray(), 'luv', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-cυν', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-hυν', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [0,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c-hυν', function(){
			ranger.renderRect(color.rgbArray(), 'lchuv', [1,2], [0,0], [100,360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			ranger.renderRect(color.rgbArray(), 'husl', [0,1], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hs').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-hl', function(){
			ranger.renderRect(color.rgbArray(), 'husl', [0,2], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-sl', function(){
			ranger.renderRect(color.rgbArray(), 'husl', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-sl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});


		it('huslp-hs', function(){
			ranger.renderRect(color.rgbArray(), 'huslp', [0,1], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hs').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-hl', function(){
			ranger.renderRect(color.rgbArray(), 'huslp', [0,2], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-sl', function(){
			ranger.renderRect(color.rgbArray(), 'huslp', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-sl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
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
			createRangeCase('p-hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [0], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [1], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [2], [0], [255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [3], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [0], [0], [95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [2], [0], [108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [1], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [2], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [2], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [1], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [2], [-100], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [0], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-lυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [2], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hue', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [0], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-sat', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-l', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});


		it('huslp-hue', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [0], [0], [360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-sat', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [1], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-l', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [2], [0], [100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
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
			createRangeCase('p-hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [null, 0], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [null, 1], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [null, 2], [null, 0], [null, 255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [null, 3], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [null, 0], [null, 0], [null, 95.047], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-x').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [null, 2], [null, 0], [null, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-L').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [null, 2], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [null, 0], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-lυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('c(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [null, 1], [null, 0], [null, 100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-cυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h(uv)', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [null, 2], [null, 0], [null, 360], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('p-hυν').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
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
			createRangeCase('h-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [0,2], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [0,1], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('hue-saturationv', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [0,1], [0,100], [360, 0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('h-sv').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('lightness-saturation', function(){
			ranger.renderPolar(color.rgbArray(), 'hsl', [2,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('saturation-brightness', function(){
			ranger.renderPolar(color.rgbArray(), 'hsv', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('s-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [0,1], [0,0], [255,255], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-g').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('red-blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [0,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('r-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('green-blue', function(){
			ranger.renderPolar(color.rgbArray(), 'rgb', [1,2], [0,0], [255,255],  data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('g-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-m').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('cyan-black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [0,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-yellow', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('magenta-black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [1,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('m-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('yellow-black', function(){
			ranger.renderPolar(color.rgbArray(), 'cmyk', [2,3], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [0,1], [0,0], [95.047,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('x-z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [0,2], [0,0], [95.047,108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('x-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('y-z', function(){
			ranger.renderPolar(color.rgbArray(), 'xyz', [1,2], [0,0], [100, 108.883], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('y-z').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-a').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('a-b', function(){
			ranger.renderPolar(color.rgbArray(), 'lab', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('a-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-l', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [2,0], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-c', function(){
			ranger.renderPolar(color.rgbArray(), 'lchab', [2,1], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [0,1], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-u').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('l-v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [0,2], [0,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('u-v', function(){
			ranger.renderPolar(color.rgbArray(), 'luv', [1,2], [-100,-100], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('u-v').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});

		it('l-cuv', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [0,1], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-c').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-luv', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [2,0], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('l-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('h-cuv', function(){
			ranger.renderPolar(color.rgbArray(), 'lchuv', [2,1], [0,100], [360,0], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('c-h').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});

	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [0,1], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hs').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-hl', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [0,2], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-hl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('husl-sl', function(){
			ranger.renderPolar(color.rgbArray(), 'husl', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('husl-sl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});


		it('huslp-hs', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [0,1], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hs').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-hl', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [0,2], [0,0], [360,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-hl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
		it('huslp-sl', function(){
			ranger.renderPolar(color.rgbArray(), 'huslp', [1,2], [0,0], [100,100], data);
			ctx.putImageData(data, 0, 0);
			createRangeCase('huslp-sl').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
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
		var bg = createRangeCase('no-webworker')

		console.time('no-webworker');
		ranger.renderRect(color.rgbArray(), 'lchab', [0,2], [0,0], [100,360], data);
		ctx.putImageData(data, 0, 0);
		console.timeEnd('no-webworker');

		bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});


	it('webworker clone', function(done){
		var bg = createRangeCase('webworker-clone');

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
