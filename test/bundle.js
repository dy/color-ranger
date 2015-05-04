require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./lchuv":9,"./xyz":15,"husl":11}],5:[function(require,module,exports){
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
},{"./lchuv":9,"./xyz":15,"husl":11}],6:[function(require,module,exports){
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
},{"./xyz":15}],8:[function(require,module,exports){
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
},{"./lab":7,"./xyz":15}],9:[function(require,module,exports){
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
},{"./luv":10,"./xyz":15}],10:[function(require,module,exports){
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
},{"./xyz":15}],11:[function(require,module,exports){
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

},{"../rgb":12,"../xyz":15}],14:[function(require,module,exports){
/**
 * Transform set of spaces to source code.
 * Useful to pass color-spaces source to web-worker, for example.
 *
 * @module  color-space/to-source
 */


/**
 * Return evaluable source code of spaces set.
 *
 * @param {object} spaces A (sub)set of color spaces to stringify. Normally - index.js.
 *
 * @return {string} source code
 */
module.exports = function(spaces){
	var res = '(function(){\nvar space = {};\n';

	var fnSrc, space;
	for (var spaceName in spaces) {
		space = spaces[spaceName];

		res += '\nvar ' + spaceName + ' = space.' + spaceName + ' = {\n';

		for (var prop in space) {
			if (typeof space[prop] === 'function') {
				fnSrc = space[prop].toString();

				//replace medium converters refs
				fnSrc = fnSrc.replace('[toSpaceName]', '.' + prop);
				fnSrc = fnSrc.replace('fromSpace', spaceName);

				res += prop + ':' + fnSrc + ',\n';
			} else {
				res += prop + ':' + JSON.stringify(space[prop]) + ',\n';
			}
		}

		res += '}\n';
	}

	res += '\nreturn space;})()';

	return res;
};
},{}],15:[function(require,module,exports){
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
},{"./rgb":12}],16:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');

module.exports = {
   getRgba: getRgba,
   getHsla: getHsla,
   getRgb: getRgb,
   getHsl: getHsl,
   getHwb: getHwb,
   getAlpha: getAlpha,

   hexString: hexString,
   rgbString: rgbString,
   rgbaString: rgbaString,
   percentString: percentString,
   percentaString: percentaString,
   hslString: hslString,
   hslaString: hslaString,
   hwbString: hwbString,
   keyword: keyword
}

function getRgba(string) {
   if (!string) {
      return;
   }
   var abbr =  /^#([a-fA-F0-9]{3})$/,
       hex =  /^#([a-fA-F0-9]{6})$/,
       rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/,
       per = /^rgba?\(\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*(?:,\s*([\d\.]+)\s*)?\)$/,
       keyword = /(\D+)/;

   var rgb = [0, 0, 0],
       a = 1,
       match = string.match(abbr);
   if (match) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i] + match[i], 16);
      }
   }
   else if (match = string.match(hex)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
   }
   else if (match = string.match(rgba)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i + 1]);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(per)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(keyword)) {
      if (match[1] == "transparent") {
         return [0, 0, 0, 0];
      }
      rgb = colorNames[match[1]];
      if (!rgb) {
         return;
      }
   }

   for (var i = 0; i < rgb.length; i++) {
      rgb[i] = scale(rgb[i], 0, 255);
   }
   if (!a && a != 0) {
      a = 1;
   }
   else {
      a = scale(a, 0, 1);
   }
   rgb[3] = a;
   return rgb;
}

function getHsla(string) {
   if (!string) {
      return;
   }
   var hsl = /^hsla?\(\s*(\d+)(?:deg)?\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/;
   var match = string.match(hsl);
   if (match) {
      var h = scale(parseInt(match[1]), 0, 360),
          s = scale(parseFloat(match[2]), 0, 100),
          l = scale(parseFloat(match[3]), 0, 100),
          a = scale(parseFloat(match[4]) || 1, 0, 1);
      return [h, s, l, a];
   }
}

function getHwb(string) {
   if (!string) {
      return;
   }
   var hwb = /^hwb\(\s*(\d+)(?:deg)?\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/;
   var match = string.match(hwb);
   if (match) {
      var h = scale(parseInt(match[1]), 0, 360),
          w = scale(parseFloat(match[2]), 0, 100),
          b = scale(parseFloat(match[3]), 0, 100),
          a = scale(parseFloat(match[4]) || 1, 0, 1);
      return [h, w, b, a];
   }
}

function getRgb(string) {
   var rgba = getRgba(string);
   return rgba && rgba.slice(0, 3);
}

function getHsl(string) {
  var hsla = getHsla(string);
  return hsla && hsla.slice(0, 3);
}

function getAlpha(string) {
   var vals = getRgba(string);
   if (vals) {
      return vals[3];
   }
   else if (vals = getHsla(string)) {
      return vals[3];
   }
   else if (vals = getHwb(string)) {
      return vals[3];
   }
}

// generators
function hexString(rgb) {
   return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1])
              + hexDouble(rgb[2]);
}

function rgbString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return rgbaString(rgba, alpha);
   }
   return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
}

function rgbaString(rgba, alpha) {
   if (alpha === undefined) {
      alpha = (rgba[3] !== undefined ? rgba[3] : 1);
   }
   return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2]
           + ", " + alpha + ")";
}

function percentString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return percentaString(rgba, alpha);
   }
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);

   return "rgb(" + r + "%, " + g + "%, " + b + "%)";
}

function percentaString(rgba, alpha) {
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);
   return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
}

function hslString(hsla, alpha) {
   if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
      return hslaString(hsla, alpha);
   }
   return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
}

function hslaString(hsla, alpha) {
   if (alpha === undefined) {
      alpha = (hsla[3] !== undefined ? hsla[3] : 1);
   }
   return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, "
           + alpha + ")";
}

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb, alpha) {
   if (alpha === undefined) {
      alpha = (hwb[3] !== undefined ? hwb[3] : 1);
   }
   return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%"
           + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
}

function keyword(rgb) {
  return reverseNames[rgb.slice(0, 3)];
}

// helpers
function scale(num, min, max) {
   return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
  var str = num.toString(16).toUpperCase();
  return (str.length < 2) ? "0" + str : str;
}


//create a list of reverse color names
var reverseNames = {};
for (var name in colorNames) {
  reverseNames[colorNames[name]] = name;
}
},{"color-name":17}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
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
},{}],"color-ranger/chess":[function(require,module,exports){
/**
 * Chess grid trivial renderer
 *
 * @module color-ranger/chess
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
},{}],"color-ranger/worker":[function(require,module,exports){
/**
 * Create worker for rendering ranges
 *
 * @module color-ranger/worker
 */

module.exports = getWorker;


var render = require('./');
var toSource = require('color-space/util/to-source');

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
 *                   	min: [0, 0],
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

		//export `color-space`
		'var convert = ' + toSource(spaces) + '\n',

		//export message handler
		';(',
		function(){
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
		}.toString(),
		')();'
	], { type: 'application/javascript' } ) );

	var worker = new Worker(blobURL);

	return worker;
}
},{"./":"color-ranger","color-space/util/to-source":14}],"color-ranger":[function(require,module,exports){
/**
 * A somewhat abstract renderer.
 *
 * @module color-ranger/render
 */

var convert = require('color-space');

module.exports = render;


//default options for default rendering
var defaults = {
	//37 is the most optimal calc size
	//you can scale resulting image with no significant quality loss
	channel: [0,1],
	space: 'rgb'
};


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
function render(rgba, buffer, opts){
	// console.time('canv');
	var size = opts.size = opts.size || [Math.floor(Math.sqrt(buffer.length / 4))];
	if (size.length === 1) {
		size[1] = size[0];
	}

	var space = opts.space = opts.space || defaults.space;
	var channels = opts.channel = opts.channel !== undefined ? opts.channel : defaults.channel;

	var mins = opts.min = opts.min || [],
		maxes = opts.maxes = opts.max || [];

	var calc = opts.type === 'polar' ?  calcPolarStep : calcRectStep;

	//take mins/maxes of target space’s channels
	for (var i = 0; i < channels.length; i++){
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
	for (i = space.length; i--;){
		if (i !== channels[0] && i !== channels[1]) {
			noIdx.push(i);
		}
	}
	var noIdx1 = noIdx[0];
	var noIdx2 = noIdx[1];
	var noIdx3 = noIdx[2];

	//get converting fn
	var converter = space === 'rgb' ? function(a){return a;} : convert[space].rgb;

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
	function calcPolarStep(x,y, vals, size, channels, mins, maxes){
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
	function calcRectStep(x,y, vals, size, channels, mins, maxes){
		if (channels[1] || channels[1] === 0) {
			vals[channels[1]] = mins[1] + (maxes[1] - mins[1]) * (1 - y / (size[1] - 1));
		}
		if (channels[0] || channels[0] === 0) {
			vals[channels[0]] = mins[0] + (maxes[0] - mins[0]) * x / (size[0] - 1);
		}
		return vals;
	}
}
},{"color-space":"color-space"}],"color-space":[function(require,module,exports){
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
},{"./cmyk":1,"./hsl":2,"./hsv":3,"./husl":4,"./huslp":5,"./hwb":6,"./lab":7,"./lchab":8,"./lchuv":9,"./luv":10,"./rgb":12,"./util/add-convertor":13,"./xyz":15}],"color":[function(require,module,exports){
/* MIT license */
var convert = require("color-space"),
    string = require("color-string");

var Color = function(cssString) {
  if (cssString instanceof Color) return cssString;
  if (! (this instanceof Color)) return new Color(cssString);

   // actual values
   this.values = [0,0,0];
   this._alpha = 1;

   //keep actual space reference
   this.space = 'rgb';


   // parse Color() argument
   //[0,0,0]
   if (cssString instanceof Array) {
      this.values = cssString;
   }
   //rgb(0,0,0)
   else if (typeof cssString == "string") {
      var vals = string.getRgba(cssString);
      if (vals) {
         this.setValues("rgb", vals);
      }
      else if(vals = string.getHsla(cssString)) {
         this.setValues("hsl", vals);
      }
      else if(vals = string.getHwb(cssString)) {
         this.setValues("hwb", vals);
      }
      else {
        throw new Error("Unable to parse color from string \"" + cssString + "\"");
      }
   }
   //{r:0, g:0, b:0}
   else if (typeof cssString == "object") {
      var vals = cssString;
      if(vals["r"] !== undefined || vals["red"] !== undefined) {
         this.setValues("rgb", vals)
      }
      else if(vals["l"] !== undefined || vals["lightness"] !== undefined) {
         this.setValues("hsl", vals)
      }
      else if(vals["v"] !== undefined || vals["value"] !== undefined) {
         this.setValues("hsv", vals)
      }
      else if(vals["w"] !== undefined || vals["whiteness"] !== undefined) {
         this.setValues("hwb", vals)
      }
      else if(vals["c"] !== undefined || vals["cyan"] !== undefined) {
         this.setValues("cmyk", vals)
      }
      else {
        throw new Error("Unable to parse color from object " + JSON.stringify(cssString));
      }
   }
};

Color.prototype = {
   rgb: function (vals) {
      return this.setSpace("rgb", arguments);
   },
   hsl: function(vals) {
      return this.setSpace("hsl", arguments);
   },
   hsv: function(vals) {
      return this.setSpace("hsv", arguments);
   },
   hwb: function(vals) {
      return this.setSpace("hwb", arguments);
   },
   cmyk: function(vals) {
      return this.setSpace("cmyk", arguments);
   },

   rgbArray: function() {
      this.actualizeSpace('rgb');
      return this.values.slice();
   },
   hslArray: function() {
      this.actualizeSpace('hsl');
      return this.values.slice();
   },
   hsvArray: function() {
      this.actualizeSpace('hsv');
      return this.values.slice();
   },
   hwbArray: function() {
      this.actualizeSpace('hwb');
      var hwb = this.values.slice()
      if (this._alpha !== 1) {
        return hwb.concat(this._alpha);
      }
      return hwb;
   },
   cmykArray: function() {
      this.actualizeSpace('cmyk');
      return this.values.slice();
   },
   rgbaArray: function() {
      this.actualizeSpace('rgb');
      var rgb = this.values.slice();
      return rgb.concat(this._alpha);
   },
   hslaArray: function() {
      this.actualizeSpace('hsl');
      var hsl = this.values.slice();
      return hsl.concat(this._alpha);
   },
   alpha: function(val) {
      if (val === undefined) {
         return this._alpha;
      }
      this.setValues("alpha", val);
      return this;
   },

   red: function(val) {
      return this.setChannel("rgb", 0, val);
   },
   green: function(val) {
      return this.setChannel("rgb", 1, val);
   },
   blue: function(val) {
      return this.setChannel("rgb", 2, val);
   },
   hue: function(val) {
      return this.setChannel("hsl", 0, val);
   },
   saturation: function(val) {
      return this.setChannel("hsl", 1, val);
   },
   lightness: function(val) {
      return this.setChannel("hsl", 2, val);
   },
   saturationv: function(val) {
      return this.setChannel("hsv", 1, val);
   },
   whiteness: function(val) {
      return this.setChannel("hwb", 1, val);
   },
   blackness: function(val) {
      return this.setChannel("hwb", 2, val);
   },
   value: function(val) {
      return this.setChannel("hsv", 2, val);
   },
   cyan: function(val) {
      return this.setChannel("cmyk", 0, val);
   },
   magenta: function(val) {
      return this.setChannel("cmyk", 1, val);
   },
   yellow: function(val) {
      return this.setChannel("cmyk", 2, val);
   },
   black: function(val) {
      return this.setChannel("cmyk", 3, val);
   },

   hexString: function() {
      this.actualizeSpace('rgb');
      return string.hexString(this.values);
   },
   rgbString: function() {
      this.actualizeSpace('rgb');
      return string.rgbString(this.values, this._alpha);
   },
   rgbaString: function() {
      this.actualizeSpace('rgb');
      return string.rgbaString(this.values, this._alpha);
   },
   percentString: function() {
      this.actualizeSpace('rgb');
      return string.percentString(this.values, this._alpha);
   },
   hslString: function() {
      this.actualizeSpace('hsl');
      return string.hslString(this.values, this._alpha);
   },
   hslaString: function() {
      this.actualizeSpace('hsl');
      return string.hslaString(this.values, this._alpha);
   },
   hwbString: function() {
      this.actualizeSpace('hwb');
      return string.hwbString(this.values, this._alpha);
   },

   keyword: function() {
      this.actualizeSpace('rgb');
      return string.keyword(this.values, this._alpha);
   },

   rgbNumber: function() {
      this.actualizeSpace('rgb');
      return (this.values[0] << 16) | (this.values[1] << 8) | this.values[2];
   },

   luminosity: function() {
      // http://www.w3.org/TR/WCAG20/#relativeluminancedef
      this.actualizeSpace('rgb');
      var rgb = this.values;
      var lum = [];
      for (var i = 0; i < rgb.length; i++) {
         var chan = rgb[i] / 255;
         lum[i] = (chan <= 0.03928) ? chan / 12.92
                  : Math.pow(((chan + 0.055) / 1.055), 2.4)
      }
      return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
   },

   contrast: function(color2) {
      // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
      var lum1 = this.luminosity();
      var lum2 = color2.luminosity();
      if (lum1 > lum2) {
         return (lum1 + 0.05) / (lum2 + 0.05)
      };
      return (lum2 + 0.05) / (lum1 + 0.05);
   },

   level: function(color2) {
     var contrastRatio = this.contrast(color2);
     return (contrastRatio >= 7.1)
       ? 'AAA'
       : (contrastRatio >= 4.5)
        ? 'AA'
        : '';
   },

   dark: function() {
      // YIQ equation from http://24ways.org/2010/calculating-color-contrast
      this.actualizeSpace('rgb');
      var rgb = this.values,
          yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      return yiq < 128;
   },

   light: function() {
      return !this.dark();
   },

   negate: function() {
      this.actualizeSpace('rgb');
      var rgb = [];
      for (var i = 0; i < 3; i++) {
         rgb[i] = 255 - this.values[i];
      }
      this.setValues("rgb", rgb);
      return this;
   },

   lighten: function(ratio) {
      this.actualizeSpace('hsl');
      this.values[2] += this.values[2] * ratio;
      this.setValues("hsl", this.values);
      return this;
   },

   darken: function(ratio) {
      this.actualizeSpace('hsl');
      this.values[2] -= this.values[2] * ratio;
      this.setValues("hsl", this.values);
      return this;
   },

   saturate: function(ratio) {
      this.actualizeSpace('hsl');
      this.values[1] += this.values[1] * ratio;
      this.setValues("hsl", this.values);
      return this;
   },

   desaturate: function(ratio) {
      this.actualizeSpace('hsl');
      this.values[1] -= this.values[1] * ratio;
      this.setValues("hsl", this.values);
      return this;
   },

   whiten: function(ratio) {
      this.actualizeSpace('hwb');
      this.values[1] += this.values[1] * ratio;
      this.setValues("hwb", this.values);
      return this;
   },

   blacken: function(ratio) {
      this.actualizeSpace('hwb');
      this.values[2] += this.values[2] * ratio;
      this.setValues("hwb", this.values);
      return this;
   },

   greyscale: function() {
      this.actualizeSpace('rgb');
      var rgb = this.values;
      // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
      var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
      this.setValues("rgb", [val, val, val]);
      return this;
   },

   clearer: function(ratio) {
      this.setValues("alpha", this._alpha - (this._alpha * ratio));
      return this;
   },

   opaquer: function(ratio) {
      this.setValues("alpha", this._alpha + (this._alpha * ratio));
      return this;
   },

   rotate: function(degrees) {
      this.actualizeSpace('hsl');
      var hue = this.values[0];
      hue = (hue + degrees) % 360;
      hue = hue < 0 ? 360 + hue : hue;
      this.values[0] = hue;
      this.setValues("hsl", this.values);
      return this;
   },

   mix: function(color2, weight, space) {
      space = space || 'rgb';

      this.actualizeSpace(space);
      color2.actualizeSpace(space);

      weight = 1 - (weight == null ? 0.5 : weight);

      // algorithm from Sass's mix(). Ratio of first color in mix is
      // determined by the alphas of both colors and the weight
      var t1 = weight * 2 - 1,
          d = this.alpha() - color2.alpha();

      var weight1 = (((t1 * d == -1) ? t1 : (t1 + d) / (1 + t1 * d)) + 1) / 2;
      var weight2 = 1 - weight1;

      var vals = this.values;
      var vals2 = color2.values;

      for (var i = 0; i < vals.length; i++) {
         vals[i] = vals[i] * weight1 + vals2[i] * weight2;
      }
      this.setValues(space, vals);

      var alpha = this.alpha() * weight + color2.alpha() * (1 - weight);
      this.setValues("alpha", alpha);

      return this;
   },

   toJSON: function() {
     return this.rgb();
   },

   clone: function() {
     return new Color(this.rgbArray());
   },

   //somewhat generic getters
   toArray: function(){
      var vals = this.values.slice();
      if (this._alpha === 1) {
         return vals.concat(this._alpha);
      }
      return vals;
   },

   toString: function(){
      return string[this.space + 'String'](this.values, this._alpha);
   }
};


Color.prototype.getValues = function(space) {
   this.actualizeSpace(space);

   var vals = {};
   for (var i = 0; i < space.length; i++) {
      vals[space[i]] = this.values[i];
   }
   if (this._alpha != 1) {
      vals["a"] = this._alpha;
   }
   // {r: 255, g: 255, b: 255, a: 0.4}
   return vals;
};


Color.prototype.setValues = function(space, vals) {
   var alpha = 1;

   //actualize target space
   this.actualizeSpace(space);

   if (space == "alpha") {
      alpha = vals;
   }
   else if (vals.length) {
      // [10, 10, 10]
      this.values = vals.slice(0, space.length);
      alpha = vals[space.length];
   }
   else if (vals[space[0]] !== undefined) {
      // {r: 10, g: 10, b: 10}
      for (var i = 0; i < space.length; i++) {
        this.values[i] = vals[space[i]];
      }
      alpha = vals.a;
   }
   else if (vals[convert[space].channel[0]] !== undefined) {
      // {red: 10, green: 10, blue: 10}
      var chans = convert[space].channel;
      for (var i = 0; i < space.length; i++) {
        this.values[i] = vals[chans[i]];
      }
      alpha = vals.alpha;
   }

   this._alpha = Math.max(0, Math.min(1, (alpha !== undefined ? alpha : this._alpha) ));

   if (space == "alpha") {
      return;
   }

   // cap values
   for (var i = 0, capped; i < space.length; i++) {
      capped = Math.max(0, Math.min(convert[space].max[i], this.values[i]));
      this.values[i] = Math.round(capped);
   }

   return true;
};


/** Update values for the space passed */
Color.prototype.actualizeSpace = function(space){
   var currSpace = this.space;

   //space is already actual
   if (currSpace !== space && space !== 'alpha') {
      //calc new space values
      this.values = convert[currSpace][space](this.values);
      for (var i = this.values.length; i--;) this.values[i] = Math.round(this.values[i]);

      //save last actual space
      this.space = space;
   }

   return this;
};


Color.prototype.setSpace = function(space, args) {
   var vals = args[0];
   if (vals === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof vals == "number") {
      vals = Array.prototype.slice.call(args);
   }
   this.setValues(space, vals);
   return this;
};

Color.prototype.setChannel = function(space, index, val) {
   this.actualizeSpace(space);
   if (val === undefined) {
      // color.red()
      return this.values[index];
   }
   // color.red(100)
   this.values[index] = Math.max(Math.min(val, convert[space].max[index]), 0);
   return this;
};

module.exports = Color;

},{"color-space":"color-space","color-string":16}],"emmy":[function(require,module,exports){
var icicle = require('icicle');


/** environment guarant */
var $ = typeof jQuery === 'undefined' ? undefined : jQuery;
var doc = typeof document === 'undefined' ? undefined : document;
var win = typeof window === 'undefined' ? undefined : window;


/** Lists of methods */
var onNames = ['on', 'bind', 'addEventListener', 'addListener'];
var oneNames = ['one', 'once', 'addOnceEventListener', 'addOnceListener'];
var offNames = ['off', 'unbind', 'removeEventListener', 'removeListener'];
var emitNames = ['emit', 'trigger', 'fire', 'dispatchEvent'];

/** Locker flags */
var emitFlag = emitNames[0], onFlag = onNames[0], oneFlag = onNames[0], offFlag = offNames[0];


/**
 * @constructor
 *
 * Main EventEmitter interface.
 * Wraps any target passed to an Emitter interface
 */
function Emmy(target){
	if (!target) return;

	//create emitter methods on target, if none
	if (!getMethodOneOf(target, onNames)) target.on = EmmyPrototype.on.bind(target);
	if (!getMethodOneOf(target, offNames)) target.off = EmmyPrototype.off.bind(target);
	if (!getMethodOneOf(target, oneNames)) target.one = target.once = EmmyPrototype.one.bind(target);
	if (!getMethodOneOf(target, emitNames)) target.emit = EmmyPrototype.emit.bind(target);

	return target;
}


/** Make DOM objects be wrapped as jQuery objects, if jQuery is enabled */
var EmmyPrototype = Emmy.prototype;


/**
 * Return target’s method one of the passed in list, if target is eventable
 * Use to detect whether target has some fn
 */
function getMethodOneOf(target, list){
	var result;
	for (var i = 0, l = list.length; i < l; i++) {
		result = target[list[i]];
		if (result) return result;
	}
}


/** Set of target callbacks, {target: [cb1, cb2, ...]} */
var targetCbCache = new WeakMap;


/**
* Bind fn to the target
* @todo  recognize jquery object
* @chainable
*/
EmmyPrototype.on =
EmmyPrototype.addEventListener = function(evt, fn){
	var target = this;

	//walk by list of instances
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			EmmyPrototype.on.call(target, evt, fn[i]);
		}
		return target;
	}

	//target events
	var onMethod = getMethodOneOf(target, onNames);

	//use target event system, if possible
	//avoid self-recursions from the outside
	if (onMethod && onMethod !== EmmyPrototype.on) {
		//if it’s frozen - ignore call
		if (icicle.freeze(target, onFlag + evt)){
			onMethod.call(target, evt, fn);
			icicle.unfreeze(target, onFlag + evt);
		}
		else {
			return target;
		}
	}

	saveCallback(target, evt, fn);

	return target;
};


/**
 * Add callback to the list of callbacks associated with target
 */
function saveCallback(target, evt, fn){
	//ensure callbacks array for target exists
	if (!targetCbCache.has(target)) targetCbCache.set(target, {});
	var targetCallbacks = targetCbCache.get(target);

	(targetCallbacks[evt] = targetCallbacks[evt] || []).push(fn);
}


/**
 * Add an event listener that will be invoked once and then removed.
 *
 * @return {Emmy}
 * @chainable
 */
EmmyPrototype.once =
EmmyPrototype.one = function(evt, fn){
	var target = this;

	//walk by list of instances
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			EmmyPrototype.one.call(target, evt, fn[i]);
		}
		return target;
	}

	//target events
	var oneMethod = getMethodOneOf(target, oneNames);

	//use target event system, if possible
	//avoid self-recursions from the outside
	if (oneMethod && oneMethod !== EmmyPrototype.one) {
		if (icicle.freeze(target, oneFlag + evt)){
			//use target event system, if possible
			oneMethod.call(target, evt, fn);
			saveCallback(target, evt, fn);
			icicle.unfreeze(target, oneFlag + evt);
		}

		else {
			return target;
		}
	}

	//wrap callback to once-call
	function cb() {
		EmmyPrototype.off.call(target, evt, cb);
		fn.apply(target, arguments);
	}

	cb.fn = fn;

	//bind wrapper default way
	EmmyPrototype.on.call(target, evt, cb);

	return target;
};


