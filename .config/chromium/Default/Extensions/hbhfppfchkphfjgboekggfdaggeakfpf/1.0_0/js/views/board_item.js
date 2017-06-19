define([
    'backbone',
    'jquery',
    'text!templates/board-item.html'
], function(
    Backbone,
    $,
    template
) {

    var View = Backbone.View.extend({
        board: null,
        template: _.template(template),
        className: 'choose-board-boards-item-container',
        events: {
            'click .choose-board-boards-item': 'onBoardClicked'
        },
        initialize: function(options, feedItem) {
            this.board = options.board;
            this.feedItem = feedItem;
        },
        render: function() {
            this.$el.html(this.template({
                board: this.board,
                feedItem: this.feedItem
            }));
            return this;
        },
        onBoardClicked: function(e) {
            e.preventDefault();
        }
    });

    return View;
});
