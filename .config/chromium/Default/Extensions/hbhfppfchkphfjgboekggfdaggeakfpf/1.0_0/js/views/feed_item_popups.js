define([
    'backbone',
    'jquery',
    'viewManager',
    'views/popup',
    'views/feed_item_popup',
    'slick',
    'jquery-scrollto',
    'collections/feed_items',
    'models/globals',
    'text!templates/feed-item-popups.html',
    'models/provider',
    'models/board',
    'models/helpers',
    'flickity'
], function(
    Backbone,
    $,
    viewManager,
    Popup,
    FeedItemPopupView,
    slick,
    jQueryScrollTo,
    FeedItemsCollection,
    globals,
    template,
    Provider,
    Board,
    helpers,
    Flickity
) {

    var View = Popup.extend({
        $scrollable: function() { return this.$el.find('.content-scrollable') },
        $container: function() { return $('.feed-popup-container'); },
        minOffset: 0,
        maxOffset: 0,
        minItemId: null,
        maxItemId: null,
        minItemDate: null,
        maxItemDate: null,
        prevExists: true,
        nextExists: true,
        feedLimit: 10,
        loading: false,
        loadMoreOnSpaceLeft: 400,
        scrollToTopOffset: -40,
        addScrollTop: 0,
        showProvider: true,
        apiUrl: globals['apiBaseUrl'] + 'feed/',
        template: _.template(template),
        title: '',
        events: {
            'click .mobile-header-close-button': 'onCloseButtonClicked'
        },
        initialize: function(itemId, options) {
            this.itemId = itemId;
            this.feedItems = new FeedItemsCollection();
            this.options = options || {};

            if (!_.isUndefined(this.options.providerId)) {
                this.feedItems.providerId = this.options.providerId;
                this.showProvider = this.options.providerId == 0;
            }

            if (!_.isUndefined(this.options.boardId)) {
                this.feedItems.boardId = this.options.boardId;
            }

            if (!_.isUndefined(this.options.liked)) {
                this.feedItems.liked = this.options.liked;
            }

            this.feedItems.paginating = false;
            this.on('show', this.onShow);
            this.feedItems.on('add', this.onItemAdd, this);
            $(document).on('keydown', null, { view: this }, this.onKeyDown);
            this.updateTitle();
            $.bridget('flickity', Flickity);

            Popup.prototype.initialize.apply(this, []);
        },
        remove: function() {
            this.feedItems.off('add', this.onItemAdd, this);
            $(document).off('keydown', this.onKeyDown);
            this.$scrollable().off('scroll', this.onContainerScrollCallback);
            Popup.prototype.remove.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                'item': this.feedItem,
                'show_provider': true,
                title: this.title
            }));
            helpers.tooltips(this.$el);
            return this;
        },
        openFeedItem: function(id, offset) {
            viewManager.setLoading(true);
            this.$container().show();
            $('.feed-item-opened').show();
            $('.feed-item-closed').hide();

            this.fetchItems(null, null, id);
        },
        closePopup: function() {
            Popup.prototype.closePopup.apply(this, []);
            Backbone.router.navigate(this.getPreviousViewUrl(), { trigger: true });
        },
        onContainerScroll: function() {
            if (this.loading) {
                return;
            }

            this.updateVisibleItem();
            this.fetchItemsIfNeeded();
        },
        onKeyDown: function(e) {
            var view = e.data.view;

            switch (e.which) {
                case 37: // left
                    view.prevFeedItemImage();
                    break;
                case 38: // up
                    view.prevFeedItem();
                    break;
                case 39: // right
                    view.nextFeedItemImage();
                    break;
                case 40: // down
                    view.nextFeedItem();
                    break;
                default:
                    return;
            }

            e.preventDefault();
        },
        onShow: function() {
            var view = this;
            this.onContainerScrollCallback = function() {
                view.onContainerScroll();
            };
            this.$scrollable().on('scroll', this.onContainerScrollCallback);

            this.openFeedItem(this.itemId, 0);
        },
        onItemAdd: function(model, collection, options) {
            var itemView = new FeedItemPopupView({
                model: model,
                options: { showProvider: this.showProvider }
            }).render();

            if (options.append) {
                this.$container().append(itemView.$el);
            } else {
                this.$container().prepend(itemView.$el);
                this.addScrollTop += itemView.$el.outerHeight();
            }

            itemView.$el.data('view', itemView);
            itemView.trigger('show');

            if (model.get('id') == this.itemId) {
                model.addView();
            }
        },
        currentPopupWrapper: function() {
            var view = this;
            var $visibleItem;

            this.$container().find('.feed-popup-wrapper').each(function() {
                var $item = $(this);
                var visibleHeight = view.$scrollable().height() - $item.offset().top;

                if (visibleHeight >= view.$scrollable().height() / 2) {
                    $visibleItem = $item;
                }
            });

            return $visibleItem;
        },
        getFeedItemUrl: function(feedItemId) {
            if (!_.isUndefined(this.options.providerId)) {
                return 'provider/' + this.options.providerId + '/feed-item/' + feedItemId;
            } else if (!_.isUndefined(this.options.boardId)) {
                return 'board/' + this.options.boardId + '/feed-item/' + feedItemId;
            } else if (!_.isUndefined(this.options.liked)) {
                return 'liked/feed-item/' + feedItemId;
            } else {
                return '/';
            }
        },
        getPreviousViewUrl: function() {
            if (!_.isUndefined(this.options.providerId)) {
                return 'provider/' + this.options.providerId;
            } else if (!_.isUndefined(this.options.boardId)) {
                return 'board/' + this.options.boardId;
            } else if (!_.isUndefined(this.options.liked)) {
                return 'liked';
            } else {
                return '/';
            }
        },
        updateVisibleItem: function() {
            var $visibleItem = this.currentPopupWrapper();

            $('.feed-popup-wrapper').removeClass('active');

            if ($visibleItem) {
                $visibleItem.addClass('active');

                var feedItemId = $visibleItem.children('.feed-popup').data('feed-item-id');
                Backbone.router.navigate(this.getFeedItemUrl(feedItemId), { trigger: false });
            }
        },
        scrollToPopupWrapper: function($popup) {
            var view = this;
            this.$scrollable().scrollTo($popup, 0, {
                offset: {
                    top: view.scrollToTopOffset
                }
            });
        },
        fetchItems: function(date, first_id, last_id) {
            if (this.loading) {
                return;
            }

            var view = this;

            this.addScrollTop = 0;

            this.startLoading();
            this.feedItems.fetchWithBounds(date, first_id, last_id, {
                success: function(collection, response, options) {
                    if (options.append) {
                        if (response.results.length > 0) {
                            view.minItemId = _.last(response.results).id;
                            view.minItemDate = _.last(response.results).published;

                            if (view.maxItemId == null) {
                                view.maxItemId = _.first(response.results).id;
                                view.maxItemDate = _.first(response.results).published;
                            }
                        }

                        if (response.count == 0) {
                            view.nextExists = false;
                        }
                    } else {
                        if (response.results.length > 0) {

                            if (view.minItemId == null) {
                                view.minItemId = _.first(response.results).id;
                                view.minItemDate = _.first(response.results).published;
                            }

                            view.maxItemId = _.last(response.results).id;
                            view.maxItemDate = _.last(response.results).published;
                        }

                        if (response.count == 0) {
                            view.prevExists = false;
                        }
                    }

                    if (!date) {
                        var $popup = view.$container().find('.feed-popup[data-feed-item-id="' + last_id + '"]');
                        var $scrollTo = $popup.closest('.feed-popup-wrapper');
                        view.scrollToPopupWrapper($scrollTo);
                    }

                    if (view.addScrollTop > 0) {
                        view.$scrollable().scrollTop(view.$scrollable().scrollTop() + view.addScrollTop);
                    }

                    view.updateVisibleItem();
                    view.finishLoading();
                },
                error: function() {
                    view.nextExists = false;
                    view.prevExists = false;
                    view.finishLoading();
                },
                remove: false
            });
        },
        fetchNextItems: function() {
            if (this.nextExists) {
                this.fetchItems(this.minItemDate, null, this.minItemId);
            }
        },
        fetchPrevItems: function() {
            if (this.prevExists) {
                this.fetchItems(this.maxItemDate, this.maxItemId, null);
            }
        },
        fetchItemsIfNeeded: function() {
            if (this.$el.parents('html').length == 0) {
                return;
            }

            var upperSpaceLeft = this.$scrollable().scrollTop();
            var bottomSpaceLeft = this.$scrollable().get(0).scrollHeight - (this.$scrollable().scrollTop() + this.$scrollable().height());

            if (bottomSpaceLeft < this.loadMoreOnSpaceLeft) {
                this.fetchNextItems();
            } else if (upperSpaceLeft < this.loadMoreOnSpaceLeft) {
                this.fetchPrevItems();
            }
        },
        startLoading: function() {
            this.loading = true;
        },
        finishLoading: function() {
            this.loading = false;
            this.fetchItemsIfNeeded();
            viewManager.setLoading(false);
        },
        nextFeedItem: function() {
            var $wrapper = this.currentPopupWrapper().next();
            if ($wrapper.length) {
                this.scrollToPopupWrapper($wrapper);

                if ($wrapper.next().length == 0) {
                    this.fetchNextItems();
                }
            }
        },
        prevFeedItem: function() {
            var $wrapper = this.currentPopupWrapper().prev();
            if ($wrapper.length) {
                this.scrollToPopupWrapper($wrapper);

                if ($wrapper.prev().length == 0) {
                    this.fetchPrevItems();
                }
            }
        },
        prevFeedItemImage: function() {
            var $wrapper = this.currentPopupWrapper();
            if ($wrapper) {
                $wrapper.data('view').prevImage();
            }
        },
        nextFeedItemImage: function() {
            var $wrapper = this.currentPopupWrapper();
            if ($wrapper) {
                $wrapper.data('view').nextImage();
            }
        },
        onCloseButtonClicked: function(e) {
            e.preventDefault();

            this.closePopup();
        },
        updateTitle: function() {
            var view = this;

            if (this.feedItems.providerId && this.feedItems.providerId != 0) {
                var provider = new Provider({id: this.feedItems.providerId});
                provider.fetch({
                    success: function (model) {
                        view.setTitle(model.escape('name'));
                    }
                });
            } else if (this.feedItems.boardId && this.feedItems.boardId != 0) {
                var board = new Board({id: this.feedItems.boardId});
                board.fetch({
                    success: function (model) {
                        view.setTitle(model.escape('title'));
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
            this.$el.find('.mobile-header-title').text(title);
        }
    });

    return View;
});