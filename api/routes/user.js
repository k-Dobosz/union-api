const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const auth = require('../auth');
const bcrypt = require('bcrypt');
const logger = require('../logger');

/**
 * @api {get} /api/user/:userId Get info about user
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id User ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "id": 1,
 *     "email": "example@example.com",
 *     "pesel": 12345678901
 *     "first_name": "Adam",
 *     "second_name": "",
 *     "last_name": "",
 *     "mother_name": "",
 *     "father_name": "",
 *     "gender": "male",
 *     "height": 180,
 *     "date_of_birth": "1999-01-01",
 *     "place_of_birth": "",
 *     "address": ""
 * }
 */

router.get('/:userId', auth({ roles: [3, 4] }), (req, res, next) => {
    const userId = req.params.userId;

    if (userId !== undefined) {
        db.query(`SELECT * FROM users WHERE id='${userId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        res.status(200).json({
                            'id': data[0].id,
                            'email': data[0].email,
                            'pesel': data[0].pesel,
                            'first_name': data[0].first_name,
                            'second_name': data[0].second_name,
                            'last_name': data[0].last_name,
                            'mother_name': data[0].mother_name,
                            'father_name': data[0].father_name,
                            'gender': data[0].gender,
                            'height': data[0].height,
                            'date_of_birth': data[0].date_of_birth,
                            'place_of_birth': data[0].place_of_birth,
                            'address': data[0].address
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'error_code': 404,
                            'message': 'User with provided id not found'
                        });
                        break;
                    default:
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/user/register Register new user
 * @apiName RegisterUser
 * @apiGroup User
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 * @apiParam {Number} pesel User pesel
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "User successfully registered",
 *     "data": []
 * }
 */

router.post('/register', auth({ roles: [4] }), (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;
   const pesel = req.body.pesel;
   const role = req.body.role || 1;
   const first_name = req.body.first_name;
   const second_name = req.body.second_name;
   const last_name = req.body.last_name;
   const mother_name = req.body.mother_name;
   const father_name = req.body.father_name;
   const gender = req.body.gender;
   const height = req.body.height;
   const date_of_birth = req.body.date_of_birth;
   const place_of_birth = req.body.place_of_birth;
   const address = req.body.address;

   if (email !== undefined &&
       password !== undefined &&
       pesel !== undefined &&
       first_name !== undefined &&
       second_name !== undefined &&
       last_name !== undefined &&
       mother_name !== undefined &&
       father_name !== undefined &&
       gender !== undefined &&
       height !== undefined &&
       date_of_birth !== undefined &&
       place_of_birth !== undefined &&
       address !== undefined
   ) {
       db.query(`SELECT * FROM users WHERE pesel='${pesel}'`, (err, data) => {
           if (!err) {
               if (data.length >= 1) {
                   res.status(500).json({
                       'message': 'User with this pesel exists'
                   });
               } else {
                   db.query(`SELECT * FROM users WHERE email='${email}'`, (err, data) => {
                       if (!err) {
                           if (data.length >= 1) {
                               res.status(500).json({
                                   'message': 'User with this email exists'
                               });
                           } else {
                               bcrypt.hash(password, 10, (err, hash) => {
                                   if (!err) {
                                       db.query(
                                           `INSERT INTO users VALUES(NULL, '${email}', '${hash}', '${pesel}', '${role}', '${first_name}', '${second_name}', '${last_name}', '${mother_name}', '${father_name}', '${gender}', '${height}','${date_of_birth}','${place_of_birth}','${address}')`, (err, data) => {
                                               if (!err) {
                                                   res.status(201).json({
                                                       'message': 'User successfully registered',
                                                       'data': data
                                                   });
                                               } else {
                                                   res.status(500).json({
                                                       'error': err
                                                   });
                                               }
                                           });
                                   } else {
                                       res.status(500).json({
                                           'error': err
                                       });
                                   }
                               });
                           }
                       } else {
                           res.status(500).json({
                               'error': err
                           });
                       }
                   });
               }
           } else {
               res.status(500).json({
                   'error': err
               });
           }
       });
   } else {
       res.status(400).json({
           'message': 'Not enough data provided'
       });
   }
});

/**
 * @api {post} /api/user/login Login
 * @apiName LoginUser
 * @apiGroup User
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "Auth successful",
 *     "token": "",
 *     "refresh_token": ""
 * }
 */

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (email !== undefined && password !== undefined) {
        db.query(`SELECT * FROM users WHERE email='${email}'`, (err, data) => {
            if (!err) {
                if (data.length === 0) {
                    return res.status(401).json({
                        'message': 'Auth failed'
                    });
                } else {
                    bcrypt.compare(password, data[0].password, (err, result) => {
                        if (!err) {
                            if (result) {
                                const token = jwt.sign(
                                    {
                                        email: data[0].email,
                                        userId: data[0].id,
                                    },
                                    process.env.JWT_SECRET,
                                    {
                                        'expiresIn': '15m'
                                    }
                                );
                                const refresh_token = jwt.sign(
                                    {
                                        userId: data[0].id,
                                    },
                                    process.env.JWT_SECRET_REF,
                                    {
                                        'expiresIn': '24h'
                                    }
                                );

                                db.query(`UPDATE users SET last_token='${token}', last_refresh_token='${refresh_token}'`, (err, updateData) => {
                                    if (!err) {
                                        logger('user', `User with id ${data[0].id} logged in`);
                                        return res.status(200).json({
                                            'message': 'Auth successful',
                                            'token': token,
                                            'refresh_token': refresh_token
                                        });
                                    } else {
                                        res.status(500).json({
                                            'error': err
                                        })
                                    }
                                });
                            } else {
                                return res.status(401).json({
                                    'message': 'Auth failed'
                                });
                            }
                        } else {
                            res.status(500).json({
                                'error': err
                            });
                        }
                    });
                }
            } else {
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {delete} /api/user/:userId Delete user
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {Number} userId User id
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "User successfully deleted",
 * }
 */

router.delete('/:userId', auth({ roles: [4] }), (req, res, next) => {
    const userId = req.params.userId;

    if (userId !== undefined) {
        db.query(`DELETE FROM users WHERE id='${userId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        res.status(200).json({
                            'message': 'User successfully deleted'
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'User not found'
                        });
                        break;
                    default:
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/user/refresh_token Refresh authentication token
 * @apiName RefreshTokenUser
 * @apiGroup User
 *
 * @apiParam {String} token Token
 * @apiParam {String} refresh_token Refresh token
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "new_token": "",
 *     "new_refresh_token": ""
 * }
 */

router.post('/refresh_token', (req, res, next) => {
   const token = req.body.token;
   const refresh_token = req.body.refresh_token;

   if (token !== undefined && refresh_token !== undefined) {
       jwt.verify(refresh_token, process.env.JWT_SECRET_REF, (err, decoded) => {
           if (!err) {
               db.query(`SELECT id, email, last_token, last_refresh_token FROM users WHERE id='${decoded.userId}'`, (err, data) => {
                   if (!err) {
                       if ((token === data[0].last_token) && (refresh_token === data[0].last_refresh_token)) {
                           const new_token = jwt.sign(
                               {
                                   email: data[0].email,
                                   userId: data[0].id,
                               },
                               process.env.JWT_SECRET,
                               {
                                   'expiresIn': '15m'
                               }
                           );
                           const new_refresh_token = jwt.sign(
                               {
                                   userId: data[0].id,
                               },
                               process.env.JWT_SECRET_REF,
                               {
                                   'expiresIn': '24h'
                               }
                           );

                           db.query(`UPDATE users SET last_token='${new_token}', last_refresh_token='${new_refresh_token}'`, (err, data) => {
                               if (!err) {
                                   res.status(200).json({
                                       'new_token': new_token,
                                       'new_refresh_token': new_refresh_token
                                   });
                               } else {
                                   res.status(500).json({
                                       'error': err
                                   });
                               }
                           });
                       } else {
                           res.status(401).json({
                               'message': 'Token refresh failed',
                           });
                       }
                   } else {
                       res.status(500).json({
                           'error': err
                       });
                   }
               });
           } else {
               res.status(401).json({
                   'message': 'Token refresh failed',
               });
           }
       });
   } else {
       res.status(400).json({
           'message': 'Not enough data provided'
       });
   }
});

router.post('/visits_today', auth({ roles: [3, 4] }), (req, res, next) => {
    const doctorId = req.body.doctorId;

    if (doctorId !== undefined) {
        db.query(`SELECT * FROM visits WHERE doctorId='${doctorId}' AND DATE(date) = DATE(NOW())`, (err, data) => {
            if (!err) {
                res.status(200).json({
                    data
                });
            } else {
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

router.post('/get_visits', auth({ roles: [3, 4] }), (req, res, next) => {
    const doctorId = req.body.doctorId;
    const patientId = req.body.patientId;

    if (doctorId !== undefined && patientId !== undefined) {
        db.query(`SELECT * FROM visits WHERE doctorId='${doctorId}' AND patientId='${patientId}' ORDER BY date`, (err, data) => {
            if (!err) {
                if (data.length > 0 ) {
                    res.status(200).json({
                        data
                    });
                } else {
                    res.status(404).json({
                        'message': ''
                    });
                }
            } else {
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

module.exports = router;