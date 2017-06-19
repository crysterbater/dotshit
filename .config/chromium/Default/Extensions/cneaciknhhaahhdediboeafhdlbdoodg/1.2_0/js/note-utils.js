// var accounts_server = "https://accounts.localzoho.com";
// var notebook_server = "https://notebook.localzoho.com";
// var cookie_domain = "https://www.localzoho.com";
// var ticket_cookie = "LOCALZOHOIAMAGENTTICKET";
var accounts_server = "https://accounts.zoho.com";
var notebook_server = "https://notebook.zoho.com";
var cookie_domain = "https://www.zoho.com";
var ticket_cookie = "IAMAGENTTICKET";

var timeoutFunc;

function invokeProgressBar(sender) {
    chrome.tabs.executeScript(sender.tab.id, {
        code: 'document.getElementById("titleNameDisplay").style.width'
    }, function(result) {
        try {
            if (result.length > 0) {
                var response = result[0];
                var width = 10;
                if (response.indexOf("%") !== -1) {
                    response = response.substring(0, response.indexOf("%"));
                    if (response !== '100') {
                        width = 5 + parseInt(response);
                        if (width >= 100) {
                            width = 10;
                        }
                    }
                    setProgressBar(width, sender);
                    setProgressBarInitial(sender);
                }
            }
        } catch (err) {
        }
    });
}

function setProgressBarInitial(sender) {
//    timeoutFunc = setTimeout(function() {
//        invokeProgressBar(sender);
//    }, 1000);
//    chrome.tabs.sendMessage(sender.tab.id, {action: "showNewNote"}, function(response) {});
}

function hasImages(content) {
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(content, "text/html");
    var images = htmlDoc.getElementsByTagName("img");
    return (images.length > 0) ? [true, htmlDoc] : [false, htmlDoc];
}

function createTextNote(htmlString, title, color, selectednotebookid, sender) {
    if (title === "") {
        title = "Untitled";
    }
    setProgressBarInitial(sender);
    chrome.storage.local.get(["authtoken", "defNotebookId"], function(item) {
        var authtoken = item.authtoken;
        var notebookId = item.defNotebookId;
        if (notebookId !== "-1") {
            notebookId = selectednotebookid;
        }
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(htmlString, "text/html");
        var images = htmlDoc.getElementsByTagName("div");
        for(var i=0;i<images.length;i++) {
            var id = images[i].id;
            if(id !== null && id !== undefined && id.indexOf("removeDiv") !== -1) {
                images[i].parentNode.removeChild(images[i]);
            } else if (id !== null && id !== undefined && id.indexOf("mainImage") !== -1) {
                images[i].style = "";
            }
        }
        var content = htmlDoc.body.innerHTML;
        var hasImage = hasImages(content);
        if (hasImage[0]) {
            content = "";
        } else {
            content = content.replace(/<br>/g, "<br/>").replace(/<hr>/g, "<hr/>");
        }
        var notecardColor = color;
        if (notecardColor === undefined || notecardColor === null || notecardColor === 'undefined' || notecardColor === 'null') {
            notecardColor = "#ffffff";
        }
        if (typeof authtoken !== "undefined" && typeof notebookId !== "undefined") {
            var url = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards?authtoken=" + authtoken;
            var time = getDate();
            getGeoLocation(function(callback) {
                var zStr = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time + "</ZCreatedDate><ZModifiedDate>" + time + "</ZModifiedDate><ZLocation><ZLongitude>" + callback.longitude + "</ZLongitude><ZLatitude>" + callback.latitude + "</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/mixed</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + content + "</content> ]]></ZContent></ZNote>");
                var params = "attachment=" + encodeURIComponent(zStr);
                var x = new XMLHttpRequest();
                x.timeout = 10000;
                x.onreadystatechange = function() {
                    if (x.readyState === 4) {
                        if (x.status === 201) {
                            //Google analytics code
                            chrome.storage.local.get("zuid_hash", function(item) {
                                var zuid_hash = item.zuid_hash;
                            });
                            showDownloadAppMessage(sender);
                            
                            var profileRes = x.responseText;
                            var noteRes = JSON.parse(profileRes);
                            var notecard_id = noteRes.notecard_id;
                            if (!hasImage[0]) {
                                showSaved(sender);
                            } else {
                                downloadAndAddImages(hasImage[1], notebookId, authtoken, notecard_id, notecardColor, title, sender);
                            }
                        } else {
                            var errorRes = x.responseText;
                            var code = JSON.parse(errorRes).code;
                            if (code === 1009) {
                                deleteToken();
                            }
                            showFailed(sender);
                        }
                    }
                };
                x.ontimeout = function (e) {
                    showConnectionLost(sender);
                }
                x.open('POST', url, true);
                x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                x.send(params);
            });
        } else {
            showFailed(sender);
        }
    });
}

function downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc) {
    if(count !== images.length) {
        var src = images[count].getAttribute("data-src");
        if(src === null || src === 'null' || src === '' || src === undefined) {
            src = images[count].src;
        }
        if(src === null || src === 'null' || src === '' || src === undefined) {
            count++;
            downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
        } else if (src !== null && src !== undefined && src.indexOf("icn-trash-light.png") !== -1) {
            count++;
            downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
        } else {
            if (src.indexOf("data:image") !== -1) {
                var image_url = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "/resources?authtoken=" + authtoken;
                var blob = dataURLtoBlob(src, title);
                var formData = new FormData();
                var fileName = "image" + count + ".png";
                formData.append('attachment', blob, fileName);
                formData.append('JSONString', "{\"name\":\"Image\"}");
                var x1 = new XMLHttpRequest();
                x1.onreadystatechange = function() {
                    if (x1.readyState === 4) {
                        if(x1.status === 201) {
                            var rs = x1.responseText;
                            var imageRes = JSON.parse(rs);
                            var resource_id = imageRes.resource_id;
                            var data_type = imageRes.format;
                            var htmlString = "<div><zimage type=\"" + data_type + "\" height=\"805\" resource-id=\"" + resource_id + "\" width=\"1436\" ></zimage><br/></div>";
                            images[count].insertAdjacentHTML('beforeBegin', htmlString);
                            count++;
                            downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
                        } else {
                            count++;
                            downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
                        }
                    }
                };
                x1.ontimeout = function (e) {
                    showConnectionLost(sender);
                }
                x1.open('POST', image_url, false);
                x1.setRequestHeader("processData", false);
                x1.setRequestHeader("contentType", false);
                x1.send(formData);
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', src, true);
                xhr.responseType = "blob";
                xhr.onload = function(e) {
                    if (this.status === 200) {
                        var blob = new Blob([this.response], {type: this.response.type});
                        var image_url = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "/resources?authtoken=" + authtoken;
                        var formData = new FormData();
                        var fileName = "image" + count + ".png";
                        formData.append('attachment', blob, fileName);
                        formData.append('JSONString', "{\"name\":\"Image\"}");
                        var x1 = new XMLHttpRequest();
                        x1.onreadystatechange = function() {
                            if (x1.readyState === 4) {
                                if(x1.status === 201) {
                                    var rs = x1.responseText;
                                    var imageRes = JSON.parse(rs);
                                    var resource_id = imageRes.resource_id;
                                    var data_type = imageRes.format;
                                    var htmlString = "<div><zimage type=\"" + data_type + "\" height=\"805\" resource-id=\"" + resource_id + "\" width=\"1436\" ></zimage><br/></div>";
                                    images[count].insertAdjacentHTML('beforeBegin', htmlString);
                                    count++;
                                    downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
                                } else {
                                    count++;
                                    downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
                                }
                            }
                        };
                        x1.ontimeout = function (e) {
                            showConnectionLost(sender);
                        }
                        x1.open('POST', image_url, false);
                        x1.setRequestHeader("processData", false);
                        x1.setRequestHeader("contentType", false);
                        x1.send(formData);
                    } else {
                        count++;
                        downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, count, htmlDoc);
                    }
                };
                xhr.send();
            }
        }
    } else {
        while (images.length !== 0) {
            images[0].parentNode.removeChild(images[0]);
        }
        var htmlString = htmlDoc.body.innerHTML;
        htmlString = htmlString.replace(/<br>/g, "<br/>").replace(/<hr>/g, "<hr/>");
        var updateNCURL = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "?authtoken=" + authtoken;
        var time2 = getDate();
        var zStr2 = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time2 + "</ZCreatedDate><ZModifiedDate>" + time2 + "</ZModifiedDate><ZLocation><ZLongitude>0.0</ZLongitude><ZLatitude>0.0</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/mixed</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + htmlString + "</content> ]]></ZContent></ZNote>");
        var formData2 = new FormData();
        formData2.append("attachment", zStr2);
        var x2 = new XMLHttpRequest();
        x2.onreadystatechange = function() {
            if (x2.readyState === 4) {
                if (x2.status === 200) {
                    showSaved(sender);
                } else {
                    var errorRes = x2.responseText;
                    var code = JSON.parse(errorRes).code;
                    if (code === 1009) {
                        deleteToken();
                    }
                    showFailed(sender);
                }
            }
        };
        x2.ontimeout = function (e) {
            showConnectionLost(sender);
        }
        x2.open('PUT', updateNCURL, false);
        x2.setRequestHeader("processData", false);
        x2.setRequestHeader("contentType", false);
        x2.setRequestHeader("cache", false);
        x2.send(formData2);
    }
}
function downloadAndAddImages(htmlDoc, notebookId, authtoken, notecard_id, notecardColor, title, sender) {
    var images = htmlDoc.getElementsByTagName("img");
    downloadanduploadImage(notebookId, authtoken, notecard_id, notecardColor, title, sender, images, 0, htmlDoc);
}

