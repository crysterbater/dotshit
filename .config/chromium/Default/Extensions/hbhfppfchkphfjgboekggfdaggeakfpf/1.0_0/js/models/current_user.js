define([
    'backbone',
    'models/globals',
    'jquery',
    'utils/cookies'
], function(
    Backbone,
    globals,
    $,
    cookies
) {

    var Model = Backbone.Model.extend({
        url: globals['apiBaseUrl'] + 'current-user/',
        authorized: function() {
            return this.get('id') != undefined;
        },
        fetch: function(options) {
            var token = cookies.get('token');

            options = options || {};

            if (token) {
                options = $.extend(true, options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            } else {
                if (options.complete) {
                    options.complete();
                }

                return;
            }

            Backbone.Model.prototype.fetch.apply(this, [options]);
        }
    });

    return new Model();
});