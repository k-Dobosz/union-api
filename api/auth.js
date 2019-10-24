const jwt = require('jsonwebtoken');
const db = require('./db');

module.exports = (options) => {
    return (req, res, next) => {
        let jwt_token
        if (req.headers.authorization !== undefined) {
            jwt_token = req.headers.authorization.split(" ")[1]
        } else {
            jwt_token = req.body.token;
        }
        jwt.verify(jwt_token, process.env.JWT_SECRET, (err, decoded) => {
           if (!err) {
               req.userData = decoded;
               db.query(`SELECT * FROM users WHERE id='${decoded.userId}'`, (err, data) => {
                   if (!err) {
                       if (options.roles.indexOf(data[0].role) != -1) {
                           next();
                       } else {
                           console.log('Not enough permissions');
                           return res.status(401).json({
                               'message': 'Auth failed'
                           });
                       }
                   } else {
                       return res.status(500).json({
                           'error': err
                       });
                   }
               });
           } else {
               console.log('Token expired ' + jwt_token);
               res.status(401).json({
                   'message': 'Auth Failed'
               });
           }
        });
    }
};