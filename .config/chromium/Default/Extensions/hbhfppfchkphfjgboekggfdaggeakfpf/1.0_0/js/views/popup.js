define([
    'backbone',
    'jquery',
    'viewManager'
], function(
    Backbone,
    $,
    viewManager
) {

    var View = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.onKeyDownCallback = function(e) { view._onPopupKeyDown(e); };

            $(document).on('keydown', null, { view: this }, this.onKeyDownCallback);
            this.$el.on('click', '.close-popup', { view: this }, this._onPopupCloseClicked);

            Backbone.View.prototype.initialize.apply(this, []);
        },
        remove: function() {
            $(document).off('keydown', null, this.onKeyDownCallback);
            this.$el.off('click', '.close-popup', this._onPopupCloseClicked);
            Backbone.View.prototype.remove.apply(this, []);
        },
        closePopup: function() {
            Backbone.router.closePopup();
        },
        _onPopupCloseClicked: function(e) {
            if ($(e.target).hasClass('close-popup')) {
                e.data.view.closePopup();
                e.preventDefault();
                e.stopPropagation();
            }
        },
        _onPopupKeyDown: function(e) {
            if (e.which == 27 && _.last(viewManager.popups) === e.data.view) {
                e.data.view.closePopup();
            }
        }
    });

    return View;
});
