
describe("EAM", function() {

	var EAM = require('../../../index.js');

	it("should provide public interface", function() {
		// @todo write tests for EAM core
		expect(EAM).toBeDefined();
	});


	it("should have minimal required set options to work", function() {

		var opt = EAM.options;

		expect(opt).toBeDefined('options');

		expect(opt.global).toBeDefined('options.global');
		expect(opt.context).toBeDefined('options.context');
		expect(opt.none).toBeUndefined('options.none');
		expect(opt.nan).toBeDefined('options.nan');
		expect(opt.doNothing).toBeDefined('options.doNothing');

		expect(opt.helper).toBeDefined('options.helper');
		expect(opt.helper.priority).toBeDefined('options.helper.priority');
		for(var i=opt.helper.priority.length;i--;){
			expect( opt.helper.priority[i] ).toBeDefined('options.helper.priority['+i+']');
		}

		expect(opt.interaction).toBeDefined('options.interaction');
		expect(opt.interaction.fixation).toBeDefined('options.interaction.fixation');

		expect(opt.interaction.listen).toBeDefined('options.interaction.listen');
		expect(opt.interaction.listen.global).toBeDefined('options.interaction.listen.global');
		expect(opt.interaction.listen.context).toBeDefined('options.interaction.listen.context');

		expect(opt.interaction.element).toBeDefined('options.interaction.element');
		expect(opt.interaction.element.dwell).toBeDefined('options.interaction.element.dwell');
		expect(opt.interaction.element.dwell.autostart).toBeDefined('options.interaction.element.dwell.autostart');
		expect(opt.interaction.element.dwell.latency).toBeDefined('options.interaction.element.dwell.latency');
		expect(opt.interaction.element.dwell.listen.global).toBeDefined('options.interaction.element.dwell.listen.global');
		expect(opt.interaction.element.dwell.listen.context).toBeDefined('options.interaction.element.dwell.listen.context');
	});

	it("should work", function() {
		// @todo write tests for EAM core
		expect(true).toBe(true);
	});
	
});