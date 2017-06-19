define([
    'backbone',
    'jquery',
    'text!templates/my-boards.html',
    'views/board',
    'collections/boards',
    'viewManager',
    'masonry-layout'
], function(
    Backbone,
    $,
    template,
    BoardView,
    BoardsCollection,
    viewManager
) {

    var View = Backbone.View.extend({
        $scrollable: function() { return this.$el.find('.content-scrollable') },
        $container: function() { return this.$el.find('.board-tiles') },
        loadMoreOnSpaceLeft: 400,
        loading: false,
        template: _.template(template),
        events: {
            'click .mobile-header-menu-button': 'onMenuButtonClicked'
        },
        initialize: function() {
            this.boards = new BoardsCollection();
        },
        remove: function() {
            this.$scrollable().off('scroll', this.fetchItemsIfNeededCallback);
        },
        render: function() {
            this.$el.html(this.template());
            this.initLayout();
            this.reloadItems();
            return this;
        },
        onItemAdd: function(model, collection, options) {
            var $item = new BoardView({ model: model }).render().$el;
            this.$container().append($item).masonry('appended', $item).masonry();
        },
        finishLoading: function() {
            this.$container().masonry();
            this.$container().toggleClass('empty', this.boards.length == 0);
            this.loading = false;
            this.fetchItemsIfNeeded();
        },
        reloadItems: function() {
            this.$container().empty().masonry();
            this.fetchItems();
        },
        fetchItems: function() {
            if (this.loading) {
                return;
            }

            var view = this;

            this.loading = true;
            this.boards.fetch({
                success: function() { view.finishLoading(); },
                remove: false
            });
        },
        fetchItemsIfNeeded: function () {
            if (this.$el.parents('html').length == 0) {
                return;
            }

            var spaceLeft = this.$scrollable().get(0).scrollHeight - (this.$scrollable().scrollTop() + this.$scrollable().height());

            if (spaceLeft < this.loadMoreOnSpaceLeft && this.boards.isFetchable()) {
                this.fetchItems();
            }
        },
        initLayout: function () {
            this.$container().masonry({
                itemSelector: '.board-tile-container',
                columnWidth: '.board-tile-container',
                percentPosition: true
            });

            var view = this;
            this.fetchItemsIfNeededCallback = function() {
                view.fetchItemsIfNeeded();
            };
            this.$scrollable().on('scroll', this.fetchItemsIfNeededCallback);

            this.boards.on('add', this.onItemAdd, this);
        },
        onMenuButtonClicked: function(e) {
            e.preventDefault();

            viewManager.sidebarView.toggleSidebarOpened();
        }
    });

    return View
});