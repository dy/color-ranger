/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var renderRange = require('../');
var Emmy = require('emmy');
var converter = require('color-convert/conversions');


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


describe('linear',function(){
	it('hue', function(){
		renderRange(color.rgbArray(), 'hsl', [0], [360], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('hue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation', function(){
		renderRange(color.rgbArray(), 'hsl', [1], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('saturation').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('lightness', function(){
		renderRange(color.rgbArray(), 'hsl', [2], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('lightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('brightness', function(){
		renderRange(color.rgbArray(), 'hsv', [2], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('brightness').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red', function(){
		renderRange(color.rgbArray(), 'rgb', [0], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('red').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green', function(){
		renderRange(color.rgbArray(), 'rgb', [1], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('green').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('blue', function(){
		renderRange(color.rgbArray(), 'rgb', [2], [255], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('blue').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it.skip('alpha', function(){
		createRangeCase('alpha').style.background = range.linear.alpha(c, direction);
		createRangeCase('alphac').style.background = range.canvasify(c, 'alpha', [0]);
	});

	it('cyan', function(){
		renderRange(color.rgbArray(), 'cmyk', [0], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('cyan').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta', function(){
		renderRange(color.rgbArray(), 'cmyk', [1], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('magenta').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow', function(){
		renderRange(color.rgbArray(), 'cmyk', [2], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('yellow').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('black', function(){
		renderRange(color.rgbArray(), 'cmyk', [3], [100], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('black').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});


describe('rectangular', function(){
	it('hue-lightness', function(){
		renderRange(color.rgbArray(), 'hsl', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-brightness', function(){
		renderRange(color.rgbArray(), 'hsv', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturation', function(){
		renderRange(color.rgbArray(), 'hsl', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-s').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('hue-saturationv', function(){
		renderRange(color.rgbArray(), 'hsv', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('h-sv').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-lightness', function(){
		renderRange(color.rgbArray(), 'hsl', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-l').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('saturation-brightness', function(){
		renderRange(color.rgbArray(), 'hsv', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('s-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-green', function(){
		renderRange(color.rgbArray(), 'rgb', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-g').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('red-blue', function(){
		renderRange(color.rgbArray(), 'rgb', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('r-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('green-blue', function(){
		renderRange(color.rgbArray(), 'rgb', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('g-b').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-magenta', function(){
		renderRange(color.rgbArray(), 'cmyk', [0,1], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-m').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-yellow', function(){
		renderRange(color.rgbArray(), 'cmyk', [0,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-black', function(){
		renderRange(color.rgbArray(), 'cmyk', [0,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('cyan-black', function(){
		renderRange(color.rgbArray(), 'cmyk', [0,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('c-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-yellow', function(){
		renderRange(color.rgbArray(), 'cmyk', [1,2], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-y').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('magenta-black', function(){
		renderRange(color.rgbArray(), 'cmyk', [1,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('m-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});

	it('yellow-black', function(){
		renderRange(color.rgbArray(), 'cmyk', [2,3], data);
		ctx.putImageData(data, 0, 0);
		createRangeCase('y-k').style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});
});




describe('performance', function(){
	var worker;


	//hook up worker
	before(function(done){
		console.time('blobStart');

		//inline worker - isn’t slower than file loader
		var blobURL = URL.createObjectURL( new Blob([
			'var renderRange = ',
			renderRange.toString() + '\n',

			(function(c){
				var res = '';
				for (var fn in c) {
					res += c[fn].toString() + '\n';
				}
				res += '\nvar converter = {';
				for (var fn in c) {
					res += fn + ':' + c[fn].toString() + ',\n';
				}
				return res + '}\n';
			})(converter),

			';(',
			function(){
				self.onmessage = function(e){
					var data = e.data;
					// console.log('got request', data);
					if (!data) return postMessage(false);


					var data = renderRange(data.rgb, data.space, data.channels, data.maxes, data.data);

					postMessage(data);
				};
			}.toString(),
			')();'
		], { type: 'application/javascript' } ) );

		worker = new Worker(blobURL);

		//external worker
		// worker = new Worker( '../worker.js' );


		worker.postMessage('');
		Emmy.one(worker, 'message', function(){
			done();
			console.timeEnd('blobStart');
		});

	});


	it('no-webworker', function(){
		var bg = createRangeCase('no-webworker')

		console.time('no-webworker');
		renderRange(color.rgbArray(), 'lch', [0,2], [100,360], data);
		ctx.putImageData(data, 0, 0);
		console.timeEnd('no-webworker');

		bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});


	it('clone', function(done){
		var bg = createRangeCase('webworker-clone')

		console.time('clone');
		worker.postMessage({rgb: color.rgbArray(), space: 'lch', channels: [0,2], maxes: [100, 360], data: data});

		Emmy.one(worker, 'message', function(e){
			ctx.putImageData(e.data, 0, 0);
			console.timeEnd('clone');

			done();
			bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	//image data isn’t transferable yet
	it.skip('transfer', function(done){
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


	// URL.revokeObjectURL( blobURL );
});