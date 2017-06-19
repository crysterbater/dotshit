/*
ExternalSourcePrototype(String id, SourceConfiguration config) extends SourcePrototype
*/
var ExternalSourcePrototype = (function(config) {
	this.__proto__ = new SourcePrototype(config);
	var _config = config;
	
	this.__defineGetter__("VERSION", function() {return _config.version;});
	
	function send(method, element, param, callback) {
		chrome.extension.sendRequest(_config.id, {
			method:	method,
			element:	element,
			lang:			"en",
			param:		param
		}, function(resp) {
			//check HTTPStatus
			//...
				if(callback) callback(resp.data);
		});
	}
	
	function getVersion(callback) {
		send("GET", "VERSION", null, function(data) {
			//...
		});
	}
	
	function getConfig(callback) {
		send("GET", "CONFIG", null, function(data) {
			//...
		});
	}
	
	this.hasConnectivity = function(callback, attr) {
		send("GET", "HAS_CONNECTIVITY", null, function(data) {
			//...
			//if(callback) callback(data, attr);
		});
	}
	
	this.getBadgeText = function(callback) {
		send("GET", "BADGE_TEXT", null, function(data) {
			//...
			//if(callback) callback(data);
		});
	}
	
	this.create = function(parentId, attr, callback) {
		//...
	}
	
	this.update = function(chromeid, attr, callback) {
		//...
	}
	
	this.remove = function(chromeid, callback) {
		//...
	}
	
	this.get = function(chromeid, callback) {
		//...
	}
	
	this.getChildren = function(chromeid, callback) {
		//...
	}
	
	this.getAll = function(callback) {
		//...
	}
	
	this.search = function(query, maxResults, callback) {
		//...
	}
	
	this.launch = function(chromeid, callback) {
		//...
	}
	
	this.toggleEnable = function(chromeid, value, callback) {
		//...
	}
});