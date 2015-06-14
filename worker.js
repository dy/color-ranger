/**
 * Supposed to be used via webworkify.
 * Just use this code:
 *
 *	var work = require('webworkify');
 *	var worker = work(require('color-ranger/worker'));
 *
 *	worker.addEventListener('message', function (ev) {
 *		...
 *	});
 *
 *	worker.postMessage(data);
 *
 * @module  color-ranger/worker
 */
var render = require('./');

module.exports = function (self) {
	self.onmessage = function(e){
		var data = e.data, result;

		//ignore empty data
		if (!data) return postMessage(false);
		result = render(data.color, data.data, data);

		postMessage({
			data: result,
			id: e.data.id
		});
	};
};