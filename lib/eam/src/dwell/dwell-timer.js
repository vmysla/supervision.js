 /**
 * Dwell Timer
 * @private
 * @class
 * @memberof EAM.Dwell
 * @param {EAM.Eam} eam
 * @param {EAM.Dwell.Options} options Initial configuration.
 */
function DwellTimer(eam, options){

	/** @const {EAM.Time} FLAG_TIMER_IS_STOPPED */
	var FLAG_TIMER_IS_STOPPED = eam.nan;

	/**
	* @typedef {Object} Model
	* @memberof EAM.Dwell.DwellTimer
	* @property {EAM.Duration}       saved   Saved activity duration in seconds.
	* @property {(EAM.Time)} started Time of the last activity or False when none.
	*/

	/** 
	 * @private	
	 * @property {EAM.Dwell.DwellTimer.Model} model
	 */
	var model = {
		savedSeconds : 0,
		startTime    : FLAG_TIMER_IS_STOPPED
	}

	/** Reset dwell time */	
	this.reset = function(){ 
		model.savedSeconds = 0;
		model.startTime = FLAG_TIMER_IS_STOPPED;
	}

	/** 
	 * Get total dwell time.
	 * @method
     * @returns {EAM.Duration} Duration in seconds.
     */	
	this.total = function(){ 
		return saved() + unsaved(); 
	};

	/**
     * Save current dwell session and restart if required.
     * @method
     * @param {Boolean} restart Indicates if new dwell session should be started after save.
     */
	this.flush = function(restart){
		model.savedSeconds  += unsaved();
		model.startTime = restart ? eam.time() : FLAG_TIMER_IS_STOPPED;
	};

	/**
     * Get dwell time for saved sessions.
     * @private
     * @returns {EAM.Duration} Duration in seconds.
     */
	function saved(){
		return model.savedSeconds;
	}

	/**
     * Get dwell time for unsaved session.
     * @private
     * @returns {EAM.Duration} Duration in seconds.
     */
	function unsaved(){
		if(model.startTime == FLAG_TIMER_IS_STOPPED) return 0;
		var now   = eam.time();
		var delta = (now - model.startTime) / 1000;
		return (delta <= options.latency) ? delta : options.latency + 1;
	}

	this.flush(options.autostart);
}

module.exports = DwellTimer;