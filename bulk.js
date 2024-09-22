/**
 * Depricated for threading approach with BulkS3ThumbNails
 */
const AWS = require('aws-sdk');
const sharp = require('sharp');

// Initialize the S3 client
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    //const bucket = process.env.BUCKET_NAME;  // Set your bucket name via environment variable or hardcode it
    const bucket = event.Records[0].s3.bucket.name;
    const images = await listAllImages(bucket);

    // Process each image
    for (const image of images) {
      if (!image.Key.includes('-thumbnail') && isImageFile(image.Key)) {
        await processImage(bucket, image.Key);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify('All images processed successfully!'),
    };
  } catch (error) {
    console.error('Error processing images:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing images.'),
    };
  }
};

// List all objects in the bucket
async function listAllImages(bucket) {
  let isTruncated = true;
  let marker;
  const images = [];

  while (isTruncated) {
    const params = {
      Bucket: bucket,
      ContinuationToken: marker, // For pagination if there are more than 1000 objects
    };

    const response = await s3.listObjectsV2(params).promise();
    images.push(...response.Contents);
    isTruncated = response.IsTruncated;
    marker = response.NextContinuationToken; // For pagination
  }

  return images;
}

// Check if the file is an image (based on file extension)
function isImageFile(key) {
  return key.match(/\.(jpg|jpeg|png|gif)$/i);
}

// Process the image: resize and upload thumbnail
async function processImage(bucket, key) {
  console.log(`Processing image: ${key}`);

  // Get the image from S3
  const params = { Bucket: bucket, Key: key };
  const inputImage = await s3.getObject(params).promise();

  // Create a thumbnail using Sharp (resize height to 200px, width proportional)
  const thumbnail = await sharp(inputImage.Body)
    .resize({ height: 200 })
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
}

