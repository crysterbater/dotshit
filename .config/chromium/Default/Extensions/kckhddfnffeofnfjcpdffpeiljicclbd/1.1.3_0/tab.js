

(function(scope) {

/**
  `Polymer.CoreResizable` and `Polymer.CoreResizer` are a set of mixins that can be used
  in Polymer elements to coordinate the flow of resize events between "resizers" (elements
  that control the size or hidden state of their children) and "resizables" (elements that
  need to be notified when they are resized or un-hidden by their parents in order to take
  action on their new measurements).

  Elements that perform measurement should add the `Core.Resizable` mixin to their 
  Polymer prototype definition and listen for the `core-resize` event on themselves.
  This event will be fired when they become showing after having been hidden,
  when they are resized explicitly by a `CoreResizer`, or when the window has been resized.
  Note, the `core-resize` event is non-bubbling.

  `CoreResizable`'s must manually call the `resizableAttachedHandler` from the element's
  `attached` callback and `resizableDetachedHandler` from the element's `detached`
  callback.

    @element CoreResizable
    @status beta
    @homepage github.io
*/

  scope.CoreResizable = {

    /**
     * User must call from `attached` callback
     *
     * @method resizableAttachedHandler
     */
    resizableAttachedHandler: function(cb) {
      cb = cb || this._notifyResizeSelf;
      this.async(function() {
        var detail = {callback: cb, hasParentResizer: false};
        this.fire('core-request-resize', detail);
        if (!detail.hasParentResizer) {
          this._boundWindowResizeHandler = cb.bind(this);
          // log('adding window resize handler', null, this);
          window.addEventListener('resize', this._boundWindowResizeHandler);
        }
      }.bind(this));
    },

    /**
     * User must call from `detached` callback
     *
     * @method resizableDetachedHandler
     */
    resizableDetachedHandler: function() {
      this.fire('core-request-resize-cancel', null, this, false);
      if (this._boundWindowResizeHandler) {
        window.removeEventListener('resize', this._boundWindowResizeHandler);
      }
    },

    // Private: fire non-bubbling resize event to self; returns whether
    // preventDefault was called, indicating that children should not
    // be resized
    _notifyResizeSelf: function() {
      return this.fire('core-resize', null, this, false).defaultPrevented;
    }

  };

/**
  `Polymer.CoreResizable` and `Polymer.CoreResizer` are a set of mixins that can be used
  in Polymer elements to coordinate the flow of resize events between "resizers" (elements
  that control the size or hidden state of their children) and "resizables" (elements that
  need to be notified when they are resized or un-hidden by their parents in order to take
  action on their new measurements).

  Elements that cause their children to be resized (e.g. a splitter control) or hide/show
  their children (e.g. overlay) should add the `Core.CoreResizer` mixin to their 
  Polymer prototype definition and then call `this.notifyResize()` any time the element
  resizes or un-hides its children.

  `CoreResizer`'s must manually call the `resizerAttachedHandler` from the element's
  `attached` callback and `resizerDetachedHandler` from the element's `detached`
  callback.

  Note: `CoreResizer` extends `CoreResizable`, and can listen for the `core-resize` event
  on itself if it needs to perform resize work on itself before notifying children.
  In this case, returning `false` from the `core-resize` event handler (or calling
  `preventDefault` on the event) will prevent notification of children if required.

  @element CoreResizer
  @extends CoreResizable
  @status beta
  @homepage github.io
*/

  scope.CoreResizer = Polymer.mixin({

    /**
     * User must call from `attached` callback
     *
     * @method resizerAttachedHandler
     */
    resizerAttachedHandler: function() {
      this.resizableAttachedHandler(this.notifyResize);
      this._boundResizeRequested = this._boundResizeRequested || this._handleResizeRequested.bind(this);
      var listener;
      if (this.resizerIsPeer) {
        listener = this.parentElement || (this.parentNode && this.parentNode.host);
        listener._resizerPeers = listener._resizerPeers || [];
        listener._resizerPeers.push(this);
      } else {
        listener = this;
      }
      listener.addEventListener('core-request-resize', this._boundResizeRequested);
      this._resizerListener = listener;
    },

    /**
     * User must call from `detached` callback
     *
     * @method resizerDetachedHandler
     */
    resizerDetachedHandler: function() {
      this.resizableDetachedHandler();
      this._resizerListener.removeEventListener('core-request-resize', this._boundResizeRequested);
    },

    /**
     * User should call when resizing or un-hiding children
     *
     * @method notifyResize
     */
    notifyResize: function() {
      // Notify self
      if (!this._notifyResizeSelf()) {
        // Notify requestors if default was not prevented
        var r = this.resizeRequestors;
        if (r) {
          for (var i=0; i<r.length; i++) {
            var ri = r[i];
            if (!this.resizerShouldNotify || this.resizerShouldNotify(ri.target)) {
              // log('notifying resize', null, ri.target, true);
              ri.callback.apply(ri.target);
              // logEnd();
            }
          }
        }
      }
    },

    /**
     * User should implement to introduce filtering when notifying children.
     * Generally, children that are hidden by the CoreResizer (e.g. non-active
     * pages) need not be notified during resize, since they will be notified
     * again when becoming un-hidden.
     *
     * Return `true` if CoreResizable passed as argument should be notified of
     * resize.
     *
     * @method resizeerShouldNotify
     * @param {Element} el
     */
     // resizeerShouldNotify: function(el) { }  // User to implement if needed

    /**
     * Set to `true` if the resizer is actually a peer to the elements it
     * resizes (e.g. splitter); in this case it will listen for resize requests
     * events from its peers on its parent.
     *
     * @property resizerIsPeer
     * @type Boolean
     * @default false
     */

    // Private: Handle requests for resize
    _handleResizeRequested: function(e) {
      var target = e.path[0];
      if ((target == this) || 
          (target == this._resizerListener) || 
          (this._resizerPeers && this._resizerPeers.indexOf(target) < 0)) {
        return;
      }
      // log('resize requested', target, this);
      if (!this.resizeRequestors) {
        this.resizeRequestors = [];
      }
      this.resizeRequestors.push({target: target, callback: e.detail.callback});
      target.addEventListener('core-request-resize-cancel', this._cancelResizeRequested.bind(this));
      e.detail.hasParentResizer = true;
      e.stopPropagation();
    },

    // Private: Handle cancellation requests for resize
    _cancelResizeRequested: function(e) {
      // Exit early if we're already out of the DOM (resizeRequestors will already be null)
      if (this.resizeRequestors) {
        for (var i=0; i<this.resizeRequestors.length; i++) {
          if (this.resizeRequestors[i].target == e.target) {
            // log('resizeCanceled', e.target, this);
            this.resizeRequestors.splice(i, 1);
            break;
          }
        }
      }
    }

  }, Polymer.CoreResizable);

  // function prettyName(el) {
  //   return el.localName + (el.id ? '#' : '') + el.id;
  // }

  // function log(what, from, to, group) {
  //   var args = [what];
  //   if (from) {
  //     args.push('from ' + prettyName(from));
  //   }
  //   if (to) {
  //     args.push('to ' + prettyName(to));
  //   }
  //   if (group) {
  //     console.group.apply(console, args);
  //   } else {
  //     console.log.apply(console, args);
  //   }
  // }

  // function logEnd() {
  //   console.groupEnd();
  // }

})(Polymer);

;


  (function() {
    
    var SKIP_ID = 'meta';
    var metaData = {}, metaArray = {};

    Polymer('core-meta', {
      
      /**
       * The type of meta-data.  All meta-data with the same type with be
       * stored together.
       * 
       * @attribute type
       * @type string
       * @default 'default'
       */
      type: 'default',
      
      alwaysPrepare: true,
      
      ready: function() {
        this.register(this.id);
      },
      
      get metaArray() {
        var t = this.type;
        if (!metaArray[t]) {
          metaArray[t] = [];
        }
        return metaArray[t];
      },
      
      get metaData() {
        var t = this.type;
        if (!metaData[t]) {
          metaData[t] = {};
        }
        return metaData[t];
      },
      
      register: function(id, old) {
        if (id && id !== SKIP_ID) {
          this.unregister(this, old);
          this.metaData[id] = this;
          this.metaArray.push(this);
        }
      },
      
      unregister: function(meta, id) {
        delete this.metaData[id || meta.id];
        var i = this.metaArray.indexOf(meta);
        if (i >= 0) {
          this.metaArray.splice(i, 1);
        }
      },
      
      /**
       * Returns a list of all meta-data elements with the same type.
       * 
       * @property list
       * @type array
       * @default []
       */
      get list() {
        return this.metaArray;
      },
      
      /**
       * Retrieves meta-data by ID.
       *
       * @method byId
       * @param {String} id The ID of the meta-data to be returned.
       * @returns Returns meta-data.
       */
      byId: function(id) {
        return this.metaData[id];
      }
      
    });
    
  })();
  
;

  
    Polymer('core-iconset', {
  
      /**
       * The URL of the iconset image.
       *
       * @attribute src
       * @type string
       * @default ''
       */
      src: '',

      /**
       * The width of the iconset image. This must only be specified if the
       * icons are arranged into separate rows inside the image.
       *
       * @attribute width
       * @type number
       * @default 0
       */
      width: 0,

      /**
       * A space separated list of names corresponding to icons in the iconset
       * image file. This list must be ordered the same as the icon images
       * in the image file.
       *
       * @attribute icons
       * @type string
       * @default ''
       */
      icons: '',

      /**
       * The size of an individual icon. Note that icons must be square.
       *
       * @attribute iconSize
       * @type number
       * @default 24
       */
      iconSize: 24,

      /**
       * The horizontal offset of the icon images in the inconset src image.
       * This is typically used if the image resource contains additional images
       * beside those intended for the iconset.
       *
       * @attribute offsetX
       * @type number
       * @default 0
       */
      offsetX: 0,
      /**
       * The vertical offset of the icon images in the inconset src image.
       * This is typically used if the image resource contains additional images
       * beside those intended for the iconset.
       *
       * @attribute offsetY
       * @type number
       * @default 0
       */
      offsetY: 0,
      type: 'iconset',

      created: function() {
        this.iconMap = {};
        this.iconNames = [];
        this.themes = {};
      },
  
      ready: function() {
        // TODO(sorvell): ensure iconset's src is always relative to the main
        // document
        if (this.src && (this.ownerDocument !== document)) {
          this.src = this.resolvePath(this.src, this.ownerDocument.baseURI);
        }
        this.super();
        this.updateThemes();
      },

      iconsChanged: function() {
        var ox = this.offsetX;
        var oy = this.offsetY;
        this.icons && this.icons.split(/\s+/g).forEach(function(name, i) {
          this.iconNames.push(name);
          this.iconMap[name] = {
            offsetX: ox,
            offsetY: oy
          }
          if (ox + this.iconSize < this.width) {
            ox += this.iconSize;
          } else {
            ox = this.offsetX;
            oy += this.iconSize;
          }
        }, this);
      },

      updateThemes: function() {
        var ts = this.querySelectorAll('property[theme]');
        ts && ts.array().forEach(function(t) {
          this.themes[t.getAttribute('theme')] = {
            offsetX: parseInt(t.getAttribute('offsetX')) || 0,
            offsetY: parseInt(t.getAttribute('offsetY')) || 0
          };
        }, this);
      },

      // TODO(ffu): support retrived by index e.g. getOffset(10);
      /**
       * Returns an object containing `offsetX` and `offsetY` properties which
       * specify the pixel locaion in the iconset's src file for the given
       * `icon` and `theme`. It's uncommon to call this method. It is useful,
       * for example, to manually position a css backgroundImage to the proper
       * offset. It's more common to use the `applyIcon` method.
       *
       * @method getOffset
       * @param {String|Number} icon The name of the icon or the index of the
       * icon within in the icon image.
       * @param {String} theme The name of the theme.
       * @returns {Object} An object specifying the offset of the given icon 
       * within the icon resource file; `offsetX` is the horizontal offset and
       * `offsetY` is the vertical offset. Both values are in pixel units.
       */
      getOffset: function(icon, theme) {
        var i = this.iconMap[icon];
        if (!i) {
          var n = this.iconNames[Number(icon)];
          i = this.iconMap[n];
        }
        var t = this.themes[theme];
        if (i && t) {
          return {
            offsetX: i.offsetX + t.offsetX,
            offsetY: i.offsetY + t.offsetY
          }
        }
        return i;
      },

      /**
       * Applies an icon to the given element as a css background image. This
       * method does not size the element, and it's often necessary to set 
       * the element's height and width so that the background image is visible.
       *
       * @method applyIcon
       * @param {Element} element The element to which the background is
       * applied.
       * @param {String|Number} icon The name or index of the icon to apply.
       * @param {Number} scale (optional, defaults to 1) A scaling factor 
       * with which the icon can be magnified.
       * @return {Element} The icon element.
       */
      applyIcon: function(element, icon, scale) {
        var offset = this.getOffset(icon);
        scale = scale || 1;
        if (element && offset) {
          var icon = element._icon || document.createElement('div');
          var style = icon.style;
          style.backgroundImage = 'url(' + this.src + ')';
          style.backgroundPosition = (-offset.offsetX * scale + 'px') + 
             ' ' + (-offset.offsetY * scale + 'px');
          style.backgroundSize = scale === 1 ? 'auto' :
             this.width * scale + 'px';
          if (icon.parentNode !== element) {
            element.appendChild(icon);
          }
          return icon;
        }
      }

    });

  ;

(function() {
  
  // mono-state
  var meta;
  
  Polymer('core-icon', {

    /**
     * The URL of an image for the icon. If the src property is specified,
     * the icon property should not be.
     *
     * @attribute src
     * @type string
     * @default ''
     */
    src: '',

    /**
     * Specifies the icon name or index in the set of icons available in
     * the icon's icon set. If the icon property is specified,
     * the src property should not be.
     *
     * @attribute icon
     * @type string
     * @default ''
     */
    icon: '',

    /**
     * Alternative text content for accessibility support.
     * If alt is present and not empty, it will set the element's role to img and add an aria-label whose content matches alt.
     * If alt is present and is an empty string, '', it will hide the element from the accessibility layer
     * If alt is not present, it will set the element's role to img and the element will fallback to using the icon attribute for its aria-label.
     * 
     * @attribute alt
     * @type string
     * @default ''
     */
    alt: null,

    observe: {
      'icon': 'updateIcon',
      'alt': 'updateAlt'
    },

    defaultIconset: 'icons',

    ready: function() {
      if (!meta) {
        meta = document.createElement('core-iconset');
      }

      // Allow user-provided `aria-label` in preference to any other text alternative.
      if (this.hasAttribute('aria-label')) {
        // Set `role` if it has not been overridden.
        if (!this.hasAttribute('role')) {
          this.setAttribute('role', 'img');
        }
        return;
      }
      this.updateAlt();
    },

    srcChanged: function() {
      var icon = this._icon || document.createElement('div');
      icon.textContent = '';
      icon.setAttribute('fit', '');
      icon.style.backgroundImage = 'url(' + this.src + ')';
      icon.style.backgroundPosition = 'center';
      icon.style.backgroundSize = '100%';
      if (!icon.parentNode) {
        this.appendChild(icon);
      }
      this._icon = icon;
    },

    getIconset: function(name) {
      return meta.byId(name || this.defaultIconset);
    },

    updateIcon: function(oldVal, newVal) {
      if (!this.icon) {
        this.updateAlt();
        return;
      }
      var parts = String(this.icon).split(':');
      var icon = parts.pop();
      if (icon) {
        var set = this.getIconset(parts.pop());
        if (set) {
          this._icon = set.applyIcon(this, icon);
          if (this._icon) {
            this._icon.setAttribute('fit', '');
          }
        }
      }
      // Check to see if we're using the old icon's name for our a11y fallback
      if (oldVal) {
        if (oldVal.split(':').pop() == this.getAttribute('aria-label')) {
          this.updateAlt();
        }
      }
    },

    updateAlt: function() {
      // Respect the user's decision to remove this element from
      // the a11y tree
      if (this.getAttribute('aria-hidden')) {
        return;
      }

      // Remove element from a11y tree if `alt` is empty, otherwise
      // use `alt` as `aria-label`.
      if (this.alt === '') {
        this.setAttribute('aria-hidden', 'true');
        if (this.hasAttribute('role')) {
          this.removeAttribute('role');
        }
        if (this.hasAttribute('aria-label')) {
          this.removeAttribute('aria-label');
        }
      } else {
        this.setAttribute('aria-label', this.alt ||
                                        this.icon.split(':').pop());
        if (!this.hasAttribute('role')) {
          this.setAttribute('role', 'img');
        }
        if (this.hasAttribute('aria-hidden')) {
          this.removeAttribute('aria-hidden');
        }
      }
    }

  });
  
})();
;


    Polymer('core-iconset-svg', {


      /**
       * The size of an individual icon. Note that icons must be square.
       *
       * @attribute iconSize
       * @type number
       * @default 24
       */
      iconSize: 24,
      type: 'iconset',

      created: function() {
        this._icons = {};
      },

      ready: function() {
        this.super();
        this.updateIcons();
      },

      iconById: function(id) {
        return this._icons[id] || (this._icons[id] = this.querySelector('[id="' + id +'"]'));
      },

      cloneIcon: function(id) {
        var icon = this.iconById(id);
        if (icon) {
          var content = icon.cloneNode(true);
          content.removeAttribute('id');
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 ' + this.iconSize + ' ' +
              this.iconSize);
          // NOTE(dfreedm): work around https://crbug.com/370136
          svg.style.pointerEvents = 'none';
          svg.appendChild(content);
          return svg;
        }
      },

      get iconNames() {
        if (!this._iconNames) {
          this._iconNames = this.findIconNames();
        }
        return this._iconNames;
      },

      findIconNames: function() {
        var icons = this.querySelectorAll('[id]').array();
        if (icons.length) {
          return icons.map(function(n){ return n.id });
        }
      },

      /**
       * Applies an icon to the given element. The svg icon is added to the
       * element's shadowRoot if one exists or directly to itself.
       *
       * @method applyIcon
       * @param {Element} element The element to which the icon is
       * applied.
       * @param {String|Number} icon The name the icon to apply.
       * @return {Element} The icon element
       */
      applyIcon: function(element, icon) {
        var root = element;
        // remove old
        var old = root.querySelector('svg');
        if (old) {
          old.remove();
        }
        // install new
        var svg = this.cloneIcon(icon);
        if (!svg) {
          return;
        }
        svg.setAttribute('height', '100%');
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.display = 'block';
        root.insertBefore(svg, root.firstElementChild);
        return svg;
      },
      
      /**
       * Tell users of the iconset, that the set has loaded.
       * This finds all elements matching the selector argument and calls 
       * the method argument on them.
       * @method updateIcons
       * @param selector {string} css selector to identify iconset users, 
       * defaults to '[icon]'
       * @param method {string} method to call on found elements, 
       * defaults to 'updateIcon'
       */
      updateIcons: function(selector, method) {
        selector = selector || '[icon]';
        method = method || 'updateIcon';
        var deep = window.ShadowDOMPolyfill ? '' : 'html /deep/ ';
        var i$ = document.querySelectorAll(deep + selector);
        for (var i=0, e; e=i$[i]; i++) {
          if (e[method]) {
            e[method].call(e);
          }
        }
      }
      

    });

  ;


  (function() {

    var waveMaxRadius = 150;
    //
    // INK EQUATIONS
    //
    function waveRadiusFn(touchDownMs, touchUpMs, anim) {
      // Convert from ms to s
      var touchDown = touchDownMs / 1000;
      var touchUp = touchUpMs / 1000;
      var totalElapsed = touchDown + touchUp;
      var ww = anim.width, hh = anim.height;
      // use diagonal size of container to avoid floating point math sadness
      var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
      var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
      var tt = (totalElapsed / duration);

      var size = waveRadius * (1 - Math.pow(80, -tt));
      return Math.abs(size);
    }

    function waveOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;
      var totalElapsed = touchDown + touchUp;

      if (tu <= 0) {  // before touch up
        return anim.initialOpacity;
      }
      return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
    }

    function waveOuterOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;

      // Linear increase in background opacity, capped at the opacity
      // of the wavefront (waveOpacity).
      var outerOpacity = touchDown * 0.3;
      var waveOpacity = waveOpacityFn(td, tu, anim);
      return Math.max(0, Math.min(outerOpacity, waveOpacity));
    }

    // Determines whether the wave should be completely removed.
    function waveDidFinish(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

      // If the wave opacity is 0 and the radius exceeds the bounds
      // of the element, then this is finished.
      return waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius);
    };

    function waveAtMaximum(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

      return waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius);
    }

    //
    // DRAWING
    //
    function drawRipple(ctx, x, y, radius, innerAlpha, outerAlpha) {
      // Only animate opacity and transform
      if (outerAlpha !== undefined) {
        ctx.bg.style.opacity = outerAlpha;
      }
      ctx.wave.style.opacity = innerAlpha;

      var s = radius / (ctx.containerSize / 2);
      var dx = x - (ctx.containerWidth / 2);
      var dy = y - (ctx.containerHeight / 2);

      ctx.wc.style.webkitTransform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      ctx.wc.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';

      // 2d transform for safari because of border-radius and overflow:hidden clipping bug.
      // https://bugs.webkit.org/show_bug.cgi?id=98538
      ctx.wave.style.webkitTransform = 'scale(' + s + ',' + s + ')';
      ctx.wave.style.transform = 'scale3d(' + s + ',' + s + ',1)';
    }

    //
    // SETUP
    //
    function createWave(elem) {
      var elementStyle = window.getComputedStyle(elem);
      var fgColor = elementStyle.color;

      var inner = document.createElement('div');
      inner.style.backgroundColor = fgColor;
      inner.classList.add('wave');

      var outer = document.createElement('div');
      outer.classList.add('wave-container');
      outer.appendChild(inner);

      var container = elem.$.waves;
      container.appendChild(outer);

      elem.$.bg.style.backgroundColor = fgColor;

      var wave = {
        bg: elem.$.bg,
        wc: outer,
        wave: inner,
        waveColor: fgColor,
        maxRadius: 0,
        isMouseDown: false,
        mouseDownStart: 0.0,
        mouseUpStart: 0.0,
        tDown: 0,
        tUp: 0
      };
      return wave;
    }

    function removeWaveFromScope(scope, wave) {
      if (scope.waves) {
        var pos = scope.waves.indexOf(wave);
        scope.waves.splice(pos, 1);
        // FIXME cache nodes
        wave.wc.remove();
      }
    };

    // Shortcuts.
    var pow = Math.pow;
    var now = Date.now;
    if (window.performance && performance.now) {
      now = performance.now.bind(performance);
    }

    function cssColorWithAlpha(cssColor, alpha) {
        var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (typeof alpha == 'undefined') {
            alpha = 1;
        }
        if (!parts) {
          return 'rgba(255, 255, 255, ' + alpha + ')';
        }
        return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
    }

    function dist(p1, p2) {
      return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
    }

    function distanceFromPointToFurthestCorner(point, size) {
      var tl_d = dist(point, {x: 0, y: 0});
      var tr_d = dist(point, {x: size.w, y: 0});
      var bl_d = dist(point, {x: 0, y: size.h});
      var br_d = dist(point, {x: size.w, y: size.h});
      return Math.max(tl_d, tr_d, bl_d, br_d);
    }

    Polymer('paper-ripple', {

      /**
       * The initial opacity set on the wave.
       *
       * @attribute initialOpacity
       * @type number
       * @default 0.25
       */
      initialOpacity: 0.25,

      /**
       * How fast (opacity per second) the wave fades out.
       *
       * @attribute opacityDecayVelocity
       * @type number
       * @default 0.8
       */
      opacityDecayVelocity: 0.8,

      backgroundFill: true,
      pixelDensity: 2,

      eventDelegates: {
        down: 'downAction',
        up: 'upAction'
      },

      ready: function() {
        this.waves = [];
      },

      downAction: function(e) {
        var wave = createWave(this);

        this.cancelled = false;
        wave.isMouseDown = true;
        wave.tDown = 0.0;
        wave.tUp = 0.0;
        wave.mouseUpStart = 0.0;
        wave.mouseDownStart = now();

        var rect = this.getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;
        var touchX = e.x - rect.left;
        var touchY = e.y - rect.top;

        wave.startPosition = {x:touchX, y:touchY};

        if (this.classList.contains("recenteringTouch")) {
          wave.endPosition = {x: width / 2,  y: height / 2};
          wave.slideDistance = dist(wave.startPosition, wave.endPosition);
        }
        wave.containerSize = Math.max(width, height);
        wave.containerWidth = width;
        wave.containerHeight = height;
        wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, {w: width, h: height});

        // The wave is circular so constrain its container to 1:1
        wave.wc.style.top = (wave.containerHeight - wave.containerSize) / 2 + 'px';
        wave.wc.style.left = (wave.containerWidth - wave.containerSize) / 2 + 'px';
        wave.wc.style.width = wave.containerSize + 'px';
        wave.wc.style.height = wave.containerSize + 'px';

        this.waves.push(wave);

        if (!this._loop) {
          this._loop = this.animate.bind(this, {
            width: width,
            height: height
          });
          requestAnimationFrame(this._loop);
        }
        // else there is already a rAF
      },

      upAction: function() {
        for (var i = 0; i < this.waves.length; i++) {
          // Declare the next wave that has mouse down to be mouse'ed up.
          var wave = this.waves[i];
          if (wave.isMouseDown) {
            wave.isMouseDown = false;
            wave.mouseUpStart = now();
            wave.mouseDownStart = 0;
            wave.tUp = 0.0;
            break;
          }
        }
        this._loop && requestAnimationFrame(this._loop);
      },

      cancel: function() {
        this.cancelled = true;
      },

      animate: function(ctx) {
        var shouldRenderNextFrame = false;

        var deleteTheseWaves = [];
        // The oldest wave's touch down duration
        var longestTouchDownDuration = 0;
        var longestTouchUpDuration = 0;
        // Save the last known wave color
        var lastWaveColor = null;
        // wave animation values
        var anim = {
          initialOpacity: this.initialOpacity,
          opacityDecayVelocity: this.opacityDecayVelocity,
          height: ctx.height,
          width: ctx.width
        }

        for (var i = 0; i < this.waves.length; i++) {
          var wave = this.waves[i];

          if (wave.mouseDownStart > 0) {
            wave.tDown = now() - wave.mouseDownStart;
          }
          if (wave.mouseUpStart > 0) {
            wave.tUp = now() - wave.mouseUpStart;
          }

          // Determine how long the touch has been up or down.
          var tUp = wave.tUp;
          var tDown = wave.tDown;
          longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
          longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);

          // Obtain the instantenous size and alpha of the ripple.
          var radius = waveRadiusFn(tDown, tUp, anim);
          var waveAlpha =  waveOpacityFn(tDown, tUp, anim);
          var waveColor = cssColorWithAlpha(wave.waveColor, waveAlpha);
          lastWaveColor = wave.waveColor;

          // Position of the ripple.
          var x = wave.startPosition.x;
          var y = wave.startPosition.y;

          // Ripple gravitational pull to the center of the canvas.
          if (wave.endPosition) {

            // This translates from the origin to the center of the view  based on the max dimension of
            var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2) );

            x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
            y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
          }

          // If we do a background fill fade too, work out the correct color.
          var bgFillColor = null;
          if (this.backgroundFill) {
            var bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
            bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha);
          }

          // Draw the ripple.
          drawRipple(wave, x, y, radius, waveAlpha, bgFillAlpha);

          // Determine whether there is any more rendering to be done.
          var maximumWave = waveAtMaximum(wave, radius, anim);
          var waveDissipated = waveDidFinish(wave, radius, anim);
          var shouldKeepWave = !waveDissipated || maximumWave;
          // keep rendering dissipating wave when at maximum radius on upAction
          var shouldRenderWaveAgain = wave.mouseUpStart ? !waveDissipated : !maximumWave;
          shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
          if (!shouldKeepWave || this.cancelled) {
            deleteTheseWaves.push(wave);
          }
       }

        if (shouldRenderNextFrame) {
          requestAnimationFrame(this._loop);
        }

        for (var i = 0; i < deleteTheseWaves.length; ++i) {
          var wave = deleteTheseWaves[i];
          removeWaveFromScope(this, wave);
        }

        if (!this.waves.length && this._loop) {
          // clear the background color
          this.$.bg.style.backgroundColor = null;
          this._loop = null;
          this.fire('core-transitionend');
        }
      }

    });

  })();

