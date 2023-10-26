import * as fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { describe, expect, it, beforeEach } from 'vitest';
import { pollinationX } from '../../../../../secrets.json';
import { PollinationX } from '../remote/providers/pollination-x';

const url = pollinationX.url;
const token = pollinationX.token;

describe('PollinationX', () => {
  let pollinationX: PollinationX;

  beforeEach(() => {
    pollinationX = new PollinationX(url, token);

    // pollinationX.onUploadProgress((percent, fileName) => {
    //   console.log(`Upload Progress (${fileName}): ${percent}%`);
    // });
  });

  it('Should upload a file by supplied path', async () => {
    const filePath = path.resolve(__dirname, './files/example.txt');
    const readStream = createReadStream(filePath);

    const fileUrl = await pollinationX.upload(readStream);

    expect(fileUrl).to.be.equal(
      'https://gateway.btfs.io/btfs/QmVvNuiDe5SPnPaGCLdVK3dXjQ6QyVAkXeXwFNPPM2TzRV',
    );
  });

  // it('Should upload a big file by supplied path', async () => {
  //   const filePath = path.resolve(__dirname, './files/big-file.txt');
  //   const readStream = createReadStream(filePath);
  //
  //   const fileUrl = await pollinationX.upload(readStream);
  //
  //   expect(fileUrl).to.be.equal('https://gateway.btfs.io/btfs/QmVvNuiDe5SPnPaGCLdVK3dXjQ6QyVAkXeXwFNPPM2TzRV');
  // }, 5 * 60 * 1000);

  it('Should upload a file by supplied Buffer', async () => {
    const filePath = path.resolve(__dirname, './files/metadata.json');
    const fileBuffer = fs.readFileSync(filePath);

    const fileUrl = await pollinationX.upload(fileBuffer);

    expect(fileUrl).toContain('https://gateway.btfs.io/btfs/Q');
  });

  it('Should be downloaded exactly the same file as uploaded', async () => {
    const filePath = path.resolve(__dirname, './files/example.txt');
    const readStream = createReadStream(filePath);

    const fileUrl = await pollinationX.upload(readStream);
    const file = await pollinationX.download(fileUrl);

    const originalFileBuffer = fs.readFileSync(filePath);

    expect(Buffer.from(file)).to.deep.equal(originalFileBuffer);
  });

  it('Should be downloaded exactly the same content as uploaded', async () => {
    const jsonString =
      '{"content":{"subject":"Test subject","attachments":[]},"receiver":"0x70997970C51812dc3A010C7d01b50e0d17dc79C8","sender":"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}';
    const fileContent = Buffer.from(jsonString);

    const fileUrl = await pollinationX.upload(fileContent);
    const downloadedFileContent = await pollinationX.download(fileUrl);

    expect(fileContent).to.be.deep.equal(Buffer.from(downloadedFileContent));
  });
});
