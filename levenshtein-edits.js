"use strict";

(function() {

  if( typeof exports !== 'undefined' ) {
    if( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = levenshteinEdits;
    }
    exports.levenshteinEdits = levenshteinEdits;
  } 
  else {
    root.levenshteinEdits = levenshteinEdits;
  }

  function levenshteinEdits(a, b, options){

    var equalityFunc = options && typeof(options.equalityFunc) === 'function' ? options.equalityFunc : function(a,b) {return a===b;};
    // Use strict equality if equality function is not provided. 

    var weights = {substitute: 2, delete: 1, insert: 1};
    if(
      options &&
      typeof(options.weights) === 'object' &&
      options.weights.substitute >= 1 &&
      options.weights.delete >= 1 &&
      options.weights.insert >= 1
    ) {
      weights = options.weights;
    };
    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [{val: i}];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = {val: j};
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        var scores = [
          matrix[i-1][j].val + weights.insert, // Insertion
          matrix[i][j-1].val + weights.delete // Deletion
        ];

        // Substitution
        if( equalityFunc(b[i-1], a[j-1]) ){
          scores.push(matrix[i-1][j-1].val);
        } else {
          scores.push(matrix[i-1][j-1].val + weights.substitute);
        }

        var min = Math.min.apply(null, scores);
        var index = scores.indexOf(min);
        if(index == 0) {
          matrix[i][j] = {val: min, parent: {i: i-1, j: j}, operation: {op: 'insert', unit: b[i - 1]}};
        } else if(index == 1) {
          matrix[i][j] = {val: min, parent: {i: i, j: j-1}, operation: {op: 'delete', unit: a[j - 1]}};
        } else if(index == 2) {
          if( b[i-1] == a[j-1]) {
            matrix[i][j] = {val: min, parent: {i: i-1,j: j-1}, operation: {op: 'retain', unit: b[i - 1]}};
          } else {
            matrix[i][j] = {val: min, parent: {i: i-1,j: j-1}, operation: {op: 'substitute', units: { from: a[i - 1], to: b[i - 1] }}};
          }
        }
      }
    }

    var current = matrix[b.length][a.length];
    var operations = [];
    while(current.parent) {
      operations.push(current.operation);
      current = matrix[current.parent.i][current.parent.j];
    }

    return { distance: matrix[b.length][a.length].val, operations: operations.reverse() };
  }
})(this);
