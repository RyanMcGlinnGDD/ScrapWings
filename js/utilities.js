// All of these functions are in the global scope
		
"use strict";
var app = app || {};

app.utilities = function(){
	
	// returns mouse position in local coordinate system of element
	function getMouse(e){
		return new Victor(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
	}

	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
	}

	function makeColor(red, green, blue, alpha){
		var color='rgba('+red+','+green+','+blue+', '+alpha+')';
		return color;
	}

	function getRandomUnitVector(magnitude){
		var x = getRandom(-1,1);
		var y = getRandom(-1,1);
		var length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}
		
		return new Victor(x * magnitude,y * magnitude);
	}

	function collides(a, b){
		//if distance between 2 positions is less than collideradius of both return true
		if(((a.position.x - b.position.x)*(a.position.x - b.position.x)) + ((a.position.y - b.position.y)*(a.position.y - b.position.y)) < ((a.collideRadius + b.collideRadius)*(a.collideRadius + b.collideRadius))){
			//console.log("COLLISION DETECTED");
			return true;
		}
		else{
			return false;
		}
	}
	
	function map(value1, min1, max1, min2, max2){
		return min2 + (max2 - min2) * ((value1 - min1) / (max1 - min1));
	}
	
	function simplePreload(imageArray){
		// loads images all at once
		for (var i = 0; i < imageArray.length; i++) {
			var img = new Image();
			img.src = imageArray[i];
		}
	}

	function loadImagesWithCallback(sources, callback) {
		var imageObjects = [];
		var numImages = sources.length;
		var numLoadedImages = 0;
		
		for (var i = 0; i < numImages; i++) {
		  imageObjects[i] = new Image();
		  imageObjects[i].onload = function() {
			numLoadedImages++;
			//console.log("loaded image at '" + this.src + "'")
			if(numLoadedImages >= numImages) {
			  callback(imageObjects); // send the images back
			}
		  };
		  
		  imageObjects[i].src = sources[i];
		}
	  }


	/*
	Function Name: clamp(val, min, max)
	Author: Web - various sources
	Return Value: the constrained value
	Description: returns a value that is
	constrained between min and max (inclusive) 
	*/
	function clamp(val, min, max){
		return Math.max(min, Math.min(max, val));
	}


	 // FULL SCREEN MODE
	function requestFullscreen(element) {
		if (element.requestFullscreen) {
		  element.requestFullscreen();
		} else if (element.mozRequestFullscreen) {
		  element.mozRequestFullscreen();
		} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
		  element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
		  element.webkitRequestFullscreen();
		}
		// .. and do nothing if the method is not supported
	};

	// the "public interface" of this module
	return{
		getMouse : getMouse,
		getRandom : getRandom,
		makeColor : makeColor,
		getRandomUnitVector: getRandomUnitVector,
		simplePreload: simplePreload,
		loadImagesWithCallback: loadImagesWithCallback,
		clamp: clamp,
		requestFullscreen: requestFullscreen,
		collides: collides,
		map: map
	};
}(); 