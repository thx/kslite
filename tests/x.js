KSLITE.add("test-x", function(S){
    S.log("from mod: test-x is attached");
}, {
    requires: ['test-y']
});
KSLITE.log("from mod: test-x is loaded");
