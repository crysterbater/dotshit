!function(){"use strict";function n(n){window.parent.postMessage({blackMenuOpenUrl:n},"*")}function t(n){var t=new URL(n),e=t.origin+t.pathname,a=t.search.replace("?","").split("&").filter(function(n){return!n.startsWith("bm_")}).join("&");a.length>2&&(e+="?"+a);var r=t.hash;return r.startsWith("#")&&(r=r.replace("#","")),r.length>1&&(e+="#"+r),e}window.addEventListener("message",function(e){var a=e.data,r=a.method;if("flightsOpenInNew"===r){var i=t(location.href);n(i)}})}();