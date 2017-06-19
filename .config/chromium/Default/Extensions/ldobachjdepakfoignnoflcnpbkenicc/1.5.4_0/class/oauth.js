var callbackHandler = {
	thisObject:	null
}

function onLoad() {
	document.title = chrome.i18n.getMessage("oauthRedirectPageTitle");
	document.body.innerHTML = chrome.i18n.getMessage("redirecting")+"...";

	window.port = chrome.extension.connect({name: "oauth"});

	port.onMessage.addListener(function(msg) {
		switch(msg.method) {
			case "GET":
				window[msg.object] = msg.value;
				break;
		}
		if(callbackHandler[msg.id]) callbackHandler[msg.id]();
	});

	window.isCallbackPage = true;
	ChromeExOAuth.initCallbackPage();
};

document.addEventListener("DOMContentLoaded", onLoad);
