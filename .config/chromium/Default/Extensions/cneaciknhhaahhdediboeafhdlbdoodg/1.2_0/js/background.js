/*
* Analytics code starts here
*/

var trackingCode = 'UA-65247049-17';
//var trackingCode = '';


function trackEvent(user, category, action,label) {
    if(label === undefined){
        label = "-";
    }
    var payloadData = "v=1&tid=" + trackingCode + "&cid=" + user + "&t=event&ec=" + category + "&ea=" + action + "&el=" + label;
    //console.log(user+","+category+","+action+","+trackingCode+","+label);
    sendAnalytics(encodeURI(payloadData));
}

function sendAnalytics(payloadData){
    var http = new XMLHttpRequest();
    var url = "https://www.google-analytics.com/collect";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Contenct-type", "application/x-www-form-urlencoded");
    http.send(payloadData);
    //console.log(payloadData);
}

function sendLoginAnalytics()
{
   
        var loginMethod = localStorage.getItem("checksign");
        if(loginMethod === "sign_up") {
            trackEvent(-1, "ACCOUNTS", "SIGNED_UP","SIGNED_UP");
        } else if(loginMethod === "sign_in") {
            trackEvent(-1, "ACCOUNTS", "SIGNED_IN","SIGNED_IN");
        }
}

/*
* Analytics code ends here
*/

var isloaded = false;
chrome.runtime.onInstalled.addListener(function(object) {
    chrome.browserAction.setIcon({
      path : {
        "19": "images/icon.png",
        "38": "images/icon@2x.png"
      }
    });
    // var firstPage = "https://www.zoho.com/notebook";
    // chrome.tabs.create({url: firstPage}, function(tab) {
    //     getLoginStatus(false);
    // });
    getLoginStatus(false);
    // chrome.windows.getAll(null, function(windows) {
    //     for (var i = windows.length - 1; i >= 0; i--) {
    //         var window = windows[i];
    //         if (window.WindowType !== 'devtools') {
    //             chrome.tabs.getAllInWindow(window.id, function(tabs) {
    //                 for (var i = 0; i < tabs.length; i++) {
    //                     var tab = tabs[i];
    //                     if (tab.url.indexOf("chrome://") === -1) {
    //                         chrome.tabs.reload(tabs[i].id, null, null);
    //                     }
    //                 }
    //             });
    //         };
    //     }
    // });
});

function santizeContent(data) {
    var parser = new HtmlWhitelistedSanitizer(false);
    data = parser.sanitizeString(data);
}

function replaceContent(data, sanitize, replaceQuotes) {
    data = data.replace(/<article/g, "<div").replace(/<\/article>/g, "</div>");
    data = data.replace(/<main/g, "<div").replace(/<\/main>/g, "</div>");
    data = data.replace(/<section/g, "<div").replace(/<\/section>/g, "</div>");
    if(sanitize === 'true') {
        santizeContent(data);
    }
    data = data.replace(/[\u2028\u2029]/gim,"<br />"); //removeing problem char
    data = data.replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/gim,"");
    if(replaceQuotes === 'true') {
        data = data.replace(/"/g, "\\'");
    }
    return data;
}

