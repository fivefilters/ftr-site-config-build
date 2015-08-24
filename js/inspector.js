/**
 * Simple JavaScript DOM Inspector v0.1.2
 *
 * Highlights hovered elements with a 2px red outline, and then provides the hovered element
 * on click to the callback function, which can do anything with it.
 *
 * By default, the inspector just console.logs a jQuery-style CSS selector path for the element.
 * 
 * The CSS path-building code works up the given element's parent nodes to create an optimised
 * selector string, stopping at the first parent with an #id, but can also create an
 * ultra-specific full CSS path, right down to 'html'.
 * 
 * Optionally, it can check to see if any part of the CSS path matches multiple elements, or if
 * any element in the CSS path has no #id or .class, and add specific ":nth-child()"
 * pseudo-selector to match the element, eg. "html body #content p img:nth-child(1)"
 * 
 * Hit escape key to cancel the inspector.
 * 
 * NB: XPath code removed as it didn't really work very well, need to write from scratch.
 * 
 * Started putting in IE support, but won't work in IE just yet, check back next week for that
 * (so far, tested in FF4, Chrome, Safari, Opera 11.)
 * 
 * No warranty; probably won't break the internet. Improvements and linkbacks welcome!
 * 
 * - Joss
 */

(function(document) {
	var last;
		
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
		var fullPath    = 0,  // Set to 1 to build ultra-specific full CSS-path, or 0 for optimised selector
		    useNthChild = 0,  // Set to 1 to use ":nth-child()" pseudo-selectors to match the given element
		    cssPathStr = '',
		    testPath = '',
		    parents = [],
		    parentSelectors = [],
		    tagName,
		    cssId,
		    cssClass,
		    tagSelector,
		    vagueMatch,
		    nth,
		    i,
		    c;
		
		// Go up the list of parent nodes and build unique identifier for each:
		while ( el ) {
			vagueMatch = 0;

			// Get the node's HTML tag name in lowercase:
			tagName = el.nodeName.toLowerCase();
			
			// Get node's ID attribute, adding a '#':
			cssId = ( el.id ) ? ( '#' + el.id ) : false;
			
			// Get node's CSS classes, replacing spaces with '.':
			cssClass = ( el.className ) ? ( '.' + el.className.replace(/\s+/g,".") ) : '';

			// Build a unique identifier for this parent node:
			if ( cssId ) {
				// Matched by ID:
				tagSelector = tagName + cssId + cssClass;
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
			if ( cssId && !fullPath )
				break;
			
			// Go up to the next parent node:
			el = el.parentNode !== document ? el.parentNode : false;
			
		} // endwhile
		
		
		// Build the CSS path string from the parent tag selectors:
		for ( i = 0; i < parentSelectors.length; i++ ) {
			cssPathStr += ' ' + parentSelectors[i];// + ' ' + cssPathStr;
			
			// If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag:
			if ( useNthChild && !parentSelectors[i].match(/#/) && !parentSelectors[i].match(/^(html|body)$/) ) {
				
				// If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements:
				if ( !parentSelectors[i].match(/\./) || $( cssPathStr ).length > 1 ) {
					
					// Count element's previous siblings for ":nth-child" pseudo-selector:
					for ( nth = 1, c = el; c.previousElementSibling; c = c.previousElementSibling, nth++ );
					
					// Append ":nth-child()" to CSS path:
					cssPathStr += ":nth-child(" + nth + ")";
				}
			}
			
		}
		
		// Return trimmed full CSS path:
		return cssPathStr.replace(/^[ \t]+|[ \t]+$/, '');
	}


	/**
	 * MouseOver action for all elements on the page:
	 */
	function inspectorMouseOver(e) {
		// NB: this doesn't work in IE (needs fix):
		var element = e.target;
		
		// Set outline:
		element.style.outline = '2px solid #f00';
		
		// Set last selected element so it can be 'deselected' on cancel.
		last = element;
	}
	
	
	/**
	 * MouseOut event action for all elements
	 */
	function inspectorMouseOut(e) {
		// Remove outline from element:
		e.target.style.outline = '';
	}
	
	
	/**
	 * Click action for hovered element
	 */
	function inspectorOnClick(e) {
		e.preventDefault();
		
		// These are the default actions (the XPath code might be a bit janky)
		// Really, these could do anything:
		console.log( cssPath(e.target) );
		/* console.log( getXPath(e.target).join('/') ); */
		
		return false;
	}


	/**
	 * Function to cancel inspector:
	 */
	function inspectorCancel(e) {
		// Unbind inspector mouse and click events:
		if (e === null && event.keyCode === 27) { // IE (won't work yet):
			document.detachEvent("mouseover", inspectorMouseOver);
			document.detachEvent("mouseout", inspectorMouseOut);
			document.detachEvent("click", inspectorOnClick);
			document.detachEvent("keydown", inspectorCancel);
			last.style.outlineStyle = 'none';
		} else if(e.which === 27) { // Better browsers:
			document.removeEventListener("mouseover", inspectorMouseOver, true);
			document.removeEventListener("mouseout", inspectorMouseOut, true);
			document.removeEventListener("click", inspectorOnClick, true);
			document.removeEventListener("keydown", inspectorCancel, true);
			
			// Remove outline on last-selected element:
			last.style.outline = 'none';
		}
	}
	

	/**
	 * Add event listeners for DOM-inspectorey actions
	 */
	if ( document.addEventListener ) {
		document.addEventListener("mouseover", inspectorMouseOver, true);
		document.addEventListener("mouseout", inspectorMouseOut, true);
		document.addEventListener("click", inspectorOnClick, true);
		document.addEventListener("keydown", inspectorCancel, true);
	} else if ( document.attachEvent ) {
		document.attachEvent("mouseover", inspectorMouseOver);
		document.attachEvent("mouseout", inspectorMouseOut);
		document.attachEvent("click", inspectorOnClick);
		document.attachEvent("keydown", inspectorCancel);
	}
	
})(document);