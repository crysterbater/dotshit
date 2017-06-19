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
        'moment': '../bower_components/moment/min/moment.min',
        'fastclick': '../bower_components/fastclick/lib/fastclick',
        'flickity': '../bower_components/flickity/dist/flickity.pkgd.min',
        'smart-app-banner': '../bower_components/smart-app-banner/smart-app-banner',
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

});

require(['main'], function() {});