require.config({
    urlArgs: '_=' + (new Date()).getTime(),
    baseUrl: 'js',
    paths: {
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'jquery-ui': '../bower_components/jquery-ui/jquery-ui.min',
        'underscore': '../bower_components/underscore/underscore-min',
        'backbone': '../bower_components/backbone/backbone-min',
        'slick': '../bower_components/slick-carousel/slick/slick.min',
        'perfect-scrollbar': '../bower_components/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min',
        'jquery-scrollto': '../bower_components/jquery.scrollTo/jquery.scrollTo.min',
        'masonry-layout': '../bower_components/masonry/dist/masonry.pkgd.min',
        'jquery-bridget': '../bower_components/jquery-bridget/jquery-bridget',
        'urijs': '../bower_components/urijs/src',
        'jquery-cookie': '../bower_components/jquery.cookie/jquery.cookie',
        'FileAPI': '../bower_components/fileapi/dist/FileAPI.min',
        'select2': '../bower_components/select2/dist/js/select2.min',
        'gifffer': 'lib/gifffer/gifffer',
        'moment': '../bower_components/moment/min/moment-with-locales.min',
        'text': '../bower_components/text/text',
        'templates': '../templates'
    },
    shim: {
        'FileAPI': { exports: 'FileAPI' },
        'gifffer': { exports: 'Gifffer' }
    }
});

define([
    'router'
], function(
    router
){

    Backbone.history.start();//{ pushState: true });
});

