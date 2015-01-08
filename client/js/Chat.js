function ChatRow()
{
	this.Name;
	this.Text;
	
	this.setmessage = function(n,t)
	{
		this.Name.innerHTML = n;
		this.Text.innerHTML = t;
	}
	
	this.setName = function(n)
	{
		this.Name.innerHTML = n;
	}
	
	this.setText = function(t)
	{
		this.Text.innerHTML = t;
	}
}

function ChatManager()
{
	var self = this;
	this.ChatTable;
	this.Rows;
	
	this.load = function()
	{
		chatdiv.style.display = "";
		self.Rows = new Array();
		self.ChatTable = document.getElementById("ChatTable");
		for(var i = 0;i<5;i++)
		{
			var NewRow = new ChatRow();
				NewRow.Name = self.ChatTable.rows[i].cells[0];
				NewRow.Text = self.ChatTable.rows[i].cells[1];
			self.Rows.push(NewRow);
		}
		for(var i = 0;i<5;i++)
		{
			self.Rows[i].Text.innerHTML = " ";
			self.Rows[i].Name.innerHTML = " ";
		}
	}
	
	this.AddMessage = function(name,text)
	{
		this.BumpRows();
		self.Rows[4].setName(name);
		self.Rows[4].setText(text);
	}
	
	this.BumpRows = function()
	{
		for(var i = 0; i<4; i++)
		{
			if(i!=4)
			{
				self.Rows[i].setName(self.Rows[i+1].Name.innerHTML);
				self.Rows[i].setText(self.Rows[i+1].Text.innerHTML);
			}
		}
	}
	
	this.MoveTexts = function()
	{
		chat.elements['chatinput'].value;
	}
}