/**
* Bind fn to a target
* @chainable
*/
EmmyPrototype.off =
EmmyPrototype.removeListener =
EmmyPrototype.removeAllListeners =
EmmyPrototype.removeEventListener = function (evt, fn){
	var target = this;

	//unbind all listeners passed
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			EmmyPrototype.off.call(target, evt, fn[i]);
		}
		return target;
	}


	//unbind all listeners if no fn specified
	if (fn === undefined) {
		var callbacks = targetCbCache.get(target);
		if (!callbacks) return target;
		//unbind all if no evtRef defined
		if (evt === undefined) {
			for (var evtName in callbacks) {
				EmmyPrototype.off.call(target, evtName, callbacks[evtName]);
			}
		}
		else if (callbacks[evt]) {
			EmmyPrototype.off.call(target, evt, callbacks[evt]);
		}
		return target;
	}


	//target events
	var offMethod = getMethodOneOf(target, offNames);

	//use target event system, if possible
	//avoid self-recursion from the outside
	if (offMethod && offMethod !== EmmyPrototype.off) {
		if (icicle.freeze(target, offFlag + evt)){
			offMethod.call(target, evt, fn);
			icicle.unfreeze(target, offFlag + evt);
		}
		//if it’s frozen - ignore call
		else {
			return target;
		}
	}


	//Forget callback
	//ignore if no event specified
	if (!targetCbCache.has(target)) return target;

	var evtCallbacks = targetCbCache.get(target)[evt];

	if (!evtCallbacks) return target;

	//remove specific handler
	for (var i = 0; i < evtCallbacks.length; i++) {
		if (evtCallbacks[i] === fn || evtCallbacks[i].fn === fn) {
			evtCallbacks.splice(i, 1);
			break;
		}
	}

	return target;
};



/**
* Event trigger
* @chainable
*/
EmmyPrototype.emit =
EmmyPrototype.dispatchEvent = function(eventName, data, bubbles){
	var target = this, emitMethod, evt = eventName;
	if (!target) return;

	//Create proper event for DOM objects
	if (target.nodeType || target === doc || target === win) {
		//NOTE: this doesnot bubble on disattached elements

		if (eventName instanceof Event) {
			evt = eventName;
		} else {
			evt =  document.createEvent('CustomEvent');
			evt.initCustomEvent(eventName, bubbles, true, data);
		}

		// var evt = new CustomEvent(eventName, { detail: data, bubbles: bubbles })

		emitMethod = target.dispatchEvent;
	}

	//create event for jQuery object
	else if ($ && target instanceof $) {
		//TODO: decide how to pass data
		var evt = $.Event( eventName, data );
		evt.detail = data;
		emitMethod = bubbles ? targte.trigger : target.triggerHandler;
	}

	//Target events
	else {
		emitMethod = getMethodOneOf(target, emitNames);
	}


	//use locks to avoid self-recursion on objects wrapping this method (e. g. mod instances)
	if (emitMethod && emitMethod !== EmmyPrototype.emit) {
		if (icicle.freeze(target, emitFlag + eventName)) {
			//use target event system, if possible
			emitMethod.call(target, evt, data, bubbles);
			icicle.unfreeze(target, emitFlag + eventName);
			return target;
		}
		//if event was frozen - perform normal callback
	}


	//fall back to default event system
	//ignore if no event specified
	if (!targetCbCache.has(target)) return target;

	var evtCallbacks = targetCbCache.get(target)[evt];

	if (!evtCallbacks) return target;

	//copy callbacks to fire because list can be changed in some handler
	var fireList = evtCallbacks.slice();
	for (var i = 0; i < fireList.length; i++ ) {
		fireList[i] && fireList[i].call(target, {
			detail: data,
			type: eventName
		});
	}

	return target;
};


/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

EmmyPrototype.listeners = function(evt){
	var callbacks = targetCbCache.get(this);
	return callbacks && callbacks[evt] || [];
};


/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

EmmyPrototype.hasListeners = function(evt){
	return !!EmmyPrototype.listeners.call(this, evt).length;
};



/** Static aliases for old API compliance */
Emmy.bindStaticAPI = function(){
	var self = this, proto = self.prototype;

	for (var name in proto) {
		if (proto[name]) self[name] = createStaticBind(name);
	}

	function createStaticBind(methodName){
		return function(a, b, c, d){
			var res = proto[methodName].call(a,b,c,d);
			return res === a ? self : res;
		};
	}
};
Emmy.bindStaticAPI();


