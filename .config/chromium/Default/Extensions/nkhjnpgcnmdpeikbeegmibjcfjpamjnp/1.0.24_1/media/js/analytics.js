var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-79011738-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// for StatCounter
var sc_project=11002613; 
var sc_invisible=1; 
var sc_security="9546810b"; 
var sc_https=1; 
//var scJsHost = (("https:" == document.location.protocol) ?  "https://secure." : "http://www.");

document.write("<sc"+"ript type='text/javascript' src='https://secure.statcounter.com/counter/counter.js'></"+"script>");


!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1470657753234558');

var ACCOUNTS_BASE_URL = 'https://profile.piktab.com/';
var ACCOUNTS_API_KEY = 'Y2hyb21lLWV4dGVuc2lvbjovL25raGpucGdjbm1kcGVpa2JlZWdtaWJqY2ZqcGFtam5w';
var FACEBOOK_APP_ID = '117800410509';
var GOOGLE_CLIENT_ID = '704741680839-bhf7ob7b4cno13766lf1chq9s909e8d6.apps.googleusercontent.com';
var GOOGLE_API_KEY = 'AIzaSyBEWLCJGM57YzNk1R8BUyh1njbWDiIRRQI';
var LANGUAGE = 'english';
var LANGUAGE_SHORT = 'en';
var RE_CAPTCHA_API_KEY = '6LdrxggTAAAAAEsVEMxap24sSkGS1nI3SsOigFyF';
var APP_URL = 'http://www.piktab.com/';
var STATIC_URL = 'https://image.flaticon.com/';


if (localStorage.OnInstalledReason) {
    _gaq.push(['_trackEvent', 'installSelf', 'installation_complete', localStorage.OnInstalledReason]);
	localStorage.removeItem('OnInstalledReason');
}
