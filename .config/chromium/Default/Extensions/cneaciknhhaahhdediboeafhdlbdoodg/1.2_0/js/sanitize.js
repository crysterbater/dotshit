/**
 * Sanitizer which filters a set of whitelisted tags, attributes and css.
 * For now, the whitelist is small but can be easily extended.
 *
 * @param bool whether to escape or strip undesirable content.
 * @param map of allowed tag-attribute-attribute-parsers.
 * @param array of allowed css elements.
 * @param array of allowed url scheme
 */
function HtmlWhitelistedSanitizer(escape, tags, css, urls) {
    this.escape = escape;
    this.allowedTags = tags;
    this.allowedCss = css;

    if (urls == null) {
        urls = ['http://', 'https://', 'mailto', 'tel'];
    }

    if (this.allowedTags == null) {
        // Configure small set of default tags
        var unconstrainted = function(x) {
            return x;
        };
        var globalAttributes = {
            'dir': unconstrainted,
            'lang': unconstrainted,
            'title': unconstrainted
        };
        var url_sanitizer = HtmlWhitelistedSanitizer.makeUrlSanitizer(urls);
        this.allowedTags = {
            'a': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'download': unconstrainted,
                'href': url_sanitizer,
                'hreflang': unconstrainted,
                'ping': url_sanitizer,
                'rel': unconstrainted,
                'target': unconstrainted,
                'type': unconstrainted
            }),
            'img': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'alt': unconstrainted,
                'height': unconstrainted,
                'src': url_sanitizer,
                'width': unconstrainted,
                'duration': unconstrainted,
                'class': unconstrainted,
                'name': unconstrainted,
                'fie-name': unconstrainted,
                'size': unconstrainted,
                'fie-size': unconstrainted,
                'chechsum': unconstrainted,
                'data-src':url_sanitizer,
                'src-orig':url_sanitizer,
                'style':unconstrainted
            }),
            'col': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'span': unconstrainted,
                'width': unconstrainted
            }),
            'colgroup': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'span': unconstrainted,
                'width': unconstrainted
            }),
            'p': globalAttributes,
            'div': globalAttributes,
            'span': globalAttributes,
            'br': globalAttributes,
            'b': globalAttributes,
            'i': globalAttributes,
            'u': globalAttributes,
            'h1': globalAttributes,
            'h2': globalAttributes,
            'h3': globalAttributes,
            'h4': globalAttributes,
            'h5': globalAttributes,
            'h6': globalAttributes,
            'caption': globalAttributes,
            'cite': globalAttributes,
            'code': globalAttributes,
            'dd': globalAttributes,
            'dl': globalAttributes,
            'em': globalAttributes,
            'dt': globalAttributes,
            'li': globalAttributes,
            'ol': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'start': unconstrainted,
                'type': unconstrainted
            }),
            'pre': globalAttributes,
            'q': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'cite': unconstrainted
            }),
            'small': globalAttributes,
            'strike': globalAttributes,
            'strong': globalAttributes,
            'sub': globalAttributes,
            'sup': globalAttributes,
            'table': HtmlWhitelistedSanitizer.mergeMap(globalAttributes, {
                'summary': unconstrainted,
                'width': unconstrainted
            }),
            'tbody': globalAttributes,
            'td': globalAttributes,
            'th': globalAttributes,
            'tt': globalAttributes,
            'tfoot': globalAttributes,
            'thead': globalAttributes,
            'tr': globalAttributes,
            'ul': globalAttributes,
            'hr': globalAttributes,
            'title': globalAttributes,
            'center': globalAttributes
        };
    }
    if (this.allowedCss == null) {
        // Small set of default css properties
        this.allowedCss = ['border', 'margin', 'padding'];
    }
}

HtmlWhitelistedSanitizer.makeUrlSanitizer = function(allowed_urls) {
    return function(str) {
        if (!str) {
            return '';
        }
        for (var i in allowed_urls) {
            if (str.startsWith(allowed_urls[i])) {
                return str;
            }
        }
        return '';
    };
}

HtmlWhitelistedSanitizer.mergeMap = function(/*...*/) {
    var r = {};
    for (var arg in arguments) {
        for (var i in arguments[arg]) {
            r[i] = arguments[arg][i];
        }
    }
    return r;
}

HtmlWhitelistedSanitizer.prototype.sanitizeString = function(input) {
    // Use the browser to parse the input. This won't evaluate any potentially
    // dangerous scripts since the element isn't attached to the window's document.
    // To be extra cautious, we could dynamically create an iframe, pass the
    // input to the iframe and get back the sanitized string.
    var doc = document.implementation.createHTMLDocument();
    var div = doc.createElement('div');
    div.innerHTML = input;

    // Return the sanitized version of the node.
    return this.sanitizeNode(div).innerHTML;
}

HtmlWhitelistedSanitizer.prototype.sanitizeNode = function(node) {
    // Note: <form> can have it's nodeName overriden by a child node. It's
    // not a big deal here, so we can punt on this.
    var node_name = node.nodeName.toLowerCase();
    if (node_name == '#text') {
        // text nodes are always safe
        return node;
    }
    if (node_name == '#comment') {
        // always strip comments
        return document.createTextNode('');
    }
    if (!this.allowedTags.hasOwnProperty(node_name)) {
        // this node isn't allowed
        if (this.escape) {
            return document.createTextNode(node.outerHTML);
        }
        return document.createTextNode('');
    }

    // create a new node
    var copy = document.createElement(node_name);
    
    var srcAttrVlaue = "";
    var datasrcAttrVlaue = "";
    // copy the whitelist of attributes using the per-attribute sanitizer
    for (var n_attr = 0; n_attr < node.attributes.length; n_attr++) {
        var attr = node.attributes.item(n_attr).name;
        if (this.allowedTags[node_name].hasOwnProperty(attr)) {
            var sanitizer = this.allowedTags[node_name][attr];
            copy.setAttribute(attr, sanitizer(node.getAttribute(attr)));
            if(node_name === "img") {
                if(attr === 'src') {
                    srcAttrVlaue = sanitizer(node.getAttribute(attr));
                }
                if(attr === 'data-src') {
                    datasrcAttrVlaue = sanitizer(node.getAttribute(attr));
                }
            }
        }
    }
    if(node_name === "img" && srcAttrVlaue.indexOf("http") === -1 && datasrcAttrVlaue.indexOf("http") === -1) {
        return document.createTextNode('');
    }
    // copy the whitelist of css properties
    for (var css in this.allowedCss) {
        copy.style[this.allowedCss[css]] = node.style[this.allowedCss[css]];
    }

    // recursively sanitize child nodes
    while (node.childNodes.length > 0) {
        var child = node.removeChild(node.childNodes[0]);
        copy.appendChild(this.sanitizeNode(child));
    }
    return copy;
}