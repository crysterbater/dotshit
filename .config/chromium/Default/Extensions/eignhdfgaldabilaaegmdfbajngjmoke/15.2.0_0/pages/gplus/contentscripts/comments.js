!function(){"use strict";function e(){var t=document.querySelector(".DJa");if(t){var n=parseFloat(t.textContent.replace(".","").replace(",","")),o=isNaN(n)?o:n;parent.postMessage({blackMenuGplusCommentsCount:o||0},"*")}else setTimeout(e,100)}e(),document.body.title=""}();