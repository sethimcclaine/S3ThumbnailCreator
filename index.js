const AWS = require('aws-sdk');
const sharp = require('sharp');

// Initialize the S3 client
const s3 = new AWS.S3();

/**
 * @param Bucket
 * @param Key
 */
exports.handler = async (event) => {
  try {
    //const bucket = event.Records[0].s3.bucket.name;
    //const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    if (event.Key.includes('-thumbnail')) {
      const msg = 'This is already a thumbnail, skipping...'
      console.log(msg);
      return;
      return {
        statusCode: 200,
        body: JSON.stringify({msg})
      }
    }

    // Get the image from S3
    //const params = { Bucket: bucket, Key: key };
    const inputImage = await s3.getObject(event).promise();

    // Create a thumbnail using Sharp
    const thumbnail = await sharp(inputImage.Body)
      .resize({ height: 200})
      .toBuffer();

    // Define the thumbnail key (filename with '-thumbnail' appended)
    const thumbnailKey = event.Key.replace(/\.(\w+)$/, '-thumbnail.$1');

    // Upload the thumbnail back to S3
    const uploadParams = {
      Bucket: event.Bucket,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/jpeg',
    };

    await s3.putObject(uploadParams).promise();
    const msg = `Thumbnail uploaded to ${thumbnailKey}`
    console.log(msg);
    return {
      statusCode: 200,
      body: JSON.stringify({msg})
    }   
  } catch (error) {
    const msg = `Error processing image (${event.Bucket}-${event.Key}):`
    console.error(msg, error);
    return {
      statusCode: 500,
      body: JSON.stringify({msg, error})
    }
  }
};

