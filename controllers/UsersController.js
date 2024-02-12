// user controller

import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  postNew: async (req, res) => {
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.users.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    try {
      const newUser = await dbClient.users.insertOne({ email, password: hashedPassword });
      return res.status(201).json({ id: newUser.insertedId, email });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default UsersController;
