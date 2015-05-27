describe("EAM.Dwell", function() {

	var helper = require('./helper/dwell-helper.js');

	/*

	Timeline execution rules:
	 1. All events are processed a given order with LR direction (Left -> Right)
	 2. Each characted identifies change that should be simulated:
	 		"+" - Interaction event received
	 		"-" - Page lost focus in Browser
	 		"." - No new events
	 3. Function returns total dwell time for a given sequence of events.

	*/

	it("should increment dwell time while page is active", function() {

		var options = { autostart : false, latency : 0 };

		helper.expect_dwell_time(options, '..........').toEqual(0, 'no interactions #1');
		helper.expect_dwell_time(options, '-.........').toEqual(0, 'no interactions #2');
		helper.expect_dwell_time(options, '+-........').toEqual(1, 'one interaction');
		helper.expect_dwell_time(options, '+-+-......').toEqual(2, 'two interactions with following page deactivation event');
		helper.expect_dwell_time(options, '+..++++-..').toEqual(5, 'pause when no latency #1');
		helper.expect_dwell_time(options, '+.+++++-..').toEqual(6, 'pause when no latency #2');
		helper.expect_dwell_time(options, '+++++++-..').toEqual(7, 'sequence of interactions');

	});


	it("should take into account time for reading the page", function() {
		var options = { autostart : false, latency : 5 };
		helper.expect_dwell_time(options, '+-...+-...').toEqual(2, 'reset delay after any event received #1');
		helper.expect_dwell_time(options, '++.....-..').toEqual(7, 'continue when delay <= latency');
		helper.expect_dwell_time(options, '++......-.').toEqual(7, 'pause when delay > latency #1');
		helper.expect_dwell_time(options, '++....+.-.').toEqual(8, 'reset delay after any event received #2');
		helper.expect_dwell_time(options, '++.....+-.').toEqual(8, 'pause when delay > latency #2');
	});
	
});