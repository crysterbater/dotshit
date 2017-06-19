/*
[interface] ISource
- hasConnectivity(Function callback returns {boolean, Object}, Object attr)
- isEnabled(Function callback returns boolean)
- getBadgeText(Function callback returns String)
- getNotifications(Function callback returns Array<Notification>)
- create(String parentId, CreateAttributes attr, Function callback returns BookmarkTreeNode)
- update(String chromeid, UpdateAttributes attr, Function callback returns UpdateAttributes)
- remove(String chromeid, Function callback)
- get(String/Array<String> chromeid, Function callback returns Array<{BookmarkTreeNode|ExtensionInfo, BookAttributes attr}>)
- getContent(String/Array<String> content, Function callback)
- getChildren(String chromeid, Function callback returns Array<BookmarkTreeNode/ExtensionInfo>)
- getAll(Function callback returns Array<BookmarkTreeNode/...>)
- getProfileInfo(Function callback returns ProfileInfo)
- search(String query, maxResults, Function callback returns String, Array<BookmarkTreeNode>)
- launch(String chromeid, Function callback)
- toggleEnable(String chromeid, boolean value, Function callback)
	
	SourceConfiguration
	> String id
	> String name
	> Number version (external-only)
	> String description (non-default-only)
	> String image (listable-only)
	> String badgeColor (optional)
	> Connection connection
	> Array<EntryPoint> entryPoints (optional)
	> Array<String> permissions (non-default-only)
	> Array<String> features
		badge|list|notifications|search
	> Array<String> content (optional)
		audio|images|videos
	> Array<String> menu (optional)
		create|update|remove
	> Array<String> switches (optional)
		subchapterTitle|selectableItems
	
	EntryPoint
	> String id
	> String title
	> String image
	
	Connection
	> String type (internal|external)
	> String method (default|oauth|oauth2|external)
	> Number cacheDuration (in seconds, non-default-only, defaults to infinite)
	> Object config
	
	BookmarkTreeNode
	> String id
	> String parentId
	> Number index
	> String url (bookmark only)
	> String title
	> Number dateAdded
	> Number dateGroupModified (folder only)
	> (Array<BookmarkTreeNode> children)
	
	ExtensionInfo
	> String id
	> String name
	> String description
	> String version
	> boolean enabled
	> boolean isApp
	> String appLaunchUrl
	> String optionsUrl
	> Array<IconInfo> icons
	> Array<String> permissions
	> Array<String> hostPermissions
	
		IconInfo
		> Number size
		> String url
	
	ProfileInfo
	> String name
	> String image
	> String url
	
	BookAttributes (all optional)
	> String image
	> String size
	
	CreateAttributes (all optional)
	> String id
	> Number index
	> String title (required)
	> String url
	> Number dateGroupModified
	> Number dateAdded
	
	UpdateAttributes (all optional)
	> String parentId (only for moving)
	> String title
	> String url
	> String where

Notification
> String version (optional)
> String category (update|...)
> String title
> String content

SourcePrototype implements ISource
> String ID
> String NAME
> String DESCRIPTION
> String IMAGE
> String BADGE_COLOR
> Connection CONNECTION
> Array<EntryPoint> ENTRY_POINTS
> Array<String> PERMISSIONS
> Array<String> CONTENTS
> Array<String> FEATURES
> boolean HAS_BADGE
> boolean CAN_NOTIFY
> boolean IS_LISTABLE
> boolean IS_SEARCHABLE
> Array<String> CONTENT
> boolean hasContent
> boolean HAS_CREATE
> boolean HAS_UPDATE
> boolean HAS_REMOVE
> boolean HAS_SELECTABLE_ITEMS
> boolean HAS_SUBCHAPTER_TITLE
> boolean SHOW_MENU
> boolean SHOW_OPTIONS
//- exchange(String/Array<String> chromeid, String toSource)
- searchAll(String query, Function callback returns Book)
*/

