import { User } from '@src/models/user';

describe('Users functional test', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('When creating a user', () => {
    it('Should return status 201 and successfully create a new user', async () => {
      const newUser = {
        name: 'Don Corleone',
        email: 'corleone@mail.com',
        password: '1234',
      };
      const { status, body } = await globalThis.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newUser));
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
        error: 'User validation failed: name: Path `name` is required.',
      });
    });
  });
});
