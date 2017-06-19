var background = chrome.extension.getBackgroundPage();
document.getElementById('about').addEventListener('click', function () {
    background.track('extension', 'menu', 'about');
    chrome.tabs.update({
        url: "http://www.supportfreecontent.com/about"
    });
    window.close();
}, false);
document.getElementById('contact').addEventListener('click', function () {
    background.track('extension', 'menu', 'contact');
    chrome.tabs.update({
        url: "http://supportfreecontent.com/contact"
    });
    window.close();
}, false);
document.getElementById('faq').addEventListener('click', function () {
    background.track('extension', 'menu', 'faq');
    chrome.tabs.update({
        url: "http://www.supportfreecontent.com/faqs"
    });
    window.close();
}, false);
document.getElementById('home').addEventListener('click', function () {
    background.track('extension', 'menu', 'home');
    chrome.tabs.update({
        url: "http://supportfreecontent.com"
    });
    window.close();
}, false);
background.track('extension', 'menu', 'menu');
