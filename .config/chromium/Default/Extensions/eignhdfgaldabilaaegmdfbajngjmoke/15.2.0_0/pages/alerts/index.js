cjModules.define(function(){"use strict";return function(e,t){bmBasics.toggleLoading("on",e);var n=bmElements.createElement("pageheader",{pageId:"alerts",floating:!0});e.appendChild(n);var a=cjBasics.urls.create("https://www.google.com/alerts",{bm_contentscript:"alerts",bm_embed:"1",bm_toolbar_button_count:bmBasics.getMainToolbarButtonCount(),authuser:g.account.authuser,hl:g.lang}),o=bmElements.createElement("iframe",{src:a,noLoading:!0});o.iframeElement.addEventListener("load",function(){bmBasics.toggleLoading("off",e)}),e.appendChild(o),t.setOpenInNewHandler(function(){o.sendMessage({method:"alertsOpenInNew"})})}});