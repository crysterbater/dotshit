/*
Registration
- broadcast(String method, String element, Function callback)
- register(SourceConfiguration config, Function sendResponse)
*/
var Registration = new (function() {
	this.init = function(callback) {
		SourceData.get("chromeApps").getAll(function(apps) {
			//broadcast to all installed apps/extensions
			for(var i in apps) {
				var extid = apps[i].id;
				
				/*
				try {
					if(SourceData.contains(extid)) {
						//registered extension
						chrome.extension.sendRequest(extid, {
							method:	"GET",
							element:	"VERSION"
						}, function(resp) {
							if(resp.data.version > _ext.get(extid).VERSION) {
								//if new version: update entry
								//...
							}
						});
					} else {
						//new extension
						chrome.extension.sendRequest(extid, {
							method:	"REGISTER"
						}, function(resp) {
							if(typeof(resp) != "object") return;
							
							//check HTTPStatus
							//...
							
							//register
							_ext.add(extid, resp.data.config);
							
							if(typeof(callback) == "function") callback(resp.data);
						});
					}
				} catch(e) {
					//error
					console.log("error", e);
					//...
				}
				*/
			}
			
			//remove uninstalled apps/extensions
			var tmp = SourceData.getExternalIds();
			for(var i in tmp) {
				//...
				//_ext.remove(i);
			}
		});
	}
})();