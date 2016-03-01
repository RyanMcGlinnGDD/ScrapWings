// bullet.js

"use strict";
var app = app || {};

app.Bullet = function(){

	function Bullet(position,forward, canvaseWidth, canvasHeight){
		// ivars - unique for every instance
		this.position = position;
		this.active = true;
		this.velocity = new Victor(forward.x, forward.y);
		this.collideRadius = 2;
		this.canvaseWidth = canvaseWidth;
		this.canvasHeight = canvasHeight;
	}
	
	Bullet.drawLib = undefined;
	
	var p = Bullet.prototype;
		
	p.update = function(dt) {
		this.advancePosition(dt);
		if(this.position.x < 150 || this.position.x > this.canvaseWidth || this.position.y < 0 || this.position > this.canvasHeight){
			this.active = false;
		}
	};

	//updates only position of bullet based on velocity value
	p.advancePosition = function(dt){
		this.position = new Victor((this.position.x + (2*this.velocity.x * dt)), (this.position.y + (2*this.velocity.y * dt)));
	};
	
	//calls drawlib and draws to canvas
	p.draw = function(ctx) {
		//ctx.fillStyle = this.color;
		//ctx.fillRect(this.x, this.y, this.width, this.height);
		Bullet.drawLib.rect(ctx, this.position.x, this.position.y, 4, 4, "white")
	};

	return Bullet; 
}();