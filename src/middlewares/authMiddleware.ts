import { AuthService } from '@src/services/authService';
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
) {
  const token = req.headers?.['x-access-token'] as string;
  try {
    if (token) {
      const decoded = AuthService.decodeToken(token);
      req.decoded = decoded;
      next();
    } else {
      res.status?.(401).send({ code: 401, error: 'jwt must be provided' });
    }
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      res.status?.(401).send({ code: 401, error: error.message });
    } else {
      const err = error as Error;
      res.status?.(400).send({
        code: 400,
        error: err.message ? err.message : JSON.stringify(err),
      });
    }
  }
}
