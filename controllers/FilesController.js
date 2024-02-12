// files controller

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(request, response) {
    const {
      name, type, data, parentId = '0', isPublic = false,
    } = request.body;
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return response.status(400).json({ error: 'Missing type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return response.status(400).json({ error: 'Missing data' });
    }
    const usersCollection = dbClient.db.collection('users');
    const user = await usersCollection.findOne({ _id: request.userId });
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    if (parentId !== '0') {
      const filesCollection = dbClient.db.collection('files');
      const parentFile = await filesCollection.findOne({ _id: parentId });
      if (!parentFile) {
        return response.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const newFile = {
      userId: request.userId,
      name,
      type,
      isPublic,
      parentId,
    };
    if (type !== 'folder') {
      const storingFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = uuidv4();
      const filePath = path.join(storingFolder, fileName);
      const buffer = Buffer.from(data, 'base64');
      await fs.promises.writeFile(filePath, buffer);
      newFile.localPath = filePath;
    }
    const filesCollection = dbClient.db.collection('files');
    await filesCollection.insertOne(newFile);
    return response.status(201).json(newFile);
  }
}

export default FilesController;
