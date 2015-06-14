require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"../":[function(require,module,exports){
/**
 * A somewhat abstract renderer.
 *
 * @module color-ranger/render
 */

module.exports = render;


var convert = require('color-space');


//default options for default rendering
var defaults = {
	channel: [0,1],
	space: 'rgb'
};


//37 is the most optimal calc size
//you can scale resulting image with no significant quality loss

/**
 * Render passed rectangular range for the color to imageData.
 *
 * @param {array} rgb A list of rgb values + optional alpha
 * @param {string} space A space to render, no alpha-suffix
 * @param {array} channels List of channel indexes to render
 * @param {array} mins Min values to render range (can be different than space mins)
 * @param {array} maxes Max values to render range (can be different than space maxes)
 * @param {UInt8CappedArray} buffer An image data buffer
 * @param {function} calc A calculator for the step color
 *
 * @return {ImageData} ImageData containing a range
 */
function render(rgba, buffer, opts) {
	if (!buffer || !buffer.length) throw Error('Buffer must be a valid non-empty UInt8CappedArray');

	// console.time('canv');
	var size = opts.size || [Math.floor(Math.sqrt(buffer.length / 4))];
	if (size.length === 1) {
		size[1] = size[0];
	}

	var space = opts.space = opts.space || defaults.space;
	var channels = opts.channel = opts.channel !== undefined ? opts.channel : defaults.channel;

	var mins = opts.min || [],
		maxes = opts.max || [];

	var calc = opts.type === 'polar' ?  calcPolarStep : calcRectStep;

	//take mins/maxes of target space’s channels
	for (var i = 0; i < channels.length; i++) {
		if (mins.length < channels.length) {
			mins[i] = convert[space].min[channels[i]] || 0;
		}
		if (maxes.length < channels.length) {
			maxes[i] = convert[space].max[channels[i]] || 255;
		}
	}

	var isCMYK = space === 'cmyk';

	//add alpha
	if (rgba.length === 4) {rgba[3] *= 255;}
	if (rgba.length === 3) {rgba[3] = 255;}

	//get specific space values
	var values;
	if (space === 'rgb') {
		values = rgba.slice();
	} else {
		values = convert.rgb[space](rgba);
		if (!isCMYK && values.length === 3) {
			values[3] = rgba[3];
		}
	}

	//resolve absent indexes
	var noIdx = [];
	for (i = space.length; i--;) {
		if (i !== channels[0] && i !== channels[1]) {
			noIdx.push(i);
		}
	}
	var noIdx1 = noIdx[0];
	var noIdx2 = noIdx[1];
	var noIdx3 = noIdx[2];

	//get converting fn
	var converter = space === 'rgb' ? function(a) {return a;} : convert[space].rgb;

	for (var x, y = size[1], row, col, res, stepVals = values.slice(); y--;) {
		row = y * size[0] * 4;

		for (x = 0; x < size[0]; x++) {
			col = row + x * 4;

			//calculate color
			stepVals = calc(x,y, stepVals, size, channels, mins, maxes);

			if (noIdx1 || noIdx1 === 0) {
				stepVals[noIdx1] = values[noIdx1];
			}
			if (noIdx2 || noIdx2 === 0) {
				stepVals[noIdx2] = values[noIdx2];
			}
			if (noIdx3 || noIdx3 === 0) {
				stepVals[noIdx3] = values[noIdx3];
			}

			//fill image data
			res = converter(stepVals);
			res[3] = isCMYK ? 255 : stepVals[3];

			buffer.set(res, col);
		}
	}

	return buffer;


	/**
	 * Calculate polar step
	 *
	 * @param {[type]} x [description]
	 * @param {[type]} y [description]
	 * @param {[type]} vals [description]
	 * @param {[type]} size [description]
	 * @param {[type]} channels [description]
	 * @param {[type]} mins [description]
	 * @param {[type]} maxes [description]
	 *
	 * @return {[type]} [description]
	 */
	function calcPolarStep(x,y, vals, size, channels, mins, maxes) {
		//cet center
		var cx = size[0]/2, cy = size[1]/2;

		//get radius
		var r = Math.sqrt((cx-x)*(cx-x) + (cy-y)*(cy-y));

		//normalize radius
		var nr = r / cx;

		//get angle
		var a = Math.atan2( cy-y, cx-x );

		//get normalized angle (avoid negative values)
		var na = (a + Math.PI)/Math.PI/2;


		//ch 1 is radius
		if (channels[1] || channels[1] === 0) {
			vals[channels[1]] = mins[1] + (maxes[1] - mins[1]) * nr;
		}

		//ch 2 is angle
		if (channels[0] || channels[0] === 0) {
			vals[channels[0]] = mins[0] + (maxes[0] - mins[0]) * na;
		}

		return vals;
	}


	/**
	 * Calculate step values for a rectangular range
	 *
	 * @param {array} vals step values to calc
	 * @param {array} size size of rect
	 * @param {array} mins min c1,c2
	 * @param {array} maxes max c1,c2
	 *
	 * @return {array} [description]
	 */
	function calcRectStep(x,y, vals, size, channels, mins, maxes) {
		if (channels[1] || channels[1] === 0) {
			vals[channels[1]] = mins[1] + (maxes[1] - mins[1]) * (1 - y / (size[1] - 1));
		}
		if (channels[0] || channels[0] === 0) {
			vals[channels[0]] = mins[0] + (maxes[0] - mins[0]) * x / (size[0] - 1);
		}
		return vals;
	}
}


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
render.chess = function (a, b, data) {
	//suppose square data
	var w = Math.floor(Math.sqrt(data.length / 4)), h = w;

	var cellH = ~~(h/2);
	var cellW = ~~(w/2);

	//convert alphas to 255
	if (a.length === 4) a[3] *= 255;
	if (b.length === 4) b[3] *= 255;

	for (var y=0, col, row; y < h; y++) {
		row = y * w * 4;
		for ( var x=0; x < w; x++) {
			col = row + x * 4;
			data.set(x >= cellW ? (y >= cellH ? a : b) : (y >= cellH ? b : a), col);
		}
	}

	return data;
};
},{"color-space":"color-space"}],"../worker":[function(require,module,exports){
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

		result = render(data.rgb, data.data, data);

		postMessage({
			data: result,
			id: e.data.id
		});
	};
};
},{"./":"../"}],1:[function(require,module,exports){
/**
 * @module color-space/cmyk
 */

var rgb = require('./rgb');

module.exports = {
	name: 'cmyk',
	min: [0,0,0,0],
	max: [100,100,100,100],
	channel: ['cyan', 'magenta', 'yellow', 'black'],

	rgb: function(cmyk) {
		var c = cmyk[0] / 100,
				m = cmyk[1] / 100,
				y = cmyk[2] / 100,
				k = cmyk[3] / 100,
				r, g, b;

		r = 1 - Math.min(1, c * (1 - k) + k);
		g = 1 - Math.min(1, m * (1 - k) + k);
		b = 1 - Math.min(1, y * (1 - k) + k);
		return [r * 255, g * 255, b * 255];
	}
};


//extend rgb
rgb.cmyk = function(rgb) {
	var r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			c, m, y, k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;
	return [c * 100, m * 100, y * 100, k * 100];
};
},{"./rgb":12}],2:[function(require,module,exports){
/**
 * @module color-space/hsl
 */

var rgb = require('./rgb');

module.exports = {
	name: 'hsl',
	min: [0,0,0],
	max: [360,100,100],
	channel: ['hue', 'saturation', 'lightness'],

	rgb: function(hsl) {
		var h = hsl[0] / 360,
				s = hsl[1] / 100,
				l = hsl[2] / 100,
				t1, t2, t3, rgb, val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		}
		else {
			t2 = l + s - l * s;
		}
		t1 = 2 * l - t2;

		rgb = [0, 0, 0];
		for (var i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * - (i - 1);
			if (t3 < 0) {
				t3++;
			}
			else if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			}
			else if (2 * t3 < 1) {
				val = t2;
			}
			else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			}
			else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	}
};


