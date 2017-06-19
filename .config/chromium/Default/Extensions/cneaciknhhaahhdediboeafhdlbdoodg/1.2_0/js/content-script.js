var notebook_server = "https://notebook.zoho.com";
var accounts_server = "https://accounts.zoho.com";
var caretPosition = -1;
var colorclicked;
chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.method === "getHTML") {
                var document1 = document.cloneNode(true);
                var innerHTML = document1.body.innerHTML;
                innerHTML = innerHTML.substr(0, innerHTML.indexOf("notebook-widget-cx")) + innerHTML.substr(innerHTML.indexOf("'notebookcx'>"));
                innerHTML = innerHTML.replace("<:>", "");
                sendResponse({data: innerHTML, method: "getHTML"});
            } else if (request.method === "getSimpifiedHTML") {
                sendResponse({data: readableHTML(document.cloneNode(document), document.location), method: "getSimpifiedHTML"});
            } else if (request.method === "getText") {
                sendResponse({data: document.body.innerText, method: "getText"});
            } else if (request.method === 'isMainDivLodaded') {
                var elm = document.getElementById("notebookcx");
                if(elm !== undefined && elm !== 'undefined' && elm !== null && elm !== 'null') {
                    var display = document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.display;
                    var display1 = document.getElementById("notebookcx").contentWindow.document.getElementById("saveLoader").style.display;
                    sendResponse({data1: display, data2:display1, method: "isMainDivLodaded"});
                } else {
                    sendResponse({data1: "", data2:"", method: "isMainDivLodaded"});
                }
            }
        }
);

function showInfo() {
    document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("optionsTable").style.top = "220px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.top = "170px";
}

function hideVideoLink1() {
    chrome.storage.local.set({
        "hideVideo": 'yes'
    });
    document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo1").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("signinextn-button").style.marginTop = "250px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("signinextn-message").style.top = "110px";
   }

function hideVideoLink() {
    chrome.storage.local.set({
        "hideVideo": 'yes'
    });
    document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("optionsTable").style.top = "130px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.top = "0px";
    }

function onNotebookcxLoad(from) {
    if (document.getElementById("notebookcx") !== undefined && document.getElementById("notebookcx") !== 'null' && document.getElementById("notebookcx") !== null && document.getElementById("notebookcx") !== 'undefined') {
        if (from !== null && from !== undefined && from === 'fromrightclick') {
            document.getElementById("notebookcx").style.display = "none";
        }
        chrome.storage.local.get(["authtoken", "hideVideo"], function(item) {
            var authtoken = item.authtoken;
            var hideVideo = item.hideVideo;
            if (typeof authtoken !== "undefined") {
                addVideo();
                document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.display = "none";
                document.getElementById("notebookcx").contentWindow.document.getElementById("optionsTable").style.display = "";
                if(document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackContainer").style.display === "none" && document.getElementById("notebookcx").contentWindow.document.getElementById("downloadAppContainer").style.display === "none" && document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display === "none")
                {
                    document.getElementById("notebookcx").contentWindow.document.getElementById("icondiv").style.display = "";
                }
                document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.display = "";
                chrome.runtime.sendMessage({action: "loadNotebooks"});
                var selectedContent = window.getSelection();
                selectedContent = getSelectionHtml(selectedContent);
                if (selectedContent.trim() !== "" && selectedContent.trim().length > 0) {
                    addtextnote(true);
                    var title = document.title;
                    document.getElementById("notebookcx").contentWindow.document.getElementById("title").value = title;
                    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = selectedContent + "<br/><br/>";
                }
                document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").style.display = "";
                
                //When user is logged in, sign out option should be shown
                document.getElementById("notebookcx").contentWindow.document.getElementById("settingsSignout").style.display = "";
            } else {
                if(document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackContainer").style.display === "none" && document.getElementById("notebookcx").contentWindow.document.getElementById("downloadAppContainer").style.display === "none")
                {
                    document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.display = "";
                    document.getElementById("notebookcx").contentWindow.document.getElementById("bottomhalf").style.display = "";
                }
                document.getElementById("notebookcx").contentWindow.document.getElementById("optionsTable").style.display = "none";
                document.getElementById("notebookcx").contentWindow.document.getElementById("icondiv").style.display = "none";
                document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.display = "none";
                document.getElementById("notebookcx").contentWindow.document.getElementById("editorhalf").style.display = "none";
                // document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.top = "170px";
                
                //When accounts login is shown signout option should not be shown in settings
                document.getElementById("notebookcx").contentWindow.document.getElementById("settingsSignout").style.display = "none";
                addVideo();
            }
        });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "hello") {
        sendResponse({message: "hi"});
    }
    if (document.getElementById("notebookcx") !== undefined && document.getElementById("notebookcx") !== 'null' && document.getElementById("notebookcx") !== null && document.getElementById("notebookcx") !== 'undefined') {
        if (request.action === 'loadNotebooks') {
            var notebooks = request.notebooks;
            var notebooksNode = document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks");
            // while (notebooksNode.firstChild) {
            //     notebooksNode.removeChild(notebooksNode.firstChild);
            // }
            // document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").innerHTML = "";
            // console.log(notebooksNode);
            // document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").innerHTML = '<div style="background-color: black;height: 30px;vertical-align: middle;text-align: center;color: white;padding-top: 15px;">Notebooks</div>';
            chrome.storage.local.get(["defNotebookId", "selectedNotebookid"], function(item) {
                
                document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").innerHTML = "";
                var defNotebookid = item.defNotebookId;
                var selNotebookid = item.selectedNotebookid;
                // console.log("inside load notebook message");
                // console.log(defNotebookid);
                // console.log(selNotebookid);
                if(selNotebookid === null || selNotebookid === undefined || isBookDeleted(request.notebookids, selNotebookid)) {
                    selNotebookid = defNotebookid;
                }
                if (notebooks === null || notebooks === undefined) {
                    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooklistInner").style.display = "none";
                } else {
                    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooklistInner").style.display = "";
                    for (var i = 0; i < notebooks.length; i++) {
                        var a = document.createElement("a");
                        a.href = "javascript:void(0)";
                        a.id = request.notebookids[i];
                        a.appendChild(document.createTextNode(notebooks[i]));
                        if(selNotebookid === undefined) {
                            selNotebookid = request.notebookids[i];
                        }
                        if(request.notebookids[i] === selNotebookid) {
                            document.getElementById("notebookcx").contentWindow.document.getElementById("notebookname").innerHTML = request.notebooks[i];
                            document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").setAttribute("nid", selNotebookid);
                            chrome.runtime.sendMessage({action: "loadNotecards", notebookid:selNotebookid});
                        }

                        document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").appendChild(a);
                        assignBookSelectEvent(request, i);
                    }
                    document.getElementById("notebookcx").contentWindow.document.getElementById("downarrow").style.display= "";
                }
            });
        } else if (request.action === "showProgressBar") {
            document.getElementById("notebookcx").contentWindow.document.getElementById("titleNameDisplay").style.backgroundColor="#9ACB91";
            document.getElementById("notebookcx").contentWindow.document.getElementById("titleNameDisplay").style.width = request.width + "%";
        } else if (request.action === "clipLink") {
            getSimplifiedArticle(request.tabid, request.mainDocumentElement);
        } else if (request.action === "webpage") {
            getFullArticle(request.tabid);
        } else if (request.action === "screenshot") {
            getPageScreenshot(request.tabid);
        } else if (request.action === "screenshot1") {
            getPageScreenshot1(request.tabid, request.image);
        } else if (request.action === "closeMain") {
            clearTabData(request.tabid, request.shouldClose);
        } else if (request.action === "loadNotecards") {
            loadNotecards(request);
        } else if (request.action === "loadNotecard") {
            loadNotecard(request);
        } else if (request.action === 'showNewNote') {
            showNewNote(sender.tab.id);
        } else if (request.action === "feedbackScreenshot") {
            getFeedbackScreenshot(request.tabid, request.image);
        }
    }
});

function isBookDeleted(bookIds, id) {
    if(typeof bookIds === 'undefined' || bookIds === null) {
        return false;
    }
        
    for(var i = 0; i < bookIds.length; i++) {
        if(bookIds[i] === id) {
            return false;
        }
    }
    return true;
}

function assignBookSelectEvent(request, notebookIndex) {
    document.getElementById("notebookcx").contentWindow.document.getElementById(request.notebookids[notebookIndex]).onclick = function() {
        changeNotebook(request.notebookids[notebookIndex], request.notebooks[notebookIndex]);
    };
}

function changeNotebook(notebookid, notebookname) {
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookname").innerHTML = notebookname;
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").setAttribute("nid", notebookid);
    chrome.runtime.sendMessage({action: "loadNotecards", notebookid:notebookid});
    chrome.storage.local.set({
        "selectedNotebookid": notebookid,
        "selectedNotebookname": notebookname
    });
}

function getSelectionHtml(sel) {
    var html = sel.toString();
    if (sel.rangeCount) {
        var container = document.createElement("div");
        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
        }
        html = removeStyles(container);
    }
    return html;
}

