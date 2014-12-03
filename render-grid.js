/**
 * Chess grid trivial renderer
 *
 * @module color-ranger/render-grid
 */

module.exports = renderGrid;


/**
 * Render transparency grid.
 * Image data is split in two equally
 *
 * @param {array} a Rgb values representing "white" cell
 * @param {array} b Rgb values representing "black" cell
 * @param {ImageData} imgData A data taken as a base for grid
 *
 * @return {ImageData} Return updated imageData
 */
function renderGrid(a, b, data){
	//suppose square data
	var w = Math.floor(Math.sqrt(data.length / 4)), h = w;

	var cellH = ~~(h/2);
	var cellW = ~~(w/2);

	//convert alphas to 255
	if (a.length === 4) a[3] *= 255;
	if (b.length === 4) b[3] *= 255;

	for (var y=0, col, row; y < h; y++){
		row = y * w * 4;
		for ( var x=0; x < w; x++){
			col = row + x * 4;
			data.set(x >= cellW ? (y >= cellH ? a : b) : (y >= cellH ? b : a), col);
		}
	}

	return data;
}