function setProgressBar(width, sender) {
    chrome.tabs.sendMessage(sender.tab.id, {action: "showProgressBar", width: width}, function(response) {});
}

function getGeoLocation(callback) {
    var location = {latitude: "0.0", longitude: "0.0"};
    if(navigator.geolocation){
        var options = {timeout:60000};
        navigator.geolocation.getCurrentPosition(function(position) {
            location = {latitude: position.coords.latitude, longitude: position.coords.longitude};
            callback(location);
        }, function(err) {
            callback(location);
        }, options);
    } else {
        callback(location);
    }
}

function createImageNote(imgUrl, title, color, selectednotebookid, sender) {
    if (title === "") {
        title = "Untitled";
    }
    if (imgUrl !== "undefined" && imgUrl !== undefined && imgUrl.length > 0) {
        setProgressBarInitial(sender);
        chrome.storage.local.get(["authtoken", "defNotebookId"], function(item) {
            var notebookId = item.defNotebookId;
            if (selectednotebookid !== "-1") {
                notebookId = selectednotebookid;
            }
            var notecardColor = color;
            if (notecardColor === undefined || notecardColor === null || notecardColor === 'undefined' || notecardColor === 'null') {
                notecardColor = "#0C0C0B";
            }
            var authtoken = item.authtoken;
            var addNoteURL = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards?authtoken=" + authtoken;
            var time = getDate();
            var htmlString = "<div></div>";
            var zStr = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time + "</ZCreatedDate><ZModifiedDate>" + time + "</ZModifiedDate><ZLocation><ZLongitude>0.0</ZLongitude><ZLatitude>0.0</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/image</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + htmlString + "</content> ]]></ZContent></ZNote>");
            var params = "attachment=" + encodeURIComponent(zStr);
            var x = new XMLHttpRequest();
            x.onreadystatechange = function() {
                if (x.readyState === 4) {
                    if (x.status === 201) {
                        var profileRes = x.responseText;
                        var noteRes = JSON.parse(profileRes);
                        var notecard_id = noteRes.notecard_id;
                        var htmlString = "";
                        var count = 0;
                        for (var i = 0; i < imgUrl.length; i++) {
                            var image_url = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "/resources?authtoken=" + authtoken;
                            var formData = new FormData();
                            var blob = dataURLtoBlob(imgUrl[i], title);
                            var fileName = "image" + i + ".png";
                            formData.append('attachment', blob, fileName);
                            formData.append('JSONString', "{\"name\":\"Image\"}");
                            var x1 = new XMLHttpRequest();
                            x1.onreadystatechange = function() {
                                if (x1.readyState === 4) {
                                    if (x1.status === 201) {
                                        //Google analytics code
                                        sendImageSavedAnalyticsCode();
                                        showDownloadAppMessage(sender);
                                        
                                        var rs = x1.responseText;
                                        var imageRes = JSON.parse(rs);
                                        var resource_id = imageRes.resource_id;
                                        var data_type = imageRes.format;
                                        htmlString += "<div><zimage type=\"" + data_type + "\" height=\"805\" resource-id=\"" + resource_id + "\" width=\"1436\" ></zimage><br/></div>";
                                        count++;
                                        if (count === imgUrl.length) {
                                            var updateNCURL = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "?authtoken=" + authtoken;
                                            var time2 = getDate();
                                            var zStr2 = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time2 + "</ZCreatedDate><ZModifiedDate>" + time2 + "</ZModifiedDate><ZLocation><ZLongitude>0.0</ZLongitude><ZLatitude>0.0</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/image</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + htmlString + "</content> ]]></ZContent></ZNote>");
                                            var formData2 = new FormData();
                                            formData2.append("attachment", zStr2);
                                            var x2 = new XMLHttpRequest();
                                            x2.onreadystatechange = function() {
                                                if (x2.readyState === 4) {
                                                    if (x2.status === 200) {
                                                        showSaved(sender);
                                                    } else {
                                                        var errorRes = x.responseText;
                                                        var code = JSON.parse(errorRes).code;
                                                        if (code === 1009) {
                                                            deleteToken();
                                                        }
                                                        showFailed(sender);
                                                    }
                                                }
                                            };
                                            x2.open('PUT', updateNCURL, true);
                                            x2.setRequestHeader("processData", false);
                                            x2.setRequestHeader("contentType", false);
                                            x2.setRequestHeader("cache", false);
                                            x2.send(formData2);
                                        }
                                    }
                                }
                            };
                            x1.open('POST', image_url, false);
                            x1.setRequestHeader("processData", false);
                            x1.setRequestHeader("contentType", false);
                            x1.send(formData);
                        }
                    } else {
                        var errorRes = x.responseText;
                        var code = JSON.parse(errorRes).code;
                        if (code === 1009) {
                            deleteToken();
                        }
                        showFailed(sender);
                    }
                }

            };
            x.open('POST', addNoteURL, false);
            x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            x.send(params);
        });
    } else {
        showFailed(sender);
    }
}

