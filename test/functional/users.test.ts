import { User } from '@src/models/user';
import { AuthService } from '@src/services/authService';

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
        error: 'Unprocessable Entity',
        message: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('Should return status 409 when the email already exists', async () => {
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
        error: 'Conflict',
        message: 'User validation failed: email: already exists in database',
      });
    });
  });
  describe('When authentication a user', () => {
    it('Should generate a token to a valid user', async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };
      await new User(newUser).save();
      const { body } = await globalThis.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });
      expect(body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });
    it('Should return an unauthorized if the user with the provided email was not found', async () => {
      const { status, body } = await globalThis.testRequest
        .post('/users/authenticate')
        .send({
          email: 'wrong-email@email.com',
          password: '1234',
        });
      expect(status).toBe(401);
      expect(body).toEqual({
        code: 401,
        message: 'User was not found',
        error: 'Unauthorized',
        description: 'Try verifying your email address.',
      });
    });
    it('Should return an unauthorized if the user password does not match', async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };
      await new User(newUser).save();
      const { status, body } = await globalThis.testRequest
        .post('/users/authenticate')
        .send({
          email: newUser.email,
          password: '7894',
        });
      expect(status).toBe(401);
      expect(body).toEqual({
        code: 401,
        message: 'Invalid Password',
        error: 'Unauthorized',
      });
    });
  });
  describe('When getting user profile info', () => {
    it(`Should return the token's owner profile information`, async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };
      const user = await new User(newUser).save();
      const token = AuthService.generateToken(user.toJSON());

      const { body, status } = await globalThis.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it(`Should return Not Found, when the user is not found`, async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };
      const user = new User(newUser);
      const token = AuthService.generateToken(user.toJSON());

      const { body, status } = await globalThis.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(401);
      expect(body.message).toBe('User was not found');
    });
  });
});
