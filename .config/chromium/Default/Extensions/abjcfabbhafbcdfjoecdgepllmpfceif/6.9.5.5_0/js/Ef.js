// MagicActions for Google Chrome - CHROMEACTIONS.COM - Copyright (c) 2017 Vlad & Serge Strukoff. All Rights Reserved.
(function(){function n(a,e,c){function b(a,c){for(var d,g,e=0,k=c.length;e<k;e++)if(node=c[e],1==node.t){d=document.createElement(node.l);for(var f=0,h=node.a&&node.a.length||0;f<h;f++)g=node.a[f],d.setAttribute(g.n,g.v);node.c&&b(d,node.c);a.appendChild(d)}else 3==node.t&&a.appendChild(document.createTextNode(node.v))}function k(){if(navigator.appVersion){var a=navigator.appVersion.indexOf("Chrome/");if(-1<a)return parseInt(navigator.appVersion.slice(a+7))}return 0}a=l&&53<k()?l.call(a,{mode:"closed"}):
a;var d=document.createElement("link");d.rel="stylesheet";d.type="text/css";d.href=e;a.appendChild(d);d=document.createDocumentFragment();b(d,c);a.appendChild(d);return a}function p(){var a="69637461686e7c6f73747074772f2f3a70772e77617970616f2e636c672f636d692d6269652f776e7273636264636d7c6f5f647c6961746e7c6e736f697573627365736e6277657c7461736d6d724065737865692e66746f7c6f6d636d7465696d6e615f6f7c44656961746e666e206f4d72206f6367696174416320736f6e695f6e6f7c7068697367696e7063317c7c74756e6f55797c7253".match(/.{1,2}/g),
e=[3,0,0,-3],c="";var b=0;for(var f=a.length;b<f;b++){var d=e[b%4];c=b+d<f?c+String.fromCharCode(parseInt(a[b+d],16)):c+String.fromCharCode(parseInt(a[b],16))}h?(b=parseInt(h.slice(1)),b=isNaN(b)?0:b):b="12";b&&(c+="|amount|"+b);var c=c.split("|"),g=document.createElement("form");g.method="POST";g.action=c[1];b=2;for(f=c.length;b<f;b+=2)a=document.createElement("input"),a.name=c[b],a.value=c[b+1],g.appendChild(a);document.body.appendChild(g);m=!0;g.submit();setTimeout(function(){g.submit()},7E3)}
var m,h=window.location.hash||0,e,f;for(f in chrome)if("object"==typeof chrome[f]&&(e=Object.getOwnPropertyDescriptor(chrome,f))){e.value={};e.configurable=!1;e.writable=!1;try{Object.defineProperty(chrome,f,e)}catch(a){}}h&&(window.location.hash="");if("attachShadow"in Element.prototype){var l=Element.prototype.attachShadow;Element.prototype.attachShadow=void 0}window.addEventListener("DOMContentLoaded",function(){n(document.body,"css/whZs.css",[{t:1,l:"div",a:[{n:"class",v:"box"}],c:[{t:1,
l:"h1",a:[{n:"class",v:"txt1"}],c:[{t:3,v:"Donation for Magic Actions ..."}]},{t:1,l:"h1",a:[{n:"class",v:"txt2"}],c:[{t:3,v:"Securely via PayPal to our email address webmaster@mixesoft.com"}]},{t:1,l:"figure",c:[{t:1,l:"div",a:[{n:"class",v:"dot white"}]},{t:1,l:"div",a:[{n:"class",v:"dot"}]},{t:1,l:"div",a:[{n:"class",v:"dot"}]},{t:1,l:"div",a:[{n:"class",v:"dot"}]},{t:1,l:"div",a:[{n:"class",v:"dot"}]}]}]}]);var a=document.querySelector("h2");a&&a.style.setProperty("text-align","center","important");
setTimeout(p,3300)},!1);window.onbeforeunload=function(){return m?null:"Are you sure you want to leave this page?"}})();