function sendImageSavedAnalyticsCode() {
    chrome.storage.local.get("zuid_hash", function(item) {
        var zuid_hash = item.zuid_hash;
    });
}

function showDownloadAppMessage(sender) {
    chrome.storage.local.get("download_app_message_shown", function(item) {
        var messageShown = item.download_app_message_shown;
        if(typeof messageShown === 'undefined' || messageShown === false)
        {
            showDownloadAppPage(sender);
            chrome.storage.local.set({
                "download_app_message_shown": true
            });
        }
    });
}

function showDownloadAppPage(sender) {
    
    chrome.tabs.executeScript(sender.tab.id, {
        code:'document.getElementById("dummytd").style.display = "none"; document.getElementById("closeExtnMain").style.display = "none"; document.getElementById("tophalf").style.display = "none"; document.getElementById("bottomhalf").style.display = "none"; document.getElementById("editorhalf").style.display = "none"; document.getElementById("colorPicker").style.display = "none"; document.getElementById("colorComponent").style.display = "none"; document.getElementById("selectedNotebook").style.display = "none"; document.getElementById("closeExtnMainImage").style.display = "none"; document.getElementById("saveButton").style.display = "none"; document.getElementById("icondiv").style.display = "none"; document.getElementById("downloadAppContainer").style.display = ""; document.getElementById("notebookAppDownloadMessage").innerHTML = "Clipping is just the start. Download Notebook to view your notes on your mobile device.";'
    });
    
}

function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {
    }
}

