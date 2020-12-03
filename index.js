var tbl = [];
var headers = [];

module.exports.tabularize = function(items) {

    // fills tbl and header arrays
    extractMembers(items, 'data', []);

    // tabularize array for Excel
    const finalTbl = new Array(tbl.length);
  
    for (let i = 0; i < tbl.length; i++) {
      const finalRow = new Array(headers.length);
  
      for(let j = 0; j < tbl[i].length; j++) {
        if(typeof tbl[i][j] !== 'undefined') {
          finalRow[headers.indexOf(tbl[i][j]["key"])] = tbl[i][j]["val"];
        }
      }
      finalTbl[i] = finalRow;
    };
  
    finalTbl.unshift(headers);
    return finalTbl;
}

function extractMembers(item, parent, row) {

    var keys = orderedKeys(item);

    keys.primitive.forEach(key => {
        var fullkey = parent + '.' + key;
        row.push({key: fullkey, val: item[key]});

        // add header in header index
        if (headers.indexOf(fullkey) == -1) {
            headers.push(fullkey);
        }
    });

    keys.oneToMany.forEach(key => {
        var fullkey = parent + '.' + key;
        var list = item[key];
        list.forEach(listitem => {
            // slice array to create a new object
            extractMembers(listitem, fullkey, row.slice(0));
        })
    });

    keys.oneToOne.forEach(key => {
        var fullkey = parent + '.' + key;
        extractMembers(item[key], fullkey,  row);
    });

    if (keys.oneToMany.length == 0 && keys.oneToOne.length == 0) {
        // leaf of node, push row to array
        tbl.push(row);
    }
}

function isPrimitive(value) {
    switch(typeof(value)) {
      case 'string':
      case 'number':
      case 'null':
        return true;
      default:
        return false;
    }
}

function isObject(value) {
    return 'object' === typeof(value) && !Array.isArray(value); 
}
  
function isArray(value) {
    return Array.isArray(value);
}

function orderedKeys(obj) {
    var types = {primitive: [], oneToOne: [], oneToMany: [] };
    if(isPrimitive(obj)) { return types; }
    Object.keys(obj).forEach(function(key) {
        var prop = obj[key];
        if(isPrimitive(prop)) { types.primitive.push(key); }
        else if(isObject(prop) // Assumes no nested one-to-manys
                || (isArray(prop) && isPrimitive(prop[0]))) // Arrays of primitives will be flattened
            { types.oneToOne.push(key); } 
        else if(isArray(prop) || isObject(prop[0])) {
        { types.oneToMany.push(key); }
        }
    });
    Object.keys(types).forEach(function(type) {
        types[type].sort();
    });
    return types;
}