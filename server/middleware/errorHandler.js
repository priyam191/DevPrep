const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(err);

    const status = err.status || err.statusCode || 500;

    return res.status(status).json({

        success: false,

        message:
            err.message ||
            "Something went wrong"
    });
};

module.exports = errorHandler;