function removeStyles(container) {
    if (container.childNodes.length > 0) {
        for (var i = container.childNodes.length - 1; i >= 0; i--) {
            removeStyle(container.childNodes[i]);
        };
    }
    return container.innerHTML;
}

function removeStyle(node) {
    for (var i = node.childNodes.length - 1; i >= 0; i--) {
        node.childNodes[i].style = "";
        if (node.childNodes[i].childNodes.length > 0) {
            removeStyle(node.childNodes[i]);
        }
    }
    node.style = "";
}

function readableHTML(documentClone, loc, tabid) {
    // var url = loc.href;
    // var readabilityURL = "https://www.readability.com/api/content/v1/parser?url=" + url + "/&token=c08ef873e8fd647a743a4035369ce380d53245b1";
    // var x = new XMLHttpRequest();
    // x.onreadystatechange = function() {
    //     if (x.readyState === 4) {
    //         if (x.status === 200) {
    //             var profileRes = x.responseText;
    //             var noteRes = JSON.parse(profileRes);
    //             var content = noteRes.content;
    //             if (content === null || content === undefined) {
    //                 document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
    //                 document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "We're sorry! Notebook could not clean the article now. Please try after some time.";
    //                 document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
    //                 setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);
    //             } else {
    //                 changeBody("<article>" + content + "</article>", tabid, noteRes.title);
    //             }
    //         } else {
    //             document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
    //             document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "We're sorry! Notebook could not clean the article now. Please try after some time.";
    //             document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
    //             setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);
    //         }
    //     }
    // };
    // x.open('GET', readabilityURL, true);
    // x.send(null);

    var uri = {
        spec: loc.href,
        host: loc.host,
        prePath: loc.protocol + "//" + loc.host,
        scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
        pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
    };
    if (documentClone.getElementById("notebookcx") !== null && documentClone.getElementById("notebookcx") !== undefined) {
        documentClone.body.removeChild(documentClone.getElementById("notebookcx"));
    }
    var article = new Readability(uri, documentClone).parse();
    if (article === null || article === undefined) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "We're sorry! Notebook could not clean the article now. Please try after some time.";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);
    } else {
        var content = article.content;
        changeBody("<article>" + content + "</article>", tabid, article.title);
    }
}

function clipLink() {
    chrome.runtime.sendMessage({action: "getSimplifiedArticle", mainDocumentElement:document.documentElement.innerHTML});
}

function getSimplifiedArticle(tabid, documentElement) {
    chrome.storage.local.set({
        "saveNCType": "text",
        "saveClipType": "simplifiedarticle"
    });
    var parser1 = new DOMParser();
    var xmlDoc1 = parser1.parseFromString(documentElement,"text/html");
    readableHTML(xmlDoc1, document.location, tabid);
}

function changeBody(innerHTML1, tabid, title) {
    if (document.getElementById("notebookcleanviewcx") !== null && document.getElementById("notebookcleanviewcx") !== undefined)  {
        return;
    }
    /* convert inages and a to our own style */
    var parser1 = new DOMParser();
    var xmlDoc1 = parser1.parseFromString(innerHTML1,"text/html");
    var imgs = xmlDoc1.getElementsByTagName("img");
    for (var i = imgs.length - 1; i >= 0; i--) {
        imgs[i].style.maxWidth = "100%";
    }
    var as = xmlDoc1.getElementsByTagName("a");
    for (var i = as.length - 1; i >= 0; i--) {
        as[i].style.textDecoration = "none";
        as[i].style.color = "#55AFD5";
    }
    innerHTML1 = xmlDoc1.documentElement.innerHTML;

    /* hide neccessary cx elements and body */
    var style = document.createElement("style");
    style.id = "notebookclippedcontentvisible";
    style.innerHTML = ".notebookclippedcontentvisible{background-color:#F3F3F2}";
    document.head.appendChild(style);
    document.documentElement.className += " notebookclippedcontentvisible";
    document.body.className += " notebookclippedcontentvisible";

    var notebookcx = document.getElementById("notebookcx");
    // notebookcx.shadowRoot.getElementById("colorPickerImage").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPickerImage").style.display = "none";
    notebookcx.style.display = "none";
    document.body.style.display = "none";
    document.title = title;

    var _this = {};
    _this.nccx = document.createElement(":notebook-cleanview-cx:");
    $(_this.nccx).attr("id", "notebookcleanviewcx");
    $(_this.nccx).attr("class", "notebookcleanviewcx");

    _this.root = _this.nccx.createShadowRoot({mode: 'close'});

    var clippedData = "<style>.clipperClickedContent{line-height: 1.75em;font-family: Charter;font-size: 20px;background-color: white;width: 50%;position: relative;z-index: 9999999;top: 0;margin-left: 20%;padding-left: 5%;padding-right: 5%;padding-top: 5%;padding-bottom: 5%;}";
    clippedData += ".savetonotebook{width:250px;height: 100%;position: fixed;z-index: 9999999;bottom: 10px;right: 20px;background-color: transparent;display: flex;flex-direction: column;}</style>";
    clippedData += "<div id='clipperClickedContent' class='clipperClickedContent'><div style='padding-bottom: 20px;font-family: \"Source Sans Pro\";font-weight: 900;font-style: normal;font-size: 40px;margin-left: -2.5px;line-height: 1.04;letter-spacing: -.028em;color: rgba(0,0,0,.8);' id='titleClipperNotebook'>" + title + "</div>" + innerHTML1 + "</div>";
    clippedData += '<div id="savetonotebook" class="savetonotebook"><div style="position:absolute;top:20px;right:10px;cursor:pointer;" id="closeArticleNotebookcx"><img src="' + chrome.extension.getURL("images/close.png") + '" style="max-width: 30px;vertical-align: middle;"></div><div style="position:absolute;bottom:20px;right:20px;cursor:pointer;" id="savetonotebookbutton"><img src="' + chrome.extension.getURL("images/savetonotebook.png") + '" style="max-height: 35px;vertical-align: middle;"></div><div id="errorMessage" style="position: absolute;top: 80px;text-align: center;width: 0px;height: 40px;line-height:40px;font-family: \'Source Sans Pro\';font-size: 14px;color: white;transition: 0.5s;overflow: hidden;right:0px;"></div></div>';
    $(_this.root).html(clippedData);
    document.documentElement.appendChild(_this.nccx);
    document.body.scrollTop = "0px";
    /* create on click elements and actions */
    document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("closeArticleNotebookcx").onclick = function() {
        var className = document.documentElement.className;
        if(className !== null && className !== undefined && className.indexOf("notebookclippedcontentvisible") !== -1) {
            className = className.replace("notebookclippedcontentvisible", "");
        }
        document.documentElement.className = className;
        className = document.body.className;
        if(className !== null && className !== undefined && className.indexOf("notebookclippedcontentvisible") !== -1) {
            className = className.replace("notebookclippedcontentvisible", "");
        }
        document.body.className = className;
        var styles = document.head.getElementsByTagName("style");
        for(var j=0;j<styles.length;j++) {
            if(styles[j].id === "notebookclippedcontentvisible") {
                document.head.getElementsByTagName("style")[j].parentNode.removeChild(document.head.getElementsByTagName("style")[j]);
            }
        }
        closeMessage();
    };
    document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("savetonotebookbutton").onclick = function() {
        saveContentToServer(tabid, document.URL);
    };

    chrome.storage.local.get("authtoken", function(item) {
        var authtoken = item.authtoken;
        if (typeof authtoken === "undefined" || authtoken === null) {
            document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("savetonotebookbutton").style.display = "none";
        }
    });
}

