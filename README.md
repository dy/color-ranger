# Color-ranger

Render rectangular/polar color range into an ImageData.
Useful in a color-picker both as a separate web-worker and a single flow.

[Tests](todo).


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


## License

Copyright © 2014 Dmitry Ivanov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.