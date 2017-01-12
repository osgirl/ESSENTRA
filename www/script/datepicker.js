var Datepicker = function(parent, field) {
	this.months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
	this.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	
	this.selectedPrev;
	
	this.parent = parent;
	this.field = field;
	this.eventSelect = event;
	
	var date = new Date();
	
	var d = date.getDate();
		m = date.getMonth() + 1,
		y = date.getFullYear();
	
	this.m = m;
	this.y = y;
	
	this.today = [d, m, y];
	this.build();
};

Datepicker.prototype.build = function() {
	var tb, tr, td,
		$this = this;
	
	tb = this.parent.build("table");
	tb.className = "datepicker";
	
	tr = tb.build("tr");
	tr.className = "header";
	
	var btn_prev = tr.build("td");
		btn_prev.className = "prev fa fa-angle-left";
		btn_prev.setAttribute("colspan", "1");
		btn_prev.addEventListener("touchstart",  function() {
			if($this.m == 1) {
				$this.y--;
				$this.m = 12;
			} else {
				$this.m--;
			}
			$this.parent.innerHTML = "";
			$this.build();
		});
		
	var header = tr.build("td")
		header.className = "header";
		header.setAttribute("colspan", "5");
		header.write(this.months[this.m-1]+' '+this.y);
	
	var btn_next = tr.build("td");
		btn_next.className = "next fa fa-angle-right";
		btn_next.setAttribute("colspan", "1");
		btn_next.addEventListener("touchstart", function() {
			if($this.m == 12) {
				$this.y++;
				$this.m = 1;
			} else {
				$this.m++;
			}
			$this.parent.innerHTML = "";
			$this.build();
		});
	
	tr = tb.build("tr");
	tr.className = "week";
	for(i = 0; i < 7; i ++){
		td = tr.build("td");
		td.write(this.days[i]);
	}
	
	if (this.m == 1 || this.m == 3 || this.m == 5 || this.m == 7 || this.m == 8 || this.m == 10 || this.m == 12) {
		var days = 31;
		
	} else if (this.m == 4 || this.m == 6 || this.m == 9 || this.m == 11) {
		var days = 30;
		
	} else {
		var days = (this.y % 4 == 0) ? 29 : 28;
	}
	
	var day = new Date(this.y, (this.m-1), 1).getDay(); // first day of month
	
	tr = tb.build("tr");
	if(day > 0) {
		// blank space 
		td = tr.build("td");
		td.setAttribute("colspan", day);
	}
	
	for(var i = 0; i < days; i ++) {
		
		if (day == 0) {
			var tr = tb.build("tr");
		}
		
		var d = i + 1 ;
		
		td = tr.build("td");
		td.write(d);
		td.setAttribute("colspan", "1");
		td.style.color = (day > 0)? "rgb(80,80,80)" : "rgb(218,65,56)";
		
		td.addEventListener("click", function() {
			var date = ("0"+this.innerHTML).slice(-2) +"/"+ ("0"+ $this.m).slice(-2) +"/"+ $this.y;
			
			$this.field.value = date;
			
			if($this.selectedPrev) {
				$this.selectedPrev.style.border = "none";
			}
			$this.selectedPrev = this;
			this.style.border = "1px solid rgb(218,65,56)";
			
			if($this.select) {
				$this.select(date);
			}
		});
		
		if(this.today[0] == d && this.today[1] == this.m && this.today[2] == this.y) {
			td.style.backgroundColor = "rgb(245,245,245)";
		}
		
		day++;
		day %= 7;
	}
};
Datepicker.prototype.select = function() {
	
};