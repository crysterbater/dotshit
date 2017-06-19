(function () {

    var closeBtn = document.getElementById('close_btn');
    var version = document.getElementById('version');

    if (window.chrome && window.chrome.app.window) {
        version.textContent = 'version ' + chrome.runtime.getManifest().version;
        chrome.storage.local.get("config", function (result) {
            var config = result.config;
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');

            if (config && config.settings && config.settings.theme) {
                link.href = "css/" + config.settings.theme;
            } else {

                link.href = "css/primary.css";
            }
            document.head.appendChild(link);
        });

    } else if (window.process && window.process.type) {

        var pjson = require('./manifest.json');
        version.textContent = 'version ' + pjson.version;

        var link = document.createElement('link');
        link.href = "css/primary.css";
        link.setAttribute('rel', 'stylesheet');
        try {
            var config = JSON.parse(localStorage.getItem("config")).config;
            if (config && config.settings && config.settings.theme) {
                link.href = "css/" + config.settings.theme;
            }
        } catch (e) {
            link.href = "css/primary.css";
        }
        document.head.appendChild(link);
    }
    closeBtn.addEventListener('click', function () {
        if (window.chrome && window.chrome.app.window) {
            chrome.app.window.current().close();
        } else if (window.process && window.process.type) {
            const remote = require('electron').remote;
            var currentWindow = remote.getCurrentWindow();
            currentWindow.close();
        }
    });
    var updateInfo = document.getElementById('update_info');
  if(window.process && window.process.type) {
        //$http.get(`${ROOT_URL}api/UpdateApi?version=${appVersion}`).then(function (result) {
        const ROOT_URL =  "http://www.salmonplayer.com/";
        var pjson = require('./manifest.json');
                    
        var r = new XMLHttpRequest();
        var updateBtn = document.getElementById('update_btn');
        
        r.open("GET", `${ROOT_URL}api/UpdateApi?version=${pjson.version}`, true);
        r.onload = function (e) {
            if(r.response) {
                updateData = JSON.parse(r.response);
                updateInfo.textContent = "Salmon Player v" + updateData.VersionString + " is available for download";
                updateBtn.style.display = "";
                updateBtn.onclick = function() {
                    var shell = require("electron").shell;
                    shell.openExternal(ROOT_URL + 'File/Update?currentVersion='+pjson.version);
                    const app = require('electron').remote.app;
                    app.quit();
                }
            } else {
                updateInfo.textContent = "Salmon Player is up to date";
            }
            

        }
        r.send();
    } else {
        updateInfo.style.display = "none";
    }
})()

;
//# sourceMappingURL=about.js.map