function savepagelink() {
    addtextnote(true);
    changeIconSize(true, "textnote");
    chrome.runtime.sendMessage({action: "savePageLink"});
    chrome.storage.local.set({
        "saveNCType": "text",
        "saveClipType": "pagelink"
    });
}

function closeNotebookandColor() {
    if (document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display !== 'none') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    }
    if (document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom !== '-85px') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.height = "-85px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    }
}

function focusMainContent() {
    s = window.getSelection();
    r = document.createRange();
    var deleteContent = false;
    var p = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent");
    if (p.innerHTML === '') {
        p.innerHTML = '\u00a0';
    }
    r.selectNodeContents(p);
    s.removeAllRanges();
    s.addRange(r);
    document.execCommand('delete', false, null);
}

function savescreenshot() {
    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingsstd").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").insertAdjacentHTML("beforeEnd", '<div id="loadingss1" style="width:100%;text-align: center;max-height: 220px;line-height: 220px;"><img src="' + chrome.extension.getURL("images/loader.gif") + '" style="max-height: 15px;vertical-align:middle;padding-left:10px;text-align:center;" class="invertColor"></div>');
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").scrollTop = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").scrollHeight;
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1").style.display = "";
    document.getElementById("notebookcx").style.display = "none";
    setTimeout(function() {sendbackground();}, 10);
}

function sendbackground() {
    chrome.runtime.sendMessage({action: "captureVisibleTab"});
}

function getPageScreenshot1(tabid, myImage) {
    document.getElementById('notebookcx').style.display = "";
    var notebookcx = document.getElementById("notebookcx");
    chrome.storage.local.set({
        "saveNCType": "photo",
        "saveClipType": "screenshot"
    });
    addphotonote(false);
    document.getElementById("notebookcx").contentWindow.document.getElementById("fakefile").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("draganddropdiv").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingsstd").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1").style.display = "none";

    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1").parentNode.removeChild(document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1"));
    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingsstd").style.display = "none";
    addImageToMainContent(myImage);
}

function getPageScreenshot(tabid) {
    var notebookcx = document.getElementById("notebookcx");
    var canvasImage = document.createElement("canvas");
    var width = document.body.scrollWidth;
    var height = document.body.scrollHeight;
    canvasImage.setAttribute("width", width);
    canvasImage.setAttribute("height", height);
    canvasImage.style.backgroundColor = "white";
    chrome.storage.local.set({
        "saveNCType": "photo",
        "saveClipType": "screenshot"
    });
    addphotonote(false);
    document.getElementById("notebookcx").contentWindow.document.getElementById("fakefile").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("draganddropdiv").style.display = "none";
    html2canvas(document.body, {background :'#FFFFFF',canvas: canvasImage, letterRendering:true}).then(function(canvas) {
        

        // var imageObj = document.createElement("img");
        // imageObj.src = canvas.toDataURL("image/png");
        // imageObj.style.width = width;
        // imageObj.style.height;
        // // document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").appendChild(imageObj);
        // var c = document.createElement("canvas");
        // var ctx = c.getContext("2d");
        // ctx.drawImage(imageObj, window.scrollX, window.scrollY);

        // addImageToMainContent(c.toDataURL("image/png"));

        var context = canvas.getContext('2d');//context from originalCanvas
        var imgData = context.getImageData(window.scrollX, window.scrollY, window.screen.width, window.screen.height);
        // context.clearRect(0, 0, canvas.width, canvas.height);//clear originalCanvas
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = window.screen.width;
        tmpCanvas.height = window.screen.height;
        var context2 = tmpCanvas.getContext('2d');//context from tmpCanvas
        context2.putImageData(imgData,0,0);
        addImageToMainContent(tmpCanvas.toDataURL("image/png"));
        // var tmpCanvas = document.createElement('canvas');
        // tmpCanvas.width = width;
        // tmpCanvas.height = height;
        // var context2 = canvas.getContext('2d');//context from tmpCanvas
        // var imageObj = new Image();
        // imageObj.onload = function() {
        //     //setup: draw cropped image
        //     var sourceX = window.scrollX;
        //     var sourceY = window.scrollY;
        //     var x = width / 4;
        //     var y = height / 4;
        //     context2.drawImage(imageObj, sourceX, sourceY, width, height, 0, 0, width, height);
        //     var data = context2.getImageData(sourceX, sourceY, width, height);

        //     context.clearRect(0, 0, canvas.width, canvas.height);//clear originalCanvas
        //     canvas.width = window.screen.width;
        //     canvas.height = window.screen.height;

        //     context2.putImageData(data,0,0);

        //     //memory!!!
        //     context.clearRect(0, 0,  canvas.width, canvas.height);//clear originalCanvas
        //     context2.clearRect(0, 0, canvas.width, canvas.height);//clear tmpCanvas
        //     data = null;
        //     tmpCanvas = null;
        //     canvas = null;
        //     imageObj = null;
        // };
        // imageObj.src = canvas.toDataURL("image/png");
        // addImageToMainContent(imageObj.src);
        document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1").parentNode.removeChild(document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1"));
        document.getElementById("notebookcx").contentWindow.document.getElementById("loadingsstd").style.display = "none";
    });
}

function cancelContent() {
    chrome.runtime.sendMessage({action: "clearTabData"});
}

