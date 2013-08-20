KSLITE.add("test-w", function(S){
    S.log("from mod: test-w is attached");
}, {
    requires: ['test-x']
});
KSLITE.log("from mod: test-w is loaded");
