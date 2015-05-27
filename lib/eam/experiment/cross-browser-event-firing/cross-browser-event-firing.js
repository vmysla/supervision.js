function experiment(){

/*
 Goal: test how events are generated in different browsers and OS.
 Target: chat expand/minimize button on Guest Q&A page.
*/

	// targeting:
	var questQuestionAndAnswerPageViewName = 'GuestQuestionAnswer';
	var chatExpandOrMinimizeButtonSelector = '#chatExpandOrMinimize';

	var $element = window.jQuery && window.jQuery(chatExpandOrMinimizeButtonSelector);
	var pageName = window._satellite && _satellite.getVar('PageViewName');

	if( pageName != questQuestionAndAnswerPageViewName ) return;
	if( !$element || $element.size() != 1) return;
	
	// start:
	var isActive = true;
	var variationId = Math.floor(Math.random() * 3);

	var detectedEvents = [];
	var reportingStartTime = Number.NaN;
	var deactivationTime = Number.NaN;
	var element = $element[0];
	var eventTypes = 
	[
		['click','keypress'],
		['click','mousedown','keypress','keydown','focusin'],
		['click','mousedown','mouseup','keypress','keydown','keyup','focusin','focusout']
	][variationId];	

	while(eventTypes.length){
		_satellite.addEventHandler(document, eventTypes.pop(), eventHandler);
	}

	function eventHandler(event) {
		var node;
		var alias = 'error';
		try{
	    	var time = (event && event.timeStamp) || ((new Date()).getTime());
	    	if(isActive && deactivationTime && time >= deactivationTime ){
	    		isActive = false;
				var reportedEvents = [];
	    		for(var i=detectedEvents.length;i--;){
	    			if(detectedEvents[i].time < reportingStartTime) continue;
	    			reportedEvents.push(detectedEvents[i].alias);
	    		}
	    		if(window.ga){
		    		ga('send', 'event', 
		    		   'debug', 
		    		   'eam-cross-browser-chat-toggle-1-'+variationId,
		    		   reportedEvents.reverse().join(','),
		    		   {'nonInteraction': 1}
		    		);	
	    		} 
	    		return;
	    	}

	    	if(!isActive || !event) return;

	    	alias = event.type + '/';
	    	node = event.target;   

	    	if(node){
	    		if(node == element){
	    			deactivationTime   = time + 1000; // +1 second
	    			reportingStartTime = time - 1000; // -1 second
	    			window.setTimeout(eventHandler, 1000);
	    		}
	    		alias += (node.tagName || '');
	    		alias += (node.tagName && node.id && ('#' + node.id) || '');
	    		alias += (node.tagName && node.className 
	    			       && ('.' + node.className.replace(/\s/g,'.') ) 
	    			       || '');
	     	}
	    } catch(e){}
	    detectedEvents.push({ time : time, alias : alias});	
	}

}

try{ experiment() }catch(e){};
