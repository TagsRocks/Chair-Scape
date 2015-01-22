var models = '/client/content/models/';

var ModelManager = (function()
{
	this.WorldModels = [];
	this.LoadedModels = [];
	this.QeueudModelsArr = [];
	this.modelsToAddToScene = [];
	
	function ModelManager()
	{
		this.WorldModels = new Array();
		this.modelsToAddToScene = new Array();
		this.LoadedModels = new Array();
		this.QeueudModelsArr = new Array();
	};
	
	return ModelManager;
})();

	ModelManager.prototype.modelQeued = function(strName)
	{
		modman.QeueudModelsArr.forEach(function(v,i,a)
		{
			if(v===model.name)
			{
				return true;
			}
		});
		return false;
	};
	
	ModelManager.prototype.modelCached = function(strName)
	{
		var returnValue;
		modman.LoadedModels.forEach(function(v,i,a)
		{
			if(v.name===strName)
			{
				console.info("Found model in cache: "+v.name);
				returnValue = v;
			}
		});
		if(returnValue instanceof Model)
		{
			return returnValue;
		}
	};
	
	ModelManager.prototype.addWhenReady = function(model)
	{
		if(!this.modelQeued(model.name))
		{
			modman.modelsToAddToScene.push(model);
			modman.QeueudModelsArr.push(model.name);
		}
	};
	
	ModelManager.prototype.AddToWorld = function(model)
	{
		scene.add(model.Mesh);
		this.WorldModels.push(model);
	};
	
	ModelManager.prototype.Update = function()
	{
		var mmr = this;
		
		if(!this.modelsToAddToScene) { return; }
		
		mmr.WorldModels.forEach(function(v,i,a) { v.Update(); });
		
		this.modelsToAddToScene.forEach(function(v,i,a)
		{
			var cachedModel = mmr.modelCached(v.name);
			if(cachedModel instanceof Model) 
			{
				console.info("Adding cached model: "+cachedModel.name);
				v.materials = cachedModel.materials.clone();
				v.geometry = cachedModel.geometry.clone();
				v.Mesh = new THREE.Mesh(v.geometry, v.materials);
				WorldEntityManager.WorldMeshArr.push(v.Mesh);
				v.Mesh.position.set(v.position.x,v.position.y,v.position.z);
				v.create();
				console.info("Finished creating in ModMan Update");
				modman.modelsToAddToScene.splice(i,1);
			}
		});
		
		this.QeueudModelsArr.forEach(function(v,i,a) 	
		{
			var loader = new THREE.JSONLoader(); 
			loader.load(models+v+ext, function(geometry, materials) 
			{
				var index = mmr.LoadedModels.length;
				mmr.LoadedModels[index] = new Model();
				mmr.LoadedModels[index].name = v;
				mmr.LoadedModels[index].materials = new THREE.MeshFaceMaterial(materials);
				mmr.LoadedModels[index].geometry = geometry;
			});
			mmr.QeueudModelsArr.splice(i,1);
		});
	};
	