define([
    'backbone',
    'models/board',
    'models/globals',
    'utils/cookies'
], function(
    Backbone,
    Board,
    globals,
    cookies
) {

    var Collection = Backbone.Collection.extend({
        model: Board,
        url: globals['apiBaseUrl'] + 'board/',
        count: null,
        paginating: true,
        comparator: function(item) {
            return [-item.get('date_updated')]
        },
        parse: function(response) {
            if (this.paginating) {
                this.url = response.next;
                this.count = response.count;
            }
            return response.results;
        },
        isFetchable: function() {
            return this.url != null;
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
            }

            Backbone.Collection.prototype.fetch.apply(this, [options]);
        },
        create: function(attributes, options) {
            var token = cookies.get('token');

            options = options || {};

            if (token) {
                options = $.extend(true, options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            Backbone.Collection.prototype.create.apply(this, [attributes, options]);
        }
    });

    return Collection;
});
