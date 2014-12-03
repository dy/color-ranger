/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var ranger = require('../');
var Emmy = require('emmy');
var spaces = require('color-space');

//detect browser
var doc = typeof document === 'undefined' ? null : document;

//browser case
if (doc) {
	var getWorker = require('../get-worker');

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
		createRangeCase('x',
			'horizontal',
			ranger.renderRect(color.rgbArray(), {
				space: 'hsl', channel: [0], min: [0], max: [360]
			}, data)
		);
	});

	it('[null, y]', function(){
		createRangeCase('y', 'vertical', ranger.renderRect(color.rgbArray(), {
			space: 'hsl',
			channel: [null, 0],
			min: [0,0],
			max: [null, 360]
		}, data));
	});

	it('[x,y]', function(){
		createRangeCase('x-y', 'rect', ranger.renderRect(color.rgbArray(), {
			space: 'hsl',
			channel: [0, 1],
			min: [0,0],
			max: [360, 100]
		}, data));
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
		ctx.putImageData(ranger.renderGrid([120,120,120,.4], [0,0,0,0], gridData), 0, 0);

		gridBg = 'url(' + cnv.toDataURL() + ')';

		cnv.width = iw; cnv.height = ih;
	});

	it('alpha', function(){
		createRangeCase('alpha', 'horizontal', ranger.renderRect(color.rgbaArray(), {
			channel: [3]
		}, data)).style.background += ' 0 0/cover, ' + gridBg;
	});
	it('red-alpha', function(){
		createRangeCase('red-alpha', 'rect', ranger.renderRect(color.rgbaArray(), {
			channel: [0,3]
		}, data)).style.background += ' 0 0/cover, ' + gridBg;
	});
	it('hue-alpha', function(){
		createRangeCase('hue-alpha', 'rect', ranger.renderRect(color.rgbaArray(), {
			space: 'hsl', channel: [0,3], max:[360,255]
		}, data)).style.background += ' 0 0/cover, ' + gridBg;
	});
	it('lightness-alpha', function(){
		createRangeCase('lightness-alpha', 'polar', ranger.renderRect(color.rgbaArray(), {
			space: 'luv', channel: [0,3], max:[100,255]
		}, data)).style.background += ' 0 0/cover, ' + gridBg;
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

			createRangeCase('hue', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'hsl', channel: [0], min: [0], max: [360]}, data));
		});

		it('saturation', function(){

			createRangeCase('saturation', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'hsl', channel: [1], min: [0], max: [100]}, data));
		});

		it('lightness', function(){

			createRangeCase('lightness', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'hsl', channel: [2], min: [0], max: [100]}, data));
		});

		it('brightness', function(){

			createRangeCase('brightness', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'hsv', channel: [2], min: [0], max: [100]}, data));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){

			createRangeCase('red', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'rgb', channel: [0], min: [0], max: [255]}, data));
		});

		it('green', function(){

			createRangeCase('green', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'rgb', channel: [1], min: [0], max: [255]}, data));
		});

		it('blue', function(){

			createRangeCase('blue', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'rgb', channel: [2], min: [0], max: [255]}, data));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){

			createRangeCase('cyan', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'cmyk', channel: [0], min: [0], max: [100]}, data));
		});

		it('magenta', function(){

			createRangeCase('magenta', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'cmyk', channel: [1], min: [0], max: [100]}, data));
		});

		it('yellow', function(){

			createRangeCase('yellow', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'cmyk', channel: [2], min: [0], max: [100]}, data));
		});

		it('black', function(){

			createRangeCase('black', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'cmyk', channel: [3], min: [0], max: [100]}, data));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){

			createRangeCase('x', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'xyz', channel: [0], min: [0], max: [95]}, data));
		});
		it('y', function(){

			createRangeCase('y', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'xyz', channel: [1], min: [0], max: [100]}, data));
		});
		it('z', function(){

			createRangeCase('z', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'xyz', channel: [2], min: [0], max: [109]}, data));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){

			createRangeCase('L', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lab', channel: [0], min: [0], max: [100]}, data));
		});
		it('a', function(){

			createRangeCase('a', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lab', channel: [1], min: [-100], max: [100]}, data));
		});
		it('b', function(){

			createRangeCase('b', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lab', channel: [2], min: [-100], max: [100]}, data));
		});

		it('l', function(){

			createRangeCase('l', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lchab', channel: [0], min: [0], max: [100]}, data));
		});
		it('c', function(){

			createRangeCase('c', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lchab', channel: [1], min: [0], max: [100]}, data));
		});
		it('h', function(){

			createRangeCase('h', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lchab', channel: [2], min: [0], max: [360]}, data));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){

			createRangeCase('L', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'luv', channel: [0], min: [0], max: [100]}, data));
		});
		it('υ', function(){

			createRangeCase('u', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'luv', channel: [1], min: [-100], max: [100]}, data));
		});
		it('ν', function(){

			createRangeCase('v', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'luv', channel: [2], min: [-100], max: [100]}, data));
		});

		it('l(uv)', function(){

			createRangeCase('lυν', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lchuv', channel: [0], min: [0], max: [100]}, data));
		});
		it('c(uv)', function(){

			createRangeCase('cυν', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lchuv', channel: [1], min: [0], max: [100]}, data));
		});
		it('h(uv)', function(){

			createRangeCase('hυν', 'horizontal', ranger.renderRect(color.rgbArray(), { space: 'lchuv', channel: [2], min: [0], max: [360]}, data));
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
			createRangeCase('hue', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'hsl', channel: [null, 0], min: [null, 0], max: [null, 360]}, data));
		});

		it('saturation', function(){
			createRangeCase('saturation', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'hsl', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});

		it('lightness', function(){
			createRangeCase('lightness', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'hsl', channel: [null, 2], min: [null, 0], max: [null, 100]}, data));
		});

		it('brightness', function(){
			createRangeCase('brightness', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'hsv', channel: [null, 2], min: [null, 0], max: [null, 100]}, data));
		});

		it('whiteness', function(){
			createRangeCase('whiteness', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'hwb', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});

		it('blackness', function(){
			createRangeCase('blackness', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'hwb', channel: [null, 2], min: [null, 0], max: [null, 100]}, data));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			createRangeCase('red', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'rgb', channel: [null, 0], min: [null, 0], max: [null, 255]}, data));
		});

		it('green', function(){
			createRangeCase('green', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'rgb', channel: [null, 1], min: [null, 0], max: [null, 255]}, data));
		});

		it('blue', function(){
			createRangeCase('blue', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'rgb', channel: [null, 2], min: [null, 0], max: [null, 255]}, data));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			createRangeCase('cyan', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'cmyk', channel: [null, 0], min: [null, 0], max: [null, 100]}, data));
		});

		it('magenta', function(){
			createRangeCase('magenta', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'cmyk', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});

		it('yellow', function(){
			createRangeCase('yellow', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'cmyk', channel: [null, 2], min: [null, 0], max: [null, 100]}, data));
		});

		it('black', function(){
			createRangeCase('black', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'cmyk', channel: [null, 3], min: [null, 0], max: [null, 100]}, data));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			createRangeCase('x', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'xyz', channel: [null, 0], min: [null, 0], max: [null, 95]}, data));
		});
		it('y', function(){
			createRangeCase('y', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'xyz', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});
		it('z', function(){
			createRangeCase('z', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'xyz', channel: [null, 2], min: [null, 0], max: [null, 109]}, data));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			createRangeCase('L', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lab', channel: [null, 0], min: [null, 0], max: [null, 100]}, data));
		});
		it('a', function(){
			createRangeCase('a', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lab', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});
		it('b', function(){
			createRangeCase('b', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lab', channel: [null, 2], min: [null, 0], max: [null, 100]}, data));
		});

		it('l', function(){
			createRangeCase('l', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lchab', channel: [null, 0], min: [null, 0], max: [null, 100]}, data));
		});
		it('c', function(){
			createRangeCase('c', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lchab', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});
		it('h', function(){
			createRangeCase('h', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lchab', channel: [null, 2], min: [null, 0], max: [null, 360]}, data));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			createRangeCase('L', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'luv', channel: [null, 0], min: [null, 0], max: [null, 100]}, data));
		});
		it('u', function(){
			createRangeCase('u', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'luv', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});
		it('v', function(){
			createRangeCase('v', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'luv', channel: [null, 2], min: [null, 0], max: [null, 100]}, data));
		});

		it('l(uv)', function(){
			createRangeCase('l', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lchuv', channel: [null, 0], min: [null, 0], max: [null, 100]}, data));
		});
		it('c(uv)', function(){
			createRangeCase('c', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lchuv', channel: [null, 1], min: [null, 0], max: [null, 100]}, data));
		});
		it('h(uv)', function(){
			createRangeCase('h', 'vertical', ranger.renderRect(color.rgbArray(),{
			 space: 'lchuv', channel: [null, 2], min: [null, 0], max: [null, 360]}, data));
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
			createRangeCase('h-l', 'rect', ranger.renderRect(color.rgbArray(), {space: 'hsl', channel:[0, 2],min: [0,0],max: [360, 100]}, data));
		});

		it('hue-brightness', function(){
			createRangeCase('h-b', 'rect', ranger.renderRect(color.rgbArray(), {space: 'hsv', channel:[0,2], min:[0,0], max:[360, 100]}, data));
		});

		it('hue-saturation', function(){
			createRangeCase('h-s', 'rect', ranger.renderRect(color.rgbArray(), {space: 'hsl', channel:[0,1], min:[0,0], max:[360, 100]}, data));
		});

		it('hue-saturationv', function(){
			createRangeCase('h-sv', 'rect', ranger.renderRect(color.rgbArray(), {space: 'hsv', channel:[0,1], min:[0,0], max:[360, 100]}, data));
		});

		it('saturation-lightness', function(){
			createRangeCase('s-l', 'rect', ranger.renderRect(color.rgbArray(), {space: 'hsl', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});

		it('saturation-brightness', function(){
			createRangeCase('s-b', 'rect', ranger.renderRect(color.rgbArray(), {space: 'hsv', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			createRangeCase('r-g', 'rect', ranger.renderRect(color.rgbArray(), {space: 'rgb', channel:[0,1], min:[0,0], max:[255,255]}, data));
		});

		it('red-blue', function(){
			createRangeCase('r-b', 'rect', ranger.renderRect(color.rgbArray(), {space: 'rgb', channel:[0,2], min:[0,0], max:[255,255]},  data));
		});

		it('green-blue', function(){
			createRangeCase('g-b', 'rect', ranger.renderRect(color.rgbArray(), {space: 'rgb', channel:[1,2], min:[0,0], max:[255,255]},  data));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			createRangeCase('c-m', 'rect', ranger.renderRect(color.rgbArray(), {space: 'cmyk', channel:[0,1], min:[0,0], max:[100,100]}, data));
		});

		it('cyan-yellow', function(){
			createRangeCase('c-y', 'rect', ranger.renderRect(color.rgbArray(), {space: 'cmyk', channel:[0,2], min:[0,0], max:[100,100]}, data));
		});

		it('cyan-black', function(){
			createRangeCase('c-k', 'rect', ranger.renderRect(color.rgbArray(), {space: 'cmyk', channel:[0,3], min:[0,0], max:[100,100]}, data));
		});

		it('magenta-yellow', function(){
			createRangeCase('m-y', 'rect', ranger.renderRect(color.rgbArray(), {space: 'cmyk', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});

		it('magenta-black', function(){
			createRangeCase('m-k', 'rect', ranger.renderRect(color.rgbArray(), {space: 'cmyk', channel:[1,3], min:[0,0], max:[100,100]}, data));
		});

		it('yellow-black', function(){
			createRangeCase('y-k', 'rect', ranger.renderRect(color.rgbArray(), {space: 'cmyk', channel:[2,3], min:[0,0], max:[100,100]}, data));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			createRangeCase('x-y', 'rect', ranger.renderRect(color.rgbArray(), {space: 'xyz', channel:[0,1], min:[0,0], max:[95,100]}, data));
		});
		it('x-z', function(){
			createRangeCase('x-z', 'rect', ranger.renderRect(color.rgbArray(), {space: 'xyz', channel:[0,2], min:[0,0], max:[95,109]}, data));
		});
		it('y-z', function(){
			createRangeCase('y-z', 'rect', ranger.renderRect(color.rgbArray(), {space: 'xyz', channel:[1,2], min:[0,0], max:[100, 109]}, data));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			createRangeCase('l-a', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lab', channel:[0,1], min:[0,-100], max:[100,100]}, data));
		});
		it('l-b', function(){
			createRangeCase('l-b', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lab', channel:[0,2], min:[0,-100], max:[100,100]}, data));
		});
		it('a-b', function(){
			createRangeCase('a-b', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lab', channel:[1,2], min:[-100,-100], max:[100,100]}, data));
		});

		it('l-c', function(){
			createRangeCase('l-c', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lchab', channel:[0,1], min:[0,0], max:[100,100]}, data));
		});
		it('l-h', function(){
			createRangeCase('l-h', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lchab', channel:[0,2], min:[0,0], max:[100,360]}, data));
		});
		it('c-h', function(){
			createRangeCase('c-h', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lchab', channel:[1,2], min:[0,0], max:[100,360]}, data));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			createRangeCase('l-u', 'rect', ranger.renderRect(color.rgbArray(), {space: 'luv', channel:[0,1], min:[0,-100], max:[100,100]}, data));
		});
		it('l-v', function(){
			createRangeCase('l-v', 'rect', ranger.renderRect(color.rgbArray(), {space: 'luv', channel:[0,2], min:[0,-100], max:[100,100]}, data));
		});
		it('u-v', function(){
			createRangeCase('u-v', 'rect', ranger.renderRect(color.rgbArray(), {space: 'luv', channel: [1,2], min: [-100,-100], max:[100,100]}, data));
		});

		it('l-cυν', function(){
			createRangeCase('l-cυν', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lchuv', channel:[0,1], min:[0,0], max:[100,100]}, data));
		});
		it('l-hυν', function(){
			createRangeCase('l-hυν', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lchuv', channel:[0,2], min:[0,0], max:[100,360]}, data));
		});
		it('c-hυν', function(){
			createRangeCase('c-hυν', 'rect', ranger.renderRect(color.rgbArray(), {space: 'lchuv', channel:[1,2], min:[0,0], max:[100,360]}, data));
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			createRangeCase('husl-hs', 'rect', ranger.renderRect(color.rgbArray(), {space: 'husl', channel:[0,1], min:[0,0], max:[360,100]}, data));
		});
		it('husl-hl', function(){
			createRangeCase('husl-hl', 'rect', ranger.renderRect(color.rgbArray(), {space: 'husl', channel:[0,2], min:[0,0], max:[360,100]}, data));
		});
		it('husl-sl', function(){
			createRangeCase('husl-sl', 'rect', ranger.renderRect(color.rgbArray(), {space: 'husl', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});


		it('huslp-hs', function(){
			createRangeCase('huslp-hs', 'rect', ranger.renderRect(color.rgbArray(), {space: 'huslp', channel:[0,1], min:[0,0], max:[360,100]}, data));
		});
		it('huslp-hl', function(){
			createRangeCase('huslp-hl', 'rect', ranger.renderRect(color.rgbArray(), {space: 'huslp', channel:[0,2], min:[0,0], max:[360,100]}, data));
		});
		it('huslp-sl', function(){
			createRangeCase('huslp-sl', 'rect', ranger.renderRect(color.rgbArray(), {space: 'huslp', channel:[1,2], min:[0,0], max:[100,100]}, data));
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
			createRangeCase('hue', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[0],min: [0], max:[360]}, data));
		});

		it('saturation', function(){
			createRangeCase('saturation', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[1],min: [0], max:[100]}, data));
		});

		it('lightness', function(){
			createRangeCase('lightness', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[2],min: [0], max:[100]}, data));
		});

		it('brightness', function(){
			createRangeCase('brightness', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsv', channel:[2],min: [0], max:[100]}, data));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			createRangeCase('red', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[0],min: [0], max:[255]}, data));
		});

		it('green', function(){
			createRangeCase('green', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[1],min: [0], max:[255]}, data));
		});

		it('blue', function(){
			createRangeCase('blue', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[2],min: [0], max:[255]}, data));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			createRangeCase('cyan', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[0],min: [0], max:[100]}, data));
		});

		it('magenta', function(){
			createRangeCase('magenta', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[1],min: [0], max:[100]}, data));
		});

		it('yellow', function(){
			createRangeCase('yellow', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[2],min: [0], max:[100]}, data));
		});

		it('black', function(){
			createRangeCase('black', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[3],min: [0], max:[100]}, data));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			createRangeCase('x', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[0],min: [0], max:[95]}, data));
		});
		it('y', function(){
			createRangeCase('y', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[1],min: [0], max:[100]}, data));
		});
		it('z', function(){
			createRangeCase('z', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[2],min: [0], max:[109]}, data));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[0],min: [0], max:[100]}, data));
		});
		it('a', function(){
			createRangeCase('a', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[1], min:[-100], max:[100]}, data));
		});
		it('b', function(){
			createRangeCase('b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[2], min:[-100], max:[100]}, data));
		});

		it('l', function(){
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[0],min: [0], max:[100]}, data));
		});
		it('c', function(){
			createRangeCase('c', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[1],min: [0], max:[100]}, data));
		});
		it('h', function(){
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[2],min: [0], max:[360]}, data));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[0],min: [0], max:[100]}, data));
		});
		it('u', function(){
			createRangeCase('u', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[1], min:[-100], max:[100]}, data));
		});
		it('v', function(){
			createRangeCase('v', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[2], min:[-100], max:[100]}, data));
		});

		it('l(uv)', function(){
			createRangeCase('lυν', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[0],min: [0], max:[100]}, data));
		});
		it('c(uv)', function(){
			createRangeCase('cυν', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[1],min: [0], max:[100]}, data));
		});
		it('h(uv)', function(){
			createRangeCase('hυν', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[2],min: [0], max:[360]}, data));
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hue', function(){
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'husl', channel:[0],min: [0], max:[360]}, data));
		});
		it('husl-sat', function(){
			createRangeCase('s', 'polar', ranger.renderPolar(color.rgbArray(), {space:'husl', channel:[1],min: [0], max:[100]}, data));
		});
		it('husl-l', function(){
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), {space:'husl', channel:[2],min: [0], max:[100]}, data));
		});


		it('huslp-hue', function(){
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'huslp', channel:[0],min: [0], max:[360]}, data));
		});
		it('huslp-sat', function(){
			createRangeCase('s', 'polar', ranger.renderPolar(color.rgbArray(), {space:'huslp', channel:[1],min: [0], max:[100]}, data));
		});
		it('huslp-l', function(){
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), {space:'huslp', channel:[2],min: [0], max:[100]}, data));
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
			createRangeCase('hue', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[null, 0], min:[null, 0], max:[null, 360]}, data));
		});

		it('saturation', function(){
			createRangeCase('saturation', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});

		it('lightness', function(){
			createRangeCase('lightness', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[null, 2], min:[null, 0], max:[null, 100]}, data));
		});

		it('brightness', function(){
			createRangeCase('brightness', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsv', channel:[null, 2], min:[null, 0], max:[null, 100]}, data));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			createRangeCase('red', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[null, 0], min:[null, 0], max:[null, 255]}, data));
		});

		it('green', function(){
			createRangeCase('green', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[null, 1], min:[null, 0], max:[null, 255]}, data));
		});

		it('blue', function(){
			createRangeCase('blue', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[null, 2], min:[null, 0], max:[null, 255]}, data));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			createRangeCase('cyan', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[null, 0], min:[null, 0], max:[null, 100]}, data));
		});

		it('magenta', function(){
			createRangeCase('magenta', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});

		it('yellow', function(){
			createRangeCase('yellow', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[null, 2], min:[null, 0], max:[null, 100]}, data));
		});

		it('black', function(){
			createRangeCase('black', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[null, 3], min:[null, 0], max:[null, 100]}, data));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			createRangeCase('x', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[null, 0], min:[null, 0], max:[null, 95]}, data));
		});
		it('y', function(){
			createRangeCase('y', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});
		it('z', function(){
			createRangeCase('z', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[null, 2], min:[null, 0], max:[null, 109]}, data));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[null, 0], min:[null, 0], max:[null, 100]}, data));
		});
		it('a', function(){
			createRangeCase('a', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});
		it('b', function(){
			createRangeCase('b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[null, 2], min:[null, 0], max:[null, 100]}, data));
		});

		it('l', function(){
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[null, 0], min:[null, 0], max:[null, 100]}, data));
		});
		it('c', function(){
			createRangeCase('c', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});
		it('h', function(){
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[null, 2], min:[null, 0], max:[null, 360]}, data));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[null, 0], min:[null, 0], max:[null, 100]}, data));
		});
		it('u', function(){
			createRangeCase('u', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});
		it('v', function(){
			createRangeCase('v', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[null, 2], min:[null, 0], max:[null, 100]}, data));
		});

		it('l(uv)', function(){
			createRangeCase('lυν', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[null, 0], min:[null, 0], max:[null, 100]}, data));
		});
		it('c(uv)', function(){
			createRangeCase('cυν', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[null, 1], min:[null, 0], max:[null, 100]}, data));
		});
		it('h(uv)', function(){
			createRangeCase('hυν', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[null, 2], min:[null, 0], max:[null, 360]}, data));
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
			createRangeCase('h-l', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[0, 2], min:[0,100], max:[360, 0]}, data));
		});

		it('hue-brightness', function(){
			createRangeCase('h-b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsv', channel:[0,2], min:[0,100], max:[360, 0]}, data));
		});

		it('hue-saturation', function(){
			createRangeCase('h-s', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[0,1], min:[0,100], max:[360, 0]}, data));
		});

		it('hue-saturationv', function(){
			createRangeCase('h-sv', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsv', channel:[0,1], min:[0,100], max:[360, 0]}, data));
		});

		it('lightness-saturation', function(){
			createRangeCase('l-s', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsl', channel:[2,1], min:[0,0], max:[100,100]}, data));
		});

		it('saturation-brightness', function(){
			createRangeCase('s-b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'hsv', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			createRangeCase('r-g', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[0,1], min:[0,0], max:[255,255]}, data));
		});

		it('red-blue', function(){
			createRangeCase('r-b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[0,2], min:[0,0], max:[255,255]},  data));
		});

		it('green-blue', function(){
			createRangeCase('g-b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'rgb', channel:[1,2], min:[0,0], max:[255,255]},  data));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			createRangeCase('c-m', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[0,1], min:[0,0], max:[100,100]}, data));
		});

		it('cyan-yellow', function(){
			createRangeCase('c-y', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[0,2], min:[0,0], max:[100,100]}, data));
		});

		it('cyan-black', function(){
			createRangeCase('c-k', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[0,3], min:[0,0], max:[100,100]}, data));
		});

		it('magenta-yellow', function(){
			createRangeCase('m-y', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});

		it('magenta-black', function(){
			createRangeCase('m-k', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[1,3], min:[0,0], max:[100,100]}, data));
		});

		it('yellow-black', function(){
			createRangeCase('y-k', 'polar', ranger.renderPolar(color.rgbArray(), {space:'cmyk', channel:[2,3], min:[0,0], max:[100,100]}, data));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			createRangeCase('x-y', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[0,1], min:[0,0], max:[95,100]}, data));
		});
		it('x-z', function(){
			createRangeCase('x-z', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[0,2], min:[0,0], max:[95,108]}, data));
		});
		it('y-z', function(){
			createRangeCase('y-z', 'polar', ranger.renderPolar(color.rgbArray(), {space:'xyz', channel:[1,2], min:[0,0], max:[100, 108]}, data));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			createRangeCase('l-a', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[0,1], min:[0,-100], max:[100,100]}, data));
		});
		it('l-b', function(){
			createRangeCase('l-b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[0,2], min:[0,-100], max:[100,100]}, data));
		});
		it('a-b', function(){
			createRangeCase('a-b', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lab', channel:[1,2], min:[-100,-100], max:[100,100]}, data));
		});
		it('l-c', function(){
			createRangeCase('l-c', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[0,1], min:[0,0], max:[100,100]}, data));
		});
		it('h-l', function(){
			createRangeCase('l-h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[2,0], min:[0,100], max:[360,0]}, data));
		});
		it('h-c', function(){
			createRangeCase('c-h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchab', channel:[2,1], min:[0,100], max:[360,0]}, data));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			createRangeCase('l-u', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[0,1], min:[0,-100], max:[100,100]}, data));
		});
		it('l-v', function(){
			createRangeCase('l-v', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[0,1], min:[0,-100], max:[100,100]}, data));
		});
		it('u-v', function(){
			createRangeCase('u-v', 'polar', ranger.renderPolar(color.rgbArray(), {space:'luv', channel:[1,2], min:[-100,-100], max:[100,100]}, data));
		});
		it('l-cuv', function(){
			createRangeCase('l-c', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[0,1], min:[0,0], max:[100,100]}, data));
		});
		it('h-luv', function(){
			createRangeCase('l-h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[2,0], min:[0,100], max:[360,0]}, data));
		});
		it('h-cuv', function(){
			createRangeCase('c-h', 'polar', ranger.renderPolar(color.rgbArray(), {space:'lchuv', channel:[2,1], min:[0,100], max:[360,0]}, data));
		});
	});

	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			createRangeCase('husl-hs', 'polar', ranger.renderPolar(color.rgbArray(), {space:'husl', channel:[0,1], min:[0,100], max:[360,0]}, data));
		});
		it('husl-hl', function(){
			createRangeCase('husl-hl', 'polar', ranger.renderPolar(color.rgbArray(), {space:'husl', channel:[0,2], min:[0,100], max:[360,0]}, data));
		});
		it('husl-sl', function(){
			createRangeCase('husl-sl', 'polar', ranger.renderPolar(color.rgbArray(), {space:'husl', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});


		it('huslp-hs', function(){
			createRangeCase('huslp-hs', 'polar', ranger.renderPolar(color.rgbArray(), {space:'huslp', channel:[0,1], min:[0,100], max:[360,0]}, data));
		});
		it('huslp-hl', function(){
			createRangeCase('huslp-hl', 'polar', ranger.renderPolar(color.rgbArray(), {space:'huslp', channel:[0,2], min:[0,100], max:[360,0]}, data));
		});
		it('huslp-sl', function(){
			createRangeCase('huslp-sl', 'polar', ranger.renderPolar(color.rgbArray(), {space:'huslp', channel:[1,2], min:[0,0], max:[100,100]}, data));
		});
	});
});



