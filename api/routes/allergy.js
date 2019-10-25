const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const logger = require('../logger');

/**
 * @api {get} /api/allergy/ Request all allergies
 * @apiName GetAllAllergies
 * @apiGroup Allergy
 *
 * @apiSuccess {Object[]} allergies List
 * @apiSuccess {Number} allergies.id Allergy id
 * @apiSuccess {Number} allergies.userId User ID
 * @apiSuccess {String} allergies.name Allergy name
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "data": [
 *         {
 *             "id": 1,
 *             "userId": 1,
 *             "name": "sun"
 *         },
 *         {
 *             "id": 2,
 *             "userId": 1,
 *             "name": "water"
 *         }
 *     ]
 * }
 */

router.get('/', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    db.query(`SELECT * FROM allergies`, (err, data) => {
        if (!err) {
            logger('allergy', `GetAllAllergies`);
            res.status(200).json({
                'data': data
            })
        } else {
            logger('allergy', `Error 500 - GetAllAllergies`);
            res.status(500).json({
                'error': err
            });
        }
    });
});

/**
 * @api {get} /api/allergy/:allergyId Get info about allergy
 * @apiName GetAllergy
 * @apiGroup Allergy
 *
 * @apiParam {Number} allergyId Allergy ID
 *
 * @apiSuccess {Object[]} allergies List
 * @apiSuccess {Number} allergies.id Allergy ID
 * @apiSuccess {String} allergies.name Allergy name
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 *     "id": 1,
 *     "userId": 1,
 *     "name": "Example"
 * }
 */

router.get('/:allergyId', auth({ roles: [2, 3, 4] }), (req, res, next) => {
    const allergyId = req.params.allergyId;

    if (allergyId !== undefined) {
        db.query(`SELECT * FROM allergies WHERE id='${allergyId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('allergy', `Error 500 - GetAllergy (allergyId: ${allergyId})`);
                        res.status(200).json({
                            'id': data[0].id,
                            'userId': data[0].userId,
                            'name': data[0].name
                        });
                        break;
                    case 0:
                        logger('allergy', `Error 404 - GetAllergy (allergyId: ${allergyId})`);
                        res.status(404).json({
                            'message': 'Allergy with provided id not found'
                        });
                        break;
                    default:
                        logger('allergy', `Error 500 - GetAllergy (allergyId: ${allergyId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('allergy', `Error 500 - GetAllergy (allergyId: ${allergyId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('allergy', `Error 400 - GetAllergy`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {post} /api/allergy/add Add new allergy
 * @apiName AddAllergy
 * @apiGroup Allergy
 *
 * @apiParam {String} name Allergy name
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Allergy successfully added",
 * }
 */


router.post('/add', auth({ roles: [4] }), (req, res, next) => {
    const userId = req.body.userId;
    const name = req.body.name;

    if (
        name !== undefined &&
        userId !== undefined
    ) {
        db.query(`SELECT * FROM allergies WHERE name='${name}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('allergy', `Error 500 - AddAllergy (name: ${name})`);
                        res.status(500).json({
                            'message': 'Allergy with provided name already exists'
                        });
                        break;
                    case 0:
                        db.query(`INSERT INTO allergies VALUES(NULL, '${userId}', '${name}',)`, (err, data) => {
                            if (!err) {
                                logger('allergy', `AddAllergy (name: ${name})`);
                                res.status(201).json({
                                    'message': 'Allergy successfully added'
                                });
                            } else {
                                logger('allergy', `Error 500 - AddAllergy (name: ${name})`);
                                res.status(500).json({
                                    'error': err
                                });
                            }
                        });
                        break;
                    default:
                        logger('allergy', `Error 500 - AddAllergy (name: ${name})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('allergy', `Error 500 - AddAllergy (name: ${name})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('allergy', `Error 400 - AddAllergy`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

/**
 * @api {delete} /api/allergy/:allergyId Delete allergy
 * @apiName DeleteAllergy
 * @apiGroup Allergy
 *
 * @apiParam {Number} allergyId Allergy id
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Allergy successfully deleted",
 * }
 */

router.delete('/:allergyId', auth({ roles: [4] }), (req, res, next) => {
    const allergyId = req.params.allergyId;

    if (allergyId !== undefined) {
        db.query(`DELETE FROM allergies WHERE id='${allergyId}'`, (err, data) => {
            if (!err) {
                switch (data.length) {
                    case 1:
                        logger('allergy', `DeleteAllergy (allergyId: ${allergyId})`);
                        res.status(200).json({
                            'message': 'Allergy successfully deleted'
                        });
                        break;
                    case 0:
                        logger('allergy', `Error 404 - DeleteAllergy (allergyId: ${allergyId})`);
                        res.status(404).json({
                            'message': 'Allergy not found'
                        });
                        break;
                    default:
                        logger('allergy', `Error 500 - DeleteAllergy (allergyId: ${allergyId})`);
                        res.status(500).json({
                            'message': 'Database error'
                        });
                        break;
                }
            } else {
                logger('allergy', `Error 500 - DeleteAllergy (allergyId: ${allergyId})`);
                res.status(500).json({
                    'error': err
                });
            }
        });
    } else {
        logger('allergy', `Error 400 - DeleteAllergy`);
        res.status(400).json({
            'message': 'Not enough data provided'
        });
    }
});

module.exports = router;