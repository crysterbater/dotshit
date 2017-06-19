

window.addEventListener("load", function(){

    var notecardTitle = "Title..";
    var notebookName = "default";

    chrome.storage.local.get(["defNotebookName", "loader_msg", "notecardTitle"], function (item) {
        notecardTitle = item.notecardTitle;
        notebookName = item.defNotebookName;

        if(typeof notebookName === "undefined") {
            notebookName = "default Notebook";
        }

        if(typeof notecardTitle === "undefined") {
            notebookName = "Unknown title";
        }

        document.getElementById("title-msg").innerHTML = notecardTitle;
        document.getElementById("loader-msg").innerHTML = "Clipping to '" + notebookName + "'";

    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        if(request.action === "clipping") {
            document.getElementById("loader-msg").innerHTML = "Clipping to '" + notebookName + "'";
        }

        if(request.action === "saving") {
            document.getElementById("loader-msg").innerHTML = "Saving to '" + notebookName + "'";
        }

        if(request.action === "saved") {
            document.getElementById("loader-msg").innerHTML = "Saved to '" + notebookName + "'";
            document.getElementById("loader-img").style.display = "none";
            document.getElementById("success-img").style.display = "block";

            window.setTimeout(function(){
                chrome.runtime.sendMessage({action: "close-btn"});
            },5000);
        }

        if(request.action === "failed") {

            if(typeof request.message != "undefined") {
                document.getElementById("loader-msg").innerHTML = request.message;
            } else {
                document.getElementById("loader-msg").innerHTML = "Error while saving a note...";
            }

            document.getElementById("loader-img").style.display = "none";
            document.getElementById("alert-img").style.display = "block";

            window.setTimeout(function(){
                chrome.runtime.sendMessage({action: "close-btn"});
            },5000);
        }

    });

});
