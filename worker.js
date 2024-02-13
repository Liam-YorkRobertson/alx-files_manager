// processess jobs added to bull queue and handles emails

import Bull from 'bull';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }
  const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
  if (!file) {
    throw new Error('File not found');
  }
  const sizes = [500, 250, 100];
  const promises = sizes.map(async (size) => {
    const thumbnailPath = `${file.localPath}_${size}`;
    const options = { width: size };
    const thumbnailData = await thumbnail(file.localPath, options);
    await fs.promises.writeFile(thumbnailPath, thumbnailData);
  });
  await Promise.all(promises);
});

userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) {
    throw new Error('Missing userId');
  }
  const user = await dbClient.db.collection('users').findOne({ _id: userId });
  if (!user) {
    throw new Error('User not found');
  }
  console.log(`Welcome ${user.email}!`);
});

export { fileQueue, userQueue };
