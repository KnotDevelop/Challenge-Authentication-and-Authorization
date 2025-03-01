exports.mapError = (status, message, next) => {
    let err = new Error();
    err.statusCode = status;
    err.status = message;
    next(err);
}

exports.apiError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Internal server error';
    res.status(err.statusCode).json({ message: err.status })
}