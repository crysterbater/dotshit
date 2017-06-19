/*
KeyHandler
- Number register(Array<Number> keys, Function callback)
- void deregister(Number index)
*/
var KeyHandler = new (function() {
	var _map = {}
	var _keys = [];
	var _callbacks = [];
	
	this.__defineGetter__("map", function() {return _map;}); //... deprecated but used in Book.select
	
	this.register = function(keys, callback) {
		_callbacks.push({
			keys:		keys,
			callback:	callback
		});
		
		return _callbacks.length-1;
	}
	
	this.deregister = function(index) {
		//_callbacks.splice(index, 1);
		delete _callbacks[index];
	}
	
	document.addEventListener("keydown", function(e) {
		if(_map[e.which]) return;
		
		_keys.push(e.which);
		_map[e.which] = true;
		
		for(var i in _callbacks) {
			var handler = _callbacks[i];
			
			var res = handler.keys.length;
			for(var j in handler.keys) {
				for(var k in _keys) {
					if(_keys[k] == handler.keys[j]) res--;
				}
			}
			if(res == 0 && typeof(handler.callback)=="function") handler.callback();
		}
	}, false);
	
	document.addEventListener("keyup", function(e) {
		_keys.splice(_keys.indexOf(e.which), 1);
		delete _map[e.which];
	}, false);
})();