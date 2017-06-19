(function (win, doc) {
    'use strict';

    window.onload = function () {
        setTimeout(function () {

            let cvs = doc.querySelector('canvas'),
                ctx = cvs.getContext('2d');
            cvs.width = 38;
            cvs.height = 38;

            ctx.fillStyle = '#FFF';
            ctx.fillRect(10, 10, 18, 18);
            ctx.font = '38px "MaterialDesignIcons"';
            ctx.fillStyle = '#ff4080';
            ctx.fillText('\uf2cb', (38 - ctx.measureText('\uf2cb').width) / 2, 35, 38);

            chrome.browserAction.setIcon({imageData: {38: ctx.getImageData(0, 0, 38, 38)}});

        }, 1000);

    };

})(window, document);