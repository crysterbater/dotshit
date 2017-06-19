define([
    'backbone',
    'views/sidebar',
    'models/current_user',
    'collections/providers',
    'masonry-layout',
    'jquery',
    'text!templates/main.html',
    'fastclick',
    'smart-app-banner',
    'utils/cookies',
    'jquery-bridget',
    'jquery-cookie'
], function(
    Backbone,
    SidebarView,
    currentUser,
    providers,
    Masonry,
    $,
    template,
    FastClick,
    SmartBanner,
    cookies
){

    var View = Backbone.View.extend({
        sidebarView: null,
		currentView: null,
        popups: [],
        template: _.template(template),
        loading: false,
        events: {
            'click .menu-open': 'onMenuToggleClicked'
        },
        initialize: function () {
            $.bridget('masonry', Masonry);
            //FastClick.attach(document.body);

            this.sidebarView = new SidebarView();
            this.render();
        },
        render: function() {
            this.setLoading(true);
            this.setElement(this.template());
            this.delegateEvents(this.events);

            this.$el.css('visibility', 'hidden');
            this.sidebarView.$el.css('visibility', 'hidden');

            $(document.body).prepend(this.sidebarView.render().$el);
            $(document.body).append(this.$el);

            this.sidebarView.trigger('show');

            var view = this;

            this.fetch(function() {
                view.$el.css('visibility', 'visible');
                view.sidebarView.$el.css('visibility', 'visible');
                view.setLoading(false);

                Backbone.history.start();
                //Backbone.history.start({ pushState: true });
            });

            $(document).on('click', 'a[href*="#"]', function(e) {
                if (Backbone.history.options.pushState !== true) {
                    return;
                }

                var $link = $(this);
                var link = $link.attr('href').substring(1);

                if (link.length == 0) {
                    return;
                }

                e.preventDefault();

                Backbone.router.navigate(link, { trigger: true });
            });

            new SmartBanner({
                daysHidden: 0,
                daysReminder: 0,
                title: 'Flatun - Design inspirations',
                author: 'Flatun',
                button: 'VIEW',
                price: {
                    android: 'FREE'
                }
            });

            return this;
        },
        fetch: function(completion) {
            var fetched = 0;
            var fetchCompleted = function() {
                ++fetched;
                if (fetched == 2) {
                    completion();
                }
            };

            cookies.prepare(function() {
                currentUser.fetch({
                    complete: fetchCompleted
                });

                providers.fetch({
                    complete: fetchCompleted,
                    remove: false
                });
            });
        },
        setLoading: function(loading) {
            if (this.loading != loading) {
                if (loading) {
                    this.sidebarView.setSidebarOpened(false);
                }

                $('.loading').fadeToggle(loading);

                this.loading = loading;
            }
        },
		show: function(view) {
            this.closeAllPopups();

            if (this.currentView && this.currentView.equals != undefined && this.currentView.equals(view)) {
                return;
            }

            if (this.currentView != null) {
                this.currentView.remove();
            }

            this.currentView = view;
            this.$el.find('.content').html(view.render().$el);

            view.trigger('show');
		},
        openPopup: function(popup) {
            this.sidebarView.setSidebarOpened(false);

            this.popups.push(popup.render());
            this.$el.find('.popups').append(popup.$el);

            popup.trigger('show');
        },
        closePopup: function() {
            var popup = this.popups.pop();

            if (!_.isUndefined(popup)) {
                popup.remove();
            }
        },
        closeAllPopups: function() {
            var count = this.popups.length;

            for (var i = 0; i < count; ++i) {
                this.closePopup();
            }
        },
        onMenuToggleClicked: function() {
            this.sidebarView.toggleSidebarOpened();
        }
    });

    return new View();
});
