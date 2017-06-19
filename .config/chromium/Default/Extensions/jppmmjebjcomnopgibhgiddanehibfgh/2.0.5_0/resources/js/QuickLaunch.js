function QuickLaunch( name, urls, auto) {
  var obj = this;

  obj.params = {
    name     : name,
    urls     : (urls == null) ? [] : urls,
    auto     : (auto == null) ? 0 : auto
  };

  this.self = {
    sanitizeUrls: function( ) {
      var num = 0;
      var starts = ['http://', 'https://', 'ftp://', 'ftps://'];
      var cleanUrls = [];
      for (i in obj.params.urls) {
        var url = obj.params.urls[i];
        if (url != '') {
          var found = false;
          for (var i = 0; i < starts.length; i++) {
            if (url.indexOf( starts[i]) != -1) {
              found = true;
              break;
            }
          }
          cleanUrls[num] = found ? url : start[0] + url;
          num ++;
        }
      }
      return cleanUrls;
    },

    updateName: function( name) {
      obj.params.name = name;
    },

    updateUrl: function( index, url) {
      obj.params.urls[index] = url;
    },

    updateAuto: function( auto) {
      obj.params.auto = auto;
    },

    addUrl: function( url) {
      obj.params.urls.push( url);
    },

    addUrls: function( urls) {
      obj.params.urls = urls;
    },

    removeUrl: function( index) {
      obj.params.urls.splice( index, 1);
    },

    getParams: function( ) {
      obj.params.urls = obj.self.sanitizeUrls( );
      return obj.params;
    }
  };

  return this.self;
}
