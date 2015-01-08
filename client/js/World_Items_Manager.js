var World_Item = (function()
{
	this.id = -1;
	this.uid = -1;
	this.name = "Unknown Item";
	this.model = "items/world/rock_item_world/rock_item_world";
	this.scale = 100;
	
	this.x, this.y, this.z = 0;
	
	function World_Item()
	{
		console.info("World_Item constructor run...");
	};
	
	return World_Item;
})();

var World_Entity_Manager = (function()
{
	var self = this;
	
	this.WorldItemsArr;
	this.WorldMeshArr;
	
	function World_Entity_Manager()
	{
		console.info("World_Entity_Manager constructor run...");
		this.WorldMeshArr = new Array();
		this.WorldItemsArr = new Array();
		
		this.createNetEvents();
	};
	
	return World_Entity_Manager;
})();

World_Entity_Manager.prototype.removeWItem = function(uid)
{
	self.WorldMeshArr.forEach(function(v,i,a)
	{
		if(v.uid === uid)
		{
			scene.remove(v);
			self.WorldMeshArr.splice(i,1);
		}
	});
};

World_Entity_Manager.prototype.createNetEvents = function()
{
	socket.on('NetWItem',function(WItem)
	{
		console.error(WItem);
		model(WItem.model, WItem.x, WItem.y, WItem.z, WItem.scale, 
		function(model)
		{
			model.Actions = ["Take","Examine","",""];
			model.Functions = 
			[
				function()
				{
					socket.emit('TakeWItem', model.uid);
				},
				function()
				{
					console.log("It's a rock!");
				}
			];
		},WItem.uid);
	});
	
	socket.on('RemoveNetWItem',function(uid)
	{
		self.removeWItem(uid);
	});
};