function showSaved(sender) {
//    clearTimeout(timeoutFunc);
//    chrome.tabs.executeScript(sender.tab.id, {
//        code: 'document.getElementById("titleNameDisplay").style.width="100%";document.getElementById("titleNameDisplay").style.backgroundColor="#9ACB91";document.getElementById("titleNameDisplay").style.whiteSpace="";document.getElementById("status").style.display="";document.getElementById("statusMessage").innerHTML = "Note synced successfuly";var closeExtn = chrome.extension.getURL("images/close.png");document.getElementById("closeExtnMessageImage").src = closeExtn;document.getElementById("closeExtnMessageImage").style.maxWidth="12px";'
//    });
    chrome.tabs.executeScript(sender.tab.id, {
        code:'document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "Note Added";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);if(document.getElementById("notebookcleanviewcx") !== null && document.getElementById("notebookcleanviewcx") !== undefined) {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").innerHTML = "Note Added";setTimeout(function() {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.width = "0px";}, 3000);document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.backgroundColor = "black";}'
    });
}

function showFailed(sender) {
//    clearTimeout(timeoutFunc);
//    chrome.tabs.executeScript(sender.tab.id, {
//        code: 'document.getElementById("titleNameDisplay").style.width="100%";document.getElementById("titleNameDisplay").style.backgroundColor="#DA6D6E";document.getElementById("titleNameDisplay").style.whiteSpace="";document.getElementById("status").style.display="";document.getElementById("statusMessage").innerHTML = "Note sync failed";var closeExtn = chrome.extension.getURL("images/close.png");document.getElementById("closeExtnMessageImage").src = closeExtn;document.getElementById("closeExtnMessageImage").style.maxWidth="12px";'
//    });
    chrome.tabs.executeScript(sender.tab.id, {
        code:'document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "Error while adding the note!";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);if(document.getElementById("notebookcleanviewcx") !== null && document.getElementById("notebookcleanviewcx") !== undefined) {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").innerHTML = "Error while adding the note!";setTimeout(function() {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.width = "0px";}, 3000);document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.backgroundColor = "black";}'
    });
}

function showToast(sender, message) {
    chrome.tabs.executeScript(sender.tab.id, {
        code:'document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "' + message + '";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);if(document.getElementById("notebookcleanviewcx") !== null && document.getElementById("notebookcleanviewcx") !== undefined) {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").innerHTML = "'+ message + '";setTimeout(function() {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.width = "0px";}, 3000);document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.backgroundColor = "black";}'
    });
}

function showConnectionLost(sender) {
    chrome.tabs.executeScript(sender.tab.id, {
        code:'document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = " No internet connection. !";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);if(document.getElementById("notebookcleanviewcx") !== null && document.getElementById("notebookcleanviewcx") !== undefined) {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").innerHTML = "Error while adding the note!";setTimeout(function() {document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.width = "0px";}, 3000);document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.backgroundColor = "black";}'
    });
}

function replaceSplChar(title) {
    return title.replace('.', ' ');
}

function dataURLtoBlob(dataurl, title) {
    try {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    } catch (err) {
        getDataUri(dataurl, title, function(dataUri) {
            dataURLtoBlob(dataUri, title);
        });
    }
}

function getDataUri(url, title) {
    var image = new Image();
    image.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
        canvas.getContext('2d').drawImage(this, 0, 0);
        createImageNote(canvas.toDataURL('image/png'), title);
    };
    image.src = url;
}

function getDate() {
    var today = new Date();
    var d = today.getFullYear() + '-' + twoDigits(today.getMonth() + 1) + '-' + twoDigits(today.getDate());
    var t = twoDigits(today.getHours()) + ':' + twoDigits(today.getMinutes()) + ':' + twoDigits(today.getSeconds());
    var zone = minTommss(today.getTimezoneOffset() / 60);
    var dateString = d + 'T' + t + zone;
    return dateString;
}

function twoDigits(n) {
    return n < 10 ? '0' + n : '' + n;
}

function minTommss(minutes) {
    var sign = minutes < 0 ? "+" : "-";
    var min = Math.floor(Math.abs(minutes));
    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sign + twoDigits(min) + "" + twoDigits(sec);
}

