//KSLITE.add("test-increment", function(S){
//    S.increment = {};
//    S.increment.increment = function(a){
//        return a + 1;
//    };
//}, {
//    requires: ['test-math']
//});

KSLITE.declare(['test-math'], function(require, exports){	
	var add = require('test-math').add;
    exports.increment = function(a){
        return add(a,1);
    };
});