;


  (function() {

    var p = {

      eventDelegates: {
        down: 'downAction',
        up: 'upAction'
      },

      toggleBackground: function() {
        if (this.active) {

          if (!this.$.bg) {
            var bg = document.createElement('div');
            bg.setAttribute('id', 'bg');
            bg.setAttribute('fit', '');
            bg.style.opacity = 0.25;
            this.$.bg = bg;
            this.shadowRoot.insertBefore(bg, this.shadowRoot.firstChild);
          }
          this.$.bg.style.backgroundColor = getComputedStyle(this).color;

        } else {

          if (this.$.bg) {
            this.$.bg.style.backgroundColor = '';
          }
        }
      },

      activeChanged: function() {
        this.super();

        if (this.toggle && (!this.lastEvent || this.matches(':host-context([noink])'))) {
          this.toggleBackground();
        }
      },

      pressedChanged: function() {
        this.super();

        if (!this.lastEvent) {
          return;
        }

        if (this.$.ripple && !this.hasAttribute('noink')) {
          if (this.pressed) {
            this.$.ripple.downAction(this.lastEvent);
          } else {
            this.$.ripple.upAction();
          }
        }

        this.adjustZ();
      },

      focusedChanged: function() {
        this.adjustZ();
      },

      disabledChanged: function() {
        this._disabledChanged();
        this.adjustZ();
      },

      recenteringTouchChanged: function() {
        if (this.$.ripple) {
          this.$.ripple.classList.toggle('recenteringTouch', this.recenteringTouch);
        }
      },

      fillChanged: function() {
        if (this.$.ripple) {
          this.$.ripple.classList.toggle('fill', this.fill);
        }
      },

      adjustZ: function() {
        if (!this.$.shadow) {
          return;
        }
        if (this.active) {
          this.$.shadow.setZ(2);
        } else if (this.disabled) {
          this.$.shadow.setZ(0);
        } else if (this.focused) {
          this.$.shadow.setZ(3);
        } else {
          this.$.shadow.setZ(1);
        }
      },

      downAction: function(e) {
        this._downAction();

        if (this.hasAttribute('noink')) {
          return;
        }

        this.lastEvent = e;
        if (!this.$.ripple) {
          var ripple = document.createElement('paper-ripple');
          ripple.setAttribute('id', 'ripple');
          ripple.setAttribute('fit', '');
          if (this.recenteringTouch) {
            ripple.classList.add('recenteringTouch');
          }
          if (!this.fill) {
            ripple.classList.add('circle');
          }
          this.$.ripple = ripple;
          this.shadowRoot.insertBefore(ripple, this.shadowRoot.firstChild);
          // No need to forward the event to the ripple because the ripple
          // is triggered in activeChanged
        }
      },

      upAction: function() {
        this._upAction();

        if (this.toggle) {
          this.toggleBackground();
          if (this.$.ripple) {
            this.$.ripple.cancel();
          }
        }
      }

    };

    Polymer.mixin2(p, Polymer.CoreFocusable);
    Polymer('paper-button-base',p);

  })();

;

  Polymer('paper-shadow',{

    publish: {

      /**
       * The z-depth of this shadow, from 0-5. Setting this property
       * after element creation has no effect. Use `setZ()` instead.
       *
       * @attribute z
       * @type number
       * @default 1
       */
      z: 1,

      /**
       * Set this to true to animate the shadow when setting a new
       * `z` value.
       *
       * @attribute animated
       * @type boolean
       * @default false
       */
      animated: false

    },

    /**
     * Set the z-depth of the shadow. This should be used after element
     * creation instead of setting the z property directly.
     *
     * @method setZ
     * @param {Number} newZ
     */
    setZ: function(newZ) {
      if (this.z !== newZ) {
        this.$['shadow-bottom'].classList.remove('paper-shadow-bottom-z-' + this.z);
        this.$['shadow-bottom'].classList.add('paper-shadow-bottom-z-' + newZ);
        this.$['shadow-top'].classList.remove('paper-shadow-top-z-' + this.z);
        this.$['shadow-top'].classList.add('paper-shadow-top-z-' + newZ);
        this.z = newZ;
      }
    }

  });
;

    Polymer('paper-fab',{

      publish: {

        /**
         * The URL of an image for the icon. If the src property is specified,
         * the icon property should not be.
         *
         * @attribute src
         * @type string
         * @default ''
         */
        src: '',

        /**
         * Specifies the icon name or index in the set of icons available in
         * the icon's icon set. If the icon property is specified,
         * the src property should not be.
         *
         * @attribute icon
         * @type string
         * @default ''
         */
        icon: '',

        /**
         * Set this to true to style this is a "mini" FAB.
         *
         * @attribute mini
         * @type boolean
         * @default false
         */
        mini: false,

        raised: true,
        recenteringTouch: true,
        fill: false

      },

      iconChanged: function(oldIcon) {
        var label = this.getAttribute('aria-label');
        if (!label || label === oldIcon) {
          this.setAttribute('aria-label', this.icon);
        }
      }

    });

  ;

    Polymer('core-transition', {
      
      type: 'transition',

      /**
       * Run the animation.
       *
       * @method go
       * @param {Node} node The node to apply the animation on
       * @param {Object} state State info
       */
      go: function(node, state) {
        this.complete(node);
      },

      /**
       * Set up the animation. This may include injecting a stylesheet,
       * applying styles, creating a web animations object, etc.. This
       *
       * @method setup
       * @param {Node} node The animated node
       */
      setup: function(node) {
      },

      /**
       * Tear down the animation.
       *
       * @method teardown
       * @param {Node} node The animated node
       */
      teardown: function(node) {
      },

      /**
       * Called when the animation completes. This function also fires the
       * `core-transitionend` event.
       *
       * @method complete
       * @param {Node} node The animated node
       */
      complete: function(node) {
        this.fire('core-transitionend', null, node);
      },

      /**
       * Utility function to listen to an event on a node once.
       *
       * @method listenOnce
       * @param {Node} node The animated node
       * @param {string} event Name of an event
       * @param {Function} fn Event handler
       * @param {Array} args Additional arguments to pass to `fn`
       */
      listenOnce: function(node, event, fn, args) {
        var self = this;
        var listener = function() {
          fn.apply(self, args);
          node.removeEventListener(event, listener, false);
        }
        node.addEventListener(event, listener, false);
      }

    });
  ;

    Polymer('core-key-helper', {
      ENTER_KEY: 13,
      ESCAPE_KEY: 27
    });
  ;

(function() {

  Polymer('core-overlay-layer', {
    publish: {
      opened: false
    },
    openedChanged: function() {
      this.classList.toggle('core-opened', this.opened);
    },
    /**
     * Adds an element to the overlay layer
     */
    addElement: function(element) {
      if (!this.parentNode) {
        document.querySelector('body').appendChild(this);
      }
      if (element.parentNode !== this) {
        element.__contents = [];
        var ip$ = element.querySelectorAll('content');
        for (var i=0, l=ip$.length, n; (i<l) && (n = ip$[i]); i++) {
          this.moveInsertedElements(n);
          this.cacheDomLocation(n);
          n.parentNode.removeChild(n);
          element.__contents.push(n);
        }
        this.cacheDomLocation(element);
        this.updateEventController(element);
        var h = this.makeHost();
        h.shadowRoot.appendChild(element);
        element.__host = h;
      }
    },
    makeHost: function() {
      var h = document.createElement('overlay-host');
      h.createShadowRoot();
      this.appendChild(h);
      return h;
    },
    moveInsertedElements: function(insertionPoint) {
      var n$ = insertionPoint.getDistributedNodes();
      var parent = insertionPoint.parentNode;
      insertionPoint.__contents = [];
      for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
        this.cacheDomLocation(n);
        this.updateEventController(n);
        insertionPoint.__contents.push(n);
        parent.appendChild(n);  
      }
    },
    updateEventController: function(element) {
      element.eventController = this.element.findController(element);
    },
    /**
     * Removes an element from the overlay layer
     */
    removeElement: function(element) {
      element.eventController = null;
      this.replaceElement(element);
      var h = element.__host;
      if (h) {
        h.parentNode.removeChild(h);
      }
    },
    replaceElement: function(element) {
      if (element.__contents) {
        for (var i=0, c$=element.__contents, c; (c=c$[i]); i++) {
          this.replaceElement(c);
        }
        element.__contents = null;
      }
      if (element.__parentNode) {
        var n = element.__nextElementSibling && element.__nextElementSibling 
            === element.__parentNode ? element.__nextElementSibling : null;
        element.__parentNode.insertBefore(element, n);
      }
    },
    cacheDomLocation: function(element) {
      element.__nextElementSibling = element.nextElementSibling;
      element.__parentNode = element.parentNode;
    }
  });
  
})();
;

