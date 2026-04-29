"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'validation error',
                errors: error.errors || error.issues
            });
        }
    };
};
exports.validate = validate;
