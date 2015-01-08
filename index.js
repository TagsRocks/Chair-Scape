var THREE = require('three');
var app = require('express')();
var express = require('express');
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var readline = require('readline'),
	cInput = readline.createInterface(process.stdin, process.stdout),
  prefix = '> ';

  


function World_Item()
{
	this.id = -1;
	this.uid = -1;
	this.name = "Unknown Item";
	this.model = "items/world/rock_item_world/rock_item_world";
	
	this.scale = 100;
	
	this.spawned = false;
	this.item_spawn;
	
	this.x, this.y, this.z = 0;
}

function World_Item_Prototype()
{
	this.id = -1;
	this.uid = -1;
	this.name = "Unknown Item Prototype";
	this.model = "items/world/rock_item_world/rock_item_world";
	
	this.x, this.y, this.z = 0;
}

function World_Entity_Manager()
{
	var self = this;
	
	this.WorldItemsArr = new Array();
	this.WorldItemsSpawnArr = new Array();
	
	this.addItemToWorld = function(WItem)
	{
		self.WorldItemsArr.push(WItem);
		SessionMgr.ActiveSessions.forEach(function(v,i,a)
		{
			io.to(v).emit("NetWItem",WItem);
		});
		console.log("Added "+WItem.name+" to world at {"+WItem.x+","+WItem.y+","+WItem.z+"}");
	}
	
	this.removeItemFromWorld = function(uid)
	{
		this.WorldItemsArr.forEach(function(v,i,a)
		{
			if(v.uid === uid)
			{
				self.WorldItemsArr.splice(i,1);
				SessionMgr.ActiveSessions.forEach(function(v,i,a)
				{
					io.to(v).emit("RemoveNetWItem", uid);
				});
			}
		});
	}
	
	this.findItemByID = function(uid,callback)
	{	
		var confirm_uid;
		uid = parseInt(uid)
		if(uid && uid != -1)
		{
			this.WorldItemsArr.forEach(function(v,i,a)
			{
				if(v.uid === uid)
				{
					confirm_uid = v.uid;
				}
			},uid,confirm_uid);
		}
		if(confirm_uid)
		{
			callback(confirm_uid);
		}
		else
		{
			console.log("Error finding WItem("+uid+")");
		}
	}
	
	this.SpawnByDrop = function(item,ply)
	{
		var newitem = new World_Item();
			newitem.id = item.id;
			newitem.uid = item.uid;
			newitem.name = item.name;
			
			newitem.x = ply.posx;
			newitem.y = ply.posy + 5;
			newitem.z = ply.posz;
			
		self.addItemToWorld(newitem);
	}
	
	this.CreateItemAtPoint = function(item)
	{
		self.addItemToWorld(item);
	}
	
	this.CreateItemSpawn = function(x,y,z,t,item_prototype)
	{
		var newItemPrototype = new World_Item_Prototype();
			newItemPrototype.name = "rock";
			newItemPrototype.x = x;
			newItemPrototype.y = y;
			newItemPrototype.z = z;
			
		var newSpawn = new Item_Spawn(x,y,z,t,newItemPrototype);
		this.WorldItemsSpawnArr.push(newSpawn);
	}
	
	this.update = function(curTime)
	{
		this.WorldItemsSpawnArr.forEach(function(v,i,a)
		{
			v.Fire(curTime);
		});
	}
}

function Item_Spawn(x,y,z,t,item_prototype)
{
	var self = this;
	
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.rate = t;
	this.lastFire = 0;
	
	this.lastSpawnedItem;
	
	this.world_item_prototype = item_prototype;
	
	this.item_taken = false;
	
	this.Fire = function(curTime)
	{
		if(curTime && this.rate && curTime > this.lastFire + this.rate)
		{
			if(this.item_taken === true || this.lastFire === 0)
			{
				this.lastFire = curTime;
				this.item_taken = false;
				var lastSpawnedItem = this.genItem();
				WorldEntityManager.CreateItemAtPoint(lastSpawnedItem);
			}
		}
	}
	
	this.genItem = function()
	{
		var spawned_item = new World_Item();
			spawned_item.id = this.world_item_prototype.id;
			spawned_item.uid = ITEM_COUNT;
			spawned_item.name = this.world_item_prototype.name;
			spawned_item.model = this.world_item_prototype.model;
			
			spawned_item.spawned = true;
			spawned_item.item_spawn = this;
			
			spawned_item.x = this.x;
			spawned_item.y = this.y;
			spawned_item.z = this.z;
			
		ITEM_COUNT++;
		return spawned_item;
	}
	
	return this;
}