function getUserNotebooksList(tab) {
    chrome.storage.local.get(["authtoken"], function(item) {
        var authtoken = item.authtoken;
        if (typeof authtoken !== "undefined") {
            var url = notebook_server + "/api/v1/notebooks?authtoken=" + authtoken;
            var bookdetails = null;
            var books = null;
            var bookids = null;
            var booksMap = {};
            chrome.tabs.sendMessage(tab.id, {action: "loadNotebooks", notebooks: books, notebookids: bookids}, function(response) {});
            var x = new XMLHttpRequest();
            x.onreadystatechange = function() {
                if (x.readyState === 4) {
                    if (x.status === 200) {
                        bookdetails = [];
                        books = [];
                        bookids = [];
                        var response = x.responseText;
                        var responseJSON = JSON.parse(response);
                        if (responseJSON !== null) {
                            var notebooks = responseJSON.notebooks;
                            if(typeof notebooks != 'undefined' && notebooks.length > 0)
                            {
                                for (var i = 0; i < notebooks.length; i++) {
                                    bookdetails.push(notebooks[i].name + ":" + notebooks[i].notebook_id);
                                    if(notebooks[i].is_default)
                                    {
                                        var defaultNotebookId = notebooks[i].notebook_id;
                                        chrome.storage.local.set({
                                            "defNotebookId": defaultNotebookId
                                        });
                                    }
                                }
                                bookdetails.sort();
                                for (var i = 0;i<bookdetails.length;i++) {
                                    var bookDetail = bookdetails[i];
                                    var bookName = bookDetail.split(":")[0];
                                    var bookid = bookDetail.split(":")[1];
                                    books.push(bookName);
                                    bookids.push(bookid);
                                }
                                chrome.tabs.sendMessage(tab.id, {action: "loadNotebooks", notebooks: books, notebookids: bookids}, function(response) {});
                            }
                            else
                            {
                                //Create new default notebook   
                                createDefaultNotebook(tab);
                            }
                        }
                    }
                }
            };
            x.open('GET', url, true);
            x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            x.send();
        }
    });
}

function createDefaultNotebook(sender)
{
    chrome.storage.local.get(["authtoken"], function(item) {
        var authtoken = item.authtoken;
        if (typeof authtoken !== "undefined") 
        {
            var url = notebook_server + "/api/v1/covers/public?authtoken=" + authtoken;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = "json";
            xhr.onload = function(e) {
                if(xhr.status === 200) {
                    var coversResult = xhr.response;
                    var covers = coversResult.covers;
                    if(typeof covers !== 'undefined' && covers.length > 0)
                    {
                        var coverId = covers[0].cover_id;
                        var newNotebook = {};
                        newNotebook.name = "Default";
                        newNotebook.description = "Created by Notebook Web clipper";
                        newNotebook.cover_image_id = coverId;
                        newNotebook.is_default = true;
                        var notebookUrl = notebook_server + "/api/v1/notebooks?authtoken=" + authtoken;
                        var notebookXhr = new XMLHttpRequest();
                        notebookXhr.responseType = "json";
                        notebookXhr.onreadystatechange = function() {
                            if(notebookXhr.readyState === 4)
                            {
                                if (notebookXhr.status === 201) {
                                    var notebook = notebookXhr.response;
                                    var defaultNotebookId = notebook.notebook_id;
                                    chrome.storage.local.set({
                                        "defNotebookId": defaultNotebookId
                                    });
                                    chrome.tabs.sendMessage(sender.id, {action: "loadNotebooks", notebooks: [notebook.name], notebookids: [notebook.notebook_id]}, function(response) {});
                                }
                            }
                        }
                        notebookXhr.open("POST", notebookUrl, true);
                        notebookXhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        notebookXhr.send("JSONString=" + encodeURIComponent(JSON.stringify(newNotebook)));
                    }
                }
            }
            xhr.send();
        }
    });
}

function getUserNotebooks(sender) {
    getUserNotebooksList(sender.tab);
}

