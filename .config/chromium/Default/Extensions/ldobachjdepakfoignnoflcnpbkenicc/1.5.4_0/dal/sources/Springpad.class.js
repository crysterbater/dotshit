/*
Springpad extends OAuth
*/
(function() {
  var Springpad = (function(config) {
    var _config = config;
    
    /*
    this.hasConnectivity = function(callback, attr) {
      //...
    }
    */
    
    this.getProfileInfo = function(callback) {
      if(!this.oauth.hasToken()) {
        return;
      }
      
      this.oauth.sendSignedRequest("https://springpad.com/api/users/me", function(data) {
        data = JSON.parse(data);
        
        if(callback) callback({
          name: data.username,
          image: data.profilePicture,
          url: "https://springpad.com/#!/"+data.username
        });
      }, {
        method: "GET",
        parameters: {
          oauth_version: "1.0"
        }
      });
    }
    
    this.getContent = function(content, callback) {
      var category;
      var defaultImage;
      switch(content) {
        case "images":
          category = "Photo";
          defaultImage = "/img/images.png";
          break;
        case "videos":
          category = "Video";
          defaultImage = "/img/videos.png";
          break;
        default:
          callback([]);
          return;
      }
      
      var parameters = {
        method: "GET",
        parameters: {
          oauth_version: "1.0",
          type: category
        }
      }
      
      this.oauth.sendSignedRequest("https://springpad.com/api/users/me/blocks", function(data) {
        data = JSON.parse(data);
        
        var books = [];
        for(var i=0, len=data.length; i<len; i++) {
          var block = data[i];
          
          books.push({
            id: "springpad:"+block.uuid.replace(/^\/UUID\((.*)\)\/$/, "$1"),
            title: block.name,
            image: block.image || defaultImage,
            size: "image",
            url: "https://springpad.com/#!/"+block.creatorUsername+block.firstPublicUrl
          });
        }
        
        if(callback) callback("springpad", books);
      }, parameters);
    }
    
    this.getChildren = function(chromeid, callback) {
      if(!this.oauth.hasToken()) {
        this.connectToAccount();
        return;
      }
      
      var parameters = {
        method: "GET",
        parameters: {
          oauth_version: "1.0",
          format: (chromeid == "springpad") ? "preview" : undefined
        }
      }
      
      var params = chromeid.split(":");
      if(chromeid == "springpad") {
        parameters.parameters.type = "Workbook";
      } else {
        parameters.parameters.notebook = params[1];
      }
      
      this.oauth.sendSignedRequest("https://springpad.com/api/users/me/blocks", function(data) {
        data = JSON.parse(data);
        
        var books = [];
        for(var i=0, len=data.length; i<len; i++) {
          var block = data[i];
          
          var image = block.image;
          if(!image) {
            if(chromeid == "springpad") {
              var images = block.properties["/workbook/most_recent_images"];
              image = images[images.length-1];
            } else {
              image = "/img/generic.png";
            }
          }
          
          books.push({
            id: "springpad:"+block.uuid.replace(/^\/UUID\((.*)\)\/$/, "$1"),
            title: block.name,
            image: image,
            size: "image",
            url: (chromeid == "springpad") ? undefined : "https://springpad.com/#!/"+block.creatorUsername+block.firstPublicUrl
          });
        }
        
        if(callback) callback(books);
      }, parameters);
    }
    
    this.search = function(query, maxResults, callback) {
      if(!this.oauth.hasToken()) {
        callback([]);
        return;
      }
      
      var parameters = {
        method: "GET",
        parameters: {
          oauth_version: "1.0",
          text: query
        }
      };
      
      this.oauth.sendSignedRequest("https://springpad.com/api/users/me/blocks", function(data) {
        data = JSON.parse(data);
        
        var books = [];
        for(var i=0, len=data.length; i<len; i++) {
          var block = data[i];
          
          books.push({
            id: "springpad:"+block.uuid.replace(/^\/UUID\((.*)\)\/$/, "$1"),
            title: block.name,
            image: block.image || "/img/generic.png",
            size: "image",
            url: "https://springpad.com/#!/"+block.creatorUsername+block.firstPublicUrl
          });
        }
        
        if(callback) callback("springpad", books);
      }, parameters);
      
      if(_gaq) _gaq.push(["_trackEvent", "Features", "search", _this.NAME]);
    }
  });
  
  SourcePrototype.apply(Springpad, {
    id: "springpad",
    name: "Springpad",
    description: chrome.i18n.getMessage("requestAccess", [
      [
        chrome.i18n.getMessage("images"),
        chrome.i18n.getMessage("and"),
        chrome.i18n.getMessage("videos")
      ].join(" "),
      "Springpad"
    ]),
    image: "img/springpad.png",
    connection: {
      type: "internal",
      method: "oauth",
      config: {
        "request_url": "https://springpad.com/api/oauth-request-token",
        "authorize_url": "https://springpad.com/api/oauth-authorize",
        "access_url": "https://springpad.com/api/oauth-access-token",
        "consumer_key": "5847bd8bf45e4857ae2ae09c4a5b3b74",
        "consumer_secret":"a2e1a3f1b3b447c7975bb41e3e5966fc",
        "scope": "#https://*.springpad.com/*",
        "app_name": "nexos"
      }
    },
    permissions: [
      chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("images"),
      chrome.i18n.getMessage("access")+" "+chrome.i18n.getMessage("videos")
    ],
    features: [
      "list",
      "search"
    ],
    content: [
      "images",
      "videos"
    ],
    menu: [],
    switches: []
  });
})();
