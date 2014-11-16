/**
 * Detailed tests are automatically filled via picky.js
 * There are just barebones to check whether thing doesn’t crash.
 */

var Color = require('color');
var renderRange = require('../');
var Emmy = require('emmy');


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




describe('performance', function(){
	var blobURL = URL.createObjectURL( new Blob([
		'var renderRange = ',
		renderRange.toString(),

		';(',
		function(){
			self.onmessage = function(e){
				var data = e.data;
				if (!data) return postMessage(false);

				console.log('got request', data);

				var data = renderRange(data.color, data.space, data.channels, data.data);

				postMessage(data);
			};
		}.toString(),
		')();'
	], { type: 'application/javascript' } ) ),

	worker = new Worker( blobURL );


	//hook up worker
	before(function(done){
		worker.postMessage();
		Emmy.one(worker, 'message', function(){
			done();
		});
	});


	it('no-webworker', function(){
		var bg = createRangeCase('no-webworker')

		console.time('no-webworker');
		renderRange(color.rgbArray(), 'hsl', [0,2], [360,100], data);
		ctx.putImageData(data, 0, 0);
		console.timeEnd('no-webworker');

		bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
	});


	it('clone', function(done){
		var bg = createRangeCase('clone')

		console.time('clone');
		worker.postMessage({rgb: color.rgbArray(), space: 'hsl', channels: [0,2], maxes: [360, 100], data: data});

		Emmy.one(worker, 'message', function(e){
			console.log('got clone response', e.data);
			ctx.putImageData(e.data, 0, 0);
			console.timeEnd('clone');

			done();
			bg.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
		});
	});


	it.skip('transfer', function(done){
		console.time('transfer');
		worker.postMessage(1);

		Emmy.one(worker, 'message', function(e){
			console.log('got transfer response', e.data);
			done();
			console.timeEnd('transfer');
		});
	});




	URL.revokeObjectURL( blobURL );
});