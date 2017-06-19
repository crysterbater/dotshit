define([
    'backbone',
    'viewManager',
    'views/feed_items',
    'views/feed_item_popups',
    'views/login_complete',
    'views/logout_complete',
    'views/my_boards',
    'views/resources',
    'views/provider_settings_popup',
    'views/add_board_feed_item_popup',
    'views/create_board_popup',
    'views/create_resource_popup',
    'views/share_popup',
    'views/login_popup',
    'views/feed_images_popup',
    'models/globals'
], function(
    Backbone,
    viewManager,
    FeedItemsView,
    FeedItemPopupsView,
    LoginCompleteView,
    LogoutCompleteView,
    MyBoardsView,
    ResourcesView,
    ProviderSettingsPopupView,
    AddBoardFeedItemPopup,
    CreateBoardPopup,
    CreateResourcePopup,
    SharePopup,
    LoginPopup,
    FeedImagesPopup,
    globals
){

    var Router = Backbone.Router.extend({
        routes: {
            'provider/:provider_id/feed-item/:item_id': 'providerFeedItemAction',
            'provider/:provider_id': 'providerAction',
            'board/:board_id/feed-item/:item_id': 'boardFeedItemAction',
            'board/:board_id': 'boardAction',
            'liked/feed-item/:item_id': 'likedFeedItemAction',
            'liked': 'likedAction',
            'login/:provider': 'loginAction',
            'complete_login': 'loginCompleteAction',
            'logout': 'logoutAction',
            'complete_logout': 'logoutCompleteAction',
            'boards': 'myBoardsAction',
            'resources': 'resourcesAction',
            '*default': 'defaultActions'
        },
		initialize: function() {
            Backbone.router = this;
        },
        defaultActions: function() {
            viewManager.show(new FeedItemsView({ providerId: '0' }));
        },
        providerAction: function(providerId) {
            viewManager.show(new FeedItemsView({ providerId: providerId }));
        },
        providerFeedItemAction: function(providerId, itemId) {
            viewManager.show(new FeedItemsView({ providerId: providerId }));
            viewManager.openPopup(new FeedItemPopupsView(itemId, { providerId: providerId }));
        },
        boardAction: function(boardId) {
            viewManager.show(new FeedItemsView({ boardId: boardId }));
        },
        boardFeedItemAction: function(boardId, itemId) {
            viewManager.show(new FeedItemsView({ boardId: boardId }));
            viewManager.openPopup(new FeedItemPopupsView(itemId, { boardId: boardId }));
        },
        likedAction: function() {
            viewManager.show(new FeedItemsView({ liked: true }));
        },
        likedFeedItemAction: function(itemId) {
            viewManager.show(new FeedItemsView({ liked: true }));
            viewManager.openPopup(new FeedItemPopupsView(itemId, { liked: true }));
        },
        loginAction: function(provider) {
            var redirectUri;

            if (Backbone.history.options.pushState === true) {
                redirectUri = globals['baseUrl'] + 'complete_login';
            } else {
                redirectUri = globals['baseUrl'] + 'index.html#complete_login';
            }

            window.location = globals['serverBaseUrl'] + 'login/' + provider + '/?redirect_uri=' + encodeURIComponent(redirectUri);
        },
        loginCompleteAction: function() {
            viewManager.show(new LoginCompleteView());
        },
        logoutAction: function() {
            var redirectUri;

            if (Backbone.history.options.pushState === true) {
                redirectUri = globals['baseUrl'] + 'complete_logout';
            } else {
                redirectUri = globals['baseUrl'] + 'index.html#complete_logout';
            }

            window.location = globals['serverBaseUrl'] + 'logout/?redirect_uri=' + encodeURIComponent(redirectUri);
        },
        logoutCompleteAction: function() {
            viewManager.show(new LogoutCompleteView());
        },
        myBoardsAction: function() {
            viewManager.show(new MyBoardsView());
        },
        resourcesAction: function() {
            viewManager.show(new ResourcesView());
        },
        openProviderSettingsPopup: function() {
            viewManager.openPopup(new ProviderSettingsPopupView());
        },
        openAddBoardFeedItemPopup: function(feedItem) {
            viewManager.openPopup(new AddBoardFeedItemPopup(feedItem));
        },
        openCreateBoardPopup: function(boards, callback) {
            viewManager.openPopup(new CreateBoardPopup({
                options: {
                    boards: boards,
                    callback: callback
                }
            }));
        },
        openEditBoardPopup: function(board) {
            viewManager.openPopup(new CreateBoardPopup({
                options: {
                    board: board
                }
            }));
        },
        openCreateResourcePopup: function() {
            viewManager.openPopup(new CreateResourcePopup());
        },
        openSharePopup: function() {
            viewManager.openPopup(new SharePopup());
        },
        openFeedImagesPopup: function(feedItem, initialSlide) {
            viewManager.openPopup(new FeedImagesPopup(feedItem, initialSlide));
        },
        openLoginPopup: function() {
            viewManager.openPopup(new LoginPopup());
        },
        closePopup: function() {
            viewManager.closePopup();
        }
    });

    return new Router();
});