function createChecklistNote(htmlString, title, color, selectednotebookid, sender) {
    if (title === "") {
        title = "Untitled";
    }
    setProgressBarInitial(sender);
    chrome.storage.local.get(["authtoken", "defNotebookId"], function(item) {
        var authtoken = item.authtoken;
        var notebookId = item.defNotebookId;
        if (notebookId !== "-1") {
            notebookId = selectednotebookid;
        }
        var notecardColor = color;
        if (typeof authtoken !== "undefined" && typeof notebookId !== "undefined") {
            var url = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards?authtoken=" + authtoken;
            var time = getDate();
            getGeoLocation(function(callback) {
                var zStr = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time + "</ZCreatedDate><ZModifiedDate>" + time + "</ZModifiedDate><ZLocation><ZLongitude>" + callback.longitude + "</ZLongitude><ZLatitude>" + callback.latitude + "</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/checklist</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + htmlString + "</content> ]]></ZContent></ZNote>");
                var params = "attachment=" + encodeURIComponent(zStr);
                var x = new XMLHttpRequest();
                x.onreadystatechange = function() {
                    if (x.readyState === 4) {
                        if (x.status === 201) {
                            var profileRes = x.responseText;
                            showSaved(sender);
                        } else {
                            var errorRes = x.responseText;
                            var code = JSON.parse(errorRes).code;
                            if (code === 1009) {
                                deleteToken();
                            }
                            showFailed(sender);
                        }
                    }
                };
                x.open('POST', url, true);
                x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                x.send(params);
            });
        } else {
            showFailed(sender);
        }
    });
}

function createAudioNote(audioContent, title, color, selectednotebookid, sender) {
    if (title === "") {
        title = "Untitled";
    }
    if (audioContent !== "undefined" && audioContent !== undefined && audioContent.length > 0) {
        setProgressBarInitial(sender);
        chrome.storage.local.get(["authtoken", "defNotebookId", "audioFileName"], function(item) {
            var notebookId = item.defNotebookId;
            if (selectednotebookid !== "-1") {
                notebookId = selectednotebookid;
            }
            var notecardColor = color;
            var fileName = item.audioFileName;
            var authtoken = item.authtoken;
            var addNoteURL = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards?authtoken=" + authtoken;
            var time = getDate();
            var htmlString = "<div></div>";
            var zStr = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time + "</ZCreatedDate><ZModifiedDate>" + time + "</ZModifiedDate><ZLocation><ZLongitude>0.0</ZLongitude><ZLatitude>0.0</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/audio</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + htmlString + "</content> ]]></ZContent></ZNote>");
            var params = "attachment=" + encodeURIComponent(zStr);
            var x = new XMLHttpRequest();
            x.onreadystatechange = function() {
                if (x.readyState === 4) {
                    if (x.status === 201) {
                        var profileRes = x.responseText;
                        var noteRes = JSON.parse(profileRes);
                        var notecard_id = noteRes.notecard_id;
                        var image_url = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "/resources?authtoken=" + authtoken;
                        var formData = new FormData();
                        var blob = dataURLtoBlob(audioContent, title);
                        formData.append('attachment', blob, fileName);
                        formData.append('JSONString', "{\"name\":\"audio\"}");
                        var x1 = new XMLHttpRequest();
                        x1.onreadystatechange = function() {
                            if (x1.readyState === 4) {
                                if (x1.status === 201) {
                                    var rs = x1.responseText;
                                    var imageRes = JSON.parse(rs);
                                    var resource_id = imageRes.resource_id;
                                    var data_type = imageRes.format;
                                    var htmlString = "<div><zaudio type=\"" + data_type + "\" resource-id=\"" + resource_id + "\" ></zaudio><br/></div>";
                                    var updateNCURL = notebook_server + "/api/v1/notebooks/" + notebookId + "/notecards/" + notecard_id + "?authtoken=" + authtoken;
                                    var time2 = getDate();
                                    var zStr2 = ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><ZNote><ZMeta><ZTitle>" + title + "</ZTitle><ZCreatedDate>" + time2 + "</ZCreatedDate><ZModifiedDate>" + time2 + "</ZModifiedDate><ZLocation><ZLongitude>0.0</ZLongitude><ZLatitude>0.0</ZLatitude><ZCity>UnKnown</ZCity></ZLocation><ZNoteColor>" + notecardColor + "</ZNoteColor><ZNoteType>note/audio</ZNoteType></ZMeta><ZContent><![CDATA[<content>" + htmlString + "</content> ]]></ZContent></ZNote>");
                                    var formData2 = new FormData();
                                    formData2.append("attachment", zStr2);
                                    var x2 = new XMLHttpRequest();
                                    x2.onreadystatechange = function() {
                                        if (x2.readyState === 4) {
                                            if (x2.status === 200) {
                                                showSaved(sender);
                                            } else {
                                                var errorRes = x2.responseText;
                                                var code = JSON.parse(errorRes).code;
                                                if (code === 1009) {
                                                    deleteToken();
                                                }
                                                showFailed(sender);
                                            }
                                        }
                                    };
                                    x2.open('PUT', updateNCURL, true);
                                    x2.setRequestHeader("processData", false);
                                    x2.setRequestHeader("contentType", false);
                                    x2.setRequestHeader("cache", false);
                                    x2.send(formData2);
                                }
                            }
                        };
                        x1.open('POST', image_url, false);
                        x1.setRequestHeader("processData", false);
                        x1.setRequestHeader("contentType", false);
                        x1.send(formData);
                    } else {
                        var errorRes = x.responseText;
                        var code = JSON.parse(errorRes).code;
                        if (code === 1009) {
                            deleteToken();
                        }
                        showFailed(sender);
                    }
                }

            };
            x.open('POST', addNoteURL, false);
            x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            x.send(params);
        });
    } else {
        showFailed(sender);
    }
}