var SourcePrototype = (function(config) {
	var _config = config;
	
	//general
	this.__defineGetter__("ID", function() {return _config.id;});
	this.__defineGetter__("NAME", function() {return _config.name;});
	this.__defineGetter__("DESCRIPTION", function() {return _config.description;});
	this.__defineGetter__("IMAGE", function() {return _config.image;});
	this.__defineGetter__("BADGE_COLOR", function() {return _config.badgeColor;});
	this.__defineGetter__("CONNECTION", function() {return _config.connection;});
	this.__defineGetter__("ENTRY_POINTS", function() {return _config.entryPoints;});
	this.__defineGetter__("PERMISSIONS", function() {return _config.permissions;});
	//features
	this.__defineGetter__("FEATURES", function() {return _config.features;});
	this.__defineGetter__("HAS_BADGE", function() {return _config.features && _config.features.indexOf("badge") > -1;});
	this.__defineGetter__("CAN_NOTIFY", function() {return _config.features && _config.features.indexOf("notifications") > -1;});
	//this.__defineGetter__("IS_LAUNCHABLE", function() {return _config.features && _config.features.indexOf("launch") > -1;});
	this.__defineGetter__("IS_LISTABLE", function() {return _config.features && _config.features.indexOf("list") > -1;});
	this.__defineGetter__("IS_SEARCHABLE", function() {return _config.features && _config.features.indexOf("search") > -1;});
	//content
	this.__defineGetter__("CONTENT", function() {return _config.content;});
	this.hasContent = function(content) {return (_config.content) ? _config.content.indexOf(content) > -1 : false;}
	//UI & UX
	this.__defineGetter__("HAS_CREATE", function() {return _config.menu && _config.menu.indexOf("create") > -1;});
	this.__defineGetter__("HAS_UPDATE", function() {return _config.menu && _config.menu.indexOf("update") > -1;});
	this.__defineGetter__("HAS_REMOVE", function() {return _config.menu && _config.menu.indexOf("remove") > -1;});
	this.__defineGetter__("HAS_SELECTABLE_ITEMS", function() {return _config.menu && _config.switches.indexOf("selectableItems") > -1;});
	this.__defineGetter__("HAS_SUBCHAPTER_TITLE", function() {return _config.menu && _config.switches.indexOf("subchapterTitle") > -1;});
	this.__defineGetter__("SHOW_MENU", function() {return (_config.menu) ? _config.menu.length > 0 : false;});
	this.__defineGetter__("SHOW_OPTIONS", function() {return (_config.menu) ? _config.menu.length > 0 : false;}); //... currently unused?
	
	this.hasConnectivity = function(callback, attr, url) {
		if(!url) {
			if(typeof(callback)=="function") callback(true, attr);
		} else {
			if(navigator.onLine) {
				var xhr = new XMLHttpRequest();

				var hasNoResponse = false;
				var noResponseTimer = setTimeout(function() {
					hasNoResponse = true;
					xhr.abort();
					if(typeof(callback)=="function") callback(false, attr);
				}, 3000);

				xhr.onreadystatechange = function() {
					if(xhr.readyState != 4 || xhr.status == 0 || hasNoResponse) return;

					clearTimeout(noResponseTimer);
					if(typeof(callback)=="function") callback(true, attr);
				}
				xhr.open("HEAD", url, true); 
				xhr.send();
			} else {
				if(typeof(callback)=="function") callback(false, attr);
			}
		}
	}
	this.isEnabled = function(callback) {
		if(typeof(callback)=="function") callback(true);
	}
	this.getBadgeText = function(callback) {}
	this.getProfileInfo = function(callback) {
		if(typeof(callback)=="function") callback();
	}
	this.getNotifications = function(callback) {}
	this.create = function(parentId, attr, callback) {}
	this.update = function(chromeid, attr, callback) {}
	this.remove = function(chromeid, callback) {}
	this.get = function(chromeid, callback) {}
	this.getContent = function(content, callback) {
		if(typeof(callback)=="function") callback();
	}
	this.getChildren = function(chromeid, callback) {}
	this.getAll = function(callback) {}
	this.search = function(query, maxResults, callback) {}
	this.launch = function(chromeid, callback) {}
	this.toggleEnable = function(chromeid, value, callback) {}
	
	//Book.archive, Book.restore
	/*
	exchange: function(chromeid, toSource) {
		ISource.get(chromeid, function(books) {
			for(i in books) {
				if(!books[i].url) {
					ISource.getChildren(books[i].id, function(children) {
						for(j in children) {
							ISource.exchange(children[j].id, toSource);
						}
					});
				}
				
				var now = new Date();
				SourceData.sources[toSource].create(books[i].parentId, {
					id:							books[i].id,
					title:						books[i].title,
					url:						(books[i].url)?books[i].url:"",
					index:					books[i].index,
					dateGroupModified:	(books[i].dateGroupModified)?books[i].dateGroupModified:now.valueOf(),
					dateAdded:				books[i].dateAdded
				}, function() {
					//...
				});
			}
		});
	},
	*/
});

SourcePrototype.apply = function(source, config) {
	if(!config.connection) return;
	
	switch(config.connection.type) {
		case "internal":
			switch(config.connection.method) {
				case "default":
				case "custom":
					source.prototype = new SourcePrototype(config);
					break;
				case "oauth":
					source.prototype = new OAuth(config, config.connection.config);
					break;
				case "oauth2":
					source.prototype = new OAuth2(config, config.connection.config);
					break;
			}
			SourceData.addInternal(new source(config), config);
			break;
		case "external":
			source.prototype = new ExternalSourcePrototype(config);
			SourceData.addExternal(new source(config), config);
			break;
	}

	//register in cache
	if(typeof(Cache) != "undefined") {
		if(config.connection.method != "default") Cache.register(config.id, config.connection.cacheDuration);
	}
}
