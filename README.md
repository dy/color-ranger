<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/logo.png" height="190"/>

<code>**C O L O R − R A N G E R**</code>&nbsp; renders a color range for a color in rectangular or polar coordinate system by manipulating _ImageData_’s buffer. It is primarily needed for building color pickers.

[Test & demo](https://cdn.rawgit.com/dfcreative/color-ranger/master/test/index.html), [color picker](https://github.com/dfcreative/picky).

[![alt](https://travis-ci.org/dfcreative/color-ranger.svg?branch=master)](https://travis-ci.org/dfcreative/color-ranger)
[![alt](https://codeclimate.com/github/dfcreative/color-ranger/badges/gpa.svg)](https://codeclimate.com/github/dfcreative/color-ranger)
[![alt](https://david-dm.org/dfcreative/color-ranger.svg)](https://david-dm.org/dfcreative/color-ranger)
[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)


## Use

[![NPM](https://nodei.co/npm/color-ranger.png?mini=true)](https://nodei.co/npm/color-ranger/)


```js
var colorRanger = require('color-ranger');

//create a canvas
var canvas = document.createElement('canvas');
canvas.width = 50;
canvas.height = 50;
var context = canvas.getContext('2d');
var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

//render
imageData.data = colorRanger.render([0, 255, 255], imageData.data, {
	type: 'polar',
	space: 'hsl',
	channel: [0, 1]
});

//put image data back to canvas
context.putImageData(imageData, 0, 0);
document.documentElement.style.background = 'url(' + canvas.toDataURL() + ') 0 0 / cover';
```


## API

### ranger.render(color, buffer, options)

<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/rect.png" height="128"/>
<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/polar.png" height="132"/>

Render rectangular or polar range into an imageData’s buffer. Size of the final image is taken such that it fills the whole imageData area.

| Parameter | Type | Description |
|----|----|----|
| `color` | _Color_ | An array of input values, defined in `sourceSpace` - rgb by default. |
| `buffer` | _Uint8ClampedArray_ | An `imageData.data` object to which render a range. |
| `options.space` | _string_ | A color space name for the range taken from the [color-space](https://github.com/dfcreative/color-space/) module. E. g. `'hsl'`. |
| `options.channel` | _Array_ | An array of x/y space channel indexes. E. g. `[0,2]` from `'hsv'` is _hue_ and _value_ channels. One of the channels can be omitted, e. g. `[null, 1]` means render saturation by y-axis. |
| `options.min`, `options.max` | _Array_ | Arrays of left and right values for the range, corresponding to the channels in x/y axis. |
| `options.type` | _String_ | Render whether `polar`, `rect` or `chess`. |
| `options.sourceSpace` | _String_ | If you have an input array different from `rgb` (for hsl edge cases), pass the color source space. |


### ranger.chess(colorA, colorB, buffer)

<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/alpha.png"/>

Render a chess grid, useful for transparency grid image rendering. Grid size is automatically figured out from the `imageData` size.

| Parameter | Type | Description |
|----|----|----|
| `colorA` | _Array_ | Black cell color. |
| `colorB` | _Array_ | White cell color. |
| `buffer` | _Uint8ClampedArray_ | An `ImageData` object into which to render grid. |


### require('color-ranger/worker')

Return worker for [workerify](http://github.com/substack/workerify), able to render range in a background.

```js
var work = require('webworkify');
var worker = work(require('color-ranger/worker'));

worker.addEvenListener('message', function(evt){
	if (evt.data.id !== 1) return;

	//image data buffer is returned as `event.data.data`
	imageData.data = evt.data.data;
	context.putImageData(imageData, 0, 0);

	document.body.style.background = 'url(' + canvas.toDataURL() + ') 0 0 / cover';
});

worker.postMessage({
	color: [255, 255, 255],
	type: 'polar',
	space: 'lab',
	sourceSpace: 'rgb'
	channel: [0,1],
	max: [360, 100],
	min: [0, 100],
	data: imageData,
	id: 1
});
```

Worker gets all the parameters of `.render`, with additional option `id`, an id of request to identify response.