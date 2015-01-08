var Model = (function()
{
	this.Mesh;
	this.geometry;
	this.materials;
	this.position;
	this.added = false;
	this.collision = false;
	this.scale = 100;
	this.func = function() { console.log('no script added') };
	this.run = false;
	this.scripted = false;
	this.name = "undefined model";
	
	// rewrite this to be self managing i guess
	function Model(path,posx,posy,posz,scl,func,uid)
	{
		this.name = path;
		this.collision = true;
		this.position = new THREE.Vector3(posx,posy,posz);
		this.scale = scl;
		
		if(func) { func(this); }
		if(uid) { this.uid = uid; }
		if(path) { modman.addWhenReady(this); }
 	};
	
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
		//console.log('Adding model mesh['+this.name+']');
		scene.add(this.Mesh);
		if(this.collision) { Land.push(this.Mesh); }
		this.added = true;
		console.log(this);
	};
	
	Model.prototype.ToggleRun = function()
	{
		this.run = !this.run;
	};
	
	Model.prototype.Run = function() { this.run = true; };
	Model.prototype.Stop = function() { this.run = false; };
	
	Model.prototype.Update = function()
	{
		if(this.scripted)
		{
			if(this.run && this.func)
			{
				this.func();
			}
		}
	};