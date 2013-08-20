KSLITE.add("test-z", function(S){
    S.log("from mod: test-z is attached");
}, {
    requires: ['test-x']
});
KSLITE.log("from mod: test-z is loaded");
