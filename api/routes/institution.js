const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const logger = require('../logger');

/**
 * @api {get} /api/institution/ Request all institutions
 * @apiName GetAllInstitutions
 * @apiGroup Institution
 *
 * @apiSuccess {Object[]} institution List
 * @apiSuccess {Number} institution.id Institution id
 * @apiSuccess {String} institution.name Institution name
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "name": "Example",
 *             "phone_number": 123456789,
 *             "address_street": "Jagiellońska"
 *             "address_house_number": "13"
 *             "address_postcode": "41-200"
 *             "address_city": "Sosnowiec"
 *             "address_country": "Polska"
 *         },
 *         {
 *             "id": 2,
 *             "name": "Example 2",
 *             "phone_number": 987654321
 *             "address_street": "Jagiellońska"
 *             "address_house_number": "14"
 *             "address_postcode": "41-200"
 *             "address_city": "Sosnowiec"
 *             "address_country": "Polska"
 *         }
 *     ]
 * }
 */

router.get('/', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    db.query(`SELECT * FROM institutions`, (err, data) => {
        if (!err) {
            logger('institution', `GetAllInstitutions`);
            res.status(200).json({
                'data': data
            })
        } else {
            logger('institution', `Error 500 - GetAllInstitutions`);
            res.status(500).json({
                'error': err
            });
        }
    });
});

/**
 * @api {get} /api/institution/:institutionId Get info about institution
 * @apiName GetInstitution
 * @apiGroup Institution
 *
 * @apiParam {Number} institutionId Institution id
 *
 * @apiSuccess {Object[]} Institutions List
 * @apiSuccess {Number} institution.id Institution id
 * @apiSuccess {String} institution.name Institution name
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "id": 123,
 *     "name": "Example institution"
 *     "address_street": "Jagiellońska"
 *     "address_house_number": "13"
 *     "address_postcode": "41-200"
 *     "address_city": "Sosnowiec"
 *     "address_country": "Polska"
 * }
 */

router.get('/:institutionId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const institutionId = req.params.institutionId;

    if (institutionId !== undefined) {
        db.query(`SELECT * FROM institutions WHERE id='${institutionId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('institution', `Error 500 - GetInstitution (institutionId: ${institutionId})`);
                        res.status(200).json({
                            'id': data[0].id,
                            'name': data[0].name,
                            'phone_number': data[0].phone_number,
                            'address_street': data[0].address_street,
                            'address_house_number': data[0].address_house_number,
                            'address_postcode': data[0].address_postcode,
                            'address_city': data[0].address_city,
                            'address_country': data[0].address_country
                        });
                        break;
                    case 0:
                        logger('institution', `Error 404 - GetInstitution (institutionId: ${institutionId})`);
                        res.status(404).json({
                            'message': 'Institution with provided id not found'
                        });
                        break;
                    default:
                        logger('institution', `Error 500 - GetInstitution (institutionId: ${institutionId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('institution', `Error 500 - GetInstitution (institutionId: ${institutionId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('institution', `Error 400 - GetInstitution`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/institution/add Add new institution
 * @apiName AddInstitution
 * @apiGroup Institution
 *
 * @apiParam {String} name Institution name
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Institution successfully added",
 *     "data": []
 * }
 */


router.post('/add', auth({ roles: [4] }), (req, res, next) => {
    const name = req.body.name;
    const phone_number = req.body.phone_number;
    const address_street = req.body.address_street;
    const address_house_number = req.body.address_house_number;
    const address_postcode = req.body.address_postcode;
    const address_city = req.body.address_city;
    const address_country = req.body.address_country;

    if (
        name !== undefined &&
        phone_number !== undefined &&
        address_street !== undefined &&
        address_house_number !== undefined &&
        address_postcode !== undefined &&
        address_city !== undefined &&
        address_country !== undefined
    ) {
        db.query(`SELECT * FROM institutions WHERE name='${name}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('institution', `Error 500 - AddInstitution (name: ${name})`);
                        res.status(500).json({
                            'message': 'Institution with provided name already exists'
                        });
                        break;
                    case 0:
                        db.query(`INSERT INTO institutions VALUES(NULL, '${name}', '${phone_number}', '${address_street}', '${address_house_number}', '${address_postcode}', '${address_city}', '${address_country}')`, (err, data) => {
                            if (!err) {
                                logger('institution', `AddInstitution (name: ${name})`);
                                res.status(201).json({
                                    'message': 'Institution successfully added',
                                    'data': data
                                });
                            } else {
                                logger('institution', `Error 500 - AddInstitution (name: ${name})`);
                                res.status(500).json({
                                    'error': err
                                });
                            }
                        });
                        break;
                    default:
                        logger('institution', `Error 500 - AddInstitution (name: ${name})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('institution', `Error 500 - AddInstitution (name: ${name})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('institution', `Error 400 - AddInstitution`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {delete} /api/institution/:institutionId Delete institution
 * @apiName DeleteInstitution
 * @apiGroup Institution
 *
 * @apiParam {Number} institutionId Institution id
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Institution successfully deleted",
 * }
 */

router.delete('/:institutionId', auth({ roles: [4] }), (req, res, next) => {
    const institutionId = req.params.institutionId;

    if (institutionId !== undefined) {
        db.query(`DELETE FROM institutions WHERE id='${institutionId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('institution', `DeleteInstitution (institutionId: ${institutionId})`);
                        res.status(200).json({
                            'message': 'Institution successfully deleted'
                        });
                        break;
                    case 0:
                        logger('institution', `Error 404 - DeleteInstitution (institutionId: ${institutionId})`);
                        res.status(404).json({
                            'message': 'Institution not found'
                        });
                        break;
                    default:
                        logger('institution', `Error 500 - DeleteInstitution (institutionId: ${institutionId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('institution', `Error 500 - DeleteInstitution (institutionId: ${institutionId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('institution', `Error 400 - DeleteInstitution`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

module.exports = router;