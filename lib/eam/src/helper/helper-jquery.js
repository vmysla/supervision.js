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