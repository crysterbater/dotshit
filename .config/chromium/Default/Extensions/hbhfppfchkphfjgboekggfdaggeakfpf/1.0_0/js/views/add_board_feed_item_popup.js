define([
    'backbone',
    'jquery',
    'text!templates/add-board-feed-item-popup.html',
    'collections/boards',
    'views/popup',
    'views/board_item',
    'flickity',
    'models/helpers'
], function(
    Backbone,
    $,
    template,
    BoardsCollection,
    Popup,
    BoardView,
    Flickity,
    helpers
) {

    var View = Popup.extend({
        template: _.template(template),
        addToBoards: [],
        deleteFromBoards: [],
        events: {
            'click .save': 'onSaveClicked',
            'click .create': 'onCreateBoardClicked',
            'click .close-button': 'onCloseButtonClicked'
        },
        $boards: function() { return this.$el.find('.choose-board-boards'); },
        initialize: function(feedItem) {
            this.addToBoards = [];
            this.deleteFromBoards = [];
            this.feedItem = feedItem;
            this.boards = new BoardsCollection();
            this.boards.on('add', this.onItemAdd, this);
            this.on('show', this.onShow);
            $.bridget('flickity', Flickity);
            Popup.prototype.initialize.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({

            }));
            helpers.tooltips(this.$el);
            return this;
        },
        updateBoardsCount: function() {
            if (this.boards.count != null) {
                this.$el.find('.boards-count').text(this.boards.count);
            }
        },
        openCreateBoard: function() {
            var view = this;
            Backbone.router.openCreateBoardPopup(this.boards, function(model) {
                view.boards.count += 1; // refactor: move to collection
            });
        },
        onShow: function() {
            var view = this;

            this.$boards().flickity({
                contain: false,
                pageDots: false
            }).on('staticClick', function(event, pointer, cellElement, cellIndex) {
                if (typeof cellIndex == 'number') {
                    view.$boards().flickity('select', cellIndex);

                    var boardView = view.$boards().find('.choose-board-boards-item-container').eq(cellIndex);

                    view.onBoardClicked(boardView.data('view'));
                }
            });

            this.boards.fetch({
                success: function() {
                    if (view.boards.count == 0) {
                        view.openCreateBoard();
                    }
                    view.updateBoardsCount();
                }
            });
        },
        onItemAdd: function(model, collection, options) {
            var view = new BoardView({ board: model }, this.feedItem);
            var $item = view.render().$el;

            $item.data('view', view);

            if (options.prepend == true) {
                this.$boards().flickity('prepend', $item).flickity('select', 0);
            } else {
                this.$boards().flickity('append', $item).flickity('select', 0, false, true);
            }

            this.updateBoardsCount();
        },
        onBoardClicked: function(view) {
            if (_.contains(this.addToBoards, view.board)) {
                this.addToBoards = _.without(this.addToBoards, view.board);
                view.$el.find('.choose-board-boards-item').removeClass('active');
            } else if (_.contains(this.deleteFromBoards, view.board)) {
                this.deleteFromBoards = _.without(this.addToBoards, view.board);
                view.$el.find('.choose-board-boards-item').addClass('active');
            } else if (this.feedItem.isInBoard(view.board)) {
                this.deleteFromBoards.push(view.board);
                view.$el.find('.choose-board-boards-item').removeClass('active');
            } else {
                this.addToBoards.push(view.board);
                view.$el.find('.choose-board-boards-item').addClass('active');
            }
        },
        onSaveClicked: function(e) {
            e.preventDefault();

            this.feedItem.addToBoards(this.addToBoards);
            this.feedItem.deleteFromBoards(this.deleteFromBoards);

            Backbone.router.closePopup();
        },
        onCreateBoardClicked: function(e) {
            e.preventDefault();

            this.openCreateBoard();
        },
        onCloseButtonClicked: function(e) {
            e.preventDefault();

            this.closePopup();
        }
    });

    return View;
});