/** @module muevents */
module.exports = Emmy;
},{"icicle":18}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvY215ay5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9oc2wuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvaHN2LmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL2h1c2wuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvaHVzbHAuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvaHdiLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL2xhYi5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9sY2hhYi5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9sY2h1di5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9sdXYuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2Uvbm9kZV9tb2R1bGVzL2h1c2wvaHVzbC5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci1zcGFjZS9yZ2IuanMiLCJub2RlX21vZHVsZXMvY29sb3Itc3BhY2UvdXRpbC9hZGQtY29udmVydG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL3V0aWwvdG8tc291cmNlLmpzIiwibm9kZV9tb2R1bGVzL2NvbG9yLXNwYWNlL3h5ei5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9ub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL2NvbG9yLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9jb2xvci9ub2RlX21vZHVsZXMvY29sb3Itc3RyaW5nL25vZGVfbW9kdWxlcy9jb2xvci1uYW1lL2luZGV4Lmpzb24iLCJub2RlX21vZHVsZXMvZW1teS9ub2RlX21vZHVsZXMvaWNpY2xlL2luZGV4LmpzIiwiY2hlc3MiLCJ3b3JrZXIiLCJpbmRleC5qcyIsImNvbG9yLXNwYWNlIiwiY29sb3IiLCJlbW15Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBtb2R1bGUgY29sb3Itc3BhY2UvY215a1xuICovXG5cbnZhciByZ2IgPSByZXF1aXJlKCcuL3JnYicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ2NteWsnLFxuXHRtaW46IFswLDAsMCwwXSxcblx0bWF4OiBbMTAwLDEwMCwxMDAsMTAwXSxcblx0Y2hhbm5lbDogWydjeWFuJywgJ21hZ2VudGEnLCAneWVsbG93JywgJ2JsYWNrJ10sXG5cblx0cmdiOiBmdW5jdGlvbihjbXlrKSB7XG5cdFx0dmFyIGMgPSBjbXlrWzBdIC8gMTAwLFxuXHRcdFx0XHRtID0gY215a1sxXSAvIDEwMCxcblx0XHRcdFx0eSA9IGNteWtbMl0gLyAxMDAsXG5cdFx0XHRcdGsgPSBjbXlrWzNdIC8gMTAwLFxuXHRcdFx0XHRyLCBnLCBiO1xuXG5cdFx0ciA9IDEgLSBNYXRoLm1pbigxLCBjICogKDEgLSBrKSArIGspO1xuXHRcdGcgPSAxIC0gTWF0aC5taW4oMSwgbSAqICgxIC0gaykgKyBrKTtcblx0XHRiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG5cdFx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcblx0fVxufTtcblxuXG4vL2V4dGVuZCByZ2JcbnJnYi5jbXlrID0gZnVuY3Rpb24ocmdiKSB7XG5cdHZhciByID0gcmdiWzBdIC8gMjU1LFxuXHRcdFx0ZyA9IHJnYlsxXSAvIDI1NSxcblx0XHRcdGIgPSByZ2JbMl0gLyAyNTUsXG5cdFx0XHRjLCBtLCB5LCBrO1xuXG5cdGsgPSBNYXRoLm1pbigxIC0gciwgMSAtIGcsIDEgLSBiKTtcblx0YyA9ICgxIC0gciAtIGspIC8gKDEgLSBrKSB8fCAwO1xuXHRtID0gKDEgLSBnIC0gaykgLyAoMSAtIGspIHx8IDA7XG5cdHkgPSAoMSAtIGIgLSBrKSAvICgxIC0gaykgfHwgMDtcblx0cmV0dXJuIFtjICogMTAwLCBtICogMTAwLCB5ICogMTAwLCBrICogMTAwXTtcbn07IiwiLyoqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2hzbFxuICovXG5cbnZhciByZ2IgPSByZXF1aXJlKCcuL3JnYicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bmFtZTogJ2hzbCcsXG5cdG1pbjogWzAsMCwwXSxcblx0bWF4OiBbMzYwLDEwMCwxMDBdLFxuXHRjaGFubmVsOiBbJ2h1ZScsICdzYXR1cmF0aW9uJywgJ2xpZ2h0bmVzcyddLFxuXG5cdHJnYjogZnVuY3Rpb24oaHNsKSB7XG5cdFx0dmFyIGggPSBoc2xbMF0gLyAzNjAsXG5cdFx0XHRcdHMgPSBoc2xbMV0gLyAxMDAsXG5cdFx0XHRcdGwgPSBoc2xbMl0gLyAxMDAsXG5cdFx0XHRcdHQxLCB0MiwgdDMsIHJnYiwgdmFsO1xuXG5cdFx0aWYgKHMgPT09IDApIHtcblx0XHRcdHZhbCA9IGwgKiAyNTU7XG5cdFx0XHRyZXR1cm4gW3ZhbCwgdmFsLCB2YWxdO1xuXHRcdH1cblxuXHRcdGlmIChsIDwgMC41KSB7XG5cdFx0XHR0MiA9IGwgKiAoMSArIHMpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHQyID0gbCArIHMgLSBsICogcztcblx0XHR9XG5cdFx0dDEgPSAyICogbCAtIHQyO1xuXG5cdFx0cmdiID0gWzAsIDAsIDBdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHR0MyA9IGggKyAxIC8gMyAqIC0gKGkgLSAxKTtcblx0XHRcdGlmICh0MyA8IDApIHtcblx0XHRcdFx0dDMrKztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHQzID4gMSkge1xuXHRcdFx0XHR0My0tO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoNiAqIHQzIDwgMSkge1xuXHRcdFx0XHR2YWwgPSB0MSArICh0MiAtIHQxKSAqIDYgKiB0Mztcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKDIgKiB0MyA8IDEpIHtcblx0XHRcdFx0dmFsID0gdDI7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICgzICogdDMgPCAyKSB7XG5cdFx0XHRcdHZhbCA9IHQxICsgKHQyIC0gdDEpICogKDIgLyAzIC0gdDMpICogNjtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR2YWwgPSB0MTtcblx0XHRcdH1cblxuXHRcdFx0cmdiW2ldID0gdmFsICogMjU1O1xuXHRcdH1cblxuXHRcdHJldHVybiByZ2I7XG5cdH1cbn07XG5cblxuLy9leHRlbmQgcmdiXG5yZ2IuaHNsID0gZnVuY3Rpb24ocmdiKSB7XG5cdHZhciByID0gcmdiWzBdLzI1NSxcblx0XHRcdGcgPSByZ2JbMV0vMjU1LFxuXHRcdFx0YiA9IHJnYlsyXS8yNTUsXG5cdFx0XHRtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcblx0XHRcdG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuXHRcdFx0ZGVsdGEgPSBtYXggLSBtaW4sXG5cdFx0XHRoLCBzLCBsO1xuXG5cdGlmIChtYXggPT09IG1pbikge1xuXHRcdGggPSAwO1xuXHR9XG5cdGVsc2UgaWYgKHIgPT09IG1heCkge1xuXHRcdGggPSAoZyAtIGIpIC8gZGVsdGE7XG5cdH1cblx0ZWxzZSBpZiAoZyA9PT0gbWF4KSB7XG5cdFx0aCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG5cdH1cblx0ZWxzZSBpZiAoYiA9PT0gbWF4KSB7XG5cdFx0aCA9IDQgKyAociAtIGcpLyBkZWx0YTtcblx0fVxuXG5cdGggPSBNYXRoLm1pbihoICogNjAsIDM2MCk7XG5cblx0aWYgKGggPCAwKSB7XG5cdFx0aCArPSAzNjA7XG5cdH1cblxuXHRsID0gKG1pbiArIG1heCkgLyAyO1xuXG5cdGlmIChtYXggPT09IG1pbikge1xuXHRcdHMgPSAwO1xuXHR9XG5cdGVsc2UgaWYgKGwgPD0gMC41KSB7XG5cdFx0cyA9IGRlbHRhIC8gKG1heCArIG1pbik7XG5cdH1cblx0ZWxzZSB7XG5cdFx0cyA9IGRlbHRhIC8gKDIgLSBtYXggLSBtaW4pO1xuXHR9XG5cblx0cmV0dXJuIFtoLCBzICogMTAwLCBsICogMTAwXTtcbn07IiwiLyoqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2hzdlxuICovXG5cbnZhciByZ2IgPSByZXF1aXJlKCcuL3JnYicpO1xudmFyIGhzbCA9IHJlcXVpcmUoJy4vaHNsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnaHN2Jyxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFszNjAsMTAwLDEwMF0sXG5cdGNoYW5uZWw6IFsnaHVlJywgJ3NhdHVyYXRpb24nLCAndmFsdWUnXSxcblx0YWxpYXM6IFsnaHNiJ10sXG5cblx0cmdiOiBmdW5jdGlvbihoc3YpIHtcblx0XHR2YXIgaCA9IGhzdlswXSAvIDYwLFxuXHRcdFx0XHRzID0gaHN2WzFdIC8gMTAwLFxuXHRcdFx0XHR2ID0gaHN2WzJdIC8gMTAwLFxuXHRcdFx0XHRoaSA9IE1hdGguZmxvb3IoaCkgJSA2O1xuXG5cdFx0dmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKSxcblx0XHRcdFx0cCA9IDI1NSAqIHYgKiAoMSAtIHMpLFxuXHRcdFx0XHRxID0gMjU1ICogdiAqICgxIC0gKHMgKiBmKSksXG5cdFx0XHRcdHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKTtcblx0XHR2ICo9IDI1NTtcblxuXHRcdHN3aXRjaChoaSkge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRyZXR1cm4gW3YsIHQsIHBdO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRyZXR1cm4gW3EsIHYsIHBdO1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRyZXR1cm4gW3AsIHYsIHRdO1xuXHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRyZXR1cm4gW3AsIHEsIHZdO1xuXHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRyZXR1cm4gW3QsIHAsIHZdO1xuXHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRyZXR1cm4gW3YsIHAsIHFdO1xuXHRcdH1cblx0fSxcblxuXHRoc2w6IGZ1bmN0aW9uKGhzdikge1xuXHRcdHZhciBoID0gaHN2WzBdLFxuXHRcdFx0cyA9IGhzdlsxXSAvIDEwMCxcblx0XHRcdHYgPSBoc3ZbMl0gLyAxMDAsXG5cdFx0XHRzbCwgbDtcblxuXHRcdGwgPSAoMiAtIHMpICogdjtcblx0XHRzbCA9IHMgKiB2O1xuXHRcdHNsIC89IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuXHRcdHNsID0gc2wgfHwgMDtcblx0XHRsIC89IDI7XG5cblx0XHRyZXR1cm4gW2gsIHNsICogMTAwLCBsICogMTAwXTtcblx0fVxufTtcblxuXG4vL2FwcGVuZCByZ2JcbnJnYi5oc3YgPSBmdW5jdGlvbihyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0sXG5cdFx0XHRnID0gcmdiWzFdLFxuXHRcdFx0YiA9IHJnYlsyXSxcblx0XHRcdG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuXHRcdFx0bWF4ID0gTWF0aC5tYXgociwgZywgYiksXG5cdFx0XHRkZWx0YSA9IG1heCAtIG1pbixcblx0XHRcdGgsIHMsIHY7XG5cblx0aWYgKG1heCA9PT0gMCkge1xuXHRcdHMgPSAwO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHMgPSAoZGVsdGEvbWF4ICogMTAwMCkvMTA7XG5cdH1cblxuXHRpZiAobWF4ID09PSBtaW4pIHtcblx0XHRoID0gMDtcblx0fVxuXHRlbHNlIGlmIChyID09PSBtYXgpIHtcblx0XHRoID0gKGcgLSBiKSAvIGRlbHRhO1xuXHR9XG5cdGVsc2UgaWYgKGcgPT09IG1heCkge1xuXHRcdGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuXHR9XG5cdGVsc2UgaWYgKGIgPT09IG1heCkge1xuXHRcdGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuXHR9XG5cblx0aCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuXHRpZiAoaCA8IDApIHtcblx0XHRoICs9IDM2MDtcblx0fVxuXG5cdHYgPSAoKG1heCAvIDI1NSkgKiAxMDAwKSAvIDEwO1xuXG5cdHJldHVybiBbaCwgcywgdl07XG59O1xuXG5cblxuLy9leHRlbmQgaHNsXG5oc2wuaHN2ID0gZnVuY3Rpb24oaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdLFxuXHRcdFx0cyA9IGhzbFsxXSAvIDEwMCxcblx0XHRcdGwgPSBoc2xbMl0gLyAxMDAsXG5cdFx0XHRzdiwgdjtcblx0bCAqPSAyO1xuXHRzICo9IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuXHR2ID0gKGwgKyBzKSAvIDI7XG5cdHN2ID0gKDIgKiBzKSAvIChsICsgcykgfHwgMDtcblxuXHRyZXR1cm4gW2gsIHN2ICogMTAwLCB2ICogMTAwXTtcbn07IiwiLyoqXG4gKiBBIHVuaWZvcm0gd3JhcHBlciBmb3IgaHVzbC5cbiAqIC8vIGh0dHA6Ly93d3cuYm9yb25pbmUuY29tL2h1c2wvXG4gKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZS9odXNsXG4gKi9cblxudmFyIHh5eiA9IHJlcXVpcmUoJy4veHl6Jyk7XG52YXIgbGNodXYgPSByZXF1aXJlKCcuL2xjaHV2Jyk7XG52YXIgX2h1c2wgPSByZXF1aXJlKCdodXNsJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdodXNsJyxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFszNjAsMTAwLDEwMF0sXG5cdGNoYW5uZWw6IFsnaHVlJywgJ3NhdHVyYXRpb24nLCAnbGlnaHRuZXNzJ10sXG5cblx0bGNodXY6IF9odXNsLl9jb252Lmh1c2wubGNoLFxuXG5cdHh5ejogZnVuY3Rpb24oYXJnKXtcblx0XHRyZXR1cm4gbGNodXYueHl6KF9odXNsLl9jb252Lmh1c2wubGNoKGFyZykpO1xuXHR9LFxuXG5cdC8vYSBzaG9ydGVyIHdheSB0byBjb252ZXJ0IHRvIGh1c2xwXG5cdGh1c2xwOiBmdW5jdGlvbihhcmcpe1xuXHRcdHJldHVybiBfaHVzbC5fY29udi5sY2guaHVzbHAoIF9odXNsLl9jb252Lmh1c2wubGNoKGFyZykpO1xuXHR9XG59O1xuXG4vL2V4dGVuZCBsY2h1diwgeHl6XG5sY2h1di5odXNsID0gX2h1c2wuX2NvbnYubGNoLmh1c2w7XG54eXouaHVzbCA9IGZ1bmN0aW9uKGFyZyl7XG5cdHJldHVybiBfaHVzbC5fY29udi5sY2guaHVzbCh4eXoubGNodXYoYXJnKSk7XG59OyIsIi8qKlxuICogQSB1bmlmb3JtIHdyYXBwZXIgZm9yIGh1c2xwLlxuICogLy8gaHR0cDovL3d3dy5ib3JvbmluZS5jb20vaHVzbC9cbiAqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2h1c2xwXG4gKi9cblxudmFyIHh5eiA9IHJlcXVpcmUoJy4veHl6Jyk7XG52YXIgbGNodXYgPSByZXF1aXJlKCcuL2xjaHV2Jyk7XG52YXIgX2h1c2wgPSByZXF1aXJlKCdodXNsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnaHVzbHAnLFxuXHRtaW46IFswLDAsMF0sXG5cdG1heDogWzM2MCwxMDAsMTAwXSxcblx0Y2hhbm5lbDogWydodWUnLCAnc2F0dXJhdGlvbicsICdsaWdodG5lc3MnXSxcblxuXHRsY2h1djogX2h1c2wuX2NvbnYuaHVzbHAubGNoLFxuXHR4eXo6IGZ1bmN0aW9uKGFyZyl7cmV0dXJuIGxjaHV2Lnh5eihfaHVzbC5fY29udi5odXNscC5sY2goYXJnKSk7fSxcblxuXHQvL2Egc2hvcnRlciB3YXkgdG8gY29udmVydCB0byBodXNsXG5cdGh1c2w6IGZ1bmN0aW9uKGFyZyl7XG5cdFx0cmV0dXJuIF9odXNsLl9jb252LmxjaC5odXNsKCBfaHVzbC5fY29udi5odXNscC5sY2goYXJnKSk7XG5cdH1cbn07XG5cbi8vZXh0ZW5kIGxjaHV2LCB4eXpcbmxjaHV2Lmh1c2xwID0gX2h1c2wuX2NvbnYubGNoLmh1c2xwO1xueHl6Lmh1c2xwID0gZnVuY3Rpb24oYXJnKXtyZXR1cm4gX2h1c2wuX2NvbnYubGNoLmh1c2xwKHh5ei5sY2h1dihhcmcpKTt9OyIsIi8qKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZS9od2JcbiAqL1xuXG52YXIgcmdiID0gcmVxdWlyZSgnLi9yZ2InKTtcbnZhciBoc3YgPSByZXF1aXJlKCcuL2hzdicpO1xudmFyIGhzbCA9IHJlcXVpcmUoJy4vaHNsJyk7XG5cblxudmFyIGh3YiA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnaHdiJyxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFszNjAsMTAwLDEwMF0sXG5cdGNoYW5uZWw6IFsnaHVlJywgJ3doaXRlbmVzcycsICdibGFja25lc3MnXSxcblxuXHQvLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2Jcblx0cmdiOiBmdW5jdGlvbihod2IpIHtcblx0XHR2YXIgaCA9IGh3YlswXSAvIDM2MCxcblx0XHRcdHdoID0gaHdiWzFdIC8gMTAwLFxuXHRcdFx0YmwgPSBod2JbMl0gLyAxMDAsXG5cdFx0XHRyYXRpbyA9IHdoICsgYmwsXG5cdFx0XHRpLCB2LCBmLCBuO1xuXG5cdFx0dmFyIHIsIGcsIGI7XG5cblx0XHQvLyB3aCArIGJsIGNhbnQgYmUgPiAxXG5cdFx0aWYgKHJhdGlvID4gMSkge1xuXHRcdFx0d2ggLz0gcmF0aW87XG5cdFx0XHRibCAvPSByYXRpbztcblx0XHR9XG5cblx0XHRpID0gTWF0aC5mbG9vcig2ICogaCk7XG5cdFx0diA9IDEgLSBibDtcblx0XHRmID0gNiAqIGggLSBpO1xuXG5cdFx0Ly9pZiBpdCBpcyBldmVuXG5cdFx0aWYgKChpICYgMHgwMSkgIT09IDApIHtcblx0XHRcdGYgPSAxIC0gZjtcblx0XHR9XG5cblx0XHRuID0gd2ggKyBmICogKHYgLSB3aCk7ICAvLyBsaW5lYXIgaW50ZXJwb2xhdGlvblxuXG5cdFx0c3dpdGNoIChpKSB7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0Y2FzZSA2OlxuXHRcdFx0Y2FzZSAwOiByID0gdjsgZyA9IG47IGIgPSB3aDsgYnJlYWs7XG5cdFx0XHRjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcblx0XHRcdGNhc2UgMjogciA9IHdoOyBnID0gdjsgYiA9IG47IGJyZWFrO1xuXHRcdFx0Y2FzZSAzOiByID0gd2g7IGcgPSBuOyBiID0gdjsgYnJlYWs7XG5cdFx0XHRjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcblx0XHRcdGNhc2UgNTogciA9IHY7IGcgPSB3aDsgYiA9IG47IGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG5cdH0sXG5cblxuXHQvLyBodHRwOi8vYWx2eXJheS5jb20vUGFwZXJzL0NHL0hXQl9KR1R2MjA4LnBkZlxuXHRoc3Y6IGZ1bmN0aW9uKGFyZyl7XG5cdFx0dmFyIGggPSBhcmdbMF0sIHcgPSBhcmdbMV0sIGIgPSBhcmdbMl0sIHMsIHY7XG5cblx0XHQvL2lmIHcrYiA+IDEwMCUgLSB0YWtlIHByb3BvcnRpb24gKGhvdyBtYW55IHRpbWVzIClcblx0XHRpZiAodyArIGIgPj0gMTAwKXtcblx0XHRcdHMgPSAwO1xuXHRcdFx0diA9IDEwMCAqIHcvKHcrYik7XG5cdFx0fVxuXG5cdFx0Ly9ieSBkZWZhdWx0IC0gdGFrZSB3aWtpIGZvcm11bGFcblx0XHRlbHNlIHtcblx0XHRcdHMgPSAxMDAtKHcvKDEtYi8xMDApKTtcblx0XHRcdHYgPSAxMDAtYjtcblx0XHR9XG5cblxuXHRcdHJldHVybiBbaCwgcywgdl07XG5cdH0sXG5cblx0aHNsOiBmdW5jdGlvbihhcmcpe1xuXHRcdHJldHVybiBoc3YuaHNsKGh3Yi5oc3YoYXJnKSk7XG5cdH1cbn07XG5cblxuLy9leHRlbmQgcmdiXG5yZ2IuaHdiID0gZnVuY3Rpb24odmFsKSB7XG5cdHZhciByID0gdmFsWzBdLFxuXHRcdFx0ZyA9IHZhbFsxXSxcblx0XHRcdGIgPSB2YWxbMl0sXG5cdFx0XHRoID0gcmdiLmhzbCh2YWwpWzBdLFxuXHRcdFx0dyA9IDEvMjU1ICogTWF0aC5taW4ociwgTWF0aC5taW4oZywgYikpO1xuXG5cdFx0XHRiID0gMSAtIDEvMjU1ICogTWF0aC5tYXgociwgTWF0aC5tYXgoZywgYikpO1xuXG5cdHJldHVybiBbaCwgdyAqIDEwMCwgYiAqIDEwMF07XG59O1xuXG5cblxuLy9rZWVwIHByb3BlciBodWUgb24gMCB2YWx1ZXMgKGNvbnZlcnNpb24gdG8gcmdiIGxvc2VzIGh1ZSBvbiB6ZXJvLWxpZ2h0bmVzcylcbmhzdi5od2IgPSBmdW5jdGlvbihhcmcpe1xuXHR2YXIgaCA9IGFyZ1swXSwgcyA9IGFyZ1sxXSwgdiA9IGFyZ1syXTtcblx0cmV0dXJuIFtoLCB2ID09PSAwID8gMCA6ICh2ICogKDEtcy8xMDApKSwgMTAwIC0gdl07XG59O1xuXG5cbi8vZXh0ZW5kIGhzbCB3aXRoIHByb3BlciBjb252ZXJzaW9uc1xuaHNsLmh3YiA9IGZ1bmN0aW9uKGFyZyl7XG5cdHJldHVybiBoc3YuaHdiKGhzbC5oc3YoYXJnKSk7XG59OyIsIi8qKlxuICogQ0lFIExBQiBzcGFjZSBtb2RlbFxuICpcbiAqIEBtb2R1bGUgY29sb3Itc3BhY2UvbGFiXG4gKi9cblxudmFyIHh5eiA9IHJlcXVpcmUoJy4veHl6Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnbGFiJyxcblx0bWluOiBbMCwtMTAwLC0xMDBdLFxuXHRtYXg6IFsxMDAsMTAwLDEwMF0sXG5cdGNoYW5uZWw6IFsnbGlnaHRuZXNzJywgJ2EnLCAnYiddLFxuXHRhbGlhczogWydjaWVsYWInXSxcblxuXHR4eXo6IGZ1bmN0aW9uKGxhYikge1xuXHRcdHZhciBsID0gbGFiWzBdLFxuXHRcdFx0XHRhID0gbGFiWzFdLFxuXHRcdFx0XHRiID0gbGFiWzJdLFxuXHRcdFx0XHR4LCB5LCB6LCB5MjtcblxuXHRcdGlmIChsIDw9IDgpIHtcblx0XHRcdHkgPSAobCAqIDEwMCkgLyA5MDMuMztcblx0XHRcdHkyID0gKDcuNzg3ICogKHkgLyAxMDApKSArICgxNiAvIDExNik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHkgPSAxMDAgKiBNYXRoLnBvdygobCArIDE2KSAvIDExNiwgMyk7XG5cdFx0XHR5MiA9IE1hdGgucG93KHkgLyAxMDAsIDEvMyk7XG5cdFx0fVxuXG5cdFx0eCA9IHggLyA5NS4wNDcgPD0gMC4wMDg4NTYgPyB4ID0gKDk1LjA0NyAqICgoYSAvIDUwMCkgKyB5MiAtICgxNiAvIDExNikpKSAvIDcuNzg3IDogOTUuMDQ3ICogTWF0aC5wb3coKGEgLyA1MDApICsgeTIsIDMpO1xuXG5cdFx0eiA9IHogLyAxMDguODgzIDw9IDAuMDA4ODU5ID8geiA9ICgxMDguODgzICogKHkyIC0gKGIgLyAyMDApIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiAxMDguODgzICogTWF0aC5wb3coeTIgLSAoYiAvIDIwMCksIDMpO1xuXG5cdFx0cmV0dXJuIFt4LCB5LCB6XTtcblx0fVxufTtcblxuXG4vL2V4dGVuZCB4eXpcbnh5ei5sYWIgPSBmdW5jdGlvbih4eXope1xuXHR2YXIgeCA9IHh5elswXSxcblx0XHRcdHkgPSB4eXpbMV0sXG5cdFx0XHR6ID0geHl6WzJdLFxuXHRcdFx0bCwgYSwgYjtcblxuXHR4IC89IDk1LjA0Nztcblx0eSAvPSAxMDA7XG5cdHogLz0gMTA4Ljg4MztcblxuXHR4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcblx0eSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG5cdHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG5cdGwgPSAoMTE2ICogeSkgLSAxNjtcblx0YSA9IDUwMCAqICh4IC0geSk7XG5cdGIgPSAyMDAgKiAoeSAtIHopO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59OyIsIi8qKlxuICogQ3lsaW5kcmljYWwgTEFCXG4gKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZS9sY2hhYlxuICovXG5cbnZhciB4eXogPSByZXF1aXJlKCcuL3h5eicpO1xudmFyIGxhYiA9IHJlcXVpcmUoJy4vbGFiJyk7XG5cblxuLy9jeWxpbmRyaWNhbCBsYWJcbnZhciBsY2hhYiA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnbGNoYWInLFxuXHRtaW46IFswLDAsMF0sXG5cdG1heDogWzEwMCwxMDAsMzYwXSxcblx0Y2hhbm5lbDogWydsaWdodG5lc3MnLCAnY2hyb21hJywgJ2h1ZSddLFxuXHRhbGlhczogWydjaWVsY2gnLCAnbGNoJ10sXG5cblx0eHl6OiBmdW5jdGlvbihhcmcpIHtcblx0XHRyZXR1cm4gbGFiLnh5eihsY2hhYi5sYWIoYXJnKSk7XG5cdH0sXG5cblx0bGFiOiBmdW5jdGlvbihsY2gpIHtcblx0XHR2YXIgbCA9IGxjaFswXSxcblx0XHRcdFx0YyA9IGxjaFsxXSxcblx0XHRcdFx0aCA9IGxjaFsyXSxcblx0XHRcdFx0YSwgYiwgaHI7XG5cblx0XHRociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcblx0XHRhID0gYyAqIE1hdGguY29zKGhyKTtcblx0XHRiID0gYyAqIE1hdGguc2luKGhyKTtcblx0XHRyZXR1cm4gW2wsIGEsIGJdO1xuXHR9XG59O1xuXG5cbi8vZXh0ZW5kIGxhYlxubGFiLmxjaGFiID0gZnVuY3Rpb24obGFiKSB7XG5cdHZhciBsID0gbGFiWzBdLFxuXHRcdFx0YSA9IGxhYlsxXSxcblx0XHRcdGIgPSBsYWJbMl0sXG5cdFx0XHRociwgaCwgYztcblxuXHRociA9IE1hdGguYXRhbjIoYiwgYSk7XG5cdGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuXHRpZiAoaCA8IDApIHtcblx0XHRoICs9IDM2MDtcblx0fVxuXHRjID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpO1xuXHRyZXR1cm4gW2wsIGMsIGhdO1xufTtcblxueHl6LmxjaGFiID0gZnVuY3Rpb24oYXJnKXtcblx0cmV0dXJuIGxhYi5sY2hhYih4eXoubGFiKGFyZykpO1xufTsiLCIvKipcbiAqIEN5bGluZHJpY2FsIENJRSBMVVZcbiAqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlL2xjaHV2XG4gKi9cblxudmFyIGx1diA9IHJlcXVpcmUoJy4vbHV2Jyk7XG52YXIgeHl6ID0gcmVxdWlyZSgnLi94eXonKTtcblxuLy9jeWxpbmRyaWNhbCBsdXZcbnZhciBsY2h1diA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAnbGNodXYnLFxuXHRjaGFubmVsOiBbJ2xpZ2h0bmVzcycsICdjaHJvbWEnLCAnaHVlJ10sXG5cdGFsaWFzOiBbJ2NpZWxjaHV2J10sXG5cdG1pbjogWzAsMCwwXSxcblx0bWF4OiBbMTAwLDEwMCwzNjBdLFxuXG5cdGx1djogZnVuY3Rpb24obHV2KXtcblx0XHR2YXIgbCA9IGx1dlswXSxcblx0XHRjID0gbHV2WzFdLFxuXHRcdGggPSBsdXZbMl0sXG5cdFx0dSwgdiwgaHI7XG5cblx0XHRociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcblx0XHR1ID0gYyAqIE1hdGguY29zKGhyKTtcblx0XHR2ID0gYyAqIE1hdGguc2luKGhyKTtcblx0XHRyZXR1cm4gW2wsIHUsIHZdO1xuXHR9LFxuXG5cdHh5ejogZnVuY3Rpb24oYXJnKSB7XG5cdFx0cmV0dXJuIGx1di54eXoobGNodXYubHV2KGFyZykpO1xuXHR9LFxufTtcblxubHV2LmxjaHV2ID0gZnVuY3Rpb24obHV2KXtcblx0dmFyIGwgPSBsdXZbMF0sIHUgPSBsdXZbMV0sIHYgPSBsdXZbMl07XG5cblx0dmFyIGMgPSBNYXRoLnNxcnQodSp1ICsgdip2KTtcblx0dmFyIGhyID0gTWF0aC5hdGFuMih2LHUpO1xuXHR2YXIgaCA9IGhyICogMzYwIC8gMiAvIE1hdGguUEk7XG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cblx0cmV0dXJuIFtsLGMsaF1cbn07XG5cbnh5ei5sY2h1diA9IGZ1bmN0aW9uKGFyZyl7XG4gIHJldHVybiBsdXYubGNodXYoeHl6Lmx1dihhcmcpKTtcbn07IiwiLyoqXG4gKiBDSUUgTFVWIChDJ2VzdCBsYSB2aWUpXG4gKlxuICogQG1vZHVsZSBjb2xvci1zcGFjZS9sdXZcbiAqL1xuXG52YXIgeHl6ID0gcmVxdWlyZSgnLi94eXonKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG5hbWU6ICdsdXYnLFxuXHQvL05PVEU6IGx1diBoYXMgbm8gcmlnaWRseSBkZWZpbmVkIGxpbWl0c1xuXHQvL2Vhc3lyZ2IgZmFpbHMgdG8gZ2V0IHByb3BlciBjb29yZHNcblx0Ly9ib3JvbmluZSBzdGF0ZXMgbm8gcmlnaWQgbGltaXRzXG5cdC8vY29sb3JNaW5lIHJlZmVycyB0aGlzIG9uZXM6XG5cdG1pbjogWzAsLTEzNCwtMTQwXSxcblx0bWF4OiBbMTAwLDIyNCwxMjJdLFxuXHRjaGFubmVsOiBbJ2xpZ2h0bmVzcycsICd1JywgJ3YnXSxcblx0YWxpYXM6IFsnY2llbHV2J10sXG5cblx0eHl6OiBmdW5jdGlvbihhcmcsIGksIG8pe1xuXHRcdHZhciBfdSwgX3YsIGwsIHUsIHYsIHgsIHksIHosIHhuLCB5biwgem4sIHVuLCB2bjtcblx0XHRsID0gYXJnWzBdLCB1ID0gYXJnWzFdLCB2ID0gYXJnWzJdO1xuXG5cdFx0aWYgKGwgPT09IDApIHJldHVybiBbMCwwLDBdO1xuXG5cdFx0Ly9nZXQgY29uc3RhbnRzXG5cdFx0dmFyIGUgPSAwLjAwODg1NjQ1MTY3OTAzNTYzMTsgLy8oNi8yOSleM1xuXHRcdHZhciBrID0gMC4wMDExMDcwNTY0NTk4Nzk0NTM5OyAvLygzLzI5KV4zXG5cblx0XHQvL2dldCBpbGx1bWluYW50L29ic2VydmVyXG5cdFx0aSA9IGkgfHwgJ0Q2NSc7XG5cdFx0byA9IG8gfHwgMjtcblxuXHRcdHhuID0geHl6LndoaXRlcG9pbnRbb11baV1bMF07XG5cdFx0eW4gPSB4eXoud2hpdGVwb2ludFtvXVtpXVsxXTtcblx0XHR6biA9IHh5ei53aGl0ZXBvaW50W29dW2ldWzJdO1xuXG5cdFx0dW4gPSAoNCAqIHhuKSAvICh4biArICgxNSAqIHluKSArICgzICogem4pKTtcblx0XHR2biA9ICg5ICogeW4pIC8gKHhuICsgKDE1ICogeW4pICsgKDMgKiB6bikpO1xuXHRcdC8vIHVuID0gMC4xOTc4MzAwMDY2NDI4Mztcblx0XHQvLyB2biA9IDAuNDY4MzE5OTk0OTM4Nzk7XG5cblxuXHRcdF91ID0gdSAvICgxMyAqIGwpICsgdW4gfHwgMDtcblx0XHRfdiA9IHYgLyAoMTMgKiBsKSArIHZuIHx8IDA7XG5cblx0XHR5ID0gbCA+IDggPyB5biAqIE1hdGgucG93KCAobCArIDE2KSAvIDExNiAsIDMpIDogeW4gKiBsICogaztcblxuXHRcdC8vd2lraXBlZGlhIG1ldGhvZFxuXHRcdHggPSB5ICogOSAqIF91IC8gKDQgKiBfdikgfHwgMDtcblx0XHR6ID0geSAqICgxMiAtIDMgKiBfdSAtIDIwICogX3YpIC8gKDQgKiBfdikgfHwgMDtcblxuXHRcdC8vYm9yb25pbmUgbWV0aG9kXG5cdFx0Ly9odHRwczovL2dpdGh1Yi5jb20vYm9yb25pbmUvaHVzbC9ibG9iL21hc3Rlci9odXNsLmNvZmZlZSNMMjAxXG5cdFx0Ly8geCA9IDAgLSAoOSAqIHkgKiBfdSkgLyAoKF91IC0gNCkgKiBfdiAtIF91ICogX3YpO1xuXHRcdC8vIHogPSAoOSAqIHkgLSAoMTUgKiBfdiAqIHkpIC0gKF92ICogeCkpIC8gKDMgKiBfdik7XG5cblx0XHRyZXR1cm4gW3gsIHksIHpdO1xuXHR9XG59O1xuXG4vLyBodHRwOi8vd3d3LmJydWNlbGluZGJsb29tLmNvbS9pbmRleC5odG1sP0VxdWF0aW9ucy5odG1sXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYm9yb25pbmUvaHVzbC9ibG9iL21hc3Rlci9odXNsLmNvZmZlZVxuLy9pIC0gaWxsdW1pbmFudFxuLy9vIC0gb2JzZXJ2ZXJcbnh5ei5sdXYgPSBmdW5jdGlvbihhcmcsIGksIG8pIHtcblx0dmFyIF91LCBfdiwgbCwgdSwgdiwgeCwgeSwgeiwgeG4sIHluLCB6biwgdW4sIHZuO1xuXG5cdC8vZ2V0IGNvbnN0YW50c1xuXHR2YXIgZSA9IDAuMDA4ODU2NDUxNjc5MDM1NjMxOyAvLyg2LzI5KV4zXG5cdHZhciBrID0gOTAzLjI5NjI5NjI5NjI5NjE7IC8vKDI5LzMpXjNcblxuXHQvL2dldCBpbGx1bWluYW50L29ic2VydmVyIGNvb3Jkc1xuXHRpID0gaSB8fCAnRDY1Jztcblx0byA9IG8gfHwgMjtcblxuXHR4biA9IHh5ei53aGl0ZXBvaW50W29dW2ldWzBdO1xuXHR5biA9IHh5ei53aGl0ZXBvaW50W29dW2ldWzFdO1xuXHR6biA9IHh5ei53aGl0ZXBvaW50W29dW2ldWzJdO1xuXG5cdHVuID0gKDQgKiB4bikgLyAoeG4gKyAoMTUgKiB5bikgKyAoMyAqIHpuKSk7XG5cdHZuID0gKDkgKiB5bikgLyAoeG4gKyAoMTUgKiB5bikgKyAoMyAqIHpuKSk7XG5cblxuXHR4ID0gYXJnWzBdLCB5ID0gYXJnWzFdLCB6ID0gYXJnWzJdO1xuXG5cblx0X3UgPSAoNCAqIHgpIC8gKHggKyAoMTUgKiB5KSArICgzICogeikpIHx8IDA7XG5cdF92ID0gKDkgKiB5KSAvICh4ICsgKDE1ICogeSkgKyAoMyAqIHopKSB8fCAwO1xuXG5cdHZhciB5ciA9IHkveW47XG5cblx0bCA9IHlyIDw9IGUgPyBrICogeXIgOiAxMTYgKiBNYXRoLnBvdyh5ciwgMS8zKSAtIDE2O1xuXG5cdHUgPSAxMyAqIGwgKiAoX3UgLSB1bik7XG5cdHYgPSAxMyAqIGwgKiAoX3YgLSB2bik7XG5cblx0cmV0dXJuIFtsLCB1LCB2XTtcbn07IiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjguMFxuKGZ1bmN0aW9uKCkge1xuICB2YXIgTF90b19ZLCBZX3RvX0wsIGNvbnYsIGRpc3RhbmNlRnJvbVBvbGUsIGRvdFByb2R1Y3QsIGVwc2lsb24sIGZyb21MaW5lYXIsIGdldEJvdW5kcywgaW50ZXJzZWN0TGluZUxpbmUsIGthcHBhLCBsZW5ndGhPZlJheVVudGlsSW50ZXJzZWN0LCBtLCBtX2ludiwgbWF4Q2hyb21hRm9yTEgsIG1heFNhZmVDaHJvbWFGb3JMLCByZWZVLCByZWZWLCByZWZYLCByZWZZLCByZWZaLCByZ2JQcmVwYXJlLCByb290LCByb3VuZCwgdG9MaW5lYXI7XG5cbiAgbSA9IHtcbiAgICBSOiBbMy4yNDA5Njk5NDE5MDQ1MjEsIC0xLjUzNzM4MzE3NzU3MDA5MywgLTAuNDk4NjEwNzYwMjkzXSxcbiAgICBHOiBbLTAuOTY5MjQzNjM2MjgwODcsIDEuODc1OTY3NTAxNTA3NzIsIDAuMDQxNTU1MDU3NDA3MTc1XSxcbiAgICBCOiBbMC4wNTU2MzAwNzk2OTY5OTMsIC0wLjIwMzk3Njk1ODg4ODk3LCAxLjA1Njk3MTUxNDI0Mjg3OF1cbiAgfTtcblxuICBtX2ludiA9IHtcbiAgICBYOiBbMC40MTIzOTA3OTkyNjU5NSwgMC4zNTc1ODQzMzkzODM4NywgMC4xODA0ODA3ODg0MDE4M10sXG4gICAgWTogWzAuMjEyNjM5MDA1ODcxNTEsIDAuNzE1MTY4Njc4NzY3NzUsIDAuMDcyMTkyMzE1MzYwNzMzXSxcbiAgICBaOiBbMC4wMTkzMzA4MTg3MTU1OTEsIDAuMTE5MTk0Nzc5Nzk0NjIsIDAuOTUwNTMyMTUyMjQ5NjZdXG4gIH07XG5cbiAgcmVmWCA9IDAuOTUwNDU1OTI3MDUxNjc7XG5cbiAgcmVmWSA9IDEuMDtcblxuICByZWZaID0gMS4wODkwNTc3NTA3NTk4Nzg7XG5cbiAgcmVmVSA9IDAuMTk3ODMwMDA2NjQyODM7XG5cbiAgcmVmViA9IDAuNDY4MzE5OTk0OTM4Nzk7XG5cbiAga2FwcGEgPSA5MDMuMjk2Mjk2MjtcblxuICBlcHNpbG9uID0gMC4wMDg4NTY0NTE2O1xuXG4gIGdldEJvdW5kcyA9IGZ1bmN0aW9uKEwpIHtcbiAgICB2YXIgYm90dG9tLCBjaGFubmVsLCBtMSwgbTIsIG0zLCByZXQsIHN1YjEsIHN1YjIsIHQsIHRvcDEsIHRvcDIsIF9pLCBfaiwgX2xlbiwgX2xlbjEsIF9yZWYsIF9yZWYxLCBfcmVmMjtcbiAgICBzdWIxID0gTWF0aC5wb3coTCArIDE2LCAzKSAvIDE1NjA4OTY7XG4gICAgc3ViMiA9IHN1YjEgPiBlcHNpbG9uID8gc3ViMSA6IEwgLyBrYXBwYTtcbiAgICByZXQgPSBbXTtcbiAgICBfcmVmID0gWydSJywgJ0cnLCAnQiddO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgY2hhbm5lbCA9IF9yZWZbX2ldO1xuICAgICAgX3JlZjEgPSBtW2NoYW5uZWxdLCBtMSA9IF9yZWYxWzBdLCBtMiA9IF9yZWYxWzFdLCBtMyA9IF9yZWYxWzJdO1xuICAgICAgX3JlZjIgPSBbMCwgMV07XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgdCA9IF9yZWYyW19qXTtcbiAgICAgICAgdG9wMSA9ICgyODQ1MTcgKiBtMSAtIDk0ODM5ICogbTMpICogc3ViMjtcbiAgICAgICAgdG9wMiA9ICg4Mzg0MjIgKiBtMyArIDc2OTg2MCAqIG0yICsgNzMxNzE4ICogbTEpICogTCAqIHN1YjIgLSA3Njk4NjAgKiB0ICogTDtcbiAgICAgICAgYm90dG9tID0gKDYzMjI2MCAqIG0zIC0gMTI2NDUyICogbTIpICogc3ViMiArIDEyNjQ1MiAqIHQ7XG4gICAgICAgIHJldC5wdXNoKFt0b3AxIC8gYm90dG9tLCB0b3AyIC8gYm90dG9tXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgaW50ZXJzZWN0TGluZUxpbmUgPSBmdW5jdGlvbihsaW5lMSwgbGluZTIpIHtcbiAgICByZXR1cm4gKGxpbmUxWzFdIC0gbGluZTJbMV0pIC8gKGxpbmUyWzBdIC0gbGluZTFbMF0pO1xuICB9O1xuXG4gIGRpc3RhbmNlRnJvbVBvbGUgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocG9pbnRbMF0sIDIpICsgTWF0aC5wb3cocG9pbnRbMV0sIDIpKTtcbiAgfTtcblxuICBsZW5ndGhPZlJheVVudGlsSW50ZXJzZWN0ID0gZnVuY3Rpb24odGhldGEsIGxpbmUpIHtcbiAgICB2YXIgYjEsIGxlbiwgbTE7XG4gICAgbTEgPSBsaW5lWzBdLCBiMSA9IGxpbmVbMV07XG4gICAgbGVuID0gYjEgLyAoTWF0aC5zaW4odGhldGEpIC0gbTEgKiBNYXRoLmNvcyh0aGV0YSkpO1xuICAgIGlmIChsZW4gPCAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGxlbjtcbiAgfTtcblxuICBtYXhTYWZlQ2hyb21hRm9yTCA9IGZ1bmN0aW9uKEwpIHtcbiAgICB2YXIgYjEsIGxlbmd0aHMsIG0xLCB4LCBfaSwgX2xlbiwgX3JlZiwgX3JlZjE7XG4gICAgbGVuZ3RocyA9IFtdO1xuICAgIF9yZWYgPSBnZXRCb3VuZHMoTCk7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBfcmVmMSA9IF9yZWZbX2ldLCBtMSA9IF9yZWYxWzBdLCBiMSA9IF9yZWYxWzFdO1xuICAgICAgeCA9IGludGVyc2VjdExpbmVMaW5lKFttMSwgYjFdLCBbLTEgLyBtMSwgMF0pO1xuICAgICAgbGVuZ3Rocy5wdXNoKGRpc3RhbmNlRnJvbVBvbGUoW3gsIGIxICsgeCAqIG0xXSkpO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgbGVuZ3Rocyk7XG4gIH07XG5cbiAgbWF4Q2hyb21hRm9yTEggPSBmdW5jdGlvbihMLCBIKSB7XG4gICAgdmFyIGhyYWQsIGwsIGxlbmd0aHMsIGxpbmUsIF9pLCBfbGVuLCBfcmVmO1xuICAgIGhyYWQgPSBIIC8gMzYwICogTWF0aC5QSSAqIDI7XG4gICAgbGVuZ3RocyA9IFtdO1xuICAgIF9yZWYgPSBnZXRCb3VuZHMoTCk7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBsaW5lID0gX3JlZltfaV07XG4gICAgICBsID0gbGVuZ3RoT2ZSYXlVbnRpbEludGVyc2VjdChocmFkLCBsaW5lKTtcbiAgICAgIGlmIChsICE9PSBudWxsKSB7XG4gICAgICAgIGxlbmd0aHMucHVzaChsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIGxlbmd0aHMpO1xuICB9O1xuXG4gIGRvdFByb2R1Y3QgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIGksIHJldCwgX2ksIF9yZWY7XG4gICAgcmV0ID0gMDtcbiAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSBhLmxlbmd0aCAtIDE7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgIHJldCArPSBhW2ldICogYltpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICByb3VuZCA9IGZ1bmN0aW9uKG51bSwgcGxhY2VzKSB7XG4gICAgdmFyIG47XG4gICAgbiA9IE1hdGgucG93KDEwLCBwbGFjZXMpO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG51bSAqIG4pIC8gbjtcbiAgfTtcblxuICBmcm9tTGluZWFyID0gZnVuY3Rpb24oYykge1xuICAgIGlmIChjIDw9IDAuMDAzMTMwOCkge1xuICAgICAgcmV0dXJuIDEyLjkyICogYztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDEuMDU1ICogTWF0aC5wb3coYywgMSAvIDIuNCkgLSAwLjA1NTtcbiAgICB9XG4gIH07XG5cbiAgdG9MaW5lYXIgPSBmdW5jdGlvbihjKSB7XG4gICAgdmFyIGE7XG4gICAgYSA9IDAuMDU1O1xuICAgIGlmIChjID4gMC4wNDA0NSkge1xuICAgICAgcmV0dXJuIE1hdGgucG93KChjICsgYSkgLyAoMSArIGEpLCAyLjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYyAvIDEyLjkyO1xuICAgIH1cbiAgfTtcblxuICByZ2JQcmVwYXJlID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgY2gsIG4sIF9pLCBfaiwgX2xlbiwgX2xlbjEsIF9yZXN1bHRzO1xuICAgIHR1cGxlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHR1cGxlLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIG4gPSB0dXBsZVtfaV07XG4gICAgICAgIF9yZXN1bHRzLnB1c2gocm91bmQobiwgMykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0pKCk7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSB0dXBsZS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgY2ggPSB0dXBsZVtfaV07XG4gICAgICBpZiAoY2ggPCAtMC4wMDAxIHx8IGNoID4gMS4wMDAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIklsbGVnYWwgcmdiIHZhbHVlOiBcIiArIGNoKTtcbiAgICAgIH1cbiAgICAgIGlmIChjaCA8IDApIHtcbiAgICAgICAgY2ggPSAwO1xuICAgICAgfVxuICAgICAgaWYgKGNoID4gMSkge1xuICAgICAgICBjaCA9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaiA9IDAsIF9sZW4xID0gdHVwbGUubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICBjaCA9IHR1cGxlW19qXTtcbiAgICAgIF9yZXN1bHRzLnB1c2goTWF0aC5yb3VuZChjaCAqIDI1NSkpO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc3VsdHM7XG4gIH07XG5cbiAgY29udiA9IHtcbiAgICAneHl6Jzoge30sXG4gICAgJ2x1dic6IHt9LFxuICAgICdsY2gnOiB7fSxcbiAgICAnaHVzbCc6IHt9LFxuICAgICdodXNscCc6IHt9LFxuICAgICdyZ2InOiB7fSxcbiAgICAnaGV4Jzoge31cbiAgfTtcblxuICBjb252Lnh5ei5yZ2IgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBCLCBHLCBSO1xuICAgIFIgPSBmcm9tTGluZWFyKGRvdFByb2R1Y3QobS5SLCB0dXBsZSkpO1xuICAgIEcgPSBmcm9tTGluZWFyKGRvdFByb2R1Y3QobS5HLCB0dXBsZSkpO1xuICAgIEIgPSBmcm9tTGluZWFyKGRvdFByb2R1Y3QobS5CLCB0dXBsZSkpO1xuICAgIHJldHVybiBbUiwgRywgQl07XG4gIH07XG5cbiAgY29udi5yZ2IueHl6ID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgQiwgRywgUiwgWCwgWSwgWiwgcmdibDtcbiAgICBSID0gdHVwbGVbMF0sIEcgPSB0dXBsZVsxXSwgQiA9IHR1cGxlWzJdO1xuICAgIHJnYmwgPSBbdG9MaW5lYXIoUiksIHRvTGluZWFyKEcpLCB0b0xpbmVhcihCKV07XG4gICAgWCA9IGRvdFByb2R1Y3QobV9pbnYuWCwgcmdibCk7XG4gICAgWSA9IGRvdFByb2R1Y3QobV9pbnYuWSwgcmdibCk7XG4gICAgWiA9IGRvdFByb2R1Y3QobV9pbnYuWiwgcmdibCk7XG4gICAgcmV0dXJuIFtYLCBZLCBaXTtcbiAgfTtcblxuICBZX3RvX0wgPSBmdW5jdGlvbihZKSB7XG4gICAgaWYgKFkgPD0gZXBzaWxvbikge1xuICAgICAgcmV0dXJuIChZIC8gcmVmWSkgKiBrYXBwYTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDExNiAqIE1hdGgucG93KFkgLyByZWZZLCAxIC8gMykgLSAxNjtcbiAgICB9XG4gIH07XG5cbiAgTF90b19ZID0gZnVuY3Rpb24oTCkge1xuICAgIGlmIChMIDw9IDgpIHtcbiAgICAgIHJldHVybiByZWZZICogTCAvIGthcHBhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVmWSAqIE1hdGgucG93KChMICsgMTYpIC8gMTE2LCAzKTtcbiAgICB9XG4gIH07XG5cbiAgY29udi54eXoubHV2ID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgTCwgVSwgViwgWCwgWSwgWiwgdmFyVSwgdmFyVjtcbiAgICBYID0gdHVwbGVbMF0sIFkgPSB0dXBsZVsxXSwgWiA9IHR1cGxlWzJdO1xuICAgIHZhclUgPSAoNCAqIFgpIC8gKFggKyAoMTUgKiBZKSArICgzICogWikpO1xuICAgIHZhclYgPSAoOSAqIFkpIC8gKFggKyAoMTUgKiBZKSArICgzICogWikpO1xuICAgIEwgPSBZX3RvX0woWSk7XG4gICAgaWYgKEwgPT09IDApIHtcbiAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gICAgfVxuICAgIFUgPSAxMyAqIEwgKiAodmFyVSAtIHJlZlUpO1xuICAgIFYgPSAxMyAqIEwgKiAodmFyViAtIHJlZlYpO1xuICAgIHJldHVybiBbTCwgVSwgVl07XG4gIH07XG5cbiAgY29udi5sdXYueHl6ID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgTCwgVSwgViwgWCwgWSwgWiwgdmFyVSwgdmFyVjtcbiAgICBMID0gdHVwbGVbMF0sIFUgPSB0dXBsZVsxXSwgViA9IHR1cGxlWzJdO1xuICAgIGlmIChMID09PSAwKSB7XG4gICAgICByZXR1cm4gWzAsIDAsIDBdO1xuICAgIH1cbiAgICB2YXJVID0gVSAvICgxMyAqIEwpICsgcmVmVTtcbiAgICB2YXJWID0gViAvICgxMyAqIEwpICsgcmVmVjtcbiAgICBZID0gTF90b19ZKEwpO1xuICAgIFggPSAwIC0gKDkgKiBZICogdmFyVSkgLyAoKHZhclUgLSA0KSAqIHZhclYgLSB2YXJVICogdmFyVik7XG4gICAgWiA9ICg5ICogWSAtICgxNSAqIHZhclYgKiBZKSAtICh2YXJWICogWCkpIC8gKDMgKiB2YXJWKTtcbiAgICByZXR1cm4gW1gsIFksIFpdO1xuICB9O1xuXG4gIGNvbnYubHV2LmxjaCA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgdmFyIEMsIEgsIEhyYWQsIEwsIFUsIFY7XG4gICAgTCA9IHR1cGxlWzBdLCBVID0gdHVwbGVbMV0sIFYgPSB0dXBsZVsyXTtcbiAgICBDID0gTWF0aC5wb3coTWF0aC5wb3coVSwgMikgKyBNYXRoLnBvdyhWLCAyKSwgMSAvIDIpO1xuICAgIEhyYWQgPSBNYXRoLmF0YW4yKFYsIFUpO1xuICAgIEggPSBIcmFkICogMzYwIC8gMiAvIE1hdGguUEk7XG4gICAgaWYgKEggPCAwKSB7XG4gICAgICBIID0gMzYwICsgSDtcbiAgICB9XG4gICAgcmV0dXJuIFtMLCBDLCBIXTtcbiAgfTtcblxuICBjb252LmxjaC5sdXYgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBDLCBILCBIcmFkLCBMLCBVLCBWO1xuICAgIEwgPSB0dXBsZVswXSwgQyA9IHR1cGxlWzFdLCBIID0gdHVwbGVbMl07XG4gICAgSHJhZCA9IEggLyAzNjAgKiAyICogTWF0aC5QSTtcbiAgICBVID0gTWF0aC5jb3MoSHJhZCkgKiBDO1xuICAgIFYgPSBNYXRoLnNpbihIcmFkKSAqIEM7XG4gICAgcmV0dXJuIFtMLCBVLCBWXTtcbiAgfTtcblxuICBjb252Lmh1c2wubGNoID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgQywgSCwgTCwgUywgbWF4O1xuICAgIEggPSB0dXBsZVswXSwgUyA9IHR1cGxlWzFdLCBMID0gdHVwbGVbMl07XG4gICAgaWYgKEwgPiA5OS45OTk5OTk5KSB7XG4gICAgICByZXR1cm4gWzEwMCwgMCwgSF07XG4gICAgfVxuICAgIGlmIChMIDwgMC4wMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIFswLCAwLCBIXTtcbiAgICB9XG4gICAgbWF4ID0gbWF4Q2hyb21hRm9yTEgoTCwgSCk7XG4gICAgQyA9IG1heCAvIDEwMCAqIFM7XG4gICAgcmV0dXJuIFtMLCBDLCBIXTtcbiAgfTtcblxuICBjb252LmxjaC5odXNsID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICB2YXIgQywgSCwgTCwgUywgbWF4O1xuICAgIEwgPSB0dXBsZVswXSwgQyA9IHR1cGxlWzFdLCBIID0gdHVwbGVbMl07XG4gICAgaWYgKEwgPiA5OS45OTk5OTk5KSB7XG4gICAgICByZXR1cm4gW0gsIDAsIDEwMF07XG4gICAgfVxuICAgIGlmIChMIDwgMC4wMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIFtILCAwLCAwXTtcbiAgICB9XG4gICAgbWF4ID0gbWF4Q2hyb21hRm9yTEgoTCwgSCk7XG4gICAgUyA9IEMgLyBtYXggKiAxMDA7XG4gICAgcmV0dXJuIFtILCBTLCBMXTtcbiAgfTtcblxuICBjb252Lmh1c2xwLmxjaCA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgdmFyIEMsIEgsIEwsIFMsIG1heDtcbiAgICBIID0gdHVwbGVbMF0sIFMgPSB0dXBsZVsxXSwgTCA9IHR1cGxlWzJdO1xuICAgIGlmIChMID4gOTkuOTk5OTk5OSkge1xuICAgICAgcmV0dXJuIFsxMDAsIDAsIEhdO1xuICAgIH1cbiAgICBpZiAoTCA8IDAuMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiBbMCwgMCwgSF07XG4gICAgfVxuICAgIG1heCA9IG1heFNhZmVDaHJvbWFGb3JMKEwpO1xuICAgIEMgPSBtYXggLyAxMDAgKiBTO1xuICAgIHJldHVybiBbTCwgQywgSF07XG4gIH07XG5cbiAgY29udi5sY2guaHVzbHAgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHZhciBDLCBILCBMLCBTLCBtYXg7XG4gICAgTCA9IHR1cGxlWzBdLCBDID0gdHVwbGVbMV0sIEggPSB0dXBsZVsyXTtcbiAgICBpZiAoTCA+IDk5Ljk5OTk5OTkpIHtcbiAgICAgIHJldHVybiBbSCwgMCwgMTAwXTtcbiAgICB9XG4gICAgaWYgKEwgPCAwLjAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gW0gsIDAsIDBdO1xuICAgIH1cbiAgICBtYXggPSBtYXhTYWZlQ2hyb21hRm9yTChMKTtcbiAgICBTID0gQyAvIG1heCAqIDEwMDtcbiAgICByZXR1cm4gW0gsIFMsIExdO1xuICB9O1xuXG4gIGNvbnYucmdiLmhleCA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgdmFyIGNoLCBoZXgsIF9pLCBfbGVuO1xuICAgIGhleCA9IFwiI1wiO1xuICAgIHR1cGxlID0gcmdiUHJlcGFyZSh0dXBsZSk7XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSB0dXBsZS5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgY2ggPSB0dXBsZVtfaV07XG4gICAgICBjaCA9IGNoLnRvU3RyaW5nKDE2KTtcbiAgICAgIGlmIChjaC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY2ggPSBcIjBcIiArIGNoO1xuICAgICAgfVxuICAgICAgaGV4ICs9IGNoO1xuICAgIH1cbiAgICByZXR1cm4gaGV4O1xuICB9O1xuXG4gIGNvbnYuaGV4LnJnYiA9IGZ1bmN0aW9uKGhleCkge1xuICAgIHZhciBiLCBnLCBuLCByLCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgaWYgKGhleC5jaGFyQXQoMCkgPT09IFwiI1wiKSB7XG4gICAgICBoZXggPSBoZXguc3Vic3RyaW5nKDEsIDcpO1xuICAgIH1cbiAgICByID0gaGV4LnN1YnN0cmluZygwLCAyKTtcbiAgICBnID0gaGV4LnN1YnN0cmluZygyLCA0KTtcbiAgICBiID0gaGV4LnN1YnN0cmluZyg0LCA2KTtcbiAgICBfcmVmID0gW3IsIGcsIGJdO1xuICAgIF9yZXN1bHRzID0gW107XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBuID0gX3JlZltfaV07XG4gICAgICBfcmVzdWx0cy5wdXNoKHBhcnNlSW50KG4sIDE2KSAvIDI1NSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfTtcblxuICBjb252LmxjaC5yZ2IgPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHJldHVybiBjb252Lnh5ei5yZ2IoY29udi5sdXYueHl6KGNvbnYubGNoLmx1dih0dXBsZSkpKTtcbiAgfTtcblxuICBjb252LnJnYi5sY2ggPSBmdW5jdGlvbih0dXBsZSkge1xuICAgIHJldHVybiBjb252Lmx1di5sY2goY29udi54eXoubHV2KGNvbnYucmdiLnh5eih0dXBsZSkpKTtcbiAgfTtcblxuICBjb252Lmh1c2wucmdiID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICByZXR1cm4gY29udi5sY2gucmdiKGNvbnYuaHVzbC5sY2godHVwbGUpKTtcbiAgfTtcblxuICBjb252LnJnYi5odXNsID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICByZXR1cm4gY29udi5sY2guaHVzbChjb252LnJnYi5sY2godHVwbGUpKTtcbiAgfTtcblxuICBjb252Lmh1c2xwLnJnYiA9IGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgcmV0dXJuIGNvbnYubGNoLnJnYihjb252Lmh1c2xwLmxjaCh0dXBsZSkpO1xuICB9O1xuXG4gIGNvbnYucmdiLmh1c2xwID0gZnVuY3Rpb24odHVwbGUpIHtcbiAgICByZXR1cm4gY29udi5sY2guaHVzbHAoY29udi5yZ2IubGNoKHR1cGxlKSk7XG4gIH07XG5cbiAgcm9vdCA9IHt9O1xuXG4gIHJvb3QuZnJvbVJHQiA9IGZ1bmN0aW9uKFIsIEcsIEIpIHtcbiAgICByZXR1cm4gY29udi5yZ2IuaHVzbChbUiwgRywgQl0pO1xuICB9O1xuXG4gIHJvb3QuZnJvbUhleCA9IGZ1bmN0aW9uKGhleCkge1xuICAgIHJldHVybiBjb252LnJnYi5odXNsKGNvbnYuaGV4LnJnYihoZXgpKTtcbiAgfTtcblxuICByb290LnRvUkdCID0gZnVuY3Rpb24oSCwgUywgTCkge1xuICAgIHJldHVybiBjb252Lmh1c2wucmdiKFtILCBTLCBMXSk7XG4gIH07XG5cbiAgcm9vdC50b0hleCA9IGZ1bmN0aW9uKEgsIFMsIEwpIHtcbiAgICByZXR1cm4gY29udi5yZ2IuaGV4KGNvbnYuaHVzbC5yZ2IoW0gsIFMsIExdKSk7XG4gIH07XG5cbiAgcm9vdC5wID0ge307XG5cbiAgcm9vdC5wLnRvUkdCID0gZnVuY3Rpb24oSCwgUywgTCkge1xuICAgIHJldHVybiBjb252Lnh5ei5yZ2IoY29udi5sdXYueHl6KGNvbnYubGNoLmx1dihjb252Lmh1c2xwLmxjaChbSCwgUywgTF0pKSkpO1xuICB9O1xuXG4gIHJvb3QucC50b0hleCA9IGZ1bmN0aW9uKEgsIFMsIEwpIHtcbiAgICByZXR1cm4gY29udi5yZ2IuaGV4KGNvbnYueHl6LnJnYihjb252Lmx1di54eXooY29udi5sY2gubHV2KGNvbnYuaHVzbHAubGNoKFtILCBTLCBMXSkpKSkpO1xuICB9O1xuXG4gIHJvb3QucC5mcm9tUkdCID0gZnVuY3Rpb24oUiwgRywgQikge1xuICAgIHJldHVybiBjb252LmxjaC5odXNscChjb252Lmx1di5sY2goY29udi54eXoubHV2KGNvbnYucmdiLnh5eihbUiwgRywgQl0pKSkpO1xuICB9O1xuXG4gIHJvb3QucC5mcm9tSGV4ID0gZnVuY3Rpb24oaGV4KSB7XG4gICAgcmV0dXJuIGNvbnYubGNoLmh1c2xwKGNvbnYubHV2LmxjaChjb252Lnh5ei5sdXYoY29udi5yZ2IueHl6KGNvbnYuaGV4LnJnYihoZXgpKSkpKTtcbiAgfTtcblxuICByb290Ll9jb252ID0gY29udjtcblxuICByb290Ll9yb3VuZCA9IHJvdW5kO1xuXG4gIHJvb3QuX3JnYlByZXBhcmUgPSByZ2JQcmVwYXJlO1xuXG4gIHJvb3QuX2dldEJvdW5kcyA9IGdldEJvdW5kcztcblxuICByb290Ll9tYXhDaHJvbWFGb3JMSCA9IG1heENocm9tYUZvckxIO1xuXG4gIHJvb3QuX21heFNhZmVDaHJvbWFGb3JMID0gbWF4U2FmZUNocm9tYUZvckw7XG5cbiAgaWYgKCEoKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSB8fCAodHlwZW9mIGpRdWVyeSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBqUXVlcnkgIT09IG51bGwpIHx8ICh0eXBlb2YgcmVxdWlyZWpzICE9PSBcInVuZGVmaW5lZFwiICYmIHJlcXVpcmVqcyAhPT0gbnVsbCkpKSB7XG4gICAgdGhpcy5IVVNMID0gcm9vdDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgalF1ZXJ5ICE9PSBcInVuZGVmaW5lZFwiICYmIGpRdWVyeSAhPT0gbnVsbCkge1xuICAgIGpRdWVyeS5odXNsID0gcm9vdDtcbiAgfVxuXG4gIGlmICgodHlwZW9mIHJlcXVpcmVqcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiByZXF1aXJlanMgIT09IG51bGwpICYmICh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkpIHtcbiAgICBkZWZpbmUocm9vdCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIi8qKlxuICogUkdCIHNwYWNlLlxuICpcbiAqIEBtb2R1bGUgIGNvbG9yLXNwYWNlL3JnYlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAncmdiJyxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFsyNTUsMjU1LDI1NV0sXG5cdGNoYW5uZWw6IFsncmVkJywgJ2dyZWVuJywgJ2JsdWUnXVxufTsiLCIvKipcclxuICogQWRkIGEgY29udmVydG9yIGZyb20gb25lIHRvIGFub3RoZXIgc3BhY2UgdmlhIFhZWiBvciBSR0Igc3BhY2UgYXMgYSBtZWRpdW0uXHJcbiAqXHJcbiAqIEBtb2R1bGUgIGNvbG9yLXNwYWNlL2FkZC1jb252ZXJ0b3JcclxuICovXHJcblxyXG52YXIgeHl6ID0gcmVxdWlyZSgnLi4veHl6Jyk7XHJcbnZhciByZ2IgPSByZXF1aXJlKCcuLi9yZ2InKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYWRkQ29udmVydG9yO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBBZGQgY29udmVydG9yIGZyb20gc3BhY2UgQSB0byBzcGFjZSBCLlxyXG4gKiBTbyBzcGFjZSBBIHdpbGwgYmUgYWJsZSB0byB0cmFuc2Zvcm0gdG8gQi5cclxuICovXHJcbmZ1bmN0aW9uIGFkZENvbnZlcnRvcihmcm9tU3BhY2UsIHRvU3BhY2Upe1xyXG5cdGlmICghZnJvbVNwYWNlW3RvU3BhY2UubmFtZV0pIHtcclxuXHRcdGZyb21TcGFjZVt0b1NwYWNlLm5hbWVdID0gZ2V0Q29udmVydG9yKGZyb21TcGFjZSwgdG9TcGFjZSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZnJvbVNwYWNlO1xyXG59XHJcblxyXG5cclxuLyoqIHJldHVybiBjb252ZXJ0ZXIgdGhyb3VnaCB4eXovcmdiIHNwYWNlICovXHJcbmZ1bmN0aW9uIGdldENvbnZlcnRvcihmcm9tU3BhY2UsIHRvU3BhY2Upe1xyXG5cdHZhciB0b1NwYWNlTmFtZSA9IHRvU3BhY2UubmFtZTtcclxuXHJcblx0Ly9jcmVhdGUgeHl6IGNvbnZlcnRlciwgaWYgYXZhaWxhYmxlXHJcblx0aWYgKGZyb21TcGFjZS54eXogJiYgeHl6W3RvU3BhY2VOYW1lXSkge1xyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKGFyZyl7XHJcblx0XHRcdHJldHVybiB4eXpbdG9TcGFjZU5hbWVdKGZyb21TcGFjZS54eXooYXJnKSk7XHJcblx0XHR9O1xyXG5cdH1cclxuXHQvL2NyZWF0ZSByZ2IgY29udmVydGVyXHJcblx0ZWxzZSBpZiAoZnJvbVNwYWNlLnJnYiAmJiByZ2JbdG9TcGFjZU5hbWVdKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oYXJnKXtcclxuXHRcdFx0cmV0dXJuIHJnYlt0b1NwYWNlTmFtZV0oZnJvbVNwYWNlLnJnYihhcmcpKTtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHR0aHJvdyBFcnJvcignQ2Fu4oCZdCBhZGQgY29udmVydG9yIGZyb20gJyArIGZyb21TcGFjZS5uYW1lICsgJyB0byAnICsgdG9TcGFjZU5hbWUpO1xyXG59XHJcbiIsIi8qKlxuICogVHJhbnNmb3JtIHNldCBvZiBzcGFjZXMgdG8gc291cmNlIGNvZGUuXG4gKiBVc2VmdWwgdG8gcGFzcyBjb2xvci1zcGFjZXMgc291cmNlIHRvIHdlYi13b3JrZXIsIGZvciBleGFtcGxlLlxuICpcbiAqIEBtb2R1bGUgIGNvbG9yLXNwYWNlL3RvLXNvdXJjZVxuICovXG5cblxuLyoqXG4gKiBSZXR1cm4gZXZhbHVhYmxlIHNvdXJjZSBjb2RlIG9mIHNwYWNlcyBzZXQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHNwYWNlcyBBIChzdWIpc2V0IG9mIGNvbG9yIHNwYWNlcyB0byBzdHJpbmdpZnkuIE5vcm1hbGx5IC0gaW5kZXguanMuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSBzb3VyY2UgY29kZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNwYWNlcyl7XG5cdHZhciByZXMgPSAnKGZ1bmN0aW9uKCl7XFxudmFyIHNwYWNlID0ge307XFxuJztcblxuXHR2YXIgZm5TcmMsIHNwYWNlO1xuXHRmb3IgKHZhciBzcGFjZU5hbWUgaW4gc3BhY2VzKSB7XG5cdFx0c3BhY2UgPSBzcGFjZXNbc3BhY2VOYW1lXTtcblxuXHRcdHJlcyArPSAnXFxudmFyICcgKyBzcGFjZU5hbWUgKyAnID0gc3BhY2UuJyArIHNwYWNlTmFtZSArICcgPSB7XFxuJztcblxuXHRcdGZvciAodmFyIHByb3AgaW4gc3BhY2UpIHtcblx0XHRcdGlmICh0eXBlb2Ygc3BhY2VbcHJvcF0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Zm5TcmMgPSBzcGFjZVtwcm9wXS50b1N0cmluZygpO1xuXG5cdFx0XHRcdC8vcmVwbGFjZSBtZWRpdW0gY29udmVydGVycyByZWZzXG5cdFx0XHRcdGZuU3JjID0gZm5TcmMucmVwbGFjZSgnW3RvU3BhY2VOYW1lXScsICcuJyArIHByb3ApO1xuXHRcdFx0XHRmblNyYyA9IGZuU3JjLnJlcGxhY2UoJ2Zyb21TcGFjZScsIHNwYWNlTmFtZSk7XG5cblx0XHRcdFx0cmVzICs9IHByb3AgKyAnOicgKyBmblNyYyArICcsXFxuJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlcyArPSBwcm9wICsgJzonICsgSlNPTi5zdHJpbmdpZnkoc3BhY2VbcHJvcF0pICsgJyxcXG4nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJlcyArPSAnfVxcbic7XG5cdH1cblxuXHRyZXMgKz0gJ1xcbnJldHVybiBzcGFjZTt9KSgpJztcblxuXHRyZXR1cm4gcmVzO1xufTsiLCIvKipcbiAqIENJRSBYWVpcbiAqXG4gKiBAbW9kdWxlICBjb2xvci1zcGFjZS94eXpcbiAqL1xuXG52YXIgcmdiID0gcmVxdWlyZSgnLi9yZ2InKTtcblxudmFyIHh5eiA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiAneHl6Jyxcblx0bWluOiBbMCwwLDBdLFxuXHRtYXg6IFs5NiwxMDAsMTA5XSxcblx0Y2hhbm5lbDogWydsaWdodG5lc3MnLCd1JywndiddLFxuXHRhbGlhczogWydjaWV4eXonXSxcblxuXHQvL3doaXRlcG9pbnQgd2l0aCBvYnNlcnZlci9pbGx1bWluYW50XG5cdC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3RhbmRhcmRfaWxsdW1pbmFudFxuXHR3aGl0ZXBvaW50OiB7XG5cdFx0Mjoge1xuXHRcdFx0Ly9pbmNhZGVzY2VudFxuXHRcdFx0QTpbMTA5Ljg1LCAxMDAsIDM1LjU4NV0sXG5cdFx0XHQvLyBCOltdLFxuXHRcdFx0QzogWzk4LjA3NCwgMTAwLCAxMTguMjMyXSxcblx0XHRcdEQ1MDogWzk2LjQyMiwgMTAwLCA4Mi41MjFdLFxuXHRcdFx0RDU1OiBbOTUuNjgyLCAxMDAsIDkyLjE0OV0sXG5cdFx0XHQvL2RheWxpZ2h0XG5cdFx0XHRENjU6IFs5NS4wNDU1OTI3MDUxNjcsIDEwMCwgMTA4LjkwNTc3NTA3NTk4NzhdLFxuXHRcdFx0RDc1OiBbOTQuOTcyLCAxMDAsIDEyMi42MzhdLFxuXHRcdFx0Ly9mbG91cmVzY2VudFxuXHRcdFx0Ly8gRjE6IFtdLFxuXHRcdFx0RjI6IFs5OS4xODcsIDEwMCwgNjcuMzk1XSxcblx0XHRcdC8vIEYzOiBbXSxcblx0XHRcdC8vIEY0OiBbXSxcblx0XHRcdC8vIEY1OiBbXSxcblx0XHRcdC8vIEY2OltdLFxuXHRcdFx0Rjc6IFs5NS4wNDQsIDEwMCwgMTA4Ljc1NV0sXG5cdFx0XHQvLyBGODogW10sXG5cdFx0XHQvLyBGOTogW10sXG5cdFx0XHQvLyBGMTA6IFtdLFxuXHRcdFx0RjExOiBbMTAwLjk2NiwgMTAwLCA2NC4zNzBdLFxuXHRcdFx0Ly8gRjEyOiBbXSxcblx0XHRcdEU6IFsxMDAsMTAwLDEwMF1cblx0XHR9LFxuXG5cdFx0MTA6IHtcblx0XHRcdC8vaW5jYWRlc2NlbnRcblx0XHRcdEE6WzExMS4xNDQsIDEwMCwgMzUuMjAwXSxcblx0XHRcdEM6IFs5Ny4yODUsIDEwMCwgMTE2LjE0NV0sXG5cdFx0XHRENTA6IFs5Ni43MjAsIDEwMCwgODEuNDI3XSxcblx0XHRcdEQ1NTogWzk1Ljc5OSwgMTAwLCA5MC45MjZdLFxuXHRcdFx0Ly9kYXlsaWdodFxuXHRcdFx0RDY1OiBbOTQuODExLCAxMDAsIDEwNy4zMDRdLFxuXHRcdFx0RDc1OiBbOTQuNDE2LCAxMDAsIDEyMC42NDFdLFxuXHRcdFx0Ly9mbG91cmVzY2VudFxuXHRcdFx0RjI6IFsxMDMuMjgwLCAxMDAsIDY5LjAyNl0sXG5cdFx0XHRGNzogWzk1Ljc5MiwgMTAwLCAxMDcuNjg3XSxcblx0XHRcdEYxMTogWzEwMy44NjYsIDEwMCwgNjUuNjI3XSxcblx0XHRcdEU6IFsxMDAsMTAwLDEwMF1cblx0XHR9XG5cdH0sXG5cblx0cmdiOiBmdW5jdGlvbih4eXopIHtcblx0XHR2YXIgeCA9IHh5elswXSAvIDEwMCxcblx0XHRcdFx0eSA9IHh5elsxXSAvIDEwMCxcblx0XHRcdFx0eiA9IHh5elsyXSAvIDEwMCxcblx0XHRcdFx0ciwgZywgYjtcblxuXHRcdC8vIGFzc3VtZSBzUkdCXG5cdFx0Ly8gaHR0cDovL3d3dy5icnVjZWxpbmRibG9vbS5jb20vaW5kZXguaHRtbD9FcW5fUkdCX1hZWl9NYXRyaXguaHRtbFxuXHRcdHIgPSAoeCAqIDMuMjQwOTY5OTQxOTA0NTIxKSArICh5ICogLTEuNTM3MzgzMTc3NTcwMDkzKSArICh6ICogLTAuNDk4NjEwNzYwMjkzKTtcblx0XHRnID0gKHggKiAtMC45NjkyNDM2MzYyODA4NykgKyAoeSAqIDEuODc1OTY3NTAxNTA3NzIpICsgKHogKiAwLjA0MTU1NTA1NzQwNzE3NSk7XG5cdFx0YiA9ICh4ICogMC4wNTU2MzAwNzk2OTY5OTMpICsgKHkgKiAtMC4yMDM5NzY5NTg4ODg5NykgKyAoeiAqIDEuMDU2OTcxNTE0MjQyODc4KTtcblxuXHRcdHIgPSByID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0XHQ6IHIgPSAociAqIDEyLjkyKTtcblxuXHRcdGcgPSBnID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGcsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0XHQ6IGcgPSAoZyAqIDEyLjkyKTtcblxuXHRcdGIgPSBiID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0XHQ6IGIgPSAoYiAqIDEyLjkyKTtcblxuXHRcdHIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCByKSwgMSk7XG5cdFx0ZyA9IE1hdGgubWluKE1hdGgubWF4KDAsIGcpLCAxKTtcblx0XHRiID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYiksIDEpO1xuXG5cdFx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcblx0fVxufTtcblxuXG4vL2V4dGVuZCByZ2JcbnJnYi54eXogPSBmdW5jdGlvbihyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTUsXG5cdFx0XHRnID0gcmdiWzFdIC8gMjU1LFxuXHRcdFx0YiA9IHJnYlsyXSAvIDI1NTtcblxuXHQvLyBhc3N1bWUgc1JHQlxuXHRyID0gciA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKHIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAociAvIDEyLjkyKTtcblx0ZyA9IGcgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChnICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGcgLyAxMi45Mik7XG5cdGIgPSBiID4gMC4wNDA0NSA/IE1hdGgucG93KCgoYiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChiIC8gMTIuOTIpO1xuXG5cdHZhciB4ID0gKHIgKiAwLjQxMjM5MDc5OTI2NTk1KSArIChnICogMC4zNTc1ODQzMzkzODM4NykgKyAoYiAqIDAuMTgwNDgwNzg4NDAxODMpO1xuXHR2YXIgeSA9IChyICogMC4yMTI2MzkwMDU4NzE1MSkgKyAoZyAqIDAuNzE1MTY4Njc4NzY3NzUpICsgKGIgKiAwLjA3MjE5MjMxNTM2MDczMyk7XG5cdHZhciB6ID0gKHIgKiAwLjAxOTMzMDgxODcxNTU5MSkgKyAoZyAqIDAuMTE5MTk0Nzc5Nzk0NjIpICsgKGIgKiAwLjk1MDUzMjE1MjI0OTY2KTtcblxuXHRyZXR1cm4gW3ggKiAxMDAsIHkgKjEwMCwgeiAqIDEwMF07XG59OyIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29sb3JOYW1lcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICBnZXRSZ2JhOiBnZXRSZ2JhLFxuICAgZ2V0SHNsYTogZ2V0SHNsYSxcbiAgIGdldFJnYjogZ2V0UmdiLFxuICAgZ2V0SHNsOiBnZXRIc2wsXG4gICBnZXRId2I6IGdldEh3YixcbiAgIGdldEFscGhhOiBnZXRBbHBoYSxcblxuICAgaGV4U3RyaW5nOiBoZXhTdHJpbmcsXG4gICByZ2JTdHJpbmc6IHJnYlN0cmluZyxcbiAgIHJnYmFTdHJpbmc6IHJnYmFTdHJpbmcsXG4gICBwZXJjZW50U3RyaW5nOiBwZXJjZW50U3RyaW5nLFxuICAgcGVyY2VudGFTdHJpbmc6IHBlcmNlbnRhU3RyaW5nLFxuICAgaHNsU3RyaW5nOiBoc2xTdHJpbmcsXG4gICBoc2xhU3RyaW5nOiBoc2xhU3RyaW5nLFxuICAgaHdiU3RyaW5nOiBod2JTdHJpbmcsXG4gICBrZXl3b3JkOiBrZXl3b3JkXG59XG5cbmZ1bmN0aW9uIGdldFJnYmEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGFiYnIgPSAgL14jKFthLWZBLUYwLTldezN9KSQvLFxuICAgICAgIGhleCA9ICAvXiMoW2EtZkEtRjAtOV17Nn0pJC8sXG4gICAgICAgcmdiYSA9IC9ecmdiYT9cXChcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKixcXHMqKFxcZCspXFxzKig/OixcXHMqKFtcXGRcXC5dKylcXHMqKT9cXCkkLyxcbiAgICAgICBwZXIgPSAvXnJnYmE/XFwoXFxzKihbXFxkXFwuXSspXFwlXFxzKixcXHMqKFtcXGRcXC5dKylcXCVcXHMqLFxccyooW1xcZFxcLl0rKVxcJVxccyooPzosXFxzKihbXFxkXFwuXSspXFxzKik/XFwpJC8sXG4gICAgICAga2V5d29yZCA9IC8oXFxEKykvO1xuXG4gICB2YXIgcmdiID0gWzAsIDAsIDBdLFxuICAgICAgIGEgPSAxLFxuICAgICAgIG1hdGNoID0gc3RyaW5nLm1hdGNoKGFiYnIpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2guc2xpY2UoaSAqIDIsIGkgKiAyICsgMiksIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHJnYmEpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaSArIDFdKTtcbiAgICAgIH1cbiAgICAgIGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuICAgICAgfVxuICAgICAgYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goa2V5d29yZCkpIHtcbiAgICAgIGlmIChtYXRjaFsxXSA9PSBcInRyYW5zcGFyZW50XCIpIHtcbiAgICAgICAgIHJldHVybiBbMCwgMCwgMCwgMF07XG4gICAgICB9XG4gICAgICByZ2IgPSBjb2xvck5hbWVzW21hdGNoWzFdXTtcbiAgICAgIGlmICghcmdiKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICB9XG5cbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZ2JbaV0gPSBzY2FsZShyZ2JbaV0sIDAsIDI1NSk7XG4gICB9XG4gICBpZiAoIWEgJiYgYSAhPSAwKSB7XG4gICAgICBhID0gMTtcbiAgIH1cbiAgIGVsc2Uge1xuICAgICAgYSA9IHNjYWxlKGEsIDAsIDEpO1xuICAgfVxuICAgcmdiWzNdID0gYTtcbiAgIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGdldEhzbGEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFxcZCspKD86ZGVnKT9cXHMqLFxccyooW1xcZFxcLl0rKSVcXHMqLFxccyooW1xcZFxcLl0rKSVcXHMqKD86LFxccyooW1xcZFxcLl0rKVxccyopP1xcKS87XG4gICB2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHNsKTtcbiAgIGlmIChtYXRjaCkge1xuICAgICAgdmFyIGggPSBzY2FsZShwYXJzZUludChtYXRjaFsxXSksIDAsIDM2MCksXG4gICAgICAgICAgcyA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApLFxuICAgICAgICAgIGwgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKSxcbiAgICAgICAgICBhID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFs0XSkgfHwgMSwgMCwgMSk7XG4gICAgICByZXR1cm4gW2gsIHMsIGwsIGFdO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRId2Ioc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGh3YiA9IC9eaHdiXFwoXFxzKihcXGQrKSg/OmRlZyk/XFxzKixcXHMqKFtcXGRcXC5dKyklXFxzKixcXHMqKFtcXGRcXC5dKyklXFxzKig/OixcXHMqKFtcXGRcXC5dKylcXHMqKT9cXCkvO1xuICAgdmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGh3Yik7XG4gICBpZiAobWF0Y2gpIHtcbiAgICAgIHZhciBoID0gc2NhbGUocGFyc2VJbnQobWF0Y2hbMV0pLCAwLCAzNjApLFxuICAgICAgICAgIHcgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKSxcbiAgICAgICAgICBiID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCksXG4gICAgICAgICAgYSA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbNF0pIHx8IDEsIDAsIDEpO1xuICAgICAgcmV0dXJuIFtoLCB3LCBiLCBhXTtcbiAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmdiKHN0cmluZykge1xuICAgdmFyIHJnYmEgPSBnZXRSZ2JhKHN0cmluZyk7XG4gICByZXR1cm4gcmdiYSAmJiByZ2JhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRIc2woc3RyaW5nKSB7XG4gIHZhciBoc2xhID0gZ2V0SHNsYShzdHJpbmcpO1xuICByZXR1cm4gaHNsYSAmJiBoc2xhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRBbHBoYShzdHJpbmcpIHtcbiAgIHZhciB2YWxzID0gZ2V0UmdiYShzdHJpbmcpO1xuICAgaWYgKHZhbHMpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxuICAgZWxzZSBpZiAodmFscyA9IGdldEhzbGEoc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG4gICBlbHNlIGlmICh2YWxzID0gZ2V0SHdiKHN0cmluZykpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxufVxuXG4vLyBnZW5lcmF0b3JzXG5mdW5jdGlvbiBoZXhTdHJpbmcocmdiKSB7XG4gICByZXR1cm4gXCIjXCIgKyBoZXhEb3VibGUocmdiWzBdKSArIGhleERvdWJsZShyZ2JbMV0pXG4gICAgICAgICAgICAgICsgaGV4RG91YmxlKHJnYlsyXSk7XG59XG5cbmZ1bmN0aW9uIHJnYlN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAocmdiYVszXSAmJiByZ2JhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKTtcbiAgIH1cbiAgIHJldHVybiBcInJnYihcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAocmdiYVszXSAhPT0gdW5kZWZpbmVkID8gcmdiYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwicmdiYShcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXVxuICAgICAgICAgICArIFwiLCBcIiArIGFscGhhICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKHJnYmFbM10gJiYgcmdiYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpO1xuICAgfVxuICAgdmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0vMjU1ICogMTAwKSxcbiAgICAgICBnID0gTWF0aC5yb3VuZChyZ2JhWzFdLzI1NSAqIDEwMCksXG4gICAgICAgYiA9IE1hdGgucm91bmQocmdiYVsyXS8yNTUgKiAxMDApO1xuXG4gICByZXR1cm4gXCJyZ2IoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSlcIjtcbn1cblxuZnVuY3Rpb24gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdLzI1NSAqIDEwMCksXG4gICAgICAgZyA9IE1hdGgucm91bmQocmdiYVsxXS8yNTUgKiAxMDApLFxuICAgICAgIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0vMjU1ICogMTAwKTtcbiAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSwgXCIgKyAoYWxwaGEgfHwgcmdiYVszXSB8fCAxKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xTdHJpbmcoaHNsYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKGhzbGFbM10gJiYgaHNsYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gaHNsYVN0cmluZyhoc2xhLCBhbHBoYSk7XG4gICB9XG4gICByZXR1cm4gXCJoc2woXCIgKyBoc2xhWzBdICsgXCIsIFwiICsgaHNsYVsxXSArIFwiJSwgXCIgKyBoc2xhWzJdICsgXCIlKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xhU3RyaW5nKGhzbGEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHNsYVszXSAhPT0gdW5kZWZpbmVkID8gaHNsYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHNsYShcIiArIGhzbGFbMF0gKyBcIiwgXCIgKyBoc2xhWzFdICsgXCIlLCBcIiArIGhzbGFbMl0gKyBcIiUsIFwiXG4gICAgICAgICAgICsgYWxwaGEgKyBcIilcIjtcbn1cblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmZ1bmN0aW9uIGh3YlN0cmluZyhod2IsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHdiWzNdICE9PSB1bmRlZmluZWQgPyBod2JbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcImh3YihcIiArIGh3YlswXSArIFwiLCBcIiArIGh3YlsxXSArIFwiJSwgXCIgKyBod2JbMl0gKyBcIiVcIlxuICAgICAgICAgICArIChhbHBoYSAhPT0gdW5kZWZpbmVkICYmIGFscGhhICE9PSAxID8gXCIsIFwiICsgYWxwaGEgOiBcIlwiKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZU5hbWVzW3JnYi5zbGljZSgwLCAzKV07XG59XG5cbi8vIGhlbHBlcnNcbmZ1bmN0aW9uIHNjYWxlKG51bSwgbWluLCBtYXgpIHtcbiAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIG51bSksIG1heCk7XG59XG5cbmZ1bmN0aW9uIGhleERvdWJsZShudW0pIHtcbiAgdmFyIHN0ciA9IG51bS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIChzdHIubGVuZ3RoIDwgMikgPyBcIjBcIiArIHN0ciA6IHN0cjtcbn1cblxuXG4vL2NyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xudmFyIHJldmVyc2VOYW1lcyA9IHt9O1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG4gIHJldmVyc2VOYW1lc1tjb2xvck5hbWVzW25hbWVdXSA9IG5hbWU7XG59IiwibW9kdWxlLmV4cG9ydHM9e1xyXG5cdFwiYWxpY2VibHVlXCI6IFsyNDAsIDI0OCwgMjU1XSxcclxuXHRcImFudGlxdWV3aGl0ZVwiOiBbMjUwLCAyMzUsIDIxNV0sXHJcblx0XCJhcXVhXCI6IFswLCAyNTUsIDI1NV0sXHJcblx0XCJhcXVhbWFyaW5lXCI6IFsxMjcsIDI1NSwgMjEyXSxcclxuXHRcImF6dXJlXCI6IFsyNDAsIDI1NSwgMjU1XSxcclxuXHRcImJlaWdlXCI6IFsyNDUsIDI0NSwgMjIwXSxcclxuXHRcImJpc3F1ZVwiOiBbMjU1LCAyMjgsIDE5Nl0sXHJcblx0XCJibGFja1wiOiBbMCwgMCwgMF0sXHJcblx0XCJibGFuY2hlZGFsbW9uZFwiOiBbMjU1LCAyMzUsIDIwNV0sXHJcblx0XCJibHVlXCI6IFswLCAwLCAyNTVdLFxyXG5cdFwiYmx1ZXZpb2xldFwiOiBbMTM4LCA0MywgMjI2XSxcclxuXHRcImJyb3duXCI6IFsxNjUsIDQyLCA0Ml0sXHJcblx0XCJidXJseXdvb2RcIjogWzIyMiwgMTg0LCAxMzVdLFxyXG5cdFwiY2FkZXRibHVlXCI6IFs5NSwgMTU4LCAxNjBdLFxyXG5cdFwiY2hhcnRyZXVzZVwiOiBbMTI3LCAyNTUsIDBdLFxyXG5cdFwiY2hvY29sYXRlXCI6IFsyMTAsIDEwNSwgMzBdLFxyXG5cdFwiY29yYWxcIjogWzI1NSwgMTI3LCA4MF0sXHJcblx0XCJjb3JuZmxvd2VyYmx1ZVwiOiBbMTAwLCAxNDksIDIzN10sXHJcblx0XCJjb3Juc2lsa1wiOiBbMjU1LCAyNDgsIDIyMF0sXHJcblx0XCJjcmltc29uXCI6IFsyMjAsIDIwLCA2MF0sXHJcblx0XCJjeWFuXCI6IFswLCAyNTUsIDI1NV0sXHJcblx0XCJkYXJrYmx1ZVwiOiBbMCwgMCwgMTM5XSxcclxuXHRcImRhcmtjeWFuXCI6IFswLCAxMzksIDEzOV0sXHJcblx0XCJkYXJrZ29sZGVucm9kXCI6IFsxODQsIDEzNCwgMTFdLFxyXG5cdFwiZGFya2dyYXlcIjogWzE2OSwgMTY5LCAxNjldLFxyXG5cdFwiZGFya2dyZWVuXCI6IFswLCAxMDAsIDBdLFxyXG5cdFwiZGFya2dyZXlcIjogWzE2OSwgMTY5LCAxNjldLFxyXG5cdFwiZGFya2toYWtpXCI6IFsxODksIDE4MywgMTA3XSxcclxuXHRcImRhcmttYWdlbnRhXCI6IFsxMzksIDAsIDEzOV0sXHJcblx0XCJkYXJrb2xpdmVncmVlblwiOiBbODUsIDEwNywgNDddLFxyXG5cdFwiZGFya29yYW5nZVwiOiBbMjU1LCAxNDAsIDBdLFxyXG5cdFwiZGFya29yY2hpZFwiOiBbMTUzLCA1MCwgMjA0XSxcclxuXHRcImRhcmtyZWRcIjogWzEzOSwgMCwgMF0sXHJcblx0XCJkYXJrc2FsbW9uXCI6IFsyMzMsIDE1MCwgMTIyXSxcclxuXHRcImRhcmtzZWFncmVlblwiOiBbMTQzLCAxODgsIDE0M10sXHJcblx0XCJkYXJrc2xhdGVibHVlXCI6IFs3MiwgNjEsIDEzOV0sXHJcblx0XCJkYXJrc2xhdGVncmF5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmtzbGF0ZWdyZXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3R1cnF1b2lzZVwiOiBbMCwgMjA2LCAyMDldLFxyXG5cdFwiZGFya3Zpb2xldFwiOiBbMTQ4LCAwLCAyMTFdLFxyXG5cdFwiZGVlcHBpbmtcIjogWzI1NSwgMjAsIDE0N10sXHJcblx0XCJkZWVwc2t5Ymx1ZVwiOiBbMCwgMTkxLCAyNTVdLFxyXG5cdFwiZGltZ3JheVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkaW1ncmV5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRvZGdlcmJsdWVcIjogWzMwLCAxNDQsIDI1NV0sXHJcblx0XCJmaXJlYnJpY2tcIjogWzE3OCwgMzQsIDM0XSxcclxuXHRcImZsb3JhbHdoaXRlXCI6IFsyNTUsIDI1MCwgMjQwXSxcclxuXHRcImZvcmVzdGdyZWVuXCI6IFszNCwgMTM5LCAzNF0sXHJcblx0XCJmdWNoc2lhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJnYWluc2Jvcm9cIjogWzIyMCwgMjIwLCAyMjBdLFxyXG5cdFwiZ2hvc3R3aGl0ZVwiOiBbMjQ4LCAyNDgsIDI1NV0sXHJcblx0XCJnb2xkXCI6IFsyNTUsIDIxNSwgMF0sXHJcblx0XCJnb2xkZW5yb2RcIjogWzIxOCwgMTY1LCAzMl0sXHJcblx0XCJncmF5XCI6IFsxMjgsIDEyOCwgMTI4XSxcclxuXHRcImdyZWVuXCI6IFswLCAxMjgsIDBdLFxyXG5cdFwiZ3JlZW55ZWxsb3dcIjogWzE3MywgMjU1LCA0N10sXHJcblx0XCJncmV5XCI6IFsxMjgsIDEyOCwgMTI4XSxcclxuXHRcImhvbmV5ZGV3XCI6IFsyNDAsIDI1NSwgMjQwXSxcclxuXHRcImhvdHBpbmtcIjogWzI1NSwgMTA1LCAxODBdLFxyXG5cdFwiaW5kaWFucmVkXCI6IFsyMDUsIDkyLCA5Ml0sXHJcblx0XCJpbmRpZ29cIjogWzc1LCAwLCAxMzBdLFxyXG5cdFwiaXZvcnlcIjogWzI1NSwgMjU1LCAyNDBdLFxyXG5cdFwia2hha2lcIjogWzI0MCwgMjMwLCAxNDBdLFxyXG5cdFwibGF2ZW5kZXJcIjogWzIzMCwgMjMwLCAyNTBdLFxyXG5cdFwibGF2ZW5kZXJibHVzaFwiOiBbMjU1LCAyNDAsIDI0NV0sXHJcblx0XCJsYXduZ3JlZW5cIjogWzEyNCwgMjUyLCAwXSxcclxuXHRcImxlbW9uY2hpZmZvblwiOiBbMjU1LCAyNTAsIDIwNV0sXHJcblx0XCJsaWdodGJsdWVcIjogWzE3MywgMjE2LCAyMzBdLFxyXG5cdFwibGlnaHRjb3JhbFwiOiBbMjQwLCAxMjgsIDEyOF0sXHJcblx0XCJsaWdodGN5YW5cIjogWzIyNCwgMjU1LCAyNTVdLFxyXG5cdFwibGlnaHRnb2xkZW5yb2R5ZWxsb3dcIjogWzI1MCwgMjUwLCAyMTBdLFxyXG5cdFwibGlnaHRncmF5XCI6IFsyMTEsIDIxMSwgMjExXSxcclxuXHRcImxpZ2h0Z3JlZW5cIjogWzE0NCwgMjM4LCAxNDRdLFxyXG5cdFwibGlnaHRncmV5XCI6IFsyMTEsIDIxMSwgMjExXSxcclxuXHRcImxpZ2h0cGlua1wiOiBbMjU1LCAxODIsIDE5M10sXHJcblx0XCJsaWdodHNhbG1vblwiOiBbMjU1LCAxNjAsIDEyMl0sXHJcblx0XCJsaWdodHNlYWdyZWVuXCI6IFszMiwgMTc4LCAxNzBdLFxyXG5cdFwibGlnaHRza3libHVlXCI6IFsxMzUsIDIwNiwgMjUwXSxcclxuXHRcImxpZ2h0c2xhdGVncmF5XCI6IFsxMTksIDEzNiwgMTUzXSxcclxuXHRcImxpZ2h0c2xhdGVncmV5XCI6IFsxMTksIDEzNiwgMTUzXSxcclxuXHRcImxpZ2h0c3RlZWxibHVlXCI6IFsxNzYsIDE5NiwgMjIyXSxcclxuXHRcImxpZ2h0eWVsbG93XCI6IFsyNTUsIDI1NSwgMjI0XSxcclxuXHRcImxpbWVcIjogWzAsIDI1NSwgMF0sXHJcblx0XCJsaW1lZ3JlZW5cIjogWzUwLCAyMDUsIDUwXSxcclxuXHRcImxpbmVuXCI6IFsyNTAsIDI0MCwgMjMwXSxcclxuXHRcIm1hcm9vblwiOiBbMTI4LCAwLCAwXSxcclxuXHRcIm1lZGl1bWFxdWFtYXJpbmVcIjogWzEwMiwgMjA1LCAxNzBdLFxyXG5cdFwibWVkaXVtYmx1ZVwiOiBbMCwgMCwgMjA1XSxcclxuXHRcIm1lZGl1bW9yY2hpZFwiOiBbMTg2LCA4NSwgMjExXSxcclxuXHRcIm1lZGl1bXB1cnBsZVwiOiBbMTQ3LCAxMTIsIDIxOV0sXHJcblx0XCJtZWRpdW1zZWFncmVlblwiOiBbNjAsIDE3OSwgMTEzXSxcclxuXHRcIm1lZGl1bXNsYXRlYmx1ZVwiOiBbMTIzLCAxMDQsIDIzOF0sXHJcblx0XCJtZWRpdW1zcHJpbmdncmVlblwiOiBbMCwgMjUwLCAxNTRdLFxyXG5cdFwibWVkaXVtdHVycXVvaXNlXCI6IFs3MiwgMjA5LCAyMDRdLFxyXG5cdFwibWVkaXVtdmlvbGV0cmVkXCI6IFsxOTksIDIxLCAxMzNdLFxyXG5cdFwibWlkbmlnaHRibHVlXCI6IFsyNSwgMjUsIDExMl0sXHJcblx0XCJtaW50Y3JlYW1cIjogWzI0NSwgMjU1LCAyNTBdLFxyXG5cdFwibWlzdHlyb3NlXCI6IFsyNTUsIDIyOCwgMjI1XSxcclxuXHRcIm1vY2Nhc2luXCI6IFsyNTUsIDIyOCwgMTgxXSxcclxuXHRcIm5hdmFqb3doaXRlXCI6IFsyNTUsIDIyMiwgMTczXSxcclxuXHRcIm5hdnlcIjogWzAsIDAsIDEyOF0sXHJcblx0XCJvbGRsYWNlXCI6IFsyNTMsIDI0NSwgMjMwXSxcclxuXHRcIm9saXZlXCI6IFsxMjgsIDEyOCwgMF0sXHJcblx0XCJvbGl2ZWRyYWJcIjogWzEwNywgMTQyLCAzNV0sXHJcblx0XCJvcmFuZ2VcIjogWzI1NSwgMTY1LCAwXSxcclxuXHRcIm9yYW5nZXJlZFwiOiBbMjU1LCA2OSwgMF0sXHJcblx0XCJvcmNoaWRcIjogWzIxOCwgMTEyLCAyMTRdLFxyXG5cdFwicGFsZWdvbGRlbnJvZFwiOiBbMjM4LCAyMzIsIDE3MF0sXHJcblx0XCJwYWxlZ3JlZW5cIjogWzE1MiwgMjUxLCAxNTJdLFxyXG5cdFwicGFsZXR1cnF1b2lzZVwiOiBbMTc1LCAyMzgsIDIzOF0sXHJcblx0XCJwYWxldmlvbGV0cmVkXCI6IFsyMTksIDExMiwgMTQ3XSxcclxuXHRcInBhcGF5YXdoaXBcIjogWzI1NSwgMjM5LCAyMTNdLFxyXG5cdFwicGVhY2hwdWZmXCI6IFsyNTUsIDIxOCwgMTg1XSxcclxuXHRcInBlcnVcIjogWzIwNSwgMTMzLCA2M10sXHJcblx0XCJwaW5rXCI6IFsyNTUsIDE5MiwgMjAzXSxcclxuXHRcInBsdW1cIjogWzIyMSwgMTYwLCAyMjFdLFxyXG5cdFwicG93ZGVyYmx1ZVwiOiBbMTc2LCAyMjQsIDIzMF0sXHJcblx0XCJwdXJwbGVcIjogWzEyOCwgMCwgMTI4XSxcclxuXHRcInJlZFwiOiBbMjU1LCAwLCAwXSxcclxuXHRcInJvc3licm93blwiOiBbMTg4LCAxNDMsIDE0M10sXHJcblx0XCJyb3lhbGJsdWVcIjogWzY1LCAxMDUsIDIyNV0sXHJcblx0XCJzYWRkbGVicm93blwiOiBbMTM5LCA2OSwgMTldLFxyXG5cdFwic2FsbW9uXCI6IFsyNTAsIDEyOCwgMTE0XSxcclxuXHRcInNhbmR5YnJvd25cIjogWzI0NCwgMTY0LCA5Nl0sXHJcblx0XCJzZWFncmVlblwiOiBbNDYsIDEzOSwgODddLFxyXG5cdFwic2Vhc2hlbGxcIjogWzI1NSwgMjQ1LCAyMzhdLFxyXG5cdFwic2llbm5hXCI6IFsxNjAsIDgyLCA0NV0sXHJcblx0XCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxyXG5cdFwic2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDIzNV0sXHJcblx0XCJzbGF0ZWJsdWVcIjogWzEwNiwgOTAsIDIwNV0sXHJcblx0XCJzbGF0ZWdyYXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic2xhdGVncmV5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNub3dcIjogWzI1NSwgMjUwLCAyNTBdLFxyXG5cdFwic3ByaW5nZ3JlZW5cIjogWzAsIDI1NSwgMTI3XSxcclxuXHRcInN0ZWVsYmx1ZVwiOiBbNzAsIDEzMCwgMTgwXSxcclxuXHRcInRhblwiOiBbMjEwLCAxODAsIDE0MF0sXHJcblx0XCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXHJcblx0XCJ0aGlzdGxlXCI6IFsyMTYsIDE5MSwgMjE2XSxcclxuXHRcInRvbWF0b1wiOiBbMjU1LCA5OSwgNzFdLFxyXG5cdFwidHVycXVvaXNlXCI6IFs2NCwgMjI0LCAyMDhdLFxyXG5cdFwidmlvbGV0XCI6IFsyMzgsIDEzMCwgMjM4XSxcclxuXHRcIndoZWF0XCI6IFsyNDUsIDIyMiwgMTc5XSxcclxuXHRcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcclxuXHRcIndoaXRlc21va2VcIjogWzI0NSwgMjQ1LCAyNDVdLFxyXG5cdFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF0sXHJcblx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LCAyMDUsIDUwXVxyXG59IiwiLyoqXHJcbiAqIEBtb2R1bGUgSWNpY2xlXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRmcmVlemU6IGxvY2ssXHJcblx0dW5mcmVlemU6IHVubG9jayxcclxuXHRpc0Zyb3plbjogaXNMb2NrZWRcclxufTtcclxuXHJcblxyXG4vKiogU2V0IG9mIHRhcmdldHMgICovXHJcbnZhciBsb2NrQ2FjaGUgPSBuZXcgV2Vha01hcDtcclxuXHJcblxyXG4vKipcclxuICogU2V0IGZsYWcgb24gdGFyZ2V0IHdpdGggdGhlIG5hbWUgcGFzc2VkXHJcbiAqXHJcbiAqIEByZXR1cm4ge2Jvb2x9IFdoZXRoZXIgbG9jayBzdWNjZWVkZWRcclxuICovXHJcbmZ1bmN0aW9uIGxvY2sodGFyZ2V0LCBuYW1lKXtcclxuXHR2YXIgbG9ja3MgPSBsb2NrQ2FjaGUuZ2V0KHRhcmdldCk7XHJcblx0aWYgKGxvY2tzICYmIGxvY2tzW25hbWVdKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdC8vY3JlYXRlIGxvY2sgc2V0IGZvciBhIHRhcmdldCwgaWYgbm9uZVxyXG5cdGlmICghbG9ja3MpIHtcclxuXHRcdGxvY2tzID0ge307XHJcblx0XHRsb2NrQ2FjaGUuc2V0KHRhcmdldCwgbG9ja3MpO1xyXG5cdH1cclxuXHJcblx0Ly9zZXQgYSBuZXcgbG9ja1xyXG5cdGxvY2tzW25hbWVdID0gdHJ1ZTtcclxuXHJcblx0Ly9yZXR1cm4gc3VjY2Vzc1xyXG5cdHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFVuc2V0IGZsYWcgb24gdGhlIHRhcmdldCB3aXRoIHRoZSBuYW1lIHBhc3NlZC5cclxuICpcclxuICogTm90ZSB0aGF0IGlmIHRvIHJldHVybiBuZXcgdmFsdWUgZnJvbSB0aGUgbG9jay91bmxvY2ssXHJcbiAqIHRoZW4gdW5sb2NrIHdpbGwgYWx3YXlzIHJldHVybiBmYWxzZSBhbmQgbG9jayB3aWxsIGFsd2F5cyByZXR1cm4gdHJ1ZSxcclxuICogd2hpY2ggaXMgdXNlbGVzcyBmb3IgdGhlIHVzZXIsIHRob3VnaCBtYXliZSBpbnR1aXRpdmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gdGFyZ2V0IEFueSBvYmplY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBmbGFnIG5hbWVcclxuICpcclxuICogQHJldHVybiB7Ym9vbH0gV2hldGhlciB1bmxvY2sgZmFpbGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gdW5sb2NrKHRhcmdldCwgbmFtZSl7XHJcblx0dmFyIGxvY2tzID0gbG9ja0NhY2hlLmdldCh0YXJnZXQpO1xyXG5cdGlmICghbG9ja3MgfHwgIWxvY2tzW25hbWVdKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGxvY2tzW25hbWVdID0gbnVsbDtcclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUmV0dXJuIHdoZXRoZXIgZmxhZyBpcyBzZXRcclxuICpcclxuICogQHBhcmFtIHsqfSB0YXJnZXQgQW55IG9iamVjdCB0byBhc3NvY2lhdGUgbG9jayB3aXRoXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgZmxhZyBuYW1lXHJcbiAqXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgbG9ja2VkIG9yIG5vdFxyXG4gKi9cclxuZnVuY3Rpb24gaXNMb2NrZWQodGFyZ2V0LCBuYW1lKXtcclxuXHR2YXIgbG9ja3MgPSBsb2NrQ2FjaGUuZ2V0KHRhcmdldCk7XHJcblx0cmV0dXJuIChsb2NrcyAmJiBsb2Nrc1tuYW1lXSk7XHJcbn0iLCIvKipcbiAqIENoZXNzIGdyaWQgdHJpdmlhbCByZW5kZXJlclxuICpcbiAqIEBtb2R1bGUgY29sb3ItcmFuZ2VyL2NoZXNzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJHcmlkO1xuXG5cbi8qKlxuICogUmVuZGVyIHRyYW5zcGFyZW5jeSBncmlkLlxuICogSW1hZ2UgZGF0YSBpcyBzcGxpdCBpbiB0d28gZXF1YWxseVxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IGEgUmdiIHZhbHVlcyByZXByZXNlbnRpbmcgXCJ3aGl0ZVwiIGNlbGxcbiAqIEBwYXJhbSB7YXJyYXl9IGIgUmdiIHZhbHVlcyByZXByZXNlbnRpbmcgXCJibGFja1wiIGNlbGxcbiAqIEBwYXJhbSB7SW1hZ2VEYXRhfSBpbWdEYXRhIEEgZGF0YSB0YWtlbiBhcyBhIGJhc2UgZm9yIGdyaWRcbiAqXG4gKiBAcmV0dXJuIHtJbWFnZURhdGF9IFJldHVybiB1cGRhdGVkIGltYWdlRGF0YVxuICovXG5mdW5jdGlvbiByZW5kZXJHcmlkKGEsIGIsIGRhdGEpe1xuXHQvL3N1cHBvc2Ugc3F1YXJlIGRhdGFcblx0dmFyIHcgPSBNYXRoLmZsb29yKE1hdGguc3FydChkYXRhLmxlbmd0aCAvIDQpKSwgaCA9IHc7XG5cblx0dmFyIGNlbGxIID0gfn4oaC8yKTtcblx0dmFyIGNlbGxXID0gfn4ody8yKTtcblxuXHQvL2NvbnZlcnQgYWxwaGFzIHRvIDI1NVxuXHRpZiAoYS5sZW5ndGggPT09IDQpIGFbM10gKj0gMjU1O1xuXHRpZiAoYi5sZW5ndGggPT09IDQpIGJbM10gKj0gMjU1O1xuXG5cdGZvciAodmFyIHk9MCwgY29sLCByb3c7IHkgPCBoOyB5Kyspe1xuXHRcdHJvdyA9IHkgKiB3ICogNDtcblx0XHRmb3IgKCB2YXIgeD0wOyB4IDwgdzsgeCsrKXtcblx0XHRcdGNvbCA9IHJvdyArIHggKiA0O1xuXHRcdFx0ZGF0YS5zZXQoeCA+PSBjZWxsVyA/ICh5ID49IGNlbGxIID8gYSA6IGIpIDogKHkgPj0gY2VsbEggPyBiIDogYSksIGNvbCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRhdGE7XG59IiwiLyoqXG4gKiBDcmVhdGUgd29ya2VyIGZvciByZW5kZXJpbmcgcmFuZ2VzXG4gKlxuICogQG1vZHVsZSBjb2xvci1yYW5nZXIvd29ya2VyXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRXb3JrZXI7XG5cblxudmFyIHJlbmRlciA9IHJlcXVpcmUoJy4vJyk7XG52YXIgdG9Tb3VyY2UgPSByZXF1aXJlKCdjb2xvci1zcGFjZS91dGlsL3RvLXNvdXJjZScpO1xuXG4vKipcbiAqIFJldHVybiBhIG5ldyB3b3JrZXIsIGlmIHN1cHBvcnRlZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBzcGFjZXMgQSBzZXQgb2Ygc3BhY2VzIHRvIGluaXQgaW4gd2ViLXdvcmtlclxuICpcbiAqIEByZXR1cm4ge1dvcmtlcn0gIEEgd2ViLXdvcmtlciwgYWNjZXB0aW5nIG1lc3NhZ2VzIHdpdGggZGF0YTpcbiAqICAgICAgICAgICAgICAgICAgIHtcbiAqICAgICAgICAgICAgICAgICAgIFx0cmdiOiByZ2JBcnJheSxcbiAqICAgICAgICAgICAgICAgICAgIFx0dHlwZTogKCdwb2xhcid8J3JlY3QnKVxuICogICAgICAgICAgICAgICAgICAgXHRzcGFjZTogJzxzcGFjZU5hbWU+LFxuICogICAgICAgICAgICAgICAgICAgXHRjaGFubmVsOiA8Y2hhbm5lbCBpbmRleGVzPixcbiAqICAgICAgICAgICAgICAgICAgIFx0bWF4OiBbMzYwLCAxMDBdLFxuICogICAgICAgICAgICAgICAgICAgXHRtaW46IFswLCAwXSxcbiAqICAgICAgICAgICAgICAgICAgIFx0ZGF0YTogSW1hZ2VEYXRhLFxuICogICAgICAgICAgICAgICAgICAgXHRpZDogMVxuICogICAgICAgICAgICAgICAgICAgfVxuICogICAgICAgICAgICAgICAgICAgVGhlIGRhdGEgaXMgdGhlIHNhbWUgYXMgYXJndW1lbnRzIGZvciB0aGUgYHJlbmRlcmAgbWV0aG9kXG4gKiAgICAgICAgICAgICAgICAgICBleGNlcHQgZm9yIGBpZGAsIHdoaWNoIGlzIHJldHVybmVkIGluIHJlc3BvbnNlIHVuY2hhbmdlZFxuICogICAgICAgICAgICAgICAgICAgdG8gaWRlbnRpZnkgdGhlIHJlcXVlc3QuXG4gKi9cbmZ1bmN0aW9uIGdldFdvcmtlcihzcGFjZXMpe1xuXHQvL2lubGluZSB3b3JrZXIgLSBpc27igJl0IHNsb3dlciBvbiBpbml0ICYgd29yayB0aGFuIGEgZmlsZSBsb2FkZXJcblx0Ly8gY2FsbCBVUkwucmV2b2tlT2JqZWN0VVJMKCBibG9iVVJMICk7IGlmIHlvdeKAmXJlIGZpbmlzaGVkXG5cdHZhciBibG9iVVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTCggbmV3IEJsb2IoW1xuXHRcdC8vZXhwb3J0IGBjb2xvci1yYW5nZXJgXG5cdFx0J3ZhciByZW5kZXIgPSAnLCByZW5kZXIudG9TdHJpbmcoKSArICdcXG4nLFxuXG5cdFx0Ly9leHBvcnQgYGNvbG9yLXNwYWNlYFxuXHRcdCd2YXIgY29udmVydCA9ICcgKyB0b1NvdXJjZShzcGFjZXMpICsgJ1xcbicsXG5cblx0XHQvL2V4cG9ydCBtZXNzYWdlIGhhbmRsZXJcblx0XHQnOygnLFxuXHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRzZWxmLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHR2YXIgZGF0YSA9IGUuZGF0YSwgcmVzdWx0O1xuXG5cdFx0XHRcdC8vaWdub3JlIGVtcHR5IGRhdGFcblx0XHRcdFx0aWYgKCFkYXRhKSByZXR1cm4gcG9zdE1lc3NhZ2UoZmFsc2UpO1xuXG5cdFx0XHRcdHJlc3VsdCA9IHJlbmRlcihkYXRhLnJnYiwgZGF0YS5kYXRhLCBkYXRhKTtcblxuXHRcdFx0XHRwb3N0TWVzc2FnZSh7XG5cdFx0XHRcdFx0ZGF0YTogcmVzdWx0LFxuXHRcdFx0XHRcdGlkOiBlLmRhdGEuaWRcblx0XHRcdFx0fSk7XG5cdFx0XHR9O1xuXHRcdH0udG9TdHJpbmcoKSxcblx0XHQnKSgpOydcblx0XSwgeyB0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcgfSApICk7XG5cblx0dmFyIHdvcmtlciA9IG5ldyBXb3JrZXIoYmxvYlVSTCk7XG5cblx0cmV0dXJuIHdvcmtlcjtcbn0iLCIvKipcbiAqIEEgc29tZXdoYXQgYWJzdHJhY3QgcmVuZGVyZXIuXG4gKlxuICogQG1vZHVsZSBjb2xvci1yYW5nZXIvcmVuZGVyXG4gKi9cblxudmFyIGNvbnZlcnQgPSByZXF1aXJlKCdjb2xvci1zcGFjZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjtcblxuXG4vL2RlZmF1bHQgb3B0aW9ucyBmb3IgZGVmYXVsdCByZW5kZXJpbmdcbnZhciBkZWZhdWx0cyA9IHtcblx0Ly8zNyBpcyB0aGUgbW9zdCBvcHRpbWFsIGNhbGMgc2l6ZVxuXHQvL3lvdSBjYW4gc2NhbGUgcmVzdWx0aW5nIGltYWdlIHdpdGggbm8gc2lnbmlmaWNhbnQgcXVhbGl0eSBsb3NzXG5cdGNoYW5uZWw6IFswLDFdLFxuXHRzcGFjZTogJ3JnYidcbn07XG5cblxuLyoqXG4gKiBSZW5kZXIgcGFzc2VkIHJlY3Rhbmd1bGFyIHJhbmdlIGZvciB0aGUgY29sb3IgdG8gaW1hZ2VEYXRhLlxuICpcbiAqIEBwYXJhbSB7YXJyYXl9IHJnYiBBIGxpc3Qgb2YgcmdiIHZhbHVlcyArIG9wdGlvbmFsIGFscGhhXG4gKiBAcGFyYW0ge3N0cmluZ30gc3BhY2UgQSBzcGFjZSB0byByZW5kZXIsIG5vIGFscGhhLXN1ZmZpeFxuICogQHBhcmFtIHthcnJheX0gY2hhbm5lbHMgTGlzdCBvZiBjaGFubmVsIGluZGV4ZXMgdG8gcmVuZGVyXG4gKiBAcGFyYW0ge2FycmF5fSBtaW5zIE1pbiB2YWx1ZXMgdG8gcmVuZGVyIHJhbmdlIChjYW4gYmUgZGlmZmVyZW50IHRoYW4gc3BhY2UgbWlucylcbiAqIEBwYXJhbSB7YXJyYXl9IG1heGVzIE1heCB2YWx1ZXMgdG8gcmVuZGVyIHJhbmdlIChjYW4gYmUgZGlmZmVyZW50IHRoYW4gc3BhY2UgbWF4ZXMpXG4gKiBAcGFyYW0ge1VJbnQ4Q2FwcGVkQXJyYXl9IGJ1ZmZlciBBbiBpbWFnZSBkYXRhIGJ1ZmZlclxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsYyBBIGNhbGN1bGF0b3IgZm9yIHRoZSBzdGVwIGNvbG9yXG4gKlxuICogQHJldHVybiB7SW1hZ2VEYXRhfSBJbWFnZURhdGEgY29udGFpbmluZyBhIHJhbmdlXG4gKi9cbmZ1bmN0aW9uIHJlbmRlcihyZ2JhLCBidWZmZXIsIG9wdHMpe1xuXHQvLyBjb25zb2xlLnRpbWUoJ2NhbnYnKTtcblx0dmFyIHNpemUgPSBvcHRzLnNpemUgPSBvcHRzLnNpemUgfHwgW01hdGguZmxvb3IoTWF0aC5zcXJ0KGJ1ZmZlci5sZW5ndGggLyA0KSldO1xuXHRpZiAoc2l6ZS5sZW5ndGggPT09IDEpIHtcblx0XHRzaXplWzFdID0gc2l6ZVswXTtcblx0fVxuXG5cdHZhciBzcGFjZSA9IG9wdHMuc3BhY2UgPSBvcHRzLnNwYWNlIHx8IGRlZmF1bHRzLnNwYWNlO1xuXHR2YXIgY2hhbm5lbHMgPSBvcHRzLmNoYW5uZWwgPSBvcHRzLmNoYW5uZWwgIT09IHVuZGVmaW5lZCA/IG9wdHMuY2hhbm5lbCA6IGRlZmF1bHRzLmNoYW5uZWw7XG5cblx0dmFyIG1pbnMgPSBvcHRzLm1pbiA9IG9wdHMubWluIHx8IFtdLFxuXHRcdG1heGVzID0gb3B0cy5tYXhlcyA9IG9wdHMubWF4IHx8IFtdO1xuXG5cdHZhciBjYWxjID0gb3B0cy50eXBlID09PSAncG9sYXInID8gIGNhbGNQb2xhclN0ZXAgOiBjYWxjUmVjdFN0ZXA7XG5cblx0Ly90YWtlIG1pbnMvbWF4ZXMgb2YgdGFyZ2V0IHNwYWNl4oCZcyBjaGFubmVsc1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5uZWxzLmxlbmd0aDsgaSsrKXtcblx0XHRpZiAobWlucy5sZW5ndGggPCBjaGFubmVscy5sZW5ndGgpIHtcblx0XHRcdG1pbnNbaV0gPSBjb252ZXJ0W3NwYWNlXS5taW5bY2hhbm5lbHNbaV1dIHx8IDA7XG5cdFx0fVxuXHRcdGlmIChtYXhlcy5sZW5ndGggPCBjaGFubmVscy5sZW5ndGgpIHtcblx0XHRcdG1heGVzW2ldID0gY29udmVydFtzcGFjZV0ubWF4W2NoYW5uZWxzW2ldXSB8fCAyNTU7XG5cdFx0fVxuXHR9XG5cblx0dmFyIGlzQ01ZSyA9IHNwYWNlID09PSAnY215ayc7XG5cblx0Ly9hZGQgYWxwaGFcblx0aWYgKHJnYmEubGVuZ3RoID09PSA0KSB7cmdiYVszXSAqPSAyNTU7fVxuXHRpZiAocmdiYS5sZW5ndGggPT09IDMpIHtyZ2JhWzNdID0gMjU1O31cblxuXHQvL2dldCBzcGVjaWZpYyBzcGFjZSB2YWx1ZXNcblx0dmFyIHZhbHVlcztcblx0aWYgKHNwYWNlID09PSAncmdiJykge1xuXHRcdHZhbHVlcyA9IHJnYmEuc2xpY2UoKTtcblx0fSBlbHNlIHtcblx0XHR2YWx1ZXMgPSBjb252ZXJ0LnJnYltzcGFjZV0ocmdiYSk7XG5cdFx0aWYgKCFpc0NNWUsgJiYgdmFsdWVzLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0dmFsdWVzWzNdID0gcmdiYVszXTtcblx0XHR9XG5cdH1cblxuXHQvL3Jlc29sdmUgYWJzZW50IGluZGV4ZXNcblx0dmFyIG5vSWR4ID0gW107XG5cdGZvciAoaSA9IHNwYWNlLmxlbmd0aDsgaS0tOyl7XG5cdFx0aWYgKGkgIT09IGNoYW5uZWxzWzBdICYmIGkgIT09IGNoYW5uZWxzWzFdKSB7XG5cdFx0XHRub0lkeC5wdXNoKGkpO1xuXHRcdH1cblx0fVxuXHR2YXIgbm9JZHgxID0gbm9JZHhbMF07XG5cdHZhciBub0lkeDIgPSBub0lkeFsxXTtcblx0dmFyIG5vSWR4MyA9IG5vSWR4WzJdO1xuXG5cdC8vZ2V0IGNvbnZlcnRpbmcgZm5cblx0dmFyIGNvbnZlcnRlciA9IHNwYWNlID09PSAncmdiJyA/IGZ1bmN0aW9uKGEpe3JldHVybiBhO30gOiBjb252ZXJ0W3NwYWNlXS5yZ2I7XG5cblx0Zm9yICh2YXIgeCwgeSA9IHNpemVbMV0sIHJvdywgY29sLCByZXMsIHN0ZXBWYWxzID0gdmFsdWVzLnNsaWNlKCk7IHktLTspIHtcblx0XHRyb3cgPSB5ICogc2l6ZVswXSAqIDQ7XG5cblx0XHRmb3IgKHggPSAwOyB4IDwgc2l6ZVswXTsgeCsrKSB7XG5cdFx0XHRjb2wgPSByb3cgKyB4ICogNDtcblxuXHRcdFx0Ly9jYWxjdWxhdGUgY29sb3Jcblx0XHRcdHN0ZXBWYWxzID0gY2FsYyh4LHksIHN0ZXBWYWxzLCBzaXplLCBjaGFubmVscywgbWlucywgbWF4ZXMpO1xuXG5cdFx0XHRpZiAobm9JZHgxIHx8IG5vSWR4MSA9PT0gMCkge1xuXHRcdFx0XHRzdGVwVmFsc1tub0lkeDFdID0gdmFsdWVzW25vSWR4MV07XG5cdFx0XHR9XG5cdFx0XHRpZiAobm9JZHgyIHx8IG5vSWR4MiA9PT0gMCkge1xuXHRcdFx0XHRzdGVwVmFsc1tub0lkeDJdID0gdmFsdWVzW25vSWR4Ml07XG5cdFx0XHR9XG5cdFx0XHRpZiAobm9JZHgzIHx8IG5vSWR4MyA9PT0gMCkge1xuXHRcdFx0XHRzdGVwVmFsc1tub0lkeDNdID0gdmFsdWVzW25vSWR4M107XG5cdFx0XHR9XG5cblx0XHRcdC8vZmlsbCBpbWFnZSBkYXRhXG5cdFx0XHRyZXMgPSBjb252ZXJ0ZXIoc3RlcFZhbHMpO1xuXHRcdFx0cmVzWzNdID0gaXNDTVlLID8gMjU1IDogc3RlcFZhbHNbM107XG5cblx0XHRcdGJ1ZmZlci5zZXQocmVzLCBjb2wpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBidWZmZXI7XG5cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHBvbGFyIHN0ZXBcblx0ICpcblx0ICogQHBhcmFtIHtbdHlwZV19IHggW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcGFyYW0ge1t0eXBlXX0geSBbZGVzY3JpcHRpb25dXG5cdCAqIEBwYXJhbSB7W3R5cGVdfSB2YWxzIFtkZXNjcmlwdGlvbl1cblx0ICogQHBhcmFtIHtbdHlwZV19IHNpemUgW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcGFyYW0ge1t0eXBlXX0gY2hhbm5lbHMgW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcGFyYW0ge1t0eXBlXX0gbWlucyBbZGVzY3JpcHRpb25dXG5cdCAqIEBwYXJhbSB7W3R5cGVdfSBtYXhlcyBbZGVzY3JpcHRpb25dXG5cdCAqXG5cdCAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuXHQgKi9cblx0ZnVuY3Rpb24gY2FsY1BvbGFyU3RlcCh4LHksIHZhbHMsIHNpemUsIGNoYW5uZWxzLCBtaW5zLCBtYXhlcyl7XG5cdFx0Ly9jZXQgY2VudGVyXG5cdFx0dmFyIGN4ID0gc2l6ZVswXS8yLCBjeSA9IHNpemVbMV0vMjtcblxuXHRcdC8vZ2V0IHJhZGl1c1xuXHRcdHZhciByID0gTWF0aC5zcXJ0KChjeC14KSooY3gteCkgKyAoY3kteSkqKGN5LXkpKTtcblxuXHRcdC8vbm9ybWFsaXplIHJhZGl1c1xuXHRcdHZhciBuciA9IHIgLyBjeDtcblxuXHRcdC8vZ2V0IGFuZ2xlXG5cdFx0dmFyIGEgPSBNYXRoLmF0YW4yKCBjeS15LCBjeC14ICk7XG5cblx0XHQvL2dldCBub3JtYWxpemVkIGFuZ2xlIChhdm9pZCBuZWdhdGl2ZSB2YWx1ZXMpXG5cdFx0dmFyIG5hID0gKGEgKyBNYXRoLlBJKS9NYXRoLlBJLzI7XG5cblxuXHRcdC8vY2ggMSBpcyByYWRpdXNcblx0XHRpZiAoY2hhbm5lbHNbMV0gfHwgY2hhbm5lbHNbMV0gPT09IDApIHtcblx0XHRcdHZhbHNbY2hhbm5lbHNbMV1dID0gbWluc1sxXSArIChtYXhlc1sxXSAtIG1pbnNbMV0pICogbnI7XG5cdFx0fVxuXG5cdFx0Ly9jaCAyIGlzIGFuZ2xlXG5cdFx0aWYgKGNoYW5uZWxzWzBdIHx8IGNoYW5uZWxzWzBdID09PSAwKSB7XG5cdFx0XHR2YWxzW2NoYW5uZWxzWzBdXSA9IG1pbnNbMF0gKyAobWF4ZXNbMF0gLSBtaW5zWzBdKSAqIG5hO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWxzO1xuXHR9XG5cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHN0ZXAgdmFsdWVzIGZvciBhIHJlY3Rhbmd1bGFyIHJhbmdlXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHZhbHMgc3RlcCB2YWx1ZXMgdG8gY2FsY1xuXHQgKiBAcGFyYW0ge2FycmF5fSBzaXplIHNpemUgb2YgcmVjdFxuXHQgKiBAcGFyYW0ge2FycmF5fSBtaW5zIG1pbiBjMSxjMlxuXHQgKiBAcGFyYW0ge2FycmF5fSBtYXhlcyBtYXggYzEsYzJcblx0ICpcblx0ICogQHJldHVybiB7YXJyYXl9IFtkZXNjcmlwdGlvbl1cblx0ICovXG5cdGZ1bmN0aW9uIGNhbGNSZWN0U3RlcCh4LHksIHZhbHMsIHNpemUsIGNoYW5uZWxzLCBtaW5zLCBtYXhlcyl7XG5cdFx0aWYgKGNoYW5uZWxzWzFdIHx8IGNoYW5uZWxzWzFdID09PSAwKSB7XG5cdFx0XHR2YWxzW2NoYW5uZWxzWzFdXSA9IG1pbnNbMV0gKyAobWF4ZXNbMV0gLSBtaW5zWzFdKSAqICgxIC0geSAvIChzaXplWzFdIC0gMSkpO1xuXHRcdH1cblx0XHRpZiAoY2hhbm5lbHNbMF0gfHwgY2hhbm5lbHNbMF0gPT09IDApIHtcblx0XHRcdHZhbHNbY2hhbm5lbHNbMF1dID0gbWluc1swXSArIChtYXhlc1swXSAtIG1pbnNbMF0pICogeCAvIChzaXplWzBdIC0gMSk7XG5cdFx0fVxuXHRcdHJldHVybiB2YWxzO1xuXHR9XG59IiwiLyoqXG4gKiBAbW9kdWxlIGNvbG9yLXNwYWNlXG4gKlxuICogQHRvZG8gIHRvLXNvdXJjZSBtZXRob2QsIHByZXBhcmluZyB0aGUgY29kZSBmb3Igd2Vid29ya2VyXG4gKiBAdG9kbyAgaW1wbGVtZW50IGFsbCBzaWRlIHNwYWNlcyBmcm9tIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2F0ZWdvcnk6Q29sb3Jfc3BhY2UgeXV2LCB5aXEgZXRjLlxuICogQHRvZG8gIGhlcmUgYXJlIGFkZGl0aW9uYWwgc3BhY2VzIGh0dHA6Ly93d3cuamVudHJvbmljcy5jb20vY29sb3IuaHRtbCBJVFUsIFJFQzcwOSwgU01UUEUsIE5UU0MsIEdSRVlcbiAqXG4gKiBAdG9kbyBpbXBsZW1lbnQgYXNtLWpzIHdheSB0byBjb252ZXJ0IHNwYWNlcyAocHJvbWlzZXMgdG8gYmUgdGltZXMgZmFzdGVyKVxuICpcbiAqL1xuXG52YXIgYWRkQ29udmVydG9yID0gcmVxdWlyZSgnLi91dGlsL2FkZC1jb252ZXJ0b3InKTtcblxuXG4vKiogRXhwb3J0ZWQgc3BhY2VzICovXG52YXIgc3BhY2VzID0ge1xuXHRyZ2I6IHJlcXVpcmUoJy4vcmdiJyksXG5cdGhzbDogcmVxdWlyZSgnLi9oc2wnKSxcblx0aHN2OiByZXF1aXJlKCcuL2hzdicpLFxuXHRod2I6IHJlcXVpcmUoJy4vaHdiJyksXG5cdGNteWs6IHJlcXVpcmUoJy4vY215aycpLFxuXHR4eXo6IHJlcXVpcmUoJy4veHl6JyksXG5cdGxhYjogcmVxdWlyZSgnLi9sYWInKSxcblx0bGNoYWI6IHJlcXVpcmUoJy4vbGNoYWInKSxcblx0bHV2OiByZXF1aXJlKCcuL2x1dicpLFxuXHRsY2h1djogcmVxdWlyZSgnLi9sY2h1dicpLFxuXHRodXNsOiByZXF1aXJlKCcuL2h1c2wnKSxcblx0aHVzbHA6IHJlcXVpcmUoJy4vaHVzbHAnKVxufTtcblxuXG5cbi8vYnVpbGQgYWJzZW50IGNvbnZlcnRvcnMgZnJvbSBlYWNoIHRvIGV2ZXJ5IHNwYWNlXG52YXIgZnJvbVNwYWNlLCB0b1NwYWNlO1xuZm9yICh2YXIgZnJvbVNwYWNlTmFtZSBpbiBzcGFjZXMpIHtcblx0ZnJvbVNwYWNlID0gc3BhY2VzW2Zyb21TcGFjZU5hbWVdO1xuXHRmb3IgKHZhciB0b1NwYWNlTmFtZSBpbiBzcGFjZXMpIHtcblx0XHRpZiAodG9TcGFjZU5hbWUgIT09IGZyb21TcGFjZU5hbWUpIHtcblx0XHRcdHRvU3BhY2UgPSBzcGFjZXNbdG9TcGFjZU5hbWVdO1xuXHRcdFx0YWRkQ29udmVydG9yKGZyb21TcGFjZSwgdG9TcGFjZSk7XG5cdFx0fVxuXHR9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBzcGFjZXM7IiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb252ZXJ0ID0gcmVxdWlyZShcImNvbG9yLXNwYWNlXCIpLFxuICAgIHN0cmluZyA9IHJlcXVpcmUoXCJjb2xvci1zdHJpbmdcIik7XG5cbnZhciBDb2xvciA9IGZ1bmN0aW9uKGNzc1N0cmluZykge1xuICBpZiAoY3NzU3RyaW5nIGluc3RhbmNlb2YgQ29sb3IpIHJldHVybiBjc3NTdHJpbmc7XG4gIGlmICghICh0aGlzIGluc3RhbmNlb2YgQ29sb3IpKSByZXR1cm4gbmV3IENvbG9yKGNzc1N0cmluZyk7XG5cbiAgIC8vIGFjdHVhbCB2YWx1ZXNcbiAgIHRoaXMudmFsdWVzID0gWzAsMCwwXTtcbiAgIHRoaXMuX2FscGhhID0gMTtcblxuICAgLy9rZWVwIGFjdHVhbCBzcGFjZSByZWZlcmVuY2VcbiAgIHRoaXMuc3BhY2UgPSAncmdiJztcblxuXG4gICAvLyBwYXJzZSBDb2xvcigpIGFyZ3VtZW50XG4gICAvL1swLDAsMF1cbiAgIGlmIChjc3NTdHJpbmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgdGhpcy52YWx1ZXMgPSBjc3NTdHJpbmc7XG4gICB9XG4gICAvL3JnYigwLDAsMClcbiAgIGVsc2UgaWYgKHR5cGVvZiBjc3NTdHJpbmcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIHZhbHMgPSBzdHJpbmcuZ2V0UmdiYShjc3NTdHJpbmcpO1xuICAgICAgaWYgKHZhbHMpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwicmdiXCIsIHZhbHMpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzID0gc3RyaW5nLmdldEhzbGEoY3NzU3RyaW5nKSkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdmFscyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHMgPSBzdHJpbmcuZ2V0SHdiKGNzc1N0cmluZykpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHdiXCIsIHZhbHMpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIHN0cmluZyBcXFwiXCIgKyBjc3NTdHJpbmcgKyBcIlxcXCJcIik7XG4gICAgICB9XG4gICB9XG4gICAvL3tyOjAsIGc6MCwgYjowfVxuICAgZWxzZSBpZiAodHlwZW9mIGNzc1N0cmluZyA9PSBcIm9iamVjdFwiKSB7XG4gICAgICB2YXIgdmFscyA9IGNzc1N0cmluZztcbiAgICAgIGlmKHZhbHNbXCJyXCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcInJlZFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcInJnYlwiLCB2YWxzKVxuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzW1wibFwiXSAhPT0gdW5kZWZpbmVkIHx8IHZhbHNbXCJsaWdodG5lc3NcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFsc1tcInZcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1widmFsdWVcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc3ZcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFsc1tcIndcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1wid2hpdGVuZXNzXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHdiXCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHNbXCJjXCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcImN5YW5cIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJjbXlrXCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gb2JqZWN0IFwiICsgSlNPTi5zdHJpbmdpZnkoY3NzU3RyaW5nKSk7XG4gICAgICB9XG4gICB9XG59O1xuXG5Db2xvci5wcm90b3R5cGUgPSB7XG4gICByZ2I6IGZ1bmN0aW9uICh2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcInJnYlwiLCBhcmd1bWVudHMpO1xuICAgfSxcbiAgIGhzbDogZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3BhY2UoXCJoc2xcIiwgYXJndW1lbnRzKTtcbiAgIH0sXG4gICBoc3Y6IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwiaHN2XCIsIGFyZ3VtZW50cyk7XG4gICB9LFxuICAgaHdiOiBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcImh3YlwiLCBhcmd1bWVudHMpO1xuICAgfSxcbiAgIGNteWs6IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwiY215a1wiLCBhcmd1bWVudHMpO1xuICAgfSxcblxuICAgcmdiQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgncmdiJyk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMuc2xpY2UoKTtcbiAgIH0sXG4gICBoc2xBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKCdoc2wnKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5zbGljZSgpO1xuICAgfSxcbiAgIGhzdkFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ2hzdicpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLnNsaWNlKCk7XG4gICB9LFxuICAgaHdiQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHdiJyk7XG4gICAgICB2YXIgaHdiID0gdGhpcy52YWx1ZXMuc2xpY2UoKVxuICAgICAgaWYgKHRoaXMuX2FscGhhICE9PSAxKSB7XG4gICAgICAgIHJldHVybiBod2IuY29uY2F0KHRoaXMuX2FscGhhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBod2I7XG4gICB9LFxuICAgY215a0FycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ2NteWsnKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5zbGljZSgpO1xuICAgfSxcbiAgIHJnYmFBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKCdyZ2InKTtcbiAgICAgIHZhciByZ2IgPSB0aGlzLnZhbHVlcy5zbGljZSgpO1xuICAgICAgcmV0dXJuIHJnYi5jb25jYXQodGhpcy5fYWxwaGEpO1xuICAgfSxcbiAgIGhzbGFBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKCdoc2wnKTtcbiAgICAgIHZhciBoc2wgPSB0aGlzLnZhbHVlcy5zbGljZSgpO1xuICAgICAgcmV0dXJuIGhzbC5jb25jYXQodGhpcy5fYWxwaGEpO1xuICAgfSxcbiAgIGFscGhhOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMuX2FscGhhO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJhbHBoYVwiLCB2YWwpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICByZWQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcInJnYlwiLCAwLCB2YWwpO1xuICAgfSxcbiAgIGdyZWVuOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJyZ2JcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICBibHVlOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJyZ2JcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICBodWU6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzbFwiLCAwLCB2YWwpO1xuICAgfSxcbiAgIHNhdHVyYXRpb246IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzbFwiLCAxLCB2YWwpO1xuICAgfSxcbiAgIGxpZ2h0bmVzczogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHNsXCIsIDIsIHZhbCk7XG4gICB9LFxuICAgc2F0dXJhdGlvbnY6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzdlwiLCAxLCB2YWwpO1xuICAgfSxcbiAgIHdoaXRlbmVzczogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHdiXCIsIDEsIHZhbCk7XG4gICB9LFxuICAgYmxhY2tuZXNzOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJod2JcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICB2YWx1ZTogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHN2XCIsIDIsIHZhbCk7XG4gICB9LFxuICAgY3lhbjogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiY215a1wiLCAwLCB2YWwpO1xuICAgfSxcbiAgIG1hZ2VudGE6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImNteWtcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICB5ZWxsb3c6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImNteWtcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICBibGFjazogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiY215a1wiLCAzLCB2YWwpO1xuICAgfSxcblxuICAgaGV4U3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ3JnYicpO1xuICAgICAgcmV0dXJuIHN0cmluZy5oZXhTdHJpbmcodGhpcy52YWx1ZXMpO1xuICAgfSxcbiAgIHJnYlN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKCdyZ2InKTtcbiAgICAgIHJldHVybiBzdHJpbmcucmdiU3RyaW5nKHRoaXMudmFsdWVzLCB0aGlzLl9hbHBoYSk7XG4gICB9LFxuICAgcmdiYVN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKCdyZ2InKTtcbiAgICAgIHJldHVybiBzdHJpbmcucmdiYVN0cmluZyh0aGlzLnZhbHVlcywgdGhpcy5fYWxwaGEpO1xuICAgfSxcbiAgIHBlcmNlbnRTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgncmdiJyk7XG4gICAgICByZXR1cm4gc3RyaW5nLnBlcmNlbnRTdHJpbmcodGhpcy52YWx1ZXMsIHRoaXMuX2FscGhhKTtcbiAgIH0sXG4gICBoc2xTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHNsJyk7XG4gICAgICByZXR1cm4gc3RyaW5nLmhzbFN0cmluZyh0aGlzLnZhbHVlcywgdGhpcy5fYWxwaGEpO1xuICAgfSxcbiAgIGhzbGFTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHNsJyk7XG4gICAgICByZXR1cm4gc3RyaW5nLmhzbGFTdHJpbmcodGhpcy52YWx1ZXMsIHRoaXMuX2FscGhhKTtcbiAgIH0sXG4gICBod2JTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHdiJyk7XG4gICAgICByZXR1cm4gc3RyaW5nLmh3YlN0cmluZyh0aGlzLnZhbHVlcywgdGhpcy5fYWxwaGEpO1xuICAgfSxcblxuICAga2V5d29yZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKCdyZ2InKTtcbiAgICAgIHJldHVybiBzdHJpbmcua2V5d29yZCh0aGlzLnZhbHVlcywgdGhpcy5fYWxwaGEpO1xuICAgfSxcblxuICAgcmdiTnVtYmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ3JnYicpO1xuICAgICAgcmV0dXJuICh0aGlzLnZhbHVlc1swXSA8PCAxNikgfCAodGhpcy52YWx1ZXNbMV0gPDwgOCkgfCB0aGlzLnZhbHVlc1syXTtcbiAgIH0sXG5cbiAgIGx1bWlub3NpdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNyZWxhdGl2ZWx1bWluYW5jZWRlZlxuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgncmdiJyk7XG4gICAgICB2YXIgcmdiID0gdGhpcy52YWx1ZXM7XG4gICAgICB2YXIgbHVtID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgdmFyIGNoYW4gPSByZ2JbaV0gLyAyNTU7XG4gICAgICAgICBsdW1baV0gPSAoY2hhbiA8PSAwLjAzOTI4KSA/IGNoYW4gLyAxMi45MlxuICAgICAgICAgICAgICAgICAgOiBNYXRoLnBvdygoKGNoYW4gKyAwLjA1NSkgLyAxLjA1NSksIDIuNClcbiAgICAgIH1cbiAgICAgIHJldHVybiAwLjIxMjYgKiBsdW1bMF0gKyAwLjcxNTIgKiBsdW1bMV0gKyAwLjA3MjIgKiBsdW1bMl07XG4gICB9LFxuXG4gICBjb250cmFzdDogZnVuY3Rpb24oY29sb3IyKSB7XG4gICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI2NvbnRyYXN0LXJhdGlvZGVmXG4gICAgICB2YXIgbHVtMSA9IHRoaXMubHVtaW5vc2l0eSgpO1xuICAgICAgdmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuICAgICAgaWYgKGx1bTEgPiBsdW0yKSB7XG4gICAgICAgICByZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gKGx1bTIgKyAwLjA1KSAvIChsdW0xICsgMC4wNSk7XG4gICB9LFxuXG4gICBsZXZlbDogZnVuY3Rpb24oY29sb3IyKSB7XG4gICAgIHZhciBjb250cmFzdFJhdGlvID0gdGhpcy5jb250cmFzdChjb2xvcjIpO1xuICAgICByZXR1cm4gKGNvbnRyYXN0UmF0aW8gPj0gNy4xKVxuICAgICAgID8gJ0FBQSdcbiAgICAgICA6IChjb250cmFzdFJhdGlvID49IDQuNSlcbiAgICAgICAgPyAnQUEnXG4gICAgICAgIDogJyc7XG4gICB9LFxuXG4gICBkYXJrOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFlJUSBlcXVhdGlvbiBmcm9tIGh0dHA6Ly8yNHdheXMub3JnLzIwMTAvY2FsY3VsYXRpbmctY29sb3ItY29udHJhc3RcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ3JnYicpO1xuICAgICAgdmFyIHJnYiA9IHRoaXMudmFsdWVzLFxuICAgICAgICAgIHlpcSA9IChyZ2JbMF0gKiAyOTkgKyByZ2JbMV0gKiA1ODcgKyByZ2JbMl0gKiAxMTQpIC8gMTAwMDtcbiAgICAgIHJldHVybiB5aXEgPCAxMjg7XG4gICB9LFxuXG4gICBsaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXRoaXMuZGFyaygpO1xuICAgfSxcblxuICAgbmVnYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ3JnYicpO1xuICAgICAgdmFyIHJnYiA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IDI1NSAtIHRoaXMudmFsdWVzW2ldO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJyZ2JcIiwgcmdiKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgbGlnaHRlbjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ2hzbCcpO1xuICAgICAgdGhpcy52YWx1ZXNbMl0gKz0gdGhpcy52YWx1ZXNbMl0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgZGFya2VuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHNsJyk7XG4gICAgICB0aGlzLnZhbHVlc1syXSAtPSB0aGlzLnZhbHVlc1syXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdGhpcy52YWx1ZXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBzYXR1cmF0ZTogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ2hzbCcpO1xuICAgICAgdGhpcy52YWx1ZXNbMV0gKz0gdGhpcy52YWx1ZXNbMV0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgZGVzYXR1cmF0ZTogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMuYWN0dWFsaXplU3BhY2UoJ2hzbCcpO1xuICAgICAgdGhpcy52YWx1ZXNbMV0gLT0gdGhpcy52YWx1ZXNbMV0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgd2hpdGVuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHdiJyk7XG4gICAgICB0aGlzLnZhbHVlc1sxXSArPSB0aGlzLnZhbHVlc1sxXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJod2JcIiwgdGhpcy52YWx1ZXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBibGFja2VuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHdiJyk7XG4gICAgICB0aGlzLnZhbHVlc1syXSArPSB0aGlzLnZhbHVlc1syXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJod2JcIiwgdGhpcy52YWx1ZXMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBncmV5c2NhbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgncmdiJyk7XG4gICAgICB2YXIgcmdiID0gdGhpcy52YWx1ZXM7XG4gICAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYXlzY2FsZSNDb252ZXJ0aW5nX2NvbG9yX3RvX2dyYXlzY2FsZVxuICAgICAgdmFyIHZhbCA9IHJnYlswXSAqIDAuMyArIHJnYlsxXSAqIDAuNTkgKyByZ2JbMl0gKiAwLjExO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJyZ2JcIiwgW3ZhbCwgdmFsLCB2YWxdKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgY2xlYXJlcjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiYWxwaGFcIiwgdGhpcy5fYWxwaGEgLSAodGhpcy5fYWxwaGEgKiByYXRpbykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBvcGFxdWVyOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJhbHBoYVwiLCB0aGlzLl9hbHBoYSArICh0aGlzLl9hbHBoYSAqIHJhdGlvKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIHJvdGF0ZTogZnVuY3Rpb24oZGVncmVlcykge1xuICAgICAgdGhpcy5hY3R1YWxpemVTcGFjZSgnaHNsJyk7XG4gICAgICB2YXIgaHVlID0gdGhpcy52YWx1ZXNbMF07XG4gICAgICBodWUgPSAoaHVlICsgZGVncmVlcykgJSAzNjA7XG4gICAgICBodWUgPSBodWUgPCAwID8gMzYwICsgaHVlIDogaHVlO1xuICAgICAgdGhpcy52YWx1ZXNbMF0gPSBodWU7XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB0aGlzLnZhbHVlcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIG1peDogZnVuY3Rpb24oY29sb3IyLCB3ZWlnaHQsIHNwYWNlKSB7XG4gICAgICBzcGFjZSA9IHNwYWNlIHx8ICdyZ2InO1xuXG4gICAgICB0aGlzLmFjdHVhbGl6ZVNwYWNlKHNwYWNlKTtcbiAgICAgIGNvbG9yMi5hY3R1YWxpemVTcGFjZShzcGFjZSk7XG5cbiAgICAgIHdlaWdodCA9IDEgLSAod2VpZ2h0ID09IG51bGwgPyAwLjUgOiB3ZWlnaHQpO1xuXG4gICAgICAvLyBhbGdvcml0aG0gZnJvbSBTYXNzJ3MgbWl4KCkuIFJhdGlvIG9mIGZpcnN0IGNvbG9yIGluIG1peCBpc1xuICAgICAgLy8gZGV0ZXJtaW5lZCBieSB0aGUgYWxwaGFzIG9mIGJvdGggY29sb3JzIGFuZCB0aGUgd2VpZ2h0XG4gICAgICB2YXIgdDEgPSB3ZWlnaHQgKiAyIC0gMSxcbiAgICAgICAgICBkID0gdGhpcy5hbHBoYSgpIC0gY29sb3IyLmFscGhhKCk7XG5cbiAgICAgIHZhciB3ZWlnaHQxID0gKCgodDEgKiBkID09IC0xKSA/IHQxIDogKHQxICsgZCkgLyAoMSArIHQxICogZCkpICsgMSkgLyAyO1xuICAgICAgdmFyIHdlaWdodDIgPSAxIC0gd2VpZ2h0MTtcblxuICAgICAgdmFyIHZhbHMgPSB0aGlzLnZhbHVlcztcbiAgICAgIHZhciB2YWxzMiA9IGNvbG9yMi52YWx1ZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgdmFsc1tpXSA9IHZhbHNbaV0gKiB3ZWlnaHQxICsgdmFsczJbaV0gKiB3ZWlnaHQyO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHZhbHMpO1xuXG4gICAgICB2YXIgYWxwaGEgPSB0aGlzLmFscGhhKCkgKiB3ZWlnaHQgKyBjb2xvcjIuYWxwaGEoKSAqICgxIC0gd2VpZ2h0KTtcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiYWxwaGFcIiwgYWxwaGEpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIHRvSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgIHJldHVybiB0aGlzLnJnYigpO1xuICAgfSxcblxuICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmdiQXJyYXkoKSk7XG4gICB9LFxuXG4gICAvL3NvbWV3aGF0IGdlbmVyaWMgZ2V0dGVyc1xuICAgdG9BcnJheTogZnVuY3Rpb24oKXtcbiAgICAgIHZhciB2YWxzID0gdGhpcy52YWx1ZXMuc2xpY2UoKTtcbiAgICAgIGlmICh0aGlzLl9hbHBoYSA9PT0gMSkge1xuICAgICAgICAgcmV0dXJuIHZhbHMuY29uY2F0KHRoaXMuX2FscGhhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxzO1xuICAgfSxcblxuICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gc3RyaW5nW3RoaXMuc3BhY2UgKyAnU3RyaW5nJ10odGhpcy52YWx1ZXMsIHRoaXMuX2FscGhhKTtcbiAgIH1cbn07XG5cblxuQ29sb3IucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlKSB7XG4gICB0aGlzLmFjdHVhbGl6ZVNwYWNlKHNwYWNlKTtcblxuICAgdmFyIHZhbHMgPSB7fTtcbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHNbc3BhY2VbaV1dID0gdGhpcy52YWx1ZXNbaV07XG4gICB9XG4gICBpZiAodGhpcy5fYWxwaGEgIT0gMSkge1xuICAgICAgdmFsc1tcImFcIl0gPSB0aGlzLl9hbHBoYTtcbiAgIH1cbiAgIC8vIHtyOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAwLjR9XG4gICByZXR1cm4gdmFscztcbn07XG5cblxuQ29sb3IucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlLCB2YWxzKSB7XG4gICB2YXIgYWxwaGEgPSAxO1xuXG4gICAvL2FjdHVhbGl6ZSB0YXJnZXQgc3BhY2VcbiAgIHRoaXMuYWN0dWFsaXplU3BhY2Uoc3BhY2UpO1xuXG4gICBpZiAoc3BhY2UgPT0gXCJhbHBoYVwiKSB7XG4gICAgICBhbHBoYSA9IHZhbHM7XG4gICB9XG4gICBlbHNlIGlmICh2YWxzLmxlbmd0aCkge1xuICAgICAgLy8gWzEwLCAxMCwgMTBdXG4gICAgICB0aGlzLnZhbHVlcyA9IHZhbHMuc2xpY2UoMCwgc3BhY2UubGVuZ3RoKTtcbiAgICAgIGFscGhhID0gdmFsc1tzcGFjZS5sZW5ndGhdO1xuICAgfVxuICAgZWxzZSBpZiAodmFsc1tzcGFjZVswXV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8ge3I6IDEwLCBnOiAxMCwgYjogMTB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMudmFsdWVzW2ldID0gdmFsc1tzcGFjZVtpXV07XG4gICAgICB9XG4gICAgICBhbHBoYSA9IHZhbHMuYTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHNbY29udmVydFtzcGFjZV0uY2hhbm5lbFswXV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8ge3JlZDogMTAsIGdyZWVuOiAxMCwgYmx1ZTogMTB9XG4gICAgICB2YXIgY2hhbnMgPSBjb252ZXJ0W3NwYWNlXS5jaGFubmVsO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnZhbHVlc1tpXSA9IHZhbHNbY2hhbnNbaV1dO1xuICAgICAgfVxuICAgICAgYWxwaGEgPSB2YWxzLmFscGhhO1xuICAgfVxuXG4gICB0aGlzLl9hbHBoYSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChhbHBoYSAhPT0gdW5kZWZpbmVkID8gYWxwaGEgOiB0aGlzLl9hbHBoYSkgKSk7XG5cbiAgIGlmIChzcGFjZSA9PSBcImFscGhhXCIpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cblxuICAgLy8gY2FwIHZhbHVlc1xuICAgZm9yICh2YXIgaSA9IDAsIGNhcHBlZDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYXBwZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihjb252ZXJ0W3NwYWNlXS5tYXhbaV0sIHRoaXMudmFsdWVzW2ldKSk7XG4gICAgICB0aGlzLnZhbHVlc1tpXSA9IE1hdGgucm91bmQoY2FwcGVkKTtcbiAgIH1cblxuICAgcmV0dXJuIHRydWU7XG59O1xuXG5cbi8qKiBVcGRhdGUgdmFsdWVzIGZvciB0aGUgc3BhY2UgcGFzc2VkICovXG5Db2xvci5wcm90b3R5cGUuYWN0dWFsaXplU3BhY2UgPSBmdW5jdGlvbihzcGFjZSl7XG4gICB2YXIgY3VyclNwYWNlID0gdGhpcy5zcGFjZTtcblxuICAgLy9zcGFjZSBpcyBhbHJlYWR5IGFjdHVhbFxuICAgaWYgKGN1cnJTcGFjZSAhPT0gc3BhY2UgJiYgc3BhY2UgIT09ICdhbHBoYScpIHtcbiAgICAgIC8vY2FsYyBuZXcgc3BhY2UgdmFsdWVzXG4gICAgICB0aGlzLnZhbHVlcyA9IGNvbnZlcnRbY3VyclNwYWNlXVtzcGFjZV0odGhpcy52YWx1ZXMpO1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudmFsdWVzLmxlbmd0aDsgaS0tOykgdGhpcy52YWx1ZXNbaV0gPSBNYXRoLnJvdW5kKHRoaXMudmFsdWVzW2ldKTtcblxuICAgICAgLy9zYXZlIGxhc3QgYWN0dWFsIHNwYWNlXG4gICAgICB0aGlzLnNwYWNlID0gc3BhY2U7XG4gICB9XG5cbiAgIHJldHVybiB0aGlzO1xufTtcblxuXG5Db2xvci5wcm90b3R5cGUuc2V0U3BhY2UgPSBmdW5jdGlvbihzcGFjZSwgYXJncykge1xuICAgdmFyIHZhbHMgPSBhcmdzWzBdO1xuICAgaWYgKHZhbHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gY29sb3IucmdiKClcbiAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlcyhzcGFjZSk7XG4gICB9XG4gICAvLyBjb2xvci5yZ2IoMTAsIDEwLCAxMClcbiAgIGlmICh0eXBlb2YgdmFscyA9PSBcIm51bWJlclwiKSB7XG4gICAgICB2YWxzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gICB9XG4gICB0aGlzLnNldFZhbHVlcyhzcGFjZSwgdmFscyk7XG4gICByZXR1cm4gdGhpcztcbn07XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24oc3BhY2UsIGluZGV4LCB2YWwpIHtcbiAgIHRoaXMuYWN0dWFsaXplU3BhY2Uoc3BhY2UpO1xuICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBjb2xvci5yZWQoKVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW2luZGV4XTtcbiAgIH1cbiAgIC8vIGNvbG9yLnJlZCgxMDApXG4gICB0aGlzLnZhbHVlc1tpbmRleF0gPSBNYXRoLm1heChNYXRoLm1pbih2YWwsIGNvbnZlcnRbc3BhY2VdLm1heFtpbmRleF0pLCAwKTtcbiAgIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xvcjtcbiIsInZhciBpY2ljbGUgPSByZXF1aXJlKCdpY2ljbGUnKTtcblxuXG4vKiogZW52aXJvbm1lbnQgZ3VhcmFudCAqL1xudmFyICQgPSB0eXBlb2YgalF1ZXJ5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IGpRdWVyeTtcbnZhciBkb2MgPSB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogZG9jdW1lbnQ7XG52YXIgd2luID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiB3aW5kb3c7XG5cblxuLyoqIExpc3RzIG9mIG1ldGhvZHMgKi9cbnZhciBvbk5hbWVzID0gWydvbicsICdiaW5kJywgJ2FkZEV2ZW50TGlzdGVuZXInLCAnYWRkTGlzdGVuZXInXTtcbnZhciBvbmVOYW1lcyA9IFsnb25lJywgJ29uY2UnLCAnYWRkT25jZUV2ZW50TGlzdGVuZXInLCAnYWRkT25jZUxpc3RlbmVyJ107XG52YXIgb2ZmTmFtZXMgPSBbJ29mZicsICd1bmJpbmQnLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdyZW1vdmVMaXN0ZW5lciddO1xudmFyIGVtaXROYW1lcyA9IFsnZW1pdCcsICd0cmlnZ2VyJywgJ2ZpcmUnLCAnZGlzcGF0Y2hFdmVudCddO1xuXG4vKiogTG9ja2VyIGZsYWdzICovXG52YXIgZW1pdEZsYWcgPSBlbWl0TmFtZXNbMF0sIG9uRmxhZyA9IG9uTmFtZXNbMF0sIG9uZUZsYWcgPSBvbk5hbWVzWzBdLCBvZmZGbGFnID0gb2ZmTmFtZXNbMF07XG5cblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBNYWluIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKiBXcmFwcyBhbnkgdGFyZ2V0IHBhc3NlZCB0byBhbiBFbWl0dGVyIGludGVyZmFjZVxuICovXG5mdW5jdGlvbiBFbW15KHRhcmdldCl7XG5cdGlmICghdGFyZ2V0KSByZXR1cm47XG5cblx0Ly9jcmVhdGUgZW1pdHRlciBtZXRob2RzIG9uIHRhcmdldCwgaWYgbm9uZVxuXHRpZiAoIWdldE1ldGhvZE9uZU9mKHRhcmdldCwgb25OYW1lcykpIHRhcmdldC5vbiA9IEVtbXlQcm90b3R5cGUub24uYmluZCh0YXJnZXQpO1xuXHRpZiAoIWdldE1ldGhvZE9uZU9mKHRhcmdldCwgb2ZmTmFtZXMpKSB0YXJnZXQub2ZmID0gRW1teVByb3RvdHlwZS5vZmYuYmluZCh0YXJnZXQpO1xuXHRpZiAoIWdldE1ldGhvZE9uZU9mKHRhcmdldCwgb25lTmFtZXMpKSB0YXJnZXQub25lID0gdGFyZ2V0Lm9uY2UgPSBFbW15UHJvdG90eXBlLm9uZS5iaW5kKHRhcmdldCk7XG5cdGlmICghZ2V0TWV0aG9kT25lT2YodGFyZ2V0LCBlbWl0TmFtZXMpKSB0YXJnZXQuZW1pdCA9IEVtbXlQcm90b3R5cGUuZW1pdC5iaW5kKHRhcmdldCk7XG5cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuXG4vKiogTWFrZSBET00gb2JqZWN0cyBiZSB3cmFwcGVkIGFzIGpRdWVyeSBvYmplY3RzLCBpZiBqUXVlcnkgaXMgZW5hYmxlZCAqL1xudmFyIEVtbXlQcm90b3R5cGUgPSBFbW15LnByb3RvdHlwZTtcblxuXG4vKipcbiAqIFJldHVybiB0YXJnZXTigJlzIG1ldGhvZCBvbmUgb2YgdGhlIHBhc3NlZCBpbiBsaXN0LCBpZiB0YXJnZXQgaXMgZXZlbnRhYmxlXG4gKiBVc2UgdG8gZGV0ZWN0IHdoZXRoZXIgdGFyZ2V0IGhhcyBzb21lIGZuXG4gKi9cbmZ1bmN0aW9uIGdldE1ldGhvZE9uZU9mKHRhcmdldCwgbGlzdCl7XG5cdHZhciByZXN1bHQ7XG5cdGZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRyZXN1bHQgPSB0YXJnZXRbbGlzdFtpXV07XG5cdFx0aWYgKHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG5cbi8qKiBTZXQgb2YgdGFyZ2V0IGNhbGxiYWNrcywge3RhcmdldDogW2NiMSwgY2IyLCAuLi5dfSAqL1xudmFyIHRhcmdldENiQ2FjaGUgPSBuZXcgV2Vha01hcDtcblxuXG4vKipcbiogQmluZCBmbiB0byB0aGUgdGFyZ2V0XG4qIEB0b2RvICByZWNvZ25pemUganF1ZXJ5IG9iamVjdFxuKiBAY2hhaW5hYmxlXG4qL1xuRW1teVByb3RvdHlwZS5vbiA9XG5FbW15UHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldnQsIGZuKXtcblx0dmFyIHRhcmdldCA9IHRoaXM7XG5cblx0Ly93YWxrIGJ5IGxpc3Qgb2YgaW5zdGFuY2VzXG5cdGlmIChmbiBpbnN0YW5jZW9mIEFycmF5KXtcblx0XHRmb3IgKHZhciBpID0gZm4ubGVuZ3RoOyBpLS07KXtcblx0XHRcdEVtbXlQcm90b3R5cGUub24uY2FsbCh0YXJnZXQsIGV2dCwgZm5baV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9XG5cblx0Ly90YXJnZXQgZXZlbnRzXG5cdHZhciBvbk1ldGhvZCA9IGdldE1ldGhvZE9uZU9mKHRhcmdldCwgb25OYW1lcyk7XG5cblx0Ly91c2UgdGFyZ2V0IGV2ZW50IHN5c3RlbSwgaWYgcG9zc2libGVcblx0Ly9hdm9pZCBzZWxmLXJlY3Vyc2lvbnMgZnJvbSB0aGUgb3V0c2lkZVxuXHRpZiAob25NZXRob2QgJiYgb25NZXRob2QgIT09IEVtbXlQcm90b3R5cGUub24pIHtcblx0XHQvL2lmIGl04oCZcyBmcm96ZW4gLSBpZ25vcmUgY2FsbFxuXHRcdGlmIChpY2ljbGUuZnJlZXplKHRhcmdldCwgb25GbGFnICsgZXZ0KSl7XG5cdFx0XHRvbk1ldGhvZC5jYWxsKHRhcmdldCwgZXZ0LCBmbik7XG5cdFx0XHRpY2ljbGUudW5mcmVlemUodGFyZ2V0LCBvbkZsYWcgKyBldnQpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiB0YXJnZXQ7XG5cdFx0fVxuXHR9XG5cblx0c2F2ZUNhbGxiYWNrKHRhcmdldCwgZXZ0LCBmbik7XG5cblx0cmV0dXJuIHRhcmdldDtcbn07XG5cblxuLyoqXG4gKiBBZGQgY2FsbGJhY2sgdG8gdGhlIGxpc3Qgb2YgY2FsbGJhY2tzIGFzc29jaWF0ZWQgd2l0aCB0YXJnZXRcbiAqL1xuZnVuY3Rpb24gc2F2ZUNhbGxiYWNrKHRhcmdldCwgZXZ0LCBmbil7XG5cdC8vZW5zdXJlIGNhbGxiYWNrcyBhcnJheSBmb3IgdGFyZ2V0IGV4aXN0c1xuXHRpZiAoIXRhcmdldENiQ2FjaGUuaGFzKHRhcmdldCkpIHRhcmdldENiQ2FjaGUuc2V0KHRhcmdldCwge30pO1xuXHR2YXIgdGFyZ2V0Q2FsbGJhY2tzID0gdGFyZ2V0Q2JDYWNoZS5nZXQodGFyZ2V0KTtcblxuXHQodGFyZ2V0Q2FsbGJhY2tzW2V2dF0gPSB0YXJnZXRDYWxsYmFja3NbZXZ0XSB8fCBbXSkucHVzaChmbik7XG59XG5cblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgb25jZSBhbmQgdGhlbiByZW1vdmVkLlxuICpcbiAqIEByZXR1cm4ge0VtbXl9XG4gKiBAY2hhaW5hYmxlXG4gKi9cbkVtbXlQcm90b3R5cGUub25jZSA9XG5FbW15UHJvdG90eXBlLm9uZSA9IGZ1bmN0aW9uKGV2dCwgZm4pe1xuXHR2YXIgdGFyZ2V0ID0gdGhpcztcblxuXHQvL3dhbGsgYnkgbGlzdCBvZiBpbnN0YW5jZXNcblx0aWYgKGZuIGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdGZvciAodmFyIGkgPSBmbi5sZW5ndGg7IGktLTspe1xuXHRcdFx0RW1teVByb3RvdHlwZS5vbmUuY2FsbCh0YXJnZXQsIGV2dCwgZm5baV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9XG5cblx0Ly90YXJnZXQgZXZlbnRzXG5cdHZhciBvbmVNZXRob2QgPSBnZXRNZXRob2RPbmVPZih0YXJnZXQsIG9uZU5hbWVzKTtcblxuXHQvL3VzZSB0YXJnZXQgZXZlbnQgc3lzdGVtLCBpZiBwb3NzaWJsZVxuXHQvL2F2b2lkIHNlbGYtcmVjdXJzaW9ucyBmcm9tIHRoZSBvdXRzaWRlXG5cdGlmIChvbmVNZXRob2QgJiYgb25lTWV0aG9kICE9PSBFbW15UHJvdG90eXBlLm9uZSkge1xuXHRcdGlmIChpY2ljbGUuZnJlZXplKHRhcmdldCwgb25lRmxhZyArIGV2dCkpe1xuXHRcdFx0Ly91c2UgdGFyZ2V0IGV2ZW50IHN5c3RlbSwgaWYgcG9zc2libGVcblx0XHRcdG9uZU1ldGhvZC5jYWxsKHRhcmdldCwgZXZ0LCBmbik7XG5cdFx0XHRzYXZlQ2FsbGJhY2sodGFyZ2V0LCBldnQsIGZuKTtcblx0XHRcdGljaWNsZS51bmZyZWV6ZSh0YXJnZXQsIG9uZUZsYWcgKyBldnQpO1xuXHRcdH1cblxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRhcmdldDtcblx0XHR9XG5cdH1cblxuXHQvL3dyYXAgY2FsbGJhY2sgdG8gb25jZS1jYWxsXG5cdGZ1bmN0aW9uIGNiKCkge1xuXHRcdEVtbXlQcm90b3R5cGUub2ZmLmNhbGwodGFyZ2V0LCBldnQsIGNiKTtcblx0XHRmbi5hcHBseSh0YXJnZXQsIGFyZ3VtZW50cyk7XG5cdH1cblxuXHRjYi5mbiA9IGZuO1xuXG5cdC8vYmluZCB3cmFwcGVyIGRlZmF1bHQgd2F5XG5cdEVtbXlQcm90b3R5cGUub24uY2FsbCh0YXJnZXQsIGV2dCwgY2IpO1xuXG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG5cbi8qKlxuKiBCaW5kIGZuIHRvIGEgdGFyZ2V0XG4qIEBjaGFpbmFibGVcbiovXG5FbW15UHJvdG90eXBlLm9mZiA9XG5FbW15UHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtbXlQcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtbXlQcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldnQsIGZuKXtcblx0dmFyIHRhcmdldCA9IHRoaXM7XG5cblx0Ly91bmJpbmQgYWxsIGxpc3RlbmVycyBwYXNzZWRcblx0aWYgKGZuIGluc3RhbmNlb2YgQXJyYXkpe1xuXHRcdGZvciAodmFyIGkgPSBmbi5sZW5ndGg7IGktLTspe1xuXHRcdFx0RW1teVByb3RvdHlwZS5vZmYuY2FsbCh0YXJnZXQsIGV2dCwgZm5baV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9XG5cblxuXHQvL3VuYmluZCBhbGwgbGlzdGVuZXJzIGlmIG5vIGZuIHNwZWNpZmllZFxuXHRpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBjYWxsYmFja3MgPSB0YXJnZXRDYkNhY2hlLmdldCh0YXJnZXQpO1xuXHRcdGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGFyZ2V0O1xuXHRcdC8vdW5iaW5kIGFsbCBpZiBubyBldnRSZWYgZGVmaW5lZFxuXHRcdGlmIChldnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yICh2YXIgZXZ0TmFtZSBpbiBjYWxsYmFja3MpIHtcblx0XHRcdFx0RW1teVByb3RvdHlwZS5vZmYuY2FsbCh0YXJnZXQsIGV2dE5hbWUsIGNhbGxiYWNrc1tldnROYW1lXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGNhbGxiYWNrc1tldnRdKSB7XG5cdFx0XHRFbW15UHJvdG90eXBlLm9mZi5jYWxsKHRhcmdldCwgZXZ0LCBjYWxsYmFja3NbZXZ0XSk7XG5cdFx0fVxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdH1cblxuXG5cdC8vdGFyZ2V0IGV2ZW50c1xuXHR2YXIgb2ZmTWV0aG9kID0gZ2V0TWV0aG9kT25lT2YodGFyZ2V0LCBvZmZOYW1lcyk7XG5cblx0Ly91c2UgdGFyZ2V0IGV2ZW50IHN5c3RlbSwgaWYgcG9zc2libGVcblx0Ly9hdm9pZCBzZWxmLXJlY3Vyc2lvbiBmcm9tIHRoZSBvdXRzaWRlXG5cdGlmIChvZmZNZXRob2QgJiYgb2ZmTWV0aG9kICE9PSBFbW15UHJvdG90eXBlLm9mZikge1xuXHRcdGlmIChpY2ljbGUuZnJlZXplKHRhcmdldCwgb2ZmRmxhZyArIGV2dCkpe1xuXHRcdFx0b2ZmTWV0aG9kLmNhbGwodGFyZ2V0LCBldnQsIGZuKTtcblx0XHRcdGljaWNsZS51bmZyZWV6ZSh0YXJnZXQsIG9mZkZsYWcgKyBldnQpO1xuXHRcdH1cblx0XHQvL2lmIGl04oCZcyBmcm96ZW4gLSBpZ25vcmUgY2FsbFxuXHRcdGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRhcmdldDtcblx0XHR9XG5cdH1cblxuXG5cdC8vRm9yZ2V0IGNhbGxiYWNrXG5cdC8vaWdub3JlIGlmIG5vIGV2ZW50IHNwZWNpZmllZFxuXHRpZiAoIXRhcmdldENiQ2FjaGUuaGFzKHRhcmdldCkpIHJldHVybiB0YXJnZXQ7XG5cblx0dmFyIGV2dENhbGxiYWNrcyA9IHRhcmdldENiQ2FjaGUuZ2V0KHRhcmdldClbZXZ0XTtcblxuXHRpZiAoIWV2dENhbGxiYWNrcykgcmV0dXJuIHRhcmdldDtcblxuXHQvL3JlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZXZ0Q2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKGV2dENhbGxiYWNrc1tpXSA9PT0gZm4gfHwgZXZ0Q2FsbGJhY2tzW2ldLmZuID09PSBmbikge1xuXHRcdFx0ZXZ0Q2FsbGJhY2tzLnNwbGljZShpLCAxKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG5cblxuLyoqXG4qIEV2ZW50IHRyaWdnZXJcbiogQGNoYWluYWJsZVxuKi9cbkVtbXlQcm90b3R5cGUuZW1pdCA9XG5FbW15UHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihldmVudE5hbWUsIGRhdGEsIGJ1YmJsZXMpe1xuXHR2YXIgdGFyZ2V0ID0gdGhpcywgZW1pdE1ldGhvZCwgZXZ0ID0gZXZlbnROYW1lO1xuXHRpZiAoIXRhcmdldCkgcmV0dXJuO1xuXG5cdC8vQ3JlYXRlIHByb3BlciBldmVudCBmb3IgRE9NIG9iamVjdHNcblx0aWYgKHRhcmdldC5ub2RlVHlwZSB8fCB0YXJnZXQgPT09IGRvYyB8fCB0YXJnZXQgPT09IHdpbikge1xuXHRcdC8vTk9URTogdGhpcyBkb2Vzbm90IGJ1YmJsZSBvbiBkaXNhdHRhY2hlZCBlbGVtZW50c1xuXG5cdFx0aWYgKGV2ZW50TmFtZSBpbnN0YW5jZW9mIEV2ZW50KSB7XG5cdFx0XHRldnQgPSBldmVudE5hbWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGV2dCA9ICBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcblx0XHRcdGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnROYW1lLCBidWJibGVzLCB0cnVlLCBkYXRhKTtcblx0XHR9XG5cblx0XHQvLyB2YXIgZXZ0ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgeyBkZXRhaWw6IGRhdGEsIGJ1YmJsZXM6IGJ1YmJsZXMgfSlcblxuXHRcdGVtaXRNZXRob2QgPSB0YXJnZXQuZGlzcGF0Y2hFdmVudDtcblx0fVxuXG5cdC8vY3JlYXRlIGV2ZW50IGZvciBqUXVlcnkgb2JqZWN0XG5cdGVsc2UgaWYgKCQgJiYgdGFyZ2V0IGluc3RhbmNlb2YgJCkge1xuXHRcdC8vVE9ETzogZGVjaWRlIGhvdyB0byBwYXNzIGRhdGFcblx0XHR2YXIgZXZ0ID0gJC5FdmVudCggZXZlbnROYW1lLCBkYXRhICk7XG5cdFx0ZXZ0LmRldGFpbCA9IGRhdGE7XG5cdFx0ZW1pdE1ldGhvZCA9IGJ1YmJsZXMgPyB0YXJndGUudHJpZ2dlciA6IHRhcmdldC50cmlnZ2VySGFuZGxlcjtcblx0fVxuXG5cdC8vVGFyZ2V0IGV2ZW50c1xuXHRlbHNlIHtcblx0XHRlbWl0TWV0aG9kID0gZ2V0TWV0aG9kT25lT2YodGFyZ2V0LCBlbWl0TmFtZXMpO1xuXHR9XG5cblxuXHQvL3VzZSBsb2NrcyB0byBhdm9pZCBzZWxmLXJlY3Vyc2lvbiBvbiBvYmplY3RzIHdyYXBwaW5nIHRoaXMgbWV0aG9kIChlLiBnLiBtb2QgaW5zdGFuY2VzKVxuXHRpZiAoZW1pdE1ldGhvZCAmJiBlbWl0TWV0aG9kICE9PSBFbW15UHJvdG90eXBlLmVtaXQpIHtcblx0XHRpZiAoaWNpY2xlLmZyZWV6ZSh0YXJnZXQsIGVtaXRGbGFnICsgZXZlbnROYW1lKSkge1xuXHRcdFx0Ly91c2UgdGFyZ2V0IGV2ZW50IHN5c3RlbSwgaWYgcG9zc2libGVcblx0XHRcdGVtaXRNZXRob2QuY2FsbCh0YXJnZXQsIGV2dCwgZGF0YSwgYnViYmxlcyk7XG5cdFx0XHRpY2ljbGUudW5mcmVlemUodGFyZ2V0LCBlbWl0RmxhZyArIGV2ZW50TmFtZSk7XG5cdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdH1cblx0XHQvL2lmIGV2ZW50IHdhcyBmcm96ZW4gLSBwZXJmb3JtIG5vcm1hbCBjYWxsYmFja1xuXHR9XG5cblxuXHQvL2ZhbGwgYmFjayB0byBkZWZhdWx0IGV2ZW50IHN5c3RlbVxuXHQvL2lnbm9yZSBpZiBubyBldmVudCBzcGVjaWZpZWRcblx0aWYgKCF0YXJnZXRDYkNhY2hlLmhhcyh0YXJnZXQpKSByZXR1cm4gdGFyZ2V0O1xuXG5cdHZhciBldnRDYWxsYmFja3MgPSB0YXJnZXRDYkNhY2hlLmdldCh0YXJnZXQpW2V2dF07XG5cblx0aWYgKCFldnRDYWxsYmFja3MpIHJldHVybiB0YXJnZXQ7XG5cblx0Ly9jb3B5IGNhbGxiYWNrcyB0byBmaXJlIGJlY2F1c2UgbGlzdCBjYW4gYmUgY2hhbmdlZCBpbiBzb21lIGhhbmRsZXJcblx0dmFyIGZpcmVMaXN0ID0gZXZ0Q2FsbGJhY2tzLnNsaWNlKCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZmlyZUxpc3QubGVuZ3RoOyBpKysgKSB7XG5cdFx0ZmlyZUxpc3RbaV0gJiYgZmlyZUxpc3RbaV0uY2FsbCh0YXJnZXQsIHtcblx0XHRcdGRldGFpbDogZGF0YSxcblx0XHRcdHR5cGU6IGV2ZW50TmFtZVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHRhcmdldDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtbXlQcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZ0KXtcblx0dmFyIGNhbGxiYWNrcyA9IHRhcmdldENiQ2FjaGUuZ2V0KHRoaXMpO1xuXHRyZXR1cm4gY2FsbGJhY2tzICYmIGNhbGxiYWNrc1tldnRdIHx8IFtdO1xufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtbXlQcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZ0KXtcblx0cmV0dXJuICEhRW1teVByb3RvdHlwZS5saXN0ZW5lcnMuY2FsbCh0aGlzLCBldnQpLmxlbmd0aDtcbn07XG5cblxuXG4vKiogU3RhdGljIGFsaWFzZXMgZm9yIG9sZCBBUEkgY29tcGxpYW5jZSAqL1xuRW1teS5iaW5kU3RhdGljQVBJID0gZnVuY3Rpb24oKXtcblx0dmFyIHNlbGYgPSB0aGlzLCBwcm90byA9IHNlbGYucHJvdG90eXBlO1xuXG5cdGZvciAodmFyIG5hbWUgaW4gcHJvdG8pIHtcblx0XHRpZiAocHJvdG9bbmFtZV0pIHNlbGZbbmFtZV0gPSBjcmVhdGVTdGF0aWNCaW5kKG5hbWUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gY3JlYXRlU3RhdGljQmluZChtZXRob2ROYW1lKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oYSwgYiwgYywgZCl7XG5cdFx0XHR2YXIgcmVzID0gcHJvdG9bbWV0aG9kTmFtZV0uY2FsbChhLGIsYyxkKTtcblx0XHRcdHJldHVybiByZXMgPT09IGEgPyBzZWxmIDogcmVzO1xuXHRcdH07XG5cdH1cbn07XG5FbW15LmJpbmRTdGF0aWNBUEkoKTtcblxuXG4vKiogQG1vZHVsZSBtdWV2ZW50cyAqL1xubW9kdWxlLmV4cG9ydHMgPSBFbW15OyJdfQ==
