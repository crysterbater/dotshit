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
<% _.each(files, function(file) { %>
    '<%= file.src %>',
<% }) %>
]);