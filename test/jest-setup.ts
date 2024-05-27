import { SetupServer } from '@src/server';
import config from 'config';
import supertest from 'supertest';

let server: SetupServer;

beforeAll(async () => {
  server = new SetupServer(config.get('App.port'));
  await server.initServer();
  globalThis.testRequest = supertest(server.getApp());
});

afterAll(async () => await server.close());