(function() {

  Polymer('core-overlay',Polymer.mixin({

    publish: {
      /**
       * The target element that will be shown when the overlay is 
       * opened. If unspecified, the core-overlay itself is the target.
       *
       * @attribute target
       * @type Object
       * @default the overlay element
       */
      target: null,


      /**
       * A `core-overlay`'s size is guaranteed to be 
       * constrained to the window size. To achieve this, the sizingElement
       * is sized with a max-height/width. By default this element is the 
       * target element, but it can be specifically set to a specific element
       * inside the target if that is more appropriate. This is useful, for 
       * example, when a region inside the overlay should scroll if needed.
       *
       * @attribute sizingTarget
       * @type Object
       * @default the target element
       */
      sizingTarget: null,
    
      /**
       * Set opened to true to show an overlay and to false to hide it.
       * A `core-overlay` may be made initially opened by setting its
       * `opened` attribute.
       * @attribute opened
       * @type boolean
       * @default false
       */
      opened: false,

      /**
       * If true, the overlay has a backdrop darkening the rest of the screen.
       * The backdrop element is attached to the document body and may be styled
       * with the class `core-overlay-backdrop`. When opened the `core-opened`
       * class is applied.
       *
       * @attribute backdrop
       * @type boolean
       * @default false
       */    
      backdrop: false,

      /**
       * If true, the overlay is guaranteed to display above page content.
       *
       * @attribute layered
       * @type boolean
       * @default false
      */
      layered: false,
    
      /**
       * By default an overlay will close automatically if the user
       * taps outside it or presses the escape key. Disable this
       * behavior by setting the `autoCloseDisabled` property to true.
       * @attribute autoCloseDisabled
       * @type boolean
       * @default false
       */
      autoCloseDisabled: false,

      /**
       * By default an overlay will focus its target or an element inside
       * it with the `autoFocus` attribute. Disable this
       * behavior by setting the `autoFocusDisabled` property to true.
       * @attribute autoFocusDisabled
       * @type boolean
       * @default false
       */
      autoFocusDisabled: false,

      /**
       * This property specifies an attribute on elements that should
       * close the overlay on tap. Should not set `closeSelector` if this
       * is set.
       *
       * @attribute closeAttribute
       * @type string
       * @default "core-overlay-toggle"
       */
      closeAttribute: 'core-overlay-toggle',

      /**
       * This property specifies a selector matching elements that should
       * close the overlay on tap. Should not set `closeAttribute` if this
       * is set.
       *
       * @attribute closeSelector
       * @type string
       * @default ""
       */
      closeSelector: '',

      /**
       * The transition property specifies a string which identifies a 
       * <a href="../core-transition/">`core-transition`</a> element that 
       * will be used to help the overlay open and close. The default
       * `core-transition-fade` will cause the overlay to fade in and out.
       *
       * @attribute transition
       * @type string
       * @default 'core-transition-fade'
       */
      transition: 'core-transition-fade'

    },

    captureEventName: 'tap',
    targetListeners: {
      'tap': 'tapHandler',
      'keydown': 'keydownHandler',
      'core-transitionend': 'transitionend'
    },

    attached: function() {
      this.resizerAttachedHandler();
    },

    detached: function() {
      this.resizerDetachedHandler();
    },

    resizerShouldNotify: function() {
      return this.opened;
    },

    registerCallback: function(element) {
      this.layer = document.createElement('core-overlay-layer');
      this.keyHelper = document.createElement('core-key-helper');
      this.meta = document.createElement('core-transition');
      this.scrim = document.createElement('div');
      this.scrim.className = 'core-overlay-backdrop';
    },

    ready: function() {
      this.target = this.target || this;
      // flush to ensure styles are installed before paint
      Polymer.flush();
    },

    /** 
     * Toggle the opened state of the overlay.
     * @method toggle
     */
    toggle: function() {
      this.opened = !this.opened;
    },

    /** 
     * Open the overlay. This is equivalent to setting the `opened`
     * property to true.
     * @method open
     */
    open: function() {
      this.opened = true;
    },

    /** 
     * Close the overlay. This is equivalent to setting the `opened` 
     * property to false.
     * @method close
     */
    close: function() {
      this.opened = false;
    },

    domReady: function() {
      this.ensureTargetSetup();
    },

    targetChanged: function(old) {
      if (this.target) {
        // really make sure tabIndex is set
        if (this.target.tabIndex < 0) {
          this.target.tabIndex = -1;
        }
        this.addElementListenerList(this.target, this.targetListeners);
        this.target.style.display = 'none';
        this.target.__overlaySetup = false;
      }
      if (old) {
        this.removeElementListenerList(old, this.targetListeners);
        var transition = this.getTransition();
        if (transition) {
          transition.teardown(old);
        } else {
          old.style.position = '';
          old.style.outline = '';
        }
        old.style.display = '';
      }
    },

    transitionChanged: function(old) {
      if (!this.target) {
        return;
      }
      if (old) {
        this.getTransition(old).teardown(this.target);
      }
      this.target.__overlaySetup = false;
    },

    // NOTE: wait to call this until we're as sure as possible that target
    // is styled.
    ensureTargetSetup: function() {
      if (!this.target || this.target.__overlaySetup) {
        return;
      }
      if (!this.sizingTarget) {
        this.sizingTarget = this.target;
      }
      this.target.__overlaySetup = true;
      this.target.style.display = '';
      var transition = this.getTransition();
      if (transition) {
        transition.setup(this.target);
      }
      var style = this.target.style;
      var computed = getComputedStyle(this.target);
      if (computed.position === 'static') {
        style.position = 'fixed';
      }
      style.outline = 'none';
      style.display = 'none';
    },

    openedChanged: function() {
      this.transitioning = true;
      this.ensureTargetSetup();
      this.prepareRenderOpened();
      // async here to allow overlay layer to become visible.
      this.async(function() {
        this.target.style.display = '';
        // force layout to ensure transitions will go
        this.target.offsetWidth;
        this.renderOpened();
      });
      this.fire('core-overlay-open', this.opened);
    },

    // tasks which must occur before opening; e.g. making the element visible
    prepareRenderOpened: function() {
      if (this.opened) {
        addOverlay(this);
      }
      this.prepareBackdrop();
      // async so we don't auto-close immediately via a click.
      this.async(function() {
        if (!this.autoCloseDisabled) {
          this.enableElementListener(this.opened, document,
              this.captureEventName, 'captureHandler', true);
        }
      });
      this.enableElementListener(this.opened, window, 'resize',
          'resizeHandler');

      if (this.opened) {
        // force layout so SD Polyfill renders
        this.target.offsetHeight;
        this.discoverDimensions();
        // if we are showing, then take care when positioning
        this.preparePositioning();
        this.positionTarget();
        this.updateTargetDimensions();
        this.finishPositioning();
        if (this.layered) {
          this.layer.addElement(this.target);
          this.layer.opened = this.opened;
        }
      }
    },

    // tasks which cause the overlay to actually open; typically play an
    // animation
    renderOpened: function() {
      this.notifyResize();
      var transition = this.getTransition();
      if (transition) {
        transition.go(this.target, {opened: this.opened});
      } else {
        this.transitionend();
      }
      this.renderBackdropOpened();
    },

    // finishing tasks; typically called via a transition
    transitionend: function(e) {
      // make sure this is our transition event.
      if (e && e.target !== this.target) {
        return;
      }
      this.transitioning = false;
      if (!this.opened) {
        this.resetTargetDimensions();
        this.target.style.display = 'none';
        this.completeBackdrop();
        removeOverlay(this);
        if (this.layered) {
          if (!currentOverlay()) {
            this.layer.opened = this.opened;
          }
          this.layer.removeElement(this.target);
        }
      }
      this.fire('core-overlay-' + (this.opened ? 'open' : 'close') + 
          '-completed');
      this.applyFocus();
    },

    prepareBackdrop: function() {
      if (this.backdrop && this.opened) {
        if (!this.scrim.parentNode) {
          document.body.appendChild(this.scrim);
          this.scrim.style.zIndex = currentOverlayZ() - 1;
        }
        trackBackdrop(this);
      }
    },

    renderBackdropOpened: function() {
      if (this.backdrop && getBackdrops().length < 2) {
        this.scrim.classList.toggle('core-opened', this.opened);
      }
    },

    completeBackdrop: function() {
      if (this.backdrop) {
        trackBackdrop(this);
        if (getBackdrops().length === 0) {
          this.scrim.parentNode.removeChild(this.scrim);
        }
      }
    },

    preparePositioning: function() {
      this.target.style.transition = this.target.style.webkitTransition = 'none';
      this.target.style.transform = this.target.style.webkitTransform = 'none';
      this.target.style.display = '';
    },

    discoverDimensions: function() {
      if (this.dimensions) {
        return;
      }
      var target = getComputedStyle(this.target);
      var sizer = getComputedStyle(this.sizingTarget);
      this.dimensions = {
        position: {
          v: target.top !== 'auto' ? 'top' : (target.bottom !== 'auto' ?
            'bottom' : null),
          h: target.left !== 'auto' ? 'left' : (target.right !== 'auto' ?
            'right' : null),
          css: target.position
        },
        size: {
          v: sizer.maxHeight !== 'none',
          h: sizer.maxWidth !== 'none'
        },
        margin: {
          top: parseInt(target.marginTop) || 0,
          right: parseInt(target.marginRight) || 0,
          bottom: parseInt(target.marginBottom) || 0,
          left: parseInt(target.marginLeft) || 0
        }
      };
    },

    finishPositioning: function(target) {
      this.target.style.display = 'none';
      this.target.style.transform = this.target.style.webkitTransform = '';
      // force layout to avoid application of transform
      this.target.offsetWidth;
      this.target.style.transition = this.target.style.webkitTransition = '';
    },

    getTransition: function(name) {
      return this.meta.byId(name || this.transition);
    },

    getFocusNode: function() {
      return this.target.querySelector('[autofocus]') || this.target;
    },

    applyFocus: function() {
      var focusNode = this.getFocusNode();
      if (this.opened) {
        if (!this.autoFocusDisabled) {
          focusNode.focus();
        }
      } else {
        focusNode.blur();
        if (currentOverlay() == this) {
          console.warn('Current core-overlay is attempting to focus itself as next! (bug)');
        } else {
          focusOverlay();
        }
      }
    },

    positionTarget: function() {
      // fire positioning event
      this.fire('core-overlay-position', {target: this.target,
          sizingTarget: this.sizingTarget, opened: this.opened});
      if (!this.dimensions.position.v) {
        this.target.style.top = '0px';
      }
      if (!this.dimensions.position.h) {
        this.target.style.left = '0px';
      }
    },

    updateTargetDimensions: function() {
      this.sizeTarget();
      this.repositionTarget();
    },

    sizeTarget: function() {
      this.sizingTarget.style.boxSizing = 'border-box';
      var dims = this.dimensions;
      var rect = this.target.getBoundingClientRect();
      if (!dims.size.v) {
        this.sizeDimension(rect, dims.position.v, 'top', 'bottom', 'Height');
      }
      if (!dims.size.h) {
        this.sizeDimension(rect, dims.position.h, 'left', 'right', 'Width');
      }
    },

    sizeDimension: function(rect, positionedBy, start, end, extent) {
      var dims = this.dimensions;
      var flip = (positionedBy === end);
      var m = flip ? start : end;
      var ws = window['inner' + extent];
      var o = dims.margin[m] + (flip ? ws - rect[end] : 
          rect[start]);
      var offset = 'offset' + extent;
      var o2 = this.target[offset] - this.sizingTarget[offset];
      this.sizingTarget.style['max' + extent] = (ws - o - o2) + 'px';
    },

    // vertically and horizontally center if not positioned
    repositionTarget: function() {
      // only center if position fixed.      
      if (this.dimensions.position.css !== 'fixed') {
        return; 
      }
      if (!this.dimensions.position.v) {
        var t = (window.innerHeight - this.target.offsetHeight) / 2;
        t -= this.dimensions.margin.top;
        this.target.style.top = t + 'px';
      }

      if (!this.dimensions.position.h) {
        var l = (window.innerWidth - this.target.offsetWidth) / 2;
        l -= this.dimensions.margin.left;
        this.target.style.left = l + 'px';
      }
    },

    resetTargetDimensions: function() {
      if (!this.dimensions || !this.dimensions.size.v) {
        this.sizingTarget.style.maxHeight = '';  
        this.target.style.top = '';
      }
      if (!this.dimensions || !this.dimensions.size.h) {
        this.sizingTarget.style.maxWidth = '';  
        this.target.style.left = '';
      }
      this.dimensions = null;
    },

    tapHandler: function(e) {
      // closeSelector takes precedence since closeAttribute has a default non-null value.
      if (e.target &&
          (this.closeSelector && e.target.matches(this.closeSelector)) ||
          (this.closeAttribute && e.target.hasAttribute(this.closeAttribute))) {
        this.toggle();
      } else {
        if (this.autoCloseJob) {
          this.autoCloseJob.stop();
          this.autoCloseJob = null;
        }
      }
    },
    
    // We use the traditional approach of capturing events on document
    // to to determine if the overlay needs to close. However, due to 
    // ShadowDOM event retargeting, the event target is not useful. Instead
    // of using it, we attempt to close asynchronously and prevent the close
    // if a tap event is immediately heard on the target.
    // TODO(sorvell): This approach will not work with modal. For
    // this we need a scrim.
    captureHandler: function(e) {
      if (!this.autoCloseDisabled && (currentOverlay() == this)) {
        this.autoCloseJob = this.job(this.autoCloseJob, function() {
          this.close();
        });
      }
    },

    keydownHandler: function(e) {
      if (!this.autoCloseDisabled && (e.keyCode == this.keyHelper.ESCAPE_KEY)) {
        this.close();
        e.stopPropagation();
      }
    },

    /**
     * Extensions of core-overlay should implement the `resizeHandler`
     * method to adjust the size and position of the overlay when the 
     * browser window resizes.
     * @method resizeHandler
     */
    resizeHandler: function() {
      this.updateTargetDimensions();
    },

    // TODO(sorvell): these utility methods should not be here.
    addElementListenerList: function(node, events) {
      for (var i in events) {
        this.addElementListener(node, i, events[i]);
      }
    },

    removeElementListenerList: function(node, events) {
      for (var i in events) {
        this.removeElementListener(node, i, events[i]);
      }
    },

    enableElementListener: function(enable, node, event, methodName, capture) {
      if (enable) {
        this.addElementListener(node, event, methodName, capture);
      } else {
        this.removeElementListener(node, event, methodName, capture);
      }
    },

    addElementListener: function(node, event, methodName, capture) {
      var fn = this._makeBoundListener(methodName);
      if (node && fn) {
        Polymer.addEventListener(node, event, fn, capture);
      }
    },

    removeElementListener: function(node, event, methodName, capture) {
      var fn = this._makeBoundListener(methodName);
      if (node && fn) {
        Polymer.removeEventListener(node, event, fn, capture);
      }
    },

    _makeBoundListener: function(methodName) {
      var self = this, method = this[methodName];
      if (!method) {
        return;
      }
      var bound = '_bound' + methodName;
      if (!this[bound]) {
        this[bound] = function(e) {
          method.call(self, e);
        };
      }
      return this[bound];
    }

  }, Polymer.CoreResizer));

  // TODO(sorvell): This should be an element with private state so it can
  // be independent of overlay.
  // track overlays for z-index and focus managemant
  var overlays = [];
  function addOverlay(overlay) {
    var z0 = currentOverlayZ();
    overlays.push(overlay);
    var z1 = currentOverlayZ();
    if (z1 <= z0) {
      applyOverlayZ(overlay, z0);
    }
  }

  function removeOverlay(overlay) {
    var i = overlays.indexOf(overlay);
    if (i >= 0) {
      overlays.splice(i, 1);
      setZ(overlay, '');
    }
  }
  
  function applyOverlayZ(overlay, aboveZ) {
    setZ(overlay.target, aboveZ + 2);
  }
  
  function setZ(element, z) {
    element.style.zIndex = z;
  }

  function currentOverlay() {
    return overlays[overlays.length-1];
  }
  
  var DEFAULT_Z = 10;
  
  function currentOverlayZ() {
    var z;
    var current = currentOverlay();
    if (current) {
      var z1 = window.getComputedStyle(current.target).zIndex;
      if (!isNaN(z1)) {
        z = Number(z1);
      }
    }
    return z || DEFAULT_Z;
  }
  
  function focusOverlay() {
    var current = currentOverlay();
    // We have to be careful to focus the next overlay _after_ any current
    // transitions are complete (due to the state being toggled prior to the
    // transition). Otherwise, we risk infinite recursion when a transitioning
    // (closed) overlay becomes the current overlay.
    //
    // NOTE: We make the assumption that any overlay that completes a transition
    // will call into focusOverlay to kick the process back off. Currently:
    // transitionend -> applyFocus -> focusOverlay.
    if (current && !current.transitioning) {
      current.applyFocus();
    }
  }

  var backdrops = [];
  function trackBackdrop(element) {
    if (element.opened) {
      backdrops.push(element);
    } else {
      var i = backdrops.indexOf(element);
      if (i >= 0) {
        backdrops.splice(i, 1);
      }
    }
  }

  function getBackdrops() {
    return backdrops;
  }
})();
;


  Polymer('core-transition-css', {

    /**
     * The class that will be applied to all animated nodes.
     *
     * @attribute baseClass
     * @type string
     * @default "core-transition"
     */
    baseClass: 'core-transition',

    /**
     * The class that will be applied to nodes in the opened state.
     *
     * @attribute openedClass
     * @type string
     * @default "core-opened"
     */
    openedClass: 'core-opened',

    /**
     * The class that will be applied to nodes in the closed state.
     *
     * @attribute closedClass
     * @type string
     * @default "core-closed"
     */
    closedClass: 'core-closed',

    /**
     * Event to listen to for animation completion.
     *
     * @attribute completeEventName
     * @type string
     * @default "transitionEnd"
     */
    completeEventName: 'transitionend',

    publish: {
      /**
       * A secondary configuration attribute for the animation. The class
       * `<baseClass>-<transitionType` is applied to the animated node during
       * `setup`.
       *
       * @attribute transitionType
       * @type string
       */
      transitionType: null
    },

    registerCallback: function(element) {
      this.transitionStyle = element.templateContent().firstElementChild;
    },

    // template is just for loading styles, we don't need a shadowRoot
    fetchTemplate: function() {
      return null;
    },

    go: function(node, state) {
      if (state.opened !== undefined) {
        this.transitionOpened(node, state.opened);
      }
    },

    setup: function(node) {
      if (!node._hasTransitionStyle) {
        if (!node.shadowRoot) {
          node.createShadowRoot().innerHTML = '<content></content>';
        }
        this.installScopeStyle(this.transitionStyle, 'transition',
            node.shadowRoot);
        node._hasTransitionStyle = true;
      }
      node.classList.add(this.baseClass);
      if (this.transitionType) {
        node.classList.add(this.baseClass + '-' + this.transitionType);
      }
    },

    teardown: function(node) {
      node.classList.remove(this.baseClass);
      if (this.transitionType) {
        node.classList.remove(this.baseClass + '-' + this.transitionType);
      }
    },

    transitionOpened: function(node, opened) {
      this.listenOnce(node, this.completeEventName, function() {
        if (!opened) {
          node.classList.remove(this.closedClass);
        }
        this.complete(node);
      });
      node.classList.toggle(this.openedClass, opened);
      node.classList.toggle(this.closedClass, !opened);
    }

  });
;


  Polymer('paper-dialog-base',{

    publish: {

      /**
       * The title of the dialog.
       *
       * @attribute heading
       * @type string
       * @default ''
       */
      heading: '',

      /**
       * @attribute transition
       * @type string
       * @default ''
       */
      transition: '',

      /**
       * @attribute layered
       * @type boolean
       * @default true
       */
      layered: true
    },

    ready: function() {
      this.super();
      this.sizingTarget = this.$.scroller;
    },

    headingChanged: function(old) {
      var label = this.getAttribute('aria-label');
      if (!label || label === old) {
        this.setAttribute('aria-label', this.heading);
      }
    },

    openAction: function() {
      if (this.$.scroller.scrollTop) {
        this.$.scroller.scrollTop = 0;
      }
    }

  });

;
Polymer('paper-dialog');;

  (function() {
    /*
     * Chrome uses an older version of DOM Level 3 Keyboard Events
     *
     * Most keys are labeled as text, but some are Unicode codepoints.
     * Values taken from: http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/keyset.html#KeySet-Set
     */
    var KEY_IDENTIFIER = {
      'U+0009': 'tab',
      'U+001B': 'esc',
      'U+0020': 'space',
      'U+002A': '*',
      'U+0030': '0',
      'U+0031': '1',
      'U+0032': '2',
      'U+0033': '3',
      'U+0034': '4',
      'U+0035': '5',
      'U+0036': '6',
      'U+0037': '7',
      'U+0038': '8',
      'U+0039': '9',
      'U+0041': 'a',
      'U+0042': 'b',
      'U+0043': 'c',
      'U+0044': 'd',
      'U+0045': 'e',
      'U+0046': 'f',
      'U+0047': 'g',
      'U+0048': 'h',
      'U+0049': 'i',
      'U+004A': 'j',
      'U+004B': 'k',
      'U+004C': 'l',
      'U+004D': 'm',
      'U+004E': 'n',
      'U+004F': 'o',
      'U+0050': 'p',
      'U+0051': 'q',
      'U+0052': 'r',
      'U+0053': 's',
      'U+0054': 't',
      'U+0055': 'u',
      'U+0056': 'v',
      'U+0057': 'w',
      'U+0058': 'x',
      'U+0059': 'y',
      'U+005A': 'z',
      'U+007F': 'del'
    };

    /*
     * Special table for KeyboardEvent.keyCode.
     * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better than that
     *
     * Values from: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
     */
    var KEY_CODE = {
      9: 'tab',
      13: 'enter',
      27: 'esc',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      46: 'del',
      106: '*'
    };

    /*
     * KeyboardEvent.key is mostly represented by printable character made by the keyboard, with unprintable keys labeled
     * nicely.
     *
     * However, on OS X, Alt+char can make a Unicode character that follows an Apple-specific mapping. In this case, we
     * fall back to .keyCode.
     */
    var KEY_CHAR = /[a-z0-9*]/;

    function transformKey(key) {
      var validKey = '';
      if (key) {
        var lKey = key.toLowerCase();
        if (lKey.length == 1) {
          if (KEY_CHAR.test(lKey)) {
            validKey = lKey;
          }
        } else if (lKey == 'multiply') {
          // numpad '*' can map to Multiply on IE/Windows
          validKey = '*';
        } else {
          validKey = lKey;
        }
      }
      return validKey;
    }

    var IDENT_CHAR = /U\+/;
    function transformKeyIdentifier(keyIdent) {
      var validKey = '';
      if (keyIdent) {
        if (IDENT_CHAR.test(keyIdent)) {
          validKey = KEY_IDENTIFIER[keyIdent];
        } else {
          validKey = keyIdent.toLowerCase();
        }
      }
      return validKey;
    }

    function transformKeyCode(keyCode) {
      var validKey = '';
      if (Number(keyCode)) {
        if (keyCode >= 65 && keyCode <= 90) {
          // ascii a-z
          // lowercase is 32 offset from uppercase
          validKey = String.fromCharCode(32 + keyCode);
        } else if (keyCode >= 112 && keyCode <= 123) {
          // function keys f1-f12
          validKey = 'f' + (keyCode - 112);
        } else if (keyCode >= 48 && keyCode <= 57) {
          // top 0-9 keys
          validKey = String(48 - keyCode);
        } else if (keyCode >= 96 && keyCode <= 105) {
          // num pad 0-9
          validKey = String(96 - keyCode);
        } else {
          validKey = KEY_CODE[keyCode];
        }
      }
      return validKey;
    }

    function keyboardEventToKey(ev) {
      // fall back from .key, to .keyIdentifier, to .keyCode, and then to .detail.key to support artificial keyboard events
      var normalizedKey = transformKey(ev.key) || transformKeyIdentifier(ev.keyIdentifier) || transformKeyCode(ev.keyCode) || transformKey(ev.detail.key) || '';
      return {
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        meta: ev.metaKey,
        alt: ev.altKey,
        key: normalizedKey
      };
    }

    /*
     * Input: ctrl+shift+f7 => {ctrl: true, shift: true, key: 'f7'}
     * ctrl/space => {ctrl: true} || {key: space}
     */
    function stringToKey(keyCombo) {
      var keys = keyCombo.split('+');
      var keyObj = Object.create(null);
      keys.forEach(function(key) {
        if (key == 'shift') {
          keyObj.shift = true;
        } else if (key == 'ctrl') {
          keyObj.ctrl = true;
        } else if (key == 'alt') {
          keyObj.alt = true;
        } else {
          keyObj.key = key;
        }
      });
      return keyObj;
    }

    function keyMatches(a, b) {
      return Boolean(a.alt) == Boolean(b.alt) && Boolean(a.ctrl) == Boolean(b.ctrl) && Boolean(a.shift) == Boolean(b.shift) && a.key === b.key;
    }

    function processKeys(ev) {
      var current = keyboardEventToKey(ev);
      for (var i = 0, dk; i < this._desiredKeys.length; i++) {
        dk = this._desiredKeys[i];
        if (keyMatches(dk, current)) {
          ev.preventDefault();
          ev.stopPropagation();
          this.fire('keys-pressed', current, this, false);
          break;
        }
      }
    }

    function listen(node, handler) {
      if (node && node.addEventListener) {
        node.addEventListener('keydown', handler);
      }
    }

    function unlisten(node, handler) {
      if (node && node.removeEventListener) {
        node.removeEventListener('keydown', handler);
      }
    }

    Polymer('core-a11y-keys', {
      created: function() {
        this._keyHandler = processKeys.bind(this);
      },
      attached: function() {
        if (!this.target) {
          this.target = this.parentNode;
        }
        listen(this.target, this._keyHandler);
      },
      detached: function() {
        unlisten(this.target, this._keyHandler);
      },
      publish: {
        /**
         * The set of key combinations that will be matched (in keys syntax).
         *
         * @attribute keys
         * @type string
         * @default ''
         */
        keys: '',
        /**
         * The node that will fire keyboard events.
         * Default to this element's parentNode unless one is assigned
         *
         * @attribute target
         * @type Node
         * @default this.parentNode
         */
        target: null
      },
      keysChanged: function() {
        // * can have multiple mappings: shift+8, * on numpad or Multiply on numpad
        var normalized = this.keys.replace('*', '* shift+*');
        this._desiredKeys = normalized.toLowerCase().split(' ').map(stringToKey);
      },
      targetChanged: function(oldTarget) {
        unlisten(oldTarget, this._keyHandler);
        listen(this.target, this._keyHandler);
      }
    });
  })();
;

    Polymer('paper-button',{

      publish: {

        /**
         * If true, the button will be styled with a shadow.
         *
         * @attribute raised
         * @type boolean
         * @default false
         */
        raised: false,

        /**
         * By default the ripple emanates from where the user touched the button.
         * Set this to true to always center the ripple.
         *
         * @attribute recenteringTouch
         * @type boolean
         * @default false
         */
        recenteringTouch: false,

        /**
         * By default the ripple expands to fill the button. Set this to true to
         * constrain the ripple to a circle within the button.
         *
         * @attribute fill
         * @type boolean
         * @default true
         */
        fill: true

      },

      _activate: function() {
        this.click();
        this.fire('tap');
        if (!this.pressed) {
          var bcr = this.getBoundingClientRect();
          var x = bcr.left + (bcr.width / 2);
          var y = bcr.top + (bcr.height / 2);
          this.downAction({x: x, y: y});
          var fn = function fn() {
            this.upAction();
            this.removeEventListener('keyup', fn);
          }.bind(this);
          this.addEventListener('keyup', fn);
        }
      }

    });
  ;


  Polymer('core-input', {

    publish: {

      /**
       * The "committed" value of the input, ie. the input value when the user
       * hits the "enter" key or blurs the input after changing the value. You
       * can bind to this value instead of listening for the "change" event.
       * Setting this property has no effect on the input value.
       *
       * @attribute committedValue
       * @type string
       * @default ''
       */
      committedValue: '',

      /**
       * Set to true to prevent invalid input from being entered.
       *
       * @attribute preventInvalidInput
       * @type boolean
       * @default false
       */
      preventInvalidInput: false

    },

    previousValidInput: '',

    eventDelegates: {
      input: 'inputAction',
      change: 'changeAction'
    },

    ready: function() {
      /* set ARIA attributes */
      this.disabledHandler();
      this.placeholderHandler();
    },

    attributeChanged: function(attr, old) {
      if (this[attr + 'Handler']) {
        this[attr + 'Handler'](old);
      }
    },

    disabledHandler: function() {
      if (this.disabled) {
        this.setAttribute('aria-disabled', '');
      } else {
        this.removeAttribute('aria-disabled');
      }
    },

    placeholderHandler: function() {
      if (this.placeholder) {
        this.setAttribute('aria-label', this.placeholder);
      } else {
        this.removeAttribute('aria-label');
      }
    },

    /**
     * Commits the `value` to `committedValue`
     *
     * @method commit
     */
    commit: function() {
      this.committedValue = this.value;
    },

    changeAction: function() {
      this.commit();
    },

    inputAction: function(e) {
      if (this.preventInvalidInput) {
        if (!e.target.validity.valid) {
          e.target.value = this.previousValidInput;
        } else {
          this.previousValidInput = e.target.value;
        }
      }
    }

  });

;

