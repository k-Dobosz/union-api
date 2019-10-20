const express = require('express');
const app = express();
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./api/routes/index');
const deviceRouter = require('./api/routes/device');
const userRouter = require('./api/routes/user');
const medicineRouter = require('./api/routes/medicine');
const prescriptionRouter = require('./api/routes/prescription');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/api', indexRouter);
app.use('/api/device', deviceRouter);
app.use('/api/user', userRouter);
app.use('/api/medicine', medicineRouter);
app.use('/api/prescription', prescriptionRouter);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            error_code: error.status,
            message: error.message
        }
    });
});

module.exports = app;