define([
    'backbone',
    'viewManager',
    'views/feed_items',
    'views/feed_item_popups',
    'views/login_complete',
    'views/logout_complete',
    'views/my_boards',
    'views/resources',
    'views/settings_popup',
    'views/add_board_feed_item_popup',
    'views/create_board_popup',
    'views/create_resource_popup',
    'views/share_popup',
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
    SettingsPopupView,
    AddBoardFeedItemPopup,
    CreateBoardPopup,
    CreateResourcePopup,
    SharePopup,
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
            'login_complete': 'loginCompleteAction',
            'logout': 'logoutAction',
            'logout_complete': 'logoutCompleteAction',
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
            var redirectUri = globals['baseUrl'] + 'index.html#login_complete';
            window.location = globals['serverBaseUrl'] + 'login/' + provider + '/?redirect_uri=' + encodeURIComponent(redirectUri);
        },
        loginCompleteAction: function() {
            viewManager.show(new LoginCompleteView());
        },
        logoutAction: function() {
            var redirectUri = globals['baseUrl'] + 'index.html#logout_complete';
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
        openSettingsPopup: function() {
            viewManager.openPopup(new SettingsPopupView());
        },
        openAddBoardFeedItemPopup: function(feedItem) {
            viewManager.openPopup(new AddBoardFeedItemPopup(feedItem));
        },
        openCreateBoardPopup: function(boardsCount) {
            viewManager.openPopup(new CreateBoardPopup({
                boardsCount: boardsCount
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
        closePopup: function() {
            viewManager.closePopup();
        }
    });

    return new Router();
});

define([
    'backbone',
    'views/sidebar',
    'models/current_user',
    'collections/providers',
    'masonry-layout',
    'jquery',
    'text!templates/main.html',
    'jquery-bridget',
    'jquery-cookie'
], function(
    Backbone,
    SidebarView,
    currentUser,
    providers,
    Masonry,
    $,
    template
){

    var View = Backbone.View.extend({
        sidebarView: null,
		currentView: null,
        popups: [],
        template: _.template(template),
        loading: false,
        initialize: function () {
            $.bridget('masonry', Masonry);

            this.sidebarView = new SidebarView();
            this.render();
        },
        render: function() {
            this.setLoading(true);
            this.setElement(this.template());
            this.delegateEvents(this.events);

            this.$el.hide();
            this.sidebarView.$el.hide();

            $(document.body).prepend(this.sidebarView.render().$el);
            $(document.body).append(this.$el);

            this.sidebarView.trigger('show');

            var view = this;

            this.fetch(function() {
                view.$el.show();
                view.sidebarView.$el.show();
                view.setLoading(false);
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

            currentUser.fetch({
                complete: fetchCompleted
            });

            providers.fetch({
                complete: fetchCompleted,
                remove: false
            });
        },
        setLoading: function(loading) {
            if (this.loading != loading) {
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
        }
    });

    return new View();
});

define([
    'backbone',
    'models/provider',
    'models/globals'
], function(
    Backbone,
    Provider,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: Provider,
        url: globals['apiBaseUrl'] + 'provider/',
        fetch: function(options) {
            var token = $.cookie('token');

            options = options || {};

            if (token) {
                options = _.extend(options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            Backbone.Collection.prototype.fetch.apply(this, [options]);
        },
        isFetchable: function() {
            return false;
        }
    });

    return Collection;
});

define([
    'backbone',
    'models/board',
    'models/globals'
], function(
    Backbone,
    Board,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: Board,
        url: globals['apiBaseUrl'] + 'board/',
        count: null,
        paginating: true,
        comparator: function(item) {
            return [-item.get('date_updated')]
        },
        parse: function(response) {
            if (this.paginating) {
                this.url = response.next;
                this.count = response.count;
            }
            return response.results;
        },
        isFetchable: function() {
            return this.url != null;
        },
        fetch: function(options) {
            var token = $.cookie('token');

            options = options || {};

            if (token) {
                options = _.extend(options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            Backbone.Collection.prototype.fetch.apply(this, [options]);
        },
        create: function(attributes, options) {
            var token = $.cookie('token');

            options = options || {};

            if (token) {
                options = _.extend(options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            Backbone.Collection.prototype.create.apply(this, [attributes, options]);
        }
    });

    return Collection;
});

define([
    'backbone',
    'models/feed_item',
    'models/globals'
], function(
    Backbone,
    FeedItem,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: FeedItem,
        providerId: 0,
        boardId: 0,
        liked: null,
        url: globals['apiBaseUrl'] + 'feed_item/',
        paginating: true,
        comparator: function(item) {
            return [-item.get('published'), -item.get('id')]
        },
        parse: function(response) {
            if (this.paginating) {
                this.url = response.next;
            }
            return response.results;
        },
        fetch: function(options) {
            var token = $.cookie('token');

            options = options || {};

            if (token) {
                options = _.extend(options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            if (this.providerId != 0) {
                options = _.extend(options, {
                    data: {
                        provider: this.providerId
                    }
                });
            }

            if (this.boardId != 0) {
                options = _.extend(options, {
                    data: {
                        boards: this.boardId
                    }
                });
            }

            if (this.liked) {
                options = _.extend(options, {
                    data: {
                        like: this.liked ? 'True' : 'False'
                    }
                });
            }

            Backbone.Collection.prototype.fetch.apply(this, [options]);
        },
        isFetchable: function() {
            return this.url != null;
        },
        fetchWithBounds: function(date, first_id, last_id, options) {
            var data = {};

            if (this.providerId != 0) {
                data['provider'] = this.providerId;
            }

            if (this.boardId != 0) {
                data['boards'] = this.boardId;
            }

            if (this.liked) {
                data['like'] = this.liked ? 'True' : 'False';
            }

            if (first_id) {
                if (date) {
                    data['after_id_and_date'] = first_id + ',' + date;
                } else {
                    data['starting_from_id_date'] = first_id;
                }
            }

            if (last_id) {
                if (date) {
                    data['before_id_and_date'] = last_id + ',' + date;
                } else {
                    data['ending_with_id_date'] = last_id;
                }
            }

            this.fetch(_.extend(options, {
                data: data,
                append: last_id != null
            }));
        }
    });

    return Collection;
});

define([
    'backbone',
    'models/language',
    'models/globals'
], function(
    Backbone,
    Language,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: Language,
        url: globals['apiBaseUrl'] + 'language/'
    });

    return Collection;
});

define([
    'backbone',
    'models/provider_tag',
    'models/globals'
], function(
    Backbone,
    ProviderTag,
    globals
) {

    var Collection = Backbone.Collection.extend({
        model: ProviderTag,
        url: globals['apiBaseUrl'] + 'provider_tag/'
    });

    return Collection;
});

define([
    'backbone',
    'collections/all_providers',
    'models/provider',
    'models/globals'
], function(
    Backbone,
    AllProvidersCollection,
    Provider,
    globals
) {

    var Collection = AllProvidersCollection.extend({
        currentProviderId: null,
        comparator: function(item) {
            return [item.get('id') != 0, -item.get('user_order')]
        },
        initialize: function(models, options) {
            Backbone.Collection.prototype.initialize.apply(this, [models, options]);
            this.on('add', this.onAdd, this);
            this.on('change:user_order', function() { this.sort() }, this);
        },
        onAdd: function() {
            this.updateCurrent();
        },
        setCurrent: function(providerId) {
            this.currentProviderId = providerId;
            this.updateCurrent();
        },
        updateCurrent: function() {
            this.each(function(provider) {
                provider.set('current', false);
            });

            if (this.currentProviderId) {
                var provider = this.findWhere({id: parseInt(this.currentProviderId)});

                if (provider) {
                    provider.set('current', true);
                }
            }
        },
        fetch: function(options) {
            options = _.extend(options || {}, {
                data: {
                    active: 'True'
                }
            });

            AllProvidersCollection.prototype.fetch.apply(this, [options]);
        },
        save: function(options) {
            var token = $.cookie('token');

            if (!token) {
                return false;
            }

            var userProviders = this.filter(function(provider) {
                return provider.get('id') != 0;
            }).map(function(provider) {
                return {
                    provider: provider.get('id'),
                    user_order: provider.get('user_order'),
                    user_active: provider.get('user_active')
                };
            });

            var ajaxOptions = {
                url: globals['apiBaseUrl'] + 'user_provider/',
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: {
                    user_providers: JSON.stringify(userProviders)
                }
            };

            return Backbone.ajax(_.extend(ajaxOptions, options));
        }
    });

    return new Collection([{
        'id': 0,
        'name': 'FEED LIST'
    }]);
});

define([
    'backbone',
    'moment'
], function(
    Backbone,
    moment
) {

    var Model = Backbone.Model.extend({
        formatDateUpdated: function() {
            return moment(this.escape('date_updated')).format("D MMM");
        }
    });

    return Model;
});
define([
    'backbone',
    'models/globals',
    'jquery',
    'jquery-cookie'
], function(
    Backbone,
    globals,
    $
) {

    var Model = Backbone.Model.extend({
        url: globals['apiBaseUrl'] + 'current-user/',
        authorized: function() {
            return this.get('id') != undefined;
        },
        fetch: function(options) {
            var token = $.cookie('token');

            options = options || {};

            if (token) {
                options = _.extend(options, {
                    headers: {
                        Authorization: 'Token ' + token
                    }
                });
            }

            Backbone.Model.prototype.fetch.apply(this, [options]);
        }
    });

    return new Model();
});
define([
    'backbone',
    'models/globals',
    'moment'
], function(
    Backbone,
    globals,
    moment
) {

    var Model = Backbone.Model.extend({
        formatPublished: function() {
            return moment(this.escape('published')).format("D MMM YYYY hh:mm");
        },
        getTotalViews: function() {
            return parseInt(this.escape('views_count')) || 0;
        },
        getTotalLikes: function() {
            return (parseInt(this.escape('likes_count'))  || 0) + (parseInt(this.escape('provider_likes_count')) || 0);
        },
        getTotalComments: function() {
            return parseInt(this.escape('provider_comments_count')) || 0;
        },
        isInBoard: function(board) {
            return _.contains(this.get('boards'), board.get('id'));
        },
        isBoarded: function() {
            return this.get('boards').length > 0
        },
        isGif: function() {
            var img = _.first(this.get('images'));

            if (_.isUndefined(img.image) || _.isEmpty(img.image)) {
                return false;
            }

            return img.image.indexOf('.gif', img.image.length - '.gif'.length) !== -1;
        },
        toggleLike: function() {
            var token = $.cookie('token');
            var model = this;
            var like = !this.get('liked');
            var likesCount = like ? model.get('likes_count') + 1 : model.get('likes_count') - 1;
            var url = like ? globals['apiBaseUrl'] + 'feed_item_like/' : globals['apiBaseUrl'] + 'feed_item_like/' + this.get('id') + '/';
            var data = like ? {
                feed_item: this.get('id')
            } : {};

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: like ? 'POST' : 'DELETE',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: data,
                success: function() {
                    model.set('liked', like);
                    model.set('likes_count', likesCount);
                }
            });
        },
        addToBoard: function(board) {
            var token = $.cookie('token');
            var model = this;
            var url = globals['apiBaseUrl'] + 'board_feed_item/';
            var data = {
                feed_item: this.get('id'),
                board: board.get('id')
            };

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                data: data,
                success: function() {
                    var boards = model.get('boards');

                    boards.push(board.get('id'));

                    model.set('boards', boards);
                    model.set('boards_count', model.get('boards_count') + 1);
                }
            });
        },
        deleteFromBoard: function(board) {
            var token = $.cookie('token');
            var model = this;
            var url = globals['apiBaseUrl'] + 'board_feed_item/' + board.get('id') + '/' + this.get('id') + '/';

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'DELETE',
                headers: {
                    Authorization: 'Token ' + token
                },
                success: function() {
                    var boards = _.without(model.get('boards'), board.get('id'));

                    model.set('boards', boards);
                    model.set('boards_count', model.get('boards_count') - 1);
                }
            });
        },
        addView: function() {
            var model = this;
            var viewsCount = model.get('views_count') + 1;
            var url = globals['apiBaseUrl'] + 'feed_item/' + this.get('id') + '/add_view/';

            $.ajax({
                url: url,
                method: 'POST',
                success: function() {
                    model.set('views_count', viewsCount);
                }
            });
        }
    });

    return Model;
});
define([

], function(

) {
    var serverBaseUrl = 'http://local.flatun.com:8012/';
    //var serverBaseUrl = 'http://dev.flatun.com/';

    return {
        baseUrl: 'http://localhost:63342/flatun-web/',
        //baseUrl: 'http://dev.flatun.com/',
        serverBaseUrl: serverBaseUrl,
        apiBaseUrl: serverBaseUrl + 'api/'
    };
});
define([
    'backbone'
], function(
    Backbone
) {

    var Model = Backbone.Model.extend({

    });

    return Model;
});
define([
    'backbone',
    'models/globals'
], function(
    Backbone,
    globals
) {

    var Model = Backbone.Model.extend({
        defaults: {
            current: false
        },
        formatTags: function() {
            return _.map(this.get('tags'), function(tag) {
                return '#' + tag['name'];
            }).join(' ');
        },
        sync: function(method, model, options) {
            if (!_.isUndefined(options.form)) {
                var formData = new FormData(options.form);

                options = _.extend(options || {}, {
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                });
            }

            return Backbone.Model.prototype.sync.call(this, method, model, options);
        },
        toggleVote: function() {
            var token = $.cookie('token');
            var model = this;
            var vote = !this.get('voted');
            var votesCount = vote ? model.get('votes_count') + 1 : model.get('votes_count') - 1;
            var url = globals['apiBaseUrl'] + 'provider/' + this.get('id') + '/toggle_vote/';

            if (!token) {
                return false;
            }

            $.ajax({
                url: url,
                method: 'POST',
                headers: {
                    Authorization: 'Token ' + token
                },
                success: function() {
                    model.set('voted', vote);
                    model.set('votes_count', votesCount);
                }
            });
        }
    });

    return Model;
});
define([
    'backbone'
], function(
    Backbone
) {

    var Model = Backbone.Model.extend({

    });

    return Model;
});
define([
    'backbone',
    'jquery',
    'text!templates/add-board-feed-item-popup.html',
    'collections/boards',
    'views/popup',
    'views/board_item'
], function(
    Backbone,
    $,
    template,
    BoardsCollection,
    Popup,
    BoardView
) {

    var View = Popup.extend({
        template: _.template(template),
        addToBoards: [],
        deleteFromBoards: [],
        boardsCount: null,
        events: {
            'click .save': 'onSaveClicked',
            'click .create': 'onCreateBoardClicked'
        },
        $boards: function() { return this.$el.find('.choose-board-boards'); },
        initialize: function(feedItem) {
            this.feedItem = feedItem;
            this.boards = new BoardsCollection();
            this.boards.on('add', this.onItemAdd, this);
            this.on('show', this.onShow);
            Popup.prototype.initialize.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        },
        onShow: function() {
            var view = this;

            this.$boards().slick({
                arrows: false,
                centerMode: true,
                infinite: false,
                variableWidth: true,
                focusOnSelect: true,
                swipeToSlide: true
            });

            this.boards.fetch({
                success: function() {
                    if (view.boards.count != null) {
                        view.boardsCount = view.boards.count;
                        view.$el.find('.boards-count').text(view.boards.count);
                    }
                }
            });
        },
        onItemAdd: function(model, collection, options) {
            var view = new BoardView(model, this.feedItem);
            var $item = view.render().$el;

            view.on('board:clicked', this.onBoardClicked, this);

            this.$boards().slick('slickAdd', $item);
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

            var view = this;

            _.each(this.addToBoards, function(board) {
                view.feedItem.addToBoard(board);
            });

            _.each(this.deleteFromBoards, function(board) {
                view.feedItem.deleteFromBoard(board);
            });

            Backbone.router.closePopup();
        },
        onCreateBoardClicked: function(e) {
            e.preventDefault();

            Backbone.router.openCreateBoardPopup(this.boardsCount);
        }
    });

    return View;
});

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
        events: {
            'mouseenter .board-tile': 'onMouseEnter',
            'mouseleave .board-tile': 'onMouseLeave'
        },
        initialize: function(board) {
            this.board = board;
        },
        render: function() {
            this.$el.html(this.template({
                board: this.board
            }));
            return this;
        },
        onMouseEnter: function() {
            this.$el.find('.board-tile-container').addClass('hover');
        },
        onMouseLeave: function() {
            this.$el.find('.board-tile-container').removeClass('hover');
        }
    });

    return View;
});

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
        initialize: function(board, feedItem) {
            this.board = board;
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
            this.trigger('board:clicked', this);
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'text!templates/create-board-popup.html',
    'collections/boards',
    'views/popup'
], function(
    Backbone,
    $,
    template,
    BoardsCollection,
    Popup
) {

    var View = Popup.extend({
        boardsCount: null,
        template: _.template(template),
        events: {
            'click .cancel': 'onCancelClicked',
            'click .create': 'onCreateClicked',
            'focus .create-board-form-row-input': 'onInputFocus',
            'blur .create-board-form-row-input': 'onInputBlur'
        },
        initialize: function(options) {
            this.options = options || {};

            if (!_.isUndefined(this.options.boardsCount)) {
                this.boardsCount = this.options.boardsCount;
            }

            Popup.prototype.initialize.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                boardsCount: this.boardsCount
            }));
            return this;
        },
        onCancelClicked: function(e) {
            e.preventDefault();

            Backbone.router.closePopup();
        },
        onCreateClicked: function(e) {
            e.preventDefault();

            var view = this;

            this.$el.find('.create-board-form-row').removeClass('error');

            var board = new BoardsCollection().create({
                title: this.$el.find('[name="title"]').val(),
                description: this.$el.find('[name="description"]').val()
            }, {
                success: function() {
                    Backbone.router.closePopup();
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
                        var $row = view.$el.find('.create-board-form [name="' + field + '"]').parents('.create-board-form-row');
                        $row.addClass('error');
                    });
                });
            }
        },
        onInputFocus: function(e) {
            $(e.target).parents('.create-board-form-row').addClass('focus');
        },
        onInputBlur: function(e) {
            $(e.target).parents('.create-board-form-row').removeClass('focus');
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'text!templates/create-resource-popup.html',
    'collections/all_providers',
    'collections/languages',
    'collections/provider_tags',
    'views/popup',
    'FileAPI'
], function(
    Backbone,
    $,
    template,
    AllProvidersCollection,
    LanguagesCollection,
    ProviderTagsCollection,
    Popup
) {

    var View = Popup.extend({
        template: _.template(template),
        events: {
            'click .cancel': 'onCancelClicked',
            'click .create': 'onCreateClicked',
            'focus .create-resource-popup-form-row-input': 'onInputFocus',
            'blur .create-resource-popup-form-row-input': 'onInputBlur'
        },
        initialize: function(options) {
            this.options = options || {};
            this.languages = new LanguagesCollection();
            this.provider_tags = new ProviderTagsCollection();

            var view = this;

            this.languages.fetch({
                success: function() {
                    view.render();
                }
            });

            this.provider_tags.fetch({
                success: function() {
                    view.render();
                }
            });

            Popup.prototype.initialize.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                languages: this.languages,
                provider_tags: this.provider_tags
            }));
            this.initImageField();

            return this;
        },
        initImageField: function() {
            var $input = this.$el.find('[name="image"]');
            var view = this;

            FileAPI.event.on($input[0], 'change', function(e) {
                var files = FileAPI.getFiles(e);

                _.each(files, function(file, i) {
                    if (!/^image/.test(file.type)) {
                        return;
                    }

                    FileAPI.Image(file).resize(320, 240, 'max').get(function(err, preview) {
                        if (err) {
                            return;
                        }

                        var $preview = $(preview);

                        view.$el
                            .find('.create-resource-popup-form-image-preview')
                            .empty()
                            .append($preview)
                            .css('margin-top', (-1) * $preview.height() / 2);
                    });
                });
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

            this.$el.find('.create-resource-popup-form-row-item').removeClass('error');

            var provider = new AllProvidersCollection().create({}, {
                form: this.$el.find('.create-resource-popup-form')[0],
                success: function() {
                    Backbone.router.closePopup();
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

                _.each(errors, function(fieldErrors, field) {
                    _.each(fieldErrors, function(error) {
                        view.$el
                            .find('.create-resource-popup-form [name="' + field + '"]')
                            .parents('.create-resource-popup-form-row-item')
                            .addClass('error');
                    });
                });
            }
        },
        onInputFocus: function(e) {
            $(e.target).parents('.create-resource-popup-form-row-item').addClass('focus');
        },
        onInputBlur: function(e) {
            $(e.target).parents('.create-resource-popup-form-row-item').removeClass('focus');
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'models/current_user',
    'text!templates/sidebar-current-user.html'
], function(
    Backbone,
    $,
    currentUser,
    template
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        sidebarOpened: false,
        events: {
            'click .sidebar-current-user-link': 'onMenuOpenClick'
        },
        initialize: function() {
            this.on('show', this.onShow);
            currentUser.on('change', this.onUserUpdate, this);
        },
        render: function() {
            this.setElement(this.$el.html(this.template({
                currentUser: currentUser
            })));
            return this;
        },
        onUserUpdate: function() {
            this.render();
        },
        onShow: function() {

        },
        onMenuOpenClick: function(e) {
            e.preventDefault();

            var $block = this.$el.find('.sidebar-current-user');
            var $menu = this.$el.find('.sidebar-current-user-menu');
            var opened = $block.toggleClass('opened');

            if ($block.hasClass('opened')) {
                $menu.slideDown(200, 'swing');
            } else {
                $menu.slideUp(200, 'swing');
            }
        }
    });

    return View;
});
define([
    'backbone',
    'jquery',
    'text!templates/feed-images-popup.html',
    'views/popup',
    'slick'
], function(
    Backbone,
    $,
    template,
    Popup
) {

    var View = Popup.extend({
        $container: function() { return this.$el.find('.feed-images-popup-images'); },
        template: _.template(template),
        events: {

        },
        initialize: function(feedItem, initialSlide) {
            this.feedItem = feedItem;
            this.initialSlide = initialSlide || 0;
            this.on('show', this.onShow);
            this.$el.on('click', '.feed-images-popup-images-control-icon', this.onControlIconClicked);
            Popup.prototype.initialize.apply(this, []);
        },
        remove: function() {
            this.$el.off('click', '.feed-images-popup-images-control-icon', this.onControlIconClicked);
            Popup.prototype.remove.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                item: this.feedItem
            }));
            return this;
        },
        updateProgess: function() {
            var currentSlide = this.$container().slick('slickCurrentSlide') + 1;
            var totalSlides = this.feedItem.get('images').length;
            var percentage = 100 * currentSlide / totalSlides;

            this.$el.find('.feed-images-popup-header-progress-bar').width(percentage + '%');
            this.$el.find('.current-slide-number').text(currentSlide);
        },
        onShow: function() {
            var view = this;

            this.$container().slick({
                arrows: true,
                prevArrow: '<a href="#" class="feed-images-popup-images-control slick-prev prev"><span class="feed-images-popup-images-control-icon"></span></a>',
                nextArrow: '<a href="#" class="feed-images-popup-images-control slick-next next"><span class="feed-images-popup-images-control-icon"></span></a>',
                centerMode: true,
                centerPadding: '100px',
                infinite: false,
                variableWidth: true,
                focusOnSelect: true,
                swipeToSlide: true,
                initialSlide: this.initialSlide
            }).on('afterChange', function(event, slick, currentSlide) {
                view.updateProgess();
            });

            this.updateProgess();
        },
        onControlIconClicked: function(e) {
            e.preventDefault();
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'text!templates/feed-item.html',
    'gifffer'
], function(
    Backbone,
    $,
    template
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        showProvider: true,
        events: {
            'click .link': 'onLinkClicked',
            'click .tile-content': 'onTileClicked',
            'click .toggle-like': 'onLikeClicked',
            'click .add-to-board': 'onAddToBoardClicked'
        },
        initialize: function(feedItem, options) {
            this.feedItem = feedItem;
            this.options = options || {};

            if (!_.isUndefined(this.options.providerId)) {
                this.showProvider = this.options.providerId == 0;
            }

            this.feedItem.on('change:liked, change:likes_count', function() { this.onFeedItemLikesChanged() }, this);
        },
        render: function() {
            this.$el.html(this.template({
                item: this.feedItem,
                showProvider: this.showProvider,
                authorized: $.cookie('token') != undefined
            }));
            Gifffer();
            return this;
        },
        getFeedItemUrl: function() {
            if (!_.isUndefined(this.options.providerId)) {
                return 'provider/' + this.options.providerId + '/feed-item/' + this.feedItem.escape('id');
            } else if (!_.isUndefined(this.options.boardId)) {
                return 'board/' + this.options.boardId + '/feed-item/' + this.feedItem.escape('id');
            } else if (!_.isUndefined(this.options.liked)) {
                return 'liked/feed-item/' + this.feedItem.escape('id');
            } else {
                return 'provider/0/feed-item/' + this.feedItem.escape('id');
            }
        },
        onFeedItemLikesChanged: function() {
            this.$el
                .find('.toggle-like')
                .toggleClass('active', this.feedItem.get('liked'))
                .find('.tile-actions-item-label')
                .text(this.feedItem.get('likes_count'));
        },
        onLinkClicked: function(e) {
            e.stopPropagation();
        },
        onTileClicked: function(e) {
            e.preventDefault();

            Backbone.router.navigate(this.getFeedItemUrl(), { trigger: true });
        },
        onLikeClicked: function(e) {
            e.preventDefault();

            this.feedItem.toggleLike();
        },
        onAddToBoardClicked: function(e) {
            e.preventDefault();

            Backbone.router.openAddBoardFeedItemPopup(this.feedItem);
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'text!templates/feed-item-popup.html',
    'gifffer'
], function(
    Backbone,
    $,
    template
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        className: 'feed-popup-wrapper',
        events: {
            'click .feed-popup-expand-image': 'onExpandImageClicked'
        },
        initialize: function (feedItem, options) {
            this.feedItem = feedItem;
            this.options = options || {};
            this.showProvider = !_.isUndefined(this.options) ? this.options.showProvider : false;
        },
        render: function() {
            this.$el.html(this.template({
                item: this.feedItem,
                showProvider: this.showProvider
            }));
            this.initCarousel();
            Gifffer();
            return this;
        },
        initCarousel: function() {
            this.$el.find('.feed-popup-images').slick({
                arrows: false,
                centerMode: true,
                infinite: false,
                slidesToShow: 1,
                variableWidth: true,
                focusOnSelect: true,
                swipeToSlide: true
            });
        },
        onExpandImageClicked: function(e) {
            e.preventDefault();

            var $item = $(e.target).parents('.feed-popup-images-item-container');
            var initialSlide = $item.length > 0 ? $item.index() : 0;

            Backbone.router.openFeedImagesPopup(this.feedItem, initialSlide);
        }
    });

    return View;
});
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
    'text!templates/feed-item-popups.html'
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
    template
) {

    var View = Popup.extend({
        $scrollable: function() { return $('.popup-background'); },
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

            Popup.prototype.initialize.apply(this, []);
        },
        remove: function() {
            $(document).off('keydown', this.onKeyDown);
            Popup.prototype.remove.apply(this, []);
        },
        render: function() {
            this.$el.html(this.template({
                'item': this.feedItem,
                'show_provider': true
            }));
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

            this.$scrollable().on('scroll', function() {
                view.onContainerScroll();
            });

            this.openFeedItem(this.itemId, 0);
        },
        onItemAdd: function(model, collection, options) {
            var $item = new FeedItemPopupView(model, { showProvider: this.showProvider }).render().$el;

            if (options.append) {
                this.$container().append($item);
            } else {
                this.$container().prepend($item);
                this.addScrollTop += $item.outerHeight();
            }

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
                $wrapper.find('.slick-slider').slick('slickPrev');
            }
        },
        nextFeedItemImage: function() {
            var $wrapper = this.currentPopupWrapper();
            if ($wrapper) {
                $wrapper.find('.slick-slider').slick('slickNext');
            }
        }
    });

    return View;
});
define([
    'backbone',
    'jquery',
    'text!templates/provider.html',
    'views/feed_item',
    'collections/feed_items',
    'collections/providers',
    'masonry-layout'
], function(
    Backbone,
    $,
    template,
    FeedItemView,
    FeedItemsCollection,
    providers
) {

    var View = Backbone.View.extend({
        className: 'FeedItemsView',
        $scrollable: $('.scrollable-container'),
        $container: function() { return this.$el.find('.tiles') },
        $shareButton: function() { return this.$el.find('.share-button'); },
        loadMoreOnSpaceLeft: 400,
        loading: false,
        template: _.template(template),
        events: {
            'click .share-button': 'onShareButtonClicked'
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
                providers.setCurrent(null);
            }

            if (!_.isUndefined(this.options.liked)) {
                this.feedItems.liked = this.options.liked;
                providers.setCurrent(null);
            }

            this.on('show', this.onShow);
            //this.feedItems.on('add', this.onItemAdd, this);
        },
        render: function() {
            this.$el.html(this.template());
            return this;
        },
        onItemAdd: function(model, collection, options) {
            console.log('add');
            var $item = new FeedItemView(model, this.options).render().$el;
            this.$container().append($item).masonry('appended', $item).masonry();

            $item.fadeIn();


        //    var $newElems = $( newElements ).css({ opacity: 0 });
        //// ensure that images load before adding to masonry layout
        //$newElems.imagesLoaded(function(){
        //  // show elems now they're ready
        //  $newElems.animate({ opacity: 1 });
        },
        onShow: function() {
            var view = this;
            this.$scrollable.scroll(function () {
                view.fetchItemsIfNeeded();
            });

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
            //this.$container().masonry('layout');
            this.loading = false;
            this.fetchItemsIfNeeded();
        },
        reloadItems: function() {
            //this.$container().empty();
            //this.$container().masonry('layout');

            this.fetchItems();
        },
        fetchItems: function() {
            if (this.loading) {
                return;
            }

            var view = this;

            this.loading = true;
            this.feedItems.fetch({
                success: function() { view.finishLoading(); },
                remove: false
            });
        },
        fetchItemsIfNeeded: function () {
            var spaceLeft = this.$scrollable.get(0).scrollHeight - (this.$scrollable.scrollTop() + this.$scrollable.height());

            if (spaceLeft < this.loadMoreOnSpaceLeft && this.feedItems.isFetchable()) {
                this.fetchItems();
            }
        },
        initLayout: function () {
            //this.$container().find('.feed-item').css('opacity', '0');
            //var view = this;
            //
            //this.$container().on('layoutComplete', function (event, items) {
            //    view.$container().find('.feed-item').animate({opacity: 1}, 500);
            //    view.$container().off('layoutComplete');
            //});

            this.$container().masonry({
                itemSelector: '.feed-item',
                columnWidth: '.feed-item',
                percentPosition: true
            });
            this.$container().masonry();

            console.log('init');

            this.feedItems.on('add', this.onItemAdd, this);
        },
        onShareButtonClicked: function(e) {
            e.preventDefault();

            Backbone.router.openSharePopup();
        }
    });

    return View
});
define([
    'backbone',
    'jquery',
    'urijs/URI',
    'jquery-cookie',
    'text!templates/login-complete.html'
], function(
    Backbone,
    $,
    URI,
    jQueryCookie,
    template
) {

    var View = Backbone.View.extend({
        message: null,
        template: _.template(template),
        initialize: function() {
            this.processParams();
        },
        render: function() {
            this.$el.html(this.template({
                message: this.message
            }));
            return this;
        },
        processParams: function() {
            var url = URI(document.URL);

            var token = url.query(true)['token'];
            if (token) {
                $.cookie('token', token);
                url = url.query('').hash('');
                window.location = url;
            }

            var message = url.query(true)['message'];
            if (message) {
                this.message = message;
            }
        }
    });

    return View;
});
define([
    'backbone',
    'jquery'
], function(
    Backbone,
    $
) {

    var View = Backbone.View.extend({
        initialize: function() {
            $.removeCookie('token');
            Backbone.router.navigate('');
            location.reload();
        }
    });

    return View;
});
define([
    'backbone',
    'jquery',
    'text!templates/my-boards.html',
    'views/board',
    'collections/boards',
    'masonry-layout'
], function(
    Backbone,
    $,
    template,
    BoardView,
    BoardsCollection
) {

    var View = Backbone.View.extend({
        $scrollable: $('.scrollable-container'),
        $container: function() { return this.$el.find('.board-tiles') },
        loadMoreOnSpaceLeft: 400,
        loading: false,
        template: _.template(template),
        initialize: function() {
            this.boards = new BoardsCollection();
            this.boards.on('add', this.onItemAdd, this);
            this.on('show', this.onShow);
        },
        render: function() {
            this.$el.html(this.template());
            return this;
        },
        onItemAdd: function(model, collection, options) {
            var $item = new BoardView(model).render().$el;
            this.$container().append($item).masonry('appended', $item);
        },
        onShow: function() {
            var view = this;
            this.$scrollable.scroll(function () {
                view.fetchItemsIfNeeded();
            });

            this.initLayout();
            this.reloadItems();
        },

        finishLoading: function() {
            this.$container().masonry('layout');
            this.loading = false;
            this.fetchItemsIfNeeded();
        },
        reloadItems: function() {
            this.$container().empty();
            this.$container().masonry('layout');

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
            var spaceLeft = this.$scrollable.get(0).scrollHeight - (this.$scrollable.scrollTop() + this.$scrollable.height());

            if (spaceLeft < this.loadMoreOnSpaceLeft && this.boards.isFetchable()) {
                this.fetchItems();
            }
        },
        initLayout: function () {
            this.$container().find('.board-tile-container').css('opacity', '0');
            var view = this;

            this.$container().on('layoutComplete', function (event, items) {
                view.$container().find('.board-tile-container').animate({opacity: 1}, 500);
                view.$container().off('layoutComplete');
            });

            this.$container().masonry({
                itemSelector: '.board-tile-container',
                columnWidth: '.board-tile-container',
                percentPosition: true
            });
        }
    });

    return View
});
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

