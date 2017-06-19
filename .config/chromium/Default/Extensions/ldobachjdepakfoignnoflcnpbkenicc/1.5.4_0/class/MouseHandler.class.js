/*
MouseHandler
- Number register(HashMap<String [down|move|up], Function> handlers)
- void deregister(Number index)
*/
var MouseHandler = new (function() {
	var _xProp = "offsetX";
	var _yProp = "offsetY";
	var _eventList = ["down", "move", "up"];
	var _handlers = [];
	
	this.register = function(handlers) {
		for(var i in _eventList) {
			if(handlers.hasOwnProperty(i)) {
				if(typeof(handlers[i]) != "function") throw new Error("callback must be a function");
			} else {
				handlers[i] = function() {};
			}
			handlers.isActive = false;
		}
		
		_handlers.push(handlers);
		
		return _handlers.length-1;
	}
	
	this.deregister = function(index) {
		delete _handlers[index];
	}

	function onMove(e) {
		for(var i in _handlers) {
			if(_handlers[i].isActive && _handlers[i].move) _handlers[i].move(e[_xProp], e[_yProp]);
		}
	}
	
	document.addEventListener("mousedown", function(e) {
		for(var i in _handlers) {
			_handlers[i].down(e[_xProp], e[_yProp]);
			_handlers[i].isActive = true;
		}

		document.addEventListener("mousemove", onMove, false);
	}, false);
	
	document.addEventListener("mouseup", function(e) {
		document.removeEventListener("mousemove", onMove);

		for(var i in _handlers) {
			if(_handlers[i].isActive) {
				_handlers[i].isActive = false;
				_handlers[i].up(e[_xProp], e[_yProp]);
			}
		}
	}, false);
})();