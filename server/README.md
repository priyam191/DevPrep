# Server deployment notes

## Configure S3 CORS for browser uploads

Resume files upload directly from the browser to S3 using a presigned `PUT`.
The S3 bucket must allow the frontend origins and the `content-type` request
header; Express CORS settings do not apply to this upload.

Apply `config/s3-cors.json` to the `devprep-resume-upload` bucket using the AWS
CLI from this directory. First check which AWS account the CLI is using and
inspect the bucket's active CORS rules:

```powershell
aws sts get-caller-identity
aws s3api get-bucket-cors --bucket devprep-resume-upload --region ap-south-1
```

Apply the rules, then inspect the bucket again:

```powershell
aws s3api put-bucket-cors --bucket devprep-resume-upload --region ap-south-1 --cors-configuration file://config/s3-cors.json
aws s3api get-bucket-cors --bucket devprep-resume-upload --region ap-south-1
```

This replaces the bucket's current CORS configuration. Preserve any existing
rules that are still needed before applying it. If the deployed frontend uses a
custom domain, add that exact origin to `AllowedOrigins`.

The active configuration must allow origin `https://dev-prep-gamma.vercel.app`,
method `PUT`, and header `content-type`. If the preflight still fails after
verifying these rules on the bucket, confirm the frontend origin and bucket
name in the browser request match the values above.
