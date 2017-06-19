// Copyright 2016 Google Inc. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Load the options, then register a keyboard listener.  We capture the event
// at the Window to let any handlers or listeners registered on the Document
// have a chance to handle it first.
var options;
chrome.storage.sync.get({
  blacklist: [],
  disableInApplets: true,
  whitelist: []
}, function(items) {
  options = items;
  window.addEventListener('keydown', handleBackspace);
});

// Update the local options when they're changed externally.
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === 'sync') {
    if (changes.blacklist)
      options.blacklist = changes.blacklist.newValue;
    if (changes.disableInApplets)
      options.disableInApplets = changes.disableInApplets.newValue;
    if (changes.whitelist)
      options.whitelist = changes.whitelist.newValue;
  }
});

// Check for shift-backspace or unmodified backspace and navigate if
// applicable.
function handleBackspace(e) {
  if (e.defaultPrevented ||
      e.key !== 'Backspace' ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      window.history.length < 2) // Nowhere to go back or forward to anyway.
    return;

  // The blacklist overrides everything.
  var url = window.location.href;
  if (options.blacklist.includes(url))
    return;

  // The whitelist overrides applet focus.
  // Before Chrome 55, listening on the Window means the event has no path,
  // instead pointing to the Window (see http://crbug.com/645527). In that
  // case, we have to look at the focused (active) element.
  // TODO: Switch entirely to e.path once Chrome 55 is launched.
  var target = e.path[0];
  if (target === window)
    target = document.activeElement;
  if (disabledInApplet(url, target))
    return;
  if (isEditable(target))
    return;

  // Make sure this extension is still active.
  // sendMessage throws an internal error, not reported in lastError, if the
  // other end no longer exists. So we use JS error-catching rather than
  // extension errors. See http://crbug.com/650872
  try {
    chrome.runtime.sendMessage('', function(response) {
      // Future-proofing in case sendMessage ever changes to setting lastError
      // instead of throwing a JS error.
      if (chrome.runtime.lastError) {
        window.removeEventListener('keydown', handleBackspace);
      } else {
        e.shiftKey ? window.history.forward(): window.history.back();
        e.preventDefault();
      }
    });
  } catch(error) {
    // If we have no connection to the background page, the extension has
    // been updated, disabled, or uninstalled. Remove our listener and do
    // nothing.
    window.removeEventListener('keydown', handleBackspace);
  }
}

// Return true if the option to disable the extension in applets is enabled,
// focus is in an embedded Flash or Java applet, and the current page is not
// in the whitelist of pages for which that should not apply.
function disabledInApplet(url, target) {
  if (!options.disableInApplets || options.whitelist.includes(url))
    return false;

  var nodeName = target.nodeName.toUpperCase();
  var nodeType = target.type || '';
  nodeType = nodeType.toLowerCase();
  if ((nodeName === 'EMBED' || nodeName === 'OBJECT') &&
      (nodeType === 'application/java' ||
       nodeType === 'application/pdf' ||
       nodeType === 'application/x-chat' ||
       nodeType === 'application/x-google-chrome-pdf' ||
       nodeType === 'application/x-shockwave-flash')) {
    return true;
  }
  return false;
}
