/*
class SourceData
- String _current
- ? _sources
+ void init()
+ Number COUNT
+ String CURRENT_ID
+ Hashtable<String, Object> getCurrent()
+ Hashtable<String, Object> get(String id)
+ void set(String source)
+ Array<String> getExternalIds()
+ void forEach(Function callback returns String, String, ISource)
+ Boolean contains(String id)
+ void addExternal(SourceConfiguration config)
+ void addInternal(SourceConfiguration config)
+ void remove(String id)
- void save()
*/

var SourceData = new (function() {
	var _current = "";
	var _count = 0;
	var _sources = {
		internal:	{},
		external:	{}
	};
	
	this.init = function() {
		_sources.external = JSON.parse(localStorage["external-sources"] || "{}");
		this.set("core");
	}
	
	this.__defineGetter__("COUNT", function() {return _count;});
	this.__defineGetter__("CURRENT_ID", function() {return _current;});
	this.getCurrent = function() {
		return this.get(_current);
	}
	
	this.get = function(id) {
		return _sources.internal[id] || _sources.external[id];
	}
	
	this.set = function(source) {
		ISource = SourceData.get(source);
		_current = source;
	}
	
	this.getExternalIds = function() {
		var tmp = [];
		for(var i in _sources.external) {
			tmp.push(i);
		}
		return tmp;
	}
	
	this.forEach = function(callback) {
		for(var type in _sources) {
			for(var id in _sources[type]) {
				if(typeof(callback) == "function") callback(type, id, _sources[type][id]);
			}
		}
	}
	
	this.contains = function(id) {
		return (_sources.internal.hasOwnProperty(id) || _sources.external.hasOwnProperty(id));
	}
	
	this.addExternal = function(obj, config) {
		_sources.external[config.id] = obj;
		save();
		_count++;
	}
	
	this.addInternal = function(obj, config) {
		_sources.internal[config.id] = obj;
		//save();
		_count++;
	}
	
	this.remove = function(id) {
		delete _sources.external[id];
		save();
		_count--;
	}
	
	this.searchAll = function(query, callback) {
		if(_gaq) _gaq.push(["_trackEvent", "Features", "search", "all"]);
		
		var r = {};
		var counter = 0;
		SourceData.forEach(function(category, name, source) {
			if(localStorage["option:search_"+name] == "true") counter++;
		});
		
		SourceData.forEach(function(category, name, source) {
			if(localStorage["option:search_"+name] != "true") return;
			
			source.search(query, 10, function(source, result) {
				counter--;
				callback(source, result);
				
				if(counter==0 && callback) {
					//search finished
					callback();
				}
			});
		});
	}
	
	function save() {
		localStorage["external-sources"] = JSON.stringify(_sources.external);
	}
})();