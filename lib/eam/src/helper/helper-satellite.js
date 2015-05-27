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


