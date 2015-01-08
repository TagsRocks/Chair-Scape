function NetworkPlayerManager()
{
	var self = this;
	this.NetPlyArr;
	
	this.load = function()
	{
		this.NetPlyArr = new Array();
	}
	
	this.getPlayerByID = function(id)
	{
		var ply = null;
		if(id === LocalPly.pid) { console.error("Local NetPly received"); return; }
		this.NetPlyArr.forEach(function(v,i,a)
		{
			console.log("? " + id + " === " + v.pid);
			if(v.pid === id)
			{
				if(!v.loaded) { console.error("Unloaded player"); return; }
				ply = v;
			}
		},id,ply);
		return ply;
	}
	
	this.removePlayer = function(pid)
	{
		this.NetPlyArr.forEach(function(v,i,a)
		{
			if(v.pid === pid)
			{
				self.NetPlyArr.splice(i,1);
				v.clean();
			}
		});
	}
	
	this.createPlayer = function(NetPly)
	{
		if(!NetPly) { console.error("NetPly object is null"); return; }
		if(!NetPly.pid) { console.error("NetPly pid is null"); return; }
		var Ply = new NetworkPlayer();
			Ply.pid = NetPly.pid;
			Ply.name = NetPly.name;
		
			Ply.load(NetPly.posx, NetPly.posy, NetPly.posz);

		console.error("Loaded player: " + Ply.name);
		this.NetPlyArr.push(Ply);
		var Ply = null;
	}
}