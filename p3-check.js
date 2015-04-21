
function P3Check() {
	
	this.platformStatus = "unknown";
	
	this.platformURI = "";
	this.sparqlEndpoint = "";
	
	this.uirContainer = "";
	this.tfrContainer = "";
	this.trContainer = "";
	
	if(typeof jQuery === 'undefined') {
		console.error("You must include jQuery before this library.");
	}
}

P3Check.prototype.initP3Platform = function (platformURI, sparqlEndpoint) {
	
	this.platformURI = platformURI;
	this.sparqlEndpoint = sparqlEndpoint;
	var main = this;
	
	var ajaxRequest = jQuery.ajax({	type: "GET",
								url: platformURI,
								async: false });	
	
	ajaxRequest.done(function(response, textStatus, responseObj) {
		console.info("Platform checked, already has configuration entries. (status " + responseObj.status + ")");
		main.platformStatus = "existing";
	});
	ajaxRequest.fail(function(responseObj, textStatus, response){
		console.info("Platform checked, no configuration entry found. (status "+responseObj.status+")");
		if(responseObj.status == 404) {
			
			////////// PUTTING STUFF ///////////////

			// Create the platform resource			
			var putPlatformRequest = $.ajax({	type: 'PUT',
												url: platformURI,
												headers: { 'Content-Type': 'text/turtle' },
												data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
														'<http://purl.org/dc/terms/title> "Platform Configuration" ; ' + 
														'<http://vocab.fusepool.info/platform#sparqlEndpoint> <' + sparqlEndpoint + '> ; ' + 
														'<http://vocab.fusepool.info/platform#userInteractionRegistry> <' + platformURI + '/uir> ; ' + 
														'<http://vocab.fusepool.info/platform#transformerFactoryRegistry> <' + platformURI + '/tfr> ; ' + 
														'<http://vocab.fusepool.info/platform#transformerRegistry> <' + platformURI + '/tr> . ',
												async: false
											});
											
			putPlatformRequest.done(function(response, textStatus, responseObj) {
				
				console.info("Platform Configuration Resource created. (" + main.platformURI + ")");
				
				// 1. create a user interaction registry
				var putUirRequest = $.ajax({	type: 'PUT',
												url: platformURI + '/uir',
												headers: { 'Content-Type': 'text/turtle' },
												data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
														' <http://purl.org/dc/terms/title> "User Interaction Registry" . ',
												async: false
											});
											
				putUirRequest.done(function(response, textStatus, responseObj) {
					main.uirContainer = responseObj.getResponseHeader('Location');
					console.info("User Interaction Registry created. (" + main.uirContainer + ")");
					
					// 2. create a transformer factory registry
					var putTfrRequest = $.ajax({	type: 'PUT',
													url: platformURI + '/tfr',
													headers: { 'Content-Type': 'text/turtle' },
													data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
															' <http://purl.org/dc/terms/title> "Transformer Factory Registry" . ',
													async: false
												});
												
					putTfrRequest.done(function(response, textStatus, responseObj) {
						main.tfrContainer = responseObj.getResponseHeader('Location');
						console.info("Transformer Factory Registry created. (" + main.tfrContainer + ")");
						
						// 3. create a transformer registry
						var putTrRequest = $.ajax({	type: 'PUT',
														url: platformURI + '/tr',
														headers: { 'Content-Type': 'text/turtle' },
														data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
																' <http://purl.org/dc/terms/title> "Transformer Registry" . ',
														async: false
													});
						
						putTrRequest.done(function(response, textStatus, responseObj) {							
							main.trContainer = responseObj.getResponseHeader('Location');
							console.info("Transformer Registry created. (" + main.trContainer + ")");
							main.platformStatus = "new";
						});
					});
				});
			});
		} 
		else {
			// "error" but not a 404
			console.error("We have some serious problems... (status" + responseObj.status + ")");
			main.platformStatus = "error " + responseObj.status;
		}
	});
	
};

P3Check.prototype.registerFactory = function (factoryURI) {
	if(this.platformStatus == "new") {
		var postTfrRequest = $.ajax({	type: 'POST',
										url: this.tfrContainer,
										headers: { 'Content-Type': 'text/turtle' },
										data: '<> a <http://vocab.fusepool.info/tfrldpc#TransformerFactoryRegistration> ; ' +
												' <http://purl.org/dc/terms/title> "Transformer Factory" ; ' +
												' <http://purl.org/dc/terms/description> "Transformer Factory" ; ' +
												' <http://vocab.fusepool.info/tfrldpc#transformerFactory> <' + factoryURI + '> . ',
										contentType: 'text/turtle'
									});
									
		postTfrRequest.done(function(response, textStatus, responseObj) {
			console.info("Transformer Factory [" + factoryURI + "] registered. (" + responseObj.getResponseHeader('Location') + ")");
		});
	}
};

P3Check.prototype.registerFactories = function (factoryURIs) {
	if(this.platformStatus == "new") {
		for(var i=0; i<factoryURIs.length; i++) {
			this.registerFactory(factoryURIs[i]);
		}
	}
};

P3Check.prototype.registerTransformer = function (transformerURI) {
	if(this.platformStatus == "new") {
		var postTrRequest = $.ajax({	type: 'POST',
										url: this.trContainer,
										headers: { 'Content-Type': 'text/turtle' },
										data: '<> a <http://www.w3.org/ns/ldp#DirectContainer> ; ' +
												' <http://purl.org/dc/terms/title> "Transformer" ; ' +
												' <http://vocab.fusepool.info/eldp#transformer> <' + transformerURI + '> . ',
										contentType: 'text/turtle'
									});
									
		postTrRequest.done(function(response, textStatus, responseObj) {
			console.info("Transformer [" + transformerURI + "] registered. (" + responseObj.getResponseHeader('Location') + ")");
		});
	}
};

P3Check.prototype.registerTransformers = function (transformerURIs) {
	if(this.platformStatus == "new") {
		for(var i=0; i<transformerURIs.length; i++) {
			this.registerTransformer(transformerURIs[i]);
		}
	}
};

var P3Check = new P3Check();
