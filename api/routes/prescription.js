const express = require('express');
const router = express.Router();
const db = require('../db');
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
 * @api {get} /api/prescription/:prescriptionId Get info about prescription
 * @apiName GetPrescription
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
 *             "medicineTakingFrequency": "6h"
 *         },
 *     ]
 * }
 */

router.get('/:prescriptionId', (req, res, next) => {
    const prescriptionId = req.params.prescriptionId;

    db.query(`SELECT * FROM prescriptions WHERE id='${prescriptionId}'`, (err, data) => {
        if (!err) {
            if (data.length < 1) {
                res.status(404).json({
                    'message': 'Prescription with provided id not found'
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
 * @api {post} /api/prescription/add Add new prescription
 * @apiName AddPrescription
 * @apiGroup Prescription
 *
 * @apiParam {Number} doctorId Doctor ID
 * @apiParam {Number} patientId Patient ID
 * @apiParam {Number} medicineId Medicine ID
 * @apiParam {String} description Description
 * @apiParam {String} medicineTakingFrequency Medicine taking frequency
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Prescription created successfully"
 * }
 */

router.post('/add', (req, res, next) => {
    const doctorId = req.body.doctorId;
    const patientId = req.body.patientId;
    const medicineId = req.body.medicineId;
    const description = req.body.description;
    const medicineTakingFrequency = req.body.medicineTakingFrequency;

    db.query(`INSERT INTO prescriptions VALUES(NULL, '${doctorId}', '${patientId}', '${medicineId}', '${description}', '${medicineTakingFrequency}')`, (err, data) => {
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

router.delete('/:prescriptionId', (req, res, next) => {
    const prescriptionId = req.params.prescriptionId;
    db.query(`DELETE FROM prescriptions WHERE id='${prescriptionId}'`, (err, data) => {
        if (!err) {
            if (data.length < 1) {
                res.status(404).json({
                    'message': 'Prescription not found'
                });
            } else {
                res.status(200).json({
                    'message': 'Prescription successfully deleted'
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