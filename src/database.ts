import config, { IConfig } from 'config';
import { connect as mongooseConnect, connection } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

const opt =
  !globalThis.nodeEnv || globalThis.nodeEnv === 'test'
    ? { dbName: 'surf-forecast' }
    : {};

export const connect = async (): Promise<void> => {
  await mongooseConnect(dbConfig.get('mongoUrl'), opt);
};

export const close = (): Promise<void> => connection.close();
