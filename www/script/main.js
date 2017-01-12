Element.prototype.build = function(t) {
	var element = document.createElement(t);
	this.appendChild(element);
	return element;
};
Element.prototype.remove = function() {
	if(this.parentNode) this.parentNode.removeChild(this);
	else return;
};
Element.prototype.write = function(t) {
	this.appendChild( document.createTextNode(t) );
};

Element.prototype.get = function(e) {
	return this.querySelector(e);
}

window.$ = function(id) { return document.getElementById(id) }
window.rgb = function(r,g,b) { return "rgb("+r+","+g+","+b+")" }

window.addEventListener("DOMContentLoaded", function() {
	"use strict";
	
	var SERVER = "http://chat.v-id.net/ESSENTRA/";
	
	var returnscreen = null,
		scannerevent = null;
	
	var html = {
		home: $("home"),
		login: $("login"),
		manager: $("manager"),
		remessa: $("remessa"),
		consultar: $("consultar"),
		detalhes: $("detalhes"),
		error: $("error"),
	},
	btn = {
		back: $("btn-back"),
		scanner: $("btn-scanner"),
		login: $("btn-login"),
		registrar: $("btn-registrar"),
		detalhes: $("btn-detalhes")
	};
	
	var app = {		
		load: function() {
			displayManager("section", html.home);
			
			btn.scanner.style.display = "block";
			btn.back.style.display = "none";
			btn.login.style.display = "block";
			btn.registrar.style.display = "none";
			btn.detalhes.style.display = "none";
			
			scannerevent = simpleConsulta;
		},
		login: function() {
			displayManager("section", html.login);
			
			btn.scanner.style.display = "none";
			btn.back.style.display = "block";
			btn.login.style.display = "none";
			
			returnscreen = app.load;
		},
		manager: function() {
			displayManager("section", html.manager);
			
			btn.registrar.style.display = "none";
			btn.scanner.style.display = "none";
			btn.detalhes.style.display = "none";
			
		//	$("list").querySelector("div").innerHTML = "";
			$("list").get("div").innerHTML = "";
			
			returnscreen = app.login;
		},
		enviar: function() {
			displayManager("section", html.remessa);
			
			btn.scanner.style.display = "block";
			btn.registrar.style.display = "block";
			
			$("fevento").value = "enviar";
			$("fquantidade").value = "0";
			
			scannerevent = readerremessa;
			returnscreen = app.manager;
		},
		receber: function() {
			displayManager("section", html.remessa);
			
			btn.scanner.style.display = "block";
			btn.registrar.style.display = "block";
			
			$("fevento").value = "receber";
			$("fquantidade").value = "0";
			
			scannerevent = readerremessa;
			returnscreen = app.manager;
		},
		consultar: function() {
			displayManager("section", html.consultar);
			
			btn.detalhes.style.display = "none";
			
			$("datepicker").innerHTML = "";
			
			var calen = new Datepicker($("datepicker"), $("fdate"));
				calen.select = consultarData;
			
			returnscreen = app.manager;
		},
		detalhes: function() {
			displayManager("section", html.detalhes);
			
			btn.detalhes.style.display = "none";
			
			var codes = this.dataset.codes.split(";"),
				parent = $("window-detalhes").get("div"),
				lb, name;
			
			parent.innerHTML = "";
			codes.forEach(function(item) {
				name = item.replace(/r-/, "");
				
				lb = parent.build("label");
				lb.write("• "+name);
				lb.build("small").write( (item.slice(0, 2) == "r-" )? "entregue" : "nao entregue" );
				
				lb.dataset.serial = name;
				
				lb.addEventListener("click", consultarCode, false);
			});
			
			returnscreen = function() {
				displayManager("section", html.consultar);
				returnscreen = app.manager;
			};
		},
		error: function(data) {
			displayManager("section", html.error);
			
			btn.registrar.style.display = "none";
			btn.scanner.style.display = "none";
			
			returnscreen = app.manager;
			
			var lb, parent = $("window-error").get("div");
			
			parent.innerHTML = "";
				
			data.forEach(function(item) {
				item = item.split("#");
				
				lb = parent.build("label");
				lb.build("i").className = "fa fa-exclamation-triangle";
				lb.write(item[0]);
				lb.build("small").write(item[1]);
			});
		}
	};
	
	btn.login.addEventListener("touchstart", app.login, false);
	$("btn-enviar").addEventListener("touchstart", app.enviar, false);
	$("btn-receber").addEventListener("touchstart", app.receber, false);
	$("btn-consultar").addEventListener("touchstart", app.consultar, false);
	btn.detalhes.addEventListener("touchstart", app.detalhes, false);
	
	btn.scanner.addEventListener("touchstart", function() { scannerevent() }, false);
	btn.back.addEventListener("touchstart", function() { returnscreen() }, false);
	
	$("btn-login-enter").addEventListener("touchstart", function() {
		var fpassword = $("fpassword");
		if(fpassword.value != "") {
			AJAX.request({
				url:SERVER+"index.php",
				data: { uuid:device.uuid, action:"login", password: fpassword.value },
				success:function(e) { 
					if(e == "true") {
						fpassword.value = "";
						app.manager();
					} else {
						fpassword.style.borderColor = "rgb(246,2,70)";
						setTimeout(function() { fpassword.style.borderColor = "rgb(255,255,255)"; }, 800);
					}
				},
				error: function(e) { alert("O dispositivo não pode acessar o servidor, verificque sua conexão!"); }
			});
		}
	}, false);
	
	$("btn-registrar").addEventListener("touchstart", function() {
		if($("fquantidade").value == "0" || parseInt($("fquantidade").value) == 0) return;
		
		var seriais = "",
			labels = $("list").querySelectorAll("label");
		
		for(var i = 0; i < labels.length; i++) {
			seriais += ((seriais=="")? "" : ";") + labels[i].innerHTML;
		}
		
		AJAX.request({
			url:SERVER+"index.php",
			data: {
				uuid:device.uuid, 
				action:$("fevento").value,
				quantidade:$("fquantidade").value,
				seriais: seriais
			},
			success:function(e) {
				if(e != "") {
					 app.error( e.split(';') );
				} else {
					app.manager();
				}
			},
			error: function(e) { alert("O dispositivo não pode acessar o servidor, verificque sua conexão!"); }
		});
		
	}, false);
	
	var simpleConsulta = function() {
		 var options =  {
			preferFrontCamera : false, // iOS and Android 
			showFlipCameraButton : false, // iOS and Android 
			formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED 
			prompt : "", // supported on Android only 
			orientation : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device 
		}
		
		cordova.plugins.barcodeScanner.scan( function (result) {
			if(result.text) {
				if(validateCode(result.text)) {
					AJAX.request({
						url:SERVER+"index.php",
						data: { action:"consultar_simples", uuid:device.uuid, serial:result.text },
						success:function(e) {
							  addLabel($("scanner-reader").get("div"), {
								 code: result.text,
								 status: (e == "true")? "true" : "false"
							 });
						},
						error: function(e) { alert("O dispositivo não pode acessar o servidor, verificque sua conexão!"); }
					});
				} else {
					 addLabel($("scanner-reader").get("div"), {
						 code: result.text,
						 status: "false"
					 });
				}
			}
		}, function (error) { alert("Scanning failed: " + error); }, options);
	};
	
	var readerremessa = function() {
		var fq = $("fquantidade");
		
		var options =  {
			preferFrontCamera : false, // iOS and Android 
			showFlipCameraButton : false, // iOS and Android 
			formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED 
			prompt : "", // supported on Android only 
			orientation : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device 
		};
		
		cordova.plugins.barcodeScanner.scan( function (result) {
			if(result.text) {
				if(validateCode(result.text)) {
					$("list").get("div").build("label").write(result.text);
					fq.value = parseInt(fq.value) + 1;
					
				} else {
					alert("QR_CODE Invalido!");
				}
			}
		}, function (error) { alert("Scanning failed: " + error); }, options);
		
	};
	
	var consultarData = function() {
		AJAX.request({
			url:SERVER+"index.php",
			data: { action:"consultar", uuid:device.uuid, date:$("fdate").value },
			success:function(e) {
				if(e != "sem registro") {
					btn.detalhes.style.display = "block";
					
					e = JSON.parse(e);
					$("fenviados").value = e.enviados;
					$("fentregues").value = e.recebidos;
					
					btn.detalhes.dataset.codes = e.seriais;
					
				} else {
					btn.detalhes.style.display = "none";
					
					$("fenviados").value = 0;
					$("fentregues").value = 0;
				}
			},
			error: function(e) { alert("O dispositivo não pode acessar o servidor, verificque sua conexão!"); }
		});
	};
	
	/// label touchstart event 
	var consultarCode = function() {
		AJAX.request({
			url:SERVER+"index.php",
			data: { action:"consultar_serial", uuid:device.uuid, serial:this.dataset.serial },
			success:function(e) {
				if(e != "") {
					e = JSON.parse(e);
					
					console.log(e);
					
					$("fenviado").value = e.envio.data.replace(/-/g, "/") + " as " + e.envio.hora;
					$("fentregue").value = (e.recebimento)? e.recebimento.data.replace(/-/g, "/") + " as " + e.recebimento.hora : "";
				} 
			},
			error: function(e) { alert("O dispositivo não pode acessar o servidor, verificque sua conexão!"); }
		});
	};
	
	app.load();
	document.addEventListener("deviceready", app.load, false);
}, false);

function validateCode(qr) {
	var code, id, s, m, vid;
		code = parseInt(qr, 36).toString();
		id = code.slice(-1);
		s = code.slice(0, 6);
		m = parseInt(s.slice(0, 2)) + parseInt(s.slice(2, -2)) + parseInt(s.slice(-2));
		vid = m.toString().slice(-1);
	
	return (vid == id)? true : false;
}

function displayManager(parent, except) {
	var elements = document.querySelectorAll(parent);
	
	for(var i = 0; i < elements.length; i++) {
		if(elements.id != except.id) {
			elements[i].style.display = "none";
		}
	}
	if(except != false ||except != null)  {
		except.style.display = "block";
	}
}

function addLabel(parent, data) {
	var lb = parent.build("label");
		lb.write("• "+data.code);
	//	lb.build("small").write(data.status);
		lb.build("i").className = (data.status == "true")? "fa fa-check" : "fa fa-close";
		lb.get("i").style.color = (data.status == "true")? rgb(2,246,70) : rgb(246,2,70);
		
	parent.scrollTop = parent.scrollHeight;
}
