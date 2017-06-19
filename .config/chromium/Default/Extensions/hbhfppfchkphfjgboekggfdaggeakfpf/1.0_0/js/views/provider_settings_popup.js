define([
    'backbone',
    'jquery',
    'text!templates/provider-settings-popup.html',
    'collections/providers',
    'views/popup',
    'models/helpers',
    'viewManager',
    'jquery-ui'
], function(
    Backbone,
    $,
    template,
    providers,
    Popup,
    helpers,
    viewManager
) {

    var View = Popup.extend({
        template: _.template(template),
        events: {
            'click .provider-settings-popup-providers-item-switch': 'onSwitchClicked',
            'click .provider-settings-popup-header-submit': 'onSubmitClicked'
        },
        render: function() {
            this.$el.html(this.template({
                providers: providers
            }));
            helpers.tooltips(this.$el);

            this.$el.find('.provider-settings-popup-providers').sortable({
				items: '.provider-settings-popup-providers-item.sortable',
				scroll: true,
				cursor: 'move'
			});

            return this;
        },
        onSwitchClicked: function(e) {
            e.preventDefault();

            var $switch = $(e.target).closest('.provider-settings-popup-providers-item-switch');
            var $item = $switch.parents('.provider-settings-popup-providers-item');

            $switch.toggleClass('checked');
            $item.toggleClass('active', $switch.hasClass('checked'));
        },
        onSubmitClicked: function(e) {
            e.preventDefault();

            viewManager.setLoading(true);

            this.$el.find('.provider-settings-popup-providers-item.sortable').each(function(i) {
                var $item = $(this);
                var $switch = $item.find('.provider-settings-popup-providers-item-switch');
                var provider = providers.findWhere({id: parseInt($item.data('provider-id'))});

                if (provider != undefined) {
                    provider.set('user_order', i + 1);
                    provider.set('user_active', $switch.hasClass('checked'));
                }
            });

            providers.save({
                success: function() {
                    viewManager.setLoading(false);
                    Backbone.router.closePopup();
                },
                error: function() {
                    viewManager.setLoading(false);
                    alert('error');
                }
            });
        }
    });

    return View;
});
