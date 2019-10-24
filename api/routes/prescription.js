const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const jwt = require('jsonwebtoken');

/**
 * @api {get} /api/prescription/ Get all prescriptions
 * @apiName GetAllPrescriptions
 * @apiGroup Prescription
 *
 * @apiSuccess {Object[]} data Prescription's list
 * @apiSuccess {Number} prescription.id Prescription ID
 * @apiSuccess {Number} prescription.doctorId Doctor ID
 * @apiSuccess {Number} prescription.patientId Patient ID
 * @apiSuccess {Number} prescription.medicineId Medicine ID
 * @apiSuccess {String} prescription.description Prescription description
 * @apiSuccess {String} prescription.medicineTakingFrequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "doctorId": 1,
 *             "patientId": 2,
 *             "medicineId": 1,
 *             "description": "Example description",
 *             "medicineTakingFrequency": "6h"
 *         },
 *         {
 *             "id": 2,
 *             "doctorId": 2,
 *             "patientId": 3,
 *             "medicineId": 2,
 *             "description": "Example description 2",
 *             "medicineTakingFrequency": "12h"
 *         },
 *     ]
 * }
 */

router.get('/', (req, res, next) => {
    db.query(`SELECT * FROM prescriptions`, (err, data) => {
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
 * @apiSuccess {Number} prescription.medicineId Medicine ID
 * @apiSuccess {String} prescription.description Prescription description
 * @apiSuccess {String} prescription.medicineTakingFrequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "doctorId": 1,
 *             "patientId": 2,
 *             "medicineId": 1,
 *             "description": "Example description",
 *             "medicine_taking_frequency": "6h"
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
                        res.status(200).json({
                            'id': data.id,
                            'doctorId': data.doctorId,
                            'patientId': data.patientId,
                            'medicineId': data.medicineId,
                            'description': data.description,
                            'medicine_taking_frequency': data.medicine_taking_frequency
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'Prescription with provided id not found'
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
 * @api {get} /api/prescription/patient/:patientId Get info about prescription by patientId
 * @apiName GetPrescriptionByPatientId
 * @apiGroup Prescription
 *
 * @apiParam {Number} patientId Patient ID
 *
 * @apiSuccess {Object[]} data Prescription's list
 * @apiSuccess {Number} prescription.id Prescription ID
 * @apiSuccess {Number} prescription.doctorId Doctor ID
 * @apiSuccess {Number} prescription.patientId Patient ID
 * @apiSuccess {Number} prescription.medicineId Medicine ID
 * @apiSuccess {String} prescription.description Prescription description
 * @apiSuccess {String} prescription.medicineTakingFrequency Medicine taking frequency
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "doctorId": 1,
 *             "patientId": 2,
 *             "medicineId": 1,
 *             "description": "Example description",
 *             "medicine_taking_frequency": "6h"
 *         },
 *     ]
 * }
 */

router.get('/patient/:patientId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const patientId = req.params.patientId;

    if (patientId !== undefined) {
        db.query(`SELECT * FROM prescriptions WHERE patientId='${patientId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        res.status(200).json({
                            'data': data
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'No prescriptions found for provided patientId'
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
                })
            }
        });
    } else {
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
 * @apiParam {Number} medicineId Medicine ID
 * @apiParam {String} description Description
 * @apiParam {String} medicine_taking_frequency Medicine taking frequency
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Prescription created successfully"
 * }
 */

router.post('/add', auth({ roles: [3, 4] }), (req, res, next) => {
    const doctorId = req.body.doctorId;
    const patientId = req.body.patientId;
    const medicineId = req.body.medicineId;
    const description = req.body.description;
    const medicine_taking_frequency = req.body.medicine_taking_frequency;

    if (doctorId !== undefined &&
        patientId !== undefined &&
        medicineId !== undefined &&
        description !== undefined &&
        medicine_taking_frequency !== undefined
    ) {
        db.query(`INSERT INTO prescriptions VALUES(NULL, '${doctorId}', '${patientId}', '${medicineId}', '${description}', '${medicine_taking_frequency}')`, (err, data) => {
            if (!err) {
                res.status(201).json({
                    'message': 'Prescription created successfully'
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
                        res.status(200).json({
                            'message': 'Prescription successfully deleted'
                        });
                        break;
                    case 0:
                        res.status(404).json({
                            'message': 'Prescription not found'
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

module.exports = router;