define([
    'backbone',
    'jquery',
    'text!templates/resource.html',
    'models/current_user'
], function(
    Backbone,
    $,
    template,
    currentUser
) {

    var View = Backbone.View.extend({
        board: null,
        template: _.template(template),
        events: {
            'click .vote-resource': 'onVoteResourceClicked'
        },
        initialize: function(provider) {
            this.provider = provider;
            this.provider.on('change:voted, change:votes_count', function() { this.onProviderVotesChanged() }, this);
        },
        render: function() {
            this.$el.html(this.template({
                provider: this.provider,
                currentUser: currentUser
            }));
            return this;
        },
        onVoteResourceClicked: function(e) {
            e.preventDefault();

            this.provider.toggleVote();
        },
        onProviderVotesChanged: function() {
            this.$el.find('.resource-tile-vote').toggleClass('active', this.provider.get('voted'));
            this.$el.find('.resource-tile-vote-counter').text(this.provider.escape('votes_count'));
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'text!templates/resources.html',
    'views/resource',
    'collections/all_providers',
    'collections/languages',
    'collections/provider_tags',
    'masonry-layout',
    'select2'
], function(
    Backbone,
    $,
    template,
    ResourceView,
    AllProvidersCollection,
    LanguagesCollection,
    ProviderTagsCollection
) {

    var View = Backbone.View.extend({
        $scrollable: $('.scrollable-container'),
        $container: function() { return this.$el.find('.resource-tiles') },
        loadMoreOnSpaceLeft: 400,
        loading: false,
        template: _.template(template),
        events: {
            'click .create-resource': 'onCreateResourceClicked',
            'change select': 'onFiltersUpdated'
        },
        initialize: function() {
            this.providers = new AllProvidersCollection();
            this.languages = new LanguagesCollection();
            this.provider_tags = new ProviderTagsCollection();
            this.providers.on('add', this.onItemAdd, this);
            this.on('show', this.onShow);

            var view = this;

            this.languages.fetch({
                success: function() {
                    view.render();
                }
            });
            this.provider_tags.fetch({
                success: function() {
                    view.render();
                }
            });
        },
        render: function() {
            this.$el.html(this.template({
                languages: this.languages,
                provider_tags: this.provider_tags
            }));

            this.$el.find('select').each(function() {
                var $select = $(this);
                var options = {
                    theme: 'flatun',
                    minimumResultsForSearch: -1
                };

                if ($select.data('placeholder')) {
                    options = _.extend(options, {
                        placeholder: $select.data('placeholder')
                    })
                }

                $select.select2(options);
            });


            return this;
        },
        onItemAdd: function(model, collection, options) {
            var $item = new ResourceView(model).render().$el;
            this.$container().append($item).masonry('appended', $item);
        },
        onShow: function() {
            var view = this;
            this.$scrollable.scroll(function () {
                view.fetchItemsIfNeeded();
            });

            this.initLayout();
            this.reloadItems();
        },

        finishLoading: function() {
            this.$container().masonry('layout');
            this.loading = false;
            this.fetchItemsIfNeeded();
        },
        reloadItems: function() {
            this.$container().empty();
            this.$container().masonry('layout');

            this.fetchItems();
        },
        fetchItems: function() {
            if (this.loading) {
                return;
            }

            var view = this;

            this.loading = true;
            this.providers.fetch({
                success: function() { view.finishLoading(); },
                data: this.getCurrentFilters(),
                remove: false
            });
        },
        fetchItemsIfNeeded: function () {
            var spaceLeft = this.$scrollable.get(0).scrollHeight - (this.$scrollable.scrollTop() + this.$scrollable.height());

            if (spaceLeft < this.loadMoreOnSpaceLeft && this.providers.isFetchable()) {
                this.fetchItems();
            }
        },
        initLayout: function () {
            this.$container().find('.resource-tile-container').css('opacity', '0');
            var view = this;

            this.$container().on('layoutComplete', function (event, items) {
                view.$container().find('.resource-tile-container').animate({opacity: 1}, 500);
                view.$container().off('layoutComplete');
            });

            this.$container().masonry({
                itemSelector: '.resource-tile-container',
                columnWidth: '.resource-tile-container',
                percentPosition: true
            });
        },
        getCurrentFilters: function() {
            var filters = {};
            var language = this.$el.find('select[name="language"] option:selected').val();
            var tags = this.$el.find('select[name="tags"] option:selected').val();

            if (!_.isEmpty(language)) {
                filters['language'] = language;
            }

            if (!_.isEmpty(tags)) {
                filters['tags'] = tags;
            }

            return filters;
        },
        onCreateResourceClicked: function(e) {
            e.preventDefault();

            Backbone.router.openCreateResourcePopup();
        },
        onFiltersUpdated: function() {
            this.$container().empty();
            this.providers.reset();
            this.fetchItems();
        }
    });

    return View
});
define([
    'backbone',
    'jquery',
    'text!templates/settings-popup.html',
    'collections/providers',
    'views/popup',
    'jquery-ui'
], function(
    Backbone,
    $,
    template,
    providers,
    Popup
) {

    var View = Popup.extend({
        template: _.template(template),
        events: {
            'click .settings-popup-providers-item-switch': 'onSwitchClicked',
            'click .settings-popup-header-submit': 'onSubmitClicked'
        },
        render: function() {
            this.$el.html(this.template({
                providers: providers
            }));

            this.$el.find('.settings-popup-providers').sortable({
				items: '.settings-popup-providers-item.sortable',
				axis: 'y',
				scroll: true,
				cursor: 'move'
			});

            return this;
        },
        onSwitchClicked: function(e) {
            e.preventDefault();

            var $switch = $(e.target).closest('.settings-popup-providers-item-switch');
            var $item = $switch.parents('.settings-popup-providers-item');

            $switch.toggleClass('checked');
            $item.toggleClass('active', $switch.hasClass('checked'));
        },
        onSubmitClicked: function(e) {
            e.preventDefault();

            this.$el.find('.settings-popup-providers-item.sortable').each(function(i) {
                var $item = $(this);
                var $switch = $item.find('.settings-popup-providers-item-switch');
                var provider = providers.findWhere({id: parseInt($item.data('provider-id'))});

                if (provider != undefined) {
                    provider.set('user_order', i + 1);
                    provider.set('user_active', $switch.hasClass('checked'));
                }
            });

            providers.save({
                success: function() {
                    Backbone.router.closePopup();
                },
                error: function() {
                    alert('error');
                }
            });
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'views/popup',
    'text!templates/share-popup.html'
], function(
    Backbone,
    $,
    Popup,
    template
) {

    var View = Popup.extend({
        template: _.template(template),
        render: function() {
            this.$el.html(this.template());
            return this;
        }
    });

    return View;
});

define([
    'backbone',
    'jquery',
    'collections/providers',
    'views/current_user',
    'text!templates/sidebar.html',
    'perfect-scrollbar'
], function(
    Backbone,
    $,
    providers,
    CurrentUserView,
    template
) {

    var View = Backbone.View.extend({
        feedItem: null,
        template: _.template(template),
        sidebarOpened: false,
        events: {
            'click .open-settings': 'onOpenSettingsClicked',
            'click .create-resource': 'onCreateResourceClicked'
        },
        initialize: function() {
            this.on('show', this.onShow);
            this.providers = providers;
            this.providers.on('add remove change', this.render, this);
        },
        render: function() {
            this.setElement(this.$el.html(this.template({
                providers: this.providers.filter(function(provider) {
                    return provider.get('user_active') == undefined || provider.get('user_active'); }
                )
            })));
            this.$el.find('.sidebar-current-user-container').append(new CurrentUserView().render().$el);
            this.updateSidebarState();
            return this;
        },
        setSidebarOpened: function(value) {
            this.sidebarOpened = value;
            this.updateSidebarState();
        },
        onShow: function() {
            var $sidebar = this.$el;
            var view = this;

            //if (!IS_MOBILE) {
                $sidebar.on('mouseenter', function () {
                    view.setSidebarOpened(true);
                });

                $sidebar.on('mouseleave', function () {
                    view.setSidebarOpened(false);
                });
            //}

            $('.menu-open').on('click', function() {
                view.setSidebarOpened(!view.sidebarOpened);
            });

            //if (!IS_MOBILE) {
                $sidebar.perfectScrollbar({
                    suppressScrollX: true
                });
            //}
        },
        updateSidebarState: function() {
            $('.menu-depended').toggleClass('menu-opened', this.sidebarOpened);
        },
        onOpenSettingsClicked: function(e) {
            e.preventDefault();

            Backbone.router.openSettingsPopup();
        },
        onCreateResourceClicked: function(e) {
            e.preventDefault();

            Backbone.router.openCreateResourcePopup();
        }
    });

    return View;
});
var d = document;

var Gifffer = function () {
    var images, i = 0;

    images = d.querySelectorAll('[data-gifffer]');
    for (; i < images.length; ++i) process(images[i]);
};

function formatUnit(v) {
    return v + (v.toString().indexOf('%') > 0 ? '' : 'px');
};

function createContainer(w, h, el) {
    var con = d.createElement('DIV');
    var cls = el.getAttribute('class');
    var id = el.getAttribute('id');

    cls ? con.setAttribute('class', el.getAttribute('class')) : null;
    id ? con.setAttribute('id', el.getAttribute('id')) : null;
    con.setAttribute('style', 'cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;');

    // creating play button
    var play = d.createElement('DIV');
    play.setAttribute('class', 'gifffer-play-button');

    var trngl = d.createElement('DIV');
    trngl.setAttribute('class', 'gifffer-play-button-trngl');
    play.appendChild(trngl);

    // dom placement
    con.appendChild(play);
    el.parentNode.replaceChild(con, el);
    return {c: con, p: play};
};

function calculatePercentageDim(el, w, h, wOrig, hOrig) {
    var parentDimW = el.parentNode.offsetWidth;
    var parentDimH = el.parentNode.offsetHeight;
    var ratio = wOrig / hOrig;

    if (w.toString().indexOf('%') > 0) {
        w = parseInt(w.toString().replace('%', ''));
        w = (w / 100) * parentDimW;
        h = w / ratio;
    }

    return {w: w, h: h};
};

function process(el) {
    var url, con, c, w, h, duration, play, gif, playing = false, cc, isC, durationTimeout, dims;

    url = el.getAttribute('data-gifffer');
    w = el.getAttribute('data-gifffer-width');
    h = el.getAttribute('data-gifffer-height');
    duration = el.getAttribute('data-gifffer-duration');
    el.style.display = 'block';

    // creating the canvas
    c = document.createElement('canvas');
    isC = !!(c.getContext && c.getContext('2d'));
    if (w && h && isC) cc = createContainer(w, h, el);

    // waiting for image load
    el.onload = function () {
        if (!isC) return;

        w = w || el.width;
        h = h || el.height;

        // creating the container
        if (!cc) cc = createContainer(w, h, el);
        con = cc.c;
        play = cc.p;
        dims = calculatePercentageDim(con, w, h, el.width, el.height);

        // listening for image click
        con.addEventListener('click', function () {
            clearTimeout(durationTimeout);
            if (!playing) {
                playing = true;
                gif = document.createElement('IMG');
                gif.setAttribute('style', 'width:' + dims.w + 'px;height:' + dims.h + 'px;');
                gif.setAttribute('data-uri', Math.floor(Math.random() * 100000) + 1);
                setTimeout(function () {
                    gif.src = url;
                }, 0);
                con.removeChild(play);
                con.removeChild(c);
                con.appendChild(gif);
                if (parseInt(duration) > 0) {
                    durationTimeout = setTimeout(function () {
                        playing = false;
                        con.appendChild(play);
                        con.removeChild(gif);
                        con.appendChild(c);
                        gif = null;
                    }, duration);
                }
            } else {
                playing = false;
                con.appendChild(play);
                con.removeChild(gif);
                con.appendChild(c);
                gif = null;
            }
        });

        // canvas
        c.width = dims.w;
        c.height = dims.h;
        c.getContext('2d').drawImage(el, 0, 0, dims.w, dims.h);
        con.appendChild(c);

    }
    el.src = url;
};
