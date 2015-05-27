
	var EAM = require('../../../../index.js');
	var SelectedDom = require('../../../selected-dom/selected-dom.js');

	var eam = new EAM(EAM.options);
		
		var now    = new Date();
		var time   = now.getTime();
		var global_second = 0;
		var global_end = false;
		eam.time = function(){ 
			var result =  time + (global_second * 1000) 
			eam.processTimeouts(result);
			return result;
		} 

		var timeoutsCount = 0;
		var timeouts = [];
		eam.timeout = function(fn, delay){
			timeoutsCount++;
			var index = 0;
			var expected_time = eam.time()+delay;
			index = -1 + timeouts.push(function(time){
				if(expected_time>=time || global_end==true){
					timeouts[index] = function(){};
					timeoutsCount--;
					fn();
				}
			});
		}
		eam.processTimeouts = function(time){
			for(var i=timeouts.length;i--;){
				timeouts[i](time);
			}
		}


		var eventListeners = {
			'document' : {},
			'window'   : {}
		}

		eam.log = function(){
		 return;
		 	//console.log('options.log',options.log);
		 	//if(options.log == false) return;
		 	try{
		 		console.log( Array.prototype.slice.call(arguments));
		 		console.log.apply(console, Array.prototype.slice.call(arguments) );
		 	}catch(e){
			 	var i = -1, l = arguments.length, args = [], fn = 'console.log(args)';
			    while(++i<l){
			        args.push('args['+i+']');
			    };
		    	fn = new Function('args',fn.replace(/args/,args.join(',')));
		    	fn(arguments);
		 	}
	 	}


		eam.listen = function(context, events, listeners){
		var names  = events.split(',');
		var category = (context==window) ? 'window' : 'document';
		var target = eventListeners[category];

		//console.log("Adding group of "+listeners.length+" listeners for "+events+' into '+category);
			for(var i=0; i<names.length; i++){
				if(!target[ names[i] ]) target[ names[i] ] = [];

				function notifyListeners(event){
					var index = listeners.length;
					while(index>0){
						var listener = listeners[--index];
						listener(event);
					}
				}

				target[ names[i] ].push(notifyListeners);
			}
		}


		var itn = eam.create(eam.Interaction, EAM.options.interaction);


		function triggerNodeEvent(eventType, data){ 
			//console.log('Fiered ' + eventType+" event ", typeof(data.target) );
			var category = (data.target==window) ? 'window' : 'document';
			var listeners = eventListeners[category][eventType];
			if(!listeners) {
			 //console.log("No listeners for "+eventType+' in '+category);
				return;
			}
			//console.log("Triggering "+listeners.length+" groups of listeners for "+category);
			var index = listeners.length;
			while(index>0){
				var listener = listeners[--index];
				listener(data);
			}

			return eventType;
		}

	function getNodes(selectors){
		var nodes = {};

		function addNode(node){ 
			nodes[ node.id ] = node; 
			addChilds(node.children);
		};

		function addChilds(children){ 
			if(!children.length) return;
			for(var i=children.length;i--;){
				addNode( children[i] );
			}
		}

		for(var i=selectors.length;i--;){
			var selected = new SelectedDom(selectors[i]);
			addNode(selected.node);
		}

		return nodes;
	}

	function getTestCases(timeline, options){
		var testcases = {};
		var names = timeline[0][1].split(/[,\s]/g);
		for(var i=names.length;i--;){
			testcases[ names[i] ] = options[ names[i] ] || 'TestCase #'+i
		}
		return testcases;
	}

	function getScenarioDuration(timeline){
		return timeline[0][1].match(/[\s]/g).length+1;
	}

	function getEventTrigger(nodeName, eventShortName, options){

		function getCustomTrigger(fn){
			return function(){ return fn(options.nodes[nodeName], nodeName, options.nodes); };
		}

		function getTrigger(event){
			//console.log(nodeName, event.type);
			return function(targetName){ 
				event.target = event.target || options.nodes[nodeName] || options.nodes[targetName];
				//console.log('Fiered ' + event.type+" event for "+nodeName, eam.time()-time);
				return triggerNodeEvent( event.type, event ); 
			};
		}

		switch(eventShortName){

			case('--') : return function(){};
			case('cl') : return getTrigger({type :'click',     button : 0, clientX : 100, clientY : 100});
			case('cr') : return getTrigger({type :'click',     button : 1, clientX : 100, clientY : 100});
			case('md') : return getTrigger({type :'mousedown', button : 0, clientX : 100, clientY : 100});
			case('mu') : return getTrigger({type :'mouseup'  , button : 0, clientX : 100, clientY : 100});
			case('mm') : return getTrigger({type :'mousemove',             clientX : 100, clientY : 100});

			case('kd') : return getTrigger({type :'keydown' , keyCode : 60 });
			case('ku') : return getTrigger({type :'keyup'   , keyCode : 60 });
			case('kp') : return getTrigger({type :'keypress', keyCode : 60 });

			case('fi') : return getTrigger({type :'focusin'  });
			case('fo') : return getTrigger({type :'foucsout' });

			case('wf') : return getTrigger({type :'focus' , target : window });
			case('wb') : return getTrigger({type :'blur'  , target : window });
			case('wc') : return getTrigger({type :'unload', target : window });

			case('df') : return getTrigger({type :'focus' , target : document });
			case('db') : return getTrigger({type :'blur'  , target : document });

			case('nf') : return getTrigger({type :'focus' });
			case('nb') : return getTrigger({type :'blur'  });

			case('x0') : return getCustomTrigger(options.x0);
			case('x1') : return getCustomTrigger(options.x1);
			case('x2') : return getCustomTrigger(options.x2);

			default : throw new Error("Unknown event short name "+eventShortName);
		}
	}

	function getTimeframe(timeline, second, options){

		var row_testcases = 0;
		var row_global = 1;
		var col_node   = 0;
		var col_frames = 1;

		function getFrame(line){ 
			//console.log('frame', line, col_frames,timeline[line]);
			return timeline[line][col_frames].split(' ')[second].split(',');
		}

		//var testCases = getFrame(row_testcases);
		
		var events_in_second = [];
		var second_start = 0;
		var second_half  = 1;
		events_in_second[second_start] = [];
		events_in_second[second_half] = [];

		for(var i=1;i<timeline.length;i++){
			var node = timeline[i][col_node];
			//console.log('node', node, second, i);
			var events = getFrame(i);
			events_in_second[second_start].push( getEventTrigger(node, events[second_start], options) ); 
			events_in_second[second_half ].push( getEventTrigger(node, events[second_half] , options) );
		}

		events_in_second.testcases = getFrame(row_testcases);
		
		return events_in_second;
	}


	function test_scenario(name, selectors, timeline, options){
		global_end = false;
		//console.log('test scenario len', 'name', name, 'selectors', selectors.length, 'timeline', timeline.length);
		options.name = name;
		options.nodes     = getNodes(selectors);
		options.testcases = getTestCases(timeline, options);
		options.timeframes = [];
		//console.log(options);

		var current_second   = 0;
		var total_duration = getScenarioDuration(timeline); //seconds

		//console.log(current_second, total_duration);
		while(current_second < total_duration){
			var timeframe = getTimeframe(timeline, current_second, options);
			options.timeframes.push(timeframe);
			current_second += 1;
		}

		current_second = 0;
		global_second = current_second;
		var testcases = [];
		for(var i=0;i<options.timeframes.length;i++){
			var timeframe = options.timeframes[i];
			for(var j=0;j<2;j++){
				var subsecond = timeframe[j];
				var usecase = options.testcases[timeframe.testcases[j]];
				if(testcases.indexOf(usecase)<0) testcases.push(usecase);
				for(var k=0;k<subsecond.length;k++){
					var trigger = subsecond[k];
					global_second = current_second;
					var result = trigger(timeline[k+1][0]);
					//if(result) console.log(current_second+'s', timeline[k+1][0] );
					checkExpectedInteractionNodes(timeline, timeframe, testcases, options, name);
				}
				current_second += 0.1;
			}
			current_second += 0.8; //0.1+0.1+0.8=1
		}
		global_end = true;
		eam.time();

		var expectedToReport = timeline[0][2].match(/\d/g) || [];
		
		expect(timeoutsCount).toEqual(0, "All timers should be stopped in end");

		expect(eam.events.length).toEqual(expectedToReport.length, 
			"Coun't of interactions doesn't match for "+name+' : \r\n'+testcases.join(',\r\n')
		);
	    eam.events.length=0;
		//console.log('initiator', eam.events[0].initiator);
		//console.log('receiver', eam.events[0].receiver);
	}



		var lastCapturedInteractions = 0;
		var interactionNumber = 0;
		var lastInteraction = eam.none;
		var countOfCapturedInteractions =0;

		function checkExpectedInteractionNodes(timeline, timeframe, testcases, options, name){

			var model = itn.current();

			var capturedInteractions = eam.events.length;
			var newInteractionCaptured = (lastCapturedInteractions<capturedInteractions);
			/*
			var newInteractionStarted = false;

			if(!lastInteraction && model){
				//1st interaction
				interactionNumber ++;
				lastInteraction = model;
				newInteractionStarted = true;
			} else if(lastInteraction && lastInteraction == model){
				//same interaction

			} else if(lastInteraction && lastInteraction != model){
				//new interaction
				interactionNumber++;
				lastInteraction = model;
				newInteractionStarted = true;
			}
			if(newInteractionCaptured || newInteractionStarted){
			 //console.log('new interaction ', newInteractionCaptured, newInteractionStarted, capturedInteractions);
			}
			*/



			if(newInteractionCaptured){
				countOfCapturedInteractions++;
				var usecases = name+': \r\n'+testcases.join(',\r\n');
				var lastInteractionCaptured = eam.events[eam.events.length-1];
				//console.log('lastInteractionCaptured',lastInteractionCaptured.data.receiver.id());
				


				var expected = getExpectedInteractionNodes(capturedInteractions, timeline, options);
				expect(lastInteractionCaptured.data.receiver.id()).toEqual(expected.receiverNode, 
					"Receiver doesn't match for interaction # "+capturedInteractions+" on "+global_second+' second. '+usecases);
				expect(lastInteractionCaptured.data.initiator.id()).toEqual(expected.initiatorNode, 
					"Initiatordoesn't match for interaction # "+capturedInteractions+" on "+global_second+' second. '+usecases);
/*
				expect(lastInteractionCaptured.data.started-time).toEqual(expected.secondStarted, 
					"Start Time doesn't match for interaction # "+capturedInteractions+" on "+global_second+' second. '+usecases);
			
				expect(Math.round(global_second)).toEqual(expected.secondReported, 
					"Reported Time doesn't match for interaction # "+capturedInteractions+" on "+global_second+' second. '+usecases);
				*/
				testcases = [];
			}
			
			lastCapturedInteractions = capturedInteractions;
		}

	function getExpectedInteractionNodes(interactionNumber, timeline, options){
		var secondStarted   = timeline[0][2].indexOf(interactionNumber);
		var secondReported  = timeline[0][2].lastIndexOf(interactionNumber);
		var nodes = {
			initiatorNode : eam.none,
			receiverNode  : eam.none,
			secondReported : secondReported,
			secondStarted : secondStarted
		}
	 //console.log('Expectation search', interactionNumber, secondReported);
		for(var i=1;i<timeline.length;i++){
			var status = timeline[i][2][secondReported];
			if(status!='-'){
				//var node = options.nodes[ timeline[i][0] ];
				if(status != 'r') nodes.initiatorNode = timeline[i][0];
				if(status != 'i') nodes.receiverNode = timeline[i][0];
			}
		}

	 //console.log('Expectation found', nodes.receiverNode, nodes.initiatorNode);

		return nodes;		
	}


