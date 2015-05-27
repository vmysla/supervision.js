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