// controllers/UsersController.js

import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  postNew: (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    dbClient.users.findOne({ email }, (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = sha1(password);

      dbClient.users.insertOne({ email, password: hashedPassword }, (err, newUser) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(201).json({ id: newUser.insertedId, email });
      });
    });
  },
};

export default UsersController;
