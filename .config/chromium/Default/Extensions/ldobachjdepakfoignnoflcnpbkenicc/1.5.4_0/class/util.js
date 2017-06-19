/*
HTMLElement
> String domName																	name in myTab's DOM tree
- HTMLElement create(String name, String type, Number where)		create new node
- HTMLElement replaceByName(String name)									replace existing node by name
- HTMLElement replace(String type)											replace existing node with new node
- remove()																				remove node

DocumentFragment
- HTMLElement create(String type)
*/
var html = HTMLElement.prototype;

html.domName = "";

/*
Testinputs:
type						"div"			false	"div"	null
name type				"a","div"		"a"	"div"	null
type where				"div",5		false	"div"	5
name type where		"a","div",5	"a"	"div"	5
*/
html.create = function(name,type,where) {
	if(typeof(type) == "undefined") {
		//type
		type = name;
		name = false;
		where = null;
	} else if(typeof(where) == "undefined") {
		if(!isNaN(type)) {
			//type where
			where = type;
			type = name;
			name = false;
		} else {
			//name type
			where = null;
		}
	}
	
	//name type where
	var child = document.createElement(type);
	child.domName = name;
	if(where != null) {
		this.insertBefore(child, this.childNodes[where]);
	} else {
		this.appendChild(child);
	}
	
	if(name) this[name] = child;
	return child;
}

html.replaceByName = function(name) {
	delete this.parentNode[this.domName];
	this.parentNode[name] = this;
	this.domName = name;
	return this;
}

html.replace = function(type) {
	var sibling = document.createElement(type);
	this.parentNode.replaceChild(sibling, this);
	return sibling;
}

html.remove = function() {
	delete this.parentNode[this.domName];
	this.parentNode.removeChild(this);
}

DocumentFragment.prototype.create = function(type) {
	var child = document.createElement(type);
	this.appendChild(child);
	return child;
}

function GET(id) {
	return document.getElementById(id);
}