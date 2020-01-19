const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const logger = require('../logger');

/**
 * @api {get} /api/prescription/ Get all prescriptions
 * @apiName GetAllPrescriptions
 * @apiGroup Prescription
 *
 * @apiSuccess {Object[]} data Prescription's list
 * @apiSuccess {Number} prescription.id Prescription ID
 * @apiSuccess {Number} prescription.doctorId Doctor ID
 * @apiSuccess {Number} prescription.patientId Patient ID
 * @apiSuccess {Number} prescription.institutionId Institution ID
 * @apiSuccess {Date} prescription.date Date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "doctorId": 1,
 *             "patientId": 2,
 *             "institutionId": 1,
 *             "date": "2019-10-21T22:00:00.000Z"
 *         },
 *         {
 *             "id": 2,
 *             "doctorId": 2,
 *             "patientId": 3,
 *             "institutionId": 1,
 *             "date": "2019-10-21T22:00:00.000Z"
 *         },
 *     ]
 * }
 */

router.get('/', (req, res, next) => {
    db.query(`SELECT * FROM prescriptions`, (err, data) => {
        if (!err) {
            logger('prescription', `GetAllPrescriptions`);
            res.status(200).json({
                'data': data
            })
        } else {
            logger('prescription', `Error 500 - GetAllPrescriptions`);
            res.status(500).json({
                'error': err
            });
        }
    });
});

/**
 * @api {get} /api/prescription/:prescriptionId Get info about prescription by ID
 * @apiName GetPrescriptionById
 * @apiGroup Prescription
 *
 * @apiParam {Number} prescriptionId Prescription ID
 *
 * @apiSuccess {Object[]} data Prescription's list
 * @apiSuccess {Number} prescription.id Prescription ID
 * @apiSuccess {Number} prescription.doctorId Doctor ID
 * @apiSuccess {Number} prescription.patientId Patient ID
 * @apiSuccess {Number} prescription.institutionId Institution ID
 * @apiSuccess {Date} prescription.date Date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "doctorId": 1,
 *             "patientId": 2,
 *             "institutionId": 1,
 *             "date": "2019-10-22T22:00:00.000Z"
 *         },
 *     ]
 * }
 */

