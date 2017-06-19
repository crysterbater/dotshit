define([
    'backbone',
    'jquery',
    'text!templates/board.html'
], function(
    Backbone,
    $,
    template
) {

    var View = Backbone.View.extend({
        board: null,
        template: _.template(template),
        titleInput: function() { return this.$el.find('[name="title"]'); },
        events: {
            'click .board-tile': 'onItemClicked',
            'mouseenter .board-tile': 'onMouseEnter',
            'mouseleave .board-tile': 'onMouseLeave',
            'click .board-tile-controls-edit': 'onEditClicked',
            'click .board-tile-controls-save': 'onSaveClicked',
            'click .board-tile-controls-cancel': 'onCancelClicked'
        },
        initialize: function(options) {
            this.model.on('change', this.onBoardChanged, this);
        },
        remove: function() {
            this.model.off('change', this.onBoardChanged, this);
            Backbone.View.prototype.remove.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                board: this.model
            }));
            return this;
        },
        onMouseEnter: function() {
            this.$el.find('.board-tile-container').addClass('hover');
        },
        onMouseLeave: function() {
            this.$el.find('.board-tile-container').removeClass('hover');
        },
        onItemClicked: function() {
            if (this.$el.find('.board-tile').hasClass('edit')) {
                return;
            }

            Backbone.router.navigate('board/' + this.model.escape('id'), { trigger: true });
        },
        onEditClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();

            this.$el.find('.board-tile').addClass('edit');
            this.$el.find('.board-tile-label').removeClass('error');
            this.titleInput().val(this.titleInput().val()).focus();
        },
        onSaveClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var view = this;

            this.$el.find('.board-tile-label').removeClass('error');

            this.model.save({
                title: this.titleInput().val()
            }, {
                patch: true,
                success: function() {
                    view.$el.find('.board-tile').removeClass('edit');
                },
                error: function() {
                    view.$el.find('.board-tile-label').addClass('error');
                }
            });
        },
        onCancelClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();

            this.$el.find('.board-tile').removeClass('edit');
        },
        onBoardChanged: function() {
            this.$el.find('.board-tile-title').html(this.model.escape('title'));
            this.titleInput().val(this.model.escape('title'));
        }
    });

    return View;
});