describe('performance', function(){
	if (!doc) return;

	before(function(){
		createSection(this.test.parent.title);
	});

	var worker;


	//hook up worker
	before(function(done){

		console.time('create-webworker');

		worker = getWorker(spaces);

		worker.postMessage('');
		Emmy.one(worker, 'message', function(){
			done();
			console.timeEnd('create-webworker');
		});
	});


	it('no-webworker', function(){
		console.time('no-webworker');

		createRangeCase('no-webworker', 'rect', ranger.renderRect(color.rgbArray(), {
			space:'lchab',
			channel:[0,2],
			min:[0,0],
			max:[100,360]
		}, data));

		console.timeEnd('no-webworker');
	});


	it('webworker clone', function(done){
		//listen for response
		Emmy.on(worker, 'message', function(e){
			if (e.data.id !== 1) return;

			createRangeCase('webworker-clone', 'rect', e.data.data);

			console.timeEnd('webworker-clone');

			done();
		});

		//send request
		console.time('webworker-clone');
		worker.postMessage({rgb: color.rgbArray(), space: 'lchab', channel: [0,2], max: [100, 360], data: data, min:[0,0], id: 1});
	});


	//image data buffer isn’t transferable yet
	it.skip('webworker transfer', function(done){
		//listen for response
		Emmy.on(worker, 'message', function(e){
			if (e.data.id !== 1) return;

			createRangeCase('webworker-transfer', 'rect', e.data.data);

			console.timeEnd('webworker-transfer');

			done();
		});

		//send request
		console.time('webworker-transfer');
		worker.postMessage({rgb: color.rgbArray(), space: 'lchab', channel: [0,2], max: [100, 360], data: data, min:[0,0], id: 1}, [data]);
	});


	//TODO
	it.skip('webGL shaders', function(){

	});
});
