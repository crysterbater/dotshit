/*
Tumblr extends OAuth
*/
(function() {
  var Tumblr = (function(config) {
    var _config = config;
    var _this = this;
    var _hostname;
    
    this.getProfileInfo = function(callback) {
      if(!this.oauth.hasToken()) {
        return;
      }
      
      this.oauth.sendSignedRequest("https://api.tumblr.com/v2/user/info", function(data) {
        data = JSON.parse(data).response.user.blogs[0];
        _hostname = data.url.replace(/^.+:\/\/(.*)\/$/, "$1");
        
        if(callback) callback({
          name: data.name,
          image: "https://api.tumblr.com/v2/blog/"+_hostname+"/avatar/40",
          url: data.url
        });
      });
    }
    
    this.getContent = function(content, callback) {
      var category;
      switch(content) {
        case "audio":
          category = "audio";
          break;
        case "images":
          category = "photo";
          break;
        case "videos":
          category = "video";
          break;
        default:
          callback([]);
          return;
      }
      
      this.getChildren("tumblr:"+category, function(books) {
        if(callback) callback("tumblr", books);
      });
    }
    
    this.getChildren = function(chromeid, callback) {
      if(!this.oauth.hasToken()) {
        this.connectToAccount();
        return;
      }
      
      if(chromeid == "tumblr") {
        callback([
          {
            id: "tumblr:audio",
            title: chrome.i18n.getMessage("tumblr_audio")
          },
          {
            id: "tumblr:photo",
            title: chrome.i18n.getMessage("tumblr_photo")
          },
          {
            id: "tumblr:video",
            title: chrome.i18n.getMessage("tumblr_video")
          }
        ]);
        return;
      }
      
      var type = chromeid.split(":")[1];
      
      getHostname(function() {
        var parameters = {
          method: "GET",
          parameters: {
            api_key: _config.connection.config.consumer_key,
            filter: "text"
          }
        };
        
        _this.oauth.sendSignedRequest("https://api.tumblr.com/v2/blog/"+_hostname+"/posts/"+type, function(data) {
          data = JSON.parse(data).response;
          
          var books = [];
          var posts = data.posts;
          for(var i=0, len=posts.length; i<len; i++) {
            var image;
            switch(type) {
              case "audio":
                image = "/img/audio.png";
                break;
              case "photo":
                //determine smallest thumbnail
                var photo = {
                  min: Infinity,
                  url: ""
                };
                var photos = posts[i].photos[0].alt_sizes;
                for(var j=0, jlen=photos.length; j<jlen; j++) {
                  if(photos[j].width > 100 && photos[j].height > 100) {
                    if(photos[j].width < photo.min) {
                      photo.min = photos[j].width;
                      photo.url = photos[j].url;
                    }
                    if(photos[j].height < photo.min) {
                      photo.min = photos[j].height;
                      photo.url = photos[j].url;
                    }
                  }
                }
                image = photo.url;
                break;
              case "video":
                image = "/img/videos.png";
                break;
            }
            
            books.push({
              id: posts[i].id,
              title: posts[i].caption,
              image: image,
              size: "image",
              url: posts[i].post_url
            });     
          }
          
          callback(books);
        }, parameters);
      });
    }
    
    function getHostname(callback) {
      if(_hostname) {
        callback();
        return;
      }
      
      _this.oauth.sendSignedRequest("https://api.tumblr.com/v2/user/info", function(data) {
        _hostname = JSON.parse(data).response.user.blogs[0].url.replace(/^.+:\/\/(.*)\/$/, "$1");
        callback();
      });
    }
  });
  
  SourcePrototype.apply(Tumblr, {
    id: "tumblr",
    name: "Tumblr",
    description: chrome.i18n.getMessage("requestAccess", [
      [
        chrome.i18n.getMessage("audio"),
        chrome.i18n.getMessage("images"),
        chrome.i18n.getMessage("and"),
        chrome.i18n.getMessage("videos")
      ].join(" "),
      "Tumblr"
    ]),
    image: "img/tumblr.png",
    connection: {
      type: "internal",
      method: "oauth",
      config: {
        "request_url": "https://www.tumblr.com/oauth/request_token",
        "authorize_url": "https://www.tumblr.com/oauth/authorize",
        "access_url": "https://www.tumblr.com/oauth/access_token",
        "consumer_key": "F5qqWdHqmPziP3fgNIYKNwvIK0T6sUfzgeGTqOCRY608SV6kJo",
        "consumer_secret":"I3OxrmPFvzLZhGnKAjj5VH33PIMimDUQwahSvtFAY5bF4UybjI",
        "scope": "#https://*.tumblr.com/*",
        "app_name": "nexos"
      }
    },
    permissions: [
      chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("audio"),
      chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("images"),
      chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("videos")
    ],
    features: [
      "list"
    ],
    content: [
      "audio",
      "images",
      "videos"
    ],
    menu: [],
    switches: []
  });
})();
