'use strict';(function(d){d(CodeMirror)})(function(d){var r=[void 0,"CodeMirror-bookmarks","CodeMirror-linenumbers"],k=d.Pos,t=d.Range,u=function(){var b=document.createElement("div");b.setAttribute("class","CodeMirror-bookmarks-marked");b.innerHTML="&nbsp;";return b},l=function(b,a,e){if(-1!=r.indexOf(e)){var c;(c=b.listSelections().filter(function(a){return!a.empty()}))&&0===c.length&&(c=[new t(new k(a,0),new k(a,b.getLine(a).length))]);v(b,c)}},p=function(b,a,e){for(var c,n,d,g=0;g<a.length;g++){c=
a[g].from();for(var h=a[g].to(),f=c.line;f<=h.line;++f)f<=h.line&&(c=k(f,0),d=(d=b.lineInfo(c))&&(n=d.gutterMarkers)&&n["CodeMirror-bookmarks"],e!==d&&b.setGutterMarker(c.line,"CodeMirror-bookmarks",e?u():null))}},q=function(b,a){var e=b.clipPos(a);return e.line==a.line&&e.ch==a.ch?a:null};d.defineOption("bookmarkGutter",!1,function(b,a){if(a)b.on("gutterClick",l);else b.off("gutterClick",l)});var w=function(b,a,e){p(b,[a],!0);return{clear:function(){p(b,[a],!1);e&&e.clear&&e.clear()},find:function(){var c=
a.from(),e=a.to();return q(b,c)&&q(b,e)?{from:c,to:e}:null},extra:e}};d.commands.nextBookmark=function(b){var a=b.state.bookmarks;if(a)for(;a.length;){var e=a.shift(),c=e.find();if(c)return a.push(e),b.setSelection(c.from,c.to)}};d.commands.prevBookmark=function(b){var a=b.state.bookmarks;if(a)for(;a.length;){a.unshift(a.pop());var e=a[a.length-1].find();if(e)return b.setSelection(e.from,e.to);a.pop()}};var v=d.commands.toggleBookmark=function(b,a,e){var c=b.state.bookmarks||(b.state.bookmarks=[]);
a=a||b.listSelections();void 0===e&&a.every(function(a){a:{var c,d=a.from();a=a.to();for(d=d.line;d<=a.line;++d)if(d<=a.line&&(c=new k(d,0),(c=b.lineInfo(c))&&c.gutterMarkers)){a=!0;break a}a=void 0}return e=!a});for(var d=0;d<a.length;d++){for(var l=a[d].from(),g=a[d].to(),h=b.findMarks(k(l.line,0),k(g.line,b.getLine(g.line).length+1)),f=0;f<h.length;f++)if(h[f].bookmark){for(var m=0;m<c.length;m++)c[m].extra==h[f]&&(c[m].clear(),c.splice(m--,1));break}e&&f==h.length&&c.push(w(b,a[d],b.markText(l,
g,{bookmark:!0,clearWhenEmpty:!1})))}};d.commands.clearBookmarks=function(b){if(b=b.state.bookmarks)for(var a=0;a<b.length;a++)b[a].clear();b.length=0};d.commands.selectBookmarks=function(b){var a=b.state.bookmarks,e=[];if(a)for(var c=0;c<a.length;c++){var d=a[c].find();d?e.push({anchor:d.from,head:d.to}):a.splice(c--,0)}e.length&&b.setSelections(e,0)}});