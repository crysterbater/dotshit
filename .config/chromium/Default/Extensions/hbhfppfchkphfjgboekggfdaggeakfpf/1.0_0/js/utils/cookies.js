define([
    'underscore',
    'jquery',
    'models/globals',
    'urijs/URI',
    'moment',
    'jquery-cookie'
], function(
    _,
    $,
    globals,
    URI,
    moment
) {

    var chromeCookies = null;

    function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
            var pluses = /\+/g;
			s = decodeURIComponent(s.replace(pluses, ' '));
			return s;
		} catch(e) {}
	}

    function cookiesDomain() {
        return URI(globals.baseUrl).hostname();
    }

    return {
        get: function(name) {
            if (chromeCookies) {
                var cookie = _.find(chromeCookies, function(cookie) {
                    return cookie.domain == cookiesDomain() && cookie.name == name;
                });

                if (cookie !== undefined) {
                    return parseCookieValue(cookie.value);
                }
            }

            return $.cookie(name);
        },
        set: function(name, value) {
            if (chrome && chrome.cookies) {
                chrome.cookies.set({
                    url: globals.baseUrl,
                    domain: cookiesDomain(),
                    name: name,
                    value: value,
                    expirationDate: moment().add(365, 'd').toDate().getTime(),
                    path: '/'
                });

                return;
            }

            $.cookie(name, value, { expires: 365, path: '/' });
        },
        remove: function(name) {
            $.removeCookie(name);
        },
        prepare: function(completion) {
            if (chrome && chrome.cookies) {
                chrome.cookies.getAll({}, function(cookies) {
                    chromeCookies = cookies;
                    completion();
                });
            } else {
                completion();
            }
        }
    };
});