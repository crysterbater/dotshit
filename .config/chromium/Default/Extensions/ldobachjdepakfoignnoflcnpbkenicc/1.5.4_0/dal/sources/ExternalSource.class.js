/*
ExternalSource(String id, SourceConfiguration config) extends ExternalSourcePrototype
-	void send(String method, String element, Object data, Function callback)
-	void getVersion(Function callback returns String)
-	void getConfig(Function callback returns SourceConfiguration)
*/
var ExternalSource = (function(id, config) {
	config.id = id;
	SourcePrototype.apply(ExternalSource, config, true);
});

chrome.extension.onRequestExternal.addListener(function(request, sender, sendResponse) {
	switch(request.method) {
		case "REGISTER":
			SourceData.register(request.data.config, sendResponse);
			break;
	}
});

/*
//request message
{
	method:	"<ACTION>",
	element:	"<ELEMENT>",
	lang:			"<LANGUAGE>",	(optional)
	param:		<parameters>		(optional)
}

//response message
{
	status:		HTTPStatus,
	data:		Object
}

//transaction
<METHOD> <ELEMENT>
 > <parameters>
 > ...
 < <output>
 < ...


//ext -> nexos
POST CONFIG
 > ? config

//ext <- nexos
GET VERSION
 < Number version
GET CONFIG
 < ? config
GET HAS_CONNECTIVITY
 > attr ?
 < boolean ?
 < Object ?
GET BADGE_TEXT
 < String ?
GET ELEMENT
 > String eid
 < ?
GET CHILDREN
 > String eid
 < ?
GET ALL
 < ?
GET SEARCH_RESULTS
 > String query
 > Number maxResults
 < ?
SET ENABLED
 > String eid
SET DISABLED
 > String eid
CREATE ELEMENT
 > String parentId
 > ? attr
DELETE ELEMENT
 > String eid
UPDATE ELEMENT
 > String eid
 > ? attr
LAUNCH ELEMENT
 > String eid
*/