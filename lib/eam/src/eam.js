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