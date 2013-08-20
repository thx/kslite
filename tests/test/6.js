KSLITE.add("test-6", function(S){
    S.log("from mod: test-6 is attached");
}, {
    requires: ['test-6_1']
});
KSLITE.log("from mod: test-6 is loaded");

KSLITE.add("test-6_1_1", function(S){
    S.log("from mod: test-6_1_1 is attached");
});
KSLITE.log("from mod: test-6_1_1 is loaded");

KSLITE.add("test-6_1", function(S){
    S.log("from mod: test-6_1 is attached");
}, {
    requires: ['test-6_1_1']
});
KSLITE.log("from mod: test-6_1 is loaded");
