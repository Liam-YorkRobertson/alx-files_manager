// tests for AppController

import chai from 'chai';
import AppController from '../../controllers/AppController';

const { expect } = chai;

describe('appController', () => {
  describe('getStatus', () => {
    it('return status with Redis and DB', async () => {
      const req = {};
      const res = {
        status: (statusCode) => ({
          json: (data) => {
            expect(statusCode).to.equal(200);
            expect(data.redis).to.be.a('boolean');
            expect(data.db).to.be.a('boolean');
          },
        }),
      };
      await AppController.getStatus(req, res);
    });
  });

  describe('getStats', () => {
    it('return stats for users and files', async () => {
      const req = {};
      const res = {
        status: (statusCode) => ({
          json: (data) => {
            expect(statusCode).to.equal(200);
            expect(data.users).to.be.a('number');
            expect(data.files).to.be.a('number');
          },
        }),
      };
      await AppController.getStats(req, res);
    });
  });
});
