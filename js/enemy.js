"use strict";
app.Enemy = function(){

	function Enemy(image, position, canvasWidth,canvasHeight, type) {
		// ivars
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.activeLast = true;
		this.active = true;
		
		this.position = position;
		this.velocity = app.utilities.getRandomUnitVector(250);
		this.image = image;
		this.width = 75;
		this.height = 75;
		
		this.health = 100;
		this.collideRadius = 38;
		
		this.type = Math.round(type);
		//this.setStartPosition();
	};
		
	Enemy.utilities = undefined;
	Enemy.drawLib = undefined;
	
	var p = Enemy.prototype;
	
	p.draw = function(ctx) {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		if(!this.image){
			Enemy.drawLib.rect(ctx, -this.width/2, -this.height/2, this.width, this.height, "red");
		}
		else{
			Enemy.drawLib.enemy(ctx,this.image, -this.width/2, -this.height/2, this.width, this.height);
		}
		ctx.restore();
	};
	
	p.takeDamage = function(damage){
		this.health -= damage;
	};
	
	p.advancePosition = function(dt){
		this.position = new Victor(this.position.x + (this.velocity.x * dt), this.position.y + (this.velocity.y * dt));
	};
	
	p.update = function(dt) {
		keepInBounds(this,dt);
		this.advancePosition(dt);
		this.activeLast = this.active;
		if(this.health < 0){
			//the enemy was destroyed this frame
			explode(this);
		}
	};
	
	function explode(obj) {
		obj.active = false;
		app.main.spawnScrap(obj.position,obj.type,5);
		app.sound.playEffect();
	};
	
	//set start position
	function setStartPosition(obj){
		obj.position = Victor(0,0);
	};
	
	//keeps the enemy objects within bounder
	function keepInBounds(obj,dt) {
		if((obj.position.x - obj.width/2) < 150 || (obj.position.x + obj.width/2) > obj.canvasWidth){
			obj.velocity.x *= -1;
			obj.advancePosition(dt);
		}
		if((obj.position.y - obj.height/2) < 0 || (obj.position.y + obj.height/2) > obj.canvasHeight){
			obj.velocity.y *= -1;
			obj.advancePosition(dt);
		}
	};
	
	return Enemy;
	
}();