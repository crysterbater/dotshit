/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
var heightPercent = 68;
var widthPercent = 23;
var APP_HEIGHT = 730;
var APP_WIDTH = 445;
var _items = [];
var _folders = [];
/*detect first run or update*/

chrome.runtime.onInstalled.addListener(function(details) {

    if (details.reason == "install") {
        chrome.storage.local.set({ "initRun": true });

    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        // console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        chrome.storage.local.set({ "initRun": false });
        if (thisVersion != details.previousVersion) {
            chrome.storage.local.set({ "update": true });
        } else {
            chrome.storage.local.set({ "update": false });
        }
    }
});
chrome.app.runtime.onLaunched.addListener(function(launchData) {

    // id = "Chrome-" + Math.random();
    // chrome.storage.sync.get("uid", function(data){
        
    //     var uid = data.uid;
    //     console.log(uid);
    //     if(!uid) {
    //         uid = generateGUID();
    //         chrome.storage.sync.set({"uid": uid});
            
    //     }
    //     updateUid(uid);
    // })
    
    chrome.system.display.getInfo(function(displayInfo) {
        // Detecting primary monitor
        var primary = displayInfo.filter(function(item) {
            return (item.isPrimary == true);
        });
        var screenInfo = primary[0];

        //try {
        //    if (screenInfo.rotation == 90) {

        //        heightPercent = 38;
        //        widthPercent = 40;
        //    }
        //    APP_HEIGHT = parseInt(screenInfo.bounds.height * heightPercent / 100);
        //    APP_WIDTH =parseInt( screenInfo.bounds.width * widthPercent / 100);
        //}
        //catch(e){

        //}

        chrome.app.window.create('index.html', {
                id: 'main_wnd',
                outerBounds: {
                    left: screenInfo.workArea.width - APP_WIDTH,
                    top: screenInfo.workArea.height - APP_HEIGHT,
                    width: APP_WIDTH,
                    height: APP_HEIGHT,
                    minWidth: 390,
                    minHeight: 60,

                },
                frame: 'none',

                /* alwaysOnTop: true*/
            },
            function(createdWindow) {
                createdWindow.onClosed.addListener(function() {

                    RestoreService.setTracks(_items, window.close);
                    RestoreService.setFolders(_folders, window.close);
                });

                var x = createdWindow.outerBounds.left,
                    y = createdWindow.outerBounds.top;
                createdWindow.onBoundsChanged.addListener(function() {
                    //var bounds = createdWindow.outerBounds;

                    //    if (bounds.left > screenInfo.workArea.width - APP_WIDTH - 100 && bounds.top > screenInfo.workArea.height - APP_HEIGHT - 100) {
                    //        bounds.left = screenInfo.workArea.width - APP_WIDTH;
                    //        bounds.top = screenInfo.workArea.height - APP_HEIGHT;
                    //    }

                });
            });

    });


});

// function generateGUID() {
//     var d = new Date().getTime();
//     var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         var r = (d + Math.random() * 16) % 16 | 0;
//         d = Math.floor(d / 16);
//         return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
//     });
//     return uuid;
// }
// function updateUid(uid) {
//              var issue = JSON.stringify({ Email: "", Uid: uid, Platform:  "chrome"});
//              var xhr = new XMLHttpRequest();
//              xhr.addEventListener('readystatechange', function() {
//                  debugger;
//                  if (xhr.readyState == 4) {
//                      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

//                      } else {




//                      }
//                  }
//              });
//              xhr.open('POST', 'http://localhost:41449/api/ActiveUsersApi');
//             xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
//             xhr.send(issue);
// }

;
//# sourceMappingURL=chrome.js.map