define([
    'backbone',
    'models/globals',
    'utils/cookies'
], function(
    Backbone,
    globals,
    cookies
) {

    var Model = Backbone.Model.extend({
        defaults: {
            current: false,
            has_new: false
        },
        url: function() {
            var url = globals['apiBaseUrl'] + 'provider/';

            if (this.get('id')) {
                url += this.escape('id') + '/'
            }

            return url;
        },
        constructor: function() {
            Backbone.Model.apply(this, arguments);
            this.set('has_new', this.hasNew());
        },
        formatTags: function() {
            return _.map(this.get('tags'), function(tag) {
                return '#' + tag['name'];
            }).join(' ');
        },
        sync: function(method, model, options) {
            if (!_.isUndefined(options.form)) {
                var formData = new FormData(options.form);

                options = $.extend(true, options || {}, {
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                });
            }

            return Backbone.Model.prototype.sync.call(this, method, model, options);
        },
        toggleVote: function() {
            var token = cookies.get('token');
            var model = this;
            var vote = !this.get('voted');
            var votesCount = vote ? model.get('votes_count') + 1 : model.get('votes_count') - 1;
            var url = globals['apiBaseUrl'] + 'provider/' + this.get('id') + '/toggle_vote/';

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                success: function() {
                    model.set('voted', vote);
                    model.set('votes_count', votesCount);
                }
            });
        },
        hasNew: function() {
            var lastFeedItem = this.escape('last_feed_item');

            if (!lastFeedItem) {
                return false;
            }

            var lastReadFeedItems = cookies.get('last_read_feed_items');

            if (!lastReadFeedItems) {
                return true;
            }

            lastReadFeedItems = JSON.parse(lastReadFeedItems);

            if (!lastReadFeedItems) {
                return true;
            }

            var lastReadFeedItem = lastReadFeedItems[this.escape('id')];

            if (!lastReadFeedItem) {
                return true;
            }

            return lastReadFeedItem != lastFeedItem;
        }
    });

    return Model;
});