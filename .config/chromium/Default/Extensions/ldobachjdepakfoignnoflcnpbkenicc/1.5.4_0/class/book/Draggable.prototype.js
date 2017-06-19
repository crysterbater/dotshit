/*
Draggable
*/
var Draggable = (function(book) {
	var _book = book;
	var _data = null;
	
	this.init = function() {
		//...
	}
	
	function clearData() {
		_data = null;
	}
	
	this.handleDragStart = function() {}
	this.handleDragEnter = function() {}
	this.handleDragOver = function() {}
	this.handleDragLeave = function() {}
	this.handleDrop = function() {}
	this.handleDragEnd = clearData;
	this.handleMouseUp = clearData;
});