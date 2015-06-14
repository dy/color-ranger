/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var render = require('../');
var on = require('emmy/on');
var once = require('emmy/once');
var spaces = require('color-space');


//detect browser
var doc = typeof document === 'undefined' ? null : document;

//get data - browser case
if (doc) {
	var demo = document.getElementById('demo');

	//virtual canvas
	var cnv = document.createElement('canvas');
	cnv.width = 101;
	cnv.height = 101;
	var ctx = cnv.getContext('2d');
	var imageData = ctx.getImageData(0,0,cnv.width,cnv.height);
	var data = imageData.data;
}
//node case
else {
	var data = new Uint8ClampedArray(101*101*4);
}

//color to take as a basis
var color = new Color('red');


//create range case
function createRangeCase(str, type, buffer){
	if (!doc) return;

	var bg = document.createElement('div');
	bg.className = 'range-case';

	bg.setAttribute('data-channel', str || '');
	bg.title = str;

	if (type) {
		bg.className += ' ' + type;
	}

	imageData.data = buffer;
	ctx.putImageData(imageData, 0, 0);

	bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';

	demo.appendChild(bg);

	return bg;
}


function createSection(str){
	if (!doc) return;

	var title = document.createElement('h2');
	title.innerHTML = str;
	demo.appendChild(title);
}


describe('axis', function(){
	before(function(){
		createSection(this.test.parent.title);
	});

	it('[x]', function(){
		var opts = {
				space: 'hsl', channel: [0], min: [0], max: [360]
			};
		createRangeCase('x',
			'horizontal',
			render(color.rgbArray(), data, opts)
		);
	});

	it('[null, y]', function(){
		var opts = {
			space: 'hsl',
			channel: [null, 0],
			min: [0,0],
			max: [null, 360]
		};
		createRangeCase('y', 'vertical', render(color.rgbArray(), data, opts));
	});

	it('[x,y]', function(){
		var opts = {
			space: 'hsl',
			channel: [0, 1],
			min: [0,0],
			max: [360, 100]
		};
		createRangeCase('x-y', 'rect', render(color.rgbArray(), data, opts));
	});
});


