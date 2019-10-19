const jwt = require('jsonwebtoken');
const db = require('./db');

module.exports = (options) => {
    return (req, res, next) => {
        jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
           if (!err) {
               req.userData = decoded;
               db.query(`SELECT * FROM users WHERE id='${decoded.userId}'`, (err, data) => {
                   if (!err) {
                       if (data[0].role >= options.role) {
                           next();
                       } else {
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
               res.status(401).json({
                   'message': 'Auth Failed'
               });Z
           }
        });
    }
};