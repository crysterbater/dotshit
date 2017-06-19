/*
Breadcrumb(Number pos, String chromeid, String title)
> Number pos																	position in History (comparable to History.cursor)
> String chromeid
> HTMLElement dom
- remove()
- navigateTo()
- build()
*/
var Breadcrumb = (function(pos, chapter) {
	this.pos = pos;
	this.chapter = chapter;
	this.dom = null;
	
	this.remove = function() {
		this.dom.remove();
		History.remove(this);
	}
	
	this.navigateTo = function() {
		History.setCursor(this.pos+1);
		
		this.chapter.buildChapter(false);
	}
	
	this.build = function() {
		var element = Main.dom.header.navigation.create("div");
		if(this.pos+1 == History.cursor) {
			element.className = "breadcrumb selected";
		} else {
			element.className = "breadcrumb unselected";
		}
		if(this.pos == 0) {
			var b = element.create("b");
			b.innerText = this.chapter.title;
		} else {
			element.innerText = this.chapter.title;
		}
		element.onclick = this.navigateTo.bind(this);
		
		this.dom = element;
	}
});
