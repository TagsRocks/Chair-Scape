function Inv_Item()
{
	this.self = this;
	
	this.id = -1;
	this.uid = -1;
	this.name = "Unknown Item";
}

function Inventory()
{
	var self = this;
	this.loaded = false;
	
	this.inventory_ui;
	
	this.capacity = 10;
	this.items;
	
	this.load = function()
	{
		this.items = new Array();
		this.loaded = true;
		this.inventory_ui = document.getElementById("inventorylistbox");
		inventorydiv.style.display = "";
		this.createNetEvents();
	}
	
	this.createNetEvents = function()
	{
		socket.on('NetAddItem', function(newItem)
		{
			self.addItem(newItem.id, newItem.uid, newItem.name);
		});
		
		socket.on('NetRemoveItem', function(uid)
		{
			self.removeItem(uid);
		});
	}
	
	this.dropSelected = function()
	{
		socket.emit('NetDropRequest', this.inventory_ui.value);
	}
	
	this.addItem = function(id,uid,name)
	{
		if(this.loaded && this.inventory_ui && this.items && this.items.length < this.capacity && id!= -1)
		{
			var newItem = new Inv_Item();
				newItem.id = id;
				newItem.uid = uid;
				newItem.name = name;
			
			this.items.push(newItem);
			this.inventory_ui.options[this.items.length-1].innerHTML = name;
			this.inventory_ui.options[this.items.length-1].value = uid;
		}
	}
	
	this.removeItem = function(uid)
	{
		this.items.forEach(function(v,i,a)
		{
			if(v && v.uid === uid)
			{
				self.items.splice(i,1);
				for(var j = 0;j<self.capacity;j++)
				{
					if(self.inventory_ui.options[j].value == v.uid)
					{
						self.inventory_ui.options[j].innerHTML = "";
						self.inventory_ui.options[j].value = "empty_slot";
					}
				}
			}
		});
	}
}