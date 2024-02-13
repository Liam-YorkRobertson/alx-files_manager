// test for redis

import chai from 'chai';
import RedisClient from '../../utils/redis';

const { expect } = chai;

describe('redisClient', () => {
  describe('isAlive', () => {
    it('should return true when redis client is connected', () => {
      expect(RedisClient.isAlive()).to.be.true;
    });
  });

  describe('set and get', () => {
    it('should set and get a key-value pair correctly', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const duration = 60;
      await RedisClient.set(key, value, duration);
      const retrievedValue = await RedisClient.get(key);
      expect(retrievedValue).to.equal(value);
    });
  });

  describe('del', () => {
    it('should delete a key correctly', async () => {
      const key = 'testKey';
      await RedisClient.set(key, 'testValue', 60);
      await RedisClient.del(key);
      const retrievedValue = await RedisClient.get(key);
      expect(retrievedValue).to.be.null;
    });
  });
});
