const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

/**
 * @api {get} /api/medicine/ Request all medicine list
 * @apiName GetAllMedicines
 * @apiGroup Medicine
 *
 * @apiSuccess {Object[]} medicine List
 * @apiSuccess {Number} medicine.id Medicine id
 * @apiSuccess {String} medicine.name Medicine name
 * @apiSuccess {String} medicine.description Medicine description
 * @apiSuccess {String} medicine.takingFrequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "name": "Example",
 *             "description": "Example description",
 *             "takingFrequency": "6h"
 *         },
 *         {
 *             "id": 2,
 *             "name": "Example 2",
 *             "description": "Example description 2",
 *             "takingFrequency": "12h"
 *         }
 *     ]
 * }
 */

router.get('/', (req, res, next) => {
    db.query(`SELECT * FROM medicines`, (err, data) => {
        if (!err) {
            res.status(200).json({
                'data': data
            })
        } else {
            res.status(500).json({
                'error': err
            });
        }
    });
});

/**
 * @api {get} /api/medicine/:medicineId Get info about medicine
 * @apiName GetMedicine
 * @apiGroup Medicine
 *
 * @apiParam {Number} medicineId Medicine id
 *
 * @apiSuccess {Object[]} medicine List
 * @apiSuccess {Number} medicine.id Medicine id
 * @apiSuccess {String} medicine.name Medicine name
 * @apiSuccess {String} medicine.description Medicine description
 * @apiSuccess {String} medicine.takingFrequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "name": "Example",
 *             "description": "Example description",
 *             "takingFrequency": "6h"
 *         }
 *     ]
 * }
 */

router.get('/:medicineId', (req, res, next) => {
    const medicineId = req.params.medicineId;

    db.query(`SELECT * FROM medicines WHERE id='${medicineId}'`, (err, data) => {
        if (!err) {
            if (data.length < 1) {
                res.status(404).json({
                    'message': 'Medicine with provided id not found'
                });
            } else {
                res.status(200).json({
                    'data': data
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
 * @api {post} /api/medicine/add Add new medicine
 * @apiName AddMedicine
 * @apiGroup Medicine
 *
 * @apiParam {String} name Medicine name
 * @apiParam {String} description Medicine description
 * @apiParam {String} takingFrequency Medicine taking frequency
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Medicine successfully added",
 *     "data": []
 * }
 */


router.post('/add', (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const takingFrequency = req.body.takingFrequency;

    db.query(`SELECT * FROM medicines WHERE name='${name}'`, (err, data) => {
        if (!err) {
            if (data.length >= 1) {
                res.status(500).json({
                    'message': 'Medicine with provided name already exists'
                });
            } else {
                db.query(`INSERT INTO medicines VALUES(NULL, '${name}', '${description}', '${takingFrequency}')`, (err, data) => {
                    if (!err) {
                        res.status(201).json({
                            'message': 'Medicine successfully added',
                            'data': data
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
});

/**
 * @api {delete} /api/medicine/:medicineId Delete medicine
 * @apiName DeleteMedicine
 * @apiGroup Medicine
 *
 * @apiParam {Number} medicineId Medicine id
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Medicine successfully deleted",
 * }
 */

router.delete('/:medicineId', (req, res, next) => {
    const medicineId = req.params.medicineId;
    db.query(`DELETE FROM medicines WHERE id='${medicineId}'`, (err, data) => {
        if (!err) {
            if (data.length < 1) {
                res.status(404).json({
                    'message': 'Medicine not found'
                });
            } else {
                res.status(200).json({
                    'message': 'Medicine successfully deleted'
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