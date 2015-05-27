/** @namespace EAM.Interaction **/

/**
 * @typedef {Object} Options
 * @memberof EAM.Interaction
 */

/**
 * EAM Interaction.
 * @class
 * @memberof EAM.Interaction
 * @param {EAM.Eam} eam
 * @param {EAM.Interaction.Options} options Initial configuration.
 */
function Interaction(eam, options) {

    /** @const {EAM.Time} EVENT_FIXATION_TIME */
    var EVENT_FIXATION_TIME = options.fixation * 1000;

    var last = eam.none;
    var current = eam.none;

    this.current = function () {
        return current;
    };

//same as i19n for internationalization or l10n for localization – that's a shortening for "interaction" - "i" + 9 letters + "n".

    /**
     * @typedef {Object} Model Complex object that describes interaction.
     * @property {EAM.Time}             started    Time when interaction was started or eam.none for interactions in event fixation mode.
     * @property {EAM.Time}             created    Time when 1st event for this interaction was created.
     * @property {EAM.Dwell}            dwell      Dwell time for current element interaction.
     * @property {EAM.Element.Element}  initiator  Target Element from 1st event for this interaction.
     * @property {EAM.Element.Element}  receiver   Closest Element that can receive focus, is actionable or has busness value.
     * @memberof EAM.Interaction
     */

    /**
     * Creates a new Interaction Model for a given event.
     * @param {Node}     node           Target Node for event
     * @param {EAM.Time} eventCreated   Time when event was created.
     * @param {Boolean}  isFixationMode Flag that indicates if interaction should be started in fixation mode.
     * @returns {EAM.Interaction.Model} New interaction
     */
    function start(node, eventCreated, isFixationMode) {

        var element = eam.create(eam.Element, node, options.element);

        var interaction = {
            started: isFixationMode ? eam.none : eventCreated,
            created: eventCreated,
            dwell: eam.create(eam.Dwell, options.element.dwell),
            initiator: element,
            receiver: element.closest('role', 'anchor,button,field,heading') || element
        };

        return interaction;
    }

    /**
     * Prepares Interaction Model for reporting and initiates reporting process.
     * @param {EAM.Interaction.Model}   i9n Interaction to complete
     */
    function complete(i9n) {
        i9n.dwell.pause();
        if (last && i9n.initiator.node == last.initiator.node) {
            last.dwell.overtime(i9n.dwell.total());
        } else {
            reportLast();
            last = i9n;
            eam.timeout(reportLast, EVENT_FIXATION_TIME);
        }
    }

    /**
     * Reports last completed interaction
     * @param {EAM.Interaction.Model}   i9n Interaction to complete
     */
    function reportLast() {
        if (last == eam.none) return;
        //console.log('event reported', last.initiator.tag()+'/'+ last.receiver.tag() );
        eam.events.push({
            type: 'event',
            category: 'element',
            action: 'interaction',
            data: last
        });
        last = eam.none;
    }

    /**
     * Swaps Elements for two interactions and completes first of them.
     * Used for resolving event bubbling issue when events are received in wrong order (older events with lower event.simeStamp received after more recent events).
     * @param {EAM.Interaction.Model}   prematureInteraction Interation for event which was received earlier than should.
     * @param {EAM.Interaction.Model}   bubbledInteraction   Interation for delayed event which was received later than should.
     */
    function swapAndComplete(prematureInteraction, bubbledInteraction) {

        var prematureElements = {
            initiator: prematureInteraction.initiator,
            receiver: prematureInteraction.receiver
        };
        var bubbledElements = {
            initiator: bubbledInteraction.initiator,
            receiver: bubbledInteraction.receiver
        };

        eam.$.extend(prematureInteraction, bubbledElements);
        eam.$.extend(bubbledInteraction, prematureElements);
        complete(prematureInteraction);


        return bubbledInteraction;
    }

    /**
     * Decides if Event indicates current or new Interaction that should be created.
     * Used for resolving event bubbling issue when events are received in wrong order (older events with lower event.simeStamp received after more recent events).
     * @param {EAM.Interaction.Model}  i9n            Interaction to update
     * @param {Node}                   node           Target Node for event
     * @param {EAM.Time}               eventCreated   Time when event was created.
     * @param {DOMEvent}               event          Event.
     * @returns {EAM.Interaction.Model} Current interaction
     */
    function update(i9n, node, eventCreated, event) {
        var current = i9n;
        var isNewEvent = (eventCreated - current.created) > EVENT_FIXATION_TIME;
        var isBubbledEvent = eventCreated < current.created;
        var isCurrent = (node == current.initiator.node || node == current.receiver.node);
        var isLast = last && (node == last.initiator.node || node == last.receiver.node);

        //var action = 'none';

        if (!isCurrent) {
            if (isNewEvent) {
                complete(current);
                current = start(node, eventCreated);
                //action = 'started/compl/start';
            } else if (isBubbledEvent) {
                var bubbledInteraction = start(node, eventCreated);
                current = swapAndComplete(current, bubbledInteraction);
                //action = 'swap';
            } else {
                if (current.started) {
                    complete(current);
                    current = start(node, eventCreated, true);
                    //action = 'fixation/compl/start';
                } else if (!isLast) {
                    //action = 'update/rec';
                    var element = eam.create(eam.Element, node, options.element);
                    current.receiver = element.closest('role', 'anchor,button,field,heading') || element;
                    current.started = eventCreated;
                }
            }
        }
        /*
         console.log(
         'event', event.type+'/'+node.tagName,
         'action', action,
         'delay', eventCreated - current.created,
         'new', isNewEvent,
         'bubbled', isBubbledEvent,
         'current', isCurrent,
         'last', isLast);
         */
        return current;
    }


    /**
     * Register listeners by a given options.
     * @private
     * @param {EAM.Options.Listen} listenOptions Events to listen.
     * @param {Function}           handler       Event handler.
     */
    function listen(listenOptions, handler) {
        eam.listen(eam.global, listenOptions.global, [handler]);
        eam.listen(eam.context, listenOptions.context, [handler]);
    }


    listen(
        options.element.dwell.listen,
        function (event) {
            if (current == eam.none) return;
            var isGlobal = (event.target == eam.global);
            var isDeactivation = (event.type == 'blur');
            return (isGlobal && isDeactivation)
                ? current.dwell.pause()
                : current.dwell.startOrProlong();
        });

    listen(
        options.listen,
        function (event) {
            var target = event.target;
            if (target == eam.global) {
                if (current && event.type == 'unload') {
                    current = complete(current);
                    reportLast();
                }
            } else if (target != eam.none && target != eam.context) {
                var timeStamp = event.timeStamp || eam.time();
                current = (current == eam.none)
                    ? start(target, timeStamp)
                    : update(current, target, timeStamp, event);
            }
        });


}

module.exports = Interaction;