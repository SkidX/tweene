# Tweene - JS Animation Proxy - v0.5.10

__Tweene__ is a JS library that helps to improve your favourite animation engine, allowing you to do more and better.

There are already a lot of good JavaScript animation libraries on the market, each one with specific features, strengths and weaknesses.
Each programmer and each project have their specific requirements, so sometimes one library may be suitable while other times it could not.

__Tweene__ is something different. It is an animation proxy: used as a wrapper of your chosen library, it may allow you to

- write animations easily, thanks to its versatile interface that adapts itself to your programming style
- gain extra features (play, pause, reverse, resume, restart and speed control, Timelines)
- switch easily from one library to another any time you want.

Currently it can work together with [GSAP](http://www.greensock.com/gsap-js/), [Velocity.js](http://julian.com/research/velocity/),
[Transit (CSS Transitions)](http://ricostacruz.com/jquery.transit/) or [jQuery](http://jquery.com).

## Resources
- [Features](http://tweene.com/#features)
- [Documentation](http://tweene.com/docs)
- [Examples](http://tweene.com/#examples)

## Getting started
To start using Tweene just include the script after your animation library of choice.

[jsDelivr CDN](http://www.jsdelivr.com/#!tweene) provides free hosting for Tweene.
You can simply replace the script URL with one of the minified files on jsDelivr like this:
```html
<script src="//cdn.jsdelivr.net/npm/tweene@VERSION_HERE/minified/tweene-velocity.min.js"></script>
```
For more details, like version aliasing, please visit the [README](https://github.com/jsdelivr/jsdelivr#usage).

Alternatively, you can download the repository and host the files locally.

```html
// use Tweene with GSAP
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenMax.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tweene@latest/minified/tweene-gsap.min.js"></script>

// use Tweene with jQuery
<script src="//cdn.jsdelivr.net/npm/jquery@latest/dist/jquery.min.js"></script>;
<script src="//cdn.jsdelivr.net/npm/tweene@latest/minified/tweene-jquery.min.js"></script>
// or fetch all with a single HTTP request
<script src="//cdn.jsdelivr.net/combine/npm/jquery,npm/tweene/minified/tweene-jquery.min.js"></script>

// use Tweene with Transit
<script src="//cdn.jsdelivr.net/npm/jquery@latest/dist/jquery.min.js"></script>;
<script src="//cdn.jsdelivr.net/npm/jquery.transit@0.9.12/jquery.transit.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tweene@latest/minified/tweene-transit.min.js"></script>
// or fetch all with a single HTTP request
<script src="//cdn.jsdelivr.net/combine/npm/jquery,npm/jquery.transit@0.9.12,npm/tweene/minified/tweene-transit.min.js"></script>

// use Tweene with Velocity.js
<script src="//cdn.jsdelivr.net/npm/jquery@latest/dist/jquery.min.js"></script>;
<script src="//cdn.jsdelivr.net/npm/velocity-animate@1.5.0/velocity.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tweene@latest/minified/tweene-velocity.min.js"></script>
// or fetch all with a single HTTP request
<script src="//cdn.jsdelivr.net/combine/npm/jquery,npm/velocity-animate@1.5,npm/tweene/minified/tweene-velocity.min.js"></script>

// use Tweene with more then one library
<script src="//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenMax.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/jquery@latest/dist/jquery.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/jquery.transit@0.9.12/jquery.transit.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/velocity-animate@1.5.0/velocity.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tweene@latest/minified/tweene-all.min.js"></script>

<script>
// set the default time unit you want to use
Tweene.defaultTimeUnit = 'ms'; // or 's'

// set the default driver you want to use
Tweene.defaultDriver = 'gsap'; // or one of 'transit', 'velocity', 'jquery'
</script>
```

### Package managers

`bower install tweene`<br>
  or<br>
`npm install tweene`

```js
// use Tweene with more then one library
require('tweene');

// use Tweene with GSAP
require('tweene/gsap');

// use Tweene with jQuery
require('tweene/jquery');

// use Tweene with Transit
require('tweene/transit');

// use Tweene with Velocity.js
require('tweene/velocity');
```

## Time unit
Tweene tries to accommodate your current programming habits, not to force you to change them. For this reason, you can configure the default time unit used to indicate durations and delays of your tweens, by changing the value of Tweene.defaultTimeUnit (accepted value: 's' or 'ms').
Since the GSAP library uses natively seconds as time unit, when you will use only that specific driver through tweene-gsap.min.js or require('tweene/gsap') please note that the predefined value of Tweene.defaultTimeUnit will be 's'. In all other cases, it defaults to 'ms'.
However, you can change it any time you want and also on a single call basis.
Check http://tweene.com/docs/#duration for more details.

## Changelog
- __0.5.11__ Fixed a label related issue.
- __0.5.10__ Fixed bug in jQuery driver.
- __0.5.9__ Fixed restart() procedure when timelines are paused.
- __0.5.8__ Added addPause() method. Fixed events call order.
- __0.5.7__ Fixed wrong link to Velocity.js homepage
- __0.5.6__ Fixed require() return value. Roadmap added.
- __0.5.5__ Added references for CDN hosting support.
- __0.5.4__ Renamed some internal vars. Added more details in README and comments.
- __0.5.3__ Renamed all files in lowercase. Fixed jQuery minimum version in package.json dependencies.
- __0.5.2__ Added support for npm and bower.
- __0.5.1__ Predefined transforms order: now transformations are applied always in the same order. Fixed some minor glitches with CSS transitions.
- __0.5.0__ First public release

## License

Tweene is available under Artistic License 2.0, check the LICENSE.txt inside the archive for details.

Animation libraries of your choice are not included and have their own license agreement.
