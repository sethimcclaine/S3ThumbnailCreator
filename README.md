### Lambda setup
* This will likely time out, so need to update 'Configuration' -> 'Timeout'

### Sharp setup
Lambda runs on x64 so it needs a special binary for sharp, to install the
correct version run: 
`npm install --os=linux --cpu=x64 sharp`

### Update Function
Currently just ziping this locally and uploading the zip manually

https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/McClaineMedia-S3ThumbnailCreator?newFunction=true

`npm run zip`
