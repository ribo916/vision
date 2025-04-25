# File Upload Service

A simple file upload service that processes documents using VisionFi.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `visionfi_service_account.json` file in the root directory with your VisionFi service account credentials.

3. Start the server:
```bash
node server.js
```

The server will run on http://localhost:3000

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set the following environment variables in Render:
   - `PORT`: The port number (Render will set this automatically)
   - `VISIONFI_SERVICE_ACCOUNT`: Your VisionFi service account credentials as a JSON string

To set the `VISIONFI_SERVICE_ACCOUNT` environment variable:
1. Open your `visionfi_service_account.json` file
2. Copy the entire contents
3. In Render's environment variables section, paste the JSON as the value for `VISIONFI_SERVICE_ACCOUNT`

Note: Make sure to properly escape any special characters in the JSON when pasting it into Render's environment variables.

## Environment Variables

- `PORT`: The port number the server will run on (default: 3000)
- `VISIONFI_SERVICE_ACCOUNT`: JSON string containing VisionFi service account credentials

## File Structure

- `server.js`: Main application file
- `views/`: EJS template files
  - `index.ejs`: Upload page
  - `result.ejs`: Results page
- `uploads/`: Temporary storage for uploaded files
- `public/`: Static files (if any)
