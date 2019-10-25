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
 *         },
 *         {
 *             "id": 2,
 *             "name": "Example 2",
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

    if (name !== undefined) {
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
                        db.query(`INSERT INTO institutions VALUES(NULL, '${name}')`, (err, data) => {
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