define([
    'backbone',
    'models/provider',
    'models/globals',
    'utils/cookies'
], function(
    Backbone,
    Provider,
    globals,
    cookies
) {

    var Collection = Backbone.Collection.extend({
        model: Provider,
        url: globals['apiBaseUrl'] + 'provider/',
        fetch: function(options) {
            var token = cookies.get('token');

            options = options || {};

            if (token) {
                options = $.extend(true, options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            Backbone.Collection.prototype.fetch.apply(this, [options]);
        },
        isFetchable: function() {
            return false;
        }
    });

    return Collection;
});
