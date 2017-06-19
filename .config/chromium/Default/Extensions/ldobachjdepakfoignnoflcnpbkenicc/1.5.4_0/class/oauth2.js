var port;
function init() {
	document.title = chrome.i18n.getMessage("oauthRedirectPageTitle");
	document.body.innerHTML = chrome.i18n.getMessage("redirecting")+"...";

	port = chrome.extension.connect({name: "oauth2"});
	
	port.onMessage.addListener(function(msg) {
		switch(msg.method) {
			case "GET_CONFIG":
				ChromeExOAuth2.getInstance(msg.data);
				ChromeExOAuth2.initCallback(function(access_token) {
					port.postMessage({
						method:	"SET_TOKEN",
						data:		access_token
					});
					chrome.tabs.getCurrent(function(tab) {
						chrome.tabs.remove(tab.id);
					});
				});
				break;
		}
	});
}

document.addEventListener("DOMContentLoaded", init);
