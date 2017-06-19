$(document).ready(function() {
    HandlebarsIntl.registerWith(Handlebars);

    var $loading = $('.loading-spinner');
    var $menu = $('.sidebar-menu');
    var $feed = $('.feed');
    var $scrollable = $('.container');
    var menuItemTemplate = Handlebars.compile($menu.find('> .template').html());
    var feedItemTemplate = Handlebars.compile($feed.find('> .template').html());
    var HOST_URL = 'http://flatun.com/';
    var API_PROVIDER_URL = HOST_URL + 'api/provider/';
    var API_FEED_URL = HOST_URL + 'api/feed_item/';
    var loadMoreOnSpaceLeft = 400;
    var feedPage = 1;
    var feedLimit = 10;
    var feedCount = 0;
    var loading = false;
    var providerId = false;

    var openFeedUrl = function(providerId, id) {
        return HOST_URL + '#/provider/'+ providerId + '/feed-item/' + id;
    };

    var fetchProviders = function() {
        $loading.show();
        $menu.hide();

        $.ajax({
            url: API_PROVIDER_URL,
            type: 'GET',
            success: function (result) {
                $menu.append(menuItemTemplate({
                    provider: {
                        id: 0,
                        all: true
                    }
                }));

                result.forEach(function (provider) {
                    $menu.append(menuItemTemplate({
                        provider: provider
                    }));
                });

                selectProvider(0);
            },
            error: function (result) {
                console.log(result);
                setLoading(false);
            }
        });
    };

    var selectProvider = function(id) {
        if (providerId != false && providerId == id) {
            return;
        }

        providerId = id;

        $('.sidebar-menu-item')
            .removeClass('selected')
            .filter('[data-provider-id="' + id + '"]')
            .addClass('selected');

        $feed.empty();
        fetchItems(providerId, null);
    };

    var setLoading = function(value) {
        loading = value;

        if (!loading) {
            fetchItemsIfNeeded();
        }
    };

    var fetchItems = function(provider, page) {
        setLoading(true);

        var data = {
            provider_id: provider
        };

        if (page) {
            data['page'] = page;
        } else {
            $feed.hide();
        }

        $.ajax({
            url: API_FEED_URL,
            type: 'GET',
            data: data,
            success: function (result) {
                result.results.forEach(function (item) {
                    for (var i = 0; i < item.images.length; ++i) {
                        item.images[i].paddingTop = (100 * item.images[i].height/ item.images[i].width) + '%';
                    }

                    $feed.append(feedItemTemplate({
                        item: item,
                        show_provider: provider == 0,
                        provider_id: provider
                    }));
                });

                feedPage = page;
                feedCount = result.count;

                $loading.hide();
                $menu.show();

                if (!page) {
                    $feed.fadeIn();
                }

                setLoading(false);
            },
            error: function (result) {
                console.log(result);

                $loading.hide();
                setLoading(false);
            }
        });
    };

    var fetchItemsIfNeeded = function() {
        var spaceLeft = $scrollable.get(0).scrollHeight - ($scrollable.scrollTop() + $scrollable.height());

        if (spaceLeft < loadMoreOnSpaceLeft && feedPage * feedLimit < feedCount) {
            fetchItems(providerId, feedPage + 1);
        }
    };

    $scrollable.scroll(function() {
        if (loading) {
            return;
        }

        fetchItemsIfNeeded();
    });

    fetchProviders();

    $menu.on('mouseenter', '.open-feed', function() {
        var providerId = $(this).data('provider-id');
        selectProvider(providerId);
    });

    $feed.on('click', '.open-feed-item', function() {
        var providerId = $(this).data('provider-id');
        var feedItemId = $(this).data('feed-item-id');
        chrome.tabs.create({
            url: openFeedUrl(providerId, feedItemId)
        });
    });
});