import { SetupServer } from '@src/server';
import supertest from 'supertest';

beforeAll(() => {
  const server = new SetupServer();
  server.initServer();
  globalThis.testRequest = supertest(server.getApp());
});
