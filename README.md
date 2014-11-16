Useful both as a separate web-worker and as a simple module.


```js
var range = require('color-ranger');
var Color = require('color');


var c = new Color('green');


var imageData = range(c, 'hsl', [0,1], data);
```

##### `range(color, space, channels, data)`

`color` - Render range for a color
`space` - pick a space
`channels` - list of channels to render
`data` - an ImageData instance.



<a href="http://unlicense.org/UNLICENSE"><img src="http://upload.wikimedia.org/wikipedia/commons/6/62/PD-icon.svg" width="40"/></a>