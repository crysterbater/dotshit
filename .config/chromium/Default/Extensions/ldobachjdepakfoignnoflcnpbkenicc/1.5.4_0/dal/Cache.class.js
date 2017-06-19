/*
Cache
> SIZE
- register(String sourceName, Number duration [optional])
- store(String sourceName, String method, String chromeid, Array<Book> books)
- retrieve(String sourceName, String method, String chromeid)
- clear(String sourceName, String method, String chromeid [optional])
*/
var Cache = new (function() {
	var _cache = {};
	var _timing = {};

	//this.__defineGetter__("CACHE", function() {return _cache;})
	this.__defineGetter__("SIZE", function() {return JSON.stringify(_cache).length;});

	this.register = function(sourceName, duration) {
		duration = duration || Infinity;
		_timing[sourceName] = {
			duration:	duration,
			start:		0
		}

		//replace method with method proxy
		var source = SourceData.get(sourceName);
		for(var i in source) {
			if(typeof(source[i]) != "function" || i.substr(0,3) != "get") continue;

			(function() {
				var sn = sourceName
				var method = i;
				var func = source[i];
				source[i] = function() {
					var args = func.toString().replace(/\s/g, "").replace(/^function\((.+?)?\){.*$/, "$1").split(",");
					var idxChromeid = args.indexOf("chromeid");
					if(idxChromeid == -1) idxChromeid = args.indexOf("content");
					var chromeid = (idxChromeid > -1) ? arguments[idxChromeid] : "_";
					var idxCallback = args.indexOf("callback");
					var callback = arguments[idxCallback];

					//check cache
					var cached = Cache.retrieve(sn, method, chromeid);
					if(cached) {
						//return cache
						if(typeof(callback) == "function") callback.apply(source, cached);
						return;
					}
					
					arguments[idxCallback] = function() {
						//store in cache and return
						Cache.store(sn, method, chromeid, arguments);
						if(typeof(callback) == "function") callback.apply(source, arguments);
					}
					//call function
					func.apply(source, arguments);
				}
			})();
		}
	}

	this.store = function(sourceName, method, chromeid, data) {
		if(!_cache[sourceName]) _cache[sourceName] = {};

		_cache[sourceName][method+"_"+chromeid] = data;
		_timing[sourceName].start = (new Date()).getTime();
	}

	this.retrieve = function(sourceName, method, chromeid) {
		if(_timing[sourceName].start+_timing[sourceName].duration*1000 < (new Date()).getTime()) return null;
		return _cache[sourceName] && _cache[sourceName][method+"_"+chromeid] || null;
	}

	this.clear = function(sourceName, method, chromeid) {
		if(!method) delete _cache[sourceName];
		else delete _cache[sourceName][method+"_"+chromeid];
	}
})();
