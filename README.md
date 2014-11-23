# Color-ranger [WIP]

Render rectangular/polar color range into an ImageData.
Useful in a color-picker both as a separate web-worker and a single flow.

[Tests](todo). [Color-Picker](todo).


## Use

```js
var renderRange = require('color-ranger');
var Color = require('color');


var color = new Color('rgba(10,250,30,.3)');


var imageData = renderRange.rect(color.rgbaArray(), 'hsl', [0,1], data);
```

## API

### `rect()`

Render rectangular range.

### `polar()`

Render polar range.

### `grid()`

Render transparency grid.


# License

<a href="http://unlicense.org/UNLICENSE"><img src="http://upload.wikimedia.org/wikipedia/commons/6/62/PD-icon.svg" width="40"/></a>