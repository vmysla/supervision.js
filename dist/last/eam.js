(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var EAM = require('./lib/eam/src/eam.js');
var eam = EAM.prototype;

eam.Helper = require('./lib/eam/src/helper/helper.js');
eam.HelperJQuery = require('./lib/eam/src/helper/helper-jquery.js');
eam.HelperSatellite = require('./lib/eam/src/helper/helper-satellite.js');

eam.Dwell = require('./lib/eam/src/dwell/dwell.js');
eam.DwellTimer = require('./lib/eam/src/dwell/dwell-timer.js');

eam.Element = require('./lib/eam/src/element/element.js');
eam.ElementSelector = require('./lib/eam/src/element/element-selector.js');

eam.Interaction = require('./lib/eam/src/interaction/interaction.js');

eam.Tracker = require('./lib/eam/src/tracker/tracker.js');

EAM.options = {

	autostart : true,

	global    : window,
	context   : document,
	none      : EAM.none,
	nan		  : Number.NaN,
	doNothing : function (){},

	helper  : { 
		priority  : [ eam.HelperSatellite, eam.HelperJQuery ]
	},

	interaction : {

		/**
		* 
		* User action might start a sequence of events with different target Nodes.
		* This happens because browser can bubble and forward events. JavaScript too.
		* Therefore we might receive a group of events and should select one for reporting.
		* Initiator - target element from first event when interaction starts.
		* Receiver  - one of target elements of the rest events received later.
		* Fixation  - maximal allowed time period in seconds for interaction receiver change.
		*             After this time, received events with a different target 
		*             should be classified as first event of a new interaction.
		*/
		fixation : 0.3,

		listen : { 
				global  : 'unload',
				context : 'click,mousedown,keypress'
		},

		element : {

			shortValue : function(text){
				if(!text) return;
				return (text.length<3) ? text : text.substr(0,3)+'...';	
			},

			dwell : { 

				autostart : true, 
				latency   : 0,

				listen : { 
					global  : 'focus,blur',
					context : 'focusin,focusout,mousedown,mouseup,click,keydown,keyup,keypress'
				}
			}
		}

	}
}

if(EAM.options.autostart){
	var instance = new EAM(EAM.options);
	EAM.options.global['eam'] = instance;
	instance['interaction'] = instance.create(eam.Interaction, EAM.options.interaction);
	instance['tracker'] = instance.create(eam.Tracker, EAM.options);
}

module.exports = EAM;
},{"./lib/eam/src/dwell/dwell-timer.js":2,"./lib/eam/src/dwell/dwell.js":3,"./lib/eam/src/eam.js":4,"./lib/eam/src/element/element-selector.js":5,"./lib/eam/src/element/element.js":6,"./lib/eam/src/helper/helper-jquery.js":7,"./lib/eam/src/helper/helper-satellite.js":8,"./lib/eam/src/helper/helper.js":9,"./lib/eam/src/interaction/interaction.js":10,"./lib/eam/src/tracker/tracker.js":11}],2:[function(require,module,exports){
 /**
 * Dwell Timer
 * @private
 * @class
 * @memberof EAM.Dwell
 * @param {EAM.Eam} eam
 * @param {EAM.Dwell.Options} options Initial configuration.
 */
function DwellTimer(eam, options){

	/** @const {EAM.Time} FLAG_TIMER_IS_STOPPED */
	var FLAG_TIMER_IS_STOPPED = eam.nan;

	/**
	* @typedef {Object} Model
	* @memberof EAM.Dwell.DwellTimer
	* @property {EAM.Duration}       saved   Saved activity duration in seconds.
	* @property {(EAM.Time)} started Time of the last activity or False when none.
	*/

	/** 
	 * @private	
	 * @property {EAM.Dwell.DwellTimer.Model} model
	 */
	var model = {
		savedSeconds : 0,
		startTime    : FLAG_TIMER_IS_STOPPED
	}

	/** Reset dwell time */	
	this.reset = function(){ 
		model.savedSeconds = 0;
		model.startTime = FLAG_TIMER_IS_STOPPED;
	}

	/** 
	 * Get total dwell time.
	 * @method
     * @returns {EAM.Duration} Duration in seconds.
     */	
	this.total = function(){ 
		return saved() + unsaved(); 
	};

	/**
     * Save current dwell session and restart if required.
     * @method
     * @param {Boolean} restart Indicates if new dwell session should be started after save.
     */
	this.flush = function(restart){
		model.savedSeconds  += unsaved();
		model.startTime = restart ? eam.time() : FLAG_TIMER_IS_STOPPED;
	};

	/**
     * Get dwell time for saved sessions.
     * @private
     * @returns {EAM.Duration} Duration in seconds.
     */
	function saved(){
		return model.savedSeconds;
	}

	/**
     * Get dwell time for unsaved session.
     * @private
     * @returns {EAM.Duration} Duration in seconds.
     */
	function unsaved(){
		if(model.startTime == FLAG_TIMER_IS_STOPPED) return 0;
		var now   = eam.time();
		var delta = (now - model.startTime) / 1000;
		return (delta <= options.latency) ? delta : options.latency + 1;
	}

	this.flush(options.autostart);
}

module.exports = DwellTimer;
},{}],3:[function(require,module,exports){
/** @namespace EAM.Dwell **/

/**
 * @typedef {Object} Options
 * @memberof EAM.Dwell
 * @property {Boolean}      start   Initial state of activity.
 * @property {EAM.Duration} latency Passive activity duration in seconds.
 * @property {Object}       listen  Events to listen.
 */

 /**
 * EAM Dwell Time.
 * The period of time that a system or element of a system remains in a given state.
 * Dwell time is closely related to bounce rate.
 * @class
 * @memberof EAM.Dwell
 * @param {EAM.Eam} eam
 * @param {EAM.Dwell.Options} options Initial configuration.
 */
function Dwell(eam, options){

	/** 
	 * @private
	 * @property {EAM.Dwell.DwellTimer} timer
	 */
	var timer = eam.create(eam.DwellTimer, options);

	/** 
	 * @private
	 * @property {EAM.Time} overtime Extra time. Used when events received in a wrong order because of bubbling
	 */
	var overtime = 0;

	/** 
	 * Reset dwell time
     * @returns {EAM.Duration} Total before reset.
     */		
	this.reset = function(){ 
		var total = this.total();
		timer.reset();
		overtime = 0;
		return total;
	};

	/** 
	 * Add additional time.
     * @param [EAM.Duration] duration Seconds to add.
     */	
	this.overtime = function(duration){ overtime += duration; };

	/** 
	 * Get total activity duration.
     * @returns {EAM.Duration} Duration in seconds.
     */	
	this.total = function(){ return timer.total() + overtime; };

	/** Notify about activity. */	
	this.startOrProlong = function(){ timer.flush(true); }

	/** Notify about end of last activity if any. */
	this.pause = function(){ timer.flush(false); };
}

module.exports = Dwell;
},{}],4:[function(require,module,exports){
 /** @namespace EAM **/

 /**
 * Engagement Analytics Model
 * @class
 * @memberof EAM
 * @param {EAM.Options} options Global configuration.
 * @todo describe structure of EAM.Eam.Options
 * @todo provide examples for public methods
 * @todo write more tests
 */
function EAM(options){

	var eam = this;

	/** @param {Boolean} available Indicates if EAM has everything to work. Value can be changed to False by any module that works with it. */
	eam.available = true;

	/** Makes EAM unavailable **/
	this.stop = function (){ 
		eam.available = false; 
		eam.create  = eam.doNothing;
		eam.listen  = eam.doNothing;
		eam.timeout = eam.doNothing;
	};

	/** Creates an instance of any EAM-module
	 * @param {Class}       Class to create.
	 * @param {Object}      Custom Param to pass
	 * @param {EAM.Options} Custom Options to pass
     * @returns {Object} Object Instance.
     */	
	this.create = function (Module, paramAndOptions){ 
		return (arguments.length == 2)
					? new Module(eam, arguments[1])
					: new Module(eam, arguments[1], arguments[2] );
	};

	this.get = function (getter, param){ 
		return getter.apply(eam, [getter, param]);
	};

 	/** @const {EAM.Options} options*/
	eam.options = options;

	/** @const {Window} global */
	eam.global = options.global;

	/** @const {Document} context */	
	eam.context = options.context;

	/** @const {Undefined} none */	
	eam.none = options.none;

	/**
	* @typedef {Object} Model POJO object that describes some buisness object or its part.
	* @property {String}   type     Only "event" is currently allowed.
 	* @property {String}   category Typically the object that model describes (e.g. element, page).
 	* @property {String}   action   The type of interaction which produced this model (e.g. click).
 	* @property {Object[]} data     Flat dictionary data describing original object.
	* @memberof EAM
	*/

	/** 
	 * List of all Models which are ready to be reported.
     * @property {EAM.Model[]} events
     */	
	eam.events = [];

	/** 
	 * Utility object that determines which helper to load.
     * @property {EAM.Helper} helper
     * @private
     */	
	var helper = eam.create(eam.Helper, options.helper);

	/** 
	 * Provides a subset of jQuery API needed for work.
     * @property {EAM.Helper} $
     */
	eam.$      = helper.$;

	/**
	* @typedef {Number} Time Time in miliseconds.
	* @memberof EAM
	*/

	/**
	* @typedef {Number} Duration Time in seconds.
	* @memberof EAM
	*/

	/** Get normalized Url.
	 * @param {String}    Url to format.
     * @returns {EAM.Url} Url address.
     */	
	this.url = function(url){
		if(!url) return;
		var suppressedProtocols = url.match(/^(javascript|data):/i);
		if(suppressedProtocols) return suppressedProtocols.pop();
		// @todo normalize & skip current, etc.
		return url;
	};

	/** Get current time.
     * @returns {EAM.Time} Time in seconds.
     */	
	this.time = function(){
		var now = new Date();
		return now.getTime();
	};

	/** Creates timer to call a function.
     * @returns {Handler} ID.
     */	
	this.timeout = function(fn, delay){
	
		if(arguments.length==1) return fn();

		var timeoutHandler;

		timeoutHandler = function(){
			timeoutHandler.stop();
			if(timeoutHandler.fn) timeoutHandler.fn();
			timeoutHandler.fn = eam.none;
		};

		timeoutHandler.stop = function(){
			if(timeoutHandler.id) eam.global['clearTimeout'](timeoutHandler.id);
			timeoutHandler.id = eam.none;
		};

		timeoutHandler.fn = fn;
		timeoutHandler.id = eam.global['setTimeout'](timeoutHandler, delay);

		return timeoutHandler;
	};

	/** Console log. */	
	eam.log = function(){};

	/**
	* @typedef {String} Values Comma-separated list of strings without quotations.
	* @memberof EAM
	*/

	/** 
	 * Get value if a given key was faund in a list.
	 * @param {Object}     result Value to return.
	 * @param {String}     key    What to find.
	 * @param {EAM.Values} values Where to search.
     * @returns {?Object}         Result when given key was found.
     */	
	this.getWhenAny = function(result, key, values){
		var items = values.split(',');
		for(var i=items.length;i--;){
			if(items[i] == key) return result;
		}
	};

	/** 
	 * Register event listeners.
	 * @param {(Document|Window|Node)} context   Object to attach.
	 * @param {EAM.Values}             events    One or more events for listening.
	 * @param {Function[]}             listeners Array of event listeners.
     */	
	this.listen = function(context, events, listeners){

		var $context = eam.$(context),
			names = events.split(',');

		for(var i=0; i<names.length; i++){

			function notifyListeners(event){
				var index = listeners.length;
				while(index>0){
					var listener = listeners[--index];
					listener(event);
				};
			};

			$context.bind(names[i], notifyListeners);	
		}
	};

}

module.exports = EAM;
},{}],5:[function(require,module,exports){
 /**
 * Element
 * @private
 * @class
 * @memberof EAM.Element
 * @param {EAM.Eam} eam
 * @param {EAM.Node} node
 * @param {EAM.Element.Options} options Initial configuration.
 */
function ElementSelector(eam, node){

	/** 
	* Get CSS selector path
	* @returns {String} 
	*/
    this.path = function () { return selector(false); };

	/** 
	* Get CSS selector
	* @returns {String} 
	* @todo should we use? if( node.disabled == true ) selector +=':disabled';
	* @todo should we use? if( $(node).css('opacity') != 1) selector +=':opacity';
	*/
	this.tag = function () { return selector(true); };

	/**
     * Get CSS Path
     * @private
     * @param last Node
     * @returns {String}
     * @todo rewrite
     */
	function selector(last) {
	    var $node = eam.$(node), path;
	    while ($node.length) {
	        var realNode = $node[0];
	        if (realNode == eam.context) break;

	        var isIdentified = false;
	        var name = realNode.localName || realNode.tagName;
	        if (!name) break;
	        name = name.toLowerCase();
	        if (name=='input' && realNode.type) {
	        	name += '[type="'+realNode.type+'"]';
	        }
	        if (realNode.id) {
	            name += '#' + realNode.id;
	            isIdentified = true;
	        } 
	        if ( (!last || !isIdentified) && realNode.name) {
	            name += '[name="'+realNode.name+'"]';
	            isIdentified = true;
	        }
	        var classes=realNode.className.replace(/\s+/g,'.');
	        if ( (!last || !isIdentified) && classes) {
	        	name += '.' + classes;
	        }
	        if(last) return name;
	        var $parent = $node.parent(), $siblings = $parent.children(name);
	        if ($siblings.length > 1) name += ':eq(' + $siblings.index($node) + ')';
	        path = name + (path ? '>' + path : '');
	        $node = $parent;
	    }
	    if(!path) return '(unknown)';
	    return path;
	}
}

module.exports = ElementSelector;
},{}],6:[function(require,module,exports){
 /** @namespace EAM.Element **/

 /**
 * @typedef {Object} Options
 * @memberof EAM.Element
 */

 /**
 * Element
 * @class
 * @memberof EAM.Element
 * @param {EAM.EAM} eam
 * @param {EAM.Node} node
 * @param {EAM.Element.Options} options Initial configuration.
 */
function Element(eam, node, options){

	/**
	* @typedef {Object} Model
	* @memberof EAM.Element.Element
	* @property {EAM.Element.ElementSelector} selector
	*/

	/** @type {EAM.Element.ElementSelector} */
    var selector = eam.create(eam.ElementSelector, node, options);

	 /**
	  *
	  * @param getter
	  * @param isCached
	  * @param filter
	  * @returns {Function}
	  */
	function customized(getter, isCached, filter){
		var cachedValue = getter();
		return function(){
			if(!isCached || !cachedValue) cachedValue = getter();
			return filter ? filter.call(this, cachedValue) : cachedValue;
		};
	}
	/** 
	* Node
	*/
	this.node = node;

	/** 
	* Get CSS selector of single element without including parent elements.
	* @returns {String} 
	*/
	this.selector = customized(function(){ return selector.tag(); }, true);

	/** 
	* Get CSS selector path including parent elements.
	* @returns {String} 
	*/
    this.path = customized(function() { return selector.path(); }, true);

	/** 
	* Get Element ID Attribute
	* @returns {String} 
	*/
	this.id = function(){ return node.id; };



	/**
	* @todo document as enum
	* @typedef {Object} Role
	* @memberof EAM.Element
	* @property {String} anchor
	* @property {String} image
	* @property {String} heading
	* @property {String} button
	* @property {String} field
	* @property {String} text
	*/

	/** 
	* Get Element Role
	* @returns {EAM.Element.Role}
	*/
	this.role = role;	

	/** 
	* Get Element Tag name. It also includes Type attribute for INPUT elements.
	* @returns {String}
	*/
	this.tag = tag;


	 /**
	 * Get closest node by a given criteria.
	 * @memberof EAM.Element
	 * @param {String}       attr    Attribute to test.
	 * @param {EAM.Values}   values  Values to search.
	 * @returns {EAM.Element|EAM.none} Node or its closest parent that match given criteria.
	 */
	this.closest = function(attr, values){
		var tested = node;
		while(tested && tested != eam.context){
			var elm = eam.create(eam.Element, tested, options);
			var attrGetter = elm[attr];
			var attrValueMatched = eam.getWhenAny(true, attrGetter(), values);
			if(attrValueMatched) {
				return elm;
			}
			tested = tested.parentNode;
		}
	};

	/** 
	* Get linked Url for Anchor elements
	* @returns {(EAM.Url)}
	*/
	this.anchor = function(){
		var link = eam.getWhenAny(node.href, role(), 'anchor');
		return eam.url(link);
	};

	/** 
	* Get source Url for Image Elements
	* @returns {(EAM.Url)}
	*/
	this.image = function(){
		var source = eam.getWhenAny(node.src, tag(), 'img,input:image');
		return eam.url(source);
	};

	/** 
	* Get current value for Field elements
	* @returns {String}
	*/
	this.value = customized(function(){
		// @todo textarea, select, etc.
		var nodeTag = tag();
		return eam.getWhenAny(content() , nodeTag, 'textarea')
			|| eam.getWhenAny(checked() , nodeTag, 'input:checkbox')
			|| eam.getWhenAny(node.value, nodeTag, 'input:password') && '*****'
			|| eam.getWhenAny(node.value, role() , 'field');
	}, false, options.shortValue);

	/** 
	* Get Element text
	* @returns {String}
	*/
	this.text = function(){
		var nodeTag = tag();
		return content()
			|| eam.getWhenAny(node.title || node.alt, nodeTag, 'a,img,input:image')
			|| eam.getWhenAny(node.value, nodeTag, 'input:button,input:submit,input:reset');
	};

	/** 
	* Get Element Role	
	* @returns {EAM.Element.Role}
	*/
	function role(){
		var nodeTagName = tagName();
		var nodeTag     = tag();
		var nodeRole = (nested() == 'no') ? eam.getWhenAny( 'text', nodeTagName, 'div,li,oi,di,dd,dt') : eam.none;
		return nodeRole
			|| eam.getWhenAny( 'anchor' , nodeTag    , 'a')
			|| eam.getWhenAny( 'image'  , nodeTag    , 'img,input:image')
			|| eam.getWhenAny( 'button' , nodeTag    , 'button,input:button,input:image,input:reset,input:submit')
			|| eam.getWhenAny( 'heading', nodeTagName, 'h1,h2,h3,h4,h5,h6')
			|| eam.getWhenAny( 'field'  , nodeTagName, 'input,textarea,select')
			|| eam.getWhenAny( 'text'   , nodeTagName, 'span,p,b,i,u,strong,em,addr');
	}

	/** 
	* Get nested content for Element
	* @private
	* @returns {String}
	*/
	function content(){
		var nodeTag  = tag();
		var nodeRole = role();
		var allowed = false
			     || eam.getWhenAny(true, nodeRole, 'text,anchor,field,button,image,heading') 
			     || eam.getWhenAny(true, nodeTag, 'label');
		var nodeContent = allowed ? node.innerText.replace(/[\s\t\r\n]+/ig,' ') : '';
		if(nodeContent != '' && nodeContent != ' ') return nodeContent;
	}

	/**
	* @todo documment as enum
	* @typedef {Object} Checked
	* @memberof EAM.Element
	* @property {String} checked
	* @property {String} unchecked
	*/

	/** 
	* Get string value of checked attribute for Checkbox Fields
	* @private
	* @returns {EAM.Element.Checked}
	*/
	function checked(){
		if(node.checked != eam.none) return node.checked ? 'checked' : 'unchecked';
	}

	/** 
	* Indicates if Element is used as container for other Elements.
	* @private
	* @returns {String}
	*/
	function nested(){
		return (!node.children || node.children.length == 0) ? 'no' : 'yes';
	}

	/** 
	* Get Element Tag name. It also includes Type attribute for INPUT elements.
	* @private
	* @returns {String}
	*/
	function tag(){
		var nodeTagName = tagName();
		var nodeTagType = tagType() || 'text';
		return (nodeTagName == 'input') ? (nodeTagName + ':' + nodeTagType) : nodeTagName;
	}

	/** 
	* Get Tag Name for Element
	* @private
	* @returns {String}
	*/
	function tagName(){
		var nodeName = node.localName || node.tagName;
		return nodeName && nodeName.toLowerCase();
	}

	/** 
	* Get value of Type attribute for Element
	* @private
	* @returns {String}
	*/
	function tagType(){
		return node.type && node.type.toLowerCase();
	}
}

module.exports = Element;
},{}],7:[function(require,module,exports){
 /**
 * Provides jQuery API needed for work.
 * @function HelperJQuery
 * @memberof EAM.Helper
 * @returns {(EAM.Helper.HelperNode[])} List of matched Nodes with extra methods.
 */

 /**
 * Get Helper based on jQuery.
 * @function LookupHelperJQuery
 * @memberof EAM.Helper
 * @param {EAM.Eam} eam Parent EAM instance. 
 * @returns {HelperJQuery} available jQuery instance from global context.
 */
module.exports = function(eam) { return eam.global['jQuery']; };
},{}],8:[function(require,module,exports){
 /**
 * Provides a subset of jQuery API needed for work.
 * @function HelperSatellite
 * @memberof EAM.Helper
 * @returns {(EAM.Helper.HelperNode[])} List of matched Nodes with extra methods.
 */
function HelperSatellite(eam, satellite, $, arg){

	/** 
	 * Matched nodes
	 * @property {EAM.Helper.HelperNode[]}
	 */
	var nodes = [];

	/** 
	 * First matched node
	 * @property {EAM.Helper.HelperNode}
	 */
	var node;


	/** 
	 * Parses passed arguments and populates nodes.
     * @private	
	 */
	function lookupNodes(){
		if( typeof(arg) == 'string') {
		var selector = arg;
		satellite.cssQuery(selector, function(matched) {
			nodes = matched;
		});
		} else if(Array.isArray(arg) == true){
			nodes = arg;
		} else if(arg == eam.global || arg == eam.context || arg && arg.parentNode){
			nodes = [arg];
		} else {
			nodes = [];
		}
		node = nodes[0];
	}

	/** 
	 * Extends list of nodes with extra functionality.
     * @private	
	 */
	function extendNodes(){
		if(!nodes) return;
		$.extend(nodes, {
			'bind'     : bind,
			'parent'   : parent,
			'children' : children,
			'index'	   : index,
			'css'      : css
		});
	}


	/** 
	 * Attach a handler to an event for the {@link Document} or {@link Window}.
	 * @param {String} event
	 * @param {Function} handler
	 * @memberof EAM.Helper.HelperNode
	 * @inner
	 */
	function bind(event, handler){
		satellite.addEventHandler(node, event, handler);
	}

	/** 
	 * Get the parent of each element in the current set of matched elements.
	 * @memberof EAM.Helper.HelperNode
	 * @returns {EAM.Helper.HelperNode}
	 */
	function parent(){
		return $(node.parentNode);
	}

	/** 
	 * Get the children of each element in the set of matched elements filtered by a selector.
	 * @memberof EAM.Helper.HelperNode
	 * @param {String} selector
	 * @returns {EAM.Helper.HelperNode[]}	 
	 */
	function children(selector){
		var childs = node && node.children || [],
			matched = [];
		for (var i = 0; i < childs.length; i++) {
		    if (satellite.matchesCss(selector, childs[i]) == true) {
			    matched.push(childs[i]);
			}
		}
		return $(matched);
	}

	/** 
	 * Search for a given element from among the matched elements.
	 * @memberof EAM.Helper.HelperNode
	 * @param {EAM.Helper.HelperNode[]} nodes
	 * @returns {(Number|EAM.None)}
	 */
	function index($node){
		for(var i=0; i<nodes.length; i++){
			if(nodes[i]==$node[0]) return i;
		}
	}

	/** 
	 * Get the value of a computed style property for the first element in the set of matched elements.
	 * @memberof EAM.Helper.HelperNode
	 * @todo implement
	 */
	function css(){ /*...*/ }


	lookupNodes();
	extendNodes();

	return nodes;
}

 /**
 * Get Helper based on Satellite.
 * @function LookupHelperSatellite
 * @memberof EAM.Helper
 * @param {EAM.Eam} eam Parent EAM instance. 
 * @returns {HelperSatellite} Subset of jQuery API implemented using Satellite framework from DTM.
 */
module.exports = function(eam) { 

	var satellite = eam.global['_satellite'];

	function proxy(args){
		return HelperSatellite(eam, satellite, proxy, args); 
	}

	/** 
	 * Search for a given element from among the matched elements.
	 * @memberof EAM.Helper.HelperSatellite
	 * @param {Object} target Object to extend.
	 * @param {Object} source Object to apply.
	 * @returns {Object} Target extended with source object.
	 */
	proxy.extend = function (target, source){
		satellite.extend(target, source);
		return target;
	};

	return proxy;
};



},{}],9:[function(require,module,exports){
 /** @namespace EAM.Helper **/

 /**
 * @typedef {Object} Options
 * @memberof EAM.Helper
 * @property {EAM.Helper[]} priority Ordered list of allowed helper implementations to load.
 */

/**
 * @class HelperNode
 * @memberof EAM.Helper
 * @private 
 */
 
 /**
 * Element
 * @class
 * @memberof EAM.Helper
 * @param {EAM.Eam} eam Parent EAM instance.
 * @param {EAM.Helper.Options} options Initial configuration.
 */
function Helper(eam, options){

 	/**
     * Get first working helper if any
     * @private 
     * @property {EAM.Values} priority Ordered list of helpers to try.
     */
	function lookupHelper(priority){
		for(var i=0; i< priority.length; i++){
			var helperClass = priority[i];
			var helper = helperClass(eam);
			// check if helper works. e.g. jQuery(window)[0] == window
			if(helper && helper(eam.global)[0] == eam.global){
				return helper;
			}
		}
	}

 	/**
     * Provides a subset of jQuery API needed for work.
     * @property {EAM.Helper} $
     */
	this.$ = lookupHelper(options.priority) || eam.stop();

	
}

module.exports = Helper;
},{}],10:[function(require,module,exports){
/** @namespace EAM.Interaction **/

/**
 * @typedef {Object} Options
 * @memberof EAM.Interaction
 */

/**
 * EAM Interaction.
 * @class
 * @memberof EAM.Interaction
 * @param {EAM.Eam} eam
 * @param {EAM.Interaction.Options} options Initial configuration.
 */
function Interaction(eam, options) {

    /** @const {EAM.Time} EVENT_FIXATION_TIME */
    var EVENT_FIXATION_TIME = options.fixation * 1000;

    var last = eam.none;
    var current = eam.none;

    this.current = function () {
        return current;
    };

//same as i19n for internationalization or l10n for localization – that's a shortening for "interaction" - "i" + 9 letters + "n".

    /**
     * @typedef {Object} Model Complex object that describes interaction.
     * @property {EAM.Time}             started    Time when interaction was started or eam.none for interactions in event fixation mode.
     * @property {EAM.Time}             created    Time when 1st event for this interaction was created.
     * @property {EAM.Dwell}            dwell      Dwell time for current element interaction.
     * @property {EAM.Element.Element}  initiator  Target Element from 1st event for this interaction.
     * @property {EAM.Element.Element}  receiver   Closest Element that can receive focus, is actionable or has busness value.
     * @memberof EAM.Interaction
     */

    /**
     * Creates a new Interaction Model for a given event.
     * @param {Node}     node           Target Node for event
     * @param {EAM.Time} eventCreated   Time when event was created.
     * @param {Boolean}  isFixationMode Flag that indicates if interaction should be started in fixation mode.
     * @returns {EAM.Interaction.Model} New interaction
     */
    function start(node, eventCreated, isFixationMode) {

        var element = eam.create(eam.Element, node, options.element);

        var interaction = {
            started: isFixationMode ? eam.none : eventCreated,
            created: eventCreated,
            dwell: eam.create(eam.Dwell, options.element.dwell),
            initiator: element,
            receiver: element.closest('role', 'anchor,button,field,heading') || element
        };

        return interaction;
    }

    /**
     * Prepares Interaction Model for reporting and initiates reporting process.
     * @param {EAM.Interaction.Model}   i9n Interaction to complete
     */
    function complete(i9n) {
        i9n.dwell.pause();
        if (last && i9n.initiator.node == last.initiator.node) {
            last.dwell.overtime(i9n.dwell.total());
        } else {
            reportLast();
            last = i9n;
            eam.timeout(reportLast, EVENT_FIXATION_TIME);
        }
    }

    /**
     * Reports last completed interaction
     * @param {EAM.Interaction.Model}   i9n Interaction to complete
     */
    function reportLast() {
        if (last == eam.none) return;
        //console.log('event reported', last.initiator.tag()+'/'+ last.receiver.tag() );
        eam.events.push({
            type: 'event',
            category: 'element',
            action: 'interaction',
            data: last
        });
        last = eam.none;
    }

    /**
     * Swaps Elements for two interactions and completes first of them.
     * Used for resolving event bubbling issue when events are received in wrong order (older events with lower event.simeStamp received after more recent events).
     * @param {EAM.Interaction.Model}   prematureInteraction Interation for event which was received earlier than should.
     * @param {EAM.Interaction.Model}   bubbledInteraction   Interation for delayed event which was received later than should.
     */
    function swapAndComplete(prematureInteraction, bubbledInteraction) {

        var prematureElements = {
            initiator: prematureInteraction.initiator,
            receiver: prematureInteraction.receiver
        };
        var bubbledElements = {
            initiator: bubbledInteraction.initiator,
            receiver: bubbledInteraction.receiver
        };

        eam.$.extend(prematureInteraction, bubbledElements);
        eam.$.extend(bubbledInteraction, prematureElements);
        complete(prematureInteraction);


        return bubbledInteraction;
    }

    /**
     * Decides if Event indicates current or new Interaction that should be created.
     * Used for resolving event bubbling issue when events are received in wrong order (older events with lower event.simeStamp received after more recent events).
     * @param {EAM.Interaction.Model}  i9n            Interaction to update
     * @param {Node}                   node           Target Node for event
     * @param {EAM.Time}               eventCreated   Time when event was created.
     * @param {DOMEvent}               event          Event.
     * @returns {EAM.Interaction.Model} Current interaction
     */
    function update(i9n, node, eventCreated, event) {
        var current = i9n;
        var isNewEvent = (eventCreated - current.created) > EVENT_FIXATION_TIME;
        var isBubbledEvent = eventCreated < current.created;
        var isCurrent = (node == current.initiator.node || node == current.receiver.node);
        var isLast = last && (node == last.initiator.node || node == last.receiver.node);

        //var action = 'none';

        if (!isCurrent) {
            if (isNewEvent) {
                complete(current);
                current = start(node, eventCreated);
                //action = 'started/compl/start';
            } else if (isBubbledEvent) {
                var bubbledInteraction = start(node, eventCreated);
                current = swapAndComplete(current, bubbledInteraction);
                //action = 'swap';
            } else {
                if (current.started) {
                    complete(current);
                    current = start(node, eventCreated, true);
                    //action = 'fixation/compl/start';
                } else if (!isLast) {
                    //action = 'update/rec';
                    var element = eam.create(eam.Element, node, options.element);
                    current.receiver = element.closest('role', 'anchor,button,field,heading') || element;
                    current.started = eventCreated;
                }
            }
        }
        /*
         console.log(
         'event', event.type+'/'+node.tagName,
         'action', action,
         'delay', eventCreated - current.created,
         'new', isNewEvent,
         'bubbled', isBubbledEvent,
         'current', isCurrent,
         'last', isLast);
         */
        return current;
    }


    /**
     * Register listeners by a given options.
     * @private
     * @param {EAM.Options.Listen} listenOptions Events to listen.
     * @param {Function}           handler       Event handler.
     */
    function listen(listenOptions, handler) {
        eam.listen(eam.global, listenOptions.global, [handler]);
        eam.listen(eam.context, listenOptions.context, [handler]);
    }


    listen(
        options.element.dwell.listen,
        function (event) {
            if (current == eam.none) return;
            var isGlobal = (event.target == eam.global);
            var isDeactivation = (event.type == 'blur');
            return (isGlobal && isDeactivation)
                ? current.dwell.pause()
                : current.dwell.startOrProlong();
        });

    listen(
        options.listen,
        function (event) {
            var target = event.target;
            if (target == eam.global) {
                if (current && event.type == 'unload') {
                    current = complete(current);
                    reportLast();
                }
            } else if (target != eam.none && target != eam.context) {
                var timeStamp = event.timeStamp || eam.time();
                current = (current == eam.none)
                    ? start(target, timeStamp)
                    : update(current, target, timeStamp, event);
            }
        });


}

module.exports = Interaction;
},{}],11:[function(require,module,exports){
function Tracker(eam){

	function historyHandler(model){
		
		var element = model;

		function attr(name, backward, defaults, stringify){
			
			if(arguments.length < 3) return attr(name, backward, '(not set)', true);
			if(element == eam.none) return defaults;

			var initiator = element.initiator,
				receiver  = element.receiver,
				elements  = backward == true ? [initiator,receiver] : [receiver, initiator],
				value = elements[0][name]();

			if(value == eam.none) value = elements[1][name]();
			if(value == eam.none) value = defaults;	

			return stringify == false ? value : value.toString();
		};

		if(element == eam.none || attr('role', false, eam.none, false) == eam.none) return;

		var payload = {
			useBeacon       : true,
			eventCategory	: 'element',
			eventAction		: 'interaction',
			eventLabel		: 'unknown',
			dimension41		: 'eam=0.0.4;',
			dimension42  	: attr('selector'),
			dimension43     : attr('path', true),
			dimension44     : attr('role'),
			dimension45     : attr('text', 500), 
			dimension46     : attr('value'),
			dimension47     : attr('image', true),
			dimension48     : attr('anchor'),
			metric16     	: model.dwell.total()
		};
		
		return payload;
	};

	eam.hit = historyHandler;

	eam.events.push = function(model){
		var hit = eam.hit(model.data);
		var ga = eam.global['ga'];
		if(hit) ga('send', 'event', hit);
		return [].push.call(eam.events, model);
	}

}

module.exports = Tracker;
},{}]},{},[1])