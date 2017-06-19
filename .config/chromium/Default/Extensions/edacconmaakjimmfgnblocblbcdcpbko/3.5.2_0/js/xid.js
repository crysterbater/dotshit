/* Copyright (c) 2017 Session Buddy - All Rights Reserved */
/* The contents of this file may not be modified, copied, and/or distributed, in whole or in part, without the express permission of the author, reachable at support@sessionbuddy.com */

(function(win) {
    'use strict';
    var BUFFER_SIZE = 64;
    var CRYPTO = win.crypto || win.msCrypto;
    var BUFFER = new Uint8Array(BUFFER_SIZE);
    var BUFFER_IDX = BUFFER_SIZE;
    var SYM = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var TOP = SYM.length + 1;
    var FACTOR = 0;
    while ((FACTOR + 1) * SYM.length < 257) {
        FACTOR++;
    }
    function xid() {
        return SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()] + SYM[ridx()];
    }
    function ridx() {
        if (BUFFER_IDX >= BUFFER_SIZE) {
            CRYPTO.getRandomValues(BUFFER);
            BUFFER_IDX = 0;
        }
        var idx = BUFFER[BUFFER_IDX++];
        for (var i = 1; i < TOP; i++) {
            if (idx < i * FACTOR) {
                return i - 1;
            }
        }
        return ridx();
    }
    win.xid = xid;
})(window);