import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import { BaseController } from '.';
import { AuthService } from '@src/services/authService';

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
        res.status(401).send({ code: 401, error: 'User was not found' });
      } else if (
        !(await AuthService.comparePasswords(password, user.password))
      ) {
        res.status(401).send({ code: 401, error: 'Invalid Password' });
      } else {
        const token = AuthService.generateToken(user.toJSON());
        res.status(200).send({ ...user.toJSON(), token });
      }
    } catch (error) {
      const err = error as Error;
      res.status?.(500).send({
        code: 500,
        error: err.message ? err.message : JSON.stringify(err),
      });
    }
  }
}
