const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error!";

    res.status(statusCode).json({
        success: false,
        error: message
    });
}

module.exports = errorHandler;
