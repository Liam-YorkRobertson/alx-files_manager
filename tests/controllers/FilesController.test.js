// tests for FilesController

import chai from 'chai';
import sinon from 'sinon';
import Bull from 'bull';
import fs from 'fs';
import mime from 'mime-types';
import FilesController from '../../controllers/FilesController';
import dbClient from '../../utils/db';

const { expect } = chai;

describe('filesController', () => {
  describe('postUpload', () => {
    it('should create a new file and return status 201', async () => {
      const req = { userId: 'user_id', body: { name: 'test.txt', type: 'file', data: 'file_data' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.db.collection('users'), 'findOne').resolves({ _id: req.userId });
      sinon.stub(dbClient.db.collection('files'), 'insertOne').resolves({ insertedId: 'inserted_id' });
      sinon.stub(Bull.prototype, 'add');
      await FilesController.postUpload(req, res);
      expect(res.status.calledOnceWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });

  describe('getShow', () => {
    it('should return the file if found', async () => {
      const req = { params: { id: 'file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { json: sinon.spy() };
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(dbClient.files, 'findOne').resolves({ _id: 'file_id', userId: 'user_id' });
      await FilesController.getShow(req, res);
      expect(res.json.calledOnceWith({ _id: 'file_id', userId: 'user_id' })).to.be.true;
    });

    it('should return status 404 if file not found', async () => {
      const req = { params: { id: 'non_existent_file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(dbClient.files, 'findOne').resolves(null);
      await FilesController.getShow(req, res);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith({ error: 'Not found' })).to.be.true;
    });
  });

  describe('getIndex', () => {
    it('should return an array of files', async () => {
      const req = { query: { parentId: 'parent_id', page: 0 }, headers: { 'x-token': 'user_token' } };
      const res = { json: sinon.spy() };
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(dbClient.files, 'find').returns({ skip: sinon.stub().returnsThis(), limit: sinon.stub().returnsThis(), toArray: sinon.stub().resolves([{ _id: 'file_id', userId: 'user_id' }]) });
      await FilesController.getIndex(req, res);
      expect(res.json.calledOnceWith([{ _id: 'file_id', userId: 'user_id' }])).to.be.true;
    });
  });

  describe('putPublish', () => {
    it('should publish the file and return it', async () => {
      const req = { params: { id: 'file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(dbClient.files, 'findOne').resolves({ _id: 'file_id', userId: 'user_id' });
      sinon.stub(dbClient.files, 'updateOne').resolves();
      await FilesController.putPublish(req, res);
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ _id: 'file_id', userId: 'user_id' })).to.be.true;
    });
  });

  describe('putUnpublish', () => {
    it('should unpublish the file and return it', async () => {
      const req = { params: { id: 'file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(dbClient.files, 'findOne').resolves({ _id: 'file_id', userId: 'user_id' });
      sinon.stub(dbClient.files, 'updateOne').resolves();
      await FilesController.putUnpublish(req, res);
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ _id: 'file_id', userId: 'user_id' })).to.be.true;
    });
  });

  describe('getFile', () => {
    it('should return the file content', async () => {
      const req = { params: { id: 'file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { header: sinon.stub().returnsThis(), status: sinon.stub().returnsThis(), send: sinon.spy() };
      sinon.stub(dbClient.db.collection('files'), 'findOne').resolves({
        _id: 'file_id', userId: 'user_id', type: 'file', localPath: '/path/to/file', name: 'test.txt', isPublic: true,
      });
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(fs.promises, 'readFile').resolves('file_data');
      sinon.stub(mime, 'contentType').returns('text/plain');
      await FilesController.getFile(req, res);
      expect(res.header.calledOnceWith('Content-Type', 'text/plain')).to.be.true;
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.send.calledOnceWith('file_data')).to.be.true;
    });

    it('should return status 404 if file not found', async () => {
      const req = { params: { id: 'non_existent_file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(dbClient.db.collection('files'), 'findOne').resolves(null);
      await FilesController.getFile(req, res);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith({ error: 'Not found' })).to.be.true;
    });

    it('should return status 404 if file is not public and user is not owner', async () => {
      const req = { params: { id: 'file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.db.collection('files'), 'findOne').resolves({
        _id: 'file_id', userId: 'another_user_id', type: 'file', isPublic: false,
      });
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      await FilesController.getFile(req, res);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith({ error: 'Not found' })).to.be.true;
    });

    it('should return status 404 if file is a folder', async () => {
      const req = { params: { id: 'folder_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.db.collection('files'), 'findOne').resolves({
        _id: 'folder_id', userId: 'user_id', type: 'folder', isPublic: true,
      });
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      await FilesController.getFile(req, res);
      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.json.calledOnceWith({ error: "A folder doesn't have content" })).to.be.true;
    });

    it('should return status 404 if error reading file', async () => {
      const req = { params: { id: 'file_id' }, headers: { 'x-token': 'user_token' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      sinon.stub(dbClient.db.collection('files'), 'findOne').resolves({
        _id: 'file_id', userId: 'user_id', type: 'file', localPath: '/path/to/file', isPublic: true,
      });
      sinon.stub(dbClient.users, 'findOne').resolves({ _id: 'user_id' });
      sinon.stub(fs.promises, 'readFile').rejects(new Error('Failed to read file'));
      await FilesController.getFile(req, res);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith({ error: 'Not found' })).to.be.true;
    });
  });
});
