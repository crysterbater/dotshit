// MagicActions for Google Chrome - CHROMEACTIONS.COM - Copyright (c) 2017 Vlad & Serge Strukoff. All Rights Reserved.
(function(){function J(b){var a;if(a=C){a:{if(navigator.appVersion&&(a=navigator.appVersion.indexOf("Chrome/"),-1<a)){a=parseInt(navigator.appVersion.slice(a+7));break a}a=0}a=53<a}return a?C.call(b,{mode:"closed"}):b}function D(c){c&&(K(c.url),b=c.opt);m=m||J(document.body);c=document.createDocumentFragment();var a=h("ul");a.id="opt";t&&(a.className="localPage",document.body.classList.remove("shadow"));c.appendChild(a);if(1==b.sv){q("sv",0);var g=l.i18n.getMessage("m1",[l.i18n.getMessage("extName"),
b.ver]);setTimeout(function(){window.top.postMessage(g,"https://www.chromeactions.com")},1500)}L(m,"css/mrva.css");y(a,'<b>Thank you for using Magic Actions!</b><span></span><br>YouTube constantly make changes, and we constantly need to make sure we are in sync. Last years we have been working hard to provide you with the best possible features.<div class="ctrb-bttns"><b><span><i></i></span><span> </span>Don\'t forget to … </b><button id="annt19" class="ctrb-bttn" title="Securely via PayPal to our email &#10; address webmaster@mixesoft.com &#10; You don\'t need to create a PayPal account.">Donate $19</button> <button id="annt12" class="ctrb-bttn" title="Securely via PayPal to our email &#10; address webmaster@mixesoft.com &#10; You don\'t need to create a PayPal account.">Donate $12</button> <button id="annt7" class="ctrb-bttn" title="Securely via PayPal to our email &#10; address webmaster@mixesoft.com &#10; You don\'t need to create a PayPal account.">Donate $7</button> <button id="anntx" class="ctrb-bttn" title="Donate custom amount">…</button></div>',
!1,!0);e(a,"mwvc",d("o8"),b.mwvc,0,0,t?0:"https://www.chromeactions.com/magic-actions-for-youtube-volume-control.html");M(a);N(a);O(a);P(a,"gap",d("o27"),b.gap,1,25,1,!b.mwvc);e(a,"hq",d("o90"),b.hq,0,0,t?0:"https://www.chromeactions.com/magic-actions-for-youtube-autohd.html");Q(a);e(a,"ha",d("o20"),b.ha);e(a,"mrl",d("o44"),b.mrl);e(a,"wide",d("o28"),b.wide);e(a,"ww",d("o80"),b.ww);e(a,"cin",d("o29"),b.cin,0,0,t?0:"https://www.chromeactions.com/magic-actions-for-youtube-cinema.html");R(a);e(a,"cina",
d("o30"),b.cina,1,!b.cin);e(a,"cinf",d("o31"),b.cinf,1,!b.cin);e(a,"pt",d("o65"),b.pt);pti=b.pti;S(a);e(a,"pause",d("o17"),b.pause);e(a,"plist",d("o19"),b.plist,1,!b.pause);e(a,"buf",d("o18"),b.buf);e(a,"buf1",d("o63"),b.buf1,1,!b.buf);e(a,"loop",d("o40"),b.loop);e(a,"hide",d("o41"),b.hide);e(a,"c0",d("o70"),b.c0,0,0,t?0:"https://www.chromeactions.com/magic-actions-for-youtube-comments.html");z(a,["c1",d("o71"),b.c1,"c4",d("o86"),b.c4,"c3",d("o73"),!1],!b.c0);e(a,"anns",d("o42"),b.anns);e(a,"f0",
d("o43"),b.f0);e(a,"h0",d("o50"),b.h0);z(a,["h7",d("o56"),b.h7,"h1",d("o51"),b.h1,"h2",d("o52"),b.h2,"h3",d("o53"),b.h3,"h4",d("o54"),b.h4],!b.h0);z(a,["h5",d("o55"),b.h5,"h6",d("o64"),b.h6,"h8",d("o57"),b.h8],!b.h0);e(a,"a0",d("o60"),b.a0,0,0,t?0:"https://www.chromeactions.com/magic-actions-for-youtube-themes.html");e(a,"a4",d("o81"),b.a4,1,!b.a0);e(a,"a1",d("o61"),b.a1,1,!b.a0);e(a,"a2",d("o62"),b.a2,1,!b.a0);e(a,"a3",d("o84"),b.a3,1,!b.a0);e(a,"a5",d("o85"),b.a5,1,!b.a0);T(a);y(a,'<b>Thank you for using Magic Actions!<br>We are working hard to provide you with the best possible features.<div class="ctrb-bttns">Please do not forget to … </b><button id="annt19" class="ctrb-bttn" title="Securely via PayPal to our email &#10; address webmaster@mixesoft.com &#10; You don\'t need to create a PayPal account.">Donate $19</button> <button id="annt12" class="ctrb-bttn" title="Securely via PayPal to our email &#10; address webmaster@mixesoft.com &#10; You don\'t need to create a PayPal account.">Donate $12</button> <button id="annt7" class="ctrb-bttn" title="Securely via PayPal to our email &#10; address webmaster@mixesoft.com &#10; You don\'t need to create a PayPal account.">Donate $7</button> <button id="anntx" class="ctrb-bttn" title="Donate custom amount">…</button></div>',
!1,!0);m.appendChild(c);n("f0").parentElement.title="Show/Hide the Filters button so you can apply a filter (grayscale, flip, high contrast etc.) to any video";E("a5");E("mrl");n("mrl").parentElement.title="Show/Hide the Filters button so you can apply a filter (grayscale, flip, high contrast etc.) to any video"}function q(b,a){l.runtime.sendMessage(JSON.stringify({id:4,name:b,value:a}))}function E(b){var a=h("sup");a.textContent=d("m4");a.style.color="red";a.style.verticalAlign="top";n(b).nextElementSibling.appendChild(a)}
function U(c){n(b.color).className="";b.color=this.id;this.className="sel";q("color",b.color)}function F(c){n("vt"+b.mwvct).checked=!1;b.mwvct=parseInt(this.id.charAt(2));this.checked=!0;q("mwvct",b.mwvct)}function A(c){n("vc"+b.mwvci).checked=!1;b.mwvci=parseInt(this.id.charAt(2));this.checked=!0;q("mwvci",b.mwvci)}function B(c){n("ca"+b.cini).checked=!1;b.cini=parseInt(this.id.charAt(2));this.checked=!0;q("cini",b.cini)}function G(c){n("pt"+b.pti).checked=!1;b.pti=parseInt(this.id.charAt(2));this.checked=
!0;q("pti",b.pti)}function p(c){n(b.hqi).checked=!1;b.hqi=this.id;this.checked=!0;q("hqi",b.hqi)}function H(c){if("c3"==this.id)this.checked=!1,this.disabled=!0,y(m,'<b>Note:</b> The Country Flags feature was disabled due to the YouTube <a target="_blank" href="https://developers.google.com/youtube/youtube-api-list">deprecation policy</a>.<br>The YouTube API v2 would be retired in April 20, 2015, and would be shut down soon thereafter.',!0);else if(b[this.id]=this.checked,q(this.id,this.checked),
c=this.parentElement,"opt"==c.className)for(c=c.nextElementSibling;c&&("sub"==c.className||"sub multi"==c.className);)c.setAttribute("disabled",!this.checked),c=c.nextElementSibling}function V(c){b[c.id]=parseInt(c.value);q(c.id,parseInt(c.value))}function W(b){x&&(clearTimeout(x),x=0);this.nextElementSibling.textContent=this.value;x=setTimeout(V,500,this)}function N(c){var a="red LightPink orange lime GreenYellow yellow gold DodgerBlue aqua magenta DeepPink white".split(" "),g=h("li");var k=h("label");
g.className="sub";g.setAttribute("disabled",!b.mwvc);g.id="color";k.textContent=d("o9");g.appendChild(k);for(var e=0,f=a.length;e<f;e++){var v=a[e];k=h("button");k.id=v;k.style.backgroundColor=v;b.color==v&&(k.className="sel");g.appendChild(k);k.addEventListener("click",U,!1)}c.appendChild(g)}function M(c){var a=h("li");a.id="mwvct";a.className="sub";a.setAttribute("disabled",!b.mwvc);f(a,"vt0",d("o82"),0==b.mwvct,F);f(a,"vt1",d("o83"),1==b.mwvct,F);c.appendChild(a)}function O(c){var a=h("li"),g=
h("label");a.id="mwvci";a.className="sub";a.setAttribute("disabled",!b.mwvc);g.textContent=d("o23");a.appendChild(g);f(a,"vc1",d("o24"),1==b.mwvci,A);f(a,"vc2",d("o25"),2==b.mwvci,A);f(a,"vc0",d("o26"),0==b.mwvci,A);c.appendChild(a)}function R(c){var a=h("li"),g=h("label");a.id="cini";a.className="sub";a.setAttribute("disabled",!b.cin);g.textContent=d("o32");a.appendChild(g);f(a,"ca0",d("o33"),0==b.cini,B);f(a,"ca1",d("o34"),1==b.cini,B);f(a,"ca2",d("o35"),2==b.cini,B);c.appendChild(a)}function S(c){var a=
h("li");a.id="pti";a.className="sub";a.setAttribute("disabled",!b.pt);f(a,"pt0",d("o66"),0==b.pti,G);f(a,"pt1",d("o67"),1==b.pti,G);c.appendChild(a)}function f(b,a,g,d,e){var c=h("label"),k=h("input");k.type="radio";k.id=a;d&&(k.checked=!0);b.appendChild(k);c.textContent=g;c.setAttribute("for",a);b.appendChild(c);k.addEventListener("click",e,!1)}function Q(c){var a=h("li");a.id="hqi";a.className="sub";a.setAttribute("disabled",!b.hq);f(a,"highres",d("o91"),"highres"==b.hqi,p);f(a,"hd2880",d("o92"),
"hd2880"==b.hqi,p);f(a,"hd2160",d("o93"),"hd2160"==b.hqi,p);f(a,"hd1440",d("o94"),"hd1440"==b.hqi,p);f(a,"hd1080",d("o95"),"hd1080"==b.hqi,p);f(a,"hd720",d("o96"),"hd720"==b.hqi,p);f(a,"large",d("o97"),"large"==b.hqi,p);f(a,"medium",d("o98"),"medium"==b.hqi,p);f(a,"small",d("o99"),"small"==b.hqi,p);f(a,"tiny",d("o100"),"tiny"==b.hqi,p);c.appendChild(a)}function e(b,a,d,k,e,f,v){var c=h("li"),g=h("label"),u=h("input");g.textContent=d;g.setAttribute("for",a);u.type="checkbox";u.id=a;u.checked=k;c.appendChild(u);
c.appendChild(g);e?(c.className="sub",c.setAttribute("disabled",f)):c.className="opt";v&&(a=h("span"),a.textContent="❓",a.title="Help & Tips",a.setAttribute("data-url",v),a.className="help",c.appendChild(a),a.addEventListener("click",function(a){a=this.getAttribute("data-url");l.runtime.sendMessage(JSON.stringify({id:2,url:a,incognito:!0}))},!1));b.appendChild(c);u.addEventListener("click",H,!1)}function z(b,a,d){for(var c=h("li"),g,e,f=0,l=a.length;f<l;f+=3)g=h("label"),e=h("input"),g.textContent=
a[f+1],g.setAttribute("for",a[f]),e.type="checkbox",e.id=a[f],e.checked=a[f+2],c.appendChild(e),c.appendChild(g),e.addEventListener("click",H,!1);c.className="sub multi";c.setAttribute("disabled",d);b.appendChild(c)}function P(b,a,d,e,f,l,m,n){var c=h("li"),g=h("label"),k=h("input");g.textContent=d;g.setAttribute("for",a);k.type="range";k.min=f;k.max=l;k.step=m;k.value=e;k.id=a;k.title="Range: "+f+"-"+l;c.appendChild(g);c.appendChild(k);g=h("span");g.textContent=e;c.appendChild(g);c.className="sub";
c.setAttribute("disabled",n);b.appendChild(c);k.addEventListener("change",W,!1)}function T(b){var a=h("li"),c=h("a");a.className="opt";c.textContent="Export Options …";c.className="bttn";c.addEventListener("click",X,!1);a.appendChild(c);c=h("a");c.textContent="Import Options …";c.className="bttn";c.addEventListener("click",Y,!1);a.appendChild(c);b.appendChild(a)}function L(b,a){var c=document.createElement("link");c.rel="stylesheet";c.type="text/css";c.href=a;b.appendChild(c)}function y(b,a,d,e){var c=
h("ul"==b.localName?"li":"div");c.className="msg"+(d?" fixed":"");c.innerHTML=a;b.appendChild(c);e&&(c.style.backgroundImage="none");c.addEventListener("click",e?Z:aa,!1)}function Z(b){var a=b.target.id||0,c;"annt19"==a?c=19:"annt12"==a?c=12:"annt7"==a&&(c=7);c?(I("opt-"+c),l.runtime.sendMessage(JSON.stringify({id:2,url:l.runtime.getURL("Yxpx.html#"+c)}))):(I("opt-ctrb"),l.runtime.sendMessage(JSON.stringify({id:2,url:l.runtime.getURL("IpOM.html")})));b.stopPropagation()}function aa(b){m.removeChild(this);
b.stopPropagation()}function K(b){0!=b.indexOf("https://www.chromeactions.com/")&&0!=b.indexOf(l.runtime.getURL(""))&&(document.location.href="about:blank")}function X(){var c=JSON.stringify(b);if(Blob)var a=new Blob([c],{type:"application/json;charset=UTF-8"});else BlobBuilder&&(a=new BlobBuilder,a.append(c),a=a.getBlob("application/json;charset=UTF-8"));ba(a,"MagicActions-Options.json")}function Y(){ca(1E5,function(c){try{c=JSON.parse(c)}catch(u){return}var a=b.ver,d=b.nv,e;for(e in c)void 0!=b[e]&&
(b[e]=c[e]);b.ver=a;b.nv=d;l.runtime.sendMessage(JSON.stringify({id:3,opt:b}));m.innerHTML="";D()})}function ca(b,a){var c=n("openAs");c&&m.removeChild(c);c=document.createElement("input");c.id="openAs";c.style.display="none";c.type="file";m.appendChild(c);c.addEventListener("change",function(c){if((c=c.target.files)&&1==c.length&&c[0].size<b){var d=new FileReader;d.onload=function(b){a(b.target.result)};d.readAsText(c[0])}else showMsg("m12",1E3)},!1);c.click()}function ba(b,a){var c=document.createElement("a"),
d=window.URL||window.webkitURL;c.href=d.createObjectURL(b);c.setAttribute("download",a);c.click();setTimeout(function(){d.revokeObjectURL(c.href)},2E3)}function I(b){l.runtime.sendMessage(JSON.stringify({id:20,ga:{ea:b}}))}function n(b){return m.querySelector("#"+b)}function h(b){return document.createElement(b)}function d(b){return l.i18n.getMessage(b)}var b,t=window.self==window.top,x=0,m,l={},r=chrome.runtime.getURL("otl.html");0!=window.location.href.indexOf(r)&&(window.location.href=
r);for(var w in chrome)if("object"==typeof chrome[w]&&(r=Object.getOwnPropertyDescriptor(chrome,w))){l[w]=r.value;r.value={};r.configurable=!1;r.writable=!1;try{Object.defineProperty(chrome,w,r)}catch(c){l[w]=chrome[w]}}if("attachShadow"in Element.prototype){var C=Element.prototype.attachShadow;Element.prototype.attachShadow=void 0}window.addEventListener("DOMContentLoaded",function(){t&&window.location.search!="?s=6951"+(new Date).getDate()+(new Date).getHours()?window.location.href="kWa.html":
l.runtime.sendMessage(JSON.stringify({id:0}),D)},!0)})();