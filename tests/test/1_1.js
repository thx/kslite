KSLITE.add("test-1_1", function(S){
    S.log("from mod: test-1_1 is attached");
}, {
    requires: ['test-1_1_1', 'test-1_1_2']
});
KSLITE.log("from mod: test-1_1 is loaded");
