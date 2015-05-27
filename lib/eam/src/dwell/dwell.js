/** @namespace EAM.Dwell **/

/**
 * @typedef {Object} Options
 * @memberof EAM.Dwell
 * @property {Boolean}      start   Initial state of activity.
 * @property {EAM.Duration} latency Passive activity duration in seconds.
 * @property {Object}       listen  Events to listen.
 */

 /**
 * EAM Dwell Time.
 * The period of time that a system or element of a system remains in a given state.
 * Dwell time is closely related to bounce rate.
 * @class
 * @memberof EAM.Dwell
 * @param {EAM.Eam} eam
 * @param {EAM.Dwell.Options} options Initial configuration.
 */
function Dwell(eam, options){

	/** 
	 * @private
	 * @property {EAM.Dwell.DwellTimer} timer
	 */
	var timer = eam.create(eam.DwellTimer, options);

	/** 
	 * @private
	 * @property {EAM.Time} overtime Extra time. Used when events received in a wrong order because of bubbling
	 */
	var overtime = 0;

	/** 
	 * Reset dwell time
     * @returns {EAM.Duration} Total before reset.
     */		
	this.reset = function(){ 
		var total = this.total();
		timer.reset();
		overtime = 0;
		return total;
	};

	/** 
	 * Add additional time.
     * @param [EAM.Duration] duration Seconds to add.
     */	
	this.overtime = function(duration){ overtime += duration; };

	/** 
	 * Get total activity duration.
     * @returns {EAM.Duration} Duration in seconds.
     */	
	this.total = function(){ return timer.total() + overtime; };

	/** Notify about activity. */	
	this.startOrProlong = function(){ timer.flush(true); }

	/** Notify about end of last activity if any. */
	this.pause = function(){ timer.flush(false); };
}

module.exports = Dwell;