function TestScenario(name){
	this.name = name;
	this.selectors = [];
	this.timeline = [];
	this.options = {};
	this.node = function(name, selector){ 
		if(selector.indexOf('id=')<0 || selector.indexOf('[')<selector.lastIndexOf('[') ){
			selector = selector.replace('[','[id='+name+',');	
		} 
		this.selectors.push( selector ); 
		return this;
	};
	this.nodes = function(selectors){ 
		this.selectors = selectors; 
		return this;
	};
	this.describe = function(name, val){ 
		this.options[name] = val; 
		return this;
	};
	this.options = function(opt){ 
		this.options = opt; 
		return this;
	};
	this.simulate = function(nodes, descriptions){
		if(nodes) for(var key in nodes) this.node(key, nodes[key]);
		if(descriptions) eam.$.extend(this.options, descriptions);
		//console.log('test scenario len', 'name', name.length, 'selectors', this.selectors.length, 'timeline', this.timeline.length);
		return test_scenario(this.name, this.selectors, this.timeline, this.options);
	}

	this.timeline = function(lines){ 
		this.timeline = Array.prototype.slice.call(arguments); 
		return this;
	};
}

module.exports = {
	test_scenario : test_scenario,
	TestScenario  : TestScenario,
	scenario : function(name){ var ts = new TestScenario(name); return ts; }
};