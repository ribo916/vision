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

4. Add your service account credentials as a secret file:
   - In the Render dashboard, go to your service's "Environment" section
   - Click "Add Secret File"
   - Name: `visionfi_service_account.json`
   - Content: Paste the entire contents of your service account JSON file
   - The file will be available at `/etc/secrets/visionfi_service_account.json` in your application

## Environment Variables

- `PORT`: The port number the server will run on (default: 3000)
- `VISIONFI_SERVICE_ACCOUNT`: (Optional) JSON string containing VisionFi service account credentials. Only used if secret file is not available.

## File Structure

- `server.js`: Main application file
- `views/`: EJS template files
  - `index.ejs`: Upload page
  - `result.ejs`: Results page
- `uploads/`: Temporary storage for uploaded files
- `public/`: Static files (if any)
