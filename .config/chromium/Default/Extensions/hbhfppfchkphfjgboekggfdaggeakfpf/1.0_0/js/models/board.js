define([
    'backbone',
    'moment',
    'models/globals',
    'utils/cookies'
], function(
    Backbone,
    moment,
    globals,
    cookies
) {

    var Model = Backbone.Model.extend({
        url: function() {
            var url = globals['apiBaseUrl'] + 'board/';

            if (this.get('id')) {
                url += this.escape('id') + '/'
            }

            return url;
        },
        formatDateUpdated: function() {
            return moment(this.escape('date_updated')).format("D MMM");
        },
        sync: function(method, model, options) {
            var token = cookies.get('token');

            options = options || {};

            if (token) {
                options = $.extend(true, options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            return Backbone.Model.prototype.sync.call(this, method, model, options);
        }
    });

    return Model;
});