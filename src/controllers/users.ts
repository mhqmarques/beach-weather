import { BaseController } from '.';
import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/authMiddleware';
import { User } from '@src/models/user';
import { AuthService } from '@src/services/authService';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const result = await user.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateOrUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        this.sendErrorResponse(res, {
          code: 401,
          message: 'User was not found',
          description: 'Try verifying your email address.',
        });
      } else if (
        !(await AuthService.comparePasswords(password, user.password))
      ) {
        this.sendErrorResponse(res, { code: 401, message: 'Invalid Password' });
      } else {
        const token = AuthService.generateToken(user.toJSON());
        res.status(200).send({ ...user.toJSON(), token });
      }
    } catch (error) {
      logger.error(error);
      const err = error as Error;
      res.status?.(500).send({
        code: 500,
        error: err.message ? err.message : JSON.stringify(err),
      });
    }
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const email = req.decoded?.email;
    const user = await User.findOne({ email });

    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User was not found',
      });
    }

    return res.status(200).send({ user });
  }
}
