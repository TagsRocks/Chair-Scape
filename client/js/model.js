var Model = (function()
{
	this.Mesh;
	this.geometry;
	this.Animations;
	this.materials;
	this.position;
	this.scale = 100;
	this.name = "undefined model";
	
	this.run = false;
	this.added = false;
	this.collision = false;
	
	this.initFunc;
	this.updateFunc;
	
	// rewrite this to be self managing i guess
	function Model(path,posx,posy,posz,scl,uid)
	{
		this.name = path;
		this.collision = true;
		this.Animations = new Array();
		this.position = new THREE.Vector3(posx,posy,posz);
		this.scale = scl;
		
		if(uid) { this.uid = uid; }
		if(path) { modman.addWhenReady(this); }
 	};
	
	this.initFunc = function()
	{
		console.log("No initFunc added to model");
	}
	
	this.updateFunc = function()
	{
		console.log("No updateFunc added to model");
	}
		
	return Model;
})();
	
	Model.prototype.create = function(callback)
	{
		if(this.scale) 
		{
			this.Mesh.scale.set(this.scale,this.scale,this.scale);
		} 
		else 
		{
			this.Mesh.scale.set(100,100,100);
		}
		if(this.uid && this.uid!=-1) { this.Mesh.uid = this.uid; }
		this.Mesh.position = this.position;
		this.Mesh.castShadow = true;
		this.Mesh.receiveShadow = true;
		this.Mesh.model = this;
		
		this.Animations = this.Mesh.geometry.animations; // finish this shit later
		
		//if(this.collision) { Land.push(this.Mesh); }
		this.added = true;
		this.initFunc();
	};
	
	Model.prototype.ToggleRun = function()
	{
		this.run = !this.run;
	};
	
	Model.prototype.Run = function() { this.run = true; };
	Model.prototype.Stop = function() { this.run = false; };
	
	Model.prototype.Update = function()
	{
		if(this.run)
		{
			this.updateFunc();
		}
	};