const db = require('./db');

module.exports = (type, message) => {
  db.query(`INSERT INTO logs VALUES(NULL, '${type}', '${message}', CURRENT_TIMESTAMP)`, (err, data) => {
     if (!err) {
         console.log('Log entry added');
     } else {
         console.error(err);
     }
  });
};