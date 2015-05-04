<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/logo.png" height="190"/>

<code>**C O L O R − R A N G E R**</code>&nbsp; renders a color range for a color in rectangular or polar coordinate system by manipulating _ImageData_’s buffer. It is primarily needed for building color pickers.

[Demo](http://jsfiddle.net/dfcreative/3ng2wg59/), [ranges list](https://cdn.rawgit.com/dfcreative/color-ranger/master/test/index.html), [color picker](https://github.com/dfcreative/picky).

<p>
	<a href="https://travis-ci.org/dfcreative/color-ranger"><img src="https://travis-ci.org/dfcreative/color-ranger.svg?branch=master"/></a>
	<a href="https://codeclimate.com/github/dfcreative/color-ranger"><img src="https://codeclimate.com/github/dfcreative/color-ranger/badges/gpa.svg"/></a>
	<a href="https://coveralls.io/r/dfcreative/color-ranger"><img src="https://img.shields.io/coveralls/dfcreative/color-ranger.svg"/></a>
	<a href="https://david-dm.org/dfcreative/color-ranger"><img src="https://david-dm.org/dfcreative/color-ranger.svg"/></a>
</p>

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)


## Use

`$ npm install --save color-ranger`

```js
var colorRanger = require('color-ranger');

//create a canvas
var canvas = document.createElement('canvas');
canvas.width = 50;
canvas.height = 50;
var context = canvas.getContext('2d');
var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//for the blue color (blue = 255, red = 0, green = 0)
var what = [0, 0, 255];

//to imageData’s buffer
var where = imageData.data;

//for hue and saturation channels [0,1]
var how = {
	space: 'hsl',
	channel: [0,1],
	min: [0,0],
	max: [360,100]
};

//render
imageData.data = colorRanger.renderRect(what, where, how);

//put image data back to canvas
context.putImageData(imageData, 0, 0);

//get a background with the rendered range
document.documentElement.style.background = 'url(' + canvas.toDataURL() + ') 0 0 / cover';
```


## API

### `color-ranger`:`render(rgb, buffer, options)`

<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/rect.png" height="128"/>
<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/polar.png" height="132"/>

Render rectangular or polar range into an `imageData`’s buffer. Size of the final image is taken such that it fills the whole `imageData` area.

| Parameter | Type | Description |
|----|----|----|
| `rgb` | _Array_ | An array of rgb values, representing a color. E. g. `[0, 255, 127]`. |
| `buffer` | _Uint8ClampedArray_ | An `imageData.data` object to which render a range. |
| `options.space` | _string_ | A color space name for the range taken from the [color-space](https://github.com/dfcreative/color-space/) module. E. g. `'hsl'`. |
| `options.channel` | _Array_ | An array of x/y space channel indexes. E. g. `[0,2]` from `'hsv'` is _hue_ and _value_ channels. One of the channels can be omitted, e. g. `[null, 1]` means render saturation by y-axis. |
| `options.min`, `options.max` | _Array_ | Arrays of left and right values for the range, corresponding to the channels in x/y axis. |
| `options.type` | _String_ | Render whether `'polar'` or `'rect'`. |


### `color-ranger/chess`:`chess(rgbA, rgbB, buffer)`

<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/alpha.png"/>

Render a chess grid, useful for transparency grid image rendering. Grid size is automatically figured out from the `imageData` size.

| Parameter | Type | Description |
|----|----|----|
| rgbA | _Array_ | An rgb values for the "black cell" color. |
| rgbB | _Array_ | An rgb values for the "white cell" color. |
| buffer | _Uint8ClampedArray_ | An `ImageData` object to which render the grid bitmap. |

<br/>

### `color-ranger/worker`:`getWorker(spaces)`

Return a web-worker able to render any range for the passed set of spaces. `spaces` should be a `color-space` module or it’s custom build. Usually you do this:


```js
var spaces = require('color-space');

//set up and run worker
var rangerWorker = require('color-ranger/worker')();

//catch worker response
rangerWorker.addEvenListener('message', function(evt){
	if (evt.data.id !== 1) return;

	//image data buffer is returned as `event.data.data`
	imageData.data = evt.data.data;
	context.putImageData(imageData, 0, 0);

	document.body.style.background = 'url(' + canvas.toDataURL() + ') 0 0 / cover';
});

//send a data to the worker
rangerWorker.postMessage({
	rgb: rgbArray,
	type: 'polar',
	space: 'lab',
	channel: [0,1],
	max: [360, 100],
	min: [0, 100],
	data: imageData,
	id: 1
});
```

Worker gets all the parameters of `.render`, besides there are additional option `id`, an id of request to identify response in response.



[![NPM](https://nodei.co/npm/color-ranger.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/color-ranger/)
