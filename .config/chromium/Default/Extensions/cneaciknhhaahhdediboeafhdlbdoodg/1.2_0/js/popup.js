

window.addEventListener("load", function () {

    chrome.tabs.getSelected(null,function(tab) { // null defaults to current window
        var title = tab.title;
        document.getElementById("content-text").innerHTML = title;
        if(title.length < 32) {
            document.getElementById("content-text").rows = "1";
        }

        chrome.storage.local.set({
            "notecardTitle": title
        });

    });

    document.getElementById("content-text").onmouseover = function () {
        document.getElementById("content-text").style.backgroundColor = "#F9F9F9";
    };

    document.getElementById("content-text").onmouseout = function () {
        document.getElementById("content-text").style.backgroundColor = "#FFFFFF";
    };

    chrome.tabs.executeScript({
            code: "window.getSelection().toString();"
        }, function(textselected) {

            var selectedContent = textselected[0];

            if(selectedContent === "") {
                document.getElementById("selected_text_note").style.color = "#CECECE";
                document.getElementById("selected_text_note").style.opacity = "1";
                document.getElementById("selected_text_note").style.pointerEvents = "none";
            }

        });

    chrome.runtime.sendMessage({"action": "getloginstatus"}, function (response) {

        if (response === "notloggedin") {
            document.getElementById("signin").style.display = "block";

            document.getElementById("signup-action").innerHTML = chrome.i18n.getMessage("SignUpNow");
            document.getElementById("no-account-msg").innerHTML = chrome.i18n.getMessage("DontHaveZAccount");
            document.getElementById("sign-action").innerHTML = chrome.i18n.getMessage("SignIn");
            document.getElementById("login-page-save-msg").innerHTML = chrome.i18n.getMessage("ToSaveContentInZoho");


        } else if (response === "loggedin") {
            document.getElementById("cssmenu").style.display = "block";

            document.getElementById("text_note").innerHTML = chrome.i18n.getMessage("ClipThisPage");
            document.getElementById("simplified_note").innerHTML = chrome.i18n.getMessage("SimplifiedArticle");
            document.getElementById("selected_text_note").innerHTML = chrome.i18n.getMessage("ClipSelectedText");
            document.getElementById("screenshot").innerHTML = chrome.i18n.getMessage("SnapshotThisPage");
            document.getElementById("page_link").innerHTML = chrome.i18n.getMessage("SavePageLink");

            chrome.storage.local.get(["defNotebookName"], function (item) {
                var name = item.defNotebookName;
                if(typeof name != "undefined") {
                    document.getElementById("saves-in").innerHTML = chrome.i18n.getMessage("SaveContentIn")+" '"+name+"'";//    +chrome.i18n.getMessage("Notebook");
                } else {
                    document.getElementById("saves-in").innerHTML = chrome.i18n.getMessage("SaveContentIn")+" "+chrome.i18n.getMessage("Default")+" "+chrome.i18n.getMessage("Notebook");
                }
            });


        }
    });

    document.getElementById("sign-action").onclick = function () {
        chrome.tabs.create({
            'url': accounts_server + '/login?newtheme=true&servicename=Notebook',
            'selected': true
        });
    };

    document.getElementById("signup-action").onclick = function () {
        chrome.tabs.create({
            'url': accounts_server + '/accounts/register?servicename=Notebook',
            'selected': true
        });
    };

    document.getElementById("text_note").onclick = function () {
        var title1 = document.getElementById("content-text").value;
        chrome.runtime.sendMessage({"action":"clipFullPage", title : title1});
        window.close();

    };

    document.getElementById("simplified_note").onclick = function () {
        var title1 = document.getElementById("content-text").value;
        chrome.runtime.sendMessage({"action":"getSimplifiedArticle", title : title1});
        window.close();

    };

    document.getElementById("selected_text_note").onclick = function () {

        var title1 = document.getElementById("content-text").value;

        chrome.runtime.sendMessage({"action":"clipSelectedText", title : title1});
        window.close();
    };

    document.getElementById("page_link").onclick = function () {
        var title1 = document.getElementById("content-text").value;
        chrome.runtime.sendMessage({"action":"savePageLink", title : title1});
        window.close();

    };

    document.getElementById("screenshot").onclick = function () {
        var title1 = document.getElementById("content-text").value;
        chrome.runtime.sendMessage({"action":"captureVisibleTab", title : title1});
        window.close();
    };

});