describe('alpha', function(){
	var gridBg;

	if (!doc) return;

	before(function(){
		createSection(this.test.parent.title);

		//render grid
		var iw = cnv.width, ih = cnv.height;

		cnv.width = 12; cnv.height = 12;
		var gridData = ctx.getImageData(0,0,cnv.width,cnv.height);
		gridData.data = render.chess([120,120,120,.4], [0,0,0,0], gridData.data);

		ctx.putImageData(gridData, 0, 0);

		gridBg = 'url(' + cnv.toDataURL() + ')';

		cnv.width = iw; cnv.height = ih;
	});

	it('alpha', function(){
		var opts = {
			channel: [3]
		};
		var bg = createRangeCase('alpha', 'horizontal', render(color.rgbaArray(), data, opts));
		bg.style.background = bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
	});
	it('red-alpha', function(){
		var opts = {
			channel: [0,3]
		};
		var bg = createRangeCase('red-alpha', 'rect', render(color.rgbaArray(), data, opts));
		bg.style.background = bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
	});
	it('hue-alpha', function(){
		var opts = {
			space: 'hsl', channel: [0,3], max:[360,255]
		};
		var bg = createRangeCase('hue-alpha', 'rect', render(color.rgbaArray(), data, opts));
		bg.style.background = bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
	});
	it('lightness-alpha', function(){
		var opts = {
			space: 'luv', channel: [3,0],
			min: [255, 0],
			max:[0,100],
			type: 'polar'
		};
		var bg = createRangeCase('lightness-alpha', 'polar', render(color.rgbaArray(), data, opts));
		bg.style.background = bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
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

			var opts = { space: 'hsl', channel: [0], min: [0], max: [360]};
			createRangeCase('hue', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('saturation', function(){

			var opts = { space: 'hsl', channel: [1], min: [0], max: [100]};
			createRangeCase('saturation', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('lightness', function(){

			var opts = { space: 'hsl', channel: [2], min: [0], max: [100]};
			createRangeCase('lightness', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('brightness', function(){

			var opts = { space: 'hsv', channel: [2], min: [0], max: [100]};
			createRangeCase('brightness', 'horizontal', render(color.rgbArray(), data, opts));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){

			var opts = { space: 'rgb', channel: [0], min: [0], max: [255]};
			createRangeCase('red', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('green', function(){

			var opts = { space: 'rgb', channel: [1], min: [0], max: [255]};
			createRangeCase('green', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('blue', function(){

			var opts = { space: 'rgb', channel: [2], min: [0], max: [255]};
			createRangeCase('blue', 'horizontal', render(color.rgbArray(), data, opts));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){

			var opts = { space: 'cmyk', channel: [0], min: [0], max: [100]};
			createRangeCase('cyan', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('magenta', function(){

			var opts = { space: 'cmyk', channel: [1], min: [0], max: [100]};
			createRangeCase('magenta', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('yellow', function(){

			var opts = { space: 'cmyk', channel: [2], min: [0], max: [100]};
			createRangeCase('yellow', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('black', function(){

			var opts = { space: 'cmyk', channel: [3], min: [0], max: [100]};
			createRangeCase('black', 'horizontal', render(color.rgbArray(), data, opts));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){

			var opts = { space: 'xyz', channel: [0], min: [0], max: [95]};
			createRangeCase('x', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('y', function(){

			var opts = { space: 'xyz', channel: [1], min: [0], max: [100]};
			createRangeCase('y', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('z', function(){

			var opts = { space: 'xyz', channel: [2], min: [0], max: [109]};
			createRangeCase('z', 'horizontal', render(color.rgbArray(), data, opts));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){

			var opts = { space: 'lab', channel: [0], min: [0], max: [100]};
			createRangeCase('L', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('a', function(){

			var opts = { space: 'lab', channel: [1], min: [-100], max: [100]};
			createRangeCase('a', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('b', function(){

			var opts = { space: 'lab', channel: [2], min: [-100], max: [100]};
			createRangeCase('b', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('l', function(){

			var opts = { space: 'lchab', channel: [0], min: [0], max: [100]};
			createRangeCase('l', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('c', function(){

			var opts = { space: 'lchab', channel: [1], min: [0], max: [100]};
			createRangeCase('c', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('h', function(){

			var opts = { space: 'lchab', channel: [2], min: [0], max: [360]};
			createRangeCase('h', 'horizontal', render(color.rgbArray(), data, opts));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){

			var opts = { space: 'luv', channel: [0], min: [0], max: [100]};
			createRangeCase('L', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('υ', function(){

			var opts = { space: 'luv', channel: [1], min: [-100], max: [100]};
			createRangeCase('u', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('ν', function(){

			var opts = { space: 'luv', channel: [2], min: [-100], max: [100]};
			createRangeCase('v', 'horizontal', render(color.rgbArray(), data, opts));
		});

		it('l(uv)', function(){

			var opts = { space: 'lchuv', channel: [0], min: [0], max: [100]};
			createRangeCase('lυν', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('c(uv)', function(){

			var opts = { space: 'lchuv', channel: [1], min: [0], max: [100]};
			createRangeCase('cυν', 'horizontal', render(color.rgbArray(), data, opts));
		});
		it('h(uv)', function(){

			var opts = { space: 'lchuv', channel: [2], min: [0], max: [360]};
			createRangeCase('hυν', 'horizontal', render(color.rgbArray(), data, opts));
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
			var opts = {
			 space: 'hsl', channel: [null, 0], min: [null, 0], max: [null, 360]};
			 createRangeCase('hue', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('saturation', function(){
			var opts = {
			 space: 'hsl', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('saturation', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('lightness', function(){
			var opts = {
			 space: 'hsl', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('lightness', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('brightness', function(){
			var opts = {
			 space: 'hsv', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('brightness', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('whiteness', function(){
			var opts = {
			 space: 'hwb', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('whiteness', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('blackness', function(){
			var opts = {
			 space: 'hwb', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('blackness', 'vertical', render(color.rgbArray(),data, opts));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			var opts = {
			 space: 'rgb', channel: [null, 0], min: [null, 0], max: [null, 255]};
			 createRangeCase('red', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('green', function(){
			var opts = {
			 space: 'rgb', channel: [null, 1], min: [null, 0], max: [null, 255]};
			 createRangeCase('green', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('blue', function(){
			var opts = {
			 space: 'rgb', channel: [null, 2], min: [null, 0], max: [null, 255]};
			 createRangeCase('blue', 'vertical', render(color.rgbArray(),data, opts));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('cyan', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('magenta', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('magenta', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('yellow', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('yellow', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('black', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 3], min: [null, 0], max: [null, 100]};
			 createRangeCase('black', 'vertical', render(color.rgbArray(),data, opts));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			var opts = {
			 space: 'xyz', channel: [null, 0], min: [null, 0], max: [null, 95]};
			 createRangeCase('x', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('y', function(){
			var opts = {
			 space: 'xyz', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('y', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('z', function(){
			var opts = {
			 space: 'xyz', channel: [null, 2], min: [null, 0], max: [null, 109]};
			 createRangeCase('z', 'vertical', render(color.rgbArray(),data, opts));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			var opts = {
			 space: 'lab', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('L', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('a', function(){
			var opts = {
			 space: 'lab', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('a', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('b', function(){
			var opts = {
			 space: 'lab', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('b', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('l', function(){
			var opts = {
			 space: 'lchab', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('l', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('c', function(){
			var opts = {
			 space: 'lchab', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('c', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('h', function(){
			var opts = {
			 space: 'lchab', channel: [null, 2], min: [null, 0], max: [null, 360]};
			 createRangeCase('h', 'vertical', render(color.rgbArray(),data, opts));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			var opts = {
			 space: 'luv', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('L', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('u', function(){
			var opts = {
			 space: 'luv', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('u', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('v', function(){
			var opts = {
			 space: 'luv', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('v', 'vertical', render(color.rgbArray(),data, opts));
		});

		it('l(uv)', function(){
			var opts = {
			 space: 'lchuv', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('l', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('c(uv)', function(){
			var opts = {
			 space: 'lchuv', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('c', 'vertical', render(color.rgbArray(),data, opts));
		});
		it('h(uv)', function(){
			var opts = {
			 space: 'lchuv', channel: [null, 2], min: [null, 0], max: [null, 360]};
			 createRangeCase('h', 'vertical', render(color.rgbArray(),data, opts));
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
			var opts = {space: 'hsl', channel:[0, 2],min: [0,0],max: [360, 100]};
			createRangeCase('h-l', 'rect', render(color.rgbArray(), data, opts));
		});

		it('hue-brightness', function(){
			var opts = {space: 'hsv', channel:[0,2], min:[0,0], max:[360, 100]};
			createRangeCase('h-b', 'rect', render(color.rgbArray(), data, opts));
		});

		it('hue-saturation', function(){
			var opts = {space: 'hsl', channel:[0,1], min:[0,0], max:[360, 100]};
			createRangeCase('h-s', 'rect', render(color.rgbArray(), data, opts));
		});

		it('hue-saturationv', function(){
			var opts = {space: 'hsv', channel:[0,1], min:[0,0], max:[360, 100]};
			createRangeCase('h-sv', 'rect', render(color.rgbArray(), data, opts));
		});

		it('saturation-lightness', function(){
			var opts = {space: 'hsl', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('s-l', 'rect', render(color.rgbArray(), data, opts));
		});

		it('saturation-brightness', function(){
			var opts = {space: 'hsv', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('s-b', 'rect', render(color.rgbArray(), data, opts));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			var opts = {space: 'rgb', channel:[0,1], min:[0,0], max:[255,255]};
			createRangeCase('r-g', 'rect', render(color.rgbArray(), data, opts));
		});

		it('red-blue', function(){
			var opts = {space: 'rgb', channel:[0,2], min:[0,0], max:[255,255]};
			createRangeCase('r-b', 'rect', render(color.rgbArray(),  data, opts));
		});

		it('green-blue', function(){
			var opts = {space: 'rgb', channel:[1,2], min:[0,0], max:[255,255]};
			createRangeCase('g-b', 'rect', render(color.rgbArray(),  data, opts));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			var opts = {space: 'cmyk', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('c-m', 'rect', render(color.rgbArray(), data, opts));
		});

		it('cyan-yellow', function(){
			var opts = {space: 'cmyk', channel:[0,2], min:[0,0], max:[100,100]};
			createRangeCase('c-y', 'rect', render(color.rgbArray(), data, opts));
		});

		it('cyan-black', function(){
			var opts = {space: 'cmyk', channel:[0,3], min:[0,0], max:[100,100]};
			createRangeCase('c-k', 'rect', render(color.rgbArray(), data, opts));
		});

		it('magenta-yellow', function(){
			var opts = {space: 'cmyk', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('m-y', 'rect', render(color.rgbArray(), data, opts));
		});

		it('magenta-black', function(){
			var opts = {space: 'cmyk', channel:[1,3], min:[0,0], max:[100,100]};
			createRangeCase('m-k', 'rect', render(color.rgbArray(), data, opts));
		});

		it('yellow-black', function(){
			var opts = {space: 'cmyk', channel:[2,3], min:[0,0], max:[100,100]};
			createRangeCase('y-k', 'rect', render(color.rgbArray(), data, opts));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			var opts = {space: 'xyz', channel:[0,1], min:[0,0], max:[95,100]};
			createRangeCase('x-y', 'rect', render(color.rgbArray(), data, opts));
		});
		it('x-z', function(){
			var opts = {space: 'xyz', channel:[0,2], min:[0,0], max:[95,109]};
			createRangeCase('x-z', 'rect', render(color.rgbArray(), data, opts));
		});
		it('y-z', function(){
			var opts = {space: 'xyz', channel:[1,2], min:[0,0], max:[100, 109]};
			createRangeCase('y-z', 'rect', render(color.rgbArray(), data, opts));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			var opts = {space: 'lab', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-a', 'rect', render(color.rgbArray(), data, opts));
		});
		it('l-b', function(){
			var opts = {space: 'lab', channel:[0,2], min:[0,-100], max:[100,100]};
			createRangeCase('l-b', 'rect', render(color.rgbArray(), data, opts));
		});
		it('a-b', function(){
			var opts = {space: 'lab', channel:[1,2], min:[-100,-100], max:[100,100]};
			createRangeCase('a-b', 'rect', render(color.rgbArray(), data, opts));
		});

		it('l-c', function(){
			var opts = {space: 'lchab', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('l-c', 'rect', render(color.rgbArray(), data, opts));
		});
		it('l-h', function(){
			var opts = {space: 'lchab', channel:[0,2], min:[0,0], max:[100,360]};
			createRangeCase('l-h', 'rect', render(color.rgbArray(), data, opts));
		});
		it('c-h', function(){
			var opts = {space: 'lchab', channel:[1,2], min:[0,0], max:[100,360]};
			createRangeCase('c-h', 'rect', render(color.rgbArray(), data, opts));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			var opts = {space: 'luv', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-u', 'rect', render(color.rgbArray(), data, opts));
		});
		it('l-v', function(){
			var opts = {space: 'luv', channel:[0,2], min:[0,-100], max:[100,100]};
			createRangeCase('l-v', 'rect', render(color.rgbArray(), data, opts));
		});
		it('u-v', function(){
			var opts = {space: 'luv', channel: [1,2], min: [-100,-100], max:[100,100]};
			createRangeCase('u-v', 'rect', render(color.rgbArray(), data, opts));
		});

		it('l-cυν', function(){
			var opts = {space: 'lchuv', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('l-cυν', 'rect', render(color.rgbArray(), data, opts));
		});
		it('l-hυν', function(){
			var opts = {space: 'lchuv', channel:[0,2], min:[0,0], max:[100,360]};
			createRangeCase('l-hυν', 'rect', render(color.rgbArray(), data, opts));
		});
		it('c-hυν', function(){
			var opts = {space: 'lchuv', channel:[1,2], min:[0,0], max:[100,360]};
			createRangeCase('c-hυν', 'rect', render(color.rgbArray(), data, opts));
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			var opts = {space: 'husl', channel:[0,1], min:[0,0], max:[360,100]};
			createRangeCase('husl-hs', 'rect', render(color.rgbArray(), data, opts));
		});
		it('husl-hl', function(){
			var opts = {space: 'husl', channel:[0,2], min:[0,0], max:[360,100]};
			createRangeCase('husl-hl', 'rect', render(color.rgbArray(), data, opts));
		});
		it('husl-sl', function(){
			var opts = {space: 'husl', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('husl-sl', 'rect', render(color.rgbArray(), data, opts));
		});


		it('huslp-hs', function(){
			var opts = {space: 'huslp', channel:[0,1], min:[0,0], max:[360,100]};
			createRangeCase('huslp-hs', 'rect', render(color.rgbArray(), data, opts));
		});
		it('huslp-hl', function(){
			var opts = {space: 'huslp', channel:[0,2], min:[0,0], max:[360,100]};
			createRangeCase('huslp-hl', 'rect', render(color.rgbArray(), data, opts));
		});
		it('huslp-sl', function(){
			var opts = {space: 'huslp', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('huslp-sl', 'rect', render(color.rgbArray(), data, opts));
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
			var opts = {space:'hsl', channel:[0],min: [0], max:[360], type:'polar'};
			createRangeCase('hue', 'polar', render(color.rgbArray(), data, opts));
		});

		it('saturation', function(){
			var opts = {space:'hsl', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('saturation', 'polar', render(color.rgbArray(), data, opts));
		});

		it('lightness', function(){
			var opts = {space:'hsl', channel:[2],min: [0], max:[100], type:'polar'};
			createRangeCase('lightness', 'polar', render(color.rgbArray(), data, opts));
		});

		it('brightness', function(){
			var opts = {space:'hsv', channel:[2],min: [0], max:[100], type:'polar'};
			createRangeCase('brightness', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			var opts = {space:'rgb', channel:[0],min: [0], max:[255], type:'polar'};
			createRangeCase('red', 'polar', render(color.rgbArray(), data, opts));
		});

		it('green', function(){
			var opts = {space:'rgb', channel:[1],min: [0], max:[255], type:'polar'};
			createRangeCase('green', 'polar', render(color.rgbArray(), data, opts));
		});

		it('blue', function(){
			var opts = {space:'rgb', channel:[2],min: [0], max:[255], type:'polar'};
			createRangeCase('blue', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			var opts = {space:'cmyk', channel:[0],min: [0], max:[100], type:'polar'};
			createRangeCase('cyan', 'polar', render(color.rgbArray(), data, opts));
		});

		it('magenta', function(){
			var opts = {space:'cmyk', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('magenta', 'polar', render(color.rgbArray(), data, opts));
		});

		it('yellow', function(){
			var opts = {space:'cmyk', channel:[2],min: [0], max:[100], type:'polar'};
			createRangeCase('yellow', 'polar', render(color.rgbArray(), data, opts));
		});

		it('black', function(){
			var opts = {space:'cmyk', channel:[3],min: [0], max:[100], type:'polar'};
			createRangeCase('black', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			var opts = {space:'xyz', channel:[0],min: [0], max:[95], type:'polar'};
			createRangeCase('x', 'polar', render(color.rgbArray(), data, opts));
		});
		it('y', function(){
			var opts = {space:'xyz', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('y', 'polar', render(color.rgbArray(), data, opts));
		});
		it('z', function(){
			var opts = {space:'xyz', channel:[2],min: [0], max:[109], type:'polar'};
			createRangeCase('z', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			var opts = {space:'lab', channel:[0],min: [0], max:[100], type:'polar'};
			createRangeCase('L', 'polar', render(color.rgbArray(), data, opts));
		});
		it('a', function(){
			var opts = {space:'lab', channel:[1], min:[-100], max:[100], type:'polar'};
			createRangeCase('a', 'polar', render(color.rgbArray(), data, opts));
		});
		it('b', function(){
			var opts = {space:'lab', channel:[2], min:[-100], max:[100], type:'polar'};
			createRangeCase('b', 'polar', render(color.rgbArray(), data, opts));
		});

		it('l', function(){
			var opts = {space:'lchab', channel:[0],min: [0], max:[100], type:'polar'};
			createRangeCase('l', 'polar', render(color.rgbArray(), data, opts));
		});
		it('c', function(){
			var opts = {space:'lchab', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('c', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h', function(){
			var opts = {space:'lchab', channel:[2],min: [0], max:[360], type:'polar'};
			createRangeCase('h', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			var opts = {space:'luv', channel:[0],min: [0], max:[100], type:'polar'};
			createRangeCase('L', 'polar', render(color.rgbArray(), data, opts));
		});
		it('u', function(){
			var opts = {space:'luv', channel:[1], min:[-100], max:[100], type:'polar'};
			createRangeCase('u', 'polar', render(color.rgbArray(), data, opts));
		});
		it('v', function(){
			var opts = {space:'luv', channel:[2], min:[-100], max:[100], type:'polar'};
			createRangeCase('v', 'polar', render(color.rgbArray(), data, opts));
		});

		it('l(uv)', function(){
			var opts = {space:'lchuv', channel:[0],min: [0], max:[100], type:'polar'};
			createRangeCase('lυν', 'polar', render(color.rgbArray(), data, opts));
		});
		it('c(uv)', function(){
			var opts = {space:'lchuv', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('cυν', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h(uv)', function(){
			var opts = {space:'lchuv', channel:[2],min: [0], max:[360], type:'polar'};
			createRangeCase('hυν', 'polar', render(color.rgbArray(), data, opts));
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hue', function(){
			var opts = {space:'husl', channel:[0],min: [0], max:[360], type:'polar'};
			createRangeCase('h', 'polar', render(color.rgbArray(), data, opts));
		});
		it('husl-sat', function(){
			var opts = {space:'husl', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('s', 'polar', render(color.rgbArray(), data, opts));
		});
		it('husl-l', function(){
			var opts = {space:'husl', channel:[2],min: [0], max:[100], type:'polar'};
			createRangeCase('l', 'polar', render(color.rgbArray(), data, opts));
		});


		it('huslp-hue', function(){
			var opts = {space:'huslp', channel:[0],min: [0], max:[360], type:'polar'};
			createRangeCase('h', 'polar', render(color.rgbArray(), data, opts));
		});
		it('huslp-sat', function(){
			var opts = {space:'huslp', channel:[1],min: [0], max:[100], type:'polar'};
			createRangeCase('s', 'polar', render(color.rgbArray(), data, opts));
		});
		it('huslp-l', function(){
			var opts = {space:'huslp', channel:[2],min: [0], max:[100], type: 'polar'};
			createRangeCase('l', 'polar', render(color.rgbArray(), data, opts));
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
			var opts = {space:'hsl', channel:[null, 0], min:[null, 0], max:[null, 360], type: 'polar'};
			createRangeCase('hue', 'polar', render(color.rgbArray(), data, opts));
		});

		it('saturation', function(){
			var opts = {space:'hsl', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('saturation', 'polar', render(color.rgbArray(), data, opts));
		});

		it('lightness', function(){
			var opts = {space:'hsl', channel:[null, 2], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('lightness', 'polar', render(color.rgbArray(), data, opts));
		});

		it('brightness', function(){
			var opts = {space:'hsv', channel:[null, 2], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('brightness', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			var opts = {space:'rgb', channel:[null, 0], min:[null, 0], max:[null, 255], type: 'polar'};
			createRangeCase('red', 'polar', render(color.rgbArray(), data, opts));
		});

		it('green', function(){
			var opts = {space:'rgb', channel:[null, 1], min:[null, 0], max:[null, 255], type: 'polar'};
			createRangeCase('green', 'polar', render(color.rgbArray(), data, opts));
		});

		it('blue', function(){
			var opts = {space:'rgb', channel:[null, 2], min:[null, 0], max:[null, 255], type: 'polar'};
			createRangeCase('blue', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			var opts = {space:'cmyk', channel:[null, 0], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('cyan', 'polar', render(color.rgbArray(), data, opts));
		});

		it('magenta', function(){
			var opts = {space:'cmyk', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('magenta', 'polar', render(color.rgbArray(), data, opts));
		});

		it('yellow', function(){
			var opts = {space:'cmyk', channel:[null, 2], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('yellow', 'polar', render(color.rgbArray(), data, opts));
		});

		it('black', function(){
			var opts = {space:'cmyk', channel:[null, 3], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('black', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			var opts = {space:'xyz', channel:[null, 0], min:[null, 0], max:[null, 95], type: 'polar'};
			createRangeCase('x', 'polar', render(color.rgbArray(), data, opts));
		});
		it('y', function(){
			var opts = {space:'xyz', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('y', 'polar', render(color.rgbArray(), data, opts));
		});
		it('z', function(){
			var opts = {space:'xyz', channel:[null, 2], min:[null, 0], max:[null, 109], type: 'polar'};
			createRangeCase('z', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			var opts = {space:'lab', channel:[null, 0], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('L', 'polar', render(color.rgbArray(), data, opts));
		});
		it('a', function(){
			var opts = {space:'lab', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('a', 'polar', render(color.rgbArray(), data, opts));
		});
		it('b', function(){
			var opts = {space:'lab', channel:[null, 2], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('b', 'polar', render(color.rgbArray(), data, opts));
		});

		it('l', function(){
			var opts = {space:'lchab', channel:[null, 0], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('l', 'polar', render(color.rgbArray(), data, opts));
		});
		it('c', function(){
			var opts = {space:'lchab', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('c', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h', function(){
			var opts = {space:'lchab', channel:[null, 2], min:[null, 0], max:[null, 360], type: 'polar'};
			createRangeCase('h', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			var opts = {space:'luv', channel:[null, 0], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('L', 'polar', render(color.rgbArray(), data, opts));
		});
		it('u', function(){
			var opts = {space:'luv', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('u', 'polar', render(color.rgbArray(), data, opts));
		});
		it('v', function(){
			var opts = {space:'luv', channel:[null, 2], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('v', 'polar', render(color.rgbArray(), data, opts));
		});

		it('l(uv)', function(){
			var opts = {space:'lchuv', channel:[null, 0], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('lυν', 'polar', render(color.rgbArray(), data, opts));
		});
		it('c(uv)', function(){
			var opts = {space:'lchuv', channel:[null, 1], min:[null, 0], max:[null, 100], type: 'polar'};
			createRangeCase('cυν', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h(uv)', function(){
			var opts = {space:'lchuv', channel:[null, 2], min:[null, 0], max:[null, 360], type: 'polar'};
			createRangeCase('hυν', 'polar', render(color.rgbArray(), data, opts));
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
			var opts = {space:'hsl', channel:[0, 2], min:[0,100], max:[360, 0], type: 'polar'};
			createRangeCase('h-l', 'polar', render(color.rgbArray(), data, opts));
		});

		it('hue-brightness', function(){
			var opts = {space:'hsv', channel:[0,2], min:[0,100], max:[360, 0], type: 'polar'};
			createRangeCase('h-b', 'polar', render(color.rgbArray(), data, opts));
		});

		it('hue-saturation', function(){
			var opts = {space:'hsl', channel:[0,1], min:[0,100], max:[360, 0], type: 'polar'};
			createRangeCase('h-s', 'polar', render(color.rgbArray(), data, opts));
		});

		it('hue-saturationv', function(){
			var opts = {space:'hsv', channel:[0,1], min:[0,100], max:[360, 0], type: 'polar'};
			createRangeCase('h-sv', 'polar', render(color.rgbArray(), data, opts));
		});

		it('lightness-saturation', function(){
			var opts = {space:'hsl', channel:[2,1], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('l-s', 'polar', render(color.rgbArray(), data, opts));
		});

		it('saturation-brightness', function(){
			var opts = {space:'hsv', channel:[1,2], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('s-b', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			var opts = {space:'rgb', channel:[0,1], min:[0,0], max:[255,255], type: 'polar'};
			createRangeCase('r-g', 'polar', render(color.rgbArray(), data, opts));
		});

		it('red-blue', function(){
			var opts = {space:'rgb', channel:[0,2], min:[0,0], max:[255,255], type: 'polar'};
			createRangeCase('r-b', 'polar', render(color.rgbArray(),  data, opts));
		});

		it('green-blue', function(){
			var opts = {space:'rgb', channel:[1,2], min:[0,0], max:[255,255], type: 'polar'};
			createRangeCase('g-b', 'polar', render(color.rgbArray(),  data, opts));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			var opts = {space:'cmyk', channel:[0,1], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('c-m', 'polar', render(color.rgbArray(), data, opts));
		});

		it('cyan-yellow', function(){
			var opts = {space:'cmyk', channel:[0,2], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('c-y', 'polar', render(color.rgbArray(), data, opts));
		});

		it('cyan-black', function(){
			var opts = {space:'cmyk', channel:[0,3], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('c-k', 'polar', render(color.rgbArray(), data, opts));
		});

		it('magenta-yellow', function(){
			var opts = {space:'cmyk', channel:[1,2], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('m-y', 'polar', render(color.rgbArray(), data, opts));
		});

		it('magenta-black', function(){
			var opts = {space:'cmyk', channel:[1,3], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('m-k', 'polar', render(color.rgbArray(), data, opts));
		});

		it('yellow-black', function(){
			var opts = {space:'cmyk', channel:[2,3], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('y-k', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			var opts = {space:'xyz', channel:[0,1], min:[0,0], max:[95,100], type: 'polar'};
			createRangeCase('x-y', 'polar', render(color.rgbArray(), data, opts));
		});
		it('x-z', function(){
			var opts = {space:'xyz', channel:[0,2], min:[0,0], max:[95,108], type: 'polar'};
			createRangeCase('x-z', 'polar', render(color.rgbArray(), data, opts));
		});
		it('y-z', function(){
			var opts = {space:'xyz', channel:[1,2], min:[0,0], max:[100, 108], type: 'polar'};
			createRangeCase('y-z', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			var opts = {space:'lab', channel:[0,1], min:[0,-100], max:[100,100], type: 'polar'};
			createRangeCase('l-a', 'polar', render(color.rgbArray(), data, opts));
		});
		it('l-b', function(){
			var opts = {space:'lab', channel:[0,2], min:[0,-100], max:[100,100], type: 'polar'};
			createRangeCase('l-b', 'polar', render(color.rgbArray(), data, opts));
		});
		it('a-b', function(){
			var opts = {space:'lab', channel:[1,2], min:[-100,-100], max:[100,100], type: 'polar'};
			createRangeCase('a-b', 'polar', render(color.rgbArray(), data, opts));
		});
		it('l-c', function(){
			var opts = {space:'lchab', channel:[0,1], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('l-c', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h-l', function(){
			var opts = {space:'lchab', channel:[2,0], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('l-h', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h-c', function(){
			var opts = {space:'lchab', channel:[2,1], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('c-h', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			var opts = {space:'luv', channel:[0,1], min:[0,-100], max:[100,100], type: 'polar'};
			createRangeCase('l-u', 'polar', render(color.rgbArray(), data, opts));
		});
		it('l-v', function(){
			var opts = {space:'luv', channel:[0,1], min:[0,-100], max:[100,100], type: 'polar'};
			createRangeCase('l-v', 'polar', render(color.rgbArray(), data, opts));
		});
		it('u-v', function(){
			var opts = {space:'luv', channel:[1,2], min:[-100,-100], max:[100,100], type: 'polar'};
			createRangeCase('u-v', 'polar', render(color.rgbArray(), data, opts));
		});
		it('l-cuv', function(){
			var opts = {space:'lchuv', channel:[0,1], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('l-c', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h-luv', function(){
			var opts = {space:'lchuv', channel:[2,0], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('l-h', 'polar', render(color.rgbArray(), data, opts));
		});
		it('h-cuv', function(){
			var opts = {space:'lchuv', channel:[2,1], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('c-h', 'polar', render(color.rgbArray(), data, opts));
		});
	});

	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			var opts = {space:'husl', channel:[0,1], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('husl-hs', 'polar', render(color.rgbArray(), data, opts));
		});
		it('husl-hl', function(){
			var opts = {space:'husl', channel:[0,2], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('husl-hl', 'polar', render(color.rgbArray(), data, opts));
		});
		it('husl-sl', function(){
			var opts = {space:'husl', channel:[1,2], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('husl-sl', 'polar', render(color.rgbArray(), data, opts));
		});


		it('huslp-hs', function(){
			var opts = {space:'huslp', channel:[0,1], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('huslp-hs', 'polar', render(color.rgbArray(), data, opts));
		});
		it('huslp-hl', function(){
			var opts = {space:'huslp', channel:[0,2], min:[0,100], max:[360,0], type: 'polar'};
			createRangeCase('huslp-hl', 'polar', render(color.rgbArray(), data, opts));
		});
		it('huslp-sl', function(){
			var opts = {space:'huslp', channel:[1,2], min:[0,0], max:[100,100], type: 'polar'};
			createRangeCase('huslp-sl', 'polar', render(color.rgbArray(), data, opts));
		});
	});
});


describe('performance', function(){
	if (!doc) return;

	var work = require('webworkify');
	var worker;

	before(function(){
		createSection(this.test.parent.title);
	});


	//hook up worker
	before(function(done){

		console.time('create-webworker');

		worker = work(require('../worker'));
		worker.postMessage('');

		once(worker, 'message', function(){
			done();
			console.timeEnd('create-webworker');
		});
	});


	it('no-webworker', function(){
		console.time('no-webworker');

		var opts = {
			space:'lchab',
			channel:[0,2],
			min:[0,0],
			max:[100,360]
		};
		createRangeCase('no-webworker', 'rect', render(color.rgbArray(), data, opts));

		console.timeEnd('no-webworker');
	});


	it('webworker clone', function(done){
		//listen for response
		on(worker, 'message', function(e){
			if (e.data.id !== 1) return;

			createRangeCase('webworker-clone', 'rect', e.data.data);

			console.timeEnd('webworker-clone');

			done();
		});

		//send request
		console.time('webworker-clone');
		worker.postMessage({color: color.rgbArray(), space: 'lchab', channel: [0,2], max: [100, 360], data: data, min:[0,0], id: 1});
	});


	//image data buffer isn’t transferable yet
	it.skip('webworker transfer', function(done){
		//listen for response
		on(worker, 'message', function(e){
			if (e.data.id !== 1) return;

			var opts = {rgb: color.rgbArray(), space: 'lchab', channel: [0,2], max: [100, 360], data: data, min:[0,0], id: 1};
			createRangeCase('webworker-transfer', 'rect', e.data.data);

			console.timeEnd('webworker-transfer');

			done();
		});

		//send request
		console.time('webworker-transfer');
		worker.postMessage([data], opts);
	});


	it.skip('webGL shaders', function(){

	});
});


describe('Special cases', function(){
	it('side hsl values', function(){
		var color = Color('hsl(120, 0%, 0%)');
		var opts = {space:'hsl', channel:[1,2], min:[0,0], max:[100,100], sourceSpace: 'hsl'};
		createRangeCase('hsl-sl', 'rect', render(color.hslArray(), data, opts));
	});
});