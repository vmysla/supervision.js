function Tracker(eam){

	function historyHandler(model){
		
		var element = model;

		function attr(name, backward, defaults, stringify){
			
			if(arguments.length < 3) return attr(name, backward, '(not set)', true);
			if(element == eam.none) return defaults;

			var initiator = element.initiator,
				receiver  = element.receiver,
				elements  = backward == true ? [initiator,receiver] : [receiver, initiator],
				value = elements[0][name]();

			if(value == eam.none) value = elements[1][name]();
			if(value == eam.none) value = defaults;	

			return stringify == false ? value : value.toString();
		};

		if(element == eam.none || attr('role', false, eam.none, false) == eam.none) return;

		var payload = {
			useBeacon       : true,
			eventCategory	: 'element',
			eventAction		: 'interaction',
			eventLabel		: 'unknown',
			dimension41		: 'eam=0.0.4;',
			dimension42  	: attr('selector'),
			dimension43     : attr('path', true),
			dimension44     : attr('role'),
			dimension45     : attr('text', 500), 
			dimension46     : attr('value'),
			dimension47     : attr('image', true),
			dimension48     : attr('anchor'),
			metric16     	: model.dwell.total()
		};
		
		return payload;
	};

	eam.hit = historyHandler;

	eam.events.push = function(model){
		var hit = eam.hit(model.data);
		var ga = eam.global['ga'];
		if(hit) ga('send', 'event', hit);
		return [].push.call(eam.events, model);
	}

}

module.exports = Tracker;