//extend rgb
rgb.hsl = function(rgb) {
	var r = rgb[0]/255,
			g = rgb[1]/255,
			b = rgb[2]/255,
			min = Math.min(r, g, b),
			max = Math.max(r, g, b),
			delta = max - min,
			h, s, l;

	if (max === min) {
		h = 0;
	}
	else if (r === max) {
		h = (g - b) / delta;
	}
	else if (g === max) {
		h = 2 + (b - r) / delta;
	}
	else if (b === max) {
		h = 4 + (r - g)/ delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	}
	else if (l <= 0.5) {
		s = delta / (max + min);
	}
	else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};
},{"./rgb":12}],3:[function(require,module,exports){
/**
 * @module color-space/hsv
 */

var rgb = require('./rgb');
var hsl = require('./hsl');

module.exports = {
	name: 'hsv',
	min: [0,0,0],
	max: [360,100,100],
	channel: ['hue', 'saturation', 'value'],
	alias: ['hsb'],

	rgb: function(hsv) {
		var h = hsv[0] / 60,
				s = hsv[1] / 100,
				v = hsv[2] / 100,
				hi = Math.floor(h) % 6;

		var f = h - Math.floor(h),
				p = 255 * v * (1 - s),
				q = 255 * v * (1 - (s * f)),
				t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch(hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	},

	hsl: function(hsv) {
		var h = hsv[0],
			s = hsv[1] / 100,
			v = hsv[2] / 100,
			sl, l;

		l = (2 - s) * v;
		sl = s * v;
		sl /= (l <= 1) ? l : 2 - l;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	}
};


//append rgb
rgb.hsv = function(rgb) {
	var r = rgb[0],
			g = rgb[1],
			b = rgb[2],
			min = Math.min(r, g, b),
			max = Math.max(r, g, b),
			delta = max - min,
			h, s, v;

	if (max === 0) {
		s = 0;
	}
	else {
		s = (delta/max * 1000)/10;
	}

	if (max === min) {
		h = 0;
	}
	else if (r === max) {
		h = (g - b) / delta;
	}
	else if (g === max) {
		h = 2 + (b - r) / delta;
	}
	else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	v = ((max / 255) * 1000) / 10;

	return [h, s, v];
};



//extend hsl
hsl.hsv = function(hsl) {
	var h = hsl[0],
			s = hsl[1] / 100,
			l = hsl[2] / 100,
			sv, v;
	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	v = (l + s) / 2;
	sv = (2 * s) / (l + s) || 0;

	return [h, sv * 100, v * 100];
};
},{"./hsl":2,"./rgb":12}],4:[function(require,module,exports){
/**
 * A uniform wrapper for husl.
 * // http://www.boronine.com/husl/
 *
 * @module color-space/husl
 */

var xyz = require('./xyz');
var lchuv = require('./lchuv');
var _husl = require('husl');


module.exports = {
	name: 'husl',
	min: [0,0,0],
	max: [360,100,100],
	channel: ['hue', 'saturation', 'lightness'],

	lchuv: _husl._conv.husl.lch,

	xyz: function(arg){
		return lchuv.xyz(_husl._conv.husl.lch(arg));
	},

	//a shorter way to convert to huslp
	huslp: function(arg){
		return _husl._conv.lch.huslp( _husl._conv.husl.lch(arg));
	}
};

//extend lchuv, xyz
lchuv.husl = _husl._conv.lch.husl;
xyz.husl = function(arg){
	return _husl._conv.lch.husl(xyz.lchuv(arg));
};
},{"./lchuv":9,"./xyz":14,"husl":11}],5:[function(require,module,exports){
/**
 * A uniform wrapper for huslp.
 * // http://www.boronine.com/husl/
 *
 * @module color-space/huslp
 */

var xyz = require('./xyz');
var lchuv = require('./lchuv');
var _husl = require('husl');

module.exports = {
	name: 'huslp',
	min: [0,0,0],
	max: [360,100,100],
	channel: ['hue', 'saturation', 'lightness'],

	lchuv: _husl._conv.huslp.lch,
	xyz: function(arg){return lchuv.xyz(_husl._conv.huslp.lch(arg));},

	//a shorter way to convert to husl
	husl: function(arg){
		return _husl._conv.lch.husl( _husl._conv.huslp.lch(arg));
	}
};

//extend lchuv, xyz
lchuv.huslp = _husl._conv.lch.huslp;
xyz.huslp = function(arg){return _husl._conv.lch.huslp(xyz.lchuv(arg));};
},{"./lchuv":9,"./xyz":14,"husl":11}],6:[function(require,module,exports){
/**
 * @module color-space/hwb
 */

var rgb = require('./rgb');
var hsv = require('./hsv');
var hsl = require('./hsl');


var hwb = module.exports = {
	name: 'hwb',
	min: [0,0,0],
	max: [360,100,100],
	channel: ['hue', 'whiteness', 'blackness'],

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	rgb: function(hwb) {
		var h = hwb[0] / 360,
			wh = hwb[1] / 100,
			bl = hwb[2] / 100,
			ratio = wh + bl,
			i, v, f, n;

		var r, g, b;

		// wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		i = Math.floor(6 * h);
		v = 1 - bl;
		f = 6 * h - i;

		//if it is even
		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		n = wh + f * (v - wh);  // linear interpolation

		switch (i) {
			default:
			case 6:
			case 0: r = v; g = n; b = wh; break;
			case 1: r = n; g = v; b = wh; break;
			case 2: r = wh; g = v; b = n; break;
			case 3: r = wh; g = n; b = v; break;
			case 4: r = n; g = wh; b = v; break;
			case 5: r = v; g = wh; b = n; break;
		}

		return [r * 255, g * 255, b * 255];
	},


	// http://alvyray.com/Papers/CG/HWB_JGTv208.pdf
	hsv: function(arg){
		var h = arg[0], w = arg[1], b = arg[2], s, v;

		//if w+b > 100% - take proportion (how many times )
		if (w + b >= 100){
			s = 0;
			v = 100 * w/(w+b);
		}

		//by default - take wiki formula
		else {
			s = 100-(w/(1-b/100));
			v = 100-b;
		}


		return [h, s, v];
	},

	hsl: function(arg){
		return hsv.hsl(hwb.hsv(arg));
	}
};


//extend rgb
rgb.hwb = function(val) {
	var r = val[0],
			g = val[1],
			b = val[2],
			h = rgb.hsl(val)[0],
			w = 1/255 * Math.min(r, Math.min(g, b));

			b = 1 - 1/255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};



//keep proper hue on 0 values (conversion to rgb loses hue on zero-lightness)
hsv.hwb = function(arg){
	var h = arg[0], s = arg[1], v = arg[2];
	return [h, v === 0 ? 0 : (v * (1-s/100)), 100 - v];
};


//extend hsl with proper conversions
hsl.hwb = function(arg){
	return hsv.hwb(hsl.hsv(arg));
};
},{"./hsl":2,"./hsv":3,"./rgb":12}],7:[function(require,module,exports){
/**
 * CIE LAB space model
 *
 * @module color-space/lab
 */

var xyz = require('./xyz');

module.exports = {
	name: 'lab',
	min: [0,-100,-100],
	max: [100,100,100],
	channel: ['lightness', 'a', 'b'],
	alias: ['cielab'],

	xyz: function(lab) {
		var l = lab[0],
				a = lab[1],
				b = lab[2],
				x, y, z, y2;

		if (l <= 8) {
			y = (l * 100) / 903.3;
			y2 = (7.787 * (y / 100)) + (16 / 116);
		} else {
			y = 100 * Math.pow((l + 16) / 116, 3);
			y2 = Math.pow(y / 100, 1/3);
		}

		x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

		z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

		return [x, y, z];
	}
};


//extend xyz
xyz.lab = function(xyz){
	var x = xyz[0],
			y = xyz[1],
			z = xyz[2],
			l, a, b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};
},{"./xyz":14}],8:[function(require,module,exports){
/**
 * Cylindrical LAB
 *
 * @module color-space/lchab
 */

var xyz = require('./xyz');
var lab = require('./lab');


//cylindrical lab
var lchab = module.exports = {
	name: 'lchab',
	min: [0,0,0],
	max: [100,100,360],
	channel: ['lightness', 'chroma', 'hue'],
	alias: ['cielch', 'lch'],

	xyz: function(arg) {
		return lab.xyz(lchab.lab(arg));
	},

	lab: function(lch) {
		var l = lch[0],
				c = lch[1],
				h = lch[2],
				a, b, hr;

		hr = h / 360 * 2 * Math.PI;
		a = c * Math.cos(hr);
		b = c * Math.sin(hr);
		return [l, a, b];
	}
};


//extend lab
lab.lchab = function(lab) {
	var l = lab[0],
			a = lab[1],
			b = lab[2],
			hr, h, c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;
	if (h < 0) {
		h += 360;
	}
	c = Math.sqrt(a * a + b * b);
	return [l, c, h];
};

xyz.lchab = function(arg){
	return lab.lchab(xyz.lab(arg));
};
},{"./lab":7,"./xyz":14}],9:[function(require,module,exports){
/**
 * Cylindrical CIE LUV
 *
 * @module color-space/lchuv
 */

var luv = require('./luv');
var xyz = require('./xyz');

//cylindrical luv
var lchuv = module.exports = {
	name: 'lchuv',
	channel: ['lightness', 'chroma', 'hue'],
	alias: ['cielchuv'],
	min: [0,0,0],
	max: [100,100,360],

	luv: function(luv){
		var l = luv[0],
		c = luv[1],
		h = luv[2],
		u, v, hr;

		hr = h / 360 * 2 * Math.PI;
		u = c * Math.cos(hr);
		v = c * Math.sin(hr);
		return [l, u, v];
	},

	xyz: function(arg) {
		return luv.xyz(lchuv.luv(arg));
	},
};

luv.lchuv = function(luv){
	var l = luv[0], u = luv[1], v = luv[2];

	var c = Math.sqrt(u*u + v*v);
	var hr = Math.atan2(v,u);
	var h = hr * 360 / 2 / Math.PI;
	if (h < 0) {
		h += 360;
	}

	return [l,c,h]
};

xyz.lchuv = function(arg){
  return luv.lchuv(xyz.luv(arg));
};
},{"./luv":10,"./xyz":14}],10:[function(require,module,exports){
/**
 * CIE LUV (C'est la vie)
 *
 * @module color-space/luv
 */

var xyz = require('./xyz');

module.exports = {
	name: 'luv',
	//NOTE: luv has no rigidly defined limits
	//easyrgb fails to get proper coords
	//boronine states no rigid limits
	//colorMine refers this ones:
	min: [0,-134,-140],
	max: [100,224,122],
	channel: ['lightness', 'u', 'v'],
	alias: ['cieluv'],

	xyz: function(arg, i, o){
		var _u, _v, l, u, v, x, y, z, xn, yn, zn, un, vn;
		l = arg[0], u = arg[1], v = arg[2];

		if (l === 0) return [0,0,0];

		//get constants
		var e = 0.008856451679035631; //(6/29)^3
		var k = 0.0011070564598794539; //(3/29)^3

		//get illuminant/observer
		i = i || 'D65';
		o = o || 2;

		xn = xyz.whitepoint[o][i][0];
		yn = xyz.whitepoint[o][i][1];
		zn = xyz.whitepoint[o][i][2];

		un = (4 * xn) / (xn + (15 * yn) + (3 * zn));
		vn = (9 * yn) / (xn + (15 * yn) + (3 * zn));
		// un = 0.19783000664283;
		// vn = 0.46831999493879;


		_u = u / (13 * l) + un || 0;
		_v = v / (13 * l) + vn || 0;

		y = l > 8 ? yn * Math.pow( (l + 16) / 116 , 3) : yn * l * k;

		//wikipedia method
		x = y * 9 * _u / (4 * _v) || 0;
		z = y * (12 - 3 * _u - 20 * _v) / (4 * _v) || 0;

		//boronine method
		//https://github.com/boronine/husl/blob/master/husl.coffee#L201
		// x = 0 - (9 * y * _u) / ((_u - 4) * _v - _u * _v);
		// z = (9 * y - (15 * _v * y) - (_v * x)) / (3 * _v);

		return [x, y, z];
	}
};

// http://www.brucelindbloom.com/index.html?Equations.html
// https://github.com/boronine/husl/blob/master/husl.coffee
//i - illuminant
//o - observer
xyz.luv = function(arg, i, o) {
	var _u, _v, l, u, v, x, y, z, xn, yn, zn, un, vn;

	//get constants
	var e = 0.008856451679035631; //(6/29)^3
	var k = 903.2962962962961; //(29/3)^3

	//get illuminant/observer coords
	i = i || 'D65';
	o = o || 2;

	xn = xyz.whitepoint[o][i][0];
	yn = xyz.whitepoint[o][i][1];
	zn = xyz.whitepoint[o][i][2];

	un = (4 * xn) / (xn + (15 * yn) + (3 * zn));
	vn = (9 * yn) / (xn + (15 * yn) + (3 * zn));


	x = arg[0], y = arg[1], z = arg[2];


	_u = (4 * x) / (x + (15 * y) + (3 * z)) || 0;
	_v = (9 * y) / (x + (15 * y) + (3 * z)) || 0;

	var yr = y/yn;

	l = yr <= e ? k * yr : 116 * Math.pow(yr, 1/3) - 16;

	u = 13 * l * (_u - un);
	v = 13 * l * (_v - vn);

	return [l, u, v];
};
},{"./xyz":14}],11:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
(function() {
  var L_to_Y, Y_to_L, conv, distanceFromPole, dotProduct, epsilon, fromLinear, getBounds, intersectLineLine, kappa, lengthOfRayUntilIntersect, m, m_inv, maxChromaForLH, maxSafeChromaForL, refU, refV, refX, refY, refZ, rgbPrepare, root, round, toLinear;

  m = {
    R: [3.240969941904521, -1.537383177570093, -0.498610760293],
    G: [-0.96924363628087, 1.87596750150772, 0.041555057407175],
    B: [0.055630079696993, -0.20397695888897, 1.056971514242878]
  };

  m_inv = {
    X: [0.41239079926595, 0.35758433938387, 0.18048078840183],
    Y: [0.21263900587151, 0.71516867876775, 0.072192315360733],
    Z: [0.019330818715591, 0.11919477979462, 0.95053215224966]
  };

  refX = 0.95045592705167;

  refY = 1.0;

  refZ = 1.089057750759878;

  refU = 0.19783000664283;

  refV = 0.46831999493879;

  kappa = 903.2962962;

  epsilon = 0.0088564516;

  getBounds = function(L) {
    var bottom, channel, m1, m2, m3, ret, sub1, sub2, t, top1, top2, _i, _j, _len, _len1, _ref, _ref1, _ref2;
    sub1 = Math.pow(L + 16, 3) / 1560896;
    sub2 = sub1 > epsilon ? sub1 : L / kappa;
    ret = [];
    _ref = ['R', 'G', 'B'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      channel = _ref[_i];
      _ref1 = m[channel], m1 = _ref1[0], m2 = _ref1[1], m3 = _ref1[2];
      _ref2 = [0, 1];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        t = _ref2[_j];
        top1 = (284517 * m1 - 94839 * m3) * sub2;
        top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
        bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
        ret.push([top1 / bottom, top2 / bottom]);
      }
    }
    return ret;
  };

  intersectLineLine = function(line1, line2) {
    return (line1[1] - line2[1]) / (line2[0] - line1[0]);
  };

  distanceFromPole = function(point) {
    return Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2));
  };

  lengthOfRayUntilIntersect = function(theta, line) {
    var b1, len, m1;
    m1 = line[0], b1 = line[1];
    len = b1 / (Math.sin(theta) - m1 * Math.cos(theta));
    if (len < 0) {
      return null;
    }
    return len;
  };

  maxSafeChromaForL = function(L) {
    var b1, lengths, m1, x, _i, _len, _ref, _ref1;
    lengths = [];
    _ref = getBounds(L);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], m1 = _ref1[0], b1 = _ref1[1];
      x = intersectLineLine([m1, b1], [-1 / m1, 0]);
      lengths.push(distanceFromPole([x, b1 + x * m1]));
    }
    return Math.min.apply(Math, lengths);
  };

  maxChromaForLH = function(L, H) {
    var hrad, l, lengths, line, _i, _len, _ref;
    hrad = H / 360 * Math.PI * 2;
    lengths = [];
    _ref = getBounds(L);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      l = lengthOfRayUntilIntersect(hrad, line);
      if (l !== null) {
        lengths.push(l);
      }
    }
    return Math.min.apply(Math, lengths);
  };

  dotProduct = function(a, b) {
    var i, ret, _i, _ref;
    ret = 0;
    for (i = _i = 0, _ref = a.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      ret += a[i] * b[i];
    }
    return ret;
  };

  round = function(num, places) {
    var n;
    n = Math.pow(10, places);
    return Math.round(num * n) / n;
  };

  fromLinear = function(c) {
    if (c <= 0.0031308) {
      return 12.92 * c;
    } else {
      return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }
  };

  toLinear = function(c) {
    var a;
    a = 0.055;
    if (c > 0.04045) {
      return Math.pow((c + a) / (1 + a), 2.4);
    } else {
      return c / 12.92;
    }
  };

  rgbPrepare = function(tuple) {
    var ch, n, _i, _j, _len, _len1, _results;
    tuple = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tuple.length; _i < _len; _i++) {
        n = tuple[_i];
        _results.push(round(n, 3));
      }
      return _results;
    })();
    for (_i = 0, _len = tuple.length; _i < _len; _i++) {
      ch = tuple[_i];
      if (ch < -0.0001 || ch > 1.0001) {
        throw new Error("Illegal rgb value: " + ch);
      }
      if (ch < 0) {
        ch = 0;
      }
      if (ch > 1) {
        ch = 1;
      }
    }
    _results = [];
    for (_j = 0, _len1 = tuple.length; _j < _len1; _j++) {
      ch = tuple[_j];
      _results.push(Math.round(ch * 255));
    }
    return _results;
  };

  conv = {
    'xyz': {},
    'luv': {},
    'lch': {},
    'husl': {},
    'huslp': {},
    'rgb': {},
    'hex': {}
  };

  conv.xyz.rgb = function(tuple) {
    var B, G, R;
    R = fromLinear(dotProduct(m.R, tuple));
    G = fromLinear(dotProduct(m.G, tuple));
    B = fromLinear(dotProduct(m.B, tuple));
    return [R, G, B];
  };

  conv.rgb.xyz = function(tuple) {
    var B, G, R, X, Y, Z, rgbl;
    R = tuple[0], G = tuple[1], B = tuple[2];
    rgbl = [toLinear(R), toLinear(G), toLinear(B)];
    X = dotProduct(m_inv.X, rgbl);
    Y = dotProduct(m_inv.Y, rgbl);
    Z = dotProduct(m_inv.Z, rgbl);
    return [X, Y, Z];
  };

  Y_to_L = function(Y) {
    if (Y <= epsilon) {
      return (Y / refY) * kappa;
    } else {
      return 116 * Math.pow(Y / refY, 1 / 3) - 16;
    }
  };

  L_to_Y = function(L) {
    if (L <= 8) {
      return refY * L / kappa;
    } else {
      return refY * Math.pow((L + 16) / 116, 3);
    }
  };

  conv.xyz.luv = function(tuple) {
    var L, U, V, X, Y, Z, varU, varV;
    X = tuple[0], Y = tuple[1], Z = tuple[2];
    varU = (4 * X) / (X + (15 * Y) + (3 * Z));
    varV = (9 * Y) / (X + (15 * Y) + (3 * Z));
    L = Y_to_L(Y);
    if (L === 0) {
      return [0, 0, 0];
    }
    U = 13 * L * (varU - refU);
    V = 13 * L * (varV - refV);
    return [L, U, V];
  };

  conv.luv.xyz = function(tuple) {
    var L, U, V, X, Y, Z, varU, varV;
    L = tuple[0], U = tuple[1], V = tuple[2];
    if (L === 0) {
      return [0, 0, 0];
    }
    varU = U / (13 * L) + refU;
    varV = V / (13 * L) + refV;
    Y = L_to_Y(L);
    X = 0 - (9 * Y * varU) / ((varU - 4) * varV - varU * varV);
    Z = (9 * Y - (15 * varV * Y) - (varV * X)) / (3 * varV);
    return [X, Y, Z];
  };

  conv.luv.lch = function(tuple) {
    var C, H, Hrad, L, U, V;
    L = tuple[0], U = tuple[1], V = tuple[2];
    C = Math.pow(Math.pow(U, 2) + Math.pow(V, 2), 1 / 2);
    Hrad = Math.atan2(V, U);
    H = Hrad * 360 / 2 / Math.PI;
    if (H < 0) {
      H = 360 + H;
    }
    return [L, C, H];
  };

  conv.lch.luv = function(tuple) {
    var C, H, Hrad, L, U, V;
    L = tuple[0], C = tuple[1], H = tuple[2];
    Hrad = H / 360 * 2 * Math.PI;
    U = Math.cos(Hrad) * C;
    V = Math.sin(Hrad) * C;
    return [L, U, V];
  };

  conv.husl.lch = function(tuple) {
    var C, H, L, S, max;
    H = tuple[0], S = tuple[1], L = tuple[2];
    if (L > 99.9999999) {
      return [100, 0, H];
    }
    if (L < 0.00000001) {
      return [0, 0, H];
    }
    max = maxChromaForLH(L, H);
    C = max / 100 * S;
    return [L, C, H];
  };

  conv.lch.husl = function(tuple) {
    var C, H, L, S, max;
    L = tuple[0], C = tuple[1], H = tuple[2];
    if (L > 99.9999999) {
      return [H, 0, 100];
    }
    if (L < 0.00000001) {
      return [H, 0, 0];
    }
    max = maxChromaForLH(L, H);
    S = C / max * 100;
    return [H, S, L];
  };

  conv.huslp.lch = function(tuple) {
    var C, H, L, S, max;
    H = tuple[0], S = tuple[1], L = tuple[2];
    if (L > 99.9999999) {
      return [100, 0, H];
    }
    if (L < 0.00000001) {
      return [0, 0, H];
    }
    max = maxSafeChromaForL(L);
    C = max / 100 * S;
    return [L, C, H];
  };

  conv.lch.huslp = function(tuple) {
    var C, H, L, S, max;
    L = tuple[0], C = tuple[1], H = tuple[2];
    if (L > 99.9999999) {
      return [H, 0, 100];
    }
    if (L < 0.00000001) {
      return [H, 0, 0];
    }
    max = maxSafeChromaForL(L);
    S = C / max * 100;
    return [H, S, L];
  };

  conv.rgb.hex = function(tuple) {
    var ch, hex, _i, _len;
    hex = "#";
    tuple = rgbPrepare(tuple);
    for (_i = 0, _len = tuple.length; _i < _len; _i++) {
      ch = tuple[_i];
      ch = ch.toString(16);
      if (ch.length === 1) {
        ch = "0" + ch;
      }
      hex += ch;
    }
    return hex;
  };

  conv.hex.rgb = function(hex) {
    var b, g, n, r, _i, _len, _ref, _results;
    if (hex.charAt(0) === "#") {
      hex = hex.substring(1, 7);
    }
    r = hex.substring(0, 2);
    g = hex.substring(2, 4);
    b = hex.substring(4, 6);
    _ref = [r, g, b];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      _results.push(parseInt(n, 16) / 255);
    }
    return _results;
  };

  conv.lch.rgb = function(tuple) {
    return conv.xyz.rgb(conv.luv.xyz(conv.lch.luv(tuple)));
  };

  conv.rgb.lch = function(tuple) {
    return conv.luv.lch(conv.xyz.luv(conv.rgb.xyz(tuple)));
  };

  conv.husl.rgb = function(tuple) {
    return conv.lch.rgb(conv.husl.lch(tuple));
  };

  conv.rgb.husl = function(tuple) {
    return conv.lch.husl(conv.rgb.lch(tuple));
  };

  conv.huslp.rgb = function(tuple) {
    return conv.lch.rgb(conv.huslp.lch(tuple));
  };

  conv.rgb.huslp = function(tuple) {
    return conv.lch.huslp(conv.rgb.lch(tuple));
  };

  root = {};

  root.fromRGB = function(R, G, B) {
    return conv.rgb.husl([R, G, B]);
  };

  root.fromHex = function(hex) {
    return conv.rgb.husl(conv.hex.rgb(hex));
  };

  root.toRGB = function(H, S, L) {
    return conv.husl.rgb([H, S, L]);
  };

  root.toHex = function(H, S, L) {
    return conv.rgb.hex(conv.husl.rgb([H, S, L]));
  };

  root.p = {};

  root.p.toRGB = function(H, S, L) {
    return conv.xyz.rgb(conv.luv.xyz(conv.lch.luv(conv.huslp.lch([H, S, L]))));
  };

  root.p.toHex = function(H, S, L) {
    return conv.rgb.hex(conv.xyz.rgb(conv.luv.xyz(conv.lch.luv(conv.huslp.lch([H, S, L])))));
  };

  root.p.fromRGB = function(R, G, B) {
    return conv.lch.huslp(conv.luv.lch(conv.xyz.luv(conv.rgb.xyz([R, G, B]))));
  };

  root.p.fromHex = function(hex) {
    return conv.lch.huslp(conv.luv.lch(conv.xyz.luv(conv.rgb.xyz(conv.hex.rgb(hex)))));
  };

  root._conv = conv;

  root._round = round;

  root._rgbPrepare = rgbPrepare;

  root._getBounds = getBounds;

  root._maxChromaForLH = maxChromaForLH;

  root._maxSafeChromaForL = maxSafeChromaForL;

  if (!((typeof module !== "undefined" && module !== null) || (typeof jQuery !== "undefined" && jQuery !== null) || (typeof requirejs !== "undefined" && requirejs !== null))) {
    this.HUSL = root;
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = root;
  }

  if (typeof jQuery !== "undefined" && jQuery !== null) {
    jQuery.husl = root;
  }

  if ((typeof requirejs !== "undefined" && requirejs !== null) && (typeof define !== "undefined" && define !== null)) {
    define(root);
  }

}).call(this);

},{}],12:[function(require,module,exports){
/**
 * RGB space.
 *
 * @module  color-space/rgb
 */

module.exports = {
	name: 'rgb',
	min: [0,0,0],
	max: [255,255,255],
	channel: ['red', 'green', 'blue']
};
},{}],13:[function(require,module,exports){
/**
 * Add a convertor from one to another space via XYZ or RGB space as a medium.
 *
 * @module  color-space/add-convertor
 */

var xyz = require('../xyz');
var rgb = require('../rgb');

module.exports = addConvertor;


/**
 * Add convertor from space A to space B.
 * So space A will be able to transform to B.
 */
function addConvertor(fromSpace, toSpace){
	if (!fromSpace[toSpace.name]) {
		fromSpace[toSpace.name] = getConvertor(fromSpace, toSpace);
	}

	return fromSpace;
}


/** return converter through xyz/rgb space */
function getConvertor(fromSpace, toSpace){
	var toSpaceName = toSpace.name;

	//create xyz converter, if available
	if (fromSpace.xyz && xyz[toSpaceName]) {
		return function(arg){
			return xyz[toSpaceName](fromSpace.xyz(arg));
		};
	}
	//create rgb converter
	else if (fromSpace.rgb && rgb[toSpaceName]) {
		return function(arg){
			return rgb[toSpaceName](fromSpace.rgb(arg));
		};
	}

	throw Error('Can’t add convertor from ' + fromSpace.name + ' to ' + toSpaceName);
}

},{"../rgb":12,"../xyz":14}],14:[function(require,module,exports){
/**
 * CIE XYZ
 *
 * @module  color-space/xyz
 */

var rgb = require('./rgb');

var xyz = module.exports = {
	name: 'xyz',
	min: [0,0,0],
	max: [96,100,109],
	channel: ['lightness','u','v'],
	alias: ['ciexyz'],

	//whitepoint with observer/illuminant
	// http://en.wikipedia.org/wiki/Standard_illuminant
	whitepoint: {
		2: {
			//incadescent
			A:[109.85, 100, 35.585],
			// B:[],
			C: [98.074, 100, 118.232],
			D50: [96.422, 100, 82.521],
			D55: [95.682, 100, 92.149],
			//daylight
			D65: [95.045592705167, 100, 108.9057750759878],
			D75: [94.972, 100, 122.638],
			//flourescent
			// F1: [],
			F2: [99.187, 100, 67.395],
			// F3: [],
			// F4: [],
			// F5: [],
			// F6:[],
			F7: [95.044, 100, 108.755],
			// F8: [],
			// F9: [],
			// F10: [],
			F11: [100.966, 100, 64.370],
			// F12: [],
			E: [100,100,100]
		},

		10: {
			//incadescent
			A:[111.144, 100, 35.200],
			C: [97.285, 100, 116.145],
			D50: [96.720, 100, 81.427],
			D55: [95.799, 100, 90.926],
			//daylight
			D65: [94.811, 100, 107.304],
			D75: [94.416, 100, 120.641],
			//flourescent
			F2: [103.280, 100, 69.026],
			F7: [95.792, 100, 107.687],
			F11: [103.866, 100, 65.627],
			E: [100,100,100]
		}
	},

	rgb: function(xyz) {
		var x = xyz[0] / 100,
				y = xyz[1] / 100,
				z = xyz[2] / 100,
				r, g, b;

		// assume sRGB
		// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
		r = (x * 3.240969941904521) + (y * -1.537383177570093) + (z * -0.498610760293);
		g = (x * -0.96924363628087) + (y * 1.87596750150772) + (z * 0.041555057407175);
		b = (x * 0.055630079696993) + (y * -0.20397695888897) + (z * 1.056971514242878);

		r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
			: r = (r * 12.92);

		g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
			: g = (g * 12.92);

		b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
			: b = (b * 12.92);

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	}
};


//extend rgb
rgb.xyz = function(rgb) {
	var r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.41239079926595) + (g * 0.35758433938387) + (b * 0.18048078840183);
	var y = (r * 0.21263900587151) + (g * 0.71516867876775) + (b * 0.072192315360733);
	var z = (r * 0.019330818715591) + (g * 0.11919477979462) + (b * 0.95053215224966);

	return [x * 100, y *100, z * 100];
};
},{"./rgb":12}],15:[function(require,module,exports){
/**
 * Basically change blackness channel.
 *
 * @module color-manipulate/blacken
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to blacken, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var value = color.blackness();
	value += value * ratio;
	color.blackness(value);
	return color;
};
},{}],16:[function(require,module,exports){
/**
 * Basically change lightness channel.
 *
 * @module color-manipulate/darken
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to darken, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var l = color.lightness();
	l -= l * ratio;
	color.lightness(l);
	return color;
};
},{}],17:[function(require,module,exports){
/**
 * Basically change saturation channel.
 *
 * @module color-manipulate/desaturate
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to saturate, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var value = color.saturation();
	value -= value * ratio;
	color.saturation(value);
	return color;
};
},{}],18:[function(require,module,exports){
/**
 * Basically change alpha channel.
 *
 * @module color-manipulate/fadein
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to fadein, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var value = color.alpha();
	value += value * ratio;
	color.alpha(value);
	return color;
};
},{}],19:[function(require,module,exports){
/**
 * Basically change alpha channel.
 *
 * @module color-manipulate/fadeout
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to fadeout, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var value = color.alpha();
	value -= value * ratio;
	color.alpha(value);
	return color;
};
},{}],20:[function(require,module,exports){
/**
 * Convert color to a grayscale
 * http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
 *
 * @module color-manipulate/grayscale
 *
 * @param {Color} color A color instance
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color) {
	var val = color.red() * 0.2126 + color.green() * 0.715 + color.blue() * 0.0722;
	color.red(val);
	color.green(val);
	color.blue(val);
	return color;
};
},{}],21:[function(require,module,exports){
/**
 * @module  color-manipulate
 */

module.exports = {
	lighten: require('./lighten'),
	darken: require('./darken'),
	saturate: require('./saturate'),
	desaturate: require('./desaturate'),
	whiten: require('./whiten'),
	blacken: require('./blacken'),
	fadein: require('./fadein'),
	fadeout: require('./fadeout'),
	invert: require('./invert'),
	grayscale: require('./grayscale'),
	spin: require('./spin'),
	mix: require('./mix')
};
},{"./blacken":15,"./darken":16,"./desaturate":17,"./fadein":18,"./fadeout":19,"./grayscale":20,"./invert":22,"./lighten":23,"./mix":24,"./saturate":25,"./spin":26,"./whiten":27}],22:[function(require,module,exports){
/**
 * @module color-manipulate/invert
 *
 * @param {Color} color A color instance
 *
 * @return {Color} The changed color
 */
module.exports = function (color) {
	color.red(255 - color.red());
	color.green(255 - color.green());
	color.blue(255 - color.blue());
	return color;
};
},{}],23:[function(require,module,exports){
/**
 * Basically change lightness channel.
 *
 * @module color-manipulate/lighten
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to lighten, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var l = color.lightness();
	l += l * ratio;
	color.lightness(l);
	return color;
};
},{}],24:[function(require,module,exports){
/**
 * Mix second color into a current one
 *
 * @module  color-manipulate/mix
 */

module.exports = function (color1, color2, weight, space) {
	space = space || 'rgb';

	weight = 1 - (weight === undefined ? 0.5 : weight);

	var t1 = weight * 2 - 1,
		d = color1.alpha() - color2.alpha();

	var weight1 = (((t1 * d == -1) ? t1 : (t1 + d) / (1 + t1 * d)) + 1) / 2;
	var weight2 = 1 - weight1;

	color1.red(color1.red() * weight1 + color2.red() * weight2);
	color1.green(color1.green() * weight1 + color2.green() * weight2);
	color1.blue(color1.blue() * weight1 + color2.blue() * weight2);

	color1.alpha(color1.alpha() * weight + color2.alpha() * (1 - weight));

	return color1;
};
},{}],25:[function(require,module,exports){
/**
 * Basically change saturation channel.
 *
 * @module color-manipulate/saturate
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to saturate, 0..1
 *
 * @return {Color} The color with increased ratio
 */
module.exports = function (color, ratio) {
	var value = color.saturation();
	value += value * ratio;
	color.saturation(value);
	return color;
};
},{}],26:[function(require,module,exports){
/**
 * Basically change hue channel.
 *
 * @module color-manipulate/spin
 *
 * @param {Color} color A color instance
 * @param {number} degrees A degrees to spin, 0..1
 *
 * @return {Color} The color with increased hue
 */
var loop = require('mumath/loop');

module.exports = function (color, degrees) {
	var value = color.hue();
	value += degrees;
	color.hue(loop(value, 0, 360));
	return color;
};
},{"mumath/loop":39}],27:[function(require,module,exports){
/**
 * Change whiteness channel.
 *
 * @module color-manipulate/whiten
 *
 * @param {Color} color A color instance
 * @param {number} ratio A ratio to whiten, 0..1
 *
 * @return {Color} The color with increased ratio
 */

module.exports = function (color, ratio) {
	var value = color.whiteness();
	value += value * ratio;
	color.whiteness(value);
	return color;
};
},{}],28:[function(require,module,exports){
/**
 * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
 *
 * @module  color-measure/contrast
 */

var luminance = require('./luminance');

module.exports = function (color1, color2) {
	var lum1 = luminance(color1);
	var lum2 = luminance(color2);
	if (lum1 > lum2) {
		return (lum1 + 0.05) / (lum2 + 0.05);
	}
	return (lum2 + 0.05) / (lum1 + 0.05);
};
},{"./luminance":33}],29:[function(require,module,exports){
/**
 * @module color-measure
 */
module.exports = {
	luminance: require('./luminance'),
	contrast: require('./contrast'),
	level: require('./level'),
	isDark: require('./is-dark'),
	isLight: require('./is-light'),

	// https://github.com/bgrins/TinyColor#readability
	// readable,
	// readability,
	// mostReadable,

	// https://www.npmjs.com/package/color-temperature
	// temperature,
	// nearest,
};
},{"./contrast":28,"./is-dark":30,"./is-light":31,"./level":32,"./luminance":33}],30:[function(require,module,exports){
/**
 * YIQ equasion from
 * http://24ways.org/2010/calculating-color-contrast
 *
 * @module  color-measure/is-dark
 */

module.exports = function (color) {
	var yiq = (color.red() * 299 + color.green() * 587 + color.blue() * 114) / 1000;
	return yiq < 128;
};
},{}],31:[function(require,module,exports){
/**
 * @module  color-measure/is-white
 */

var isDark = require('./is-dark');

module.exports = function (color) {
	return !isDark(color);
};
},{"./is-dark":30}],32:[function(require,module,exports){
/**
 * http://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html#visual-audio-contrast-contrast-73-head
 *
 * @module color-measure/level
 */

var contrast = require('./contrast');

module.exports = function (color1, color2) {
	var contrastRatio = contrast(color1, color2);

	return (contrastRatio >= 7.1) ? 'AAA' : (contrastRatio >= 4.5) ? 'AA' : '';
};
},{"./contrast":28}],33:[function(require,module,exports){
/**
 * http://www.w3.org/TR/WCAG20/#relativeluminancedef
 *
 * @module  color-metric/luminance
 */

module.exports = function (color) {
	var rgb = [color.red(), color.green(), color.blue()];
	var lum = [];

	for (var i = 0; i < rgb.length; i++) {
		var chan = rgb[i] / 255;
		lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
	}

	return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
};
},{}],34:[function(require,module,exports){
module.exports={
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
}
},{}],35:[function(require,module,exports){
/**
 * @module color-parse
 */

module.exports = parse;


var names = require('color-name');


/**
 * Base hues
 * http://dev.w3.org/csswg/css-color/#typedef-named-hue
 */
//FIXME: use external hue detector
var baseHues = {
	red: 0,
	orange: 60,
	yellow: 120,
	green: 180,
	blue: 240,
	purple: 300
};


/**
 * Parse color from the string passed
 *
 * @return {Object} A space indicator `space`, an array `values` and `alpha`
 */
function parse (cstr) {
	var m, parts = [0,0,0], alpha = 1, space = 'rgb';

	//keyword
	if (names[cstr]) {
		parts = names[cstr];
	}

	//reserved words
	else if (cstr === 'transparent') alpha = 0;

	//color space
	else if (m = /^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(cstr)) {
		var name = m[1];
		var base = name.replace(/a$/, '');
		space = base;
		var size = base === 'cmyk' ? 4 : base === 'gray' ? 1 : 3;
		parts = m[2].trim()
			.split(/\s*,\s*/)
			.map(function (x, i) {
				//<percentage>
				if (/%$/.test(x)) {
					//alpha
					if (i === size)	return parseFloat(x) / 100;
					//rgb
					if (base === 'rgb') return parseFloat(x) * 255 / 100;
					return parseFloat(x);
				}
				//hue
				else if (base[i] === 'h') {
					//<deg>
					if (/deg$/.test(x)) {
						return parseFloat(x);
					}
					//<base-hue>
					else if (baseHues[x] !== undefined) {
						return baseHues[x];
					}
				}
				return parseFloat(x);
			});

		if (name === base) parts.push(1);
		alpha = parts[size] === undefined ? 1 : parts[size];
		parts = parts.slice(0, size);
	}

	//hex
	else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {
		var base = cstr.replace(/^#/,'');
		var size = base.length;
		var isShort = size <= 4;

		parts = base.split(isShort ? /(.)/ : /(..)/);
		parts = parts.filter(Boolean)
			.map(function (x) {
				if (isShort) {
					return parseInt(x + x, 16);
				}
				else {
					return parseInt(x, 16);
				}
			});

		if (parts.length === 4) {
			alpha = parts[3] / 255;
			parts = parts.slice(0,3);
		}
		if (!parts[0]) parts[0] = 0;
		if (!parts[1]) parts[1] = 0;
		if (!parts[2]) parts[2] = 0;
	}

	//named channels case
	else if (cstr.length > 10 && /[0-9](?:\s|\/)/.test(cstr)) {
		parts = cstr.match(/([0-9]+)/g).map(function (value) {
			return parseFloat(value);
		});

		space = cstr.match(/([a-z])/ig).join('').toLowerCase();
	}

	else {
		throw Error('Unable to parse ' + cstr);
	}

	return {
		space: space,
		values: parts,
		alpha: alpha
	};
}
},{"color-name":34}],36:[function(require,module,exports){
/**
 * @module  color-stringify
 */

module.exports = stringify;


var names = require('color-name');


/** Inverted color names */
var nameValues = {};
for (var name in names) {
	nameValues[names[name]] = name;
}


/**
 * Stringify color values to any target format
 *
 * @param {array} values An array of values to stringify, by default - rgb[a]
 * @param {string} type A color space to stringify values to. By default - rgb.
 */
function stringify (values, type) {
	if (type === 'hex') {
		var res = values.slice(0,3).map(function (value) {
			return (value < 16 ? '0' : '') + value.toString(16);
		}).join('');

		if (res[0] === res[1] && res[2] === res[3] && res[4] === res[5]) res = res[0] + res[2] + res[4];

		return '#' + res;
	}

	if (type === 'keyword') {
		return nameValues[values];
	}

	if (type === 'adobe1') {
		return 'R:' + values[0] + ', G:' + values[1] + ', B:' + values[2];
	}

	if (type === 'adobe2') {
		return '(R' + values[0] + ' / G' + values[1] + ' / B' + values[2] + ')';
	}

	var isPercent, isAlphaSpace;

	//convert rgb to percents
	if (type === 'percent') {
		type = 'rgb';
		values = values.map(function (value, i) {
			if (i === 3) return value;
			return Math.round(value * 100 / 255);
		});

		isPercent = true;
		isAlphaSpace = true;
	}

	type = type || 'rgb';

	//catch hwb/hsl/hsv
	isPercent = isPercent ? isPercent : type[0] === 'h';

	//detect whether alpha-perfix is needed
	isAlphaSpace = isAlphaSpace || /rgb|hs[lv]/i.test(type);

	//normalize space name
	if (isAlphaSpace && type[type.length - 1] === 'a') {
		type = type.slice(0,-1);
	}

	//normalize alpha
	var alpha = 1;
	if (values.length > type.length) {
		alpha = values.pop();
	}

	//decide the space name
	var alphaPf = isAlphaSpace && alpha < 1 ? 'a' : '';

	//<hue> case requires percents
	var res = type + alphaPf;

	res += '(' + values.map(function (value, i) {
		if (isPercent && !(type[i] === 'h')) {
			return value + '%';
		}
		else {
			return value;
		}
	}).join(', ');

	res += ( alpha < 1 ? ', ' + alpha : '' ) + ')';

	return res;
}
},{"color-name":34}],37:[function(require,module,exports){
module.exports = leftpad;

function leftpad (str, len, ch) {
  str = String(str);

  var i = -1;

  if (!ch && ch !== 0) ch = ' ';

  len = len - str.length;

  while (++i < len) {
    str = ch + str;
  }

  return str;
}

},{}],38:[function(require,module,exports){
/**
 * Clamper.
 * Detects proper clamp min/max.
 *
 * @param {number} a Current value to cut off
 * @param {number} min One side limit
 * @param {number} max Other side limit
 *
 * @return {number} Clamped value
 */

module.exports = require('./wrap')(function(a, min, max){
	return max > min ? Math.max(Math.min(a,max),min) : Math.max(Math.min(a,min),max);
});
},{"./wrap":42}],39:[function(require,module,exports){
/**
 * @module  mumath/loop
 *
 * Looping function for any framesize
 */

module.exports = require('./wrap')(function (value, left, right) {
	//detect single-arg case, like mod-loop
	if (right === undefined) {
		right = left;
		left = 0;
	}

	//swap frame order
	if (left > right) {
		var tmp = right;
		right = left;
		left = tmp;
	}

	var frame = right - left;

	value = ((value + left) % frame) - left;
	if (value < left) value += frame;
	if (value > right) value -= frame;

	return value;
});
},{"./wrap":42}],40:[function(require,module,exports){
/**
 * @module  mumath/precision
 *
 * Get precision from float:
 *
 * @example
 * 1.1 → 1, 1234 → 0, .1234 → 4
 *
 * @param {number} n
 *
 * @return {number} decimap places
 */

module.exports = require('./wrap')(function(n){
	var s = n + '',
		d = s.indexOf('.') + 1;

	return !d ? 0 : s.length - d;
});
},{"./wrap":42}],41:[function(require,module,exports){
/**
 * Precision round
 *
 * @param {number} value
 * @param {number} step Minimal discrete to round
 *
 * @return {number}
 *
 * @example
 * toPrecision(213.34, 1) == 213
 * toPrecision(213.34, .1) == 213.3
 * toPrecision(213.34, 10) == 210
 */
var precision = require('./precision');

module.exports = require('./wrap')(function(value, step) {
	if (step === 0) return value;
	if (!step) return Math.round(value);
	step = parseFloat(step);
	value = Math.round(value / step) * step;
	return parseFloat(value.toFixed(precision(step)));
});
},{"./precision":40,"./wrap":42}],42:[function(require,module,exports){
/**
 * Get fn wrapped with array/object attrs recognition
 *
 * @return {Function} Target function
 */
module.exports = function(fn){
	return function(a){
		var args = arguments;
		if (a instanceof Array) {
			var result = new Array(a.length), slice;
			for (var i = 0; i < a.length; i++){
				slice = [];
				for (var j = 0, l = args.length, val; j < l; j++){
					val = args[j] instanceof Array ? args[j][i] : args[j];
					val = val;
					slice.push(val);
				}
				result[i] = fn.apply(this, slice);
			}
			return result;
		}
		else if (typeof a === 'object') {
			var result = {}, slice;
			for (var i in a){
				slice = [];
				for (var j = 0, l = args.length, val; j < l; j++){
					val = typeof args[j] === 'object' ? args[j][i] : args[j];
					val = val;
					slice.push(val);
				}
				result[i] = fn.apply(this, slice);
			}
			return result;
		}
		else {
			return fn.apply(this, args);
		}
	};
};
},{}],43:[function(require,module,exports){
module.exports = function(a){
	return a instanceof Array;
}
},{}],44:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'number' || a instanceof Number;
}
},{}],45:[function(require,module,exports){
/**
 * @module mutype/is-object
 */

//TODO: add st8 tests

//isPlainObject indeed
module.exports = function(o){
	// return obj === Object(obj);
	return !!o && typeof o === 'object' && o.constructor === Object;
};

},{}],46:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'string' || a instanceof String;
}
},{}],47:[function(require,module,exports){
module.exports = exports = require('./lib/sliced');

},{"./lib/sliced":48}],48:[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],49:[function(require,module,exports){
/**
 * A storage of per-target callbacks.
 * WeakMap is the most safe solution.
 *
 * @module emmy/listeners
 */


/**
 * Property name to provide on targets.
 *
 * Can’t use global WeakMap -
 * it is impossible to provide singleton global cache of callbacks for targets
 * not polluting global scope. So it is better to pollute target scope than the global.
 *
 * Otherwise, each emmy instance will create it’s own cache, which leads to mess.
 *
 * Also can’t use `._events` property on targets, as it is done in `events` module,
 * because it is incompatible. Emmy targets universal events wrapper, not the native implementation.
 */
var cbPropName = '_callbacks';


/**
 * Get listeners for the target/evt (optionally).
 *
 * @param {object} target a target object
 * @param {string}? evt an evt name, if undefined - return object with events
 *
 * @return {(object|array)} List/set of listeners
 */
function listeners(target, evt, tags){
	var cbs = target[cbPropName];

	if (!evt) return cbs || {};
	if (!cbs || !cbs[evt]) return [];

	var result = cbs[evt];

	//if there are evt namespaces specified - filter callbacks
	if (tags && tags.length) {
		result = result.filter(function(cb){
			return hasTags(cb, tags);
		});
	}

	return result;
}


/**
 * Remove listener, if any
 */
listeners.remove = function(target, evt, cb, tags){
	//get callbacks for the evt
	var evtCallbacks = target[cbPropName];
	if (!evtCallbacks || !evtCallbacks[evt]) return false;

	var callbacks = evtCallbacks[evt];

	//if tags are passed - make sure callback has some tags before removing
	if (tags && tags.length && !hasTags(cb, tags)) return false;

	//remove specific handler
	for (var i = 0; i < callbacks.length; i++) {
		//once method has original callback in .cb
		if (callbacks[i] === cb || callbacks[i].fn === cb) {
			callbacks.splice(i, 1);
			break;
		}
	}
};


/**
 * Add a new listener
 */
listeners.add = function(target, evt, cb, tags){
	if (!cb) return;

	var targetCallbacks = target[cbPropName];

	//ensure set of callbacks for the target exists
	if (!targetCallbacks) {
		targetCallbacks = {};
		Object.defineProperty(target, cbPropName, {
			value: targetCallbacks
		});
	}

	//save a new callback
	(targetCallbacks[evt] = targetCallbacks[evt] || []).push(cb);

	//save ns for a callback, if any
	if (tags && tags.length) {
		cb._ns = tags;
	}
};


/** Detect whether an cb has at least one tag from the list */
function hasTags(cb, tags){
	if (cb._ns) {
		//if cb is tagged with a ns and includes one of the ns passed - keep it
		for (var i = tags.length; i--;){
			if (cb._ns.indexOf(tags[i]) >= 0) return true;
		}
	}
}


module.exports = listeners;
},{}],50:[function(require,module,exports){
/**
 * @module Icicle
 */
module.exports = {
	freeze: lock,
	unfreeze: unlock,
	isFrozen: isLocked
};


/** Set of targets  */
var lockCache = new WeakMap;


/**
 * Set flag on target with the name passed
 *
 * @return {bool} Whether lock succeeded
 */
function lock(target, name){
	var locks = lockCache.get(target);
	if (locks && locks[name]) return false;

	//create lock set for a target, if none
	if (!locks) {
		locks = {};
		lockCache.set(target, locks);
	}

	//set a new lock
	locks[name] = true;

	//return success
	return true;
}


/**
 * Unset flag on the target with the name passed.
 *
 * Note that if to return new value from the lock/unlock,
 * then unlock will always return false and lock will always return true,
 * which is useless for the user, though maybe intuitive.
 *
 * @param {*} target Any object
 * @param {string} name A flag name
 *
 * @return {bool} Whether unlock failed.
 */
function unlock(target, name){
	var locks = lockCache.get(target);
	if (!locks || !locks[name]) return false;

	locks[name] = null;

	return true;
}


/**
 * Return whether flag is set
 *
 * @param {*} target Any object to associate lock with
 * @param {string} name A flag name
 *
 * @return {Boolean} Whether locked or not
 */
function isLocked(target, name){
	var locks = lockCache.get(target);
	return (locks && locks[name]);
}
},{}],51:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"./lib/sliced":52,"dup":47}],52:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"dup":48}],53:[function(require,module,exports){
/**
 * @module emmy/off
 */
module.exports = off;

var icicle = require('icicle');
var slice = require('sliced');
var listeners = require('./listeners');


/**
 * Remove listener[s] from the target
 *
 * @param {[type]} evt [description]
 * @param {Function} fn [description]
 *
 * @return {[type]} [description]
 */
function off(target, evt, fn) {
	if (!target) return target;

	var callbacks, i;

	//unbind all listeners if no fn specified
	if (fn === undefined) {
		var args = slice(arguments, 1);

		//try to use target removeAll method, if any
		var allOff = target['removeAll'] || target['removeAllListeners'];

		//call target removeAll
		if (allOff) {
			allOff.apply(target, args);
		}


		//then forget own callbacks, if any

		//unbind all evts
		if (!evt) {
			callbacks = listeners(target);
			for (evt in callbacks) {
				off(target, evt);
			}
		}
		//unbind all callbacks for an evt
		else {
			//invoke method for each space-separated event from a list
			evt.split(/\s+/).forEach(function (evt) {
				var evtParts = evt.split('.');
				evt = evtParts.shift();
				callbacks = listeners(target, evt, evtParts);
				for (var i = callbacks.length; i--;) {
					off(target, evt, callbacks[i]);
				}
			});
		}

		return target;
	}


	//target events (string notation to advanced_optimizations)
	var offMethod = target['removeEventListener'] || target['removeListener'] || target['detachEvent'] || target['off'];

	//invoke method for each space-separated event from a list
	evt.split(/\s+/).forEach(function (evt) {
		var evtParts = evt.split('.');
		evt = evtParts.shift();

		//use target `off`, if possible
		if (offMethod) {
			//avoid self-recursion from the outside
			if (icicle.freeze(target, 'off' + evt)) {
				offMethod.call(target, evt, fn);
				icicle.unfreeze(target, 'off' + evt);
			}

			//if it’s frozen - ignore call
			else {
				return target;
			}
		}

		if (fn.closedCall) fn.closedCall = false;

		//forget callback
		listeners.remove(target, evt, fn, evtParts);
	});


	return target;
}
},{"./listeners":49,"icicle":50,"sliced":51}],"color-space":[function(require,module,exports){
/**
 * @module color-space
 *
 * @todo  to-source method, preparing the code for webworker
 * @todo  implement all side spaces from http://en.wikipedia.org/wiki/Category:Color_space yuv, yiq etc.
 * @todo  here are additional spaces http://www.jentronics.com/color.html ITU, REC709, SMTPE, NTSC, GREY
 *
 * @todo implement asm-js way to convert spaces (promises to be times faster)
 *
 */

var addConvertor = require('./util/add-convertor');


/** Exported spaces */
var spaces = {
	rgb: require('./rgb'),
	hsl: require('./hsl'),
	hsv: require('./hsv'),
	hwb: require('./hwb'),
	cmyk: require('./cmyk'),
	xyz: require('./xyz'),
	lab: require('./lab'),
	lchab: require('./lchab'),
	luv: require('./luv'),
	lchuv: require('./lchuv'),
	husl: require('./husl'),
	huslp: require('./huslp')
};



//build absent convertors from each to every space
var fromSpace, toSpace;
for (var fromSpaceName in spaces) {
	fromSpace = spaces[fromSpaceName];
	for (var toSpaceName in spaces) {
		if (toSpaceName !== fromSpaceName) {
			toSpace = spaces[toSpaceName];
			addConvertor(fromSpace, toSpace);
		}
	}
}


module.exports = spaces;
},{"./cmyk":1,"./hsl":2,"./hsv":3,"./husl":4,"./huslp":5,"./hwb":6,"./lab":7,"./lchab":8,"./lchuv":9,"./luv":10,"./rgb":12,"./util/add-convertor":13,"./xyz":14}],"color":[function(require,module,exports){
/**
 * Barebones color class.
 *
 * @module color
 */

module.exports = Color;


var parse = require('color-parse');
var stringify = require('color-stringify');
var manipulate = require('color-manipulate');
var measure = require('color-measure');
var spaces = require('color-space');
var slice = require('sliced');
var pad = require('left-pad');
var isString = require('mutype/is-string');
var isObject = require('mutype/is-object');
var isArray = require('mutype/is-array');
var isNumber = require('mutype/is-number');
var loop = require('mumath/loop');
var round = require('mumath/round');
var between = require('mumath/between');



/**
 * Color class.
 * @constructor
 */
function Color (arg, space) {
	if (!(this instanceof Color)) {
		return new Color(arg);
	}

	var self = this;

	//init model
	self._values = [0,0,0];
	self._space = 'rgb';
	self._alpha = 1;

	// keep xyz values to preserve quality
	self._xyz = [0,0,0];

	//parse argument
	self.parse(arg, space);
}


/** Static parser/stringifier */
Color.parse = function (cstr) {
	return new Color(cstr);
};

Color.stringify = function (color, space) {
	return color.toString(space);
};



/** API */
var proto = Color.prototype;


/** Universal setter, detecting the type of argument */
proto.parse = function (arg, space) {
	var self = this;

	if (!arg) {
		return self;
	}

	//[0,0,0]
	else if (isArray(arg)) {
		self.fromArray(arg, space);
	}
	else if (isNumber(arg)) {
		//12, 25, 47 [, space]
		if (arguments.length > 2) {
			var args = slice(arguments);
			if (isString(args[args.length - 1])) {
				space = args.pop();
			}
			self.parse(args, space);
		}
		//123445 [, space]
		else {
			self.fromNumber(arg, space);
		}
	}
	//'rgb(0,0,0)'
	else if (isString(arg)) {
		self.fromString(arg, space);
	}
	//Color instance
	else if (arg instanceof Color) {
		self.fromArray(arg._values, arg._space);
	}
	//{r:0, g:0, b:0}
	else if (isObject(arg)) {
		self.fromJSON(arg, space);
	}

	return self;
};


/** String parser/stringifier */
proto.fromString = function (cstr) {
	var res = parse(cstr);
	this.setValues(res.values, res.space);
	this.alpha(res.alpha);
	return this;
};

proto.toString = function (type) {
	type = type || this.getSpace();
	var values = this.toArray(spaces[type] ? type : 'rgb');
	values = round(values);
	if (this._alpha < 1) {
		values.push(this.alpha());
	}
	return stringify(values, type);
};


/** Array setter/getter */
proto.fromArray = function (values, spaceName) {
	if (!spaceName || !spaces[spaceName]) {
		spaceName = this._space;
	}

	this._space = spaceName;

	var space = spaces[spaceName];

	//get alpha
	if (values.length > space.channel.length) {
		this.alpha(values[space.channel.length]);
		values = slice(values, 0, space.channel.length);
	}

	//walk by values list, cap them
	this._values = values.map(function (value, i) {
		return cap(value, space.name, i);
	});

	//update raw xyz cache
	this._xyz = spaces[spaceName].xyz(this._values);

	return this;
};

proto.toArray = function (space) {
	var values;

	if (!space) {
		space = this._space;
	}

	//convert values to a target space
	if (space !== this._space) {
		//enhance calc precision, like hsl ←→ hsv ←→ hwb or lab ←→ lch ←→ luv
		if (this._space[0] === space[0]) {
			values = spaces[this._space][space](this._values);
		}
		else {
			values = spaces.xyz[space](this._xyz);
		}
	} else {
		values = this._values;
	}

	values = values.map(function (value, i) {
		return round(value, spaces[space].precision[i]);
	});

	return values;
};


/** JSON setter/getter */
proto.fromJSON = function (obj, spaceName) {
	var space;

	if (spaceName) {
		space = spaces[spaceName];
	}

	//find space by the most channel match
	if (!space) {
		var maxChannelsMatched = 0, channelsMatched = 0;
		Object.keys(spaces).forEach(function (key) {
			channelsMatched = spaces[key].channel.reduce(function (prev, curr) {
				if (obj[curr] !== undefined || obj[ch(curr)] !== undefined) {
					return prev+1;
				}
				else {
					return prev;
				}
			}, 0);

			if (channelsMatched > maxChannelsMatched) {
				maxChannelsMatched = channelsMatched;
				space = spaces[key];
			}

			if (channelsMatched >= 3) {
				return;
			}
		});
	}

	//if no space for a JSON found
	if (!space) {
		throw Error('Cannot detect space.');
	}

	//for the space found set values
	this.fromArray(space.channel.map(function (channel) {
		return obj[channel] !== undefined ? obj[channel] : obj[ch(channel)];
	}), space.name);

	var alpha = obj.a !== undefined ? obj.a : obj.alpha;
	if (alpha !== undefined) {
		this.alpha(alpha);
	}

	return this;
};

proto.toJSON = function (spaceName) {
	var space = spaces[spaceName || this._space];

	var result = {};

	var values = this.toArray(space.name);

	//go by channels, create properties
	space.channel.forEach(function (channel, i) {
		result[ch(channel)] = values[i];
	});

	if (this._alpha < 1) {
		result.a = this._alpha;
	}

	return result;
};


/** HEX number getter/setter */
proto.fromNumber = function (val, space) {
	var values = pad(val.toString(16), 6, 0).split(/(..)/).filter(Boolean);
	return this.fromArray(values, space);
};

proto.toNumber = function (space) {
	var values = this.toArray(space);
	return (values[0] << 16) | (values[1] << 8) | values[2];
};


/**
 * Current space values
 */
proto.values = function () {
	if (arguments.length) {
		return this.setValues.apply(this, arguments);
	}
	return this.getValues.apply(this, arguments);
};

/**
 * Return values array for a passed space
 * Or for current space
 *
 * @param {string} space A space to calculate values for
 *
 * @return {Array} List of values
 */
proto.getValues = function (space) {
	return this.toArray(space);
};

/**
 * Set values for a space passed
 *
 * @param {Array} values List of values to set
 * @param {string} spaceName Space indicator
 */
proto.setValues = proto.parse;


/**
 * Current space
 */
proto.space = function () {
	if (arguments.length) {
		return this.setSpace.apply(this, arguments);
	}
	return this.getSpace.apply(this, arguments);
};

/** Return current space */
proto.getSpace = function () {
	return this._space;
};

/** Switch to a new space with optional new values */
proto.setSpace = function (space, values) {
	if (!space || !spaces[space]) {
		throw Error('Cannot set space ' + space);
	}

	if (space === this._space) {
		return this;
	}

	if (values) {
		return this.setValues(values, space);
	}

	//just convert current values to a new space
	this._values = spaces.xyz[space](this._xyz);
	this._space = space;

	return this;
};


/** Channel getter/setter */
proto.channel = function () {
	if (arguments.length > 2) {
		return this.setChannel.apply(this, arguments);
	} else {
		return this.getChannel.apply(this, arguments);
	}
};

/** Get channel value */
proto.getChannel = function (space, idx) {
	this.setSpace(space);
	return this._values[idx];
};

/** Set current channel value */
proto.setChannel = function (space, idx, value) {
	this.setSpace(space);
	this._values[idx] = cap(value, space, idx);
	this._xyz = spaces[space].xyz(this._values);
	return this;
};


/** Define named set of methods for a space */
proto.defineSpace = function (name, space) {
	//create precisions
	space.precision = space.channel.map(function (ch, idx) {
		return Math.abs(space.max[idx] - space.min[idx]) > 1 ? 1 : 0.01;
	});

	// .rgb()
	proto[name] = function (values) {
		if (arguments.length) {
			if (arguments.length > 1) {
				return this.setValues(slice(arguments), name);
			}
			return this.setValues(values, name);
		} else {
			return this.toJSON(name);
		}
	};

	// .rgbString()
	proto[name + 'String'] = function (cstr) {
		if (cstr) {
			return this.fromString(cstr);
		}
		return this.toString(name);
	};

	// .rgbArray()
	proto[name + 'Array'] = function (values) {
		if (arguments.length) {
			return this.fromArray(values);
		}
		return this.toArray(name);
	};

	// .rgbaArray(), .hslaArray
	if (name === 'rgb' || name === 'hsl') {
		proto[name + 'aArray'] = function () {
			var res = this[name + 'Array'].apply(this, arguments);
			if (isArray(res)) {
				res.push(this.alpha());
			}
			return res;
		};
	}

	// .red(), .green(), .blue()
	space.channel.forEach(function (cname, cidx) {
		if (proto[cname]) {
			return;
		}
		proto[cname] = function (value) {
			if (arguments.length) {
				return this.setChannel(name, cidx, value);
			}
			else {
				return round(this.getChannel(name, cidx), space.precision[cidx]);
			}
		};
	});
};


/**
 * Create per-space API
 */
Object.keys(spaces).forEach(function (name) {
	proto.defineSpace(name, spaces[name]);
});


/**
 * Alpha getter / setter
 */
proto.alpha = function (value) {
	if (arguments.length) {
		this._alpha = between(value, 0, 1);
		return this;
	} else {
		return this._alpha;
	}
};


/** Hex string parser is the same as simple parser */
proto.hexString = function (str) {
	if (arguments.length) {
		return this.fromString(str, 'hex');
	}
	else {
		return this.toString('hex').toUpperCase();
	}
};

/** Percent string formatter */
proto.percentString = function (str) {
	if (arguments.length) {
		return this.fromString(str, 'percent');
	}
	else {
		return this.toString('percent');
	}
};


/** Keyword setter/getter */
proto.keyword = function (str) {
	if (arguments.length) {
		return this.fromString(str, 'keyword');
	}
	else {
		return this.toString('keyword');
	}
};

/** Clone instance */
proto.clone = function () {
	return (new Color()).fromArray(this._values, this._space);
};


/**
 * Create manipulation methods
 */
Object.keys(manipulate).forEach(function (name) {
	proto[name] = function (a,b) {
		return manipulate[name](this, a, b);
	};
});

/** Some color compatibility bindings */
proto.rotate = proto.spin;
proto.negate = proto.invert;
proto.greyscale = proto.grayscale;
proto.clearer = proto.fadeout;
proto.opaquer = proto.fadein;


/**
 * Create measure methods
 */
Object.keys(measure).forEach(function (name) {
	proto[name] = function (a, b) {
		return measure[name](this, a, b);
	};
});

/** Some color compatibility bindings */
proto.luminosity = proto.luminance;
proto.dark = proto.isDark;
proto.light = proto.isLight;


//TODO:
//gray
//toFilter
//isValid
//getFormat
//random
//ie-hex-str($color)
//is(otherColor)


/** Get short channel name */
function ch (name) {
	return name === 'black' ? 'k' : name[0];
}

/**
 * Cap channel value.
 * Note that cap should not round.
 *
 * @param {number} value A value to store
 * @param {string} spaceName Space name take as a basis
 * @param {int} idx Channel index
 *
 * @return {number} Capped value
 */
function cap(value, spaceName, idx) {
	var space = spaces[spaceName];
	if (space.channel[idx] === 'hue') {
		return loop(value, space.min[idx], space.max[idx]);
	} else {
		return between(value, space.min[idx], space.max[idx]);
	}
}
},{"color-manipulate":21,"color-measure":29,"color-parse":35,"color-space":"color-space","color-stringify":36,"left-pad":37,"mumath/between":38,"mumath/loop":39,"mumath/round":41,"mutype/is-array":43,"mutype/is-number":44,"mutype/is-object":45,"mutype/is-string":46,"sliced":47}],"emmy/once":[function(require,module,exports){
/**
 * @module emmy/once
 */
module.exports = once;

var icicle = require('icicle');
var on = require('./on');
var off = require('./off');


/**
 * Add an event listener that will be invoked once and then removed.
 *
 * @return {target}
 */
function once(target, evt, fn){
	if (!target) return;

	//get target once method, if any
	var onceMethod = target['once'] || target['one'] || target['addOnceEventListener'] || target['addOnceListener'], cb;


	//use own events
	//wrap callback to once-call
	cb = once.wrap(target, evt, fn, off);


	//invoke method for each space-separated event from a list
	evt.split(/\s+/).forEach(function(evt){
		//use target event system, if possible
		if (onceMethod) {
			//avoid self-recursions
			if (icicle.freeze(target, 'one' + evt)){
				var res = onceMethod.call(target, evt, fn);

				//FIXME: save callback, just in case of removeListener
				// listeners.add(target, evt, fn);
				icicle.unfreeze(target, 'one' + evt);

				return res;
			}

			//if still called itself second time - do default routine
		}

		//bind wrapper default way - in case of own emit method
		on(target, evt, cb);
	});

	return cb;
}


/** Return once wrapper, with optional special off passed */
once.wrap = function (target, evt, fn, off) {
	var cb = function() {
		off(target, evt, cb);
		fn.apply(target, arguments);
	};

	cb.fn = fn;

	return cb;
};
},{"./off":53,"./on":"emmy/on","icicle":50}],"emmy/on":[function(require,module,exports){
/**
 * @module emmy/on
 */


var icicle = require('icicle');
var listeners = require('./listeners');


module.exports = on;


/**
 * Bind fn to a target.
 *
 * @param {*} targte A single target to bind evt
 * @param {string} evt An event name
 * @param {Function} fn A callback
 * @param {Function}? condition An optional filtering fn for a callback
 *                              which accepts an event and returns callback
 *
 * @return {object} A target
 */
function on(target, evt, fn){
	if (!target) return target;

	//get target `on` method, if any
	//prefer native-like method name
	//user may occasionally expose `on` to the global, in case of browserify
	//but it is unlikely one would replace native `addEventListener`
	var onMethod =  target['addEventListener'] || target['addListener'] || target['attachEvent'] || target['on'];

	var cb = fn;

	//invoke method for each space-separated event from a list
	evt.split(/\s+/).forEach(function(evt){
		var evtParts = evt.split('.');
		evt = evtParts.shift();

		//use target event system, if possible
		if (onMethod) {
			//avoid self-recursions
			//if it’s frozen - ignore call
			if (icicle.freeze(target, 'on' + evt)){
				onMethod.call(target, evt, cb);
				icicle.unfreeze(target, 'on' + evt);
			}
			else {
				return target;
			}
		}

		//save the callback anyway
		listeners.add(target, evt, cb, evtParts);
	});

	return target;
}


/**
 * Wrap an fn with condition passing
 */
on.wrap = function(target, evt, fn, condition){
	var cb = function() {
		if (condition.apply(target, arguments)) {
			return fn.apply(target, arguments);
		}
	};

	cb.fn = fn;

	return cb;
};
},{"./listeners":49,"icicle":50}],"webworkify":[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);
    
    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        if (cache[key].exports === fn) {
            wkey = key;
            break;
        }
    }
    
    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
    
    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'],'require(' + stringify(wkey) + ')(self)'),
        scache
    ];
    
    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;
    
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    
    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleCIsIndvcmtlciIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9jbXlrLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL2hzbC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9oc3YuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvaHVzbC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9odXNscC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9od2IuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvbGFiLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL2xjaGFiLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL2xjaHV2LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL2x1di5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9ub2RlX21vZHVsZXMvaHVzbC9odXNsLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL3JnYi5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS91dGlsL2FkZC1jb252ZXJ0b3IuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UveHl6LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS9ibGFja2VuLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS9kYXJrZW4uanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1tYW5pcHVsYXRlL2Rlc2F0dXJhdGUuanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1tYW5pcHVsYXRlL2ZhZGVpbi5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2NvbG9yLW1hbmlwdWxhdGUvZmFkZW91dC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2NvbG9yLW1hbmlwdWxhdGUvZ3JheXNjYWxlLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2NvbG9yLW1hbmlwdWxhdGUvaW52ZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS9saWdodGVuLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS9taXguanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1tYW5pcHVsYXRlL3NhdHVyYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS9zcGluLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWFuaXB1bGF0ZS93aGl0ZW4uanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1tZWFzdXJlL2NvbnRyYXN0LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWVhc3VyZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2NvbG9yLW1lYXN1cmUvaXMtZGFyay5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2NvbG9yLW1lYXN1cmUvaXMtbGlnaHQuanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1tZWFzdXJlL2xldmVsLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvY29sb3ItbWVhc3VyZS9sdW1pbmFuY2UuanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4Lmpzb24iLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9jb2xvci1wYXJzZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZ2lmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL2xlZnQtcGFkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvbXVtYXRoL2JldHdlZW4uanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9tdW1hdGgvbG9vcC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL211bWF0aC9wcmVjaXNpb24uanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9tdW1hdGgvcm91bmQuanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9tdW1hdGgvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL211dHlwZS9pcy1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL211dHlwZS9pcy1udW1iZXIuanMiLCJub2RlX21vZHVsZXMvY29sb3IyL25vZGVfbW9kdWxlcy9tdXR5cGUvaXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yMi9ub2RlX21vZHVsZXMvbXV0eXBlL2lzLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL3NsaWNlZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvcjIvbm9kZV9tb2R1bGVzL3NsaWNlZC9saWIvc2xpY2VkLmpzIiwibm9kZV9tb2R1bGVzL2VtbXkvbGlzdGVuZXJzLmpzIiwibm9kZV9tb2R1bGVzL2VtbXkvbm9kZV9tb2R1bGVzL2ljaWNsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9lbW15L29mZi5qcyIsImNvbG9yLXNwYWNlIiwiY29sb3IyIiwiZW1teS9vbmNlIiwiZW1teS9vbiIsIndlYndvcmtpZnkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQSBzb21ld2hhdCBhYnN0cmFjdCByZW5kZXJlci5cbiAqXG4gKiBAbW9kdWxlIGNvbG9yLXJhbmdlci9yZW5kZXJcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjtcblxuXG52YXIgY29udmVydCA9IHJlcXVpcmUoJ2NvbG9yLXNwYWNlJyk7XG5cblxuLy9kZWZhdWx0IG9wdGlvbnMgZm9yIGRlZmF1bHQgcmVuZGVyaW5nXG52YXIgZGVmYXVsdHMgPSB7XG5cdGNoYW5uZWw6IFswLDFdLFxuXHRzcGFjZTogJ3JnYidcbn07XG5cblxuLy8zNyBpcyB0aGUgbW9zdCBvcHRpbWFsIGNhbGMgc2l6ZVxuLy95b3UgY2FuIHNjYWxlIHJlc3VsdGluZyBpbWFnZSB3aXRoIG5vIHNpZ25pZmljYW50IHF1YWxpdHkgbG9zc1xuXG4vKipcbiAqIFJlbmRlciBwYXNzZWQgcmVjdGFuZ3VsYXIgcmFuZ2UgZm9yIHRoZSBjb2xvciB0byBpbWFnZURhdGEuXG4gKlxuICogQHBhcmFtIHthcnJheX0gcmdiIEEgbGlzdCBvZiByZ2IgdmFsdWVzICsgb3B0aW9uYWwgYWxwaGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcGFjZSBBIHNwYWNlIHRvIHJlbmRlciwgbm8gYWxwaGEtc3VmZml4XG4gKiBAcGFyYW0ge2FycmF5fSBjaGFubmVscyBMaXN0IG9mIGNoYW5uZWwgaW5kZXhlcyB0byByZW5kZXJcbiAqIEBwYXJhbSB7YXJyYXl9IG1pbnMgTWluIHZhbHVlcyB0byByZW5kZXIgcmFuZ2UgKGNhbiBiZSBkaWZmZXJlbnQgdGhhbiBzcGFjZSBtaW5zKVxuICogQHBhcmFtIHthcnJheX0gbWF4ZXMgTWF4IHZhbHVlcyB0byByZW5kZXIgcmFuZ2UgKGNhbiBiZSBkaWZmZXJlbnQgdGhhbiBzcGFjZSBtYXhlcylcbiAqIEBwYXJhbSB7VUludDhDYXBwZWRBcnJheX0gYnVmZmVyIEFuIGltYWdlIGRhdGEgYnVmZmVyXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxjIEEgY2FsY3VsYXRvciBmb3IgdGhlIHN0ZXAgY29sb3JcbiAqXG4gKiBAcmV0dXJuIHtJbWFnZURhdGF9IEltYWdlRGF0YSBjb250YWluaW5nIGEgcmFuZ2VcbiAqL1xuZnVuY3Rpb24gcmVuZGVyKHJnYmEsIGJ1ZmZlciwgb3B0cykge1xuXHRpZiAoIWJ1ZmZlciB8fCAhYnVmZmVyLmxlbmd0aCkgdGhyb3cgRXJyb3IoJ0J1ZmZlciBtdXN0IGJlIGEgdmFsaWQgbm9uLWVtcHR5IFVJbnQ4Q2FwcGVkQXJyYXknKTtcblxuXHQvLyBjb25zb2xlLnRpbWUoJ2NhbnYnKTtcblx0dmFyIHNpemUgPSBvcHRzLnNpemUgfHwgW01hdGguZmxvb3IoTWF0aC5zcXJ0KGJ1ZmZlci5sZW5ndGggLyA0KSldO1xuXHRpZiAoc2l6ZS5sZW5ndGggPT09IDEpIHtcblx0XHRzaXplWzFdID0gc2l6ZVswXTtcblx0fVxuXG5cdHZhciBzcGFjZSA9IG9wdHMuc3BhY2UgPSBvcHRzLnNwYWNlIHx8IGRlZmF1bHRzLnNwYWNlO1xuXHR2YXIgY2hhbm5lbHMgPSBvcHRzLmNoYW5uZWwgPSBvcHRzLmNoYW5uZWwgIT09IHVuZGVmaW5lZCA/IG9wdHMuY2hhbm5lbCA6IGRlZmF1bHRzLmNoYW5uZWw7XG5cblx0dmFyIG1pbnMgPSBvcHRzLm1pbiB8fCBbXSxcblx0XHRtYXhlcyA9IG9wdHMubWF4IHx8IFtdO1xuXG5cdHZhciBjYWxjID0gb3B0cy50eXBlID09PSAncG9sYXInID8gIGNhbGNQb2xhclN0ZXAgOiBjYWxjUmVjdFN0ZXA7XG5cblx0Ly90YWtlIG1pbnMvbWF4ZXMgb2YgdGFyZ2V0IHNwYWNl4oCZcyBjaGFubmVsc1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5uZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKG1pbnMubGVuZ3RoIDwgY2hhbm5lbHMubGVuZ3RoKSB7XG5cdFx0XHRtaW5zW2ldID0gY29udmVydFtzcGFjZV0ubWluW2NoYW5uZWxzW2ldXSB8fCAwO1xuXHRcdH1cblx0XHRpZiAobWF4ZXMubGVuZ3RoIDwgY2hhbm5lbHMubGVuZ3RoKSB7XG5cdFx0XHRtYXhlc1tpXSA9IGNvbnZlcnRbc3BhY2VdLm1heFtjaGFubmVsc1tpXV0gfHwgMjU1O1xuXHRcdH1cblx0fVxuXG5cdHZhciBpc0NNWUsgPSBzcGFjZSA9PT0gJ2NteWsnO1xuXG5cdC8vYWRkIGFscGhhXG5cdGlmIChyZ2JhLmxlbmd0aCA9PT0gNCkge3JnYmFbM10gKj0gMjU1O31cblx0aWYgKHJnYmEubGVuZ3RoID09PSAzKSB7cmdiYVszXSA9IDI1NTt9XG5cblx0Ly9nZXQgc3BlY2lmaWMgc3BhY2UgdmFsdWVzXG5cdHZhciB2YWx1ZXM7XG5cdGlmIChzcGFjZSA9PT0gJ3JnYicpIHtcblx0XHR2YWx1ZXMgPSByZ2JhLnNsaWNlKCk7XG5cdH0gZWxzZSB7XG5cdFx0dmFsdWVzID0gY29udmVydC5yZ2Jbc3BhY2VdKHJnYmEpO1xuXHRcdGlmICghaXNDTVlLICYmIHZhbHVlcy5sZW5ndGggPT09IDMpIHtcblx0XHRcdHZhbHVlc1szXSA9IHJnYmFbM107XG5cdFx0fVxuXHR9XG5cblx0Ly9yZXNvbHZlIGFic2VudCBpbmRleGVzXG5cdHZhciBub0lkeCA9IFtdO1xuXHRmb3IgKGkgPSBzcGFjZS5sZW5ndGg7IGktLTspIHtcblx0XHRpZiAoaSAhPT0gY2hhbm5lbHNbMF0gJiYgaSAhPT0gY2hhbm5lbHNbMV0pIHtcblx0XHRcdG5vSWR4LnB1c2goaSk7XG5cdFx0fVxuXHR9XG5cdHZhciBub0lkeDEgPSBub0lkeFswXTtcblx0dmFyIG5vSWR4MiA9IG5vSWR4WzFdO1xuXHR2YXIgbm9JZHgzID0gbm9JZHhbMl07XG5cblx0Ly9nZXQgY29udmVydGluZyBmblxuXHR2YXIgY29udmVydGVyID0gc3BhY2UgPT09ICdyZ2InID8gZnVuY3Rpb24oYSkge3JldHVybiBhO30gOiBjb252ZXJ0W3NwYWNlXS5yZ2I7XG5cblx0Zm9yICh2YXIgeCwgeSA9IHNpemVbMV0sIHJvdywgY29sLCByZXMsIHN0ZXBWYWxzID0gdmFsdWVzLnNsaWNlKCk7IHktLTspIHtcblx0XHRyb3cgPSB5ICogc2l6ZVswXSAqIDQ7XG5cblx0XHRmb3IgKHggPSAwOyB4IDwgc2l6ZVswXTsgeCsrKSB7XG5cdFx0XHRjb2wgPSByb3cgKyB4ICogNDtcblxuXHRcdFx0Ly9jYWxjdWxhdGUgY29sb3Jcblx0XHRcdHN0ZXBWYWxzID0gY2FsYyh4LHksIHN0ZXBWYWxzLCBzaXplLCBjaGFubmVscywgbWlucywgbWF4ZXMpO1xuXG5cdFx0XHRpZiAobm9JZHgxIHx8IG5vSWR4MSA9PT0gMCkge1xuXHRcdFx0XHRzdGVwVmFsc1tub0lkeDFdID0gdmFsdWVzW25vSWR4MV07XG5cdFx0XHR9XG5cdFx0XHRpZiAobm9JZHgyIHx8IG5vSWR4MiA9PT0gMCkge1xuXHRcdFx0XHRzdGVwVmFsc1tub0lkeDJdID0gdmFsdWVzW25vSWR4Ml07XG5cdFx0XHR9XG5cdFx0XHRpZiAobm9JZHgzIHx8IG5vSWR4MyA9PT0gMCkge1xuXHRcdFx0XHRzdGVwVmFsc1tub0lkeDNdID0gdmFsdWVzW25vSWR4M107XG5cdFx0XHR9XG5cblx0XHRcdC8vZmlsbCBpbWFnZSBkYXRhXG5cdFx0XHRyZXMgPSBjb252ZXJ0ZXIoc3RlcFZhbHMpO1xuXHRcdFx0cmVzWzNdID0gaXNDTVlLID8gMjU1IDogc3RlcFZhbHNbM107XG5cblx0XHRcdGJ1ZmZlci5zZXQocmVzLCBjb2wpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBidWZmZXI7XG5cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHBvbGFyIHN0ZXBcblx0ICpcblx0ICogQHBhcmFtIHtbdHlwZV19IHggW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcGFyYW0ge1t0eXBlXX0geSBbZGVzY3JpcHRpb25dXG5cdCAqIEBwYXJhbSB7W3R5cGVdfSB2YWxzIFtkZXNjcmlwdGlvbl1cblx0ICogQHBhcmFtIHtbdHlwZV19IHNpemUgW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcGFyYW0ge1t0eXBlXX0gY2hhbm5lbHMgW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcGFyYW0ge1t0eXBlXX0gbWlucyBbZGVzY3JpcHRpb25dXG5cdCAqIEBwYXJhbSB7W3R5cGVdfSBtYXhlcyBbZGVzY3JpcHRpb25dXG5cdCAqXG5cdCAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuXHQgKi9cblx0ZnVuY3Rpb24gY2FsY1BvbGFyU3RlcCh4LHksIHZhbHMsIHNpemUsIGNoYW5uZWxzLCBtaW5zLCBtYXhlcykge1xuXHRcdC8vY2V0IGNlbnRlclxuXHRcdHZhciBjeCA9IHNpemVbMF0vMiwgY3kgPSBzaXplWzFdLzI7XG5cblx0XHQvL2dldCByYWRpdXNcblx0XHR2YXIgciA9IE1hdGguc3FydCgoY3gteCkqKGN4LXgpICsgKGN5LXkpKihjeS15KSk7XG5cblx0XHQvL25vcm1hbGl6ZSByYWRpdXNcblx0XHR2YXIgbnIgPSByIC8gY3g7XG5cblx0XHQvL2dldCBhbmdsZVxuXHRcdHZhciBhID0gTWF0aC5hdGFuMiggY3kteSwgY3gteCApO1xuXG5cdFx0Ly9nZXQgbm9ybWFsaXplZCBhbmdsZSAoYXZvaWQgbmVnYXRpdmUgdmFsdWVzKVxuXHRcdHZhciBuYSA9IChhICsgTWF0aC5QSSkvTWF0aC5QSS8yO1xuXG5cblx0XHQvL2NoIDEgaXMgcmFkaXVzXG5cdFx0aWYgKGNoYW5uZWxzWzFdIHx8IGNoYW5uZWxzWzFdID09PSAwKSB7XG5cdFx0XHR2YWxzW2NoYW5uZWxzWzFdXSA9IG1pbnNbMV0gKyAobWF4ZXNbMV0gLSBtaW5zWzFdKSAqIG5yO1xuXHRcdH1cblxuXHRcdC8vY2ggMiBpcyBhbmdsZVxuXHRcdGlmIChjaGFubmVsc1swXSB8fCBjaGFubmVsc1swXSA9PT0gMCkge1xuXHRcdFx0dmFsc1tjaGFubmVsc1swXV0gPSBtaW5zWzBdICsgKG1heGVzWzBdIC0gbWluc1swXSkgKiBuYTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFscztcblx0fVxuXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSBzdGVwIHZhbHVlcyBmb3IgYSByZWN0YW5ndWxhciByYW5nZVxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB2YWxzIHN0ZXAgdmFsdWVzIHRvIGNhbGNcblx0ICogQHBhcmFtIHthcnJheX0gc2l6ZSBzaXplIG9mIHJlY3Rcblx0ICogQHBhcmFtIHthcnJheX0gbWlucyBtaW4gYzEsYzJcblx0ICogQHBhcmFtIHthcnJheX0gbWF4ZXMgbWF4IGMxLGMyXG5cdCAqXG5cdCAqIEByZXR1cm4ge2FycmF5fSBbZGVzY3JpcHRpb25dXG5cdCAqL1xuXHRmdW5jdGlvbiBjYWxjUmVjdFN0ZXAoeCx5LCB2YWxzLCBzaXplLCBjaGFubmVscywgbWlucywgbWF4ZXMpIHtcblx0XHRpZiAoY2hhbm5lbHNbMV0gfHwgY2hhbm5lbHNbMV0gPT09IDApIHtcblx0XHRcdHZhbHNbY2hhbm5lbHNbMV1dID0gbWluc1sxXSArIChtYXhlc1sxXSAtIG1pbnNbMV0pICogKDEgLSB5IC8gKHNpemVbMV0gLSAxKSk7XG5cdFx0fVxuXHRcdGlmIChjaGFubmVsc1swXSB8fCBjaGFubmVsc1swXSA9PT0gMCkge1xuXHRcdFx0dmFsc1tjaGFubmVsc1swXV0gPSBtaW5zWzBdICsgKG1heGVzWzBdIC0gbWluc1swXSkgKiB4IC8gKHNpemVbMF0gLSAxKTtcblx0XHR9XG5cdFx0cmV0dXJuIHZhbHM7XG5cdH1cbn1cblxuXG4vKipcbiAqIFJlbmRlciB0cmFuc3BhcmVuY3kgZ3JpZC5cbiAqIEltYWdlIGRhdGEgaXMgc3BsaXQgaW4gdHdvIGVxdWFsbHlcbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBhIFJnYiB2YWx1ZXMgcmVwcmVzZW50aW5nIFwid2hpdGVcIiBjZWxsXG4gKiBAcGFyYW0ge2FycmF5fSBiIFJnYiB2YWx1ZXMgcmVwcmVzZW50aW5nIFwiYmxhY2tcIiBjZWxsXG4gKiBAcGFyYW0ge0ltYWdlRGF0YX0gaW1nRGF0YSBBIGRhdGEgdGFrZW4gYXMgYSBiYXNlIGZvciBncmlkXG4gKlxuICogQHJldHVybiB7SW1hZ2VEYXRhfSBSZXR1cm4gdXBkYXRlZCBpbWFnZURhdGFcbiAqL1xucmVuZGVyLmNoZXNzID0gZnVuY3Rpb24gKGEsIGIsIGRhdGEpIHtcblx0Ly9zdXBwb3NlIHNxdWFyZSBkYXRhXG5cdHZhciB3ID0gTWF0aC5mbG9vcihNYXRoLnNxcnQoZGF0YS5sZW5ndGggLyA0KSksIGggPSB3O1xuXG5cdHZhciBjZWxsSCA9IH5+KGgvMik7XG5cdHZhciBjZWxsVyA9IH5+KHcvMik7XG5cblx0Ly9jb252ZXJ0IGFscGhhcyB0byAyNTVcblx0aWYgKGEubGVuZ3RoID09PSA0KSBhWzNdICo9IDI1NTtcblx0aWYgKGIubGVuZ3RoID09PSA0KSBiWzNdICo9IDI1NTtcblxuXHRmb3IgKHZhciB5PTAsIGNvbCwgcm93OyB5IDwgaDsgeSsrKSB7XG5cdFx0cm93ID0geSAqIHcgKiA0O1xuXHRcdGZvciAoIHZhciB4PTA7IHggPCB3OyB4KyspIHtcblx0XHRcdGNvbCA9IHJvdyArIHggKiA0O1xuXHRcdFx0ZGF0YS5zZXQoeCA+PSBjZWxsVyA/ICh5ID49IGNlbGxIID8gYSA6IGIpIDogKHkgPj0gY2VsbEggPyBiIDogYSksIGNvbCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRhdGE7XG59OyIsIi8qKlxyXG4gKiBTdXBwb3NlZCB0byBiZSB1c2VkIHZpYSB3ZWJ3b3JraWZ5LlxyXG4gKiBKdXN0IHVzZSB0aGlzIGNvZGU6XHJcbiAqXHJcbiAqXHR2YXIgd29yayA9IHJlcXVpcmUoJ3dlYndvcmtpZnknKTtcclxuICpcdHZhciB3b3JrZXIgPSB3b3JrKHJlcXVpcmUoJ2NvbG9yLXJhbmdlci93b3JrZXInKSk7XHJcbiAqXHJcbiAqXHR3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xyXG4gKlx0XHQuLi5cclxuICpcdH0pO1xyXG4gKlxyXG4gKlx0d29ya2VyLnBvc3RNZXNzYWdlKGRhdGEpO1xyXG4gKlxyXG4gKiBAbW9kdWxlICBjb2xvci1yYW5nZXIvd29ya2VyXHJcbiAqL1xyXG52YXIgcmVuZGVyID0gcmVxdWlyZSgnLi8nKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNlbGYpIHtcclxuXHRzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0dmFyIGRhdGEgPSBlLmRhdGEsIHJlc3VsdDtcclxuXHJcblx0XHQvL2lnbm9yZSBlbXB0eSBkYXRhXHJcblx0XHRpZiAoIWRhdGEpIHJldHVybiBwb3N0TWVzc2FnZShmYWxzZSk7XHJcblxyXG5cdFx0cmVzdWx0ID0gcmVuZGVyKGRhdGEucmdiLCBkYXRhLmRhdGEsIGRhdGEpO1xyXG5cclxuXHRcdHBvc3RNZXNzYWdlKHtcclxuXHRcdFx0ZGF0YTogcmVzdWx0LFxyXG5cdFx0XHRpZDogZS5kYXRhLmlkXHJcblx0XHR9KTtcclxuXHR9O1xyXG59OyIsIi8qKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZS9jbXlrXG4gKi9cblxudmFyIHJnYiA9IHJlcXVpcmUoJy4vcmdiJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnY215aycsXG5cdG1pbjogWzAsMCwwLDBdLFxuXHRtYXg6IFsxMDAsMTAwLDEwMCwxMDBdLFxuXHRjaGFubmVsOiBbJ2N5YW4nLCAnbWFnZW50YScsICd5ZWxsb3cnLCAnYmxhY2snXSxcblxuXHRyZ2I6IGZ1bmN0aW9uKGNteWspIHtcblx0XHR2YXIgYyA9IGNteWtbMF0gLyAxMDAsXG5cdFx0XHRcdG0gPSBjbXlrWzFdIC8gMTAwLFxuXHRcdFx0XHR5ID0gY215a1syXSAvIDEwMCxcblx0XHRcdFx0ayA9IGNteWtbM10gLyAxMDAsXG5cdFx0XHRcdHIsIGcsIGI7XG5cblx0XHRyID0gMSAtIE1hdGgubWluKDEsIGMgKiAoMSAtIGspICsgayk7XG5cdFx0ZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuXHRcdGIgPSAxIC0gTWF0aC5taW4oMSwgeSAqICgxIC0gaykgKyBrKTtcblx0XHRyZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xuXHR9XG59O1xuXG5cbi8vZXh0ZW5kIHJnYlxucmdiLmNteWsgPSBmdW5jdGlvbihyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTUsXG5cdFx0XHRnID0gcmdiWzFdIC8gMjU1LFxuXHRcdFx0YiA9IHJnYlsyXSAvIDI1NSxcblx0XHRcdGMsIG0sIHksIGs7XG5cblx0ayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpO1xuXHRjID0gKDEgLSByIC0gaykgLyAoMSAtIGspIHx8IDA7XG5cdG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gaykgfHwgMDtcblx0eSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKSB8fCAwO1xuXHRyZXR1cm4gW2MgKiAxMDAsIG0gKiAxMDAsIHkgKiAxMDAsIGsgKiAxMDBdO1xufTsiLCIvKipcbiAqIEBtb2R1bGUgY29sb3Itc3BhY2UvaHNsXG4gKi9cblxudmFyIHJnYiA9IHJlcXVpcmUoJy4vcmdiJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnaHNsJyxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFszNjAsMTAwLDEwMF0sXG5cdGNoYW5uZWw6IFsnaHVlJywgJ3NhdHVyYXRpb24nLCAnbGlnaHRuZXNzJ10sXG5cblx0cmdiOiBmdW5jdGlvbihoc2wpIHtcblx0XHR2YXIgaCA9IGhzbFswXSAvIDM2MCxcblx0XHRcdFx0cyA9IGhzbFsxXSAvIDEwMCxcblx0XHRcdFx0bCA9IGhzbFsyXSAvIDEwMCxcblx0XHRcdFx0dDEsIHQyLCB0MywgcmdiLCB2YWw7XG5cblx0XHRpZiAocyA9PT0gMCkge1xuXHRcdFx0dmFsID0gbCAqIDI1NTtcblx0XHRcdHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG5cdFx0fVxuXG5cdFx0aWYgKGwgPCAwLjUpIHtcblx0XHRcdHQyID0gbCAqICgxICsgcyk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dDIgPSBsICsgcyAtIGwgKiBzO1xuXHRcdH1cblx0XHR0MSA9IDIgKiBsIC0gdDI7XG5cblx0XHRyZ2IgPSBbMCwgMCwgMF07XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRcdHQzID0gaCArIDEgLyAzICogLSAoaSAtIDEpO1xuXHRcdFx0aWYgKHQzIDwgMCkge1xuXHRcdFx0XHR0MysrO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodDMgPiAxKSB7XG5cdFx0XHRcdHQzLS07XG5cdFx0XHR9XG5cblx0XHRcdGlmICg2ICogdDMgPCAxKSB7XG5cdFx0XHRcdHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoMiAqIHQzIDwgMSkge1xuXHRcdFx0XHR2YWwgPSB0Mjtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKDMgKiB0MyA8IDIpIHtcblx0XHRcdFx0dmFsID0gdDEgKyAodDIgLSB0MSkgKiAoMiAvIDMgLSB0MykgKiA2O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHZhbCA9IHQxO1xuXHRcdFx0fVxuXG5cdFx0XHRyZ2JbaV0gPSB2YWwgKiAyNTU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJnYjtcblx0fVxufTtcblxuXG4vL2V4dGVuZCByZ2JcbnJnYi5oc2wgPSBmdW5jdGlvbihyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0vMjU1LFxuXHRcdFx0ZyA9IHJnYlsxXS8yNTUsXG5cdFx0XHRiID0gcmdiWzJdLzI1NSxcblx0XHRcdG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuXHRcdFx0bWF4ID0gTWF0aC5tYXgociwgZywgYiksXG5cdFx0XHRkZWx0YSA9IG1heCAtIG1pbixcblx0XHRcdGgsIHMsIGw7XG5cblx0aWYgKG1heCA9PT0gbWluKSB7XG5cdFx0aCA9IDA7XG5cdH1cblx0ZWxzZSBpZiAociA9PT0gbWF4KSB7XG5cdFx0aCA9IChnIC0gYikgLyBkZWx0YTtcblx0fVxuXHRlbHNlIGlmIChnID09PSBtYXgpIHtcblx0XHRoID0gMiArIChiIC0gcikgLyBkZWx0YTtcblx0fVxuXHRlbHNlIGlmIChiID09PSBtYXgpIHtcblx0XHRoID0gNCArIChyIC0gZykvIGRlbHRhO1xuXHR9XG5cblx0aCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuXHRpZiAoaCA8IDApIHtcblx0XHRoICs9IDM2MDtcblx0fVxuXG5cdGwgPSAobWluICsgbWF4KSAvIDI7XG5cblx0aWYgKG1heCA9PT0gbWluKSB7XG5cdFx0cyA9IDA7XG5cdH1cblx0ZWxzZSBpZiAobCA8PSAwLjUpIHtcblx0XHRzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcblx0fVxuXHRlbHNlIHtcblx0XHRzID0gZGVsdGEgLyAoMiAtIG1heCAtIG1pbik7XG5cdH1cblxuXHRyZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufTsiLCIvKipcbiAqIEBtb2R1bGUgY29sb3Itc3BhY2UvaHN2XG4gKi9cblxudmFyIHJnYiA9IHJlcXVpcmUoJy4vcmdiJyk7XG52YXIgaHNsID0gcmVxdWlyZSgnLi9oc2wnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdoc3YnLFxuXHRtaW46IFswLDAsMF0sXG5cdG1heDogWzM2MCwxMDAsMTAwXSxcblx0Y2hhbm5lbDogWydodWUnLCAnc2F0dXJhdGlvbicsICd2YWx1ZSddLFxuXHRhbGlhczogWydoc2InXSxcblxuXHRyZ2I6IGZ1bmN0aW9uKGhzdikge1xuXHRcdHZhciBoID0gaHN2WzBdIC8gNjAsXG5cdFx0XHRcdHMgPSBoc3ZbMV0gLyAxMDAsXG5cdFx0XHRcdHYgPSBoc3ZbMl0gLyAxMDAsXG5cdFx0XHRcdGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cblx0XHR2YXIgZiA9IGggLSBNYXRoLmZsb29yKGgpLFxuXHRcdFx0XHRwID0gMjU1ICogdiAqICgxIC0gcyksXG5cdFx0XHRcdHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKSxcblx0XHRcdFx0dCA9IDI1NSAqIHYgKiAoMSAtIChzICogKDEgLSBmKSkpO1xuXHRcdHYgKj0gMjU1O1xuXG5cdFx0c3dpdGNoKGhpKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdHJldHVybiBbdiwgdCwgcF07XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHJldHVybiBbcSwgdiwgcF07XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHJldHVybiBbcCwgdiwgdF07XG5cdFx0XHRjYXNlIDM6XG5cdFx0XHRcdHJldHVybiBbcCwgcSwgdl07XG5cdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdHJldHVybiBbdCwgcCwgdl07XG5cdFx0XHRjYXNlIDU6XG5cdFx0XHRcdHJldHVybiBbdiwgcCwgcV07XG5cdFx0fVxuXHR9LFxuXG5cdGhzbDogZnVuY3Rpb24oaHN2KSB7XG5cdFx0dmFyIGggPSBoc3ZbMF0sXG5cdFx0XHRzID0gaHN2WzFdIC8gMTAwLFxuXHRcdFx0diA9IGhzdlsyXSAvIDEwMCxcblx0XHRcdHNsLCBsO1xuXG5cdFx0bCA9ICgyIC0gcykgKiB2O1xuXHRcdHNsID0gcyAqIHY7XG5cdFx0c2wgLz0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG5cdFx0c2wgPSBzbCB8fCAwO1xuXHRcdGwgLz0gMjtcblxuXHRcdHJldHVybiBbaCwgc2wgKiAxMDAsIGwgKiAxMDBdO1xuXHR9XG59O1xuXG5cbi8vYXBwZW5kIHJnYlxucmdiLmhzdiA9IGZ1bmN0aW9uKHJnYikge1xuXHR2YXIgciA9IHJnYlswXSxcblx0XHRcdGcgPSByZ2JbMV0sXG5cdFx0XHRiID0gcmdiWzJdLFxuXHRcdFx0bWluID0gTWF0aC5taW4ociwgZywgYiksXG5cdFx0XHRtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcblx0XHRcdGRlbHRhID0gbWF4IC0gbWluLFxuXHRcdFx0aCwgcywgdjtcblxuXHRpZiAobWF4ID09PSAwKSB7XG5cdFx0cyA9IDA7XG5cdH1cblx0ZWxzZSB7XG5cdFx0cyA9IChkZWx0YS9tYXggKiAxMDAwKS8xMDtcblx0fVxuXG5cdGlmIChtYXggPT09IG1pbikge1xuXHRcdGggPSAwO1xuXHR9XG5cdGVsc2UgaWYgKHIgPT09IG1heCkge1xuXHRcdGggPSAoZyAtIGIpIC8gZGVsdGE7XG5cdH1cblx0ZWxzZSBpZiAoZyA9PT0gbWF4KSB7XG5cdFx0aCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG5cdH1cblx0ZWxzZSBpZiAoYiA9PT0gbWF4KSB7XG5cdFx0aCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG5cdH1cblxuXHRoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cblx0diA9ICgobWF4IC8gMjU1KSAqIDEwMDApIC8gMTA7XG5cblx0cmV0dXJuIFtoLCBzLCB2XTtcbn07XG5cblxuXG4vL2V4dGVuZCBoc2xcbmhzbC5oc3YgPSBmdW5jdGlvbihoc2wpIHtcblx0dmFyIGggPSBoc2xbMF0sXG5cdFx0XHRzID0gaHNsWzFdIC8gMTAwLFxuXHRcdFx0bCA9IGhzbFsyXSAvIDEwMCxcblx0XHRcdHN2LCB2O1xuXHRsICo9IDI7XG5cdHMgKj0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG5cdHYgPSAobCArIHMpIC8gMjtcblx0c3YgPSAoMiAqIHMpIC8gKGwgKyBzKSB8fCAwO1xuXG5cdHJldHVybiBbaCwgc3YgKiAxMDAsIHYgKiAxMDBdO1xufTsiLCIvKipcbiAqIEEgdW5pZm9ybSB3cmFwcGVyIGZvciBodXNsLlxuICogLy8gaHR0cDovL3d3dy5ib3JvbmluZS5jb20vaHVzbC9cbiAqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2h1c2xcbiAqL1xuXG52YXIgeHl6ID0gcmVxdWlyZSgnLi94eXonKTtcbnZhciBsY2h1diA9IHJlcXVpcmUoJy4vbGNodXYnKTtcbnZhciBfaHVzbCA9IHJlcXVpcmUoJ2h1c2wnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ2h1c2wnLFxuXHRtaW46IFswLDAsMF0sXG5cdG1heDogWzM2MCwxMDAsMTAwXSxcblx0Y2hhbm5lbDogWydodWUnLCAnc2F0dXJhdGlvbicsICdsaWdodG5lc3MnXSxcblxuXHRsY2h1djogX2h1c2wuX2NvbnYuaHVzbC5sY2gsXG5cblx0eHl6OiBmdW5jdGlvbihhcmcpe1xuXHRcdHJldHVybiBsY2h1di54eXooX2h1c2wuX2NvbnYuaHVzbC5sY2goYXJnKSk7XG5cdH0sXG5cblx0Ly9hIHNob3J0ZXIgd2F5IHRvIGNvbnZlcnQgdG8gaHVzbHBcblx0aHVzbHA6IGZ1bmN0aW9uKGFyZyl7XG5cdFx0cmV0dXJuIF9odXNsLl9jb252LmxjaC5odXNscCggX2h1c2wuX2NvbnYuaHVzbC5sY2goYXJnKSk7XG5cdH1cbn07XG5cbi8vZXh0ZW5kIGxjaHV2LCB4eXpcbmxjaHV2Lmh1c2wgPSBfaHVzbC5fY29udi5sY2guaHVzbDtcbnh5ei5odXNsID0gZnVuY3Rpb24oYXJnKXtcblx0cmV0dXJuIF9odXNsLl9jb252LmxjaC5odXNsKHh5ei5sY2h1dihhcmcpKTtcbn07IiwiLyoqXG4gKiBBIHVuaWZvcm0gd3JhcHBlciBmb3IgaHVzbHAuXG4gKiAvLyBodHRwOi8vd3d3LmJvcm9uaW5lLmNvbS9odXNsL1xuICpcbiAqIEBtb2R1bGUgY29sb3Itc3BhY2UvaHVzbHBcbiAqL1xuXG52YXIgeHl6ID0gcmVxdWlyZSgnLi94eXonKTtcbnZhciBsY2h1diA9IHJlcXVpcmUoJy4vbGNodXYnKTtcbnZhciBfaHVzbCA9IHJlcXVpcmUoJ2h1c2wnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdodXNscCcsXG5cdG1pbjogWzAsMCwwXSxcblx0bWF4OiBbMzYwLDEwMCwxMDBdLFxuXHRjaGFubmVsOiBbJ2h1ZScsICdzYXR1cmF0aW9uJywgJ2xpZ2h0bmVzcyddLFxuXG5cdGxjaHV2OiBfaHVzbC5fY29udi5odXNscC5sY2gsXG5cdHh5ejogZnVuY3Rpb24oYXJnKXtyZXR1cm4gbGNodXYueHl6KF9odXNsLl9jb252Lmh1c2xwLmxjaChhcmcpKTt9LFxuXG5cdC8vYSBzaG9ydGVyIHdheSB0byBjb252ZXJ0IHRvIGh1c2xcblx0aHVzbDogZnVuY3Rpb24oYXJnKXtcblx0XHRyZXR1cm4gX2h1c2wuX2NvbnYubGNoLmh1c2woIF9odXNsLl9jb252Lmh1c2xwLmxjaChhcmcpKTtcblx0fVxufTtcblxuLy9leHRlbmQgbGNodXYsIHh5elxubGNodXYuaHVzbHAgPSBfaHVzbC5fY29udi5sY2guaHVzbHA7XG54eXouaHVzbHAgPSBmdW5jdGlvbihhcmcpe3JldHVybiBfaHVzbC5fY29udi5sY2guaHVzbHAoeHl6LmxjaHV2KGFyZykpO307IiwiLyoqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2h3YlxuICovXG5cbnZhciByZ2IgPSByZXF1aXJlKCcuL3JnYicpO1xudmFyIGhzdiA9IHJlcXVpcmUoJy4vaHN2Jyk7XG52YXIgaHNsID0gcmVxdWlyZSgnLi9oc2wnKTtcblxuXG52YXIgaHdiID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdod2InLFxuXHRtaW46IFswLDAsMF0sXG5cdG1heDogWzM2MCwxMDAsMTAwXSxcblx0Y2hhbm5lbDogWydodWUnLCAnd2hpdGVuZXNzJywgJ2JsYWNrbmVzcyddLFxuXG5cdC8vIGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzcy1jb2xvci8jaHdiLXRvLXJnYlxuXHRyZ2I6IGZ1bmN0aW9uKGh3Yikge1xuXHRcdHZhciBoID0gaHdiWzBdIC8gMzYwLFxuXHRcdFx0d2ggPSBod2JbMV0gLyAxMDAsXG5cdFx0XHRibCA9IGh3YlsyXSAvIDEwMCxcblx0XHRcdHJhdGlvID0gd2ggKyBibCxcblx0XHRcdGksIHYsIGYsIG47XG5cblx0XHR2YXIgciwgZywgYjtcblxuXHRcdC8vIHdoICsgYmwgY2FudCBiZSA+IDFcblx0XHRpZiAocmF0aW8gPiAxKSB7XG5cdFx0XHR3aCAvPSByYXRpbztcblx0XHRcdGJsIC89IHJhdGlvO1xuXHRcdH1cblxuXHRcdGkgPSBNYXRoLmZsb29yKDYgKiBoKTtcblx0XHR2ID0gMSAtIGJsO1xuXHRcdGYgPSA2ICogaCAtIGk7XG5cblx0XHQvL2lmIGl0IGlzIGV2ZW5cblx0XHRpZiAoKGkgJiAweDAxKSAhPT0gMCkge1xuXHRcdFx0ZiA9IDEgLSBmO1xuXHRcdH1cblxuXHRcdG4gPSB3aCArIGYgKiAodiAtIHdoKTsgIC8vIGxpbmVhciBpbnRlcnBvbGF0aW9uXG5cblx0XHRzd2l0Y2ggKGkpIHtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRjYXNlIDY6XG5cdFx0XHRjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcblx0XHRcdGNhc2UgMTogciA9IG47IGcgPSB2OyBiID0gd2g7IGJyZWFrO1xuXHRcdFx0Y2FzZSAyOiByID0gd2g7IGcgPSB2OyBiID0gbjsgYnJlYWs7XG5cdFx0XHRjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcblx0XHRcdGNhc2UgNDogciA9IG47IGcgPSB3aDsgYiA9IHY7IGJyZWFrO1xuXHRcdFx0Y2FzZSA1OiByID0gdjsgZyA9IHdoOyBiID0gbjsgYnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcblx0fSxcblxuXG5cdC8vIGh0dHA6Ly9hbHZ5cmF5LmNvbS9QYXBlcnMvQ0cvSFdCX0pHVHYyMDgucGRmXG5cdGhzdjogZnVuY3Rpb24oYXJnKXtcblx0XHR2YXIgaCA9IGFyZ1swXSwgdyA9IGFyZ1sxXSwgYiA9IGFyZ1syXSwgcywgdjtcblxuXHRcdC8vaWYgdytiID4gMTAwJSAtIHRha2UgcHJvcG9ydGlvbiAoaG93IG1hbnkgdGltZXMgKVxuXHRcdGlmICh3ICsgYiA+PSAxMDApe1xuXHRcdFx0cyA9IDA7XG5cdFx0XHR2ID0gMTAwICogdy8odytiKTtcblx0XHR9XG5cblx0XHQvL2J5IGRlZmF1bHQgLSB0YWtlIHdpa2kgZm9ybXVsYVxuXHRcdGVsc2Uge1xuXHRcdFx0cyA9IDEwMC0ody8oMS1iLzEwMCkpO1xuXHRcdFx0diA9IDEwMC1iO1xuXHRcdH1cblxuXG5cdFx0cmV0dXJuIFtoLCBzLCB2XTtcblx0fSxcblxuXHRoc2w6IGZ1bmN0aW9uKGFyZyl7XG5cdFx0cmV0dXJuIGhzdi5oc2woaHdiLmhzdihhcmcpKTtcblx0fVxufTtcblxuXG4vL2V4dGVuZCByZ2JcbnJnYi5od2IgPSBmdW5jdGlvbih2YWwpIHtcblx0dmFyIHIgPSB2YWxbMF0sXG5cdFx0XHRnID0gdmFsWzFdLFxuXHRcdFx0YiA9IHZhbFsyXSxcblx0XHRcdGggPSByZ2IuaHNsKHZhbClbMF0sXG5cdFx0XHR3ID0gMS8yNTUgKiBNYXRoLm1pbihyLCBNYXRoLm1pbihnLCBiKSk7XG5cblx0XHRcdGIgPSAxIC0gMS8yNTUgKiBNYXRoLm1heChyLCBNYXRoLm1heChnLCBiKSk7XG5cblx0cmV0dXJuIFtoLCB3ICogMTAwLCBiICogMTAwXTtcbn07XG5cblxuXG4vL2tlZXAgcHJvcGVyIGh1ZSBvbiAwIHZhbHVlcyAoY29udmVyc2lvbiB0byByZ2IgbG9zZXMgaHVlIG9uIHplcm8tbGlnaHRuZXNzKVxuaHN2Lmh3YiA9IGZ1bmN0aW9uKGFyZyl7XG5cdHZhciBoID0gYXJnWzBdLCBzID0gYXJnWzFdLCB2ID0gYXJnWzJdO1xuXHRyZXR1cm4gW2gsIHYgPT09IDAgPyAwIDogKHYgKiAoMS1zLzEwMCkpLCAxMDAgLSB2XTtcbn07XG5cblxuLy9leHRlbmQgaHNsIHdpdGggcHJvcGVyIGNvbnZlcnNpb25zXG5oc2wuaHdiID0gZnVuY3Rpb24oYXJnKXtcblx0cmV0dXJuIGhzdi5od2IoaHNsLmhzdihhcmcpKTtcbn07IiwiLyoqXG4gKiBDSUUgTEFCIHNwYWNlIG1vZGVsXG4gKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZS9sYWJcbiAqL1xuXG52YXIgeHl6ID0gcmVxdWlyZSgnLi94eXonKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdsYWInLFxuXHRtaW46IFswLC0xMDAsLTEwMF0sXG5cdG1heDogWzEwMCwxMDAsMTAwXSxcblx0Y2hhbm5lbDogWydsaWdodG5lc3MnLCAnYScsICdiJ10sXG5cdGFsaWFzOiBbJ2NpZWxhYiddLFxuXG5cdHh5ejogZnVuY3Rpb24obGFiKSB7XG5cdFx0dmFyIGwgPSBsYWJbMF0sXG5cdFx0XHRcdGEgPSBsYWJbMV0sXG5cdFx0XHRcdGIgPSBsYWJbMl0sXG5cdFx0XHRcdHgsIHksIHosIHkyO1xuXG5cdFx0aWYgKGwgPD0gOCkge1xuXHRcdFx0eSA9IChsICogMTAwKSAvIDkwMy4zO1xuXHRcdFx0eTIgPSAoNy43ODcgKiAoeSAvIDEwMCkpICsgKDE2IC8gMTE2KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0eSA9IDEwMCAqIE1hdGgucG93KChsICsgMTYpIC8gMTE2LCAzKTtcblx0XHRcdHkyID0gTWF0aC5wb3coeSAvIDEwMCwgMS8zKTtcblx0XHR9XG5cblx0XHR4ID0geCAvIDk1LjA0NyA8PSAwLjAwODg1NiA/IHggPSAoOTUuMDQ3ICogKChhIC8gNTAwKSArIHkyIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiA5NS4wNDcgKiBNYXRoLnBvdygoYSAvIDUwMCkgKyB5MiwgMyk7XG5cblx0XHR6ID0geiAvIDEwOC44ODMgPD0gMC4wMDg4NTkgPyB6ID0gKDEwOC44ODMgKiAoeTIgLSAoYiAvIDIwMCkgLSAoMTYgLyAxMTYpKSkgLyA3Ljc4NyA6IDEwOC44ODMgKiBNYXRoLnBvdyh5MiAtIChiIC8gMjAwKSwgMyk7XG5cblx0XHRyZXR1cm4gW3gsIHksIHpdO1xuXHR9XG59O1xuXG5cbi8vZXh0ZW5kIHh5elxueHl6LmxhYiA9IGZ1bmN0aW9uKHh5eil7XG5cdHZhciB4ID0geHl6WzBdLFxuXHRcdFx0eSA9IHh5elsxXSxcblx0XHRcdHogPSB4eXpbMl0sXG5cdFx0XHRsLCBhLCBiO1xuXG5cdHggLz0gOTUuMDQ3O1xuXHR5IC89IDEwMDtcblx0eiAvPSAxMDguODgzO1xuXG5cdHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxLzMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuXHR5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMS8zKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcblx0eiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEvMykgOiAoNy43ODcgKiB6KSArICgxNiAvIDExNik7XG5cblx0bCA9ICgxMTYgKiB5KSAtIDE2O1xuXHRhID0gNTAwICogKHggLSB5KTtcblx0YiA9IDIwMCAqICh5IC0geik7XG5cblx0cmV0dXJuIFtsLCBhLCBiXTtcbn07IiwiLyoqXG4gKiBDeWxpbmRyaWNhbCBMQUJcbiAqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2xjaGFiXG4gKi9cblxudmFyIHh5eiA9IHJlcXVpcmUoJy4veHl6Jyk7XG52YXIgbGFiID0gcmVxdWlyZSgnLi9sYWInKTtcblxuXG4vL2N5bGluZHJpY2FsIGxhYlxudmFyIGxjaGFiID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdsY2hhYicsXG5cdG1pbjogWzAsMCwwXSxcblx0bWF4OiBbMTAwLDEwMCwzNjBdLFxuXHRjaGFubmVsOiBbJ2xpZ2h0bmVzcycsICdjaHJvbWEnLCAnaHVlJ10sXG5cdGFsaWFzOiBbJ2NpZWxjaCcsICdsY2gnXSxcblxuXHR4eXo6IGZ1bmN0aW9uKGFyZykge1xuXHRcdHJldHVybiBsYWIueHl6KGxjaGFiLmxhYihhcmcpKTtcblx0fSxcblxuXHRsYWI6IGZ1bmN0aW9uKGxjaCkge1xuXHRcdHZhciBsID0gbGNoWzBdLFxuXHRcdFx0XHRjID0gbGNoWzFdLFxuXHRcdFx0XHRoID0gbGNoWzJdLFxuXHRcdFx0XHRhLCBiLCBocjtcblxuXHRcdGhyID0gaCAvIDM2MCAqIDIgKiBNYXRoLlBJO1xuXHRcdGEgPSBjICogTWF0aC5jb3MoaHIpO1xuXHRcdGIgPSBjICogTWF0aC5zaW4oaHIpO1xuXHRcdHJldHVybiBbbCwgYSwgYl07XG5cdH1cbn07XG5cblxuLy9leHRlbmQgbGFiXG5sYWIubGNoYWIgPSBmdW5jdGlvbihsYWIpIHtcblx0dmFyIGwgPSBsYWJbMF0sXG5cdFx0XHRhID0gbGFiWzFdLFxuXHRcdFx0YiA9IGxhYlsyXSxcblx0XHRcdGhyLCBoLCBjO1xuXG5cdGhyID0gTWF0aC5hdGFuMihiLCBhKTtcblx0aCA9IGhyICogMzYwIC8gMiAvIE1hdGguUEk7XG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cdGMgPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYik7XG5cdHJldHVybiBbbCwgYywgaF07XG59O1xuXG54eXoubGNoYWIgPSBmdW5jdGlvbihhcmcpe1xuXHRyZXR1cm4gbGFiLmxjaGFiKHh5ei5sYWIoYXJnKSk7XG59OyIsIi8qKlxuICogQ3lsaW5kcmljYWwgQ0lFIExVVlxuICpcbiAqIEBtb2R1bGUgY29sb3Itc3BhY2UvbGNodXZcbiAqL1xuXG52YXIgbHV2ID0gcmVxdWlyZSgnLi9sdXYnKTtcbnZhciB4eXogPSByZXF1aXJlKCcuL3h5eicpO1xuXG4vL2N5bGluZHJpY2FsIGx1dlxudmFyIGxjaHV2ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdsY2h1dicsXG5cdGNoYW5uZWw6IFsnbGlnaHRuZXNzJywgJ2Nocm9tYScsICdodWUnXSxcblx0YWxpYXM6IFsnY2llbGNodXYnXSxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFsxMDAsMTAwLDM2MF0sXG5cblx0bHV2OiBmdW5jdGlvbihsdXYpe1xuXHRcdHZhciBsID0gbHV2WzBdLFxuXHRcdGMgPSBsdXZbMV0sXG5cdFx0aCA9IGx1dlsyXSxcblx0XHR1LCB2LCBocjtcblxuXHRcdGhyID0gaCAvIDM2MCAqIDIgKiBNYXRoLlBJO1xuXHRcdHUgPSBjICogTWF0aC5jb3MoaHIpO1xuXHRcdHYgPSBjICogTWF0aC5zaW4oaHIpO1xuXHRcdHJldHVybiBbbCwgdSwgdl07XG5cdH0sXG5cblx0eHl6OiBmdW5jdGlvbihhcmcpIHtcblx0XHRyZXR1cm4gbHV2Lnh5eihsY2h1di5sdXYoYXJnKSk7XG5cdH0sXG59O1xuXG5sdXYubGNodXYgPSBmdW5jdGlvbihsdXYpe1xuXHR2YXIgbCA9IGx1dlswXSwgdSA9IGx1dlsxXSwgdiA9IGx1dlsyXTtcblxuXHR2YXIgYyA9IE1hdGguc3FydCh1KnUgKyB2KnYpO1xuXHR2YXIgaHIgPSBNYXRoLmF0YW4yKHYsdSk7XG5cdHZhciBoID0gaHIgKiAzNjAgLyAyIC8gTWF0aC5QSTtcblx0aWYgKGggPCAwKSB7XG5cdFx0aCArPSAzNjA7XG5cdH1cblxuXHRyZXR1cm4gW2wsYyxoXVxufTtcblxueHl6LmxjaHV2ID0gZnVuY3Rpb24oYXJnKXtcbiAgcmV0dXJuIGx1di5sY2h1dih4eXoubHV2KGFyZykpO1xufTsiLCIvKipcbiAqIENJRSBMVVYgKEMnZXN0IGxhIHZpZSlcbiAqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2x1dlxuICovXG5cbnZhciB4eXogPSByZXF1aXJlKCcuL3h5eicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ2x1dicsXG5cdC8vTk9URTogbHV2IGhhcyBubyByaWdpZGx5IGRlZmluZWQgbGltaXRzXG5cdC8vZWFzeXJnYiBmYWlscyB0byBnZXQgcHJvcGVyIGNvb3Jkc1xuXHQvL2Jvcm9uaW5lIHN0YXRlcyBubyByaWdpZCBsaW1pdHNcblx0Ly9jb2xvck1pbmUgcmVmZXJzIHRoaXMgb25lczpcblx0bWluOiBbMCwtMTM0LC0xNDBdLFxuXHRtYXg6IFsxMDAsMjI0LDEyMl0sXG5cdGNoYW5uZWw6IFsnbGlnaHRuZXNzJywgJ3UnLCAndiddLFxuXHRhbGlhczogWydjaWVsdXYnXSxcblxuXHR4eXo6IGZ1bmN0aW9uKGFyZywgaSwgbyl7XG5cdFx0dmFyIF91LCBfdiwgbCwgdSwgdiwgeCwgeSwgeiwgeG4sIHluLCB6biwgdW4sIHZuO1xuXHRcdGwgPSBhcmdbMF0sIHUgPSBhcmdbMV0sIHYgPSBhcmdbMl07XG5cblx0XHRpZiAobCA9PT0gMCkgcmV0dXJuIFswLDAsMF07XG5cblx0XHQvL2dldCBjb25zdGFudHNcblx0XHR2YXIgZSA9IDAuMDA4ODU2NDUxNjc5MDM1NjMxOyAvLyg2LzI5KV4zXG5cdFx0dmFyIGsgPSAwLjAwMTEwNzA1NjQ1OTg3OTQ1Mzk7IC8vKDMvMjkpXjNcblxuXHRcdC8vZ2V0IGlsbHVtaW5hbnQvb2JzZXJ2ZXJcblx0XHRpID0gaSB8fCAnRDY1Jztcblx0XHRvID0gbyB8fCAyO1xuXG5cdFx0eG4gPSB4eXoud2hpdGVwb2ludFtvXVtpXVswXTtcblx0XHR5biA9IHh5ei53aGl0ZXBvaW50W29dW2ldWzFdO1xuXHRcdHpuID0geHl6LndoaXRlcG9pbnRbb11baV1bMl07XG5cblx0XHR1biA9ICg0ICogeG4pIC8gKHhuICsgKDE1ICogeW4pICsgKDMgKiB6bikpO1xuXHRcdHZuID0gKDkgKiB5bikgLyAoeG4gKyAoMTUgKiB5bikgKyAoMyAqIHpuKSk7XG5cdFx0Ly8gdW4gPSAwLjE5NzgzMDAwNjY0MjgzO1xuXHRcdC8vIHZuID0gMC40NjgzMTk5OTQ5Mzg3OTtcblxuXG5cdFx0X3UgPSB1IC8gKDEzICogbCkgKyB1biB8fCAwO1xuXHRcdF92ID0gdiAvICgxMyAqIGwpICsgdm4gfHwgMDtcblxuXHRcdHkgPSBsID4gOCA/IHluICogTWF0aC5wb3coIChsICsgMTYpIC8gMTE2ICwgMykgOiB5biAqIGwgKiBrO1xuXG5cdFx0Ly93aWtpcGVkaWEgbWV0aG9kXG5cdFx0eCA9IHkgKiA5ICogX3UgLyAoNCAqIF92KSB8fCAwO1xuXHRcdHogPSB5ICogKDEyIC0gMyAqIF91IC0gMjAgKiBfdikgLyAoNCAqIF92KSB8fCAwO1xuXG5cdFx0Ly9ib3JvbmluZSBtZXRob2Rcblx0XHQvL2h0dHBzOi8vZ2l0aHViLmNvbS9ib3JvbmluZS9odXNsL2Jsb2IvbWFzdGVyL2h1c2wuY29mZmVlI0wyMDFcblx0XHQvLyB4ID0gMCAtICg5ICogeSAqIF91KSAvICgoX3UgLSA0KSAqIF92IC0gX3UgKiBfdik7XG5cdFx0Ly8geiA9ICg5ICogeSAtICgxNSAqIF92ICogeSkgLSAoX3YgKiB4KSkgLyAoMyAqIF92KTtcblxuXHRcdHJldHVybiBbeCwgeSwgel07XG5cdH1cbn07XG5cbi8vIGh0dHA6Ly93d3cuYnJ1Y2VsaW5kYmxvb20uY29tL2luZGV4Lmh0bWw/RXF1YXRpb25zLmh0bWxcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ib3JvbmluZS9odXNsL2Jsb2IvbWFzdGVyL2h1c2wuY29mZmVlXG4vL2kgLSBpbGx1bWluYW50XG4vL28gLSBvYnNlcnZlclxueHl6Lmx1diA9IGZ1bmN0aW9uKGFyZywgaSwgbykge1xuXHR2YXIgX3UsIF92LCBsLCB1LCB2LCB4LCB5LCB6LCB4biwgeW4sIHpuLCB1biwgdm47XG5cblx0Ly9nZXQgY29uc3RhbnRzXG5cdHZhciBlID0gMC4wMDg4NTY0NTE2NzkwMzU2MzE7IC8vKDYvMjkpXjNcblx0dmFyIGsgPSA5MDMuMjk2Mjk2Mjk2Mjk2MTsgLy8oMjkvMyleM1xuXG5cdC8vZ2V0IGlsbHVtaW5hbnQvb2JzZXJ2ZXIgY29vcmRzXG5cdGkgPSBpIHx8ICdENjUnO1xuXHRvID0gbyB8fCAyO1xuXG5cdHhuID0geHl6LndoaXRlcG9pbnRbb11baV1bMF07XG5cdHluID0geHl6LndoaXRlcG9pbnRbb11baV1bMV07XG5cdHpuID0geHl6LndoaXRlcG9pbnRbb11baV1bMl07XG5cblx0dW4gPSAoNCAqIHhuKSAvICh4biArICgxNSAqIHluKSArICgzICogem4pKTtcblx0dm4gPSAoOSAqIHluKSAvICh4biArICgxNSAqIHluKSArICgzICogem4pKTtcblxuXG5cdHggPSBhcmdbMF0sIHkgPSBhcmdbMV0sIHogPSBhcmdbMl07XG5cblxuXHRfdSA9ICg0ICogeCkgLyAoeCArICgxNSAqIHkpICsgKDMgKiB6KSkgfHwgMDtcblx0X3YgPSAoOSAqIHkpIC8gKHggKyAoMTUgKiB5KSArICgzICogeikpIHx8IDA7XG5cblx0dmFyIHlyID0geS95bjtcblxuXHRsID0geXIgPD0gZSA/IGsgKiB5ciA6IDExNiAqIE1hdGgucG93KHlyLCAxLzMpIC0gMTY7XG5cblx0dSA9IDEzICogbCAqIChfdSAtIHVuKTtcblx0diA9IDEzICogbCAqIChfdiAtIHZuKTtcblxuXHRyZXR1cm4gW2wsIHUsIHZdO1xufTsiLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOC4wXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBMX3RvX1ksIFlfdG9fTCwgY29udiwgZGlzdGFuY2VGcm9tUG9sZSwgZG90UHJvZHVjdCwgZXBzaWxvbiwgZnJvbUxpbmVhciwgZ2V0Qm91bmRzLCBpbnRlcnNlY3RMaW5lTGluZSwga2FwcGEsIGxlbmd0aE9mUmF5VW50aWxJbnRlcnNlY3QsIG0sIG1faW52LCBtYXhDaHJvbWFGb3JMSCwgbWF4U2FmZUNocm9tYUZvckwsIHJlZlUsIHJlZlYsIHJlZlgsIHJlZlksIHJlZlosIHJnYlByZXBhcmUsIHJvb3QsIHJvdW5kLCB0b0xpbmVhcjtcblxuICBtID0ge1xuICAgIFI6IFszLjI0MDk2OTk0MTkwNDUyMSwgLTEuNTM3MzgzMTc3NTcwMDkzLCAtMC40OTg2MTA3NjAyOTNdLFxuICAgIEc6IFstMC45NjkyNDM2MzYyODA4NywgMS44NzU5Njc1MDE1MDc3MiwgMC4wNDE1NTUwNTc0MDcxNzVdLFxuICAgIEI6IFswLjA1NTYzMDA3OTY5Njk5MywgLTAuMjAzOTc2OTU4ODg4OTcsIDEuMDU2OTcxNTE0MjQyODc4XVxuICB9O1xuXG4gIG1faW52ID0ge1xuICAgIFg6IFswLjQxMjM5MDc5OTI2NTk1LCAwLjM1NzU4NDMzOTM4Mzg3LCAwLjE4MDQ4MDc4ODQwMTgzXSxcbiAgICBZOiBbMC4yMTI2MzkwMDU4NzE1MSwgMC43MTUxNjg2Nzg3Njc3NSwgMC4wNzIxOTIzMTUzNjA3MzNdLFxuICAgIFo6IFswLjAxOTMzMDgxODcxNTU5MSwgMC4xMTkxOTQ3Nzk3OTQ2MiwgMC45NTA1MzIxNTIyNDk2Nl1cbiAgfTtcblxuICByZWZYID0gMC45NTA0NTU5MjcwNTE2NztcblxuICByZWZZID0gMS4wO1xuXG4gIHJlZlogPSAxLjA4OTA1Nzc1MDc1OTg3ODtcblxuICByZWZVID0gMC4xOTc4MzAwMDY2NDI4MztcblxuICByZWZWID0gMC40NjgzMTk5OTQ5Mzg3OTtcblxuICBrYXBwYSA9IDkwMy4yOTYyOTYyO1xuXG4gIGVwc2lsb24gPSAwLjAwODg1NjQ1MTY7XG5cbiAgZ2V0Qm91bmRzID0gZnVuY3Rpb24oTCkge1xuICAgIHZhciBib3R0b20sIGNoYW5uZWwsIG0xLCBtMiwgbTMsIHJldCwgc3ViMSwgc3ViMiwgdCwgdG9wMSwgdG9wMiwgX2ksIF9qLCBfbGVuLCBfbGVuMSwgX3JlZiwgX3JlZjEsIF9yZWYyO1xuICAgIHN1YjEgPSBNYXRoLnBvdyhMICsgMTYsIDMpIC8gMTU2MDg5NjtcbiAgICBzdWIyID0gc3ViMSA+IGVwc2lsb24gPyBzdWIxIDogTCAvIGthcHBhO1xuICAgIHJldCA9IFtdO1xuICAgIF9yZWYgPSBbJ1InLCAnRycsICdCJ107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBjaGFubmVsID0gX3JlZltfaV07XG4gICAgICBfcmVmMSA9IG1bY2hhbm5lbF0sIG0xID0gX3JlZjFbMF0sIG0yID0gX3JlZjFbMV0sIG0zID0gX3JlZjFbMl07XG4gICAgICBfcmVmMiA9IFswLCAxXTtcbiAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYyLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICB0ID0gX3JlZjJbX2pdO1xuICAgICAgICB0b3AxID0gKDI4NDUxNyAqIG0xIC0gOTQ4MzkgKiBtMykgKiBzdWIyO1xuICAgICAgICB0b3AyID0gKDgzODQyMiAqIG0zICsgNzY5ODYwICogbTIgKyA3MzE3MTggKiBtMSkgKiBMICogc3ViMiAtIDc2OTg2MCAqIHQgKiBMO1xuICAgICAgICBib3R0b20gPSAoNjMyMjYwICogbTMgLSAxMjY0NTIgKiBtMikgKiBzdWIyICsgMTI2NDUyICogdDtcbiAgICAgICAgcmV0LnB1c2goW3RvcDEgLyBib3R0b20sIHRvcDIgLyBib3R0b21dKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICBpbnRlcnNlY3RMaW5lTGluZSA9IGZ1bmN0aW9uKGxpbmUxLCBsaW5lMikge1xuICAgIHJldHVybiAobGluZTFbMV0gLSBsaW5lMlsxXSkgLyAobGluZTJbMF0gLSBsaW5lMVswXSk7XG4gIH07XG5cbiAgZGlzdGFuY2VGcm9tUG9sZSA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwb2ludFswXSwgMikgKyBNYXRoLnBvdyhwb2ludFsxXSwgMikpO1xuICB9O1xuXG4gIGxlbmd0aE9mUmF5VW50aWxJbnRlcnNlY3QgPSBmdW5jdGlvbih0aGV0YSwgbGluZSkge1xuICAgIHZhciBiMSwgbGVuLCBtMTtcbiAgICBtMSA9IGxpbmVbMF0sIGIxID0gbGluZVsxXTtcbiAgICBsZW4gPSBiMSAvIChNYXRoLnNpbih0aGV0YSkgLSBtMSAqIE1hdGguY29zKHRoZXRhKSk7XG4gICAgaWYgKGxlbiA8IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gbGVuO1xuICB9O1xuXG4gIG1heFNhZmVDaHJvbWFGb3JMID0gZnVuY3Rpb24oTCkge1xuICAgIHZhciBiMSwgbGVuZ3RocywgbTEsIHgsIF9pLCBfbGVuLCBfcmVmLCBfcmVmMTtcbiAgICBsZW5ndGhzID0gW107XG4gICAgX3JlZiA9IGdldEJvdW5kcyhMKTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIF9yZWYxID0gX3JlZltfaV0sIG0xID0gX3JlZjFbMF0sIGIxID0gX3JlZjFbMV07XG4gICAgICB4ID0gaW50ZXJzZWN0TGluZUxpbmUoW20xLCBiMV0sIFstMSAvIG0xLCAwXSk7XG4gICAgICBsZW5ndGhzLnB1c2goZGlzdGFuY2VGcm9tUG9sZShbeCwgYjEgKyB4ICogbTFdKSk7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCBsZW5ndGhzKTtcbiAgfTtcblxuICBtYXhDaHJvbWFGb3JMSCA9IGZ1bmN0aW9uKEwsIEgpIHtcbiAgICB2YXIgaHJhZCwgbCwgbGVuZ3RocywgbGluZSwgX2ksIF9sZW4sIF9yZWY7XG4gICAgaHJhZCA9IEggLyAzNjAgKiBNYXRoLlBJICogMjtcbiAgICBsZW5ndGhzID0gW107XG4gICAgX3JlZiA9IGdldEJvdW5kcyhMKTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGxpbmUgPSBfcmVmW19pXTtcbiAgICAgIGwgPSBsZW5ndGhPZlJheVVudGlsSW50ZXJzZWN0KGhyYWQsIGxpbmUpO1xuICAgICAgaWYgKGwgIT09IG51bGwpIHtcbiAgICAgICAgbGVuZ3Rocy5wdXNoKGwpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgbGVuZ3Rocyk7XG4gIH07XG5cbiAgZG90UHJvZHVjdCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgaSwgcmV0LCBfaSwgX3JlZjtcbiAgICByZXQgPSAwO1xuICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IGEubGVuZ3RoIC0gMTsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgcmV0ICs9IGFbaV0gKiBiW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIHJvdW5kID0gZnVuY3Rpb24obnVtLCBwbGFjZXMpIHtcbiAgICB2YXIgbjtcbiAgICBuID0gTWF0aC5wb3coMTAsIHBsYWNlcyk7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobnVtICogbikgLyBuO1xuICB9O1xuXG4gIGZyb21MaW5lYXIgPSBmdW5jdGlvbihjKSB7XG4gICAgaWYgKGMgPD0gMC4wMDMxMzA4KSB7XG4gICAgICByZXR1cm4gMTIuOTIgKiBjO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMS4wNTUgKiBNYXRoLnBvdyhjLCAxIC8gMi40KSAtIDAuMDU1O1xuICAgIH1cbiAgfTtcblxuICB0b0xpbmVhciA9IGZ1bmN0aW9uKGMpIHtcbiAgICB2YXIgYTtcbiAgICBhID0gMC4wNTU7XG4gICAgaWYgKGMgPiAwLjA0MDQ1KSB7XG4gICAgICByZXR1cm4gTWF0aC5wb3coKGMgKyBhKSAvICgxICsgYSksIDIuNCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjIC8gMTIuOTI7XG4gICAgfVxuICB9O1xuXG4gIHJnYlByZXBhcmUgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBjaCwgbiwgX2ksIF9qLCBfbGVuLCBfbGVuMSwgX3Jlc3VsdHM7XG4gICAgdHVwbGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gdHVwbGUubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgbiA9IHR1cGxlW19pXTtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChyb3VuZChuLCAzKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSkoKTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHR1cGxlLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBjaCA9IHR1cGxlW19pXTtcbiAgICAgIGlmIChjaCA8IC0wLjAwMDEgfHwgY2ggPiAxLjAwMDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSWxsZWdhbCByZ2IgdmFsdWU6IFwiICsgY2gpO1xuICAgICAgfVxuICAgICAgaWYgKGNoIDwgMCkge1xuICAgICAgICBjaCA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoY2ggPiAxKSB7XG4gICAgICAgIGNoID0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSB0dXBsZS5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgIGNoID0gdHVwbGVbX2pdO1xuICAgICAgX3Jlc3VsdHMucHVzaChNYXRoLnJvdW5kKGNoICogMjU1KSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfTtcblxuICBjb252ID0ge1xuICAgICd4eXonOiB7fSxcbiAgICAnbHV2Jzoge30sXG4gICAgJ2xjaCc6IHt9LFxuICAgICdodXNsJzoge30sXG4gICAgJ2h1c2xwJzoge30sXG4gICAgJ3JnYic6IHt9LFxuICAgICdoZXgnOiB7fVxuICB9O1xuXG4gIGNvbnYueHl6LnJnYiA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgdmFyIEIsIEcsIFI7XG4gICAgUiA9IGZyb21MaW5lYXIoZG90UHJvZHVjdChtLlIsIHR1cGxlKSk7XG4gICAgRyA9IGZyb21MaW5lYXIoZG90UHJvZHVjdChtLkcsIHR1cGxlKSk7XG4gICAgQiA9IGZyb21MaW5lYXIoZG90UHJvZHVjdChtLkIsIHR1cGxlKSk7XG4gICAgcmV0dXJuIFtSLCBHLCBCXTtcbiAgfTtcblxuICBjb252LnJnYi54eXogPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBCLCBHLCBSLCBYLCBZLCBaLCByZ2JsO1xuICAgIFIgPSB0dXBsZVswXSwgRyA9IHR1cGxlWzFdLCBCID0gdHVwbGVbMl07XG4gICAgcmdibCA9IFt0b0xpbmVhcihSKSwgdG9MaW5lYXIoRyksIHRvTGluZWFyKEIpXTtcbiAgICBYID0gZG90UHJvZHVjdChtX2ludi5YLCByZ2JsKTtcbiAgICBZID0gZG90UHJvZHVjdChtX2ludi5ZLCByZ2JsKTtcbiAgICBaID0gZG90UHJvZHVjdChtX2ludi5aLCByZ2JsKTtcbiAgICByZXR1cm4gW1gsIFksIFpdO1xuICB9O1xuXG4gIFlfdG9fTCA9IGZ1bmN0aW9uKFkpIHtcbiAgICBpZiAoWSA8PSBlcHNpbG9uKSB7XG4gICAgICByZXR1cm4gKFkgLyByZWZZKSAqIGthcHBhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMTE2ICogTWF0aC5wb3coWSAvIHJlZlksIDEgLyAzKSAtIDE2O1xuICAgIH1cbiAgfTtcblxuICBMX3RvX1kgPSBmdW5jdGlvbihMKSB7XG4gICAgaWYgKEwgPD0gOCkge1xuICAgICAgcmV0dXJuIHJlZlkgKiBMIC8ga2FwcGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWZZICogTWF0aC5wb3coKEwgKyAxNikgLyAxMTYsIDMpO1xuICAgIH1cbiAgfTtcblxuICBjb252Lnh5ei5sdXYgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBMLCBVLCBWLCBYLCBZLCBaLCB2YXJVLCB2YXJWO1xuICAgIFggPSB0dXBsZVswXSwgWSA9IHR1cGxlWzFdLCBaID0gdHVwbGVbMl07XG4gICAgdmFyVSA9ICg0ICogWCkgLyAoWCArICgxNSAqIFkpICsgKDMgKiBaKSk7XG4gICAgdmFyViA9ICg5ICogWSkgLyAoWCArICgxNSAqIFkpICsgKDMgKiBaKSk7XG4gICAgTCA9IFlfdG9fTChZKTtcbiAgICBpZiAoTCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgICB9XG4gICAgVSA9IDEzICogTCAqICh2YXJVIC0gcmVmVSk7XG4gICAgViA9IDEzICogTCAqICh2YXJWIC0gcmVmVik7XG4gICAgcmV0dXJuIFtMLCBVLCBWXTtcbiAgfTtcblxuICBjb252Lmx1di54eXogPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBMLCBVLCBWLCBYLCBZLCBaLCB2YXJVLCB2YXJWO1xuICAgIEwgPSB0dXBsZVswXSwgVSA9IHR1cGxlWzFdLCBWID0gdHVwbGVbMl07XG4gICAgaWYgKEwgPT09IDApIHtcbiAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gICAgfVxuICAgIHZhclUgPSBVIC8gKDEzICogTCkgKyByZWZVO1xuICAgIHZhclYgPSBWIC8gKDEzICogTCkgKyByZWZWO1xuICAgIFkgPSBMX3RvX1koTCk7XG4gICAgWCA9IDAgLSAoOSAqIFkgKiB2YXJVKSAvICgodmFyVSAtIDQpICogdmFyViAtIHZhclUgKiB2YXJWKTtcbiAgICBaID0gKDkgKiBZIC0gKDE1ICogdmFyViAqIFkpIC0gKHZhclYgKiBYKSkgLyAoMyAqIHZhclYpO1xuICAgIHJldHVybiBbWCwgWSwgWl07XG4gIH07XG5cbiAgY29udi5sdXYubGNoID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgQywgSCwgSHJhZCwgTCwgVSwgVjtcbiAgICBMID0gdHVwbGVbMF0sIFUgPSB0dXBsZVsxXSwgViA9IHR1cGxlWzJdO1xuICAgIEMgPSBNYXRoLnBvdyhNYXRoLnBvdyhVLCAyKSArIE1hdGgucG93KFYsIDIpLCAxIC8gMik7XG4gICAgSHJhZCA9IE1hdGguYXRhbjIoViwgVSk7XG4gICAgSCA9IEhyYWQgKiAzNjAgLyAyIC8gTWF0aC5QSTtcbiAgICBpZiAoSCA8IDApIHtcbiAgICAgIEggPSAzNjAgKyBIO1xuICAgIH1cbiAgICByZXR1cm4gW0wsIEMsIEhdO1xuICB9O1xuXG4gIGNvbnYubGNoLmx1diA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgdmFyIEMsIEgsIEhyYWQsIEwsIFUsIFY7XG4gICAgTCA9IHR1cGxlWzBdLCBDID0gdHVwbGVbMV0sIEggPSB0dXBsZVsyXTtcbiAgICBIcmFkID0gSCAvIDM2MCAqIDIgKiBNYXRoLlBJO1xuICAgIFUgPSBNYXRoLmNvcyhIcmFkKSAqIEM7XG4gICAgViA9IE1hdGguc2luKEhyYWQpICogQztcbiAgICByZXR1cm4gW0wsIFUsIFZdO1xuICB9O1xuXG4gIGNvbnYuaHVzbC5sY2ggPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBDLCBILCBMLCBTLCBtYXg7XG4gICAgSCA9IHR1cGxlWzBdLCBTID0gdHVwbGVbMV0sIEwgPSB0dXBsZVsyXTtcbiAgICBpZiAoTCA+IDk5Ljk5OTk5OTkpIHtcbiAgICAgIHJldHVybiBbMTAwLCAwLCBIXTtcbiAgICB9XG4gICAgaWYgKEwgPCAwLjAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gWzAsIDAsIEhdO1xuICAgIH1cbiAgICBtYXggPSBtYXhDaHJvbWFGb3JMSChMLCBIKTtcbiAgICBDID0gbWF4IC8gMTAwICogUztcbiAgICByZXR1cm4gW0wsIEMsIEhdO1xuICB9O1xuXG4gIGNvbnYubGNoLmh1c2wgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBDLCBILCBMLCBTLCBtYXg7XG4gICAgTCA9IHR1cGxlWzBdLCBDID0gdHVwbGVbMV0sIEggPSB0dXBsZVsyXTtcbiAgICBpZiAoTCA+IDk5Ljk5OTk5OTkpIHtcbiAgICAgIHJldHVybiBbSCwgMCwgMTAwXTtcbiAgICB9XG4gICAgaWYgKEwgPCAwLjAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gW0gsIDAsIDBdO1xuICAgIH1cbiAgICBtYXggPSBtYXhDaHJvbWFGb3JMSChMLCBIKTtcbiAgICBTID0gQyAvIG1heCAqIDEwMDtcbiAgICByZXR1cm4gW0gsIFMsIExdO1xuICB9O1xuXG4gIGNvbnYuaHVzbHAubGNoID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgQywgSCwgTCwgUywgbWF4O1xuICAgIEggPSB0dXBsZVswXSwgUyA9IHR1cGxlWzFdLCBMID0gdHVwbGVbMl07XG4gICAgaWYgKEwgPiA5OS45OTk5OTk5KSB7XG4gICAgICByZXR1cm4gWzEwMCwgMCwgSF07XG4gICAgfVxuICAgIGlmIChMIDwgMC4wMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIFswLCAwLCBIXTtcbiAgICB9XG4gICAgbWF4ID0gbWF4U2FmZUNocm9tYUZvckwoTCk7XG4gICAgQyA9IG1heCAvIDEwMCAqIFM7XG4gICAgcmV0dXJuIFtMLCBDLCBIXTtcbiAgfTtcblxuICBjb252LmxjaC5odXNscCA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgdmFyIEMsIEgsIEwsIFMsIG1heDtcbiAgICBMID0gdHVwbGVbMF0sIEMgPSB0dXBsZVsxXSwgSCA9IHR1cGxlWzJdO1xuICAgIGlmIChMID4gOTkuOTk5OTk5OSkge1xuICAgICAgcmV0dXJuIFtILCAwLCAxMDBdO1xuICAgIH1cbiAgICBpZiAoTCA8IDAuMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiBbSCwgMCwgMF07XG4gICAgfVxuICAgIG1heCA9IG1heFNhZmVDaHJvbWFGb3JMKEwpO1xuICAgIFMgPSBDIC8gbWF4ICogMTAwO1xuICAgIHJldHVybiBbSCwgUywgTF07XG4gIH07XG5cbiAgY29udi5yZ2IuaGV4ID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgY2gsIGhleCwgX2ksIF9sZW47XG4gICAgaGV4ID0gXCIjXCI7XG4gICAgdHVwbGUgPSByZ2JQcmVwYXJlKHR1cGxlKTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHR1cGxlLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBjaCA9IHR1cGxlW19pXTtcbiAgICAgIGNoID0gY2gudG9TdHJpbmcoMTYpO1xuICAgICAgaWYgKGNoLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjaCA9IFwiMFwiICsgY2g7XG4gICAgICB9XG4gICAgICBoZXggKz0gY2g7XG4gICAgfVxuICAgIHJldHVybiBoZXg7XG4gIH07XG5cbiAgY29udi5oZXgucmdiID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgdmFyIGIsIGcsIG4sIHIsIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICBpZiAoaGV4LmNoYXJBdCgwKSA9PT0gXCIjXCIpIHtcbiAgICAgIGhleCA9IGhleC5zdWJzdHJpbmcoMSwgNyk7XG4gICAgfVxuICAgIHIgPSBoZXguc3Vic3RyaW5nKDAsIDIpO1xuICAgIGcgPSBoZXguc3Vic3RyaW5nKDIsIDQpO1xuICAgIGIgPSBoZXguc3Vic3RyaW5nKDQsIDYpO1xuICAgIF9yZWYgPSBbciwgZywgYl07XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIG4gPSBfcmVmW19pXTtcbiAgICAgIF9yZXN1bHRzLnB1c2gocGFyc2VJbnQobiwgMTYpIC8gMjU1KTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9O1xuXG4gIGNvbnYubGNoLnJnYiA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgcmV0dXJuIGNvbnYueHl6LnJnYihjb252Lmx1di54eXooY29udi5sY2gubHV2KHR1cGxlKSkpO1xuICB9O1xuXG4gIGNvbnYucmdiLmxjaCA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgcmV0dXJuIGNvbnYubHV2LmxjaChjb252Lnh5ei5sdXYoY29udi5yZ2IueHl6KHR1cGxlKSkpO1xuICB9O1xuXG4gIGNvbnYuaHVzbC5yZ2IgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHJldHVybiBjb252LmxjaC5yZ2IoY29udi5odXNsLmxjaCh0dXBsZSkpO1xuICB9O1xuXG4gIGNvbnYucmdiLmh1c2wgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHJldHVybiBjb252LmxjaC5odXNsKGNvbnYucmdiLmxjaCh0dXBsZSkpO1xuICB9O1xuXG4gIGNvbnYuaHVzbHAucmdiID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICByZXR1cm4gY29udi5sY2gucmdiKGNvbnYuaHVzbHAubGNoKHR1cGxlKSk7XG4gIH07XG5cbiAgY29udi5yZ2IuaHVzbHAgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHJldHVybiBjb252LmxjaC5odXNscChjb252LnJnYi5sY2godHVwbGUpKTtcbiAgfTtcblxuICByb290ID0ge307XG5cbiAgcm9vdC5mcm9tUkdCID0gZnVuY3Rpb24oUiwgRywgQikge1xuICAgIHJldHVybiBjb252LnJnYi5odXNsKFtSLCBHLCBCXSk7XG4gIH07XG5cbiAgcm9vdC5mcm9tSGV4ID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgcmV0dXJuIGNvbnYucmdiLmh1c2woY29udi5oZXgucmdiKGhleCkpO1xuICB9O1xuXG4gIHJvb3QudG9SR0IgPSBmdW5jdGlvbihILCBTLCBMKSB7XG4gICAgcmV0dXJuIGNvbnYuaHVzbC5yZ2IoW0gsIFMsIExdKTtcbiAgfTtcblxuICByb290LnRvSGV4ID0gZnVuY3Rpb24oSCwgUywgTCkge1xuICAgIHJldHVybiBjb252LnJnYi5oZXgoY29udi5odXNsLnJnYihbSCwgUywgTF0pKTtcbiAgfTtcblxuICByb290LnAgPSB7fTtcblxuICByb290LnAudG9SR0IgPSBmdW5jdGlvbihILCBTLCBMKSB7XG4gICAgcmV0dXJuIGNvbnYueHl6LnJnYihjb252Lmx1di54eXooY29udi5sY2gubHV2KGNvbnYuaHVzbHAubGNoKFtILCBTLCBMXSkpKSk7XG4gIH07XG5cbiAgcm9vdC5wLnRvSGV4ID0gZnVuY3Rpb24oSCwgUywgTCkge1xuICAgIHJldHVybiBjb252LnJnYi5oZXgoY29udi54eXoucmdiKGNvbnYubHV2Lnh5eihjb252LmxjaC5sdXYoY29udi5odXNscC5sY2goW0gsIFMsIExdKSkpKSk7XG4gIH07XG5cbiAgcm9vdC5wLmZyb21SR0IgPSBmdW5jdGlvbihSLCBHLCBCKSB7XG4gICAgcmV0dXJuIGNvbnYubGNoLmh1c2xwKGNvbnYubHV2LmxjaChjb252Lnh5ei5sdXYoY29udi5yZ2IueHl6KFtSLCBHLCBCXSkpKSk7XG4gIH07XG5cbiAgcm9vdC5wLmZyb21IZXggPSBmdW5jdGlvbihoZXgpIHtcbiAgICByZXR1cm4gY29udi5sY2guaHVzbHAoY29udi5sdXYubGNoKGNvbnYueHl6Lmx1dihjb252LnJnYi54eXooY29udi5oZXgucmdiKGhleCkpKSkpO1xuICB9O1xuXG4gIHJvb3QuX2NvbnYgPSBjb252O1xuXG4gIHJvb3QuX3JvdW5kID0gcm91bmQ7XG5cbiAgcm9vdC5fcmdiUHJlcGFyZSA9IHJnYlByZXBhcmU7XG5cbiAgcm9vdC5fZ2V0Qm91bmRzID0gZ2V0Qm91bmRzO1xuXG4gIHJvb3QuX21heENocm9tYUZvckxIID0gbWF4Q2hyb21hRm9yTEg7XG5cbiAgcm9vdC5fbWF4U2FmZUNocm9tYUZvckwgPSBtYXhTYWZlQ2hyb21hRm9yTDtcblxuICBpZiAoISgodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIHx8ICh0eXBlb2YgalF1ZXJ5ICE9PSBcInVuZGVmaW5lZFwiICYmIGpRdWVyeSAhPT0gbnVsbCkgfHwgKHR5cGVvZiByZXF1aXJlanMgIT09IFwidW5kZWZpbmVkXCIgJiYgcmVxdWlyZWpzICE9PSBudWxsKSkpIHtcbiAgICB0aGlzLkhVU0wgPSByb290O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSByb290O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBqUXVlcnkgIT09IFwidW5kZWZpbmVkXCIgJiYgalF1ZXJ5ICE9PSBudWxsKSB7XG4gICAgalF1ZXJ5Lmh1c2wgPSByb290O1xuICB9XG5cbiAgaWYgKCh0eXBlb2YgcmVxdWlyZWpzICE9PSBcInVuZGVmaW5lZFwiICYmIHJlcXVpcmVqcyAhPT0gbnVsbCkgJiYgKHR5cGVvZiBkZWZpbmUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGVmaW5lICE9PSBudWxsKSkge1xuICAgIGRlZmluZShyb290KTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiLyoqXG4gKiBSR0Igc3BhY2UuXG4gKlxuICogQG1vZHVsZSAgY29sb3Itc3BhY2UvcmdiXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdyZ2InLFxuXHRtaW46IFswLDAsMF0sXG5cdG1heDogWzI1NSwyNTUsMjU1XSxcblx0Y2hhbm5lbDogWydyZWQnLCAnZ3JlZW4nLCAnYmx1ZSddXG59OyIsIi8qKlxyXG4gKiBBZGQgYSBjb252ZXJ0b3IgZnJvbSBvbmUgdG8gYW5vdGhlciBzcGFjZSB2aWEgWFlaIG9yIFJHQiBzcGFjZSBhcyBhIG1lZGl1bS5cclxuICpcclxuICogQG1vZHVsZSAgY29sb3Itc3BhY2UvYWRkLWNvbnZlcnRvclxyXG4gKi9cclxuXHJcbnZhciB4eXogPSByZXF1aXJlKCcuLi94eXonKTtcclxudmFyIHJnYiA9IHJlcXVpcmUoJy4uL3JnYicpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhZGRDb252ZXJ0b3I7XHJcblxyXG5cclxuLyoqXHJcbiAqIEFkZCBjb252ZXJ0b3IgZnJvbSBzcGFjZSBBIHRvIHNwYWNlIEIuXHJcbiAqIFNvIHNwYWNlIEEgd2lsbCBiZSBhYmxlIHRvIHRyYW5zZm9ybSB0byBCLlxyXG4gKi9cclxuZnVuY3Rpb24gYWRkQ29udmVydG9yKGZyb21TcGFjZSwgdG9TcGFjZSl7XHJcblx0aWYgKCFmcm9tU3BhY2VbdG9TcGFjZS5uYW1lXSkge1xyXG5cdFx0ZnJvbVNwYWNlW3RvU3BhY2UubmFtZV0gPSBnZXRDb252ZXJ0b3IoZnJvbVNwYWNlLCB0b1NwYWNlKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBmcm9tU3BhY2U7XHJcbn1cclxuXHJcblxyXG4vKiogcmV0dXJuIGNvbnZlcnRlciB0aHJvdWdoIHh5ei9yZ2Igc3BhY2UgKi9cclxuZnVuY3Rpb24gZ2V0Q29udmVydG9yKGZyb21TcGFjZSwgdG9TcGFjZSl7XHJcblx0dmFyIHRvU3BhY2VOYW1lID0gdG9TcGFjZS5uYW1lO1xyXG5cclxuXHQvL2NyZWF0ZSB4eXogY29udmVydGVyLCBpZiBhdmFpbGFibGVcclxuXHRpZiAoZnJvbVNwYWNlLnh5eiAmJiB4eXpbdG9TcGFjZU5hbWVdKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oYXJnKXtcclxuXHRcdFx0cmV0dXJuIHh5elt0b1NwYWNlTmFtZV0oZnJvbVNwYWNlLnh5eihhcmcpKTtcclxuXHRcdH07XHJcblx0fVxyXG5cdC8vY3JlYXRlIHJnYiBjb252ZXJ0ZXJcclxuXHRlbHNlIGlmIChmcm9tU3BhY2UucmdiICYmIHJnYlt0b1NwYWNlTmFtZV0pIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbihhcmcpe1xyXG5cdFx0XHRyZXR1cm4gcmdiW3RvU3BhY2VOYW1lXShmcm9tU3BhY2UucmdiKGFyZykpO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHRocm93IEVycm9yKCdDYW7igJl0IGFkZCBjb252ZXJ0b3IgZnJvbSAnICsgZnJvbVNwYWNlLm5hbWUgKyAnIHRvICcgKyB0b1NwYWNlTmFtZSk7XHJcbn1cclxuIiwiLyoqXG4gKiBDSUUgWFlaXG4gKlxuICogQG1vZHVsZSAgY29sb3Itc3BhY2UveHl6XG4gKi9cblxudmFyIHJnYiA9IHJlcXVpcmUoJy4vcmdiJyk7XG5cbnZhciB4eXogPSBtb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ3h5eicsXG5cdG1pbjogWzAsMCwwXSxcblx0bWF4OiBbOTYsMTAwLDEwOV0sXG5cdGNoYW5uZWw6IFsnbGlnaHRuZXNzJywndScsJ3YnXSxcblx0YWxpYXM6IFsnY2lleHl6J10sXG5cblx0Ly93aGl0ZXBvaW50IHdpdGggb2JzZXJ2ZXIvaWxsdW1pbmFudFxuXHQvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0YW5kYXJkX2lsbHVtaW5hbnRcblx0d2hpdGVwb2ludDoge1xuXHRcdDI6IHtcblx0XHRcdC8vaW5jYWRlc2NlbnRcblx0XHRcdEE6WzEwOS44NSwgMTAwLCAzNS41ODVdLFxuXHRcdFx0Ly8gQjpbXSxcblx0XHRcdEM6IFs5OC4wNzQsIDEwMCwgMTE4LjIzMl0sXG5cdFx0XHRENTA6IFs5Ni40MjIsIDEwMCwgODIuNTIxXSxcblx0XHRcdEQ1NTogWzk1LjY4MiwgMTAwLCA5Mi4xNDldLFxuXHRcdFx0Ly9kYXlsaWdodFxuXHRcdFx0RDY1OiBbOTUuMDQ1NTkyNzA1MTY3LCAxMDAsIDEwOC45MDU3NzUwNzU5ODc4XSxcblx0XHRcdEQ3NTogWzk0Ljk3MiwgMTAwLCAxMjIuNjM4XSxcblx0XHRcdC8vZmxvdXJlc2NlbnRcblx0XHRcdC8vIEYxOiBbXSxcblx0XHRcdEYyOiBbOTkuMTg3LCAxMDAsIDY3LjM5NV0sXG5cdFx0XHQvLyBGMzogW10sXG5cdFx0XHQvLyBGNDogW10sXG5cdFx0XHQvLyBGNTogW10sXG5cdFx0XHQvLyBGNjpbXSxcblx0XHRcdEY3OiBbOTUuMDQ0LCAxMDAsIDEwOC43NTVdLFxuXHRcdFx0Ly8gRjg6IFtdLFxuXHRcdFx0Ly8gRjk6IFtdLFxuXHRcdFx0Ly8gRjEwOiBbXSxcblx0XHRcdEYxMTogWzEwMC45NjYsIDEwMCwgNjQuMzcwXSxcblx0XHRcdC8vIEYxMjogW10sXG5cdFx0XHRFOiBbMTAwLDEwMCwxMDBdXG5cdFx0fSxcblxuXHRcdDEwOiB7XG5cdFx0XHQvL2luY2FkZXNjZW50XG5cdFx0XHRBOlsxMTEuMTQ0LCAxMDAsIDM1LjIwMF0sXG5cdFx0XHRDOiBbOTcuMjg1LCAxMDAsIDExNi4xNDVdLFxuXHRcdFx0RDUwOiBbOTYuNzIwLCAxMDAsIDgxLjQyN10sXG5cdFx0XHRENTU6IFs5NS43OTksIDEwMCwgOTAuOTI2XSxcblx0XHRcdC8vZGF5bGlnaHRcblx0XHRcdEQ2NTogWzk0LjgxMSwgMTAwLCAxMDcuMzA0XSxcblx0XHRcdEQ3NTogWzk0LjQxNiwgMTAwLCAxMjAuNjQxXSxcblx0XHRcdC8vZmxvdXJlc2NlbnRcblx0XHRcdEYyOiBbMTAzLjI4MCwgMTAwLCA2OS4wMjZdLFxuXHRcdFx0Rjc6IFs5NS43OTIsIDEwMCwgMTA3LjY4N10sXG5cdFx0XHRGMTE6IFsxMDMuODY2LCAxMDAsIDY1LjYyN10sXG5cdFx0XHRFOiBbMTAwLDEwMCwxMDBdXG5cdFx0fVxuXHR9LFxuXG5cdHJnYjogZnVuY3Rpb24oeHl6KSB7XG5cdFx0dmFyIHggPSB4eXpbMF0gLyAxMDAsXG5cdFx0XHRcdHkgPSB4eXpbMV0gLyAxMDAsXG5cdFx0XHRcdHogPSB4eXpbMl0gLyAxMDAsXG5cdFx0XHRcdHIsIGcsIGI7XG5cblx0XHQvLyBhc3N1bWUgc1JHQlxuXHRcdC8vIGh0dHA6Ly93d3cuYnJ1Y2VsaW5kYmxvb20uY29tL2luZGV4Lmh0bWw/RXFuX1JHQl9YWVpfTWF0cml4Lmh0bWxcblx0XHRyID0gKHggKiAzLjI0MDk2OTk0MTkwNDUyMSkgKyAoeSAqIC0xLjUzNzM4MzE3NzU3MDA5MykgKyAoeiAqIC0wLjQ5ODYxMDc2MDI5Myk7XG5cdFx0ZyA9ICh4ICogLTAuOTY5MjQzNjM2MjgwODcpICsgKHkgKiAxLjg3NTk2NzUwMTUwNzcyKSArICh6ICogMC4wNDE1NTUwNTc0MDcxNzUpO1xuXHRcdGIgPSAoeCAqIDAuMDU1NjMwMDc5Njk2OTkzKSArICh5ICogLTAuMjAzOTc2OTU4ODg4OTcpICsgKHogKiAxLjA1Njk3MTUxNDI0Mjg3OCk7XG5cblx0XHRyID0gciA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhyLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdFx0OiByID0gKHIgKiAxMi45Mik7XG5cblx0XHRnID0gZyA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhnLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdFx0OiBnID0gKGcgKiAxMi45Mik7XG5cblx0XHRiID0gYiA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhiLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdFx0OiBiID0gKGIgKiAxMi45Mik7XG5cblx0XHRyID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgciksIDEpO1xuXHRcdGcgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnKSwgMSk7XG5cdFx0YiA9IE1hdGgubWluKE1hdGgubWF4KDAsIGIpLCAxKTtcblxuXHRcdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG5cdH1cbn07XG5cblxuLy9leHRlbmQgcmdiXG5yZ2IueHl6ID0gZnVuY3Rpb24ocmdiKSB7XG5cdHZhciByID0gcmdiWzBdIC8gMjU1LFxuXHRcdFx0ZyA9IHJnYlsxXSAvIDI1NSxcblx0XHRcdGIgPSByZ2JbMl0gLyAyNTU7XG5cblx0Ly8gYXNzdW1lIHNSR0Jcblx0ciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG5cdGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuXHRiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuXHR2YXIgeCA9IChyICogMC40MTIzOTA3OTkyNjU5NSkgKyAoZyAqIDAuMzU3NTg0MzM5MzgzODcpICsgKGIgKiAwLjE4MDQ4MDc4ODQwMTgzKTtcblx0dmFyIHkgPSAociAqIDAuMjEyNjM5MDA1ODcxNTEpICsgKGcgKiAwLjcxNTE2ODY3ODc2Nzc1KSArIChiICogMC4wNzIxOTIzMTUzNjA3MzMpO1xuXHR2YXIgeiA9IChyICogMC4wMTkzMzA4MTg3MTU1OTEpICsgKGcgKiAwLjExOTE5NDc3OTc5NDYyKSArIChiICogMC45NTA1MzIxNTIyNDk2Nik7XG5cblx0cmV0dXJuIFt4ICogMTAwLCB5ICoxMDAsIHogKiAxMDBdO1xufTsiLCIvKipcclxuICogQmFzaWNhbGx5IGNoYW5nZSBibGFja25lc3MgY2hhbm5lbC5cclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL2JsYWNrZW5cclxuICpcclxuICogQHBhcmFtIHtDb2xvcn0gY29sb3IgQSBjb2xvciBpbnN0YW5jZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmF0aW8gQSByYXRpbyB0byBibGFja2VuLCAwLi4xXHJcbiAqXHJcbiAqIEByZXR1cm4ge0NvbG9yfSBUaGUgY29sb3Igd2l0aCBpbmNyZWFzZWQgcmF0aW9cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbG9yLCByYXRpbykge1xyXG5cdHZhciB2YWx1ZSA9IGNvbG9yLmJsYWNrbmVzcygpO1xyXG5cdHZhbHVlICs9IHZhbHVlICogcmF0aW87XHJcblx0Y29sb3IuYmxhY2tuZXNzKHZhbHVlKTtcclxuXHRyZXR1cm4gY29sb3I7XHJcbn07IiwiLyoqXHJcbiAqIEJhc2ljYWxseSBjaGFuZ2UgbGlnaHRuZXNzIGNoYW5uZWwuXHJcbiAqXHJcbiAqIEBtb2R1bGUgY29sb3ItbWFuaXB1bGF0ZS9kYXJrZW5cclxuICpcclxuICogQHBhcmFtIHtDb2xvcn0gY29sb3IgQSBjb2xvciBpbnN0YW5jZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmF0aW8gQSByYXRpbyB0byBkYXJrZW4sIDAuLjFcclxuICpcclxuICogQHJldHVybiB7Q29sb3J9IFRoZSBjb2xvciB3aXRoIGluY3JlYXNlZCByYXRpb1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IsIHJhdGlvKSB7XHJcblx0dmFyIGwgPSBjb2xvci5saWdodG5lc3MoKTtcclxuXHRsIC09IGwgKiByYXRpbztcclxuXHRjb2xvci5saWdodG5lc3MobCk7XHJcblx0cmV0dXJuIGNvbG9yO1xyXG59OyIsIi8qKlxyXG4gKiBCYXNpY2FsbHkgY2hhbmdlIHNhdHVyYXRpb24gY2hhbm5lbC5cclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL2Rlc2F0dXJhdGVcclxuICpcclxuICogQHBhcmFtIHtDb2xvcn0gY29sb3IgQSBjb2xvciBpbnN0YW5jZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gcmF0aW8gQSByYXRpbyB0byBzYXR1cmF0ZSwgMC4uMVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtDb2xvcn0gVGhlIGNvbG9yIHdpdGggaW5jcmVhc2VkIHJhdGlvXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb2xvciwgcmF0aW8pIHtcclxuXHR2YXIgdmFsdWUgPSBjb2xvci5zYXR1cmF0aW9uKCk7XHJcblx0dmFsdWUgLT0gdmFsdWUgKiByYXRpbztcclxuXHRjb2xvci5zYXR1cmF0aW9uKHZhbHVlKTtcclxuXHRyZXR1cm4gY29sb3I7XHJcbn07IiwiLyoqXHJcbiAqIEJhc2ljYWxseSBjaGFuZ2UgYWxwaGEgY2hhbm5lbC5cclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL2ZhZGVpblxyXG4gKlxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBBIGNvbG9yIGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYXRpbyBBIHJhdGlvIHRvIGZhZGVpbiwgMC4uMVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtDb2xvcn0gVGhlIGNvbG9yIHdpdGggaW5jcmVhc2VkIHJhdGlvXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb2xvciwgcmF0aW8pIHtcclxuXHR2YXIgdmFsdWUgPSBjb2xvci5hbHBoYSgpO1xyXG5cdHZhbHVlICs9IHZhbHVlICogcmF0aW87XHJcblx0Y29sb3IuYWxwaGEodmFsdWUpO1xyXG5cdHJldHVybiBjb2xvcjtcclxufTsiLCIvKipcclxuICogQmFzaWNhbGx5IGNoYW5nZSBhbHBoYSBjaGFubmVsLlxyXG4gKlxyXG4gKiBAbW9kdWxlIGNvbG9yLW1hbmlwdWxhdGUvZmFkZW91dFxyXG4gKlxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBBIGNvbG9yIGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYXRpbyBBIHJhdGlvIHRvIGZhZGVvdXQsIDAuLjFcclxuICpcclxuICogQHJldHVybiB7Q29sb3J9IFRoZSBjb2xvciB3aXRoIGluY3JlYXNlZCByYXRpb1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IsIHJhdGlvKSB7XHJcblx0dmFyIHZhbHVlID0gY29sb3IuYWxwaGEoKTtcclxuXHR2YWx1ZSAtPSB2YWx1ZSAqIHJhdGlvO1xyXG5cdGNvbG9yLmFscGhhKHZhbHVlKTtcclxuXHRyZXR1cm4gY29sb3I7XHJcbn07IiwiLyoqXHJcbiAqIENvbnZlcnQgY29sb3IgdG8gYSBncmF5c2NhbGVcclxuICogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmF5c2NhbGUjQ29udmVydGluZ19jb2xvcl90b19ncmF5c2NhbGVcclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL2dyYXlzY2FsZVxyXG4gKlxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBBIGNvbG9yIGluc3RhbmNlXHJcbiAqXHJcbiAqIEByZXR1cm4ge0NvbG9yfSBUaGUgY29sb3Igd2l0aCBpbmNyZWFzZWQgcmF0aW9cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbG9yKSB7XHJcblx0dmFyIHZhbCA9IGNvbG9yLnJlZCgpICogMC4yMTI2ICsgY29sb3IuZ3JlZW4oKSAqIDAuNzE1ICsgY29sb3IuYmx1ZSgpICogMC4wNzIyO1xyXG5cdGNvbG9yLnJlZCh2YWwpO1xyXG5cdGNvbG9yLmdyZWVuKHZhbCk7XHJcblx0Y29sb3IuYmx1ZSh2YWwpO1xyXG5cdHJldHVybiBjb2xvcjtcclxufTsiLCIvKipcclxuICogQG1vZHVsZSAgY29sb3ItbWFuaXB1bGF0ZVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGxpZ2h0ZW46IHJlcXVpcmUoJy4vbGlnaHRlbicpLFxyXG5cdGRhcmtlbjogcmVxdWlyZSgnLi9kYXJrZW4nKSxcclxuXHRzYXR1cmF0ZTogcmVxdWlyZSgnLi9zYXR1cmF0ZScpLFxyXG5cdGRlc2F0dXJhdGU6IHJlcXVpcmUoJy4vZGVzYXR1cmF0ZScpLFxyXG5cdHdoaXRlbjogcmVxdWlyZSgnLi93aGl0ZW4nKSxcclxuXHRibGFja2VuOiByZXF1aXJlKCcuL2JsYWNrZW4nKSxcclxuXHRmYWRlaW46IHJlcXVpcmUoJy4vZmFkZWluJyksXHJcblx0ZmFkZW91dDogcmVxdWlyZSgnLi9mYWRlb3V0JyksXHJcblx0aW52ZXJ0OiByZXF1aXJlKCcuL2ludmVydCcpLFxyXG5cdGdyYXlzY2FsZTogcmVxdWlyZSgnLi9ncmF5c2NhbGUnKSxcclxuXHRzcGluOiByZXF1aXJlKCcuL3NwaW4nKSxcclxuXHRtaXg6IHJlcXVpcmUoJy4vbWl4JylcclxufTsiLCIvKipcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL2ludmVydFxyXG4gKlxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBBIGNvbG9yIGluc3RhbmNlXHJcbiAqXHJcbiAqIEByZXR1cm4ge0NvbG9yfSBUaGUgY2hhbmdlZCBjb2xvclxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IpIHtcclxuXHRjb2xvci5yZWQoMjU1IC0gY29sb3IucmVkKCkpO1xyXG5cdGNvbG9yLmdyZWVuKDI1NSAtIGNvbG9yLmdyZWVuKCkpO1xyXG5cdGNvbG9yLmJsdWUoMjU1IC0gY29sb3IuYmx1ZSgpKTtcclxuXHRyZXR1cm4gY29sb3I7XHJcbn07IiwiLyoqXHJcbiAqIEJhc2ljYWxseSBjaGFuZ2UgbGlnaHRuZXNzIGNoYW5uZWwuXHJcbiAqXHJcbiAqIEBtb2R1bGUgY29sb3ItbWFuaXB1bGF0ZS9saWdodGVuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Q29sb3J9IGNvbG9yIEEgY29sb3IgaW5zdGFuY2VcclxuICogQHBhcmFtIHtudW1iZXJ9IHJhdGlvIEEgcmF0aW8gdG8gbGlnaHRlbiwgMC4uMVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtDb2xvcn0gVGhlIGNvbG9yIHdpdGggaW5jcmVhc2VkIHJhdGlvXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb2xvciwgcmF0aW8pIHtcclxuXHR2YXIgbCA9IGNvbG9yLmxpZ2h0bmVzcygpO1xyXG5cdGwgKz0gbCAqIHJhdGlvO1xyXG5cdGNvbG9yLmxpZ2h0bmVzcyhsKTtcclxuXHRyZXR1cm4gY29sb3I7XHJcbn07IiwiLyoqXHJcbiAqIE1peCBzZWNvbmQgY29sb3IgaW50byBhIGN1cnJlbnQgb25lXHJcbiAqXHJcbiAqIEBtb2R1bGUgIGNvbG9yLW1hbmlwdWxhdGUvbWl4XHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IxLCBjb2xvcjIsIHdlaWdodCwgc3BhY2UpIHtcclxuXHRzcGFjZSA9IHNwYWNlIHx8ICdyZ2InO1xyXG5cclxuXHR3ZWlnaHQgPSAxIC0gKHdlaWdodCA9PT0gdW5kZWZpbmVkID8gMC41IDogd2VpZ2h0KTtcclxuXHJcblx0dmFyIHQxID0gd2VpZ2h0ICogMiAtIDEsXHJcblx0XHRkID0gY29sb3IxLmFscGhhKCkgLSBjb2xvcjIuYWxwaGEoKTtcclxuXHJcblx0dmFyIHdlaWdodDEgPSAoKCh0MSAqIGQgPT0gLTEpID8gdDEgOiAodDEgKyBkKSAvICgxICsgdDEgKiBkKSkgKyAxKSAvIDI7XHJcblx0dmFyIHdlaWdodDIgPSAxIC0gd2VpZ2h0MTtcclxuXHJcblx0Y29sb3IxLnJlZChjb2xvcjEucmVkKCkgKiB3ZWlnaHQxICsgY29sb3IyLnJlZCgpICogd2VpZ2h0Mik7XHJcblx0Y29sb3IxLmdyZWVuKGNvbG9yMS5ncmVlbigpICogd2VpZ2h0MSArIGNvbG9yMi5ncmVlbigpICogd2VpZ2h0Mik7XHJcblx0Y29sb3IxLmJsdWUoY29sb3IxLmJsdWUoKSAqIHdlaWdodDEgKyBjb2xvcjIuYmx1ZSgpICogd2VpZ2h0Mik7XHJcblxyXG5cdGNvbG9yMS5hbHBoYShjb2xvcjEuYWxwaGEoKSAqIHdlaWdodCArIGNvbG9yMi5hbHBoYSgpICogKDEgLSB3ZWlnaHQpKTtcclxuXHJcblx0cmV0dXJuIGNvbG9yMTtcclxufTsiLCIvKipcclxuICogQmFzaWNhbGx5IGNoYW5nZSBzYXR1cmF0aW9uIGNoYW5uZWwuXHJcbiAqXHJcbiAqIEBtb2R1bGUgY29sb3ItbWFuaXB1bGF0ZS9zYXR1cmF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBBIGNvbG9yIGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYXRpbyBBIHJhdGlvIHRvIHNhdHVyYXRlLCAwLi4xXHJcbiAqXHJcbiAqIEByZXR1cm4ge0NvbG9yfSBUaGUgY29sb3Igd2l0aCBpbmNyZWFzZWQgcmF0aW9cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbG9yLCByYXRpbykge1xyXG5cdHZhciB2YWx1ZSA9IGNvbG9yLnNhdHVyYXRpb24oKTtcclxuXHR2YWx1ZSArPSB2YWx1ZSAqIHJhdGlvO1xyXG5cdGNvbG9yLnNhdHVyYXRpb24odmFsdWUpO1xyXG5cdHJldHVybiBjb2xvcjtcclxufTsiLCIvKipcclxuICogQmFzaWNhbGx5IGNoYW5nZSBodWUgY2hhbm5lbC5cclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL3NwaW5cclxuICpcclxuICogQHBhcmFtIHtDb2xvcn0gY29sb3IgQSBjb2xvciBpbnN0YW5jZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZGVncmVlcyBBIGRlZ3JlZXMgdG8gc3BpbiwgMC4uMVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtDb2xvcn0gVGhlIGNvbG9yIHdpdGggaW5jcmVhc2VkIGh1ZVxyXG4gKi9cclxudmFyIGxvb3AgPSByZXF1aXJlKCdtdW1hdGgvbG9vcCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IsIGRlZ3JlZXMpIHtcclxuXHR2YXIgdmFsdWUgPSBjb2xvci5odWUoKTtcclxuXHR2YWx1ZSArPSBkZWdyZWVzO1xyXG5cdGNvbG9yLmh1ZShsb29wKHZhbHVlLCAwLCAzNjApKTtcclxuXHRyZXR1cm4gY29sb3I7XHJcbn07IiwiLyoqXHJcbiAqIENoYW5nZSB3aGl0ZW5lc3MgY2hhbm5lbC5cclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tYW5pcHVsYXRlL3doaXRlblxyXG4gKlxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvciBBIGNvbG9yIGluc3RhbmNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSByYXRpbyBBIHJhdGlvIHRvIHdoaXRlbiwgMC4uMVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtDb2xvcn0gVGhlIGNvbG9yIHdpdGggaW5jcmVhc2VkIHJhdGlvXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IsIHJhdGlvKSB7XHJcblx0dmFyIHZhbHVlID0gY29sb3Iud2hpdGVuZXNzKCk7XHJcblx0dmFsdWUgKz0gdmFsdWUgKiByYXRpbztcclxuXHRjb2xvci53aGl0ZW5lc3ModmFsdWUpO1xyXG5cdHJldHVybiBjb2xvcjtcclxufTsiLCIvKipcclxuICogaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxyXG4gKlxyXG4gKiBAbW9kdWxlICBjb2xvci1tZWFzdXJlL2NvbnRyYXN0XHJcbiAqL1xyXG5cclxudmFyIGx1bWluYW5jZSA9IHJlcXVpcmUoJy4vbHVtaW5hbmNlJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb2xvcjEsIGNvbG9yMikge1xyXG5cdHZhciBsdW0xID0gbHVtaW5hbmNlKGNvbG9yMSk7XHJcblx0dmFyIGx1bTIgPSBsdW1pbmFuY2UoY29sb3IyKTtcclxuXHRpZiAobHVtMSA+IGx1bTIpIHtcclxuXHRcdHJldHVybiAobHVtMSArIDAuMDUpIC8gKGx1bTIgKyAwLjA1KTtcclxuXHR9XHJcblx0cmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xyXG59OyIsIi8qKlxyXG4gKiBAbW9kdWxlIGNvbG9yLW1lYXN1cmVcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGx1bWluYW5jZTogcmVxdWlyZSgnLi9sdW1pbmFuY2UnKSxcclxuXHRjb250cmFzdDogcmVxdWlyZSgnLi9jb250cmFzdCcpLFxyXG5cdGxldmVsOiByZXF1aXJlKCcuL2xldmVsJyksXHJcblx0aXNEYXJrOiByZXF1aXJlKCcuL2lzLWRhcmsnKSxcclxuXHRpc0xpZ2h0OiByZXF1aXJlKCcuL2lzLWxpZ2h0JyksXHJcblxyXG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZ3JpbnMvVGlueUNvbG9yI3JlYWRhYmlsaXR5XHJcblx0Ly8gcmVhZGFibGUsXHJcblx0Ly8gcmVhZGFiaWxpdHksXHJcblx0Ly8gbW9zdFJlYWRhYmxlLFxyXG5cclxuXHQvLyBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9jb2xvci10ZW1wZXJhdHVyZVxyXG5cdC8vIHRlbXBlcmF0dXJlLFxyXG5cdC8vIG5lYXJlc3QsXHJcbn07IiwiLyoqXHJcbiAqIFlJUSBlcXVhc2lvbiBmcm9tXHJcbiAqIGh0dHA6Ly8yNHdheXMub3JnLzIwMTAvY2FsY3VsYXRpbmctY29sb3ItY29udHJhc3RcclxuICpcclxuICogQG1vZHVsZSAgY29sb3ItbWVhc3VyZS9pcy1kYXJrXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IpIHtcclxuXHR2YXIgeWlxID0gKGNvbG9yLnJlZCgpICogMjk5ICsgY29sb3IuZ3JlZW4oKSAqIDU4NyArIGNvbG9yLmJsdWUoKSAqIDExNCkgLyAxMDAwO1xyXG5cdHJldHVybiB5aXEgPCAxMjg7XHJcbn07IiwiLyoqXHJcbiAqIEBtb2R1bGUgIGNvbG9yLW1lYXN1cmUvaXMtd2hpdGVcclxuICovXHJcblxyXG52YXIgaXNEYXJrID0gcmVxdWlyZSgnLi9pcy1kYXJrJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb2xvcikge1xyXG5cdHJldHVybiAhaXNEYXJrKGNvbG9yKTtcclxufTsiLCIvKipcclxuICogaHR0cDovL3d3dy53My5vcmcvVFIvVU5ERVJTVEFORElORy1XQ0FHMjAvdmlzdWFsLWF1ZGlvLWNvbnRyYXN0LWNvbnRyYXN0Lmh0bWwjdmlzdWFsLWF1ZGlvLWNvbnRyYXN0LWNvbnRyYXN0LTczLWhlYWRcclxuICpcclxuICogQG1vZHVsZSBjb2xvci1tZWFzdXJlL2xldmVsXHJcbiAqL1xyXG5cclxudmFyIGNvbnRyYXN0ID0gcmVxdWlyZSgnLi9jb250cmFzdCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29sb3IxLCBjb2xvcjIpIHtcclxuXHR2YXIgY29udHJhc3RSYXRpbyA9IGNvbnRyYXN0KGNvbG9yMSwgY29sb3IyKTtcclxuXHJcblx0cmV0dXJuIChjb250cmFzdFJhdGlvID49IDcuMSkgPyAnQUFBJyA6IChjb250cmFzdFJhdGlvID49IDQuNSkgPyAnQUEnIDogJyc7XHJcbn07IiwiLyoqXHJcbiAqIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jcmVsYXRpdmVsdW1pbmFuY2VkZWZcclxuICpcclxuICogQG1vZHVsZSAgY29sb3ItbWV0cmljL2x1bWluYW5jZVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbG9yKSB7XHJcblx0dmFyIHJnYiA9IFtjb2xvci5yZWQoKSwgY29sb3IuZ3JlZW4oKSwgY29sb3IuYmx1ZSgpXTtcclxuXHR2YXIgbHVtID0gW107XHJcblxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XHJcblx0XHR2YXIgY2hhbiA9IHJnYltpXSAvIDI1NTtcclxuXHRcdGx1bVtpXSA9IChjaGFuIDw9IDAuMDM5MjgpID8gY2hhbiAvIDEyLjkyIDogTWF0aC5wb3coKChjaGFuICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIDAuMjEyNiAqIGx1bVswXSArIDAuNzE1MiAqIGx1bVsxXSArIDAuMDcyMiAqIGx1bVsyXTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cz17XHJcblx0XCJhbGljZWJsdWVcIjogWzI0MCwgMjQ4LCAyNTVdLFxyXG5cdFwiYW50aXF1ZXdoaXRlXCI6IFsyNTAsIDIzNSwgMjE1XSxcclxuXHRcImFxdWFcIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImFxdWFtYXJpbmVcIjogWzEyNywgMjU1LCAyMTJdLFxyXG5cdFwiYXp1cmVcIjogWzI0MCwgMjU1LCAyNTVdLFxyXG5cdFwiYmVpZ2VcIjogWzI0NSwgMjQ1LCAyMjBdLFxyXG5cdFwiYmlzcXVlXCI6IFsyNTUsIDIyOCwgMTk2XSxcclxuXHRcImJsYWNrXCI6IFswLCAwLCAwXSxcclxuXHRcImJsYW5jaGVkYWxtb25kXCI6IFsyNTUsIDIzNSwgMjA1XSxcclxuXHRcImJsdWVcIjogWzAsIDAsIDI1NV0sXHJcblx0XCJibHVldmlvbGV0XCI6IFsxMzgsIDQzLCAyMjZdLFxyXG5cdFwiYnJvd25cIjogWzE2NSwgNDIsIDQyXSxcclxuXHRcImJ1cmx5d29vZFwiOiBbMjIyLCAxODQsIDEzNV0sXHJcblx0XCJjYWRldGJsdWVcIjogWzk1LCAxNTgsIDE2MF0sXHJcblx0XCJjaGFydHJldXNlXCI6IFsxMjcsIDI1NSwgMF0sXHJcblx0XCJjaG9jb2xhdGVcIjogWzIxMCwgMTA1LCAzMF0sXHJcblx0XCJjb3JhbFwiOiBbMjU1LCAxMjcsIDgwXSxcclxuXHRcImNvcm5mbG93ZXJibHVlXCI6IFsxMDAsIDE0OSwgMjM3XSxcclxuXHRcImNvcm5zaWxrXCI6IFsyNTUsIDI0OCwgMjIwXSxcclxuXHRcImNyaW1zb25cIjogWzIyMCwgMjAsIDYwXSxcclxuXHRcImN5YW5cIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImRhcmtibHVlXCI6IFswLCAwLCAxMzldLFxyXG5cdFwiZGFya2N5YW5cIjogWzAsIDEzOSwgMTM5XSxcclxuXHRcImRhcmtnb2xkZW5yb2RcIjogWzE4NCwgMTM0LCAxMV0sXHJcblx0XCJkYXJrZ3JheVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJrZ3JlZW5cIjogWzAsIDEwMCwgMF0sXHJcblx0XCJkYXJrZ3JleVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJra2hha2lcIjogWzE4OSwgMTgzLCAxMDddLFxyXG5cdFwiZGFya21hZ2VudGFcIjogWzEzOSwgMCwgMTM5XSxcclxuXHRcImRhcmtvbGl2ZWdyZWVuXCI6IFs4NSwgMTA3LCA0N10sXHJcblx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsIDE0MCwgMF0sXHJcblx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsIDUwLCAyMDRdLFxyXG5cdFwiZGFya3JlZFwiOiBbMTM5LCAwLCAwXSxcclxuXHRcImRhcmtzYWxtb25cIjogWzIzMywgMTUwLCAxMjJdLFxyXG5cdFwiZGFya3NlYWdyZWVuXCI6IFsxNDMsIDE4OCwgMTQzXSxcclxuXHRcImRhcmtzbGF0ZWJsdWVcIjogWzcyLCA2MSwgMTM5XSxcclxuXHRcImRhcmtzbGF0ZWdyYXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3NsYXRlZ3JleVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrdHVycXVvaXNlXCI6IFswLCAyMDYsIDIwOV0sXHJcblx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsIDAsIDIxMV0sXHJcblx0XCJkZWVwcGlua1wiOiBbMjU1LCAyMCwgMTQ3XSxcclxuXHRcImRlZXBza3libHVlXCI6IFswLCAxOTEsIDI1NV0sXHJcblx0XCJkaW1ncmF5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRpbWdyZXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZG9kZ2VyYmx1ZVwiOiBbMzAsIDE0NCwgMjU1XSxcclxuXHRcImZpcmVicmlja1wiOiBbMTc4LCAzNCwgMzRdLFxyXG5cdFwiZmxvcmFsd2hpdGVcIjogWzI1NSwgMjUwLCAyNDBdLFxyXG5cdFwiZm9yZXN0Z3JlZW5cIjogWzM0LCAxMzksIDM0XSxcclxuXHRcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcImdhaW5zYm9yb1wiOiBbMjIwLCAyMjAsIDIyMF0sXHJcblx0XCJnaG9zdHdoaXRlXCI6IFsyNDgsIDI0OCwgMjU1XSxcclxuXHRcImdvbGRcIjogWzI1NSwgMjE1LCAwXSxcclxuXHRcImdvbGRlbnJvZFwiOiBbMjE4LCAxNjUsIDMyXSxcclxuXHRcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXHJcblx0XCJncmVlbnllbGxvd1wiOiBbMTczLCAyNTUsIDQ3XSxcclxuXHRcImdyZXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiaG9uZXlkZXdcIjogWzI0MCwgMjU1LCAyNDBdLFxyXG5cdFwiaG90cGlua1wiOiBbMjU1LCAxMDUsIDE4MF0sXHJcblx0XCJpbmRpYW5yZWRcIjogWzIwNSwgOTIsIDkyXSxcclxuXHRcImluZGlnb1wiOiBbNzUsIDAsIDEzMF0sXHJcblx0XCJpdm9yeVwiOiBbMjU1LCAyNTUsIDI0MF0sXHJcblx0XCJraGFraVwiOiBbMjQwLCAyMzAsIDE0MF0sXHJcblx0XCJsYXZlbmRlclwiOiBbMjMwLCAyMzAsIDI1MF0sXHJcblx0XCJsYXZlbmRlcmJsdXNoXCI6IFsyNTUsIDI0MCwgMjQ1XSxcclxuXHRcImxhd25ncmVlblwiOiBbMTI0LCAyNTIsIDBdLFxyXG5cdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsIDI1MCwgMjA1XSxcclxuXHRcImxpZ2h0Ymx1ZVwiOiBbMTczLCAyMTYsIDIzMF0sXHJcblx0XCJsaWdodGNvcmFsXCI6IFsyNDAsIDEyOCwgMTI4XSxcclxuXHRcImxpZ2h0Y3lhblwiOiBbMjI0LCAyNTUsIDI1NV0sXHJcblx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLCAyNTAsIDIxMF0sXHJcblx0XCJsaWdodGdyYXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRncmVlblwiOiBbMTQ0LCAyMzgsIDE0NF0sXHJcblx0XCJsaWdodGdyZXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRwaW5rXCI6IFsyNTUsIDE4MiwgMTkzXSxcclxuXHRcImxpZ2h0c2FsbW9uXCI6IFsyNTUsIDE2MCwgMTIyXSxcclxuXHRcImxpZ2h0c2VhZ3JlZW5cIjogWzMyLCAxNzgsIDE3MF0sXHJcblx0XCJsaWdodHNreWJsdWVcIjogWzEzNSwgMjA2LCAyNTBdLFxyXG5cdFwibGlnaHRzbGF0ZWdyYXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzbGF0ZWdyZXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzdGVlbGJsdWVcIjogWzE3NiwgMTk2LCAyMjJdLFxyXG5cdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwgMjU1LCAyMjRdLFxyXG5cdFwibGltZVwiOiBbMCwgMjU1LCAwXSxcclxuXHRcImxpbWVncmVlblwiOiBbNTAsIDIwNSwgNTBdLFxyXG5cdFwibGluZW5cIjogWzI1MCwgMjQwLCAyMzBdLFxyXG5cdFwibWFnZW50YVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxyXG5cdFwibWVkaXVtYXF1YW1hcmluZVwiOiBbMTAyLCAyMDUsIDE3MF0sXHJcblx0XCJtZWRpdW1ibHVlXCI6IFswLCAwLCAyMDVdLFxyXG5cdFwibWVkaXVtb3JjaGlkXCI6IFsxODYsIDg1LCAyMTFdLFxyXG5cdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsIDExMiwgMjE5XSxcclxuXHRcIm1lZGl1bXNlYWdyZWVuXCI6IFs2MCwgMTc5LCAxMTNdLFxyXG5cdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsIDEwNCwgMjM4XSxcclxuXHRcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IFswLCAyNTAsIDE1NF0sXHJcblx0XCJtZWRpdW10dXJxdW9pc2VcIjogWzcyLCAyMDksIDIwNF0sXHJcblx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwgMjEsIDEzM10sXHJcblx0XCJtaWRuaWdodGJsdWVcIjogWzI1LCAyNSwgMTEyXSxcclxuXHRcIm1pbnRjcmVhbVwiOiBbMjQ1LCAyNTUsIDI1MF0sXHJcblx0XCJtaXN0eXJvc2VcIjogWzI1NSwgMjI4LCAyMjVdLFxyXG5cdFwibW9jY2FzaW5cIjogWzI1NSwgMjI4LCAxODFdLFxyXG5cdFwibmF2YWpvd2hpdGVcIjogWzI1NSwgMjIyLCAxNzNdLFxyXG5cdFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcclxuXHRcIm9sZGxhY2VcIjogWzI1MywgMjQ1LCAyMzBdLFxyXG5cdFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcclxuXHRcIm9saXZlZHJhYlwiOiBbMTA3LCAxNDIsIDM1XSxcclxuXHRcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxyXG5cdFwib3JhbmdlcmVkXCI6IFsyNTUsIDY5LCAwXSxcclxuXHRcIm9yY2hpZFwiOiBbMjE4LCAxMTIsIDIxNF0sXHJcblx0XCJwYWxlZ29sZGVucm9kXCI6IFsyMzgsIDIzMiwgMTcwXSxcclxuXHRcInBhbGVncmVlblwiOiBbMTUyLCAyNTEsIDE1Ml0sXHJcblx0XCJwYWxldHVycXVvaXNlXCI6IFsxNzUsIDIzOCwgMjM4XSxcclxuXHRcInBhbGV2aW9sZXRyZWRcIjogWzIxOSwgMTEyLCAxNDddLFxyXG5cdFwicGFwYXlhd2hpcFwiOiBbMjU1LCAyMzksIDIxM10sXHJcblx0XCJwZWFjaHB1ZmZcIjogWzI1NSwgMjE4LCAxODVdLFxyXG5cdFwicGVydVwiOiBbMjA1LCAxMzMsIDYzXSxcclxuXHRcInBpbmtcIjogWzI1NSwgMTkyLCAyMDNdLFxyXG5cdFwicGx1bVwiOiBbMjIxLCAxNjAsIDIyMV0sXHJcblx0XCJwb3dkZXJibHVlXCI6IFsxNzYsIDIyNCwgMjMwXSxcclxuXHRcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxyXG5cdFwicmViZWNjYXB1cnBsZVwiOiBbMTAyLCA1MSwgMTUzXSxcclxuXHRcInJlZFwiOiBbMjU1LCAwLCAwXSxcclxuXHRcInJvc3licm93blwiOiBbMTg4LCAxNDMsIDE0M10sXHJcblx0XCJyb3lhbGJsdWVcIjogWzY1LCAxMDUsIDIyNV0sXHJcblx0XCJzYWRkbGVicm93blwiOiBbMTM5LCA2OSwgMTldLFxyXG5cdFwic2FsbW9uXCI6IFsyNTAsIDEyOCwgMTE0XSxcclxuXHRcInNhbmR5YnJvd25cIjogWzI0NCwgMTY0LCA5Nl0sXHJcblx0XCJzZWFncmVlblwiOiBbNDYsIDEzOSwgODddLFxyXG5cdFwic2Vhc2hlbGxcIjogWzI1NSwgMjQ1LCAyMzhdLFxyXG5cdFwic2llbm5hXCI6IFsxNjAsIDgyLCA0NV0sXHJcblx0XCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxyXG5cdFwic2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDIzNV0sXHJcblx0XCJzbGF0ZWJsdWVcIjogWzEwNiwgOTAsIDIwNV0sXHJcblx0XCJzbGF0ZWdyYXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic2xhdGVncmV5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNub3dcIjogWzI1NSwgMjUwLCAyNTBdLFxyXG5cdFwic3ByaW5nZ3JlZW5cIjogWzAsIDI1NSwgMTI3XSxcclxuXHRcInN0ZWVsYmx1ZVwiOiBbNzAsIDEzMCwgMTgwXSxcclxuXHRcInRhblwiOiBbMjEwLCAxODAsIDE0MF0sXHJcblx0XCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXHJcblx0XCJ0aGlzdGxlXCI6IFsyMTYsIDE5MSwgMjE2XSxcclxuXHRcInRvbWF0b1wiOiBbMjU1LCA5OSwgNzFdLFxyXG5cdFwidHVycXVvaXNlXCI6IFs2NCwgMjI0LCAyMDhdLFxyXG5cdFwidmlvbGV0XCI6IFsyMzgsIDEzMCwgMjM4XSxcclxuXHRcIndoZWF0XCI6IFsyNDUsIDIyMiwgMTc5XSxcclxuXHRcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcclxuXHRcIndoaXRlc21va2VcIjogWzI0NSwgMjQ1LCAyNDVdLFxyXG5cdFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF0sXHJcblx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LCAyMDUsIDUwXVxyXG59IiwiLyoqXHJcbiAqIEBtb2R1bGUgY29sb3ItcGFyc2VcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xyXG5cclxuXHJcbnZhciBuYW1lcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcclxuXHJcblxyXG4vKipcclxuICogQmFzZSBodWVzXHJcbiAqIGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzcy1jb2xvci8jdHlwZWRlZi1uYW1lZC1odWVcclxuICovXHJcbi8vRklYTUU6IHVzZSBleHRlcm5hbCBodWUgZGV0ZWN0b3JcclxudmFyIGJhc2VIdWVzID0ge1xyXG5cdHJlZDogMCxcclxuXHRvcmFuZ2U6IDYwLFxyXG5cdHllbGxvdzogMTIwLFxyXG5cdGdyZWVuOiAxODAsXHJcblx0Ymx1ZTogMjQwLFxyXG5cdHB1cnBsZTogMzAwXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFBhcnNlIGNvbG9yIGZyb20gdGhlIHN0cmluZyBwYXNzZWRcclxuICpcclxuICogQHJldHVybiB7T2JqZWN0fSBBIHNwYWNlIGluZGljYXRvciBgc3BhY2VgLCBhbiBhcnJheSBgdmFsdWVzYCBhbmQgYGFscGhhYFxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2UgKGNzdHIpIHtcclxuXHR2YXIgbSwgcGFydHMgPSBbMCwwLDBdLCBhbHBoYSA9IDEsIHNwYWNlID0gJ3JnYic7XHJcblxyXG5cdC8va2V5d29yZFxyXG5cdGlmIChuYW1lc1tjc3RyXSkge1xyXG5cdFx0cGFydHMgPSBuYW1lc1tjc3RyXTtcclxuXHR9XHJcblxyXG5cdC8vcmVzZXJ2ZWQgd29yZHNcclxuXHRlbHNlIGlmIChjc3RyID09PSAndHJhbnNwYXJlbnQnKSBhbHBoYSA9IDA7XHJcblxyXG5cdC8vY29sb3Igc3BhY2VcclxuXHRlbHNlIGlmIChtID0gL14oKD86cmdifGhzW2x2Yl18aHdifGNteWs/fHh5W3p5XXxncmF5fGxhYnxsY2h1P3Y/fFtseV11dnxsbXMpYT8pXFxzKlxcKChbXlxcKV0qKVxcKS8uZXhlYyhjc3RyKSkge1xyXG5cdFx0dmFyIG5hbWUgPSBtWzFdO1xyXG5cdFx0dmFyIGJhc2UgPSBuYW1lLnJlcGxhY2UoL2EkLywgJycpO1xyXG5cdFx0c3BhY2UgPSBiYXNlO1xyXG5cdFx0dmFyIHNpemUgPSBiYXNlID09PSAnY215aycgPyA0IDogYmFzZSA9PT0gJ2dyYXknID8gMSA6IDM7XHJcblx0XHRwYXJ0cyA9IG1bMl0udHJpbSgpXHJcblx0XHRcdC5zcGxpdCgvXFxzKixcXHMqLylcclxuXHRcdFx0Lm1hcChmdW5jdGlvbiAoeCwgaSkge1xyXG5cdFx0XHRcdC8vPHBlcmNlbnRhZ2U+XHJcblx0XHRcdFx0aWYgKC8lJC8udGVzdCh4KSkge1xyXG5cdFx0XHRcdFx0Ly9hbHBoYVxyXG5cdFx0XHRcdFx0aWYgKGkgPT09IHNpemUpXHRyZXR1cm4gcGFyc2VGbG9hdCh4KSAvIDEwMDtcclxuXHRcdFx0XHRcdC8vcmdiXHJcblx0XHRcdFx0XHRpZiAoYmFzZSA9PT0gJ3JnYicpIHJldHVybiBwYXJzZUZsb2F0KHgpICogMjU1IC8gMTAwO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQoeCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vaHVlXHJcblx0XHRcdFx0ZWxzZSBpZiAoYmFzZVtpXSA9PT0gJ2gnKSB7XHJcblx0XHRcdFx0XHQvLzxkZWc+XHJcblx0XHRcdFx0XHRpZiAoL2RlZyQvLnRlc3QoeCkpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQoeCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLzxiYXNlLWh1ZT5cclxuXHRcdFx0XHRcdGVsc2UgaWYgKGJhc2VIdWVzW3hdICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGJhc2VIdWVzW3hdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gcGFyc2VGbG9hdCh4KTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0aWYgKG5hbWUgPT09IGJhc2UpIHBhcnRzLnB1c2goMSk7XHJcblx0XHRhbHBoYSA9IHBhcnRzW3NpemVdID09PSB1bmRlZmluZWQgPyAxIDogcGFydHNbc2l6ZV07XHJcblx0XHRwYXJ0cyA9IHBhcnRzLnNsaWNlKDAsIHNpemUpO1xyXG5cdH1cclxuXHJcblx0Ly9oZXhcclxuXHRlbHNlIGlmICgvXiNbQS1GYS1mMC05XSskLy50ZXN0KGNzdHIpKSB7XHJcblx0XHR2YXIgYmFzZSA9IGNzdHIucmVwbGFjZSgvXiMvLCcnKTtcclxuXHRcdHZhciBzaXplID0gYmFzZS5sZW5ndGg7XHJcblx0XHR2YXIgaXNTaG9ydCA9IHNpemUgPD0gNDtcclxuXHJcblx0XHRwYXJ0cyA9IGJhc2Uuc3BsaXQoaXNTaG9ydCA/IC8oLikvIDogLyguLikvKTtcclxuXHRcdHBhcnRzID0gcGFydHMuZmlsdGVyKEJvb2xlYW4pXHJcblx0XHRcdC5tYXAoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0XHRpZiAoaXNTaG9ydCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KHggKyB4LCAxNik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KHgsIDE2KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdGlmIChwYXJ0cy5sZW5ndGggPT09IDQpIHtcclxuXHRcdFx0YWxwaGEgPSBwYXJ0c1szXSAvIDI1NTtcclxuXHRcdFx0cGFydHMgPSBwYXJ0cy5zbGljZSgwLDMpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCFwYXJ0c1swXSkgcGFydHNbMF0gPSAwO1xyXG5cdFx0aWYgKCFwYXJ0c1sxXSkgcGFydHNbMV0gPSAwO1xyXG5cdFx0aWYgKCFwYXJ0c1syXSkgcGFydHNbMl0gPSAwO1xyXG5cdH1cclxuXHJcblx0Ly9uYW1lZCBjaGFubmVscyBjYXNlXHJcblx0ZWxzZSBpZiAoY3N0ci5sZW5ndGggPiAxMCAmJiAvWzAtOV0oPzpcXHN8XFwvKS8udGVzdChjc3RyKSkge1xyXG5cdFx0cGFydHMgPSBjc3RyLm1hdGNoKC8oWzAtOV0rKS9nKS5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHNwYWNlID0gY3N0ci5tYXRjaCgvKFthLXpdKS9pZykuam9pbignJykudG9Mb3dlckNhc2UoKTtcclxuXHR9XHJcblxyXG5cdGVsc2Uge1xyXG5cdFx0dGhyb3cgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSAnICsgY3N0cik7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0c3BhY2U6IHNwYWNlLFxyXG5cdFx0dmFsdWVzOiBwYXJ0cyxcclxuXHRcdGFscGhhOiBhbHBoYVxyXG5cdH07XHJcbn0iLCIvKipcclxuICogQG1vZHVsZSAgY29sb3Itc3RyaW5naWZ5XHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzdHJpbmdpZnk7XHJcblxyXG5cclxudmFyIG5hbWVzID0gcmVxdWlyZSgnY29sb3ItbmFtZScpO1xyXG5cclxuXHJcbi8qKiBJbnZlcnRlZCBjb2xvciBuYW1lcyAqL1xyXG52YXIgbmFtZVZhbHVlcyA9IHt9O1xyXG5mb3IgKHZhciBuYW1lIGluIG5hbWVzKSB7XHJcblx0bmFtZVZhbHVlc1tuYW1lc1tuYW1lXV0gPSBuYW1lO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFN0cmluZ2lmeSBjb2xvciB2YWx1ZXMgdG8gYW55IHRhcmdldCBmb3JtYXRcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gdmFsdWVzIEFuIGFycmF5IG9mIHZhbHVlcyB0byBzdHJpbmdpZnksIGJ5IGRlZmF1bHQgLSByZ2JbYV1cclxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgQSBjb2xvciBzcGFjZSB0byBzdHJpbmdpZnkgdmFsdWVzIHRvLiBCeSBkZWZhdWx0IC0gcmdiLlxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaW5naWZ5ICh2YWx1ZXMsIHR5cGUpIHtcclxuXHRpZiAodHlwZSA9PT0gJ2hleCcpIHtcclxuXHRcdHZhciByZXMgPSB2YWx1ZXMuc2xpY2UoMCwzKS5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XHJcblx0XHRcdHJldHVybiAodmFsdWUgPCAxNiA/ICcwJyA6ICcnKSArIHZhbHVlLnRvU3RyaW5nKDE2KTtcclxuXHRcdH0pLmpvaW4oJycpO1xyXG5cclxuXHRcdGlmIChyZXNbMF0gPT09IHJlc1sxXSAmJiByZXNbMl0gPT09IHJlc1szXSAmJiByZXNbNF0gPT09IHJlc1s1XSkgcmVzID0gcmVzWzBdICsgcmVzWzJdICsgcmVzWzRdO1xyXG5cclxuXHRcdHJldHVybiAnIycgKyByZXM7XHJcblx0fVxyXG5cclxuXHRpZiAodHlwZSA9PT0gJ2tleXdvcmQnKSB7XHJcblx0XHRyZXR1cm4gbmFtZVZhbHVlc1t2YWx1ZXNdO1xyXG5cdH1cclxuXHJcblx0aWYgKHR5cGUgPT09ICdhZG9iZTEnKSB7XHJcblx0XHRyZXR1cm4gJ1I6JyArIHZhbHVlc1swXSArICcsIEc6JyArIHZhbHVlc1sxXSArICcsIEI6JyArIHZhbHVlc1syXTtcclxuXHR9XHJcblxyXG5cdGlmICh0eXBlID09PSAnYWRvYmUyJykge1xyXG5cdFx0cmV0dXJuICcoUicgKyB2YWx1ZXNbMF0gKyAnIC8gRycgKyB2YWx1ZXNbMV0gKyAnIC8gQicgKyB2YWx1ZXNbMl0gKyAnKSc7XHJcblx0fVxyXG5cclxuXHR2YXIgaXNQZXJjZW50LCBpc0FscGhhU3BhY2U7XHJcblxyXG5cdC8vY29udmVydCByZ2IgdG8gcGVyY2VudHNcclxuXHRpZiAodHlwZSA9PT0gJ3BlcmNlbnQnKSB7XHJcblx0XHR0eXBlID0gJ3JnYic7XHJcblx0XHR2YWx1ZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xyXG5cdFx0XHRpZiAoaSA9PT0gMykgcmV0dXJuIHZhbHVlO1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMCAvIDI1NSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpc1BlcmNlbnQgPSB0cnVlO1xyXG5cdFx0aXNBbHBoYVNwYWNlID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHR5cGUgPSB0eXBlIHx8ICdyZ2InO1xyXG5cclxuXHQvL2NhdGNoIGh3Yi9oc2wvaHN2XHJcblx0aXNQZXJjZW50ID0gaXNQZXJjZW50ID8gaXNQZXJjZW50IDogdHlwZVswXSA9PT0gJ2gnO1xyXG5cclxuXHQvL2RldGVjdCB3aGV0aGVyIGFscGhhLXBlcmZpeCBpcyBuZWVkZWRcclxuXHRpc0FscGhhU3BhY2UgPSBpc0FscGhhU3BhY2UgfHwgL3JnYnxoc1tsdl0vaS50ZXN0KHR5cGUpO1xyXG5cclxuXHQvL25vcm1hbGl6ZSBzcGFjZSBuYW1lXHJcblx0aWYgKGlzQWxwaGFTcGFjZSAmJiB0eXBlW3R5cGUubGVuZ3RoIC0gMV0gPT09ICdhJykge1xyXG5cdFx0dHlwZSA9IHR5cGUuc2xpY2UoMCwtMSk7XHJcblx0fVxyXG5cclxuXHQvL25vcm1hbGl6ZSBhbHBoYVxyXG5cdHZhciBhbHBoYSA9IDE7XHJcblx0aWYgKHZhbHVlcy5sZW5ndGggPiB0eXBlLmxlbmd0aCkge1xyXG5cdFx0YWxwaGEgPSB2YWx1ZXMucG9wKCk7XHJcblx0fVxyXG5cclxuXHQvL2RlY2lkZSB0aGUgc3BhY2UgbmFtZVxyXG5cdHZhciBhbHBoYVBmID0gaXNBbHBoYVNwYWNlICYmIGFscGhhIDwgMSA/ICdhJyA6ICcnO1xyXG5cclxuXHQvLzxodWU+IGNhc2UgcmVxdWlyZXMgcGVyY2VudHNcclxuXHR2YXIgcmVzID0gdHlwZSArIGFscGhhUGY7XHJcblxyXG5cdHJlcyArPSAnKCcgKyB2YWx1ZXMubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xyXG5cdFx0aWYgKGlzUGVyY2VudCAmJiAhKHR5cGVbaV0gPT09ICdoJykpIHtcclxuXHRcdFx0cmV0dXJuIHZhbHVlICsgJyUnO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJldHVybiB2YWx1ZTtcclxuXHRcdH1cclxuXHR9KS5qb2luKCcsICcpO1xyXG5cclxuXHRyZXMgKz0gKCBhbHBoYSA8IDEgPyAnLCAnICsgYWxwaGEgOiAnJyApICsgJyknO1xyXG5cclxuXHRyZXR1cm4gcmVzO1xyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBsZWZ0cGFkO1xuXG5mdW5jdGlvbiBsZWZ0cGFkIChzdHIsIGxlbiwgY2gpIHtcbiAgc3RyID0gU3RyaW5nKHN0cik7XG5cbiAgdmFyIGkgPSAtMTtcblxuICBpZiAoIWNoICYmIGNoICE9PSAwKSBjaCA9ICcgJztcblxuICBsZW4gPSBsZW4gLSBzdHIubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICBzdHIgPSBjaCArIHN0cjtcbiAgfVxuXG4gIHJldHVybiBzdHI7XG59XG4iLCIvKipcclxuICogQ2xhbXBlci5cclxuICogRGV0ZWN0cyBwcm9wZXIgY2xhbXAgbWluL21heC5cclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IGEgQ3VycmVudCB2YWx1ZSB0byBjdXQgb2ZmXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW4gT25lIHNpZGUgbGltaXRcclxuICogQHBhcmFtIHtudW1iZXJ9IG1heCBPdGhlciBzaWRlIGxpbWl0XHJcbiAqXHJcbiAqIEByZXR1cm4ge251bWJlcn0gQ2xhbXBlZCB2YWx1ZVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi93cmFwJykoZnVuY3Rpb24oYSwgbWluLCBtYXgpe1xyXG5cdHJldHVybiBtYXggPiBtaW4gPyBNYXRoLm1heChNYXRoLm1pbihhLG1heCksbWluKSA6IE1hdGgubWF4KE1hdGgubWluKGEsbWluKSxtYXgpO1xyXG59KTsiLCIvKipcclxuICogQG1vZHVsZSAgbXVtYXRoL2xvb3BcclxuICpcclxuICogTG9vcGluZyBmdW5jdGlvbiBmb3IgYW55IGZyYW1lc2l6ZVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi93cmFwJykoZnVuY3Rpb24gKHZhbHVlLCBsZWZ0LCByaWdodCkge1xyXG5cdC8vZGV0ZWN0IHNpbmdsZS1hcmcgY2FzZSwgbGlrZSBtb2QtbG9vcFxyXG5cdGlmIChyaWdodCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRyaWdodCA9IGxlZnQ7XHJcblx0XHRsZWZ0ID0gMDtcclxuXHR9XHJcblxyXG5cdC8vc3dhcCBmcmFtZSBvcmRlclxyXG5cdGlmIChsZWZ0ID4gcmlnaHQpIHtcclxuXHRcdHZhciB0bXAgPSByaWdodDtcclxuXHRcdHJpZ2h0ID0gbGVmdDtcclxuXHRcdGxlZnQgPSB0bXA7XHJcblx0fVxyXG5cclxuXHR2YXIgZnJhbWUgPSByaWdodCAtIGxlZnQ7XHJcblxyXG5cdHZhbHVlID0gKCh2YWx1ZSArIGxlZnQpICUgZnJhbWUpIC0gbGVmdDtcclxuXHRpZiAodmFsdWUgPCBsZWZ0KSB2YWx1ZSArPSBmcmFtZTtcclxuXHRpZiAodmFsdWUgPiByaWdodCkgdmFsdWUgLT0gZnJhbWU7XHJcblxyXG5cdHJldHVybiB2YWx1ZTtcclxufSk7IiwiLyoqXHJcbiAqIEBtb2R1bGUgIG11bWF0aC9wcmVjaXNpb25cclxuICpcclxuICogR2V0IHByZWNpc2lvbiBmcm9tIGZsb2F0OlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAxLjEg4oaSIDEsIDEyMzQg4oaSIDAsIC4xMjM0IOKGkiA0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuXHJcbiAqXHJcbiAqIEByZXR1cm4ge251bWJlcn0gZGVjaW1hcCBwbGFjZXNcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vd3JhcCcpKGZ1bmN0aW9uKG4pe1xyXG5cdHZhciBzID0gbiArICcnLFxyXG5cdFx0ZCA9IHMuaW5kZXhPZignLicpICsgMTtcclxuXHJcblx0cmV0dXJuICFkID8gMCA6IHMubGVuZ3RoIC0gZDtcclxufSk7IiwiLyoqXHJcbiAqIFByZWNpc2lvbiByb3VuZFxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcclxuICogQHBhcmFtIHtudW1iZXJ9IHN0ZXAgTWluaW1hbCBkaXNjcmV0ZSB0byByb3VuZFxyXG4gKlxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIHRvUHJlY2lzaW9uKDIxMy4zNCwgMSkgPT0gMjEzXHJcbiAqIHRvUHJlY2lzaW9uKDIxMy4zNCwgLjEpID09IDIxMy4zXHJcbiAqIHRvUHJlY2lzaW9uKDIxMy4zNCwgMTApID09IDIxMFxyXG4gKi9cclxudmFyIHByZWNpc2lvbiA9IHJlcXVpcmUoJy4vcHJlY2lzaW9uJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vd3JhcCcpKGZ1bmN0aW9uKHZhbHVlLCBzdGVwKSB7XHJcblx0aWYgKHN0ZXAgPT09IDApIHJldHVybiB2YWx1ZTtcclxuXHRpZiAoIXN0ZXApIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlKTtcclxuXHRzdGVwID0gcGFyc2VGbG9hdChzdGVwKTtcclxuXHR2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgLyBzdGVwKSAqIHN0ZXA7XHJcblx0cmV0dXJuIHBhcnNlRmxvYXQodmFsdWUudG9GaXhlZChwcmVjaXNpb24oc3RlcCkpKTtcclxufSk7IiwiLyoqXHJcbiAqIEdldCBmbiB3cmFwcGVkIHdpdGggYXJyYXkvb2JqZWN0IGF0dHJzIHJlY29nbml0aW9uXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUYXJnZXQgZnVuY3Rpb25cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pe1xyXG5cdHJldHVybiBmdW5jdGlvbihhKXtcclxuXHRcdHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG5cdFx0aWYgKGEgaW5zdGFuY2VvZiBBcnJheSkge1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGEubGVuZ3RoKSwgc2xpY2U7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKyl7XHJcblx0XHRcdFx0c2xpY2UgPSBbXTtcclxuXHRcdFx0XHRmb3IgKHZhciBqID0gMCwgbCA9IGFyZ3MubGVuZ3RoLCB2YWw7IGogPCBsOyBqKyspe1xyXG5cdFx0XHRcdFx0dmFsID0gYXJnc1tqXSBpbnN0YW5jZW9mIEFycmF5ID8gYXJnc1tqXVtpXSA6IGFyZ3Nbal07XHJcblx0XHRcdFx0XHR2YWwgPSB2YWw7XHJcblx0XHRcdFx0XHRzbGljZS5wdXNoKHZhbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJlc3VsdFtpXSA9IGZuLmFwcGx5KHRoaXMsIHNsaWNlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdHZhciByZXN1bHQgPSB7fSwgc2xpY2U7XHJcblx0XHRcdGZvciAodmFyIGkgaW4gYSl7XHJcblx0XHRcdFx0c2xpY2UgPSBbXTtcclxuXHRcdFx0XHRmb3IgKHZhciBqID0gMCwgbCA9IGFyZ3MubGVuZ3RoLCB2YWw7IGogPCBsOyBqKyspe1xyXG5cdFx0XHRcdFx0dmFsID0gdHlwZW9mIGFyZ3Nbal0gPT09ICdvYmplY3QnID8gYXJnc1tqXVtpXSA6IGFyZ3Nbal07XHJcblx0XHRcdFx0XHR2YWwgPSB2YWw7XHJcblx0XHRcdFx0XHRzbGljZS5wdXNoKHZhbCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJlc3VsdFtpXSA9IGZuLmFwcGx5KHRoaXMsIHNsaWNlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmdzKTtcclxuXHRcdH1cclxuXHR9O1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSl7XHJcblx0cmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheTtcclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSl7XHJcblx0cmV0dXJuIHR5cGVvZiBhID09PSAnbnVtYmVyJyB8fCBhIGluc3RhbmNlb2YgTnVtYmVyO1xyXG59IiwiLyoqXHJcbiAqIEBtb2R1bGUgbXV0eXBlL2lzLW9iamVjdFxyXG4gKi9cclxuXHJcbi8vVE9ETzogYWRkIHN0OCB0ZXN0c1xyXG5cclxuLy9pc1BsYWluT2JqZWN0IGluZGVlZFxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG8pe1xyXG5cdC8vIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xyXG5cdHJldHVybiAhIW8gJiYgdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIG8uY29uc3RydWN0b3IgPT09IE9iamVjdDtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhKXtcclxuXHRyZXR1cm4gdHlwZW9mIGEgPT09ICdzdHJpbmcnIHx8IGEgaW5zdGFuY2VvZiBTdHJpbmc7XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9zbGljZWQnKTtcbiIsIlxuLyoqXG4gKiBBbiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpIGFsdGVybmF0aXZlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFyZ3Mgc29tZXRoaW5nIHdpdGggYSBsZW5ndGhcbiAqIEBwYXJhbSB7TnVtYmVyfSBzbGljZVxuICogQHBhcmFtIHtOdW1iZXJ9IHNsaWNlRW5kXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3MsIHNsaWNlLCBzbGljZUVuZCkge1xuICB2YXIgcmV0ID0gW107XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcblxuICBpZiAoMCA9PT0gbGVuKSByZXR1cm4gcmV0O1xuXG4gIHZhciBzdGFydCA9IHNsaWNlIDwgMFxuICAgID8gTWF0aC5tYXgoMCwgc2xpY2UgKyBsZW4pXG4gICAgOiBzbGljZSB8fCAwO1xuXG4gIGlmIChzbGljZUVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuID0gc2xpY2VFbmQgPCAwXG4gICAgICA/IHNsaWNlRW5kICsgbGVuXG4gICAgICA6IHNsaWNlRW5kXG4gIH1cblxuICB3aGlsZSAobGVuLS0gPiBzdGFydCkge1xuICAgIHJldFtsZW4gLSBzdGFydF0gPSBhcmdzW2xlbl07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4iLCIvKipcclxuICogQSBzdG9yYWdlIG9mIHBlci10YXJnZXQgY2FsbGJhY2tzLlxyXG4gKiBXZWFrTWFwIGlzIHRoZSBtb3N0IHNhZmUgc29sdXRpb24uXHJcbiAqXHJcbiAqIEBtb2R1bGUgZW1teS9saXN0ZW5lcnNcclxuICovXHJcblxyXG5cclxuLyoqXHJcbiAqIFByb3BlcnR5IG5hbWUgdG8gcHJvdmlkZSBvbiB0YXJnZXRzLlxyXG4gKlxyXG4gKiBDYW7igJl0IHVzZSBnbG9iYWwgV2Vha01hcCAtXHJcbiAqIGl0IGlzIGltcG9zc2libGUgdG8gcHJvdmlkZSBzaW5nbGV0b24gZ2xvYmFsIGNhY2hlIG9mIGNhbGxiYWNrcyBmb3IgdGFyZ2V0c1xyXG4gKiBub3QgcG9sbHV0aW5nIGdsb2JhbCBzY29wZS4gU28gaXQgaXMgYmV0dGVyIHRvIHBvbGx1dGUgdGFyZ2V0IHNjb3BlIHRoYW4gdGhlIGdsb2JhbC5cclxuICpcclxuICogT3RoZXJ3aXNlLCBlYWNoIGVtbXkgaW5zdGFuY2Ugd2lsbCBjcmVhdGUgaXTigJlzIG93biBjYWNoZSwgd2hpY2ggbGVhZHMgdG8gbWVzcy5cclxuICpcclxuICogQWxzbyBjYW7igJl0IHVzZSBgLl9ldmVudHNgIHByb3BlcnR5IG9uIHRhcmdldHMsIGFzIGl0IGlzIGRvbmUgaW4gYGV2ZW50c2AgbW9kdWxlLFxyXG4gKiBiZWNhdXNlIGl0IGlzIGluY29tcGF0aWJsZS4gRW1teSB0YXJnZXRzIHVuaXZlcnNhbCBldmVudHMgd3JhcHBlciwgbm90IHRoZSBuYXRpdmUgaW1wbGVtZW50YXRpb24uXHJcbiAqL1xyXG52YXIgY2JQcm9wTmFtZSA9ICdfY2FsbGJhY2tzJztcclxuXHJcblxyXG4vKipcclxuICogR2V0IGxpc3RlbmVycyBmb3IgdGhlIHRhcmdldC9ldnQgKG9wdGlvbmFsbHkpLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IGEgdGFyZ2V0IG9iamVjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30/IGV2dCBhbiBldnQgbmFtZSwgaWYgdW5kZWZpbmVkIC0gcmV0dXJuIG9iamVjdCB3aXRoIGV2ZW50c1xyXG4gKlxyXG4gKiBAcmV0dXJuIHsob2JqZWN0fGFycmF5KX0gTGlzdC9zZXQgb2YgbGlzdGVuZXJzXHJcbiAqL1xyXG5mdW5jdGlvbiBsaXN0ZW5lcnModGFyZ2V0LCBldnQsIHRhZ3Mpe1xyXG5cdHZhciBjYnMgPSB0YXJnZXRbY2JQcm9wTmFtZV07XHJcblxyXG5cdGlmICghZXZ0KSByZXR1cm4gY2JzIHx8IHt9O1xyXG5cdGlmICghY2JzIHx8ICFjYnNbZXZ0XSkgcmV0dXJuIFtdO1xyXG5cclxuXHR2YXIgcmVzdWx0ID0gY2JzW2V2dF07XHJcblxyXG5cdC8vaWYgdGhlcmUgYXJlIGV2dCBuYW1lc3BhY2VzIHNwZWNpZmllZCAtIGZpbHRlciBjYWxsYmFja3NcclxuXHRpZiAodGFncyAmJiB0YWdzLmxlbmd0aCkge1xyXG5cdFx0cmVzdWx0ID0gcmVzdWx0LmZpbHRlcihmdW5jdGlvbihjYil7XHJcblx0XHRcdHJldHVybiBoYXNUYWdzKGNiLCB0YWdzKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgbGlzdGVuZXIsIGlmIGFueVxyXG4gKi9cclxubGlzdGVuZXJzLnJlbW92ZSA9IGZ1bmN0aW9uKHRhcmdldCwgZXZ0LCBjYiwgdGFncyl7XHJcblx0Ly9nZXQgY2FsbGJhY2tzIGZvciB0aGUgZXZ0XHJcblx0dmFyIGV2dENhbGxiYWNrcyA9IHRhcmdldFtjYlByb3BOYW1lXTtcclxuXHRpZiAoIWV2dENhbGxiYWNrcyB8fCAhZXZ0Q2FsbGJhY2tzW2V2dF0pIHJldHVybiBmYWxzZTtcclxuXHJcblx0dmFyIGNhbGxiYWNrcyA9IGV2dENhbGxiYWNrc1tldnRdO1xyXG5cclxuXHQvL2lmIHRhZ3MgYXJlIHBhc3NlZCAtIG1ha2Ugc3VyZSBjYWxsYmFjayBoYXMgc29tZSB0YWdzIGJlZm9yZSByZW1vdmluZ1xyXG5cdGlmICh0YWdzICYmIHRhZ3MubGVuZ3RoICYmICFoYXNUYWdzKGNiLCB0YWdzKSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHQvL3JlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdC8vb25jZSBtZXRob2QgaGFzIG9yaWdpbmFsIGNhbGxiYWNrIGluIC5jYlxyXG5cdFx0aWYgKGNhbGxiYWNrc1tpXSA9PT0gY2IgfHwgY2FsbGJhY2tzW2ldLmZuID09PSBjYikge1xyXG5cdFx0XHRjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIEFkZCBhIG5ldyBsaXN0ZW5lclxyXG4gKi9cclxubGlzdGVuZXJzLmFkZCA9IGZ1bmN0aW9uKHRhcmdldCwgZXZ0LCBjYiwgdGFncyl7XHJcblx0aWYgKCFjYikgcmV0dXJuO1xyXG5cclxuXHR2YXIgdGFyZ2V0Q2FsbGJhY2tzID0gdGFyZ2V0W2NiUHJvcE5hbWVdO1xyXG5cclxuXHQvL2Vuc3VyZSBzZXQgb2YgY2FsbGJhY2tzIGZvciB0aGUgdGFyZ2V0IGV4aXN0c1xyXG5cdGlmICghdGFyZ2V0Q2FsbGJhY2tzKSB7XHJcblx0XHR0YXJnZXRDYWxsYmFja3MgPSB7fTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGNiUHJvcE5hbWUsIHtcclxuXHRcdFx0dmFsdWU6IHRhcmdldENhbGxiYWNrc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvL3NhdmUgYSBuZXcgY2FsbGJhY2tcclxuXHQodGFyZ2V0Q2FsbGJhY2tzW2V2dF0gPSB0YXJnZXRDYWxsYmFja3NbZXZ0XSB8fCBbXSkucHVzaChjYik7XHJcblxyXG5cdC8vc2F2ZSBucyBmb3IgYSBjYWxsYmFjaywgaWYgYW55XHJcblx0aWYgKHRhZ3MgJiYgdGFncy5sZW5ndGgpIHtcclxuXHRcdGNiLl9ucyA9IHRhZ3M7XHJcblx0fVxyXG59O1xyXG5cclxuXHJcbi8qKiBEZXRlY3Qgd2hldGhlciBhbiBjYiBoYXMgYXQgbGVhc3Qgb25lIHRhZyBmcm9tIHRoZSBsaXN0ICovXHJcbmZ1bmN0aW9uIGhhc1RhZ3MoY2IsIHRhZ3Mpe1xyXG5cdGlmIChjYi5fbnMpIHtcclxuXHRcdC8vaWYgY2IgaXMgdGFnZ2VkIHdpdGggYSBucyBhbmQgaW5jbHVkZXMgb25lIG9mIHRoZSBucyBwYXNzZWQgLSBrZWVwIGl0XHJcblx0XHRmb3IgKHZhciBpID0gdGFncy5sZW5ndGg7IGktLTspe1xyXG5cdFx0XHRpZiAoY2IuX25zLmluZGV4T2YodGFnc1tpXSkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsaXN0ZW5lcnM7IiwiLyoqXHJcbiAqIEBtb2R1bGUgSWNpY2xlXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRmcmVlemU6IGxvY2ssXHJcblx0dW5mcmVlemU6IHVubG9jayxcclxuXHRpc0Zyb3plbjogaXNMb2NrZWRcclxufTtcclxuXHJcblxyXG4vKiogU2V0IG9mIHRhcmdldHMgICovXHJcbnZhciBsb2NrQ2FjaGUgPSBuZXcgV2Vha01hcDtcclxuXHJcblxyXG4vKipcclxuICogU2V0IGZsYWcgb24gdGFyZ2V0IHdpdGggdGhlIG5hbWUgcGFzc2VkXHJcbiAqXHJcbiAqIEByZXR1cm4ge2Jvb2x9IFdoZXRoZXIgbG9jayBzdWNjZWVkZWRcclxuICovXHJcbmZ1bmN0aW9uIGxvY2sodGFyZ2V0LCBuYW1lKXtcclxuXHR2YXIgbG9ja3MgPSBsb2NrQ2FjaGUuZ2V0KHRhcmdldCk7XHJcblx0aWYgKGxvY2tzICYmIGxvY2tzW25hbWVdKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdC8vY3JlYXRlIGxvY2sgc2V0IGZvciBhIHRhcmdldCwgaWYgbm9uZVxyXG5cdGlmICghbG9ja3MpIHtcclxuXHRcdGxvY2tzID0ge307XHJcblx0XHRsb2NrQ2FjaGUuc2V0KHRhcmdldCwgbG9ja3MpO1xyXG5cdH1cclxuXHJcblx0Ly9zZXQgYSBuZXcgbG9ja1xyXG5cdGxvY2tzW25hbWVdID0gdHJ1ZTtcclxuXHJcblx0Ly9yZXR1cm4gc3VjY2Vzc1xyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFVuc2V0IGZsYWcgb24gdGhlIHRhcmdldCB3aXRoIHRoZSBuYW1lIHBhc3NlZC5cclxuICpcclxuICogTm90ZSB0aGF0IGlmIHRvIHJldHVybiBuZXcgdmFsdWUgZnJvbSB0aGUgbG9jay91bmxvY2ssXHJcbiAqIHRoZW4gdW5sb2NrIHdpbGwgYWx3YXlzIHJldHVybiBmYWxzZSBhbmQgbG9jayB3aWxsIGFsd2F5cyByZXR1cm4gdHJ1ZSxcclxuICogd2hpY2ggaXMgdXNlbGVzcyBmb3IgdGhlIHVzZXIsIHRob3VnaCBtYXliZSBpbnR1aXRpdmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdGFyZ2V0IEFueSBvYmplY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBmbGFnIG5hbWVcclxuICpcclxuICogQHJldHVybiB7Ym9vbH0gV2hldGhlciB1bmxvY2sgZmFpbGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gdW5sb2NrKHRhcmdldCwgbmFtZSl7XHJcblx0dmFyIGxvY2tzID0gbG9ja0NhY2hlLmdldCh0YXJnZXQpO1xyXG5cdGlmICghbG9ja3MgfHwgIWxvY2tzW25hbWVdKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGxvY2tzW25hbWVdID0gbnVsbDtcclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUmV0dXJuIHdoZXRoZXIgZmxhZyBpcyBzZXRcclxuICpcclxuICogQHBhcmFtIHsqfSB0YXJnZXQgQW55IG9iamVjdCB0byBhc3NvY2lhdGUgbG9jayB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgZmxhZyBuYW1lXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgbG9ja2VkIG9yIG5vdFxyXG4gKi9cclxuZnVuY3Rpb24gaXNMb2NrZWQodGFyZ2V0LCBuYW1lKXtcclxuXHR2YXIgbG9ja3MgPSBsb2NrQ2FjaGUuZ2V0KHRhcmdldCk7XHJcblx0cmV0dXJuIChsb2NrcyAmJiBsb2Nrc1tuYW1lXSk7XHJcbn0iLCIvKipcclxuICogQG1vZHVsZSBlbW15L29mZlxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBvZmY7XHJcblxyXG52YXIgaWNpY2xlID0gcmVxdWlyZSgnaWNpY2xlJyk7XHJcbnZhciBzbGljZSA9IHJlcXVpcmUoJ3NsaWNlZCcpO1xyXG52YXIgbGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saXN0ZW5lcnMnKTtcclxuXHJcblxyXG4vKipcclxuICogUmVtb3ZlIGxpc3RlbmVyW3NdIGZyb20gdGhlIHRhcmdldFxyXG4gKlxyXG4gKiBAcGFyYW0ge1t0eXBlXX0gZXZ0IFtkZXNjcmlwdGlvbl1cclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gW2Rlc2NyaXB0aW9uXVxyXG4gKlxyXG4gKiBAcmV0dXJuIHtbdHlwZV19IFtkZXNjcmlwdGlvbl1cclxuICovXHJcbmZ1bmN0aW9uIG9mZih0YXJnZXQsIGV2dCwgZm4pIHtcclxuXHRpZiAoIXRhcmdldCkgcmV0dXJuIHRhcmdldDtcclxuXHJcblx0dmFyIGNhbGxiYWNrcywgaTtcclxuXHJcblx0Ly91bmJpbmQgYWxsIGxpc3RlbmVycyBpZiBubyBmbiBzcGVjaWZpZWRcclxuXHRpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0dmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDEpO1xyXG5cclxuXHRcdC8vdHJ5IHRvIHVzZSB0YXJnZXQgcmVtb3ZlQWxsIG1ldGhvZCwgaWYgYW55XHJcblx0XHR2YXIgYWxsT2ZmID0gdGFyZ2V0WydyZW1vdmVBbGwnXSB8fCB0YXJnZXRbJ3JlbW92ZUFsbExpc3RlbmVycyddO1xyXG5cclxuXHRcdC8vY2FsbCB0YXJnZXQgcmVtb3ZlQWxsXHJcblx0XHRpZiAoYWxsT2ZmKSB7XHJcblx0XHRcdGFsbE9mZi5hcHBseSh0YXJnZXQsIGFyZ3MpO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQvL3RoZW4gZm9yZ2V0IG93biBjYWxsYmFja3MsIGlmIGFueVxyXG5cclxuXHRcdC8vdW5iaW5kIGFsbCBldnRzXHJcblx0XHRpZiAoIWV2dCkge1xyXG5cdFx0XHRjYWxsYmFja3MgPSBsaXN0ZW5lcnModGFyZ2V0KTtcclxuXHRcdFx0Zm9yIChldnQgaW4gY2FsbGJhY2tzKSB7XHJcblx0XHRcdFx0b2ZmKHRhcmdldCwgZXZ0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly91bmJpbmQgYWxsIGNhbGxiYWNrcyBmb3IgYW4gZXZ0XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Ly9pbnZva2UgbWV0aG9kIGZvciBlYWNoIHNwYWNlLXNlcGFyYXRlZCBldmVudCBmcm9tIGEgbGlzdFxyXG5cdFx0XHRldnQuc3BsaXQoL1xccysvKS5mb3JFYWNoKGZ1bmN0aW9uIChldnQpIHtcclxuXHRcdFx0XHR2YXIgZXZ0UGFydHMgPSBldnQuc3BsaXQoJy4nKTtcclxuXHRcdFx0XHRldnQgPSBldnRQYXJ0cy5zaGlmdCgpO1xyXG5cdFx0XHRcdGNhbGxiYWNrcyA9IGxpc3RlbmVycyh0YXJnZXQsIGV2dCwgZXZ0UGFydHMpO1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSBjYWxsYmFja3MubGVuZ3RoOyBpLS07KSB7XHJcblx0XHRcdFx0XHRvZmYodGFyZ2V0LCBldnQsIGNhbGxiYWNrc1tpXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGFyZ2V0O1xyXG5cdH1cclxuXHJcblxyXG5cdC8vdGFyZ2V0IGV2ZW50cyAoc3RyaW5nIG5vdGF0aW9uIHRvIGFkdmFuY2VkX29wdGltaXphdGlvbnMpXHJcblx0dmFyIG9mZk1ldGhvZCA9IHRhcmdldFsncmVtb3ZlRXZlbnRMaXN0ZW5lciddIHx8IHRhcmdldFsncmVtb3ZlTGlzdGVuZXInXSB8fCB0YXJnZXRbJ2RldGFjaEV2ZW50J10gfHwgdGFyZ2V0WydvZmYnXTtcclxuXHJcblx0Ly9pbnZva2UgbWV0aG9kIGZvciBlYWNoIHNwYWNlLXNlcGFyYXRlZCBldmVudCBmcm9tIGEgbGlzdFxyXG5cdGV2dC5zcGxpdCgvXFxzKy8pLmZvckVhY2goZnVuY3Rpb24gKGV2dCkge1xyXG5cdFx0dmFyIGV2dFBhcnRzID0gZXZ0LnNwbGl0KCcuJyk7XHJcblx0XHRldnQgPSBldnRQYXJ0cy5zaGlmdCgpO1xyXG5cclxuXHRcdC8vdXNlIHRhcmdldCBgb2ZmYCwgaWYgcG9zc2libGVcclxuXHRcdGlmIChvZmZNZXRob2QpIHtcclxuXHRcdFx0Ly9hdm9pZCBzZWxmLXJlY3Vyc2lvbiBmcm9tIHRoZSBvdXRzaWRlXHJcblx0XHRcdGlmIChpY2ljbGUuZnJlZXplKHRhcmdldCwgJ29mZicgKyBldnQpKSB7XHJcblx0XHRcdFx0b2ZmTWV0aG9kLmNhbGwodGFyZ2V0LCBldnQsIGZuKTtcclxuXHRcdFx0XHRpY2ljbGUudW5mcmVlemUodGFyZ2V0LCAnb2ZmJyArIGV2dCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vaWYgaXTigJlzIGZyb3plbiAtIGlnbm9yZSBjYWxsXHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiB0YXJnZXQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZm4uY2xvc2VkQ2FsbCkgZm4uY2xvc2VkQ2FsbCA9IGZhbHNlO1xyXG5cclxuXHRcdC8vZm9yZ2V0IGNhbGxiYWNrXHJcblx0XHRsaXN0ZW5lcnMucmVtb3ZlKHRhcmdldCwgZXZ0LCBmbiwgZXZ0UGFydHMpO1xyXG5cdH0pO1xyXG5cclxuXHJcblx0cmV0dXJuIHRhcmdldDtcclxufSIsIi8qKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZVxuICpcbiAqIEB0b2RvICB0by1zb3VyY2UgbWV0aG9kLCBwcmVwYXJpbmcgdGhlIGNvZGUgZm9yIHdlYndvcmtlclxuICogQHRvZG8gIGltcGxlbWVudCBhbGwgc2lkZSBzcGFjZXMgZnJvbSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NhdGVnb3J5OkNvbG9yX3NwYWNlIHl1diwgeWlxIGV0Yy5cbiAqIEB0b2RvICBoZXJlIGFyZSBhZGRpdGlvbmFsIHNwYWNlcyBodHRwOi8vd3d3LmplbnRyb25pY3MuY29tL2NvbG9yLmh0bWwgSVRVLCBSRUM3MDksIFNNVFBFLCBOVFNDLCBHUkVZXG4gKlxuICogQHRvZG8gaW1wbGVtZW50IGFzbS1qcyB3YXkgdG8gY29udmVydCBzcGFjZXMgKHByb21pc2VzIHRvIGJlIHRpbWVzIGZhc3RlcilcbiAqXG4gKi9cblxudmFyIGFkZENvbnZlcnRvciA9IHJlcXVpcmUoJy4vdXRpbC9hZGQtY29udmVydG9yJyk7XG5cblxuLyoqIEV4cG9ydGVkIHNwYWNlcyAqL1xudmFyIHNwYWNlcyA9IHtcblx0cmdiOiByZXF1aXJlKCcuL3JnYicpLFxuXHRoc2w6IHJlcXVpcmUoJy4vaHNsJyksXG5cdGhzdjogcmVxdWlyZSgnLi9oc3YnKSxcblx0aHdiOiByZXF1aXJlKCcuL2h3YicpLFxuXHRjbXlrOiByZXF1aXJlKCcuL2NteWsnKSxcblx0eHl6OiByZXF1aXJlKCcuL3h5eicpLFxuXHRsYWI6IHJlcXVpcmUoJy4vbGFiJyksXG5cdGxjaGFiOiByZXF1aXJlKCcuL2xjaGFiJyksXG5cdGx1djogcmVxdWlyZSgnLi9sdXYnKSxcblx0bGNodXY6IHJlcXVpcmUoJy4vbGNodXYnKSxcblx0aHVzbDogcmVxdWlyZSgnLi9odXNsJyksXG5cdGh1c2xwOiByZXF1aXJlKCcuL2h1c2xwJylcbn07XG5cblxuXG4vL2J1aWxkIGFic2VudCBjb252ZXJ0b3JzIGZyb20gZWFjaCB0byBldmVyeSBzcGFjZVxudmFyIGZyb21TcGFjZSwgdG9TcGFjZTtcbmZvciAodmFyIGZyb21TcGFjZU5hbWUgaW4gc3BhY2VzKSB7XG5cdGZyb21TcGFjZSA9IHNwYWNlc1tmcm9tU3BhY2VOYW1lXTtcblx0Zm9yICh2YXIgdG9TcGFjZU5hbWUgaW4gc3BhY2VzKSB7XG5cdFx0aWYgKHRvU3BhY2VOYW1lICE9PSBmcm9tU3BhY2VOYW1lKSB7XG5cdFx0XHR0b1NwYWNlID0gc3BhY2VzW3RvU3BhY2VOYW1lXTtcblx0XHRcdGFkZENvbnZlcnRvcihmcm9tU3BhY2UsIHRvU3BhY2UpO1xuXHRcdH1cblx0fVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gc3BhY2VzOyIsIi8qKlxuICogQmFyZWJvbmVzIGNvbG9yIGNsYXNzLlxuICpcbiAqIEBtb2R1bGUgY29sb3JcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG9yO1xuXG5cbnZhciBwYXJzZSA9IHJlcXVpcmUoJ2NvbG9yLXBhcnNlJyk7XG52YXIgc3RyaW5naWZ5ID0gcmVxdWlyZSgnY29sb3Itc3RyaW5naWZ5Jyk7XG52YXIgbWFuaXB1bGF0ZSA9IHJlcXVpcmUoJ2NvbG9yLW1hbmlwdWxhdGUnKTtcbnZhciBtZWFzdXJlID0gcmVxdWlyZSgnY29sb3ItbWVhc3VyZScpO1xudmFyIHNwYWNlcyA9IHJlcXVpcmUoJ2NvbG9yLXNwYWNlJyk7XG52YXIgc2xpY2UgPSByZXF1aXJlKCdzbGljZWQnKTtcbnZhciBwYWQgPSByZXF1aXJlKCdsZWZ0LXBhZCcpO1xudmFyIGlzU3RyaW5nID0gcmVxdWlyZSgnbXV0eXBlL2lzLXN0cmluZycpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnbXV0eXBlL2lzLW9iamVjdCcpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdtdXR5cGUvaXMtYXJyYXknKTtcbnZhciBpc051bWJlciA9IHJlcXVpcmUoJ211dHlwZS9pcy1udW1iZXInKTtcbnZhciBsb29wID0gcmVxdWlyZSgnbXVtYXRoL2xvb3AnKTtcbnZhciByb3VuZCA9IHJlcXVpcmUoJ211bWF0aC9yb3VuZCcpO1xudmFyIGJldHdlZW4gPSByZXF1aXJlKCdtdW1hdGgvYmV0d2VlbicpO1xuXG5cblxuLyoqXG4gKiBDb2xvciBjbGFzcy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBDb2xvciAoYXJnLCBzcGFjZSkge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29sb3IpKSB7XG5cdFx0cmV0dXJuIG5ldyBDb2xvcihhcmcpO1xuXHR9XG5cblx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdC8vaW5pdCBtb2RlbFxuXHRzZWxmLl92YWx1ZXMgPSBbMCwwLDBdO1xuXHRzZWxmLl9zcGFjZSA9ICdyZ2InO1xuXHRzZWxmLl9hbHBoYSA9IDE7XG5cblx0Ly8ga2VlcCB4eXogdmFsdWVzIHRvIHByZXNlcnZlIHF1YWxpdHlcblx0c2VsZi5feHl6ID0gWzAsMCwwXTtcblxuXHQvL3BhcnNlIGFyZ3VtZW50XG5cdHNlbGYucGFyc2UoYXJnLCBzcGFjZSk7XG59XG5cblxuLyoqIFN0YXRpYyBwYXJzZXIvc3RyaW5naWZpZXIgKi9cbkNvbG9yLnBhcnNlID0gZnVuY3Rpb24gKGNzdHIpIHtcblx0cmV0dXJuIG5ldyBDb2xvcihjc3RyKTtcbn07XG5cbkNvbG9yLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChjb2xvciwgc3BhY2UpIHtcblx0cmV0dXJuIGNvbG9yLnRvU3RyaW5nKHNwYWNlKTtcbn07XG5cblxuXG4vKiogQVBJICovXG52YXIgcHJvdG8gPSBDb2xvci5wcm90b3R5cGU7XG5cblxuLyoqIFVuaXZlcnNhbCBzZXR0ZXIsIGRldGVjdGluZyB0aGUgdHlwZSBvZiBhcmd1bWVudCAqL1xucHJvdG8ucGFyc2UgPSBmdW5jdGlvbiAoYXJnLCBzcGFjZSkge1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0aWYgKCFhcmcpIHtcblx0XHRyZXR1cm4gc2VsZjtcblx0fVxuXG5cdC8vWzAsMCwwXVxuXHRlbHNlIGlmIChpc0FycmF5KGFyZykpIHtcblx0XHRzZWxmLmZyb21BcnJheShhcmcsIHNwYWNlKTtcblx0fVxuXHRlbHNlIGlmIChpc051bWJlcihhcmcpKSB7XG5cdFx0Ly8xMiwgMjUsIDQ3IFssIHNwYWNlXVxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuXHRcdFx0dmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMpO1xuXHRcdFx0aWYgKGlzU3RyaW5nKGFyZ3NbYXJncy5sZW5ndGggLSAxXSkpIHtcblx0XHRcdFx0c3BhY2UgPSBhcmdzLnBvcCgpO1xuXHRcdFx0fVxuXHRcdFx0c2VsZi5wYXJzZShhcmdzLCBzcGFjZSk7XG5cdFx0fVxuXHRcdC8vMTIzNDQ1IFssIHNwYWNlXVxuXHRcdGVsc2Uge1xuXHRcdFx0c2VsZi5mcm9tTnVtYmVyKGFyZywgc3BhY2UpO1xuXHRcdH1cblx0fVxuXHQvLydyZ2IoMCwwLDApJ1xuXHRlbHNlIGlmIChpc1N0cmluZyhhcmcpKSB7XG5cdFx0c2VsZi5mcm9tU3RyaW5nKGFyZywgc3BhY2UpO1xuXHR9XG5cdC8vQ29sb3IgaW5zdGFuY2Vcblx0ZWxzZSBpZiAoYXJnIGluc3RhbmNlb2YgQ29sb3IpIHtcblx0XHRzZWxmLmZyb21BcnJheShhcmcuX3ZhbHVlcywgYXJnLl9zcGFjZSk7XG5cdH1cblx0Ly97cjowLCBnOjAsIGI6MH1cblx0ZWxzZSBpZiAoaXNPYmplY3QoYXJnKSkge1xuXHRcdHNlbGYuZnJvbUpTT04oYXJnLCBzcGFjZSk7XG5cdH1cblxuXHRyZXR1cm4gc2VsZjtcbn07XG5cblxuLyoqIFN0cmluZyBwYXJzZXIvc3RyaW5naWZpZXIgKi9cbnByb3RvLmZyb21TdHJpbmcgPSBmdW5jdGlvbiAoY3N0cikge1xuXHR2YXIgcmVzID0gcGFyc2UoY3N0cik7XG5cdHRoaXMuc2V0VmFsdWVzKHJlcy52YWx1ZXMsIHJlcy5zcGFjZSk7XG5cdHRoaXMuYWxwaGEocmVzLmFscGhhKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICh0eXBlKSB7XG5cdHR5cGUgPSB0eXBlIHx8IHRoaXMuZ2V0U3BhY2UoKTtcblx0dmFyIHZhbHVlcyA9IHRoaXMudG9BcnJheShzcGFjZXNbdHlwZV0gPyB0eXBlIDogJ3JnYicpO1xuXHR2YWx1ZXMgPSByb3VuZCh2YWx1ZXMpO1xuXHRpZiAodGhpcy5fYWxwaGEgPCAxKSB7XG5cdFx0dmFsdWVzLnB1c2godGhpcy5hbHBoYSgpKTtcblx0fVxuXHRyZXR1cm4gc3RyaW5naWZ5KHZhbHVlcywgdHlwZSk7XG59O1xuXG5cbi8qKiBBcnJheSBzZXR0ZXIvZ2V0dGVyICovXG5wcm90by5mcm9tQXJyYXkgPSBmdW5jdGlvbiAodmFsdWVzLCBzcGFjZU5hbWUpIHtcblx0aWYgKCFzcGFjZU5hbWUgfHwgIXNwYWNlc1tzcGFjZU5hbWVdKSB7XG5cdFx0c3BhY2VOYW1lID0gdGhpcy5fc3BhY2U7XG5cdH1cblxuXHR0aGlzLl9zcGFjZSA9IHNwYWNlTmFtZTtcblxuXHR2YXIgc3BhY2UgPSBzcGFjZXNbc3BhY2VOYW1lXTtcblxuXHQvL2dldCBhbHBoYVxuXHRpZiAodmFsdWVzLmxlbmd0aCA+IHNwYWNlLmNoYW5uZWwubGVuZ3RoKSB7XG5cdFx0dGhpcy5hbHBoYSh2YWx1ZXNbc3BhY2UuY2hhbm5lbC5sZW5ndGhdKTtcblx0XHR2YWx1ZXMgPSBzbGljZSh2YWx1ZXMsIDAsIHNwYWNlLmNoYW5uZWwubGVuZ3RoKTtcblx0fVxuXG5cdC8vd2FsayBieSB2YWx1ZXMgbGlzdCwgY2FwIHRoZW1cblx0dGhpcy5fdmFsdWVzID0gdmFsdWVzLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcblx0XHRyZXR1cm4gY2FwKHZhbHVlLCBzcGFjZS5uYW1lLCBpKTtcblx0fSk7XG5cblx0Ly91cGRhdGUgcmF3IHh5eiBjYWNoZVxuXHR0aGlzLl94eXogPSBzcGFjZXNbc3BhY2VOYW1lXS54eXoodGhpcy5fdmFsdWVzKTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLnRvQXJyYXkgPSBmdW5jdGlvbiAoc3BhY2UpIHtcblx0dmFyIHZhbHVlcztcblxuXHRpZiAoIXNwYWNlKSB7XG5cdFx0c3BhY2UgPSB0aGlzLl9zcGFjZTtcblx0fVxuXG5cdC8vY29udmVydCB2YWx1ZXMgdG8gYSB0YXJnZXQgc3BhY2Vcblx0aWYgKHNwYWNlICE9PSB0aGlzLl9zcGFjZSkge1xuXHRcdC8vZW5oYW5jZSBjYWxjIHByZWNpc2lvbiwgbGlrZSBoc2wg4oaQ4oaSIGhzdiDihpDihpIgaHdiIG9yIGxhYiDihpDihpIgbGNoIOKGkOKGkiBsdXZcblx0XHRpZiAodGhpcy5fc3BhY2VbMF0gPT09IHNwYWNlWzBdKSB7XG5cdFx0XHR2YWx1ZXMgPSBzcGFjZXNbdGhpcy5fc3BhY2VdW3NwYWNlXSh0aGlzLl92YWx1ZXMpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHZhbHVlcyA9IHNwYWNlcy54eXpbc3BhY2VdKHRoaXMuX3h5eik7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHZhbHVlcyA9IHRoaXMuX3ZhbHVlcztcblx0fVxuXG5cdHZhbHVlcyA9IHZhbHVlcy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG5cdFx0cmV0dXJuIHJvdW5kKHZhbHVlLCBzcGFjZXNbc3BhY2VdLnByZWNpc2lvbltpXSk7XG5cdH0pO1xuXG5cdHJldHVybiB2YWx1ZXM7XG59O1xuXG5cbi8qKiBKU09OIHNldHRlci9nZXR0ZXIgKi9cbnByb3RvLmZyb21KU09OID0gZnVuY3Rpb24gKG9iaiwgc3BhY2VOYW1lKSB7XG5cdHZhciBzcGFjZTtcblxuXHRpZiAoc3BhY2VOYW1lKSB7XG5cdFx0c3BhY2UgPSBzcGFjZXNbc3BhY2VOYW1lXTtcblx0fVxuXG5cdC8vZmluZCBzcGFjZSBieSB0aGUgbW9zdCBjaGFubmVsIG1hdGNoXG5cdGlmICghc3BhY2UpIHtcblx0XHR2YXIgbWF4Q2hhbm5lbHNNYXRjaGVkID0gMCwgY2hhbm5lbHNNYXRjaGVkID0gMDtcblx0XHRPYmplY3Qua2V5cyhzcGFjZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0Y2hhbm5lbHNNYXRjaGVkID0gc3BhY2VzW2tleV0uY2hhbm5lbC5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnIpIHtcblx0XHRcdFx0aWYgKG9ialtjdXJyXSAhPT0gdW5kZWZpbmVkIHx8IG9ialtjaChjdXJyKV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBwcmV2KzE7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByZXY7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDApO1xuXG5cdFx0XHRpZiAoY2hhbm5lbHNNYXRjaGVkID4gbWF4Q2hhbm5lbHNNYXRjaGVkKSB7XG5cdFx0XHRcdG1heENoYW5uZWxzTWF0Y2hlZCA9IGNoYW5uZWxzTWF0Y2hlZDtcblx0XHRcdFx0c3BhY2UgPSBzcGFjZXNba2V5XTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGNoYW5uZWxzTWF0Y2hlZCA+PSAzKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vaWYgbm8gc3BhY2UgZm9yIGEgSlNPTiBmb3VuZFxuXHRpZiAoIXNwYWNlKSB7XG5cdFx0dGhyb3cgRXJyb3IoJ0Nhbm5vdCBkZXRlY3Qgc3BhY2UuJyk7XG5cdH1cblxuXHQvL2ZvciB0aGUgc3BhY2UgZm91bmQgc2V0IHZhbHVlc1xuXHR0aGlzLmZyb21BcnJheShzcGFjZS5jaGFubmVsLm1hcChmdW5jdGlvbiAoY2hhbm5lbCkge1xuXHRcdHJldHVybiBvYmpbY2hhbm5lbF0gIT09IHVuZGVmaW5lZCA/IG9ialtjaGFubmVsXSA6IG9ialtjaChjaGFubmVsKV07XG5cdH0pLCBzcGFjZS5uYW1lKTtcblxuXHR2YXIgYWxwaGEgPSBvYmouYSAhPT0gdW5kZWZpbmVkID8gb2JqLmEgOiBvYmouYWxwaGE7XG5cdGlmIChhbHBoYSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dGhpcy5hbHBoYShhbHBoYSk7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLnRvSlNPTiA9IGZ1bmN0aW9uIChzcGFjZU5hbWUpIHtcblx0dmFyIHNwYWNlID0gc3BhY2VzW3NwYWNlTmFtZSB8fCB0aGlzLl9zcGFjZV07XG5cblx0dmFyIHJlc3VsdCA9IHt9O1xuXG5cdHZhciB2YWx1ZXMgPSB0aGlzLnRvQXJyYXkoc3BhY2UubmFtZSk7XG5cblx0Ly9nbyBieSBjaGFubmVscywgY3JlYXRlIHByb3BlcnRpZXNcblx0c3BhY2UuY2hhbm5lbC5mb3JFYWNoKGZ1bmN0aW9uIChjaGFubmVsLCBpKSB7XG5cdFx0cmVzdWx0W2NoKGNoYW5uZWwpXSA9IHZhbHVlc1tpXTtcblx0fSk7XG5cblx0aWYgKHRoaXMuX2FscGhhIDwgMSkge1xuXHRcdHJlc3VsdC5hID0gdGhpcy5fYWxwaGE7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuXG4vKiogSEVYIG51bWJlciBnZXR0ZXIvc2V0dGVyICovXG5wcm90by5mcm9tTnVtYmVyID0gZnVuY3Rpb24gKHZhbCwgc3BhY2UpIHtcblx0dmFyIHZhbHVlcyA9IHBhZCh2YWwudG9TdHJpbmcoMTYpLCA2LCAwKS5zcGxpdCgvKC4uKS8pLmZpbHRlcihCb29sZWFuKTtcblx0cmV0dXJuIHRoaXMuZnJvbUFycmF5KHZhbHVlcywgc3BhY2UpO1xufTtcblxucHJvdG8udG9OdW1iZXIgPSBmdW5jdGlvbiAoc3BhY2UpIHtcblx0dmFyIHZhbHVlcyA9IHRoaXMudG9BcnJheShzcGFjZSk7XG5cdHJldHVybiAodmFsdWVzWzBdIDw8IDE2KSB8ICh2YWx1ZXNbMV0gPDwgOCkgfCB2YWx1ZXNbMl07XG59O1xuXG5cbi8qKlxuICogQ3VycmVudCBzcGFjZSB2YWx1ZXNcbiAqL1xucHJvdG8udmFsdWVzID0gZnVuY3Rpb24gKCkge1xuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiB0aGlzLnNldFZhbHVlcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9XG5cdHJldHVybiB0aGlzLmdldFZhbHVlcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdmFsdWVzIGFycmF5IGZvciBhIHBhc3NlZCBzcGFjZVxuICogT3IgZm9yIGN1cnJlbnQgc3BhY2VcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3BhY2UgQSBzcGFjZSB0byBjYWxjdWxhdGUgdmFsdWVzIGZvclxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBMaXN0IG9mIHZhbHVlc1xuICovXG5wcm90by5nZXRWYWx1ZXMgPSBmdW5jdGlvbiAoc3BhY2UpIHtcblx0cmV0dXJuIHRoaXMudG9BcnJheShzcGFjZSk7XG59O1xuXG4vKipcbiAqIFNldCB2YWx1ZXMgZm9yIGEgc3BhY2UgcGFzc2VkXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIExpc3Qgb2YgdmFsdWVzIHRvIHNldFxuICogQHBhcmFtIHtzdHJpbmd9IHNwYWNlTmFtZSBTcGFjZSBpbmRpY2F0b3JcbiAqL1xucHJvdG8uc2V0VmFsdWVzID0gcHJvdG8ucGFyc2U7XG5cblxuLyoqXG4gKiBDdXJyZW50IHNwYWNlXG4gKi9cbnByb3RvLnNwYWNlID0gZnVuY3Rpb24gKCkge1xuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiB0aGlzLnNldFNwYWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH1cblx0cmV0dXJuIHRoaXMuZ2V0U3BhY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbi8qKiBSZXR1cm4gY3VycmVudCBzcGFjZSAqL1xucHJvdG8uZ2V0U3BhY2UgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLl9zcGFjZTtcbn07XG5cbi8qKiBTd2l0Y2ggdG8gYSBuZXcgc3BhY2Ugd2l0aCBvcHRpb25hbCBuZXcgdmFsdWVzICovXG5wcm90by5zZXRTcGFjZSA9IGZ1bmN0aW9uIChzcGFjZSwgdmFsdWVzKSB7XG5cdGlmICghc3BhY2UgfHwgIXNwYWNlc1tzcGFjZV0pIHtcblx0XHR0aHJvdyBFcnJvcignQ2Fubm90IHNldCBzcGFjZSAnICsgc3BhY2UpO1xuXHR9XG5cblx0aWYgKHNwYWNlID09PSB0aGlzLl9zcGFjZSkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0aWYgKHZhbHVlcykge1xuXHRcdHJldHVybiB0aGlzLnNldFZhbHVlcyh2YWx1ZXMsIHNwYWNlKTtcblx0fVxuXG5cdC8vanVzdCBjb252ZXJ0IGN1cnJlbnQgdmFsdWVzIHRvIGEgbmV3IHNwYWNlXG5cdHRoaXMuX3ZhbHVlcyA9IHNwYWNlcy54eXpbc3BhY2VdKHRoaXMuX3h5eik7XG5cdHRoaXMuX3NwYWNlID0gc3BhY2U7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKiBDaGFubmVsIGdldHRlci9zZXR0ZXIgKi9cbnByb3RvLmNoYW5uZWwgPSBmdW5jdGlvbiAoKSB7XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuXHRcdHJldHVybiB0aGlzLnNldENoYW5uZWwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDaGFubmVsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdH1cbn07XG5cbi8qKiBHZXQgY2hhbm5lbCB2YWx1ZSAqL1xucHJvdG8uZ2V0Q2hhbm5lbCA9IGZ1bmN0aW9uIChzcGFjZSwgaWR4KSB7XG5cdHRoaXMuc2V0U3BhY2Uoc3BhY2UpO1xuXHRyZXR1cm4gdGhpcy5fdmFsdWVzW2lkeF07XG59O1xuXG4vKiogU2V0IGN1cnJlbnQgY2hhbm5lbCB2YWx1ZSAqL1xucHJvdG8uc2V0Q2hhbm5lbCA9IGZ1bmN0aW9uIChzcGFjZSwgaWR4LCB2YWx1ZSkge1xuXHR0aGlzLnNldFNwYWNlKHNwYWNlKTtcblx0dGhpcy5fdmFsdWVzW2lkeF0gPSBjYXAodmFsdWUsIHNwYWNlLCBpZHgpO1xuXHR0aGlzLl94eXogPSBzcGFjZXNbc3BhY2VdLnh5eih0aGlzLl92YWx1ZXMpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cblxuLyoqIERlZmluZSBuYW1lZCBzZXQgb2YgbWV0aG9kcyBmb3IgYSBzcGFjZSAqL1xucHJvdG8uZGVmaW5lU3BhY2UgPSBmdW5jdGlvbiAobmFtZSwgc3BhY2UpIHtcblx0Ly9jcmVhdGUgcHJlY2lzaW9uc1xuXHRzcGFjZS5wcmVjaXNpb24gPSBzcGFjZS5jaGFubmVsLm1hcChmdW5jdGlvbiAoY2gsIGlkeCkge1xuXHRcdHJldHVybiBNYXRoLmFicyhzcGFjZS5tYXhbaWR4XSAtIHNwYWNlLm1pbltpZHhdKSA+IDEgPyAxIDogMC4wMTtcblx0fSk7XG5cblx0Ly8gLnJnYigpXG5cdHByb3RvW25hbWVdID0gZnVuY3Rpb24gKHZhbHVlcykge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVzKHNsaWNlKGFyZ3VtZW50cyksIG5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVzKHZhbHVlcywgbmFtZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLnRvSlNPTihuYW1lKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gLnJnYlN0cmluZygpXG5cdHByb3RvW25hbWUgKyAnU3RyaW5nJ10gPSBmdW5jdGlvbiAoY3N0cikge1xuXHRcdGlmIChjc3RyKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5mcm9tU3RyaW5nKGNzdHIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy50b1N0cmluZyhuYW1lKTtcblx0fTtcblxuXHQvLyAucmdiQXJyYXkoKVxuXHRwcm90b1tuYW1lICsgJ0FycmF5J10gPSBmdW5jdGlvbiAodmFsdWVzKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLmZyb21BcnJheSh2YWx1ZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy50b0FycmF5KG5hbWUpO1xuXHR9O1xuXG5cdC8vIC5yZ2JhQXJyYXkoKSwgLmhzbGFBcnJheVxuXHRpZiAobmFtZSA9PT0gJ3JnYicgfHwgbmFtZSA9PT0gJ2hzbCcpIHtcblx0XHRwcm90b1tuYW1lICsgJ2FBcnJheSddID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIHJlcyA9IHRoaXNbbmFtZSArICdBcnJheSddLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRpZiAoaXNBcnJheShyZXMpKSB7XG5cdFx0XHRcdHJlcy5wdXNoKHRoaXMuYWxwaGEoKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cblxuXHQvLyAucmVkKCksIC5ncmVlbigpLCAuYmx1ZSgpXG5cdHNwYWNlLmNoYW5uZWwuZm9yRWFjaChmdW5jdGlvbiAoY25hbWUsIGNpZHgpIHtcblx0XHRpZiAocHJvdG9bY25hbWVdKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHByb3RvW2NuYW1lXSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChuYW1lLCBjaWR4LCB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHJvdW5kKHRoaXMuZ2V0Q2hhbm5lbChuYW1lLCBjaWR4KSwgc3BhY2UucHJlY2lzaW9uW2NpZHhdKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn07XG5cblxuLyoqXG4gKiBDcmVhdGUgcGVyLXNwYWNlIEFQSVxuICovXG5PYmplY3Qua2V5cyhzcGFjZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0cHJvdG8uZGVmaW5lU3BhY2UobmFtZSwgc3BhY2VzW25hbWVdKTtcbn0pO1xuXG5cbi8qKlxuICogQWxwaGEgZ2V0dGVyIC8gc2V0dGVyXG4gKi9cbnByb3RvLmFscGhhID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0dGhpcy5fYWxwaGEgPSBiZXR3ZWVuKHZhbHVlLCAwLCAxKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdGhpcy5fYWxwaGE7XG5cdH1cbn07XG5cblxuLyoqIEhleCBzdHJpbmcgcGFyc2VyIGlzIHRoZSBzYW1lIGFzIHNpbXBsZSBwYXJzZXIgKi9cbnByb3RvLmhleFN0cmluZyA9IGZ1bmN0aW9uIChzdHIpIHtcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gdGhpcy5mcm9tU3RyaW5nKHN0ciwgJ2hleCcpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCdoZXgnKS50b1VwcGVyQ2FzZSgpO1xuXHR9XG59O1xuXG4vKiogUGVyY2VudCBzdHJpbmcgZm9ybWF0dGVyICovXG5wcm90by5wZXJjZW50U3RyaW5nID0gZnVuY3Rpb24gKHN0cikge1xuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdHJldHVybiB0aGlzLmZyb21TdHJpbmcoc3RyLCAncGVyY2VudCcpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCdwZXJjZW50Jyk7XG5cdH1cbn07XG5cblxuLyoqIEtleXdvcmQgc2V0dGVyL2dldHRlciAqL1xucHJvdG8ua2V5d29yZCA9IGZ1bmN0aW9uIChzdHIpIHtcblx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gdGhpcy5mcm9tU3RyaW5nKHN0ciwgJ2tleXdvcmQnKTtcblx0fVxuXHRlbHNlIHtcblx0XHRyZXR1cm4gdGhpcy50b1N0cmluZygna2V5d29yZCcpO1xuXHR9XG59O1xuXG4vKiogQ2xvbmUgaW5zdGFuY2UgKi9cbnByb3RvLmNsb25lID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gKG5ldyBDb2xvcigpKS5mcm9tQXJyYXkodGhpcy5fdmFsdWVzLCB0aGlzLl9zcGFjZSk7XG59O1xuXG5cbi8qKlxuICogQ3JlYXRlIG1hbmlwdWxhdGlvbiBtZXRob2RzXG4gKi9cbk9iamVjdC5rZXlzKG1hbmlwdWxhdGUpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcblx0cHJvdG9bbmFtZV0gPSBmdW5jdGlvbiAoYSxiKSB7XG5cdFx0cmV0dXJuIG1hbmlwdWxhdGVbbmFtZV0odGhpcywgYSwgYik7XG5cdH07XG59KTtcblxuLyoqIFNvbWUgY29sb3IgY29tcGF0aWJpbGl0eSBiaW5kaW5ncyAqL1xucHJvdG8ucm90YXRlID0gcHJvdG8uc3BpbjtcbnByb3RvLm5lZ2F0ZSA9IHByb3RvLmludmVydDtcbnByb3RvLmdyZXlzY2FsZSA9IHByb3RvLmdyYXlzY2FsZTtcbnByb3RvLmNsZWFyZXIgPSBwcm90by5mYWRlb3V0O1xucHJvdG8ub3BhcXVlciA9IHByb3RvLmZhZGVpbjtcblxuXG4vKipcbiAqIENyZWF0ZSBtZWFzdXJlIG1ldGhvZHNcbiAqL1xuT2JqZWN0LmtleXMobWVhc3VyZSkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuXHRwcm90b1tuYW1lXSA9IGZ1bmN0aW9uIChhLCBiKSB7XG5cdFx0cmV0dXJuIG1lYXN1cmVbbmFtZV0odGhpcywgYSwgYik7XG5cdH07XG59KTtcblxuLyoqIFNvbWUgY29sb3IgY29tcGF0aWJpbGl0eSBiaW5kaW5ncyAqL1xucHJvdG8ubHVtaW5vc2l0eSA9IHByb3RvLmx1bWluYW5jZTtcbnByb3RvLmRhcmsgPSBwcm90by5pc0Rhcms7XG5wcm90by5saWdodCA9IHByb3RvLmlzTGlnaHQ7XG5cblxuLy9UT0RPOlxuLy9ncmF5XG4vL3RvRmlsdGVyXG4vL2lzVmFsaWRcbi8vZ2V0Rm9ybWF0XG4vL3JhbmRvbVxuLy9pZS1oZXgtc3RyKCRjb2xvcilcbi8vaXMob3RoZXJDb2xvcilcblxuXG4vKiogR2V0IHNob3J0IGNoYW5uZWwgbmFtZSAqL1xuZnVuY3Rpb24gY2ggKG5hbWUpIHtcblx0cmV0dXJuIG5hbWUgPT09ICdibGFjaycgPyAnaycgOiBuYW1lWzBdO1xufVxuXG4vKipcbiAqIENhcCBjaGFubmVsIHZhbHVlLlxuICogTm90ZSB0aGF0IGNhcCBzaG91bGQgbm90IHJvdW5kLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBBIHZhbHVlIHRvIHN0b3JlXG4gKiBAcGFyYW0ge3N0cmluZ30gc3BhY2VOYW1lIFNwYWNlIG5hbWUgdGFrZSBhcyBhIGJhc2lzXG4gKiBAcGFyYW0ge2ludH0gaWR4IENoYW5uZWwgaW5kZXhcbiAqXG4gKiBAcmV0dXJuIHtudW1iZXJ9IENhcHBlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBjYXAodmFsdWUsIHNwYWNlTmFtZSwgaWR4KSB7XG5cdHZhciBzcGFjZSA9IHNwYWNlc1tzcGFjZU5hbWVdO1xuXHRpZiAoc3BhY2UuY2hhbm5lbFtpZHhdID09PSAnaHVlJykge1xuXHRcdHJldHVybiBsb29wKHZhbHVlLCBzcGFjZS5taW5baWR4XSwgc3BhY2UubWF4W2lkeF0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBiZXR3ZWVuKHZhbHVlLCBzcGFjZS5taW5baWR4XSwgc3BhY2UubWF4W2lkeF0pO1xuXHR9XG59IiwiLyoqXHJcbiAqIEBtb2R1bGUgZW1teS9vbmNlXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IG9uY2U7XHJcblxyXG52YXIgaWNpY2xlID0gcmVxdWlyZSgnaWNpY2xlJyk7XHJcbnZhciBvbiA9IHJlcXVpcmUoJy4vb24nKTtcclxudmFyIG9mZiA9IHJlcXVpcmUoJy4vb2ZmJyk7XHJcblxyXG5cclxuLyoqXHJcbiAqIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBvbmNlIGFuZCB0aGVuIHJlbW92ZWQuXHJcbiAqXHJcbiAqIEByZXR1cm4ge3RhcmdldH1cclxuICovXHJcbmZ1bmN0aW9uIG9uY2UodGFyZ2V0LCBldnQsIGZuKXtcclxuXHRpZiAoIXRhcmdldCkgcmV0dXJuO1xyXG5cclxuXHQvL2dldCB0YXJnZXQgb25jZSBtZXRob2QsIGlmIGFueVxyXG5cdHZhciBvbmNlTWV0aG9kID0gdGFyZ2V0WydvbmNlJ10gfHwgdGFyZ2V0WydvbmUnXSB8fCB0YXJnZXRbJ2FkZE9uY2VFdmVudExpc3RlbmVyJ10gfHwgdGFyZ2V0WydhZGRPbmNlTGlzdGVuZXInXSwgY2I7XHJcblxyXG5cclxuXHQvL3VzZSBvd24gZXZlbnRzXHJcblx0Ly93cmFwIGNhbGxiYWNrIHRvIG9uY2UtY2FsbFxyXG5cdGNiID0gb25jZS53cmFwKHRhcmdldCwgZXZ0LCBmbiwgb2ZmKTtcclxuXHJcblxyXG5cdC8vaW52b2tlIG1ldGhvZCBmb3IgZWFjaCBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgZnJvbSBhIGxpc3RcclxuXHRldnQuc3BsaXQoL1xccysvKS5mb3JFYWNoKGZ1bmN0aW9uKGV2dCl7XHJcblx0XHQvL3VzZSB0YXJnZXQgZXZlbnQgc3lzdGVtLCBpZiBwb3NzaWJsZVxyXG5cdFx0aWYgKG9uY2VNZXRob2QpIHtcclxuXHRcdFx0Ly9hdm9pZCBzZWxmLXJlY3Vyc2lvbnNcclxuXHRcdFx0aWYgKGljaWNsZS5mcmVlemUodGFyZ2V0LCAnb25lJyArIGV2dCkpe1xyXG5cdFx0XHRcdHZhciByZXMgPSBvbmNlTWV0aG9kLmNhbGwodGFyZ2V0LCBldnQsIGZuKTtcclxuXHJcblx0XHRcdFx0Ly9GSVhNRTogc2F2ZSBjYWxsYmFjaywganVzdCBpbiBjYXNlIG9mIHJlbW92ZUxpc3RlbmVyXHJcblx0XHRcdFx0Ly8gbGlzdGVuZXJzLmFkZCh0YXJnZXQsIGV2dCwgZm4pO1xyXG5cdFx0XHRcdGljaWNsZS51bmZyZWV6ZSh0YXJnZXQsICdvbmUnICsgZXZ0KTtcclxuXHJcblx0XHRcdFx0cmV0dXJuIHJlcztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly9pZiBzdGlsbCBjYWxsZWQgaXRzZWxmIHNlY29uZCB0aW1lIC0gZG8gZGVmYXVsdCByb3V0aW5lXHJcblx0XHR9XHJcblxyXG5cdFx0Ly9iaW5kIHdyYXBwZXIgZGVmYXVsdCB3YXkgLSBpbiBjYXNlIG9mIG93biBlbWl0IG1ldGhvZFxyXG5cdFx0b24odGFyZ2V0LCBldnQsIGNiKTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGNiO1xyXG59XHJcblxyXG5cclxuLyoqIFJldHVybiBvbmNlIHdyYXBwZXIsIHdpdGggb3B0aW9uYWwgc3BlY2lhbCBvZmYgcGFzc2VkICovXHJcbm9uY2Uud3JhcCA9IGZ1bmN0aW9uICh0YXJnZXQsIGV2dCwgZm4sIG9mZikge1xyXG5cdHZhciBjYiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0b2ZmKHRhcmdldCwgZXZ0LCBjYik7XHJcblx0XHRmbi5hcHBseSh0YXJnZXQsIGFyZ3VtZW50cyk7XHJcblx0fTtcclxuXHJcblx0Y2IuZm4gPSBmbjtcclxuXHJcblx0cmV0dXJuIGNiO1xyXG59OyIsIi8qKlxuICogQG1vZHVsZSBlbW15L29uXG4gKi9cblxuXG52YXIgaWNpY2xlID0gcmVxdWlyZSgnaWNpY2xlJyk7XG52YXIgbGlzdGVuZXJzID0gcmVxdWlyZSgnLi9saXN0ZW5lcnMnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG9uO1xuXG5cbi8qKlxuICogQmluZCBmbiB0byBhIHRhcmdldC5cbiAqXG4gKiBAcGFyYW0geyp9IHRhcmd0ZSBBIHNpbmdsZSB0YXJnZXQgdG8gYmluZCBldnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBldnQgQW4gZXZlbnQgbmFtZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBjYWxsYmFja1xuICogQHBhcmFtIHtGdW5jdGlvbn0/IGNvbmRpdGlvbiBBbiBvcHRpb25hbCBmaWx0ZXJpbmcgZm4gZm9yIGEgY2FsbGJhY2tcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpY2ggYWNjZXB0cyBhbiBldmVudCBhbmQgcmV0dXJucyBjYWxsYmFja1xuICpcbiAqIEByZXR1cm4ge29iamVjdH0gQSB0YXJnZXRcbiAqL1xuZnVuY3Rpb24gb24odGFyZ2V0LCBldnQsIGZuKXtcblx0aWYgKCF0YXJnZXQpIHJldHVybiB0YXJnZXQ7XG5cblx0Ly9nZXQgdGFyZ2V0IGBvbmAgbWV0aG9kLCBpZiBhbnlcblx0Ly9wcmVmZXIgbmF0aXZlLWxpa2UgbWV0aG9kIG5hbWVcblx0Ly91c2VyIG1heSBvY2Nhc2lvbmFsbHkgZXhwb3NlIGBvbmAgdG8gdGhlIGdsb2JhbCwgaW4gY2FzZSBvZiBicm93c2VyaWZ5XG5cdC8vYnV0IGl0IGlzIHVubGlrZWx5IG9uZSB3b3VsZCByZXBsYWNlIG5hdGl2ZSBgYWRkRXZlbnRMaXN0ZW5lcmBcblx0dmFyIG9uTWV0aG9kID0gIHRhcmdldFsnYWRkRXZlbnRMaXN0ZW5lciddIHx8IHRhcmdldFsnYWRkTGlzdGVuZXInXSB8fCB0YXJnZXRbJ2F0dGFjaEV2ZW50J10gfHwgdGFyZ2V0WydvbiddO1xuXG5cdHZhciBjYiA9IGZuO1xuXG5cdC8vaW52b2tlIG1ldGhvZCBmb3IgZWFjaCBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgZnJvbSBhIGxpc3Rcblx0ZXZ0LnNwbGl0KC9cXHMrLykuZm9yRWFjaChmdW5jdGlvbihldnQpe1xuXHRcdHZhciBldnRQYXJ0cyA9IGV2dC5zcGxpdCgnLicpO1xuXHRcdGV2dCA9IGV2dFBhcnRzLnNoaWZ0KCk7XG5cblx0XHQvL3VzZSB0YXJnZXQgZXZlbnQgc3lzdGVtLCBpZiBwb3NzaWJsZVxuXHRcdGlmIChvbk1ldGhvZCkge1xuXHRcdFx0Ly9hdm9pZCBzZWxmLXJlY3Vyc2lvbnNcblx0XHRcdC8vaWYgaXTigJlzIGZyb3plbiAtIGlnbm9yZSBjYWxsXG5cdFx0XHRpZiAoaWNpY2xlLmZyZWV6ZSh0YXJnZXQsICdvbicgKyBldnQpKXtcblx0XHRcdFx0b25NZXRob2QuY2FsbCh0YXJnZXQsIGV2dCwgY2IpO1xuXHRcdFx0XHRpY2ljbGUudW5mcmVlemUodGFyZ2V0LCAnb24nICsgZXZ0KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vc2F2ZSB0aGUgY2FsbGJhY2sgYW55d2F5XG5cdFx0bGlzdGVuZXJzLmFkZCh0YXJnZXQsIGV2dCwgY2IsIGV2dFBhcnRzKTtcblx0fSk7XG5cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuXG4vKipcbiAqIFdyYXAgYW4gZm4gd2l0aCBjb25kaXRpb24gcGFzc2luZ1xuICovXG5vbi53cmFwID0gZnVuY3Rpb24odGFyZ2V0LCBldnQsIGZuLCBjb25kaXRpb24pe1xuXHR2YXIgY2IgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoY29uZGl0aW9uLmFwcGx5KHRhcmdldCwgYXJndW1lbnRzKSkge1xuXHRcdFx0cmV0dXJuIGZuLmFwcGx5KHRhcmdldCwgYXJndW1lbnRzKTtcblx0XHR9XG5cdH07XG5cblx0Y2IuZm4gPSBmbjtcblxuXHRyZXR1cm4gY2I7XG59OyIsInZhciBidW5kbGVGbiA9IGFyZ3VtZW50c1szXTtcbnZhciBzb3VyY2VzID0gYXJndW1lbnRzWzRdO1xudmFyIGNhY2hlID0gYXJndW1lbnRzWzVdO1xuXG52YXIgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgd2tleTtcbiAgICB2YXIgY2FjaGVLZXlzID0gT2JqZWN0LmtleXMoY2FjaGUpO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2FjaGVLZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICBpZiAoY2FjaGVba2V5XS5leHBvcnRzID09PSBmbikge1xuICAgICAgICAgICAgd2tleSA9IGtleTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmICghd2tleSkge1xuICAgICAgICB3a2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgICAgIHZhciB3Y2FjaGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICAgICAgd2NhY2hlW2tleV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlc1t3a2V5XSA9IFtcbiAgICAgICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZScsJ21vZHVsZScsJ2V4cG9ydHMnXSwgJygnICsgZm4gKyAnKShzZWxmKScpLFxuICAgICAgICAgICAgd2NhY2hlXG4gICAgICAgIF07XG4gICAgfVxuICAgIHZhciBza2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgXG4gICAgdmFyIHNjYWNoZSA9IHt9OyBzY2FjaGVbd2tleV0gPSB3a2V5O1xuICAgIHNvdXJjZXNbc2tleV0gPSBbXG4gICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZSddLCdyZXF1aXJlKCcgKyBzdHJpbmdpZnkod2tleSkgKyAnKShzZWxmKScpLFxuICAgICAgICBzY2FjaGVcbiAgICBdO1xuICAgIFxuICAgIHZhciBzcmMgPSAnKCcgKyBidW5kbGVGbiArICcpKHsnXG4gICAgICAgICsgT2JqZWN0LmtleXMoc291cmNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdpZnkoa2V5KSArICc6WydcbiAgICAgICAgICAgICAgICArIHNvdXJjZXNba2V5XVswXVxuICAgICAgICAgICAgICAgICsgJywnICsgc3RyaW5naWZ5KHNvdXJjZXNba2V5XVsxXSkgKyAnXSdcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSkuam9pbignLCcpXG4gICAgICAgICsgJ30se30sWycgKyBzdHJpbmdpZnkoc2tleSkgKyAnXSknXG4gICAgO1xuICAgIFxuICAgIHZhciBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwgfHwgd2luZG93Lm1velVSTCB8fCB3aW5kb3cubXNVUkw7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChcbiAgICAgICAgbmV3IEJsb2IoW3NyY10sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSlcbiAgICApKTtcbn07XG4iXX0=
