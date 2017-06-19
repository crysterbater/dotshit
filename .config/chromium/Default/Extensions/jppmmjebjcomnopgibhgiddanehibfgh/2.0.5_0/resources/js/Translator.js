function Translator( ) {
  var obj = this;

  this.translateElements = {};
  this.self = {

    get: function( index, name) {
      return chrome.i18n.getMessage( index + '_' + name);
    },

    setElements: function( name, elements) {

      if (typeof elements == 'object' && Object.keys( elements).length > 0) {
        obj.translateElements[name] = elements;
      }
    },

    translate: function( ) {
      for (index in obj.translateElements) {
        var element = obj.translateElements[index];
        for (name in element) {
          var htmlElement = element[name].element;
          var htmlTarget = element[name].target;
          var translation = obj.self.get( index, name);
          if (htmlTarget == 'html') {
            htmlElement.html( translation);
          }
          else {
            htmlElement.attr( htmlTarget, translation);
          }
        }
      }
    }
  };

  return this.self;
}
