define([
    'backbone',
    'collections/all_providers',
    'models/provider',
    'models/globals',
    'utils/cookies'
], function(
    Backbone,
    AllProvidersCollection,
    Provider,
    globals,
    cookies
) {

    var Collection = AllProvidersCollection.extend({
        currentProviderId: null,
        comparator: function(item) {
            return [item.get('id') != 0, -(item.get('user_active') !== false), -item.get('user_order')]
        },
        initialize: function(models, options) {
            Backbone.Collection.prototype.initialize.apply(this, [models, options]);
            this.on('add', this.onAdd, this);
            this.on('change:user_order', function() { this.sort() }, this);
        },
        onAdd: function() {
            this.updateCurrent();
        },
        setCurrent: function(providerId) {
            this.currentProviderId = providerId;
            this.updateCurrent();
        },
        updateCurrent: function() {
            this.each(function(provider) {
                provider.set('current', false);
            });

            if (this.currentProviderId) {
                var provider = this.findWhere({id: parseInt(this.currentProviderId)});

                if (provider) {
                    provider.set('current', true);
                    this.setRead(provider.escape('id'));
                }
            }
        },
        fetch: function(options) {
            options = $.extend(true, options || {}, {
                data: {
                    active: 'True'
                }
            });

            AllProvidersCollection.prototype.fetch.apply(this, [options]);
        },
        save: function(options) {
            var token = cookies.get('token');

            if (!token) {
                return false;
            }

            var userProviders = this.filter(function(provider) {
                return provider.get('id') != 0;
            }).map(function(provider) {
                return {
                    provider: provider.get('id'),
                    user_order: provider.get('user_order'),
                    user_active: provider.get('user_active')
                };
            });

            var ajaxOptions = {
                url: globals['apiBaseUrl'] + 'user_provider/',
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: {
                    user_providers: JSON.stringify(userProviders)
                }
            };

            var result = Backbone.ajax($.extend(true, ajaxOptions, options));
            this.trigger('save');
            return result
        },
        setRead: function(providerId) {
            var provider = this.findWhere({ id: parseInt(providerId) });

            if (provider) {
                provider.set('has_new', false);

                var lastReadFeedItems = cookies.get('last_read_feed_items');

                if (lastReadFeedItems) {
                    lastReadFeedItems = JSON.parse(lastReadFeedItems);
                } else {
                    lastReadFeedItems = {};
                }

                lastReadFeedItems[provider.escape('id')] = provider.escape('last_feed_item');

                cookies.set('last_read_feed_items', JSON.stringify(lastReadFeedItems));
            }
        }
    });

    return new Collection([{
        'id': 0,
        'name': 'FEED LIST'
    }]);
});