function saveContentToServer(tabid, url) {
    if(!navigator.onLine) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "No internet connection available to add note in Notebook";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        if(document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage") !== null && document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage") !== undefined) {
            document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").innerHTML = "No internet connection available to add note in Notebook";
            document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.width = "250px";
            document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.backgroundColor = "black";
        }
        return;
    }
    chrome.storage.local.get(["saveClipType", "saveNCType"], function(item) {
        var saveClipType = item.saveClipType;
        var clipperContent = document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("clipperClickedContent");
        var saveData = "";
        if(clipperContent !== null && clipperContent !== undefined) {
            saveData = clipperContent.innerHTML;
        } else if(saveClipType === "fullarticle") {
             saveData = document.all[0].innerHTML;
        }
        if(saveData.trim() !== "") {
            if(saveData.indexOf("notebook-widget-cx") !== -1) {
                saveData = saveData.substr(0, saveData.indexOf("notebook-widget-cx")) + saveData.substr(saveData.indexOf("'notebookcx'>"));
                saveData = saveData.replace("<:>", "");
            }
            var parser1 = new DOMParser();
            var xmlDoc1 = parser1.parseFromString(saveData,"text/html");
            if (xmlDoc1.getElementById("titleClipperNotebook") !== null && xmlDoc1.getElementById("titleClipperNotebook") !== undefined) {
                xmlDoc1.getElementById("titleClipperNotebook").parentNode.removeChild(xmlDoc1.getElementById("titleClipperNotebook"));
            }
            saveData = xmlDoc1.documentElement.innerHTML;
            if(saveData.trim() !== "") {
                var title = document.title;
                if(title === 'Untitled') {
                    title = '';
                }
                if (url !== undefined && url !== null && url !== '') {
                    saveData += "<br/><a href='" + url + "'>" + url + "</a><br/>";
                }
                var notebookid = document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").getAttribute("nid");
                var color = "#ffffff";
                document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "Adding Note...";
                document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
                document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
                if(document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage") !== null && document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage") !== undefined) {
                    document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").innerHTML = "Adding Note...";
                    document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.width = "250px";
                    document.getElementById("notebookcleanviewcx").shadowRoot.getElementById("errorMessage").style.backgroundColor = "black";
                }
                if(item.saveNCType === "text") {
                    chrome.runtime.sendMessage({action: "sanitizeAndSaveTextNote", title:title, content:saveData, color:color, notebookid:notebookid});
                    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
                } else if (item.saveNCType === "photo") {
                    var imgSrcs = document.getElementById("notebookcx").contentWindow.document.getElementById("clipperClickedContent").getElementsByTagName("img");
                    var content = [];
                    for(var i=0;i<imgSrcs.length;i++) {
                        content.push(imgSrcs[i].src);
                    }
                    chrome.runtime.sendMessage({action: "saveImageNote", title:title, content:content, color:color, notebookid:notebookid});
                    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
                }
            }
        }
    });
}

function saveContent() {
    saveContentToServer(false);
}

function save() {
    if(!navigator.onLine) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "No internet connection available to add note in Notebook";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        return;
    }
    var title = document.getElementById("notebookcx").contentWindow.document.getElementById("title").value;
    if(title === '') {
        title = "Untitled";
    }
    
    chrome.storage.local.get("saveNCType", function(item) {
        if(title === 'Untitled') {
            title = '';
        }
        var notebookid = document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").getAttribute("nid");
        var color = document.getElementById("notebookcx").contentWindow.document.getElementById("color").style.backgroundColor; 
        if(color === '') {
            color = "#ffffff";
        }
        if(color.indexOf("rgb") !== -1) {
            var color1 = color.substring(color.indexOf("(")+1, color.indexOf(")"));
            var color2 = color1.split(",");
            color = rgbToHex(color2[0], color2[1], color2[2]);
        }
        showHome();
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "Adding Note...";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        // showNewNote(document.getElementById("notebookcx").contentWindow.document.getElementById("title").value, document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML, notebookid, color);
        var content = "";
        if(item.saveNCType === "stext") {
            content = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML;
            chrome.runtime.sendMessage({action: "sanitizeAndSaveTextNote", title:title, content:content, color:color, notebookid:notebookid});
            document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
            chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.ADD,analyticsLabel:ANALYTICS_LABEL.TEXT_CARD});
        }  else if(item.saveNCType === "text") {
            content = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML;
            chrome.runtime.sendMessage({action: "saveTextNote", title:title, content:content, color:color, notebookid:notebookid});
            document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
            chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.ADD,analyticsLabel:ANALYTICS_LABEL.CLEAN_VIEW});
        } else if(item.saveNCType === "photo") {
            var imgSrcs = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").getElementsByTagName("img");
            var content = [];
            for(var i=0;i<imgSrcs.length;i++) {
                if(imgSrcs[i].id !== null && imgSrcs[i].id.indexOf("cxremoveimage") !== -1) {
                    continue;
                }
                content.push(imgSrcs[i].src);
            }
            chrome.runtime.sendMessage({action: "saveImageNote", title:title, content:content, color:color, notebookid:notebookid});
            chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.ADD,analyticsLabel:ANALYTICS_LABEL.PHOTO_CARD});
            document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
        } else if(item.saveNCType === "checklist") {
            var checkboxes = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").getElementsByTagName("checkbox");
            var content;
            for(var i=0;i<checkboxes.length;i++) {
                var checkbox = checkboxes[i];
                var inputs = checkbox.getElementsByTagName("input");
                if(inputs !== null && inputs !== undefined && inputs.length > 0) {
                    var input = inputs[0];
                    content += "<div><checkbox checked='" + input.checked  + "'>" + checkbox.innerText.replace(/&nbsp;/g, "") + "</checkbox></div>";
                }
            }
            chrome.runtime.sendMessage({action: "saveChecklistNote", title:title, content:content, color:color, notebookid:notebookid});
            document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
        } else if(item.saveNCType === "audio") {
            var audioSrc = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").getElementsByTagName("audio");
            var content;;
            if(audioSrc.length > 0) {
                content = audioSrc[0].getElementsByTagName("source")[0].src;
                var type = audioSrc[0].getElementsByTagName("source")[0].type;
                var subtype = type.substring(type.indexOf("/") + 1, type.length);
                if(subtype.indexOf("-") !== -1) {
                    subtype = subtype.substring(subtype.lastIndexOf("-") + 1, subtype.length);
                }
                chrome.storage.local.set({
                    "audioFileName": "audio." + subtype
                });
                chrome.runtime.sendMessage({action: "saveAudioNote", title:title, content:content, color:color, notebookid:notebookid});
                document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
            }
        }
    });
}

function rgbToHex(red, green, blue) {
    var rgb = blue | (green << 8) | (red << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1);
}

function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}
function changeBGColor(color) {
    changeColor(color, true);
}

