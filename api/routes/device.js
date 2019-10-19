const express = require('express');
const router = express.Router();
const db = require('../db');

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

router.get('/:deviceId', (req, res, next) => {
  const deviceId = req.params.deviceId;

  db.query(`SELECT * FROM devices WHERE id='${deviceId}'`, (err, data) => {
    if (!err) {
      if (data.length > 0) {
        res.status(200).json({
          'data': data
        });
      } else {
        res.status(404).json({
          'error_code': 404,
          'message': 'Device with provided id not found'
        });
      }
    } else {
      res.status(500).json({
        'error': err
      });
    }
  });
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

  db.query(`INSERT INTO devices VALUES(NULL, '${pin}')`, (err, data) => {
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
});

/**
 * @api {delete} /api/device/:deviceId Delete device
 * @apiName DeleteDevice
 * @apiGroup Device
 *
 * @apiParam {Number} deviceId Device ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Device successfully deleted",
 * }
 */

router.delete('/:deviceId', (req, res, next) => {
  const deviceId = req.params.deviceId;
  db.query(`DELETE FROM devices WHERE id='${deviceId}'`, (err, data) => {
    if (!err) {
      if (data.length < 1) {
        res.status(404).json({
          'message': 'Device not found'
        });
      } else {
        res.status(200).json({
          'message': 'Device successfully deleted'
        });
      }
    } else {
      res.status(500).json({
        'error': err
      });
    }
  });
});

module.exports = router;
