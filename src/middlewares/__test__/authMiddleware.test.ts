import { authMiddleware } from '../authMiddleware';
import { AuthService } from '@src/services/authService';

describe('AuthMiddleware', () => {
  it('Should verify a JWT token and call the next middleware', () => {
    const payload = {
      name: 'Don Corleone',
      email: 'corleone@mail.com',
      password: '1234',
    };
    const jwtToken = AuthService.generateToken(payload);
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    const resFake = {};
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake, nextFake);
    expect(reqFake).toMatchObject({ decoded: payload });
    expect(nextFake).toHaveBeenCalled();
  });
  it('Should return UNAUTHORIZED if the token is invalid', () => {
    const payload = {
      name: 'Don Corleone',
      email: 'corleone@mail.com',
      password: '1234',
    };
    const jwtToken = AuthService.generateToken(payload, 'wrong-secret');
    const reqFake = {
      headers: {
        'x-access-token': jwtToken,
      },
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'invalid signature',
    });
  });
  it('Should return UNAUTHORIZED if there is a problem on the token verification', () => {
    const reqFake = {
      headers: {
        'x-access-token': 'wrong-token',
      },
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });
  it('Should return UNAUTHORIZED if there is not a token', () => {
    const reqFake = {
      headers: {},
    };
    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as object, nextFake);
    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
});