function changeColor(color, showPallete) {
    var color1 = document.getElementById("notebookcx").contentWindow.document.getElementById("clippedContent").style.backgroundColor;
    if(color1.indexOf("rgb") !== -1) {
        var color2 = color1.substring(color1.indexOf("(")+1, color1.indexOf(")"));
        var color3 = color2.split(",");
        color1 = rgbToHex(color3[0], color3[1], color3[2]);
    }
    if (document.getElementById("notebookcx").contentWindow.document.getElementById(color1.toUpperCase()) !== null && document.getElementById("notebookcx").contentWindow.document.getElementById(color1.toUpperCase()) !== undefined) {
        document.getElementById("notebookcx").contentWindow.document.getElementById(color1.toUpperCase()).innerHTML = "";
    }
    var origColor = color;
    if (color.indexOf("rgb") !== -1) {
        var color4 = color.substring(color.indexOf("(")+1, color.indexOf(")"));
        var color5 = color4.split(",");
        color = "rgba(" + color5[0] + "," + color5[1] + "," + color5[2] + ", 0.8)";
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("color").style.backgroundColor = origColor;
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.backgroundColor = origColor;
    document.getElementById("notebookcx").contentWindow.document.getElementById("clippedContent").style.backgroundColor = color;
    document.getElementById("notebookcx").contentWindow.document.getElementById("titleTable").style.backgroundColor = color;
    var src = chrome.extension.getURL("images/checked.png");
    color = document.getElementById("notebookcx").contentWindow.document.getElementById("clippedContent").style.backgroundColor;
    if(color.indexOf("rgb") !== -1) {
        var color1 = color.substring(color.indexOf("(")+1, color.indexOf(")"));
        var color2 = color1.split(",");
        color = rgbToHex(color2[0], color2[1], color2[2]);
        var hexValue = color;
    }
    if(colorclicked === "yes"){
           chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.COLOR_PICKER, analyticsAction:ANALYTICS_ACTION.SHOW,analyticsLabel:hexValue});
            colorclicked = "no";
    }
    if (document.getElementById("notebookcx").contentWindow.document.getElementById(color.toUpperCase()) !== null && document.getElementById("notebookcx").contentWindow.document.getElementById(color.toUpperCase()) !== undefined) {
        document.getElementById("notebookcx").contentWindow.document.getElementById(color.toUpperCase()).innerHTML = '<img src="' + src + '" style="max-width:20px;padding-top: 5px;display:initial;pointer-events: none;">';
    }
    changeFontColor();
    if(showPallete) {
        showColorPallete(); 
    }
}

function showColorPallete(event) {
    if (event !== undefined && event !== null) {
        event.stopPropagation();
    }
    if(document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display !== "none") {
        document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    }
    if(document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom === "-85px" || document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom === "") {
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.opacity = "0";
        setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "85px";}, 100);
        setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.opacity="1";}, 200);
        var src = chrome.extension.getURL("images/checked.png");
        var color = document.getElementById("notebookcx").contentWindow.document.getElementById("clippedContent").style.backgroundColor;
        if(color.indexOf("rgb") !== -1) {
            var color1 = color.substring(color.indexOf("(")+1, color.indexOf(")"));
            var color2 = color1.split(",");
            color = rgbToHex(color2[0], color2[1], color2[2]);
        }
        document.getElementById("notebookcx").contentWindow.document.getElementById(color.toUpperCase()).innerHTML = '<img src="' + src + '" style="max-width:20px;padding-top: 5px;display:initial;pointer-events: none;">';
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    }
}

function luminanace(r, g, b) {
    var a = [r,g,b].map(function(v) {
        v /= 255;
        return (v <= 0.03928) ?
            v / 12.92 :
            Math.pow( ((v+0.055)/1.055), 2.4 );
        });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function authtokenChanged() {
    chrome.storage.local.get("checksignin", function(item) {
         if(item.checksignin === "need login")  {
            signin();
         } else if(item.checksignin === "loggedin") {
             onNotebookcxLoad();
         }
    });
}

function titleEvent(e) {
    e.stopPropagation();
}

function signin() {
    // chrome.runtime.sendMessage({action: "getloginstatus",checksignin:true});
    // chrome.storage.local.set({
    //     "signinclicked": "true"
    // });
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").style.display = "";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").style.width = "600px";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").style.height = "625px";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.display = "none";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").innerHTML = '<embed width="100%" height="100%" src="https://accounts.zoho.com/login?newtheme=true&servicename=Notebook">';
    window.open("https://accounts.zoho.com/?serviceurl=https://notebook.zoho.com/");
}

function signup() {
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").style.display = "";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").style.width = "600px";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").style.height = "625px";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.display = "none";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("loginPage").innerHTML = '<embed width="100%" height="100%" src="https://notebook.zoho.com/signup.do">';
    window.open("https://notebook.zoho.com/signup.do");
}

function showHome(clearContent) {
    changeIconSize(true, "home");
    if (clearContent) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.top += "50px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.position = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.bottom = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("tophalf").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("bottomhalf").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("editorhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackContainer").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("downloadAppContainer").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsMenuDropDown").style.display = "none";

    chrome.storage.local.get(["authtoken", "hideVideo"], function(item) {
            var authtoken = item.authtoken;
            if (typeof authtoken !== "undefined") {
                document.getElementById("notebookcx").contentWindow.document.getElementById("icondiv").style.display = "";
            }
    });
    
    
}

function addtextnote(notfocus) {
    if (document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML !== "") {
        return;
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
    editorActions("true");
    document.getElementById("notebookcx").contentWindow.document.getElementById("title").value = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").contentEditable = "true";
    changeIconSize(true, "textnote");
    chrome.storage.local.set({
        "saveNCType": "stext"
    });
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.position = "absolute";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.bottom = "50px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display = "none";
    if (!notfocus) {
        focusMainContent();
    }
}

function addphotonote(deleteContent) {
    document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("title").value = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("fakefile").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("draganddropdiv").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display = "none";
    if (deleteContent) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
    }
    editorActions("false");
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").contentEditable = "false";
    document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").style.display = "";
    changeIconSize(true, "photonote");
    chrome.storage.local.set({
        "saveNCType": "photo"
    });
    changeColor("rgb(0, 0, 0)", false);
    // document.getElementById("notebookcx").contentWindow.document.getElementById("notebooklistInner").appendChild(document.getElementById("notebookcx").contentWindow.document.getElementById('selectedNotebook'));
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.position = "absolute";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.bottom = "50px";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.bottom = "40px";
    // document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.right = "0px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").className = "invertColor";
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").className = "invertColor";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.backgroundColor = "#212121";
    // setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "";}, 500);
}

function changeIconSize(change, id) {
    if(change) {
        if(id === 'photonote') {
            document.getElementById("notebookcx").contentWindow.document.getElementById("hometd").style.backgroundColor = "black";
            document.getElementById("notebookcx").contentWindow.document.getElementById("texttd").style.backgroundColor = "black";
            document.getElementById("notebookcx").contentWindow.document.getElementById("phototd").style.backgroundColor = "green";
        } else if (id === 'textnote') {
            document.getElementById("notebookcx").contentWindow.document.getElementById("hometd").style.backgroundColor = "black";
            document.getElementById("notebookcx").contentWindow.document.getElementById("texttd").style.backgroundColor = "green";
            document.getElementById("notebookcx").contentWindow.document.getElementById("phototd").style.backgroundColor = "black";
        } else {
            document.getElementById("notebookcx").contentWindow.document.getElementById("hometd").style.backgroundColor = "green";
            document.getElementById("notebookcx").contentWindow.document.getElementById("texttd").style.backgroundColor = "black";
            document.getElementById("notebookcx").contentWindow.document.getElementById("phototd").style.backgroundColor = "black";
        }
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("hometd").style.backgroundColor = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("texttd").style.backgroundColor = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("phototd").style.backgroundColor = "black";
    }
}

/* on called key up */
function enterCheckList(e) {
    if (e !== undefined && e !== null) {
        // e.preventDefault();
        e.stopPropagation();
    }
    if(document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML === '') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "";
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    // chrome.runtime.sendMessage({action: "sanitizeContent", data:document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML});
}

