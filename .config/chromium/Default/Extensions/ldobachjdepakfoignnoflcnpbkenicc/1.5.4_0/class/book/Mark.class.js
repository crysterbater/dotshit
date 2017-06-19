/*
Mark(BookConfig config) extends Book
- open(String where)													open Mark in (current, new, incognito)
*/
var Mark = (function(config) {
	this.__proto__ = new Book(config);
	
	this.open = function(where) {
		if(this.url.substr(0,11) == "javascript:") {
			//...
			return;
		}
		
		if(!where) {
			chrome.tabs.create({
				url:	this.url,
				active:	true //localStorage["option:open_focus"]=="true"
			});
		} else {
			if(where == "current") {
				chrome.tabs.create({
					url:		this.url,
					selected:	false
				});
			} else {
				chrome.windows.create({
					url:		this.url,
					incognito:	(where=="incognito")
				});
			}
		}
		
		if(_gaq) _gaq.push(["_trackEvent", "Features", "open", "mark"]);
	}
	
	this.onClick = this.select;
});