define([
    'backbone',
    'jquery',
    'collections/providers',
    'views/current_user',
    'text!templates/sidebar.html',
    'models/helpers',
    'models/current_user',
    'models/globals',
    'perfect-scrollbar',
    'jquery-ui'
], function(
    Backbone,
    $,
    providers,
    CurrentUserView,
    template,
    helpers,
    currentUser,
    globals
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        sidebarOpened: false,
        events: {
            'click .open-provider-settings': 'onOpenProviderSettingsClicked',
            'click .create-resource': 'onCreateResourceClicked',
            'click .sidebar-menu-item-link, .sidebar-current-user-button': 'onLinkClicked'
        },
        initialize: function() {
            this.on('show', this.onShow);
            this.providers = providers;
            this.providers.on('sync', this.onSync, this);
        },
        render: function() {
            this.setElement(this.$el.html(this.template({
                providers: this.providers.filter(function(provider) {
                    return provider.get('user_active') == undefined || provider.get('user_active'); }
                ),
                currentUser: currentUser
            })));
            this.$el.find('.sidebar-current-user-container').append(new CurrentUserView().render().$el);
            this.updateSidebarState();
            helpers.tooltips(this.$el);
            this.$el.find('.sidebar').perfectScrollbar({
                suppressScrollX: true,
                theme: 'flatun-invisible'
            });
            return this;
        },
        onSync: function() {
            this.providers.off('add remove change', this.render, this);
            this.providers.on('add remove change', this.render, this);
            this.render();
        },
        setSidebarOpened: function(value) {
            this.sidebarOpened = value;
            this.updateSidebarState();
        },
        toggleSidebarOpened: function() {
            this.setSidebarOpened(!this.sidebarOpened);
        },
        onShow: function() {
            var $sidebar = this.$el;
            var view = this;

            //if (!IS_MOBILE) {
                $sidebar.on('mouseenter', function () {
                    view.setSidebarOpened(true);
                });

                $sidebar.on('mouseleave', function () {
                    view.setSidebarOpened(false);
                });
            //}

            //$('.menu-open').on('click', function() {
            //    view.setSidebarOpened(!view.sidebarOpened);
            //});
        },
        updateSidebarState: function() {
            $('.menu-depended').toggleClass('menu-opened', this.sidebarOpened);
        },
        onOpenProviderSettingsClicked: function(e) {
            e.preventDefault();

            Backbone.router.openProviderSettingsPopup();
        },
        onCreateResourceClicked: function(e) {
            e.preventDefault();

            Backbone.router.openCreateResourcePopup();
        },
        onLinkClicked: function() {
            if (globals.isMobile()) {
                this.setSidebarOpened(false);
            }
        }
    });

    return View;
});