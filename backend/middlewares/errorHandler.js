class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        status: "ERROR 💥 " + err.statusCode,
        message: "Error caught by the middleware: " + err.message
    });
};

module.exports = {
    AppError,
    errorHandler
};