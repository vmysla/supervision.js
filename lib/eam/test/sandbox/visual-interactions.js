(function(){

if(!window.jQuery) return;

var lastInitiator, lastReceiver;

function showCurrentInteraction(){
	return;
	var current = eam.interaction.current();
	if(current && current.initiator  && current.initiator.node){
		if(!lastReceiver  || current.receiver.node  != lastReceiver.node ){
			showInteraction(current, ['orange', 'green']);
			lastReceiver = current.receiver;
			lastInitiator = current.initiator;
			showCurrentInteraction();
		}
		
	}else{
		window.setTimeout(showCurrentInteraction, 1);
	}
	
}

function showInteraction(interaction, colors){
	if(interaction.receiver) showReceiver(interaction.receiver, colors[1]);
	if(interaction.receiver && interaction.initiator && interaction.initiator.node != interaction.receiver.node) {
		showInitiator(interaction.initiator, colors[0]);
	}
}

function showInitiator(element, color){
	showElement(element, color);
	lastInitiator = null;
}

function showReceiver(element, color){
	showElement(element, color);
	lastReceiver = null;
}


function showElement(element, color){

	console.log('visual', element.node );

	var $node = $(element.node);
	var pos = $node.position();
	var $overlay = $('<div/>');
	$overlay.css({
		width  : $node.width(),
		height : $node.height(),
		position : 'absolute',
		left : pos.left,
		top  : pos.top,
		opacity : 0,
		'background-color' : color
	});

	$overlay.appendTo('body');
	$overlay.animate({ opacity: 0.8 }, 500, function(){ 
		$overlay.animate({ opacity: 0 }, 1000, function(){ 
			$overlay.remove(); 
		}) 
	})
}


var interactionsReported = 0;
function showReportedInteraction(interaction){
		console.log('report',interaction);
		var $reported = $('#reported');
		var $item = $('<div/>');
		$item.css({
			width  : '100%',
			'background-color' : $('#reported div').length & 1 ? 'yellow' : 'lightblue',
			opacity: 1
		});
		$item.html('#: '+(interactionsReported++)+'<br/>i: '+interaction.initiator.selector()+'<br/>r: '+interaction.receiver.selector() );
		$item.prependTo($reported);
		$item.animate({ opacity: 0 }, 15000, function(){ 
				$item.remove(); 
		})
}

function onReportedInteraction(model){
		showReportedInteraction(model.data);
		return [].push.call(eam.events, model);
}

function init(){
	if(!eam.interaction) return window.setTimeout(init, 1000);
	eam.events.push = onReportedInteraction;
	window.setTimeout(showCurrentInteraction, 500);	
}

$(function(){
	var $reported = $('<div/>');
	$reported.css({
		width  : '200px',
		height : '100%',
		position : 'fixed',
		right : 0,
		top  : 0
	});
	$reported.attr('id', 'reported');
	$reported.appendTo('body');
	$reported.click(function(){ $('*',$reported).remove(); });
	init();
});

})();