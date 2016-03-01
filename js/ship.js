"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

// the 'ship' object literal is now a property of our 'app' global variable
app.ship = {
	canvasWidth: undefined,
	canvasHeight: undefined,
	
	position: undefined,
	width: undefined,
	height: undefined,
	speed: undefined,
	forward: undefined,
	image: undefined,
	drawLib: undefined,
	health: undefined,
	collideRadius: undefined,
	exhaustWingLeft: undefined,
	exhaustWingRight: undefined,
	emitter: undefined,
	
	init: function(canvasWidth, canvasHeight){
		console.log("app.ship.init() called");
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		
		this.position = new Victor(canvasWidth/2, canvasHeight/2);
		this.forward = new Victor(0,0);
		this.speed = 300;
		//measured with the front of the ship pointing right
		this.width = 60;
		this.height = 44;
		this.health = 100;
		this.collideRadius = 22;
		
		//exhaust
		this.exhaustWingLeft = new app.Emitter();
		this.exhaustWingLeft.numParticles = 100;
		this.exhaustWingLeft.red = 255;
		this.exhaustWingLeft.green = 255;
		this.exhaustWingLeft.blue = 255;
		this.exhaustWingLeft.createParticles(this.emitterPointLeft());
		
		this.exhaustWingRight = new app.Emitter();
		this.exhaustWingRight.numParticles = 100;
		this.exhaustWingRight.red = 255;
		this.exhaustWingRight.green = 255;
		this.exhaustWingRight.blue = 255;
		this.exhaustWingRight.createParticles(this.emitterPointRight());
		
	},
	
	emitterPointLeft: function(){
		return{
			x:this.x,
			y:this.y + this.height/2
		};
	},
	emitterPointRight: function(){
		return{
			x:this.x,
			y:this.y - this.height/2
		};
	},
	
	draw: function(ctx) {
		
		//rotate
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(Math.atan2(this.forward.y, this.forward.x));
		if(!this.image){
			this.drawLib.rect(ctx, -this.width/2, -this.height/2, this.width, this.height, "red");
		}
		else{
			this.drawLib.ship(ctx,this.image, -this.width/2, -this.height/2, this.width, this.height);
		}
		
		this.exhaustWingLeft.updateAndDraw(ctx, this.emitterPointLeft());
		this.exhaustWingRight.updateAndDraw(ctx, this.emitterPointRight());
		ctx.restore();
		
		
	},
	
	takeDamage: function(damage){
		this.health -= damage;
		if(this.health < 0){
			this.health = 0;
		}
	},
	
	gainHealth: function(points){
		this.health += points;
		if(this.health > 100){
			this.health = 100;
		}
	},
	
	setForward: function(x, y){
		this.forward = new Victor(x - this.position.x, y - this.position.y);
	},
	
	moveLeft: function(dt){
		if(!(this.position.x - this.collideRadius < 150)){
			this.position.x -= this.speed * dt;
		}
	},
	
	moveRight: function(dt){
		if(!(this.position.x + this.collideRadius > this.canvasWidth)){
			this.position.x += this.speed * dt;
		}
	},
	
	moveUp: function(dt){
		if(!(this.position.y - this.collideRadius < 0)){
			this.position.y -= this.speed * dt;
		}
	},
	
	moveDown: function(dt){
		if(!(this.position.y + this.collideRadius > this.canvasHeight)){
			this.position.y += this.speed * dt;
		}
	}
	
}; // end app.ship