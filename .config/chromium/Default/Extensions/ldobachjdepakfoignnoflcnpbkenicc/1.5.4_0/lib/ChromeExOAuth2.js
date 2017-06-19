/*
dev:	chrome-extension://gkcndooabfeoollcmiabgklcogbcpami/oauth2.html
live:	chrome-extension://ldobachjdepakfoignnoflcnpbkenicc/oauth2.html
*/
var ChromeExOAuth2 = new (function() {
	var _name;
	var _client_id;
	var _client_secret;
	var _redirect_uri;
	var _access_uri;
	var _scope;
	var _response_type;
	var _grant_type;
	var _code;
	var _tmp;
	var _callback;
	
	this.getInstance = function(config) {
		_name = config.name;
		_client_id = config.client_id;
		_client_secret = config.client_secret;
		_redirect_uri = config.redirect_uri;
		_access_uri = config.access_uri;
		_scope = config.scope;
		_response_type = config.response_type || "code";
		_tmp = config.tmp || {
			tokenParamName:	"access_token"
		};
		
		return this;
	}
	
	this.authorize = function(callback) {
		chrome.tabs.create({
			url:	generateUrl(_redirect_uri, {
				client_id:		_client_id,
				redirect_uri:	escape(chrome.extension.getURL("oauth2.html")),
				scope:			_scope,
				response_type:	_response_type
			})
		});
		
		_callback = callback;
	}
	
	this.initCallback = function(callback) {
		switch(_response_type) {
			case "token":
				_access_token = location.hash.replace(/^.*access_token=(.+?)(&.*)?$/, "$1");
				if(typeof(callback) == "function") callback(_access_token);
				break;
			case "code":
				//get code from querystring
				_code = location.search.replace(/^.*code=(.+?)(&.*)?$/, "$1");
				
				//exchange code from access_uri with access_token
				var xhr = new XMLHttpRequest();
				xhr.open("GET", generateUrl(_access_uri, {
					client_id:		_client_id,
					client_secret:	_client_secret,
					code:			_code,
					grant_type: "authorization_code"
				}), true);
				xhr.onreadystatechange = function() {
					if(xhr.readyState == 4) {
						var resp = xhr.responseText;
						if(resp[0] == "{") {
							_access_token = JSON.parse(resp).access_token;
						} else {
							_access_token = xhr.responseText.replace(/^.*access_token=(.+?)(&.*)?$/, "$1");
						}
						
						//check for errors
						//...
						
						//save access_token
						if(typeof(callback) == "function") callback(_access_token);
					}
				}
				xhr.send();
				break;
		}
	}
	
	this.hasToken = function() {
		return !!localStorage["oauth2_token_"+_name];
	}
	
	this.finish = function(access_token) {
		localStorage["oauth2_token_"+_name] = access_token;
		if(typeof(_callback) == "function") _callback();
	}
	
	this.clearTokens = function() {
		localStorage.removeItem("oauth2_token_"+_name);
	}
	
	this.sendRequest = function(url, callback, params) {
		params = params || {
			method:		"GET",
			parameters:	{}
		}
		
		params.parameters[_tmp.tokenParamName] = localStorage["oauth2_token_"+_name];
		var xhr = new XMLHttpRequest();
		xhr.open(params.method, generateUrl(url, params.parameters), true);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4 && typeof(callback) == "function") {
				callback(xhr.responseText, xhr);
			}
		}
		xhr.send();
	}
	
	function generateUrl(base, params) {
		var param = [];
		for(var i in params) {
			if(params[i]) param.push([i, params[i]].join("="));
		}
		return [base, param.join("&")].join("?");
	}
})();