function resizeImages(data) {
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(data, "text/html");
    var images = htmlDoc.getElementsByTagName("img");
    for(var i=0;i<images.length;i++) {
        images[i].style.maxWidth = '300px';
    }
    return htmlDoc.body.innerHTML;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var action = request.action;
    if(action === 'loadNotebooks') {
        chrome.storage.local.get(["defNotebookId", "authtoken"], function(item) {
            var defNotebookId = item.defNotebookId;
            if(defNotebookId === null || defNotebookId === undefined) {
                getUserProfile(item.authtoken);
                
            }
        });
        getUserNotebooks(sender);
    } else if (action === "getloginstatus") {
        getLoginStatus(request.checksignin);
    } else if (action === "captureVisibleTab" && navigator.onLine) {
        // chrome.tabs.sendMessage(sender.tab.id, {action:"screenshot", tabid:(sender.tab.id + "")});
        captureVisibleTab(sender.tab.id);
    } else if (action === "clipFullPage" && navigator.onLine) {
        chrome.tabs.sendMessage(sender.tab.id, {action:"webpage", tabid:(sender.tab.id + "")});
    } else if (action === "getSimplifiedArticle" && navigator.onLine) {
        var mainDocumentElement = request.mainDocumentElement;
        var selectedContent = replaceContent(mainDocumentElement, 'true', 'false');
        chrome.tabs.sendMessage(sender.tab.id, {action:"clipLink", tabid:(sender.tab.id + ""), mainDocumentElement:selectedContent});
    } else if (action === 'closeMain' && navigator.onLine) {
        chrome.tabs.sendMessage(sender.tab.id, {action:"closeMain", tabid:(sender.tab.id + ""), shouldClose:true});
    } else if (action === "clipSelectedText" && navigator.onLine) {
        var title = sender.tab.title;
        if (typeof request.title !== "undefined") {
            title = request.title;
        }
        chrome.tabs.executeScript(sender.tab.id, {
            code: 'var title="' + title + '";document.getElementById("notebookcx").contentWindow.document.getElementById("title").value=title;'
        });
        chrome.tabs.executeScript({
            code: "window.getSelection().toString();"
        }, function(textselected) {
            var selectedContent = textselected[0];
            selectedContent = getSelectionHtml(selectedContent);
            selectedContent = nl2br(selectedContent);
            if (selectedContent === "") {
                selectedContent = "<div></div>";
            }
            while (selectedContent.indexOf("\n") !== -1) {
                selectedContent = selectedContent.replace("\n", "");
            }
            selectedContent = replaceContent(selectedContent, 'true', 'true');
            chrome.tabs.executeScript(tab.id, {
                code: 'var content="' + selectedContent + '";document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML=content;'
            });
        });
    } else if (action === "savePageLink" && navigator.onLine) {
        var data = "<div><a href='" + sender.tab.url + "'>" + sender.tab.url + "</a></div><br/>";
        var title = sender.tab.title;
        if (typeof request.title !== "undefined") {
            title = request.title;
        }
        chrome.tabs.executeScript(sender.tab.id, {
            code: 'var title = "' + title + '"; document.getElementById("notebookcx").contentWindow.document.getElementById("title").value=title;var content="' + data + '";document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML=content;enterCheckList();'
        });
    } else if (action === "close-btn") {
        chrome.tabs.sendMessage(sender.tab.id, {action: "close-btn-cs", ifr_id: "nb_ifr_loader"}, function(response) {
        });
    } else if (!navigator.onLine) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabsArray) {
            chrome.tabs.sendMessage(tabsArray[0].id, {action: "offline"}, function(response) {
            });
        });
    } else if(action === 'saveTextNote') {
        createTextNote(request.content, request.title, request.color, request.notebookid, sender);
    } else if (action === 'saveImageNote') {
        createImageNote(request.content, request.title, request.color, request.notebookid, sender);
    } else if (action === 'saveChecklistNote') {
        createChecklistNote(request.content, request.title, request.color, request.notebookid, sender);
    } else if (action === 'saveAudioNote') {
        createAudioNote(request.content, request.title, request.color, request.notebookid, sender);
    } else if (action === 'sanitizeAndSaveTextNote') {
        var selectedContent = request.content;
        selectedContent = replaceContent(selectedContent, 'true', 'false');
        createTextNote(selectedContent, request.title, request.color, request.notebookid, sender);
    } else if (action === "clearTabData") {
        chrome.tabs.sendMessage(sender.tab.id, {action:"closeMain", tabid:(sender.tab.id + ""), shouldClose:false});
    } else if (action === "loadNotecards") {
        // chrome.tabs.executeScript(sender.tab.id, {
        //     code: 'setNotecardsLoading();'
        // });
        // loadNotecards(request.notebookid, sender.tab.id);
    } else if (action === "loadNoteCard") {
        // loadNotecard(request.notebookid, sender.tab.id, request.notecardid);
    } else if (action === "setIcon") {
        if (request.type === "open") {
            chrome.browserAction.setIcon({
              path : {
                "19": "images/icon-active.png",
                "38": "images/icon-active@2x.png"
              }
            });
        } else {
            chrome.browserAction.setIcon({
              path : {
                "19": "images/icon.png",
                "38": "images/icon@2x.png"
              }
            });
        }
    } else if(action === 'sanitizeContent') {
        var data = replaceContent(request.data, 'true', 'true');
        chrome.tabs.executeScript(null, {
            code: 'showData("' + data + '")'
        });
    } else if(action === 'loadMainWindow') {
        loadMainWindow(sender.tab, request.from);
    } else if(action === 'loadUserProfile') {
        chrome.storage.local.get("authtoken", function(item) {
            if(typeof authtoken !== 'undefined')
            {
                getUserProfile(item.authtoken);
            }
        });
    } else if(action === 'sendAnalytics') {
        chrome.storage.local.get("zuid_hash", function(item) {
            var zuid_hash = item.zuid_hash;
            if(typeof zuid_hash == 'undefined' || zuid_hash === 0)
            {
                chrome.runtime.sendMessage({action: "loadUserProfile"});
                trackEvent(-1, request.analyticsCategory, request.analyticsAction,request.analyticsLabel);
            }
            else
            {
                trackEvent(zuid_hash, request.analyticsCategory, request.analyticsAction,request.analyticsLabel);     
            }
        });
    } else if(action === 'sendAnonymousAnalytics') {
        trackEvent(-1, request.analyticsCategory, request.analyticsAction,request.analyticsLabel);     
    } else if(action === 'loadNotebooksWithoutUserProfile') {
        getUserNotebooks(sender);
    } else if(action === 'showToast') {
        showToast(sender, request.message);
    } else if (action === "capturefeedbackScreenshot" && navigator.onLine) {
        captureVisibleTabForFeedback(sender.tab.id);
    }
});

