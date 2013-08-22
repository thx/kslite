KSLITE.add("test-circlea", function(S){
    S.log("from mod: test-circlea is attached");
}, {
    requires: ['test-circleb']
});
KSLITE.log("from mod: test-circlea is loaded");
