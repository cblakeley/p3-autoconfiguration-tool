
/* global Promise */

function P3Check() {

    this.platformStatus = "unknown";

    this.platformURI = "";
    this.sparqlEndpoint = "";

    this.uirContainer = "";
    this.tfrContainer = "";
    this.trContainer = "";
    this.dcrContainer = "";

    if (typeof jQuery === 'undefined') {
        console.error("You must include jQuery before this library.");
    }
}

P3Check.prototype.initP3Platform = function (platformURI, sparqlEndpoint) {
    var main = this;
    this.platformURI = platformURI;
    this.sparqlEndpoint = sparqlEndpoint;

    return new Promise(function (resolve, reject) {


        var ajaxRequest = jQuery.ajax({type: "GET",
            url: platformURI,
            async: true});
        ajaxRequest.done(function (response, textStatus, responseObj) {
            console.info("Platform checked, already has configuration entries. (status " + responseObj.status + ")");
            main.platformStatus = "existing";
            resolve(main);
        });
        ajaxRequest.fail(function (responseObj, textStatus, response) {
            console.info("Platform checked, no configuration entry found. (status " + responseObj.status + ")");
            if (responseObj.status === 404) {

                ////////// PUTTING STUFF ///////////////

                // Create the platform resource			
                var putPlatformRequest = $.ajax({type: 'PUT',
                    url: platformURI,
                    headers: {'Content-Type': 'text/turtle'},
                    data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
                            '<http://www.w3.org/2000/01/rdf-schema#label> "P3 Platform"@en ; ' +
                            '<http://www.w3.org/2000/01/rdf-schema#comment> "An instance of the P3 platform"@en ; ' +
                            '<http://www.w3.org/2003/06/sw-vocab-status/ns#term_status> "unstable" ;' +
                            '<http://purl.org/dc/terms/title> "Platform Configuration" ; ' +
                            '<http://vocab.fusepool.info/fp3#sparqlEndpoint> <' + sparqlEndpoint + '> ; ' +
                            '<http://vocab.fusepool.info/fp3#userInteractionRegistry> <' + platformURI + '/uir> ; ' +
                            '<http://vocab.fusepool.info/fp3#transformerFactoryRegistry> <' + platformURI + '/tfr> ; ' +
                            '<http://vocab.fusepool.info/fp3#transformerRegistry> <' + platformURI + '/tr> ; ' +
                            '<http://vocab.fusepool.info/fp3#dashboardConfigRegistry> <' + platformURI + '/dcr> . ',
                    async: true
                });

                putPlatformRequest.done(function (response, textStatus, responseObj) {

                    console.info("Platform Configuration Resource created. (" + main.platformURI + ")");

                    // 1. creating a user interaction registry
                    var putUirRequest = $.ajax({type: 'PUT',
                        url: platformURI + '/uir',
                        headers: {'Content-Type': 'text/turtle'},
                        data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
                                ' <http://www.w3.org/2000/01/rdf-schema#label> "Interaction Request Container"@en ; ' +
                                ' <http://www.w3.org/2000/01/rdf-schema#comment> "Points to the Interaction Request Container"@en . ',
                        async: true
                    });

                    putUirRequest.done(function (response, textStatus, responseObj) {
                        main.uirContainer = responseObj.getResponseHeader('Location');
                        console.info("User Interaction Registry created. (" + main.uirContainer + ")");

                        // 2. creating a transformer factory registry
                        var putTfrRequest = $.ajax({type: 'PUT',
                            url: platformURI + '/tfr',
                            headers: {'Content-Type': 'text/turtle'},
                            data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
                                    ' <http://www.w3.org/2000/01/rdf-schema#label> "Transformer Factory Registry"@en ; ' +
                                    ' <http://www.w3.org/2000/01/rdf-schema#comment> "Points to the transformer factory registry"@en . ',
                            async: true
                        });

                        putTfrRequest.done(function (response, textStatus, responseObj) {
                            main.tfrContainer = responseObj.getResponseHeader('Location');
                            console.info("Transformer Factory Registry created. (" + main.tfrContainer + ")");

                            // 3. creating a transformer registry
                            var putTrRequest = $.ajax({type: 'PUT',
                                url: platformURI + '/tr',
                                headers: {'Content-Type': 'text/turtle'},
                                data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
                                        ' <http://www.w3.org/2000/01/rdf-schema#label> "Transformer Registry"@en ; ' +
                                        ' <http://www.w3.org/2000/01/rdf-schema#comment> "Points to the transformer registry"@en . ',
                                async: true
                            });

                            putTrRequest.done(function (response, textStatus, responseObj) {
                                main.trContainer = responseObj.getResponseHeader('Location');
                                console.info("Transformer Registry created. (" + main.trContainer + ")");

                                // 4. creating a dashboard config registry
                                var putDcrRequest = $.ajax({type: 'PUT',
                                    url: platformURI + '/dcr',
                                    headers: {'Content-Type': 'text/turtle'},
                                    data: '<> a <http://www.w3.org/ns/ldp#BasicContainer> ; ' +
                                            ' <http://www.w3.org/2000/01/rdf-schema#label> "Dashboard Config Registry"@en ; ' +
                                            ' <http://www.w3.org/2000/01/rdf-schema#comment> "Points to the dashboard config registry"@en . ',
                                    async: true
                                });

                                putDcrRequest.done(function (response, textStatus, responseObj) {
                                    main.dcrContainer = responseObj.getResponseHeader('Location');
                                    console.info("Dashboard Config Registry created. (" + main.dcrContainer + ")");

                                    // 5. creating the default dashboard config
                                    var createConfigRequest = $.ajax({
                                        type: 'POST',
                                        headers: {
                                            'Content-Type': 'text/turtle',
                                            'Slug': 'default'
                                        },
                                        async: true,
                                        url: main.dcrContainer,
                                        data: '@prefix ldp: <http://www.w3.org/ns/ldp#> . '
                                                + '@prefix dcterms: <http://purl.org/dc/terms/> .  '
                                                + '@prefix crldpc: <http://vocab.fusepool.info/crldpc#> . '
                                                + '<> a crldpc:ConfigurationRegistration ; '
                                                + '	dcterms:title "Default configuration"@en ; '
                                                + '	dcterms:description "Default dashboard configuration" ; '
                                                + '	crldpc:sparql-endpoint <' + main.sparqlEndpoint + '> ; '
                                                + '	crldpc:ir-ldpc <' + main.uirContainer + '> ; '
                                                + '	crldpc:tfr-ldpc <' + main.tfrContainer + '> ; '
                                                + '	crldpc:tr-ldpc <' + main.trContainer + '> ; '
                                                + '	crldpc:wr-ldpc <> . '
                                    });
                                    createConfigRequest.done(function (response, textStatus, responseObj) {
                                        console.info("Default dashboard configuration created. (" + responseObj.getResponseHeader('Location') + ")");

                                        main.platformStatus = "new";
                                        resolve(main);
                                    });
                                });
                            });
                        });
                    });
                });
            }
            else {
                // "error" but not a 404
                console.error("We have some serious problems... (status" + responseObj.status + ")");
                main.platformStatus = "error " + responseObj.status;
                reject(Error(main.platformStatus));
            }
        });
    });
};

