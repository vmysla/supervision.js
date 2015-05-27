var EAM = require('./lib/eam/src/eam.js');
var eam = EAM.prototype;

eam.Helper = require('./lib/eam/src/helper/helper.js');
eam.HelperJQuery = require('./lib/eam/src/helper/helper-jquery.js');
eam.HelperSatellite = require('./lib/eam/src/helper/helper-satellite.js');

eam.Dwell = require('./lib/eam/src/dwell/dwell.js');
eam.DwellTimer = require('./lib/eam/src/dwell/dwell-timer.js');

eam.Element = require('./lib/eam/src/element/element.js');
eam.ElementSelector = require('./lib/eam/src/element/element-selector.js');

eam.Interaction = require('./lib/eam/src/interaction/interaction.js');

eam.Tracker = require('./lib/eam/src/tracker/tracker.js');

EAM.options = {

	autostart : true,

	global    : window,
	context   : document,
	none      : EAM.none,
	nan		  : Number.NaN,
	doNothing : function (){},

	helper  : { 
		priority  : [ eam.HelperSatellite, eam.HelperJQuery ]
	},

	interaction : {

		/**
		* 
		* User action might start a sequence of events with different target Nodes.
		* This happens because browser can bubble and forward events. JavaScript too.
		* Therefore we might receive a group of events and should select one for reporting.
		* Initiator - target element from first event when interaction starts.
		* Receiver  - one of target elements of the rest events received later.
		* Fixation  - maximal allowed time period in seconds for interaction receiver change.
		*             After this time, received events with a different target 
		*             should be classified as first event of a new interaction.
		*/
		fixation : 0.3,

		listen : { 
				global  : 'unload',
				context : 'click,mousedown,keypress'
		},

		element : {

			shortValue : function(text){
				if(!text) return;
				return (text.length<3) ? text : text.substr(0,3)+'...';	
			},

			dwell : { 

				autostart : true, 
				latency   : 0,

				listen : { 
					global  : 'focus,blur',
					context : 'focusin,focusout,mousedown,mouseup,click,keydown,keyup,keypress'
				}
			}
		}

	}
}

if(EAM.options.autostart){
	var instance = new EAM(EAM.options);
	EAM.options.global['eam'] = instance;
	instance['interaction'] = instance.create(eam.Interaction, EAM.options.interaction);
	instance['tracker'] = instance.create(eam.Tracker, EAM.options);
}

module.exports = EAM;