function handlePaste (e) {
    var clipboardData, pastedData;
    e.stopPropagation();
    e.preventDefault();
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('text/html');
    if (pastedData === '') {
        pastedData = clipboardData.getData('text');
    }
    var container = document.createElement("div");
    container.innerHTML = pastedData;
    var data = removeStyles(container);
    document.getElementById("notebookcx").contentWindow.document.execCommand('insertHTML', false, data);
}

/* on called key down */
function avoidDiv(e) {
    if (e !== undefined && e !== null) {
        // e.preventDefault();
        e.stopPropagation();
    }
    if(document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML === '') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "";
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
}

function editorActions(showColor) {
    var color = generateRandomHexColorCode();
    if (color.indexOf("#") !== -1) {
        var colorArray = hexToRGBArray(color.substring(1, color.length));
        color = "rgb(" + colorArray[0] + "," + colorArray[1] + "," + colorArray[2] + ")";

    }
    if (showColor === 'false') {
        // document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.padding = "0px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.width = "100%";
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.marginLeft = "0px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebookTable").style.borderColor = "rgba(255,255,255,0.3)";
        document.getElementById("notebookcx").contentWindow.document.getElementById("notebookname").style.color = "white";
        document.getElementById("notebookcx").contentWindow.document.getElementById("downarrow").className = "invertColor";
    } else {
        // document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").style.display = "none";
        document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.width = "300px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.marginLeft = "10px";
        document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebookTable").style.borderColor = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("notebookname").style.color = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("downarrow").className = "";
        changeColor(color, false);
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMain").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("tophalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("bottomhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("editorhalf").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.display = "";
    if (showColor === 'false') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorComponent").style.display = "none";
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorComponent").style.display = "";
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.top = "50px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").className = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").className = "";
    if(document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML === '') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "";
    }
}

function generateRandomHexColorCode() {

    var randomColor = ["#FFFFFF","#DEF58F","#FAD154","#CFC4FF","#F7BFFF","#61D1FF","#85EBD9","#C4FFED","#D9E8F0","#FFED7D","#FFD921","#FF9C00","#FA9959","#B3D9E6","#BAC28A","#D1EBB8","#D1D9C9","#FFDB70","#FFA8B3","#E3E3E3"];
    var rand = Math.floor(Math.random() * randomColor.length);
    return randomColor[rand];

}
-169,-60
function downloadAndAddPhoto() {-253,-74
    var files = document.getElementById("notebookcx").contentWindow.document.getElementById("actualphoto").files;
    for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                addImageToMainContent(e.target.result);
            };
        })(files[i]);
        reader.readAsDataURL(files[i]);
    }
}

function drag_start(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData("text/plain",
    (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
} 
function drag_over(event) { 
    event.preventDefault(); 
    return false; 
} 
function drop(event) { 
    var dm = document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav");
    var x = event.clientX;
    dm.style.left = x + "px";
    if((x - 320) < 0) {
        dm.style.left = '0px';
    } else if (x > (document.body.clientWidth - 320)) {
        dm.style.left = parseInt(document.body.clientWidth - 320) + 'px';
    }
    event.preventDefault();
    return false;
}

function closeMessage() {
    chrome.runtime.sendMessage({action: "closeMain"});
}

function closeAll() {
    chrome.storage.local.set({
        "signinclicked": "false"
    });
    if(document.getElementById("notebookcx") !== null && document.getElementById("notebookcx") !== undefined) {
        setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.opacity = "0";}, 50);
    }
    
    setTimeout(function() {
        var styles = document.head.getElementsByTagName("style");
        for(var j=0;j<styles.length;j++) {
            if(styles[j].id === "notebookcxfontfaces") {
                document.head.getElementsByTagName("style")[j].parentNode.removeChild(document.head.getElementsByTagName("style")[j]);
            }
        }
        var links = document.head.getElementsByTagName("link");
        for(var j=0;j<links.length;j++) {
            if(links[j].id === "notebookcxsansfont") {
                document.head.getElementsByTagName("link")[j].parentNode.removeChild(document.head.getElementsByTagName("link")[j]);
            }
        }
    }, 300);
    setTimeout(function() {
        if (document.getElementById("notebookcx") != null && document.getElementById("notebookcx") !== undefined) {
            document.getElementById("notebookcx").parentNode.removeChild(document.getElementById("notebookcx"));
        }
    }, 500);
}

function clearTabData(tabid, shouldClose) {
    var notebookcx = document.getElementById("notebookcx");
    document.body.style.display = "";
    if (document.getElementById("notebookcleanviewcx") !== null && document.getElementById("notebookcleanviewcx") !== undefined) {
        document.documentElement.removeChild(document.getElementById("notebookcleanviewcx"));
    }
    if(shouldClose) {
        chrome.runtime.sendMessage({action: "setIcon"});
        closeAll();
    }
}

function changeFontColor() {
    var color = document.getElementById("notebookcx").contentWindow.document.getElementById("clippedContent").style.backgroundColor;
    var color1 = color.substring(color.indexOf("(")+1, color.indexOf(")"));
    var color2 = color1.split(",");
    if((luminanace(255, 255, 255) + 0.05) / (luminanace(parseInt(color2[0]), parseInt(color2[1]), parseInt(color2[2])) + 0.05) > 4) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.color = "white";
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPickerImage").className = "invertColor";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").className = "invertColor";
        document.getElementById("notebookcx").contentWindow.document.getElementById("title").className = "titleText invertColor formInvalid";
        document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").className = "fileinputs invertColor";
        // document.getElementById("notebookcx").contentWindow.document.getElementById("downarrow").className = " invertColor";
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").style.color = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").className = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("title").className = "titleText formInvalid";
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPickerImage").className = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").className = "fileinputs";
        // document.getElementById("notebookcx").contentWindow.document.getElementById("downarrow").className = "";
    }
}

function contrastingColor(color) {
    return (luma(color) >= 165) ? '000' : 'fff';
}

// color can be a hx string or an array of RGB values 0-255
function luma(color) {
    var rgb = (typeof color === 'string') ? hexToRGBArray(color) : color;
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
}

function hexToRGBArray(color) {
    if (color.length === 3)
        color = color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2);
    else if (color.length !== 6)
        throw('Invalid hex color: ' + color);
    var rgb = [];
    for (var i = 0; i <= 2; i++)
        rgb[i] = parseInt(color.substr(i * 2, 2), 16);
    return rgb;
}

function showNotebooks(event) {
    if (event !== undefined && event !== null) {
        event.stopPropagation();
    }
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.bottom = "-85px";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.display = "none";
    if(document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display === "none") {
        if (document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").childNodes.length === 0) {
            chrome.runtime.sendMessage({action: "loadNotebooks"});
        }
        setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "block";}, 100);
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("notebooks").style.display = "none";
    }
}

function deleteDiv(id) {
    var divparent = document.getElementById("notebookcx").contentWindow.document.getElementById(id).parentNode.parentNode;
    divparent.parentNode.removeChild(divparent);
    chrome.storage.local.get("saveNCType", function(item) {
        if (item.saveNCType === 'photo') {
            if(document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML === '' || document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").length === 0) {
                document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").style.display = "";
                document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").style.display = "";
                document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
            }
        }
    });
}

