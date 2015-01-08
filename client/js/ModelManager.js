var models = '/client/content/models/';

var ModelManager = (function()
{
	this.LoadedModels = [];
	this.QeueudModelsArr = [];
	
	this.modelsToAddToScene = [];
	
	function ModelManager()
	{
		this.modelsToAddToScene = new Array();
		this.LoadedModels = new Array();
		this.QeueudModelsArr = new Array();
	};
	
	return ModelManager;
})();

	ModelManager.prototype.addWhenReady = function(model)
	{
		var pushtoarr = true;
		modman.QeueudModelsArr.forEach(function(v,i,a)
		{
			if(v===model.name)
			{
				pushtoarr = false;
			}
		});
		if(pushtoarr)
		{
			modman.modelsToAddToScene.push(model);
			modman.QeueudModelsArr.push(model.name);
		}
	};
	
	ModelManager.prototype.Update = function()
	{
		var mmr = this;
		if(!this.modelsToAddToScene) { return; }
		this.modelsToAddToScene.forEach(function(v,i,a)
		{
			if(mmr.LoadedModels[v.name]) 
			{ 
				v.materials = mmr.LoadedModels[v.name].materials.clone();
				v.geometry = mmr.LoadedModels[v.name].geometry.clone();
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
			console.log("Adding "+v+" to QeueudModelsArr");
			var loader = new THREE.JSONLoader(); 
			loader.load(models+v+ext, function(geometry, materials) 
			{
				mmr.LoadedModels[v] = new Model();
				mmr.LoadedModels[v].name = v;
				mmr.LoadedModels[v].materials = new THREE.MeshFaceMaterial(materials);
				mmr.LoadedModels[v].geometry = geometry;
			});
			mmr.QeueudModelsArr.splice(i,1);
		});
	};
	