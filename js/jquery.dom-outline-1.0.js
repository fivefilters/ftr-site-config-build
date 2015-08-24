/**
 * Firebug/Web Inspector Outline Implementation using jQuery
 * Tested to work in Chrome, FF, Safari. Buggy in IE ;(
 * Andrew Childs <ac@glomerate.com>
 *
 * Modified by Keyvan Minoukadeh for the FiveFilters.org project
 * - disable stop on escape and stop on click
 * - TODO: adapt Joss's inspector.js (cssPath function) to create optimised CSS to match selected element (only given element)
 * - allow selecting element on click, without disabling further selection
 *
 * Example Setup:
 * var myClickHandler = function (element) { console.log('Clicked element:', element); }
 * var myDomOutline = DomOutline({ onClick: myClickHandler, filter: '.debug' });
 *
 * Public API:
 * myDomOutline.start();
 * myDomOutline.stop();
 */
var DomOutline = function (options) {
    options = options || {};

    var pub = {};
    var self = {
        opts: {
            namespace: options.namespace || 'DomOutline',
            borderWidth: options.borderWidth || 2,
            onClick: options.onClick || false,
            filter: options.filter || false
        },
        keyCodes: {
            BACKSPACE: 8,
            ESC: 27,
            DELETE: 46
        },
        active: false,
        initialized: false,
        elements: {},
        selected: {},
        infobox: null
    };

    function writeStylesheet(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }    

    function initStylesheet() {
        if (self.initialized !== true) {
            var css = '' +
                '* {' +
                '    cursor: default !important;' +
                '}'+
                '#' + self.opts.namespace + '_infobox {' +
                '    position: fixed;' +
                '    bottom: 0;' +
                '    left: 0;' +
                '    background: #eee;' +
                '    border-top: 3px solid #000;' +
                '    z-index: 99999;' +
                '    width: 100%;' +
                '    height: 120px;' +
                '}' +
                '.' + self.opts.namespace + ' {' +
                '    background: #09c;' +
                '    position: absolute;' +
                '    z-index: 88888;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: #09c;' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 88888;' +
                '}' +
                '.' + self.opts.namespace + '.selected {' +
                '    background: red;' +
                '}' +
                '.' + self.opts.namespace + '_label.selected {' +
                '    background: red;' +
                '}' +
                '.' + self.opts.namespace + '.hide, .' + self.opts.namespace + '_label.hide {' +
                '    display:none;' +
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

    /**
     * Get full CSS path of any element
     * 
     * Returns a jQuery-style CSS path, with IDs, classes and ':nth-child' pseudo-selectors.
     * 
     * Can either build a full CSS path, from 'html' all the way to ':nth-child()', or a
     * more optimised short path, stopping at the first parent with a specific ID,
     * eg. "#content .top p" instead of "html body #main #content .top p:nth-child(3)"
     */
    function cssPath(el) {
        var //fullPath    = 0,  // Set to 1 to build ultra-specific full CSS-path, or 0 for optimised selector
            //useNthChild = typeof(useNthChild) === 'undefined' ? false : useNthChild,  // Set to 1 to use ":nth-child()" pseudo-selectors to match the given element
            originalEl = el,
            matchedElems = 0,
            cssPathStr = '',
            parentSelectors = [],
            tagName,
            cssId,
            cssClass,
            tagSelector,
            vagueMatch,
            cssArray;
        
        // Go up the list of parent nodes and build unique identifier for each:
        while ( el ) {
            vagueMatch = 0;

            // Get the node's HTML tag name in lowercase:
            tagName = el.nodeName.toLowerCase();
            
            // Get node's ID attribute, adding a '#':
            if (el.id) el.id = jQuery.trim(el.id);
            cssId = ( el.id ) ? ( '#' + el.id ) : false;
            
            // Get node's CSS classes, replacing spaces with '.':
            if (el.className) el.className = jQuery.trim(el.className);
            cssClass = ( el.className ) ? el.className.replace(/\s+/g,".") : '';
            cssClass = cssClass.replace(/\.+/g,".");

            // Go through class names one by one
            cssArray = cssClass.split('.');
            cssClass = '';
            // go through class names and stop when we find a selector which only returns one element
            // TODO: sory array bringing common body class names to top - e.g. hentry, content, post, etc.
            for (var i = 0; i < cssArray.length; i++) {
                if (cssArray[i] === '') continue;
                if (seemsArticleSpecific(cssArray[i])) continue;
                if (jQuery(tagName + '.' + cssArray[i]).length === 1) {
                    cssClass = '.' + cssArray[i];
                    break;
                } else {
                    cssClass += '.' + cssArray[i];
                    if (jQuery(tagName + cssClass).length === 1) {
                        break;
                    }
                }
            }

            // Build a unique identifier for this parent node:
            if ( cssId && !seemsArticleSpecific(cssId)) {
                // Matched by ID:
                //tagSelector = tagName + cssId + cssClass;
                tagSelector = tagName + cssId;
            } else if ( cssClass ) {
                // Matched by class (will be checked for multiples afterwards):
                tagSelector = tagName + cssClass;
            } else {
                // Couldn't match by ID or class, so use ":nth-child()" instead:
                vagueMatch = 1;
                tagSelector = tagName;
            }
            
            // Add this full tag selector to the parentSelectors array:
            parentSelectors.unshift( tagSelector )

            // If doing short/optimised CSS paths and this element has an ID, stop here:
            //if ( cssId && !fullPath ) {
            //    break;
            //}
            //alert(buildCssPath(parentSelectors, el));
            cssPathStr = buildCssPath(parentSelectors);
            matchedElems = jQuery( cssPathStr ).length;
            if ( matchedElems === 1 ) {
                break;
            } else {
                //alert('matched: '+matchedElems);
            }
            
            // Go up to the next parent node:
            el = el.parentNode !== document ? el.parentNode : false;
            
        } // endwhile
        if (matchedElems > 1) {
            // do it all again with nthChild enabled
            // TODO: this doesn't work so well, and haven't tested XPath yet: 
            // Example: p:nth-child(6) -> //*[(position()-0) mod 6=0 and position()>=0]/self::p
            //return cssPath(originalEl, true);
            self.opts.infobox.contentWindow.toastr.warning('Couldn\'t generate a unique CSS path :(', null, {positionClass: "toast-top-left", newestOnTop: true});
            //alert('Couldn\'t generate a unique CSS path :(');
            return false;
        } else {
            //cssPathStr = buildCssPath(parentSelectors);
            if (seemsArticleSpecific(cssPathStr)) alert('The number(s) in the CSS selector might indicate that the selector is unique to this article.');
            return cssPathStr;
        }
    }

    function seemsArticleSpecific(selector) {
        if (selector.match(/\d{2,}|\-\d+/)) return true;
        return false;
    }

    function buildCssPath(selectors, el, useNthChild) {
        var cssPathStr = '';
        var nth, i, c;
        // Build the CSS path string from the parent tag selectors:
        for ( i = 0; i < selectors.length; i++ ) {
            cssPathStr += ' ' + selectors[i];// + ' ' + cssPathStr;
            

            /*
            // If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag:
            if ( useNthChild && !selectors[i].match(/#/) && !selectors[i].match(/^(html|body)$/) ) {
                
                // If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements:
                //if ( !selectors[i].match(/\./) || jQuery( cssPathStr ).length > 1 ) {
                if ( jQuery( cssPathStr ).length > 1 ) {
                    
                    // Count element's previous siblings for ":nth-child" pseudo-selector:
                    //for ( nth = 1, c = el; c.previousElementSibling; c = c.previousElementSibling, nth++ );
                    nth = jQuery(el).index() + 1;
                    
                    // Append ":nth-child()" to CSS path:
                    cssPathStr += ":nth-child(" + nth + ")";
                }
            }
            */
        }
        
        // Return trimmed full CSS path:
        return jQuery.trim(cssPathStr);
    }

    function createInfoBox() {
        //add our debugger box and cache
        $("<div id='infobox_container'><iframe id='"+self.opts.namespace+"_infobox' src='"+window.ffbase+"/infobox.php'></iframe></div>").appendTo($("body"));
        self.opts.infobox = document.getElementById(self.opts.namespace+"_infobox");
    }

    function createOutlineElements() {
        // used when mouse hovers over element
        self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label').appendTo('body');
        self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');

        // used when element selected (clicked)
        self.selected.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label selected').appendTo('body');
        self.selected.top = jQuery('<div></div>').addClass(self.opts.namespace + ' selected').appendTo('body');
        self.selected.bottom = jQuery('<div></div>').addClass(self.opts.namespace + ' selected').appendTo('body');
        self.selected.left = jQuery('<div></div>').addClass(self.opts.namespace + ' selected').appendTo('body');
        self.selected.right = jQuery('<div></div>').addClass(self.opts.namespace + ' selected').appendTo('body');
    }

    function removeOutlineElements() {
        jQuery.each(self.elements, function(name, element) {
            element.remove();
        });
        jQuery.each(self.selected, function(name, element) {
            element.remove();
        });        
    }

    function hideSelectedElement() {
        jQuery.each(self.selected, function(name, element) {
            element.addClass('hide');
        });
    }

    function showSelectedElement() {
        jQuery.each(self.selected, function(name, element) {
            element.removeClass('hide');
        });
    }


    function compileLabelText(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        //label += ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
        return label;
    }

    function getScrollTop() {
        if (!self.elements.window) {
            self.elements.window = jQuery(window);
        }
        return self.elements.window.scrollTop();
    }

    function allowSelection(e) {
        if (e.className.indexOf(self.opts.namespace) !== -1) {
            return false;
        }
        if (e.id.indexOf(self.opts.namespace) !== -1) {
            return false;
        }
        if (jQuery.contains(self.opts.infobox, e)) {
            return false;
        }        
        if (self.opts.filter) {
            if (!jQuery(e).is(self.opts.filter)) {
                return false;
            }
        }
        return true;
    }

    function updatePosition(e, type) {
        pub.element = e.target;
        if (!allowSelection(pub.element)) return;
        pub.updateOutlinePosition(type);
    }

    pub.updateOutlinePosition = function(type) {
        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop();
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;

        var label_text = compileLabelText(pub.element, pos.width, pos.height);
        var label_top = Math.max(0, top - 20 - b, scroll_top);
        var label_left = Math.max(0, pos.left - b);

        var target = self.elements;
        if (typeof(type)!=='undefined') {
            pub.selected = pub.element;
            target = self.selected;
        }
        target.label.css({ top: label_top, left: label_left }).text(label_text);
        target.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        target.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        target.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        target.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
    }

    function stopOnEscape(e) {
        if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
            //pub.stop();
            hideSelectedElement();
        }

        return false;
    }

    function clickHandler(e) {
        //alert(document.evaluate("//img", document, null, XPathResult.ANY_TYPE, null).singleNodeValue);
        //pub.stop();
        if (!allowSelection(pub.element)) return false;
        self.opts.onClick(pub.element);
        var css = cssPath(pub.element);
        if (!css) return false;
        // expose JQuery plugin:
        //$.mask.close();
        //$(pub.element).expose();
        var xpath = css2xpath(css);
        $('#path_css', $(self.opts.infobox).contents()).val(css);
        $('#path_xpath', $(self.opts.infobox).contents()).val(xpath);

        var fileParts = [
            "# Generated by FiveFilters.org's web-based selection tool\n",
            "# Place this file inside your site_config/custom/ folder\n",
            "# Source: "+document.location.href+"\n\n",
            "body: "+xpath+"\n",
            "test_url: "+window.ffurl
        ];
        // Create a blob object.
        var bb = new Blob(fileParts,{type : "text/plain"});
        // Create a blob url for this. 
        var dnlnk = window.URL.createObjectURL(bb);
        //var currentLnk = $("#ftr-download").attr("href");
        // blobFl is the id of the anchor tag through which the download will be triggered.
        $("#ftr-download", $(self.opts.infobox).contents()).attr("href", dnlnk);
        $("#ftr-download", $(self.opts.infobox).contents()).attr("download", window.ffhost+".txt");
        // For some reason trigger from jquery dint work for me.
        //document.getElementById("ftr-download").click();
        return true;
    }

    pub.start = function () {
        initStylesheet();
        if (self.active !== true) {
            self.active = true;
            createOutlineElements();
            createInfoBox();
            jQuery('body').on('mousemove.' + self.opts.namespace, updatePosition);
            jQuery('body').on('keyup.' + self.opts.namespace, stopOnEscape);
            jQuery('body').on('keyup.' + self.opts.namespace, function(e) {
                switch(e.which) {
                    case 37: // left
                        if (pub.selected && pub.selected.parentNode !== document) {
                            pub.element = pub.selected.parentNode;
                            if (clickHandler()) pub.updateOutlinePosition('click');
                        } else {
                            //alert('There is no selection');
                        }
                    break;

                    case 38: // up
                    break;

                    case 39: // right
                        if (pub.selected && pub.selected.firstElementChild !== null) {
                            pub.element = pub.selected.firstElementChild;
                            //pub.updateOutlinePosition('click');
                            if (clickHandler()) pub.updateOutlinePosition('click');
                        }
                    break;

                    case 40: // down
                    break;

                    default: return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });
            if (self.opts.onClick) {
                setTimeout(function () {
                    jQuery('body').on('click.' + self.opts.namespace, function(e){
                        if (clickHandler(e)) {
                            updatePosition(e, 'click');
                            showSelectedElement();
                        }
                    });
                }, 50);
            }
        }
    };

    pub.stop = function () {
        self.active = false;
        removeOutlineElements();
        jQuery('body').off('mousemove.' + self.opts.namespace)
            .off('keyup.' + self.opts.namespace)
            .off('click.' + self.opts.namespace);
    };

    return pub;
};