(function() {

window.CoreStyle = window.CoreStyle || {
  g: {},
  list: {},
  refMap: {}
};

Polymer('core-style', {
  /**
   * The `id` property should be set if the `core-style` is a producer
   * of styles. In this case, the `core-style` should have text content
   * that is cssText.
   *
   * @attribute id
   * @type string
   * @default ''
   */


  publish: {
    /**
     * The `ref` property should be set if the `core-style` element is a 
     * consumer of styles. Set it to the `id` of the desired `core-style`
     * element.
     *
     * @attribute ref
     * @type string
     * @default ''
     */
    ref: ''
  },

  // static
  g: CoreStyle.g,
  refMap: CoreStyle.refMap,

  /**
   * The `list` is a map of all `core-style` producers stored by `id`. It 
   * should be considered readonly. It's useful for nesting one `core-style`
   * inside another.
   *
   * @attribute list
   * @type object
   * @default {map of all `core-style` producers}
   */
  list: CoreStyle.list,

  // if we have an id, we provide style
  // if we have a ref, we consume/require style
  ready: function() {
    if (this.id) {
      this.provide();
    } else {
      this.registerRef(this.ref);
      if (!window.ShadowDOMPolyfill) {
        this.require();
      }  
    }
  },

  // can't shim until attached if using SD polyfill because need to find host
  attached: function() {
    if (!this.id && window.ShadowDOMPolyfill) {
      this.require();
    }
  },

  /****** producer stuff *******/

  provide: function() {
    this.register();
    // we want to do this asap, especially so we can do so before definitions
    // that use this core-style are registered.
    if (this.textContent) {
      this._completeProvide();
    } else {
      this.async(this._completeProvide);
    }
  },

  register: function() {
    var i = this.list[this.id];
    if (i) {
      if (!Array.isArray(i)) {
        this.list[this.id] = [i];
      }
      this.list[this.id].push(this);
    } else {
      this.list[this.id] = this;  
    }
  },

  // stamp into a shadowRoot so we can monitor dom of the bound output
  _completeProvide: function() {
    this.createShadowRoot();
    this.domObserver = new MutationObserver(this.domModified.bind(this))
        .observe(this.shadowRoot, {subtree: true, 
        characterData: true, childList: true});
    this.provideContent();
  },

  provideContent: function() {
    this.ensureTemplate();
    this.shadowRoot.textContent = '';
    this.shadowRoot.appendChild(this.instanceTemplate(this.template));
    this.cssText = this.shadowRoot.textContent;
  },

  ensureTemplate: function() {
    if (!this.template) {
      this.template = this.querySelector('template:not([repeat]):not([bind])');
      // move content into the template
      if (!this.template) {
        this.template = document.createElement('template');
        var n = this.firstChild;
        while (n) {
          this.template.content.appendChild(n.cloneNode(true));
          n = n.nextSibling;
        }
      }
    }
  },

  domModified: function() {
    this.cssText = this.shadowRoot.textContent;
    this.notify();
  },

  // notify instances that reference this element
  notify: function() {
    var s$ = this.refMap[this.id];
    if (s$) {
      for (var i=0, s; (s=s$[i]); i++) {
        s.require();
      }
    }
  },

  /****** consumer stuff *******/

  registerRef: function(ref) {
    //console.log('register', ref);
    this.refMap[this.ref] = this.refMap[this.ref] || [];
    this.refMap[this.ref].push(this);
  },

  applyRef: function(ref) {
    this.ref = ref;
    this.registerRef(this.ref);
    this.require();
  },

  require: function() {
    var cssText = this.cssTextForRef(this.ref);
    //console.log('require', this.ref, cssText);
    if (cssText) {
      this.ensureStyleElement();
      // do nothing if cssText has not changed
      if (this.styleElement._cssText === cssText) {
        return;
      }
      this.styleElement._cssText = cssText;
      if (window.ShadowDOMPolyfill) {
        this.styleElement.textContent = cssText;
        cssText = WebComponents.ShadowCSS.shimStyle(this.styleElement,
            this.getScopeSelector());
      }
      this.styleElement.textContent = cssText;
    }
  },

  cssTextForRef: function(ref) {
    var s$ = this.byId(ref);
    var cssText = '';
    if (s$) {
      if (Array.isArray(s$)) {
        var p = [];
        for (var i=0, l=s$.length, s; (i<l) && (s=s$[i]); i++) {
          p.push(s.cssText);
        }
        cssText = p.join('\n\n');
      } else {
        cssText = s$.cssText;
      }
    }
    if (s$ && !cssText) {
      console.warn('No styles provided for ref:', ref);
    }
    return cssText;
  },

  byId: function(id) {
    return this.list[id];
  },

  ensureStyleElement: function() {
    if (!this.styleElement) {
      this.styleElement = window.ShadowDOMPolyfill ? 
          this.makeShimStyle() :
          this.makeRootStyle();
    }
    if (!this.styleElement) {
      console.warn(this.localName, 'could not setup style.');
    }
  },

  makeRootStyle: function() {
    var style = document.createElement('style');
    this.appendChild(style);
    return style;
  },

  makeShimStyle: function() {
    var host = this.findHost(this);
    if (host) {
      var name = host.localName;
      var style = document.querySelector('style[' + name + '=' + this.ref +']');
      if (!style) {
        style = document.createElement('style');
        style.setAttribute(name, this.ref);
        document.head.appendChild(style);
      }
      return style;
    }
  },

  getScopeSelector: function() {
    if (!this._scopeSelector) {
      var selector = '', host = this.findHost(this);
      if (host) {
        var typeExtension = host.hasAttribute('is');
        var name = typeExtension ? host.getAttribute('is') : host.localName;
        selector = WebComponents.ShadowCSS.makeScopeSelector(name, 
            typeExtension);
      }
      this._scopeSelector = selector;
    }
    return this._scopeSelector;
  },

  findHost: function(node) {
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node.host || wrap(document.documentElement);
  },

  /* filters! */
  // TODO(dfreedm): add more filters!

  cycle: function(rgb, amount) {
    if (rgb.match('#')) {
      var o = this.hexToRgb(rgb);
      if (!o) {
        return rgb;
      }
      rgb = 'rgb(' + o.r + ',' + o.b + ',' + o.g + ')';
    }

    function cycleChannel(v) {
      return Math.abs((Number(v) - amount) % 255);
    }

    return rgb.replace(/rgb\(([^,]*),([^,]*),([^,]*)\)/, function(m, a, b, c) {
      return 'rgb(' + cycleChannel(a) + ',' + cycleChannel(b) + ', ' 
          + cycleChannel(c) + ')';
    });
  },

  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

});


})();
;


  (function() {

    var paperInput = CoreStyle.g.paperInput = CoreStyle.g.paperInput || {};

    paperInput.labelColor = '#757575';
    paperInput.focusedColor = '#4059a9';
    paperInput.invalidColor = '#d34336';

    Polymer('paper-input-decorator',{

      publish: {

        /**
         * The label for this input. It normally appears as grey text inside
         * the text input and disappears once the user enters text.
         *
         * @attribute label
         * @type string
         * @default ''
         */
        label: '',

        /**
         * If true, the label will "float" above the text input once the
         * user enters text instead of disappearing.
         *
         * @attribute floatingLabel
         * @type boolean
         * @default false
         */
        floatingLabel: false,

        /**
         * Set to true to style the element as disabled.
         *
         * @attribute disabled
         * @type boolean
         * @default false
         */
        disabled: {value: false, reflect: true},

        /**
         * Use this property to override the automatic label visibility.
         * If this property is set to `true` or `false`, the label visibility
         * will respect this value instead of be based on whether there is
         * a non-null value in the input.
         *
         * @attribute labelVisible
         * @type boolean
         * @default false
         */
        labelVisible: null,

        /**
         * Set this property to true to show the error message.
         *
         * @attribute isInvalid
         * @type boolean
         * @default false
         */
        isInvalid: false,

        /**
         * Set this property to true to validate the input as the user types.
         * This will not validate when changing the input programmatically; call
         * `validate()` instead.
         *
         * @attribute autoValidate
         * @type boolean
         * @default false
         */
        autoValidate: false,

        /**
         * The message to display if the input value fails validation. If this
         * is unset or the empty string, a default message is displayed depending
         * on the type of validation error.
         *
         * @attribute error
         * @type string
         */
        error: '',

        focused: {value: false, reflect: true}

      },

      computed: {
        floatingLabelVisible: 'floatingLabel && !_labelVisible',
        _labelVisible: '(labelVisible === true || labelVisible === false) ? labelVisible : _autoLabelVisible'
      },

      ready: function() {
        // Delegate focus/blur events
        Polymer.addEventListener(this, 'focus', this.focusAction.bind(this), true);
        Polymer.addEventListener(this, 'blur', this.blurAction.bind(this), true);
      },

      attached: function() {
        this.input = this.querySelector('input,textarea');

        this.mo = new MutationObserver(function() {
          this.input = this.querySelector('input,textarea');
        }.bind(this));
        this.mo.observe(this, {childList: true});
      },

      detached: function() {
        this.mo.disconnect();
        this.mo = null;
      },

      prepareLabelTransform: function() {
        var toRect = this.$.floatedLabelText.getBoundingClientRect();
        var fromRect = this.$.labelText.getBoundingClientRect();
        if (toRect.width !== 0) {
          var sy = toRect.height / fromRect.height;
          this.$.labelText.cachedTransform =
            'scale3d(' + (toRect.width / fromRect.width) + ',' + sy + ',1) ' +
            'translate3d(0,' + (toRect.top - fromRect.top) / sy + 'px,0)';
        }
      },

      animateFloatingLabel: function() {
        if (!this.floatingLabel || this.labelAnimated) {
          return false;
        }

        if (!this.$.labelText.cachedTransform) {
          this.prepareLabelTransform();
        }

        // If there's still no cached transform, the input is invisible so don't
        // do the animation.
        if (!this.$.labelText.cachedTransform) {
          return false;
        }

        this.labelAnimated = true;
        // Handle interrupted animation
        this.async(function() {
          this.transitionEndAction();
        }, null, 250);

        if (this._labelVisible) {
          // Handle if the label started out floating
          if (!this.$.labelText.style.webkitTransform && !this.$.labelText.style.transform) {
            this.$.labelText.style.webkitTransform = this.$.labelText.cachedTransform;
            this.$.labelText.style.transform = this.$.labelText.cachedTransform;
            this.$.labelText.offsetTop;
          }
          this.$.labelText.style.webkitTransform = '';
          this.$.labelText.style.transform = '';
        } else {
          this.$.labelText.style.webkitTransform = this.$.labelText.cachedTransform;
          this.$.labelText.style.transform = this.$.labelText.cachedTransform;
          this.input.placeholder = '';
        }

        return true;
      },

      animateUnderline: function(e) {
        if (this.focused) {
          var rect = this.$.underline.getBoundingClientRect();
          var right = e.x - rect.left;
          this.$.focusedUnderline.style.mozTransformOrigin = right + 'px';
          this.$.focusedUnderline.style.webkitTransformOrigin = right + 'px ';
          this.$.focusedUnderline.style.transformOriginX = right + 'px';

          // Animations only run when the user interacts with the input
          this.underlineAnimated = true;
        }
      },

      /**
       * Validate the input using HTML5 Constraints.
       *
       * @method validate
       * @return {boolean} True if the input is valid.
       */
      validate: function() {
        if (!this.input) {
          return true;
        }

        this.isInvalid = !this.input.validity.valid;
        return this.input.validity.valid;
      },

      _labelVisibleChanged: function(old) {
        // do not do the animation on first render
        if (old !== undefined) {
          if (!this.animateFloatingLabel()) {
            this.updateInputLabel(this.input, this.label);
          }
        }
      },

      labelVisibleChanged: function() {
        if (this.labelVisible === 'true') {
          this.labelVisible = true;
        } else if (this.labelVisible === 'false') {
          this.labelVisible = false;
        }
      },

      labelChanged: function() {
        if (this.input) {
          this.updateInputLabel(this.input, this.label);
        }
      },

      isInvalidChanged: function() {
        this.classList.toggle('invalid', this.isInvalid);
      },

      focusedChanged: function() {
        this.updateLabelVisibility(this.input && this.input.value);
        if (this.lastEvent) {
          this.animateUnderline(this.lastEvent);
          this.lastEvent = null;
        }
        this.underlineVisible = this.focused;
      },

      inputChanged: function(old) {
        if (this.input) {
          this.updateLabelVisibility(this.input.value);
          this.updateInputLabel(this.input, this.label);

          if (this.autoValidate) {
            this.validate();
          }
        }
        if (old) {
          this.updateInputLabel(old, '');
        }
      },

      focusAction: function() {
        this.focused = true;
      },

      blurAction: function() {
        this.focused = false;
      },

      /**
       * Updates the label visibility based on a value. This is handled automatically
       * if the user is typing, but if you imperatively set the input value you need
       * to call this function.
       *
       * @method updateLabelVisibility
       * @param {string} value
       */
      updateLabelVisibility: function(value) {
        var v = (value !== null && value !== undefined) ? String(value) : value;
        this._autoLabelVisible = (!this.focused && !v) || (!this.floatingLabel && !v);
      },

      updateInputLabel: function(input, label) {
        if (this._labelVisible) {
          this.input.placeholder = this.label;
        } else {
          this.input.placeholder = '';
        }
        if (label) {
          input.setAttribute('aria-label', label);
        } else {
          input.removeAttribute('aria-label');
        }
      },

      inputAction: function() {
        this.updateLabelVisibility(this.input.value);
        if (this.autoValidate) {
          this.validate();
        }
      },

      downAction: function(e) {
        // eat the event and do nothing if already focused
        if (e.target !== this.input && this.focused) {
          e.preventDefault();
          return;
        }
        // cache the event here because "down" fires before "focus" when tapping on
        // the input and the underline animation runs on focus change
        this.lastEvent = e;
      },

      tapAction: function(e) {
        if (this.disabled) {
          return;
        }

        if (this.focused) {
          return;
        }

        if (this.input) {
          this.input.focus();
          e.preventDefault();
        }
      },

      transitionEndAction: function() {
        this.underlineAnimated = false;
        this.labelAnimated = false;
        if (this._labelVisible) {
          this.input.placeholder = this.label;
        }
      },

      charCounterErrorAction: function(e) {
        this.isInvalid = e.detail.hasError;

        // If the allowed characters have been exceeded, show either the error
        // icon, or the character counter, but not both.
        this.$.errorIcon.hidden = e.detail.hideErrorIcon;
      }

    });

  }());

  ;


  Polymer('paper-input', {

    publish: {
      /**
       * The label for this input. It normally appears as grey text inside
       * the text input and disappears once the user enters text.
       *
       * @attribute label
       * @type string
       * @default ''
       */
      label: '',

      /**
       * If true, the label will "float" above the text input once the
       * user enters text instead of disappearing.
       *
       * @attribute floatingLabel
       * @type boolean
       * @default false
       */
      floatingLabel: false,

      /**
       * Set to true to style the element as disabled.
       *
       * @attribute disabled
       * @type boolean
       * @default false
       */
      disabled: {value: false, reflect: true},

      /**
       * The current value of the input.
       *
       * @attribute value
       * @type String
       * @default ''
       */
      value: '',

      /**
       * The most recently committed value of the input.
       *
       * @attribute committedValue
       * @type String
       * @default ''
       */
      committedValue: ''

    },

    /**
     * Focuses the `input`.
     *
     * @method focus
     */
    focus: function() {
      this.$.input.focus();
    },

    valueChanged: function() {
      this.$.decorator.updateLabelVisibility(this.value);
    },

    changeAction: function(e) {
      // re-fire event that does not bubble across shadow roots
      this.fire('change', null, this);
    }

  });

