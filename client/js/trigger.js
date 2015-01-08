
var triggers = [];
triggers.DEBUGLEVEL = 0;

var Trigger = (function()
{
	this.triggered = false;
	this.id = -1;
	this.area;
	this.parentSlice;
	this.func;

	function Trigger(dimensions,pos,func)
	{
		var material = new THREE.MeshLambertMaterial( { transparent: true } );
		material.opacity = 0.5;
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
		this.area = cubem.clone();
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

this.Entered = false;

Trigger.prototype.OnEntered = function()
{
	this.Entered = true;
	this.Exited = false;
	this.trigger();
};

this.Exited = false;

Trigger.prototype.OnExited = function()
{
	this.Entered = false;
	this.Exited = true;	
};

Trigger.prototype.Update = function()
{
	/*if(controls.getObject().position.x > this.area.position.x - this.area.width
		&& controls.getObject().position.x < this.area.position.x + this.area.width
	&& controls.getObject().position.y > this.area.position.y - this.area.height
	&& controls.getObject().position.y < this.area.position.y + this.area.height
	&& controls.getObject().position.z > this.area.position.z -(this.area.depth/2)
	&& controls.getObject().position.z < this.area.position.z+(this.area.depth/2))
	{
		if(!this.Entered) { this.OnEntered(); 
		console.log("le");}
	}
	else
	{
		if(!this.Exited && this.Entered)
		{
			this.OnExited();
		}
	}*/
};
