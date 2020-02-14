const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const logger = require('../logger');

/**
 * @api {get} /api/medicine/ Request all medicine list
 * @apiName GetAllMedicines
 * @apiGroup Medicine
 *
 * @apiSuccess {Object[]} medicine List
 * @apiSuccess {Number} medicine.id Medicine id
 * @apiSuccess {String} medicine.name Medicine name
 * @apiSuccess {String} medicine.description Medicine description
 * @apiSuccess {String} medicine.taking_frequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "name": "Example",
 *             "description": "Example description",
 *             "taking_frequency": "6h"
 *         },
 *         {
 *             "id": 2,
 *             "name": "Example 2",
 *             "description": "Example description 2",
 *             "taking_frequency": "12h"
 *         }
 *     ]
 * }
 */

router.get('/', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    db.query(`SELECT * FROM medicines`, (err, data) => {
        if (!err) {
            logger('medicine', `GetAllMedicines`);
            res.status(200).json({
                'data': data
            })
        } else {
            logger('medicine', `Error 500 - GetAllMedicines`);
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
 * @apiSuccess {String} medicine.taking_frequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "name": "Example",
 *             "description": "Example description",
 *             "taking_frequency": "6h"
 *         }
 *     ]
 * }
 */

router.get('/:medicineId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const medicineId = req.params.medicineId;

    if (medicineId !== undefined) {
        db.query(`SELECT * FROM medicines WHERE id = ?`, [ medicineId ], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('medicine', `GetMedicine (medicineId ${medicineId})`);
                        res.status(200).json({
                            'id': data[0].id,
                            'name': data[0].name,
                            'description': data[0].description,
                            'taking_frequency': data[0].taking_frequency
                        });
                        break;
                    case 0:
                        logger('medicine', `Error 404 - GetMedicine (medicineId ${medicineId})`);
                        res.status(404).json({
                            'message': 'Medicine with provided id not found'
                        });
                        break;
                    default:
                        logger('medicine', `Error 500 - GetMedicine (medicineId ${medicineId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('medicine', `Error 500 - GetMedicine (medicineId ${medicineId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('medicine', `Error 400 - GetMedicine`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/medicine/add Add new medicine
 * @apiName AddMedicine
 * @apiGroup Medicine
 *
 * @apiParam {String} name Medicine name
 * @apiParam {String} description Medicine description
 * @apiParam {String} taking_frequency Medicine taking frequency
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Medicine successfully added",
 *     "data": []
 * }
 */


router.post('/add', auth({ roles: [4] }), (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const taking_frequency = req.body.taking_frequency;

    if (name !== undefined && description !== undefined && taking_frequency !== undefined) {
        db.query(`SELECT * FROM medicines WHERE name = ?`, [ name ], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('medicine', `Error 500 - AddMedicine (name ${name})`);
                        res.status(500).json({
                            'message': 'Medicine with provided name already exists'
                        });
                        break;
                    case 0:
                        db.query(`INSERT INTO medicines VALUES(NULL, ?, ?, ?)`, [ name, description, taking_frequency ], (err, data) => {
                            if (!err) {
                                logger('medicine', `AddMedicine (name ${name})`);
                                res.status(201).json({
                                    'message': 'Medicine successfully added',
                                    'data': data
                                });
                            } else {
                                logger('medicine', `Error 500 - AddMedicine (name ${name})`);
                                res.status(500).json({
                                    'error': err
                                });
                            }
                        });
                        break;
                    default:
                        logger('medicine', `Error 500 - AddMedicine (name ${name})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('medicine', `Error 500 - AddMedicine (name ${name})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('medicine', `Error 400 - AddMedicine`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
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

router.delete('/:medicineId', auth({ roles: [4] }), (req, res, next) => {
    const medicineId = req.params.medicineId;

    if (medicineId !== undefined) {
        db.query(`DELETE FROM medicines WHERE id = ?`, [ medicineId ], (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('medicine', `DeleteMedicine (medicineId ${medicineId})`);
                        res.status(200).json({
                            'message': 'Medicine successfully deleted'
                        });
                        break;
                    case 0:
                        logger('medicine', `Error 404 - DeleteMedicine (medicineId ${medicineId})`);
                        res.status(404).json({
                            'message': 'Medicine not found'
                        });
                        break;
                    default:
                        logger('medicine', `Error 500 - DeleteMedicine (medicineId ${medicineId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('medicine', `Error 500 - DeleteMedicine (medicineId ${medicineId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('medicine', `Error 400 - DeleteMedicine (medicineId ${medicineId})`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

module.exports = router;