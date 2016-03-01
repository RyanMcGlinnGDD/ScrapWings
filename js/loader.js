/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};

app.KEYBOARD = {
	"KEY_LEFT": 37, 
	"KEY_UP": 38, 
	"KEY_RIGHT": 39, 
	"KEY_DOWN": 40,
	"KEY_SPACE": 32,
	"KEY_SHIFT": 16,
	"KEY_W": 87,
	"KEY_A": 65,
	"KEY_S": 83,
	"KEY_D": 68,
	"KEY_ACUTE": 192
};

app.IMAGES = {
    shipImage: "images/Ship01.png",
	enemyImage01: "images/Enemy01.png",
	scrapRed: "images/scrapRedSheet.png",
	scrapYellow: "images/scrapYellowSheet.png",
	scrapBlue: "images/scrapBlueSheet.png"
 };

app.keydown = [];
 
window.onload = function(e){
	console.log("window.onload called");
	
	
	
	app.ship.drawLib = app.drawLib;
	app.ship.emitter = app.Emitter;
	
	app.main.drawLib = app.drawLib;
	app.main.app = app;
	app.main.utilities = app.utilities;
	
	app.Bullet.drawLib = app.drawLib;
	
	app.Enemy.utilities = app.utilities;
	app.Enemy.drawLib = app.drawLib;
	
	app.Scrap.utilities = app.utilities;
	app.Scrap.drawLib = app.drawLib;
	
	app.Emitter.utilities = app.utilities;
	
	app.sound.init();
	
	// Preload Images and Sound
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	app.queue.on("complete", function(){
		console.log("images loaded called");
		app.main.init(app.ship);
	});

	app.queue.loadManifest([
		{id: "shipImage", src:"images/Ship01.png"},
		{id: "enemyImage01", src:"images/Enemy01.png"},
		{id: "scrapRed", src:"images/scrapRedSheet.png"},
		{id: "scrapYellow", src:"images/scrapYellowSheet.png"},
		{id: "scrapBlue", src:"images/scrapBlueSheet.png"}
	]);
	
	
	
	//event listeners
	window.addEventListener("keydown",function(e){
		//console.log("keydown=" + e.keyCode);
		app.keydown[e.keyCode] = true;
	});
		
	window.addEventListener("keyup",function(e){
		//console.log("keyup=" + e.keyCode);
		app.keydown[e.keyCode] = false;
		
		// pausing and resuming
		var char = String.fromCharCode(e.keyCode);
		if (char == "p" || char == "P"){
			if (app.main.paused){
				app.main.resumeGame();
			}
			else {
				app.main.pauseGame();
			}
		}
		if(char == "À"){
			app.main.toggleDebug();
		}
	});
	
};



window.onblur = function(){
	//console.log("blur at " + Date());
	app.sound.pauseBGAudio();
	app.main.pauseGame();
};

window.onfocus = function(){
	//console.log("focus at " + Date());
	app.sound.playBGAudio();
	app.main.resumeGame();
};