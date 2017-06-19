(function () {
    var Toast = function () {
        const _DURATION = 2000;
        var _toast_container = null;
        var _timeoutId;
        if (window.chrome && window.chrome.app.window) {
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
            var link = document.createElement('link');
            link.href = "css/primary.css";
            link.setAttribute('rel', 'stylesheet');
            try {
                var config = JSON.parse(localStorage.getItem("config")).config;            
            
                if (config && config.settings && config.settings.theme) {
                    link.href = "css/" + config.settings.theme;
                }
            } catch(e) {
                link.href = "css/primary.css";
            }
            document.head.appendChild(link);

        }

        function removeToast() {
            if (!_toast_container) {
                return;
            }
            _toast_container.parentElement.removeChild(_toast_container);
        }

        this.show = function (options) {
            var prev = document.querySelector('.toast_container');
            if (prev) {
                prev.parentElement.removeChild(_toast_container);
            }
            clearTimeout(_timeoutId);
            _toast_container = document.createElement('div');
            _toast_container.classList.add('toast_container');
            _toast_container.classList.add('toast_fadein');


            var toast = document.createElement('div');
            toast.classList.add('toast');
            if (options.content) {
                toast.innerHTML = options.content;
            }
            _toast_container.appendChild(toast);

            document.body.appendChild(_toast_container);

            if (options.duration == null || options.duration == undefined || isNaN(optios.duration)) {
                options.duration = _DURATION;
            }
            _timeoutId = setTimeout(this.hide, options.duration);

        },
            this.hide = function () {
                if (!_toast_container) {
                    return;
                }
                clearTimeout(_timeoutId);
                _toast_container.classList.add('toast_fadeout');

                _toast_container.addEventListener('webkitAnimationEnd', removeToast);
                _toast_container.addEventListener('animationEnd', removeToast);
                _toast_container.addEventListener('msAnimationEnd', removeToast);
                _toast_container.addEventListener('oAnimationEnd', removeToast);
            }

    }
    window.Toast = Toast;

})();
(function () {
    
    var toast = new Toast();
    var closeBtn = document.getElementById('close_btn');

    var sendBtn = document.getElementById('send_btn');
    var loader = document.getElementById('preloader');
    var cancelBtn = document.getElementById('cancel_btn');
    var messageTxt = document.getElementById('message_txt');
    var emailTxt = document.getElementById('email_txt');
    sendBtn.toggle = false;
    messageTxt.addEventListener("textInput", function () {
        messageTxt.classList.remove('validate-error');
    });
    closeBtn.addEventListener('click', function () {
        if (window.chrome && window.chrome.app.window) {
            chrome.app.window.current().close();
        } else if (window.process && window.process.type) {
            const remote = require('electron').remote;
            var currentWindow = remote.getCurrentWindow();
            currentWindow.close();
        }
    });

    sendBtn.addEventListener('click', function () {
        var message = messageTxt.value.trim();
        var email = emailTxt.value;

        if (message != "") {
            var issue = JSON.stringify({ FeedbackText: message, Email: email });
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', function () {
                if (xhr.readyState == 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        loader.style.display = 'none';
                        chrome.app.window.current().close();
                    } else {


                        loader.style.display = 'none';
                        toast.show({ content: "Unable to send your message" });
                    }
                }
            });
            xhr.open('POST', 'http://www.salmonplayer.com/api/FeedbackApi');
            xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            xhr.send(issue);
            loader.style.display = 'block';
        } else {
            messageTxt.classList.add('validate-error')
        }
    });
})()

;
//# sourceMappingURL=feedback.js.map