router.get('/:prescriptionId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const prescriptionId = req.params.prescriptionId;

    if (prescriptionId !== undefined) {
        db.query(`SELECT * FROM prescriptions WHERE id='${prescriptionId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        data = data[0];
                        logger('prescription', `GetPrescriptionById (prescriptionId: ${prescriptionId})`);
                        res.status(200).json({
                            'id': data.id,
                            'doctorId': data.doctorId,
                            'patientId': data.patientId,
                            'institutionId': data.institutionId,
                            'date': data.date
                        });
                        break;
                    case 0:
                        logger('prescription', `Error 404 - GetPrescriptionById (prescriptionId: ${prescriptionId})`);
                        res.status(404).json({
                            'message': 'Prescription with provided id not found'
                        });
                        break;
                    default:
                        logger('prescription', `Error 500 - GetPrescriptionById (prescriptionId: ${prescriptionId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('prescription', `Error 500 - GetPrescriptionById (prescriptionId: ${prescriptionId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('prescription', `Error 500 - GetPrescriptionById`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {get} /api/prescription/patient/:patientId Get info about prescriptions by patientId
 * @apiName GetPrescriptionByPatientId
 * @apiGroup Prescription
 *
 * @apiParam {Number} patientId Patient ID
 *
 * @apiSuccess {Object[]} data Prescription's list
 * @apiSuccess {Number} prescription.id Prescription ID
 * @apiSuccess {Number} prescription.doctorId Doctor ID
 * @apiSuccess {Number} prescription.patientId Patient ID
 * @apiSuccess {Number} prescription.institutionId Institution ID
 * @apiSuccess {Date} prescription.date Date
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "doctorId": 1,
 *             "patientId": 2,
 *             "institutionId": 1,
 *             "date": "2019-10-22T22:00:00.000Z"
 *         },
 *     ]
 * }
 */

router.get('/patient/:patientId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const patientId = req.params.patientId;

    if (patientId !== undefined) {
        db.query(`SELECT * FROM prescriptions WHERE patientId='${patientId}'`, (err, data) => {
            if (!err) {
                if (data.length >= 1) {
                    logger('prescription', `GetPrescriptionByPatientId (patientId: ${patientId})`);
                    res.status(200).json({
                        'data': data
                    });
                } else {
                    logger('prescription', `Error 404 - GetPrescriptionByPatientId (patientId: ${patientId})`);
                    res.status(404).json({
                        'message': 'No prescriptions found for provided patientId'
                    });
                }
            } else {
                logger('prescription', `Error 500 - GetPrescriptionByPatientId (patientId: ${patientId})`);
                res.status(500).json({
                    'error': err
                })
            }
        });
    } else {
        logger('prescription', `Error 400 - GetPrescriptionByPatientId`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/prescription/add Add new prescription
 * @apiName AddPrescription
 * @apiGroup Prescription
 *
 * @apiParam {Number} doctorId Doctor ID
 * @apiParam {Number} patientId Patient ID
 * @apiParam {Number} institutionId Institution ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Prescription created successfully",
 *     "insertId": 1
 * }
 */

router.post('/add', auth({ roles: [3, 4] }), (req, res, next) => {
    const doctorId = req.body.doctorId;
    const patientId = req.body.patientId;
    const institutionId = req.body.institutionId

    if (doctorId !== undefined &&
        patientId !== undefined &&
        institutionId !== undefined
    ) {
        db.query(`INSERT INTO prescriptions VALUES(NULL, '${doctorId}', '${patientId}', '${institutionId}', CURRENT_DATE)`, (err, data) => {
            if (!err) {
                logger('prescription', `GetPrescriptionByPatientId (patientId: ${patientId})`);
                res.status(201).json({
                    'message': 'Prescription created successfully',
                    'insertId': data.insertId
                });
            } else {
                logger('prescription', `Error 500 - GetPrescriptionByPatientId (patientId: ${patientId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('prescription', `Error 400 - GetPrescriptionByPatientId`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }


});

/**
 * @api {delete} /api/prescription/:prescriptionId Delete prescription
 * @apiName DeletePrescription
 * @apiGroup Prescription
 *
 * @apiParam {Number} prescriptionId Prescription ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "message": "Prescription successfully deleted"
 * }
 */

router.delete('/:prescriptionId', auth({ roles: [4] }), (req, res, next) => {
    const prescriptionId = req.params.prescriptionId;

    if (prescriptionId !== undefined) {
        db.query(`DELETE FROM prescriptions WHERE id='${prescriptionId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('prescription', `DeletePrescription (prescriptionId: ${prescriptionId})`);
                        res.status(200).json({
                            'message': 'Prescription successfully deleted'
                        });
                        break;
                    case 0:
                        logger('prescription', `Error 404 - DeletePrescription (prescriptionId: ${prescriptionId})`);
                        res.status(404).json({
                            'message': 'Prescription not found'
                        });
                        break;
                    default:
                        logger('prescription', `Error 500 - DeletePrescription (prescriptionId: ${prescriptionId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('prescription', `Error 500 - DeletePrescription (prescriptionId: ${prescriptionId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('prescription', `Error 400 - DeletePrescription`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {get} /api/:prescriptionId/medicines Get prescription medicines
 * @apiName GetPrescriptionMedicines
 * @apiGroup Prescription
 *
 * @apiParam {Number} prescriptionId Prescription ID
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "medicines": [
 *         [
 *             {
 *                 "id": 1,
 *                 "name": "Example",
 *                 "description": "Example description",
 *                 "taking_frequency": "2h"
 *             }
 *         ],
 *         [
 *             {
 *                 "id": 2,
 *                 "name": "Example 2",
 *                 "description": "Example description 2",
 *                 "taking_frequency": "4h"
 *             }
 *         ]
 *     ]
 * }
 */

router.get('/:prescriptionId/medicines', auth({ roles: [2, 3, 4]}), (req, res, next) => {
    const prescriptionId = req.params.prescriptionId;

    if (prescriptionId !== undefined) {
        db.query(`SELECT * FROM prescription_medicine WHERE prescriptionId='${prescriptionId}'`, (err, data) => {
            if (!err) {
                if (data.length >= 1) {
                    let medicines = [];
                    for(let i = 0; i < data.length; i++) {
                        db.query(`SELECT * FROM medicines WHERE id='${data[i].medicineId}'`, (err, medicineData) => {
                           if (!err) {
                               medicineData[0].taking_frequency = data[i].taking_frequency;
                               medicines.push(medicineData[0]);
                               if (i === data.length - 1) {
                                   logger('prescription', `GetPrescriptionMedicines (prescriptionId: ${prescriptionId})`);
                                   res.status(200).json({
                                       medicines
                                   });
                               }
                           } else {
                               logger('prescription', `Error 500 - GetPrescriptionMedicines (prescriptionId: ${prescriptionId})`);
                               res.status(500).json({
                                   'error': err
                               });
                           }
                        });
                    }
                } else {
                    logger('prescription', `Error 404 - GetPrescriptionMedicines (prescriptionId: ${prescriptionId})`);
                    res.status(404).json({
                        'message': 'No medicines found for this prescription'
                    });
                }
            } else {
                logger('prescription', `Error 500 - GetPrescriptionMedicines (prescriptionId: ${prescriptionId})`);
                res.status(500).json({
                    'error': err
                });
            }
        })
    } else {
        logger('prescription', `Error 400 - GetPrescriptionMedicines`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/prescription/add Add medicine to prescription
 * @apiName AddPrescriptionMedicine
 * @apiGroup Prescription
 *
 * @apiParam {Number} prescriptionId Prescription ID
 * @apiParam {Number} medicineId Medicine ID
 * @apiParam {Number} taking_frequency Taking frequency
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Medicine created successfully",
 * }
 */

router.post('/:prescriptionId/medicines/add', auth({ roles: [2, 3, 4]}), (req, res, next) => {
    const prescriptionId = req.params.prescriptionId;
    const medicineId = req.body.medicineId;
    const taking_frequency = req.body.taking_frequency;

    if (prescriptionId !== undefined && medicineId !== undefined && taking_frequency !== undefined) {
        db.query(`SELECT * FROM prescription_medicine WHERE prescriptionId='${prescriptionId}' AND medicineId='${medicineId}'`, (err, data) => {2
            if (!err) {
                db.query(`INSERT INTO prescription_medicine VALUES(NULL, '${prescriptionId}', '${medicineId}', '${taking_frequency}')`, (err, data) => {
                    if (!err) {
                        logger('prescription', `AddPrescriptionMedicine (prescriptionId: ${prescriptionId})`);
                        res.status(201).json({
                            'message': 'Medicine added successfully'
                        });
                    } else {
                        logger('prescription', `Error 500 - AddPrescriptionMedicine (prescriptionId: ${prescriptionId})`);
                        res.status(500).json({
                            'error': err
                        });
                    }
                });
            }
        });
    } else {
        logger('prescription', `Error 400 - AddPrescriptionMedicine`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

module.exports = router;