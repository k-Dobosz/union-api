const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');

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
        db.query(`SELECT * FROM devices WHERE id='${deviceId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        res.status(200).json({
                            'data': data
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'error_code': 404,
                            'message': 'Device with provided id not found'
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
        db.query(`INSERT INTO devices VALUES(NULL, '${pin}', NULL)`, (err, data) => {
            if (!err) {
                res.status(201).json({
                    'message': 'Device successfully registered',
                    'id': data.insertId
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
        db.query(`SELECT * FROM devices WHERE id='${id}'`, (err, data) => {
            if (!err) {
                if (pin === data[0].pin) {
                    res.status(200).json({
                        'message': 'Auth successful'
                    });
                } else {
                    res.status(500).json({
                        'message': 'Auth failed'
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
        db.query(`DELETE FROM devices WHERE id='${deviceId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        res.status(200).json({
                            'message': 'Device successfully deleted'
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'Device not found'
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
        db.query(`SELECT * FROM devices WHERE id='${deviceId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        db.query(`SELECT * FROM device_verification_pins WHERE deviceId='${deviceId}'`, (err, data) => {
                            switch (data.length) {
                                case 1:
                                    if (data[0].pin === device_verify_pin) {
                                        db.query(`SELECT * FROM users WHERE id='${userId}'`, (err, data) => {
                                            if (!err) {
                                                switch (data.length) {
                                                    case 1:
                                                        db.query(`SELECT * FROM device_user WHERE deviceId='${deviceId}' AND userId='${userId}'`, (err, data) => {
                                                            if (!err) {
                                                                switch (data.length) {
                                                                    case 1:
                                                                        res.status(409).json({
                                                                            'message': 'Device already added to this user'
                                                                        });
                                                                        break;
                                                                    case 0:
                                                                        db.query(`INSERT INTO device_user VALUES(NULL, '${userId}', '${deviceId}')`, (err, data) => {
                                                                            if (!err) {
                                                                                res.status(200).json({
                                                                                    'message': 'Device added'
                                                                                });
                                                                            } else {
                                                                                res.status(500).json({
                                                                                    'message': 'Database error'
                                                                                });
                                                                            }
                                                                        });
                                                                        break;
                                                                    default:
                                                                        res.status(409).json({
                                                                            'message': 'Device already added to this user'
                                                                        });
                                                                        break;
                                                                }
                                                            } else {
                                                                res.status(500).json({
                                                                    'error': err
                                                                });
                                                            }
                                                        });
                                                        break;
                                                    case 0:
                                                        res.status(404).json({
                                                            'messsage': 'User with provided id not found'
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
                                            'message': 'Adding failed'
                                        });
                                    }
                                    break;
                                case 0:
                                    res.status(404).json({
                                        'message': 'Device with provided id not found'
                                    });
                                    break;
                                default:
                                    res.status(500).json({
                                        'message': 'Database error'
                                    });
                                    break;
                            }
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'Device with provided uid not found'
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
       db.query(`SELECT * FROM device_verification_pins WHERE deviceId='${deviceId}'`, (err, data) => {
           if (!err) {
               switch (data.length) {
                   case 1:
                       db.query(`UPDATE device_verification_pins SET pin='${device_verify_pin}' WHERE deviceId='${deviceId}'`, (err, data) => {
                           if (!err) {
                               res.status(200).json({
                                   'message': 'Verification pin updated successfully'
                               });
                           } else {
                               res.status(500).json({
                                   'error': err
                               });
                           }
                       });
                       break;
                   case 0:
                       db.query(`INSERT INTO device_verification_pins VALUES(NULL, '${deviceId}', '${device_verify_pin}', CURRENT_TIMESTAMP)`, (err, data) => {
                           if (!err) {
                               res.status(201).json({
                                   'message': 'Verification pin created successfully'
                               });
                           } else {
                               res.status(500).json({
                                   'error': err
                               });
                           }
                       });
                       break;
                   default:
                       db.query(`UPDATE device_verification_pins SET pin='${device_verify_pin}' WHERE deviceId='${deviceId}'`, (err, data) => {
                           if (!err) {
                               res.status(200).json({
                                   'message': 'Verification pin updated successfully'
                               });
                           } else {
                               res.status(500).json({
                                   'error': err
                               });
                           }
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
        db.query(`SELECT * FROM cards WHERE cardUid='${cardUid}' AND pin='${cardPin}'`, (err, data_usr) => {
            if (!err) {
                switch (data_usr.length) {
                    case 1:
                        db.query(`SELECT last_user FROM devices WHERE id='${deviceId}'`, (err, data_dev) => {
                            if (!err) {
                                switch (data_dev.length) {
                                    case 1:
                                        // id, reason, description, doctorId, patientId, date
                                        db.query(`INSERT INTO visits VALUES(NULL, '', '', '${data_dev[0].last_user}', '${data_usr[0].userId}', CURRENT_TIMESTAMP)`, (err, data) => {
                                            if (!err) {
                                                res.status(201).json({
                                                    'message': 'New visit created'
                                                });
                                            } else {
                                                res.status(500).json({
                                                    'error': err
                                                });
                                            }
                                        });
                                        break;
                                    case 0:
                                        res.status(404).json({
                                            'message': 'No user found for provided device'
                                        });
                                        break;
                                    default:
                                        res.status(500).json({
                                            'error': 'Database error'
                                        });
                                        break;
                                }
                            } else {
                                res.status(500).json({
                                    'error': 'Database error'
                                });
                            }
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'Card with provided credentials not found'
                        });
                        break;
                    default:
                        res.status(500).json({
                            'error': 'Database error'
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

module.exports = router;