;

    Polymer('core-selection', {
      /**
       * If true, multiple selections are allowed.
       *
       * @attribute multi
       * @type boolean
       * @default false
       */
      multi: false,
      ready: function() {
        this.clear();
      },
      clear: function() {
        this.selection = [];
      },
      /**
       * Retrieves the selected item(s).
       * @method getSelection
       * @returns Returns the selected item(s). If the multi property is true,
       * getSelection will return an array, otherwise it will return 
       * the selected item or undefined if there is no selection.
      */
      getSelection: function() {
        return this.multi ? this.selection : this.selection[0];
      },
      /**
       * Indicates if a given item is selected.
       * @method isSelected
       * @param {any} item The item whose selection state should be checked.
       * @returns Returns true if `item` is selected.
      */
      isSelected: function(item) {
        return this.selection.indexOf(item) >= 0;
      },
      setItemSelected: function(item, isSelected) {
        if (item !== undefined && item !== null) {
          if (isSelected) {
            this.selection.push(item);
          } else {
            var i = this.selection.indexOf(item);
            if (i >= 0) {
              this.selection.splice(i, 1);
            }
          }
          this.fire("core-select", {isSelected: isSelected, item: item});
        }
      },
      /**
       * Set the selection state for a given `item`. If the multi property
       * is true, then the selected state of `item` will be toggled; otherwise
       * the `item` will be selected.
       * @method select
       * @param {any} item: The item to select.
      */
      select: function(item) {
        if (this.multi) {
          this.toggle(item);
        } else if (this.getSelection() !== item) {
          this.setItemSelected(this.getSelection(), false);
          this.setItemSelected(item, true);
        }
      },
      /**
       * Toggles the selection state for `item`.
       * @method toggle
       * @param {any} item: The item to toggle.
      */
      toggle: function(item) {
        this.setItemSelected(item, !this.isSelected(item));
      }
    });
  ;


    Polymer('core-selector', {

      /**
       * Gets or sets the selected element.  Default to use the index
       * of the item element.
       *
       * If you want a specific attribute value of the element to be
       * used instead of index, set "valueattr" to that attribute name.
       *
       * Example:
       *
       *     <core-selector valueattr="label" selected="foo">
       *       <div label="foo"></div>
       *       <div label="bar"></div>
       *       <div label="zot"></div>
       *     </core-selector>
       *
       * In multi-selection this should be an array of values.
       *
       * Example:
       *
       *     <core-selector id="selector" valueattr="label" multi>
       *       <div label="foo"></div>
       *       <div label="bar"></div>
       *       <div label="zot"></div>
       *     </core-selector>
       *
       *     this.$.selector.selected = ['foo', 'zot'];
       *
       * @attribute selected
       * @type Object
       * @default null
       */
      selected: null,

      /**
       * If true, multiple selections are allowed.
       *
       * @attribute multi
       * @type boolean
       * @default false
       */
      multi: false,

      /**
       * Specifies the attribute to be used for "selected" attribute.
       *
       * @attribute valueattr
       * @type string
       * @default 'name'
       */
      valueattr: 'name',

      /**
       * Specifies the CSS class to be used to add to the selected element.
       *
       * @attribute selectedClass
       * @type string
       * @default 'core-selected'
       */
      selectedClass: 'core-selected',

      /**
       * Specifies the property to be used to set on the selected element
       * to indicate its active state.
       *
       * @attribute selectedProperty
       * @type string
       * @default ''
       */
      selectedProperty: '',

      /**
       * Specifies the attribute to set on the selected element to indicate
       * its active state.
       *
       * @attribute selectedAttribute
       * @type string
       * @default 'active'
       */
      selectedAttribute: 'active',

      /**
       * Returns the currently selected element. In multi-selection this returns
       * an array of selected elements.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       *
       * @attribute selectedItem
       * @type Object
       * @default null
       */
      selectedItem: null,

      /**
       * In single selection, this returns the model associated with the
       * selected element.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       *
       * @attribute selectedModel
       * @type Object
       * @default null
       */
      selectedModel: null,

      /**
       * In single selection, this returns the selected index.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       *
       * @attribute selectedIndex
       * @type number
       * @default -1
       */
      selectedIndex: -1,

      /**
       * Nodes with local name that are in the list will not be included
       * in the selection items.  In the following example, `items` returns four
       * `core-item`'s and doesn't include `h3` and `hr`.
       *
       *     <core-selector excludedLocalNames="h3 hr">
       *       <h3>Header</h3>
       *       <core-item>Item1</core-item>
       *       <core-item>Item2</core-item>
       *       <hr>
       *       <core-item>Item3</core-item>
       *       <core-item>Item4</core-item>
       *     </core-selector>
       *
       * @attribute excludedLocalNames
       * @type string
       * @default ''
       */
      excludedLocalNames: '',

      /**
       * The target element that contains items.  If this is not set
       * core-selector is the container.
       *
       * @attribute target
       * @type Object
       * @default null
       */
      target: null,

      /**
       * This can be used to query nodes from the target node to be used for
       * selection items.  Note this only works if `target` is set
       * and is not `core-selector` itself.
       *
       * Example:
       *
       *     <core-selector target="{{$.myForm}}" itemsSelector="input[type=radio]"></core-selector>
       *     <form id="myForm">
       *       <label><input type="radio" name="color" value="red"> Red</label> <br>
       *       <label><input type="radio" name="color" value="green"> Green</label> <br>
       *       <label><input type="radio" name="color" value="blue"> Blue</label> <br>
       *       <p>color = {{color}}</p>
       *     </form>
       *
       * @attribute itemsSelector
       * @type string
       * @default ''
       */
      itemsSelector: '',

      /**
       * The event that would be fired from the item element to indicate
       * it is being selected.
       *
       * @attribute activateEvent
       * @type string
       * @default 'tap'
       */
      activateEvent: 'tap',

      /**
       * Set this to true to disallow changing the selection via the
       * `activateEvent`.
       *
       * @attribute notap
       * @type boolean
       * @default false
       */
      notap: false,

      defaultExcludedLocalNames: 'template',

      observe: {
        'selected multi': 'selectedChanged'
      },

      ready: function() {
        this.activateListener = this.activateHandler.bind(this);
        this.itemFilter = this.filterItem.bind(this);
        this.excludedLocalNamesChanged();
        this.observer = new MutationObserver(this.updateSelected.bind(this));
        if (!this.target) {
          this.target = this;
        }
      },

      /**
       * Returns an array of all items.
       *
       * @property items
       * @type array
       */
      get items() {
        if (!this.target) {
          return [];
        }
        var nodes = this.target !== this ? (this.itemsSelector ?
            this.target.querySelectorAll(this.itemsSelector) :
                this.target.children) : this.$.items.getDistributedNodes();
        return Array.prototype.filter.call(nodes, this.itemFilter);
      },

      filterItem: function(node) {
        return !this._excludedNames[node.localName];
      },

      excludedLocalNamesChanged: function() {
        this._excludedNames = {};
        var s = this.defaultExcludedLocalNames;
        if (this.excludedLocalNames) {
          s += ' ' + this.excludedLocalNames;
        }
        s.split(/\s+/g).forEach(function(n) {
          this._excludedNames[n] = 1;
        }, this);
      },

      targetChanged: function(old) {
        if (old) {
          this.removeListener(old);
          this.observer.disconnect();
          this.clearSelection();
        }
        if (this.target) {
          this.addListener(this.target);
          this.observer.observe(this.target, {childList: true});
          this.updateSelected();
        }
      },

      addListener: function(node) {
        Polymer.addEventListener(node, this.activateEvent, this.activateListener);
      },

      removeListener: function(node) {
        Polymer.removeEventListener(node, this.activateEvent, this.activateListener);
      },

      /**
       * Returns the selected item(s). If the `multi` property is true,
       * this will return an array, otherwise it will return
       * the selected item or undefined if there is no selection.
       */
      get selection() {
        return this.$.selection.getSelection();
      },

      selectedChanged: function() {
        // TODO(ffu): Right now this is the only way to know that the `selected`
        // is an array and was mutated, as opposed to newly assigned.
        if (arguments.length === 1) {
          this.processSplices(arguments[0]);
        } else {
          this.updateSelected();
        }
      },

      updateSelected: function() {
        this.validateSelected();
        if (this.multi) {
          this.clearSelection(this.selected);
          this.selected && this.selected.forEach(function(s) {
            this.setValueSelected(s, true);
          }, this);
        } else {
          this.valueToSelection(this.selected);
        }
      },

      validateSelected: function() {
        // convert to an array for multi-selection
        if (this.multi && !Array.isArray(this.selected) &&
            this.selected != null) {
          this.selected = [this.selected];
        // use the first selected in the array for single-selection
        } else if (!this.multi && Array.isArray(this.selected)) {
          var s = this.selected[0];
          this.clearSelection([s]);
          this.selected = s;
        }
      },

      processSplices: function(splices) {
        for (var i = 0, splice; splice = splices[i]; i++) {
          for (var j = 0; j < splice.removed.length; j++) {
            this.setValueSelected(splice.removed[j], false);
          }
          for (var j = 0; j < splice.addedCount; j++) {
            this.setValueSelected(this.selected[splice.index + j], true);
          }
        }
      },

      clearSelection: function(excludes) {
        this.$.selection.selection.slice().forEach(function(item) {
          var v = this.valueForNode(item) || this.items.indexOf(item);
          if (!excludes || excludes.indexOf(v) < 0) {
            this.$.selection.setItemSelected(item, false);
          }
        }, this);
      },

      valueToSelection: function(value) {
        var item = this.valueToItem(value);
        this.$.selection.select(item);
      },

      setValueSelected: function(value, isSelected) {
        var item = this.valueToItem(value);
        if (isSelected ^ this.$.selection.isSelected(item)) {
          this.$.selection.setItemSelected(item, isSelected);
        }
      },

      updateSelectedItem: function() {
        this.selectedItem = this.selection;
      },

      selectedItemChanged: function() {
        if (this.selectedItem) {
          var t = this.selectedItem.templateInstance;
          this.selectedModel = t ? t.model : undefined;
        } else {
          this.selectedModel = null;
        }
        this.selectedIndex = this.selectedItem ?
            parseInt(this.valueToIndex(this.selected)) : -1;
      },

      valueToItem: function(value) {
        return (value === null || value === undefined) ?
            null : this.items[this.valueToIndex(value)];
      },

      valueToIndex: function(value) {
        // find an item with value == value and return it's index
        for (var i=0, items=this.items, c; (c=items[i]); i++) {
          if (this.valueForNode(c) == value) {
            return i;
          }
        }
        // if no item found, the value itself is probably the index
        return value;
      },

      valueForNode: function(node) {
        return node[this.valueattr] || node.getAttribute(this.valueattr);
      },

      // events fired from <core-selection> object
      selectionSelect: function(e, detail) {
        this.updateSelectedItem();
        if (detail.item) {
          this.applySelection(detail.item, detail.isSelected);
        }
      },

      applySelection: function(item, isSelected) {
        if (this.selectedClass) {
          item.classList.toggle(this.selectedClass, isSelected);
        }
        if (this.selectedProperty) {
          item[this.selectedProperty] = isSelected;
        }
        if (this.selectedAttribute && item.setAttribute) {
          if (isSelected) {
            item.setAttribute(this.selectedAttribute, '');
          } else {
            item.removeAttribute(this.selectedAttribute);
          }
        }
      },

      // event fired from host
      activateHandler: function(e) {
        if (!this.notap) {
          var i = this.findDistributedTarget(e.target, this.items);
          if (i >= 0) {
            var item = this.items[i];
            var s = this.valueForNode(item) || i;
            if (this.multi) {
              if (this.selected) {
                this.addRemoveSelected(s);
              } else {
                this.selected = [s];
              }
            } else {
              this.selected = s;
            }
            this.asyncFire('core-activate', {item: item});
          }
        }
      },

      addRemoveSelected: function(value) {
        var i = this.selected.indexOf(value);
        if (i >= 0) {
          this.selected.splice(i, 1);
        } else {
          this.selected.push(value);
        }
      },

      findDistributedTarget: function(target, nodes) {
        // find first ancestor of target (including itself) that
        // is in nodes, if any
        while (target && target != this) {
          var i = Array.prototype.indexOf.call(nodes, target);
          if (i >= 0) {
            return i;
          }
          target = target.parentNode;
        }
      },

      selectIndex: function(index) {
        var item = this.items[index];
        if (item) {
          this.selected = this.valueForNode(item) || index;
          return item;
        }
      },

      /**
       * Selects the previous item. This should be used in single selection only.
       *
       * @method selectPrevious
       * @param {boolean} wrapped if true and it is already at the first item,
       * wrap to the end
       * @returns the previous item or undefined if there is none
       */
      selectPrevious: function(wrapped) {
        var i = wrapped && !this.selectedIndex ?
            this.items.length - 1 : this.selectedIndex - 1;
        return this.selectIndex(i);
      },

      /**
       * Selects the next item.  This should be used in single selection only.
       *
       * @method selectNext
       * @param {boolean} wrapped if true and it is already at the last item,
       * wrap to the front
       * @returns the next item or undefined if there is none
       */
      selectNext: function(wrapped) {
        var i = wrapped && this.selectedIndex >= this.items.length - 1 ?
            0 : this.selectedIndex + 1;
        return this.selectIndex(i);
      }

    });
  ;
Polymer('core-menu');;


(function() {

  function docElem(property) {
    var t;
    return ((t = document.documentElement) || (t = document.body.parentNode)) && (typeof t[property] === 'number') ? t : document.body;
  }

  // View width and height excluding any visible scrollbars
  // http://www.highdots.com/forums/javascript/faq-topic-how-do-i-296669.html
  //    1) document.client[Width|Height] always reliable when available, including Safari2
  //    2) document.documentElement.client[Width|Height] reliable in standards mode DOCTYPE, except for Safari2, Opera<9.5
  //    3) document.body.client[Width|Height] is gives correct result when #2 does not, except for Safari2
  //    4) When document.documentElement.client[Width|Height] is unreliable, it will be size of <html> element either greater or less than desired view size
  //       https://bugzilla.mozilla.org/show_bug.cgi?id=156388#c7
  //    5) When document.body.client[Width|Height] is unreliable, it will be size of <body> element less than desired view size
  function viewSize() {
    // This algorithm avoids creating test page to determine if document.documentElement.client[Width|Height] is greater then view size,
    // will succeed where such test page wouldn't detect dynamic unreliability,
    // and will only fail in the case the right or bottom edge is within the width of a scrollbar from edge of the viewport that has visible scrollbar(s).
    var doc = docElem('clientWidth');
    var body = document.body;
    var w, h;
    return typeof document.clientWidth === 'number' ?
      {w: document.clientWidth, h: document.clientHeight} :
      doc === body || (w = Math.max( doc.clientWidth, body.clientWidth )) > self.innerWidth || (h = Math.max( doc.clientHeight, body.clientHeight )) > self.innerHeight ?
        {w: body.clientWidth, h: body.clientHeight} : {w: w, h: h };
  }

  Polymer('core-dropdown',{

    publish: {

      /**
       * The element associated with this dropdown, usually the element that triggers
       * the menu. If unset, this property will default to the target's parent node
       * or shadow host.
       *
       * @attribute relatedTarget
       * @type Node
       */
      relatedTarget: null,

      /**
       * The horizontal alignment of the popup relative to `relatedTarget`. `left`
       * means the left edges are aligned together. `right` means the right edges
       * are aligned together.
       *
       * Accepted values: 'left', 'right'
       *
       * @attribute halign
       * @type String
       * @default 'left'
       */
      halign: 'left',

      /**
       * The vertical alignment of the popup relative to `relatedTarget`. `top` means
       * the top edges are aligned together. `bottom` means the bottom edges are
       * aligned together.
       *
       * Accepted values: 'top', 'bottom'
       *
       * @attribute valign
       * @type String
       * @default 'top'
       */
      valign: 'top'

    },

    measure: function() {
      var target = this.target;
      // remember position, because core-overlay may have set the property
      var pos = target.style.position;

      // get the size of the target as if it's positioned in the top left
      // corner of the screen
      target.style.position = 'fixed';
      target.style.left = '0px';
      target.style.top = '0px';

      var rect = target.getBoundingClientRect();

      target.style.position = pos;
      target.style.left = null;
      target.style.top = null;

      return rect;
    },

    resetTargetDimensions: function() {
      var dims = this.dimensions;
      var style = this.target.style;
      if (dims.position.h_by === this.localName) {
        style[dims.position.h] = null;
        dims.position.h_by = null;
      }
      if (dims.position.v_by === this.localName) {
        style[dims.position.v] = null;
        dims.position.v_by = null;
      }

      var style = this.sizingTarget.style;
      style.width = null;
      style.height = null;
      this.super();
    },

    positionTarget: function() {
      if (!this.relatedTarget) {
        this.relatedTarget = this.target.parentElement || (this.target.parentNode && this.target.parentNode.host);
        if (!this.relatedTarget) {
          this.super();
          return;
        }
      }

      // explicitly set width/height, because we don't want it constrained
      // to the offsetParent
      var target = this.sizingTarget;
      var rect = this.measure();
      target.style.width = Math.ceil(rect.width) + 'px';
      target.style.height = Math.ceil(rect.height) + 'px';

      if (this.layered) {
        this.positionLayeredTarget();
      } else {
        this.positionNestedTarget();
      }
    },

    positionLayeredTarget: function() {
      var target = this.target;
      var rect = this.relatedTarget.getBoundingClientRect();

      var dims = this.dimensions;
      var margin = dims.margin;
      var vp = viewSize();

      if (!dims.position.h) {
        if (this.halign === 'right') {
          target.style.right = vp.w - rect.right - margin.right + 'px';
          dims.position.h = 'right';
        } else {
          target.style.left = rect.left - margin.left + 'px';
          dims.position.h = 'left';
        }
        dims.position.h_by = this.localName;
      }

      if (!dims.position.v) {
        if (this.valign === 'bottom') {
          target.style.bottom = vp.h - rect.bottom - margin.bottom + 'px';
          dims.position.v = 'bottom';
        } else {
          target.style.top = rect.top - margin.top + 'px';
          dims.position.v = 'top';
        }
        dims.position.v_by = this.localName;
      }

      if (dims.position.h_by || dims.position.v_by) {
        target.style.position = 'fixed';
      }
    },

    positionNestedTarget: function() {
      var target = this.target;
      var related = this.relatedTarget;

      var t_op = target.offsetParent;
      var r_op = related.offsetParent;
      if (window.ShadowDOMPolyfill) {
        t_op = wrap(t_op);
        r_op = wrap(r_op);
      }

      if (t_op !== r_op && t_op !== related) {
        console.warn('core-dropdown-overlay: dropdown\'s offsetParent must be the relatedTarget or the relatedTarget\'s offsetParent!');
      }

      // Don't use CSS to handle halign/valign so we can use
      // dimensions.position to detect custom positioning

      var dims = this.dimensions;
      var margin = dims.margin;
      var inside = t_op === related;

      if (!dims.position.h) {
        if (this.halign === 'right') {
          target.style.right = ((inside ? 0 : t_op.offsetWidth - related.offsetLeft - related.offsetWidth) - margin.right) + 'px';
          dims.position.h = 'right';
        } else {
          target.style.left = ((inside ? 0 : related.offsetLeft) - margin.left) + 'px';
          dims.position.h = 'left';
        }
        dims.position.h_by = this.localName;
      }

      if (!dims.position.v) {
        if (this.valign === 'bottom') {
          target.style.bottom = ((inside ? 0 : t_op.offsetHeight - related.offsetTop - related.offsetHeight) - margin.bottom) + 'px';
          dims.position.v = 'bottom';
        } else {
          target.style.top = ((inside ? 0 : related.offsetTop) - margin.top) + 'px';
          dims.position.v = 'top';
        }
        dims.position.v_by = this.localName;
      }
    }

  });

})();

;

    Polymer('paper-dropdown-transition', {

      publish: {

        /**
         * The duration of the transition in ms. You can also set the duration by
         * setting a `duration` attribute on the target:
         *
         *    <paper-dropdown duration="1000"></paper-dropdown>
         *
         * @attribute duration
         * @type number
         * @default 500
         */
        duration: 500

      },

      setup: function(node) {
        this.super(arguments);

        var to = {
          'top': '0%',
          'left': '0%',
          'bottom': '100%',
          'right': '100%'
        };

        var bg = node.$.background;
        bg.style.webkitTransformOrigin = to[node.halign] + ' ' + to[node.valign];
        bg.style.transformOrigin = to[node.halign] + ' ' + to[node.valign];
      },

      transitionOpened: function(node, opened) {
        this.super(arguments);

        if (opened) {
          if (this.player) {
            this.player.cancel();
          }

          var duration = Number(node.getAttribute('duration')) || this.duration;

          var anims = [];

          var size = node.getBoundingClientRect();

          var ink = node.$.ripple;
          // var offset = 40 / Math.max(size.width, size.height);
          var offset = 0.2;
          anims.push(new Animation(ink, [{
            'opacity': 0.9,
            'transform': 'scale(0)',
          }, {
            'opacity': 0.9,
            'transform': 'scale(1)'
          }], {
            duration: duration * offset,
          }));

          // XXX: cancel() seems not to be working until chrome 41 so set the opacity for the
          // background here to prevent a flash.
          anims.push(new Animation(node.$.background, [{
            'opacity': 0,
            'transform': 'scale(0)'
          }, {
            'opacity': 0,
            'transform': 'scale(0)'
          }], {
            duration: 0,
            delay: 0,
            fill: 'forwards'
          }));

          var bg = node.$.background;
          var sx = 40 / size.width;
          var sy = 40 / size.height;
          anims.push(new Animation(bg, [{
            'opacity': 0.9,
            'transform': 'scale(' + sx + ',' + sy + ')',
          }, {
            'opacity': 1,
            'transform': 'scale(' + Math.max(sx, 0.95) + ',' + Math.max(sy, 0.5) + ')'
          }, {
            'opacity': 1,
            'transform': 'scale(1, 1)'
          }], {
            delay: duration * offset,
            duration: duration * (1 - offset),
            fill: 'forwards'
          }));

          var menu = node.querySelector('.menu');
          if (menu) {
            var items = menu.items || menu.children.array();
            var itemDelay = offset + (1 - offset) / 2;
            var itemDuration = duration * (1 - itemDelay) / items.length;
            var reverse = this.valign === 'bottom';

            items.forEach(function(item, i) {
              anims.push(new Animation(item, [{
                'opacity': 0
              }, {
                'opacity': 1
              }], {
                delay: duration * itemDelay + itemDuration * (reverse ? items.length - 1 - i : i),
                duration: itemDuration,
                fill: 'both'
              }));
            }.bind(this));

            anims.push(new Animation(node.$.scroller, [{
              'opacity': 1
            }, {
              'opacity': 1
            }], {
              delay: duration * itemDelay,
              duration: itemDuration * items.length,
              fill: 'both'
            }));

          } else {
            anims.push(new Animation(node.$.scroller, [{
              'opacity': 0
            }, {
              'opacity': 1
            }], {
              delay: duration * (offset + (1 - offset) / 2),
              duration: duration * 0.5,
              fill: 'both'
            }));
          }

          var group = new AnimationGroup(anims, {
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
          });
          this.player = document.timeline.play(group);
          this.player.onfinish = function() {
            this.fire('core-transitionend', this, node);
          }.bind(this);

        } else {
          this.fire('core-transitionend', this, node);
        }
      },

    });
  ;


  Polymer('paper-dropdown',{

    publish: {
      transition: 'paper-dropdown-transition'
    },

    ready: function() {
      this.super();
      this.sizingTarget = this.$.scroller;
    }

  });

;

    Polymer('paper-item',{

      publish: {

        /**
         * If true, the button will be styled with a shadow.
         *
         * @attribute raised
         * @type boolean
         * @default false
         */
        raised: false,

        /**
         * By default the ripple emanates from where the user touched the button.
         * Set this to true to always center the ripple.
         *
         * @attribute recenteringTouch
         * @type boolean
         * @default false
         */
        recenteringTouch: false,

        /**
         * By default the ripple expands to fill the button. Set this to false to
         * constrain the ripple to a circle within the button.
         *
         * @attribute fill
         * @type boolean
         * @default true
         */
        fill: true

      }

    });
  ;


  Polymer('core-dropdown-base',{

    publish: {

      /**
       * True if the menu is open.
       *
       * @attribute opened
       * @type boolean
       * @default false
       */
      opened: false

    },

    eventDelegates: {
      'tap': 'toggleOverlay'
    },

    overlayListeners: {
      'core-overlay-open': 'openAction'
    },

    get dropdown() {
      if (!this._dropdown) {
        this._dropdown = this.querySelector('.dropdown');
        for (var l in this.overlayListeners) {
          this.addElementListener(this._dropdown, l, this.overlayListeners[l]);
        }
      }
      return this._dropdown;
    },

    attached: function() {
      // find the dropdown on attach
      // FIXME: Support MO?
      this.dropdown;
    },

    addElementListener: function(node, event, methodName, capture) {
      var fn = this._makeBoundListener(methodName);
      if (node && fn) {
        Polymer.addEventListener(node, event, fn, capture);
      }
    },

    removeElementListener: function(node, event, methodName, capture) {
      var fn = this._makeBoundListener(methodName);
      if (node && fn) {
        Polymer.removeEventListener(node, event, fn, capture);
      }
    },

    _makeBoundListener: function(methodName) {
      var self = this, method = this[methodName];
      if (!method) {
        return;
      }
      var bound = '_bound' + methodName;
      if (!this[bound]) {
        this[bound] = function(e) {
          method.call(self, e);
        };
      }
      return this[bound];
    },

    openedChanged: function() {
      if (this.disabled) {
        return;
      }
      var dropdown = this.dropdown;
      if (dropdown) {
        dropdown.opened = this.opened;
      }
    },

    openAction: function(e) {
      this.opened = !!e.detail;
    },

    toggleOverlay: function(event) {
      if (!this.dropdown.contains(event.target) && !this.disabled) {
        this.opened = !this.opened;
      }
    }

  });

;


(function() {

  var p = {

    publish: {

      /**
       * A label for the control. The label is displayed if no item is selected.
       *
       * @attribute label
       * @type string
       * @default 'Select an item'
       */
      label: 'Select an item',

      /**
       * The icon to display when the drop-down is opened.
       *
       * @attribute openedIcon
       * @type string
       * @default 'arrow-drop-up'
       */
      openedIcon: 'arrow-drop-up',

      /**
       * The icon to display when the drop-down is closed.
       *
       * @attribute closedIcon
       * @type string
       * @default 'arrow-drop-down'
       */
      closedIcon: 'arrow-drop-down'

    },

    selectedItemLabel: '',

    overlayListeners: {
      'core-overlay-open': 'openAction',
      'core-activate': 'activateAction',
      'core-select': 'selectAction'
    },

    activateAction: function(e) {
      this.opened = false;
    },

    selectAction: function(e) {
      var detail = e.detail;
      if (detail.isSelected) {
        this.$.label.classList.add('selectedItem');
        this.selectedItemLabel = detail.item.label || detail.item.textContent;
      } else {
        this.$.label.classList.remove('selectedItem');
        this.selectedItemLabel = '';
      }
    }

  };

  Polymer.mixin2(p, Polymer.CoreFocusable);
  Polymer('paper-dropdown-menu',p);

})();

;


(function() {

  Polymer('core-toolbar', {
    
    /**
     * Controls how the items are aligned horizontally.
     * Options are `start`, `center`, `end`, `between` and `around`.
     *
     * @attribute justify
     * @type string
     * @default ''
     */
    justify: '',
    
    /**
     * Controls how the items are aligned horizontally when they are placed
     * in the middle.
     * Options are `start`, `center`, `end`, `between` and `around`.
     *
     * @attribute middleJustify
     * @type string
     * @default ''
     */
    middleJustify: '',
    
    /**
     * Controls how the items are aligned horizontally when they are placed
     * at the bottom.
     * Options are `start`, `center`, `end`, `between` and `around`.
     *
     * @attribute bottomJustify
     * @type string
     * @default ''
     */
    bottomJustify: '',
    
    justifyChanged: function(old) {
      this.updateBarJustify(this.$.topBar, this.justify, old);
    },
    
    middleJustifyChanged: function(old) {
      this.updateBarJustify(this.$.middleBar, this.middleJustify, old);
    },
    
    bottomJustifyChanged: function(old) {
      this.updateBarJustify(this.$.bottomBar, this.bottomJustify, old);
    },
    
    updateBarJustify: function(bar, justify, old) {
      if (old) {
        bar.removeAttribute(this.toLayoutAttrName(old));
      }
      if (justify) {
        bar.setAttribute(this.toLayoutAttrName(justify), '');
      }
    },
    
    toLayoutAttrName: function(value) {
      return value === 'between' ? 'justified' : value + '-justified';
    }
    
  });

})();

