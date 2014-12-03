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
		var opts = {
				space: 'hsl', channel: [0], min: [0], max: [360]
			};
			createRangeCase('x',
			'horizontal',
			ranger.renderRect(color.rgbArray(), data, opts)
		);
	});

	it('[null, y]', function(){
		var opts = {
			space: 'hsl',
			channel: [null, 0],
			min: [0,0],
			max: [null, 360]
		};
		createRangeCase('y', 'vertical', ranger.renderRect(color.rgbArray(), data, opts));
	});

	it('[x,y]', function(){
		var opts = {
			space: 'hsl',
			channel: [0, 1],
			min: [0,0],
			max: [360, 100]
		};
		createRangeCase('x-y', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
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
		gridData.data = ranger.renderGrid([120,120,120,.4], [0,0,0,0], gridData.data);

		ctx.putImageData(gridData, 0, 0);

		gridBg = 'url(' + cnv.toDataURL() + ')';

		cnv.width = iw; cnv.height = ih;
	});

	it('alpha', function(){
		var opts = {
			channel: [3]
		};
		var bg = createRangeCase('alpha', 'horizontal', ranger.renderRect(color.rgbaArray(), data, opts));
		bg.style.background = bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
	});
	it('red-alpha', function(){
		var opts = {
			channel: [0,3]
		};
		var bg = createRangeCase('red-alpha', 'rect', ranger.renderRect(color.rgbaArray(), data, opts));
		bg.style.background += bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
	});
	it('hue-alpha', function(){
		var opts = {
			space: 'hsl', channel: [0,3], max:[360,255]
		};
		var bg = createRangeCase('hue-alpha', 'rect', ranger.renderRect(color.rgbaArray(), data, opts));
		bg.style.background += bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
	});
	it('lightness-alpha', function(){
		var opts = {
			space: 'luv', channel: [0,3], max:[100,255]
		};
		var bg = createRangeCase('lightness-alpha', 'polar', ranger.renderRect(color.rgbaArray(), data, opts));
		bg.style.background += bg.style.backgroundImage + ' 0 0/cover, ' + gridBg;
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
			createRangeCase('hue', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('saturation', function(){

			var opts = { space: 'hsl', channel: [1], min: [0], max: [100]};
			createRangeCase('saturation', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('lightness', function(){

			var opts = { space: 'hsl', channel: [2], min: [0], max: [100]};
			createRangeCase('lightness', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('brightness', function(){

			var opts = { space: 'hsv', channel: [2], min: [0], max: [100]};
			createRangeCase('brightness', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){

			var opts = { space: 'rgb', channel: [0], min: [0], max: [255]};
			createRangeCase('red', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('green', function(){

			var opts = { space: 'rgb', channel: [1], min: [0], max: [255]};
			createRangeCase('green', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('blue', function(){

			var opts = { space: 'rgb', channel: [2], min: [0], max: [255]};
			createRangeCase('blue', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){

			var opts = { space: 'cmyk', channel: [0], min: [0], max: [100]};
			createRangeCase('cyan', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('magenta', function(){

			var opts = { space: 'cmyk', channel: [1], min: [0], max: [100]};
			createRangeCase('magenta', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('yellow', function(){

			var opts = { space: 'cmyk', channel: [2], min: [0], max: [100]};
			createRangeCase('yellow', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('black', function(){

			var opts = { space: 'cmyk', channel: [3], min: [0], max: [100]};
			createRangeCase('black', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){

			var opts = { space: 'xyz', channel: [0], min: [0], max: [95]};
			createRangeCase('x', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('y', function(){

			var opts = { space: 'xyz', channel: [1], min: [0], max: [100]};
			createRangeCase('y', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('z', function(){

			var opts = { space: 'xyz', channel: [2], min: [0], max: [109]};
			createRangeCase('z', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){

			var opts = { space: 'lab', channel: [0], min: [0], max: [100]};
			createRangeCase('L', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('a', function(){

			var opts = { space: 'lab', channel: [1], min: [-100], max: [100]};
			createRangeCase('a', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('b', function(){

			var opts = { space: 'lab', channel: [2], min: [-100], max: [100]};
			createRangeCase('b', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('l', function(){

			var opts = { space: 'lchab', channel: [0], min: [0], max: [100]};
			createRangeCase('l', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('c', function(){

			var opts = { space: 'lchab', channel: [1], min: [0], max: [100]};
			createRangeCase('c', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('h', function(){

			var opts = { space: 'lchab', channel: [2], min: [0], max: [360]};
			createRangeCase('h', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){

			var opts = { space: 'luv', channel: [0], min: [0], max: [100]};
			createRangeCase('L', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('υ', function(){

			var opts = { space: 'luv', channel: [1], min: [-100], max: [100]};
			createRangeCase('u', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('ν', function(){

			var opts = { space: 'luv', channel: [2], min: [-100], max: [100]};
			createRangeCase('v', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('l(uv)', function(){

			var opts = { space: 'lchuv', channel: [0], min: [0], max: [100]};
			createRangeCase('lυν', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('c(uv)', function(){

			var opts = { space: 'lchuv', channel: [1], min: [0], max: [100]};
			createRangeCase('cυν', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('h(uv)', function(){

			var opts = { space: 'lchuv', channel: [2], min: [0], max: [360]};
			createRangeCase('hυν', 'horizontal', ranger.renderRect(color.rgbArray(), data, opts));
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
			 createRangeCase('hue', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('saturation', function(){
			var opts = {
			 space: 'hsl', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('saturation', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('lightness', function(){
			var opts = {
			 space: 'hsl', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('lightness', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('brightness', function(){
			var opts = {
			 space: 'hsv', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('brightness', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('whiteness', function(){
			var opts = {
			 space: 'hwb', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('whiteness', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('blackness', function(){
			var opts = {
			 space: 'hwb', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('blackness', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			var opts = {
			 space: 'rgb', channel: [null, 0], min: [null, 0], max: [null, 255]};
			 createRangeCase('red', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('green', function(){
			var opts = {
			 space: 'rgb', channel: [null, 1], min: [null, 0], max: [null, 255]};
			 createRangeCase('green', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('blue', function(){
			var opts = {
			 space: 'rgb', channel: [null, 2], min: [null, 0], max: [null, 255]};
			 createRangeCase('blue', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('cyan', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('magenta', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('magenta', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('yellow', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('yellow', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('black', function(){
			var opts = {
			 space: 'cmyk', channel: [null, 3], min: [null, 0], max: [null, 100]};
			 createRangeCase('black', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			var opts = {
			 space: 'xyz', channel: [null, 0], min: [null, 0], max: [null, 95]};
			 createRangeCase('x', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('y', function(){
			var opts = {
			 space: 'xyz', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('y', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('z', function(){
			var opts = {
			 space: 'xyz', channel: [null, 2], min: [null, 0], max: [null, 109]};
			 createRangeCase('z', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			var opts = {
			 space: 'lab', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('L', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('a', function(){
			var opts = {
			 space: 'lab', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('a', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('b', function(){
			var opts = {
			 space: 'lab', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('b', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('l', function(){
			var opts = {
			 space: 'lchab', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('l', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('c', function(){
			var opts = {
			 space: 'lchab', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('c', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('h', function(){
			var opts = {
			 space: 'lchab', channel: [null, 2], min: [null, 0], max: [null, 360]};
			 createRangeCase('h', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			var opts = {
			 space: 'luv', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('L', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('u', function(){
			var opts = {
			 space: 'luv', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('u', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('v', function(){
			var opts = {
			 space: 'luv', channel: [null, 2], min: [null, 0], max: [null, 100]};
			 createRangeCase('v', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});

		it('l(uv)', function(){
			var opts = {
			 space: 'lchuv', channel: [null, 0], min: [null, 0], max: [null, 100]};
			 createRangeCase('l', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('c(uv)', function(){
			var opts = {
			 space: 'lchuv', channel: [null, 1], min: [null, 0], max: [null, 100]};
			 createRangeCase('c', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
		});
		it('h(uv)', function(){
			var opts = {
			 space: 'lchuv', channel: [null, 2], min: [null, 0], max: [null, 360]};
			 createRangeCase('h', 'vertical', ranger.renderRect(color.rgbArray(),data, opts));
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
			createRangeCase('h-l', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('hue-brightness', function(){
			var opts = {space: 'hsv', channel:[0,2], min:[0,0], max:[360, 100]};
			createRangeCase('h-b', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('hue-saturation', function(){
			var opts = {space: 'hsl', channel:[0,1], min:[0,0], max:[360, 100]};
			createRangeCase('h-s', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('hue-saturationv', function(){
			var opts = {space: 'hsv', channel:[0,1], min:[0,0], max:[360, 100]};
			createRangeCase('h-sv', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('saturation-lightness', function(){
			var opts = {space: 'hsl', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('s-l', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('saturation-brightness', function(){
			var opts = {space: 'hsv', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('s-b', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			var opts = {space: 'rgb', channel:[0,1], min:[0,0], max:[255,255]};
			createRangeCase('r-g', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('red-blue', function(){
			var opts = {space: 'rgb', channel:[0,2], min:[0,0], max:[255,255]};
			createRangeCase('r-b', 'rect', ranger.renderRect(color.rgbArray(),  data, opts));
		});

		it('green-blue', function(){
			var opts = {space: 'rgb', channel:[1,2], min:[0,0], max:[255,255]};
			createRangeCase('g-b', 'rect', ranger.renderRect(color.rgbArray(),  data, opts));
		});
	});


	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			var opts = {space: 'cmyk', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('c-m', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('cyan-yellow', function(){
			var opts = {space: 'cmyk', channel:[0,2], min:[0,0], max:[100,100]};
			createRangeCase('c-y', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('cyan-black', function(){
			var opts = {space: 'cmyk', channel:[0,3], min:[0,0], max:[100,100]};
			createRangeCase('c-k', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('magenta-yellow', function(){
			var opts = {space: 'cmyk', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('m-y', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('magenta-black', function(){
			var opts = {space: 'cmyk', channel:[1,3], min:[0,0], max:[100,100]};
			createRangeCase('m-k', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('yellow-black', function(){
			var opts = {space: 'cmyk', channel:[2,3], min:[0,0], max:[100,100]};
			createRangeCase('y-k', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			var opts = {space: 'xyz', channel:[0,1], min:[0,0], max:[95,100]};
			createRangeCase('x-y', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('x-z', function(){
			var opts = {space: 'xyz', channel:[0,2], min:[0,0], max:[95,109]};
			createRangeCase('x-z', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('y-z', function(){
			var opts = {space: 'xyz', channel:[1,2], min:[0,0], max:[100, 109]};
			createRangeCase('y-z', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			var opts = {space: 'lab', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-a', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('l-b', function(){
			var opts = {space: 'lab', channel:[0,2], min:[0,-100], max:[100,100]};
			createRangeCase('l-b', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('a-b', function(){
			var opts = {space: 'lab', channel:[1,2], min:[-100,-100], max:[100,100]};
			createRangeCase('a-b', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('l-c', function(){
			var opts = {space: 'lchab', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('l-c', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('l-h', function(){
			var opts = {space: 'lchab', channel:[0,2], min:[0,0], max:[100,360]};
			createRangeCase('l-h', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('c-h', function(){
			var opts = {space: 'lchab', channel:[1,2], min:[0,0], max:[100,360]};
			createRangeCase('c-h', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			var opts = {space: 'luv', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-u', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('l-v', function(){
			var opts = {space: 'luv', channel:[0,2], min:[0,-100], max:[100,100]};
			createRangeCase('l-v', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('u-v', function(){
			var opts = {space: 'luv', channel: [1,2], min: [-100,-100], max:[100,100]};
			createRangeCase('u-v', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});

		it('l-cυν', function(){
			var opts = {space: 'lchuv', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('l-cυν', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('l-hυν', function(){
			var opts = {space: 'lchuv', channel:[0,2], min:[0,0], max:[100,360]};
			createRangeCase('l-hυν', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('c-hυν', function(){
			var opts = {space: 'lchuv', channel:[1,2], min:[0,0], max:[100,360]};
			createRangeCase('c-hυν', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			var opts = {space: 'husl', channel:[0,1], min:[0,0], max:[360,100]};
			createRangeCase('husl-hs', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('husl-hl', function(){
			var opts = {space: 'husl', channel:[0,2], min:[0,0], max:[360,100]};
			createRangeCase('husl-hl', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('husl-sl', function(){
			var opts = {space: 'husl', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('husl-sl', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});


		it('huslp-hs', function(){
			var opts = {space: 'huslp', channel:[0,1], min:[0,0], max:[360,100]};
			createRangeCase('huslp-hs', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('huslp-hl', function(){
			var opts = {space: 'huslp', channel:[0,2], min:[0,0], max:[360,100]};
			createRangeCase('huslp-hl', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
		});
		it('huslp-sl', function(){
			var opts = {space: 'huslp', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('huslp-sl', 'rect', ranger.renderRect(color.rgbArray(), data, opts));
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
			var opts = {space:'hsl', channel:[0],min: [0], max:[360]};
			createRangeCase('hue', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('saturation', function(){
			var opts = {space:'hsl', channel:[1],min: [0], max:[100]};
			createRangeCase('saturation', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('lightness', function(){
			var opts = {space:'hsl', channel:[2],min: [0], max:[100]};
			createRangeCase('lightness', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('brightness', function(){
			var opts = {space:'hsv', channel:[2],min: [0], max:[100]};
			createRangeCase('brightness', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			var opts = {space:'rgb', channel:[0],min: [0], max:[255]};
			createRangeCase('red', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('green', function(){
			var opts = {space:'rgb', channel:[1],min: [0], max:[255]};
			createRangeCase('green', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('blue', function(){
			var opts = {space:'rgb', channel:[2],min: [0], max:[255]};
			createRangeCase('blue', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			var opts = {space:'cmyk', channel:[0],min: [0], max:[100]};
			createRangeCase('cyan', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('magenta', function(){
			var opts = {space:'cmyk', channel:[1],min: [0], max:[100]};
			createRangeCase('magenta', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('yellow', function(){
			var opts = {space:'cmyk', channel:[2],min: [0], max:[100]};
			createRangeCase('yellow', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('black', function(){
			var opts = {space:'cmyk', channel:[3],min: [0], max:[100]};
			createRangeCase('black', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			var opts = {space:'xyz', channel:[0],min: [0], max:[95]};
			createRangeCase('x', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('y', function(){
			var opts = {space:'xyz', channel:[1],min: [0], max:[100]};
			createRangeCase('y', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('z', function(){
			var opts = {space:'xyz', channel:[2],min: [0], max:[109]};
			createRangeCase('z', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			var opts = {space:'lab', channel:[0],min: [0], max:[100]};
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('a', function(){
			var opts = {space:'lab', channel:[1], min:[-100], max:[100]};
			createRangeCase('a', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('b', function(){
			var opts = {space:'lab', channel:[2], min:[-100], max:[100]};
			createRangeCase('b', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('l', function(){
			var opts = {space:'lchab', channel:[0],min: [0], max:[100]};
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('c', function(){
			var opts = {space:'lchab', channel:[1],min: [0], max:[100]};
			createRangeCase('c', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h', function(){
			var opts = {space:'lchab', channel:[2],min: [0], max:[360]};
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			var opts = {space:'luv', channel:[0],min: [0], max:[100]};
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('u', function(){
			var opts = {space:'luv', channel:[1], min:[-100], max:[100]};
			createRangeCase('u', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('v', function(){
			var opts = {space:'luv', channel:[2], min:[-100], max:[100]};
			createRangeCase('v', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('l(uv)', function(){
			var opts = {space:'lchuv', channel:[0],min: [0], max:[100]};
			createRangeCase('lυν', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('c(uv)', function(){
			var opts = {space:'lchuv', channel:[1],min: [0], max:[100]};
			createRangeCase('cυν', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h(uv)', function(){
			var opts = {space:'lchuv', channel:[2],min: [0], max:[360]};
			createRangeCase('hυν', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});


	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hue', function(){
			var opts = {space:'husl', channel:[0],min: [0], max:[360]};
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('husl-sat', function(){
			var opts = {space:'husl', channel:[1],min: [0], max:[100]};
			createRangeCase('s', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('husl-l', function(){
			var opts = {space:'husl', channel:[2],min: [0], max:[100]};
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});


		it('huslp-hue', function(){
			var opts = {space:'huslp', channel:[0],min: [0], max:[360]};
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('huslp-sat', function(){
			var opts = {space:'huslp', channel:[1],min: [0], max:[100]};
			createRangeCase('s', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('huslp-l', function(){
			var opts = {space:'huslp', channel:[2],min: [0], max:[100]};
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
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
			var opts = {space:'hsl', channel:[null, 0], min:[null, 0], max:[null, 360]};
			createRangeCase('hue', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('saturation', function(){
			var opts = {space:'hsl', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('saturation', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('lightness', function(){
			var opts = {space:'hsl', channel:[null, 2], min:[null, 0], max:[null, 100]};
			createRangeCase('lightness', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('brightness', function(){
			var opts = {space:'hsv', channel:[null, 2], min:[null, 0], max:[null, 100]};
			createRangeCase('brightness', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red', function(){
			var opts = {space:'rgb', channel:[null, 0], min:[null, 0], max:[null, 255]};
			createRangeCase('red', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('green', function(){
			var opts = {space:'rgb', channel:[null, 1], min:[null, 0], max:[null, 255]};
			createRangeCase('green', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('blue', function(){
			var opts = {space:'rgb', channel:[null, 2], min:[null, 0], max:[null, 255]};
			createRangeCase('blue', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan', function(){
			var opts = {space:'cmyk', channel:[null, 0], min:[null, 0], max:[null, 100]};
			createRangeCase('cyan', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('magenta', function(){
			var opts = {space:'cmyk', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('magenta', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('yellow', function(){
			var opts = {space:'cmyk', channel:[null, 2], min:[null, 0], max:[null, 100]};
			createRangeCase('yellow', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('black', function(){
			var opts = {space:'cmyk', channel:[null, 3], min:[null, 0], max:[null, 100]};
			createRangeCase('black', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x', function(){
			var opts = {space:'xyz', channel:[null, 0], min:[null, 0], max:[null, 95]};
			createRangeCase('x', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('y', function(){
			var opts = {space:'xyz', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('y', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('z', function(){
			var opts = {space:'xyz', channel:[null, 2], min:[null, 0], max:[null, 109]};
			createRangeCase('z', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L', function(){
			var opts = {space:'lab', channel:[null, 0], min:[null, 0], max:[null, 100]};
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('a', function(){
			var opts = {space:'lab', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('a', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('b', function(){
			var opts = {space:'lab', channel:[null, 2], min:[null, 0], max:[null, 100]};
			createRangeCase('b', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('l', function(){
			var opts = {space:'lchab', channel:[null, 0], min:[null, 0], max:[null, 100]};
			createRangeCase('l', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('c', function(){
			var opts = {space:'lchab', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('c', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h', function(){
			var opts = {space:'lchab', channel:[null, 2], min:[null, 0], max:[null, 360]};
			createRangeCase('h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('L(uv)', function(){
			var opts = {space:'luv', channel:[null, 0], min:[null, 0], max:[null, 100]};
			createRangeCase('L', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('u', function(){
			var opts = {space:'luv', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('u', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('v', function(){
			var opts = {space:'luv', channel:[null, 2], min:[null, 0], max:[null, 100]};
			createRangeCase('v', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('l(uv)', function(){
			var opts = {space:'lchuv', channel:[null, 0], min:[null, 0], max:[null, 100]};
			createRangeCase('lυν', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('c(uv)', function(){
			var opts = {space:'lchuv', channel:[null, 1], min:[null, 0], max:[null, 100]};
			createRangeCase('cυν', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h(uv)', function(){
			var opts = {space:'lchuv', channel:[null, 2], min:[null, 0], max:[null, 360]};
			createRangeCase('hυν', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
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
			var opts = {space:'hsl', channel:[0, 2], min:[0,100], max:[360, 0]};
			createRangeCase('h-l', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('hue-brightness', function(){
			var opts = {space:'hsv', channel:[0,2], min:[0,100], max:[360, 0]};
			createRangeCase('h-b', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('hue-saturation', function(){
			var opts = {space:'hsl', channel:[0,1], min:[0,100], max:[360, 0]};
			createRangeCase('h-s', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('hue-saturationv', function(){
			var opts = {space:'hsv', channel:[0,1], min:[0,100], max:[360, 0]};
			createRangeCase('h-sv', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('lightness-saturation', function(){
			var opts = {space:'hsl', channel:[2,1], min:[0,0], max:[100,100]};
			createRangeCase('l-s', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('saturation-brightness', function(){
			var opts = {space:'hsv', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('s-b', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('rgb', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('red-green', function(){
			var opts = {space:'rgb', channel:[0,1], min:[0,0], max:[255,255]};
			createRangeCase('r-g', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('red-blue', function(){
			var opts = {space:'rgb', channel:[0,2], min:[0,0], max:[255,255]};
			createRangeCase('r-b', 'polar', ranger.renderPolar(color.rgbArray(),  data, opts));
		});

		it('green-blue', function(){
			var opts = {space:'rgb', channel:[1,2], min:[0,0], max:[255,255]};
			createRangeCase('g-b', 'polar', ranger.renderPolar(color.rgbArray(),  data, opts));
		});
	});

	describe('cmyk', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('cyan-magenta', function(){
			var opts = {space:'cmyk', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('c-m', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('cyan-yellow', function(){
			var opts = {space:'cmyk', channel:[0,2], min:[0,0], max:[100,100]};
			createRangeCase('c-y', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('cyan-black', function(){
			var opts = {space:'cmyk', channel:[0,3], min:[0,0], max:[100,100]};
			createRangeCase('c-k', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('magenta-yellow', function(){
			var opts = {space:'cmyk', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('m-y', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('magenta-black', function(){
			var opts = {space:'cmyk', channel:[1,3], min:[0,0], max:[100,100]};
			createRangeCase('m-k', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});

		it('yellow-black', function(){
			var opts = {space:'cmyk', channel:[2,3], min:[0,0], max:[100,100]};
			createRangeCase('y-k', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('xyz', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('x-y', function(){
			var opts = {space:'xyz', channel:[0,1], min:[0,0], max:[95,100]};
			createRangeCase('x-y', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('x-z', function(){
			var opts = {space:'xyz', channel:[0,2], min:[0,0], max:[95,108]};
			createRangeCase('x-z', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('y-z', function(){
			var opts = {space:'xyz', channel:[1,2], min:[0,0], max:[100, 108]};
			createRangeCase('y-z', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('lab', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-a', function(){
			var opts = {space:'lab', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-a', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('l-b', function(){
			var opts = {space:'lab', channel:[0,2], min:[0,-100], max:[100,100]};
			createRangeCase('l-b', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('a-b', function(){
			var opts = {space:'lab', channel:[1,2], min:[-100,-100], max:[100,100]};
			createRangeCase('a-b', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('l-c', function(){
			var opts = {space:'lchab', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('l-c', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h-l', function(){
			var opts = {space:'lchab', channel:[2,0], min:[0,100], max:[360,0]};
			createRangeCase('l-h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h-c', function(){
			var opts = {space:'lchab', channel:[2,1], min:[0,100], max:[360,0]};
			createRangeCase('c-h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('luv', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('l-u', function(){
			var opts = {space:'luv', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-u', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('l-v', function(){
			var opts = {space:'luv', channel:[0,1], min:[0,-100], max:[100,100]};
			createRangeCase('l-v', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('u-v', function(){
			var opts = {space:'luv', channel:[1,2], min:[-100,-100], max:[100,100]};
			createRangeCase('u-v', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('l-cuv', function(){
			var opts = {space:'lchuv', channel:[0,1], min:[0,0], max:[100,100]};
			createRangeCase('l-c', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h-luv', function(){
			var opts = {space:'lchuv', channel:[2,0], min:[0,100], max:[360,0]};
			createRangeCase('l-h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('h-cuv', function(){
			var opts = {space:'lchuv', channel:[2,1], min:[0,100], max:[360,0]};
			createRangeCase('c-h', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
	});

	describe('husl', function(){
		before(function(){
			createSection(this.test.parent.title);
		});
		it('husl-hs', function(){
			var opts = {space:'husl', channel:[0,1], min:[0,100], max:[360,0]};
			createRangeCase('husl-hs', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('husl-hl', function(){
			var opts = {space:'husl', channel:[0,2], min:[0,100], max:[360,0]};
			createRangeCase('husl-hl', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('husl-sl', function(){
			var opts = {space:'husl', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('husl-sl', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});


		it('huslp-hs', function(){
			var opts = {space:'huslp', channel:[0,1], min:[0,100], max:[360,0]};
			createRangeCase('huslp-hs', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('huslp-hl', function(){
			var opts = {space:'huslp', channel:[0,2], min:[0,100], max:[360,0]};
			createRangeCase('huslp-hl', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
		});
		it('huslp-sl', function(){
			var opts = {space:'huslp', channel:[1,2], min:[0,0], max:[100,100]};
			createRangeCase('huslp-sl', 'polar', ranger.renderPolar(color.rgbArray(), data, opts));
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

		var opts = {
			space:'lchab',
			channel:[0,2],
			min:[0,0],
			max:[100,360]
		};
		createRangeCase('no-webworker', 'rect', ranger.renderRect(color.rgbArray(), data, opts));

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

			var opts = {rgb: color.rgbArray(), space: 'lchab', channel: [0,2], max: [100, 360], data: data, min:[0,0], id: 1};
			createRangeCase('webworker-transfer', 'rect', e.data.data);

			console.timeEnd('webworker-transfer');

			done();
		});

		//send request
		console.time('webworker-transfer');
		worker.postMessage([data], opts);
	});


	//TODO
	it.skip('webGL shaders', function(){

	});
});
