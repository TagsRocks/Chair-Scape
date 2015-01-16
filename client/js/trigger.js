
var triggers = [];
triggers.DEBUGLEVEL = 0;

var Trigger = (function()
{
	this.triggered = false;
	this.id = -1;
	this.area;
	this.parentSlice;
	this.func;

	function Trigger(dimensions,pos,color,func)
	{
		var material = new THREE.MeshLambertMaterial( { transparent: true } );
		material.opacity = 0.5;
		material.color = color;
		var cubegeo = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);

		var cubem = new THREE.Mesh(cubegeo, material);
		cubem.width += dimensions.x;
		cubem.height += dimensions.y;
		cubem.depth += dimensions.z;

		cubem.position.x = pos.x;
		cubem.position.y = pos.y;
		cubem.position.z = pos.z;

		console.log('Adding trigger mesh['+triggers.length+']');
		scene.add(cubem);

		this.id = triggers.length;
		this.area = dimensions;
		this.position = pos;
		this.func = func;
		triggers.push(this);
	};
	return Trigger;
})();

Trigger.prototype.trigger = function()
{
	if(this.triggered)
	{
		this.triggered = false;
	}
	else
	{
		this.triggered = true;
		this.func();
	}
};

Trigger.prototype.OnEntered = function()
{
	this.Entered = true;
	this.Exited = false;
	this.trigger();
};

Trigger.prototype.OnExited = function()
{
	this.Entered = false;
	this.Exited = true;	
};

Trigger.prototype.Update = function()
{
	if(!LocalPly) { return; }
	
	if(LocalPly.position.x > this.position.x - this.area.x
	&& LocalPly.position.x < this.position.x + this.area.x
	//&& LocalPly.position.y > this.area.position.y - this.area.height
	//&& LocalPly.position.y < this.area.position.y + this.area.height
	&& LocalPly.position.z > this.position.z -(this.area.z/2)
	&& LocalPly.position.z < this.position.z +(this.area.z/2))
	{
		if(!this.Entered) 
		{ 
			this.OnEntered(); 
			console.log("le");
		}
	}
	else
	{
		if(!this.Exited && this.Entered)
		{
			this.OnExited();
		}
	}
};
