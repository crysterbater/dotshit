!function(){"use strict";function e(e){window.parent.postMessage({blackMenuOpenUrl:e},"*")}function n(e){var n=new URL(e),t=n.origin+n.pathname,r=n.search.replace("?","").split("&").filter(function(e){return!e.startsWith("bm_")}).join("&");r.length>2&&(t+="?"+r);var i=n.hash;return i.startsWith("#")&&(i=i.replace("#","")),i.length>1&&(t+="#"+i),t}var t=document.createElement("div");t.addEventListener("click",function(){var t=n(location.href);e(t)}),t.className="bm-open-in-new",document.querySelector("#gb > div:nth-child(2)").appendChild(t)}();