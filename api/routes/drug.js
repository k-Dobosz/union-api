const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

/**
 * @api {get} /api/drug/ Request all drugs list
 * @apiName GetAllDrugs
 * @apiGroup Drug
 *
 * @apiSuccess {Object[]} data Drug's list
 * @apiSuccess {Number} drug.id Drug id
 * @apiSuccess {String} drug.name Drug name
 * @apiSuccess {String} drug.description Drug description
 * @apiSuccess {String} date.takingFrequency Drug taking frequency
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
    db.query(`SELECT * FROM drugs`, (err, data) => {
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
 * @api {get} /api/drug/:drugId Get info about drug
 * @apiName GetDrug
 * @apiGroup Drug
 *
 * @apiParam {Number} drugId Drug id
 *
 * @apiSuccess {Object[]} data Drug's list
 * @apiSuccess {Number} drug.id Drug id
 * @apiSuccess {String} drug.name Drug name
 * @apiSuccess {String} drug.description Drug description
 * @apiSuccess {String} drug.takingFrequency Drug taking frequency
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

router.get('/:drugId', (req, res, next) => {
   const drugId = req.params.drugId;

   db.query(`SELECT * FROM drugs WHERE id='${drugId}'`, (err, data) => {
      if (!err) {
          if (data.length < 1) {
              res.status(404).json({
                 'message': 'Drug with provided id not found'
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
 * @api {post} /api/drug/add Add new drug
 * @apiName AddDrug
 * @apiGroup Drug
 *
 * @apiParam {String} name Drug name
 * @apiParam {String} description Drug description
 * @apiParam {String} takingFrequency Drug taking frequency
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Drug successfully added",
 *     "data": []
 * }
 */


router.post('/add', (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const takeFreq = req.body.takingFrequency;

    db.query(`SELECT * FROM drugs WHERE name='${name}'`, (err, data) => {
       if (!err) {
           if (data.length >= 1) {
               res.status(500).json({
                   'message': 'Drug with provided name already exists'
               });
           } else {
               db.query(`INSERT INTO drugs VALUES(NULL, '${name}', '${description}', '${takeFreq}')`, (err, data) => {
                  if (!err) {
                      res.status(201).json({
                          'message': 'Drug successfully added',
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
 * @api {delete} /api/drug/:drugId Delete drug
 * @apiName DeleteDrug
 * @apiGroup Drug
 *
 * @apiParam {Number} drugId Drug id
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 201 OK
 * {
 *     "message": "Drug successfully deleted",
 * }
 */

router.delete('/:drugId', (req, res, next) => {
    const drugId = req.params.drugId;
    db.query(`DELETE FROM drugs WHERE id='${drugId}'`, (err, data) => {
        if (!err) {
            if (data.length < 1) {
                res.status(404).json({
                    'message': 'Drug not found'
                });
            } else {
                res.status(200).json({
                    'message': 'Drug successfully deleted'
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