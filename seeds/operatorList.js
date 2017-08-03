/**
 * Created by sabash on 6/6/17.
 */


var operatorDB = require('./../model/operator')


var data = fs.readFileSync('./public/jsons/generalOperatorList.json');

var opList = JSON.parse(data);

var arr = [];

for (var x in opList) {

    var operator = new operatorDB(opList[x])

    operatorDB.create(operator,function (err,create) {

    })

}


console.log('executed successfully')