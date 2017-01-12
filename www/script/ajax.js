var AJAX = new Object;
	AJAX.request = function(param) {
		var data = (param.data)? AJAX.encode(param.data) : "";
		var httpRequest = new XMLHttpRequest();
			httpRequest.onreadystatechange = function() {
				if(httpRequest.readyState === XMLHttpRequest.DONE) {
					if(httpRequest.status == 200) {
						param.success( httpRequest.responseText );
					} else {
						param.error("Error: " + httpRequest.statusText );
					}
				}
			};
			httpRequest.open("POST", param.url);
			httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			httpRequest.send( data );
	};
	AJAX.encode = function(data) {
		var keys = Object.keys(data), param = "";
			keys.forEach(function(key) {
				var item = (typeof data[key] == "object")? JSON.stringify(data[key]) : data[key];
				param += ((param == "")? "" : "&") + key + "=" + item;
			});
		return param;
	};