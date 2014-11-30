<p align="center">
	<img src="https://cdn.rawgit.com/dfcreative/color-ranger/design/logo.png" height="200"/>
</p>
<h3 align="center">
	<code>&nbsp;C&thinsp;O&thinsp;L&thinsp;O&thinsp;R&thinsp;−&thinsp;<big>R</big>&thinsp;A&thinsp;N&thinsp;G&thinsp;E&thinsp;R&thinsp;.js&nbsp;</code>
</h3>
<p align="center">
	<a href="https://travis-ci.org/dfcreative/color-ranger"><img src="https://travis-ci.org/dfcreative/color-ranger.svg?branch=master"/></a>
	<a href="https://coveralls.io/r/dfcreative/color-ranger"><img src="https://img.shields.io/coveralls/dfcreative/color-ranger.svg"/></a>
	<a href="https://david-dm.org/dfcreative/color-ranger"><img src="https://david-dm.org/dfcreative/color-ranger.svg"/></a>
	<a href="http://unlicense.org/UNLICENSE"><img src="http://upload.wikimedia.org/wikipedia/commons/6/62/PD-icon.svg" width="20"/></a>
</p>

_Color-ranger_ renders a range for a color in particular color space to rectangular or polar coordinate system by manipulating _ImageData_. It is primarily needed for building color pickers.

* It can be used both in web-worker and in document thread.
* It is only [Nkb] minified & gzipped.
* You can require only needed renderers to reduce size even more.


#### [Demo](TODO:jsfiddle link)

#### [Ranges & tests](https://cdn.rawgit.com/dfcreative/color-space/master/test/index.html)


<!--
You may also be interesting in checking out picky - a color picker based on that.
-->


# Get started

## Install

The best way to use color ranger in browser is to [browserify](https://github.com/substack/node-browserify) it as a requirement.

1. Install local package:

`$ npm install --save color-ranger`

2. Build bundle:

`browserify -r color-ranger > bundle.js`

Or if you have your own package, append color-ranger to it:

`browserify -r color-ranger -r your-dependency your-package.js > bundle.js`

3. include the bundle:

```html
<script src="bundle.js"></script>
```

4. Finally require color-ranger module:

```html
<script>
	var ranger = require('color-ranger');
</script>
```


Alternately you can use a standalone version. Include [color-ranger.js](https://raw.githubusercontent.com/dfcreative/color-space/master/color-space.js) before you’ll use it:

```html
<script src="https://cdn.rawgit.com/dfcreative/color-ranger/master/color-ranger.js"></script>
```

You will get a `window.colorRanger` object, containing rendering functions.


## Use

You need to strap boots to make color-ranger work:

```html
<script>
	//create a canvas
	var canvas = document.createElement('canvas');
	canvas.width = 50;
	canvas.height = 50;
	var context = canvas.getContext('2d');
	var data = context.getImageData(0, 0, canvas.width, canvas.height);

	//render hue and saturation channels [0,1] for the rgb-color [127, 255, 255]
	//with min values [0,0] and max values [360, 100]
	data = colorRanger.renderRect([127,255,255], 'hsl', [0,1], [0,0], [360,100], data);

	//put image data back to canvas
	context.putImageData(data, 0, 0);

	//get a background with the rendered range
	document.body.style.backgroundImage = 'url(' + cnv.toDataURL() + ')';
</script>
```

You’ll see a range rendered as `body` background. You can see full list of ranges in [tests page](https://cdn.rawgit.com/dfcreative/color-space/master/test/index.html).


# API

API docs on their way.

### `.renderRect()`

Render rectangular range.

| Parameter | Type | Default | Description |
|----|----|----|----|


### `.renderPolar()`

Render polar range.

| Parameter | Type | Default | Description |
|----|----|----|----|


### `.renderGrid()`

Render transparency grid.

| Parameter | Type | Default | Description |
|----|----|----|----|



# Contribute

There are some things to do with this lib.

* At first, it needs implementing WebGL shaders version, or combining somehow with [color-space-canvas](https://github.com/rosskettle/color-space-canvas) module.
* At second, there’s no HUSL space in webworker available, because HUSL space requires intricated serialization of code for web-worker.
* Also it might need to add a triangular shape rendering.
* It’s a good idea to add server-side rendering as well.

So please fork, add fixes/features, make a PR. Color-ranger is an unlicensed project in that it is free to use or modify.


[![NPM](https://nodei.co/npm/color-ranger.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/color-ranger/)
