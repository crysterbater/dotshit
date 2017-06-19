(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = cookie;
function cookie(name, value, options) {
  if (arguments.length < 2) return get(name);
  set(name, value, options);
}

function set(name, value) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var str = encode(name) + '=' + encode(value);

  if (value == null) options.maxage = -1;

  if (options.maxage) options.expires = new Date(+new Date() + options.maxage);

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

function get(name) {
  var cookies = parse(document.cookie);
  return !!name ? cookies[name] : cookies;
}

function parse(str) {
  var obj = {},
      pairs = str.split(/ *; */);

  if (!pairs[0]) return obj;

  for (var _iterator = pairs, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var pair = _ref;

    pair = pair.split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

function encode(value) {
  try {
    return encodeURIComponent(value);
  } catch (e) {
    return null;
  }
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return null;
  }
}
},{}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var cookie_1 = require("@grammarly-npm/cookie");
var util_1 = require("./util");
var storageKeyName = 'gnar_containerId';
var storageTestKeyName = 'gnar_containerId_test';
var containerIdLength = 12;
// 10 years from now
var cookieExpiration = function () { return new Date().setFullYear(new Date().getFullYear() + 10); };
// 10 minutes from now
var testCookieExpiration = function () { return new Date().setMinutes(new Date().getMinutes() + 10); };
var cookieDomainRegExp = /^\.\w+\.\w+/;
function success(value) {
    return {
        type: 'success',
        value: value
    };
}
function failure(error) {
    return {
        type: 'failure',
        error: error
    };
}
function lift(promise) {
    return promise.then(success, failure);
}
function retry(times, backoffMillis, f) {
    var res = f();
    if (times > 0) {
        return res.catch(function (_) {
            return new Promise(function (resolve, _) { return setTimeout(resolve, backoffMillis); })
                .then(function (_) { return retry(times - 1, backoffMillis, f); });
        });
    }
    else {
        return res;
    }
}
/**
 * To avoid concurrency issues (e.g. when get container id is fetched almost simultaneously)
 * and to reduce the rate with which we trigger expensive storage apis
 * the following logic is implemented:
 * - we cache and reuse the promise for asynchronous container id extraction while it get's executed
 * - we keep and reuse the completed promise for the timeout, configured separately
 * for success and failure
 */
var ContainerIdManager = (function () {
    /**
     * @param primaryStorage storage that is used as a primary source of truth for getting
     * and storing containerId. Is required to be be able to get and set value successfully
     * for the whole manager to retrieve containerId successfully.
     * @param secondaryStorages backup storages from which we can recover containerId in case
     * primaryStorage was cleared.
     * @param _logger manager-specific logger
     * @param _metric manager-specific metrics
     * @param _cacheSuccessTimeoutMillis for how long to cache the successfully extracted containerId
     * (negative means 'cache forever')
     * @param _cacheFailureTimeoutMillis for how long to cache the failed containerId extraction
     * (negative means 'cache forever')
     * @param _getTime function that returns current time in millis
     * (default should be overloaded only in tests)
     */
    function ContainerIdManager(primaryStorage, secondaryStorages, _logger, _metric, _cacheSuccessTimeoutMillis, // 5 mins
        _cacheFailureTimeoutMillis, _getTime) {
        if (secondaryStorages === void 0) { secondaryStorages = []; }
        if (_cacheSuccessTimeoutMillis === void 0) { _cacheSuccessTimeoutMillis = 300000; }
        if (_cacheFailureTimeoutMillis === void 0) { _cacheFailureTimeoutMillis = 0; }
        if (_getTime === void 0) { _getTime = function () { return Date.now(); }; }
        this.primaryStorage = primaryStorage;
        this.secondaryStorages = secondaryStorages;
        this._logger = _logger;
        this._metric = _metric;
        this._cacheSuccessTimeoutMillis = _cacheSuccessTimeoutMillis;
        this._cacheFailureTimeoutMillis = _cacheFailureTimeoutMillis;
        this._getTime = _getTime;
        this._allStorages = [primaryStorage].concat(secondaryStorages);
    }
    ContainerIdManager.prototype._expireCache = function (timeoutMillis) {
        if (timeoutMillis === 0) {
            this._cacheExpireTimestamp = 0;
        }
        else if (timeoutMillis > 0) {
            this._cacheExpireTimestamp = this._getTime() + timeoutMillis;
        }
        // don't expire cache at all if timeout is negative
    };
    /**
     * Returns a containerId promise. Clients should handle the case of failure gracefully
     * (without affecting user experience).
     */
    ContainerIdManager.prototype.getContainerId = function () {
        var _this = this;
        if (this._cache !== undefined
            && (this._cacheExpireTimestamp === undefined
                || this._getTime() < this._cacheExpireTimestamp)) {
            return this._cache;
        }
        var timer = this._metric.getTimer('doGetContainerId.timer').start();
        var result = this._doGetContainerId();
        this._cache = result;
        this._cacheExpireTimestamp = undefined;
        result.then(function (_) { return _this._expireCache(_this._cacheSuccessTimeoutMillis); }, function (_) { return _this._expireCache(_this._cacheFailureTimeoutMillis); });
        result.then(function (_) {
            timer.stop();
            _this._metric.getCounter('doGetContainerId.success').increment();
        }, function (error) {
            timer.stop();
            _this._metric.getCounter('doGetContainerId.failure').increment();
            _this._logger.warn('doGetContainerId.failed', error);
        });
        return result;
    };
    ContainerIdManager._generateContainerId = function () {
        return util_1.alphanumeric(containerIdLength);
    };
    /**
     * This method produces containerId based on the following logic:
     * - executes safeGetContainerId for all the storages, lifts and collects the promises
     * - if the primary storage (first in storages list) failed, failed promise is returned
     * - otherwise take the first successful non-empty container as a result candidate, if none
     * generate new
     * - spread the resulting value across all the storages that successfully returned
     * different or empty value
     * - if setting to primary storage was performed and failed return the failed promise
     * - otherwise return the successful promise with selected containerId
     */
    ContainerIdManager.prototype._doGetContainerId = function () {
        var _this = this;
        // lifting results cause we need to work with both successes and failures
        var lifted = Promise.all(this._allStorages.map(function (storage) { return lift(storage.safeGetContainerId()); }));
        return lifted.then(function (getResults) {
            var primaryGetResult = getResults[0];
            if (primaryGetResult.type === 'failure') {
                return Promise.reject("getting containerId from primary storage " +
                    ("'" + _this.primaryStorage.name + "' has failed: " + primaryGetResult.error));
            }
            // get the value from the first working non-empty storage
            var nonEmptyResult = getResults.find(function (result) {
                return result.type === 'success' && result.value !== undefined;
            }
            // casting here as ts does not figure out
            // that we filtered failures out
            );
            var recovered = primaryGetResult.type === 'success' &&
                primaryGetResult.value === undefined &&
                nonEmptyResult !== undefined;
            var containerId;
            var generated = false;
            if (nonEmptyResult === undefined) {
                containerId = ContainerIdManager._generateContainerId();
                generated = true;
            }
            else {
                containerId = nonEmptyResult.value;
            }
            // save it to every storage with different value (don't save to those that failed to get)
            var setPromises = getResults.map(function (result, index) {
                if (result.type === 'success' && result.value !== containerId) {
                    return lift(_this._allStorages[index].safeSetContainerId(containerId));
                }
                else {
                    return Promise.resolve(success(undefined));
                }
            });
            // wait till all set's are done, return successfully if primary succeeded
            var result = Promise.all(setPromises).then(function (setResults) {
                // primary result will be first in set results only if we recovered value or generated new
                if (recovered || generated) {
                    var primarySetResult = setResults[0];
                    if (primarySetResult.type !== 'success') {
                        return Promise.reject("setting containerId to primary storage has failed: " + primarySetResult.error);
                    }
                }
                return Promise.resolve(containerId);
            });
            result.then(function (_) {
                if (recovered) {
                    _this._metric.getCounter('recovered').increment();
                }
                else if (generated) {
                    _this._metric.getCounter('generated').increment();
                }
            });
            return result;
        });
    };
    return ContainerIdManager;
}());
exports.ContainerIdManager = ContainerIdManager;
var BaseStorage = (function () {
    function BaseStorage(name) {
        this.name = name;
    }
    BaseStorage.prototype.safeSetContainerId = function (containerId) {
        var _this = this;
        return this.ensureAvailable().then(function () { return _this.setContainerId(containerId); });
    };
    BaseStorage.prototype.safeGetContainerId = function () {
        var _this = this;
        return this.ensureAvailable().then(function () { return _this.getContainerId(); })
            .then(function (cid) { return cid === '' ? undefined : cid; });
    };
    return BaseStorage;
}());
exports.BaseStorage = BaseStorage;
/**
 * Chrome cookie storage.
 * This storage doesn't respect user cookie settings.
 * It will work even if the user disabled cookies.
 */
var ChromeCookieStorage = (function (_super) {
    __extends(ChromeCookieStorage, _super);
    function ChromeCookieStorage(_url, _domain) {
        var _this = _super.call(this, 'chromeCookie') || this;
        _this._url = _url;
        _this._domain = _domain;
        if (!cookieDomainRegExp.test(_domain))
            throw new Error("Incorrect cookie domain provided.\n        Use top-level domain, starting from \".\"");
        return _this;
    }
    ChromeCookieStorage.prototype._hasRuntimeError = function () {
        return window.chrome && window.chrome.runtime && window.chrome.runtime.lastError;
    };
    ChromeCookieStorage.prototype.ensureAvailable = function () {
        var _this = this;
        return retry(2, 1000, function () { return new Promise(function (resolve, reject) {
            var value = util_1.alphanumeric(10);
            try {
                window.chrome.cookies.set({
                    name: value,
                    value: value,
                    url: _this._url,
                    domain: _this._domain,
                    // chrome cookies API requires seconds in expiration date, not ms.
                    expirationDate: testCookieExpiration() / 1000
                }, function (cookie) {
                    var error = _this._hasRuntimeError();
                    if (!cookie && error)
                        reject('chrome.cookie.set failed with an error: ' + error.message);
                    if (!cookie || cookie.value !== value) {
                        reject(new Error("ChromeCookieStorage is unavailable.\n              Availability test failed.\n              Tried to set " + value + ", the result is " + (cookie ? cookie.value : cookie) + "."));
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        }); });
    };
    ChromeCookieStorage.prototype.getContainerId = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                window.chrome.cookies.get({
                    url: _this._url,
                    name: storageKeyName
                }, function (cookie) {
                    var error = _this._hasRuntimeError();
                    if (!cookie && error)
                        reject('chrome.cookie.get failed with an error: ' + error.message);
                    resolve(cookie ? cookie.value : undefined);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    };
    ChromeCookieStorage.prototype.setContainerId = function (containerId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                window.chrome.cookies.set({
                    name: storageKeyName,
                    value: containerId,
                    url: _this._url,
                    domain: _this._domain,
                    // chrome cookies API requires seconds in expiration date, not ms.
                    expirationDate: cookieExpiration() / 1000
                }, function (cookie) {
                    var error = _this._hasRuntimeError();
                    if (!cookie && error)
                        reject('chrome.cookie.set failed with an error: ' + error.message);
                    if (!cookie || cookie.value !== containerId)
                        reject(new Error("setContainerId failed.\n            Tried to set " + containerId + ", the result is " + (cookie ? cookie.value : cookie) + "."));
                    resolve();
                });
            }
            catch (e) {
                reject(e);
            }
        });
    };
    return ChromeCookieStorage;
}(BaseStorage));
exports.ChromeCookieStorage = ChromeCookieStorage;
/**
 * Web Extensions cookie storage.
 */
var WebExtensionsCookieStorage = (function (_super) {
    __extends(WebExtensionsCookieStorage, _super);
    function WebExtensionsCookieStorage(_url, _domain) {
        var _this = _super.call(this, 'webExtensionsCookie') || this;
        _this._url = _url;
        _this._domain = _domain;
        if (!cookieDomainRegExp.test(_domain))
            throw new Error("Incorrect cookie domain provided.\n        Use top-level domain, starting from \".\"");
        return _this;
    }
    WebExtensionsCookieStorage.prototype.ensureAvailable = function () {
        var _this = this;
        return retry(2, 1000, function () { return new Promise(function (resolve, reject) {
            var value = util_1.alphanumeric(10);
            window.browser.cookies.set({
                name: value,
                value: value,
                url: _this._url,
                domain: _this._domain,
                // web extensions cookies API requires seconds in expiration date, not ms.
                expirationDate: testCookieExpiration() / 1000
            }).then(function () {
                window.browser.cookies.get({
                    url: _this._url,
                    name: value
                }).then(function (cookie) {
                    if (!cookie || cookie.value !== value) {
                        reject(new Error("WebExtensionsCookieStorage is unavailable.\n              Availability test failed.\n              Tried to set " + value + ", the result is " + (cookie ? cookie.value : cookie) + "."));
                    }
                    else {
                        resolve();
                    }
                }).catch(function (error) {
                    reject('browser.cookies.get failed with an error: ' + error.message);
                });
            }).catch(function (error) {
                reject('browser.cookies.set failed with an error: ' + error.message);
            });
        }); });
    };
    WebExtensionsCookieStorage.prototype.getContainerId = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            window.browser.cookies.get({
                url: _this._url,
                name: storageKeyName
            }).then(function (cookie) {
                resolve(cookie ? cookie.value : undefined);
            }).catch(function (error) {
                reject('browser.cookies.get failed with an error: ' + error.message);
            });
        });
    };
    WebExtensionsCookieStorage.prototype.setContainerId = function (containerId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            window.browser.cookies.set({
                name: storageKeyName,
                value: containerId,
                url: _this._url,
                domain: _this._domain,
                // web extensions cookies API requires seconds in expiration date, not ms.
                expirationDate: cookieExpiration() / 1000
            }).then(function (cookie) {
                if (!cookie || cookie.value !== containerId)
                    reject(new Error("setContainerId failed.\n          Tried to set " + containerId + ", the result is " + (cookie ? cookie.value : cookie) + "."));
                resolve();
            }).catch(function (error) {
                reject('browser.cookies.set failed with an error: ' + error.message);
            });
        });
    };
    return WebExtensionsCookieStorage;
}(BaseStorage));
exports.WebExtensionsCookieStorage = WebExtensionsCookieStorage;
var LocalStorage = (function (_super) {
    __extends(LocalStorage, _super);
    function LocalStorage() {
        return _super.call(this, 'localStorage') || this;
    }
    LocalStorage.prototype.ensureAvailable = function () {
        var value = util_1.alphanumeric(10);
        return new Promise(function (resolve, reject) {
            localStorage.setItem(storageTestKeyName, value);
            if (localStorage.getItem(storageTestKeyName) !== value) {
                reject(new Error("LocalStorage is unavailable.\n          Availability test failed.\n          Tried to set " + value + ", the result is " + localStorage.getItem(storageTestKeyName) + "."));
            }
            else {
                resolve();
            }
            localStorage.removeItem(storageTestKeyName);
        });
    };
    LocalStorage.prototype.getContainerId = function () {
        // If there is no item in LocalStorage, `null` will be returned.
        // We need undefined in this case.
        var value = localStorage.getItem(storageKeyName);
        return new Promise(function (resolve, _) { return resolve(value === null ? undefined : value); });
    };
    LocalStorage.prototype.setContainerId = function (containerId) {
        return new Promise(function (resolve, _) {
            localStorage.setItem(storageKeyName, containerId);
            resolve();
        });
    };
    return LocalStorage;
}(BaseStorage));
exports.LocalStorage = LocalStorage;
var CookieStorage = (function (_super) {
    __extends(CookieStorage, _super);
    function CookieStorage(_domain) {
        var _this = _super.call(this, 'cookie') || this;
        _this._domain = _domain;
        if (!cookieDomainRegExp.test(_domain))
            throw new Error("Incorrect cookie domain provided.\n        Use top-level domain, starting from \".\"");
        return _this;
    }
    CookieStorage.prototype._getCookieOptions = function () {
        return {
            path: '/',
            domain: this._domain,
            expires: new Date(cookieExpiration())
        };
    };
    CookieStorage.prototype.ensureAvailable = function () {
        var value = util_1.alphanumeric(10);
        return new Promise(function (resolve, reject) {
            cookie_1.default(value, value);
            if (cookie_1.default(value) !== value) {
                reject(new Error("CookieStorage is unavailable.\n          Availability test failed.\n          Tried to set " + value + ", the result is " + cookie_1.default(value) + "."));
            }
            else {
                resolve();
            }
            // cleanup
            cookie_1.default(value, null);
        });
    };
    CookieStorage.prototype.getContainerId = function () {
        return new Promise(function (resolve, _) { return resolve(cookie_1.default(storageKeyName)); });
    };
    CookieStorage.prototype.setContainerId = function (containerId) {
        var _this = this;
        return new Promise(function (resolve, _) {
            cookie_1.default(storageKeyName, containerId, _this._getCookieOptions());
            resolve();
        });
    };
    return CookieStorage;
}(BaseStorage));
exports.CookieStorage = CookieStorage;
var BackendStorage = (function (_super) {
    __extends(BackendStorage, _super);
    function BackendStorage(_fetch, _url) {
        var _this = _super.call(this, 'backend') || this;
        _this._fetch = _fetch;
        _this._url = _url;
        _this._keyName = storageKeyName;
        _this._testKeyName = storageTestKeyName;
        _this._baseUrl = _url + '/cookies';
        return _this;
    }
    BackendStorage.prototype.ensureAvailable = function () {
        var _this = this;
        var value = util_1.alphanumeric(10);
        var maxAge = (testCookieExpiration() - Date.now()) / 1000;
        var getUrl = this._baseUrl + "?name=" + this._testKeyName;
        var postUrl = getUrl + "&value=" + value + "&maxAge=" + maxAge;
        return this._doSend(postUrl, 'post').then(function (response) {
            if (!response.ok) {
                throw new Error("BackendStorage is unavailable.\n          Availability test failed.\n          Tried to set " + value + ". Request failed.\n        ");
            }
        }).then(function () { return _this._doSend(getUrl, 'get')
            .then(function (response) {
            if (!response.ok) {
                throw new Error("BackendStorage is unavailable.\n            Availability test failed.\n            Tried to get " + _this._testKeyName + " from server. Request failed.");
            }
            else {
                return response.json().then(function (obj) {
                    if (obj.value !== value) {
                        throw new Error("BackendStorage is unavailable.\n                Availability test failed.\n                Tried to get " + _this._testKeyName + " from server.\n                Got " + obj.value + " instead of " + value + ".");
                    }
                });
            }
        }); });
    };
    BackendStorage.prototype._doSend = function (url, method) {
        return this._fetch(url, {
            credentials: 'include',
            method: method
        });
    };
    BackendStorage.prototype.getContainerId = function () {
        var url = this._baseUrl + "?name=" + this._keyName;
        return this._doSend(url, 'get')
            .then(function (response) { return response.json(); })
            .then(function (obj) { return obj.value; });
    };
    BackendStorage.prototype.setContainerId = function (containerId) {
        var maxAge = (cookieExpiration() - Date.now()) / 1000;
        var url = this._baseUrl + "?name=" + this._keyName + "&value=" + containerId + "&maxAge=" + maxAge;
        return this._doSend(url, 'post').then(function () { });
    };
    return BackendStorage;
}(BaseStorage));
exports.BackendStorage = BackendStorage;
var MemoryStorage = (function (_super) {
    __extends(MemoryStorage, _super);
    function MemoryStorage(_value) {
        if (_value === void 0) { _value = undefined; }
        var _this = _super.call(this, 'memory') || this;
        _this._value = _value;
        return _this;
    }
    MemoryStorage.prototype.ensureAvailable = function () {
        return Promise.resolve();
    };
    MemoryStorage.prototype.getContainerId = function () {
        return Promise.resolve(this._value);
    };
    MemoryStorage.prototype.setContainerId = function (containerId) {
        this._value = containerId;
        return Promise.resolve();
    };
    return MemoryStorage;
}(BaseStorage));
exports.MemoryStorage = MemoryStorage;

},{"./util":4,"@grammarly-npm/cookie":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var container_id_manager_1 = require("./container_id_manager");
exports.ContainerIdManager = container_id_manager_1.ContainerIdManager;
exports.BaseStorage = container_id_manager_1.BaseStorage;
exports.MemoryStorage = container_id_manager_1.MemoryStorage;
exports.LocalStorage = container_id_manager_1.LocalStorage;
exports.CookieStorage = container_id_manager_1.CookieStorage;
exports.ChromeCookieStorage = container_id_manager_1.ChromeCookieStorage;
exports.WebExtensionsCookieStorage = container_id_manager_1.WebExtensionsCookieStorage;
exports.BackendStorage = container_id_manager_1.BackendStorage;
var reservedPropNames = [
    'eventName', 'client', 'clientVersion', 'userId', 'isTest',
    'containerId', 'instanceId', 'batchId'
];
var localStoragePingKeyName = 'gnar_nextPingTimestamp';
/**
 * GnarClient implementation.
 * Sends event to server, takes care of queueing, before setUser call,
 * and executing queue after setUser call.
 * Additionally has page and ping methods to track pings and pageviews
 */
var GnarClientImpl = (function () {
    /**
     * @param _url gnar enpoint url, with protocol, host/port and no path
     * @param _client name of the client, will become a 'client' prop value in events
     * @param _clientVersion client version
     * @param _fetch
     * @param _containerIdManager
     * @param _logger gnar specific logger
     * @param _metric gnar specific metric
     * @param _storePingTimestamp whether ping throttling should be done based on timestamp
     * stored in local storage compared to just memory.
     */
    function GnarClientImpl(_url, _client, _clientVersion, _fetch, _containerIdManager, _logger, _metric, _storePingTimestamp) {
        if (_storePingTimestamp === void 0) { _storePingTimestamp = false; }
        this._client = _client;
        this._clientVersion = _clientVersion;
        this._fetch = _fetch;
        this._containerIdManager = _containerIdManager;
        this._logger = _logger;
        this._metric = _metric;
        this._storePingTimestamp = _storePingTimestamp;
        this._batchId = 0;
        this._instanceId = util_1.alphanumeric(8);
        this._isReady = false;
        this._queue = [];
        this._eventsUrl = _url + '/events';
        this._pingMaybe();
    }
    GnarClientImpl.prototype.track = function (eventName, props) {
        if (props === void 0) { props = {}; }
        if (eventName.indexOf(this._client + '/') === 0) {
            throw new Error("Event name " + eventName + " should not start with '" + this._client + "/'");
        }
        Object.keys(props).forEach(function (key) {
            if (reservedPropNames.indexOf(key) !== -1) {
                throw new Error("Event data should not contain '" + key + "' prop.");
            }
        });
        if (this._isReady) {
            /**
             * Each time event is sent try to ping.
             * Except when 'ping' event is sent itself.
             */
            if (eventName !== 'ping')
                this._pingMaybe();
            this._send(eventName, props);
        }
        else {
            this._enqueue(eventName, props);
        }
    };
    GnarClientImpl.prototype.setUser = function (id, isTest) {
        if (id === null || id === '') {
            throw new Error('Invalid userId: ' + id);
        }
        /**
         * Send forced ping if userId was previously set, and it changed from
         * - authenticated to anonymous
         * - authenticated to authenticated
         * - anonymous to authenticated
         * but NOT
         * - anonymous to anonymous
         */
        var shouldSendPing = this._userId && this._userId !== id
            && !(/^-/.test(id) && /^-/.test(this._userId));
        this._isTest = isTest;
        this._userId = id;
        if (shouldSendPing)
            this._pingMaybe(true);
        if (!this._isReady) {
            this._execQueue();
            this._isReady = true;
        }
    };
    GnarClientImpl.prototype.getContainerId = function () {
        return this._containerIdManager.getContainerId();
    };
    GnarClientImpl.prototype._setNextPingTimestamp = function () {
        var ts = util_1.getNextPingDate();
        this._nextPingTimestamp = ts;
        if (this._storePingTimestamp) {
            try {
                localStorage.setItem(localStoragePingKeyName, ts.toString());
            }
            catch (error) {
                this._metric.getCounter('nextPingDate.write.failure').increment();
                this._logger.warn('nextPingDate.write.failed', error);
            }
        }
    };
    GnarClientImpl.prototype._getNextPingTimestamp = function () {
        var ts = this._nextPingTimestamp;
        if (ts !== undefined || !this._storePingTimestamp)
            return ts;
        try {
            var stored = localStorage.getItem(localStoragePingKeyName);
            ts = (stored === null) ? undefined : parseInt(stored, 10);
        }
        catch (error) {
            ts = undefined;
            this._metric.getCounter('nextPingDate.read.failure').increment();
            this._logger.warn('nextPingDate.read.failed', error);
        }
        return ts;
    };
    GnarClientImpl.prototype._shouldPing = function (force) {
        if (force) {
            return true;
        }
        else {
            var ts = this._getNextPingTimestamp();
            return ts === undefined || ts < Date.now();
        }
    };
    /**
     * Ping should be sent once a day.
     * Next pingDate is set to be random time at 3-4AM in the morning,
     * so that next day pings are sent when user wakes up.
     * Other ping attempts will be ignored.
     *
     * @param force - force-send a ping, and refresh nextPingDate
     */
    GnarClientImpl.prototype._pingMaybe = function (force) {
        if (force === void 0) { force = false; }
        if (!this._shouldPing(force))
            return;
        this._setNextPingTimestamp();
        var props = {
            referrer: document.referrer,
            url: document.location.href,
            userAgent: navigator.userAgent,
            navigatorAppName: navigator.appName,
            navigatorAppCodeName: navigator.appCodeName,
            navigatorAppVersion: navigator.appVersion,
            navigatorVendor: navigator.vendor,
            screenWidth: screen.width,
            screenHeight: screen.height
        };
        this.track('ping', props);
    };
    GnarClientImpl.prototype.pingMaybe = function () {
        this._pingMaybe();
    };
    GnarClientImpl.prototype._enqueue = function (eventName, props) {
        this._queue.push([eventName, props]);
    };
    GnarClientImpl.prototype._execQueue = function () {
        var _this = this;
        this._queue.forEach(function (_a) {
            var eventName = _a[0], data = _a[1];
            return _this._send(eventName, data);
        });
        this._queue = [];
    };
    GnarClientImpl.prototype._send = function (eventName, props) {
        var _this = this;
        var batchId = this._batchId++;
        this.getContainerId().then(function (containerId) {
            var event = {
                eventName: _this._client + "/" + eventName,
                client: _this._client,
                clientVersion: _this._clientVersion,
                userId: _this._userId,
                isTest: _this._isTest,
                containerId: containerId,
                instanceId: _this._instanceId,
                batchId: batchId
            };
            return _this._doSend(event, props);
        }).catch(function (error) {
            _this._metric.getCounter('send.failure').increment();
            _this._logger.warn('send.failed', error);
        });
    };
    GnarClientImpl.prototype._doSend = function (data, props) {
        return this._fetch(this._eventsUrl, {
            mode: 'cors',
            credentials: 'include',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: [Object.assign(data, props)]
            })
        });
    };
    return GnarClientImpl;
}());
exports.GnarClientImpl = GnarClientImpl;
/**
 * GnarClient mock implementation.
 * Stores events in memory.
 */
var MemoryGnarClient = (function () {
    function MemoryGnarClient() {
        this.history = [];
    }
    MemoryGnarClient.prototype.track = function (eventName, props) {
        if (props === void 0) { props = {}; }
        this.history.push({ eventName: eventName, props: props });
    };
    MemoryGnarClient.prototype.pingMaybe = function () { };
    MemoryGnarClient.prototype.setUser = function (_, __) { };
    MemoryGnarClient.prototype.getContainerId = function () {
        return Promise.resolve('dummy_container_id');
    };
    return MemoryGnarClient;
}());
exports.MemoryGnarClient = MemoryGnarClient;
/**
 * GnarClient mock implementation.
 * Stores events in local storage.
 */
var LocalStorageGnarClient = (function () {
    function LocalStorageGnarClient() {
    }
    LocalStorageGnarClient.prototype.track = function (eventName, props) {
        if (props === void 0) { props = {}; }
        var storageKey = 'trackingGnar';
        try {
            var data = JSON.parse(localStorage.getItem(storageKey)) || [];
            data.push({ eventName: eventName, props: props });
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
        catch (error) {
            // we don't need tests to fail because of local storage
        }
    };
    LocalStorageGnarClient.prototype.pingMaybe = function () { };
    LocalStorageGnarClient.prototype.setUser = function (_, __) { };
    LocalStorageGnarClient.prototype.getContainerId = function () {
        return Promise.resolve('dummy_container_id');
    };
    return LocalStorageGnarClient;
}());
exports.LocalStorageGnarClient = LocalStorageGnarClient;

},{"./container_id_manager":2,"./util":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generate random alphanumeric string of a given length
 */
var allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function alphanumeric(num, res) {
    if (res === void 0) { res = ''; }
    if (num <= 0)
        return res;
    var random = Math.floor((Math.random() * (allowed.length - 1)));
    return alphanumeric(num - 1, res + allowed.charAt(random));
}
exports.alphanumeric = alphanumeric;
/**
 * Get random local time between 3-4AM next day
 * (or same day if it's less then two hrs since midnight)
 */
function getNextPingDate() {
    var now = new Date();
    if (now.getHours() > 2) {
        now.setDate(now.getDate() + 1);
    }
    now.setHours(3);
    now.setMinutes(Math.floor(Math.random() * 60));
    return now.getTime();
}
exports.getNextPingDate = getNextPingDate;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ring_buffer_1 = require("./ring_buffer");
/**
 *  Logs proxy that aggregates log entries in a cyclic buffer until trigger condition occurs.
 *  It reports the whole log afterwards to separate crash logger.
 *  Usage example:
 *
 *  let crashLoggerWrapper =
 *    new CrashLogWrapper(500, LogLevel.ERROR, plainSink, rootLogger.getLogger('crashLog'))
 *  let loggerImpl = new SimpleLogger(..., crashLoggerWrapper.sink)
 *
 */
var CrashLogWrapper = (function () {
    /**
     * @param cacheSize A maximum number of log entries to store
     * @param trigger A trigger function or minimal log level that will trigger crash log reporting
     * @param _eventsSink Log entries destination
     * @param _crashLogger Logger to report aggregated crash logs to.
     */
    function CrashLogWrapper(cacheSize, trigger, _eventsSink, _crashLogger) {
        var _this = this;
        this._eventsSink = _eventsSink;
        this._crashLogger = _crashLogger;
        this._crashLogged = false;
        /**
         * Sink to be used by clients to submit log entries
         */
        this.sink = function (event) {
            _this._buffer.push(event);
            _this._eventsSink(event);
            if (_this._trigger(event)) {
                _this._sendCrashLog(event);
            }
        };
        this._buffer = new ring_buffer_1.RingBuffer(cacheSize, true);
        this._trigger =
            typeof trigger === 'function'
                ? trigger
                : function (event) { return event.level >= trigger; };
    }
    CrashLogWrapper.prototype._sendCrashLog = function (triggeredBy) {
        if (!this._crashLogged || this._buffer.size > this._buffer.capacity / 2) {
            // we don't know exactly what events can be in the _buffer
            // that's why we need safe parsing for crash logs events
            // or we'll have possible get an error by converting circular structure to JSON
            var crashLog = void 0;
            try {
                crashLog = JSON.stringify(this._buffer, undefined, '');
            }
            catch (err) {
                // for fast fix we can just send this error like crashLog
                // better will be try to serialize events from buffer one by one
                crashLog = err;
            }
            this._crashLogger.log(triggeredBy.level, 'CrashLog', { events: crashLog, first: !this._crashLogged });
            this._crashLogged = true;
            // purge log, so we don't report it again
            this._buffer.clear();
        }
    };
    return CrashLogWrapper;
}());
exports.CrashLogWrapper = CrashLogWrapper;

},{"./ring_buffer":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./log4ts");
exports.Logging = Logging;
var LoggingImpl = require("./log4ts_impl");
exports.LoggingImpl = LoggingImpl;
var TimeSeries = require("./timeseries");
exports.TimeSeries = TimeSeries;
var TimeSeriesImpl = require("./timeseries_impl");
exports.TimeSeriesImpl = TimeSeriesImpl;
var utils_1 = require("./utils");
exports.EventProps = utils_1.EventProps;
var Monitoring;
(function (Monitoring) {
    var Logging = (function () {
        function Logging() {
        }
        Object.defineProperty(Logging, "root", {
            get: function () {
                return LoggingImpl.LoggingConfig.getRootLogger();
            },
            enumerable: true,
            configurable: true
        });
        Logging.getLogger = function (name, level) {
            return Logging.root.getLogger(name, level);
        };
        return Logging;
    }());
    Monitoring.Logging = Logging;
    var TimeSeries = (function () {
        function TimeSeries() {
        }
        Object.defineProperty(TimeSeries, "root", {
            get: function () {
                return TimeSeriesImpl.MetricsConfig.getRootMetric();
            },
            enumerable: true,
            configurable: true
        });
        return TimeSeries;
    }());
    Monitoring.TimeSeries = TimeSeries;
})(Monitoring = exports.Monitoring || (exports.Monitoring = {}));

},{"./log4ts":7,"./log4ts_impl":8,"./timeseries":10,"./timeseries_impl":11,"./utils":12}],7:[function(require,module,exports){
/*
 *  Simple Logging interface
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Logging level is used to filter out certain logging event in a logging pipeline.
 * For this LogLevel of a message is compared against Logger's LogLevel level.
 */
var LogLevel;
(function (LogLevel) {
    /**
     * Finest grained logging, like entering/leaving a function, dumping objects values etc, can
     * produce a LOT of output
     */
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    /**
     * Debug information not needed in a production env. Mainly for troubleshooting
     */
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    /**
     * Useful information about app functioning such as application start, making some
     * transactional actions etc. Generally should be preserved in production
     */
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    /**
     * Warning on some potentially dangerous or problematic situation, like a successfully
     * handled error.
     */
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    /**
     * Non fatal error, which might lead to a problem but generally application should continue
     * to work.
     */
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    /** Fatal error meaning application cannot be used after it. */
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
    /** Logging is OFF */
    LogLevel[LogLevel["OFF"] = 6] = "OFF";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
(function (LogLevel) {
    /**
     * Create a LogLevel value from a log level string.
     */
    function fromString(levelString) {
        switch (levelString) {
            case 'TRACE': return LogLevel.TRACE;
            case 'DEBUG': return LogLevel.DEBUG;
            case 'INFO': return LogLevel.INFO;
            case 'WARN': return LogLevel.WARN;
            case 'ERROR': return LogLevel.ERROR;
            case 'FATAL': return LogLevel.FATAL;
            case 'OFF': return LogLevel.OFF;
            default:
                var _ = levelString;
                throw new TypeError("Unrecognized log level string '" + levelString + "'");
        }
    }
    LogLevel.fromString = fromString;
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var log4ts_1 = require("./log4ts");
var utils_2 = require("./utils");
var crash_logger_1 = require("./crash_logger");
var ring_buffer_1 = require("./ring_buffer");
var TreeContext = (function () {
    function TreeContext(parent) {
        this.parent = parent;
        this.context = undefined;
    }
    TreeContext.prototype.get = function () {
        var parentContext = this.parent && this.parent.get();
        var context = this.context;
        return parentContext || context
            ? Object.assign({}, parentContext, context)
            : undefined;
    };
    TreeContext.prototype.add = function (ctx) {
        this.context = Object.assign({}, this.context, ctx);
    };
    TreeContext.prototype.remove = function (keys) {
        var _this = this;
        if (this.context) {
            keys.forEach(function (k) {
                if (k in _this.context)
                    delete _this.context[k];
            });
        }
    };
    TreeContext.prototype.clear = function () {
        this.context = undefined;
    };
    return TreeContext;
}());
exports.TreeContext = TreeContext;
/**
 * Helper that simplifies implementation of Logger interface
 */
var AbstractLogger = (function () {
    function AbstractLogger(name, level, context) {
        this.name = name;
        this.level = level;
        this.context = context;
        utils_1.validateName(name);
    }
    AbstractLogger.prototype.isEnabled = function (level) {
        return level >= this.level;
    };
    AbstractLogger.prototype.handler = function (message, extra) {
        var _this = this;
        return {
            /* tslint:disable:semicolon */
            trace: function (error) { _this.trace(message, error, extra); throw error; },
            debug: function (error) { _this.debug(message, error, extra); throw error; },
            info: function (error) { _this.info(message, error, extra); throw error; },
            warn: function (error) { _this.warn(message, error, extra); throw error; },
            error: function (error) { _this.error(message, error, extra); throw error; },
            fatal: function (error) { _this.fatal(message, error, extra); throw error; }
            /* tslint:enable */
        };
    };
    // Conventional methods for #log(event: LogLevel)
    AbstractLogger.prototype.trace = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.TRACE, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.debug = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.DEBUG, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.info = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.INFO, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.warn = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.WARN, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.error = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.ERROR, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.fatal = function (message, exceptionOrExtra, extra) {
        this.log(log4ts_1.LogLevel.FATAL, message, exceptionOrExtra, extra);
    };
    AbstractLogger.prototype.log = function (level, message, exceptionOrExtra, extra) {
        if (this.isEnabled(level)) {
            if (exceptionOrExtra && extra || utils_2.ErrorLike.isErrorLike(exceptionOrExtra)) {
                this.logImpl(level, message, exceptionOrExtra, extra);
            }
            else {
                this.logImpl(level, message, undefined, extra || exceptionOrExtra);
            }
        }
    };
    return AbstractLogger;
}());
exports.AbstractLogger = AbstractLogger;
/**
 * Incapsulated info about logging event, suitable for passing around or storing in LocalStorage
 */
var LogEvent = (function () {
    /**
     * @param timestamp time since Epoch in SECONDS
     */
    function LogEvent(level, message, logger, timestamp, exception, extra, context) {
        this.level = level;
        this.message = message;
        this.logger = logger;
        this.timestamp = timestamp;
        this.exception = exception;
        this.extra = extra;
        this.context = context;
    }
    return LogEvent;
}());
exports.LogEvent = LogEvent;
/**
 * Logger that simply creates a LogEvent and sends it to an appender.
 */
var SimpleLogger = (function (_super) {
    tslib_1.__extends(SimpleLogger, _super);
    /**
     * @param appender a function to handle logging events
     */
    function SimpleLogger(name, level, appender, context) {
        var _this = _super.call(this, name, level, context || new TreeContext()) || this;
        _this.appender = appender;
        return _this;
    }
    SimpleLogger.prototype.getLogger = function (name, level) {
        return new SimpleLogger(this.name + '.' + name, level || this.level, this.appender, new TreeContext(this.context));
    };
    SimpleLogger.prototype.logImpl = function (level, message, exception, extra) {
        var event = new LogEvent(level, message, this.name, Date.now(), exception, extra, this.context.get());
        try {
            this.appender(event);
        }
        catch (exception) {
            console.error('Failed processing log event', exception);
            try {
                ConsoleLogger.printToConsole(event);
            }
            catch (e) {
                console.error('No luck. Can\'t print the event', e);
            }
        }
    };
    return SimpleLogger;
}(AbstractLogger));
exports.SimpleLogger = SimpleLogger;
var ConsoleLogger = (function (_super) {
    tslib_1.__extends(ConsoleLogger, _super);
    function ConsoleLogger(name, level, context) {
        return _super.call(this, name, level, ConsoleLogger.printToConsole, context) || this;
    }
    ConsoleLogger.printToConsole = function (event) {
        var log = console.log;
        if (event.level <= log4ts_1.LogLevel.TRACE) {
            log = console.trace || console.log;
        }
        else if (event.level <= log4ts_1.LogLevel.DEBUG) {
            log = console.debug || console.log;
        }
        else if (event.level <= log4ts_1.LogLevel.INFO) {
            log = console.log;
        }
        else if (event.level <= log4ts_1.LogLevel.WARN) {
            log = console.warn;
        }
        else {
            log = console.error;
        }
        log.apply(console, ["[" + event.logger + "]: " + log4ts_1.LogLevel[event.level] + " : " + event.message,
            event.exception,
            event.extra].filter(function (x) { return !!x; }));
    };
    return ConsoleLogger;
}(SimpleLogger));
exports.ConsoleLogger = ConsoleLogger;
var DefaultLogAppender = (function () {
    function DefaultLogAppender() {
    }
    DefaultLogAppender.createRootLogger = function (name, appendLevel, appender, crashAppender, copyToConsole) {
        if (copyToConsole === void 0) { copyToConsole = false; }
        var defaultSink = function (event) {
            if (event.level >= appendLevel) {
                if (copyToConsole) {
                    ConsoleLogger.printToConsole(event);
                }
                appender.append(event).catch(DefaultLogAppender._onError);
            }
        };
        var rootLoggerContext = new TreeContext();
        var sink = defaultSink;
        if (crashAppender) {
            var crashLogger = new SimpleLogger(name + '.crashLogs', log4ts_1.LogLevel.TRACE, function (event) { crashAppender.append(event).catch(DefaultLogAppender._onError); }, new TreeContext(rootLoggerContext));
            var crashLoggerWrapper = new crash_logger_1.CrashLogWrapper(500, log4ts_1.LogLevel.ERROR, defaultSink, crashLogger);
            sink = crashLoggerWrapper.sink;
        }
        return new SimpleLogger(name, appendLevel, sink, rootLoggerContext);
    };
    return DefaultLogAppender;
}());
DefaultLogAppender._onError = function (error) {
    return ConsoleLogger.printToConsole(new LogEvent(log4ts_1.LogLevel.WARN, 'Error while logging message to the server.', 'Fallback', 0, undefined, error));
};
exports.DefaultLogAppender = DefaultLogAppender;
var QItem = (function () {
    function QItem(event) {
        var _this = this;
        this.event = event;
        this.promise = new Promise(function (resolve, __reject) { _this.resolve = resolve; })
            .then(function () { });
    }
    return QItem;
}());
var DEFAULT_LOG_QUEUE_SIZE = 300;
var DEFAULT_RETRY_INTERVAL = 10 * 1000; // milliseconds
var LogQueue = (function () {
    function LogQueue(_sink, size, _retryInterval) {
        if (size === void 0) { size = DEFAULT_LOG_QUEUE_SIZE; }
        if (_retryInterval === void 0) { _retryInterval = DEFAULT_RETRY_INTERVAL; }
        this._sink = _sink;
        this._retryInterval = _retryInterval;
        this._currentItem = null;
        this._skippedCounter = null;
        this._buffer = new ring_buffer_1.RingBuffer(size, false);
    }
    LogQueue.prototype.append = function (event) {
        if (!this._buffer.isFull) {
            var item = new QItem(event);
            this._buffer.push(item);
            this._doAppend();
            return item.promise;
        }
        else {
            this._incSkippedCounter();
            return Promise.reject(new Error('Outgoing message buffer is full'));
        }
    };
    LogQueue.prototype._incSkippedCounter = function () {
        if (!this._skippedCounter) {
            // Creating event now to perserve timestamp
            this._skippedCounter = new LogEvent(log4ts_1.LogLevel.WARN, 'Messages was skipped due to buffer overflow', 'log4ts_impl.LogQueue', Date.now(), undefined, { count: 0 });
        }
        this._skippedCounter.extra.count++;
    };
    LogQueue.prototype._doAppend = function () {
        var _this = this;
        if (this._buffer.isEmpty || this._currentItem)
            return;
        var item = this._buffer.first;
        var sinkPromise = this._sink.append(item.event);
        this._currentItem = item;
        // we don't ever reject returned promises, TODO: check if its OK
        sinkPromise
            .then(function () {
            item.resolve();
            var i = _this._buffer.pop();
            if (i !== item && i === _this._currentItem) {
                throw new Error('Illegal state');
            }
            _this._currentItem = null;
            if (_this._skippedCounter) {
                _this.append(_this._skippedCounter);
                _this._skippedCounter = null;
            }
            _this._doAppend();
        })
            .catch(function (__error) { _this._retryAppend(item); });
    };
    LogQueue.prototype._retryAppend = function (item) {
        var _this = this;
        // We don't employ a complex wait strategy here because we want to deliver logs ASAP and don't
        // want to ddos monitoring on the other hand, so just wait some time and retry
        setTimeout(function () {
            // Incrementing retries count for every retry
            var extra = item.event.extra || {};
            if (!extra.appendRetries) {
                extra = item.event.extra = Object.assign({ appendRetries: 1 }, extra);
            }
            ++extra.appendRetries;
            _this._currentItem = null;
            _this._doAppend();
        }, this._retryInterval);
    };
    return LogQueue;
}());
exports.LogQueue = LogQueue;
var DummyFelogClient = (function () {
    function DummyFelogClient() {
    }
    DummyFelogClient.prototype.append = function (_1) {
        return Promise.resolve();
    };
    return DummyFelogClient;
}());
exports.DummyFelogClient = DummyFelogClient;
var FelogClientBase = (function () {
    function FelogClientBase(_appName, _appVersion, _env, _fetch) {
        this._appName = _appName;
        this._appVersion = _appVersion;
        this._env = _env;
        this._fetch = _fetch;
    }
    FelogClientBase.prototype.append = function (event) {
        return this._fetch(this._prepareData(event));
    };
    // To avoid iterating over the string or array
    FelogClientBase.prototype._toObject = function (obj) {
        if (obj === undefined || obj === null || (obj instanceof Object && !Array.isArray(obj))) {
            return obj;
        }
        return { extra: obj };
    };
    FelogClientBase.prototype._parseException = function (ex) {
        if (ex) {
            var _a = this._toObject(ex), _b = _a.name, name_1 = _b === void 0 ? 'UnknownError' : _b, _c = _a.message, message = _c === void 0 ? 'Unknown error message' : _c, stack = _a.stack, exceptionDetails = tslib_1.__rest(_a, ["name", "message", "stack"]);
            return {
                exceptionPart: { exception: { name: name_1, message: message, stack: stack } },
                exceptionDetailsPart: Object.keys(exceptionDetails).length > 0
                    ? { exceptionDetails: exceptionDetails }
                    : {}
            };
        }
        else {
            return { exceptionPart: {}, exceptionDetailsPart: {} };
        }
    };
    FelogClientBase.prototype._prepareData = function (event) {
        var contextPart = event.context ? { context: event.context } : {};
        var _a = this._parseException(event.exception), exceptionPart = _a.exceptionPart, exceptionDetailsPart = _a.exceptionDetailsPart;
        var details = JSON.stringify(Object.assign({}, exceptionDetailsPart, this._toObject(event.extra)));
        var data = Object.assign({
            message: event.message,
            logger: event.logger,
            level: log4ts_1.LogLevel[event.level],
            application: this._appName,
            version: this._appVersion,
            env: this._env
        }, contextPart, exceptionPart, details !== '{}' && { details: details });
        // TODO: make use of timestamp
        return JSON.stringify(data, null, '');
    };
    return FelogClientBase;
}());
exports.FelogClientBase = FelogClientBase;
var PostFelogClient = (function (_super) {
    tslib_1.__extends(PostFelogClient, _super);
    function PostFelogClient(url, appName, appVersion, env, fetch) {
        return _super.call(this, appName, appVersion, env, function (body) {
            return fetch(url, {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            })
                .then(function () { });
        }) || this;
    }
    return PostFelogClient;
}(FelogClientBase));
exports.PostFelogClient = PostFelogClient;
var GetFelogClient = (function (_super) {
    tslib_1.__extends(GetFelogClient, _super);
    function GetFelogClient(url, appName, appVersion, env, fetch) {
        var _this = this;
        var baseUrl = url + "/log?json=";
        _this = _super.call(this, appName, appVersion, env, function (data) {
            return fetch(baseUrl + encodeURIComponent(data), { mode: 'no-cors', method: 'get', cache: 'no-cache' })
                .then(function () { });
        }) || this;
        return _this;
    }
    return GetFelogClient;
}(FelogClientBase));
exports.GetFelogClient = GetFelogClient;
/**
 * Use this class to configure global logger accessible through Monitoring.Logging.root
 */
var LoggingConfig = (function () {
    function LoggingConfig() {
    }
    LoggingConfig.getRootLogger = function () {
        if (!LoggingConfig._rootLogger) {
            LoggingConfig._rootLogger = LoggingConfig._createDefaultRootLogger();
            LoggingConfig._rootLogger.warn('Using DEFAULT root logger');
        }
        return LoggingConfig._rootLogger;
    };
    LoggingConfig.configure = function (rootLogger) {
        LoggingConfig._rootLogger = rootLogger;
        LoggingConfig._rootLogger.debug('ROOT logger changed', rootLogger);
    };
    LoggingConfig._createDefaultRootLogger = function () {
        return new ConsoleLogger('DEFAULT', log4ts_1.LogLevel.DEBUG);
    };
    return LoggingConfig;
}());
exports.LoggingConfig = LoggingConfig;

},{"./crash_logger":5,"./log4ts":7,"./ring_buffer":9,"./utils":12,"tslib":"tslib"}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple FIFO/ring buffer implementation using fixed size array.
 */
var RingBuffer = (function () {
    function RingBuffer(
        /** Buffer maximum capacity */
        capacity, 
        /** Should pushing to the full buffer overwrite older elements or throw an exception */
        allowOverflow) {
        if (allowOverflow === void 0) { allowOverflow = false; }
        this.capacity = capacity;
        this.allowOverflow = allowOverflow;
        /** Index of the first element */
        this._start = 0;
        /** Index _next_ to the last element */
        this._end = 0;
        /** Flag to distinguish between full end empty buffer, in both cases _start == _end */
        this._isFull = false;
        this.toJSON = this.toArray;
        if (capacity <= 0)
            throw new Error('Invalid capacity ' + capacity);
        this._buffer = new Array(capacity);
    }
    Object.defineProperty(RingBuffer.prototype, "size", {
        /** Count of elements currently in the buffer */
        get: function () {
            return this._isFull ?
                this._buffer.length
                : ((this._end - this._start) + this._buffer.length) % this._buffer.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RingBuffer.prototype, "isEmpty", {
        get: function () {
            return this.size === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RingBuffer.prototype, "isFull", {
        get: function () {
            return this._isFull;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds element to the buffer
     * @throws Error('Buffer is full') if buffer is full and overflow is not allowed
     */
    RingBuffer.prototype.push = function (element) {
        if (this.isFull) {
            if (this.allowOverflow) {
                // incrementing start, then end, effectively overwriting the oldest element in the buffer
                ++this._start;
                if (this._start === this.capacity) {
                    this._start = 0;
                }
            }
            else {
                throw new Error('Buffer is full');
            }
        }
        this._buffer[this._end++] = element;
        if (this._end === this.capacity) {
            this._end = 0;
        }
        if (this._start === this._end) {
            this._isFull = true;
        }
    };
    /**
     * Extracts element from the buffer,
     * @returns an element deleted or undefined if buffer is empty
     */
    RingBuffer.prototype.pop = function () {
        if (this.isEmpty)
            return undefined;
        var t = this._buffer[this._start];
        this._buffer[this._start] = undefined; // free memory
        this._start++;
        if (this._start === this.capacity) {
            this._start = 0;
        }
        this._isFull = false;
        return t;
    };
    Object.defineProperty(RingBuffer.prototype, "first", {
        get: function () {
            return this.isEmpty ? undefined : this._buffer[this._start];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RingBuffer.prototype, "last", {
        get: function () {
            return this.isEmpty ?
                undefined
                : this._buffer[(this._end === 0 ? this.capacity - 1 : this._end - 1)];
        },
        enumerable: true,
        configurable: true
    });
    /** Clears buffer content */
    RingBuffer.prototype.clear = function () {
        this._buffer = new Array(this.capacity);
        this._start = this._end = 0;
        this._isFull = false;
    };
    /**
     * @return array with the buffer elements in expected order,
     * size of resulting array is in [0, capacity]
     */
    RingBuffer.prototype.toArray = function () {
        var res;
        if (this.isEmpty) {
            res = new Array(0);
        }
        else if (this._start < this._end) {
            res = this._buffer.slice(this._start, this._end);
        }
        else {
            res = new Array(this.size);
            var j = 0;
            for (var i = this._start; i < this.capacity; ++i, ++j) {
                res[j] = this._buffer[i];
            }
            for (var i = 0; i < this._end; ++i, ++j) {
                res[j] = this._buffer[i];
            }
        }
        return res;
    };
    return RingBuffer;
}());
exports.RingBuffer = RingBuffer;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var AbstractMetricsStorage = (function () {
    function AbstractMetricsStorage(name, timersSink, countersSink) {
        this.name = name;
        this.timersSink = timersSink;
        this.countersSink = countersSink;
        utils_1.validateName(name);
    }
    AbstractMetricsStorage.prototype.getMetric = function (name) {
        return this._createChild(name);
    };
    AbstractMetricsStorage.prototype.getTimer = function (name) {
        return this._createChild(name);
    };
    AbstractMetricsStorage.prototype.getCounter = function (name) {
        return this._createChild(name);
    };
    Object.defineProperty(AbstractMetricsStorage.prototype, "parent", {
        get: function () {
            var dot = this.name.lastIndexOf('.');
            var name = this.name.substring(0, dot === -1 ? 0 : dot);
            return name === ''
                ? undefined
                : new AbstractMetricsStorage(name, this.timersSink, this.countersSink);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractMetricsStorage.prototype, "root", {
        get: function () {
            var dot = this.name.indexOf('.');
            var name = this.name.substring(0, dot === -1 ? 0 : dot);
            return name === ''
                ? this
                : new AbstractMetricsStorage(name, this.timersSink, this.countersSink);
        },
        enumerable: true,
        configurable: true
    });
    AbstractMetricsStorage.prototype._createName = function (name) {
        return this.name + '.' + name;
    };
    AbstractMetricsStorage.prototype.start = function () {
        var start = Date.now();
        var self = this;
        return {
            stop: function () {
                self.recordTime(Date.now() - start);
            }
        };
    };
    AbstractMetricsStorage.prototype.recordTime = function (time) {
        this.timersSink(this.name, time);
    };
    AbstractMetricsStorage.prototype.timing = function (fn) {
        var tn = this.start();
        try {
            return fn();
        }
        finally {
            try {
                tn.stop();
            }
            catch (e) {
                // FIXME: what to do with this error
            }
        }
    };
    AbstractMetricsStorage.prototype.increment = function (step) {
        if (step === void 0) { step = 1; }
        this.countersSink(this.name, step);
    };
    AbstractMetricsStorage.prototype.decrement = function (step) {
        if (step === void 0) { step = 1; }
        this.increment(-step);
    };
    AbstractMetricsStorage.prototype._createChild = function (name) {
        return new AbstractMetricsStorage(this._createName(name), this.timersSink, this.countersSink);
    };
    return AbstractMetricsStorage;
}());
exports.AbstractMetricsStorage = AbstractMetricsStorage;
/**
 * Utility class to simply display received metrics to console.
 * Usage:
 *  const mp = new MetricsPrinter(console.log)
 *
 *  mp.getCounter('counter').increment()
 */
var MetricsPrinter = (function (_super) {
    tslib_1.__extends(MetricsPrinter, _super);
    function MetricsPrinter(fn) {
        return _super.call(this, 'MP', function (name, value) { return fn('TIMER: ' + name + ' = ' + value); }, function (name, value) { return fn('COUNTER: ' + name + ' = ' + value); }) || this;
    }
    return MetricsPrinter;
}(AbstractMetricsStorage));
exports.MetricsPrinter = MetricsPrinter;
var DEFAULT_SEND_TIMEOUT_MS = 7500;
var MAX_SEND_ATTEMPTS = 3;
var MetricsStorage = (function (_super) {
    tslib_1.__extends(MetricsStorage, _super);
    function MetricsStorage(name, baseUrl, _fetch, _sendTimeout) {
        if (_sendTimeout === void 0) { _sendTimeout = DEFAULT_SEND_TIMEOUT_MS; }
        var _this = _super.call(this, name, function (n, v) { return _this._reportTimer(n, v); }, function (n, v) { return _this._reportCounter(n, v); }) || this;
        _this._fetch = _fetch;
        _this._sendTimeout = _sendTimeout;
        _this._countersBuffer = {};
        _this._timersBuffer = new Array();
        _this._sendTimer = undefined;
        _this._sendData = function () {
            var data = [_this._timersBuffer.join('&'),
                Object.keys(_this._countersBuffer)
                    .map(function (key) { return key + '=' + _this._countersBuffer[key]; })
                    .join('&')
            ].filter(function (s) { return s.length; }).join('&');
            var url = _this._baseUrl + data;
            _this._timersBuffer.length = 0;
            _this._countersBuffer = {};
            _this._sendTimer = undefined;
            var attempt = 0;
            var send = function () {
                _this._fetch(url, { mode: 'no-cors', cache: 'no-cache' })
                    .catch(function (error) {
                    if (attempt++ < MAX_SEND_ATTEMPTS) {
                        setTimeout(send, 5000 * attempt);
                    }
                    else {
                        console.error('Cannot send timesereies data', error, url);
                    }
                });
            };
            send();
        };
        _this._baseUrl = baseUrl + '/ts?';
        return _this;
    }
    MetricsStorage.createRoot = function (name, baseUrl, fetch) {
        return new MetricsStorage(name, baseUrl, fetch);
    };
    MetricsStorage.prototype._reportTimer = function (name, value) {
        this._timersBuffer.push('t.' + name + '=' + value);
        this._startSending();
    };
    MetricsStorage.prototype._reportCounter = function (name, value) {
        var key = 'c.' + name;
        this._countersBuffer[key] = (this._countersBuffer[key] || 0) + value;
        this._startSending();
    };
    MetricsStorage.prototype._startSending = function () {
        if (!this._sendTimer) {
            this._sendTimer = setTimeout(this._sendData, this._sendTimeout);
        }
    };
    return MetricsStorage;
}(AbstractMetricsStorage));
exports.MetricsStorage = MetricsStorage;
var MetricsConfig = (function () {
    function MetricsConfig() {
    }
    MetricsConfig.getRootMetric = function () {
        if (!MetricsConfig._metricsRoot) {
            console.warn('[WARNING] Using default timeseries implementation.');
            MetricsConfig._metricsRoot = new MetricsPrinter(console.log);
        }
        return MetricsConfig._metricsRoot;
    };
    MetricsConfig.configure = function (root) {
        MetricsConfig._metricsRoot = root;
    };
    return MetricsConfig;
}());
exports.MetricsConfig = MetricsConfig;

},{"./utils":12,"tslib":"tslib"}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorLike;
(function (ErrorLike) {
    function isErrorLike(error) {
        var errorLike = error;
        return errorLike && (errorLike.message !== undefined && errorLike.name !== undefined
            || errorLike.stack !== undefined);
    }
    ErrorLike.isErrorLike = isErrorLike;
})(ErrorLike = exports.ErrorLike || (exports.ErrorLike = {}));
var EventProps;
(function (EventProps) {
    /**
     * Convert an object of type any to EventProps. Remove cyclic dependencies
     * Built-in objects (Boolean, Number, String, Date, RegExp) convert to string
     * Get all non-enumerable props of ErrorLike objects
     */
    function fromAny(obj) {
        return fromAnyInternal(obj, [obj], ErrorLike.isErrorLike(obj));
    }
    EventProps.fromAny = fromAny;
    function fromAnyInternal(obj, refs, searchNonEnumerable) {
        if (!obj)
            return {};
        var res = {};
        var getKeys = searchNonEnumerable
            ? Object.getOwnPropertyNames
            : Object.keys;
        getKeys(obj).forEach(function (key) {
            var v = obj[key];
            if (v === null || v === undefined
                || typeof v === 'number'
                || typeof v === 'string'
                || typeof v === 'boolean') {
                res[key] = v;
            }
            else if (typeof v === 'object') {
                if (v instanceof Boolean || v instanceof Number || v instanceof String
                    || v instanceof Date || v instanceof RegExp) {
                    res[key] = v.toString();
                }
                else if (refs.indexOf(v) === -1) {
                    refs.push(v);
                    var newObj = fromAnyInternal(v, refs, ErrorLike.isErrorLike(v));
                    if (Object.keys(newObj).length > 0)
                        res[key] = newObj;
                }
            }
        });
        return res;
    }
})(EventProps = exports.EventProps || (exports.EventProps = {}));
var nameRegexp = /^(?!\.[\w])[\w.]*\w$/;
function validateName(name) {
    if (name === '')
        throw new Error('Empty name');
    if (!nameRegexp.test(name))
        throw new Error("Invalid name: " + name + ". " +
            'Should be hierarchical dot separated string and may contain only word characters)');
}
exports.validateName = validateName;

},{}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":36}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":37}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":38}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":39}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":40}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":41}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":42}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-symbols"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-symbols":43}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":44}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":45}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":46}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":47}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":48}],26:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":49}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":19}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};
},{"../core-js/object/define-property":19}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":18,"../core-js/object/set-prototype-of":23,"../helpers/typeof":34}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":34}],32:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _isIterable2 = require("../core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require("../core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
},{"../core-js/get-iterator":14,"../core-js/is-iterable":15}],33:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _from = require("../core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
},{"../core-js/array/from":13}],34:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":25,"../core-js/symbol/iterator":26}],35:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":145}],36:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":57,"../../modules/es6.array.from":125,"../../modules/es6.string.iterator":135}],37:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":123,"../modules/es6.string.iterator":135,"../modules/web.dom.iterable":139}],38:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":124,"../modules/es6.string.iterator":135,"../modules/web.dom.iterable":139}],39:[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":57}],40:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":57,"../../modules/es6.object.assign":127}],41:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":57,"../../modules/es6.object.create":128}],42:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":57,"../../modules/es6.object.define-property":129}],43:[function(require,module,exports){
require('../../modules/es6.symbol');
module.exports = require('../../modules/_core').Object.getOwnPropertySymbols;
},{"../../modules/_core":57,"../../modules/es6.symbol":136}],44:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":57,"../../modules/es6.object.get-prototype-of":130}],45:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;
},{"../../modules/_core":57,"../../modules/es6.object.keys":131}],46:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":57,"../../modules/es6.object.set-prototype-of":132}],47:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":57,"../modules/es6.object.to-string":133,"../modules/es6.promise":134,"../modules/es6.string.iterator":135,"../modules/web.dom.iterable":139}],48:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":57,"../../modules/es6.object.to-string":133,"../../modules/es6.symbol":136,"../../modules/es7.symbol.async-iterator":137,"../../modules/es7.symbol.observable":138}],49:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":120,"../../modules/es6.string.iterator":135,"../../modules/web.dom.iterable":139}],50:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],51:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],52:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],53:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":77}],54:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":112,"./_to-iobject":114,"./_to-length":115}],55:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":56,"./_wks":121}],56:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],57:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],58:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":90,"./_property-desc":101}],59:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":50}],60:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],61:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":66}],62:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":68,"./_is-object":77}],63:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],64:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":95,"./_object-keys":98,"./_object-pie":99}],65:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":57,"./_ctx":59,"./_global":68,"./_hide":70}],66:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],67:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":53,"./_ctx":59,"./_is-array-iter":75,"./_iter-call":78,"./_to-length":115,"./core.get-iterator-method":122}],68:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],69:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],70:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":61,"./_object-dp":90,"./_property-desc":101}],71:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":68}],72:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":61,"./_dom-create":62,"./_fails":66}],73:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],74:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":56}],75:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":83,"./_wks":121}],76:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":56}],77:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],78:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":53}],79:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":70,"./_object-create":89,"./_property-desc":101,"./_set-to-string-tag":106,"./_wks":121}],80:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":65,"./_has":69,"./_hide":70,"./_iter-create":79,"./_iterators":83,"./_library":85,"./_object-gpo":96,"./_redefine":103,"./_set-to-string-tag":106,"./_wks":121}],81:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":121}],82:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],83:[function(require,module,exports){
module.exports = {};
},{}],84:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":98,"./_to-iobject":114}],85:[function(require,module,exports){
module.exports = true;
},{}],86:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":66,"./_has":69,"./_is-object":77,"./_object-dp":90,"./_uid":118}],87:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":56,"./_global":68,"./_task":111}],88:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":66,"./_iobject":74,"./_object-gops":95,"./_object-keys":98,"./_object-pie":99,"./_to-object":116}],89:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":53,"./_dom-create":62,"./_enum-bug-keys":63,"./_html":71,"./_object-dps":91,"./_shared-key":107}],90:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":53,"./_descriptors":61,"./_ie8-dom-define":72,"./_to-primitive":117}],91:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":53,"./_descriptors":61,"./_object-dp":90,"./_object-keys":98}],92:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":61,"./_has":69,"./_ie8-dom-define":72,"./_object-pie":99,"./_property-desc":101,"./_to-iobject":114,"./_to-primitive":117}],93:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":94,"./_to-iobject":114}],94:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":63,"./_object-keys-internal":97}],95:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],96:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":69,"./_shared-key":107,"./_to-object":116}],97:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":54,"./_has":69,"./_shared-key":107,"./_to-iobject":114}],98:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":63,"./_object-keys-internal":97}],99:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],100:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":57,"./_export":65,"./_fails":66}],101:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],102:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":70}],103:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":70}],104:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":53,"./_ctx":59,"./_is-object":77,"./_object-gopd":92}],105:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":57,"./_descriptors":61,"./_global":68,"./_object-dp":90,"./_wks":121}],106:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":69,"./_object-dp":90,"./_wks":121}],107:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":108,"./_uid":118}],108:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":68}],109:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":50,"./_an-object":53,"./_wks":121}],110:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":60,"./_to-integer":113}],111:[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":56,"./_ctx":59,"./_dom-create":62,"./_global":68,"./_html":71,"./_invoke":73}],112:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":113}],113:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],114:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":60,"./_iobject":74}],115:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":113}],116:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":60}],117:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":77}],118:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],119:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":57,"./_global":68,"./_library":85,"./_object-dp":90,"./_wks-ext":120}],120:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":121}],121:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":68,"./_shared":108,"./_uid":118}],122:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":55,"./_core":57,"./_iterators":83,"./_wks":121}],123:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":53,"./_core":57,"./core.get-iterator-method":122}],124:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./_classof":55,"./_core":57,"./_iterators":83,"./_wks":121}],125:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":58,"./_ctx":59,"./_export":65,"./_is-array-iter":75,"./_iter-call":78,"./_iter-detect":81,"./_to-length":115,"./_to-object":116,"./core.get-iterator-method":122}],126:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":51,"./_iter-define":80,"./_iter-step":82,"./_iterators":83,"./_to-iobject":114}],127:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":65,"./_object-assign":88}],128:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":65,"./_object-create":89}],129:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":61,"./_export":65,"./_object-dp":90}],130:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":96,"./_object-sap":100,"./_to-object":116}],131:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":98,"./_object-sap":100,"./_to-object":116}],132:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":65,"./_set-proto":104}],133:[function(require,module,exports){

},{}],134:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":50,"./_an-instance":52,"./_classof":55,"./_core":57,"./_ctx":59,"./_export":65,"./_for-of":67,"./_global":68,"./_is-object":77,"./_iter-detect":81,"./_library":85,"./_microtask":87,"./_redefine-all":102,"./_set-species":105,"./_set-to-string-tag":106,"./_species-constructor":109,"./_task":111,"./_wks":121}],135:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":80,"./_string-at":110}],136:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":53,"./_descriptors":61,"./_enum-keys":64,"./_export":65,"./_fails":66,"./_global":68,"./_has":69,"./_hide":70,"./_is-array":76,"./_keyof":84,"./_library":85,"./_meta":86,"./_object-create":89,"./_object-dp":90,"./_object-gopd":92,"./_object-gopn":94,"./_object-gopn-ext":93,"./_object-gops":95,"./_object-keys":98,"./_object-pie":99,"./_property-desc":101,"./_redefine":103,"./_set-to-string-tag":106,"./_shared":108,"./_to-iobject":114,"./_to-primitive":117,"./_uid":118,"./_wks":121,"./_wks-define":119,"./_wks-ext":120}],137:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":119}],138:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":119}],139:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":68,"./_hide":70,"./_iterators":83,"./_wks":121,"./es6.array.iterator":126}],140:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],141:[function(require,module,exports){
module.exports = require('./lib/effects')
},{"./lib/effects":142}],142:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.select = exports.cancel = exports.join = exports.fork = exports.cps = exports.apply = exports.call = exports.race = exports.put = exports.take = undefined;

var _io = require('./internal/io');

exports.take = _io.take;
exports.put = _io.put;
exports.race = _io.race;
exports.call = _io.call;
exports.apply = _io.apply;
exports.cps = _io.cps;
exports.fork = _io.fork;
exports.join = _io.join;
exports.cancel = _io.cancel;
exports.select = _io.select;
},{"./internal/io":143}],143:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asEffect = exports.SELECT_ARG_ERROR = exports.INVALID_PATTERN = exports.CANCEL_ARG_ERROR = exports.JOIN_ARG_ERROR = exports.FORK_ARG_ERROR = exports.CALL_FUNCTION_ARG_ERROR = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.matcher = matcher;
exports.take = take;
exports.put = put;
exports.race = race;
exports.call = call;
exports.apply = apply;
exports.cps = cps;
exports.fork = fork;
exports.join = join;
exports.cancel = cancel;
exports.select = select;

var _utils = require("./utils");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CALL_FUNCTION_ARG_ERROR = exports.CALL_FUNCTION_ARG_ERROR = "call/cps/fork first argument must be a function, an array [context, function] or an object {context, fn}";
var FORK_ARG_ERROR = exports.FORK_ARG_ERROR = "fork first argument must be a generator function or an iterator";
var JOIN_ARG_ERROR = exports.JOIN_ARG_ERROR = "join argument must be a valid task (a result of a fork)";
var CANCEL_ARG_ERROR = exports.CANCEL_ARG_ERROR = "cancel argument must be a valid task (a result of a fork)";
var INVALID_PATTERN = exports.INVALID_PATTERN = "Invalid pattern passed to `take` (HINT: check if you didn't mispell a constant)";
var SELECT_ARG_ERROR = exports.SELECT_ARG_ERROR = "select first argument must be a function";

var IO = (0, _utils.sym)('IO');
var TAKE = 'TAKE';
var PUT = 'PUT';
var RACE = 'RACE';
var CALL = 'CALL';
var CPS = 'CPS';
var FORK = 'FORK';
var JOIN = 'JOIN';
var CANCEL = 'CANCEL';
var SELECT = 'SELECT';

var effect = function effect(type, payload) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, IO, true), _defineProperty(_ref, type, payload), _ref;
};

var matchers = {
  wildcard: function wildcard() {
    return _utils.kTrue;
  },
  default: function _default(pattern) {
    return function (input) {
      return input.type === pattern;
    };
  },
  array: function array(patterns) {
    return function (input) {
      return patterns.some(function (p) {
        return p === input.type;
      });
    };
  },
  predicate: function predicate(_predicate) {
    return function (input) {
      return _predicate(input);
    };
  }
};

function matcher(pattern) {
  return (pattern === '*' ? matchers.wildcard : _utils.is.array(pattern) ? matchers.array : _utils.is.func(pattern) ? matchers.predicate : matchers.default)(pattern);
}

function take(pattern) {
  if (arguments.length > 0 && _utils.is.undef(pattern)) {
    throw new Error(INVALID_PATTERN);
  }

  return effect(TAKE, _utils.is.undef(pattern) ? '*' : pattern);
}

function put(action) {
  return effect(PUT, action);
}

function race(effects) {
  return effect(RACE, effects);
}

function getFnCallDesc(fn, args) {
  (0, _utils.check)(fn, _utils.is.notUndef, CALL_FUNCTION_ARG_ERROR);

  var context = null;
  if (_utils.is.array(fn)) {
    var _fn = fn;

    var _fn2 = _slicedToArray(_fn, 2);

    context = _fn2[0];
    fn = _fn2[1];
  } else if (fn.fn) {
    var _fn3 = fn;
    context = _fn3.context;
    fn = _fn3.fn;
  }
  (0, _utils.check)(fn, _utils.is.func, CALL_FUNCTION_ARG_ERROR);

  return { context: context, fn: fn, args: args };
}

function call(fn) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return effect(CALL, getFnCallDesc(fn, args));
}

function apply(context, fn) {
  var args = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

  return effect(CALL, getFnCallDesc({ context: context, fn: fn }, args));
}

function cps(fn) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return effect(CPS, getFnCallDesc(fn, args));
}

function fork(fn) {
  for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }

  return effect(FORK, getFnCallDesc(fn, args));
}

var isForkedTask = function isForkedTask(task) {
  return task[_utils.TASK];
};

function join(taskDesc) {
  if (!isForkedTask(taskDesc)) throw new Error(JOIN_ARG_ERROR);

  return effect(JOIN, taskDesc);
}

function cancel(taskDesc) {
  if (!isForkedTask(taskDesc)) throw new Error(CANCEL_ARG_ERROR);

  return effect(CANCEL, taskDesc);
}

function select(selector) {
  for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  if (arguments.length === 0) {
    selector = _utils.ident;
  } else {
    (0, _utils.check)(selector, _utils.is.func, SELECT_ARG_ERROR);
  }
  return effect(SELECT, { selector: selector, args: args });
}

var asEffect = exports.asEffect = {
  take: function take(effect) {
    return effect && effect[IO] && effect[TAKE];
  },
  put: function put(effect) {
    return effect && effect[IO] && effect[PUT];
  },
  race: function race(effect) {
    return effect && effect[IO] && effect[RACE];
  },
  call: function call(effect) {
    return effect && effect[IO] && effect[CALL];
  },
  cps: function cps(effect) {
    return effect && effect[IO] && effect[CPS];
  },
  fork: function fork(effect) {
    return effect && effect[IO] && effect[FORK];
  },
  join: function join(effect) {
    return effect && effect[IO] && effect[JOIN];
  },
  cancel: function cancel(effect) {
    return effect && effect[IO] && effect[CANCEL];
  },
  select: function select(effect) {
    return effect && effect[IO] && effect[SELECT];
  }
};
},{"./utils":144}],144:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.ident = ident;
exports.check = check;
exports.remove = remove;
exports.deferred = deferred;
exports.arrayOfDeffered = arrayOfDeffered;
exports.autoInc = autoInc;
exports.asap = asap;
exports.warnDeprecated = warnDeprecated;
var sym = exports.sym = function sym(id) {
  return '@@redux-saga/' + id;
};

var TASK = exports.TASK = sym('TASK');
var kTrue = exports.kTrue = function kTrue() {
  return true;
};
var noop = exports.noop = function noop() {};
function ident(v) {
  return v;
}

var isDev = exports.isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';

function check(value, predicate, error) {
  if (!predicate(value)) throw new Error(error);
}

var is = exports.is = {
  undef: function undef(v) {
    return v === null || v === undefined;
  },
  notUndef: function notUndef(v) {
    return v !== null && v !== undefined;
  },
  func: function func(f) {
    return typeof f === 'function';
  },
  array: Array.isArray,
  promise: function promise(p) {
    return p && is.func(p.then);
  },
  iterator: function iterator(it) {
    return it && is.func(it.next) && is.func(it.throw);
  },
  task: function task(it) {
    return it && it[TASK];
  }
};

function remove(array, item) {
  var index = array.indexOf(item);
  if (index >= 0) array.splice(index, 1);
}

function deferred() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var def = _extends({}, props);
  var promise = new Promise(function (resolve, reject) {
    def.resolve = resolve;
    def.reject = reject;
  });
  def.promise = promise;
  return def;
}

function arrayOfDeffered(length) {
  var arr = [];
  for (var i = 0; i < length; i++) {
    arr.push(deferred());
  }
  return arr;
}

function autoInc() {
  var seed = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  return function () {
    return ++seed;
  };
}

function asap(action) {
  return Promise.resolve(1).then(function () {
    return action();
  });
}

/* eslint-disable no-console */
function warnDeprecated(msg) {
  if (isDev) {
    console.warn('DEPRECATION WARNING', msg);
  }
}
}).call(this,require('_process'))
},{"_process":140}],145:[function(require,module,exports){
(function (global){
// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g =
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch(e) {
    g.regeneratorRuntime = undefined;
  }
}

}).call(this,typeof window !== "undefined" ? window : {})
},{"./runtime":146}],146:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof window !== "undefined" ? window : {})
},{"_process":140}],147:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
require("universal/popup");

},{"universal/popup":219}],148:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function handleChromeError(onOk, handleErr) {
    if (chrome.runtime.lastError) {
        handleErr(chrome.runtime.lastError);
    } else {
        onOk();
    }
}
exports.handleChromeError = handleChromeError;

},{}],149:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getOwnPropertySymbols = require("babel-runtime/core-js/object/get-own-property-symbols");

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof _getOwnPropertySymbols2.default === "function") for (var i = 0, p = (0, _getOwnPropertySymbols2.default)(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bg_1 = require("./message/bg");
var content_1 = require("./message/content");
var chrome_1 = require("./tabs/chrome");
var chrome_util_1 = require("./chrome-util");
var web_extensions_1 = require("./web-extensions");
var util_1 = require("lib/util");
var stdlib_1 = require("stdlib");
/**
 * @NOTE this is unused for now. Use it later when migrating Chrome
 * settings from window.localStorage.
 *
 * Low-level PreferencesApi implementation
 * Just a Promise based proxy to/from chrome.storage
 */
// tslint:disable-next-line no-unused-variable
var newChromePreferencesApi = {
    // wraps chrome callback in promise,
    // transforms empty object to null for backward compatibility with localStorage
    get: function get(key) {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return chrome.storage.local.get(key, function (valueObject) {
                chrome_util_1.handleChromeError(function () {
                    return resolve(valueObject.hasOwnProperty(key) ? valueObject[key] : null);
                }, reject);
            });
        });
    },
    set: function set(key, value) {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return chrome.storage.local.set((0, _defineProperty3.default)({}, key, value), function () {
                chrome_util_1.handleChromeError(resolve, reject);
            });
        });
    },
    getAll: function getAll() {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return chrome.storage.local.get(null, function (value) {
                chrome_util_1.handleChromeError(function () {
                    return resolve(value);
                }, reject);
            });
        });
    },
    remove: function remove(key) {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return chrome.storage.local.remove(key, function () {
                chrome_util_1.handleChromeError(resolve, reject);
            });
        });
    },
    removeAll: function removeAll() {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return chrome.storage.local.clear(function () {
                chrome_util_1.handleChromeError(resolve, reject);
            });
        });
    }
};

var ChromeContentScriptPort = function () {
    function ChromeContentScriptPort(name) {
        (0, _classCallCheck3.default)(this, ChromeContentScriptPort);

        this.port = chrome.runtime.connect({ name: name });
    }

    (0, _createClass3.default)(ChromeContentScriptPort, [{
        key: "onMessage",
        value: function onMessage(cb) {
            this.port.onMessage.addListener(cb);
        }
    }, {
        key: "onDisconnect",
        value: function onDisconnect(cb) {
            this.port.onDisconnect.addListener(cb);
        }
    }, {
        key: "postMessage",
        value: function postMessage(data) {
            this.port.postMessage(data);
        }
    }]);
    return ChromeContentScriptPort;
}();

var ChromeBackgroundPort = function () {
    function ChromeBackgroundPort(_port) {
        (0, _classCallCheck3.default)(this, ChromeBackgroundPort);

        this._port = _port;
        this.sender = {};
        var sender = _port.sender,
            name = _port.name;

        this.name = name;
        if (sender) {
            this.sender.url = sender.url;
            if (sender.tab && sender.tab.url && sender.tab.id) this.sender.tab = {
                url: sender.tab.url,
                id: sender.tab.id,
                active: sender.tab.active
            };
        }
    }

    (0, _createClass3.default)(ChromeBackgroundPort, [{
        key: "onMessage",
        value: function onMessage(cb) {
            this._port.onMessage.addListener(cb);
        }
    }, {
        key: "onDisconnect",
        value: function onDisconnect(cb) {
            this._port.onDisconnect.addListener(cb);
        }
    }, {
        key: "postMessage",
        value: function postMessage(data) {
            this._port.postMessage(data);
        }
    }]);
    return ChromeBackgroundPort;
}();

var ChromeApi = function ChromeApi() {
    (0, _classCallCheck3.default)(this, ChromeApi);

    this.tabs = new chrome_1.ChromeTabsApiImpl();
    this.notification = {
        kind: 'web-extension',
        create: function create(options) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                var onClicked = options.onClicked,
                    onButtonClicked = options.onButtonClicked,
                    opts = __rest(options, ["onClicked", "onButtonClicked"]);

                var cn = chrome.notifications;
                var id = util_1.guid();
                cn.create(id, (0, _assign2.default)({ type: 'basic' }, opts), function () {
                    chrome_util_1.handleChromeError(function () {
                        if (onClicked !== undefined) {
                            cn.onClicked.addListener(onClicked);
                        }
                        if (onButtonClicked !== undefined) {
                            cn.onButtonClicked.addListener(onButtonClicked);
                        }
                        resolve(id);
                    }, reject);
                });
            });
        },
        clear: function clear(id) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                chrome.notifications.clear(id, function (wasCleared) {
                    chrome_util_1.handleChromeError(function () {
                        return resolve(wasCleared);
                    }, reject);
                });
            });
        }
    };
    this.cookies = {
        kind: 'web-extension',
        get: function get(details) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                return chrome.cookies.get(details, function (cookie) {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve(cookie);
                    }, reject);
                });
            });
        },
        remove: function remove(details) {
            return new _promise2.default(function (resolve, reject) {
                return chrome.cookies.remove(details, function () {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve(null);
                    }, reject);
                });
            });
        },
        getAll: function getAll(details) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                return chrome.cookies.getAll(details, function (cookie) {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve(cookie);
                    }, reject);
                });
            });
        },
        set: function set(details) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                return chrome.cookies.set(details, function (cookie) {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve(cookie);
                    }, reject);
                });
            });
        },
        watch: function watch(details, cb) {
            chrome.cookies.onChanged.addListener(function (changeInfo) {
                var cookie = changeInfo.cookie,
                    cause = changeInfo.cause;

                if (!cookie || !cookie.name || details.path && details.path !== cookie.path || details.name !== cookie.name) return;
                if (details.domain && cookie.domain.indexOf(details.domain) === -1) return;
                if (cause === 'explicit') cb(cookie);
                if (cause === 'expired_overwrite') cb();
            });
        }
    };
    this.preferences = web_extensions_1.preferencesApi.windowLocalStorage;
    this.button = {
        kind: 'web-extension',
        setBadge: function setBadge(text) {
            chrome.browserAction.setBadgeText({ text: text });
        },
        setIconByName: function setIconByName(name) {
            var prefix = './src/icon/icon';
            var postfix = name ? '-' + name : '';
            chrome.browserAction.setIcon({
                path: {
                    '16': prefix + "16" + postfix + ".png",
                    '32': prefix + "32" + postfix + ".png"
                }
            });
        },
        setBadgeBackgroundColor: function setBadgeBackgroundColor(color) {
            chrome.browserAction.setBadgeBackgroundColor({ color: color });
        }
    };
    this.management = {
        uninstallSelf: function uninstallSelf() {
            chrome.management.uninstallSelf();
        }
    };
    this.message = util_1.isBg() ? new bg_1.GenericBackgroundMessageApiImpl(function (cb) {
        return chrome.runtime.onConnect.addListener(function (port) {
            return cb(new ChromeBackgroundPort(port));
        });
    }, this.tabs.getActiveTab.bind(this.tabs), this.tabs.getAllTabs.bind(this.tabs)) : new content_1.GenericContentScriptMessageApiImpl(function (name) {
        return new ChromeContentScriptPort(name);
    });
};

function getApi() {
    return new ChromeApi();
}
exports.getApi = getApi;

},{"./chrome-util":148,"./message/bg":156,"./message/content":157,"./tabs/chrome":164,"./web-extensions":168,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/get-own-property-symbols":20,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"lib/util":200,"stdlib":203}],150:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function handleEdgeError(onOk, handleErr) {
    if (edge.runtime.lastError) {
        handleErr(edge.runtime.lastError);
    } else {
        onOk();
    }
}
exports.handleEdgeError = handleEdgeError;

},{}],151:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getOwnPropertySymbols = require("babel-runtime/core-js/object/get-own-property-symbols");

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof _getOwnPropertySymbols2.default === "function") for (var i = 0, p = (0, _getOwnPropertySymbols2.default)(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bg_1 = require("./message/bg");
var content_1 = require("./message/content");
var edge_1 = require("./tabs/edge");
var edge_util_1 = require("./edge-util");
var web_extensions_1 = require("./web-extensions");
var util_1 = require("lib/util");
var stdlib_1 = require("stdlib");
/**
 * @NOTE this is unused for now. Use it later when migrating Chrome
 * settings from window.localStorage.
 *
 * Low-level PreferencesApi implementation
 * Just a Promise based proxy to/from edge.storage
 */
// tslint:disable-next-line no-unused-variable
var newEdgePreferencesApi = {
    // wraps edge callback in promise,
    // transforms empty object to null for backward compatibility with localStorage
    get: function get(key) {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return edge.storage.local.get(key, function (valueObject) {
                edge_util_1.handleEdgeError(function () {
                    return resolve(valueObject.hasOwnProperty(key) ? valueObject[key] : null);
                }, reject);
            });
        });
    },
    set: function set(key, value) {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return edge.storage.local.set((0, _defineProperty3.default)({}, key, value), function () {
                edge_util_1.handleEdgeError(resolve, reject);
            });
        });
    },
    getAll: function getAll() {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return edge.storage.local.get(null, function (value) {
                edge_util_1.handleEdgeError(function () {
                    return resolve(value);
                }, reject);
            });
        });
    },
    remove: function remove(key) {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return edge.storage.local.remove(key, function () {
                edge_util_1.handleEdgeError(resolve, reject);
            });
        });
    },
    removeAll: function removeAll() {
        return stdlib_1.SafePromise.create(function (resolve, reject) {
            return edge.storage.local.clear(function () {
                edge_util_1.handleEdgeError(resolve, reject);
            });
        });
    }
};

var EdgeContentScriptPort = function () {
    function EdgeContentScriptPort(name) {
        (0, _classCallCheck3.default)(this, EdgeContentScriptPort);

        this.port = edge.runtime.connect({ name: name });
    }

    (0, _createClass3.default)(EdgeContentScriptPort, [{
        key: "onMessage",
        value: function onMessage(cb) {
            this.port.onMessage.addListener(cb);
        }
    }, {
        key: "onDisconnect",
        value: function onDisconnect(cb) {
            this.port.onDisconnect.addListener(cb);
        }
    }, {
        key: "postMessage",
        value: function postMessage(data) {
            this.port.postMessage(data);
        }
    }]);
    return EdgeContentScriptPort;
}();

var EdgeBackgroundPort = function () {
    function EdgeBackgroundPort(_port) {
        (0, _classCallCheck3.default)(this, EdgeBackgroundPort);

        this._port = _port;
        this.sender = {};
        var sender = _port.sender,
            name = _port.name;

        this.name = name;
        if (sender) {
            this.sender.url = sender.url;
            if (sender.tab && sender.tab.url && sender.tab.id) this.sender.tab = {
                url: sender.tab.url,
                id: sender.tab.id,
                active: sender.tab.active
            };
        }
    }

    (0, _createClass3.default)(EdgeBackgroundPort, [{
        key: "onMessage",
        value: function onMessage(cb) {
            this._port.onMessage.addListener(cb);
        }
    }, {
        key: "onDisconnect",
        value: function onDisconnect(cb) {
            this._port.onDisconnect.addListener(cb);
        }
    }, {
        key: "postMessage",
        value: function postMessage(data) {
            this._port.postMessage(data);
        }
    }]);
    return EdgeBackgroundPort;
}();

var EdgeApi = function EdgeApi() {
    (0, _classCallCheck3.default)(this, EdgeApi);

    this.tabs = new edge_1.EdgeTabsApiImpl();
    this.notification = {
        kind: 'web-extension',
        create: function create(options) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                var onClicked = options.onClicked,
                    onButtonClicked = options.onButtonClicked,
                    opts = __rest(options, ["onClicked", "onButtonClicked"]);

                var cn = edge.notifications;
                var id = util_1.guid();
                cn.create(id, (0, _assign2.default)({ type: 'basic' }, opts), function () {
                    edge_util_1.handleEdgeError(function () {
                        if (onClicked !== undefined) {
                            cn.onClicked.addListener(onClicked);
                        }
                        if (onButtonClicked !== undefined) {
                            cn.onButtonClicked.addListener(onButtonClicked);
                        }
                        resolve(id);
                    }, reject);
                });
            });
        },
        clear: function clear(id) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                edge.notifications.clear(id, function (wasCleared) {
                    edge_util_1.handleEdgeError(function () {
                        return resolve(wasCleared);
                    }, reject);
                });
            });
        }
    };
    this.cookies = {
        kind: 'web-extension',
        get: function get(details) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                return edge.cookies.get(details, function (cookie) {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve(cookie);
                    }, reject);
                });
            });
        },
        remove: function remove(details) {
            return new _promise2.default(function (resolve, reject) {
                return edge.cookies.remove(details, function () {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve(null);
                    }, reject);
                });
            });
        },
        getAll: function getAll(details) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                return edge.cookies.getAll(details, function (cookie) {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve(cookie);
                    }, reject);
                });
            });
        },
        set: function set(details) {
            return stdlib_1.SafePromise.create(function (resolve, reject) {
                return edge.cookies.set(details, function (cookie) {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve(cookie);
                    }, reject);
                });
            });
        },
        watch: function watch(details, cb) {
            edge.cookies.onChanged.addListener(function (changeInfo) {
                var cookie = changeInfo.cookie,
                    cause = changeInfo.cause;

                if (!cookie || !cookie.name || details.path && details.path !== cookie.path || details.name !== cookie.name) return;
                if (details.domain && cookie.domain.indexOf(details.domain) === -1) return;
                if (cause === 'explicit') cb(cookie);
                if (cause === 'expired_overwrite') cb();
            });
        }
    };
    this.preferences = web_extensions_1.preferencesApi.windowLocalStorage;
    this.button = {
        kind: 'web-extension',
        setBadge: function setBadge(text) {
            edge.browserAction.setBadgeText({ text: text });
        },
        setIconByName: function setIconByName(name) {
            var prefix = './src/icon/icon';
            var postfix = name ? '-' + name : '';
            edge.browserAction.setIcon({
                path: {
                    '16': prefix + "16" + postfix + ".png",
                    '32': prefix + "32" + postfix + ".png"
                }
            });
        },
        setBadgeBackgroundColor: function setBadgeBackgroundColor(color) {
            edge.browserAction.setBadgeBackgroundColor({ color: color });
        }
    };
    this.management = {
        uninstallSelf: function uninstallSelf() {
            edge.management.uninstallSelf();
        }
    };
    this.message = util_1.isBg() ? new bg_1.GenericBackgroundMessageApiImpl(function (cb) {
        return edge.runtime.onConnect.addListener(function (port) {
            return cb(new EdgeBackgroundPort(port));
        });
    }, this.tabs.getActiveTab, this.tabs.getAllTabs) : new content_1.GenericContentScriptMessageApiImpl(function (name) {
        return new EdgeContentScriptPort(name);
    });
};

function getApi() {
    return new EdgeApi();
}
exports.getApi = getApi;

},{"./edge-util":150,"./message/bg":156,"./message/content":157,"./tabs/edge":165,"./web-extensions":168,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/get-own-property-symbols":20,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"lib/util":200,"stdlib":203}],152:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _getOwnPropertySymbols = require("babel-runtime/core-js/object/get-own-property-symbols");

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof _getOwnPropertySymbols2.default === "function") for (var i = 0, p = (0, _getOwnPropertySymbols2.default)(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var web_extensions_1 = require("./web-extensions");
var bg_1 = require("./message/bg");
var content_1 = require("./message/content");
var firefox_1 = require("./tabs/firefox");
var util_1 = require("lib/util");

var FirefoxContentScriptPort = function () {
    function FirefoxContentScriptPort(name) {
        (0, _classCallCheck3.default)(this, FirefoxContentScriptPort);

        /**
         * Try catch block for Unit tests compatibility
         * Firefox will throw, because `browser` is not defined in global context
         */
        try {
            this.port = firefox.runtime.connect({ name: name });
        } catch (_) {
            this.onMessage = function () {};
            this.onDisconnect = function () {};
            this.postMessage = function () {};
        }
    }

    (0, _createClass3.default)(FirefoxContentScriptPort, [{
        key: "onMessage",
        value: function onMessage(cb) {
            this.port.onMessage.addListener(cb);
        }
    }, {
        key: "onDisconnect",
        value: function onDisconnect(cb) {
            this.port.onDisconnect.addListener(cb);
        }
    }, {
        key: "postMessage",
        value: function postMessage(data) {
            this.port.postMessage(data);
        }
    }]);
    return FirefoxContentScriptPort;
}();

var FirefoxBackgroundPort = function () {
    function FirefoxBackgroundPort(_port) {
        (0, _classCallCheck3.default)(this, FirefoxBackgroundPort);

        this._port = _port;
        this.sender = {};
        var sender = _port.sender,
            name = _port.name;

        this.name = name;
        if (sender) {
            this.sender.url = sender.url;
            if (sender.tab && sender.tab.url && sender.tab.id) this.sender.tab = {
                url: sender.tab.url,
                id: sender.tab.id,
                active: sender.tab.active
            };
        }
    }

    (0, _createClass3.default)(FirefoxBackgroundPort, [{
        key: "onMessage",
        value: function onMessage(cb) {
            this._port.onMessage.addListener(cb);
        }
    }, {
        key: "onDisconnect",
        value: function onDisconnect(cb) {
            this._port.onDisconnect.addListener(cb);
        }
    }, {
        key: "postMessage",
        value: function postMessage(data) {
            this._port.postMessage(data);
        }
    }]);
    return FirefoxBackgroundPort;
}();
/**
 * Web Extensions API is based on Chrome extensions API.
 * But it has a number of incompatibilities.
 * Like, f.e. Promise-based methods instead of callback-based methods that chrome provides.
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Chrome_incompatibilities
 */


var FirefoxExtensionsApi = function FirefoxExtensionsApi() {
    (0, _classCallCheck3.default)(this, FirefoxExtensionsApi);

    this.tabs = new firefox_1.FirefoxTabsApiImpl();
    this.notification = {
        kind: 'web-extension',
        create: function create(options) {
            var onClicked = options.onClicked,
                onButtonClicked = options.onButtonClicked,
                opts = __rest(options, ["onClicked", "onButtonClicked"]);

            var bn = firefox.notifications;
            var id = util_1.guid();
            var notification = bn.create(id, (0, _assign2.default)({ type: 'basic' }, opts));
            if (onClicked !== undefined) {
                bn.onClicked.addListener(onClicked);
            }
            if (onButtonClicked !== undefined) {
                bn.onButtonClicked.addListener(onButtonClicked);
            }
            return notification;
        },
        clear: function clear(id) {
            return firefox.notifications.clear(id);
        }
    };
    this.cookies = {
        kind: 'web-extension',
        get: function get(details) {
            return firefox.cookies.get(details);
        },
        getAll: function getAll(details) {
            return firefox.cookies.getAll(details);
        },
        remove: function remove(details) {
            return firefox.cookies.remove(details);
        },
        set: function set(details) {
            return firefox.cookies.set(details);
        },
        watch: function watch(details, cb) {
            firefox.cookies.onChanged.addListener(function (changeInfo) {
                var cookie = changeInfo.cookie,
                    cause = changeInfo.cause;

                if (!cookie || !cookie.name || details.path && details.path !== cookie.path || details.name !== cookie.name) return;
                if (details.domain && cookie.domain.indexOf(details.domain) === -1) return;
                if (cause === 'explicit') cb(cookie);
                if (cause === 'expired_overwrite') cb();
            });
        }
    };
    this.preferences = web_extensions_1.preferencesApi.migrationAware;
    this.button = {
        kind: 'web-extension',
        setBadge: function setBadge(text) {
            firefox.browserAction.setBadgeText({ text: text });
        },
        setIconByName: function setIconByName(name) {
            var prefix = './src/icon/icon';
            var postfix = name ? '-' + name : '';
            firefox.browserAction.setIcon({
                path: {
                    '19': prefix + "19" + postfix + ".png",
                    '38': prefix + "38" + postfix + ".png"
                }
            });
        },
        setBadgeBackgroundColor: function setBadgeBackgroundColor(color) {
            firefox.browserAction.setBadgeBackgroundColor({ color: color });
        }
    };
    this.management = {
        uninstallSelf: function uninstallSelf() {
            firefox.management.uninstallSelf();
        }
    };
    this.message = util_1.isBg() ? new bg_1.GenericBackgroundMessageApiImpl(function (cb) {
        return firefox.runtime.onConnect.addListener(function (port) {
            return cb(new FirefoxBackgroundPort(port));
        });
    }, this.tabs.getActiveTab, this.tabs.getAllTabs) : new content_1.GenericContentScriptMessageApiImpl(function (name) {
        return new FirefoxContentScriptPort(name);
    });
};

function getApi() {
    return new FirefoxExtensionsApi();
}
exports.getApi = getApi;

},{"./message/bg":156,"./message/content":157,"./tabs/firefox":166,"./web-extensions":168,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/get-own-property-symbols":20,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],153:[function(require,module,exports){
"use strict";
// there is no good way change name of global namespace.
// relevant thread https://github.com/Microsoft/TypeScript/issues/4529

Object.defineProperty(exports, "__esModule", { value: true });
window.firefox = window.browser;
try {
    window.firefox = browser;
} catch (e) {
    // it's ok
}
window.edge = window.browser;
window.chrome = window.chrome;
// need this to trick TS so we can use declare global
exports.default = undefined;

},{}],154:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./globals");
var util_1 = require("lib/util");
var Chrome = require("./chrome");
var Edge = require("./edge");
var Firefox = require("./firefox");
var Safari = require("./safari");
var WebExtensions = require("./web-extensions");
__export(require("./interface"));
function initApi() {
    // Run hacks and preload functions on initialization
    if (!window.extensionApi) {
        if (util_1.isWE()) {
            if (util_1.isBg()) {
                WebExtensions.bgPreload();
            } else {
                WebExtensions.hacksForCompatibility();
            }
        } else if (util_1.isSafari()) {
            if (util_1.isSafariSettingsPopup()) {
                Safari.hacksForSettingsPopupCompatibility();
            }
        }
    }
    getApi();
}
exports.initApi = initApi;
function getApi() {
    if (util_1.isChrome()) {
        window.extensionApi = window.extensionApi || Chrome.getApi();
    } else if (util_1.isFF()) {
        window.extensionApi = window.extensionApi || Firefox.getApi();
    } else if (util_1.isEdge()) {
        window.extensionApi = window.extensionApi || Edge.getApi();
    } else if (util_1.isSafari()) {
        window.extensionApi = window.extensionApi || Safari.getApi();
    } else {
        throw new Error("unsupported browser api");
    }
    return window.extensionApi;
}
exports.getApi = getApi;

},{"./chrome":149,"./edge":151,"./firefox":152,"./globals":153,"./interface":155,"./safari":162,"./web-extensions":168,"lib/util":200}],155:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ports = {
    bridge: 'bridge',
    background: 'message:to-priv',
    broadcast: 'message:to-non-priv'
};
// @NOTE other forge things used in extension:
// config
//   modules
//     parameters
//       version
//       updateTime
//   uuid
// request
//   ajax

},{}],156:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var util_1 = require("lib/util");
var interface_1 = require("../interface");
exports.SETTINGS_TAB_ID = 'popup';
function bgPreload() {
    // When extension triggers more than five "fast reloads",
    // then it would be disabled with warning
    var MAX_INIT_ATTEMPTS = 4;
    // @TODO should use the browser object in Firefox. It works right now because Firefox wants
    // to be compatible with Chrome, but this will soon be deprecated.
    var chromeCheck = (util_1.isChrome() || util_1.isFF()) && (!chrome.extension || !chrome.tabs || !chrome.runtime || !chrome.runtime.onConnect);
    var edgeCheck = util_1.isEdge() && (!edge.extension || !edge.tabs || !edge.runtime || !edge.runtime.onConnect);
    if (chromeCheck || edgeCheck) {
        var timesFailed = window.localStorage.getItem('bgInitFail') || '0';
        var bgInitFail = parseInt(timesFailed, 10);
        if (bgInitFail > MAX_INIT_ATTEMPTS) {
            console.error('too many bgInitFail', bgInitFail);
        } else {
            window.localStorage.setItem('bgInitFail', (bgInitFail + 1).toString());
            document.location.reload();
        }
    }
}
exports.bgPreload = bgPreload;
function isPopup(url) {
    if (!url) return false;
    if (util_1.isChrome()) {
        var chromePopupRegex = new RegExp(chrome.runtime.id + '/src/popup.html');
        return chromePopupRegex.test(url);
    }
    if (util_1.isEdge()) {
        var edgePopupRegex = /^ms-browser-extension:\/\/.*\/src\/popup.html$/;
        return edgePopupRegex.test(url);
    }
    var mozPopupRegex = /^moz-extension:\/\/.*\/src\/popup.html$/;
    return mozPopupRegex.test(url);
}

var GenericBackgroundMessageApiImpl = function () {
    function GenericBackgroundMessageApiImpl(onPortConnection, _getActiveTab, _getAllTabs) {
        var _this = this;

        (0, _classCallCheck3.default)(this, GenericBackgroundMessageApiImpl);

        this._getActiveTab = _getActiveTab;
        this._getAllTabs = _getAllTabs;
        this.kind = 'background-message-api';
        this._callbacks = {};
        // @TODO have separate port list for settings tab
        this._tabPorts = {
            popup: []
        };
        this._messageHelper = new helpers_1.MessageHelperImpl();
        // @TODO id should be TabId
        this._sendMessageToPorts = function (id, msg) {
            var ports = _this._tabPorts[id];
            if (!!ports) ports.forEach(function (port) {
                return port.postMessage(msg);
            });
        };
        this.toFocused = function (type, content) {
            _this._getActiveTab().then(function (_ref) {
                var id = _ref.id,
                    url = _ref.url;

                if (!id) return;
                if (isPopup(url)) {
                    // tslint:disable-next-line
                    return console.warn('toFocussed not allowed for popup when it open like regular tab', type, content);
                }
                _this._sendMessageToPorts(id.toString(), {
                    type: type,
                    content: content,
                    callid: util_1.guid()
                });
            });
        };
        this.broadcast = function (type, content) {
            if (!content) return;
            var emitTabs = function emitTabs(_ref2) {
                var id = _ref2.id,
                    url = _ref2.url;

                if (!id || !url || url.indexOf('chrome-extension:') !== -1) return;
                _this._sendMessageToPorts(id.toString(), {
                    type: type,
                    callid: util_1.guid(),
                    content: content
                });
            };
            _this._getAllTabs().then(function (tabs) {
                return tabs.forEach(emitTabs);
            });
            if (_this._tabPorts.popup && _this._tabPorts.popup.length) {
                _this._getActiveTab().then(function (_ref3) {
                    var url = _ref3.url,
                        active = _ref3.active;

                    // By default, id is number. We are using it as a string for some reason.
                    // So, as any as Tab to match old code
                    emitTabs({ id: exports.SETTINGS_TAB_ID, url: url, active: active });
                });
            }
        };
        this._initPortListener = function (port) {
            if (port.name === interface_1.ports.bridge) {
                port.onMessage(function (msg) {
                    if (msg.method === 'message.toFocussed') {
                        _this.toFocused(msg.params && msg.params.type, msg.params && msg.params.content);
                    }
                });
            } else if (port.name === interface_1.ports.broadcast) {
                // Special request from non-priv to pass this message on to other non-priv pages
                port.onMessage(function (message) {
                    return _this.broadcast(message.type, message.content);
                });
            } else if (port.name === interface_1.ports.background) {
                var sender = port.sender;

                if (sender) {
                    if (sender.tab) {
                        var _sender$tab = sender.tab,
                            id = _sender$tab.id,
                            url = _sender$tab.url;
                        // id is possibly undefined

                        if (id) {
                            var ports = _this._tabPorts[id];
                            if (ports === undefined) ports = _this._tabPorts[id] = [];
                            // can be several ports - iframes
                            ports.push(port);
                        }
                        // fire tab-connected iff protocol is http or https
                        if (url && url.indexOf('http') === 0) _this._messageHelper.fire('tab-connected', { tab: id, url: url });
                        port.onDisconnect(function () {
                            if (!id) return;
                            var ports = _this._tabPorts[id];
                            if (ports) ports.splice(ports.indexOf(port), 1);
                        });
                    }
                    if (sender.url && isPopup(sender.url)) {
                        var pid = exports.SETTINGS_TAB_ID;
                        _this._tabPorts[pid] = _this._tabPorts[pid] || [];
                        _this._tabPorts[pid].push(port);
                        port.onDisconnect(function () {
                            var ports = _this._tabPorts[pid];
                            ports.splice(ports.indexOf(port), 1);
                        });
                    }
                }
                port.onMessage(function (message) {
                    var processMessage = function processMessage(_ref4) {
                        var callid = _ref4.callid,
                            content = _ref4.content,
                            type = _ref4.type;

                        if (_this._callbacks[callid]) {
                            _this._callbacks[callid](content);
                            delete _this._callbacks[callid];
                        }
                        // reply to tab
                        var reply = function reply(content) {
                            return port.postMessage({
                                content: content,
                                callid: callid
                            });
                        };
                        _this._messageHelper.fire(type, content, reply, sender && sender.tab ? sender.tab.id : -1);
                    };
                    if (message.type === 'tab-connected') {
                        // @TODO use TabApi
                        _this._getActiveTab().then(function (_ref5) {
                            var url = _ref5.url;

                            message.content = {
                                tab: exports.SETTINGS_TAB_ID,
                                url: url
                            };
                            processMessage(message);
                        });
                    } else {
                        processMessage(message);
                    }
                });
            }
        };
        onPortConnection(this._initPortListener);
    }
    // @TODO tabId should be TadId


    (0, _createClass3.default)(GenericBackgroundMessageApiImpl, [{
        key: "sendTo",
        value: function sendTo(tabId, type, content, callback, error) {
            var ports = this._tabPorts[tabId];
            if (!ports || !ports.length) {
                if (error) error({ message: 'no ports on specified tabId' });
                return;
            }
            var msg = { type: type, content: content };
            if (callback && typeof callback === 'function') {
                msg.callid = util_1.guid();
                this._callbacks[msg.callid] = callback;
            }
            ports.forEach(function (port) {
                return port.postMessage(msg);
            });
        }
    }, {
        key: "listen",
        value: function listen(type, callback) {
            this._messageHelper.listen(type, callback);
        }
    }]);
    return GenericBackgroundMessageApiImpl;
}();

exports.GenericBackgroundMessageApiImpl = GenericBackgroundMessageApiImpl;

},{"../interface":155,"./helpers":158,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],157:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var util_1 = require("lib/util");
var interface_1 = require("../interface");

var GenericContentScriptMessageApiImpl = function () {
    function GenericContentScriptMessageApiImpl(createPortConnection) {
        var _this = this;

        (0, _classCallCheck3.default)(this, GenericContentScriptMessageApiImpl);

        this.kind = 'content-script-message-api';
        this._callbacks = {};
        this._messageHelper = new helpers_1.MessageHelperImpl();
        this._proxyPortsStorage = {};
        this.broadcastBackground = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _this._emit(_this.backgroundPort, 'bg').apply(null, args);
        };
        this.broadcast = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _this._emit(_this.broadcastPort, 'tabs').apply(null, args);
        };
        this._onPortMessage = function (msg) {
            // tslint:disable-next-line
            console.log('[Messaging] extension api', 'portMessage', msg);
            // @TODO implement priv.receive .
            // But it doesn't seems to be used
            // internal.priv.receive(msg)
        };
        this._checkHealth = function () {
            var PING_INTERVAL = 500;
            var ABORT_TIMEOUT = 5000;
            var pingInterval = null;
            var timeout = null;
            var sendPing = function sendPing() {
                return document.dispatchEvent(new CustomEvent('grammarly:ping'));
            };
            var alive = function alive() {
                // console.warn('[Messaging] extension api', 'proxy alive!')
                clearCheckers();
            };
            var abortByTimeout = function abortByTimeout() {
                [_this.port, _this.backgroundPort, _this.broadcastPort].forEach(function (x) {
                    if (x && x.removeMessageListeners) x.removeMessageListeners();
                });
                // console.warn('[Messaging] extension api', 'proxy dead(')
                _this.port = _this.backgroundPort = _this.broadcastPort = null;
                clearCheckers();
                document.addEventListener('grammarly:proxyports', _this._onGrammarlyResetAfterTimeout);
                document.dispatchEvent(new CustomEvent('grammarly:offline'));
            };
            function clearCheckers() {
                document.removeEventListener('grammarly:pong', alive);
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                if (pingInterval) {
                    clearInterval(pingInterval);
                    pingInterval = null;
                }
            }
            return function () {
                clearCheckers();
                document.addEventListener('grammarly:pong', alive);
                pingInterval = window.setInterval(sendPing, PING_INTERVAL);
                timeout = window.setTimeout(abortByTimeout, ABORT_TIMEOUT);
            };
        }();
        this._onGrammarlyResetAfterTimeout = function () {
            document.removeEventListener('grammarly:proxyports', _this._onGrammarlyResetAfterTimeout);
            _this.port = _this._initProxyPort(interface_1.ports.bridge, _this._onPortMessage, _this._checkHealth, true);
            _this.backgroundPort = _this._initProxyPort(interface_1.ports.background, _this._onBgPortMessage, _this._checkHealth);
            _this.broadcastPort = _this._initProxyPort(interface_1.ports.broadcast, null, _this._checkHealth);
        };
        this._onBgPortMessage = function (_ref) {
            var callid = _ref.callid,
                content = _ref.content,
                type = _ref.type;

            // console.log('[Messaging] extension api', 'got message from bg', message)
            // callbacks receive reply from bg
            if (_this._callbacks[callid]) {
                // console.log('[Messaging] extension api',
                //   'executed callback message', type)
                _this._callbacks[callid](content);
                delete _this._callbacks[callid];
            } else {
                _this._messageHelper.fire(type, content, function (content) {
                    // console.log('[Messaging] extension api',
                    //   'sent reply', {content: content, callid: message.callid})
                    if (!_this.backgroundPort) throw new Error('fail reply to bg page - connection lost');
                    // send reply to background page
                    _this.backgroundPort.postMessage({ content: content, callid: callid });
                });
            }
        };
        this._initProxyPort = function (name, onMessage, onDisconnect) {
            var isCheckHealth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            var port = _this._proxyPort(name);
            if (isCheckHealth) _this._checkHealth();
            if (onMessage) port.onMessage(onMessage);
            if (onDisconnect) port.onDisconnect(onDisconnect);
            return port;
        };
        this._emit = function (port, name) {
            return function (type, content, callback, error) {
                var callid = util_1.guid();
                if (callback && typeof callback === 'function') _this._callbacks[callid] = callback;
                // console.log('[Messaging] extension api',
                //   'send message to background', {type: type, callid: callid, content: content})
                try {
                    if (!port) throw new Error('lost connection to ' + name + ' port');
                    port.postMessage({ type: type, callid: callid, content: content });
                } catch (e) {
                    if (error) {
                        error(e);
                    } else {
                        throw e;
                    }
                }
            };
        };
        this._proxyPort = function (name) {
            _this._proxyPortsStorage[name] = {};
            var process = function process(type, e) {
                var data = e.detail;
                if (data.name !== name) return;
                var cb = _this._proxyPortsStorage[name][type];
                // console.log('[Messaging] extension api', 'received from ' + name, cb, data)
                if (cb) cb(data.msg);
            };
            var successProccess = function successProccess(e) {
                return process('success', e);
            };
            var errorProccess = function errorProccess(e) {
                return process('error', e);
            };
            document.addEventListener('grammarly:message', successProccess);
            document.addEventListener('grammarly:error', errorProccess);
            return {
                postMessage: function postMessage() {
                    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    var detail = {
                        data: data,
                        name: name
                    };
                    // console.log('[Messaging] extension api', 'send action', detail)
                    return document.dispatchEvent(new CustomEvent('grammarly:action', { detail: detail }));
                },

                onMessage: function onMessage(cb) {
                    _this._proxyPortsStorage[name].success = cb;
                },
                onDisconnect: function onDisconnect(cb) {
                    _this._proxyPortsStorage[name].error = cb;
                },
                removeMessageListeners: function removeMessageListeners() {
                    document.removeEventListener('grammarly:message', successProccess);
                    document.removeEventListener('grammarly:error', errorProccess);
                }
            };
        };
        this.port = createPortConnection(interface_1.ports.bridge);
        this.port.onMessage(this._onPortMessage);
        this.port.onDisconnect(function () {
            _this.port = null;
            _this.port = _this._initProxyPort(interface_1.ports.bridge, _this._onPortMessage, _this._checkHealth, true);
        });
        this.backgroundPort = createPortConnection(interface_1.ports.background);
        this.backgroundPort.onMessage(this._onBgPortMessage);
        this.backgroundPort.onDisconnect(function () {
            _this.backgroundPort = null;
            _this.backgroundPort = _this._initProxyPort(interface_1.ports.background, _this._onBgPortMessage, _this._checkHealth);
        });
        this.broadcastPort = createPortConnection(interface_1.ports.broadcast);
        this.broadcastPort.onDisconnect(function () {
            _this.broadcastPort = null;
            _this.broadcastPort = _this._initProxyPort(interface_1.ports.broadcast, null, _this._checkHealth);
        });
    }

    (0, _createClass3.default)(GenericContentScriptMessageApiImpl, [{
        key: "listen",
        value: function listen(type, callback) {
            this._messageHelper.listen(type, callback);
        }
    }, {
        key: "toFocused",
        value: function toFocused(type, content) {
            if (this.port) {
                this.port.postMessage({
                    method: 'message.toFocussed',
                    params: {
                        type: type,
                        content: content
                    }
                });
            } else {
                throw new Error('lost connection to bg page');
            }
        }
    }]);
    return GenericContentScriptMessageApiImpl;
}();

exports.GenericContentScriptMessageApiImpl = GenericContentScriptMessageApiImpl;
function hacksForCompatibility() {
    // popup api
    window.addEventListener('update-window-size-gr', function (e) {
        var node = document.createElement('div');
        node.style.height = '1px';
        function forceRepaint() {
            document.body.appendChild(node);
            setTimeout(function () {
                if (node.parentNode) node.parentNode.removeChild(node);
            }, 10);
        }
        // Force repaint to fix issues with corrupted popup view size
        if (e.detail && e.detail.force) {
            var interval = setInterval(forceRepaint, 100);
            setTimeout(function () {
                return clearInterval(interval);
            }, 405);
        }
    }, false);
    window.addEventListener('close-popup-gr', function () {
        // FF-only
        if (window.navigator.userAgent.indexOf('Firefox') !== -1) window.close();
    }, false);
}
exports.hacksForCompatibility = hacksForCompatibility;

},{"../interface":155,"./helpers":158,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],158:[function(require,module,exports){
"use strict";

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("lib/config");
var _f = function _f() {};

var MessageHelperImpl = function MessageHelperImpl() {
    var _this = this;

    (0, _classCallCheck3.default)(this, MessageHelperImpl);

    this._listeners = {};
    this._queue = {};
    /**
     * Event emit helper, also buffer events if haven't event listeners
     */
    this.fire = function (type, content) {
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _f;
        var sender = arguments[3];

        // console.log('[Messaging]', 'fire helper', type, content)
        var listeners = _this._listeners[type] || [];
        if (!listeners.length) {
            // Queue messages until we have listeners for it
            _this._queue[type] = _this._queue[type] || [];
            _this._queue[type].push({
                content: content,
                callback: callback,
                sender: sender
            });
        } else {
            listeners.forEach(function (fn) {
                return fn(content, callback, sender);
            });
        }
    };
    /**
     * Removes event listener
     */
    this.unlisten = function (type, cb) {
        var listeners = _this._listeners[type] || [],
            index = listeners.indexOf(cb);
        if (index !== -1) {
            if (listeners.length === 1) {
                delete _this._listeners[type];
            } else {
                listeners.splice(index, 1);
            }
        }
    };
    this.listenOnce = function (type, callback) {
        var listener = function listener(data, reply, sender) {
            _this.unlisten(type, listener);
            if (callback) callback(data, reply, sender);
        };
        _this.listen(type, listener);
    };
    /**
     * Event listen helper, also proccessed buffered events
     */
    this.listen = function (type, callback) {
        // console.log('[Messaging]', 'listen helper', type)
        _this._listeners[type] = _this._listeners[type] || [];
        if (_this._listeners[type].indexOf(callback) === -1) _this._listeners[type].push(callback);
        // fire queued messages
        var queue = _this._queue[type] || [];
        if (!queue.length) return;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = (0, _getIterator3.default)(queue), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                try {
                    callback(item.content, item.callback, item.sender);
                } catch (e) {
                    console.error('exception during proccesing buffered messages', e);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        delete _this._queue[type];
    };
};

exports.MessageHelperImpl = MessageHelperImpl;
exports.safariBridgeId = 'forge-bridge' + config_1.getUuid();
function getSafariActiveTab() {
    return safari.application.activeBrowserWindow && safari.application.activeBrowserWindow.activeTab;
}
exports.getSafariActiveTab = getSafariActiveTab;
function getSafariActiveTabUrl() {
    var activeTab = getSafariActiveTab();
    return activeTab && activeTab.url || 'http://newtab';
}
exports.getSafariActiveTabUrl = getSafariActiveTabUrl;
function emitter() {
    var callbacks = {},
        messageBuffer = {};
    function emit(type, data, callback) {
        var listeners = callbacks[type];
        if (!listeners) {
            if (!messageBuffer[type]) messageBuffer[type] = [];
            messageBuffer[type].push({ data: data, callback: callback });
        } else {
            listeners.forEach(function (cb) {
                return cb(data, callback);
            });
        }
    }
    function on(type, cb) {
        if (!callbacks[type]) callbacks[type] = [];
        callbacks[type].push(cb);
        if (messageBuffer[type]) {
            messageBuffer[type].forEach(function (msg) {
                return cb(msg.data, msg.callback);
            });
        }
    }
    return {
        emit: emit,
        on: on
    };
}
exports.emitter = emitter;

},{"babel-runtime/core-js/get-iterator":14,"babel-runtime/helpers/classCallCheck":27,"lib/config":169}],159:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var util_1 = require("lib/util");

var SafariBackgroundMessageImpl = function () {
    function SafariBackgroundMessageImpl() {
        var _this = this;

        (0, _classCallCheck3.default)(this, SafariBackgroundMessageImpl);

        this.kind = 'background-message-api';
        this._messageHelper = new helpers_1.MessageHelperImpl();
        this._bridgeId = helpers_1.safariBridgeId;
        this.listen = function (type, callback) {
            if (type === 'tab-connected') {
                window.__bgEmitter.on(type, function (_, reply) {
                    // console.log('>>> tab-connected', type, reply)
                    // Moved as-is from Forge.
                    // Doesn't work without it.
                    callback({ tab: 'popup', url: helpers_1.getSafariActiveTabUrl() }, reply);
                });
            } else {
                window.__bgEmitter.on(type, callback);
            }
            _this._messageHelper.listen('broadcast-background', function (message, _, tab) {
                if (type !== null && type !== message.type) return;
                var data = message.content;
                if (message.type === 'tab-connected') {
                    data = {
                        tab: tab,
                        url: tab.url
                    };
                }
                callback(data, function (reply) {
                    // console.log('>>> reply callback called', message.type, reply)
                    if (!message.id) return;
                    _this._sendToTab(tab, message.id, reply);
                }, tab);
            });
        };
        this.broadcast = function (type, content) {
            // console.log('>>> broadcast', type, content)
            _this._sendToTabs('broadcast', { type: type, content: content, id: util_1.guid() });
        };
        this.toFocused = function (type, content) {
            // console.log('>>> toFocussed', type, content)
            _this._sendToTab(helpers_1.getSafariActiveTab(), 'broadcast', {
                type: type,
                content: content,
                callid: util_1.guid()
            });
        };
        this._sendToTab = function (tab, event, data) {
            if (tab === 'popup') return _this._emitToPopup(data.type, data.content);
            if (typeof tab === 'string') return;
            if (!tab || !tab.page) {
                throw Error('Cannot sentTo to malformed tab ' + tab);
            }
            tab.page.dispatchMessage(_this._bridgeId, {
                method: 'message',
                event: event,
                data: data
            });
        };
        console.info('Initialize API for BG');
        safari.application.addEventListener('message', function (msg) {
            return _this._onMessage(msg);
        }, false);
        window.__bgEmitter = window.__bgEmitter || helpers_1.emitter();
    }

    (0, _createClass3.default)(SafariBackgroundMessageImpl, [{
        key: "_onMessage",
        value: function _onMessage(msgEvt) {
            if (msgEvt.name !== this._bridgeId) return;
            var message = msgEvt.message,
                target = msgEvt.target;
            // public method call or broadcast

            if (message.method === 'message') {
                var _message$params = message.params,
                    event = _message$params.event,
                    data = _message$params.data;

                if (event === 'broadcast') {
                    return this._sendToTabs('broadcast', data);
                }
                if (event === 'toFocussed') {
                    return this._sendToTab(helpers_1.getSafariActiveTab(), 'broadcast', data);
                }
                this._messageHelper.fire(event, data, undefined, target);
            }
        }
    }, {
        key: "sendTo",
        value: function sendTo(tabId, type, content, callback) {
            // console.log('>>> sendTo', type, content)
            var id = util_1.guid();
            this._messageHelper.listenOnce(id, callback);
            this._sendToTab(tabId, 'broadcast', { type: type, content: content, id: id });
        }
        // tslint:disable-next-line prefer-function-over-method

    }, {
        key: "_emitToPopup",
        value: function _emitToPopup(type, content, callback) {
            try {
                safari.extension.popovers[0].contentWindow.__popupEmitter.emit(type, content, callback);
            } catch (e) {
                console.info('emit popup error', e);
            }
        }
    }, {
        key: "_sendToTabs",
        value: function _sendToTabs(event, data) {
            var _this2 = this;

            safari.application.browserWindows.forEach(function (win) {
                win.tabs.forEach(function (tab) {
                    return _this2._sendToTab(tab, event, data);
                });
            });
            this._emitToPopup(data.type, data.content);
        }
    }]);
    return SafariBackgroundMessageImpl;
}();

exports.SafariBackgroundMessageImpl = SafariBackgroundMessageImpl;

},{"./helpers":158,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],160:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var util_1 = require("lib/util");

var SafariContentScriptMessageImpl = function () {
    function SafariContentScriptMessageImpl() {
        var _this = this;

        (0, _classCallCheck3.default)(this, SafariContentScriptMessageImpl);

        this.kind = 'content-script-message-api';
        this._bridgeId = helpers_1.safariBridgeId;
        this._messageHelper = new helpers_1.MessageHelperImpl();
        this._tabInit = function () {
            document.removeEventListener('visibilitychange', _this._tabInit);
            _this.broadcastBackground('tab-connected');
        };
        this.broadcastBackground = function (type, content, callback) {
            return _this._sendToBackground('broadcast-background', type, content, callback);
        };
        this.broadcast = function (type, content) {
            return _this._sendToBackground('broadcast', type, content);
        };
        this.toFocused = function (type, content) {
            _this._sendToBackground('toFocussed', type, content);
        };
        this._dispatchMessage = function (event, data) {
            if (!safari.self.tab) return;
            safari.self.tab.dispatchMessage(_this._bridgeId, {
                callid: util_1.guid(),
                method: 'message',
                params: {
                    event: event,
                    data: data
                }
            });
        };
        this._sendToBackground = function (event, type, content, callback) {
            var id = util_1.guid();
            if (callback) {
                var listener = function listener(data) {
                    if (callback) callback(data);
                    _this._messageHelper.unlisten(event, listener);
                };
                _this._messageHelper.listen(id, listener);
            }
            _this._dispatchMessage(event, { type: type, content: content, id: id });
        };
        this._onMessage = function (msgEvt) {
            if (msgEvt.name !== _this._bridgeId) return;
            var msg = msgEvt.message;
            if (msg.method === 'message') {
                _this._messageHelper.fire(msg.event, msg.data);
            }
        };
        if (window.top !== window) return;
        if (window.safari && window.safari.self) {
            window.safari.self.addEventListener('message', this._onMessage, false);
        }
        /*
        * Safari may preload webpages in the background.
        * So, it may cause some issues with messaging.
        */
        if (document.hidden) {
            document.addEventListener('visibilitychange', this._tabInit);
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this._tabInit, false);
        } else {
            this._tabInit();
        }
    }

    (0, _createClass3.default)(SafariContentScriptMessageImpl, [{
        key: "listen",
        value: function listen(type, callback) {
            var _this2 = this;

            this._messageHelper.listen('broadcast', function (message) {
                if (type !== null && type !== message.type) return;
                callback(message.content, function (reply) {
                    if (!message.id) return;
                    _this2._dispatchMessage(message.id, reply);
                });
            });
        }
    }]);
    return SafariContentScriptMessageImpl;
}();

exports.SafariContentScriptMessageImpl = SafariContentScriptMessageImpl;

},{"./helpers":158,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],161:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var util_1 = require("lib/util");

var SafariPopupMessageImpl = function () {
    function SafariPopupMessageImpl() {
        var _this = this;

        (0, _classCallCheck3.default)(this, SafariPopupMessageImpl);

        this.kind = 'content-script-message-api';
        this._bridgeId = helpers_1.safariBridgeId;
        this._bgEmitter = window.safari.extension.globalPage.contentWindow.__bgEmitter;
        this._popupEmitter = window.__popupEmitter = window.__popupEmitter || helpers_1.emitter();
        this.listen = function (type, callback) {
            _this._popupEmitter.on(type, callback);
        };
        this.broadcastBackground = function (type, content, callback) {
            if (_this._bgEmitter) _this._bgEmitter.emit(type, content, callback);
        };
        /**
         *
         * With high probability methods below will not be used
         * in Safari message API on settings popup page.
         *
         * Consider removing it in future
         *
         */
        this.broadcast = function (type, content) {
            // console.log('>>> broadcast', type, content)
            _this._sendToTabs('broadcast', { type: type, content: content, id: util_1.guid() });
        };
        this.toFocused = function (type, content) {
            // console.log('>>> toFocussed', type, content)
            _this._sendToTab(helpers_1.getSafariActiveTab(), 'broadcast', {
                type: type,
                content: content,
                callid: util_1.guid()
            });
        };
        this._sendToTab = function (tab, event, data) {
            if (tab === 'popup') return _this._emitToPopup(data.type, data.content);
            if (!tab || !tab.page) {
                throw Error('Cannot sentTo to malformed tab ' + tab);
            }
            tab.page.dispatchMessage(_this._bridgeId, {
                method: 'message',
                event: event,
                data: data
            });
        };
        console.info('Initialize API for Popup');
    }
    // tslint:disable-next-line prefer-function-over-method


    (0, _createClass3.default)(SafariPopupMessageImpl, [{
        key: "_emitToPopup",
        value: function _emitToPopup(type, content, callback) {
            try {
                safari.extension.popovers[0].contentWindow.__popupEmitter.emit(type, content, callback);
            } catch (e) {
                console.info('emit popup error', e);
            }
        }
    }, {
        key: "_sendToTabs",
        value: function _sendToTabs(event, data) {
            var _this2 = this;

            safari.application.browserWindows.forEach(function (win) {
                win.tabs.forEach(function (tab) {
                    return _this2._sendToTab(tab, event, data);
                });
            });
            this._emitToPopup(data.type, data.content);
        }
    }]);
    return SafariPopupMessageImpl;
}();

exports.SafariPopupMessageImpl = SafariPopupMessageImpl;

},{"./helpers":158,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],162:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var safari_content_1 = require("./message/safari-content");
var safari_bg_1 = require("./message/safari-bg");
var safari_popup_1 = require("./message/safari-popup");
var safari_1 = require("./tabs/safari");
var util_1 = require("lib/util");
var stdlib_1 = require("stdlib");
exports.hacksForSettingsPopupCompatibility = function () {
    safari.application.addEventListener('popover', function (_) {
        var popup = safari.extension.popovers[0];
        if (!popup) return;
        safari.self.height = safari.self.width = 0;
        document.dispatchEvent(new CustomEvent('popup-open'));
    }, true);
    window.addEventListener('update-window-size-gr', function (_) {
        var el = document.body;
        safari.self.height = el.clientHeight;
        safari.self.width = el.clientWidth - 1;
    }, false);
    window.addEventListener('close-popup-gr', function (_) {
        return safari.self.hide();
    }, false);
};
function decodeValue(value) {
    if (value === undefined || value === null) return null;
    try {
        return decodeURIComponent(value);
    } catch (e) {
        // tslint:disable-next-line no-console
        console.warn("Failed to decode URI sequence: " + value);
        return null;
    }
}

var SafariApi = function SafariApi() {
    (0, _classCallCheck3.default)(this, SafariApi);

    this.tabs = new safari_1.SafariTabsImpl();
    this.notification = {
        kind: 'fallback',
        create: function create(options) {
            return new _promise2.default(function (resolve, reject) {
                var title = options.title,
                    message = options.message,
                    onClicked = options.onClicked;

                var create = function create() {
                    var notification = new Notification(title, {
                        body: message
                    });
                    if (onClicked !== undefined) {
                        notification.onclick = function () {
                            return onClicked();
                        };
                    }
                    resolve();
                };
                if (Notification && Notification.permission !== 'granted') {
                    Notification.requestPermission(function (status) {
                        if (status !== 'granted') {
                            reject(new Error('Notification permission denied'));
                        } else {
                            create();
                        }
                    });
                } else {
                    create();
                }
            });
        }
    };
    this.cookies = {
        kind: 'fallback',
        get: function get() {
            /** Stub function. */
            return _promise2.default.resolve(null);
        },
        remove: function remove() {
            /** Stub function. */
            return _promise2.default.resolve(null);
        },
        getAll: function getAll() {
            /** Stub function. */
            return _promise2.default.resolve([]);
        },
        set: function set() {
            /** Stub function. */
            return _promise2.default.resolve(null);
        },
        watch: function watch() {
            /** Stub function. */
        }
    };
    this.preferences = {
        get: function get(key) {
            return stdlib_1.SafePromise.create(function (resolve) {
                return resolve(decodeValue(safari.extension.settings[key]));
            });
        },
        set: function set(key, value) {
            return stdlib_1.SafePromise.create(function (resolve) {
                safari.extension.settings[key] = encodeURIComponent(value);
                resolve();
            });
        },
        getAll: function getAll() {
            return stdlib_1.SafePromise.create(function (resolve) {
                var settings = safari.extension.settings;
                var filteredSettings = (0, _keys2.default)(settings).filter(function (k) {
                    return settings.hasOwnProperty(k);
                }).reduce(function (obj, k) {
                    obj[k] = decodeValue(settings[k]);
                    return obj;
                }, {});
                resolve(filteredSettings);
            });
        },
        remove: function remove(key) {
            return stdlib_1.SafePromise.create(function (resolve) {
                delete safari.extension.settings[key];
                resolve();
            });
        },
        removeAll: function removeAll() {
            return stdlib_1.SafePromise.create(function (resolve) {
                safari.extension.settings.clear();
                resolve();
            });
        }
    };
    this.button = {
        kind: 'fallback',
        setBadge: function setBadge(text) {
            // TODO: Set only for active tab
            var toolbarItems = safari.extension.toolbarItems;
            toolbarItems.forEach(function (toolbarButton) {
                return toolbarButton.badge = text;
            });
        },

        /*
         * Set toolbar icon in format: `default-icon-name-${name}.png`
         * Default: default-icon-name.png
         */
        setIconByName: function setIconByName(name) {
            // TODO: Set only for active tab
            var badgePrevPrefix = void 0;
            var toolbarItems = safari.extension.toolbarItems;
            var img = toolbarItems[0].image.split('.');
            var ext = img.pop();
            var prefix = name ? '-' + name : '';
            if (badgePrevPrefix === prefix) return;
            var imgStr = img.join('.');
            if (badgePrevPrefix) imgStr = imgStr.split(badgePrevPrefix)[0];
            if (prefix) imgStr = imgStr.split(prefix)[0];
            badgePrevPrefix = prefix;
            toolbarItems.forEach(function (toolbarButton) {
                return toolbarButton.image = "" + img + prefix + "." + ext;
            });
        }
    };
    this.management = {
        uninstallSelf: function uninstallSelf() {
            /** */
        }
    };
    this.message = util_1.isBg() ? new safari_bg_1.SafariBackgroundMessageImpl() : util_1.isSafariSettingsPopup() ? new safari_popup_1.SafariPopupMessageImpl() : new safari_content_1.SafariContentScriptMessageImpl();
};

function getApi() {
    return new SafariApi();
}
exports.getApi = getApi;

},{"./message/safari-bg":159,"./message/safari-content":160,"./message/safari-popup":161,"./tabs/safari":167,"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"lib/util":200,"stdlib":203}],163:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var stdlib_1 = require("stdlib");
var lodash_1 = require("lodash");
var StorageMigrationResult;
(function (StorageMigrationResult) {
    StorageMigrationResult[StorageMigrationResult["success"] = 0] = "success";
    StorageMigrationResult[StorageMigrationResult["successWithEmpty"] = 1] = "successWithEmpty";
    StorageMigrationResult[StorageMigrationResult["alreadyMigrated"] = 2] = "alreadyMigrated";
})(StorageMigrationResult = exports.StorageMigrationResult || (exports.StorageMigrationResult = {}));
var InternalStorageMigrationResult;
(function (InternalStorageMigrationResult) {
    InternalStorageMigrationResult[InternalStorageMigrationResult["nonEmptyMigration"] = 0] = "nonEmptyMigration";
    InternalStorageMigrationResult[InternalStorageMigrationResult["emptyMigration"] = 1] = "emptyMigration";
})(InternalStorageMigrationResult || (InternalStorageMigrationResult = {}));
function createMigrationAwareApi(api, preserveValue) {
    return {
        get: api.get.bind(api),
        set: api.set.bind(api),
        getAll: api.getAll.bind(api),
        remove: api.remove.bind(api),
        removeAll: function removeAll() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var all;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return api.getAll();

                            case 2:
                                all = _context.sent;
                                _context.next = 5;
                                return api.removeAll();

                            case 5:
                                _context.next = 7;
                                return _promise2.default.all((0, _keys2.default)(all).filter(preserveValue).map(function (k) {
                                    return api.set(k, all[k]);
                                }));

                            case 7:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    };
}
exports.createMigrationAwareApi = createMigrationAwareApi;
/**
 * Utility class for preference storage migration.
 *
 * Features:
 * -  Migration status is tracked by writing to a special key at destination storage. The key needs
 *    to be unique, because there may exist more than one migration in the same storage.
 * -  Migration is not performed when it was already done (as determined by migration status).
 * -  Destination storage is cleared before migration.
 *
 * Migration can be:
 * -  Verbatim or mapped. Verbatim is "as is" data copy. Mapped is when
 *    keys or values are changed during migration.
 * -  To a different storage (external) or within the same storage (internal).
 *
 * Examples:
 * -  Migrating to a different storage backend is _external verbatim migration_.
 * -  Migrating to a different data format within the same storage is _internal mapped migration_.
 * -  Migrating to a new storage backend with data format change is _external mapped migration_.
 * -  _Internal verbatim migration_ doesn't make any sense (since nor data location neither format
 *    is changed), although still technically possible.
 *
 * While technically you can do mapped migrations by wrapping the destination storage backend
 * interface (PreferencesApi), it's probably not very convenient. Nevertheless, this implementation
 * does NOT yet provide any help with mapped migrations.
 */

var StorageMigration = function () {
    /**
     * @param {string} _name a *unique* name of this migration
     * @param {PreferencesApi} _source data source
     * @param {PreferencesApi} _destination migration destination
     * @param {string[]} [_destValuesToKeep=[]] a list of keys in destination storage
     *    which will be kept during migration (need this for SF-370)
     */
    function StorageMigration(_name, _source, _destination) {
        var _this = this;

        var _destValuesToKeep = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

        (0, _classCallCheck3.default)(this, StorageMigration);

        this._name = _name;
        this._source = _source;
        this._destination = _destination;
        this._destValuesToKeep = _destValuesToKeep;
        this._migrationFlagSuccessfulValue = 'ok';
        // A unique prefix for storage migration flags. Do not ever change it!
        this._migrationFlagUniqueKey = '104ccd8c-9919-9ae4-931f-782fb197486c';
        this._migrationFlagKey = "__migration-" + this._migrationFlagUniqueKey + ":(" + this._name + ")";
        this._migrationInProgress = false;
        this.migrationAwareDestination = createMigrationAwareApi(this._destination, function (k) {
            return k === _this._migrationFlagKey;
        });
    }

    (0, _createClass3.default)(StorageMigration, [{
        key: "_getMigrated",
        value: function _getMigrated() {
            var _this2 = this;

            return this._destination.get(this._migrationFlagKey).then(function (x) {
                return x === _this2._migrationFlagSuccessfulValue;
            });
        }
    }, {
        key: "_setMigrated",
        value: function _setMigrated() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                var actualStatus;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this._destination.set(this._migrationFlagKey, this._migrationFlagSuccessfulValue);

                            case 2:
                                _context2.next = 4;
                                return this._destination.get(this._migrationFlagKey);

                            case 4:
                                actualStatus = _context2.sent;

                                if (!(actualStatus !== this._migrationFlagSuccessfulValue)) {
                                    _context2.next = 7;
                                    break;
                                }

                                throw new Error("Could not verify status write, actual value: " + actualStatus);

                            case 7:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: "_runMigration",
        value: function _runMigration() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                var _this3 = this;

                var payload, sourceIsEmpty;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                stdlib_1.assert(!this._migrationInProgress, 'migration already in progress');
                                this._migrationInProgress = true;
                                _context3.prev = 2;
                                _context3.next = 5;
                                return this._source.getAll();

                            case 5:
                                payload = _context3.sent;

                                // use this later to determine whether there was any data to migrate
                                sourceIsEmpty = (0, _keys2.default)(payload).length === 0;
                                // store destination key/values that we are expected to keep

                                _context3.next = 9;
                                return _promise2.default.all(this._destValuesToKeep.map(function (k) {
                                    return _this3._destination.get(k).then(function (v) {
                                        if (v != null) payload[k] = v;
                                    });
                                }));

                            case 9:
                                _context3.next = 11;
                                return this._destination.removeAll();

                            case 11:
                                _context3.next = 13;
                                return _promise2.default.all((0, _keys2.default)(payload).filter(function (k) {
                                    return payload[k] != null;
                                }).map(function (k) {
                                    return _this3._destination.set(k, payload[k]);
                                }));

                            case 13:
                                _context3.t0 = lodash_1;
                                _context3.t1 = payload;
                                _context3.next = 17;
                                return this._destination.getAll();

                            case 17:
                                _context3.t2 = _context3.sent;

                                if (_context3.t0.isEqual.call(_context3.t0, _context3.t1, _context3.t2)) {
                                    _context3.next = 20;
                                    break;
                                }

                                throw new Error('Could not verify write');

                            case 20:
                                this._migrationInProgress = false;
                                return _context3.abrupt("return", sourceIsEmpty ? InternalStorageMigrationResult.emptyMigration : InternalStorageMigrationResult.nonEmptyMigration);

                            case 24:
                                _context3.prev = 24;
                                _context3.t3 = _context3["catch"](2);

                                this._migrationInProgress = false;
                                throw _context3.t3;

                            case 28:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[2, 24]]);
            }));
        }
        /**
         * Ensure that the migration was completed.
         *
         * Runs the migration if it was not yet completed. Does nothing if it was.
         */

    }, {
        key: "ensureMigrationCompleted",
        value: function ensureMigrationCompleted() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
                var internalMigrationResult, _;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this._getMigrated();

                            case 2:
                                if (!_context4.sent) {
                                    _context4.next = 6;
                                    break;
                                }

                                return _context4.abrupt("return", StorageMigrationResult.alreadyMigrated);

                            case 6:
                                _context4.next = 8;
                                return this._runMigration();

                            case 8:
                                internalMigrationResult = _context4.sent;
                                _context4.next = 11;
                                return this._setMigrated();

                            case 11:
                                _context4.t0 = internalMigrationResult;
                                _context4.next = _context4.t0 === InternalStorageMigrationResult.nonEmptyMigration ? 14 : _context4.t0 === InternalStorageMigrationResult.emptyMigration ? 15 : 16;
                                break;

                            case 14:
                                return _context4.abrupt("return", StorageMigrationResult.success);

                            case 15:
                                return _context4.abrupt("return", StorageMigrationResult.successWithEmpty);

                            case 16:
                                _ = internalMigrationResult;
                                throw new Error("Match not exhaustive: " + internalMigrationResult);

                            case 18:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        }
    }]);
    return StorageMigration;
}();

exports.StorageMigration = StorageMigration;

},{"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/regenerator":35,"lodash":"lodash","stdlib":203}],164:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var chrome_util_1 = require("../chrome-util");

var ChromeTabsApiImpl = function () {
    function ChromeTabsApiImpl() {
        (0, _classCallCheck3.default)(this, ChromeTabsApiImpl);

        this.kind = 'web-extension';
    }

    (0, _createClass3.default)(ChromeTabsApiImpl, [{
        key: "open",
        value: function open(url, activateOnOpen) {
            return new _promise2.default(function (resolve, reject) {
                chrome.tabs.create({ url: url, active: activateOnOpen }, function (tab) {
                    chrome_util_1.handleChromeError(function () {
                        return resolve(tab);
                    }, reject);
                });
            });
        }
    }, {
        key: "updateCurrent",
        value: function updateCurrent(url) {
            return new _promise2.default(function (resolve, reject) {
                chrome.tabs.update({ url: url }, function (tab) {
                    chrome_util_1.handleChromeError(function () {
                        return resolve(tab);
                    }, reject);
                });
            });
        }
    }, {
        key: "getActiveTab",
        value: function getActiveTab() {
            return new _promise2.default(function (resolve, reject) {
                var ct = chrome.tabs;
                ct.query({ active: true, lastFocusedWindow: true }, function (tabs) {
                    chrome_util_1.handleChromeError(function () {
                        return !tabs || !tabs.length ? ct.query({ active: true }, function (tabs) {
                            chrome_util_1.handleChromeError(function () {
                                return resolve(tabs[0]);
                            }, reject);
                        }) : resolve(tabs[0]);
                    }, reject);
                });
            });
        }
    }, {
        key: "getAllTabs",
        value: function getAllTabs() {
            return new _promise2.default(function (resolve, reject) {
                return chrome.tabs.query({}, function (tabs) {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve(tabs);
                    }, reject);
                });
            });
        }
    }, {
        key: "getActiveTabUrl",
        value: function getActiveTabUrl() {
            var _this = this;

            return new _promise2.default(function (resolve, reject) {
                return _this.getActiveTab().then(function (tab) {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve(tab.url);
                    }, reject);
                });
            });
        }
        // this is logic from api-priv-chrome

    }, {
        key: "onActiveTabChange",
        value: function onActiveTabChange(listener, error) {
            var _this2 = this;

            var resolveWithCheck = function resolveWithCheck(tab) {
                chrome_util_1.handleChromeError(function () {
                    if (tab) listener(tab);
                }, error);
            };
            chrome.tabs.onActivated.addListener(function (activeTab) {
                return chrome.tabs.get(activeTab.tabId, function (tab) {
                    return resolveWithCheck(tab);
                });
            });
            chrome.tabs.onUpdated.addListener(function (tabId, reason) {
                _this2.getActiveTab().then(function (tab) {
                    if (tab.id !== tabId) return;
                    if (reason.url || reason.favIconUrl || reason.status === 'complete') {
                        chrome.tabs.get(tabId, function (active) {
                            return resolveWithCheck(active);
                        });
                    }
                });
            });
            chrome.windows.onFocusChanged.addListener(function (windowId) {
                return chrome.tabs.query({ active: true, windowId: windowId, lastFocusedWindow: true }, function (tabs) {
                    return resolveWithCheck(tabs[0]);
                });
            });
            this.getActiveTab().then(function (tab) {
                return resolveWithCheck(tab);
            });
        }
    }, {
        key: "reload",
        value: function reload(tabId) {
            return new _promise2.default(function (resolve, reject) {
                var cb = function cb() {
                    return chrome_util_1.handleChromeError(function () {
                        return resolve();
                    }, reject);
                };
                if (tabId) {
                    chrome.tabs.reload(tabId, {}, cb);
                } else {
                    chrome.tabs.reload(cb);
                }
            });
        }
    }]);
    return ChromeTabsApiImpl;
}();

exports.ChromeTabsApiImpl = ChromeTabsApiImpl;

},{"../chrome-util":148,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],165:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var edge_util_1 = require("../edge-util");

var EdgeTabsApiImpl = function () {
    function EdgeTabsApiImpl() {
        (0, _classCallCheck3.default)(this, EdgeTabsApiImpl);

        this.kind = 'web-extension';
    }

    (0, _createClass3.default)(EdgeTabsApiImpl, [{
        key: "open",
        value: function open(url, activateOnOpen) {
            return new _promise2.default(function (resolve, reject) {
                edge.tabs.create({ url: url, active: activateOnOpen }, function (tab) {
                    edge_util_1.handleEdgeError(function () {
                        return resolve(tab);
                    }, reject);
                });
            });
        }
    }, {
        key: "updateCurrent",
        value: function updateCurrent(url) {
            return new _promise2.default(function (resolve, reject) {
                edge.tabs.update({ url: url }, function (tab) {
                    edge_util_1.handleEdgeError(function () {
                        return resolve(tab);
                    }, reject);
                });
            });
        }
    }, {
        key: "getActiveTab",
        value: function getActiveTab() {
            return new _promise2.default(function (resolve, reject) {
                var ct = edge.tabs;
                ct.query({ active: true, lastFocusedWindow: true }, function (tabs) {
                    edge_util_1.handleEdgeError(function () {
                        return !tabs || !tabs.length ? ct.query({ active: true }, function (tabs) {
                            edge_util_1.handleEdgeError(function () {
                                return resolve(tabs[0]);
                            }, reject);
                        }) : resolve(tabs[0]);
                    }, reject);
                });
            });
        }
    }, {
        key: "getAllTabs",
        value: function getAllTabs() {
            return new _promise2.default(function (resolve, reject) {
                return edge.tabs.query({}, function (tabs) {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve(tabs);
                    }, reject);
                });
            });
        }
    }, {
        key: "getActiveTabUrl",
        value: function getActiveTabUrl() {
            var _this = this;

            return new _promise2.default(function (resolve, reject) {
                return _this.getActiveTab().then(function (tab) {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve(tab.url);
                    }, reject);
                });
            });
        }
        // this is logic from api-priv-chrome

    }, {
        key: "onActiveTabChange",
        value: function onActiveTabChange(listener, error) {
            var _this2 = this;

            var resolveWithCheck = function resolveWithCheck(tab) {
                edge_util_1.handleEdgeError(function () {
                    if (tab) listener(tab);
                }, error);
            };
            edge.tabs.onActivated.addListener(function (activeTab) {
                return edge.tabs.get(activeTab.tabId, function (tab) {
                    return resolveWithCheck(tab);
                });
            });
            edge.tabs.onUpdated.addListener(function (tabId, reason) {
                _this2.getActiveTab().then(function (tab) {
                    if (tab.id !== tabId) return;
                    if (reason.url || reason.favIconUrl || reason.status === 'complete') {
                        edge.tabs.get(tabId, function (active) {
                            return resolveWithCheck(active);
                        });
                    }
                });
            });
            edge.windows.onFocusChanged.addListener(function (windowId) {
                return edge.tabs.query({ active: true, windowId: windowId, lastFocusedWindow: true }, function (tabs) {
                    return resolveWithCheck(tabs[0]);
                });
            });
            this.getActiveTab().then(function (tab) {
                return resolveWithCheck(tab);
            });
        }
    }, {
        key: "reload",
        value: function reload(tabId) {
            return new _promise2.default(function (resolve, reject) {
                var cb = function cb() {
                    return edge_util_1.handleEdgeError(function () {
                        return resolve();
                    }, reject);
                };
                if (tabId) {
                    edge.tabs.reload(tabId, {}, cb);
                } else {
                    edge.tabs.reload(cb);
                }
            });
        }
    }]);
    return EdgeTabsApiImpl;
}();

exports.EdgeTabsApiImpl = EdgeTabsApiImpl;

},{"../edge-util":150,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],166:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var FirefoxTabsApiImpl = function () {
    function FirefoxTabsApiImpl() {
        (0, _classCallCheck3.default)(this, FirefoxTabsApiImpl);

        this.kind = 'web-extension';
        this.getActiveTab = function () {
            return new _promise2.default(function (resolve, reject) {
                return firefox.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
                    if (!tabs || !tabs.length) {
                        firefox.tabs.query({ active: true }).then(function (tabs) {
                            return resolve(tabs[0]);
                        }, reject);
                    } else {
                        resolve(tabs[0]);
                    }
                }, reject);
            });
        };
    }

    (0, _createClass3.default)(FirefoxTabsApiImpl, [{
        key: "open",
        value: function open(url, activateOnOpen) {
            return firefox.tabs.create({ url: url, active: activateOnOpen });
        }
    }, {
        key: "updateCurrent",
        value: function updateCurrent(url) {
            return firefox.tabs.update({ url: url });
        }
    }, {
        key: "getAllTabs",
        value: function getAllTabs() {
            return firefox.tabs.query({});
        }
    }, {
        key: "getActiveTabUrl",
        value: function getActiveTabUrl() {
            return new _promise2.default(function (resolve, reject) {
                firefox.tabs.query({ active: true }).then(function (tabs) {
                    resolve(tabs[0].url);
                }, reject);
            });
        }
        // this is logic from api-priv-chrome

    }, {
        key: "onActiveTabChange",
        value: function onActiveTabChange(listener, error) {
            var _this = this;

            firefox.tabs.onActivated.addListener(function (activeTab) {
                return firefox.tabs.get(activeTab.tabId).then(function (x) {
                    return listener(x);
                }, error);
            });
            firefox.tabs.onUpdated.addListener(function (tabId, reason) {
                _this.getActiveTab().then(function (tab) {
                    if (tab.id !== tabId) return;
                    if (reason.url || reason.favIconUrl || reason.status === 'complete') firefox.tabs.get(tabId).then(listener, error);
                });
            });
            firefox.windows.onFocusChanged.addListener(function (windowId) {
                return firefox.tabs.query({ active: true, windowId: windowId, lastFocusedWindow: true }).then(function (tabs) {
                    return listener(tabs[0]);
                }, error);
            });
            this.getActiveTab().then(listener, error);
        }
    }, {
        key: "reload",
        value: function reload(tabId) {
            if (tabId) {
                return firefox.tabs.reload(tabId, {});
            } else {
                return firefox.tabs.reload();
            }
        }
    }]);
    return FirefoxTabsApiImpl;
}();

exports.FirefoxTabsApiImpl = FirefoxTabsApiImpl;

},{"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],167:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("lib/util");
function convertToBrowserTab(tab, active) {
    var id = util_1.getRandomIntInclusive(1, 100000);
    return {
        active: active || false,
        url: tab.url,
        title: tab.title,
        id: id
    };
}
function getActiveTabSync() {
    return safari.application.activeBrowserWindow && safari.application.activeBrowserWindow.activeTab;
}
function listenNavigateOnce(tab, handler) {
    var handleNavigate = function handleNavigate(e) {
        tab.removeEventListener('navigate', handleNavigate);
        handler(e);
    };
    tab.addEventListener('navigate', handleNavigate, false);
}

var SafariTabsImpl = function () {
    function SafariTabsImpl() {
        (0, _classCallCheck3.default)(this, SafariTabsImpl);

        this.kind = 'safari';
    }

    (0, _createClass3.default)(SafariTabsImpl, [{
        key: "open",
        value: function open(url, activateOnOpen) {
            return new _promise2.default(function (resolve, reject) {
                var currentTab = getActiveTabSync();
                if (!currentTab) {
                    reject('Active tab does not exist');
                } else {
                    var tab = safari.application.activeBrowserWindow.openTab();
                    // @TODO when should we set tab.url??
                    if (activateOnOpen) {
                        /**
                         * Adds event listener for `navigate` event.
                         * Resolve will be fired only after tab.url will receive a new value,
                         * which is in the next line
                         */
                        listenNavigateOnce(tab, function (_) {
                            return resolve(convertToBrowserTab(tab, true));
                        });
                        tab.url = url;
                    } else {
                        tab.url = url;
                        currentTab.activate();
                        resolve(convertToBrowserTab(tab, false));
                    }
                }
            });
        }
    }, {
        key: "getActiveTab",
        value: function getActiveTab() {
            var activeTab = getActiveTabSync();
            return activeTab ? _promise2.default.resolve(convertToBrowserTab(activeTab, true)) : _promise2.default.reject('Active tab does not exist');
        }
    }, {
        key: "updateCurrent",
        value: function updateCurrent(url) {
            return new _promise2.default(function (resolve, reject) {
                var tab = getActiveTabSync();
                if (!tab) return reject('Active tab does not exist');
                listenNavigateOnce(tab, function (_) {
                    return resolve(convertToBrowserTab(tab, true));
                });
                tab.url = url;
            });
        }
    }, {
        key: "getAllTabs",
        value: function getAllTabs() {
            return new _promise2.default(function (resolve, _) {
                var windows = safari.application.browserWindows;
                var allTabs = windows.reduce(function (tabs, w) {
                    return tabs.concat(w.tabs);
                }, []).map(function (x) {
                    return convertToBrowserTab(x);
                });
                resolve(allTabs);
            });
        }
    }, {
        key: "getActiveTabUrl",
        value: function getActiveTabUrl() {
            return new _promise2.default(function (resolve, reject) {
                var tab = getActiveTabSync();
                if (!tab) return reject('Active tab does not exist');
                // newtab - fallback url from api-prev-safari
                // todo: this fallback probably not need
                resolve(tab && tab.url || 'http://newtab');
            });
        }
        // @TODO will create a new interval on each call. think if we can make
        // it with a single interval

    }, {
        key: "onActiveTabChange",
        value: function onActiveTabChange(listener) {
            var lastActiveTab = getActiveTabSync();
            var activateHandler = function activateHandler() {
                lastActiveTab = getActiveTabSync();
                listener(convertToBrowserTab(lastActiveTab, true));
            };
            // logic from api-priv-safari
            // activate not fires for tab that moved to own window
            setInterval(function () {
                var newActiveTab = getActiveTabSync();
                if (newActiveTab && lastActiveTab !== newActiveTab) {
                    activateHandler();
                }
            }, 1000);
            safari.application.addEventListener('activate', activateHandler, true);
            safari.application.addEventListener('navigate', activateHandler, true);
            activateHandler();
        }
    }]);
    return SafariTabsImpl;
}();

exports.SafariTabsImpl = SafariTabsImpl;

},{"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"lib/util":200}],168:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var stdlib_1 = require("stdlib");
var storage_migration_1 = require("./storage-migration");
var content_1 = require("./message/content");
exports.hacksForCompatibility = content_1.hacksForCompatibility;
var bg_1 = require("./message/bg");
exports.bgPreload = bg_1.bgPreload;
var preferencesApi;
(function (preferencesApi) {
    /**
     * Low-level PreferencesApi implementation
     * Just a proxy to/from localStorage
     */
    preferencesApi.windowLocalStorage = {
        get: function get(key) {
            return stdlib_1.SafePromise.sync(function () {
                return window.localStorage.getItem(key);
            });
        },
        set: function set(key, value) {
            return stdlib_1.SafePromise.sync(function () {
                return window.localStorage.setItem(key, value);
            });
        },
        getAll: function getAll() {
            return stdlib_1.SafePromise.sync(function () {
                var all = {};
                (0, _keys2.default)(window.localStorage).forEach(function (key) {
                    all[key] = window.localStorage.getItem(key);
                });
                return all;
            });
        },
        remove: function remove(key) {
            return stdlib_1.SafePromise.sync(function () {
                return window.localStorage.removeItem(key);
            });
        },
        removeAll: function removeAll() {
            return stdlib_1.SafePromise.sync(function () {
                return window.localStorage.clear();
            });
        }
    };
    /**
     * Low-level PreferencesApi implementation
     * Just a proxy to/from firefox.storage
     */
    preferencesApi.browserStorageLocal = {
        get: function get(key) {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var valueObject;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return firefox.storage.local.get(key);

                            case 2:
                                valueObject = _context.sent;
                                return _context.abrupt("return", valueObject.hasOwnProperty(key) ? valueObject[key] : null);

                            case 4:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        },
        set: function set(key, value) {
            return firefox.storage.local.set((0, _defineProperty3.default)({}, key, value));
        },
        getAll: function getAll() {
            return firefox.storage.local.get(null);
        },
        remove: function remove(key) {
            return firefox.storage.local.remove(key);
        },
        removeAll: function removeAll() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return firefox.storage.local.clear();

                            case 2:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    };
    var migration = new storage_migration_1.StorageMigration('firefoxLocalStorageToExtApi', preferencesApi.windowLocalStorage, preferencesApi.browserStorageLocal,
    // keep 'version' value -- we have already 'migrated' it in SF-370
    ['version']);
    /**
     * A promise to track data migration progress.
     *
     * - resolves to false if not started or failed
     * - resolves to true if successfully completed
     * - blocks if migration is in progress
     */
    var migrationCompleted = _promise2.default.resolve(false);
    var ensureMigrationCompletedCalled = false;
    /**
     * Runs the data migration if required. Call this before any calls to the
     * preferences API.
     */
    function ensureMigrationCompleted() {
        ensureMigrationCompletedCalled = true;
        var migrationCompletedPcs = stdlib_1.SafePromise.createCompletionSource();
        migrationCompleted = migrationCompletedPcs.promise;
        return migration.ensureMigrationCompleted().then(function (x) {
            migrationCompletedPcs.resolve(true);
            return _promise2.default.resolve(x);
        }, function (err) {
            migrationCompletedPcs.resolve(false);
            return _promise2.default.reject(err);
        });
    }
    preferencesApi.ensureMigrationCompleted = ensureMigrationCompleted;
    function getMigrationAwareMethod(apiName) {
        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            stdlib_1.assert(ensureMigrationCompletedCalled === true, 'supposed to run data migration before accessing prefs with web-extensions API');
            // if migration is in progress, wait for it to complete
            return migrationCompleted.then(function (completed) {
                var instance = completed ? migration.migrationAwareDestination : preferencesApi.windowLocalStorage;
                return instance[apiName].apply(instance, args);
            });
        };
    }
    /**
     * A data migration-aware PreferencesApi instance. Depending on whether
     * the data migration was ran (and successfully), it will act as either
     * windowLocalStorage or browserStorageLocal preferences API.
     *
     * Methods of this interface will block until the migration is completed
     * if called while a migration is in progress.
     */
    preferencesApi.migrationAware = {
        get: getMigrationAwareMethod('get'),
        set: getMigrationAwareMethod('set'),
        getAll: getMigrationAwareMethod('getAll'),
        remove: getMigrationAwareMethod('remove'),
        removeAll: getMigrationAwareMethod('removeAll')
    };
})(preferencesApi = exports.preferencesApi || (exports.preferencesApi = {}));

},{"./message/bg":156,"./message/content":157,"./storage-migration":163,"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/defineProperty":29,"babel-runtime/regenerator":35,"stdlib":203}],169:[function(require,module,exports){
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var SparkMD5 = require("spark-md5");
var newConfig_1 = require("./newConfig");
var newConfig_2 = require("./newConfig");
exports.isTestsMode = newConfig_2.isTestsMode;
exports.getVersion = newConfig_2.getVersion;
exports.getUuid = newConfig_2.getUuid;
exports.ENV = newConfig_2.ENV;
exports.MIXPANEL = newConfig_2.MIXPANEL;
exports.STATSC = newConfig_2.STATSC;
exports.GRAMMARLY_DOMAIN = newConfig_2.GRAMMARLY_DOMAIN;
exports.DAPI = newConfig_2.DAPI;
exports.URLS = newConfig_2.URLS;
exports.appName = newConfig_2.appName;
exports.gnarAppName = newConfig_2.gnarAppName;
exports.FELOG = {
    key: 'b37252e300204b00ad697fe1d3b979e1',
    project: '15',
    pingTimeout: 10 * 60 * 1000
};
exports.GNAR = {
    url: 'https://gnar.grammarly.com',
    domain: '.grammarly.com'
};
// TODO QA env?
/*  GNAR = {
    url: 'https://gnar.qagr.io',
    domain: '.qagr.io'
  }
*/
function updateUrls() {
    var overwritedUlrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    (0, _assign2.default)(newConfig_1.URLS, overwritedUlrs);
}
exports.updateUrls = updateUrls;
exports.news = ['The G logo gets out of the way when you\'re typing', 'Switch between American and British English', 'Quickly disable checking in certain types of text fields', 'A fully redesigned and improved interface'];
exports.newsId = exports.news.length && SparkMD5.hash(exports.news.join('\n'));
exports.userFields = ['id', 'email', 'firstName', 'anonymous', 'type', 'subscriptionFree', 'experiments', 'isTest', 'premium', 'settings', 'registrationDate', 'mimic', 'groups', 'extensionInstallDate', 'fixed_errors', 'referral'];
// if (!process.env.PROD) { TEMPORARY
exports.userFields.push('token');
// }
exports.FEATURES = {
    'EXAMPLE_FEATURE': 'example_feature'
};
var DISABLED_FEATURES = {
    'example_feature': {
        'Free': [],
        'Premium': []
    }
};
function isFeatureDisabled(feature, mimic, type) {
    var disabledGroups = DISABLED_FEATURES[feature][type] || [];
    return disabledGroups && mimic && mimic.some(function (group) {
        return disabledGroups.includes(group);
    });
}
exports.isFeatureDisabled = isFeatureDisabled;
// debug: true,
exports.nextVerClass = 'gr_ver_2';
exports.grammarlyAttrs = ['data-gramm_editor', 'data-gramm', 'data-gramm_id', 'gramm_editor'];
exports.restrictedAttrs = [].concat((0, _toConsumableArray3.default)(exports.grammarlyAttrs), ['readonly', 'disabled', 'pm-container', 'data-synchrony', ['class', 'redactor-editor'], ['class', 'redactor_box'], ['aria-label', 'Search Facebook']]);
exports.restrictedParentAttrs = '[data-reactid]';
exports.externalEvents = ['changed-user', 'changed-plan', 'changed-dialect', 'cleanup', 'editor-fix', 'enable-email-perception'];
exports.development = document.location.host === '127.0.0.1:3117';

},{"./newConfig":174,"babel-runtime/core-js/object/assign":17,"babel-runtime/helpers/toConsumableArray":33,"spark-md5":"spark-md5"}],170:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var message = require("./message");
var METHODS = ['info', 'warn', 'error', 'time', 'timeEnd', 'debug'];
var w = window;
var originalConsole = console;
/**
 * Disable console.log only
 */
function disableConsoleLog() {
    var newConsole = { log: util_1._f };
    METHODS.forEach(function (method) {
        newConsole[method] = originalConsole[method];
    });
    w.console = newConsole;
}
exports.disableConsoleLog = disableConsoleLog;
function listenForBgLogs() {
    message.on('bg-log', function (obj) {
        var _console;

        (_console = console)[obj.method].apply(_console, ['BG LOG'].concat((0, _toConsumableArray3.default)(obj.args)));
    });
}
var storedLogs = [];
/**
 * Stringify all arguments
 * and receive log messages from background
 */
function setSeleniumCompatibility() {
    listenForBgLogs();
    var newConsole = {};
    METHODS.concat('log').forEach(function (method) {
        newConsole[method] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            try {
                storedLogs.push({ method: method, args: args });
                originalConsole[method]((0, _stringify2.default)(args));
            } catch (e) {}
        };
    });
    w.console = newConsole;
}
exports.setSeleniumCompatibility = setSeleniumCompatibility;
function flushLog() {
    var result = storedLogs.concat();
    storedLogs.length = 0;
    return result;
}
exports.flushLog = flushLog;

},{"./message":173,"./util":200,"babel-runtime/core-js/json/stringify":16,"babel-runtime/helpers/toConsumableArray":33}],171:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var ReactDOM = require("react-dom");
var _ = require("lodash");
var util_1 = require("./util");
var stdlib_1 = require("stdlib");
// @TODO html arg should be checked to create meaningful HTMLElement
// so that div.firstElementChild is not null
function createEl(html, doc) {
    var div = (doc || document).createElement('div');
    div.innerHTML = html.trim();
    return div.firstElementChild;
}
exports.createEl = createEl;
function renderReactWithParent(reactElement, p, id) {
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'div';

    var parent = p;
    var react = parent[id] = parent[id] || {};
    if (!react.el) {
        react.el = parent.ownerDocument.createElement(type);
        parent.appendChild(react.el);
    }
    var component = ReactDOM.render(reactElement, react.el); // @TODO the types are not right
    if (react.remove == null) {
        react.remove = function () {
            delete parent[id];
            parent.removeChild(react.el);
            ReactDOM.unmountComponentAtNode(react.el);
        };
    }
    return {
        component: component,
        remove: react.remove.bind(react),
        el: react.el
    };
}
exports.renderReactWithParent = renderReactWithParent;
function inEl(el, target) {
    var deep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;

    var i = 0;
    var cur = el;
    while (cur.parentNode && i < deep) {
        if (!(typeof target === 'string') && target === cur) {
            return true;
        } else if (cur.id === target || cur === target) {
            return true;
        } else {
            cur = cur.parentNode;
        }
    }
    return false;
}
exports.inEl = inEl;
function hasClass(_el, cls) {
    if (!_el || _el.className === undefined) return false;
    return _el.classList.contains(cls);
}
exports.hasClass = hasClass;
function removeClass(_el, cls) {
    if (!_el || !_el.classList) return;
    return _el.classList.remove(cls);
}
exports.removeClass = removeClass;
function addClass(_el, cls) {
    if (!_el) return;
    if (cls.indexOf(' ') !== -1) {
        var classes = cls.split(' ');
        for (var i = 0; i < classes.length; i++) {
            _el.classList.add(classes[i]);
        }
        return;
    }
    return _el.classList.add(cls);
}
exports.addClass = addClass;
function toggleClass(el, flag, cls) {
    if (flag) {
        addClass(el, cls);
    } else {
        removeClass(el, cls);
    }
}
exports.toggleClass = toggleClass;
function getParentBySel(el, sel) {
    var e = el.parentNode;
    while (e !== null) {
        if (matchesSelector(e, sel)) return e;
        e = e.parentNode;
    }
    return false;
}
exports.getParentBySel = getParentBySel;
function parentIsContentEditable(el) {
    var e = el.parentNode;
    while (e !== null) {
        if (isContentEditable(e)) return e;
        e = e.parentNode;
    }
    return false;
}
exports.parentIsContentEditable = parentIsContentEditable;
function isContentEditable(el) {
    return el.contentEditable === 'true' || el.contentEditable === 'plaintext-only';
}
exports.isContentEditable = isContentEditable;
function matchesSelector(el, sel) {
    if (!el) return false;
    var method = el.matches // tslint:disable-line no-unbound-method
    || el.matchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector;
    if (method) {
        return method.apply(el, [sel]);
    } else {
        return false;
    }
}
exports.matchesSelector = matchesSelector;
function isFocused(el) {
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        return el === el.ownerDocument.activeElement;
    } else if (document.activeElement && document.activeElement.tagName === 'BODY') {
        return el === document.activeElement;
    } else {
        return el === document.activeElement;
    }
}
exports.isFocused = isFocused;
var lKey = util_1.guid();
function listen(e, event, cb, unbind) {
    var bubble = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    if (e == null) return;
    var el = e;
    if (typeof event !== 'string') {
        return _.each(event, function (value, key) {
            listen(el, key, value, unbind);
        });
    } else {
        if (!cb) return;
        var listeners = el[lKey] || [];
        el[lKey] = listeners;
        if (unbind) {
            el[lKey] = listeners.filter(function (l) {
                return !(l.event === event && l.cb === cb);
            });
            el.removeEventListener(event, cb, bubble);
        } else {
            listeners.push({ event: event, cb: cb });
            el.addEventListener(event, cb, bubble);
        }
        if (!"yes") {
            // mechanism for firing custom events
            cb.__wrapFunc = cb.__wrapFunc || function (ev) {
                var e = ev || {};
                var target = void 0;
                if (e.detail && typeof e.detail.target === 'string') {
                    target = document.querySelector(e.detail.target);
                }
                cb(_.extend({
                    originalEvent: e,
                    preventDefault: util_1._f,
                    stopPropagation: util_1._f
                }, e.detail, { target: target }));
            };
            if (unbind) {
                el.removeEventListener(event + '-gr', cb.__wrapFunc, bubble);
            } else {
                el.addEventListener(event + '-gr', cb.__wrapFunc, bubble);
            }
        }
        return { el: el, event: event, cb: cb, bubble: bubble };
    }
}
exports.listen = listen;
function unlisten(e, event, cb, bubble) {
    var el = e;
    if (!event && el[lKey] != null) {
        el[lKey].forEach(function (l) {
            return unlisten(el, l.event, l.cb, l.bubble);
        });
    } else {
        listen(el, event, cb, true, bubble);
    }
}
exports.unlisten = unlisten;
function on(type, listener, useCapture) {
    var _this = this;

    this.addEventListener(type, listener, useCapture);
    return {
        off: function off() {
            return _off.apply(_this, [type, listener, useCapture]);
        }
    };
}
exports.on = on;
function _off(type, listener, useCapture) {
    this.removeEventListener(type, listener, useCapture);
}
exports.off = _off;
function once(event, cb) {
    var _this2 = this;

    var done = function done(e) {
        cb(e);
        _off.call(_this2, event, done);
    };
    on.call(this, event, done);
}
exports.once = once;
function emit(event, data) {
    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(event, true, true, data);
    this.dispatchEvent(e);
}
exports.emit = emit;
function isVisible(el) {
    var style = getComputedStyle(el, undefined); // @NOTE was null instead of undefined in js!
    return style.getPropertyValue('display') !== 'none' && style.getPropertyValue('visibility') !== 'hidden' && el.clientHeight > 0;
}
exports.isVisible = isVisible;
function cs() {
    for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
    }

    return keys.reduce(function (res, cur) {
        return res.concat(!_.isObject(cur) ? cur : (0, _keys2.default)(cur).filter(function (cls) {
            return cur[cls];
        }));
    }, []).filter(function (x) {
        return Boolean(x);
    }).join(' ');
}
exports.cs = cs;
var cssNumber = {
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
};
function maybeAddPx(name, value) {
    return typeof value === 'number' && !cssNumber[dasherize(name)] ? value + 'px' : value;
}
exports.maybeAddPx = maybeAddPx;
function camelize(str) {
    return str.replace(/-+(.)?/g, function (_, chr) {
        return chr ? chr.toUpperCase() : '';
    });
}
exports.camelize = camelize;
function camelizeAttrs(obj) {
    return _.transform(obj, function (result, value, key) {
        return result[camelize(key)] = value;
    });
}
exports.camelizeAttrs = camelizeAttrs;
function dasherize(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
}
exports.dasherize = dasherize;
function css(el, arg2, arg3) {
    if (arguments.length < 3) {
        var element = el;
        if (!element) return undefined;
        var computedStyle = getComputedStyle(element, '');
        if (typeof arg2 === 'string') {
            return element.style[camelize(arg2)] || computedStyle.getPropertyValue(arg2);
        } else if (_.isArray(arg2)) {
            var props = {};
            _.each(arg2, function (val, _) {
                props[camelize(val)] = element.style[camelize(val)] || computedStyle.getPropertyValue(val);
            });
            return props;
        }
    }
    var result = '';
    if (_.isString(arg2)) {
        if (!arg3 && arg3 !== 0) {
            el.style.removeProperty(dasherize(arg2));
        } else {
            result = dasherize(arg2) + ':' + maybeAddPx(arg2, arg3);
        }
    } else {
        arg2 = arg2;
        for (var key in arg2) {
            if (!arg2[key] && arg2[key] !== 0) {
                el.style.removeProperty(dasherize(key));
            } else {
                result += dasherize(key) + ':' + maybeAddPx(key, arg2[key]) + ';';
            }
        }
    }
    return el.style.cssText += ';' + result;
}
exports.css = css;
function setCustomCss(field, style) {
    if (!style || !field) return;
    var originStyle = css(field, (0, _keys2.default)(style));
    css(field, style);
    // @TODO non-null assertion doesn't look good
    // also, why do we return either this or nothing??
    return function () {
        return css(field, originStyle);
    };
}
exports.setCustomCss = setCustomCss;
function getParentByTag(el, tag) {
    var e = el.parentNode;
    while (e !== null) {
        if (e.tagName === tag) return e;
        e = e.parentNode;
    }
    return null;
}
exports.getParentByTag = getParentByTag;
function getParentByData(el, key, val) {
    var e = el.parentNode;
    while (e !== null) {
        // tslint:disable-next-line triple-equals
        if (e.dataset && e.dataset[key] && e.dataset[key] == val) return e;
        e = e.parentNode;
    }
    return undefined;
}
exports.getParentByData = getParentByData;
function resolveEl(el, cls) {
    if (hasClass(el, cls)) return el;
    return getParent(el, cls);
}
exports.resolveEl = resolveEl;
function getParent(el, cls) {
    var e = el.parentNode;
    while (e !== null) {
        if (hasClass(e, cls)) return e;
        e = e.parentNode;
    }
    return false;
}
exports.getParent = getParent;
function parentHasClass(el, cls) {
    if (!el) return false;
    var e = el;
    while (e.parentNode) {
        if (hasClass(e, cls)) return e;
        e = e.parentNode;
    }
    return false;
}
exports.parentHasClass = parentHasClass;
function getParentByDepth() {
    var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    return !depth ? this : getParentByDepth.call(this.parentNode, --depth);
}
exports.getParentByDepth = getParentByDepth;
function isParent(el, parent) {
    if (!el) return false;
    var e = el;
    while (e.parentNode) {
        if (parent === e.parentNode) return e;
        e = e.parentNode;
    }
    return false;
}
exports.isParent = isParent;
function insertAfter(newElement, targetElement) {
    // target is what you want it to go after. Look for this elements parent.
    var parent = targetElement.parentNode;
    if (parent === null) throw new stdlib_1.AssertionError('Expected non-null parent');
    // if the parents lastChild is the targetElement...
    if (parent.lastChild === targetElement) {
        // add the newElement after the target element.
        parent.appendChild(newElement);
    } else {
        // else the target has siblings, insert the new element between
        // the target and it's next sibling.
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}
exports.insertAfter = insertAfter;
function insertBefore(newElement, targetElement) {
    stdlib_1.assertNonNull(targetElement.parentNode, 'parent node').insertBefore(newElement, targetElement);
}
exports.insertBefore = insertBefore;
function elementInDocument(el, doc) {
    doc = doc || document;
    var element = el;
    while (element) {
        if (element === doc) return true;
        element = element.parentNode;
    }
    return false;
}
exports.elementInDocument = elementInDocument;
// @TODO this doesn't seem to be working at all (does NOTHING in best case)
// should we fix or remove it? as it's been broken for a long time now, maybe
// it's better if it doesn't work?
function runKeyEvent(ee) {
    var evt = void 0,
        defaultView = void 0;
    var defaultEvent = {
        ctrl: false,
        meta: false,
        shift: false,
        alt: false
    };
    var e = _.extend(defaultEvent, ee);
    try {
        evt = e.el.ownerDocument.createEvent('KeyEvents');
        defaultView = e.el.ownerDocument.defaultView;
        evt.initKeyEvent(e.type, // in DOMString typeArg,
        true, // in boolean canBubbleArg,
        true, // in boolean cancelableArg,
        defaultView, // in nsIDOMAbstractView viewArg, window
        e.ctrl, // in boolean ctrlKeyArg,
        e.alt, // in boolean altKeyArg,
        e.shift, // in boolean shiftKeyArg,
        e.meta, // in boolean metaKeyArg,
        0, // key code
        0); // char code.
    } catch (err) {
        evt = e.el.ownerDocument.createEvent('UIEvents');
        evt.initUIEvent.bind(evt)(undefined, true, true, window, 1);
        evt.keyCode = 0;
        evt.which = 0;
        evt.charCode = 0;
        evt.ctrlKey = e.ctrl;
        evt.altKey = e.alt;
        evt.shiftKey = e.shift;
        evt.metaKey = e.meta;
    }
    e.el.dispatchEvent(evt);
}
exports.runKeyEvent = runKeyEvent;
function docHidden(doc) {
    if (typeof doc.hidden !== 'undefined') return doc.hidden;
    if (typeof doc.mozHidden !== 'undefined') return doc.mozHidden;
    if (typeof doc.webkitHidden !== 'undefined') return doc.webkitHidden;
    if (typeof doc.msHidden !== 'undefined') return doc.msHidden;
    return false;
}
exports.docHidden = docHidden;
function visibilityEvent(doc) {
    if (typeof doc.hidden !== 'undefined') return 'visibilitychange';
    if (typeof doc.mozHidden !== 'undefined') return 'mozvisibilitychange';
    if (typeof doc.webkitHidden !== 'undefined') return 'webkitvisibilitychange';
    if (typeof doc.msHidden !== 'undefined') return 'msvisibilitychange';
    return false;
}
exports.visibilityEvent = visibilityEvent;
function transformProp() {
    var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

    if (typeof doc.body.style.transform !== 'undefined') return 'transform';
    if (typeof doc.body.style.WebkitTransform !== 'undefined') return 'WebkitTransform';
    if (typeof doc.body.style.MozTransform !== 'undefined') return 'MozTransform';
    return undefined;
}
exports.transformProp = transformProp;
/*
  el, 'width', 'height'
*/
function compStyle(el) {
    if (!el) return;
    var doc = el.ownerDocument;
    if (!doc) return;
    var win = doc.defaultView || window;
    if (!win) return;
    var s = win.getComputedStyle(el, undefined);
    if (!s) return;

    for (var _len2 = arguments.length, props = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        props[_key2 - 1] = arguments[_key2];
    }

    if (props.length === 1) return s.getPropertyValue(props[0]);
    return props.reduce(function (result, prop) {
        return (0, _assign2.default)({}, result, (0, _defineProperty3.default)({}, prop, s.getPropertyValue(prop)));
    }, {});
}
exports.compStyle = compStyle;
function classSelector(cls) {
    return cls.split(' ').map(function (c) {
        return c[0] !== '.' ? '.' + c : c;
    }).join('').trim();
}
exports.classSelector = classSelector;
function selectorAll(cls) {
    for (var _len3 = arguments.length, classes = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        classes[_key3 - 1] = arguments[_key3];
    }

    if (classes.length > 0) {
        var result = [];
        result.push(selectorAll(cls));
        classes.forEach(function (c) {
            return result.push(selectorAll(c));
        });
        return result.join(', ');
    }
    // check dots
    cls = cls.split(', ').map(function (c) {
        return c[0] !== '.' ? '.' + c : c;
    }).join(', ').trim();
    return cls + ", " + cls + " *";
}
exports.selectorAll = selectorAll;
function whichAnimationEndEvent() {
    var el = document.createElement('fakeelement');
    var transitions = {
        'animation': 'animationend',
        'MozAnimation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd'
    };
    for (var t in transitions) {
        if (el.style[t] !== undefined) {
            return transitions[t];
        }
    }
    return undefined;
}
exports.whichAnimationEndEvent = whichAnimationEndEvent;
function transitionEndEventName() {
    var el = document.createElement('fakeelement');
    var transitions = {
        'transition': 'transitionend',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
    };
    for (var i in transitions) {
        // @NOTE probably don't need hasOwnProperty??
        if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
            return transitions[i];
        }
    }
    return undefined;
}
exports.transitionEndEventName = transitionEndEventName;
function addIframeCss(frameDoc) {
    if (typeof window.GR_INLINE_STYLES === 'undefined') return;
    var style = frameDoc.createElement('style');
    style.innerHTML = window.GR_INLINE_STYLES;
    try {
        frameDoc.querySelector('head').appendChild(style);
    } catch (e) {
        // tslint:disable-next-line no-console
        console.log('can\'t append style', e);
    }
}
exports.addIframeCss = addIframeCss;
function setGRAttributes(el, id) {
    el.setAttribute('data-gramm_id', id);
    el.setAttribute('data-gramm', 'true');
}
exports.setGRAttributes = setGRAttributes;
function emitDomEvent(key) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var e = document.createEvent('CustomEvent');
    e.initCustomEvent(key + '-gr', true, true, data);
    document.dispatchEvent(e);
}
exports.emitDomEvent = emitDomEvent;
function addRange(doc, range) {
    var s = doc.getSelection();
    s.removeAllRanges();
    s.addRange(range);
}
exports.addRange = addRange;
function setDomRange(doc, data) {
    var range = doc.createRange();
    range.setStart(data.anchorNode, data.anchorOffset);
    range.setEnd(data.focusNode, data.focusOffset);
    addRange(doc, range);
}
exports.setDomRange = setDomRange;
function closestEl(el, sel) {
    if (el === null) return null;
    return el.matches(sel) ? el : el.querySelector(sel) || closestEl(el.parentElement, sel);
}
exports.closestEl = closestEl;

},{"./util":200,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/defineProperty":29,"lodash":"lodash","react-dom":"react-dom","stdlib":203}],172:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var defaults_1 = require("./page-config/defaults");
var extension_api_1 = require("extension-api");
var stdlib_1 = require("stdlib");
var stripDomain = function stripDomain(domain) {
    return domain.replace('www.', '');
};
function currentUrl() {
    var _this = this;

    var _extension_api_1$getA = extension_api_1.getApi(),
        tabs = _extension_api_1$getA.tabs;

    return stdlib_1.SafePromise.create(function (resolve) {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee() {
            var retry, url;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            retry = setTimeout(function () {
                                return tabs.getActiveTabUrl().then(resolve);
                            }, 2000);
                            _context.next = 3;
                            return tabs.getActiveTabUrl();

                        case 3:
                            url = _context.sent;

                            clearTimeout(retry);
                            resolve(url);

                        case 6:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    });
}
exports.currentUrl = currentUrl;
function getDomain(el) {
    var doc = el && el.ownerDocument || document;
    var location = doc.location || doc.defaultView.location;
    if (!location) return '';
    return stripDomain(location.hostname);
}
exports.getDomain = getDomain;
function promiseGetDomain() {
    return _promise2.default.race([currentUrl().then(domainFromUrl), util_1.delay(10000).then(function () {
        throw new Error('Request to tabs.getCurrentTabUrl rejected by timeout');
    })]);
}
exports.promiseGetDomain = promiseGetDomain;
function domainFromUrl(url) {
    if (util_1.isFF() && /^about:/.test(url)) return url;
    var location = document.createElement('a');
    location.href = url;
    return stripDomain(location.hostname);
}
exports.domainFromUrl = domainFromUrl;
exports.isFacebookSite = function () {
    return defaults_1.FACEBOOK_SITES.includes(getDomain());
};
exports.isJiraSite = function () {
    return (/\.atlassian\.net/.test(getDomain())
    );
};
exports.isBlackboardSite = function () {
    return (/\.blackboard\.com/.test(getDomain())
    );
};
function getUrl(el) {
    var doc = el && el.ownerDocument || document;
    var location = doc.location || doc.defaultView.location;
    if (!location) return '';
    return location.pathname + location.search;
}
exports.getUrl = getUrl;
function getFavicon() {
    var isAbsolute = new RegExp('^(?:[a-z]+:)?//', 'i');
    var favicon = '';
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var rel = '"' + link.getAttribute('rel') + '"';
        var regexp = /(\"icon )|( icon\")|(\"icon\")|( icon )/i;
        if (rel.search(regexp) !== -1) {
            favicon = link.getAttribute('href');
        }
    }
    if (!favicon) {
        favicon = 'favicon.ico';
    }
    if (isAbsolute.test(favicon)) {
        return favicon;
    }
    return favicon[0] !== '/' ? '//' + document.location.host + document.location.pathname + favicon : '//' + document.location.host + favicon;
}
exports.getFavicon = getFavicon;

},{"./page-config/defaults":178,"./util":200,"babel-runtime/core-js/promise":24,"babel-runtime/regenerator":35,"extension-api":154,"stdlib":203}],173:[function(require,module,exports){
(function (process){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var emitter = require("emitter");
var util_1 = require("./util");
var dom_1 = require("./dom");
var extension_api_1 = require("extension-api");

var _ref = process.env.SANDBOX ? {
    message: {
        broadcastBackground: util_1._f,
        listen: util_1._f,
        toFocused: util_1._f
    }
} : extension_api_1.getApi(),
    message = _ref.message;

var errorEmitter = emitter({});
var Listeners = {};
exports.emitError = _.throttle(function (e) {
    return errorEmitter.emit('__bgerror', e);
}, 1000);
if (util_1.isBg()) dom_1.listen(document, 'grammarly:offline', function () {
    return exports.emitError('proxy dead');
}, undefined);
function one(type, cb) {
    function _cb() {
        off(type, _cb);

        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
            data[_key] = arguments[_key];
        }

        cb.apply(this, data);
    }
    on(type, _cb);
}
exports.one = one;
function on(type, callback) {
    if (type === '__bgerror') {
        errorEmitter.on('__bgerror', callback);
        return;
    }
    var listeners = Listeners[type] = Listeners[type] || [];
    // console.log('[Messaging] on', type, listeners.length, listeners)
    listeners.push(callback);
    /**
     * Only assign listener for the first time,
     * for future listeners - just push it to the listeners collection and use it in closure.
     */
    if (listeners.length === 1) {
        try {
            message.listen(type, function () {
                // console.log('[Messaging] extensionApi', 'on:listeners fired', type, args)
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(listeners), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var l = _step.value;

                        l.apply(undefined, arguments);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            });
        } catch (e) {
            exports.emitError(e);
        }
    }
}
exports.on = on;
function off(type, callback) {
    if (type === '__bgerror') {
        errorEmitter.off('__bgerror', callback);
        return;
    }
    var listeners = Listeners[type];
    if (!listeners) return;
    var i = listeners.indexOf(callback);
    if (i !== -1) listeners.splice(i, 1);
    if (listeners.length === 0) delete Listeners[type];
}
exports.off = off;
/**
 * Broadcase message form background page to Tabs.
 * Used once in sagas.js
 * @see background
 */
function emitTabs(type) {
    try {
        // console.log('[Messaging]', 'emitTabs', type)
        switch (message.kind) {
            case 'background-message-api':
                message.broadcast(type, {});
                break;
            default:
                throw new Error('emitTabs can be used only on background');
        }
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitTabs = emitTabs;
/**
 * Used to pass message from background page to specific tab
 * @see background
 */
function emitTo(tabId, type) {
    var content = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _callback = arguments[3];

    var callback = _callback || function () {};
    try {
        if (!tabId) throw TypeError('emitTo can\'t be used without destination point');
        // console.log('[Messaging]', 'emitTo', type)
        switch (message.kind) {
            case 'background-message-api':
                message.sendTo(tabId, type, content, callback);
                break;
            default:
                throw new Error('emitTo can be used only on background');
        }
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitTo = emitTo;
/**
 * Passes message to focused tab.
 * @see background page/content scripts
 */
function emitFocusedTab(type, content) {
    try {
        // console.log('[Messaging]', 'emitFocusedTab', type)
        message.toFocused(type, content);
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitFocusedTab = emitFocusedTab;
/**
 * Passes message to background page.
 * @see content scripts + popup in safari
 */
function emitBackground(type, content, callback) {
    try {
        // console.log('[Messaging]', 'broadcastBackground', type)
        switch (message.kind) {
            case 'content-script-message-api':
                message.broadcastBackground(type, content, callback);
                break;
            default:
                throw new Error('emitBackground can be used only in content script');
        }
    } catch (e) {
        exports.emitError(e);
    }
}
exports.emitBackground = emitBackground;
/**
 * Promise-based version of emitBackground method
 * @see content scripts
 */
function promiseBackground(type) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10000;

    var request = new _promise2.default(function (resolve, reject) {
        // console.log('[Messaging]', 'promiseBackground', type)
        try {
            switch (message.kind) {
                case 'content-script-message-api':
                    message.broadcastBackground(type, data, resolve, reject);
                    break;
                default:
                    throw new Error('promiseBackground can be used only on client scripts');
            }
        } catch (e) {
            reject(e);
            exports.emitError(e);
        }
    });
    return _promise2.default.race([request, util_1.delay(timeout).then(function () {
        throw new Error("Request to bg page (" + message + ") rejected by timeout");
    })]);
}
exports.promiseBackground = promiseBackground;

}).call(this,require('_process'))
},{"./dom":171,"./util":200,"_process":140,"babel-runtime/core-js/get-iterator":14,"babel-runtime/core-js/promise":24,"emitter":"emitter","extension-api":154,"lodash":"lodash"}],174:[function(require,module,exports){
"use strict";
/**
 * This file is a 'lightweight' subset of config.js which doesn't import heavy
 * modules like SparkMD5.
 *
 * Currently we re-export everything from this module in config.js.
 * When we have converted everything that uses config to TS, we can stop doing
 * than and use this newConfig directly.
 *
 * @module
 */

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Firefox content scripts doesn't have window.browser,
 * instead, there is a variable "browser", which is available in the scope of content script.
 */
function isWE() {
    if (isFF()) {
        var b = void 0;
        // checking for window.browser doesn't work in this case
        try {
            b = firefox;
        } catch (e) {
            b = {};
        }
        return !!b.runtime;
    } else {
        return isChrome() || isEdge();
    }
}
exports.isWE = isWE;
/**
 * @NOTE In the forge-era, forge object presence in window scope was an indicator
 * of 'real' environment. But instead, now we are setting global window.__extensionTestsMode
 * variable to true in case of unit tests.
 */
function isTestsMode() {
    return !!window.__extensionTestsMode;
}
exports.isTestsMode = isTestsMode;
// @NOTE forge legacy
// value hardcoded in /src/template/identity.json
function getUuid() {
    return '87677a2c52b84ad3a151a4a72f5bd3c4';
}
exports.getUuid = getUuid;
function isFF() {
    return window.navigator.userAgent.indexOf('Firefox') !== -1;
}
exports.isFF = isFF;
function isChrome() {
    return !!window.chrome && /google/i.test(navigator.vendor);
}
exports.isChrome = isChrome;
function isSafari() {
    return (/^((?!chrome).)*safari/i.test(navigator.userAgent)
    );
}
exports.isSafari = isSafari;
function isEdge() {
    return (/edge/i.test(navigator.userAgent)
    );
}
exports.isEdge = isEdge;
function isSafari8() {
    return isSafari() && navigator.userAgent.indexOf('Version/8.0') !== -1;
}
exports.isSafari8 = isSafari8;
function isWindows() {
    return navigator.appVersion.indexOf('Win') !== -1;
}
exports.isWindows = isWindows;
function isBg() {
    return !!window.IS_BG;
}
exports.isBg = isBg;
function isSafariSettingsPopup() {
    var popup = false;
    try {
        popup = safari.extension.globalPage.contentWindow !== window;
    } catch (_) {}
    return popup;
}
exports.isSafariSettingsPopup = isSafariSettingsPopup;
function isPopup() {
    return !!window.IS_POPUP;
}
exports.isPopup = isPopup;
function isBgOrPopup() {
    return isBg() || isPopup();
}
exports.isBgOrPopup = isBgOrPopup;
function getBrowser() {
    return isChrome() ? 'chrome' : isFF() ? 'firefox' : isSafari() ? 'safari' : 'other';
}
exports.getBrowser = getBrowser;
// @NOTE try/catch required at least in case of unit tests,
// where chome*, safari* and firefox* are not defined
function getVersion() {
    var unknown = 'unknown';
    try {
        if (isSafari()) {
            return safari.extension.displayVersion;
        } else if (isChrome()) {
            var manifest = chrome.runtime.getManifest();
            return manifest.version;
        } else if (isFF()) {
            var _manifest = firefox.runtime.getManifest();
            return _manifest.version;
        } else {
            return unknown;
        }
    } catch (e) {
        console.error(e);
        return unknown;
    }
}
exports.getVersion = getVersion;
exports.ENV = "yes" === 'yes' ? 'prod' : 'dev';
var mpkey = 'c10dd64c87f70ef5563a63c368797e8c';
exports.MIXPANEL = {
    qaKey: '7a5c95b5cba1b225d00cc3ba1c410c78',
    key: mpkey,
    cookie: "mp_" + mpkey + "_mixpanel"
};
exports.STATSC = {
    URL: 'https://stats-public.grammarly.io/',
    PREFIX: 'grammarly.ui'
};
exports.GRAMMARLY_DOMAIN = 'grammarly.com';
var GRAMMARLY = "https://www." + exports.GRAMMARLY_DOMAIN;
exports.DAPI = "https://data." + exports.GRAMMARLY_DOMAIN;
var app = "https://app." + exports.GRAMMARLY_DOMAIN;
var auth = "https://auth." + exports.GRAMMARLY_DOMAIN + "/v3";
var authUser = auth + '/user';
var welcomeFandS = GRAMMARLY + "/after_install_page";
var emailFeedback = "https://emailfeedback." + exports.GRAMMARLY_DOMAIN;
exports.URLS = {
    app: app,
    appPersonalDictionary: app + "/profile/dictionary",
    capi: "wss://capi." + exports.GRAMMARLY_DOMAIN + "/freews",
    dapiMimic: exports.DAPI + '/api/mimic',
    dapiProps: exports.DAPI + '/api/props',
    editorDictionary: app + '/profile/dictionary',
    dictionary: "https://capi." + exports.GRAMMARLY_DOMAIN + "/api/defs",
    docs: app + '/docs',
    docsApi: "https://dox." + exports.GRAMMARLY_DOMAIN + "/documents",
    authCreatePage: auth + '/redirect-anonymous?location=' + welcomeFandS,
    userOrAnonymous: authUser + '/oranonymous',
    authSignin: auth + '/login',
    authSignup: auth + '/signup',
    signin: GRAMMARLY + "/signin",
    signup: GRAMMARLY + "/signup",
    resetPassword: GRAMMARLY + "/resetpassword",
    saveEmailFeedback: emailFeedback + '/api/feedback/',
    raven: 'felog.grammarly.io',
    newFelog: 'https://f-log-extension.grammarly.io',
    referral: GRAMMARLY + "/referral?page=extension",
    welcomeC: GRAMMARLY + "/extension-success",
    upgrade: GRAMMARLY + "/upgrade",
    uninstall: GRAMMARLY + "/extension-uninstall",
    terms: GRAMMARLY + "/terms",
    policy: GRAMMARLY + "/privacy-policy",
    pageConfigUrl: 'https://d3cv4a9a9wh0bt.cloudfront.net/browserplugin/config.json'
};
if (!"yes") {
    var _mpkey = exports.MIXPANEL.qaKey;
    exports.MIXPANEL.key = _mpkey;
    exports.MIXPANEL.cookie = "mp_" + _mpkey + "_mixpanel";
    exports.STATSC.URL = 'https://stats-public-qane.grammarly.io/';
    exports.URLS.raven = '127.0.0.1:8000';
    exports.URLS.newFelog = 'https://127.0.0.1:8000';
}
var camelBrowser = getBrowser().slice(0, 1).toUpperCase() + getBrowser().slice(1);
exports.appName = "extension" + camelBrowser;
exports.gnarAppName = getBrowser() + "Ext";

},{}],175:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("lib/util");
var defaults_1 = require("./defaults");
var location_1 = require("lib/location");
var config_loader_1 = require("./config-loader");

var Config = function (_config_loader_1$Conf) {
    (0, _inherits3.default)(Config, _config_loader_1$Conf);

    function Config(prefs) {
        (0, _classCallCheck3.default)(this, Config);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Config.__proto__ || (0, _getPrototypeOf2.default)(Config)).call(this, prefs));

        _this.invalidate = function () {
            return _this.load();
        };
        return _this;
    }

    (0, _createClass3.default)(Config, [{
        key: "getByPage",
        value: function getByPage(pages) {
            var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : location_1.getUrl();

            if (!pages) return;
            var findUrl = (0, _keys2.default)(pages).find(function (page) {
                return new RegExp(page).test(url);
            });
            return findUrl ? pages[findUrl] : undefined;
        }
    }, {
        key: "get",
        value: function get(domain, url) {
            var config = this.config.pageConfig[domain] || this.config.subdomains.find(function (conf) {
                return new RegExp("\\." + util_1.escapeRegExp(conf.domain) + "$").test(domain);
            }) || this.config.partials.find(function (conf) {
                return domain.includes(conf.domain);
            });
            if (config && config.enabled === false) return config;
            var pageConfig = this.getByPage(config && config.pages, url);
            var newConfig = pageConfig || config || {};
            newConfig.enabled = newConfig.enabled !== false;
            return newConfig;
        }
    }, {
        key: "toReload",
        value: function toReload(url) {
            return url.indexOf('http') === 0 && defaults_1.SITES_TO_RELOAD.some(function (domain) {
                return url.includes(domain);
            });
        }
    }]);
    return Config;
}(config_loader_1.ConfigLoader);

exports.Config = Config;

},{"./config-loader":176,"./defaults":178,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/location":172,"lib/util":200}],176:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var localforage_1 = require("./localforage");
var request_1 = require("lib/request");
var config_1 = require("lib/config");
var tracking_1 = require("lib/tracking");
var meta_1 = require("./meta");
var utils_1 = require("./utils");
var decorator_1 = require("./decorator");
var profiler_1 = require("lib/profiler");
var AJAX_TIMEOUT = 60000;
var CONFIG_MISSED_ERROR = 'Config missed';
var CONFIG_MALFORMED = 'Config malformed';

var ConfigLoader = function () {
    function ConfigLoader(_prefs) {
        (0, _classCallCheck3.default)(this, ConfigLoader);

        this._prefs = _prefs;
    }

    (0, _createClass3.default)(ConfigLoader, [{
        key: "init",
        value: function init() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var config;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                profiler_1.Profiler.start('pageConfig_init');
                                config = void 0;
                                _context.next = 4;
                                return this.isSkipConfig();

                            case 4:
                                if (!_context.sent) {
                                    _context.next = 8;
                                    break;
                                }

                                // tslint:disable-next-line no-console
                                console.warn('Config: use default config in DEBUG mode (skipConfig=true)');
                                _context.next = 11;
                                break;

                            case 8:
                                _context.next = 10;
                                return this.loadFromStorage();

                            case 10:
                                config = _context.sent;

                            case 11:
                                this.config = config ? config : {};
                                _context.next = 14;
                                return new meta_1.Meta().load();

                            case 14:
                                this.meta = _context.sent;

                                profiler_1.Profiler.stop('pageConfig_init');
                                return _context.abrupt("return", this);

                            case 17:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }, {
        key: "isSkipConfig",
        value: function isSkipConfig() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.t0 = !"yes";

                                if (!_context2.t0) {
                                    _context2.next = 5;
                                    break;
                                }

                                _context2.next = 4;
                                return this._prefs.get('skipConfig');

                            case 4:
                                _context2.t0 = _context2.sent;

                            case 5:
                                return _context2.abrupt("return", _context2.t0);

                            case 6:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: "load",
        value: function load() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                var _meta$config, date, interval, minutesToUpdate;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _meta$config = this.meta.config, date = _meta$config.date, interval = _meta$config.interval;

                                if (!(date + interval > Date.now())) {
                                    _context3.next = 5;
                                    break;
                                }

                                minutesToUpdate = (date + interval - Date.now()) / 1000 / 60;

                                console.info("Config: next update in " + minutesToUpdate.toFixed(2) + " m");
                                return _context3.abrupt("return");

                            case 5:
                                console.info('Config: going to update config from CDN...');
                                return _context3.abrupt("return", this.updateFromCDN());

                            case 7:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: "updateFromCDN",
        value: function updateFromCDN() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
                var config, msg;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                config = void 0;
                                _context4.prev = 1;
                                _context4.next = 4;
                                return request_1.fetch(config_1.URLS.pageConfigUrl, { timeout: AJAX_TIMEOUT });

                            case 4:
                                config = _context4.sent;

                                if (utils_1.isValid(config)) {
                                    _context4.next = 7;
                                    break;
                                }

                                throw new Error(CONFIG_MALFORMED);

                            case 7:
                                this.config = config;
                                this.save(config);
                                _context4.next = 17;
                                break;

                            case 11:
                                _context4.prev = 11;
                                _context4.t0 = _context4["catch"](1);

                                tracking_1.logger.pageConfigCDNError(_context4.t0.message);
                                msg = "Config: can't get valid config - " + _context4.t0.message;
                                // tslint:disable-next-line no-console

                                console.warn(msg, config);
                                this.saveOnError(msg);

                            case 17:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[1, 11]]);
            }));
        }
    }, {
        key: "loadFromStorage",
        value: function loadFromStorage() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee5() {
                var rawConfig;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.prev = 0;
                                _context5.next = 3;
                                return localforage_1.localforage.getItem('config');

                            case 3:
                                rawConfig = _context5.sent;

                                if (rawConfig) {
                                    _context5.next = 6;
                                    break;
                                }

                                throw new Error(CONFIG_MISSED_ERROR);

                            case 6:
                                if (utils_1.isValid(rawConfig)) {
                                    _context5.next = 8;
                                    break;
                                }

                                throw new Error(CONFIG_MALFORMED);

                            case 8:
                                console.info('Config: loaded from local storage successfully');
                                return _context5.abrupt("return", rawConfig);

                            case 12:
                                _context5.prev = 12;
                                _context5.t0 = _context5["catch"](0);

                                if (CONFIG_MISSED_ERROR === _context5.t0.message) {
                                    // @TODO consider adding this metric back to new felog
                                    // call('statsc.ui.increment', 'stability:page_config_missed_from_storage')
                                } else {
                                    tracking_1.logger.pageConfigLocalStorageError(_context5.t0.message, _context5.t0.name);
                                }
                                // tslint:disable-next-line no-console
                                console.warn("Config: cannot get valid config from storage: " + _context5.t0);
                                return _context5.abrupt("return", undefined);

                            case 17:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[0, 12]]);
            }));
        }
    }, {
        key: "save",
        value: function save(config) {
            var interval = config.interval,
                protocolVersion = config.protocolVersion,
                version = config.version;

            localforage_1.localforage.setItem('config', config);
            this.fireVersionUpdate(version, this.meta.config.version);
            this.meta.set({
                date: this.getCurrentTimestamp(),
                status: 'success',
                interval: interval,
                protocolVersion: protocolVersion,
                version: version
            });
            console.info('Config: new config saved to local storage successfully:', config.version, config);
        }
    }, {
        key: "saveOnError",
        value: function saveOnError(info) {
            var _meta$config2 = this.meta.config,
                interval = _meta$config2.interval,
                protocolVersion = _meta$config2.protocolVersion,
                version = _meta$config2.version;

            this.meta.set({
                date: this.getCurrentTimestamp(),
                status: 'failed',
                interval: interval,
                protocolVersion: protocolVersion,
                version: version,
                info: info
            });
        }
    }, {
        key: "fireVersionUpdate",
        value: function fireVersionUpdate(newVersion, oldVersion) {
            if (!newVersion || oldVersion === newVersion) return;
            tracking_1.logger.pageConfigUpdated(oldVersion, newVersion);
        }
    }, {
        key: "getCurrentTimestamp",
        value: function getCurrentTimestamp() {
            return Date.now();
        }
    }, {
        key: "config",
        set: function set(config) {
            config = config || {};
            this._config = decorator_1.decorateConfig(config);
        },
        get: function get() {
            return this._config;
        }
    }]);
    return ConfigLoader;
}();

exports.ConfigLoader = ConfigLoader;

},{"./decorator":177,"./localforage":180,"./meta":181,"./utils":182,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/regenerator":35,"lib/config":169,"lib/profiler":183,"lib/request":184,"lib/tracking":194}],177:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var defaults_1 = require("./defaults");
var util_1 = require("../util");
var lodash_1 = require("lodash");
function deepCopyWithDefault(config) {
    var newConfig = lodash_1.merge({ pageConfig: {} }, config);
    if (!newConfig.pageConfig) newConfig.pageConfig = {};
    return newConfig;
}
exports.deepCopyWithDefault = deepCopyWithDefault;

var RawConfigDecorator = function () {
    function RawConfigDecorator() {
        (0, _classCallCheck3.default)(this, RawConfigDecorator);
    }

    (0, _createClass3.default)(RawConfigDecorator, null, [{
        key: "decorate",
        value: function decorate(config) {
            config = config || {};
            config = this.filterByVersion(config);
            config = this.withDefault(config);
            config = this.parseBooleans(config);
            config = this.parseBrowserValues(config);
            config = this.filterInvalidPageRegexp(config);
            config = this.collectSubdomains(config);
            config = this.collectPartials(config);
            return config;
        }
    }, {
        key: "withDefault",
        value: function withDefault(config) {
            config = deepCopyWithDefault(config);
            var defaultConfig = defaults_1.PAGE_CONFIG && defaults_1.PAGE_CONFIG.pageConfig || {};
            var overrideConfig = defaults_1.OVERRIDE_PAGE_CONFIG || {};
            config.pageConfig = lodash_1.merge({}, defaultConfig, config.pageConfig);
            if (!"yes") config.pageConfig = (0, _assign2.default)({}, config.pageConfig, overrideConfig);
            return config;
        }
        /*
         * Filter out rules with version _less_ than current extension version
         * '*'' or missed equal to all versions
         */

    }, {
        key: "filterByVersion",
        value: function filterByVersion(config) {
            var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : config_1.getVersion();

            config = deepCopyWithDefault(config);
            var pageConfig = config.pageConfig;
            config.pageConfig = (0, _keys2.default)(pageConfig).filter(function (key) {
                var value = pageConfig[key],
                    ruleVersion = value.version;
                return !ruleVersion || ruleVersion === '*' || util_1.versionComparator(version, ruleVersion) !== 1;
            }).reduce(function (hsh, key) {
                return (0, _assign2.default)({}, hsh, (0, _defineProperty3.default)({}, key, config.pageConfig[key]));
            }, {});
            return config;
        }
        /**
         * Parses strings to boolean values.
         * As a result would produce JSON:
         * {
         *   'domain1.com': { enabled: false, matchInclusions: true },
         *   'domain2.com': {
         *     enabled: true,
         *     matchInclusions: false,
         *     pages: { '*notes': { enabled: false } }
         *   }
         * }
         */

    }, {
        key: "parseBooleans",
        value: function parseBooleans(config) {
            function isTruly(value) {
                return !(value === false || value === 'false');
            }
            function isExistsOrFalse(value) {
                return value ? isTruly(value) : false;
            }
            config = deepCopyWithDefault(config);
            var pageConfig = config.pageConfig;
            (0, _keys2.default)(pageConfig).forEach(function (key) {
                if (!pageConfig[key]) pageConfig[key] = {};
                var rule = pageConfig[key];
                rule.enabled = isTruly(rule.enabled);
                rule.matchInclusions = isExistsOrFalse(rule.matchInclusions);
                rule.matchSubdomains = isExistsOrFalse(rule.matchSubdomains);
                if (rule.pages) {
                    (0, _keys2.default)(rule.pages).forEach(function (key) {
                        rule.pages[key].enabled = isTruly(rule.pages[key].enabled);
                    });
                }
            });
            return config;
        }
        /**
         * Disable specific domain only if certain browser not supported
         * Don't change enabled value if domain list not specified
         *
         * Config may contains
         * `disabledBrowser: ['firefox', 'chrome', 'safari']`
         */

    }, {
        key: "parseBrowserValues",
        value: function parseBrowserValues(config) {
            var browser = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : util_1.getBrowser();

            config = deepCopyWithDefault(config);
            var pageConfig = config.pageConfig;
            (0, _keys2.default)(pageConfig).map(function (key) {
                var disabled = pageConfig[key] && pageConfig[key].disabledBrowsers;
                if (disabled && disabled.includes(browser)) {
                    pageConfig[key].enabled = false;
                }
            });
            return config;
        }
    }, {
        key: "filterInvalidPageRegexp",
        value: function filterInvalidPageRegexp(config) {
            config = deepCopyWithDefault(config);
            var pageConfig = config.pageConfig;
            (0, _keys2.default)(pageConfig).forEach(function (key) {
                var config = pageConfig[key];
                if (config.pages) {
                    config.pages = (0, _keys2.default)(config.pages).filter(function (key) {
                        try {
                            return new RegExp(key);
                        } catch (e) {
                            return false;
                        }
                    }).reduce(function (hsh, key) {
                        return (0, _assign2.default)({}, hsh, (0, _defineProperty3.default)({}, key, config.pages[key]));
                    }, {});
                }
            });
            return config;
        }
    }, {
        key: "collectSubdomains",
        value: function collectSubdomains(config) {
            config = deepCopyWithDefault(config);
            var pageConfig = config.pageConfig;
            config.subdomains = [];
            try {
                config.subdomains = (0, _keys2.default)(pageConfig).filter(function (domain) {
                    return pageConfig[domain].matchSubdomains;
                }).map(function (domain) {
                    return (0, _assign2.default)({ domain: domain }, pageConfig[domain]);
                });
            } catch (err) {
                // tslint:disable-next-line no-console
                console.warn('Cannot collect subdomains from config');
            }
            return config;
        }
    }, {
        key: "collectPartials",
        value: function collectPartials(config) {
            config = deepCopyWithDefault(config);
            var pageConfig = config.pageConfig;
            config.partials = [];
            try {
                config.partials = (0, _keys2.default)(pageConfig).filter(function (domain) {
                    return pageConfig[domain].matchInclusions;
                }).map(function (domain) {
                    return (0, _assign2.default)({ domain: domain }, pageConfig[domain]);
                });
            } catch (err) {
                // tslint:disable-next-line no-console
                console.warn('Cannot collect partials from config');
            }
            return config;
        }
    }]);
    return RawConfigDecorator;
}();

exports.RawConfigDecorator = RawConfigDecorator;
function decorateConfig(config) {
    return RawConfigDecorator.decorate(config);
}
exports.decorateConfig = decorateConfig;

},{"../config":169,"../util":200,"./defaults":178,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"lodash":"lodash"}],178:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _exports$PAGE_CONFIG_;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var config_1 = require("lib/config");
exports.PROTOCOL_VERSION = '1.0';
exports.SITES_TO_RELOAD = ['inbox.google.com', 'mail.google.com', 'yahoo.com', 'mail.live.com', 'facebook.com', 'tumblr.com', 'stackoverflow.com', 'wordpress.com', 'wordpress.org', 'blogspot.com'];
exports.FACEBOOK_SITES = ['facebook.com', 'messenger.com', 'work.fb.com', 'business.facebook.com'];
exports.HTML_GHOST_SITES = ['twitter.com'].concat((0, _toConsumableArray3.default)(exports.FACEBOOK_SITES));
/**
 * Specify custom messages for unsupported domain
 */
exports.CUSTOM_UNSUPPORTED_MESSAGES = {
    'drive.google.com': {
        title: 'Google Drive',
        // tslint:disable-next-line max-line-length
        message: "We hope to support Google Drive apps<br/> in the future, but for now please use your</br> <a class=\"openGrammarly\" href=\"" + config_1.URLS.app + "\">Grammarly Editor</a>."
    },
    'docs.google.com': {
        title: 'Google Drive',
        // tslint:disable-next-line max-line-length
        message: "We hope to support Google Drive apps<br/> in the future, but for now please use your</br> <a class=\"openGrammarly\" href=\"" + config_1.URLS.app + "\">Grammarly Editor</a>."
    },
    'chrome.google.com': {
        title: 'Web Store'
    }
};
var UPDATE_30M = 30 * 60 * 1000; // 30m
var UPDATE_5M = 5 * 60 * 1000; // 5m
exports.PAGE_CONFIG_DEFAULT_INTERVAL = "yes" ? UPDATE_30M : UPDATE_5M;
exports.PAGE_CONFIG_UPDATE_INTERVALS = [10 * 60 * 1000, exports.PAGE_CONFIG_DEFAULT_INTERVAL, 60 * 60 * 1000, 3 * 60 * 60 * 1000, 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 365 * 24 * 60 * 60 * 1000 // turn off
];
/*
 * Rules that overrides page config from CDN
 * !!! Use with caution for development
 */
exports.OVERRIDE_PAGE_CONFIG = {};
exports.PAGE_CONFIG_INTERNAL = (_exports$PAGE_CONFIG_ = {
    'version': { enabled: false, servicePage: true },
    'extensions': { enabled: false, servicePage: true },
    'settings': { enabled: false, servicePage: true },
    'com.safari.grammarlyspellcheckergrammarchecker': {
        enabled: false, matchInclusions: true, servicePage: true
    }
}, (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, "app." + config_1.GRAMMARLY_DOMAIN, { enabled: false, grammarlyEditor: true }), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'linkedin.com', {
    pages: {
        '/messaging': {
            afterReplaceEvents: ['input']
        }
    }
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'plus.google.com', {
    afterReplaceEvents: ['keyup'],
    minFieldHeight: 0,
    minFieldWidth: 0
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'facebook.com', {
    minFieldHeight: 0,
    fields: [{
        // SF-491
        // photo caption field in the popup
        // on replace and any click in extension it closes photo popup
        name: 'caption_text'
    }]
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'mail.google.com', {
    fields: [{ name: 'to' }, { name: 'cc' }, { name: 'bcc' }, { className: 'vO' }],
    subframes: false
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'drive.google.com', {
    track: true
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'docs.google.com', {
    track: true
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'app.asana.com', {
    fields: [{ className: 'task-row-text-input' }]
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'tumblr.com', {
    fields: [{ attr: ['aria-label', 'Post title'] }, { attr: ['aria-label', 'Type or paste a URL'] }]
}), (0, _defineProperty3.default)(_exports$PAGE_CONFIG_, 'chrome.google.com', {
    dontShowDisabledBadge: true
}), _exports$PAGE_CONFIG_);
/*
 * Backup copy of CDN config
 */
var PAGE_CONFIG_DEFAULT = {
    'hootsuite.com': { enabled: false },
    'chrome.google.com': { enabled: false },
    'facebook.com': {
        enabled: true,
        pages: {
            '.*\/notes': {
                enabled: false
            }
        }
    },
    'onedrive.live.com': { enabled: false },
    'docs.com': { enabled: false },
    'sp.docs.com': { enabled: false },
    'docs.google.com': { enabled: false },
    'drive.google.com': { enabled: false },
    'texteditor.nsspot.net': { enabled: false },
    'jsbin.com': { enabled: false },
    'jsfiddle.net': { enabled: false },
    'quora.com': { enabled: false },
    'paper.dropbox.com': { enabled: false },
    'mail.live.com': { enabled: false, matchInclusions: true },
    'imperavi.com': { enabled: false },
    'usecanvas.com': { enabled: false }
};
/*
 * Default page config. CDN config overrides any domain in the list
 */
exports.PAGE_CONFIG = {
    pageConfig: lodash_1.merge({}, PAGE_CONFIG_DEFAULT, exports.PAGE_CONFIG_INTERNAL)
};

},{"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/toConsumableArray":33,"lib/config":169,"lodash":"lodash"}],179:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var config_base_1 = require("./config-base");
var prefs_1 = require("universal/bg/prefs");
var extension_api_1 = require("extension-api");
var prefs = new prefs_1.PrefsImpl(extension_api_1.getApi().preferences);
exports.pageConfig = new config_base_1.Config(prefs);

},{"./config-base":175,"extension-api":154,"universal/bg/prefs":206}],180:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var NAME = 'Grammarly';
var VERSION = 1.0;
var STORE_NAME = 'configuration';
var _localforage = void 0;
try {
    _localforage = require('localforage');
    _localforage.config({
        name: NAME,
        version: VERSION,
        size: 4 * 1024 * 1024,
        storeName: STORE_NAME
    });
} catch (e) {
    console.error('Fallback to memory storage', e);
    var storage = {};
    _localforage = {
        getItem: function getItem(key) {
            return _promise2.default.resolve(storage[key]);
        },
        setItem: function setItem(key, value) {
            storage[key] = value;
            return _promise2.default.resolve(value);
        },
        clear: function clear() {
            storage = {};
            _promise2.default.resolve(true);
        }
    };
}
exports.localforage = _localforage;

},{"babel-runtime/core-js/promise":24,"localforage":"localforage"}],181:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var localforage_1 = require("./localforage");
var utils_1 = require("./utils");
var META_KEY = 'lastConfigUpdate';

var Meta = function () {
    function Meta() {
        (0, _classCallCheck3.default)(this, Meta);
    }

    (0, _createClass3.default)(Meta, [{
        key: "load",
        value: function load() {
            return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                var meta;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return localforage_1.localforage.getItem(META_KEY);

                            case 2:
                                meta = _context.sent;

                                this.set(meta);
                                return _context.abrupt("return", this);

                            case 5:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }, {
        key: "set",
        value: function set(meta) {
            var _ref = meta || {},
                protocolVersion = _ref.protocolVersion,
                version = _ref.version,
                status = _ref.status,
                info = _ref.info,
                date = _ref.date,
                interval = _ref.interval;

            this._meta = {
                date: Number(date) || 0,
                interval: utils_1.getInterval(Number(interval)),
                protocolVersion: protocolVersion,
                version: version,
                status: status,
                info: info
            };
            return localforage_1.localforage.setItem(META_KEY, this._meta);
        }
    }, {
        key: "config",
        get: function get() {
            return this._meta;
        }
    }]);
    return Meta;
}();

exports.Meta = Meta;

},{"./localforage":180,"./utils":182,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/regenerator":35}],182:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var defaults_1 = require("./defaults");
function isValid(config) {
    if (!config || !config.pageConfig) return;
    if (!(0, _keys2.default)(config).length) return;
    if (!(0, _keys2.default)(config.pageConfig).length) return;
    if (config.protocolVersion && config.protocolVersion !== defaults_1.PROTOCOL_VERSION) return;
    return true;
}
exports.isValid = isValid;
function getInterval(ms) {
    if (defaults_1.PAGE_CONFIG_UPDATE_INTERVALS.includes(ms)) {
        return ms;
    } else {
        return defaults_1.PAGE_CONFIG_DEFAULT_INTERVAL;
    }
}
exports.getInterval = getInterval;

},{"./defaults":178,"babel-runtime/core-js/object/keys":22}],183:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var timers_1 = require("lib/timers");
var tracking_1 = require("lib/tracking");

var Profiler = function () {
    function Profiler() {
        var _this = this;

        (0, _classCallCheck3.default)(this, Profiler);

        this.timings = {};
        this.track = function (cb) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                return _context.abrupt("return", this._track.apply(this, [false, cb].concat(args)));

                            case 1:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        };
        this.trackAsync = function (cb) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt("return", this._track.apply(this, [true, cb].concat(args)));

                            case 1:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        };
        this._track = function (async, cb) {
            for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                args[_key3 - 2] = arguments[_key3];
            }

            return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
                var name;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                name = cb.name + (async ? '__sync' : '');

                                timers_1.timers.start(name);
                                _context3.prev = 2;

                                if (!async) {
                                    _context3.next = 8;
                                    break;
                                }

                                _context3.next = 6;
                                return cb.apply(undefined, args);

                            case 6:
                                _context3.next = 9;
                                break;

                            case 8:
                                cb.apply(undefined, args);

                            case 9:
                                _context3.next = 14;
                                break;

                            case 11:
                                _context3.prev = 11;
                                _context3.t0 = _context3["catch"](2);
                                throw _context3.t0;

                            case 14:
                                _context3.prev = 14;

                                this.timings[name] = timers_1.timers.stop(name);
                                return _context3.finish(14);

                            case 17:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[2, 11, 14, 17]]);
            }));
        };
    }

    (0, _createClass3.default)(Profiler, [{
        key: "start",
        value: function start(name) {
            timers_1.timers.start(name);
        }
    }, {
        key: "stop",
        value: function stop(name) {
            this.timings[name] = timers_1.timers.stop(name);
        }
    }], [{
        key: "start",
        value: function start(name) {
            timers_1.timers.start(name);
        }
    }, {
        key: "stop",
        value: function stop(name) {
            var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30 * 1000;

            var time = timers_1.timers.stop(name);
            if (time > max) {
                // tslint:disable-next-line
                console.warn("profiler_" + name + "_time_exceeded", time);
                // @TODO: make profiler more general
                if (name === 'pageConfig_init') {
                    tracking_1.logger.tooLongPageConfigInit(time);
                }
                if (name === 'updateUser') {
                    tracking_1.logger.tooLongUserUpdateTime(time);
                }
            }
            return time;
        }
    }]);
    return Profiler;
}();

exports.Profiler = Profiler;

},{"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/regenerator":35,"lib/timers":188,"lib/tracking":194}],184:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var util_1 = require("./util");
var config_1 = require("./config");
var message = require("./message");
var AJAX_TIMEOUT = 10000;
if (util_1.isBg()) {
    message.on('fetch', function (data, cb) {
        return bgFetch(data).then(cb, function (error) {
            return cb({ error: error.message });
        });
    });
}
function transformOptions(opts) {
    if (opts.data && (opts.query || opts.method !== 'post')) {
        opts.url += '?' + paramStr(opts.data);
    }
    if (opts.data && opts.method === 'post' && !opts.query && !opts.body) {
        try {
            opts.body = (0, _stringify2.default)(opts.data);
        } catch (e) {
            opts.body = {};
            console.warn(e); // tslint:disable-line
        }
        opts.headers = opts.headers || {};
        opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
        delete opts.data;
    }
    opts.credentials = 'include';
    return opts;
}
exports.transformOptions = transformOptions;
function fetch(url) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    opts.url = url;
    transformOptions(opts);
    if (util_1.isBg() || config_1.isTestsMode()) return bgFetch(opts);
    return message.promiseBackground('fetch', opts).then(function (data) {
        if (lodash_1.isObject(data) && data.error) {
            throw new Error(data.error);
        }
        return data;
    });
}
exports.fetch = fetch;
function bgFetch(opts) {
    var url = opts.url;

    delete opts.url;
    if (!url) return _promise2.default.reject(new Error('Url is not defined in fetch request'));
    function processResponse(resp) {
        if (resp.ok) {
            return resp[opts.isText ? 'text' : 'json']();
        }
        return resp.text().then(function (body) {
            throw {
                name: 'RequestError',
                body: body,
                statusCode: resp.status,
                message: resp.statusText
            };
        });
    }
    return _promise2.default.race([window.fetch(url, opts).then(processResponse).then(function (res) {
        if (typeof res !== 'string' && res && res.error) {
            throw new Error(res.error);
        } else {
            return res;
        }
    }), util_1.delay(opts.timeout || AJAX_TIMEOUT).then(function () {
        throw new Error("Fetch request to " + url + " rejected by timeout");
    })]);
}
function paramStr(data) {
    var req = '';

    var _loop = function _loop(item) {
        if (Array.isArray(data[item])) {
            if (data[item].length) {
                var items = data[item].map(function (val) {
                    return item + "=" + val;
                }).join('&');
                req += "" + (req.length ? '&' : '') + items;
            }
        } else {
            req += "" + (req.length ? '&' : '') + item + "=" + encodeURIComponent(data[item]);
        }
    };

    for (var item in data) {
        _loop(item);
    }
    return req;
}
exports.paramStr = paramStr;

},{"./config":169,"./message":173,"./util":200,"babel-runtime/core-js/json/stringify":16,"babel-runtime/core-js/promise":24,"lodash":"lodash"}],185:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var util_1 = require("lib/util");
function observeStore(store, onChange) {
    var currentState = void 0;
    function handleChange() {
        var nextState = store.getState();
        if (!lodash_1.isEmpty(nextState) && !lodash_1.isEqual(currentState, nextState)) {
            currentState = nextState;
            onChange(nextState);
        }
    }
    util_1.asyncCall(handleChange);
    return store.subscribe(handleChange);
}
exports.observeStore = observeStore;
exports.bindActions = function (pureActions, dispatch) {
    return (0, _keys2.default)(pureActions).filter(function (action) {
        return pureActions[action];
    }).reduce(function (obj, action) {
        return (0, _assign2.default)(obj, (0, _defineProperty3.default)({}, action, function () {
            var res = pureActions[action].apply(pureActions, arguments);
            // tslint:disable-next-line
            var sync = typeof res.sync == 'undefined' ? true : res.sync;
            return dispatch((0, _assign2.default)({}, res, { sync: sync }));
        }));
    }, {});
};

},{"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/defineProperty":29,"lib/util":200,"lodash":"lodash"}],186:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var createLogger = require("redux-logger");
var redux_1 = require("redux");
var message = require("lib/message");
var store_1 = require("universal/bg/store");
var helpers_1 = require("./helpers");
var util_1 = require("../util");
var logger = createLogger({
    level: 'debug',
    collapsed: function collapsed() {
        return true;
    },
    predicate: function predicate() {
        return !"yes";
    }
});
var SYNC = 'store/SYNC';
var initialState = {
    page: {},
    connection: {}
};
// @TODO fix those any's when will work on store TSifycation
function createMirrorStore(onUpdate) {
    var extraActions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var reducer = arguments[2];

    var baseReducer = function baseReducer() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
        var action = arguments[1];

        var _ref = state.page || state.config || {},
            domain = _ref.domain;

        if (action.sync) message.emitBackground('dispatch', (0, _assign2.default)({}, action, { domain: domain }));
        if (action.type === SYNC) return (0, _assign2.default)({}, state, action.data);
        return reducer ? reducer(state, action) : state;
    };
    var store = redux_1.createStore(baseReducer, {}, redux_1.applyMiddleware(logger));
    var actions = helpers_1.bindActions((0, _assign2.default)({}, store_1.pureActions, extraActions), store.dispatch);
    message.on('state', function (data) {
        util_1.asyncCall(function () {
            return store.dispatch({ type: SYNC, data: data });
        }, 0); // FIXME: Prevent dispatch in dispatch
    });
    helpers_1.observeStore(store, onUpdate);
    return { store: store, actions: actions };
}
exports.createMirrorStore = createMirrorStore;

},{"../util":200,"./helpers":185,"babel-runtime/core-js/object/assign":17,"lib/message":173,"redux":"redux","redux-logger":"redux-logger","universal/bg/store":216}],187:[function(require,module,exports){
"use strict";

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = require("./dom");
var message = require("./message");
var console_1 = require("./console");
function api() {
    ['bg-reload', 'reset', 'qa-relogin', 'disable-auth', 'enable-auth', 'disable-defs', 'enable-defs', 'disable-domain', 'enable-domain', 'uninstall', 'set-popup-url', 'set-premium-user', 'set-fake-capi', 'run-fake-capi', 'disable-send-state-to-tabs', 'enable-send-state-to-tabs'].forEach(proxyToBg);
    dom_1.listen(document, 'get-extid', getExtId);
    dom_1.listen(document, 'get-capi-log', getCapiLog);
    dom_1.listen(document, 'get-tracker-log', getTrackerLog);
    dom_1.listen(document, 'get-console-log', getConsoleLog);
    dom_1.listen(document, 'get-localforage', getLocalforage);
    dom_1.listen(document, 'set-localforage', setLocalforage);
    dom_1.listen(document, 'get-pref', getPrefs);
    dom_1.listen(document, 'set-prefs', setPrefs);
    function proxyToBg(event) {
        dom_1.listen(document, event, function (_ref) {
            var value = _ref.value;

            message.emitBackground(event, value);
        });
    }
    function safeStringify(obj) {
        var cache = [];
        return (0, _stringify2.default)(obj, function (_, value) {
            if ((typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
    }
    function getConsoleLog() {
        dom_1.emitDomEvent('console-log', safeStringify(console_1.flushLog()));
    }
    function getTrackerLog() {
        message.emitBackground('get-tracker-log', {}, function (result) {
            return dom_1.emitDomEvent('tracker-log', result);
        });
    }
    function getCapiLog() {
        message.emitBackground('get-capi-log', {}, function (result) {
            return dom_1.emitDomEvent('capi-log', result);
        });
    }
    function getExtId() {
        message.emitBackground('get-extid', {}, function (result) {
            return dom_1.emitDomEvent('extid', result);
        });
    }
    function getLocalforage() {
        message.emitBackground('get-localforage', {}, function (result) {
            return dom_1.emitDomEvent('localforage', result);
        });
    }
    function setLocalforage(e) {
        message.emitBackground('set-localforage', { key: e.key, value: e.value }, function (result) {
            return dom_1.emitDomEvent('localforage', result);
        });
    }
    function getPrefs(_ref2) {
        var key = _ref2.key;

        message.emitBackground('get-pref', { key: key }, function (value) {
            return dom_1.emitDomEvent('pref', { key: key, value: value });
        });
    }
    function setPrefs(_ref3) {
        var key = _ref3.key,
            value = _ref3.value;

        message.emitBackground('set-pref', { key: key, value: value });
    }
}
exports.api = api;

},{"./console":170,"./dom":171,"./message":173,"babel-runtime/core-js/json/stringify":16,"babel-runtime/helpers/typeof":34}],188:[function(require,module,exports){
"use strict";
//                    H I S T O R I C
//                    L A N D M A R K
//
//                      ⭐️⭐️⭐️⭐️⭐️⭐️
//
// THIS FILE POSSESSES NATIONAL SIGNIFICANCE IN COMMEMORATING
//              THE HISTORY OF EXTENSION
//
//                      ⭐️⭐️⭐️⭐️⭐️⭐️
//
//                      Nov 1, 2016
//    The first TypeScript file in Extension ever released
//                     to production.
//
// In memory of test.ts which died shortly after being released,
//          never achieving its fullest potential.

Object.defineProperty(exports, "__esModule", { value: true });
var _timers = {};
exports.timers = {
    start: function start(id) {
        _timers[id] = Date.now();
    },
    stop: function stop(id) {
        var passed = this.passed(id);
        delete _timers[id];
        return passed;
    },
    passed: function passed(id) {
        if (!id || !_timers[id]) return 0;
        return Date.now() - _timers[id];
    }
};

},{}],189:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var pageCookie = require("cookie");
var location_1 = require("../location");
var config = require("../config");
var util_1 = require("../util");
var config_1 = require("../config");
var tracker_1 = require("./tracker");
var logger_1 = require("./logger");
var gnarclientweb_1 = require("@grammarly-npm/gnarclientweb");
var telemetry_ts_1 = require("@grammarly-npm/telemetry.ts");
function createGnarClient() {
    // just use window.fetch - no need to rewrite anything as Gnar expects a raw fetch object
    var fetchFn = window.fetch.bind(window);
    var logger = telemetry_ts_1.LoggingImpl.DefaultLogAppender.createRootLogger('gnar', telemetry_ts_1.Logging.LogLevel.INFO, new telemetry_ts_1.LoggingImpl.GetFelogClient(config.URLS.newFelog, config.appName, config.getVersion(), config.ENV, fetchFn));
    var metrics = telemetry_ts_1.TimeSeriesImpl.MetricsStorage.createRoot('gnar', config.URLS.newFelog, fetchFn);
    var backendStorage = new gnarclientweb_1.BackendStorage(fetchFn, config_1.GNAR.url);
    var chromeCookieStorage = new gnarclientweb_1.ChromeCookieStorage(config_1.GNAR.url, config_1.GNAR.domain);
    var webExtensionsCookieStorage = new gnarclientweb_1.WebExtensionsCookieStorage(config_1.GNAR.url, config_1.GNAR.domain);
    var cidManager = new gnarclientweb_1.ContainerIdManager(util_1.isChrome() ? chromeCookieStorage : util_1.isFF() ? webExtensionsCookieStorage : backendStorage, [new gnarclientweb_1.CookieStorage(config_1.GNAR.domain), new gnarclientweb_1.LocalStorage(), new gnarclientweb_1.MemoryStorage()], logger.getLogger('containerId'), metrics.getCounter('containerId'), util_1.isChrome() ? 1000 : 5000);
    return new gnarclientweb_1.GnarClientImpl(config_1.GNAR.url, config.gnarAppName, config_1.getVersion(), fetchFn, cidManager, logger, metrics, true);
}
function init() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // @TODO log unhandled exceptions here!
                        try {
                            tracker_1.tracker().gnar = createGnarClient();
                        } catch (error) {
                            logger_1.logger.gnarClientInitFail(error && error.message);
                        }

                    case 1:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.init = init;
function processCookiesFromGrammarly(_ref) {
    var dapi = _ref.dapi;

    var domain = location_1.getDomain(),
        cookieOptions = {
        path: '/',
        domain: domain,
        // year from now
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };
    updateId('__fngrprnt__', dapi);
    function updateId(name, value) {
        if (!value || !name) return;
        pageCookie(name, null);
        pageCookie(name, value, cookieOptions);
    }
}
exports.processCookiesFromGrammarly = processCookiesFromGrammarly;
exports.getContainerIdOrUndefined = function () {
    return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return tracker_1.tracker().gnar.getContainerId();

                    case 3:
                        return _context2.abrupt("return", _context2.sent);

                    case 6:
                        _context2.prev = 6;
                        _context2.t0 = _context2["catch"](0);
                        return _context2.abrupt("return", undefined);

                    case 9:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[0, 6]]);
    }));
};

},{"../config":169,"../location":172,"../util":200,"./logger":195,"./tracker":198,"@grammarly-npm/gnarclientweb":3,"@grammarly-npm/telemetry.ts":6,"babel-runtime/core-js/promise":24,"babel-runtime/regenerator":35,"cookie":"cookie"}],190:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var message = require("../message");
var util_1 = require("../util");
var tracker_1 = require("./tracker");
var felogPixel_1 = require("./felogPixel");
var config = require("../config");
var felogClient_1 = require("./felogClient");
var request_1 = require("lib/request");
var bgPageCallImpls;
(function (bgPageCallImpls) {
    var felogClient = util_1.isBg() ? new felogClient_1.DefaultFelogClient(config.URLS.newFelog, config.appName, config.getVersion(), config.ENV, request_1.fetch.bind(window)) : undefined;
    /**
     * This should contain the implementations of methods which will be ran
     * on the background page and NOTHING ELSE.
     *
     * IMPORTANT requirement of these remotely-callable functions is that they
     * return `void`. You can't return anything from these functions, because
     * our content<->bg 'RPC' doesn't support that.
     *
     * ////// D.A.N.G.E.R. //////
     *
     * DON'T PUT ANYTHING in here except functions that will be executed on the
     * background page. If you need something in these functions, you can put it
     * at the top of the upper level namespace.
     *
     * ////// D.A.N.G.E.R. //////
     */
    var methods;
    (function (methods) {
        function sendFelog(logger, message, level, extra) {
            if (felogClient) {
                felogClient.sendEvent(logger, message, level, extra).catch(function (_) {
                    return felogPixel_1.sendEventPixel(logger, message, level, extra);
                });
            } else {
                throw Error('felogClient unavailable');
            }
        }
        methods.sendFelog = sendFelog;
    })(methods = bgPageCallImpls.methods || (bgPageCallImpls.methods = {}));
    // @TODO versioning??
    bgPageCallImpls.CALL_HANDLER_ID = 'tracking/RPC';
})(bgPageCallImpls || (bgPageCallImpls = {}));
/**
 * This is a collection of remote calls that you can make to the
 * background page. The code will be dispatched to be executed on the
 * background page, if not already running there.
 */
exports.callBgPage = (0, _keys2.default)(bgPageCallImpls.methods).reduce(function (o, k) {
    o[k] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return call.apply(undefined, [bgPageCallImpls.CALL_HANDLER_ID, k].concat(args));
    };
    return o;
}, {});
var log = [];
function call(msg) {
    for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        data[_key2 - 1] = arguments[_key2];
    }

    var fallback = function fallback(e) {
        console.warn("tracking call " + msg + " failed, reason: ", e); // tslint:disable-line no-console
    };
    if (util_1.isBg()) {
        util_1.asyncCall(function () {
            var _bgPageCallImpls$meth;

            try {
                logCall(msg, data);
                switch (msg) {
                    case bgPageCallImpls.CALL_HANDLER_ID:
                        var method = data[0];
                        var args = data.slice(1);
                        (_bgPageCallImpls$meth = bgPageCallImpls.methods)[method].apply(_bgPageCallImpls$meth, (0, _toConsumableArray3.default)(args));
                        break;
                    default:
                        runMessage(msg, data);
                        break;
                }
            } catch (e) {
                fallback(e);
            }
        }, 20);
    } else {
        var WAIT_TIMEOUT = 10000;
        var timeout = void 0;
        var preventTimeout = function preventTimeout() {
            return clearInterval(timeout);
        };
        var errorHandle = function errorHandle(e) {
            preventTimeout();
            fallback(e);
        };
        timeout = window.setTimeout(function () {
            return errorHandle('timeout call through bg page');
        }, WAIT_TIMEOUT);
        // errorHandle is not used in emitBackground so will never fire
        // message.emitBackground('tracking-call', { msg, data }, preventTimeout, errorHandle)
        message.emitBackground('tracking-call', { msg: msg, data: data }, preventTimeout);
    }
}
exports.call = call;
function runMessage(msg, data) {
    var args = msg.split('.'),
        method = args.pop(),
        ctx = args.reduce(function (closure, part) {
        return part in closure ? closure[part] : {};
    }, tracker_1.tracker());
    if (!ctx || !method || !ctx[method]) return console.error("No method " + msg + " in tracker object");
    ctx[method].apply(ctx, (0, _toConsumableArray3.default)(data));
}
function logCall(msg, data) {
    // @TODO do we need this?
    console.info(msg, data);
    if (!"yes") {
        log.push((0, _assign2.default)({ msg: msg }, data));
    }
}
function getLog() {
    var result = log.slice(0);
    log.length = 0;
    return result;
}
exports.getLog = getLog;

},{"../config":169,"../message":173,"../util":200,"./felogClient":192,"./felogPixel":193,"./tracker":198,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/helpers/toConsumableArray":33,"lib/request":184}],191:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
// we agreed to have just three log levels with Zava.
// though now the official readme for platform-felog lists four...
// so I guess it can be any number for the time being.
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["INFO"] = 0] = "INFO";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
(function (LogLevel) {
    function toFelogString(l) {
        switch (l) {
            case LogLevel.INFO:
                return 'INFO';
            case LogLevel.WARN:
                return 'WARN';
            case LogLevel.ERROR:
                return 'ERROR';
            default:
                var _ = l;
                throw new TypeError("Unrecognized log level " + l);
        }
    }
    LogLevel.toFelogString = toFelogString;
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
/**
 * Creates a URL for a get request to f-log, according to
 * platform-felog spec.
 */
function felogRequestUrl(appName, appVersion, env, baseUrl, loggerName, message, level, extra) {
    var payload = {
        message: message,
        logger: loggerName,
        level: LogLevel.toFelogString(level),
        application: appName,
        version: appVersion,
        env: env
    };
    if (extra) payload.extra = extra;
    return baseUrl + "/log?json=" + encodeURIComponent((0, _stringify2.default)(payload));
}
exports.felogRequestUrl = felogRequestUrl;

},{"babel-runtime/core-js/json/stringify":16}],192:[function(require,module,exports){
"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var timeseries_impl_1 = require("@grammarly-npm/telemetry.ts/lib/timeseries_impl");
var felog_1 = require("./felog");
/**
 * Default felog client implementation. Uses a simple fetch for events.
 * No queues, no buffering, no retries.
 *
 * For metrics, uses telemetry.ts implementation.
 *
 * @TODO maybe we should use telemetry.ts for events as well?
 */

var DefaultFelogClient = function () {
    function DefaultFelogClient(_baseUrl, _appName, _appVersion, _env, _fetch) {
        (0, _classCallCheck3.default)(this, DefaultFelogClient);

        this._baseUrl = _baseUrl;
        this._appName = _appName;
        this._appVersion = _appVersion;
        this._env = _env;
        this._fetch = _fetch;
        this._metrics = timeseries_impl_1.MetricsStorage.createRoot(this._env + "." + this._appName, this._baseUrl, this._fetch);
    }

    (0, _createClass3.default)(DefaultFelogClient, [{
        key: "sendEvent",
        value: function sendEvent(loggerName, message, level, extra) {
            return this._fetch(felog_1.felogRequestUrl(this._appName, this._appVersion, this._env, this._baseUrl, loggerName, message, level, extra), { mode: 'no-cors', method: 'get', cache: 'no-cache' }).then(function (_) {}).catch(function (_) {
                // ignore errors
                // @TODO should we log it to console? Since this is only running on
                // the bg page. Perhaps in dev mode only?
            });
        }
    }, {
        key: "sendCounter",
        value: function sendCounter(name, delta) {
            this._metrics.getCounter(name).increment(delta);
        }
    }, {
        key: "sendTimer",
        value: function sendTimer(name, time) {
            this._metrics.getTimer(name).recordTime(time);
        }
    }]);
    return DefaultFelogClient;
}();

exports.DefaultFelogClient = DefaultFelogClient;

},{"./felog":191,"@grammarly-npm/telemetry.ts/lib/timeseries_impl":11,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],193:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var config = require("../newConfig");
var felog_1 = require("./felog");
function sendEventPixel(loggerName, message, level, extra) {
    var img = document.createElement('img');
    img.src = felog_1.felogRequestUrl(config.appName, config.getVersion(), config.ENV, config.URLS.newFelog, loggerName, message, level, extra);
    return _promise2.default.resolve();
}
exports.sendEventPixel = sendEventPixel;
// @TODO implement metrics pixel for proxy.ts

},{"../newConfig":174,"./felog":191,"babel-runtime/core-js/promise":24}],194:[function(require,module,exports){
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var message = require("../message");
var config_1 = require("../config");
var call_1 = require("./call");
var logger_1 = require("./logger");
exports.logger = logger_1.logger;
var call_2 = require("./call");
exports.call = call_2.call;
exports.getLog = call_2.getLog;
var on = {};
function initBg() {
    var _require = require('./bgonly'),
        init = _require.init,
        processCookiesFromGrammarly = _require.processCookiesFromGrammarly;

    init().catch(function (_) {
        return logger_1.logger.bgTrackingInitFail();
    });
    on = require('./on').on;
    message.on('tracking-fire', function (_ref) {
        var msg = _ref.msg,
            data = _ref.data;
        return fire.apply(undefined, [msg].concat((0, _toConsumableArray3.default)(data)));
    });
    message.on('tracker-init', processCookiesFromGrammarly);
    message.on('tracking-call', function (_ref2) {
        var msg = _ref2.msg,
            data = _ref2.data;
        var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : util_1._f;

        call_1.call.apply(call_1, [msg].concat((0, _toConsumableArray3.default)(data)));
        cb();
    });
    fire('activity-ping');
}
exports.initBg = initBg;
function fire(msg) {
    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
    }

    if (util_1.isBg()) {
        if (!on[msg]) return console.error("No handler specified for message: " + msg);
        util_1.asyncCall(function () {
            var _on;

            return (_on = on)[msg].apply(_on, data);
        }, 20);
    } else {
        message.emitBackground('tracking-fire', { msg: msg, data: data });
    }
}
exports.fire = fire;
function initContentScript() {
    var times = 0;
    var pageCookie = require('cookie');
    if (pageCookie.default) pageCookie = pageCookie.default;
    var interval = setInterval(getCookies, 500),
        MAX = 10;
    function getCookies() {
        times++;
        if (times > MAX) clearInterval(interval);
        var data = {
            'mpCookie': pageCookie(config_1.MIXPANEL.cookie),
            'gnar': pageCookie('gnar_containerId'),
            'dapi': pageCookie('__fngrprnt__')
        };
        if (!data.mpCookie) return;
        clearInterval(interval);
        message.emitBackground('tracker-init', data);
    }
}
exports.initContentScript = initContentScript;

},{"../config":169,"../message":173,"../util":200,"./bgonly":189,"./call":190,"./logger":195,"./on":196,"babel-runtime/helpers/toConsumableArray":33,"cookie":"cookie"}],195:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var call_1 = require("./call");
var telemetry_1 = require("./telemetry");
var newConfig_1 = require("../newConfig");
// @TODO rename this when all usages are from TypeScript
exports.logger = new telemetry_1.Telemetry(call_1.callBgPage.sendFelog.bind(call_1.callBgPage));
function logUnhandledErrors() {
    window.addEventListener('error', function (e) {
        return exports.logger.unhandledBgPageException(e);
    });
    // unhandledrejection from native promise. Polyfilled version (es6.promise) would be skipped
    window.addEventListener('unhandledrejection', function (e) {
        return exports.logger.unhandledBgPageRejection(e);
    });
}
// log unhandled errors on background page only
// @TODO move this call to bg page initialization code for
// explicit execution order
if (newConfig_1.isBg()) {
    console.info('Installing unhandled error loggers...'); // tslint:disable-line no-console
    logUnhandledErrors();
}

},{"../newConfig":174,"./call":190,"./telemetry":197}],196:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _exports$on;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var call_1 = require("./call");
var logger_1 = require("./logger");
var prefs_1 = require("universal/bg/prefs");
var extension_api_1 = require("extension-api");
// tslint:disable function-name
exports.on = (_exports$on = {}, (0, _defineProperty3.default)(_exports$on, 'activity-ping', function activityPing() {
    // @TODO consider adding this metric back to new felog
    /*
    const toPercent = (val: number) =>
      parseFloat(String(Math.round(val * 100 * 100) / 100)).toFixed(2)
         setInterval(() => {
      if (!isWE()) {
        return call('statsc.ui.increment', 'activity:activity_ping')
      }
           if (window.chrome.system && window.chrome.system.cpu) {
        window.chrome.system.cpu.getInfo(info => {
          const __load = toPercent(
            info.processors
              .map(processor =>
                (processor.usage.total - processor.usage.idle) / processor.usage.total)
              .reduce((avg, cpu, _, total) => avg + cpu / total.length, 0)
          )
               const { usedJSHeapSize, totalJSHeapSize } = (window.performance as any).memory
               call('statsc.ui.increment', 'activity:activity_ping')
          call('statsc.ui.gauge', {
            'performance:memory_used': usedJSHeapSize,
            'performance:memory_used_of_total':
              toPercent((totalJSHeapSize - usedJSHeapSize) / totalJSHeapSize),
            'performance:cpu_load': load
          })
        })
      }
         }, FELOG.pingTimeout)
    */
}), (0, _defineProperty3.default)(_exports$on, 'daily-ping', function dailyPing(id, cookiesDisabled) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var prefs, pingDate, _pingDate$split, _pingDate$split2, storageNextDate, oldId, newId;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (id) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return");

                    case 2:
                        // GnarClient has it's own logic on dailyPings timeouts.
                        call_1.call('gnar.pingMaybe');
                        prefs = new prefs_1.PrefsImpl(extension_api_1.getApi().preferences);
                        _context.next = 6;
                        return prefs.get('pingDate');

                    case 6:
                        pingDate = _context.sent;

                        if (typeof pingDate !== 'string') pingDate = '';
                        _pingDate$split = pingDate.split('|'), _pingDate$split2 = (0, _slicedToArray3.default)(_pingDate$split, 2), storageNextDate = _pingDate$split2[0], oldId = _pingDate$split2[1];
                        newId = cookiesDisabled ? 'cookiesDisabled' : id;

                        if (!(storageNextDate && storageNextDate > Date.now() && oldId === newId)) {
                            _context.next = 12;
                            break;
                        }

                        return _context.abrupt("return");

                    case 12:
                        logger_1.logger.dailyPing();
                        _context.next = 15;
                        return prefs.set('pingDate', [util_1.getNextPingDate(), newId].join('|'));

                    case 15:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}), (0, _defineProperty3.default)(_exports$on, 'app_signin_success', function app_signin_success(placement) {
    call_1.call('gnar.track', 'userLoginForm/accepted', { placement: placement });
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:app_signin_success')
}), (0, _defineProperty3.default)(_exports$on, 'app_signup_success', function app_signup_success(placement) {
    call_1.call('gnar.track', 'userAccountSignupForm/accepted', { placement: placement });
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:app_signup_success')
}), (0, _defineProperty3.default)(_exports$on, 'signin-error', function signinError(error) {
    error.errorType = 'Server-Side';
    call_1.call('gnar.track', 'userLoginForm/rejected');
}), (0, _defineProperty3.default)(_exports$on, 'signup-error', function signupError(error) {
    error.errorType = 'Server-Side';
    call_1.call('gnar.track', 'userAccountSignupForm/rejected');
}), (0, _defineProperty3.default)(_exports$on, 'upgrade-after-register', function upgradeAfterRegister() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        call_1.call('gnar.track', 'Account_Type_Selected');

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}), (0, _defineProperty3.default)(_exports$on, 'hook-clicked', function hookClicked(placement) {
    call_1.call('gnar.track', 'upgradeHookClicked', { placement: placement });
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', `activity:upgrade.${placement}.click`)
    logger_1.logger.userUpgradeClick(placement);
}), (0, _defineProperty3.default)(_exports$on, 'correct-btn-clicked', function correctBtnClicked() {
    call_1.call('gnar.track', 'gbuttonClicked');
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:editor.gbutton_clicked')
    logger_1.logger.gButtonClick();
}), (0, _defineProperty3.default)(_exports$on, 'btn-disable-in-field', function btnDisableInField(enabled) {
    call_1.call('gnar.track', 'checkingInFieldToggled', { enabled: enabled });
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', `stability:disable_in_field.${enabled ? 'on' : 'off'}`)
    logger_1.logger.checkingToggledInField(enabled);
}), (0, _defineProperty3.default)(_exports$on, 'button-change-state', function buttonChangeState() {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:g_button_minimize_toggled')
}), (0, _defineProperty3.default)(_exports$on, 'login-attempt', function loginAttempt(placement) {
    call_1.call('gnar.track', 'signInClicked', { placement: placement });
}), (0, _defineProperty3.default)(_exports$on, 'show-dictionary', function showDictionary() {
    call_1.call('gnar.track', "showDictionary");
}), (0, _defineProperty3.default)(_exports$on, 'referral-shown', function referralShown(placement) {
    call_1.call('gnar.track', 'referral/referralNotificationShown', { placement: placement });
}), (0, _defineProperty3.default)(_exports$on, 'referral-clicked', function referralClicked(placement) {
    call_1.call('gnar.track', 'referral/referralButtonClicked', { placement: placement });
}), (0, _defineProperty3.default)(_exports$on, 'tab-connected', function tabConnected( // 'this is fine.'
id, _ref, _ref2) {
    var enabled = _ref.enabled;
    var cookiesDisabled = _ref2.cookiesDisabled;

    this['daily-ping'](id, cookiesDisabled);
    if (!enabled) {
        logger_1.logger.disabledOnDomain();
    }
}), (0, _defineProperty3.default)(_exports$on, 'session-invalidate', function sessionInvalidate( // 'this is fine.'
user, oldUser, reason, cookiesDisabled, _containerId) {
    var id = user.id,
        anonymous = user.anonymous,
        isTest = user.isTest;

    if (id !== oldUser.id) {
        call_1.call('gnar.setUser', id, isTest);
        // @TODO consider adding this metric back to new felog
        // call('felog.setUser', { id, name, anonymous, premium, email, type, containerId })
        this['daily-ping'](id, cookiesDisabled);
    }
    if (reason) logger_1.logger.sessionInvalidated(reason, id !== oldUser.id);
    if (oldUser.email && !oldUser.anonymous && anonymous) {
        logger_1.logger.unexpectedAnonymous({
            email: oldUser.email,
            token: oldUser.token,
            grauth: oldUser.grauth,
            tokenEqualsGrauth: oldUser.token === oldUser.grauth,
            cookiesDisabled: cookiesDisabled,
            reason: reason
        });
    }
}), (0, _defineProperty3.default)(_exports$on, 'set-dapi-prop', function setDapiProp(propName, value) {
    if (propName === 'dialectWeak') {
        call_1.call('gnar.track', 'languageWeakPreference', { dialect: value });
    }
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:weak_dialect_changed')
    logger_1.logger.dapiPropInitialized(propName, value);
}), (0, _defineProperty3.default)(_exports$on, 'change-dialect', function changeDialect(_ref3) {
    var language = _ref3.language,
        dialectWeak = _ref3.dialectWeak;

    var trackingData = { language: language };
    if (dialectWeak) {
        trackingData.sameAsWeak = language === dialectWeak;
    }
    call_1.call('gnar.track', 'languageStrongPreference', trackingData);
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:language_dialect_changed')
}), (0, _defineProperty3.default)(_exports$on, 'change-defs', function changeDefs(data) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:definitions_toggled')
    call_1.call('gnar.track', 'definitionsToggled', data);
    logger_1.logger.toggleExtensionDefs(data.enabled);
}), (0, _defineProperty3.default)(_exports$on, 'change-grammar', function changeGrammar(data) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.increment', 'stability:toggle_extension_on_site')
    call_1.call('gnar.track', 'checkingToggled', data);
    logger_1.logger.toggleExtension(data.enabled);
}), (0, _defineProperty3.default)(_exports$on, 'popup-open', function popupOpen() {
    call_1.call('gnar.track', 'browserToolbarButtonClicked');
}), (0, _defineProperty3.default)(_exports$on, 'popup-open-on-unsupported', function popupOpenOnUnsupported() {
    call_1.call('gnar.track', 'browserToolbarButtonClicked/unsupported');
}), (0, _defineProperty3.default)(_exports$on, 'cookie-overflow', function cookieOverflow(total, biggestCookie) {
    // @TODO consider adding this metric back to new felog
    // call('statsc.ui.timing', 'stability:too_big_cookie_header.total', total)
    logger_1.logger.cookieOverflow(total, biggestCookie);
}), (0, _defineProperty3.default)(_exports$on, 'premium-popup-show', function premiumPopupShow() {
    call_1.call('gnar.track', 'upgradeReferralPopupShown');
}), (0, _defineProperty3.default)(_exports$on, 'premium-popup-upgrade-click', function premiumPopupUpgradeClick() {
    call_1.call('gnar.track', 'upgradeReferralPremiumBtnClicked');
}), (0, _defineProperty3.default)(_exports$on, 'premium-popup-referral-click', function premiumPopupReferralClick() {
    call_1.call('gnar.track', 'upgradeReferralInviteBtnClicked');
}), (0, _defineProperty3.default)(_exports$on, 'email-perception-popup-show', function emailPerceptionPopupShow() {
    call_1.call('gnar.track', 'askForFeedback-popup-show');
    logger_1.logger.emailPerceptionPopupShow();
}), (0, _defineProperty3.default)(_exports$on, 'email-perception-popup-cancel', function emailPerceptionPopupCancel() {
    call_1.call('gnar.track', 'askForFeedback-popup-cancel');
    logger_1.logger.emailPerceptionPopupCancel();
}), (0, _defineProperty3.default)(_exports$on, 'email-perception-button-hover', function emailPerceptionButtonHover() {
    call_1.call('gnar.track', 'askForFeedback-button-hover');
    logger_1.logger.emailPerceptiongButtonHover();
}), (0, _defineProperty3.default)(_exports$on, 'onboarding-popup-show', function onboardingPopupShow() {
    call_1.call('gnar.track', 'onboarding-popup-show');
    logger_1.logger.onboardingPopupShow();
}), (0, _defineProperty3.default)(_exports$on, 'onboarding-popup-cancel', function onboardingPopupCancel() {
    call_1.call('gnar.track', 'onboarding-popup-cancel');
    logger_1.logger.onboardingPopupCancel();
}), (0, _defineProperty3.default)(_exports$on, 'onboardingTutorial-popup-show', function onboardingTutorialPopupShow() {
    call_1.call('gnar.track', 'onboardingTutorial-popup-show');
    logger_1.logger.onboardingTutorialShow();
}), (0, _defineProperty3.default)(_exports$on, 'onboardingTutorialNext-button-click', function onboardingTutorialNextButtonClick() {
    call_1.call('gnar.track', 'onboardingTutorialNext-button-click');
}), (0, _defineProperty3.default)(_exports$on, 'onboardingTutorialPersonalize-button-click', function onboardingTutorialPersonalizeButtonClick() {
    call_1.call('gnar.track', 'onboardingTutorialPersonalize-button-click');
}), (0, _defineProperty3.default)(_exports$on, 'onboardingTutorialSave-button-click', function onboardingTutorialSaveButtonClick() {
    call_1.call('gnar.track', 'onboardingTutorialSave-button-click');
}), (0, _defineProperty3.default)(_exports$on, 'onboardingTutorialLetsWrite-button-click', function onboardingTutorialLetsWriteButtonClick() {
    call_1.call('gnar.track', 'onboardingTutorialLetsWrite-button-click');
}), _exports$on);

},{"../util":200,"./call":190,"./logger":195,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/slicedToArray":32,"babel-runtime/regenerator":35,"extension-api":154,"universal/bg/prefs":206}],197:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var felog_1 = require("./felog");
// @NOTE this class uses arrow functions for all public methods, because
// they can be used in JS files and passed as callbacks, and there's no quick
// way to verify that .bind() was used in each case.
//
// When we convert everything to TS, don't use arrow functions here, and instead
// check that .bind() is used every time one of the methods is passed as a callback.

var Telemetry = function () {
    function Telemetry(_sendFelog) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Telemetry);

        this._sendFelog = _sendFelog;
        /**
         * Content script failed to init on the tab
         * Fires after 120 sec timeout, if pageLoad event wasn't fired
         * Can fail when page loads too long or there is no bg page connection
         */
        this.pageLoadTimeout = function () {
            _this._send('cs.connection.failover.pageLoad.timeout', 'content script init failed', felog_1.LogLevel.ERROR);
        };
        /**
         * Failed extension init
         * Fires after 120 sec timeout, if CS has inited state
         * Can fail when there is no bg page connection
         */
        this.appLoadTimeout = function () {
            _this._send('cs.connection.failover.appLoad.timeout', 'extension init timed out', felog_1.LogLevel.ERROR);
        };
        /**
         * State domain different from the current, skip update state method
         * @param stateDomain value of incorrect domain in the state
         */
        this.differentStateDomain = function (stateDomain) {
            _this._send('cs.state.differentDomain', 'received state for different domain', felog_1.LogLevel.INFO, { stateDomain: stateDomain });
        };
        /**
         * Restored connection with bg page after init without connection
         * or getting error from bg page
         * Fires twice:
         *  - update state method
         *  - on track error from bg page
         * TODO: send this event more than once?
         */
        this.restoredBgConnection = function (timeWithoutConnection) {
            _this._send('cs.connection.bg.restored', 'bg page connection restored', felog_1.LogLevel.INFO, { timeWithoutConnection: timeWithoutConnection });
        };
        /**
         * Initialize content script without connection to the bg page
         * Starts timer and try to reconnect
         */
        this.initWithoutBgConnection = function () {
            _this._send('cs.connection.bg.disconnected', 'no connection to bg page', felog_1.LogLevel.INFO);
        };
        /**
         * Dictionary fetch request failed
         * Spike of this metric cause an error on defenitions service or incorrect request
         */
        this.fetchDefinitionsFail = function () {
            _this._send('cs.connection.api.definition.failed', 'definitions fetch failed', felog_1.LogLevel.WARN);
        };
        /**
         * Failed to reset gButton infinity checking state
         * Will show offline state after 3 retry
         * @param delay - what time user saw "checking" state in gButton
         */
        this.infinityCheckResetFail = function (delay) {
            _this._send('cs.connection.infiniteCheck.failed', 'infinite check reset failed', felog_1.LogLevel.ERROR, { delay: delay });
        };
        /**
         * Page config initialization took more than 60s
         */
        this.tooLongPageConfigInit = function (initTime) {
            _this._send('cs.pageConfig.init.exceeded', 'page config init timeout', felog_1.LogLevel.WARN, { initTime: initTime });
        };
        /**
         * User update tooks longer than 60s
         * Profiler can be stoped by success init or error
         */
        this.tooLongUserUpdateTime = function (updateTime) {
            _this._send('bg.state.user.update.exceeded', 'user state update took too long', felog_1.LogLevel.WARN, { updateTime: updateTime });
        };
        /**
         * gButton component lost connection to the bg page (state has flag bgNotConnected)
         * Fire on
         *  - create of the component
         *  - updateState event
         */
        this.lostBgPageConnection = function () {
            _this._send('cs.gbutton.bgСonnection.lost', 'gbutton connection to bg page lost', felog_1.LogLevel.INFO);
        };
        /**
         * gButton compomnent restored connection to the bg page, after it was lost
         * Fire on
         *  - create of the component
         *  - updateState event
         */
        this.restoreBgPageConnection = function (time) {
            _this._send('cs.gbutton.bgСonnection.restored', 'gbutton connection to bg page restored', felog_1.LogLevel.INFO, { time: time });
        };
        /**
         * Incorrect cursor position in grammarly-editor
         * Will try to fix it, to bring cursor to the current position for the user
         */
        this.badCursorPosition = function () {
            _this._send('cs.editor.badCursorPosition', 'incorrect cursor position in grammarly-editor', felog_1.LogLevel.INFO);
        };
        /**
         * User saw jumped cursor in the field
         * Retry attemps of fixing cursor position failed
         */
        this.cursorJump = function () {
            _this._send('cs.editor.cursorJump', 'cursor jump detected', felog_1.LogLevel.WARN);
        };
        /**
         * Show signin dialog
         * Similar to close signin dialog event
         */
        this.signinOpen = function () {
            _this._send('cs.signin.open', 'sign in dialog opened', felog_1.LogLevel.INFO);
        };
        /**
         * Close signin dialog
         * Similar to open signin dialog even
         * @param openTime - time which dialog was opend
         */
        this.signinClose = function (openTime) {
            _this._send('cs.signin.close', 'sign in dialog closed', felog_1.LogLevel.INFO, { openTime: openTime });
        };
        /**
         * Error popup tab reload click
         * Click on the reload link in gButton hover popup in offline state
         * Spikes means a lot of gButton in the offline state
         */
        this.tabReloadClick = function () {
            _this._send('cs.gbutton.reload.click', 'gbutton reload clicked', felog_1.LogLevel.WARN);
        };
        /**
         * Popup activation failed
         * Get an error in catch of the iFrame load event
         * @param message - error message
         * @param name - error name
         */
        this.popupLoadError = function (message, name) {
            _this._send('cs.popup.load.error', 'could not open pop-up editor', felog_1.LogLevel.ERROR, { message: message, name: name });
        };
        /**
         * Cannot connect to the bg page during login event
         * Erorr in the fetch to the Auth
         * Error message contains rejected by timeout
         * @param message - error message
         */
        this.loginNoBgPageConnection = function (message) {
            _this._send('debug.cs.connection.signin.bg.timeout', 'can not connect to bg page on login', felog_1.LogLevel.INFO, { message: message });
        };
        /**
         * Cannot get valid config from CDN
         * Incorrect config (parsing error) or problems on CDN
         */
        this.pageConfigCDNError = function (message) {
            _this._send('cs.pageConfig.cdn.error', 'could not read page config', felog_1.LogLevel.ERROR, { message: message });
        };
        /**
         * Cant get valid config from LocalStorage
         * Incorrect config (parsing error) or no access to LocalStorage
         */
        this.pageConfigLocalStorageError = function (message, name) {
            _this._send('cs.pageConfig.localStorage.error', 'could not read page config from localStorage', felog_1.LogLevel.INFO, { message: message, name: name });
        };
        /**
         * New version of the page config loaded
         * This event shows how update config happens
         */
        this.pageConfigUpdated = function (oldVersion, newVersion) {
            _this._send('cs.pageConfig.updated', 'page config updated', felog_1.LogLevel.INFO, { oldVersion: oldVersion, newVersion: newVersion });
        };
        /**
         * Settings popup not showed in 2sec after initialization
         * Probably user don't see settings popup after click, but init can be also in the progress
         */
        this.settingsPopupTimeout = function () {
            _this._send('settings.popup.init.timeout', 'settings popup open timeout', felog_1.LogLevel.WARN);
        };
        /**
         * Displays unsupported message in the settings popup
         * @param popupType
         */
        this.settingsUsupportedShow = function (popupType) {
            _this._send('settings.popup.state.unsupported.show', 'page unsupported message shown', felog_1.LogLevel.INFO, { popupType: popupType });
        };
        /**
         * Settings popup disabled/enabled for experiment on grammarly.com/i/personalize page
         * We should disable popup only on this page and if url or tab change - enable it
         */
        this.settingsPopupToggled = function (isPopupDisabled) {
            _this._send('settings.popup.experiment.toggle', 'settings popup disabled/enabled for experiment on /personalize page', felog_1.LogLevel.INFO, { isPopupDisabled: isPopupDisabled });
        };
        /**
         * onError handler in the bg page socket
         * TODO: do not send the same errors more than once?
         */
        this.socketBgError = function () {
            _this._send('bg.socket.error', 'bg page socket error', felog_1.LogLevel.WARN);
        };
        /**
         * Get not_authorized error from CAPI and connection state
         * has failed recovery with auth
         * Show offline state for user
         * @param authDegradation - is auth available in the state of connection
         * @param cookiesDisabled
         */
        this.capiNotAuthorizedLoop = function (authDegradation, cookiesDisabled) {
            _this._send('debug.socket.notAuthorizedLoop', 'could not authenticate on capi and auth', felog_1.LogLevel.INFO, { authDegradation: authDegradation, cookiesDisabled: cookiesDisabled });
        };
        /**
         * Disabled cookies in not_authorized error handler(fixer)
         */
        this.socketDisabledCookie = function () {
            _this._send('debug.socket.disabledCookies', 'disabled cookies after failed authentication', felog_1.LogLevel.INFO);
        };
        /**
         * Capi session restored after auth degradation
         * @param tryCount - number of the restore attemps
         * TODO: check connectionFixer method
         */
        this.socketBgRestored = function (tryCount) {
            _this._send('debug.bg.socket.restored', 'capi session restored', felog_1.LogLevel.INFO, { tryCount: tryCount });
        };
        /**
         * Error to restore session in ws.emit
         * Logs every 10th failed reconnect
         */
        this.socketBgReconnectFail = function (token, tryCount) {
            _this._send('bg.socket.reconnect.fail', 'could not restore ws connection', felog_1.LogLevel.WARN, { token: token, tryCount: tryCount });
        };
        /**
         * onError handler in the cs socket
         * TODO: do not send the same errors more than once?
         */
        this.socketCsError = function () {
            _this._send('cs.socket.error', 'content script socket error', felog_1.LogLevel.WARN);
        };
        /**
         * Get an error message from CAPI
         * @param message - type of the error in msg
         */
        this.soketCsErrorMsg = function (message) {
            _this._send('cs.socket.errorMsg', 'capi error', felog_1.LogLevel.WARN, { message: message });
        };
        /**
         * Gnar client initialization failed
         * catch an error in the createGnarClient
         * @param message - error message
         */
        this.gnarClientInitFail = function (message) {
            _this._send('gnar.bg.tracking.gnar.init.fail', 'gnar init failed', felog_1.LogLevel.WARN, { message: message });
        };
        /**
         * Catch an error on bg tracking init (require and initialize tracking library)
         */
        this.bgTrackingInitFail = function () {
            _this._send('debug.tracking.init.fail', 'bg page tracking library init failed', felog_1.LogLevel.INFO);
        };
        /**
         * TODO: do we need it?
         */
        this.dailyPing = function () {
            _this._send('debug.dailyPing', 'daily ping', felog_1.LogLevel.INFO);
        };
        /**
         * Upgrade hook action for the free users
         * Opens upgrade page on fannel
         * @param placement - place, from where upgrade link was clicked
         */
        this.userUpgradeClick = function (placement) {
            _this._send('cs.ui.action.upgradeClick', 'upgrade hook clicked', felog_1.LogLevel.INFO, { placement: placement });
        };
        /**
         * Open popup editor
         * If this metric have spike - can be something wrong with popup editor or extension
         */
        this.gButtonClick = function () {
            _this._send('cs.ui.gbutton.click', 'gbutton clicked', felog_1.LogLevel.INFO);
        };
        /**
         * Enable/Disable extension in the field
         * Can be used for monitoring of top10 disabled domains
         */
        this.checkingToggledInField = function (enabled) {
            _this._send('cs.ui.gbutton.toggleInField', 'checking toggled in field', felog_1.LogLevel.INFO, { enabled: enabled });
        };
        /**
         * Initialize extension on the disabled domain
         * Getting list of disabled domains from the black list
         */
        this.disabledOnDomain = function () {
            _this._send('cs.state.disabledOnDomain', 'checking disabled for domain', felog_1.LogLevel.INFO);
        };
        /**
         * User session changed
         * Session can be invalidated by
         *   onSessionStart, recover_after_capi_error,
         *   cookieChange, changed-user, logout
         * @param reason - why session was invalidated
         * @param userChanged - is grauth token changed
         */
        this.sessionInvalidated = function (reason, userChanged) {
            _this._send('bg.session.invalidated', 'user session invalidated', felog_1.LogLevel.INFO, { reason: reason, userChanged: userChanged });
        };
        /**
         * Get anonymous user in session change event
         * Previous user wasn't anonymous and has valid email
         */
        this.unexpectedAnonymous = function (data) {
            _this._send('debug.bg.session.unexpectedAnonymous', 'user changed to anonymous', felog_1.LogLevel.INFO, data);
        };
        /**
         * Set property to the DAPI
         * For example, for weak dialect:
         *  - we are getting it ONCE from CAPI and then used like weak dialect prop in settings
         */
        this.dapiPropInitialized = function (name, value) {
            _this._send('bg.settings.dapi.prop.init', 'save property to the DAPI', felog_1.LogLevel.INFO, { name: name, value: value });
        };
        /**
         * Error by get property from the DAPI
         * @param property - name of the prop
         * @param body - error body
         */
        this.getDapiPropError = function (property, body) {
            _this._send('bg.connection.dapi.getProp.error', 'could not get dapi property', felog_1.LogLevel.WARN, { property: property, body: body });
        };
        /**
         * Error by set property to the DAPI
         * @param property - name of the prop
         * @param body - error body
         */
        this.setDapiPropError = function (property, body) {
            _this._send('bg.connection.dapi.setProp.error', 'could not set dapi property', felog_1.LogLevel.WARN, { property: property, body: body });
        };
        /**
         * Change definitions state on the domain
         * definitions - show defenition or synonymous of selected world on dbl click
         * @param enabled - state of the defenitions
         */
        this.toggleExtensionDefs = function (enabled) {
            _this._send('bg.settings.definitions.toggle', 'definitions toggled for domain', felog_1.LogLevel.INFO, { enabled: enabled });
        };
        /**
         * Extension was enabled/disabled on domain
         * Can be used for monitoring of top10 disabled domains
         * @param enabled - state of the extension
         */
        this.toggleExtension = function (enabled) {
            _this._send('bg.settings.extension.toggle', 'extension toggled for domain', felog_1.LogLevel.INFO, { enabled: enabled });
        };
        /**
         * Fires if total cookie size more than 7KB
         * @param size - total cookie size
         * @param biggestCookie - biggest cookie
         */
        this.cookieOverflow = function (size, biggestCookie) {
            _this._send('debug.bg.state.cookie.overflow', 'cookie is too big', felog_1.LogLevel.INFO, { size: size, biggestCookie: biggestCookie });
        };
        /**
         * Change plan message from the editor
         * Should reset state of the inited extensions
         */
        this.externalChangePlan = function () {
            _this._send('bg.api.external.changePlan', 'plan changed from editor', felog_1.LogLevel.INFO);
        };
        /**
         * Change dialect message from the editor
         * Should reset state and resend text to the CAPI
         */
        this.externalChangeDialect = function () {
            _this._send('bg.api.external.changeDialect', 'dialect changed from editor', felog_1.LogLevel.INFO);
        };
        /**
         * Change user (login?) message from the editor
         * Should reset state of the inited extensions
         */
        this.externalChangeUser = function () {
            _this._send('bg.api.external.changeUsed', 'user changed from editor', felog_1.LogLevel.INFO);
        };
        /**
         * Logout message from the editor
         * Should reset state of the inited extensions
         */
        this.externalLogout = function () {
            _this._send('bg.api.external.logout', 'user logged out form editor', felog_1.LogLevel.INFO);
        };
        /**
         * Message from the funnel
         * Should reset session and get email_perception group from auth
         */
        this.externalEnableEmailPerception = function () {
            _this._send('bg.api.external.enableEmailPerception', 'user enabled email perception feature on the funnel', felog_1.LogLevel.INFO);
        };
        /**
         * Catch an error in start method promise on bg page
         * @param message - error message
         * @param stack - error stack
         */
        this.bgPageStartFail = function (message, stack) {
            _this._send('bg.start.fail', 'bg page start failed', felog_1.LogLevel.ERROR, { message: message, stack: stack });
        };
        /**
         * Bg page was initialized in more than 30sec
         */
        this.bgPageInitTimeout = function (initTime) {
            _this._send('bg.state.start.timeout', 'bg page init timeout', felog_1.LogLevel.WARN, { initTime: initTime });
        };
        /**
         * Failed to start bg page
         * Call this metric in the checkBgInit function in the end of start method
         */
        this.bgPageInitFail = function (initAttempts) {
            _this._send('bg.state.init.fail', 'bg page init failed', felog_1.LogLevel.ERROR, { initAttempts: initAttempts });
        };
        /**
         * Show update process of the extension to new version
         */
        this.extensionUpdated = function (currentVersion, previousVersion) {
            _this._send('bg.state.updated', 'extension updated', felog_1.LogLevel.INFO, { currentVersion: currentVersion, previousVersion: previousVersion });
        };
        /**
         * Fail update from the previous version
         * Bad or incorrect previous version
         */
        this.extensionUpdateFail = function (previousVersion) {
            _this._send('bg.state.update.fail', 'extension update failed', felog_1.LogLevel.INFO, { previousVersion: previousVersion });
        };
        /**
         * Catch error while trying get an extension install source (funnel or webstore)
         */
        this.cannotGetInstallSource = function () {
            _this._send('bg.getSource.fail', 'failed to get extension install source', felog_1.LogLevel.WARN);
        };
        /**
         * Extension install event
         * This event should be fire only ONCE after first? install
         * @param source - funnel|webstore
         */
        this.extensionInstall = function (source) {
            _this._send('bg.state.install', 'extension installed', felog_1.LogLevel.INFO, { source: source });
        };
        /**
         * Event from chrome.runtime.onUpdateAvailable listener
         * Found new version of the chrome extension and will run update in random(1-20) min
         */
        this.chromeForcedToUpdate = function (newVersion) {
            _this._send('bg.chrome.forcedToUpdate', 'chrome forced update', felog_1.LogLevel.INFO, { newVersion: newVersion });
        };
        /**
         * Error handler for tabs.executeScript and tabs.insertCSS methods
         * @param message - error message
         * @param type - content script type
         */
        this.chromeContentScriptLoadError = function (message, type) {
            _this._send('bg.chrome.cs.load.error', 'content script execution error', felog_1.LogLevel.WARN, { message: message, type: type });
        };
        /**
         * Show browser notification with tabs reload action
         * We show it only on MAJOR version update
         */
        this.reloadNotificationShow = function () {
            _this._send('bg.ui.notification.tabsReload.show', 'extension reload notification shown', felog_1.LogLevel.WARN);
        };
        /**
         * Click on the tabs reload notification
         * Should be fired only after display of the browser notification with reload action
         */
        this.reloadNotificationClick = function () {
            _this._send('bg.ui.notification.tabsReload.click', 'reload notification clicked', felog_1.LogLevel.INFO);
        };
        /**
         * Catch an error in the updateUser method
         * Possible Auth service problem
         * @param reason - onSessionStart | onSessionStart | cookieChange
         * @param body - error body
         * @param statusCode - error statusCode
         */
        this.fetchUserFail = function (reason, body, statusCode) {
            _this._send('bg.user.fetch.fail', 'failed to update user', felog_1.LogLevel.WARN, { body: body, statusCode: statusCode, reason: reason });
        };
        /**
         * Mimic request to Dapi failed
         * Possible Dapi service problem
         * @param body - error body
         * @param statusCode - error status code
         */
        this.fetchMimicFail = function (body, statusCode) {
            _this._send('bg.user.mimic.fail', 'mimic request failed', felog_1.LogLevel.WARN, { body: body, statusCode: statusCode });
        };
        /**
         * Get an error in the getToken method
         * which try to get grauth cookie from cookies
         */
        this.fetchCookieFail = function () {
            _this._send('bg.cookie.fail', 'could not get grauth from cookie', felog_1.LogLevel.WARN);
        };
        /**
         * Fetch settings from AUTH failed
         * Possible AUTH service problem
         * Will be depricated soon
         * @param body - error body
         * @param statusCode - error status code
         */
        this.fetchSettingsFail = function (body, statusCode) {
            _this._send('bg.user.settings.fail', 'could not get settings from auth', felog_1.LogLevel.WARN, { body: body, statusCode: statusCode });
        };
        /**
         * Catch an error in the cookieChange method
         * @param canceled - actions state?
         */
        this.frequentCookieChanges = function (canceled) {
            _this._send('debug.cookie.onChange.error', 'cookie change too frequent', felog_1.LogLevel.INFO, { canceled: canceled });
        };
        /**
         * Initialize prop setting from the DAPI
         * Show number of request to DAPI for getting prosp
         */
        this.initializePropFromDapi = function (name) {
            _this._send('bg.state.dapi.prop.initialize', 'set property from dapi', felog_1.LogLevel.INFO, { name: name });
        };
        /**
         * Show email perception popup to user
         * The display logic:
         * - user has opted in to this feature
         * - there's more than 300 characters in the email body (not including quoted text)
         * - the user has made a 5-seconds stop in typing
         * - this same popup has not been shown in the current day
         */
        this.emailPerceptionPopupShow = function () {
            _this._send('cs.emailPerception.popup.show', 'show email perception popup on gmail/inbox domain', felog_1.LogLevel.INFO);
        };
        /**
         * User canceled email perception popup on gmail/inbox
         */
        this.emailPerceptionPopupCancel = function () {
            _this._send('cs.emailPerception.popup.cancel', 'user canceled email perception popup on gmail/inbox', felog_1.LogLevel.INFO);
        };
        /**
         * User hovered gButton and ask for feedback btn is shown on gmail/inbox
         */
        this.emailPerceptiongButtonHover = function () {
            _this._send('cs.emailPerception.gbutton.hover', 'user hovered gButton and ask for feedback btn is shown on gmail/inbox', felog_1.LogLevel.INFO);
        };
        /**
         * Show onboarding popup to user first time
         * User should have only one this event
         */
        this.onboardingPopupShow = function () {
            _this._send('cs.onboarding.popup.show', 'show onboarding popup to user after first time extension install', felog_1.LogLevel.INFO);
        };
        /**
         * User canceled onboarding popup
         */
        this.onboardingPopupCancel = function () {
            _this._send('cs.onboarding.popup.cancel', 'user canceled onboarding popup', felog_1.LogLevel.INFO);
        };
        /**
         * Show onboarding tutorial dialog to user after he clicked "take a quick tour" button
         * User should have only one this event
         */
        this.onboardingTutorialShow = function () {
            _this._send('cs.onboarding.tutorial.show', 'opened onboarding dialog after popup', felog_1.LogLevel.INFO);
        };
        /**
         * Load video content on the onboarding tutorial dialog and start playing it
         */
        this.onboardingVideoLoaded = function () {
            _this._send('cs.onboarding.tutorial.video.loaded', 'load video data for onboarding tutorial', felog_1.LogLevel.INFO);
        };
        /**
         * Get an error on saving email feedback data to backend
         * This action is being called when user inserts feedback signature
         * into the email compose field on gmail.com
         */
        this.saveEmailFeedbackError = function (body) {
            _this._send('bg.emailfeedback.save.error', 'failed to save email feedback', felog_1.LogLevel.INFO, { body: body });
        };
        /**
         * Initialize extension on incognito tab
         * Show information about init amounts on the incognito TAB
         */
        this.incognitoInit = function () {
            _this._send('bg.incognito.init', 'extension initialized in incognito mode', felog_1.LogLevel.INFO);
        };
        /**
         * Initialize extension with disabled cookies
         * Show information about init amounts with disabled cookies
         */
        this.disabledCookiesInit = function () {
            _this._send('bg.cookie.disabled', 'extension initialized with disabled cookies', felog_1.LogLevel.INFO);
        };
        /**
         * Proxy script was injected and initialized on a page.
         */
        this.proxyInit = function () {
            _this._send('proxy.init', 'proxy script initialized', felog_1.LogLevel.INFO);
        };
        /**
         * Proxy port was disconnected. Happens normally when background page is
         * reloaded.
         */
        this.proxyPortDisconnected = function (portName, errorMessage) {
            _this._send('proxy.disconnect', 'proxy port disconnected', felog_1.LogLevel.INFO, { port: portName, error: errorMessage });
        };
        /**
         * An unhandled exception on background page bubbled to the top.
         * This is a critical error.
         */
        this.unhandledBgPageException = function (e) {
            // @TODO take a look at how it's done in Editor.ts, there's some room for
            // improvement here.
            // tslint:disable-next-line max-line-length
            // https://github.com/grammarly/denali/blob/c5d321e8292536876bd1181fb0039a096c48712a/lib/client/telemetry/editor_telemetry.ts
            _this._send('bg.unhandledException', 'unhandled exception on background page', felog_1.LogLevel.ERROR,
            // @TODO this is not very good. it will get JSONed into the
            // extra.json field.
            {
                // @TODO These file names and line numbers are of
                // the bundled code – might not be that useful.
                // Let's see how we can improve later.
                // file: e.filename,
                // line: e.lineno,
                // col: e.colno,
                message: e.error ? e.error.message : e.message
                // @TODO should we also log the exception itself – e.error?
            });
        };
        /**
         * An unhandled promise rejection on background page bubbled to the top.
         * This is a critical error.
         */
        this.unhandledBgPageRejection = function (e) {
            // @TODO change type of e to PromiseRejectionEvent after we move to TS 2.2
            // (it's already merged: https://github.com/Microsoft/TSJS-lib-generator/pull/187/files)
            // @TODO take a look at how it's done in Editor.ts, there's some room for
            // improvement here.
            // tslint:disable-next-line max-line-length
            // https://github.com/grammarly/denali/blob/c5d321e8292536876bd1181fb0039a096c48712a/lib/client/telemetry/editor_telemetry.ts
            _this._send('bg.unhandledRejection', 'unhandled promise rejection on background page', felog_1.LogLevel.ERROR, {
                message: e.reason != null ? typeof e.reason === 'string' ? e.reason : e.reason.message : undefined
            });
        };
        /**
         * Storage data was migrated successfully.
         */
        this.storageMigrationSucceeded = function () {
            _this._send('bg.storageMigration.success', 'storage migration succeeded', felog_1.LogLevel.INFO, {});
        };
        /**
         * Storage data migration has failed.
         */
        this.storageMigrationFailed = function (e) {
            _this._send('bg.storageMigration.failure', 'storage migration failed', felog_1.LogLevel.ERROR, {
                message: e && e.message
            });
        };
        /**
         * Action: Show card
         * When: User hovered a match in the editor
         */
        this.cardShowAction = function () {
            _this._send('cs.editor.card.show', 'show card action', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Hide card
         * When: Triggered by user interaction (click, scroll, etc)
         */
        this.cardHideAction = function () {
            _this._send('cs.editor.card.hide', 'hide card action', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Replacement in the card was clicked
         * When: User click on some replacement in the cards
         */
        this.cardReplacementAction = function () {
            _this._send('cs.editor.card.replacement', 'click on the replacement in the card', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Add word to the dictionary
         * When: Click on the add to dictionary button in the card
         */
        this.cardAddToDictAction = function () {
            _this._send('cs.editor.card.addToDict', 'click add to dictionary button in the card', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Card was ignored
         * When: Click on the ignore button in the card
         */
        this.cardIgnoreAction = function () {
            _this._send('cs.editor.card.ignore', 'click ignore button in the card', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Show synonymous card
         * When: User hovered a match in the editor
         */
        this.synonymCardShowAction = function (notFoundCard) {
            _this._send('cs.editor.synonym.show', 'show synonymous card action', felog_1.LogLevel.INFO, { notFoundCard: notFoundCard });
        };
        /**
         * Action: Hide synonymus card
         * When: Was triggered by user interaction (click, scroll, etc)
         */
        this.synonymCardHideAction = function (notFoundCard) {
            _this._send('cs.editor.synonym.hide', 'hide synonymous card action', felog_1.LogLevel.INFO, { notFoundCard: notFoundCard });
        };
        /**
         * Action: Replacement in the synonymous was clicked
         * When: Click on some replacement in the synonym card
         */
        this.synonymReplacementAction = function () {
            _this._send('cs.editor.synonym.replacement', 'click on the replacement in the synonym', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Show dictionary card
         * When: Double click on the word on the page
         */
        this.dictCardShowAction = function () {
            _this._send('cs.editor.dict.show', 'show dictionary card action', felog_1.LogLevel.INFO);
        };
        /**
         * Action: Hide dictionary card
         * When: Was triggered by user interaction (click, scroll, etc)
         */
        this.dictCardHideAction = function () {
            _this._send('cs.editor.dict.hide', 'hide dictionary card action', felog_1.LogLevel.INFO);
        };
    }

    (0, _createClass3.default)(Telemetry, [{
        key: "_send",
        value: function _send(logger, message, level, extra) {
            var dataString = void 0;
            // @TODO instead of this, should use approach from here:
            // tslint:disable-next-line max-line-length
            // https://github.com/grammarly/denali/blob/c5d321e8292536876bd1181fb0039a096c48712a/lib/client/telemetry/editor_telemetry.ts#L425
            try {
                dataString = (0, _stringify2.default)(extra);
            } catch (err) {
                dataString = "Failed to stringify event properties: '" + err + "', '" + (err && err.message) + "'";
                // log this to console for now. @TODO could make sense to remove when we have proper
                // logging.
                // tslint:disable-next-line no-console
                console.warn(dataString, "for " + message + "@" + logger);
            }
            try {
                this._sendFelog(logger, message, level, extra != null ? { json: dataString } : undefined);
            } catch (err) {
                // log this to console for now. @TODO could make sense to remove when we have proper
                // logging.
                // tslint:disable-next-line no-console
                console.warn("Failed to send felog for " + message + "@" + logger + ": '" + err + "', '" + (err && err.message) + "'");
            }
        }
    }]);
    return Telemetry;
}();

exports.Telemetry = Telemetry;

},{"./felog":191,"babel-runtime/core-js/json/stringify":16,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28}],198:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function tracker() {
    window.tracker = window.tracker || {};
    return window.tracker;
}
exports.tracker = tracker;

},{}],199:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var newConfig_1 = require("./newConfig");
var utmMedium = 'internal';
function getUTMQueryParam(name, value) {
    return name + "=" + encodeURIComponent(value);
}
function getUTMQuery(type, place) {
    /* tslint:disable-next-line:max-line-length */
    return getUTMQueryParam('utm_medium', utmMedium) + "&" + getUTMQueryParam('utm_source', type) + "&" + getUTMQueryParam('utm_campaign', place);
}
function getSignUpURL(type, place) {
    return newConfig_1.URLS.signup + "?" + getUTMQuery(type, place);
}
exports.getSignUpURL = getSignUpURL;
function getUpgradeURL(type, place) {
    return newConfig_1.URLS.upgrade + "?" + getUTMQuery(type, place);
}
exports.getUpgradeURL = getUpgradeURL;
function addParamsToUpgradeURL(url, type, place) {
    return url + "&" + getUTMQuery(type, place);
}
exports.addParamsToUpgradeURL = addParamsToUpgradeURL;

},{"./newConfig":174}],200:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var nch = require("non-crypto-hash");
var newConfig_1 = require("./newConfig");
var newConfig_2 = require("./newConfig");
exports.isTestsMode = newConfig_2.isTestsMode;
exports.getBrowser = newConfig_2.getBrowser;
exports.isBg = newConfig_2.isBg;
exports.isBgOrPopup = newConfig_2.isBgOrPopup;
exports.isSafariSettingsPopup = newConfig_2.isSafariSettingsPopup;
exports.isChrome = newConfig_2.isChrome;
exports.isFF = newConfig_2.isFF;
exports.isPopup = newConfig_2.isPopup;
exports.isSafari = newConfig_2.isSafari;
exports.isEdge = newConfig_2.isEdge;
exports.isSafari8 = newConfig_2.isSafari8;
exports.isWE = newConfig_2.isWE;
exports.isWindows = newConfig_2.isWindows;
function isGrammarlyEmail(email) {
    var isEmailForTests = ['freeeeeeee@grammarly.com', 'premiumuser@grammarly.com'].indexOf(email) !== -1;
    return !isEmailForTests && /^.*@grammarly.com$/.test(email);
}
exports.isGrammarlyEmail = isGrammarlyEmail;
function chromeBgError() {
    return window.chrome && window.chrome.runtime && window.chrome.runtime.lastError;
}
exports.chromeBgError = chromeBgError;
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}
exports.isFunction = isFunction;
// @TODO this is using function for object keys. We should not do that,
// it's not officially supported: https://goo.gl/KMghfP
// Functions actually get converted to a string – means you can get collisions.
//
// Refactor this after all usages have been converted to TS.
function interval(cb, time) {
    var items = interval.items = interval.items || {},
        // tslint:disable-line no-use-before-declare
    item = items[cb]; // should not use cb as key here – illegal
    if (!item && !time) return;
    if (item && !time) {
        clearTimeout(item);
        delete items[cb]; // should not use cb as key here – illegal
        return;
    } else run();
    function run() {
        function _cb() {
            timeout();
            cb();
        }
        function timeout() {
            var tid = setTimeout(_cb, time);
            items[cb] = tid; // should not use cb as key here – illegal
        }
        timeout();
    }
}
exports.interval = interval;
(function (interval) {
    // actually a map of function to number, see comment for interval function
    // for more info
    interval.items = {};
})(interval = exports.interval || (exports.interval = {}));
function cancelInterval(cb) {
    interval(cb);
}
exports.cancelInterval = cancelInterval;
// @TODO possibly redundant export
function s4() {
    return ((1 + Math.random()) * 0x10000 | 0). // tslint:disable-line no-bitwise
    toString(16).substring(1);
}
function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
exports.guid = guid;
// @TODO redundant exports?
function _f() {} // tslint:disable-line function-name
exports._f = _f;
function _F() {
    return true;
} // tslint:disable-line function-name
exports._F = _F;
function bgPageReload() {
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.reload) {
        window.chrome.runtime.reload();
    } else {
        window.location.reload(); // safari
    }
}
exports.bgPageReload = bgPageReload;
function isGmail(doc) {
    if (!doc.location) return;
    // @TODO fix this later. keeping as is to be safe.
    // tslint:disable-next-line triple-equals
    var host = doc.location.host == 'mail.google.com',
        frames = doc.querySelector('iframe#js_frame') && doc.querySelector('iframe#sound_frame');
    return host || frames;
}
exports.isGmail = isGmail;
function isValidEmail(value) {
    // tslint:disable-next-line max-line-length
    return (/^[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'*+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+$/.test(value)
    );
}
exports.isValidEmail = isValidEmail;
function formatNumber(i) {
    return i.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
exports.formatNumber = formatNumber;
// @TODO it probably doesn't have to take a string. keeping as is until
// we rewrite everything to TS.
function declension(value, arr) {
    // @TODO fix this later. keeping as is to be safe.
    // tslint:disable-next-line triple-equals
    return arr[value == 1 ? 0 : 1];
}
exports.declension = declension;
// @TODO seems to be unused AND also broken.
// please remove when possible.
function stub(methods) {
    return _.transform(methods, function (result, m) {
        return result[m] = _f;
    });
}
exports.stub = stub;
function memoize(func,
// @NOTE couldn't type it better. Ideally should have the same
resolver, ttl) {
    var cache = {};
    var memoized = function memoized() {
        var key = '_memoize_' + (resolver ? resolver.apply(this, arguments) : arguments[0]);
        if (window.hasOwnProperty.call(cache, key)) {
            return cache[key];
        } else {
            if (ttl) {
                setTimeout(function () {
                    delete cache[key];
                }, ttl);
            }
            return cache[key] = func.apply(this, arguments);
        }
    };
    // @TODO typing didn't work out this time...
    return memoized;
}
exports.memoize = memoize;
// @TODO what does it do and what is it for?
function syncWait(promise, methods) {
    return (0, _keys2.default)(methods).reduce(function (obj, method) {
        return (
            // @TODO do we really need to do Object.assign every time?
            (0, _assign2.default)({}, obj, (0, _defineProperty3.default)({}, method, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return promise.then(function () {
                    return methods[method].apply(methods, args);
                });
            }))
        );
    }, {});
}
exports.syncWait = syncWait;
function promisify(method) {
    return new _promise2.default(function (resolve) {
        return method(resolve);
    });
}
exports.promisify = promisify;
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomIntInclusive = getRandomIntInclusive;
function delay(ms) {
    return new _promise2.default(function (resolve) {
        return setTimeout(resolve, ms);
    });
}
exports.delay = delay;
// decided to use simple function  instead heavy moment.js
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function formatDate(dateStr) {
    if (!dateStr) return;
    var date = new Date(dateStr);
    if (date.toString() === 'Invalid Date') return;
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}
exports.formatDate = formatDate;
// @TODO do we have to do it this way? why not use class syntax, extend?
// why do we even need this?
function createClass(getPrototype) {
    var _class = function _class() {};
    _class.prototype = getPrototype();
    return _class;
}
exports.createClass = createClass;
/**
 * Compare two versions of extension. Version format x.x.x
 * @param {string} v1 first version to compare
 * @param {string} v2 second version to compare
 * @example
 * // returns 1
 * versionComparator('2.0.0', '0.0.9')
 * @example
 * // returns 0
 * versionComparator('2.0.0', '2.0.0')
 * @example
 * // returns -1
 * versionComparator('1.0.0', '2.0.0')
 * @returns {Number} Returns 1, 0 or -1
 */
function versionComparator() {
    var v1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var v2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    function splitToArray(str) {
        return str.split('.').map(function (el) {
            return Number(el) || 0;
        });
    }
    var v1arr = splitToArray(v1),
        v2arr = splitToArray(v2),
        postfix = Array(Math.abs(v1arr.length - v2arr.length)).fill(0);
    v1arr.length > v2arr.length ? v2arr.push.apply(v2arr, (0, _toConsumableArray3.default)(postfix)) : v1arr.push.apply(v1arr, (0, _toConsumableArray3.default)(postfix));
    if (v1arr.every(function (v, i) {
        return v === v2arr[i];
    })) return 0;
    // tslint:disable-next-line prefer-const
    for (var i = 0, len = v1arr.length; i < len; i++) {
        if (v1arr[i] > v2arr[i]) {
            return 1;
        } else if (v1arr[i] < v2arr[i]) {
            return -1;
        }
    }
    return -1;
}
exports.versionComparator = versionComparator;
function isBgAlive() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (newConfig_1.isWE()) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return", null);

                    case 2:
                        _context.prev = 2;
                        _context.next = 5;
                        return _promise2.default.race([
                        // @TODO can we come up with a more precise type for this response?
                        new _promise2.default(function (resolve) {
                            return window.chrome.runtime.sendMessage('ping', resolve);
                        }), delay(10000).then(function (_) {
                            return 'timeouted';
                        })]);

                    case 5:
                        return _context.abrupt("return", _context.sent);

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context["catch"](2);
                        return _context.abrupt("return", 'orphaned');

                    case 11:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[2, 8]]);
    }));
}
exports.isBgAlive = isBgAlive;
function asyncCall(cb) {
    var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    setTimeout(cb, time);
}
exports.asyncCall = asyncCall;
function createChannel() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$buffered = _ref.buffered,
        buffered = _ref$buffered === undefined ? true : _ref$buffered;

    var messageQueue = [];
    var resolveQueue = [];
    function put(msg) {
        // anyone waiting for a message ?
        if (resolveQueue.length > 0) {
            // deliver the message to the oldest one waiting (First In First Out)
            // assert nextResolve is not undefined because resolveQueue.length > 0
            var nextResolve = resolveQueue.shift();
            nextResolve(msg);
        } else {
            // no one is waiting ? queue the event
            if (buffered) {
                messageQueue.push(msg);
            } else {
                messageQueue[0] = msg;
            }
        }
    }
    // returns a Promise resolved with the next message
    function take() {
        // do we have queued messages ?
        if (messageQueue.length) {
            // deliver the oldest queued message
            return _promise2.default.resolve(messageQueue.shift());
        } else {
            // no queued messages ? queue the taker until a message arrives
            return new _promise2.default(function (resolve) {
                return resolveQueue.push(resolve);
            });
        }
    }
    return {
        take: take,
        put: put
    };
}
exports.createChannel = createChannel;
function normalizedHashCode(str) {
    var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

    if (!str) return NaN;
    var algo = nch.createHash('superfasthash');
    return parseInt(algo.hash(str), 16) % base;
}
exports.normalizedHashCode = normalizedHashCode;
function keyCode(event) {
    return event.which || event.charCode || event.keyCode || 0;
}
exports.keyCode = keyCode;
exports.SECOND = 1000;
exports.MINUTE = 60 * exports.SECOND;
exports.HOUR = 60 * exports.MINUTE;
exports.DAY = 24 * exports.HOUR;
exports.ESC_KEY = 27;
exports.ENTER_KEY = 13;
exports.pastDays = function (date) {
    return Math.round(Math.abs(+new Date() - +new Date(date)) / exports.DAY);
};
// get random local time between 3-4 AM
function getNextPingDate() {
    var now = new Date();
    if (now.getHours() > 2) {
        now.setDate(now.getDate() + 1);
    }
    now.setHours(3);
    now.setMinutes(Math.floor(Math.random() * 60));
    return now.getTime();
}
exports.getNextPingDate = getNextPingDate;
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;

},{"./newConfig":174,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/toConsumableArray":33,"babel-runtime/regenerator":35,"lodash":"lodash","non-crypto-hash":"non-crypto-hash"}],201:[function(require,module,exports){
"use strict";

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
function flatMap(f, xs) {
    var _ref;

    return (_ref = []).concat.apply(_ref, (0, _toConsumableArray3.default)(xs.map(f)));
}
exports.flatMap = flatMap;
function scan(f, seed, xs) {
    var r = [seed];
    var acc = seed;
    for (var i = 0; i < xs.length; i++) {
        acc = f(acc, xs[i]);
        r.push(acc);
    }
    return r;
}
exports.scan = scan;
function maximum(xs) {
    return xs.reduce(function (max, x) {
        return x > max ? x : max;
    }, xs[0]);
}
exports.maximum = maximum;
function maximumBy(xs, f) {
    return xs.length === 0 ? undefined : xs.reduce(function (acc, x) {
        var y = f(x);
        return y > acc[1] ? [x, y] : acc;
    }, [xs[0], f(xs[0])])[0];
}
exports.maximumBy = maximumBy;
function reverse(xs) {
    return xs.slice().reverse();
}
exports.reverse = reverse;
function partition(f, xs) {
    var ys = [];
    var zs = [];
    var j = 0,
        k = 0;
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i])) ys[j++] = xs[i];else zs[k++] = xs[i];
    }return [ys, zs];
}
exports.partition = partition;
function chunkBySize(size, xs) {
    if (size < 1) throw new Error('Invalid chunk size, expected > 0');
    if (xs.length === 0) return [[]];
    var result = [];
    for (var x = 0; x < Math.ceil(xs.length / size); x++) {
        result.push(xs.slice(x * size, (x + 1) * size));
    }return result;
}
exports.chunkBySize = chunkBySize;
function unfold(f, seed) {
    var r = [];
    var res = f(seed);
    while (res !== undefined) {
        r.push(res[0]);
        res = f(res[1]);
    }
    return r;
}
exports.unfold = unfold;
function range(arg1, arg2) {
    return arg2 !== undefined ? (0, _from2.default)(Array(arg2 - arg1), function (_, i) {
        return i + arg1;
    }) : (0, _from2.default)(Array(arg1), function (_, i) {
        return i;
    });
}
exports.range = range;

},{"babel-runtime/core-js/array/from":13,"babel-runtime/helpers/toConsumableArray":33}],202:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });

var AssertionError = function (_Error) {
    (0, _inherits3.default)(AssertionError, _Error);

    function AssertionError(msg) {
        (0, _classCallCheck3.default)(this, AssertionError);
        return (0, _possibleConstructorReturn3.default)(this, (AssertionError.__proto__ || (0, _getPrototypeOf2.default)(AssertionError)).call(this, "Assertion failed: " + (msg ? typeof msg === 'string' ? msg : msg() : '(unnamed)')));
    }

    return AssertionError;
}(Error);

exports.AssertionError = AssertionError;
function assert(cond, msg) {
    if (!cond) throw new AssertionError(msg);
}
exports.assert = assert;
function assertNonNull(value, name) {
    if (value == null) throw new AssertionError(function () {
        return name ? "Expected " + name + " to be non-null" : 'Expected non-null';
    });
    return value;
}
exports.assertNonNull = assertNonNull;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31}],203:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("./assert");
exports.assert = assert_1.assert;
exports.assertNonNull = assert_1.assertNonNull;
exports.AssertionError = assert_1.AssertionError;
var promise_1 = require("./promise");
exports.SafePromise = promise_1.SafePromise;
var Arr = require("./array");
exports.Arr = Arr;
var Obj = require("./object");
exports.Obj = Obj;

},{"./array":201,"./assert":202,"./object":204,"./promise":205}],204:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
function map(f, o) {
    var r = {};
    (0, _keys2.default)(o).forEach(function (k) {
        return r[k] = f(k, o[k]);
    });
    return r;
}
exports.map = map;
function filter(f, o) {
    var r = {};
    (0, _keys2.default)(o).forEach(function (k) {
        if (f(k, o[k])) r[k] = o[k];
    });
    return r;
}
exports.filter = filter;
function values(o) {
    return (0, _keys2.default)(o).map(function (k) {
        return o[k];
    });
}
exports.values = values;
function pairs(o) {
    return (0, _keys2.default)(o).map(function (k) {
        return [k, o[k]];
    });
}
exports.pairs = pairs;

},{"babel-runtime/core-js/object/keys":22}],205:[function(require,module,exports){
"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This adds a slightly more type safe Promise creation function.
 *
 * @example
 * import { SafePromise } 'stdlib'
 *
 * const empty: Promise<void> = SafePromise.create(r => r())
 * const withValue: Promise<number> = SafePromise.create<number>(r => r(5))
 */
// tslint:disable no-unused-vars
var SafePromise;
(function (SafePromise) {
    function create(run) {
        return new _promise2.default(run);
    }
    SafePromise.create = create;
    function createCompletionSource() {
        var res = void 0;
        var rej = void 0;
        var p = new _promise2.default(function (res_, rej_) {
            res = res_;
            rej = rej_;
        });
        return {
            promise: p,
            resolve: function resolve(v) {
                res(v);
            },
            reject: function reject(err) {
                rej(err);
            }
        };
    }
    SafePromise.createCompletionSource = createCompletionSource;
    function sync(run) {
        return create(function (r, _) {
            return r(run());
        });
    }
    SafePromise.sync = sync;
})(SafePromise = exports.SafePromise || (exports.SafePromise = {}));

},{"babel-runtime/core-js/promise":24}],206:[function(require,module,exports){
"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var pget = function pget(prop, preferences) {
    return __awaiter(undefined, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var value;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return preferences.get(prop);

                    case 3:
                        value = _context.sent;

                        if (!(value === 'undefined')) {
                            _context.next = 8;
                            break;
                        }

                        return _context.abrupt("return", undefined);

                    case 8:
                        return _context.abrupt("return", value && JSON.parse(value));

                    case 9:
                        _context.next = 19;
                        break;

                    case 11:
                        _context.prev = 11;
                        _context.t0 = _context["catch"](0);

                        if (!(_context.t0 && _context.t0.toString().includes('SyntaxError'))) {
                            _context.next = 18;
                            break;
                        }

                        preferences.remove(prop);
                        throw new Error("'" + prop + "' has unparseable value, removing");

                    case 18:
                        throw _context.t0;

                    case 19:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 11]]);
    }));
};

var PrefsImpl = function PrefsImpl(_api) {
    var _this = this;

    (0, _classCallCheck3.default)(this, PrefsImpl);

    this._api = _api;
    this.get = function (props) {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
            var _this2 = this;

            var isArray, result, values;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            isArray = Array.isArray(props);
                            result = void 0;
                            _context2.prev = 2;

                            if (!isArray) {
                                _context2.next = 11;
                                break;
                            }

                            props = props;
                            _context2.next = 7;
                            return _promise2.default.all(props.map(function (prop) {
                                return pget(prop, _this2._api);
                            }));

                        case 7:
                            values = _context2.sent;

                            result = props.reduce(function (obj, prop, i) {
                                return (0, _assign2.default)(obj, (0, _defineProperty3.default)({}, prop, values[i]));
                            }, {});
                            _context2.next = 15;
                            break;

                        case 11:
                            props = props;
                            _context2.next = 14;
                            return pget(props, this._api);

                        case 14:
                            result = _context2.sent;

                        case 15:
                            _context2.next = 21;
                            break;

                        case 17:
                            _context2.prev = 17;
                            _context2.t0 = _context2["catch"](2);

                            if (isArray) result = {};
                            // tslint:disable-next-line no-console
                            console.warn('prefs get error:', _context2.t0);

                        case 21:
                            return _context2.abrupt("return", result);

                        case 22:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[2, 17]]);
        }));
    };
    this.set = function (name, value) {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
            var _this3 = this;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(name !== null && (typeof name === "undefined" ? "undefined" : (0, _typeof3.default)(name)) === 'object')) {
                                _context3.next = 5;
                                break;
                            }

                            _context3.next = 3;
                            return _promise2.default.all((0, _keys2.default)(name).map(function (key) {
                                return _this3.set(key, name[key]);
                            }));

                        case 3:
                            _context3.next = 14;
                            break;

                        case 5:
                            _context3.prev = 5;

                            if (value === undefined) {
                                value = 'undefined';
                            } else {
                                value = (0, _stringify2.default)(value);
                            }
                            _context3.next = 9;
                            return this._api.set(name, value);

                        case 9:
                            _context3.next = 14;
                            break;

                        case 11:
                            _context3.prev = 11;
                            _context3.t0 = _context3["catch"](5);

                            console.warn('prefs set error', _context3.t0); // tslint:disable-line no-console

                        case 14:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[5, 11]]);
        }));
    };
    this.all = function () {
        return __awaiter(_this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
            var prefs, key, v;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return this._api.getAll();

                        case 2:
                            prefs = _context4.sent;

                            for (key in prefs) {
                                if (prefs[key] === 'undefined') {
                                    prefs[key] = undefined;
                                } else {
                                    try {
                                        v = prefs[key];

                                        prefs[key] = v && JSON.parse(v);
                                    } catch (e) {}
                                }
                            }
                            return _context4.abrupt("return", prefs);

                        case 5:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));
    };
    this.remove = function (key) {
        try {
            return _this._api.remove(key);
        } catch (e) {
            // tslint:disable-next-line no-console
            console.warn('prefs remove error', e);
            return _promise2.default.resolve();
        }
    };
    this.clearAll = function () {
        try {
            return _this._api.removeAll().catch(function (e) {
                return console.warn('prefs clearAll error', e);
            });
        } catch (e) {
            // tslint:disable-next-line no-console
            console.warn('prefs clearAll error', e);
            return _promise2.default.resolve();
        }
    };
};

exports.PrefsImpl = PrefsImpl;

},{"babel-runtime/core-js/json/stringify":16,"babel-runtime/core-js/object/assign":17,"babel-runtime/core-js/object/keys":22,"babel-runtime/core-js/promise":24,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/typeof":34,"babel-runtime/regenerator":35}],207:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var userActions = require("./user/actions");
var settingsActions = require("./settings/actions");
var connectionActions = require("./connection/actions");
exports.pureActions = (0, _assign2.default)({}, userActions, connectionActions, settingsActions);

},{"./connection/actions":208,"./settings/actions":210,"./user/actions":214,"babel-runtime/core-js/object/assign":17}],208:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.t = {
    UPDATE_CONNECTION: 'connection/UPDATE_CONNECTION',
    ONLINE_STATE: 'connection/ONLINE_STATE'
};
function updateConnection(data) {
    return {
        type: exports.t.UPDATE_CONNECTION,
        data: data
    };
}
exports.updateConnection = updateConnection;
function onlineConnection(online) {
    return {
        type: exports.t.ONLINE_STATE,
        online: online
    };
}
exports.onlineConnection = onlineConnection;

},{}],209:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("./actions");
exports.defaultConnection = {
    networkOffline: !window.navigator.onLine,
    cookiesDisabled: navigator.cookieEnabled === false,
    online: true
};
function connectionReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : exports.defaultConnection;
    var _ref = arguments[1];
    var type = _ref.type,
        data = _ref.data,
        online = _ref.online;

    switch (type) {
        case actions_1.t.ONLINE_STATE:
            return (0, _assign2.default)({}, state, { online: online });
        case actions_1.t.UPDATE_CONNECTION:
            return (0, _assign2.default)({}, state, data);
        default:
            return state;
    }
}
exports.connectionReducer = connectionReducer;

},{"./actions":208,"babel-runtime/core-js/object/assign":17}],210:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.t = {
    SETTINGS_INITIAL: 'settings/SETTINGS_INITIAL',
    TOGGLE_DEFS: 'settings/TOGGLE_DEFS',
    TOGGLE_SITE: 'settings/TOGGLE_SITE',
    TOGGLE_FIELD: 'settings/TOGGLE_FIELD',
    TOGGLE_POPUP: 'settings/TOGGLE_POPUP',
    SHOW_NEWS: 'settings/SHOW_NEWS',
    SEEN_NEWS: 'settings/SEEN_NEWS',
    SEEN_REFERRALS: 'settings/SEEN_REFERRALS',
    CLICK_REFERRALS: 'settings/CLICK_REFERRALS',
    SHOW_ONBOARDING: 'settings/SHOW_ONBOARDING',
    SEEN_ONBOARDING: 'settings/SEEN_ONBOARDING',
    SET_DAPI_PROP: 'settings/SET_DAPI_PROP',
    CHANGE_WEAK_DIALECT: 'settings/CHANGE_WEAK_DIALECT',
    CHANGE_STRONG_DIALECT: 'settings/CHANGE_STRONG_DIALECT',
    SAVE_ANONYMOUS_PROPERTIES: 'settings/SAVE_ANONYMOUS_PROPERTIES',
    ENABLE_EMAIL_FEEDBACK: 'settings/ENABLE_EMAIL_FEEDBACK',
    SAVE_FEEDBACK_DATA: 'settings/SAVE_FEEDBACK_DATA',
    SEEN_EMAIL_PERCEPTION_POPUP: 'settings/EMAIL_PERCEPTION_POPUP_SEEN'
};
exports.DAPI_ACTIONS = [exports.t.CHANGE_WEAK_DIALECT, exports.t.CHANGE_STRONG_DIALECT];
// that actions trigger sync extensionSettings to prefs
exports.CACHED_ACTIONS = [exports.t.TOGGLE_DEFS, exports.t.TOGGLE_SITE, exports.t.TOGGLE_FIELD, exports.t.SEEN_NEWS, exports.t.SEEN_REFERRALS, exports.t.CLICK_REFERRALS, exports.t.SHOW_ONBOARDING, exports.t.SEEN_ONBOARDING, exports.t.SEEN_EMAIL_PERCEPTION_POPUP];
function setDapiProp(propKey, data) {
    return {
        type: exports.t.SET_DAPI_PROP,
        propKey: propKey,
        data: data
    };
}
exports.setDapiProp = setDapiProp;
function changeWeakDialect(data) {
    return {
        type: exports.t.CHANGE_WEAK_DIALECT,
        data: data
    };
}
exports.changeWeakDialect = changeWeakDialect;
function changeStrongDialect(data) {
    return {
        type: exports.t.CHANGE_STRONG_DIALECT,
        data: data
    };
}
exports.changeStrongDialect = changeStrongDialect;
function initialSettings(data) {
    return {
        type: exports.t.SETTINGS_INITIAL,
        data: data
    };
}
exports.initialSettings = initialSettings;
function toggleDefs(enabledDefs) {
    return {
        type: exports.t.TOGGLE_DEFS,
        enabledDefs: enabledDefs
    };
}
exports.toggleDefs = toggleDefs;
function toggleSite(enabled, domain) {
    return {
        type: exports.t.TOGGLE_SITE,
        domain: domain,
        enabled: enabled
    };
}
exports.toggleSite = toggleSite;
function toggleField(data, domain) {
    return {
        type: exports.t.TOGGLE_FIELD,
        domain: domain,
        data: data
    };
}
exports.toggleField = toggleField;
function seenNews() {
    return {
        type: exports.t.SEEN_NEWS
    };
}
exports.seenNews = seenNews;
function showOnboarding() {
    return {
        type: exports.t.SHOW_ONBOARDING
    };
}
exports.showOnboarding = showOnboarding;
function seenOnboarding() {
    return {
        type: exports.t.SEEN_ONBOARDING
    };
}
exports.seenOnboarding = seenOnboarding;
function showNews(showNews) {
    return {
        type: exports.t.SHOW_NEWS,
        showNews: showNews
    };
}
exports.showNews = showNews;
function seenReferrals() {
    return {
        type: exports.t.SEEN_REFERRALS
    };
}
exports.seenReferrals = seenReferrals;
function clickReferrals() {
    return {
        type: exports.t.CLICK_REFERRALS
    };
}
exports.clickReferrals = clickReferrals;
function togglePopup(isPopupDisabled) {
    return {
        type: exports.t.TOGGLE_POPUP,
        isPopupDisabled: isPopupDisabled
    };
}
exports.togglePopup = togglePopup;
function enableEmailFeedback(domain) {
    return {
        type: exports.t.ENABLE_EMAIL_FEEDBACK,
        domain: domain
    };
}
exports.enableEmailFeedback = enableEmailFeedback;
function saveAnonymousProps(props) {
    return {
        type: exports.t.SAVE_ANONYMOUS_PROPERTIES,
        props: props
    };
}
exports.saveAnonymousProps = saveAnonymousProps;
function seenEmailPerceptionPopup(seenEmailPerceptionPopupDate) {
    return {
        type: exports.t.SEEN_EMAIL_PERCEPTION_POPUP,
        seenEmailPerceptionPopupDate: seenEmailPerceptionPopupDate
    };
}
exports.seenEmailPerceptionPopup = seenEmailPerceptionPopup;
function saveFeedbackData(subject, docId) {
    return {
        type: exports.t.SAVE_FEEDBACK_DATA,
        subject: subject,
        docId: docId
    };
}
exports.saveFeedbackData = saveFeedbackData;

},{}],211:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("lib/config");
var actions_1 = require("./actions");
function settingsReducer() {
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _ref = arguments[1];
    var type = _ref.type,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data,
        domain = _ref.domain,
        enabledDefs = _ref.enabledDefs,
        enabled = _ref.enabled,
        showNews = _ref.showNews,
        isPopupDisabled = _ref.isPopupDisabled,
        seenEmailPerceptionPopupDate = _ref.seenEmailPerceptionPopupDate,
        propKey = _ref.propKey;

    var domainSetting = settings[domain] || {};
    switch (type) {
        case actions_1.t.SETTINGS_INITIAL:
            return (0, _assign2.default)({}, settings, data);
        case actions_1.t.TOGGLE_DEFS:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { enabledDefs: enabledDefs })
            });
        case actions_1.t.TOGGLE_SITE:
            return (0, _assign2.default)({}, settings, (0, _defineProperty3.default)({}, domain, (0, _assign2.default)({}, domainSetting, { enabled: enabled })));
        case actions_1.t.TOGGLE_FIELD:
            return (0, _assign2.default)({}, settings, (0, _defineProperty3.default)({}, domain, (0, _assign2.default)({}, settings[domain], {
                disabledFields: (0, _assign2.default)({}, domainSetting.disabledFields, data)
            })));
        case actions_1.t.ENABLE_EMAIL_FEEDBACK:
            return (0, _assign2.default)({}, settings, (0, _defineProperty3.default)({}, domain, (0, _assign2.default)({}, settings[domain], { emailFeedbackEnabled: true })));
        case actions_1.t.SHOW_NEWS:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { showNews: showNews })
            });
        case actions_1.t.SHOW_ONBOARDING:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { showOnboarding: true })
            });
        case actions_1.t.SEEN_ONBOARDING:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { showOnboarding: false })
            });
        case actions_1.t.SEEN_EMAIL_PERCEPTION_POPUP:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { seenEmailPerceptionPopupDate: seenEmailPerceptionPopupDate })
            });
        case actions_1.t.SEEN_NEWS:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { seenNewsVersion: config_1.newsId })
            });
        case actions_1.t.TOGGLE_POPUP:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { isPopupDisabled: isPopupDisabled })
            });
        case actions_1.t.SEEN_REFERRALS:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { referralNewsBadge: true })
            });
        case actions_1.t.CLICK_REFERRALS:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, { referralWasClicked: true })
            });
        case actions_1.t.SET_DAPI_PROP:
            return (0, _assign2.default)({}, settings, {
                common: (0, _assign2.default)({}, settings.common, (0, _defineProperty3.default)({}, propKey, data))
            });
        default:
            return settings;
    }
}
exports.settingsReducer = settingsReducer;

},{"./actions":210,"babel-runtime/core-js/object/assign":17,"babel-runtime/helpers/defineProperty":29,"lib/config":169}],212:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.t = {
    SET_ACTIVE_TAB: 'tabs/SET_ACTIVE_TAB'
};
function setActiveTab(data) {
    return {
        type: exports.t.SET_ACTIVE_TAB,
        data: data
    };
}
exports.setActiveTab = setActiveTab;

},{}],213:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("./actions");
function tabsReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _ref = arguments[1];
    var type = _ref.type,
        data = _ref.data;

    switch (type) {
        case actions_1.t.SET_ACTIVE_TAB:
            return (0, _assign2.default)({}, state, { active: data });
        default:
            return state;
    }
}
exports.tabsReducer = tabsReducer;

},{"./actions":212,"babel-runtime/core-js/object/assign":17}],214:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.t = {
    // fully refresh user session in store
    SET_USER: 'user/SET_USER',
    // fully refresh user settings in store
    SET_SETTINGS: 'user/SET_SETTINGS',
    // invalidate user session and update it from auth
    SESSION_INVALIDATE: 'user/SESSION_INVALIDATE',
    // increase user fixed errors
    INC_FIXED: 'user/INC_FIXED'
};
// @TODO types are not precise
function setUser(data) {
    return {
        type: exports.t.SET_USER,
        data: data
    };
}
exports.setUser = setUser;
// @TODO types are not precise
function setSettings(data) {
    return {
        type: exports.t.SET_SETTINGS,
        data: data
    };
}
exports.setSettings = setSettings;
// @TODO types are not precise
function sessionInvalidate(reason) {
    return {
        type: exports.t.SESSION_INVALIDATE,
        reason: reason
    };
}
exports.sessionInvalidate = sessionInvalidate;
function incFixed() {
    return {
        type: exports.t.INC_FIXED
    };
}
exports.incFixed = incFixed;

},{}],215:[function(require,module,exports){
"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("./actions");
exports.defaultUser = {
    anonymous: true,
    premium: false
};
function userReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : exports.defaultUser;
    var _ref = arguments[1];
    var type = _ref.type,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data;

    switch (type) {
        case actions_1.t.SET_USER:
            return data;
        case actions_1.t.SET_SETTINGS:
            return (0, _assign2.default)({}, state, { settings: data });
        case actions_1.t.INC_FIXED:
            /*eslint-disable camelcase*/
            var fixed_errors = state.fixed_errors + 1;
            return (0, _assign2.default)({}, state, { fixed_errors: fixed_errors });
        /*eslint-enable camelcase*/
        default:
            return state;
    }
}
exports.userReducer = userReducer;

},{"./actions":214,"babel-runtime/core-js/object/assign":17}],216:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var createLogger = require("redux-logger");
var redux_1 = require("redux");
var redux_saga_1 = require("redux-saga");
var reducer_1 = require("./state/connection/reducer");
var reducer_2 = require("./state/settings/reducer");
var reducer_3 = require("./state/user/reducer");
var reducer_4 = require("./state/tabs/reducer");
// Not ported imports:
var config_1 = require("lib/config");
var actions_1 = require("./state/actions");
var actions_2 = require("./state/actions");
exports.pureActions = actions_2.pureActions;
var effects_1 = require("redux-saga/effects");
var page_config_1 = require("lib/page-config");

var AuthSagaRunners = function AuthSagaRunners(_store, _userSagas) {
    var _this = this;

    (0, _classCallCheck3.default)(this, AuthSagaRunners);

    this._store = _store;
    this._userSagas = _userSagas;
    this.refreshUser = function () {
        var _store2;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return (_store2 = _this._store).runSaga.apply(_store2, [_this._userSagas.externalUpdateUser.bind(_this._userSagas)].concat(args)).done;
    };
    this.signin = function (data) {
        return _this._store.runSaga(_this._userSagas.authRequest.bind(_this._userSagas), config_1.URLS.authSignin, data, 'app_signin_success').done;
    };
    this.signup = function (data) {
        return _this._store.runSaga(_this._userSagas.authRequest.bind(_this._userSagas), config_1.URLS.authSignup, data, 'app_signup_success').done;
    };
};

exports.AuthSagaRunners = AuthSagaRunners;
function configureStore(sagaMiddleware) {
    var reducer = redux_1.combineReducers({
        user: reducer_3.userReducer,
        tabs: reducer_4.tabsReducer,
        settings: reducer_2.settingsReducer,
        connection: reducer_1.connectionReducer
    });
    // @TODO fix any typing
    var logger = createLogger({
        level: 'debug',
        colors: {
            title: function title() {
                return 'green';
            }
        }
    });
    return redux_1.createStore(reducer, {}, redux_1.applyMiddleware(sagaMiddleware, logger));
}

var StoreControllerImpl = function () {
    function StoreControllerImpl(_userSagas, _settingsSagas, _tabsSagas, _connectionSagas) {
        var _this2 = this;

        (0, _classCallCheck3.default)(this, StoreControllerImpl);

        this._userSagas = _userSagas;
        this._settingsSagas = _settingsSagas;
        this._tabsSagas = _tabsSagas;
        this._connectionSagas = _connectionSagas;
        var sagaMiddleware = redux_saga_1.default(_userSagas.start.bind(_userSagas), _settingsSagas.start.bind(_settingsSagas), _connectionSagas.start.bind(_connectionSagas));
        this.store = configureStore(sagaMiddleware);
        if ("yes" !== 'yes') {
            window.store = this.store;
        }
        this.runSaga = sagaMiddleware.run;
        this.initStore = function () {
            return sagaMiddleware.run(_this2._startupFlow.bind(_this2)).done.then(function () {
                _this2.store.subscribe(function () {
                    return sagaMiddleware.run(_tabsSagas.sendStateToTabs.bind(_tabsSagas));
                });
            });
        };
        // TODO fix any typings for action creators
        this.actions = redux_1.bindActionCreators(actions_1.pureActions, this.store.dispatch);
    }

    (0, _createClass3.default)(StoreControllerImpl, [{
        key: "_startupFlow",
        value: _regenerator2.default.mark(function _startupFlow() {
            return _regenerator2.default.wrap(function _startupFlow$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return [
                            // tslint:disable-next-line no-unbound-method
                            effects_1.call([this._settingsSagas, this._settingsSagas.setInitialSettings]),
                            // tslint:disable-next-line no-unbound-method
                            effects_1.call([page_config_1.pageConfig, page_config_1.pageConfig.init]),
                            // tslint:disable-next-line no-unbound-method
                            effects_1.call([this._userSagas, this._userSagas.updateUser], { failoverFromCache: true })];

                        case 2:
                            _context.next = 4;
                            return effects_1.fork([this._connectionSagas, this._connectionSagas.monitorIsIncognito]);

                        case 4:
                            _context.next = 6;
                            return effects_1.call([this._tabsSagas, this._tabsSagas.start]);

                        case 6:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _startupFlow, this);
        })
    }]);
    return StoreControllerImpl;
}();

exports.StoreControllerImpl = StoreControllerImpl;

},{"./state/actions":207,"./state/connection/reducer":209,"./state/settings/reducer":211,"./state/tabs/reducer":213,"./state/user/reducer":215,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/regenerator":35,"lib/config":169,"lib/page-config":179,"redux":"redux","redux-logger":"redux-logger","redux-saga":"redux-saga","redux-saga/effects":141}],217:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var request_1 = require("lib/request");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var Footer = function (_React$Component) {
    (0, _inherits3.default)(Footer, _React$Component);

    function Footer() {
        (0, _classCallCheck3.default)(this, Footer);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Footer.__proto__ || (0, _getPrototypeOf2.default)(Footer)).apply(this, arguments));

        _this.addDocument = function () {
            function requestError(error) {
                console.error('request failed', error);
            }
            var go = function go(docId) {
                var url = config_1.URLS.docs + '/' + docId;
                // @TODO consider adding this metric back to new felog
                // call('statsc.ui.increment', 'activity:extension_popup_goto.footer')
                _this.props.openUrl(url);
            };
            return request_1.fetch(config_1.URLS.docsApi, {
                data: { content: '' },
                method: 'post',
                headers: { 'Content-Type': 'application/json' }
            }).then(function (_ref) {
                var id = _ref.id;
                return go(id);
            }).catch(requestError);
        };
        return _this;
    }

    (0, _createClass3.default)(Footer, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: style.footer },
                React.createElement(
                    "span",
                    { onClick: this.addDocument, className: dom_1.cs(style.new_document, style.footer_btn) },
                    "New Document"
                ),
                React.createElement(
                    "a",
                    { href: config_1.URLS.app, target: "_blank", className: dom_1.cs(style.my_grammarly, style.footer_btn) },
                    "My Grammarly"
                )
            );
        }
    }]);
    return Footer;
}(React.Component);

exports.Footer = Footer;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/config":169,"lib/dom":171,"lib/request":184,"react":"react"}],218:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var util_1 = require("lib/util");
var style = {
  "header": "_0cc899-header",
  "logo": "_0cc899-logo",
  "chrome": "_0cc899-chrome",
  "safari": "_0cc899-safari",
  "firefox": "_0cc899-firefox"
};
exports.Header = function () {
  return React.createElement(
    "div",
    { className: style.header },
    React.createElement("a", { target: "_blank", href: config_1.URLS.app, className: dom_1.cs(style.logo, style[util_1.getBrowser()]) })
  );
};

},{"lib/config":169,"lib/dom":171,"lib/util":200,"react":"react"}],219:[function(require,module,exports){
'use strict';

window.IS_POPUP = document.querySelector('.popup');
if (window.IS_POPUP) {
    require('./popup');
}

},{"./popup":221}],220:[function(require,module,exports){
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_dom_1 = require("react-dom");
var react_redux_1 = require("react-redux");
var dom_1 = require("lib/dom");
var message = require("lib/message");
var tracking_1 = require("lib/tracking");
var signin_1 = require("./signin");
var settings_1 = require("./settings");
var unsupported_1 = require("./unsupported");

var MainView = function (_React$Component) {
    (0, _inherits3.default)(MainView, _React$Component);

    function MainView() {
        (0, _classCallCheck3.default)(this, MainView);
        return (0, _possibleConstructorReturn3.default)(this, (MainView.__proto__ || (0, _getPrototypeOf2.default)(MainView)).apply(this, arguments));
    }

    (0, _createClass3.default)(MainView, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.props.resize();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            this.props.resize({ force: true });
            // Proxy for popup links
            dom_1.on.call(react_dom_1.findDOMNode(this), 'click', function (e) {
                var target = e.target;
                var el = target.nodeName === 'A' ? target : target.parentNode && target.parentNode.nodeName === 'A' ? target.parentNode : null;
                if (el) {
                    e.preventDefault();
                    _this2.processHrefClick(el);
                }
            });
        }
    }, {
        key: "componentWillMount",
        value: function componentWillMount() {
            dom_1.on.call(document, 'popup-open', this.props.resize);
        }
    }, {
        key: "processHrefClick",
        value: function processHrefClick(_ref) {
            var href = _ref.href,
                dataset = _ref.dataset;
            var f = dataset.fire;

            if (f) {
                var args = f.split(', ');
                tracking_1.fire.apply(tracking_1, [args[0]].concat((0, _toConsumableArray3.default)(args.splice(1))));
            } else {
                // @TODO consider adding this metric back to new felog
                // call('statsc.ui.increment', 'activity:extension_popup_goto.main')
            }
            if (href) openUrl(href);
        }
    }, {
        key: "render",
        value: function render() {
            var props = this.props;
            var anonymous = props.user.anonymous,
                config = props.config;
            var enabled = config.enabled,
                servicePage = config.servicePage;

            var component = anonymous ? React.createElement(signin_1.SigninComponent, null) : enabled || servicePage ? React.createElement(settings_1.SettingsComponent, props) : React.createElement(unsupported_1.UnsupportedComponent, props);
            return React.createElement(
                "div",
                null,
                component
            );
        }
    }]);
    return MainView;
}(React.Component);

exports.MainView = MainView;
function closePopup() {
    dom_1.emitDomEvent('close-popup');
}
function updatePopupSize() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        force = _ref2.force;

    dom_1.emitDomEvent('update-window-size', { force: force });
}
function openUrl(url) {
    message.emitBackground('open-url', url);
    closePopup();
}
// @TODO proper store/actions typings.
// This is a high-level component, which renders sub-components.
// We have typings defined in them.
function renderMainView(store, actions) {
    var mapStateToProps = function mapStateToProps(state) {
        return state;
    };
    var mapDispatchToProps = function mapDispatchToProps(_dispatch, _ownProps) {
        return { actions: actions };
    };
    var View = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(MainView);
    react_dom_1.render(React.createElement(
        react_redux_1.Provider,
        { store: store },
        React.createElement(View, { close: closePopup, resize: updatePopupSize, openUrl: openUrl })
    ), document.querySelector('.popup'));
}
exports.renderMainView = renderMainView;

},{"./settings":224,"./signin":230,"./unsupported":232,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"babel-runtime/helpers/toConsumableArray":33,"lib/dom":171,"lib/message":173,"lib/tracking":194,"react":"react","react-dom":"react-dom","react-redux":"react-redux"}],221:[function(require,module,exports){
"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var extension_api_1 = require("extension-api");
extension_api_1.initApi();
var dom_1 = require("lib/dom");
var message = require("lib/message");
var tracking_1 = require("lib/tracking");
var store_mirror_1 = require("lib/store-mirror");
var util_1 = require("lib/util");
var main_view_1 = require("./main-view");
if (!"yes") {
    require('lib/test-api').api();
}
// tslint:disable-next-line no-console
init().catch(function (e) {
    return console.log('EROROR: POPUP INIT', e.message);
});
function init() {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var isInitialized, _store_mirror_1$creat, store, actions;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        isInitialized = false;

                        dom_1.addClass(document.documentElement, util_1.getBrowser());
                        if (util_1.isWindows()) dom_1.addClass(document.documentElement, 'windows');
                        _store_mirror_1$creat = store_mirror_1.createMirrorStore(function (_) {
                            // TODO: find better way to render popup once
                            if (isInitialized) return;
                            isInitialized = true;
                            // @TODO consider adding this metric back to new felog
                            // call('statsc.ui.timing', 'stability:setting_popup.open', new Date() - initTime)
                            show(store, actions);
                        }), store = _store_mirror_1$creat.store, actions = _store_mirror_1$creat.actions;
                        // @TODO Asked Lesha why we need it. Works w/o it.
                        // const data = chrome.extension.getBackgroundPage().__popupState
                        // console.log('>> get bg data', data)
                        // store.dispatch({type: 'store/SYNC', data})

                        message.emitBackground('tab-connected', { tab: 'popup' });
                        util_1.asyncCall(function () {
                            return !isInitialized && tracking_1.logger.settingsPopupTimeout();
                        }, 2000);

                    case 6:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.init = init;
function track(state, actions) {
    var config = state.config,
        user = state.user,
        settings = state.settings;
    var enabled = config.enabled;

    tracking_1.fire('popup-open');
    if (user.anonymous) return;
    if (!enabled) {
        tracking_1.fire('popup-open-on-unsupported');
    } else {
        if (settings.showNews) actions.seenNews();
        if (user.referral) {
            tracking_1.fire('referral-shown', 'menu');
            if (!settings.referralNewsBadge) actions.seenReferrals();
        }
    }
}
exports.track = track;
function show(store, actions) {
    // tslint:disable-next-line no-console
    console.warn('RENDER FROM', store, actions);
    main_view_1.renderMainView(store, actions);
    util_1.isWE() ? track(store.getState(), actions) : document.addEventListener('popup-open', function () {
        track(store.getState(), actions);
        message.emitBackground('tab-connected', { tab: 'popup' });
    });
}

},{"./main-view":220,"babel-runtime/core-js/promise":24,"babel-runtime/regenerator":35,"extension-api":154,"lib/dom":171,"lib/message":173,"lib/store-mirror":186,"lib/test-api":187,"lib/tracking":194,"lib/util":200}],222:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var tracking_1 = require("lib/tracking");
var checkboxStyle = {
    "select_checkbox": "_a7c193-select_checkbox",
    "checkbox": "_a7c193-checkbox",
    "checkbox_check": "_a7c193-checkbox_check",
    "checkbox_check_round": "_a7c193-checkbox_check_round"
};
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var DefsSwitcher = function (_React$Component) {
    (0, _inherits3.default)(DefsSwitcher, _React$Component);

    function DefsSwitcher() {
        (0, _classCallCheck3.default)(this, DefsSwitcher);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DefsSwitcher.__proto__ || (0, _getPrototypeOf2.default)(DefsSwitcher)).apply(this, arguments));

        _this.onEnableDefsClick = function (e) {
            var toggleDefs = _this.props.toggleDefs;

            var enabled = e.target.checked;
            toggleDefs(enabled);
            tracking_1.fire('change-defs', { enabled: enabled });
        };
        return _this;
    }

    (0, _createClass3.default)(DefsSwitcher, [{
        key: "render",
        value: function render() {
            var enabledDefs = this.props.enabledDefs;

            var defsSwitcherCls = dom_1.cs(style.def_switcher, style.line, style.setting_item, enabledDefs ? style.on : style.off);
            return React.createElement(
                "div",
                { className: defsSwitcherCls },
                React.createElement(
                    "label",
                    { className: checkboxStyle.select_checkbox },
                    "Show Definitions and Synonyms ",
                    React.createElement("br", null),
                    "via Double Clicks (All Sites)",
                    React.createElement("input", { className: checkboxStyle.checkbox, onChange: this.onEnableDefsClick, checked: enabledDefs, type: "checkbox" }),
                    React.createElement(
                        "div",
                        { className: checkboxStyle.checkbox_check },
                        React.createElement("div", { className: checkboxStyle.checkbox_check_round })
                    )
                ),
                React.createElement("div", { className: style.short_border })
            );
        }
    }]);
    return DefsSwitcher;
}(React.Component);

exports.DefsSwitcher = DefsSwitcher;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/dom":171,"lib/tracking":194,"react":"react"}],223:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var style = {
    "line": "_177733-line",
    "dialect_switcher": "_177733-dialect_switcher",
    "select": "_177733-select",
    "selectWrap": "_177733-selectWrap"
};
var dom_1 = require("lib/dom");
var tracking_1 = require("lib/tracking");
var AMERICAN_ENGLISH = 'american';
var BRITISH_ENGLISH = 'british';

var DialectLine = function (_React$Component) {
    (0, _inherits3.default)(DialectLine, _React$Component);

    function DialectLine() {
        (0, _classCallCheck3.default)(this, DialectLine);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DialectLine.__proto__ || (0, _getPrototypeOf2.default)(DialectLine)).apply(this, arguments));

        _this.onDialectChange = function (e) {
            var _this$props = _this.props,
                changeStrongDialect = _this$props.changeStrongDialect,
                dialectWeak = _this$props.dialectWeak;

            var dialectStrong = e.target.value;
            changeStrongDialect(dialectStrong);
            tracking_1.fire('change-dialect', { language: dialectStrong, dialectWeak: dialectWeak });
        };
        return _this;
    }

    (0, _createClass3.default)(DialectLine, [{
        key: "render",
        value: function render() {
            var dialect = this.props.dialectStrong || this.props.dialectWeak || AMERICAN_ENGLISH;
            var dialectSwitcherCls = dom_1.cs(style.line, style.dialect_switcher);
            return React.createElement(
                "div",
                { className: dialectSwitcherCls },
                React.createElement(
                    "span",
                    null,
                    "I write in"
                ),
                React.createElement(
                    "div",
                    { className: style.selectWrap },
                    React.createElement(
                        "select",
                        { className: style.select, onChange: this.onDialectChange, value: dialect },
                        React.createElement(
                            "option",
                            { value: AMERICAN_ENGLISH },
                            "American English"
                        ),
                        React.createElement(
                            "option",
                            { value: BRITISH_ENGLISH },
                            "British English"
                        )
                    )
                )
            );
        }
    }]);
    return DialectLine;
}(React.Component);

exports.DialectLine = DialectLine;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/dom":171,"lib/tracking":194,"react":"react"}],224:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var header_1 = require("../header");
var footer_1 = require("../footer");
var news_1 = require("./news");
var settings_content_1 = require("./settings-content");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var SettingsComponent = function (_React$Component) {
    (0, _inherits3.default)(SettingsComponent, _React$Component);

    function SettingsComponent() {
        (0, _classCallCheck3.default)(this, SettingsComponent);
        return (0, _possibleConstructorReturn3.default)(this, (SettingsComponent.__proto__ || (0, _getPrototypeOf2.default)(SettingsComponent)).apply(this, arguments));
    }

    (0, _createClass3.default)(SettingsComponent, [{
        key: "render",
        value: function render() {
            var _dom_1$cs;

            var _props = this.props,
                user = _props.user,
                settings = _props.settings,
                config = _props.config,
                activeTab = _props.activeTab,
                actions = _props.actions,
                openUrl = _props.openUrl;

            var cls = dom_1.cs(style.gr_popup_settings, user.premium ? style.upgraded : style.free, (_dom_1$cs = {}, (0, _defineProperty3.default)(_dom_1$cs, style.not_supported, !config.enabled), (0, _defineProperty3.default)(_dom_1$cs, style.no_fixes, !user.fixed_errors || isNaN(user.fixed_errors)), (0, _defineProperty3.default)(_dom_1$cs, style.show_news, settings.showNews && config.enabled), (0, _defineProperty3.default)(_dom_1$cs, style.has_favicon, !!activeTab.favIconUrl), _dom_1$cs));
            return React.createElement(
                "div",
                { className: cls },
                React.createElement(
                    "div",
                    { className: style.content },
                    React.createElement(header_1.Header, null),
                    React.createElement(news_1.News, { showNews: actions.showNews }),
                    React.createElement(settings_content_1.SettingsContent, { actions: actions, activeTab: activeTab, config: config, settings: settings, user: user }),
                    React.createElement(footer_1.Footer, { openUrl: openUrl })
                )
            );
        }
    }]);
    return SettingsComponent;
}(React.Component);

exports.SettingsComponent = SettingsComponent;

},{"../footer":217,"../header":218,"./news":225,"./settings-content":227,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/dom":171,"react":"react"}],225:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var spark_md5_1 = require("spark-md5");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};

var News = function (_React$Component) {
    (0, _inherits3.default)(News, _React$Component);

    function News() {
        (0, _classCallCheck3.default)(this, News);

        var _this = (0, _possibleConstructorReturn3.default)(this, (News.__proto__ || (0, _getPrototypeOf2.default)(News)).apply(this, arguments));

        _this.closeNews = function () {
            _this.props.showNews(false);
        };
        return _this;
    }

    (0, _createClass3.default)(News, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: dom_1.cs(style.line, style.news) },
                React.createElement("div", { onClick: this.closeNews, className: style.close_news }),
                React.createElement(
                    "div",
                    { className: style.news_content },
                    React.createElement(
                        "h2",
                        null,
                        'What\'s new in this update:'
                    ),
                    React.createElement(
                        "ul",
                        null,
                        config_1.news.map(function (value) {
                            return React.createElement(
                                "li",
                                { key: spark_md5_1.hash(value) },
                                value
                            );
                        })
                    )
                )
            );
        }
    }]);
    return News;
}(React.Component);

exports.News = News;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/config":169,"lib/dom":171,"react":"react","spark-md5":"spark-md5"}],226:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var util_1 = require("lib/util");
var style = {
  "wrap": "_adb6eb-wrap",
  "line": "_adb6eb-line",
  "description": "_adb6eb-description",
  "inviteLink": "_adb6eb-inviteLink",
  "popupLine": "_adb6eb-popupLine",
  "newLabel": "_adb6eb-newLabel",
  "popupLink": "_adb6eb-popupLink"
};

var ReferralLine = function (_React$Component) {
  (0, _inherits3.default)(ReferralLine, _React$Component);

  function ReferralLine() {
    (0, _classCallCheck3.default)(this, ReferralLine);
    return (0, _possibleConstructorReturn3.default)(this, (ReferralLine.__proto__ || (0, _getPrototypeOf2.default)(ReferralLine)).apply(this, arguments));
  }

  (0, _createClass3.default)(ReferralLine, [{
    key: "isRibbonShow",
    value: function isRibbonShow() {
      var _props = this.props,
          extensionInstallDate = _props.extensionInstallDate,
          registrationDate = _props.registrationDate;

      return registrationDate && util_1.pastDays(registrationDate) < 14 || extensionInstallDate && util_1.pastDays(extensionInstallDate) < 7;
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: dom_1.cs('setting_item', style.popupLine) },
          React.createElement("div", { className: "short_border top" }),
          this.isRibbonShow() && React.createElement(
            "span",
            { className: style.newLabel },
            "New"
          ),
          React.createElement(
            "span",
            null,
            "Get Premium for Free"
          ),
          React.createElement(
            "a",
            { href: config_1.URLS.referral, "data-fire": "referral-clicked, menu", target: "_blank", className: style.popupLink },
            "Invite Friends"
          )
        )
      );
    }
  }]);
  return ReferralLine;
}(React.Component);

exports.ReferralLine = ReferralLine;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/config":169,"lib/dom":171,"lib/util":200,"react":"react"}],227:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var summary_1 = require("./summary");
var dialect_line_1 = require("./dialect-line");
var referral_line_1 = require("./referral-line");
var defs_switcher_1 = require("./defs-switcher");
var site_switcher_1 = require("./site-switcher");
exports.SettingsContent = function (props) {
    var actions = props.actions,
        activeTab = props.activeTab,
        config = props.config,
        settings = props.settings,
        user = props.user;

    return React.createElement(
        "div",
        null,
        React.createElement(site_switcher_1.SiteSwitcher, { domain: config.domain, toggleSite: actions.toggleSite, enabledInConfig: config.enabled, enabledInSettings: settings.enabled, favicon: activeTab.favIconUrl }),
        React.createElement(defs_switcher_1.DefsSwitcher, { enabledDefs: settings.enabledDefs, toggleDefs: actions.toggleDefs }),
        React.createElement(dialect_line_1.DialectLine, { changeStrongDialect: actions.changeStrongDialect, dialectStrong: settings.dialectStrong, dialectWeak: settings.dialectWeak }),
        React.createElement(summary_1.Summary, { user: user }),
        user.referral && React.createElement(referral_line_1.ReferralLine, { extensionInstallDate: user.extensionInstallDate, registrationDate: user.registrationDate })
    );
};

},{"./defs-switcher":222,"./dialect-line":223,"./referral-line":226,"./site-switcher":228,"./summary":229,"react":"react"}],228:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var tracking_1 = require("lib/tracking");
var style = {
  "safari": "safari",
  "gr-popup-wrapper": "gr-popup-wrapper",
  "windows": "windows",
  "setting_item": "setting_item",
  "errors": "errors",
  "descr": "descr",
  "thin_text": "thin_text",
  "footer": "footer",
  "gr_popup_settings": "gr_popup_settings",
  "footer_btn": "footer_btn",
  "line": "line",
  "short_border": "short_border",
  "top": "top",
  "show_news": "show_news",
  "news": "news",
  "news_content": "news_content",
  "close_news": "close_news",
  "not_supported": "not_supported",
  "checkbox_check": "checkbox_check",
  "site_switcher": "site_switcher",
  "upgrade": "upgrade",
  "def_switcher": "def_switcher",
  "on": "on",
  "off": "off",
  "upgraded": "upgraded",
  "content": "content",
  "summary": "summary",
  "since": "since",
  "has_favicon": "has_favicon",
  "favicon": "favicon",
  "domain": "domain",
  "no_fixes": "no_fixes",
  "lblCount": "lblCount",
  "upgrade_title": "upgrade_title",
  "my_grammarly": "my_grammarly",
  "new_document": "new_document",
  "unsupported_site": "unsupported_site",
  "unsupported_item": "unsupported_item",
  "unsupported_title": "unsupported_title",
  "domain_in_details": "domain_in_details",
  "unsupported_temporary": "unsupported_temporary",
  "unsupported_permanently": "unsupported_permanently",
  "unsupported_grammarly": "unsupported_grammarly",
  "diamond": "diamond"
};
var checkboxStyle = {
  "select_checkbox": "_a7c193-select_checkbox",
  "checkbox": "_a7c193-checkbox",
  "checkbox_check": "_a7c193-checkbox_check",
  "checkbox_check_round": "_a7c193-checkbox_check_round"
};

var SiteSwitcher = function (_React$Component) {
  (0, _inherits3.default)(SiteSwitcher, _React$Component);

  function SiteSwitcher() {
    (0, _classCallCheck3.default)(this, SiteSwitcher);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SiteSwitcher.__proto__ || (0, _getPrototypeOf2.default)(SiteSwitcher)).apply(this, arguments));

    _this.onEnableGrammarClick = function (e) {
      var _this$props = _this.props,
          toggleSite = _this$props.toggleSite,
          domain = _this$props.domain;

      var enabled = e.target.checked;
      toggleSite(enabled, domain);
      tracking_1.fire('change-grammar', { enabled: enabled, pageDomain: domain });
    };
    return _this;
  }

  (0, _createClass3.default)(SiteSwitcher, [{
    key: "render",
    value: function render() {
      var _props = this.props,
          enabledInConfig = _props.enabledInConfig,
          enabledInSettings = _props.enabledInSettings,
          favicon = _props.favicon,
          domain = _props.domain,
          enabled = enabledInSettings && enabledInConfig,
          disableLabel = !enabledInConfig ? 'Checking is not supported' : 'Check for Grammar and Spelling';

      var siteSwitcherCls = dom_1.cs(style.site_switcher, style.line, style.setting_item, enabled ? style.on : style.off);
      return React.createElement(
        "div",
        { className: siteSwitcherCls },
        React.createElement(
          "label",
          { className: checkboxStyle.select_checkbox },
          disableLabel,
          React.createElement("br", null),
          " ",
          React.createElement(
            "span",
            { className: style.domain },
            React.createElement(
              "span",
              { className: style.thin_text },
              "on"
            ),
            "\xA0",
            React.createElement(
              "span",
              { className: style.favicon },
              React.createElement("img", { width: "16px", height: "16px", src: favicon })
            ),
            domain
          ),
          React.createElement("input", { className: checkboxStyle.checkbox, onChange: this.onEnableGrammarClick, checked: enabled, type: "checkbox" }),
          React.createElement(
            "div",
            { className: dom_1.cs(checkboxStyle.checkbox_check, style.checkbox_check) },
            React.createElement("div", { className: checkboxStyle.checkbox_check_round })
          )
        ),
        React.createElement("div", { className: style.short_border })
      );
    }
  }]);
  return SiteSwitcher;
}(React.Component);

exports.SiteSwitcher = SiteSwitcher;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/dom":171,"lib/tracking":194,"react":"react"}],229:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var url_1 = require("lib/url");
var util_1 = require("lib/util");
var style = {
  "safari": "safari",
  "gr-popup-wrapper": "gr-popup-wrapper",
  "windows": "windows",
  "setting_item": "setting_item",
  "errors": "errors",
  "descr": "descr",
  "thin_text": "thin_text",
  "footer": "footer",
  "gr_popup_settings": "gr_popup_settings",
  "footer_btn": "footer_btn",
  "line": "line",
  "short_border": "short_border",
  "top": "top",
  "show_news": "show_news",
  "news": "news",
  "news_content": "news_content",
  "close_news": "close_news",
  "not_supported": "not_supported",
  "checkbox_check": "checkbox_check",
  "site_switcher": "site_switcher",
  "upgrade": "upgrade",
  "def_switcher": "def_switcher",
  "on": "on",
  "off": "off",
  "upgraded": "upgraded",
  "content": "content",
  "summary": "summary",
  "since": "since",
  "has_favicon": "has_favicon",
  "favicon": "favicon",
  "domain": "domain",
  "no_fixes": "no_fixes",
  "lblCount": "lblCount",
  "upgrade_title": "upgrade_title",
  "my_grammarly": "my_grammarly",
  "new_document": "new_document",
  "unsupported_site": "unsupported_site",
  "unsupported_item": "unsupported_item",
  "unsupported_title": "unsupported_title",
  "domain_in_details": "domain_in_details",
  "unsupported_temporary": "unsupported_temporary",
  "unsupported_permanently": "unsupported_permanently",
  "unsupported_grammarly": "unsupported_grammarly",
  "diamond": "diamond"
};

var Summary = function (_React$Component) {
  (0, _inherits3.default)(Summary, _React$Component);

  function Summary() {
    (0, _classCallCheck3.default)(this, Summary);
    return (0, _possibleConstructorReturn3.default)(this, (Summary.__proto__ || (0, _getPrototypeOf2.default)(Summary)).apply(this, arguments));
  }

  (0, _createClass3.default)(Summary, [{
    key: "render",
    value: function render() {
      var _props$user = this.props.user,
          premium = _props$user.premium,
          registrationDate = _props$user.registrationDate,
          fixedErrors = _props$user['fixed_errors'];

      var errorTypeLbl = premium ? 'critical and advanced' : 'critical';
      var fixed = !fixedErrors || isNaN(fixedErrors) ? 0 : fixedErrors;
      var fixedFormated = util_1.formatNumber(fixed) === '0' ? 'No' : util_1.formatNumber(fixed);
      var lbl = util_1.declension(fixed, ['fix', 'fixes']);
      var date = util_1.formatDate(registrationDate);
      var dateStr = date ? 'since ' + date : '';
      return React.createElement(
        "div",
        { className: dom_1.cs(style.line, style.summary) },
        React.createElement(
          "div",
          { className: style.errors },
          React.createElement(
            "span",
            { className: dom_1.cs(style.count, style.lblCount) },
            fixedFormated
          ),
          React.createElement(
            "span",
            { className: style.descr },
            errorTypeLbl,
            " ",
            React.createElement(
              "span",
              { className: style.errorsLbl },
              lbl
            ),
            " ",
            React.createElement(
              "span",
              { className: style.since },
              dateStr
            )
          )
        ),
        React.createElement(
          "div",
          { className: style.upgrade },
          React.createElement(
            "a",
            { href: url_1.getUpgradeURL('upHook', 'settingsToolbar'), "data-fire": "hook-clicked, settings_toolbar", target: "_blank", className: style.upgrade_title },
            "Go Premium to enable advanced fixes"
          )
        )
      );
    }
  }]);
  return Summary;
}(React.Component);

exports.Summary = Summary;

},{"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/dom":171,"lib/url":199,"lib/util":200,"react":"react"}],230:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var config_1 = require("lib/config");
var url_1 = require("lib/url");
var header_1 = require("./header");
var style = {
  "signin": "_eb0767-signin",
  "banner": "_eb0767-banner",
  "descr": "_eb0767-descr",
  "descr_title": "_eb0767-descr_title",
  "buttons": "_eb0767-buttons",
  "button": "_eb0767-button",
  "auth_button": "_eb0767-auth_button",
  "sign_up": "_eb0767-sign_up",
  "free": "_eb0767-free",
  "footer": "_eb0767-footer",
  "signin_link": "_eb0767-signin_link"
};

var SigninComponent = function (_React$Component) {
  (0, _inherits3.default)(SigninComponent, _React$Component);

  function SigninComponent() {
    (0, _classCallCheck3.default)(this, SigninComponent);
    return (0, _possibleConstructorReturn3.default)(this, (SigninComponent.__proto__ || (0, _getPrototypeOf2.default)(SigninComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(SigninComponent, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: style.signin },
        React.createElement(header_1.Header, null),
        React.createElement(
          "div",
          { className: style.content },
          React.createElement(
            "div",
            { className: style.banner },
            "Grammarly is active, but",
            React.createElement("br", null),
            "key features are missing"
          ),
          React.createElement(
            "div",
            { className: style.descr },
            React.createElement(
              "div",
              { className: style.descr_title },
              "Sign up now to unlock the following:"
            ),
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                "Store your personal dictionary"
              ),
              React.createElement(
                "li",
                null,
                "Save and access your work from any computer"
              ),
              React.createElement(
                "li",
                null,
                "Get weekly writing statistics and tips"
              )
            )
          ),
          React.createElement(
            "div",
            { className: style.buttons },
            React.createElement(
              "a",
              { href: url_1.getSignUpURL('signupHook', 'toolbarMenu'), "data-fire": "login-attempt, settings_toolbar_sign_up", target: "__blank", className: dom_1.cs(style.button, style.auth_button), role: "button" },
              React.createElement(
                "span",
                { className: style.sign_up },
                "Sign Up"
              ),
              React.createElement(
                "span",
                { className: style.free },
                "It's free"
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: style.footer },
          React.createElement(
            "div",
            { className: style.login_text },
            "Already have an account? ",
            React.createElement(
              "a",
              { href: config_1.URLS.signin, "data-fire": "login-attempt, settings_toolbar_sign_in", target: "__blank", className: style.signin_link },
              "Log in"
            )
          )
        )
      );
    }
  }]);
  return SigninComponent;
}(React.Component);

exports.SigninComponent = SigninComponent;

},{"./header":218,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/config":169,"lib/dom":171,"lib/url":199,"react":"react"}],231:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var dom_1 = require("lib/dom");
var style = {
  "safari": "safari",
  "gr-popup-wrapper": "gr-popup-wrapper",
  "windows": "windows",
  "setting_item": "setting_item",
  "errors": "errors",
  "descr": "descr",
  "thin_text": "thin_text",
  "footer": "footer",
  "gr_popup_settings": "gr_popup_settings",
  "footer_btn": "footer_btn",
  "line": "line",
  "short_border": "short_border",
  "top": "top",
  "show_news": "show_news",
  "news": "news",
  "news_content": "news_content",
  "close_news": "close_news",
  "not_supported": "not_supported",
  "checkbox_check": "checkbox_check",
  "site_switcher": "site_switcher",
  "upgrade": "upgrade",
  "def_switcher": "def_switcher",
  "on": "on",
  "off": "off",
  "upgraded": "upgraded",
  "content": "content",
  "summary": "summary",
  "since": "since",
  "has_favicon": "has_favicon",
  "favicon": "favicon",
  "domain": "domain",
  "no_fixes": "no_fixes",
  "lblCount": "lblCount",
  "upgrade_title": "upgrade_title",
  "my_grammarly": "my_grammarly",
  "new_document": "new_document",
  "unsupported_site": "unsupported_site",
  "unsupported_item": "unsupported_item",
  "unsupported_title": "unsupported_title",
  "domain_in_details": "domain_in_details",
  "unsupported_temporary": "unsupported_temporary",
  "unsupported_permanently": "unsupported_permanently",
  "unsupported_grammarly": "unsupported_grammarly",
  "diamond": "diamond"
};
var baseStyle = function baseStyle() {
  var pref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  return dom_1.cs(style.line, style.unsupported_item, pref);
};
exports.DefaultUnsupportedComponent = function (_ref) {
  var favicon = _ref.favicon,
      domain = _ref.domain,
      customTitle = _ref.customTitle;

  var title = customTitle ? React.createElement(
    "span",
    null,
    " ",
    customTitle,
    " Not Supported"
  ) : React.createElement(
    "span",
    null,
    " ",
    React.createElement(
      "span",
      { className: style.domain },
      domain
    ),
    " is Not Supported"
  );
  return React.createElement(
    "div",
    { className: baseStyle() },
    React.createElement(
      "span",
      { className: style.unsupported_title },
      React.createElement(
        "span",
        { className: style.favicon },
        React.createElement("img", { width: "16px", height: "16px", src: favicon })
      ),
      title
    ),
    React.createElement("br", null),
    React.createElement(
      "span",
      null,
      "For technical reasons, we currently do not check your text on this version of\xA0",
      React.createElement(
        "span",
        { className: dom_1.cs(style.domain, style.domain_in_details) },
        domain
      )
    )
  );
};
exports.CustomUnsupportedComponent = function (_ref2) {
  var favicon = _ref2.favicon,
      domain = _ref2.domain,
      customMessage = _ref2.customMessage;
  var message = customMessage.message,
      _customMessage$title = customMessage.title,
      title = _customMessage$title === undefined ? domain : _customMessage$title;

  return React.createElement(
    "div",
    { className: baseStyle(style.unsupported_permanently) },
    React.createElement(
      "span",
      { className: style.unsupported_title },
      React.createElement(
        "span",
        { className: style.favicon },
        React.createElement("img", { width: "16px", height: "16px", src: favicon })
      ),
      " ",
      title,
      " Not Supported"
    ),
    React.createElement("br", null),
    React.createElement("span", { dangerouslySetInnerHTML: { __html: message } })
  );
};
exports.TemporaryUnsupportedComponent = function (_ref3) {
  var favicon = _ref3.favicon,
      domain = _ref3.domain;
  return React.createElement(
    "div",
    { className: baseStyle(style.unsupported_temporary) },
    React.createElement(
      "span",
      { className: style.unsupported_title },
      "Checking Down on ",
      React.createElement(
        "span",
        { className: style.favicon },
        React.createElement("img", { width: "16px", height: "16px", src: favicon })
      ),
      " ",
      React.createElement(
        "span",
        { className: style.domain },
        domain
      )
    ),
    React.createElement("br", null),
    React.createElement(
      "span",
      null,
      "There appears to be a temporary glitch affecting Grammarly's performance on\xA0",
      React.createElement(
        "span",
        { className: dom_1.cs(style.domain, style.domain_in_details) },
        domain
      ),
      ". Functionality should return soon."
    )
  );
};
exports.GrammarlyUnsupportedComponent = function () {
  return React.createElement(
    "div",
    { className: baseStyle(style.unsupported_grammarly) },
    React.createElement("span", { className: "diamond" }),
    React.createElement(
      "span",
      { className: "unsupported_title" },
      "You Can't Improve on Perfection"
    ),
    React.createElement("br", null),
    React.createElement(
      "span",
      null,
      "Naturally, Grammarly's browser extension is disabled while you use the Grammarly Editor."
    )
  );
};

},{"lib/dom":171,"react":"react"}],232:[function(require,module,exports){
"use strict";

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var tracking_1 = require("lib/tracking");
var dom_1 = require("lib/dom");
var defaults_1 = require("lib/page-config/defaults");
var header_1 = require("../header");
var footer_1 = require("../footer");
var components_1 = require("./components");
var style = {
    "safari": "safari",
    "gr-popup-wrapper": "gr-popup-wrapper",
    "windows": "windows",
    "setting_item": "setting_item",
    "errors": "errors",
    "descr": "descr",
    "thin_text": "thin_text",
    "footer": "footer",
    "gr_popup_settings": "gr_popup_settings",
    "footer_btn": "footer_btn",
    "line": "line",
    "short_border": "short_border",
    "top": "top",
    "show_news": "show_news",
    "news": "news",
    "news_content": "news_content",
    "close_news": "close_news",
    "not_supported": "not_supported",
    "checkbox_check": "checkbox_check",
    "site_switcher": "site_switcher",
    "upgrade": "upgrade",
    "def_switcher": "def_switcher",
    "on": "on",
    "off": "off",
    "upgraded": "upgraded",
    "content": "content",
    "summary": "summary",
    "since": "since",
    "has_favicon": "has_favicon",
    "favicon": "favicon",
    "domain": "domain",
    "no_fixes": "no_fixes",
    "lblCount": "lblCount",
    "upgrade_title": "upgrade_title",
    "my_grammarly": "my_grammarly",
    "new_document": "new_document",
    "unsupported_site": "unsupported_site",
    "unsupported_item": "unsupported_item",
    "unsupported_title": "unsupported_title",
    "domain_in_details": "domain_in_details",
    "unsupported_temporary": "unsupported_temporary",
    "unsupported_permanently": "unsupported_permanently",
    "unsupported_grammarly": "unsupported_grammarly",
    "diamond": "diamond"
};
function getUnsupportedComponent(_ref) {
    var domain = _ref.domain,
        favIconUrl = _ref.favIconUrl,
        temporary = _ref.temporary,
        grammarlyEditor = _ref.grammarlyEditor;

    var domainCustomMessage = defaults_1.CUSTOM_UNSUPPORTED_MESSAGES[domain];
    var type = void 0,
        component = void 0;
    if (grammarlyEditor) {
        type = 'grammarly_editor';
        component = React.createElement(components_1.GrammarlyUnsupportedComponent, null);
    } else if (domainCustomMessage && domainCustomMessage.message) {
        type = 'custom_message';
        component = React.createElement(components_1.CustomUnsupportedComponent, { customMessage: domainCustomMessage, favicon: favIconUrl, domain: domain });
    } else if (temporary) {
        type = 'temporary';
        component = React.createElement(components_1.TemporaryUnsupportedComponent, { favicon: favIconUrl, domain: domain });
    } else {
        type = 'default';
        component = React.createElement(components_1.DefaultUnsupportedComponent, { favicon: favIconUrl, domain: domain, customTitle: domainCustomMessage && domainCustomMessage.title });
    }
    tracking_1.logger.settingsUsupportedShow(type);
    return component;
}
exports.getUnsupportedComponent = getUnsupportedComponent;

var UnsupportedComponent = function (_React$Component) {
    (0, _inherits3.default)(UnsupportedComponent, _React$Component);

    function UnsupportedComponent() {
        (0, _classCallCheck3.default)(this, UnsupportedComponent);
        return (0, _possibleConstructorReturn3.default)(this, (UnsupportedComponent.__proto__ || (0, _getPrototypeOf2.default)(UnsupportedComponent)).apply(this, arguments));
    }

    (0, _createClass3.default)(UnsupportedComponent, [{
        key: "render",
        value: function render() {
            var _props = this.props,
                _props$config = _props.config,
                domain = _props$config.domain,
                temporary = _props$config.temporary,
                grammarlyEditor = _props$config.grammarlyEditor,
                favIconUrl = _props.activeTab.favIconUrl;

            var cls = dom_1.cs(style.gr_popup_settings, (0, _defineProperty3.default)({}, style.has_favicon, Boolean(favIconUrl)));
            var component = getUnsupportedComponent({ domain: domain, favIconUrl: favIconUrl, temporary: temporary, grammarlyEditor: grammarlyEditor });
            return React.createElement(
                "div",
                { className: cls },
                React.createElement(
                    "div",
                    { className: dom_1.cs(style.content, style.unsupported_site) },
                    React.createElement(header_1.Header, null),
                    component,
                    React.createElement(footer_1.Footer, { openUrl: this.props.openUrl })
                )
            );
        }
    }]);
    return UnsupportedComponent;
}(React.Component);

exports.UnsupportedComponent = UnsupportedComponent;

},{"../footer":217,"../header":218,"./components":231,"babel-runtime/core-js/object/get-prototype-of":21,"babel-runtime/helpers/classCallCheck":27,"babel-runtime/helpers/createClass":28,"babel-runtime/helpers/defineProperty":29,"babel-runtime/helpers/inherits":30,"babel-runtime/helpers/possibleConstructorReturn":31,"lib/dom":171,"lib/page-config/defaults":178,"lib/tracking":194,"react":"react"}]},{},[147]);