function loadNotecards(notebookid, tabid) {
    // chrome.storage.local.get(["authtoken"], function(item) {
    //     var authtoken = item.authtoken;
    //     if (typeof authtoken !== "undefined") {
    //         var url = notebook_server + "/api/v1/notebooks/" + notebookid + "/notecards?authtoken=" + authtoken + "&sort_column=-Notecard.LastModifiedTime";
    //         var x = new XMLHttpRequest();
    //         x.onreadystatechange = function() {
    //             if (x.readyState === 4) {
    //                 if (x.status === 200) {
    //                     books = [];
    //                     bookids = [];
    //                     var response = x.responseText;
    //                     var responseJSON = JSON.parse(response);
    //                     if (responseJSON !== null) {
    //                         var notecards = responseJSON.notecards;
    //                         chrome.tabs.sendMessage(tabid, {action: "loadNotecards", notecards: notecards}, function(response) {});
    //                     } else {
    //                         chrome.tabs.sendMessage(tabid, {action: "loadNotecards", notecards: [], error: "Error while retrieveing notecards. Please try after some time."}, function(response) {});
    //                     }
    //                 }
    //             }
    //         };
    //         x.open('GET', url, false);
    //         x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //         x.send();
    //     }
    // });
}

function loadNotecard(notebookid, tabid, notecardid) {
    // chrome.storage.local.get(["authtoken"], function(item) {
    //     var authtoken = item.authtoken;
    //     if (typeof authtoken !== "undefined") {
    //         var url = notebook_server + "/api/v1/notebooks/" + notebookid + "/notecards/" + notecardid + "?authtoken=" + authtoken;
    //         var x = new XMLHttpRequest();
    //         x.onreadystatechange = function() {
    //             if (x.readyState === 4) {
    //                 if (x.status === 200) {
    //                     var response = x.responseText;
    //                     if (response !== null) {
    //                         chrome.tabs.sendMessage(tabid, {action: "loadNotecard", notecard: response, notebookid:notebookid, notecardid:notecardid, authtoken:authtoken}, function(response) {});
    //                     } else {
    //                         chrome.tabs.sendMessage(tabid, {action: "loadNotecard", notecard: {}, notebookid:notebookid, notecardid:notecardid, authtoken:authtoken, error: "Error while retrieveing notecards. Please try after some time."}, function(response) {});
    //                     }
    //                 }
    //             }
    //         };
    //         x.open('GET', url, false);
    //         x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //         x.send();
    //     }
    // });
}