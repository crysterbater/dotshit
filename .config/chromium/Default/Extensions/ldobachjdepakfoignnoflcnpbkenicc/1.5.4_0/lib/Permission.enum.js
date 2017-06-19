var Permission = new (function() {
	var _ENUM = {
		ACCESS:	{text: "access"},
		UPDATE:	{text: "modify"},
		REMOVE:	{text: "remove"}
	}
	
	this.__defineGetter__("ACCESS", function() {return _ENUM.ACCESS;});
	this.__defineGetter__("UPDATE", function() {return _ENUM.UPDATE;});
	this.__defineGetter__("REMOVE", function() {return _ENUM.REMOVE;});
	
	this.toString = function(text) {
		return this[text.replace(/^([A-Z]+) /, "$1")].text+" "+text.replace(/ (.*)$/, "$1");
	}
})();
