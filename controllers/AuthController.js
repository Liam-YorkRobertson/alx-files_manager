// auth controller

import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).json({ error: 'Unauthorized' });
    const encodedCredentials = authHeader.slice('Basic '.length);
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');
    if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });
    const hashedPassword = sha1(password);
    const user = await dbClient.users.findOne({ email, password: hashedPassword });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const { 'x-token': token } = req.headers;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
