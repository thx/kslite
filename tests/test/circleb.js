KSLITE.add("test-circleb", function(S){
    S.log("from mod: test-circleb is attached");
}, {
    requires: ['test-circlea']
});
KSLITE.log("from mod: test-circleb is loaded");