;

    Polymer('core-media-query', {

      /**
       * The Boolean return value of the media query
       *
       * @attribute queryMatches
       * @type Boolean
       * @default false
       */
      queryMatches: false,

      /**
       * The CSS media query to evaulate
       *
       * @attribute query
       * @type string
       * @default ''
       */
      query: '',
      ready: function() {
        this._mqHandler = this.queryHandler.bind(this);
        this._mq = null;
      },
      queryChanged: function() {
        if (this._mq) {
          this._mq.removeListener(this._mqHandler);
        }
        var query = this.query;
        if (query[0] !== '(') {
          query = '(' + this.query + ')';
        }
        this._mq = window.matchMedia(query);
        this._mq.addListener(this._mqHandler);
        this.queryHandler(this._mq);
      },
      queryHandler: function(mq) {
        this.queryMatches = mq.matches;
        this.asyncFire('core-media-change', mq);
      }
    });
  ;


  (function() {
  
    var currentToast;
  
    Polymer('paper-toast', {
  
      /**
       * The text shows in a toast.
       *
       * @attribute text
       * @type string
       * @default ''
       */
      text: '',
      
      /**
       * The duration in milliseconds to show the toast.
       *
       * @attribute duration
       * @type number
       * @default 3000
       */
      duration: 3000,
      
      /**
       * Set opened to true to show the toast and to false to hide it.
       *
       * @attribute opened
       * @type boolean
       * @default false
       */
      opened: false,
      
      /**
       * Min-width when the toast changes to narrow layout.  In narrow layout,
       * the toast fits at the bottom of the screen when opened.
       *
       * @attribute responsiveWidth
       * @type string
       * @default '480px'
       */
      responsiveWidth: '480px',
      
      /**
       * If true, the toast can't be swiped.
       *
       * @attribute swipeDisabled
       * @type boolean
       * @default false
       */
      swipeDisabled: false,
      
      /**
       * By default, the toast will close automatically if the user taps
       * outside it or presses the escape key. Disable this behavior by setting
       * the `autoCloseDisabled` property to true.
       *
       * @attribute autoCloseDisabled
       * @type boolean
       * @default false
       */
      autoCloseDisabled: false,
      
      narrowMode: false,
      
      eventDelegates: {
        trackstart: 'trackStart',
        track: 'track',
        trackend: 'trackEnd',
        transitionend: 'transitionEnd'
      },
      
      narrowModeChanged: function() {
        this.classList.toggle('fit-bottom', this.narrowMode);
        if (this.opened) {
          this.$.overlay.resizeHandler();
        }
      },
      
      openedChanged: function() {
        if (this.opened) {
          this.dismissJob = this.job(this.dismissJob, this.dismiss, this.duration);
        } else {
          this.dismissJob && this.dismissJob.stop();
          this.dismiss();
        }
      },
      
      /** 
       * Toggle the opened state of the toast.
       * @method toggle
       */
      toggle: function() {
        this.opened = !this.opened;
      },
      
      /** 
       * Show the toast for the specified duration
       * @method show
       */
      show: function() {
        if (currentToast) {
          currentToast.dismiss();
        }
        currentToast = this;
        this.opened = true;
      },
      
      /** 
       * Dismiss the toast and hide it.
       * @method dismiss
       */
      dismiss: function() {
        if (this.dragging) {
          this.shouldDismiss = true;
        } else {
          this.opened = false;
          if (currentToast === this) {
            currentToast = null;
          }
        }
      },
      
      trackStart: function(e) {
        if (!this.swipeDisabled) {
          e.preventTap();
          this.vertical = e.yDirection;
          this.w = this.offsetWidth;
          this.h = this.offsetHeight;
          this.dragging = true;
          this.classList.add('dragging');
        }
      },
      
      track: function(e) {
        if (this.dragging) {
          var s = this.style;
          if (this.vertical) {
            var y = e.dy;
            s.opacity = (this.h - Math.abs(y)) / this.h;
            s.transform = s.webkitTransform = 'translate3d(0, ' + y + 'px, 0)';
          } else {
            var x = e.dx;
            s.opacity = (this.w - Math.abs(x)) / this.w;
            s.transform = s.webkitTransform = 'translate3d(' + x + 'px, 0, 0)';
          }
        }
      },
      
      trackEnd: function(e) {
        if (this.dragging) {
          this.classList.remove('dragging');
          this.style.opacity = '';
          this.style.transform = this.style.webkitTransform = '';
          var cl = this.classList;
          if (this.vertical) {
            cl.toggle('fade-out-down', e.yDirection === 1 && e.dy > 0);
            cl.toggle('fade-out-up', e.yDirection === -1 && e.dy < 0);
          } else {
            cl.toggle('fade-out-right', e.xDirection === 1 && e.dx > 0);
            cl.toggle('fade-out-left', e.xDirection === -1 && e.dx < 0);
          }
          this.dragging = false;
        }
      },
      
      transitionEnd: function() {
        var cl = this.classList;
        if (cl.contains('fade-out-right') || cl.contains('fade-out-left') || 
            cl.contains('fade-out-down') || cl.contains('fade-out-up')) {
          this.dismiss();
          cl.remove('fade-out-right', 'fade-out-left', 
              'fade-out-down', 'fade-out-up');
        } else if (this.shouldDismiss) {
          this.dismiss();
        }
        this.shouldDismiss = false;
      }
  
    });
    
  })();

;

(function() {

  var proto = {

      /**
       * A simple string label for the tooltip to display. To display a rich
       * HTML tooltip instead, omit `label` and include the `tip` attribute
       * on a child node of `core-tooltip`.
       *
       * @attribute label
       * @type string
       * @default null
       */
      label: null,

      eventDelegates: {
        'core-resize': 'positionChanged'
      },

      computed: {
        // Indicates whether the tooltip has a set label propety or
        // an element with the `tip` attribute.
        hasTooltipContent: 'label || !!tipElement'
      },

      publish: {
        /**
         * Forces the tooltip to display. If `disabled` is set, this property is ignored.
         *
         * @attribute show
         * @type boolean
         * @default false
         */
        show: {value: false, reflect: true},

        /**
         * Positions the tooltip to the top, right, bottom, left of its content.
         *
         * @attribute position
         * @type string
         * @default 'bottom'
         */
        position: {value: 'bottom', reflect: true},

        /**
         * If true, the tooltip an arrow pointing towards the content.
         *
         * @attribute noarrow
         * @type boolean
         * @default false
         */
        noarrow: {value: false, reflect: true}
      },

      /**
       * Customizes the attribute used to specify which content
       * is the rich HTML tooltip.
       *
       * @attribute tipAttribute
       * @type string
       * @default 'tip'
       */
      tipAttribute: 'tip',

      attached: function() {
        this.updatedChildren();
        this.resizableAttachedHandler();
      },

      detached: function() {
        this.resizableDetachedHandler();
      },

      updatedChildren: function () {
        this.tipElement = null;

        for (var i = 0, el; el = this.$.c.getDistributedNodes()[i]; ++i) {
          if (el.hasAttribute && el.hasAttribute(this.tipAttribute)) {
            this.tipElement = el;
            break;
          }
        }

        // Job ensures we're not double calling setPosition() on DOM attach.
        this.job('positionJob', this.setPosition);

        // Monitor children to re-position tooltip when light dom changes.
        this.onMutation(this, this.updatedChildren);
      },

      labelChanged: function(oldVal, newVal) {
        this.job('positionJob', this.setPosition);
      },

      positionChanged: function(oldVal, newVal) {
        this.job('positionJob', this.setPosition);
      },

      setPosition: function() {
        var controlWidth = this.clientWidth;
        var controlHeight = this.clientHeight;
        var toolTipWidth = this.$.tooltip.clientWidth;
        var toolTipHeight = this.$.tooltip.clientHeight;

        switch (this.position) {
          case 'top':
          case 'bottom':
            this.$.tooltip.style.left = (controlWidth - toolTipWidth) / 2 + 'px';
            this.$.tooltip.style.top = null;
            break;
          case 'left':
          case 'right':
            this.$.tooltip.style.left = null;
            this.$.tooltip.style.top = (controlHeight - toolTipHeight) / 2 + 'px';
            break;
        }
      }

    };

    Polymer.mixin2(proto, Polymer.CoreFocusable);
    Polymer.mixin(proto, Polymer.CoreResizable);
    Polymer('core-tooltip',proto);
  })();

;

    Polymer('paper-icon-button',{

      publish: {

        /**
         * The URL of an image for the icon. If the src property is specified,
         * the icon property should not be.
         *
         * @attribute src
         * @type string
         * @default ''
         */
        src: '',

        /**
         * Specifies the icon name or index in the set of icons available in
         * the icon's icon set. If the icon property is specified,
         * the src property should not be.
         *
         * @attribute icon
         * @type string
         * @default ''
         */
        icon: '',

        recenteringTouch: true,
        fill: false

      },

      iconChanged: function(oldIcon) {
        var label = this.getAttribute('aria-label');
        if (!label || label === oldIcon) {
          this.setAttribute('aria-label', this.icon);
        }
      }

    });

  ;


  Polymer('paper-tab', {
    
    /**
     * If true, ink ripple effect is disabled.
     *
     * @attribute noink
     * @type boolean
     * @default false
     */
    noink: false,
    
    eventDelegates: {
      down: 'downAction',
      up: 'upAction'
    },

    downAction: function(e) {
      if (this.noink || (this.parentElement && this.parentElement.noink)) {
        return;
      }
      this.$.ink.downAction(e);
    },

    upAction: function() {
      this.$.ink.upAction();
    },
    
    cancelRipple: function() {
      this.$.ink.upAction();
    }
    
  });
  
;


  Polymer('paper-tabs',Polymer.mixin({
    
    /**
     * If true, ink ripple effect is disabled.
     *
     * @attribute noink
     * @type boolean
     * @default false
     */
    noink: false,
    
    /**
     * If true, the bottom bar to indicate the selected tab will not be shown.
     *
     * @attribute nobar
     * @type boolean
     * @default false
     */
    nobar: false,
    
    /**
     * If true, the slide effect for the bottom bar is disabled.
     *
     * @attribute noslide
     * @type boolean
     * @default false
     */
    noslide: false,
    
    /**
     * If true, tabs are scrollable and the tab width is based on the label width.
     *
     * @attribute scrollable
     * @type boolean
     * @default false
     */
    scrollable: false,
    
    /**
     * If true, dragging on the tabs to scroll is disabled.
     *
     * @attribute disableDrag
     * @type boolean
     * @default false
     */
    disableDrag: false,
    
    /**
     * If true, scroll buttons (left/right arrow) will be hidden for scrollable tabs.
     *
     * @attribute hideScrollButton
     * @type boolean
     * @default false
     */
    hideScrollButton: false,
    
    /**
     * If true, the tabs are aligned to bottom (the selection bar appears at the top).
     *
     @attribute alignBottom
     @type boolean
     @default false
     */
    alignBottom: false,

    eventDelegates: {
      'core-resize': 'resizeHandler'
    },
    
    activateEvent: 'tap',
    
    step: 10,
    
    holdDelay: 10,
    
    ready: function() {
      this.super();
      this._trackxHandler = this.trackx.bind(this);
      Polymer.addEventListener(this.$.tabsContainer, 'trackx', this._trackxHandler);
      this._tabsObserver = new MutationObserver(this.updateBar.bind(this));
    },
    
    domReady: function() {
      this.async('resizeHandler');
      this._tabsObserver.observe(this, {childList: true, subtree: true, characterData: true});
    },

    attached: function() {
      this.resizableAttachedHandler();
    },
    
    detached: function() {
      Polymer.removeEventListener(this.$.tabsContainer, 'trackx', this._trackxHandler);
      this._tabsObserver.disconnect();
      this.resizableDetachedHandler();
    },
    
    trackStart: function(e) {
      if (!this.scrollable || this.disableDrag) {
        return;
      }
      var t = e.target;
      if (t && t.cancelRipple) {
        t.cancelRipple();
      }
      this._startx = this.$.tabsContainer.scrollLeft;
      e.preventTap();
    },
    
    trackx: function(e) {
      if (!this.scrollable || this.disableDrag) {
        return;
      }
      this.$.tabsContainer.scrollLeft = this._startx - e.dx;
    },
    
    resizeHandler: function() {
      this.scroll();
      this.updateBar();
    },
    
    scroll: function() {
      if (!this.scrollable) {
        return;
      }
      var tc = this.$.tabsContainer;
      var l = tc.scrollLeft;
      this.leftHidden = l === 0;
      this.rightHidden = l === Math.max(0, (tc.scrollWidth - tc.clientWidth));
    },
    
    holdLeft: function() {
      this.holdJob = setInterval(this.scrollToLeft.bind(this), this.holdDelay);
    },
    
    holdRight: function() {
      this.holdJob = setInterval(this.scrollToRight.bind(this), this.holdDelay);
    },
    
    releaseHold: function() {
      clearInterval(this.holdJob);
      this.holdJob = null;
    },
    
    scrollToLeft: function() {
      this.$.tabsContainer.scrollLeft -= this.step;
    },
    
    scrollToRight: function() {
      this.$.tabsContainer.scrollLeft += this.step;
    },
    
    /**
     * Invoke this to update the size and position of the bottom bar.  Usually
     * you only need to call this if the `paper-tabs` is initially hidden and
     * later becomes visible.
     *
     * @method updateBar
     */
    updateBar: function() {
      this.async('selectedItemChanged');
    },
    
    selectedItemChanged: function(old) {
      var oldIndex = this.selectedIndex;
      this.super(arguments);
      var s = this.$.selectionBar.style;
      
      if (!this.selectedItem) {
        s.width = 0;
        s.left = 0;
        return;
      } 
      
      var r = this.$.tabsContent.getBoundingClientRect();
      this._w = r.width;
      this._l = r.left;
      
      r = this.selectedItem.getBoundingClientRect();
      this._sw = r.width;
      this._sl = r.left;
      this._sOffsetLeft = this._sl - this._l; 
      
      if (this.noslide || old == null) {
        this.positionBarForSelected();
        return;
      }
      
      var oldRect = old.getBoundingClientRect();
      
      var m = 5;
      this.$.selectionBar.classList.add('expand');
      if (oldIndex < this.selectedIndex) {
        s.width = this.calcPercent(this._sl + this._sw - oldRect.left) - m + '%';
        this._transitionCounter = 1;
      } else {
        s.width = this.calcPercent(oldRect.left + oldRect.width - this._sl) - m + '%';
        s.left = this.calcPercent(this._sOffsetLeft) + m + '%';
        this._transitionCounter = 2;
      }
      if (this.scrollable) {
        this.scrollToSelectedIfNeeded();
      }
    },
    
    scrollToSelectedIfNeeded: function() {
      var scrollLeft = this.$.tabsContainer.scrollLeft;
      // scroll to selected if needed
      if (this._sOffsetLeft + this._sw < scrollLeft || 
          this._sOffsetLeft - scrollLeft > this.$.tabsContainer.offsetWidth) {
        this.$.tabsContainer.scrollLeft = this._sOffsetLeft;
      }
    },
    
    positionBarForSelected: function() {
      var s = this.$.selectionBar.style;
      s.width = this.calcPercent(this._sw) + '%';
      s.left = this.calcPercent(this._sOffsetLeft) + '%';
    },
    
    calcPercent: function(w) {
      return 100 * w / this._w;
    },
    
    barTransitionEnd: function(e) {
      this._transitionCounter--;
      var cl = this.$.selectionBar.classList;
      if (cl.contains('expand') && !this._transitionCounter) {
        cl.remove('expand');
        cl.add('contract');
        this.positionBarForSelected();
      } else if (cl.contains('contract')) {
        cl.remove('contract');
      }
    }
    
  }, Polymer.CoreResizable));
  
;


(function () {

// create some basic transition styling data.
var transitions = CoreStyle.g.transitions = CoreStyle.g.transitions || {};
transitions.duration = '500ms';
transitions.heroDelay = '50ms';
transitions.scaleDelay = '500ms';
transitions.cascadeFadeDuration = '250ms';

Polymer('core-transition-pages',{

  publish: {
    /**
     * This class will be applied to the scope element in the `prepare` function.
     * It is removed in the `complete` function. Used to activate a set of CSS
     * rules that need to apply before the transition runs, e.g. a default opacity
     * or transform for the non-active pages.
     *
     * @attribute scopeClass
     * @type string
     * @default ''
     */
    scopeClass: '',

    /**
     * This class will be applied to the scope element in the `go` function. It is
     * remoived in the `complete' function. Generally used to apply a CSS transition
     * rule only during the transition.
     *
     * @attribute activeClass
     * @type string
     * @default ''
     */
    activeClass: '',

    /**
     * Specifies which CSS property to look for when it receives a `transitionEnd` event
     * to determine whether the transition is complete. If not specified, the first
     * transitionEnd event received will complete the transition.
     *
     * @attribute transitionProperty
     * @type string
     * @default ''
     */
    transitionProperty: ''
  },

  /**
   * True if this transition is complete.
   *
   * @attribute completed
   * @type boolean
   * @default false
   */
  completed: false,

  prepare: function(scope, options) {
    this.boundCompleteFn = this.complete.bind(this, scope);
    if (this.scopeClass) {
      scope.classList.add(this.scopeClass);
    }
  },

  go: function(scope, options) {
    this.completed = false;
    if (this.activeClass) {
      scope.classList.add(this.activeClass);
    }
    scope.addEventListener('transitionend', this.boundCompleteFn, false);
  },

  setup: function(scope) {
    if (!scope._pageTransitionStyles) {
      scope._pageTransitionStyles = {};
    }

    var name = this.calcStyleName();
    
    if (!scope._pageTransitionStyles[name]) {
      this.installStyleInScope(scope, name);
      scope._pageTransitionStyles[name] = true;
    }
  },

  calcStyleName: function() {
    return this.id || this.localName;
  },

  installStyleInScope: function(scope, id) {
    if (!scope.shadowRoot) {
      scope.createShadowRoot().innerHTML = '<content></content>';
    }
    var root = scope.shadowRoot;
    var scopeStyle = document.createElement('core-style');
    root.insertBefore(scopeStyle, root.firstChild);
    scopeStyle.applyRef(id);
  },

  complete: function(scope, e) {
    // TODO(yvonne): hack, need to manage completion better
    if (e.propertyName !== 'box-shadow' && (!this.transitionProperty || e.propertyName.indexOf(this.transitionProperty) !== -1)) {
      this.completed = true;
      this.fire('core-transitionend', this, scope);
    }
  },

  // TODO(sorvell): ideally we do this in complete.
  ensureComplete: function(scope) {
    scope.removeEventListener('transitionend', this.boundCompleteFn, false);
    if (this.scopeClass) {
      scope.classList.remove(this.scopeClass);
    }
    if (this.activeClass) {
      scope.classList.remove(this.activeClass);
    }
  }

});

})();

;

