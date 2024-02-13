// tests for AuthController

import chai from 'chai';
import AuthController from '../../controllers/AuthController';

const { expect } = chai;

describe('authController', () => {
  describe('getConnect', () => {
    it('return 401 if no authorization header', async () => {
      const req = {};
      const res = {
        status: (statusCode) => ({
          json: (data) => {
            expect(statusCode).to.equal(401);
            expect(data.error).to.equal('Unauthorized');
          },
        }),
      };
      await AuthController.getConnect(req, res);
    });
  });

  describe('getDisconnect', () => {
    it('return 401 if no token header', async () => {
      const req = {};
      const res = {
        status: (statusCode) => ({
          json: (data) => {
            expect(statusCode).to.equal(401);
            expect(data.error).to.equal('Unauthorized');
          },
        }),
      };
      await AuthController.getDisconnect(req, res);
    });
  });
});
