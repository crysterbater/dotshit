!function(){"use strict";function e(e){window.parent.postMessage({blackMenuOpenUrl:e},"*")}function n(e){var n=new URL(e),t=n.origin+n.pathname,a=n.search.replace("?","").split("&").filter(function(e){return!e.startsWith("bm_")}).join("&");a.length>2&&(t+="?"+a);var r=n.hash;return r.startsWith("#")&&(r=r.replace("#","")),r.length>1&&(t+="#"+r),t}window.addEventListener("message",function(t){var a=t.data,r=a.method;if("alertsOpenInNew"===r){var i=n(location.href);e(i)}})}();