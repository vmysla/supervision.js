
var EAM = require('../../../../index.js');


function expect_dwell_time(options, scenario){
		var eam    = new EAM(EAM.options);
		var now    = new Date();
		var time   = now.getTime();
		var second = 0;
	
		eam.time = function(){ 
			return time + (second * 1000); 
		} 
		
		var dwell = eam.create(eam.Dwell, options);
		while(second < scenario.length){
			action = scenario[second];
			switch(action){
				case('+'): dwell.startOrProlong();   break;
				case('-'): dwell.pause(); break;
				case('.'):
				default  : break;
			}
			dwell_time = dwell.total();
			second++;
		}

		var dwell_time = dwell.total();
		return expect(dwell_time);
	};

module.exports = {
	expect_dwell_time : expect_dwell_time
};