function addImageToMainContent(dataURI, imageURL) {
    var length = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").getElementsByTagName("img").length;
    if (length < 20) {
        var div = document.createElement("div");
        if(!imageURL) {
            var img = document.createElement("img");
            img.src = dataURI;
            img.style.maxWidth="300px";
            img.style.maxHeight="200px";
            img.style.display="block";
            img.style.marginLeft = "auto";
            img.style.marginRight = "auto";
            div.appendChild(img);
        } else {
            div.insertAdjacentHTML("afterBegin", dataURI);
        }
        div.style.width = "320px";
        div.style.maxHeight = "220px";
        var i = typeof i === 'undefined' ? 1 : i;
        var id = length + i;
        div.id = id + "mainImage";
        div.insertAdjacentHTML("beforeEnd", '<div id="' + id + 'removeDiv" style="position: relative;text-align: center;bottom: 29px;width: 24px;margin-left: auto;margin-right: auto;background-color: rgba(0,0,0,0.8);height:24px;border-radius:12px;line-height:24px;"><img src="' + chrome.extension.getURL("images/icn-trash-light.png") + '" id="' + id + 'cxremoveimage" style="max-width: 18px;vertical-align: middle;cursor:pointer;position:absolute;left:50%;top:50%;margin-left:-9px;margin-top:-10px;"></div>');
        div.appendChild(document.createElement("br"));
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").appendChild(div);
        document.getElementById("notebookcx").contentWindow.document.getElementById(id + "cxremoveimage").onclick = function() {
            deleteDiv(id + "cxremoveimage");
        };
        // document.getElementById("notebookcx").contentWindow.document.getElementById(id + "mainImage").onmouseover = function() {
        //     document.getElementById("notebookcx").contentWindow.document.getElementById(id + "removeDiv").style.display = "";
        // };
        // document.getElementById("notebookcx").contentWindow.document.getElementById(id + "mainImage").onmouseleave = function() {
        //     document.getElementById("notebookcx").contentWindow.document.getElementById(id + "removeDiv").style.display = "none";
        // };
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").scrollTop = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").scrollHeight;
        document.getElementById("notebookcx").contentWindow.document.getElementById("fakefile").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("draganddropdiv").style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("photoinput").style.display = "none";
        if(document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML === '') {
            document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "";
            document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
        } else {
            document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
            document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "";
        }
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "You cannot add more than 10 images to an image card";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_IMAGE, analyticsAction:ANALYTICS_ACTION.IMAGE_NOTE_CREATE_EXCEED_LIMIT ,analyticsLabel:ANALYTICS_LABEL.SIZE_EXCEEDED});
    }
}

function addVideo() {
    if (document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo").innerHTML === '') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo").innerHTML = '<div id="hideVideButton" style="cursor: pointer;position: absolute;top: -12px;right: -20px;z-index: 99999999999999999999;"><img src="' + chrome.extension.getURL("images/close.png") + '" id="logoImage" style="max-width: 20px;vertical-align: top;"></div><object width="100%" height="150" data="https://www.youtube.com/embed/63W9hFEGbG4" style="border:none;" allowfullscreen></object>';
        document.getElementById("notebookcx").contentWindow.document.getElementById("hideVideButton").onclick = function() {
             chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTEBOOK_VIDEO, analyticsAction:ANALYTICS_ACTION.CLOSE,analyticsLabel:ANALYTICS_LABEL.VIDEO_CLOSED});
            hideVideoLink();
        };
    }
    if (document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo1").innerHTML === '') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo1").innerHTML = '<div id="hideVideButton1" style="cursor: pointer;position: absolute;top: -12px;right: -20px;z-index: 99999999999999999999;"><img src="' + chrome.extension.getURL("images/close.png") + '" id="logoImage" style="max-width: 20px;vertical-align: top;"></div><object width="100%" height="150" data="https://www.youtube.com/embed/63W9hFEGbG4" style="border:none;" allowfullscreen></object>';
        document.getElementById("notebookcx").contentWindow.document.getElementById("hideVideButton1").onclick = function() {
             chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTEBOOK_VIDEO, analyticsAction:ANALYTICS_ACTION.CLOSE,analyticsLabel:ANALYTICS_LABEL.VIDEO_CLOSED});
            hideVideoLink1();
        };
    }
    chrome.storage.local.get(["authtoken", "hideVideo"], function(item) {
        var authtoken = item.authtoken;
        if (typeof authtoken === "undefined" || authtoken === null) {
            document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo").style.display = "none";
            document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo1").style.display = "";
            document.getElementById("notebookcx").contentWindow.document.getElementById("signinextn-button").style.marginTop = "300px";
            document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.top = "0px";
            document.getElementById("notebookcx").contentWindow.document.getElementById("signinextn-message").style.top = "50px";
        } else {
            document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo1").style.display = "none";
            document.getElementById("notebookcx").contentWindow.document.getElementById("helpVideo").style.display = "";
            document.getElementById("notebookcx").contentWindow.document.getElementById("optionsTable").style.top = "220px";
            document.getElementById("notebookcx").contentWindow.document.getElementById("account").style.top = "170px";
        }
        if (item.hideVideo === 'yes') {
        // if (true) {
            hideVideoLink1();
            hideVideoLink();
        }
    });
}

function loadDataFromRightClick(actionid, srcUrl) {
    var notebookcx = document.getElementById('notebookcx');
    if (notebookcx === undefined || notebookcx === null) {
        chrome.runtime.sendMessage({action: "loadMainWindow", from:"fromrightclick"}, function(response) {
            setTimeout(function() {loadData(actionid, srcUrl);}, 1000);
        });
    } else {
        onNotebookcxLoad();
        setTimeout(function() {loadData(actionid, srcUrl);}, 1000);
    }
    
}

function loadData(actionid, srcUrl) {
    if (actionid === 'snapshot') {
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").innerHTML = "";
        savescreenshot();
    } else if (actionid === 'simplified_article') {
        clipLink();
    } else if (actionid === 'bookmark') {
        savepagelink();
        document.getElementById("notebookcx").style.display = "";
    } else if (actionid === 'text_selection') {
        document.getElementById("notebookcx").style.display = "";
    }
}

var handleDrag = function(e) {
    e.stopPropagation();
    e.preventDefault();
};

var handleDrop = function(e) {
    chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_IMAGE, analyticsAction:ANALYTICS_ACTION.DROP});
    e.stopPropagation();
    e.preventDefault();
    x = e.clientX;
    y = e.clientY;
    var filesLength = e.dataTransfer.files.length;
    var length = document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").getElementsByTagName("img").length;
    if(filesLength === 0) {
        var data1 = e.dataTransfer.getData("text/html");
        if(data1 !== '') {
            var parser1 = new DOMParser();
            var xmlDoc1 = parser1.parseFromString(data1,"text/html");
            var imgs = xmlDoc1.getElementsByTagName("img");
            for(var i=0;i<imgs.length;i++) {
                if (imgs[i].src !== undefined && imgs[i].src !== null && imgs[i].src !== '') {
                    var src = imgs[i].src;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', src, true);
                    xhr.responseType = "blob";
                    defineOnloadFunctionForFileDrop(xhr);
                    xhr.send();
                }
            }
        }
    } else {
        for(var i=0;i<filesLength;i++) {
            var file = e.dataTransfer.files[i];
            addFileToMainContent(file);
        }
    }
};

