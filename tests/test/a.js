KSLITE.add("test-a", function(S){
    S.log("from mod: test-a is attached");
}, {
    requires: ['test-b']
});
KSLITE.log("from mod: test-a is loaded");
