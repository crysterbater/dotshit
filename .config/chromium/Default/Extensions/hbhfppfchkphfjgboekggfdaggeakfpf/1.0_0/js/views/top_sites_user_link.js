define([
    'backbone',
    'jquery',
    'text!templates/top-sites-user-link.html',
    'models/helpers',
    'urijs/URI'
], function(
    Backbone,
    $,
    template,
    helpers,
    URI
) {

    var View = Backbone.View.extend({
        className: 'top-sites-user-links-item-wrapper',
        template: _.template(template),
        events: {
            'click .top-sites-user-links-item-remove': 'onRemoveClicked'
        },
        user_link: null,
        initialize: function(options) {
            this.options = options.options || {};

            if (!_.isUndefined(this.options.user_link)) {
                this.userLink = this.options.user_link;
            }
        },
        trySetIcon: function(icons, i) {
            var self = this;

            $.ajax({
                type: 'HEAD',
                url: icons[i],
                success: function() {
                    self.$el.find('.top-sites-user-links-item-icon').css('background-image', 'url(' + icons[i] + ')');
                },
                error: function() {
                    if (i + 1 < icons.length) {
                        self.trySetIcon(icons, i + 1);
                    }
                }
            });
        },
        updateIcon: function() {
            var iconUrls = [
                'http://logo.clearbit.com/' + URI(this.userLink.get('url')).domain(),
                'chrome://favicon/' + this.userLink.get('url')
            ];

            this.trySetIcon(iconUrls, 0);
        },
        render: function() {
            this.$el.html(this.template({
                user_link: this.userLink
            }));
            this.updateIcon();
            helpers.tooltips(this.$el);
            return this;
        },
        onRemoveClicked: function(e) {
            e.preventDefault();
            this.userLink.remove();
        }
    });

    return View
});