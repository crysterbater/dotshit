//Event list
var ANALYTICS_CATEGORY = {
    APP_USAGE : "APP_USAGE",
    NOTEBOOK : "NOTEBOOK",
    NOTE_TEXT : "NOTE_TEXT",
    NOTE_IMAGE : "NOTE_IMAGE",
    FEEDBACK: "FEEDBACK",
    RATEUS: "RATEUS",
    TWEETUS: "TWEETUS",
    DOWNLOAD_APP : "DOWNLOAD_APP",
    COLOR_PICKER : "COLOR_PICKER",
    NOTEBOOK_VIDEO : "NOTEBOOK_VIDEO"
};

var ANALYTICS_ACTION = {
    ADD : "ADD",
    ADD_TAP : "ADD_TAP",
    OPEN : "OPEN",
    CLOSE : "CLOSE",
    SHOW : "SHOW",
    SELECT : "SELECT",
    EDIT : "EDIT",
    CREATE : "CREATE",
    SIGN_IN : "SIGN_IN",
    SIGN_OUT : "SIGN_OUT",
    SIGN_UP : "SIGN_UP",
    SAVE : "SAVE",
    SEND: "SEND",
    DROP:"DROP",
    BROWSE: "BROWSE",
    THUMS_UP : "THUMS_UP",
    THUMS_DOWN : "THUMS_DOWN",
    ANDROID_APP : "ANDROID_APP",
    IOS_APP: "IOS_APP",
    MAC_APP: "MAC_APP",
    IMAGE_NOTE_CREATE_EXCEED_LIMIT : "IMAGE_NOTE_CREATE_EXCEED_LIMIT"
};

var ANALYTICS_LABEL = {
    GUEST : "GUEST",
    USER : "USER",
    PAGE_LINK : "PAGE_LINK",
    PHOTO_CARD : "PHOTO_CARD",
    TEXT_CARD : "TEXT_CARD",
    CLEAN_VIEW : "CLEAN_VIEW",
    CLEAN_VIEW_GUEST : "CLEAN_VIEW_GUEST",
    SCREEN_SHOT : "SCREEN_SHOT",
    DROP : "DROP",
    SAVE : "SAVE",
    BROWSE : "BROWSE",
    SUCCESS : "SUCCESS",
    RATE_US_LINK : "RATE_US_LINK",
    FEEDBACK_OPEN : "FEEDBACK_OPEN",
    VIDEO_CLOSED : "VIDEO_CLOSED",
    SIZE_EXCEEDED : "SIZE_EXCEEDED",
    DOWNLOAD_ANDRIOD: "DOWNLOAD_ANDRIOD",
    DOWNLOAD_MAC:"DOWNLOAD_MAC",
    DOWNLOAD_IOS: "DOWNLOAD_IOS"
   
};


