// test for db

import chai from 'chai';
import { before, after } from 'mocha';
import sinon from 'sinon';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import DBClient from '../../utils/db';

const { expect } = chai;

describe('dBClient', () => {
  let mongoServer;
  let client;

  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  });

  after(async () => {
    await client.close();
    await mongoServer.stop();
  });

  describe('constructor', () => {
    it('should create a DBClient instance with a valid database connection', async () => {
      const dbClient = new DBClient();
      expect(dbClient.isAlive()).to.be.true;
    });
  });

  describe('isAlive', () => {
    it('should return true if the database connection is alive', async () => {
      const dbClient = new DBClient();
      expect(dbClient.isAlive()).to.be.true;
    });

    it('should return false if the database connection is not alive', async () => {
      const dbClient = new DBClient();
      sinon.stub(dbClient.client, 'close');
      await dbClient.client.close();
      expect(dbClient.isAlive()).to.be.false;
    });
  });

  describe('nbUsers', () => {
    it('should return the number of users in the database', async () => {
      const dbClient = new DBClient();
      const usersCollection = dbClient.db.collection('users');
      await usersCollection.insertMany([{ name: 'User1' }, { name: 'User2' }]);
      const count = await dbClient.nbUsers();
      expect(count).to.equal(2);
    });
  });

  describe('nbFiles', () => {
    it('should return the number of files in the database', async () => {
      const dbClient = new DBClient();
      const filesCollection = dbClient.db.collection('files');
      await filesCollection.insertMany([{ name: 'File1' }, { name: 'File2' }]);
      const count = await dbClient.nbFiles();
      expect(count).to.equal(2);
    });
  });
});
