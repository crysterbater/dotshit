var __cachedImages = new Array();

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        if (this.endsWith('@2x.png') && !isRetina()) {
            return;
        } else if (this.endsWith('.png') && isRetina()) {
            return;
        }

        var image = new Image();
        image.src = this + '?md5';
        __cachedImages.push(image);
    });
}

function isRetina() {
    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

preload([

    'images/action-cross-hover.svg',

    'images/action-cross.svg',

    'images/action-tick-hover.svg',

    'images/action-tick.svg',

    'images/all-providers.svg',

    'images/arrow-down.svg',

    'images/arrow-left.svg',

    'images/arrow-right.svg',

    'images/arrow-up.svg',

    'images/boards-empty.svg',

    'images/button-dribble-hover.svg',

    'images/button-dribble.svg',

    'images/button-facebook-hover.svg',

    'images/button-facebook.svg',

    'images/button-google-plus-hover.svg',

    'images/button-google-plus.svg',

    'images/button-twitter-hover.svg',

    'images/button-twitter.svg',

    'images/checked.svg',

    'images/checkmark.svg',

    'images/comments_counter.svg',

    'images/cross-hover.svg',

    'images/cross-small-hover.svg',

    'images/cross-small.svg',

    'images/cross.svg',

    'images/dots-vertical.svg',

    'images/dribble-dark.svg',

    'images/dribble-hover.svg',

    'images/edit.svg',

    'images/external-dark-hover.svg',

    'images/external-dark.svg',

    'images/external-hover.svg',

    'images/external.svg',

    'images/facebook-dark.svg',

    'images/facebook-hover.svg',

    'images/facebook.svg',

    'images/folder-color.svg',

    'images/folder-dark.svg',

    'images/folder-hover.svg',

    'images/folder.svg',

    'images/fullscreen.svg',

    'images/gif.svg',

    'images/google-plus-dark.svg',

    'images/google-plus-hover.svg',

    'images/google-plus.svg',

    'images/header-back.svg',

    'images/header-cross.svg',

    'images/header-menu.svg',

    'images/image.svg',

    'images/like-color-bordered.svg',

    'images/like-color.svg',

    'images/like-dark.svg',

    'images/like-hover.svg',

    'images/like-light.svg',

    'images/like.svg',

    'images/likes-empty.svg',

    'images/likes_counter.svg',

    'images/list-hover.svg',

    'images/list.svg',

    'images/login.svg',

    'images/logo-stamp.svg',

    'images/logo.svg',

    'images/logout-dark.svg',

    'images/logout-hover.svg',

    'images/logout.svg',

    'images/play.svg',

    'images/plus-hover.svg',

    'images/plus.svg',

    'images/settings-dark.svg',

    'images/settings-hover.svg',

    'images/settings.svg',

    'images/share-hover.svg',

    'images/share.svg',

    'images/share_dribble.svg',

    'images/share_facebook.svg',

    'images/share_google_plus.svg',

    'images/share_twitter.svg',

    'images/share_vk.svg',

    'images/sublogo.svg',

    'images/trash-hover.svg',

    'images/trash.svg',

    'images/twitter-dark.svg',

    'images/twitter-hover.svg',

    'images/twitter.svg',

    'images/views-light.svg',

    'images/views_counter.svg',

    'images/votes-hover.svg',

    'images/votes.svg',

    'images/board-empty-image.png',

    'images/board-empty-image@2x.png',

    'images/boards-empty.png',

    'images/boards-empty@2x.png',

    'images/flatstudio.png',

    'images/flatstudio@2x.png',

    'images/flatstudio_hover.png',

    'images/flatstudio_hover@2x.png',

    'images/flatun.png',

    'images/flatun@2x.png',

    'images/likes-empty.png',

    'images/likes-empty@2x.png',

    'images/login-popup-logo.png',

    'images/login-popup-logo@2x.png',

    'images/logo-mini.png',

    'images/logo-mini@2x.png',

    'images/logo.png',

    'images/logo@2x.png',

    'images/menu-dots.png',

    'images/menu-dots@2x.png',

]);