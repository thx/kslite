//KSLITE.add("test-program", function(S){
//    alert(S.increment.increment(1));
//}, {
//    requires: ['test-increment']
//});


KSLITE.declare(["test-increment"], function(require, exports){
    var inc = require("test-increment").increment;
	exports.result = inc(1); 
});
