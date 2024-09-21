const AWS = require('aws-sdk');
const sharp = require('sharp');

// Initialize the S3 client
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    if (key.includes('-thumbnail')) {
      console.log('This is already a thumbnail, skipping...');
      return;
    }

    // Get the image from S3
    const params = { Bucket: bucket, Key: key };
    const inputImage = await s3.getObject(params).promise();

    // Create a thumbnail using Sharp
    const thumbnail = await sharp(inputImage.Body)
      .resize({ height: 200})
      .toBuffer();

    // Define the thumbnail key (filename with '-thumbnail' appended)
    const thumbnailKey = key.replace(/\.(\w+)$/, '-thumbnail.$1');

    // Upload the thumbnail back to S3
    const uploadParams = {
      Bucket: bucket,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/jpeg',
    };

    await s3.putObject(uploadParams).promise();
    console.log(`Thumbnail uploaded to ${thumbnailKey}`);
  } catch (error) {
    console.error('Error processing image:', error);
  }
};

