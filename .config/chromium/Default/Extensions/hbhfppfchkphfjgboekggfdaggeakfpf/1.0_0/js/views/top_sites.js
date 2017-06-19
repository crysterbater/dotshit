define([
    'backbone',
    'jquery',
    'text!templates/top-sites.html',
    'views/top_sites_item',
    'views/top_sites_user_link',
    'collections/user_links'
], function(
    Backbone,
    $,
    template,
    TopSitesItemView,
    TopSitesUserLinkView,
    userLinksCollection
) {

    var View = Backbone.View.extend({
        template: _.template(template),
        events: {
            'click .top-sites-user-links-add-button': 'onAddButtonClicked',
            'click .top-sites-user-links-add-close-button': 'onAddButtonClicked',
            'click .top-sites-user-links-add-form-submit': 'onAddSubmitButtonClicked',
            'keyup .top-sites-user-links-add-form-input': 'updateAddSubmitButton'
        },
        getTopSites: function(completion) {
            chrome.topSites.get(function buildPopupDom(mostVisitedURLs) {
                var topSites = [];

                _.each(mostVisitedURLs, function(mostVisitedURL) {
                    try {
                        topSites.push({
                            url: mostVisitedURL.url,
                            title: mostVisitedURL.title
                        });
                    } catch (e) {
                        console.error(e, e.stack);
                    }
                });

                completion(topSites);
            });
        },
        render: function() {
            this.$el.html(this.template());
            this.renderTopSites();
            this.updateAddSubmitButton();
            this.renderUserLinks();

            _.bindAll(this, 'renderUserLinks');

            userLinksCollection.bind('reset', this.renderUserLinks);
            userLinksCollection.bind('add', this.renderUserLinks);
            userLinksCollection.bind('remove', this.renderUserLinks);

            return this;
        },
        renderTopSites: function() {
            var self = this;

            this.getTopSites(function(topSites) {
                _.each(topSites.slice(0, 5), function(topSite) {
                    self.$el.find('.top-sites-items').append(new TopSitesItemView({
                        options: { top_site: topSite }
                    }).render().$el);
                });
            });
        },
        renderUserLinks: function() {
            var $container = this.$el.find('.user-links');

            $container.empty();
            userLinksCollection.each(function(userLink) {
                $container.append(new TopSitesUserLinkView({
                    options: { user_link: userLink }
                }).render().$el);
            });
        },
        updateAddSubmitButton: function() {
            var title = this.$el.find('.top-sites-user-links-add-form [name="title"]').val();
            var url = this.$el.find('.top-sites-user-links-add-form [name="url"]').val();
            var enabled =  title != '' && url != '';

            this.$el.find('.top-sites-user-links-add-form-submit').attr('disabled', !enabled);
        },
        onAddButtonClicked: function(e) {
            e.preventDefault();
            this.$el.find('.top-sites-user-links').toggleClass('adding');
        },
        onAddSubmitButtonClicked: function(e) {
            e.preventDefault();

            var title = this.$el.find('.top-sites-user-links-add-form [name="title"]').val();
            var url = this.$el.find('.top-sites-user-links-add-form [name="url"]').val();

            userLinksCollection.create({
                title: title,
                url: url
            });

            this.$el.find('.top-sites-user-links').removeClass('adding');
            this.$el.find('.top-sites-user-links-add-form [name="title"]').val('');
            this.$el.find('.top-sites-user-links-add-form [name="url"]').val('');
            this.updateAddSubmitButton();
        }
    });

    return View
});