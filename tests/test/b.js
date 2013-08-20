KSLITE.add("test-b", function(S){
    S.log("from mod: test-b is attached");
}, {
    requires: ['test-a']
});
KSLITE.log("from mod: test-b is loaded");
