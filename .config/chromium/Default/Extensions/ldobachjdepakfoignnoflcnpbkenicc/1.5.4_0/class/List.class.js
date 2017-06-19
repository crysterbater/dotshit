/*
List
> Number length																		number of Objects in List
> Number cursor																		current position in List
> Array<Object> elements															contains all Objects in List
- setCursor(Number pos)															set cursor
- Object|Array<Object> get(String key, Object value [optional])				get Array<Object> which matches key and value
- add(Object element)																add Object to List
- insert(Number pos, Object element)											insert Object at specific position
- replace(Object oldElement, Object newElement)							replace existing Object with new Object
- remove(Object element, Number number)									remove Object(s) from List
- clear()																					empty List

List<Book> Library

List<Breadcrumb> History

List<Book> Selection
> boolean inProgress																	indicates started selection
- selectTo(Number from, boolean includeCurrent)							select Books in Library to specific index
- archiveAll()
- cutAll()
- removeAllBooks()
*/
var List = (function() {
	this.length = 0;
	this.cursor = 0;
	this.elements = [];
	
	this.setCursor = function(pos) {
		this.cursor = pos;
	}
	
	this.get = function(key, value) {
		return (!value) ? this.elements[key] : this.elements.filter(function(element) {
			if(element[key] == value) return element;
		});
	}
	
	this.add = function(element) {
		if(this.cursor < this.length) {
			var number = this.length-this.cursor;
			this.remove(this.elements[this.cursor], number);
			//this.cursor += number;
		}
		this.elements.push(element);
		this.length++;
		this.cursor++;
	}
	this.insert = function(pos, element) {
		for(i=this.length; i>pos; i--) {
			this.elements[i] = this.elements[i-1];
		}
		this.elements[pos] = element;
		this.length++;
		if(pos<=this.cursor) this.cursor++;
	}
	this.replace = function(oldElement,newElement) {
		this.elements[this.elements.indexOf(oldElement)] = newElement;
	}
	this.remove = function(element, number) {
		if(!number) number = 1;
		
		this.elements = this.elements.slice(0,this.elements.indexOf(element)-this.elements.length).concat(this.elements.slice(this.elements.indexOf(element)+number))
		
		this.cursor -= number - (this.length - this.cursor);
		this.length -= number;
	}
	this.clear = function() {
		this.elements.splice(0);
		this.length = 0;
		this.cursor = 0;
	}
});

var Library = new List();

var History = new List();

var Selection = new List();
//add attributes/methods to Selection
Selection.inProgress = false;
Selection.selectTo = function(to) {
	if(this.length == 0) return;
	
	this.inProgress = true;
	
	var from = Library.elements.indexOf(this.elements[this.length-1]);
	
	var direction = (from<to)?1:-1;
	if(Library.elements[from+direction].selected) {
		Library.elements[from].select();
	}
	for(i = Math.min(from, to); i <= Math.max(from, to); i++) {
		if(i==from) continue;
		Library.elements[i].select();
	}
	this.inProgress = false;
}
Selection.archiveAll = function() {
	for(var i in this.elements) {
		this.elements[i].archive();
	}
}
Selection.cutAll = function() {
	//copy to clipboard
	for(i in Main.clipboard) {
		Main.clipboard[i].dom.classList.remove("cut");
	}
	Main.clipboard = [].concat(this.elements);
		
	//add paste button to general menu
	document.getElementById("pasteButton").style.display = "block";
	
	//cut look
	for(i in Selection.elements) {
		Selection.elements[i].dom.classList.add("cut");
	}
	
	Selection.clear();
}
Selection.removeAllBooks = function() {
	if(this.length==1 && this.elements[0].url) {
		this.elements[0].removeBook();
		Selection.clear();
	} else {
		FormBuilder.build("remove","selection",this);
	}
}
//extend Selection.clear
Selection.f = Selection.clear;
Selection.clear = function() {
	if(this.length > 0) {
		document.getElementById("all_selection").innerText = chrome.i18n.getMessage("all");
		document.getElementById("specific").style.display = "none";
		Main.showMenu(true);
	}
	
	//unselect selected Books
	for(i in Selection.elements) {
		Selection.elements[0].select();
	}
	
	Selection.f();
}