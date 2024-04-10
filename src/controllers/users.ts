import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('users')
export class UsersController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const result = await user.save();
      res.status(201).send(result);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const err = error as mongoose.Error.ValidationError;
        res.status(422).send({ error: err.message });
        // console.error(error);
      } else {
        res.status(500).send(JSON.stringify(error));
        // console.error(error);
      }
    }
  }
}
