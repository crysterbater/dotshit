/*
Form(HTMLElement dom, String title)
> HTMLElement dom
- init()
- NULL destroy()
- addAttribute(String text)
- addField(String fieldType, String value, FieldAttributes attr)
- setSubmit(String value, boolean withCancelButton, Function onSubmit)

FieldAttributes (all optional)
> String placeholder
> String value
> String className
> Function onclick
> Function onchange
> ...
*/
var Form = (function(dom, title) {
	var _onSubmit;
	this.dom = dom;
	this.data = {};
	
	this.init = function() {
		this.dom.style.display = "inline";
		var formTitle = this.dom.create("b");
		formTitle.innerText = title;
	}
	this.destroy = function() { //call with: obj = obj.destroy();
		this.dom.innerText = "";
		this.dom.style.display = "none";
		
		FormBuilder.action = "";
		FormBuilder.item = "";
		
		return null;
	}
	
	this.addAttribute = function(text) {
		this.dom.create("br");
		this.dom.create("br");
		var span = this.dom.create("span");
		span.innerText = text;
		this.dom.create("br");
	}
	
	this.addField = function(fieldType, name, value, attr, validation) {
		switch(fieldType) {
			case "button":
				var field = this.dom.create("button");
				field.innerText = value;
				break;
			case "select":
				var field = this.dom.create("select");
				for(i in value) {
					if(value[i] == "hr") {
						field.create("hr");
					} else {
						var option = field.create("option");
						option.value = value[i].value;
						option.innerText = value[i].text;
					}
				}
				break;
			default:
				var field = this.dom.create("input");
				field.type = fieldType;
				field.value = value;
				field.onkeyup = function(e) {
					if(e.keyCode == 13) {
						if(typeof(_onSubmit)=="function") _onSubmit();
					}
				}
				break;
		}
		for(i in attr) {
			field[i] = attr[i];
		}
		field.validate = validation;
		
		this.data[name] = field;
	}
	
	this.setSubmit = function(value, withCancelButton, onSubmit) {
		if(typeof(onSubmit)=="function") _onSubmit = onSubmit;
		this.dom.create("br");
		this.dom.create("br");
		this.addField("button","submit",value,{
			className:	"half",
			onclick:		function() {
				var valid = true;
				for(i in FormBuilder.form.data) {
					if(typeof(FormBuilder.form.data[i].validate) != "undefined" && !FormBuilder.form.data[i].validate()) {
						FormBuilder.form.data[i].classList.add("invalid");
						valid = false;
					} else {
						FormBuilder.form.data[i].classList.remove("invalid");
					}
				}
				if(valid) {
					if(typeof(_onSubmit)=="function") _onSubmit();
				}
			}
		});
		
		if(withCancelButton) {
			var cancelBtn = this.dom.create("a");
			cancelBtn.href = "#";
			cancelBtn.innerText = chrome.i18n.getMessage("cancel");
			cancelBtn.onclick = function() {
				FormBuilder.destroy();
			}
		}
	}
	
	this.init();
});
