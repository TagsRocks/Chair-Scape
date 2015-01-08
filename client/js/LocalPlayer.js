function LocalPlayer()
{	var self = this;
	this.position = new THREE.Vector3();
	this.rotation = new THREE.Euler();
	
	this.velocity = new THREE.Vector3(0,0,0);
	this.onGround = true;
	
	this.target = new THREE.Vector3(0,0,0);
	this.lookvector = new THREE.Vector3(0,0,0);
	this.targmodel;
	this.lookvecmodel;
	
	this.model;
	this.animation;
	this.skeleton;
	
	this.down = new THREE.Vector3(0,-1,0);
	this.ray = new THREE.Raycaster();
	
	this.isOnObject = false;
	this.loaded = false;
	
	this.NetworkPlayers = new Array();
	
	this.inventory;
	this.rightclick;
	
	this.SetTarget = function(pos)
	{
		this.target.copy(pos);
		
		this.lookvector.copy(this.target);
		this.lookvector.y = this.target.y + 90;
		this.targmodel.position.copy(this.target);
		this.lookvecmodel.position.copy(this.lookvector);
		
		//this.moveToTarget = true;
		socket.emit('SetTarget', pos.x, pos.y, pos.z);
	}
	
	this.stepToTarget = function()
	{
		if(this.moveToTarget)
		{
			this.model.lookAt(this.lookvecmodel.position);
			this.model.translateZ( 5 );
			//this.model.rotation.x = 0;
			//this.model.rotation.z = 0;
			if(this.model.position.distanceTo(this.lookvector) < 75)
			{
				this.moveToTarget = false;
			}
		}
	}
	this.animations;
	this.load = function(x,y,z)
	{
		this.inventory = new Inventory();
			this.inventory.load();
		this.rightclick = new RightClickMenu();
			this.rightclick.load();
		this.animations = new Array();
		var targgeometry = new THREE.BoxGeometry( 10, 10, 10 );
		var targmaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		this.targmodel = new THREE.Mesh( targgeometry, targmaterial );
		var lookvecmaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		this.lookvecmodel = new THREE.Mesh( targgeometry, lookvecmaterial );
		
		scene.add( this.targmodel );
		scene.add( this.lookvecmodel );
		
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		var modelloader = new THREE.JSONLoader();
		modelloader.load('/client/content/models/player/humanoid_base_01/humanoid_base_01.js', 
		function (geometry, materials) 
		{
			var m = new THREE.MeshFaceMaterial(materials);
			for(var i = 0; i<m.length; i++)
			{
				m[i].skinning = true;
			}
			m.skinning = true;
			
			self.model = new THREE.SkinnedMesh(geometry, m, false);
			self.model.scale.set(100, 100, 100); 	
			
				
			for ( var i = 0; i < geometry.animations.length; ++i ) 
			{
				self.animations[i] = new THREE.Animation(self.model, geometry.animations[i]);
				self.animations[i].play();
			}
			
			self.skeleton = new THREE.SkeletonHelper( self.model );
					self.skeleton.material.linewidth = 10;
					self.skeleton.visible = true;
					self.skeleton.update();
			scene.add( self.skeleton );
					
			scene.add(self.model);
			
			self.loaded = true;
		});
		
		this.createNetFunctions(this);
	}
	
	this.createNetFunctions = function(self)
	{
		socket.on('MoveTo', function(x,y,z)
		{
			self.moveToTarget = true;
		});
	}
	
	this.OnGround = function(arg)
	{
		this.onGround = arg;
		//console.log("onground: "+arg);
		if(arg === true)
		{
			this.velocity.y = 0;
		}
	}
	
	this.IsOnGround = function()
	{
		return this.onGround;
	}
	
	this.postLoad = false;
	this.postLoaded = false;
	this.update = function()
	{
		if(this.postLoad && !this.postLoaded)
		{
			console.log(this.position);
			controls.target = this.model.position;
			this.model.position.x = this.position.x;
			this.model.position.y = this.position.y;
			this.model.position.z = this.position.z;
			
			controls.object.position.x -= 1000;
			
			
			//controls.dollyOut(3.5);
			this.postLoaded = true;
		}
		if(this.loaded)
		{
			this.postLoad = true;
		}
		
		this.ray.set( this.model.position, this.down);
		this.OnGround(false);
		var intersects = this.ray.intersectObjects(Land, true);
		if(intersects.length)
		{
			if ( intersects[0].distance > 0 && intersects[0].distance < 51 ) 
			{
				var face = intersects[0].face;
				this.model.position.copy(intersects[0].point);
				this.model.position.y += 50;
				this.OnGround(true);
			}
		}
		if(!this.IsOnGround())
		{
			this.velocity.y -= 5;
		}
		
		
		this.skeleton.update();
		if(this.moveToTarget) { this.stepToTarget(); }
		this.model.translateY(this.velocity.y);
	}
	
	this.OnClick = function(pos)
	{
		this.SetTarget(pos);
	}
	
	this.OnRightClick = function(obj,x,y)
	{
		this.rightclick.open(obj,x,y);
	}
}