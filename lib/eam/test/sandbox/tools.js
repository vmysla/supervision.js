element interaction tracking requirements
==========================================

show "invisible elements":

function show_elements(role, color){

$('*').each(function(n,i){
  var r=eam.create(eam.Element, i, { shortValue: function(v){return v}}).role();
  if(r==role) $(i).css({'opacity':0.4,'background':color, 'border':'2px solid '+color})
  else console.log(i);
})

}


function createscript(src){
	var script   = document.createElement("script");
script.type  = "text/javascript";
script.src   = src;
document.body.appendChild(script);

}
//createscript("http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");   
//createscript("http://assets.adobedtm.com/d091b40b2c3eed7f804b1cef1ee91d7b1c7aa071/satelliteLib-d3f96529881f848e0037f86d2f1274a0ec469ca2-staging.js?javer=490");    // use this for linked script)
createscript("http://leap.justanswer.com/static/hackathon/eam/last/no-cache/");   



function recolor(role, color, lightcolor, opacity, images){
     $=jQuery;
     $(this)
    	.css({'background-color': lightcolor,'color': 'black',  'opacity' : opacity})
    	.addClass('i9n-role i9n-role-'+role);
    if( !images || !$(this).attr('src') ) return; 
    $(this).css('width', $(this).width() ) ;
    $(this).css('height', $(this).height() ) ;
    
    $(this).css({'background-image' : 'url('+$(this).attr('src')+')' , 'opacity' : 0.3, 'border':'2px solid '+color,  'opacity' : 0.5} );
    $(this).attr('src',
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

  }

function show_elements(role, color, lightcolor, opacity, images){
    $=jQuery;
	$('*').each(function(n,i){
	  var r=eam.create(eam.Element, i, { shortValue: function(v){return v}}).role();
	  if(!r || r!=role) return;
	  recolor.call(i, role, color, lightcolor, opacity, images);
	  $('*',i).each(function(){recolor(role, color, lightcolor, 1, images)});
	})

}

show_elements('text', '#CCF9CC', 'green', 0.3, false);
//show_elements('image', '#F4F2AE', '#ACA60B', 0.3, true);
//show_elements('heading', '#D9F8FB', '#069EAD', 0.3, false);
//show_elements('anchor', '#CFCEF4', '#1211CC', 0.3, false);
//show_elements('button', '#E9CDF1', '#5F1975', 0.3, false);
//show_elements('field', '#F6D2BD', '#C65312', 0.3, false);


document.getElementsByTagName('body')[0].innerHTML+='<div id="i9ns" style="position:fixed;left:0;bottom:0;width:100%;background:white;font-size:110%;line-height: 150%;z-index:9999"></div>'
var handler=eam.events.push;
eam.events.push = function(model){
    var i9n=
       '<div class="i9n" style="background:yellow;border:1px solid black;padding:5px;">'
      +'<b>'+model.data.initiator.selector()+'</b><br/>'
      +''+model.data.initiator.path()
      +'</div>';
    if(model.data.initiator.selector()=='div.i9n') return document.getElementById('i9ns').innerHTML = '';
    else document.getElementById('i9ns').innerHTML=i9n+document.getElementById('i9ns').innerHTML;
	handler(model);
}

function enableAddComponents(){

	if(!window.jQuery) return;


	var showSelectorTimeout = null;
	var element = null;

	$(document).bind('mousedown', function(e){

		if(showSelectorTimeout) $(this).trigger('mouseup');
		showSelectorTimeout = setTimeout(function(){
			showSelectorTimeout = null;
			var opt = { shortValue: function(v){return v} };
			element = eam.create(eam.Element, e.target, opt); 
		}, 2000);
	});

	$(document).bind('mouseup', function(e){
	
		if(showSelectorTimeout) {
			clearTimeout(showSelectorTimeout);
			showSelectorTimeout = null;
		}

		if(!element) return $('.eam-component-submit').remove();
		if(element) return showForm();
	})


	function showForm(){
		var dl = _satellite.getVar('DataLayer');
		var csrt = window.requestTrackingSettings;
			
		var url = "https://docs.google.com/a/justanswer.com/forms/d/1-Ct0MQQSrPnpqy9lvrXq5ldHP-CUIhb6ja45txIOgAw/viewform?embedded=true&entry.187932384={page-name}&entry.1287533572={route-action}&entry.980747314={selector}&entry.2041883725={path}&entry.109239284&entry.1092144760";
		url=url.replace('{selector}', escape( element.selector() ) );
		url=url.replace('{path}', escape( element.path() ) );
		url=url.replace('{page-name}', escape(dl && dl.get('pageName') || '(not set)' ));
		url=url.replace('{route-action}', escape(csrt && csrt.RouteAction || '(not set)' ));
		var $form = $('<iframe class="eam-component-submit" src="'+url+'" width="760" height="500" frameborder="0" marginheight="0" marginwidth="0"></iframe>');
		$form.css({
				  position : 'fixed',
			   	  left     : 0,
			   	  top      : '10%',
			   	  width    : '100%',
			   	  height   : '90%',
			   	  'z-index' : 9999
		});
		$form.appendTo(  $('body') );
		element = null;
	}

}

var eamTimer = setInterval(function(){
  if(window.eam) clearInterval(eamTimer); else return;
  enableAddComponents();
},1000);