var myCP;
if (document.getElementById("notebookcx") === null || document.getElementById("notebookcx") === "undefined" || document.getElementById("notebookcx") === undefined) {

    var fontfaces = "@font-face{font-family:'Charter';src: url('" + chrome.extension.getURL("fonts/ITC-CHARTER.ttf") + "');url('" + chrome.extension.getURL("fonts/ITC-CHARTER.ttf") + "') format('ttf');}";
    var style = document.createElement("style");
    style.id = "notebookcxfontfaces"
    style.innerHTML = fontfaces;
    document.head.appendChild(style);

    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,900";
    link.setAttribute("rel", "stylesheet");
    link.id = "notebookcxsansfont";
    document.head.appendChild(link);

    var _this = {};

    _this.rootFrame = document.createElement("iframe");
    _this.rootFrame.setAttribute("id", "notebookcx");
    _this.rootFrame.setAttribute("style", "height: 100%;right: 0;position: absolute;border: 0px;z-index: 999999999999;width: 350px;top: 0;position:fixed;");
    document.body.appendChild(_this.rootFrame);

    var fontfaces = "@font-face{font-family:'Charter';src: url('" + chrome.extension.getURL("fonts/ITC-CHARTER.ttf") + "');url('" + chrome.extension.getURL("fonts/ITC-CHARTER.ttf") + "') format('ttf');}";
    var style = document.createElement("style");
    style.id = "notebookcxfontfaces"
    style.innerHTML = fontfaces;
    _this.rootFrame.contentWindow.document.head.appendChild(style);

    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,900";
    link.setAttribute("rel", "stylesheet");
    link.id = "notebookcxsansfont";
    _this.rootFrame.contentWindow.document.head.appendChild(link);
    
    // _this.root = _this.ncx.createShadowRoot({mode: 'closed'});
    var css_path = chrome.extension.getURL("css/styles.css");
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", css_path, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status === 0)) {
            var data = rawFile.responseText;
            var style = document.createElement("style");
            style.innerHTML = data;
            _this.rootFrame.contentWindow.document.head.appendChild(style);
        }
    };
    rawFile.send(null);
    var html_path = chrome.extension.getURL("html/window1.html");
    var rawFile1 = new XMLHttpRequest();
    rawFile1.open("GET", html_path, false);
    rawFile1.onreadystatechange = function() {
        if (rawFile1.readyState === 4 && (rawFile1.status === 200 || rawFile1.status === 0)) {
            var data = rawFile1.responseText;
            var div = document.createElement("div");
            div.innerHTML = data;
            _this.rootFrame.contentWindow.document.body.appendChild(div);
        }
    };
    rawFile1.send(null);
    // document.body.appendChild(_this.ncx);

    var logo = chrome.extension.getURL("images/Icon-App-32x32@2x.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("logoImage").src = logo;
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookAppDownloadLogo_rate").src = logo;
    var settingsIcon = chrome.extension.getURL("images/icn-settings@2x.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsIcon").src = settingsIcon;
    
    var feedbackAttachmentIcon = chrome.extension.getURL("images/icn-attachment@2x.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentImage").src = feedbackAttachmentIcon;
    
    var notebookAppDownloadIcon = chrome.extension.getURL("images/Icon-App-32x32@2x.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookAppDownloadLogo").src = notebookAppDownloadIcon;
    
    var notebookAppStoreIcon = chrome.extension.getURL("images/itunes-badge.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookAppStoreImage").src = notebookAppStoreIcon;
    
    var notebookPlayStoreIcon = chrome.extension.getURL("images/en-play-badge.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookPlayStoreImage").src = notebookPlayStoreIcon;

    var notebookMacStoreIcon = chrome.extension.getURL("images/en-mac-badge.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookMacStoreImage").src = notebookMacStoreIcon;
    
    var nbQRCode = chrome.extension.getURL("images/notebook-app-qr-code.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("notebookAppQRCode").src = nbQRCode;
    
    var feedbackScreenshotIcon = chrome.extension.getURL("images/screenshot.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshotIcon").src = feedbackScreenshotIcon;
    
    var feedbackAttachmentCloseIcon = chrome.extension.getURL("images/close.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentRemove").src = feedbackAttachmentCloseIcon;
    
    
    var closeExtn = chrome.extension.getURL("images/close.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMainImage").src = closeExtn;
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeFeedBackImage").src = closeExtn;
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeDownload").src = closeExtn;
    document.getElementById("notebookcx").contentWindow.document.getElementById("backtohome").src = closeExtn;

    var textnote = chrome.extension.getURL("images/textnote.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("textnote").src = textnote;
    var photonote = chrome.extension.getURL("images/imagenote.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("photonote").src = photonote;
    document.getElementById("notebookcx").contentWindow.document.getElementById("addPhoto").src = photonote;
    var screenshot = chrome.extension.getURL("images/screenshot.png");
    var screenshotlight = chrome.extension.getURL("images/icn-screenshot-light.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("snapshotwebpage").src = screenshotlight;
    var colorPicker = chrome.extension.getURL("images/color.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPickerImage").src = colorPicker;
    var loadingss = chrome.extension.getURL("images/loader.gif");
    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss").src = loadingss;
    document.getElementById("notebookcx").contentWindow.document.getElementById("loadingss1").src = loadingss;
    var downarrow = chrome.extension.getURL("images/downarrow.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("downarrow").src = downarrow;

   var cliplink = chrome.extension.getURL("images/cliparticle.png");
   document.getElementById("notebookcx").contentWindow.document.getElementById("cliplink").src = cliplink;
   document.getElementById("notebookcx").contentWindow.document.getElementById("cliplink1").src = cliplink;
   var pagelink = chrome.extension.getURL("images/cliplink.png");
   document.getElementById("notebookcx").contentWindow.document.getElementById("pagelink").src = pagelink;
   document.getElementById("notebookcx").contentWindow.document.getElementById("screenshot").src = screenshot;
    var home = chrome.extension.getURL("images/home.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("home").src = home;

    var saveButton = chrome.extension.getURL("images/checked.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").src = saveButton;

    var thumsup = chrome.extension.getURL("images/dialog_thumb_up_fill.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("thumsup").src = thumsup;

    var thumsdown = chrome.extension.getURL("images/dialog_thumb_down_fill.png");
    document.getElementById("notebookcx").contentWindow.document.getElementById("thumsdown").src = thumsdown;

    document.getElementById("notebookcx").contentWindow.document.getElementById("clipLinka").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.SELECT,analyticsLabel:ANALYTICS_LABEL.CLEAN_VIEW});
        clipLink();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("clipLinka1").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnonymousAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.SELECT,analyticsLabel:ANALYTICS_LABEL.CLEAN_VIEW_GUEST});
        clipLink();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("pagelinka").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.SELECT,analyticsLabel:ANALYTICS_LABEL.PAGE_LINK});
        savepagelink();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("screenshota").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics",analyticsCategory:ANALYTICS_CATEGORY.NOTE_IMAGE, analyticsAction:ANALYTICS_ACTION.SELECT,analyticsLabel:ANALYTICS_LABEL.SCREEN_SHOT});
        savescreenshot();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("screenshotpage").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_IMAGE, analyticsAction:ANALYTICS_ACTION.SELECT,analyticsLabel:ANALYTICS_LABEL.SCREEN_SHOT});
        savescreenshot();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPicker").onclick = function(e) {
        closeNotebookandColor();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("color").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.COLOR_PICKER, analyticsAction:ANALYTICS_ACTION.SELECT});
        showColorPallete(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("colorPickerImage").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.COLOR_PICKER, analyticsAction:ANALYTICS_ACTION.SHOW});
        showColorPallete(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("saveButton").onclick = function(e) {
        save();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("signin-action").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnonymousAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTEBOOK, analyticsAction:ANALYTICS_ACTION.SIGN_IN});
        chrome.storage.local.set({
            "login_method": 'sign_in'
        });
        signin();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("signup-action").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnonymousAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTEBOOK, analyticsAction:ANALYTICS_ACTION.SIGN_UP});
        chrome.storage.local.set({
            "login_method": 'sign_up'
        });
        
        signup();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("title").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.EDIT,analyticsLabel:ANALYTICS_LABEL.NOTE_TITLE});
        document.getElementById("notebookcx").contentWindow.document.getElementById("title").placeholder = "";
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("title").onkeyup = function(e) {
        titleEvent(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("title").onkeydown = function(e) {
        titleEvent(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("title").onblur = function(e) {
        document.getElementById("notebookcx").contentWindow.document.getElementById("title").placeholder = "Title";
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("selectedNotebook").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTEBOOK, analyticsAction:ANALYTICS_ACTION.SHOW});
        showNotebooks(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("textnote").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_TEXT, analyticsAction:ANALYTICS_ACTION.ADD_TAP});
        addtextnote();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("home").onclick = function(e) {
        showHome(true);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("backtohome").onclick = function(e) {
        showHome(true);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("photonote").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_IMAGE, analyticsAction:ANALYTICS_ACTION.ADD_TAP});
        addphotonote(true);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("actualphoto").onchange = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTE_IMAGE, analyticsAction:ANALYTICS_ACTION.BROWSE,analyticsLabel:ANALYTICS_LABEL.BROWSE});
        downloadAndAddPhoto();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").onkeyup = function(e) {
        enterCheckList(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").onclick = function(e) {
        enterCheckList(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").onkeydown = function(e) {
        avoidDiv(event);
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeMessage").onclick = function(e) {
        closeMessage();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeExtnMain").onclick = function(e) {
        showHome();
    };
    
    /*
    Settings events starts here
    */
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeFeedBack").onclick = function(e) {
        showHome();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsDownloadApp").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.DOWNLOAD_APP, analyticsAction:ANALYTICS_ACTION.ADD_TAP});
        showDownloadAppPage("Notebook is available on mobile devices. You can download Notebook for free from the following stores:");
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsFeedBack").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.FEEDBACK, analyticsAction:ANALYTICS_ACTION.ADD_TAP});
        showFeedBackPage();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("thumsdown").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.RATEUS, analyticsAction:ANALYTICS_ACTION.THUMS_DOWN,analyticsLabel:ANALYTICS_LABEL.FEEDBACK_OPEN});
        showFeedBackPage();
        // document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "Sorry for inconvenience with Notebook";
        // document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        // document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        // setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);
        
    };

    document.getElementById("notebookcx").contentWindow.document.getElementById("thumsup").onclick = function(e) {
        showHome();
        // document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").innerHTML = "Thank you for rating positive";
        // document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.backgroundColor = "black";
        // document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "0px";
        // setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("errorMessage").style.top = "-50px";}, 5000);
        window.open("https://chrome.google.com/webstore/detail/notebook-web-clipper/cneaciknhhaahhdediboeafhdlbdoodg/reviews?hl=en");
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.RATEUS, analyticsAction:ANALYTICS_ACTION.THUMS_UP,analyticsLabel:ANALYTICS_LABEL.RATE_US_LINK});
    };

    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsTwwetUs").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.TWEETUS, analyticsAction:ANALYTICS_ACTION.ADD_TAP});
        showTweetUsPage();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsRateUs").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.RATEUS, analyticsAction:ANALYTICS_ACTION.ADD_TAP});
        showRateUsPage();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsSignout").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.NOTEBOOK, analyticsAction:ANALYTICS_ACTION.SIGNOUT});
        signoutFromAccounts();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("appStoreLink").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.DOWNLOAD_APP, analyticsAction:ANALYTICS_ACTION.IOS_APP,analyticsLabel:ANALYTICS_LABEL.DOWNLOAD_IOS});
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("androidLink").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.DOWNLOAD_APP, analyticsAction:ANALYTICS_ACTION.ANDROID_APP,analyticsLabel:ANALYTICS_LABEL.DOWNLOAD_ANDRIOD});
    };
    
     document.getElementById("notebookcx").contentWindow.document.getElementById("MacLink").onclick = function(e) {
        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.DOWNLOAD_APP, analyticsAction:ANALYTICS_ACTION.MAC_APP,analyticsLabel:ANALYTICS_LABEL.DOWNLOAD_MAC});
    };

    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackSend").onclick = function(e) {
        sendFeedback(e);
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachment").addEventListener("change", function(event) {
        handleFeedbackAttachmentChanged();
    }, false);
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("blockingDiv").onclick = function(e) {
        closeSettingsMenu();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("settingsIcon").onclick = function(e) {
        openSettingsMenu();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("closeDownload").onclick = function(e) {
        showHome();
    };
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackScreenshot").onclick = function(e) {
        attachScreenshotToFeedback();
    };
    
    document.getElementById("notebookcx").contentWindow.document.getElementById("feedbackAttachmentRemove").onclick = function(e) {
        removeAttachmentFromFeedback();
    };
    
    
    /*
    Settings events ends here
    */
    
//    document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").addEventListener('dragstart', function(e) {
//        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.IMAGE_RESOURCE, analyticsAction:ANALYTICS_ACTION.DRAG});
//        drag_start(event);
//    }, false);
//    document.body.addEventListener('dragover', function(e) {
//        drag_over(event);
//    }, false);
//    document.body.addEventListener('drop', function(e) {
//        chrome.runtime.sendMessage({action: "sendAnalytics", analyticsCategory:ANALYTICS_CATEGORY.IMAGE_RESOURCE, analyticsAction:ANALYTICS_ACTION.DROP});
//        drop(event);
//    }, false);
//    document.addEventListener('DOMContentLoaded', function() {
        var dropZone = document.getElementById("notebookcx").contentWindow.document.getElementById("clippedContent");
        dropZone.addEventListener('dragenter', handleDrag, false);
        dropZone.addEventListener('dragexit', handleDrag, false);
        dropZone.addEventListener('dragover', handleDrag, false);
        dropZone.addEventListener('drop', handleDrop, false);
        
        var randomColor = ["#FFFFFF","#DEF58F","#FAD154","#CFC4FF","#F7BFFF","#61D1FF","#85EBD9","#C4FFED","#D9E8F0","#FFED7D","#FFD921","#FF9C00","#FA9959","#B3D9E6","#BAC28A","#D1EBB8","#D1D9C9","#FFDB70","#FFA8B3","#E3E3E3"];
        /* colors not used - "#ABD1C9","#E8BA2B","#9CC2D6","#D4E0E3","#FFC27D","#E8B01C","#57C2FF","#F56E45","#BFD9C2","#82D9DE","#ABC29E","#F0C221","#9E1CB3","#7D12A3","#6600FF","#301294","#2175FF","#2E3BA3","#0087D4","#00549E","#0096A8","#006166","#00786B","#306B17","#E84F00","#DE2900","#BA1A12","#C40F59"*/
        for(var i=0;i<randomColor.length;i++) {
            var div = document.createElement("div");
            div.style.width = "30px";
            div.style.height = "30px";
            div.style.borderRadius = "15px";
            div.style.overflow = "hidden";
            div.style.float = "left";
            div.style.margin = "5px";
            div.style.textAlign = "center";
            div.style.backgroundColor = randomColor[i];
            div.id = randomColor[i];
            div.style.cursor = "pointer";
            document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").appendChild(div);
            document.getElementById("notebookcx").contentWindow.document.getElementById(randomColor[i]).onclick = function(event) {
                colorclicked = "yes";
                changeBGColor(event.target.style.backgroundColor);
            };
        }
        document.getElementById("notebookcx").contentWindow.document.getElementById("colorPalletes").style.backgroundImage = "url(" + chrome.extension.getURL("/images/colors-bg@3x.png") + ")";
        document.getElementById("notebookcx").contentWindow.document.getElementById("mainContent").addEventListener('paste', handlePaste);
//    }, false);
}

if (document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.opacity === "0" || document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.opacity === '') {
    setTimeout(function() {document.getElementById("notebookcx").contentWindow.document.getElementById("mySidenav").style.opacity = "1";}, 50);
    // addVideo();
}