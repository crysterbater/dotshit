(typeof mono === 'undefined') && (mono = {loadModule: function() {this.loadModuleStack.push(arguments);},loadModuleStack: []});

mono.loadModule('options', function(moduleName, initData) {
  "use strict";
  var preference = initData.getPreference;

  var onCheckBoxChange = function() {
    var key = this.dataset.option;
    var value = preference[key] = this.checked ? 1 : 0;
    mono.sendMessage({action: 'updateOption', key: key, value: value});
  };

  var bindCheckBox = function(node) {
    var key = node.dataset.option;

    node.checked = preference[key] ? 1 : 0;
    node.addEventListener('change', onCheckBoxChange);
  };

  [].slice.call(document.querySelectorAll('[data-option]')).forEach(bindCheckBox);

  if (preference.hasWS) {
    var el = document.getElementById('hasWS');
    if (el) {
      el.style.display = 'block';
    }
  }

  if (mono.isFF) {
    document.body.classList.add('ff');
  }
  document.body.classList.remove('loading');
});

setTimeout(function() {
  "use strict";
  document.body.classList.remove('loading');
}, 1000);