
var EAM = require('../../../../index.js');
var DOM = require('../../../selected-dom/selected-dom.js');
var eam = new EAM(EAM.options);

function expect_element(selector){
	try{


		var dom = new DOM(selector);
		var elm = eam.create(eam.Element, dom.node, {});
		var model = {
			role     : elm.role(),
			text     : elm.text(),
			image    : elm.image(),
			anchor   : elm.anchor(),
			value    : elm.value(),
			selector : elm.selector(),
			path     : elm.path()
		}
		return expect(model);
	}
	catch(e){
		console.log(e.message);
		throw new Error(e.message);

	}
}

module.exports = {
	expect_element : expect_element
};
