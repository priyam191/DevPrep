# Server deployment notes

## Configure S3 CORS for browser uploads

Resume files upload directly from the browser to S3 using a presigned `PUT`.
The S3 bucket must allow the frontend origins and the `content-type` request
header; Express CORS settings do not apply to this upload.

Apply `config/s3-cors.json` to the `devprep-resume-upload` bucket using the AWS
CLI from this directory:

```powershell
aws s3api put-bucket-cors --bucket devprep-resume-upload --cors-configuration file://config/s3-cors.json
```

This replaces the bucket's current CORS configuration. Preserve any existing
rules that are still needed before applying it. If the deployed frontend uses a
custom domain, add that exact origin to `AllowedOrigins`.
