KSLITE.add("test-y", function(S){
    S.log("from mod: test-y is attached");
}, {
    requires: ['test-z']
});
KSLITE.log("from mod: test-y is loaded");
