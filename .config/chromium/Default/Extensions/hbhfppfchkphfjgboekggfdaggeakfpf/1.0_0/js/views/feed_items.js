define([
    'backbone',
    'jquery',
    'text!templates/feed-items.html',
    'views/feed_item',
    'views/top_sites',
    'collections/feed_items',
    'collections/providers',
    'models/provider',
    'models/board',
    'viewManager',
    'models/globals',
    'models/helpers',
    'masonry-layout'
], function(
    Backbone,
    $,
    template,
    FeedItemView,
    TopSitesView,
    FeedItemsCollection,
    providers,
    Provider,
    Board,
    viewManager,
    globals,
    helpers
) {

    var View = Backbone.View.extend({
        className: 'FeedItemsView',
        $scrollable: function() { return this.$el.find('.content-scrollable') },
        $container: function() { return this.$el.find('.tiles') },
        $topSitesContainer: function() { return this.$el.find('.top-sites-container') },
        $shareButton: function() { return this.$el.find('.share-button'); },
        loadMoreOnSpaceLeft: 1800,
        loading: false,
        template: _.template(template),
        title: '',
        description: '',
        external: null,
        prevScrollTop: null,
        showFilters: true,
        showBoardControls: false,
        initialLoad: false,
        board: null,
        events: {
            'click .share-button': 'onShareButtonClicked',
            'click .mobile-header-menu-button': 'onMenuButtonClicked',
            'click .change-order': 'onChangeOrderClicked',
            'click .board-edit': 'onBoardEditClicked',
            'click .board-delete': 'onBoardDeleteClicked'
        },
        equals: function(view) {
            return this.className == view.className && _.isMatch(this.options, view.options);
        },
        initialize: function(options) {
            this.options = options || {};
            this.feedItems = new FeedItemsCollection();

            if (!_.isUndefined(this.options.providerId)) {
                this.feedItems.providerId = this.options.providerId;
                providers.setCurrent(this.options.providerId);
            }

            if (!_.isUndefined(this.options.boardId)) {
                this.feedItems.boardId = this.options.boardId;
                this.showFilters = false;
                this.showBoardControls = true;
                providers.setCurrent(null);
            }

            if (!_.isUndefined(this.options.liked)) {
                this.feedItems.liked = this.options.liked;
                this.showFilters = false;
                providers.setCurrent(null);
            }

            this.on('show', this.onShow);
            this.feedItems.on('add', this.onItemAdd, this);
            providers.on('change:user_active', this.onProvidersUpdated, this);
            this.updateFeedItemsInfo();
        },
        remove: function() {
            this.feedItems.off('add', this.onItemAdd, this);
            providers.off('change:user_active', this.onProvidersUpdated, this);
            this.$scrollable().off('scroll', this.onScroll);
            $('body').removeClass('scroll-to-bottom');
        },
        render: function() {
            this.$el.html(this.template({
                title: this.title,
                description: this.description,
                showFilters: this.showFilters,
                showBoardControls: this.showBoardControls,
                liked: this.feedItems.liked
            }));
            if (chrome && chrome.topSites) {
                this.$topSitesContainer().append(new TopSitesView().render().$el);
            }
            helpers.tooltips(this.$el);
            this.$scrollable().css('-webkit-overflow-scrolling', 'touch');
            return this;
        },
        onItemAdd: function(model, collection, options) {
            var $item = new FeedItemView({ model: model, options: this.options }).render().$el;
            this.$container().append($item).masonry('appended', $item);
        },
        onShow: function() {
            var view = this;
            this.onScroll = function() {
                view.fetchItemsIfNeeded();

                if (view.prevScrollTop != null && view.$scrollable().scrollTop() > view.prevScrollTop && view.$scrollable().scrollTop() > 64) {
                    $('body').addClass('scroll-to-bottom');
                } else {
                    $('body').removeClass('scroll-to-bottom');
                }

                view.prevScrollTop = view.$scrollable().scrollTop();
            };
            this.$scrollable().on('scroll', this.onScroll);

            this.initLayout();
            this.reloadItems();

            //var $item = $('.sidebar-menu-item').removeClass('selected').filter('[data-provider-id="' + this.providerId + '"]').addClass('selected');
            //var providerName = $item.data('provider-name');
            //var providerSiteUrl = $item.data('provider-site-url');

            //$('.provider-name').text(providerName);
            //
            //if (providerSiteUrl) {
            //    $('.provider-site-url').attr('href', providerSiteUrl).show();
            //} else {
            //    $('.provider-site-url').hide();
            //}
        },
        finishLoading: function() {
            this.$container().masonry();
            this.$container().toggleClass('empty', this.feedItems.length == 0);

            if (this.initialLoad) {
                viewManager.setLoading(false);
            }

            this.loading = false;
            this.initialLoad = false;
            this.fetchItemsIfNeeded();
        },
        reloadItems: function() {
            this.initialLoad = true;
            this.$container().empty().masonry();
            this.fetchItems();
        },
        fetchItems: function() {
            if (this.loading) {
                return;
            }

            var view = this;

            this.loading = true;

            if (this.initialLoad) {
                viewManager.setLoading(true);
            }

            this.feedItems.fetch({
                success: function() { view.finishLoading(); },
                remove: false
            });
        },
        fetchItemsIfNeeded: function() {
            if (this.$el.parents('html').length == 0) {
                return;
            }

            var spaceLeft = this.$scrollable().get(0).scrollHeight - (this.$scrollable().scrollTop() + this.$scrollable().height());

            if (spaceLeft < this.loadMoreOnSpaceLeft && this.feedItems.isFetchable()) {
                this.fetchItems();
            }
        },
        initLayout: function() {
            this.$container().masonry({
                itemSelector: '.tile',
                columnWidth: '.tile',
                percentPosition: true
            });
        },
        updateFeedItemsInfo: function() {
            var view = this;

            if (this.feedItems.providerId && this.feedItems.providerId != 0) {
                var provider = new Provider({id: this.feedItems.providerId});
                provider.fetch({
                    success: function (model) {
                        view.setTitle(model.escape('name'));
                        view.setExternal(model.escape('site_url'));
                    }
                });
            } else if (this.feedItems.boardId && this.feedItems.boardId != 0) {
                var board = new Board({id: this.feedItems.boardId});
                board.fetch({
                    success: function (model) {
                        view.setTitle(model.escape('title'));
                        view.setDescription(model.escape('description'));
                        view.board = model;

                        board.on('sync', function() {
                            view.setTitle(model.escape('title'));
                            view.setDescription(model.escape('description'));
                        });
                    }
                });
            } else if (this.feedItems.liked) {
                this.setTitle('My likes');
            } else {
                this.setTitle('All feeds');
            }
        },
        setTitle: function(title) {
            this.title = title;
            this.$el.find('.feed-items-title').text(title);
        },
        setDescription: function(description) {
            this.description = description;
            this.$el.find('.feed-items-description').text(description);
        },
        setExternal: function(external) {
            this.external = external;
            if (external) {
                this.$el.find('.tiles-header-external').attr('href', external).css('display', 'inline-block');
            } else {
                this.$el.find('.tiles-header-external').hide();
            }
        },
        onShareButtonClicked: function(e) {
            e.preventDefault();

            Backbone.router.openSharePopup();
        },
        onMenuButtonClicked: function(e) {
            e.preventDefault();

            viewManager.sidebarView.toggleSidebarOpened();
        },
        onChangeOrderClicked: function(e) {
            e.preventDefault();

            var $item = $(e.target);

            this.$el
                .find('.change-order')
                .removeClass('active')
                .filter('[data-order="' + $item.data('order') + '"]')
                .addClass('active');

            this.feedItems.reset();
            this.feedItems.url = globals['apiBaseUrl'] + 'feed_item/';
            this.feedItems.order = $item.data('order');
            this.reloadItems();
        },
        onProvidersUpdated: function() {
            if (this.options.providerId != null && this.options.providerId == 0) {
                this.reloadItems();
            }
        },
        onBoardEditClicked: function(e) {
            e.preventDefault();

            if (!this.board) {
                return;
            }

            Backbone.router.openEditBoardPopup(this.board);
        },
        onBoardDeleteClicked: function(e) {
            e.preventDefault();

            if (!this.board) {
                return;
            }

            this.board.destroy({
                success: function() {
                    Backbone.history.navigate('boards', { trigger:true });
                },
                error: function() {
                    alert('Error');
                }
            });
        }
    });

    return View
});