var ITEM_COUNT = 1;

function Inv_Item()
{
	this.id = -1;
	this.uid = -1;
	this.name = "Unknown Item";
}

function Inventory()
{
	var self = this;
	this.Player;
	
	this.capacity = 10;
	this.items;
	
	this.load = function(Ply)
	{
		this.Player = Ply;
		this.items = new Array();
		
		this.createNetEvents();
	}
	
	this.listInventory = function()
	{
		console.log("\nInventory List:\n{");
		this.items.forEach(function(v,i,a)
		{
			console.log(i+" - Item["+v.uid+"]	"+v.name+"		"+v.id);
		});
		console.log("}\n");
	}
	
	this.getItemByID = function(uid,callback)
	{	
		var confirm_uid;
		uid = parseInt(uid)
		if(uid && uid != -1)
		{
			this.items.forEach(function(v,i,a)
			{
				if(v.uid === uid)
				{
					confirm_uid = v;
				}
			},uid,confirm_uid);
		}
		if(confirm_uid && confirm_uid.uid === uid)
		{
			callback(confirm_uid);
		}
		else
		{
			console.log("Error finding item("+uid+")");
		}
	}
	
	this.createNetEvents = function()
	{
		self.Player.socket.on('NetDropRequest', function(drop_item_req)
		{ // MAKE IT SO IT DROPS AN ITEM ON THE FLOOR FOR ALL PLAYERS
			var dropuid = parseInt(drop_item_req);
			WorldEntityManager.findItemByID(dropuid, function(itemToRemove)
			{
				if(itemToRemove && itemToRemove === dropuid) 
				{
					self.removeItem(itemToRemove,true);
				} 
				else 
				{ 
					console.log(dropuid+" != "+itemToRemove); 
				}
			});
		});
	}
	
	this.addItem = function(id,uid,name)// differentiate from creating and adding later
	{
		if(this.items && this.items.length < this.capacity && id!= -1)
		{
			var newItem = new Inv_Item();
				newItem.id = id;
				newItem.uid = uid;
				newItem.name = name;
			
			ITEM_COUNT++
			
			this.items.push(newItem);
			console.log("Added "+newItem.name+"("+newItem.id+", "+newItem.uid+") to "+self.Player.name+"("+self.Player.pid+")'s inventory");
			io.to(self.Player.pid).emit("NetAddItem",newItem);
		}
	}
	
	this.WItemToInv = function(WItem)
	{
		if(WItem && WItem.id!=-1)
		{
			var invItem = new Inv_Item();
				invItem.id = WItem.id;
				invItem.uid = WItem.uid;
				invItem.name = WItem.name;
			
			return invItem;
		}
		
		return false;
	}
	
	this.addItemFromWorld = function(WItem)
	{
		if(WItem && self.items && self.items.length < self.capacity && WItem.id!=-1)
		{
			var newItem = self.WItemToInv(WItem);
			console.log("witemc: "+newItem.name);
			if(newItem && newItem!=false && newItem.uid === WItem.uid)
			{
				WorldEntityManager.removeItemFromWorld(WItem.uid);
				self.items.push(newItem);
				io.to(self.Player.pid).emit("NetAddItem",newItem);
				console.log("Added "+newItem.name+"("+newItem.id+", "+newItem.uid+") to "+self.Player.name+"("+self.Player.pid+")'s inventory");
			
			}
		}
	}
	
	this.removeItem = function(uid,drop)
	{
		this.items.forEach(function(v,i,a)
		{
			if(v && v.uid == uid)
			{
				var droppeditem = v;
				console.log("	Removing item("+uid+")");
				self.items.splice(i,1);
				io.to(self.Player.pid).emit("NetRemoveItem", uid);
				if(drop) { self.dropItem(droppeditem); }
			}
		});
	}
	
	this.dropItem = function(item)
	{
		WorldEntityManager.SpawnByDrop(item, self.Player);
	}
}

function NetworkPlayer()
{
	this.pid = -1;
	this.name = "unnamed";

	this.posx = 0;
	this.posy = 0;
	this.posz = 0;
}

