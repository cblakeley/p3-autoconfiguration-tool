# p3-404-check
A JS library for checking the availability of the Platform URI and creating all the required resources.
Usage:
P3Check.initP3Platform("http://myp3.example.org:8181/platform","http://myp3.example.org/sparql");
P3Check.registerFactories(["http://myp3.example.org:8181/fact1","http://myp3.example.org:8282/fact2"]);
P3Check.registerTransformer("http://myp3.example.org:8383/t1");
