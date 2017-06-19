/*
Dropzone
*/
function Dropzone(id) {
	this.init = function() {
		this.dom = document.getElementById(id);
		dropzone = this;
		
		this.dom.addEventListener("dragenter", function(e) {
			e.stopPropagation();
			e.preventDefault();
		}, false);
		
		this.dom.addEventListener("dragover", function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			e.dataTransfer.dropEffect = "copy";
		}, false);
		
		this.dom.addEventListener("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			var bookOriginal = Library.elements[e.dataTransfer.getData("Text")];
			var book = bookOriginal.clone();
			bookOriginal.remove();
			book.build("small",false,false,dropzone.dom);
			//add to List
			//...
		}, false);
	}
}

var MainDropzone = new Dropzone("dropzone");