(function() {

  var webkitStyles = '-webkit-transition' in document.documentElement.style
  var TRANSITION_CSSNAME = webkitStyles ? '-webkit-transition' : 'transition';
  var TRANSFORM_CSSNAME = webkitStyles ? '-webkit-transform' : 'transform';
  var TRANSITION_NAME = webkitStyles ? 'webkitTransition' : 'transition';
  var TRANSFORM_NAME = webkitStyles ? 'webkitTransform' : 'transform';

  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;

  Polymer('hero-transition',{

    go: function(scope, options) {
      var props = [
        'border-radius',
        'width',
        'height',
        TRANSFORM_CSSNAME
      ];

      var duration = options && options.duration || 
          (CoreStyle.g.transitions.heroDuration || 
          CoreStyle.g.transitions.duration);

      scope._heroes.forEach(function(h) {
        var d = h.h0.hasAttribute('hero-delayed') ? CoreStyle.g.transitions.heroDelay : '';
        var wt = [];
        props.forEach(function(p) {
          wt.push(p + ' ' + duration + ' ' + options.easing + ' ' + d);
        });

        h.h1.style[TRANSITION_NAME] = wt.join(', ');
        h.h1.style.borderRadius = h.r1;
        h.h1.style[TRANSFORM_NAME] = '';
      });

      this.super(arguments);

      if (!scope._heroes.length) {
        this.completed = true;
      }
    },

    prepare: function(scope, options) {
      this.super(arguments);
      var src = options.src, dst = options.dst;

      if (scope._heroes && scope._heroes.length) {
        this.ensureComplete(scope);
      } else {
        scope._heroes = [];
      }

      // FIXME(yvonne): basic support for nested pages.
      // Look for heroes in the light DOM and one level of shadow DOM of the src and dst,
      // and also in src.selectedItem or dst.selectedItem, then transform the dst hero to src
      var ss = '[hero]';
      var h$ = this.findAllInShadows(src, ss);
      if (src.selectedItem) {
        hs$ = this.findAllInShadows(src.selectedItem, ss);
        hsa$ = [];
        // De-duplicate items
        Array.prototype.forEach.call(hs$, function(hs) {
          if (h$.indexOf(hs) === -1) {
            hsa$.push(hs);
          }
        })
        h$ = h$.concat(hsa$);
      }

      for (var i=0, h0; h0=h$[i]; i++) {
        var v = h0.getAttribute('hero-id');
        var ds = '[hero][hero-id="' + v + '"]';
        var h1 = this.findInShadows(dst, ds);

        if (!h1 && dst.selectedItem) {
          h1 = this.findInShadows(dst.selectedItem, ds);
        }

        // console.log('src', src);
        // console.log('dst', dst, dst.selectedItem);
        // console.log(v, h0, h1);
        if (v && h1) {
          var c0 = getComputedStyle(h0);
          var c1 = getComputedStyle(h1);
          var h = {
            h0: h0,
            b0: h0.getBoundingClientRect(),
            r0: c0.borderRadius,
            h1: h1,
            b1: h1.getBoundingClientRect(),
            r1: c1.borderRadius
          };

          var dl = h.b0.left - h.b1.left;
          var dt = h.b0.top - h.b1.top;
          var sw = h.b0.width / h.b1.width;
          var sh = h.b0.height / h.b1.height;

          // h.scaley = h.h0.hasAttribute('scaley');
          // if (!h.scaley && (sw !== 1 || sh !== 1)) {
          //   sw = sh = 1;
          //   h.h1.style.width = h.b0.width + 'px';
          //   h.h1.style.height = h.b0.height + 'px';
          // }

          // Also animate the border-radius for the circle-to-square transition
          if (h.r0 !== h.r1) {
            h.h1.style.borderRadius = h.r0;
          }

          // console.log(h);

          h.h1.style[TRANSFORM_NAME] = 'translate(' + dl + 'px,' + dt + 'px)' + ' scale(' + sw + ',' + sh + ')';
          h.h1.style[TRANSFORM_NAME + 'Origin'] = '0 0';

          scope._heroes.push(h);
        }
      }

    },

    // carefully look into ::shadow with polyfill specific hack
    findInShadows: function(node, selector) {
      return node.querySelector(selector) || (hasShadowDOMPolyfill ? 
          queryAllShadows(node, selector) :
          node.querySelector('::shadow ' + selector));
    },

    findAllInShadows: function(node, selector) {
      if (hasShadowDOMPolyfill) {
        var nodes = node.querySelectorAll(selector).array();
        var shadowNodes = queryAllShadows(node, selector, true);
        return nodes.concat(shadowNodes);
      } else {
        return node.querySelectorAll(selector).array().concat(node.shadowRoot ? node.shadowRoot.querySelectorAll(selector).array() : []);
      }
    },

    ensureComplete: function(scope) {
      this.super(arguments);
      if (scope._heroes) {
        scope._heroes.forEach(function(h) {
          h.h1.style[TRANSITION_NAME] = '';
          h.h1.style[TRANSFORM_NAME] = '';
        });
        scope._heroes = [];
      }
    },

    complete: function(scope, e) {
      // if (e.propertyName === TRANSFORM_CSSNAME) {
        var done = false;
        scope._heroes.forEach(function(h) {
          if (h.h1 === e.path[0]) {
            done = true;
          }
        });

        if (done) {
          this.super(arguments);
        }
      // }
    }

  });

  
  // utility method for searching through shadowRoots.
  function queryShadow(node, selector) {
    var m, el = node.firstElementChild;
    var shadows, sr, i;
    shadows = [];
    sr = node.shadowRoot;
    while(sr) {
      shadows.push(sr);
      sr = sr.olderShadowRoot;
    }
    for(i = shadows.length - 1; i >= 0; i--) {
      m = shadows[i].querySelector(selector);
      if (m) {
        return m;
      }
    }
    while(el) {
      m = queryShadow(el, selector);
      if (m) {
        return m;
      }
      el = el.nextElementSibling;
    }
    return null;
  }

  function _queryAllShadows(node, selector, results) {
    var el = node.firstElementChild;
    var temp, sr, shadows, i, j;
    shadows = [];
    sr = node.shadowRoot;
    while(sr) {
      shadows.push(sr);
      sr = sr.olderShadowRoot;
    }
    for (i = shadows.length - 1; i >= 0; i--) {
      temp = shadows[i].querySelectorAll(selector);
      for(j = 0; j < temp.length; j++) {
        results.push(temp[j]);
      }
    }
    while (el) {
      _queryAllShadows(el, selector, results);
      el = el.nextElementSibling;
    }
    return results;
  }

  queryAllShadows = function(node, selector, all) {
    if (all) {
      return _queryAllShadows(node, selector, []);
    } else {
      return queryShadow(node, selector);
    }
  };

})();
;


  Polymer('core-animated-pages',Polymer.mixin({

    eventDelegates: {
      'core-transitionend': 'transitionEnd'
    },

    /**
     * A space-delimited string of transitions to use when switching between pages in this element.
     * The strings are `id`s of `core-transition-pages` elements included elsewhere. See the
     * individual transition's document for specific details.
     *
     * @attribute transitions
     * @type string
     * @default ''
     */
    transitions: '',

    selected: 0,

    /**
     * The last page selected. This property is useful to dynamically set transitions based
     * on incoming and outgoing pages.
     *
     * @attribute lastSelected
     * @type Object
     * @default null
     */
    lastSelected: null,

    registerCallback: function() {
      this.tmeta = document.createElement('core-transition');
    },

    created: function() {
      this._transitions = [];
      this.transitioning = [];
    },

    attached: function() {
      this.resizerAttachedHandler();
    },

    detached: function() {
      this.resizerDetachedHandler();
    },

    transitionsChanged: function() {
      this._transitions = this.transitions.split(' ');
    },

    _transitionsChanged: function(old) {
      if (this._transitionElements) {
        this._transitionElements.forEach(function(t) {
          t.teardown(this);
        }, this);
      }
      this._transitionElements = [];
      this._transitions.forEach(function(transitionId) {
        var t = this.getTransition(transitionId);
        if (t) {
          this._transitionElements.push(t);
          t.setup(this);
        }
      }, this);
    },

    getTransition: function(transitionId) {
      return this.tmeta.byId(transitionId);
    },

    selectionSelect: function(e, detail) {
      this.updateSelectedItem();
      // Wait to call applySelection when we run the transition
    },

    applyTransition: function(src, dst) {
      if (this.animating) {
        this.cancelAsync(this.animating);
        this.animating = null;
      }

      Polymer.flush();

      if (this.transitioning.indexOf(src) === -1) {
        this.transitioning.push(src);
      }
      if (this.transitioning.indexOf(dst) === -1) {
        this.transitioning.push(dst);
      }
      // force src, dst to display 
      src.setAttribute('animate', '');
      dst.setAttribute('animate', '');
      //
      var options = {
        src: src,
        dst: dst,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      };

      // fire an event so clients have a chance to do something when the
      // new page becomes visible but before it draws.
      this.fire('core-animated-pages-transition-prepare');

      //
      // prepare transition
      this._transitionElements.forEach(function(transition) {
        transition.prepare(this, options);
      }, this);
      //
      // force layout!
      src.offsetTop;

      //
      // apply selection
      this.applySelection(dst, true);
      this.applySelection(src, false);
      //
      // start transition
      this._transitionElements.forEach(function(transition) {
        transition.go(this, options);
      }, this);

      if (!this._transitionElements.length) {
        this.complete();
      } else {
        this.animating = this.async(this.complete.bind(this), null, 5000);
      }
    },

    complete: function() {
      if (this.animating) {
        this.cancelAsync(this.animating);
        this.animating = null;
      }

      this.transitioning.forEach(function(t) {
        t.removeAttribute('animate');
      });
      this.transitioning = [];

      this._transitionElements.forEach(function(transition) {
        transition.ensureComplete(this);
      }, this);

      this.fire('core-animated-pages-transition-end');
    },
    
    transitionEnd: function(e) {
      if (this.transitioning.length) {
        var completed = true;
        this._transitionElements.forEach(function(transition) {
          if (!transition.completed) {
            completed = false;
          }
        });
        if (completed) {
          this.job('transitionWatch', function() {
            this.complete();
          }, 100);
        }
      }
    },

    selectedChanged: function(old) {
      this.lastSelected = old;
      this.super(arguments);
    },

    selectedItemChanged: function(oldItem) {
      this.super(arguments);

      if (!oldItem) {
        this.applySelection(this.selectedItem, true);
        this.async(this.notifyResize);
        return;
      }

      if (this.hasAttribute('no-transition') || !this._transitionElements || !this._transitionElements.length) {
        this.applySelection(oldItem, false);
        this.applySelection(this.selectedItem, true);
        this.notifyResize();
        return;
      }

      if (oldItem && this.selectedItem) {
        // TODO(sorvell): allow bindings to update first?
        var self = this;
        Polymer.flush();
        Polymer.endOfMicrotask(function() {
          self.applyTransition(oldItem, self.selectedItem);
          self.notifyResize();
        });
      }
    },

    resizerShouldNotify: function(el) {
      // Only notify descendents of selected item
      while (el && (el != this)) {
        if (el == this.selectedItem) {
          return true;
        }
        el = el.parentElement || (el.parentNode && el.parentNode.host);
      }
    }

  }, Polymer.CoreResizer));

;

    Polymer('paper-spinner',{
      eventDelegates: {
        'animationend': 'reset',
        'webkitAnimationEnd': 'reset'
      },
      publish: {
        /**
         * Displays the spinner.
         *
         * @attribute active
         * @type boolean
         * @default false
         */
        active: {value: false, reflect: true},

        /**
         * Alternative text content for accessibility support.
         * If alt is present, it will add an aria-label whose content matches alt when active.
         * If alt is not present, it will default to 'loading' as the alt value.
         * @attribute alt
         * @type string
         * @default 'loading'
         */
        alt: {value: 'loading', reflect: true}
      },

      ready: function() {
        // Allow user-provided `aria-label` take preference to any other text alternative.
        if (this.hasAttribute('aria-label')) {
          this.alt = this.getAttribute('aria-label');
        } else {
          this.setAttribute('aria-label', this.alt);
        }
        if (!this.active) {
          this.setAttribute('aria-hidden', 'true');
        }
      },

      activeChanged: function() {
        if (this.active) {
          this.$.spinnerContainer.classList.remove('cooldown');
          this.$.spinnerContainer.classList.add('active');
          this.removeAttribute('aria-hidden');
        } else {
          this.$.spinnerContainer.classList.add('cooldown');
          this.setAttribute('aria-hidden', 'true');
        }
      },

      altChanged: function() {
        if (this.alt === '') {
          this.setAttribute('aria-hidden', 'true');
        } else {
          this.removeAttribute('aria-hidden');
        }
        this.setAttribute('aria-label', this.alt);
      },

      reset: function() {
        this.$.spinnerContainer.classList.remove('active', 'cooldown');
      }
    });
  ;


  Polymer('core-range', {
    
    /**
     * The number that represents the current value.
     *
     * @attribute value
     * @type number
     * @default 0
     */
    value: 0,
    
    /**
     * The number that indicates the minimum value of the range.
     *
     * @attribute min
     * @type number
     * @default 0
     */
    min: 0,
    
    /**
     * The number that indicates the maximum value of the range.
     *
     * @attribute max
     * @type number
     * @default 100
     */
    max: 100,
    
    /**
     * Specifies the value granularity of the range's value.
     *
     * @attribute step
     * @type number
     * @default 1
     */
    step: 1,
    
    /**
     * Returns the ratio of the value.
     *
     * @attribute ratio
     * @type number
     * @default 0
     */
    ratio: 0,
    
    observe: {
      'value min max step': 'update'
    },
    
    calcRatio: function(value) {
      return (this.clampValue(value) - this.min) / (this.max - this.min);
    },
    
    clampValue: function(value) {
      return Math.min(this.max, Math.max(this.min, this.calcStep(value)));
    },
    
    calcStep: function(value) {
      return this.step ? (Math.round(value / this.step) / (1 / this.step)) : value;
    },
    
    validateValue: function() {
      var v = this.clampValue(this.value);
      this.value = this.oldValue = isNaN(v) ? this.oldValue : v;
      return this.value !== v;
    },
    
    update: function() {
      this.validateValue();
      this.ratio = this.calcRatio(this.value) * 100;
    }
    
  });
  
;

  
    Polymer('paper-progress', {
      
      /**
       * The number that represents the current secondary progress.
       *
       * @attribute secondaryProgress
       * @type number
       * @default 0
       */
      secondaryProgress: 0,
      
      /**
       * Use an indeterminate progress indicator.
       *
       * @attribute indeterminate
       * @type boolean
       * @default false
       */
      indeterminate: false,

      step: 0,
      
      observe: {
        'value secondaryProgress min max indeterminate': 'update'
      },
      
      update: function() {
        this.super();
        this.secondaryProgress = this.clampValue(this.secondaryProgress);
        this.secondaryRatio = this.calcRatio(this.secondaryProgress) * 100;

        // If we use attribute/class binding, the animation sometimes doesn't translate properly
        // on Safari 7.1. So instead, we toggle the class here in the update method.
        this.$.activeProgress.classList.toggle('indeterminate', this.indeterminate);
      },

      transformProgress: function(progress, ratio) {
        var transform = 'scaleX(' + (ratio / 100) + ')';
        progress.style.transform = progress.style.webkitTransform = transform;
      },

      ratioChanged: function() {
        this.transformProgress(this.$.activeProgress, this.ratio);
      },

      secondaryRatioChanged: function() {
        this.transformProgress(this.$.secondaryProgress, this.secondaryRatio);
      }
      
    });
    
  ;

        Polymer('item-column',{
            _delete: function(e) {
                this.fire("column-delete", e.target.templateInstance.model.column);
            },
            settings: function(e) {
                this.fire("column-settings", e.target.templateInstance.model.column);
            },
            refresh: function(e) {
                this.fire("column-refresh", e.target.templateInstance.model.column);
            },
            sync: function() {
                tabbie.syncAll()
            },
            columnChanged: function(old, column) {
                var self = this;
                setTimeout(function() {
                    var rgb = column.color,
                            yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000,
                            dark = yiq < 200;

                    if (!dark)
                        self.shadowRoot.querySelector("core-toolbar").classList.add("light")
                }, 100)
            }
        });
    ;

        Polymer('item-card',{
            title: 'Title placeholder',
            description: 'Description placeholder'
        });
    ;

        var dialog;
        Polymer('tabbie-dialog',{
            heading: "Column settings",
            transition: "core-transition-center",
            backdrop: true
        });
    ;


  Polymer('paper-action-dialog',{

    publish: {

      /**
       * @attribute closeSelector
       * @type string
       * @default '[affirmative],[dismissive]'
       */
      closeSelector: '[affirmative],[dismissive]'
    }

  });

;

        Polymer('column-chooser',{
            attemptDelete: function(e) {
                this.columnToBeDeleted = e.target.templateInstance.model.column;
                this.shadowRoot.querySelector("#confirm").toggle()
            },
            deleteColumn: function() {
                this.fire("delete-column", this.columnToBeDeleted)
            },
            columnsChanged: function(changes) {
                console.log('columnsChanged', changes)
                var self = this;
                if(this.packery) {
                    this.async(function() {
                        self.packery.reloadItems();
                        self.packery._resetLayout();
                        self.packery.layoutItems(self.packery.items, true);
                    })
                }
            },
            shown: function() {
                var self = this;
                if(!this.packery) this.packery = new Packery(this.shadowRoot.querySelector(".grid"), {
                    itemSelector: ".column"
                })
                this.packery.layout()
                this.packery.on("removeComplete", function() {
                    self.packery.layout()
                })
            },
            packery: undefined,
            columns: []
        });
    ;

        Polymer('fab-anim',{
            play: function() {
                var animHeight = document.body.clientWidth;
                if(document.body.clientWidth < document.body.clientHeight) animHeight = document.body.clientHeight;
                this.scale = Math.round((animHeight / 56) * 3);
                console.log("fabanim scale", this.scale)
                this.classList.add("active")
            }
        })
    ;

        Polymer('fullscreen-dialog',{
            addButton: function(icon, callback) {
                var toolbar = this.shadowRoot.querySelector(".card-bar")
                var button = document.createElement("paper-icon-button");
                button.icon = icon;
                toolbar.appendChild(button)
                button.addEventListener("click", function() {
                    callback()
                })
            },

            replaceHeader: function(headerElements) {
                var toolbar = this.shadowRoot.querySelector(".card-bar");
                toolbar.innerHTML = "";
                headerElements.forEach(function(headerElement) {
                    toolbar.appendChild(headerElement)
                });
            },

            toggle: function(afterFade, beforeFade) {
                if(this.style.opacity == 0) {
                    this.style.display = "block"
                    var self = this;
                    this.async(function() {
                        self.style.opacity = 1;
                    })
                }
                else {
                    this.style.opacity = 0;
                }

                if (typeof beforeFade === 'function') beforeFade()

                var event = this.addEventListener("webkitTransitionEnd", function(e) {
                    if(e.target.nodeName.toLowerCase() == "auto-suggestions") return;

                    if(this.style.opacity == 0) this.style.display = "none"

                    if(typeof afterFade === 'function') afterFade()
                })

            }
        })
    ;

        Polymer('app-drawer',{
            attached: function() {
                var self = this;
                //overlay click handler that hides the drawer
                this.querySelector("html /deep/ .overlay").addEventListener("click", function() {
                    self.hide();
                });
                //handler that resets the drawer after hide animation has finished
                this.querySelector("html /deep/ paper-shadow").addEventListener("webkitAnimationEnd", function() {
                    if(!this.classList.contains("reverse")) return;
                    this.classList.remove("playing");
                    this.classList.remove("reverse")
                    self.style.visibility = "hidden"
                });
            },
            show: function() {
                this.opened = true;
                this.style.visibility = "visible"
                var paper = this.querySelector("html /deep/ paper-shadow");
                paper.classList.add("playing");
            },
            opened: false,
            openedChanged: function() {
                this.fire("opened-changed");
            },
            hide: function() {
                this.opened = false;
                this.style.visibility = "hidden"
                var paper = this.querySelector("html /deep/ paper-shadow");
                paper.classList.add("reverse");
            }
        })
    ;
Polymer('app-item');;

        var Timeago = {
                    getTimeAgoText: function (datetime, epoch) {
                        if(epoch)
                            return moment.unix(datetime).fromNow();
                        else return new moment(datetime).fromNow();
                    },

                    refresh: function (element, datetime) {
                        element.innerHTML = this.getTimeAgoText(datetime);
                    }
                },
                interval;

        Polymer('time-ago',{
            setup: function () {
                var datetime = this.datetime,
                        element = this.$.timeago;

                element.innerHTML = Timeago.getTimeAgoText(this.datetime, this.epoch);

                if (this.refresh === true) {
                    if (typeof interval !== 'undefined') {
                        clearInterval(interval);
                    }

                    interval = setInterval(function () {
                        Timeago.refresh(element, datetime);
                    }, this.delay);
                }
            },
            ready: function() {
                this.setup();
            },
            datetimeChanged: function () {
                this.setup();
            },
            epoch: true,
            datetime: 0,
            refresh: true,
            delay: 60000
        });
    ;
Polymer('bookmark-item');;
Polymer('recently-item');;

        Polymer('tour-step',{
            backdrop: true,
            layered: true,
            backdropOverride: undefined,
            publish: {
                color: "#4CAF50",
                opacity: 0.9,
                img: "",
                position: "top-left"
            },

            attached: function() {
                var self = this;
                this.style.backgroundImage = "url(" + this.img + ")"
                this.classList.add(this.position);
                var buttons = this.querySelectorAll("paper-button[affirmative]");
                if (buttons.length) {
                    for (var i = 0; i < buttons.length; ++i) {
                        var button = buttons[i]
                        button.addEventListener("click", function () {
                            self.opened = false
                        });
                    }
                }
            },
            openedChanged: function() {
                console.log( "[openedChanged]", this.opened)
                if(this.opened) {
                    var css = this.shadowRoot.querySelector(".style").innerHTML
                    cssEl = document.createElement("style");
                    cssEl.innerHTML = css;
                    document.body.appendChild(cssEl)
                    this.backdropOverride = cssEl
                } else {
                    var completed;
                    this.addEventListener("core-overlay-close-completed", completed = function() {
                        this.removeEventListener("core-overlay-close-completed", completed);
                        if(this.backdropOverride) this.backdropOverride.remove()
                    });
                }
                this.super()
            }
        })
    ;

        Polymer('auto-suggestions',{
            highlightDown: function() {
                if(this.index < (this.suggestions.length - 1)) {
                    this.index++;
                    this.indexChanged()
                }
            },
            highlightUp: function() {
                if(this.index > 0) {
                    this.index--;
                    this.indexChanged()
                }
            },
            highlightChosen: function() {
                this.fire("suggestion-chosen", this.activeSuggestion)
            },
            highlightCurrent: function(e) {
                this.activeSuggestion = e.target.templateInstance.model.suggestion

                //not so nice way to find index based on a element #vanillajsthings
                this.index = Array.prototype.indexOf.call(this.shadowRoot.querySelector(".list").children, e.target) - 1;
            },
            indexChanged: function() {
                this.activeSuggestion = this.suggestions[this.index];
            },
            suggestionsChanged: function() {
                if(this.suggestions.length) {
                    this.index = 0;
                    this.indexChanged()
                }
            },
            index: 0,
            activeSuggestion: undefined,
            colors: {},
            color: function(id) {
                if(id in this.colors) return this.colors[id];
                else return this.colors[id] = Please.make_color()[0];
            },
            formatWebsite: function(url) {
                var host = new URI(url).hostname();
                if(host.substring(0, 4) == "www.") host = host.substring(4)
                return host
            },
            choose: function(e) {
                this.fire("suggestion-chosen", e.target.templateInstance.model.suggestion);
            },

            suggestions: [],
            error: false
        });
    ;

(function() {
  
  Polymer('core-shared-lib',{
    
    notifyEvent: 'core-shared-lib-load',
    
    ready: function() {
      if (!this.url && this.defaultUrl) {
        this.url = this.defaultUrl;
      }
    },
    
    urlChanged: function() {
      require(this.url, this, this.callbackName);
    },
    
    provide: function() {
      this.async('notify');
    },
    
    notify: function() {
      this.fire(this.notifyEvent, arguments);
    }
    
  });

  var apiMap = {};
  
  function require(url, notifiee, callbackName) {
    // make hashable string form url
    var name = nameFromUrl(url);
    // lookup existing loader instance
    var loader = apiMap[name];
    // create a loader as needed
    if (!loader) {
      loader = apiMap[name] = new Loader(name, url, callbackName);
    }
    loader.requestNotify(notifiee);
  }
  
  function nameFromUrl(url) {
    return url.replace(/[\:\/\%\?\&\.\=\-\,]/g, '_') + '_api';
  }

  var Loader = function(name, url, callbackName) {
    this.instances = [];
    this.callbackName = callbackName;
    if (this.callbackName) {
      window[this.callbackName] = this.success.bind(this);
    } else {
      if (url.indexOf(this.callbackMacro) >= 0) {
        this.callbackName = name + '_loaded';
        window[this.callbackName] = this.success.bind(this);
        url = url.replace(this.callbackMacro, this.callbackName);
      } else {
        // TODO(sjmiles): we should probably fallback to listening to script.load
        throw 'core-shared-api: a %%callback%% parameter is required in the API url';
      }
    }
    //
    this.addScript(url);
  };
  
  Loader.prototype = {
    
    callbackMacro: '%%callback%%',
    loaded: false,
    
    addScript: function(src) {
      var script = document.createElement('script');
      script.src = src;
      script.onerror = this.error.bind(this);
      var s = document.querySelector('script');
      s.parentNode.insertBefore(script, s);
      this.script = script;
    },
    
    removeScript: function() {
      if (this.script.parentNode) {
        this.script.parentNode.removeChild(this.script);
      }
      this.script = null;
    },
    
    error: function() {
      this.cleanup();
    },
    
    success: function() {
      this.loaded = true;
      this.cleanup();
      this.result = Array.prototype.slice.call(arguments);
      this.instances.forEach(this.provide, this);
      this.instances = null;
    },
    
    cleanup: function() {
      delete window[this.callbackName];
    },

    provide: function(instance) {
      instance.notify(instance, this.result);
    },
    
    requestNotify: function(instance) {
      if (this.loaded) {
        this.provide(instance);
      } else {
        this.instances.push(instance);
      }
    }
    
  };
  
})();
;

  Polymer('google-js-api',{
    defaultUrl: 'https://apis.google.com/js/api.js?onload=%%callback%%',
    
    /**
     * Fired when the API library is loaded and available.
     * @event js-api-load
     */
    notifyEvent: 'js-api-load'
  });
