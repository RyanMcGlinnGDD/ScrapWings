// main.js
// Dependencies: 
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

/*
 .main is an object literal that is a property of the app global
 This object literal has its own properties and methods (functions)
 
 */
app.main = {
	//enumeration
	GAME_STATE: Object.freeze({	
		TITLE: 0,
		PREWAVE: 1,
		WAVEINPROGRESS: 2,
		GAMEOVER: 3
	}),
	
	paused: false,
	animationID: 0,
	lastTime: 0, // used by calculateDeltaTime() 
	
	WIDTH : 1024, 
    HEIGHT: 768,
	canvas: undefined,
    ctx: undefined,
	ship: undefined,
	drawLib: undefined,
	app: undefined,
	utilities: undefined,
	
	//arrays containing repeated objects
	enemies: [],
	scraps: [],
	bullets: [],
	
    debug: false,
	
	//countdown timer to round start
	prewaveCounter: undefined,
	
	//mouse position
	mousePosition: undefined,
	
	//game properties
	gameState: undefined,
	
	//audio properties
	sound: undefined,
	
	//emitter
	pulsar: undefined,
	
	//scoring variables
	wave: undefined,
	redScrap: undefined,
	yellowScrap: undefined,
	blueScrap: undefined,
	//is the mouse down and firing?
	mouseFiring: undefined,
	
    // methods
	init : function(pShip) {
		//console.log("app.main.init() called");
		// initialize properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		this.ship = pShip;
		
		var image = new Image();
		image.src = this.app.IMAGES['shipImage'];
		this.ship.image = image;
		
		this.ship.init(this.WIDTH, this.HEIGHT);
		
		//emitter
		this.pulsar = new this.app.Emitter();
		this.pulsar.red = 255;
		this.pulsar.green = 255;
		this.pulsar.blue = 255;
		this.pulsar.minXspeed = this.pulsar.minYspeed = -0.25;
		this.pulsar.maxXspeed = this.pulsar.maxYspeed = 0.25;
		this.pulsar.lifetime = 500;
		this.pulsar.expansionRate = 0.05;
		this.pulsar.numParticles = 100;
		this.pulsar.xRange = 1;
		this.pulsar.yRange = 1;
		this.pulsar.useCircles = false;
		this.pulsar.useSquares = true;
		this.pulsar.createParticles({ x:400, y:400});
		
		//mouse
		this.mousePosition = new Victor(this.WIDTH/2,this.HEIGHT/4);
		
		//starting game state
		this.gameState = this.GAME_STATE.TITLE;
		
		//hook up events
		this.canvas.onmousedown = this.doMousedown.bind(this);
		this.canvas.onmousemove = this.getMousePosition.bind(this);
		this.canvas.onmouseup = this.doMouseup.bind(this);
		
		this.wave = 0;
		this.waveSpawned = false;
		
		this.redScrapSymbol = new app.Scrap(1, new Victor(55,75), false);
		this.redScrap = 0;
		this.blueScrapSymbol = new app.Scrap(2, new Victor(55,125), false);
		this.blueScrap = 0;
		this.yellowScrapSymbol = new app.Scrap(3, new Victor(55,175), false);
		this.yellowScrap = 0;
		
		this.prewaveCounter = 3.3;
		
		this.mouseFiring = false;
		// start the game loop
		this.update();
	},
	
	//resets scores
	reset: function(){
		this.redScrap = 0;
		this.blueScrap = 0;
		this.yellowScrap = 0;
		this.ship.health = 100;
		this.wave = 0;
		this.enemies = [];
		this.scraps = [];
		this.bullets = [];
	},
	
	//spawns enemies during prewave
	spawnWave: function(){
		this.wave++;
		var image = new Image();
		image.src =  this.app.IMAGES['enemyImage01'];
		var location;
		for(var i = 0; i < (this.wave * 2 + 5); i++){
			location = new Victor(this.utilities.getRandom(200, this.WIDTH - 150),this.utilities.getRandom(50, this.HEIGHT - 50) );
			var pseudoDistance = (this.ship.position.x - location.x)*(this.ship.position.x - location.x) + (this.ship.position.y - location.y)*(this.ship.position.y - location.y);
			while(pseudoDistance < 40000){
				pseudoDistance = (this.ship.position.x - location.x)*(this.ship.position.x - location.x) + (this.ship.position.y - location.y)*(this.ship.position.y - location.y);
				location = new Victor(this.utilities.getRandom(200, this.WIDTH - 150),this.utilities.getRandom(50, this.HEIGHT - 50) );
			}
			this.enemies.push(new app.Enemy(image, location, this.WIDTH,this.HEIGHT, this.utilities.getRandom(1,3)));
		}
		//console.log("enemy #" + this.enemies.length + " spawned");
	},
	
	update: function(){
		// 1) LOOP
		// schedule a call to update()
	 	this.animationID = requestAnimationFrame(this.update.bind(this));
	 	
	 	// 2) PAUSED?
	 	// if so, bail out of loop
	 	if(this.paused){
			this.drawPauseScreen(this.ctx);
			return;
		}
		
	 	// 3) HOW MUCH TIME HAS GONE BY?
	 	var dt = this.calculateDeltaTime();
	 	this.drawLib.clear(this.ctx,0,0,this.WIDTH,this.HEIGHT); 
		 
	 	// 4) UPDATE
		if(this.gameState == this.GAME_STATE.TITLE){
			this.drawTitleScreen(this.ctx);
			
		}
		else if(this.gameState == this.GAME_STATE.PREWAVE){
			if(!this.waveSpawned){
				this.spawnWave();
				this.waveSpawned = true;
				this.bullets = [];
			}
			
			this.prewaveCounter -= dt;
			this.drawLib.rect(this.ctx,0,0,this.WIDTH,this.HEIGHT, "RoyalBlue");
			this.drawSprites(this.ctx);
			
			this.drawHUD(this.ctx);
			this.drawPrewaveScreen(this.ctx);
			
			if(this.prewaveCounter < 0){
				this.prewaveCounter = 0;
			}
			if(this.prewaveCounter <= 0){
				this.gameState = this.GAME_STATE.WAVEINPROGRESS;
				this.prewaveCounter = 3.3;
				this.waveSpawned = false;
				app.sound.playBGAudio();
			}
		}
		else if(this.gameState == this.GAME_STATE.WAVEINPROGRESS){
			this.moveSprites(dt);
			this.checkForCollisions();
			this.checkForWeaponHit();
			this.drawLib.rect(this.ctx,0,0,this.WIDTH,this.HEIGHT, "RoyalBlue");
			this.drawSprites(this.ctx);
			this.drawHUD(this.ctx);
			
			if(this.mouseFiring){
				this.bullets.push(new app.Bullet(this.ship.position, this.ship.forward, this.WIDTH, this.HEIGHT));
			}
			
			if (this.debug){
				this.drawDebug(this.ctx, dt);
			}
			
			if(this.ship.health <= 0){
				this.gameState = this.GAME_STATE.GAMEOVER;
			}
			if(this.enemies.length == 0){
				this.gameState = this.GAME_STATE.PREWAVE;
			}
		}
		else if(this.gameState == this.GAME_STATE.GAMEOVER){
			app.sound.stopBGAudio();
			this.drawLib.rect(this.ctx,0,0,this.WIDTH,this.HEIGHT, "RoyalBlue");
			this.drawSprites(this.ctx);
			this.drawHUD(this.ctx);
			this.drawGameOverScreen(this.ctx);
		}
	},
	//creates a number of scrap objects with random directions of velocity
	spawnScrap: function(position, type, quantity){
		for(var i = 0; i < quantity; i++){
			this.scraps.push(new app.Scrap(type,position, true));
		}
	},
	
	checkForCollisions: function(){
		var self = this;
		//enemies vs ship
		this.enemies.forEach(function(enemy){
			if(self.utilities.collides(enemy, self.ship)){
				enemy.takeDamage(35);
				self.ship.takeDamage(10);
			}
		});
		
		this.enemies.forEach(function(enemy){
			self.bullets.forEach(function(bullet){
				if(self.utilities.collides(enemy, bullet)){
					enemy.takeDamage(5);
					bullet.active = false;
				}
			})
			
		});
		//powerups vs ship
		this.scraps.forEach(function(scrap){
			if(self.utilities.collides(scrap, self.ship)){
				self.incrementScore(scrap);
			}
		});
	},
	//increase scoring based on pickups
	incrementScore: function(scrap){
		scrap.active = false;
		this.ship.gainHealth(1);
		if(scrap.type == 1){
			this.redScrap += 10;
		}
		else if(scrap.type == 2){
			this.yellowScrap += 10;
		}
		else if(scrap.type == 3){
			this.blueScrap += 10;
		}
	},
	
	checkForWeaponHit: function(){
		
	},
	
	moveSprites: function(dt){
		this.setShipForward(this.mousePosition.x, this.mousePosition.y);
		//keyboard input
		if(app.keydown[app.KEYBOARD.KEY_W]){
			this.ship.moveUp(dt);
		}
		if(app.keydown[app.KEYBOARD.KEY_A]){
			this.ship.moveLeft(dt);
		}
		if(app.keydown[app.KEYBOARD.KEY_S]){
			this.ship.moveDown(dt);
		}
		if(app.keydown[app.KEYBOARD.KEY_D]){
			this.ship.moveRight(dt);
		}
		
		//enemies
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].update(dt);
		}
		
		//set value of current array to new array without inactive elements
		this.enemies = this.enemies.filter(function(enemy){
			return enemy.active;
		});
		
		//scraps
		for(var i = 0; i < this.scraps.length; i++){
			this.scraps[i].update(dt);
		}
		
		//set value of current array to new array without inactive elements
		this.scraps = this.scraps.filter(function(scrap){
			return scrap.active;
		});
		
		for(var i = 0; i < this.bullets.length; i++){
			this.bullets[i].update(dt);
		}
		
		this.bullets = this.bullets.filter(function(bullet){
			return bullet.active;
		});
		
		//ui scrap
		this.redScrapSymbol.update(dt);
		this.yellowScrapSymbol.update(dt);
		this.blueScrapSymbol.update(dt);
	},
	
	drawSprites: function(ctx){
		if(this.gameState != this.GAME_STATE.GAMEOVER){
			this.ship.draw(ctx);
		}
		
		// draw enemies
		for(var i=0; i < this.enemies.length; i++){
			this.enemies[i].draw(this.ctx);
		};
		//draw scraps
		for(var i=0; i < this.scraps.length; i++){
			this.scraps[i].draw(this.ctx);
		};
		
		for(var i = 0; i < this.bullets.length; i++){
			this.bullets[i].draw(this.ctx);
		}
		
		//particles
		this.pulsar.updateAndDraw(this.ctx,{x:400,y:400});
	},
	
	fillText: function(ctx, string, x, y, css, color) {
		this.ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		this.ctx.font = css;
		this.ctx.fillStyle = color;
		this.ctx.fillText(string, x, y);
		this.ctx.restore();
	},
	
	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = app.utilities.clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},

	drawPauseScreen: function(ctx){
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,this.WIDTH, this.HEIGHT);
		ctx.textAlign = "center";
		ctx.textBaseLine = "middle";
		this.fillText(this.ctx,"... PAUSED ...", this.WIDTH/2, this.HEIGHT/2, "40pt courier", "white");
		ctx.restore();
	},
	
	drawTitleScreen: function(ctx){
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,this.WIDTH, this.HEIGHT);
		ctx.textAlign = "center";
		ctx.textBaseLine = "middle";
		this.fillText(this.ctx,"Scrap Wings", this.WIDTH/2, this.HEIGHT/2, "80pt oswald", "white");
		this.fillText(this.ctx,"[wasd to move, aim with mouse, shoot with m1]", this.WIDTH/2, 3 * this.HEIGHT / 5, "20pt oswald", "white");
		this.fillText(this.ctx,"Click to Play", this.WIDTH/2, 3 * this.HEIGHT / 4, "50pt oswald", "white");
		this.fillText(this.ctx,"By Ryan McGlinn, uses Victor js and js preload", this.WIDTH/2, this.HEIGHT - 30, "20pt oswald", "white");
		ctx.restore();
	},
	
	drawPrewaveScreen: function(ctx){
		ctx.save();
		ctx.textAlign = "center";
		ctx.textBaseLine = "middle";
		ctx.fillStyle = "rgba(0,0,0," + .5 + ")";
		ctx.fillRect(0,0,this.WIDTH, this.HEIGHT);
		this.fillText(this.ctx, "Wave " + this.wave + " begins in " + Math.round(this.prewaveCounter), this.WIDTH/2, this.HEIGHT/2, "40pt oswald", "white");
		this.fillText(this.ctx, "Get Ready", this.WIDTH/2, 3 * this.HEIGHT / 4, "20pt oswald", "white");
		ctx.restore();
	},
	
	drawGameOverScreen: function(ctx){
		ctx.save();
		ctx.textAlign = "center";
		ctx.textBaseLine = "middle";
		ctx.fillStyle = "rgba(0,0,0," + .5 + ")";
		ctx.fillRect(0,0,this.WIDTH, this.HEIGHT);
		this.fillText(this.ctx, "Game Over", this.WIDTH/2, this.HEIGHT/3, "100pt oswald", "white");
		this.fillText(this.ctx, "You scored a total of " + (this.redScrap + this.blueScrap + this.yellowScrap) + " points", this.WIDTH/2, this.HEIGHT / 2, "40pt oswald", "white");
		this.fillText(this.ctx, "Click to return to the main menu", this.WIDTH/2, 3 * this.HEIGHT / 4, "20pt oswald", "white");
		ctx.restore();
	},
	
	getMousePosition: function(e){
		this.mousePosition = app.utilities.getMouse(e);
	},
	
	setShipForward: function(x, y){
		//call the ship version of this function
		app.ship.setForward(x, y);
	},
	
	doMousedown: function(e) {
		if(this.gameState == this.GAME_STATE.TITLE){
			this.gameState = this.GAME_STATE.PREWAVE;
		}
		else if(this.gameState == this.GAME_STATE.WAVEINPROGRESS){
			//fire weapon of some sort
			this.mouseFiring = true;
			
		}
		else if(this.gameState == this.GAME_STATE.GAMEOVER){
			this.reset();
			this.gameState = this.GAME_STATE.TITLE;
		}
	},
	
	doMouseup: function(e) {
		this.mouseFiring = false;
	},
	
	
	drawHUD: function(ctx){
		ctx.save();
		ctx.fillStyle = "Gray";
		ctx.fillRect(0,0,150, this.HEIGHT);
		//var scaledColor = this.utilities.map(this.ship.health,0,100,0,255);
		ctx.fillStyle = "black";
		ctx.fillRect(25, 243, 100, 500);
		//this.ctx.fillStyle = "rgb(255," + scaledColor + "," + scaledColor + ")";
		ctx.fillStyle = "White";
		var scaledHeight = this.utilities.map(this.ship.health, 0, 100, 0, 500);
		ctx.fillRect(25, 743 - scaledHeight, 100, scaledHeight);
		ctx.textAlign = "center";
		ctx.textBaseLine = "top";
		this.fillText(ctx, "Wave " + this.wave, 75, 40, "20pt oswald", "white");
		this.fillText(ctx, "Health", 75, 240, "12pt oswald", "white");
		
		this.redScrapSymbol.draw(ctx);
		this.fillText(ctx, "x  " + this.redScrap, 90, 82, "12pt oswald", "white");
		this.blueScrapSymbol.draw(ctx);
		this.fillText(ctx, "x  " + this.blueScrap, 90, 132, "12pt oswald", "white");
		this.yellowScrapSymbol.draw(ctx);
		this.fillText(ctx, "x  " + this.yellowScrap, 90, 182, "12pt oswald", "white");
		ctx.restore();
	},

	drawDebug: function(ctx, dt){
		ctx.save();
		// draw dt in bottom right corner
		this.fillText(ctx, "dt: " + dt.toFixed(3), this.WIDTH - 150, this.HEIGHT - 10, "18pt oswald", "white");
		
		var self = this;
		//enemy collision circles
		this.enemies.forEach(function(enemy){
			self.ctx.save();
			self.ctx.lineWidth = 1;
			self.ctx.strokeStyle = "red";
			self.ctx.beginPath();
			self.ctx.arc(enemy.position.x,enemy.position.y,enemy.collideRadius,0,Math.PI*2,false);
			self.ctx.closePath();
			self.ctx.stroke();
			self.ctx.restore();
		});
		
		//player collision circle
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = "red";
		ctx.beginPath();
		ctx.arc(this.ship.position.x,this.ship.position.y,this.ship.collideRadius,0,Math.PI*2,false);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	},
	
	pauseGame: function(){
		this.paused = true;
		
		//stop the animation loop
		cancelAnimationFrame(this.animationID);
		
		
		//call update so the pause screen gets drawn
		this.update();
	},
	
	resumeGame: function(){
		//stop the animation loop in case it is still running
		cancelAnimationFrame(this.animationID);
		this.paused = false;
		this.update();
	},
	
	toggleDebug: function() {
		this.debug = !this.debug;
	},
}; // end app.main