function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function getUserProfile(authtoken) {
    var userProfile = notebook_server + "/api/v1/userprofile?authtoken=" + authtoken;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var profileRes = xhttp.responseText;
            var defNotebookId = JSON.parse(profileRes).default_notebook_id;
            var defNotecardColor = JSON.parse(profileRes).default_notecard_color;
            var zuid = JSON.parse(profileRes).zuid;
            var user_email = JSON.parse(profileRes).email;
            chrome.storage.local.set({
                "defNotebookId": defNotebookId
            });
            chrome.storage.local.set({
                "defNotecardColor": defNotecardColor
            });
            chrome.storage.local.set({
                "zuid_hash": getHashCode(zuid)
            })
            chrome.storage.local.set({
                "user_email": user_email
            })
            var nbDetails = notebook_server + "/api/v1/notebooks/" + defNotebookId + "?authtoken=" + authtoken;
            var x1 = new XMLHttpRequest();
            x1.onreadystatechange = function() {
                if (x1.readyState == 4 && x1.status == 200) {
                    var detailsResponse = x1.responseText;
                    var defNotebookName = JSON.parse(detailsResponse).name;

                    chrome.storage.local.set({
                        "defNotebookName": defNotebookName
                    });
                }

            };
            x1.open("GET", nbDetails, false);
            x1.send();
        }
    };

    xhttp.open("GET", userProfile, true);
    xhttp.send();
}


