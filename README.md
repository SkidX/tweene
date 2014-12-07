# Tweene - JS Animation Proxy - v0.5.3

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

	// use Tweene with GSAP: translates from their 's' time unit into 'ms'
	<script src="/your/path/TweenMax.min.js"></script>;
	<script src="/your/path/tweene-gsap.min.js"></script>

	// use Tweene with jQuery: keeps time unit as 'ms'
	<script src="/your/path/jquery.min.js"></script>
	<script src="/your/path/tweene-jquery.min.js"></script>

	// use Tweene with Transit: keeps time unit as 'ms'
	<script src="/your/path/jquery.transit.js"></script>
	<script src="/your/path/tweene-transit.min.js"></script>

	// use Tweene with Velocity.js: keeps time unit as 'ms'
	<script src="/your/path/velocity.min.js"></script>
	<script src="/your/path/tweene-velocity.min.js"></script>

	// use Tweene with more then one library
	<script src="/your/path/TweenMax.min.js"></script>
	<script src="/your/path/jquery.transit.js"></script>
	<script src="/your/path/velocity.min.js"></script>
	<script src="/your/path/tweene-all.min.js"></script>
	<script>
		// set your default time unit and driver
		Tweene.defaultTimeUnit = 's';
		Tweene.defaultDriver = 'gsap';
	</script>

Or with package managers:

    bower install tweene
    or
    npm install tweene

	// use Tweene with more then one library
	require('tweene');	
	// set your default time unit and driver
	Tweene.defaultTimeUnit = 's';
	Tweene.defaultDriver = 'gsap';
	
	// use Tweene with GSAP: default time unit is 's'
	require('tweene/gsap');

	// use Tweene with jQuery: default time unit is 'ms'
	require('tweene/jquery');

	// use Tweene with Transit: default time unit is 'ms'
	require('tweene/transit');

	// use Tweene with Velocity.js: default time unit is 'ms'
	require('tweene/velocity');

## History
- __0.5.3__ Renamed all files in lowercase. Fixed jQuery minimum version in package.json dependencies.
- __0.5.2__ Added support for npm and bower.
- __0.5.1__ Predefined transforms order: now transformations are applied always in the same order. Fixed some minor glitches with CSS transitions.
- __0.5.0__ First public release

## License

Tweene is available under Artistic License 2.0, check the LICENSE.txt inside the archive for details.

Animation libraries of your choice are not included and have their own license agreement. 
