// controller functions

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AppController = {
  async getStatus(_, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    return res.status(200).json({ redis, db });
  },

  async getStats(_, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return res.status(200).json({ users, files });
  },
};

export default AppController;