function getLoginStatus(checksignin) {
    if(checksignin) {
        chrome.storage.local.set({
            'checksignin': ""
        });
    }
    chrome.storage.local.get("authtoken", function(item) {
        var authtoken = item.authtoken;
        if (typeof authtoken === "undefined") {
            chrome.cookies.get({"url": cookie_domain, "name": ticket_cookie}, function(cookies) {
                if (cookies !== null) {
                    var scopeURL = accounts_server + "/apiauthtoken/create?SCOPE=notebook/notebookapi,ZohoPC/docsapi,ZohoContacts/photoapi,ZohoSearch/SearchAPI&DISPLAY_NAME=Notebook-Chrome";
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (xhttp.readyState == 4 && xhttp.status == 200) {
                            var response1 = xhttp.responseText;
                            var authtoken = extractSummary(response1);
                            if (authtoken !== "" && authtoken !== undefined && authtoken !== null) {
                                chrome.storage.local.set({
                                    'authtoken': authtoken
                                });
                                if(checksignin) {
                                    chrome.storage.local.set({
                                        'checksignin': "loggedin"
                                    });
                       }
                                sendLoginAnalytics();
                                getUserProfile(authtoken);
                            }
                        }
                    };
                    xhttp.open("GET", scopeURL, false);
                    xhttp.send();
                } else {
                    if(checksignin) {
                        chrome.storage.local.set({
                            'checksignin': "need login"
                        });
                    }
                }
            });
        } else {
            if(checksignin) {
                chrome.storage.local.set({
                    'checksignin': "loggedin"
                });
            }
        }
    });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        if(key === 'checksignin') {
            var newValue = storageChange.newValue;
            if(newValue !== '') {
                chrome.tabs.executeScript(null, {
                    code: "authtokenChanged();"
                });
            }
        }
    }
});

chrome.cookies.onChanged.addListener(function(info) {
    if (info.cookie.name === ticket_cookie || info.cookie.name === ticket_cookie) {
        if (info.cause === "overwrite" || (info.cause === "explicit" && !info.removed)) {
            getLoginStatus(false);
        } else {
            deleteToken();
        }
    }

});


function deleteToken() {
    chrome.storage.local.get("authtoken", function(item) {
        authtoken = item.authtoken;
        if (typeof authtoken != "undefined") {
            var deleteToken = accounts_server + "/apiauthtoken/delete?AUTHTOKEN=" + authtoken;
            var x = new XMLHttpRequest();
            x.onreadystatechange = function() {

                if (x.readyState == 4 && x.status == 200) {

                }
            };
            x.open('POST', deleteToken, true);
            x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            x.send();
            // Clearing local storage when user logged out from browser tab.
            chrome.storage.local.clear(function() {});
        }
    });
}

function extractSummary(scopeResponse) {
    try {
        var rx = /\nAUTHTOKEN=(.*)\n/g;
        var arr = rx.exec(scopeResponse);
        return arr[1];
    } catch (err) {
//        console.log("response : " + scopeResponse);
    }
}

chrome.browserAction.onClicked.addListener(function(tab) {
    loadMainWindow(tab);
});

// chrome.webRequest.onBeforeRequest.addListener(
//   function(info) {
//     var url = info.url;
//     // Redirect the lolcal request to a random loldog URL.
//     var i = Math.round(Math.random() * loldogs.length);
//     return {redirectUrl: loldogs[i]};
//   },
//   // filters
//   {
//     urls: [
//       accounts_server + "/*"
//     ]
//   },
//   ["blocking"]
// );
chrome.tabs.onActivated.addListener(function(obj) {
    chrome.tabs.get(obj.tabId, function(tabs) {
        if (!tabs.url.startsWith("chrome:")) {
            chrome.tabs.executeScript(obj.tabId, {
                code: "if(document.getElementById('notebookcx')!== null && document.getElementById('notebookcx') !== undefined) { onNotebookcxLoad(); }"
            });
        }
    });
    
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status === "loading") {
        chrome.browserAction.setIcon({
          path : {
            "19": "images/icon.png",
            "38": "images/icon@2x.png"
          }
        });
        var tabid = tabId + "";
        chrome.storage.local.get(["signinclicked", "previousURL"], function(item) {
            if (item.signinclicked === 'true') {
                chrome.storage.local.set({
                    "signinclicked": "false"
                });
                chrome.tabs.executeScript(tab.id, {
                    code: 'window.location.href="' + item.previousURL + '"'
                }, function(result) {
                    loadMainWindow(tab);
                });
            } else {
                chrome.storage.local.set({
                    "previousURL":changeInfo.url
                });
            }
        });
    }
});

function loadMainWindow(tab, from) {
    chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
        if (response) {
            loadMainWindow1(tab, from);
        } else {
            var contentscript = ["js/content-script.js", "js/Readability.js", "js/JSDOMParser.js", "js/html2canvas.js", "js/html2canvas.min.js", "js/sanitize.js"];
            for (var i = contentscript.length - 1; i >= 0; i--) {
                chrome.tabs.executeScript(tab.id, {file: contentscript[i]}, function(response) {
                    if (i <= 0) {
                        loadMainWindow1(tab, from);
                    }
                });
            };
            chrome.runtime.sendMessage({action: "loadNotebooksWithoutUserProfile"});
        }
    });
}


