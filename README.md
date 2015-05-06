# p3-autoconfiguration-tool

A JS library for checking the availability of the Platform URI and creating all the required resources.
Usage:

    P3Check.initP3Platform("http://myp3.example.org:8181/platform","http://myp3.example.org/sparql");
    P3Check.registerFactory("http://myp3.example.org:8181/fact1");
    P3Check.registerTransformer("http://myp3.example.org:8383/t1");

Alternatively, you can call these functions with arrays of URIs:

    P3Check.registerFactories(["http://myp3.example.org:8181/fact1","http://myp3.example.org:8282/fact2"]);
    P3Check.registerTransformers(["http://myp3.example.org:8383/t1","http://myp3.example.org:8383/t2"]);

You can provide title and description for transformers and factories using the second and third, optional parameters of the methods:

    P3Check.registerFactory("http://myp3.example.org:8181/fact1", "Factory 1", "This is my first factory.");
    P3Check.registerFactory("http://myp3.example.org:8181/fact2", "Factory 2", "This is my second factory.");
    P3Check.registerTransformer("http://myp3.example.org:8383/t1", "Transformer 1", "This is my first transformer.");
