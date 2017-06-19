define([
    'backbone',
    'jquery',
    'text!templates/create-board-popup.html',
    'views/popup',
    'models/helpers'
], function(
    Backbone,
    $,
    template,
    Popup,
    helpers
) {

    var View = Popup.extend({
        boards: null,
        board: null,
        callback: null,
        template: _.template(template),
        events: {
            'click .cancel': 'onCancelClicked',
            'click .create': 'onCreateClicked',
            'click .edit': 'onEditClicked',
            'focus .create-board-form-row-input': 'onInputFocus',
            'blur .create-board-form-row-input': 'onInputBlur'
        },
        initialize: function(options) {
            this.options = options.options || {};

            if (!_.isUndefined(this.options.boards)) {
                this.boards = this.options.boards;
            }

            if (!_.isUndefined(this.options.callback)) {
                this.callback = this.options.callback;
            }

            if (!_.isUndefined(this.options.board)) {
                this.board = this.options.board;
            }

            Popup.prototype.initialize.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                board: this.board,
                boardsCount: this.boards ? this.boards.count : null
            }));
            helpers.tooltips(this.$el);

            var view = this;

            this.$el.find('.create-board-form-row-input').each(function() {
                view.updateInputState($(this));
            });

            return this;
        },
        onCancelClicked: function(e) {
            e.preventDefault();

            Backbone.router.closePopup();
        },
        onCreateClicked: function(e) {
            e.preventDefault();

            var view = this;

            this.$el.find('.create-board-form-row-item').removeClass('error');

            var board = this.boards.create({
                title: this.$el.find('[name="title"]').val(),
                description: this.$el.find('[name="description"]').val()
            }, {
                success: function(collection, model, response) {
                    Backbone.router.closePopup();

                    if (view.callback) {
                        view.callback(model);
                    }
                },
                error: function(model, response) {
                    view.showErrors(response);
                },
                prepend: true
            });
        },
        onEditClicked: function(e) {
            e.preventDefault();

            var view = this;

            this.$el.find('.create-board-form-row-item').removeClass('error');

            this.board.save({
                'title': this.$el.find('[name="title"]').val(),
                'description': this.$el.find('[name="description"]').val()
            }, {
                patch: true,
                success: function() {
                    Backbone.router.closePopup();

                    if (view.callback) {
                        view.callback(model);
                    }
                },
                error: function(model, response) {
                    view.showErrors(response);
                }
            });
        },
        showErrors: function(response) {
            if (response.status >= 400 && response.status < 500) {
                var view = this;
                var errors = JSON.parse(response.responseText);

                _.each(errors, function (fieldErrors, field) {
                    _.each(fieldErrors, function (error) {
                        view.$el
                            .find('.create-board-form [name="' + field + '"]')
                            .parents('.create-board-form-row-item')
                            .addClass('error');
                    });
                });
            }
        },
        updateInputState: function($input) {
            $input.parents('.create-board-form-row-item').toggleClass('focus', $input.is(':focus'));
            $input.parents('.create-board-form-row-item').toggleClass('empty', $input.val().length == 0);
        },
        onInputFocus: function(e) {
            this.updateInputState($(e.target));
        },
        onInputBlur: function(e) {
            this.updateInputState($(e.target));
        }
    });

    return View;
});
