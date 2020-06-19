//INSERT INTO `morning`.`users` (`Id`, `FirstName`, `LastName`) VALUES ('800', 'ghg', 'hgghg');
//`INSERT INTO 'morning'.'users' ('Id', 'FirstName', 'LastName' ) VALUES (${UsId}, '${FN}', ${LN});`

let mysql = require('mysql')
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'morning'
})

module.exports.sentStartDate = async function (FN, LN, UsId) {
    connection.query(`INSERT INTO \`morning\`.\`users\` (\`Id\`, \`FirstName\`, \`LastName\`) VALUES ('${UsId}', '${FN}', '${LN}');`, function (error, results, fields) {
      if (error) {
        console.log(error)
      }else{
        console.log('The results is: ', results)
      }
    })
}

module.exports.sentDataKnow = async function (num, id) {
  if(num == 1) qw =`UPDATE \`morning\`.\`users\` SET \`Weather\` = '1' WHERE (\`Id\` = '${id}');`
  else if(num == 2) qw =`UPDATE \`morning\`.\`users\` SET \`Сurrency\` = '1' WHERE (\`Id\` = '${id}');`
  else if(num == 3) qw =`UPDATE \`morning\`.\`users\` SET \`News\` = '1' WHERE (\`Id\` = '${id}');`
  connection.query(qw, function (error, results, fields) {
    if (error) {
      console.log(error)
    }else{
      console.log('The results is: ', results)
    }
  })
}

module.exports.sentDateTime = async function (time, id) {
  connection.query(`UPDATE \`morning\`.\`users\` SET \`time\` = '${time}' WHERE (\`Id\` = '${id}');`, function (error, results, fields) {
    if (error) {
      console.log(error)
    }else{
      console.log('The results is: ', results)
    }
  })
}

module.exports.getTime =  connection.query('SELECT time FROM morning.users;')
