class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = messgae;
        this.statusCode = statusCode;

    }
}

module.exports = ExpressError;