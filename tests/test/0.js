//KSLITE.add("test-0", function(S){
//    S.log("from mod: test-0 is attached");
//});
//
KSLITE.declare("test-0", function(require, exports, exportsParent){
    KSLITE.log("from mod: test-0 is attached");
});
KSLITE.log("from mod: test-0 is loaded");