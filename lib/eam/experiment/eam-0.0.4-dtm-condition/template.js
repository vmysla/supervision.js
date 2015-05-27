try{



}catch(error){

	if(window.ga){
		ga('send', 'exception', {
		  'exDescription': 'eam error: ' + (error && error.message) ? error.message : (error || 'n/a'),
		  'exFatal': false,
		  'appName': 'eam',
		  'appVersion': '0.0.4'
		});
	}
}