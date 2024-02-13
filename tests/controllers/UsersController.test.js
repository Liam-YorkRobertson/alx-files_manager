// test for UsrsController

import chai from 'chai';
import sinon from 'sinon';
import sha1 from 'sha1';
import UsersController from '../../controllers/UsersController';
import dbClient from '../../utils/db';
import redisClient from '../../utils/redis';

const { expect } = chai;

describe('usersController', () => {
  describe('postNew', () => {
    it('should create a new user', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      const hashedPassword = 'hashedpassword';
      const req = { body: { email, password } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const findOneStub = sinon.stub(dbClient.db.collection('users'), 'findOne').resolves(null);
      const insertOneStub = sinon.stub(dbClient.db.collection('users'), 'insertOne').resolves({ insertedId: 'insertedId' });
      sinon.stub(sha1, 'default').returns(hashedPassword);
      await UsersController.postNew(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ id: 'insertedId', email })).to.be.true;
      findOneStub.restore();
      insertOneStub.restore();
    });
  });

  describe('getMe', () => {
    it('should return user details', async () => {
      const userId = 'user123';
      const email = 'test@example.com';
      const token = 'token123';
      const req = { headers: { 'x-token': token } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const getStub = sinon.stub(redisClient, 'get').resolves(userId);
      const findOneStub = sinon.stub(dbClient.users, 'findOne').resolves({ _id: userId, email });
      await UsersController.getMe(req, res);
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ id: userId, email })).to.be.true;
      getStub.restore();
      findOneStub.restore();
    });
  });
});