function UserSession()
{
	this.socket;
	this.pid = -1;
	this.name = "unnamed";
	this.loggedin = false;
	
	this.OtherClients;
	
	this.posx = 1550;
	this.posy = 1550;
	this.posz = 100;
	
	this.inventory;
	
	var self = this;
	
	this.createNetEvents = function(s)
	{
		this.socket = s;
		this.OtherClients = new Array();
		this.socket.on('disconnect', function()
		{
			self.loggedin = false;
			console.log(self.name + ' disconnected');
			SessionMgr.logout(self);
		});

		this.socket.on('Login', function(usrn,pswd)
		{
			console.log("Login attempt:\n    -" + usrn + "\n    -" + pswd);
			if(usrn.length > 2)
			{
				self.name = usrn;
				self.loggedin = true;
				io.to(self.pid).emit('gameClient');
			}
		});
		
		this.socket.on('ClientLoaded', function()
		{
			console.log(self.name + "'s client has loaded.");
			console.log("    - position: " + self.posx + "," + self.posy + "," + self.posz);
			io.to(self.pid).emit('LoadPly', self.posx, self.posy, self.posz);
			self.inventory = new Inventory();
				self.inventory.load(self);
			self.loadAllPlayers();
			SessionMgr.PlayerJoin(self);
		});
		
		this.socket.on('chatinput',function(text)
		{
			if(self && self.loggedin && text && text.length > 0)
			{
				console.log(self.name+": "+text);
				io.to(self.pid).emit('PlyChat', self.name, text);
				self.OtherClients.forEach(function(v,i,a)
				{
					io.to(v).emit('PlyChat', self.name, text);
				});
			}
		});
		
		this.socket.on('SetTarget', function(x,y,z)
		{
			console.log(self.name + " set target to {" +  x + "," + y + "," + z + "}");
			self.posx = x;
			self.posy = y;
			self.posz = z;
			io.to(self.pid).emit('MoveTo', x, y, z);
			console.log("    ("+self.pid+").OtherClients.length = "+self.OtherClients.length);
			self.OtherClients.forEach(function(v,i,a)
			{
				var other = SessionMgr.getPlayerByID(v);
				if(other && other.loggedin)
				{
					console.log("         - NetMoveTo packet sent to "+other.name+" ("+other.pid+")");
					io.to(v).emit('NetMoveTo', x, y, z, self.pid);
				}
				else
				{
					if(!other)
					{
						console.log("         ! NetMoveTo packet failed! OtherClient("+v+") does not exist!");
					}
				}
			});
		});
		
		this.socket.on('TakeWItem',function(uid)
		{
			WorldEntityManager.findItemByID(uid,
			function(item_to_take)
			{
				self.inventory.addItemFromWorld(item_to_take);
			});
		});
	}
	
	this.loadAllPlayers = function()
	{
		console.log(self.name + " is now loading all players...");
		var ids = new Array();
		
		SessionMgr.SessionArr.forEach(function(v,i,a)
		{
			if(v && v.pid && v.pid != self.pid && v.loggedin)
			{
				ids.push(v.pid);
				console.log("    preparing:"+v.name+"("+v.pid+")");
				self.OtherClients.push(v.pid);
			}
			else
			{
				console.log("  ! ignoring:"+v.name+"("+v.pid+")");
			}
		});
		if(ids && ids.length>0)
		{
			this.loadNetworkPlayers(ids);                                                
		}
		else
		{
			console.log("    "+(SessionMgr.SessionArr.length-1)+" other user sessions");
		}
	}
	
	this.loadNetworkPlayers = function(id)
	{
		console.log("    Sending Network Players ("+id.length+")");  
		
		console.log("        Network Players:");
		for(var i = 0; i<id.length; i++)
		{	
			var ply = SessionMgr.getPlayerByID(id[i]);
			console.log("        - " + ply.name + "    (" + ply.pid + ")");
		}             
		
		console.log("        "+(SessionMgr.SessionArr.length-1)+" other user sessions");
		var NetworkPlayers = new Array();
		for(var i = 0; i<id.length; i++)
		{
			var SvrPly = SessionMgr.getPlayerByID(id[i]);
			if(SvrPly && SvrPly.pid && SvrPly.pid != self.pid && SvrPly.loggedin)
			{
				var NetwkPly = new NetworkPlayer();
					NetwkPly.pid = SvrPly.pid;
					NetwkPly.name = SvrPly.name;
					NetwkPly.posx = SvrPly.posx;
					NetwkPly.posy = SvrPly.posy;
					NetwkPly.posz = SvrPly.posz;
				NetworkPlayers.push(NetwkPly);
			}
		}
		io.to(self.pid).emit('LoadNetworkPlayers', NetworkPlayers);
	}
}

