!function(e,n,a,s,t,o,r){e.GoogleAnalyticsObject=t,e[t]=e[t]||function(){(e[t].q=e[t].q||[]).push(arguments)},e[t].l=1*new Date,o=n.createElement(a),r=n.getElementsByTagName(a)[0],o.async=1,o.src=s,r.parentNode.insertBefore(o,r)}(window,document,"script","chrome-extension://dbfmnekepjoapopniengjbcpnbljalfg/js/analytics.js","ga"),ga("create","UA-54537742-6","auto"),ga("require","displayfeatures"),ga("send","pageview","/background.html"),chrome.runtime.onMessage.addListener(function(e,n,a){e.message;"onOpenNewtab"==e.name&&ga("send","event","打开新标签页")}),chrome.runtime.onMessage.addListener(function(e,n,a){var s=e.message;if("onSearch"==e.name){var t=s.se;s.openType,s.keyword;ga("send","event",t)}}),chrome.runtime.onMessage.addListener(function(e,n,a){var s=e.message;"openSite"==e.name&&ga("send","event","网站","click",s.url)});