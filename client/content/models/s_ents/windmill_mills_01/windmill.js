var Windmill = (function()
{
	this.model;
	
	function Windmill(Position)
	{
		this.model = new Model("windmill_mills_01",Position.x,Position.y,Position.z,200,null,2);
		
		this.createActions(this);
		this.init();
	};
	
	return Windmill;
})();

Windmill.prototype.createActions = function(self)
{
	this.model.Actions = ["Start","Stop","Examine",""];
	this.model.Functions = 
	[
		function()
		{
			Chat.AddMessage("","<b>Windmill started</b>");
			self.model.Run();
		},
		function()
		{
			Chat.AddMessage("","<b>Windmill stopped</b>");
			self.model.Stop();
		},
		function()
		{
			Chat.AddMessage("","It's a windmill");
		},
		function()
		{
		
		}
	];
};

Windmill.prototype.init = function()
{
	this.model.initFunc = function()
	{
		modman.AddToWorld(this);
		console.log("Created le windmill");
	}
	
	this.model.updateFunc = function()
	{
		this.Mesh.rotateZ(0.02);
	}
};