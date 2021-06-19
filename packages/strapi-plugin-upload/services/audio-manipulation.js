'use strict';

/**
 * Audio manipulation functions
 */

const musicMetaData = require('music-metadata');

const getAudioDuration = async ({buffer, mimeType, size}) => {
  if (mimeType?.startsWith('audio')) {
    const audioInfo = await musicMetaData.parseBuffer(buffer, {mimeType, size}, {
      duration: true,
      skipCovers: true
    })
    return audioInfo.format.duration;
  }
  return null;
}

module.exports = {
  getAudioDuration,
};