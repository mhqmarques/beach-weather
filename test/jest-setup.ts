import supertest from 'supertest';
import { SetupServer } from '@src/server';

beforeAll(() => {
  const server = new SetupServer();
  server.initServer();
  globalThis.testRequest = supertest(server.getApp());
});
