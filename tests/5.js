KSLITE.add("test-5_1", function(S){
    S.log("from mod: test-5_1 is attached");
});
KSLITE.log("from mod: test-5_1 is loaded");


KSLITE.add("test-5", function(S){
    S.log("from mod: test-5 is attached");
}, {
    requires: ['test-5_1']
});
KSLITE.log("from mod: test-5 is loaded");