;

  Polymer('google-client-api',{
    /**
     * Loads the client library when the api js has loaded.
     */
    loadClient: function() {
      gapi.load("client", function() {
        this.fire(this.notifyEvent, arguments);
      }.bind(this));
    },

    /**
     * Fired when the API library is loaded and available.
     * @event api-load
     */
    notifyEvent: 'api-load',

    /**
     * Wrapper for `gapi.client`.
     * @property api
     * @type gapi.client
     */
    get api() {
      return gapi.client;
    },
    /**
     * Wrapper for `gapi.auth`.
     * @property auth
     * @type gapi.auth
     */
    get auth() {
      return gapi.auth;
    }
  });
;

  (function() {
    'use strict';

    // Stores whether the API client is done loading.
    var clientLoaded_ = false;

    // Loaders and loading statuses for all APIs, indexed by API name.
    // This helps prevent multiple loading requests being fired at the same time
    // by multiple google-api-loader elements.
    var statuses_ = {};
    var loaders_ = {};

    Polymer('google-api-loader', {
      /**
       * Fired when the requested API is loaded. Override this name
       * by setting `successEventName`. 
       * @event google-api-load
       */

      /**
       * Fired if an error occurs while loading the requested API. Override this name
       * by setting `errorEventName`. 
       * @event google-api-load-error
       */

      /**
       * Name of the API to load, e.g. 'urlshortener'.
       *
       * You can find the full list of APIs on the
       * <a href="https://developers.google.com/apis-explorer"> Google APIs
       * Explorer</a>.
       * @attribute name
       * @type string
       * @required
       */
      name: '',

      /**
       * Version of the API to load, e.g. 'v1'.
       * @attribute version
       * @type string
       * @required
       */
      version: '',

      /**
       * App Engine application ID for loading a Google Cloud Endpoints API.
       * @attribute appId
       * @type string
       */
      appId: null,

      /**
       * Root URL where to load the API from, e.g. 'http://host/apis'.
       * For App Engine dev server this would be something like:
       * 'http://localhost:8080/_ah/api'.
       * Overrides 'appId' if both are specified.
       * @attribute root
       * @type string
       */
      root: null,

      // Used to fix events potentially being fired multiple times by
      // core-shared-lib.
      waiting: false,

      /**
       * Used to override the event that is fired when the API lib is successfully loaded.
       * @property successEventName
       * @type string
       * @default 'google-api-load'
       */
      successEventName: 'google-api-load',
      
      /**
       * Used to override the event that is fired when there is an error loading the API.
       * @property errorEventName
       * @type string
       * @default 'google-api-load-error'
       */
      errorEventName: 'google-api-load-error',

      /**
       * Returns the loaded API.
       * @property api
       * @type gapi.client
       */
      get api() {
        if (window.gapi && window.gapi.client &&
            window.gapi.client[this.name]) {
          return window.gapi.client[this.name];
        } else {
          return undefined;
        }
      },

      handleLoadResponse: function(response) {
        if (response && response.error) {
          statuses_[this.name] = 'error';
          this.fireError(response);
        } else {
          statuses_[this.name] = 'loaded';
          this.fireSuccess();
        }
      },

      fireSuccess: function() {
        this.fire(this.successEventName,
            { 'name': this.name, 'version': this.version });
      },

      fireError: function(response) {
        if (response && response.error) {
          this.fire(this.errorEventName, {
            'name': this.name,
            'version': this.version,
            'error': response.error });
        } else {
          this.fire(this.errorEventName, {
            'name': this.name,
            'version': this.version });
        }
      },

      doneLoadingClient: function() {
        clientLoaded_ = true;
        // Fix for API client load event being fired multiple times by
        // core-shared-lib.
        if (!this.waiting) {
          this.loadApi();
        }
      },

      createSelfRemovingListener: function(eventName) {
        var handler = function () {
          loaders_[this.name].removeEventListener(eventName, handler);
          this.loadApi();
        }.bind(this);

        return handler;
      },

      loadApi: function() {
        if (clientLoaded_ && this.name && this.version) {
          this.waiting = false;
          // Is this API already loaded?
          if (statuses_[this.name] == 'loaded') {
            this.fireSuccess();
          // Is a different google-api-loader already loading this API?
          } else if (statuses_[this.name] == 'loading') {
            this.waiting = true;
            loaders_[this.name].addEventListener(this.successEventName,
                this.createSelfRemovingListener(this.successEventName));
            loaders_[this.name].addEventListener(this.errorEventName,
                this.createSelfRemovingListener(this.errorEventName));
          // Did we get an error when we tried to load this API before?
          } else if (statuses_[this.name] == 'error') {
            this.fireError();
          // Otherwise, looks like we're loading a new API.
          } else {
            var root;
            if (this.root) {
              root = this.root
            } else if (this.appId) {
              root = 'https://' + this.appId + '.appspot.com/_ah/api';
            }
            statuses_[this.name] = 'loading';
            loaders_[this.name] = this;
            gapi.client.load(this.name, this.version,
                this.handleLoadResponse.bind(this), root);
          }
        }
      }
    });
  })();
;

  Polymer('google-jsapi',{
    defaultUrl: 'https://www.google.com/jsapi?callback=%%callback%%',
		
		/**
		 * Fired when the API library is loaded and available.
		 * @event api-load
		 */
    notifyEvent: 'api-load',
		
		/**
		 * Wrapper for `google` API namespace.
		 * @property api
		 */
    get api() {
      return google;
    }
  });
;


  Polymer('google-maps-api',{

    defaultUrl: 'https://maps.googleapis.com/maps/api/js?callback=%%callback%%',

    /**
     * A Maps API key. To obtain an API key, see developers.google.com/maps/documentation/javascript/tutorial#api_key.
     *
     * @attribute apiKey
     * @type string
     */
    apiKey: null,

   /**
     * A Maps API for Business Client ID. To obtain a Maps API for Business Client ID, see developers.google.com/maps/documentation/business/.
     * If set, a Client ID will take precedence over an API Key.
     *
     * @attribute clientId
     * @type string
     */
    clientId: null,

    /**
     * The libraries to load with this map. Defaults to "places". For more information
     * see https://developers.google.com/maps/documentation/javascript/libraries.
     *
     * @attribute libraries
     * @type string
     * @default "places"
     */
    libraries: "places",

    /**
     * Version of the Maps API to use.
     *
     * @attribute version
     * @type string
     * @default '3.exp'
     */
    version: '3.exp',

    /**
     * The localized language to load the Maps API with. For more information
     * see https://developers.google.com/maps/documentation/javascript/basics#Language
     *
     * Note: the Maps API defaults to the preffered language setting of the browser.
     * Use this parameter to override that behavior. 
     *
     * @attribute language
     * @type string
     * @default null
     */
    language: null,

    /**
     * If true, sign-in is enabled.
     * See https://developers.google.com/maps/documentation/javascript/signedin#enable_sign_in
     *
     * @attribute signedIn
     * @type boolean
     * @default false
     */
    signedIn: false,

    notifyEvent: 'api-load',

    ready: function() {
      var url = this.defaultUrl + '&v=' + this.version;
      url += "&libraries=" + this.libraries;

      if (this.apiKey && !this.clientId) {
        url += '&key=' + this.apiKey;
      }

      if (this.clientId) {
        url += '&client=' + this.clientId;
      }

      if (this.language) {
        url += '&language=' + this.language;
      }

      if (this.signedIn) {
	url += '&signed_in=' + this.signedIn;
      }

      this.url = url;
    },

    /**
     * Provides the google.maps JS API namespace.
     *
     * @property api
     * @type google.maps
     */
    get api() {
      return google.maps;
    }
  });
;

  Polymer('google-plusone-api',{
    defaultUrl: 'https://apis.google.com/js/plusone.js?onload=%%callback%%',
    /**
     * Fired when the API library is loaded and available.
     * @event api-load
     */
    notifyEvent: 'api-load',
		
    /**
     * Wrapper for `gapi`.
     * @property api
     * @type gapi
     */
    get api() {
      return gapi;
    }
  });
;

  Polymer('google-realtime-api',{
    defaultUrl: 'https://apis.google.com/js/drive-realtime.js?onload=%%callback%%',
    /**
     * Fired when the API library is loaded and available.
     * @event api-load
     */
    notifyEvent: 'api-load',
    
    /**
     * Wrapper for `gapi.drive.realtime` API object.
     * @property api
     * @type gapi.drive.realtime
     */
    get api() {
      return gapi.drive.realtime;
    }
  });
;

  Polymer('google-youtube-api',{
    defaultUrl: 'https://www.youtube.com/iframe_api',
    /**
     * Fired when the API library is loaded and available.
     * @event api-load
     */
    notifyEvent: 'api-load',

    callbackName: 'onYouTubeIframeAPIReady',
		
    /**
     * Wrapper for `YT` API object.
     * @property api
     * @type YT
     */
    get api() {
      return YT;
    }
  });
;


  Polymer('paper-radio-button', {
    
    /**
     * Fired when the checked state changes due to user interaction.
     *
     * @event change
     */
     
    /**
     * Fired when the checked state changes.
     *
     * @event core-change
     */
    
    publish: {
      /**
       * Gets or sets the state, `true` is checked and `false` is unchecked.
       *
       * @attribute checked
       * @type boolean
       * @default false
       */
      checked: {value: false, reflect: true},
      
      /**
       * The label for the radio button.
       *
       * @attribute label
       * @type string
       * @default ''
       */
      label: '',
      
      /**
       * Normally the user cannot uncheck the radio button by tapping once
       * checked.  Setting this property to `true` makes the radio button
       * toggleable from checked to unchecked.
       *
       * @attribute toggles
       * @type boolean
       * @default false
       */
      toggles: false,
      
      /**
       * If true, the user cannot interact with this element.
       *
       * @attribute disabled
       * @type boolean
       * @default false
       */
      disabled: {value: false, reflect: true}
    },
    
    eventDelegates: {
      tap: 'tap'
    },
    
    tap: function() {
      if (this.disabled) {
        return;
      }
      var old = this.checked;
      this.toggle();
      if (this.checked !== old) {
        this.fire('change');
      }
    },
    
    toggle: function() {
      this.checked = !this.toggles || !this.checked;
    },
    
    checkedChanged: function() {
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
      this.fire('core-change');
    },
    
    labelChanged: function() {
      this.setAttribute('aria-label', this.label);
    }
    
  });
  
;

  
    Polymer('paper-radio-group', {
      nextIndex: function(index) {
        var items = this.items;
        var newIndex = index;
        do {
          newIndex = (newIndex + 1) % items.length;
          if (newIndex === index) {
            break;
          }
        } while (items[newIndex].disabled);
        return newIndex;
      },
      previousIndex: function(index) {
        var items = this.items;
        var newIndex = index;
        do {
          newIndex = (newIndex || items.length) - 1;
          if (newIndex === index) {
            break;
          }
        } while (items[newIndex].disabled);
        return newIndex;
      },
      selectNext: function() {
        var node = this.selectIndex(this.nextIndex(this.selectedIndex));
        node.focus();
      },
      selectPrevious: function() {
        var node = this.selectIndex(this.previousIndex(this.selectedIndex));
        node.focus();
      },
      
      /**
       * Specifies the attribute to set on the selected element to indicate
       * its active state.
       *
       * @attribute selectedAttribute
       * @type string
       * @default 'checked'
       */
      selectedAttribute: 'checked',
      
      /**
       * The event that would be fired from the item element to indicate
       * it is being selected.
       *
       * @attribute activateEvent
       * @type string
       * @default 'change'
       */
      activateEvent: 'change'

    });
  
  ;


    Polymer('paper-checkbox', {

      /**
       * Fired when the checked state changes due to user interaction.
       *
       * @event change
       */

      /**
       * Fired when the checked state changes.
       *
       * @event core-change
       */

      toggles: true,

      checkedChanged: function () {
        this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
        this.fire('core-change');
      }

    });

  ;


    var p = {

      /**
       * The URL of an image for the icon.  Should not use `icon` property
       * if you are using this property.
       *
       * @attribute src
       * @type string
       * @default ''
       */
      src: '',

      /**
       * If true, border is placed around the button to indicate it's
       * active state.
       *
       * @attribute active
       * @type boolean
       * @default false
       */
      active: false,

      /**
       * Specifies the icon name or index in the set of icons available in
       * the icon set.  Should not use `src` property if you are using this
       * property.
       *
       * @attribute icon
       * @type string
       * @default ''
       */
      icon: '',

      activeChanged: function() {
        this.classList.toggle('selected', this.active);
      }

    };
    
    Polymer.mixin2(p, Polymer.CoreFocusable);
    Polymer('core-icon-button', p);

  ;

        Polymer('behance-item',{
        });
    ;
Polymer('bookmark-tabs');;

        Polymer('codepen-item',{
            getSrc: function(description) {
                var elem = document.createElement("div");
                elem.innerHTML = description;
                var images = elem.getElementsByTagName("img");
                return images[0].src;
            }
        });
    ;

        Polymer('feedly-item',{
            isValidUrl: function(url) {
                return typeof url === "string" && url.substring(0, 4) === "http"
            },

            isInvalidUrl: function(url) {
                //not very pretty, but polymer doesn't have an else statement
                return !this.isValidUrl(url);
            },

            summarize: function(content) {
                if(typeof content !== 'string') return content;

                var words = content.split(" ")
                if(words.length > 50) {
                    //more than 50 words, let's make it a bit shorter
                    words = words.filter(function(word, i) {
                        return i < 50;
                    })
                    content = words.join(' ') + '...';
                }

                return content;
            },

            filterHtml: function(string) {
                //if it's not a string, we don't want it
                if(typeof string !== 'string') return string;

                //pretty mediocre way, but it's the only way to do this without *shivers* executing the html.
                string = _.unescape(string)

                //don't worry. this is just to make the summaries with html look a bit more nice.
                //we're never actually inserting any html into the dom. because that's dangerous af. chrome runtime access, son. i don't think so.
                return string.replace(/<[^>]*>?/g, '');
            },

            imageLoaded: function(e) {
                var path = e.target.getAttribute("src");

                var img = this.shadowRoot.querySelector(".media .img")
                img.style.backgroundImage = "url("+path+")";
                img.style.opacity = 1;

                e.target.remove(); //saves memory
            },

            attached:function() {
                if('summary' in this.item) this.item.article = this.item.summary.content;
                else if('content' in this.item) this.item.article = this.item.content.content;
            }
        });
    ;

        Polymer('dn-item',{
            attached: function() {
                if(this.item && this.item.badge === null) this.shadowRoot.querySelector(".holder").classList.add("nobadge")
            }
        });
    ;

        Polymer('dribbble-item',{
            attached: function() {
                if(this.item && this.item.images) {
                    if(this.item.images.hidpi) this.item.image = this.item.images.hidpi;
                    else this.item.image = this.item.images.normal;
                }
            }
        });
    ;

        Polymer('github-dialog',{})
    ;

        Polymer('github-item',{});
    ;

        Polymer('gmail-auth',{
            signIn: function() {
                var self = this;
                chrome.identity.getAuthToken({
                    interactive:true
                }, function(token) {
                    self.fire("sign-in", token)
                    console.log(self)
                });
            }
        })
    ;

        Polymer('gmail-dialog',{
            logOut: function(e) {
                e.currentTarget.parentElement.toggle()
                this.column.logOut()
            }
        })
    ;
Polymer('gmail-item');;

        Polymer('hn-item',{
            attached: function() {
                var match = this.item.url.target.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
                if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) this.item.hostname = match[2]
            }
        });
    ;

        Polymer('lobsters-dialog',{})
    ;

        Polymer('lobsters-item',{
            attached: function() {
                var match = this.item.url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
                if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) this.item.hostname = match[2]
            }
        });
    ;

        Polymer('ph-dialog',{
            setActive: function(e) {
                var target = e.target
                if(e.target.nodeName.toLowerCase() == "core-icon") target = e.target.parentElement
                this.config.type = target.getAttribute("data-type");
            }
        })
    ;
Polymer('ph-item');;
Polymer('ph-thumb');;

        Polymer('pushbullet-auth',{
            signIn: function() {
                var self = this;
                chrome.identity.launchWebAuthFlow({
                    url: 'https://www.pushbullet.com/authorize?client_id=weqYIl7GLNIOaep4PaTOpfnFUCBRl1IN&redirect_uri=https%3A%2F%2F'+chrome.runtime.id+'.chromiumapp.org%2FpushBullet&response_type=token',
                    interactive: true
                }, function(redirect_url) {
                    self.fire('sign-in', /access_token=([.a-zA-Z0-9]*)/.exec(redirect_url)[1])
                })
            }
        })
    ;

        Polymer('pushbullet-dialog',{
            logOut: function(e) {
                e.currentTarget.parentElement.toggle()
                this.column.logOut()
            }
        })
    ;

        Polymer('pushbullet-item',{
            attached: function() {
                switch(this.item.type) {
                    case "note":
                        this.item._url = false;
                        break;
                    case "file":
                        this.item._url = this.item.file_url;
                        break;
                    case "link":
                        this.item._url = this.item.url;
                }

                if(this.item._url) this.shadowRoot.querySelector("a").setAttribute("href", this.item._url)
            }
        })
    ;

        Polymer('reddit-dialog',{
            dialog: null,
            attached: function() {
                this.dialog = this.shadowRoot.querySelector("tabbie-dialog")
            },
            configChanged: function() {
                this.dialog.querySelector(".subreddit").parentElement.validate()
                this.dialog.querySelector(".multi").parentElement.validate()
            },
            logIn: function() {
                this.column.login()
            },
            logOut: function() {
                this.column.logout()
            },
            close: function() {
                this.super();
                console.log(this.config)
            }
        })
    ;
Polymer('reddit-error');;

        Polymer('reddit-item',{
            attached: function() {
                if(!this.item.thumbnail || this.item.thumbnail == "default" || this.item.thumbnail == "self" || this.item.thumbnail == "nsfw") {
                    this.item.nothumb = true
                    this.classList.add("nothumb");
                }
            }
        });
    ;


        function moveArrayElem(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        }

        function existsWebsite(array, website) {
            var result = false;

            for(var item in array) {
                if(array[item].id == website.id) {
                    result = true;
                    break;
                }
            }

            return result;
        }
        
        Polymer('speed-dial-dialog',{
            removeSettingsWebsite: function() {
                var index = this.config.websites.indexOf(this.settingsWebsite);
                this.config.websites.splice(index, 1);
                this.closeSettings();
            },

            addWebsite: function() {
                var website = {
                  id: Math.floor(Math.random() * 1000000),
                  name: '',
                  icon: {
                      url: ''
                  },
                  url: ''
                };

                this.openSettingsDialog(website);
            },

            saveSettingsWebsite: function(){
                if(this.$.dialname.validity.valid && this.$.iconurl.validity.valid && this.$.url.validity.valid) {
                    if(!existsWebsite(this.config.websites, this.settingsWebsite)) { // if this is new dial
                        this.config.websites.push(this.editedWebsite);
                    }
                    this.settingsWebsite.name = this.editedWebsite.name;
                    this.settingsWebsite.icon.url = this.editedWebsite.icon.url;
                    this.settingsWebsite.url = this.editedWebsite.url;
                } else {
                    alert("Please check the validity of the inputs!");
                }
            },

            moveDown: function(ev, detail, elem) {
                var index = elem.getAttribute("data-index");
                var websites = this.config.websites;
                moveArrayElem(websites, index, Math.min(index + 1, websites.length - 1));
            },

            moveUp: function(ev, detail, elem) {
                var index = elem.getAttribute("data-index");
                moveArrayElem(this.config.websites, index, Math.max(index - 1, 0));
            },

            openSettings: function(ev, detail, elem) {
                var index = elem.getAttribute("data-index");
                this.openSettingsDialog(this.config.websites[index]);
            },

            openSettingsDialog: function(website) {
                this.settingsOpen = true;
                this.settingsOffset = 0;
                this.settingsWebsite = website;
                this.editedWebsite = JSON.parse(JSON.stringify(website));
                if(website.icon.url.startsWith('chrome-extension://')) {
                    this.isDefaultIcon = true;
                }
                this.$.speedDialSettingsDialog.setAttribute('autoCloseDisabled', '');
            },

            closeSettings: function() {
                if(JSON.stringify(this.settingsWebsite) != JSON.stringify(this.editedWebsite)) {
                    if(!confirm("Unsaved changes. Are you sure you want to quit?")) {
                        return 0;
                    }
                }

                this.settingsOffset = 600;
                this.settingsOpen = false;
                this.isDefaultIcon = false;
                this.$.speedDialSettingsDialog.removeAttribute('autoCloseDisabled');
            },

            toggleDefaultIcon: function(ev, detail, elem) {
                if(elem.checked) {
                    this.editedWebsite.icon.url = chrome.extension.getURL("img/default-speeddialitem-icon.png");
                } else {
                    this.editedWebsite.icon.url = "";
                }
            },

            settingsOffset: 600,
            settingsOpen: false,
            isDefaultIcon: false,
            settingsWebsite: {},
            editedWebsite: {}
        })
    ;
Polymer('speed-dial-item');