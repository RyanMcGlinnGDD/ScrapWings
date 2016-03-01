"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.Scrap = function() {
	function Scrap(type, position, moving) {
		//what type of scrap is this?
		this.active = true;
		this.diameter = 30;
		this.type = type;
		this.position = position;
		this.lifetime = 0;
		this.active = true;
		this.friction = .95;
		if(moving == true){
			this.velocity = Scrap.utilities.getRandomUnitVector(150);
		}
		else
		{
			this.velocity = Scrap.utilities.getRandomUnitVector(0);
		}
		this.collideRadius = 15;
		this.frame = Scrap.utilities.getRandom(0,5);
		setImage(this);
	};
	
	Scrap.utilities = undefined;
	Scrap.drawLib = undefined;
	
	var p = Scrap.prototype;
	
	p.draw = function(ctx) {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		if(!this.image){
			Scrap.drawLib.rect(ctx, -this.diameter/2, -this.diameter/2, this.diameter, this.diameter, "red");
		}
		else{
			Scrap.drawLib.scrap(ctx,this.image, -this.diameter/2, -this.diameter/2, this.diameter, this.diameter, Math.floor(this.frame));
		}
		ctx.restore();
	};
	
	p.advancePosition = function(dt){
		this.position = new Victor((this.position.x + (this.velocity.x * dt)), (this.position.y + (this.velocity.y * dt)));
	};
	
	p.update = function(dt) {
		this.lifetime += dt;
		//the number of seconds the scrap will remain active before deactivating
		if(this.lifetime > 4){
			this.active = false;
		}
		this.frame += dt*10;
		if(this.frame >= 5){
			this.frame = 0;
		}
		this.advancePosition(dt);
		this.velocity = new Victor(this.velocity.x * this.friction, this.velocity.y * this.friction);
	};
	
	//assigns an image based on 3 potential type parameters
	function setImage(obj){
		var image = new Image();
		if(obj.type == 1){
			image.src =  app.IMAGES['scrapRed'];
		}
		else if(obj.type == 2){
			image.src =  app.IMAGES['scrapBlue'];
		}
		else if(obj.type == 3){
			image.src =  app.IMAGES['scrapYellow'];
		}
		obj.image = image;
	};
	
	return Scrap;
}();