function SessionManager()
{	
	var self = this;
	this.SessionArr;
	this.ActiveSessions;
	
	this.createNetEvents = function()
	{
		this.SessionArr = new Array();
		this.ActiveSessions = new Array();
		
		io.on('connection', function(socket)
		{
			console.log('a user connected');
			var user = new UserSession();
			user.createNetEvents(socket);
			SessionMgr.SessionArr.push(user);
			user.pid = socket.id;
		});
	}
	
	this.PlayerJoin = function(ply)
	{
		self.ActiveSessions.push(ply.pid);
		var NetworkPlayers = new Array();
		var NetwkPly = new NetworkPlayer();
			NetwkPly.pid = ply.pid;
			NetwkPly.name = ply.name;
			NetwkPly.posx = ply.posx;
			NetwkPly.posy = ply.posy;
			NetwkPly.posz = ply.posz;
			
		NetworkPlayers.push(NetwkPly);
		console.log("Sending "+ply.name+" to...");
		this.SessionArr.forEach(function(v,i,a)
		{
			if(!(v.pid===ply.pid) && v.loggedin)
			{
				v.OtherClients.push(ply.pid);
				console.log("    - " + v.name + "    (" + v.pid + ")");
				io.to(v.pid).emit('LoadNetworkPlayers', NetworkPlayers);
			}
		});
	}
	
	this.logout = function(user)
	{
		console.log("Attempting to end Session("+user.pid+")");
		this.SessionArr.forEach(function(v,i,a)
		{
			v.OtherClients.forEach(function(v2,i2,a2)
			{
				if(v2 === user.pid)
				{
					v.OtherClients.splice(i2,1);
					io.to(v.pid).emit('NetPlyDisconnect', user.pid);
				}
			});
			if(v.pid === user.pid)
			{
				console.log("    - Removed " + v.name + " from server");
				self.SessionArr.splice(i,1);
			}
		});
		this.ActiveSessions.forEach(function(v,i,a)
		{
			if(v === user.pid)
			{
				self.ActiveSessions.splice(i,1);
				console.log("    + *as");
			}
		});
	}
	
	this.test = function()
	{
		this.SessionArr.forEach(function(v,i,a)
		{
			io.to(v.pid).emit('test', v.name);
		});
	}
	
	this.listSessions = function()
	{
		console.log("Connected users ("+this.SessionArr.length+"):");
		
		this.SessionArr.forEach(function(v,i,a)
		{
			console.log(v.pid + " | " + v.name + "| logged in: " + v.loggedin);
		});
	}

	this.getPlayerByID = function(id)
	{
		var ply = null;
		this.SessionArr.forEach(function(v,i,a)
		{
			if(v && v.pid === id && v.loggedin)
			{
				ply = v;
			}
		},id,ply);
		return ply;
	}
	
}

app.use("/client/js", express.static(__dirname + "/client/js"));
app.use("/client/content", express.static(__dirname + "/client/content"));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/gameClient.html');
});


var SessionMgr = new SessionManager();
SessionMgr.createNetEvents();

var WorldEntityManager = new World_Entity_Manager();

cInput.on('line', function(cmd)
{
	switch(cmd.trim())
	{
		case 'list users':
			console.log("list users"); 
			SessionMgr.listSessions();
		break;
		case 'test':
			SessionMgr.test();
		break;
		case 'giveall 1':
			SessionMgr.SessionArr.forEach(function(v,i,a)
			{
				v.inventory.addItem(1, ITEM_COUNT, "rock");
			});
		break;
		case 'rockspawn':
			WorldEntityManager.CreateItemSpawn(1100,60,1600,10,0);
		break;
		default:
			console.log("invalid command");
		break;
	}
});

var scene;

function init()
{
	scene = new THREE.Scene();
	
	cInput.setPrompt(prefix, prefix.length);
	cInput.prompt();
	
	http.listen(3000, function()
	{
		console.log('listening on *:3000');
		update();
	});
}

function update()
{
    var curTime = new Date();
	{
		//console.log("update: "+curTime);
		WorldEntityManager.update(curTime);
	}
    setTimeout (update, (1000/10) - (new Date() - curTime));
}

init();