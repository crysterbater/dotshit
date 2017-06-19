var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
var licCheck  = window.localStorage.getItem('licCheckComplete');
var TRIAL_PERIOD_DAYS = 180;
var statusDiv;

function init() {
  statusDiv = $("#status");
  var appId = chrome.runtime.id;

  // Check for new version
  chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
      // show firstLaunch html
      chrome.tabs.create({'url': chrome.extension.getURL('firstLaunch.html')});
      getLicense();

    }else if(details.reason == "update" || details.reason == "chrome_update"){
      // Do nothing for 48 hours to prevent interrupting current users,
      // and have them click Get Started to update
      getLicense();
    }else if(licCheck === null || licCheck == false){
      getLicense();
    } 
  });

  chrome.runtime.onUpdateAvailable.addListener(function(details){
    getLicense();
  });

  chrome.runtime.onBrowserUpdateAvailable.addListener(function(details){
    getLicense();
  });

  chrome.runtime.onStartup.addListener(function(details){
    getLicense();
  });

  // Update every 4 hours = 60000ms * 60 * 4 = 14400000ms
  setInterval(function(){ 
    getLicense();
  }, 14400000);
}

/*****************************************************************************
* Call to license server to request the license
*****************************************************************************/

function getLicense() {
  xhrWithAuth('GET', CWS_LICENSE_API_URL + chrome.runtime.id, true, onLicenseFetched);
}

function onLicenseFetched(error, status, response) {
  console.log(error, status, response);
  response = JSON.parse(response);
  if (status === 200) {
    // response = JSON.parse(response);
    licenseStatusText = parseLicense(response);
  } else {
    licenseStatusText = 'unknown';
    console.log("error reading license");
  }

  if(licenseStatusText){
    // use Chrome storage.sync API later for cross-machine
    if(licenseStatusText === "Full"){
      window.localStorage.setItem('isLic', 'true');
    }else if(licenseStatusText === "None"){
      window.localStorage.setItem('isLic', 'false');
    }else if(licenseStatusText === "Free"){
      window.localStorage.setItem('isLic', 'true');
    }else if(licenseStatusText === "unknown"){
      // prob means they can't connect to server :(
      window.localStorage.setItem('isLic', 'error');
      // start over
      setInterval(function(){ 
        getLicense();
      }, 14400000);
    }
  }
  window.localStorage.setItem('licCheckComplete', 'true');
}

function parseLicense(license) {
  var licenseStatus;
  var licenseStatusText;
  if (license.result && license.accessLevel == "FULL") {
    licenseStatusText = "FULL";
  } else if (license.result && license.accessLevel == "FREE_TRIAL") {

    // calculate time passed since issued license
    window.localStorage.setItem('nowDate', Date.now());
    var stampAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
    daysAgoLicenseIssued = (stampAgoLicenseIssued / 1000 / 60 / 60 / 24);

    if (daysAgoLicenseIssued <= TRIAL_PERIOD_DAYS) {
      // update counter
      window.localStorage.setItem('daysLeftInTrial', TRIAL_PERIOD_DAYS - daysAgoLicenseIssued);

      if ( (TRIAL_PERIOD_DAYS - daysAgoLicenseIssued) > 0 ) {
        licenseStatusText = "FREE_TRIAL";
      } else {
        licenseStatusText = "FREE_TRIAL_EXPIRED";  
      }
    } else {
      licenseStatusText = "FREE_TRIAL_EXPIRED";
    }
  } else {
    // if never issued license - prob can't connect to server :(
    licenseStatusText = "NONE";
  }
  window.localStorage.setItem('licStatus', licenseStatusText);
}

/*****************************************************************************
* Helper method for making authenticated requests
*****************************************************************************/

// Helper Util for making authenticated XHRs
function xhrWithAuth(method, url, interactive, callback) {
  var retry = true;
  getToken();

  function getToken() {
    console.log("Getting auth token...");
    console.log("Calling chrome.identity.getAuthToken", interactive);
    chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
      if (chrome.runtime.lastError) {
        callback(chrome.runtime.lastError);
        return;
      }
      console.log("chrome.identity.getAuthToken returned a token", token);
      access_token = token;
      requestStart();
    });
  }

  // verify license
  function requestStart() {
    console.log("Starting authenticated XHR...");
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.onload = requestComplete;
    xhr.send();
  }

  function requestComplete() {
    console.log("Authenticated XHR completed.");
    if (this.status == 401 && retry) {
      retry = false;
      //if user changes password, remove their token to avoid errors
      chrome.identity.removeCachedAuthToken({ token: access_token },
                                            getToken);
    } else {
      callback(null, this.status, this.response);
    }
  }
}

init();