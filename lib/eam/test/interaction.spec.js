
// @todo: record a video a tutorial.

describe("EAM.Interaction", function() {


	var helper = require('./helper/interaction-helper.js');

	/*

	Timeline execution rules:
	 1. All lines are processed in a given order with TB direction (Top -> Bottom)
	 2. All actions for a line are processed a given order with LR direction (Left -> Right)
	 3. Space character is used to split seconds.
	 4. Comma character is used to split seconds in two parts: [0,500ms) and [500ms,1s].
	 5. 1st row - Line for usecase ids to describe what happens (and list of numbers with expected interactions to be reported).
	 6. 2nd row - Line for global browser or page events.
	 7. 3rd row and below - Lines for element Events (and list of expected roles of a given element in reported interaction).

	Timeline examples:

        [ Usecase, '--,-- --,--', '-1' ],
        [ Global , '--,-- --,--', '--' ],
		[ First  , 'aa,cc ee,gg', '-b' ],
		[ Second , 'bb,dd ff,hh', '--' ],

		00:00:000 aa(First)   - simulate event "aa" for element "First"
		00:00:100 bb(Second)  - simulate event "bb" for element "Second"
		00:00:500 cc(First)   - ...
		00:00:600 dd(Second)
		00:01:000 ee(First) and expect reported interaction #1 with "First" element 
		00:01:100 ff(Second)
		00:01:500 gg(First)
		00:01:600 hh(Second)

		[ Usecase, '--,-- --,-- --,--', '-12' ],
		[ First  , 'aa,dd gg,-- --,--', '--i' ],
		[ Second , 'bb,ee --,hh --,--', '-i-' ],
		[ Third  , 'cc,ff --,-- --,--', '-rr' ],

		00:00:000 aa(First)
		00:00:100 bb(Second)
		00:00:200 cc(Third)
		00:00:500 dd(First)
		00:00:600 ee(Second)
		00:00:700 ff(Third)
		00:01:000 gg(First) and expect reported interaction #1 with "Third" element which was initiated by "Second" element
		00:01:100 --
		00:01:200 --
		00:01:500 --
		00:01:600 hh(Second)
		00:01:700 --
		00:02:000 -- and expect reported interaction #2 with "Third" element which was initiated by "First" element
		00:02:100 --
		00:02:200 --  
		00:02:500 --
		00:02:600 --
		00:02:700 --

	Shortenings for Events:

			ds,ds    - drag start/stop
			cl,cr    - click left/right
			md,mu,mm - mouse down/up/move
			kd,ku,kp - key down/up/press
			fi,fo    - focus in/out
			wf,wb,wc - window focus/blur/close
			df,db    - documet focus/blur
			nf,nb    - documet focus/blur
			x0,x1,x2 - function 0/1/2

	Timing:

			--           - do nothing 0.5s
			--,--	     - do nothing 1s
			cl,--        - click on 0.0s
			--,cl        - click on 0.5s
			--,-- cl,--  - click on 1s
			i/r/b        - initiator/receiver/both
	*/

	it("should ignore non-element interaction events", function() {

		helper
		  .scenario("do not report anything when there is no events")
		  .describe('t0', 'No events.' )
		  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
		  	['usecase' , 't0,t0 t0,t0 t0,t0 t0,t0 t0,t0 t0,t0', '------' ],
			['global'  , '--,-- --,-- --,-- --,-- --,-- --,--', '------' ]
		  )
		  .simulate();

		helper
		  .scenario("do not report browser events")
		  .describe('t0', 'No events.' )
		  .describe('t1', 'Browser minimized' )
		  .describe('t2', 'Browser restored' )
		  .describe('t3', 'Browser closed' )
		  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
		  	['usecase' , 't0,t0 t1,t0 t2,t0 t1,t2 t2,t0 t3,t0', '------' ],
			['global'  , '--,-- wb,-- wf,-- wb,wf wf,-- --,wc', '------' ]
		  )
		  .simulate();

		helper
		  .scenario("do not report document events with no target element")
		  .describe('t0', 'No events.' )
		  .describe('t1', 'Event document.blur' )
		  .describe('t2', 'Event document.focus' )
		  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
		  	['usecase' , 't0,t0 t1,t0 t2,t0 t1,t2 t2,t2 t0,t0', '------' ],
			['global'  , '--,-- db,-- df,-- db,df df,df --,wc', '------' ]
		  )
		  .simulate();
	});

	it("should report element interaction events on exit", function() {

		var nodes = {
			'image': 'img[src=image.png]'
		};

		var descriptions = {
			't0' : 'No events.',
			't1' : 'Browser minimized',
		  	't2' : 'Browser restored',
		    't3' : 'Browser closed',
			't4' : 'Click on Image'
		};

		helper.scenario("report interaction for events fiered immediateley before end")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't0,t0 t0,t0 t0,t0 t0,t0 t0,t0 t4,t3', '-----1' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , '--,-- --,-- --,-- --,-- --,-- cl,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("report last interaction on end for event fiered earlier")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't0,t0 t0,t0 t4,t0 t0,t0 t0,t0 t0,t3', '-----1' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , '--,-- --,-- cl,-- --,-- --,-- --,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("report interaction on end for event fiered immediateley on start")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t0,t0 t0,t0 t0,t0 t0,t0 t0,t3', '-----1' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("report interaction on end even if there were other browser non-exit events")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t0,t0 t1,t0 t0,t0 t0,t2 t0,t3', '-----1' ],
				['global'  , '--,-- --,-- wb,-- --,-- --,wf --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("report interaction when browser is closing")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t0,t0 t0,t0 t0,t0 t3,t0 t0,t0', '----1-' ],
				['global'  , '--,-- --,-- --,-- --,-- wc,-- --,--', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '----b-' ]
			  ).simulate(nodes, descriptions);
	});

	it("should report a single element interaction events with a same target element", function() {

		var nodes = {
			'image': 'img[src=image.png]'
		};

		var descriptions = {
			't0' : 'No events.',
			't1' : 'Browser minimized',
		  	't2' : 'Browser restored',
		    't3' : 'Browser closed',
			't4' : 'Click on image',
			't5' : 'Browser activated because of click on image',
			't6' : 'Keypress event on image'
		};

		helper.scenario("same event fiered twice")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t0,t0 t0,t0 t0,t0 t0,t0 t4,t3', '-----1' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- cl,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("sequence of same events")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t4 t0,t0 t4,t0 t4,t0 t0,t4 t4,t3', '-----1' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,cl cl,cl cl,-- cl,-- --,cl cl,--', '-----b' ]
			  ).simulate(nodes, descriptions);	 

		helper.scenario("sequence of different events with a same target element")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t6 t0,t6 t6,t0 t4,t0 t0,t4 t6,t3', '-----1' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,kp cl,kp kp,-- cl,-- --,cl kp,--', '-----b' ]
			  ).simulate(nodes, descriptions);	 

		helper.scenario("sequence of events with a same target element mixed with browser events")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t4 t1,t2 t5,t2 t5,t0 t4,t2 t4,t3', '-----1' ],
				['global'  , '--,-- wb,wf wf,wb wf,-- --,wf wf,wc', '------' ],
				['image'   , 'cl,cl --,-- cl,-- cl,-- cl,-- cl,--', '-----b' ]
			  ).simulate(nodes, descriptions);
	});


	it("should report element interaction when another interaction started", function() {

		var nodes = {
			'image'  : 'img[src=image.png]',
			'button' : 'input[type=button]'
		};

		var descriptions = {
			't0' : 'No events.',
			't1' : 'Browser minimized',
		  	't2' : 'Browser restored',
		    't3' : 'Browser closed',
			't4' : 'Click on image',
			't5' : 'Click on button'
		};

		helper.scenario("two elements are clicked two times each")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t4 t0,t0 t0,t0 t0,t0 t0,t5 t5,t3', '-1---2' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,cl --,-- --,-- --,-- --,-- --,--', '-b----' ],
				['button'  , '--,-- cl,-- --,-- --,-- --,-- cl,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("two elements are clicked two times one after another")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t5,t0 t0,t0 t4,t0 t0,t5 t0,t3', '-1-234' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- cl,-- --,-- --,--', '-b--b-' ],
				['button'  , '--,-- cl,-- --,-- --,-- --,cl --,--', '---b-b' ]
			  ).simulate(nodes, descriptions);
	});



	it("should report element interaction when another interaction started", function() {

		var nodes = {
			'image'  : 'img[src=image.png]',
			'button' : 'input[type=button]'
		};

		var descriptions = {
			't0' : 'No events.',
			't1' : 'Browser minimized',
		  	't2' : 'Browser restored',
		    't3' : 'Browser closed',
			't4' : 'Click on image',
			't5' : 'Click on button',
			't6' : 'Click on button after image'
		};

		helper.scenario("two elements are clicked in 0.1s")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't6,t0 t0,t0 t0,t0 t0,t0 t0,t0 t0,t3', '-12---' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-b----' ],
				['button'  , 'cl,-- --,-- --,-- --,-- --,-- --,--', '--b---' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("two elements are clicked in 0.5s")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t5 t0,t0 t0,t0 t0,t0 t0,t0 t0,t3', '-12---' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-b----' ],
				['button'  , '--,cl --,-- --,-- --,-- --,-- --,--', '--b---' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("two elements are clicked in 1s")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t5,t0 t0,t0 t0,t0 t0,t0 t0,t3', '-12---' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-b----' ],
				['button'  , '--,-- cl,-- --,-- --,-- --,-- --,--', '--b---' ]
			  ).simulate(nodes, descriptions);
			  	  
		helper.scenario("two elements are clicked two times each")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t4 t0,t0 t0,t0 t0,t0 t0,t5 t5,t3', '-1---2' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,cl --,-- --,-- --,-- --,-- --,--', '-b----' ],
				['button'  , '--,-- cl,-- --,-- --,-- --,-- cl,--', '-----b' ]
			  ).simulate(nodes, descriptions);

		helper.scenario("two elements are clicked two times one after another")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't4,t0 t5,t0 t0,t0 t4,t0 t0,t5 t0,t3', '-1-234' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- cl,-- --,-- --,--', '-b--b-' ],
				['button'  , '--,-- cl,-- --,-- --,-- --,cl --,--', '---b-b' ]
			  ).simulate(nodes, descriptions);
	});


	it("should report interactions for nested elements", function() {

		var nodes = {
			'link'   : 'a[href=/index.html]   > img[id=image-link, src=logo.jpg]',
			'button' : 'button[class=primary] > img[id=image-button, src=primary.png]',
			'div'    : 'div[class=container] > img[id=image, src=primary.png]',
		};

		var descriptions = {
			't0' : 'No events.',
			't1' : 'Click on link',
			't2' : 'Click on button',
		    't3' : 'Browser closed',			
			't4' : 'Click on image inside link',
			't5' : 'Click on image inside button',	
			't6' : 'Click on div',
			't7' : 'Click on image inside div',	
		};


		helper.scenario("click on image inside an element")
			  .timeline(   //      0s    1s    2s    3s    4s    5s      expected    
			  	['usecase'      , 't4,t0 t5,t0 t7,t0 t3,t0 t0,t0 t0,t0', '-123--' ],
				['global'       , '--,-- --,-- --,-- wc,-- --,-- --,--', '------' ],
				['link'         , '--,-- --,-- --,-- --,-- --,-- --,--', '-r----' ],
				['image-link'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-i----' ],
				['button'       , '--,-- --,-- --,-- --,-- --,-- --,--', '--r---' ],
				['image-button' , '--,-- cl,-- --,-- --,-- --,-- --,--', '--i---' ],
				['div'          , '--,-- --,-- --,-- --,-- --,-- --,--', '------' ],
				['image'        , '--,-- --,-- cl,-- --,-- --,-- --,--', '---b--' ]				
			  ).simulate(nodes, descriptions);

		helper.scenario("element received event from nested element")
			  .timeline(   //      0s    1s    2s    3s    4s    5s      expected    
			  	['usecase'      , 't4,t0 t1,t0 t7,t0 t3,t0 t0,t0 t0,t0', '---1--' ],
				['global'       , '--,-- --,-- --,-- wc,-- --,-- --,--', '------' ],
				['link'         , '--,-- cl,-- --,-- --,-- --,-- --,--', '---r--' ],
				['image-link'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '---i--' ]		
			  ).simulate(nodes, descriptions);

		helper.scenario("element event after nested element event")
			  .timeline(   //      0s    1s    2s    3s    4s    5s      expected    
			  	['usecase'      , 't4,t0 t1,t0 t1,t0 t3,t0 t0,t0 t0,t0', '---1--' ],
				['global'       , '--,-- --,-- --,-- wc,-- --,-- --,--', '------' ],
				['link'         , '--,-- cl,-- cl,-- --,-- --,-- --,--', '---r--' ],
				['image-link'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '---i--' ]		
			  ).simulate(nodes, descriptions);

		helper.scenario("nested element event after parent element event")
			  .timeline(   //      0s    1s    2s    3s    4s    5s      expected    
			  	['usecase'      , 't1,t0 t4,t0 t7,t0 t3,t0 t0,t0 t0,t0', '-1-2--' ],
				['global'       , '--,-- --,-- --,-- wc,-- --,-- --,--', '------' ],
				['link'         , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-b-r--' ],
				['image-link'   , '--,-- cl,-- --,-- --,-- --,-- --,--', '---i--' ]		
			  ).simulate(nodes, descriptions);

	});

	it("should report interactions for artificial events fiered by JavaScript", function() {

		var nodes = {
			'image'  : 'img[src=image.png]',
			'button' : 'input[type=button]'
		};

		var descriptions = {
			't0' : 'No events.',
			't1' : 'Browser minimized',
		  	't2' : 'Browser restored',
		    't3' : 'Browser closed',
			't4' : 'Click on image',
			't5' : 'Click on button',
			't6' : 'Click on image was handled by JavaScript which fiered click on button'
		};

		helper.scenario("two elements are clicked in 0.1s")
			  .timeline(   // 0s    1s    2s    3s    4s    5s      expected    
			  	['usecase' , 't6,t0 t0,t0 t0,t0 t0,t0 t0,t0 t0,t3', '-12---' ],
				['global'  , '--,-- --,-- --,-- --,-- --,-- --,wc', '------' ],
				['image'   , 'cl,-- --,-- --,-- --,-- --,-- --,--', '-b----' ],
				['button'  , 'cl,-- --,-- --,-- --,-- --,-- --,--', '--b---' ]
			  ).simulate(nodes, descriptions);

	});

	it("should report correct sequence of interactions for bubbled events fiered in wrong order", function() {
		// @todo write tests for events with incorrect timestamps
		expect(true).toBe(true);
	});

	it("should work", function() {
		// @todo write tests complex scenario 
		// click on image inside a link 
		// link triggers label.click
		// label is attached to input
		// input is focused by browser
		// expect: img/a, label/input
		// demo: ja-dtm#EngagementAnalyticsModel/lib/eam/doc/spec/browser-events/index.html#image-clicks-on-label 
		expect(true).toBe(true);
	});

	it("should report dwell time for interaction", function() {
		// @todo write tests for interaction dwell time
		// simple
		// text change
		// bubbled
		expect(true).toBe(true);
	});

});