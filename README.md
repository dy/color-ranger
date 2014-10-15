## Color ranges

Render background for a color channel/space. Intended for color pickers or gradient generation.

Keywords:
Color-range
color-picker-background
color-palette
color-space
color value range render
color-range-background
color-ranges


```js
var background = require('color-ranges');
var Color = require('color');
var c = new Color('green');

element.style.background = background.rectangular.red.green(c, 'right');
```

## API

#### Rendering methods:

`.linear[space](color, direction)` — get linear range background based on passed color for the space.
`.rectangular[spaceH][spaceV](color, direction)` — get rectangular range based on passed color for the spaceA and spaceB.
`.circular[space](color, direction)` — get circular range
`.polar[spaceR][spaceA](color, direction)` — get polar background
`.triangular[spaceH][spaceV](color, direction)` — get triangular background

#### Helpers:

`.grad(direction?, [color1, color2, ...colorN])` - render even gradient based on colors passed and for the proper browser.

`.interpolate(colorA, colorB, number, space)` - return list of @number colors between colorA and color B interpolated by @space.


## Linear backgrounds

* red
* green
* blue
* hue
* saturation
* lightness
* saturationv
* value
* whiteness
* blackness
* L
* a
* b
* cyan
* magenta
* yellow
* black, kyan
* alpha, opacity


## Rectangular backgrounds

* red
	* green
	* blue
* green
	* red
	* blue
* hue
	* saturation
	* saturationv
	* lightness
	* value/brightness
* saturation
	* lightness
	* value/brightness
	* hue
* L
	* a
	* b

A components of each pair may be swapped.


## Circular backgrounds

All the same as a linear ones.


## Radial backgrounds

All the same as rectangular ones.