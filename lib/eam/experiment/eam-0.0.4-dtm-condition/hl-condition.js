/*

_satellite.setCookie('eam-sandbox','on');
_satellite.setCookie('eam-sandbox','off');

_satellite.setCookie('eam-src','http://localhost/eam/');
_satellite.removeCookie('eam-src');

*/

try{

	if(document.location.hash=="#eam-sandbox=on") {
		_satellite.removeCookie('eam-sandbox');
		_satellite.setCookie('eam-sandbox','on');
	}

	if(document.location.hash=="#eam-sandbox=off"){
		_satellite.removeCookie('eam-sandbox');
		_satellite.setCookie('eam-sandbox','off');	
	} 

	if( document.location.pathname.indexOf('/dashboard') != 0 ) return;

	if(_satellite.createScript){

		var url   = document.location.href;
		var local = /\.local/i.test(url) || _satellite.settings.isStaging;
		var cdn   = '//leap.justanswer.com/static/hackathon/eam/last';
		var src = _satellite.readCookie('eam-src') || ( local ? cdn + '/no-cache/' : cdn + '/eam.min.js' );

		_satellite.createScript(src);


		var sandbox = (_satellite.readCookie('eam-sandbox') == 'on');
		if(sandbox) _satellite.createScript(cdn + '/eam-sandbox.js?t='+( ( new Date() ).getTime() ) );  		
	}

} catch(error){

	if(window.ga){
		ga('send', 'exception', {
		  'exDescription': 'eam condition: ' + (error && error.message) ? error.message : (error || 'n/a'),
		  'exFatal': false,
		  'appName': 'eam',
		  'appVersion': '0.0.4'
		});
	}

}