P3Check.prototype.registerFactory = function (factoryURI, title, description) {
    var main = this;
    return new Promise(function (resolve, reject) {
        title = main.setDefaultValue(title, "Transformer Factory");
        description = main.setDefaultValue(description, "Transformer Factory");

        if (main.platformStatus === "new") {
            var postTfrRequest = $.ajax({type: 'POST',
                url: main.tfrContainer,
                headers: {'Content-Type': 'text/turtle', 'Slug': title},
                async: true,
                data: '<> a <http://vocab.fusepool.info/tfrldpc#TransformerFactoryRegistration> ; ' +
                        ' <http://purl.org/dc/terms/title> "' + title + '" ; ' +
                        ' <http://purl.org/dc/terms/description> "' + description + '" ; ' +
                        ' <http://vocab.fusepool.info/tfrldpc#transformerFactory> <' + factoryURI + '> . ',
                contentType: 'text/turtle'
            });

            postTfrRequest.done(function (response, textStatus, responseObj) {
                console.info("Transformer Factory [" + factoryURI + "] registered. (" + responseObj.getResponseHeader('Location') + ")");
                resolve();
            });
            postTfrRequest.fail(function(failure) {
                reject(Error(failure));
            });
        }
        resolve(main);
    });
};

P3Check.prototype.registerFactories = function (factoryURIs) {
    var main = this;
    return new Promise.all(factoryURIs.map(function(uri) {
        return main.registerFactory(factoryURIs[i]);
    }));
};

P3Check.prototype.registerTransformer = function (transformerURI, title, description) {
    var main = this;
    return new Promise(function (resolve, reject) {
        title = main.setDefaultValue(title, "Transformer");
        description = main.setDefaultValue(description, "Transformer");

        if (main.platformStatus === "new") {
            var postTrRequest = $.ajax({type: 'POST',
                url: main.trContainer,
                headers: {'Content-Type': 'text/turtle', 'Slug': title},
                async: true,
                data: '<> a <http://vocab.fusepool.info/trldpc#TransformerRegistration> ; ' +
                        ' <http://purl.org/dc/terms/title> "' + title + '" ; ' +
                        ' <http://purl.org/dc/terms/description> "' + description + '" ; ' +
                        ' <http://vocab.fusepool.info/trldpc#transformer> <' + transformerURI + '> . ',
                contentType: 'text/turtle'
            });

            postTrRequest.done(function (response, textStatus, responseObj) {
                console.info("Transformer [" + transformerURI + "] registered. (" + responseObj.getResponseHeader('Location') + ")");
                resolve();
            });
            postTrRequest.fail(function(failure) {
                reject(Error(failure));
            });
        }
        resolve(main);
    });
};

P3Check.prototype.registerTransformers = function (transformerURIs) {
    var main = this;
    return new Promise.all(transformerURIs.map(function(uri) {
        return main.registerTransformer(transformerURIs[i]);
    }));
};

P3Check.prototype.setDefaultValue = function(variable, defaultValue) {
    return typeof variable !== 'undefined' ? variable : defaultValue;
}

P3Check.prototype.configureStanbol = function (stanbolBase, platform) {
    var attemptsCounter = 0;
    var main = this;
    return new Promise(function (resolve, reject) {
        var attempt = function() {
            
            var getRequest = $.ajax({type: 'POST',
                url: stanbolBase + "fusepool/config/",
                data: {fusepool: platform},
                async: true
            });
            getRequest.done(function() {
               resolve(main); 
            });
            getRequest.fail(function() {
                if (attemptsCounter++ > 20) {
                    reject(Error("Have been waiting for stanbol too long"));
                } else {
                    console.log("Stanbol request failed, retrying....");
                    setTimeout(function(){ 
                        attempt();
                    }, 1000);
                }
            });
        };
        attempt();
    });
}

var P3Check = new P3Check();
