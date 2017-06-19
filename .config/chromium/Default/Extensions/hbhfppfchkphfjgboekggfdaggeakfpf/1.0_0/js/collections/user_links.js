define([
    'backbone',
    'models/user_link',
    'models/globals'
], function(
    Backbone,
    UserLink,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: UserLink,
        fetch: function(options) {
            var userLinks = JSON.parse(localStorage['user-links'] || '[]');
            userLinks = _.map(userLinks, function(userLink) {
                return new UserLink({
                    title: userLink.title,
                    url: userLink.url
                });
            });
            this.reset(userLinks);
        },
        create: function(attributes, options) {
            this.add(new UserLink({
                title: attributes.title,
                url: attributes.url
            }));
            this.save();
        },
        save: function() {
            localStorage['user-links'] = JSON.stringify(this.map(function(userLink) {
                return {
                    title: userLink.get('title'),
                    url: userLink.get('url')
                };
            }));
        },
        remove: function() {
            Backbone.Collection.prototype.remove.apply(this, arguments);
            this.save();
        }
    });

    var collection = new Collection();
    collection.fetch();
    return collection;
});
