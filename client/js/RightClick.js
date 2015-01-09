function RightClickMenuBase(b)
{
	var self = this;
	
	this.Base = b;
	
	this.x, y = 0;
	
	this.getX = function() { return this.x; }
	this.setX = function(x)
	{
		this.Base.style.left = x+"px";
		this.x = x;
	}
	
	this.getY = function() { return this.y; }
	this.setY = function(y)
	{
		this.Base.style.top = y+"px";
		this.y = y;
	}
	
	this.getPos = function() { return new THREE.Vector2(this.getX(),this.getY()); }
	this.setPos = function(x,y)
	{
		this.setX(x);
		this.setY(y);
	}
	
}

function RightClickMenuOption(b)
{
	this.ActionText;
	this.Base = b;
	this.Hidden = true;
	
	this.setText = function(t)
	{
		this.Base.innerHTML = t;
		this.ActionText = t;
	}
	
	this.Show = function()
	{
		rightclick.style.display = "";
		this.Hidden = false;
		this.setText(this.ActionText);
	}
	
	this.Hide = function()
	{
		rightclick.style.display = "none";
		this.Hidden = true;
		this.Base.innerHTML = "";
	}
	
	this.Action = function()
	{
		console.log("No function");
	}
}

function RightClickMenu()
{
	var self = this;
	
	this.Base;
	this.Options;	
	
	this.selectedWItem;
	
	this.load = function()
	{
		rightclick.style.display = "";
		var blockContextMenu = function (evt) {
			evt.preventDefault();
		};
		// http://stackoverflow.com/questions/6789843/disable-right-click-menu-in-chrome
		window.addEventListener('contextmenu', blockContextMenu);
	
		this.Base = new RightClickMenuBase(document.getElementById("RightClickTable"));
		
		this.Options = new Array();
		for(var i = 0; i<this.Base.Base.rows.length; i++)
		{
			var newOption = new RightClickMenuOption(this.Base.Base.rows[i].cells[0]);
				newOption.ActionText = newOption.Base.innerHTML;
				
			this.Options[i] = newOption;
		}
		this.Base.setPos(50,50);
	}
	
	this.open = function(intersect,x,y)
	{
		console.log(intersect);
		console.log("rightclick: {"+x+","+y+"}");
		
		this.Base.setPos(x,y);
		console.log(this.Base.getPos());
		
		if(intersect.object.model.Actions && intersect.object.model.Functions) 
		{ 
			self.selectedWItem = intersect.object.model.uid;
			intersect.object.model.Actions.forEach(function(v,i,a)
			{
				if(v && !(v===""))
				{
					self.Options[i].setText(v);
				} else { self.Options[i].Hide(); }
			});
			intersect.object.model.Functions.forEach(function(v,i,a)
			{
				self.Options[i].Action = v;
			});
		}
	}
}