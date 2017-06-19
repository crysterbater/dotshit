/*
Configuration
*/
var Configuration = new (function() {
	var _APP_VERSION = chrome.app.getDetails().version;
	var _CONFIG_VERSION = 1.0501;
	var _sourceOptions = {}
	var _options = {
		//open_focus:		"true"
	}
	
	this.init = function() {
		initSourceOptions();
		initOptions();
		initApp();
	}
	
	function initSourceOptions() {
		SourceData.forEach(function(type, name, source) {
			if(source.IS_LISTABLE) {
				if(source.ENTRY_POINTS) {
					for(var i in source.ENTRY_POINTS) {
						if(!localStorage["option:entry_"+source.ID+"_"+source.ENTRY_POINTS[i].id]) {
							localStorage["option:entry_"+source.ID+"_"+source.ENTRY_POINTS[i].id] = "true";
						}
					}
				} else {
					if(!localStorage["option:entry_"+source.ID]) {
						localStorage["option:entry_"+source.ID] = "true";
					}
				}
			}
			if(source.IS_SEARCHABLE && !localStorage["option:search_"+source.ID]) {
				localStorage["option:search_"+source.ID] = "true";
			}
		});
	}
	
	function initOptions() {
		if(localStorage["configured"] == _CONFIG_VERSION) return;
		
		for(var i in _options) {
			if(!localStorage["option:"+i]) {
				localStorage["option:"+i] = _options[i];
			}
		}
		
		
		localStorage["configured"] = _CONFIG_VERSION;
	}
	
	function initApp() {
		if(_gaq) {
			_gaq.push(function() {
				var tracker = _gat._getTrackerByName();
				var version = tracker._getVisitorCustomVar(1);
				
				if(version == "v"+_APP_VERSION) return;
				
				if(version) _gaq.push(["_deleteCustomVar", 1]);
				_gaq.push(["_setCustomVar", 1, "Version", "v"+_APP_VERSION, 1]);
				
				_gaq.push(["_trackEvent", "Upgrades", version || "none", "v"+_APP_VERSION]);
			});
		}
	}
})();
