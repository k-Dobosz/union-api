const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const logger = require('../logger');

/**
 * @api {get} /api/device/:deviceId Get info about device
 * @apiName GetDevice
 * @apiGroup Device
 *
 * @apiParam {Number} deviceId Device ID
 *
 * @apiSuccess {Object[]} data Device data
 * @apiSuccess {Number} device.id Device id
 * @apiSuccess {Number} device.pin Device pin
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "pin: "1234"
 *         }
 *     ]
 * }
 */

router.get('/:deviceId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const deviceId = req.params.deviceId;

    if (deviceId !== undefined) {
        db.query(`SELECT * FROM devices WHERE id = ?`, [ deviceId ], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('device', `GetDevice (deviceId: ${deviceId})`);
                        res.status(200).json({
                            'data': data
                        });
                        break;
                    case 0:
                        logger('device', `Error 404 - GetDevice (deviceId: ${deviceId})`);
                        res.status(404).json({
                            'message': 'Device with provided id not found'
                        });
                        break;
                    default:
                        logger('device', `Error 500 - GetDevice (deviceId: ${deviceId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('device', `Error 500 - GetDevice (deviceId: ${deviceId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - GetDevice`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/device/register Register new device
 * @apiName RegisterDevice
 * @apiGroup Device
 *
 * @apiParam {Number} pin Device PIN
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Device successfully registered",
 *     "id": "12"
 * }
 */

router.post('/register', (req, res, next) => {
    let pin = req.body.pin;

    if (pin !== undefined) {
        db.query(`INSERT INTO devices VALUES(NULL, ?, NULL, NULL)`, [ pin ], (err, data) => {
            if (!err) {
                logger('device', `RegisterDevice (deviceId: ${data.insertId})`);
                res.status(201).json({
                    'message': 'Device successfully registered',
                    'id': data.insertId
                });
            } else {
                logger('device', `Error 500 - RegisterDevice`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - RegisterDevice`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/device/login Login
 * @apiName LoginDevice
 * @apiGroup Device
 *
 * @apiParam {Number} id Device ID
 * @apiParam {Number} pin Device PIN
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "Auth successful",
 * }
 */

router.post('/login', (req, res, next) => {
    const id = req.body.id;
    const pin = req.body.pin;

    if (id !== undefined && pin !== undefined) {
        db.query(`SELECT * FROM devices WHERE id = ?`, [ id ], (err, data) => {
            if (!err) {
                if (pin === data[0].pin) {
                    logger('device', `LoginDevice (deviceId: ${id})`);
                    res.status(200).json({
                        'message': 'Auth successful'
                    });
                } else {
                    logger('device', `Error 401 - LoginDevice (deviceId: ${id})`);
                    res.status(401).json({
                        'message': 'Auth failed'
                    });
                }
            } else {
                logger('device', `Error 500 - LoginDevice (deviceId: ${id})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - LoginDevice`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {delete} /api/device/:deviceId Delete device
 * @apiName DeleteDevice
 * @apiGroup Device
 *
 * @apiParam {Number} deviceId Device ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "Device successfully deleted",
 * }
 */

router.delete('/:deviceId', auth({ roles: [4] }), (req, res, next) => {
    const deviceId = req.params.deviceId;

    if (deviceId !== undefined) {
        db.query(`SELECT * FROM devices WHERE id = ?`, [ deviceId ], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        db.query(`DELETE FROM devices WHERE id = ?`, [ deviceId ], (err, data) => {
                            if (!err) {
                                logger('device', `DeleteDevice (deviceId: ${deviceId})`);
                                res.status(200).json({
                                    'message': 'Device successfully deleted'
                                });
                            } else {
                                logger('device', `Error 500 - DeleteDevice (deviceId: ${deviceId})`);
                                res.status(500).json({
                                    'error': err
                                });
                            }
                        });
                        break;
                    case 0:
                        logger('device', `Error 404 - DeleteDevice (deviceId: ${deviceId})`);
                        res.status(404).json({
                            'message': 'Device not found'
                        });
                        break;
                    default:
                        logger('device', `Error 500 - DeleteDevice (deviceId: ${deviceId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('device', `Error 500 - DeleteDevice (deviceId: ${deviceId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - DeleteDevice`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/device/adduser Add user to the device
 * @apiName AddUserToDevice
 * @apiGroup Device
 *
 * @apiParam {Number} userId User ID
 * @apiParam {Number} deviceId Device ID
 * @apiParam {Number} device_verify_pin Device verification PIN
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "Device added"
 * }
 */

router.post('/adduser', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const userId = req.body.userId;
    const deviceId = req.body.deviceId;
    const device_verify_pin = parseInt(req.body.device_verify_pin);

    if (userId !== undefined && deviceId !== undefined && device_verify_pin !== undefined) {
        db.query(`SELECT * FROM devices WHERE id = ?`, [ deviceId ], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        db.query(`SELECT * FROM device_verification_pins WHERE deviceId = ?`, [ deviceId ], (err, data) => {
                            if (!err) {
                                if (data[0].date > Date.now() - 30000) {
                                    switch (data.length) {
                                        case 1:
                                            if (data[0].pin === device_verify_pin) {
                                                db.query(`SELECT * FROM users WHERE id = ?`, [ userId ], (err, data) => {
                                                    if (!err) {
                                                        switch (data.length) {
                                                            case 1:
                                                                db.query(`SELECT * FROM device_user WHERE deviceId = ? AND userId = ?`, [ deviceId, userId ], (err, data) => {
                                                                    if (!err) {
                                                                        switch (data.length) {
                                                                            case 1:
                                                                                logger('device', `Error 409 - AddUserToDevice (deviceId: ${deviceId})`);
                                                                                res.status(409).json({
                                                                                    'message': 'Device already added to this user'
                                                                                });
                                                                                break;
                                                                            case 0:
                                                                                db.query(`INSERT INTO device_user VALUES(NULL, ?, ?)`, [ userId, deviceId ], (err, data) => {
                                                                                    if (!err) {
                                                                                        logger('device', `AddUserToDevice (deviceId: ${deviceId})`);
                                                                                        res.status(200).json({
                                                                                            'message': 'Device added'
                                                                                        });
                                                                                    } else {
                                                                                        logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                                                                                        res.status(500).json({
                                                                                            'message': 'Database error'
                                                                                        });
                                                                                    }
                                                                                });
                                                                                break;
                                                                            default:
                                                                                logger('device', `Error 409 - AddUserToDevice (deviceId: ${deviceId})`);
                                                                                res.status(409).json({
                                                                                    'message': 'Device already added to this user'
                                                                                });
                                                                                break;
                                                                        }
                                                                    } else {
                                                                        logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                                                                        res.status(500).json({
                                                                            'error': err
                                                                        });
                                                                    }
                                                                });
                                                                break;
                                                            case 0:
                                                                logger('device', `Error 404 - AddUserToDevice (deviceId: ${deviceId})`);
                                                                res.status(404).json({
                                                                    'messsage': 'User with provided id not found'
                                                                });
                                                                break;
                                                            default:
                                                                logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                                                                res.status(500).json({
                                                                    'message': 'Database error'
                                                                });
                                                                break;
                                                        }
                                                    } else {
                                                        logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                                                        res.status(500).json({
                                                            'error': err
                                                        });
                                                    }
                                                });
                                            } else {
                                                logger('device', `Error 400 - AddUserToDevice (deviceId: ${deviceId})`);
                                                res.status(400).json({
                                                    'message': 'Adding failed'
                                                });
                                            }
                                            break;
                                        case 0:
                                            logger('device', `Error 404 - AddUserToDevice (deviceId: ${deviceId})`);
                                            res.status(404).json({
                                                'message': 'Device with provided id not found'
                                            });
                                            break;
                                        default:
                                            logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                                            res.status(500).json({
                                                'message': 'Database error'
                                            });
                                            break;
                                    }
                                } else {
                                    res.status(400).json({
                                        'message': 'Verification pin expired'
                                    });
                                }
                            } else {
                                logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                                res.status(500).json({
                                    'error': err
                                });
                            }
                        });
                        break;
                    case 0:
                        logger('device', `Error 404 - AddUserToDevice (deviceId: ${deviceId})`);
                        res.status(404).json({
                            'message': 'Device with provided uid not found'
                        });
                        break;
                    default:
                        logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('device', `Error 500 - AddUserToDevice (deviceId: ${deviceId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - AddUserToDevice`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {delete} /api/device/deluser Delete user from the device
 * @apiName DeleteUserFromDevice
 * @apiGroup Device
 *
 * @apiParam {Number} userId User ID
 * @apiParam {Number} deviceId Device ID
 * @apiParam {Number} device_verify_pin Device verification PIN
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "User successfully deleted from device"
 * }
 */

router.post('/deluser', (req, res, next) => {
    const userId = req.body.userId;
    const deviceId = req.body.deviceId;

    if (userId !== undefined && deviceId !== undefined) {
        db.query(`SELECT * FROM device_user WHERE userId = ? AND deviceId = ?`, [ userId, deviceId], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        db.query(`DELETE FROM device_user WHERE userId = ? AND deviceId = ?`, [ userId, deviceId ], (err, data) => {
                            if (!err) {
                                logger('device', `DeleteUserFromDevice (deviceId: ${deviceId})`);
                                res.status(200).json({
                                    'message': 'User successfully deleted from device'
                                });
                            } else {
                                logger('device', `Error 500 - DeleteUserFromDevice (deviceId: ${deviceId})`);
                                res.status(500).json({
                                    'error': err
                                });
                            }
                        });
                        break;
                    case 0:
                        logger('device', `Error 404 - DeleteUserFromDevice (deviceId: ${deviceId})`);
                        res.status(404).json({
                            'message': 'Device not found'
                        });
                        break;
                    default:
                        logger('device', `Error 500 - DeleteUserFromDevice (deviceId: ${deviceId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('device', `Error 500 - DeleteUserFromDevice (deviceId: ${deviceId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - DeleteUserFromDevice`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/device/verify Creates device verification pin
 * @apiName VerifyDevice
 * @apiGroup Device
 *
 * @apiParam {Number} deviceId Device ID
 * @apiParam {Number} device_verify_pin Device verification PIN
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Verification pin created successfully"
 * }
 */

router.post('/verify', (req, res, next) => {
   const deviceId = req.body.deviceId;
   const device_verify_pin = req.body.device_verify_pin;

   if (deviceId !== undefined && device_verify_pin !== undefined) {
       db.query(`SELECT * FROM device_verification_pins WHERE deviceId = ?`, [ deviceId ], (err, data) => {
           if (!err) {
               switch (data.length) {
                   case 1:
                       db.query(`UPDATE device_verification_pins SET pin = ? WHERE deviceId = ?`, [ device_verify_pin, deviceId ],  (err, data) => {
                           if (!err) {
                               logger('device', `VerifyDevice (deviceId: ${deviceId})`);
                               res.status(200).json({
                                   'message': 'Verification pin updated successfully'
                               });
                           } else {
                               logger('device', `Error 500 - VerifyDevice (deviceId: ${deviceId})`);
                               res.status(500).json({
                                   'error': err
                               });
                           }
                       });
                       break;
                   case 0:
                       db.query(`INSERT INTO device_verification_pins VALUES(NULL, ?, ?, CURRENT_TIMESTAMP)`, [ deviceId, device_verify_pin ], (err, data) => {
                           if (!err) {
                               logger('device', `VerifyDevice (deviceId: ${deviceId})`);
                               res.status(201).json({
                                   'message': 'Verification pin created successfully'
                               });
                           } else {
                               logger('device', `Error 500 - VerifyDevice (deviceId: ${deviceId})`);
                               res.status(500).json({
                                   'error': err
                               });
                           }
                       });
                       break;
                   default:
                       db.query(`UPDATE device_verification_pins SET pin = ? WHERE deviceId = ?`, [ device_verify_pin, deviceId ], (err, data) => {
                           if (!err) {
                               logger('device', `VerifyDevice (deviceId: ${deviceId})`);
                               res.status(200).json({
                                   'message': 'Verification pin updated successfully'
                               });
                           } else {
                               logger('device', `Error 500 - VerifyDevice (deviceId: ${deviceId})`);
                               res.status(500).json({
                                   'error': err
                               });
                           }
                       });
                       break;
               }
           } else {
               logger('device', `Error 500 - VerifyDevice (deviceId: ${deviceId})`);
               res.status(500).json({
                   'error': err
               });
           }
       });
   } else {
       logger('device', `Error 400 - VerifyDevice`);
       res.status(400).json({
           'message': 'Not enough data provided'
       });
   }
});

/**
 * @api {post} /api/device/card/scan Creates new visit for owner of scanned card
 * @apiName cardScan
 * @apiGroup Device
 *
 * @apiParam {Number} deviceId Device ID
 * @apiParam {Number} cardUid Card UID
 * @apiParam {Number} cardPin Card PIN
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "messsage": "New visit created"
 * }
 */

router.post('/card/scan', (req, res, next) => {
    const deviceId = req.body.deviceId;
    const cardUid = req.body.cardUid;
    const cardPin = req.body.cardPin;

    console.log(cardUid);

    if (deviceId !== undefined && cardPin !== undefined && cardPin !== undefined) {
        db.query(`SELECT * FROM cards WHERE cardUid = ?`, [ cardUid ], (err, data_card) => {
            if (!err) {
                switch (data_card.length) {
                    case 1:
                        if (data_card[0].pin === cardPin) {
                            db.query(`SELECT last_user FROM devices WHERE id = ?`, [ deviceId ], (err, data_dev) => {
                                if (!err) {
                                    switch (data_dev.length) {
                                        case 1:
                                            db.query(`SELECT * FROM visits WHERE doctorId = ? AND patientId = ? AND DATE(date) = DATE(NOW()) `, [ data_dev[0].last_user, data_card[0].userId ], (err, data_visits) => {
                                                if (!err) {
                                                    if (data_visits.length >= 1) {
                                                        logger('device', `Status 304 - cardScan (cardUid: ${cardUid})`);
                                                        res.status(200).json({
                                                            'messsage': 'Visit already exists'
                                                        });
                                                    } else {
                                                        // id, reason, description, doctorId, patientId, date
                                                        db.query(`INSERT INTO visits VALUES(NULL, '', '', ?, ?, CURRENT_TIMESTAMP)`, [ data_dev[0].last_user, data_card[0].userId ], (err, data) => {
                                                            if (!err) {
                                                                logger('device', `cardScan (cardUid: ${cardUid})`);
                                                                res.status(201).json({
                                                                    'message': 'New visit created'
                                                                });
                                                            } else {
                                                                logger('device', `Error 500 - cardScan (cardUid: ${cardUid})`);
                                                                console.error(err);
                                                                res.status(500).json({
                                                                    'error': err
                                                                });
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    logger('device', `Error 500 - cardScan (cardUid: ${cardUid})`);
                                                    console.error(err);
                                                    res.status(500).json({
                                                        'error': err
                                                    });
                                                }
                                            });
                                            break;
                                        case 0:
                                            logger('device', `Error 404 - cardScan (cardUid: ${cardUid})`);
                                            res.status(404).json({
                                                'message': 'Device with provided id does not exist'
                                            });
                                            break;
                                        default:
                                            logger('device', `Error 409 - cardScan (cardUid: ${cardUid})`);
                                            res.status(409).json({
                                                'error': 'Found several devices with the same id'
                                            });
                                            break;
                                    }
                                } else {
                                    logger('device', `Error 500 - cardScan (cardUid: ${cardUid})`);
                                    console.error(err);
                                    res.status(500).json({
                                        'error': err
                                    });
                                }
                            });
                        } else {
                            logger('device', `Error 400 - cardScan (cardUid: ${cardUid})`);
                            res.status(400).json({
                                'message': 'Card authentication failed'
                            });
                        }
                        break;
                    case 0:
                        logger('device', `Error 404 - cardScan (cardUid: ${cardUid})`);
                        res.status(404).json({
                            'message': 'Card with provided uid not found'
                        });
                        break;
                    default:
                        logger('device', `Error 409 - cardScan (cardUid: ${cardUid})`);
                        res.status(409).json({
                            'error': 'Found several cards with the same uid'
                        });
                        break;
                }
            } else {
                logger('device', `Error 500 - cardScan (cardUid: ${cardUid})`);
                console.error(err);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('device', `Error 400 - cardScan (cardUid: ${cardUid})`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/device/choose Creates new visit for owner of scanned card
 * @apiName chooseDevice
 * @apiGroup Device
 *
 * @apiParam {Number} deviceId Device ID
 * @apiParam {Number} userId User ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "messsage": "Device last user has been updated"
 * }
 */

router.post('/choose', (req, res, next) => {
   const deviceId = req.body.deviceId;
   const userId = req.body.userId;

   if (deviceId !== undefined && userId !== undefined) {
       db.query(`UPDATE devices SET last_user = ? WHERE id = ?`, [ userId, deviceId ], (err, data) => {
          if (!err) {
              logger('device', `Error 500 - chooseDevice (deviceId: ${deviceId})`);
              res.status(200).json({
                  'message': 'Device last user has been updated'
              });
          } else {
              logger('device', `Error 500 - chooseDevice (deviceId: ${deviceId})`);
              res.status(500).json({
                 'err': err
              });
          }
       });
   } else {
       logger('device', `Error 400 - chooseDevice`);
       res.status(400).json({
           'message': 'Not enough data provided'
       });
   }
});

module.exports = router;
