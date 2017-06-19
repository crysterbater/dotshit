var Notifications = new (function() {
  var _html;
  var _constants = {
    "options": "options.htm"
  };
  
  this.init = function(html) {
    _html = html;
    return;
    
    // TODO: check notif.version
    // TODO: check regularly (ever 5min?)
    // TODO: create way to remember dismissal of notification (either via variable or localStorage)
    checkSources(function(source, notif) {
      var fragment = document.createDocumentFragment();
      var link = fragment.create("a");
      link.addEventListener("click", function(e) {
        FormBuilder.build("notification", notif.category, {
          title: notif.title,
          content: renderNotification(notif)
        });
        if(_gaq) _gaq.push(["_trackEvent", "Notification", notif.category, source.ID]);
        e.preventDefault();
      }, false);
      var icon = link.create("img");
      switch (notif.category) {
        case "update":
          icon.src = "img/update.png";
          break;
      }
      _html.appendChild(fragment);
    });
  }
  
  function renderNotification(notif) {
    /*
    {{img <PATH>}} -> <img src="/img/<PATH>">
    {{a <PATH> <TEXT>}} -> <a href="<PATH>" onclick="if(_gaq) _gaq.push(...)"><TEXT></a>
    \n -> <br>
    ...
    */
    //...
    var content = notif.content.join("\n")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    content = "<li>"+content.replace(/\n/g, "</li><li>")+"</li>";
    
    var constants = content.match(/\$([^\$]+)\$/g);
    for (var i=0, len=constants.length; i<len; i++) {
      content = content.replace(constants[i], _constants[constants[i].replace(/\$/g, "")]);
    }
    
    return content
      .replace(/\n/g, "<br>")
      .replace(/\{\{img ([^\}]+)\}\}/g, "<img src='img/$1'>")
      .replace(/\{\{a ([^ \}]+) ([^\}]+)\}\}/g, "<a href='$1' onclick=''>$2</a>");
  }
  
  function checkSources(callback) {
    SourceData.forEach(function(type, id, source) {
      if (!source.CAN_NOTIFY) return;
      
      source.getNotifications(function(notifs) {
        for (var i=0, len=notifs.length; i<len; i++) {
          callback(source, notifs[i]);
        }
      });
    });
  }
})();
