// user controller

import sha1 from 'sha1';
import Bull from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Bull('userQueue');

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }
    const hashedPassword = sha1(password);
    try {
      const collection = dbClient.db.collection('users');
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return response.status(400).json({ error: 'Already exist' });
      }
      const newUser = await collection.insertOne({ email, password: hashedPassword });
      await userQueue.add({ userId: newUser.insertedId });
      return response.status(201).json({ id: newUser.insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const { 'x-token': token } = req.headers;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.users.findOne({ _id: userId });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
