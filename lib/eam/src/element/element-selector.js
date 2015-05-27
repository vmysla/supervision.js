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