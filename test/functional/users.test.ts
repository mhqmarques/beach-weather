import { User } from '@src/models/user';
import { AuthService } from '@src/services/auth';

describe('Users functional test', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('When creating a user', () => {
    it('Should return status 201 and successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };
      const { status, body } = await globalThis.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(201);
      await expect(
        AuthService.comparePasswords(newUser.password, body.password)
      ).resolves.toBeTruthy();
      expect(body).toEqual(
        expect.objectContaining({
          ...newUser,
          password: expect.any(String),
        })
      );
    });

    it('Should return status 422 when there is a validation error', async () => {
      const newUser = {
        email: 'corleone@mail.com',
        password: '1234',
      };

      const { status, body } = await globalThis.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        error: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('Shloud return status 409 when the email already exists', async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };

      await globalThis.testRequest.post('/users').send(newUser);
      const { status, body } = await globalThis.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(409);
      expect(body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in database',
      });
    });
  });
});