function defineOnloadFunctionForFileDrop(xhr) {
    xhr.onload = function(e) {
        if (this.status === 200) {
            var blob = new Blob([this.response], {type: this.response.type});
            addBlobToMainContent(blob);
        }
    };
}

function addBlobToMainContent(blob) 
{
    var reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = function() {
        var base64data = reader.result;                
        addImageToMainContent(base64data);
    }
}

function addFileToMainContent(file)
{
    if (file.type.match('image.*')) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            var dataURI = theFile.target.result;
            if(file.type.match('image.*')) {
                addImageToMainContent(dataURI);
            }
        });
        reader.readAsDataURL(file);
    }
}

function showDownloadAppPage(message)
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMain").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("tophalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("bottomhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("editorhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorComponent").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("icondiv").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("downloadAppContainer").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookAppDownloadMessage").innerHTML = message;
}

function showFeedBackPage()
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMain").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("tophalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("bottomhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("editorhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorComponent").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("icondiv").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackContainer").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackContainer").focus();
    var commentsArea = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackComments");
    commentsArea.focus();
    commentsArea.textContent = "";
//    commentsArea.value = "";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackCurrentUrl").value = window.location;
    chrome.storage.local.get("user_email", function(item) {
        var user_email = item.user_email;
        if(typeof user_email !== 'undefined') {
            document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackEmail").value = user_email;
        } else {
            chrome.runtime.sendMessage({action: "loadUserProfile"});
            document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackEmail").value = "";
        }
    });
    removeAttachmentFromFeedback();
}

function showTweetUsPage()
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsTwwetUs").focus();
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsMenuDropDown").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
    window.open("https://twitter.com/intent/tweet?text=Loving+the+Notebook+Chrome+Extension.+Such+a+beautiful+way+to+take+notes.+https%3A%2F%2Fwww.zoho.com%2Fnotebook%2Fweb-clipper.html", '', 'height=500,width=600');
//    window.open("https://twitter.com/intent/tweet?text=Loving+the+Notebook+Chrome+Extension.+Such+a+beautiful+way+to+take+notes.+https%3A%2F%2Fwww.zoho.com%2Fnotebook%2Fweb-clipper.html");
}

function showRateUsPage()
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsMenuDropDown").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
    //window.open("https://chrome.google.com/webstore/detail/notebook-web-clipper/cneaciknhhaahhdediboeafhdlbdoodg/reviews?hl=en");
     document.getElementById("notebookcx").contentWindow.document.getElementById("dummytd").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMain").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("tophalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("bottomhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("editorhalf").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorComponent").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("rateusContainer").style.display = "block";
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("icondiv").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("downloadAppContainer").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookAppDownloadMessage").innerHTML = message;
}

function signoutFromAccounts()
{
    showHome();
    var logout = accounts_server + "/logout";
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4)
        {
            if(xhr.status === 200) {
                chrome.storage.local.get("authtoken", function(item) {
                    authtoken = item.authtoken;
                    deleteToken(authtoken);
                });
                chrome.storage.local.clear(function() {});
                onNotebookcxLoad();
            }
            else {
                chrome.runtime.sendMessage({action: "showToast", message:"Signout failed!"});
            }
        }
    };
    xhr.open('POST', logout, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send();
}

function deleteToken(authtoken) {
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
}

function handleFeedbackAttachmentChanged() 
{
    var fileToRead = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachment");
    var files = fileToRead.files;
    var len = files.length;
    
    if (len) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentName").textContent = files[0].name;
    } else {
        document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentName").textContent = "";
    }
    hideFeedbackAttachmentOptions();
}

function hideFeedbackAttachmentOptions()
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackFileAttachment").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshot").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentNameContainer").style.display = "";
}

function showFeedbackAttachmentOptions()
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackFileAttachment").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshot").style.display = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentNameContainer").style.display = "none";
}

function closeSettingsMenu() {
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsMenuDropDown").style.display = "none";
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "none";
}

function openSettingsMenu() {
    var settingsDropDown = document.getElementById("notebookcx").contentWindow.document.getElementById("settingsMenuDropDown");
    if(settingsDropDown.style.display === "none")
    {
        settingsDropDown.style.display = "";
        document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").style.display = "block";
    }
    else
    {
        closeSettingsMenu();
    }
}

function sendFeedback(sender)
{
    var content = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackComments").textContent;
    if (content === undefined || content.trim().length === 0) {
        chrome.runtime.sendMessage({action: "showToast", message:"Comments cannot be empty"});
    } else {
        var email = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackEmail").value;
        if(typeof email !== 'undefined' && email.trim() !== '' && validateEmail(email))
        {
            var url = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackCurrentUrl").value;
            var comments = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackComments").textContent;
    //        var comments = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackComments").value;

            var content = "Url : " + url;
            content = content + "\n\n";
            content = content + "Comments : " + comments;
            
            var fileToRead = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachment");
            var files = fileToRead.files;
            var len = files.length;

            var jsonString = {};
            jsonString.subject = "Notebook - Chrome Extension Feedback";
            jsonString.sender = email;
            jsonString.content = content;
            
            var feedbackUrl = notebook_server + "/api/v1/feedback";
            var formData = new FormData();
            if (len) {
                formData.append('attachment', files[0]);
            }
            
            var screenshotSource = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshotImage").src;
            var screenshotName = document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentName").textContent;
            if(screenshotSource.startsWith("data")) {
                var blob = dataURLtoBlob(screenshotSource, screenshotName);
                formData.append('attachment', blob, screenshotName);
            }
            formData.append('JSONString', JSON.stringify(jsonString));
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        chrome.runtime.sendMessage({action: "showToast", message:"Feedback sent successfully!"});
                        chrome.runtime.sendMessage({action: "sendAnalytics",analyticsCategory:ANALYTICS_CATEGORY.FEEDBACK, analyticsAction:ANALYTICS_ACTION.SEND,analyticsLabel:ANALYTICS_LABEL.SUCESS});
                    } else {
                        chrome.runtime.sendMessage({action: "showToast", message:"Feedback sending failed!"});
                    }
                }
            };
            xhr.ontimeout = function (e) {
                chrome.runtime.sendMessage({action: "showToast", message:"Connection lost!"});
            }
            showHome();
            xhr.open('POST', feedbackUrl, true);
            xhr.setRequestHeader("processData", false);
            xhr.setRequestHeader("contentType", false);
            xhr.send(formData);
        }
        else
        {
            chrome.runtime.sendMessage({action: "showToast", message:"Enter valid email address!"});
        }
    }
}

function validateEmail(email) {
    var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regEx.test(email);
}

function attachScreenshotToFeedback()
{
    chrome.runtime.sendMessage({action: "capturefeedbackScreenshot"});   
    hideFeedbackAttachmentOptions();
}

function removeAttachmentFromFeedback()
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachment").value = "";
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshotImage").src = "/";
    handleFeedbackAttachmentChanged();
    showFeedbackAttachmentOptions();
}

function getFeedbackScreenshot(tabid, myImage) 
{
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshotImage").src = myImage;
    var currentdate = new Date(); 
    var screenshotName = "Screen Shot " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentName").textContent = screenshotName + "." + getFileExtension(myImage);
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
//        getDataUri(dataurl, title, function(dataUri) {
//            dataURLtoBlob(dataUri, title);
//        });
    }
}

function getFileExtension(image) {
    try
    {
        var arr = image.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        arr = mime.split('/');
        return arr[1];
    } catch(err) {
        
    }
}






