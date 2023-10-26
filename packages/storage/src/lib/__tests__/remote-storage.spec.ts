import { describe, expect, it } from 'vitest';
import path from 'path';
import { RemoteStorage } from '../remote-storage';
import { pollinationX } from '../../../../../secrets.json';
import { PollinationX } from '../remote/providers/pollination-x';
import { RemoteFileInfo } from '@4thtech-sdk/types';
import fs from 'fs';

const remoteStorageProvider = new PollinationX(pollinationX.url, pollinationX.token);
const storage = new RemoteStorage({
  storageProvider: remoteStorageProvider,
});

describe('Storage', () => {
  describe('Storage without encryption', () => {
    it('Should store a single file', async () => {
      const remoteFileInfo = await storage.store(
        {
          path: path.resolve(__dirname, './files/metadata.json'),
        },
        undefined,
        (progressInfo) => {
          console.log(progressInfo);
        },
      );

      console.log(remoteFileInfo);

      expect(remoteFileInfo).toBeInstanceOf(Object);
      expect(remoteFileInfo).toHaveProperty('name');
      expect(remoteFileInfo).toHaveProperty('URL');
      expect(remoteFileInfo).toHaveProperty('checksum');
      expect(remoteFileInfo).toHaveProperty('metadata');
    });

    it('Should store a array of files', async () => {
      const remoteFileInfos = (await storage.store(
        [
          {
            path: path.resolve(__dirname, './files/metadata.json'),
          },
          {
            path: path.resolve(__dirname, './files/example.txt'),
          },
        ],
        undefined,
        (progressInfo) => {
          console.log(progressInfo);
        },
      )) as RemoteFileInfo[];

      expect(Array.isArray(remoteFileInfos)).toBe(true);

      remoteFileInfos.forEach((fileInfo) => {
        expect(fileInfo).toHaveProperty('name');
        expect(fileInfo).toHaveProperty('URL');
        expect(fileInfo).toHaveProperty('checksum');
        expect(fileInfo).toHaveProperty('metadata');
      });
    });

    it('Should upload a file by supplied Buffer', async () => {
      const filePath = path.resolve(__dirname, './files/metadata.json');
      const originalFileBuffer = fs.readFileSync(filePath);

      const remoteFile = await storage.store({
        content: originalFileBuffer,
        name: 'metadata.json',
      });

      if (!Array.isArray(remoteFile)) {
        const retrievedFile = await storage.retrieve(remoteFile);
        expect(Buffer.from(retrievedFile)).to.deep.equal(originalFileBuffer);
      }
    });

    it('Should handle file retrieval', async () => {
      // Store a single file first to get the remote file info
      const storedFileInfo = (await storage.store({
        path: path.resolve(__dirname, './files/metadata.json'),
      })) as RemoteFileInfo;

      const retrievedFile = await storage.retrieve(storedFileInfo);

      expect(retrievedFile).toBeInstanceOf(ArrayBuffer);
    });

    // TODO: fix this test
    it('Should handle failed file retrieval', async () => {
      await expect(
        storage.retrieve({
          name: 'nonExistentFile',
          URL: 'https://invalidurl.com/nonExistentFile',
          checksum: '',
          metadata: '{}',
        }),
      ).rejects.toThrowError('Unable to retrieve file');
    });
  });
  // TODO: add some tests for encryption
});

/*
import { TestClient } from 'vitest';

test('file upload', async () => {
    const client = new TestClient();
    const file = fs.createReadStream('./example.txt');
    const form = new FormData();
    form.append('file', file);
    const response = await client.post('/upload').send(form);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'File uploaded successfully' });
});
*/
