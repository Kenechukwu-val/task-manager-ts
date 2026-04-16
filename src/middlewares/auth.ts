import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload{
    userId: string;
}

export const authMiddleware = ( req: Request, res: Response, next: NextFunction ) => {
    try{
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if ( !token ) {
            return res.status(401).json({
                success: false,
                message: 'Access Denied. No token provided.'
            });
        }

        const decoded =  jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
}