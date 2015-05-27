
describe("EAM.Element", function() {

	var none;
	var helper = require('./helper/element-helper.js');


	it("should support links", function() {

		helper.expect_element('a[href=/login]:contains("content")')
		.toEqual({ 
			role     : 'anchor', 
			text     : 'content', 
			image    : (none), 
			anchor   : '/login', 
			value    : (none), 
			selector : 'a', 
			path     : 'a' 
		}, 'tag link');

		helper.expect_element('a[href=javascript:alert(1)]:contains("content")')
		.toEqual({ 
			role     : 'anchor', 
			text     : 'content', 
			image    : (none), 
			anchor   : 'javascript', 
			value    : (none), 
			selector : 'a', 
			path     : 'a' 
		}, 'tag link with javascript instead of url');

	});

	it("should support buttons", function() {

		helper.expect_element('input[type=button,value=title]')
		.toEqual({ 
			role     : 'button', 
			text     : 'title', 
			image    : (none),
			anchor   : (none),
			value    : (none),
			selector : 'input[type="button"]', 
			path     : 'input[type="button"]' 
		},'tag input');


		helper.expect_element('button:contains("title")')
		.toEqual({ 
			role     : 'button', 
			text     : 'title', 
			image    : (none), 
			anchor   : (none),
			value    : (none), 
			selector : 'button', 
			path     : 'button' 
		}, 'tag button');

	});

	it("should support images", function() {

		helper.expect_element('img[src=logo.png,alt=logo,title=company]')
		.toEqual({ 
			role     : 'image', 
			text     : 'company', 
			image    : 'logo.png', 
			anchor   : (none), 
			value    : (none), 
			selector : 'img', 
			path     : 'img' 
		}, 'tag image with title');

		helper.expect_element('img[src=logo.png,alt=logo]')
		.toEqual({ 
			role     : 'image', 
			text     : 'logo', 
			image    : 'logo.png', 
			anchor   : (none), 
			value    : (none), 
			selector : 'img', 
			path     : 'img' 
		}, 'tag image w/o title');

		helper.expect_element('img[src=data:image/png;base64`iVBORw0KGgoAAAANSUhEUgAAAcgAA]')
		.toEqual({ 
			role     : 'image', 
			text     : (none), 
			image    : 'data', 
			anchor   : (none), 
			value    : (none), 
			selector : 'img', 
			path     : 'img' 
		}, 'tag image with embedded data');

	});


	it("should support headings", function() {
		helper.expect_element('h1:contains("title")')
		.toEqual({ 
			role     : 'heading', 
			text     : 'title', 
			image    : (none), 
			anchor   : (none),
			value    : (none), 
			selector : 'h1', 
			path     : 'h1' 
		}, 'tag h1');
	});

	it("should support text", function() {
		// div w/o childs
		helper.expect_element('span:contains("text")')
		.toEqual({ 
			role     : 'text', 
			text     : 'text', 
			image    : (none), 
			anchor   : (none),
			value    : (none), 
			selector : 'span', 
			path     : 'span' 
		}, 'tag span');

		helper.expect_element('p:contains("text")')
		.toEqual({ 
			role     : 'text', 
			text     : 'text', 
			image    : (none), 
			anchor   : (none),
			value    : (none), 
			selector : 'p', 
			path     : 'p' 
		}, 'tag p');

		helper.expect_element('div:contains("text")')
		.toEqual({ 
			role     : 'text', 
			text     : 'text', 
			image    : (none), 
			anchor   : (none),
			value    : (none), 
			selector : 'div', 
			path     : 'div' 
		}, 'tag div w/o childs');

		helper.expect_element('div:contains("text") > div.nested')
		.toEqual({ 
			role     : (none),
			text     : (none),
			image    : (none), 
			anchor   : (none),
			value    : (none), 
			selector : 'div', 
			path     : 'div' 
		}, 'tag div w/ childs');

	});


	it("should support fields", function() {
		// @todo write tests for input:text/password/ckeckbox, textarea, select
		expect(true).toBe(true);
	});

});