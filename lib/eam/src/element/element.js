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