'use strict';

/**
 * Video manipulation functions
 */

const {spawn} = require('child_process')
const {Readable, Writable} = require('stream');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = {
  async generateVideoThumbnail(videoData) {
    if (true) {
      return null;
    }
    //TODO: NOT WORKING
    if (!videoData?.mime || !videoData?.mime?.startsWith('video')) {
      return null;
    }

    const screenshotData = await getScreenshot(videoData);

    if (screenshotData) {
      const {generateThumbnail} = strapi.plugins.upload.services['image-manipulation'];
      return await generateThumbnail(screenshotData);
    }
    return null;
  },

  async getVideoMetadata(videoData) {
    if (!videoData?.mime || !videoData?.mime?.startsWith('video')) {
      return null;
    }
    return new Promise((resolve, reject) => {
      const videoStream = buffer2Stream(videoData.buffer);
      ffmpeg.ffprobe(videoStream, function (err, metadata) {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }
};

const getScreenshot = (videoData) =>
  new Promise(async (resolve, reject) => {
    const videoStream = buffer2Stream(videoData.buffer);
    // Take screenshot
    try {
      //TODO: NOT WORKING
      await createImage(videoStream);
    } catch (e) {
      reject(e);
    }
  });


const buffer2Stream = (buffer) => {
  const bufferCopy = Buffer.from(buffer);
  return Readable.from(bufferCopy);
}

const stream2buffer = (stream) => {
  return new Promise((resolve, reject) => {
    let _buf = []
    stream.on('data', chunk => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', err => reject(err));
  });
}

const createImage = async (rstream) => {
  return new Promise((resolve, reject) => {

    try {

      const ffmpeg = spawn(ffmpegPath, [
        '-ss',
        '00:00:00',
        '-i',
        'pipe:0',
        '-f',
        'pipe:1',
        '-vf',
        'scale=iw:ih',
        '-frames:v',
        '1',
      ], {shell: true});

      const data = [];
      const wstream = new Writable();
      wstream._write = function (chunk) {
        data.push(chunk);
      };

      ffmpeg.on('error', function (err) {
        console.log(err)
        reject()
      });

      ffmpeg.on('close', (code) => {
        ffmpeg.unpipe(ffmpeg.stdin);
        resolve(data);
      });

      ffmpeg.stdout.pipe(wstream);

      rstream.pipe(ffmpeg.stdin);
    } catch (e) {
      reject(e);
    }
  });
}