function loadMainWindow1(tab, from) {
    chrome.tabs.executeScript(tab.id, {
        code: "document.getElementById('notebookcx')"
    }, function(result) {
        if(result !== undefined || result !== null) {
            var response = result[0];
            if(response === null || response === undefined) {
                chrome.browserAction.setIcon({
                  path : {
                    "19": "images/icon-active.png",
                    "38": "images/icon-active@2x.png"
                  }
                });
                var js = ["vendor/javascripts/jquery.min.js", "vendor/javascripts/bootstrap.js", "vendor/javascripts/jquery.scrollTo.min.js", "vendor/javascripts/jquery.ui.widget.js", "vendor/javascripts/jquery-ui.min.js", "vendor/javascripts/jquery.fileupload.js", "vendor/javascripts/jquery.oembed.js"];
                for (var i = 0; i < js.length; i++) {
                    var count = 0;
                    chrome.tabs.executeScript(tab.id, {
                        file: js[i],
                    }, function(result) {
                        count++;
                        if (count === 7) {
                            var mainJS = chrome.extension.getURL("js/chromewindow.js");
                            var rawFile = new XMLHttpRequest();
                            rawFile.open("GET", mainJS, true);
                            rawFile.onreadystatechange = function() {
                                if (rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status === 0)) {
                                    var text = rawFile.responseText;
                                    chrome.tabs.executeScript(tab.id, {
                                        code: text + ";onNotebookcxLoad('" + from + "');"
                                    });
                                }
                            };
                            rawFile.send(null);
                        }
                    });
                }


                var mainJS = chrome.extension.getURL("js/chromewindow.js");
                var rawFile = new XMLHttpRequest();
                rawFile.open("GET", mainJS, true);
                rawFile.onreadystatechange = function() {
                    if (rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status === 0)) {
                        var text = rawFile.responseText;
                            chrome.tabs.executeScript(tab.id, {
                            code: text + ";onNotebookcxLoad('" + from + "');"
                        });
                    }
                };
                rawFile.send(null);
            } else {
                chrome.browserAction.setIcon({
                  path : {
                    "19": "images/icon.png",
                    "38": "images/icon@2x.png"
                  }
                });
                chrome.tabs.sendMessage(tab.id, {action:"closeMain", tabid:(tab.id + ""), shouldClose:true});
//                chrome.tabs.executeScript(tab.id, {
//                    code: "closeMessage()"
//                });
            }
        }
    });
}

function captureVisibleTab(tabid) {
    chrome.tabs.captureVisibleTab(null, function(result) {
        chrome.tabs.sendMessage(tabid, {action:"screenshot1", tabid:(tabid + ""), image:result});
    });
}

function captureVisibleTabForFeedback(tabid) {
    chrome.tabs.captureVisibleTab(null, function(result) {
        chrome.tabs.sendMessage(tabid, {action:"feedbackScreenshot", tabid:(tabid + ""), image:result});
    });
}

function getHashCode(value) 
{
    value = value.toString();
    var hash = 0, i, chr, len;

    if (value.length === 0) 
    {
        return hash;   
    }
    for (i = 0, len = value.length; i < len; i++) 
    {
        chr   = value.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        // Replace the User-Agent header
        var headers = info.requestHeaders;
        headers.forEach(function(header, i) {
            if (header.name.toLowerCase() == 'user-agent') { 
                header.value = header.value + ' ' + 'NoteBook/1.0.7 (Chrome Extension)';
            }
        });  
        return {requestHeaders: headers};
    },
    // Request filter
    {
        // Modify the headers for these pages
        urls: [
            notebook_server + "/api/v1/notebooks*"
        ],
        // In the main window and frames
        types: ["xmlhttprequest"]
    },
    ["blocking", "requestHeaders"]
);

