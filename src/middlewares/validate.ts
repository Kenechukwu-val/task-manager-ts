import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';

export const validate = (schema: ZodType<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body); 
            next();
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: 'validation error',
                errors: error.errors || error.issues
            })
        }
    };
};