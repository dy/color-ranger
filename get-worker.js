/**
 * Create worker for rendering ranges
 *
 * @module color-ranger/render
 */

//TODO: make husl renderable via worker
// 		move full husl maths to color-space?
//		serialize full husl code?

module.exports = getWorker;


var render = require('./render');
var renderPolar = require('./render-polar');
var renderRect = require('./render-rect');

/**
 * Return a new worker, if supported
 *
 * @param {object} spaces A set of spaces to init in web-worker
 *
 * @return {Worker}  A web-worker, accepting messages with data:
 *                   {
 *                   	rgb: rgbArray,
 *                   	type: ('polar'|'rect')
 *                   	space: '<spaceName>,
 *                   	channel: <channel indexes>,
 *                   	max: [360, 100],
 *                   	min: [360, 100],
 *                   	data: ImageData,
 *                   	id: 1
 *                   }
 *                   The data is the same as arguments for the `render` method
 *                   except for `id`, which is returned in response unchanged
 *                   to identify the request.
 */
function getWorker(spaces){
	//inline worker - isn’t slower on init & work than a file loader
	// call URL.revokeObjectURL( blobURL ); if you’re finished
	var blobURL = URL.createObjectURL( new Blob([
		//export `color-ranger`
		'var render = ', render.toString() + '\n',
		'var renderRect = ', renderRect.toString() + '\n',
		'var renderPolar = ', renderPolar.toString() + '\n',

		//export `color-space`
		(function(c){
			var res = 'var convert = {};\n';
			var fnSrc;
			for (var space in c) {
				res += '\nvar ' + space + ' = convert.' + space + ' = {\n';

				for (var prop in c[space]) {
					if (typeof c[space][prop] === 'function') {
						fnSrc = c[space][prop].toString();
						//replace medium converters refs
						fnSrc = fnSrc.replace('[toSpaceName]', '.' + prop);
						fnSrc = fnSrc.replace('fromSpace', space);

						res += prop + ':' + fnSrc + ',\n';
					} else {
						res += prop + ':' + JSON.stringify(c[space][prop]) + ',\n';
					}
				}

				res += '}\n';
			}

			return res;
		})(spaces),

		//export message handler
		';(',
		function(){
			self.onmessage = function(e){
				var data = e.data, result;

				//ignore empty data
				if (!data) return postMessage(false);

				if (data.type === 'polar') {
					result = renderPolar(data.rgb, data.space, data.channel, data.min, data.max, data.data);
				} else {
					result = renderRect(data.rgb, data.space, data.channel, data.min, data.max, data.data);
				}

				postMessage({
					data: result,
					id: e.data.id
				});
			};
		}.toString(),
		')();'
	], { type: 'application/javascript' } ) );

	var worker = new Worker(blobURL);

	return worker;
}