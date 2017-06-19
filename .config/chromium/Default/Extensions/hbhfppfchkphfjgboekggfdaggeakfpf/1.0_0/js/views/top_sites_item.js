define([
    'backbone',
    'jquery',
    'text!templates/top-sites-item.html',
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
        tagName: 'span',
        template: _.template(template),
        topSite: null,
        initialize: function(options) {
            this.options = options.options || {};

            if (!_.isUndefined(this.options.top_site)) {
                this.topSite = this.options.top_site;
            }
        },
        trySetIcon: function(icons, i) {
            var self = this;

            $.ajax({
                type: 'HEAD',
                url: icons[i],
                success: function() {
                    self.$el.find('.top-sites-item-image').css('background-image', 'url(' + icons[i] + ')');
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
                'http://logo.clearbit.com/' + URI(this.topSite.url).domain(),
                'chrome://favicon/' + this.topSite.url
            ];

            this.trySetIcon(iconUrls, 0);
        },
        render: function() {
            this.$el.html(this.template({
                top_site: this.topSite
            }));
            this.updateIcon();
            helpers.tooltips(this.$el);
            return this;
        }
    });

    return View
});