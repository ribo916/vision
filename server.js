import express from 'express';
import multer from 'multer';
import path, { join } from 'path';
import fs from 'fs';
import visionfi from 'visionfi';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { VisionFi } = visionfi;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Serve static files (optional)
app.use(express.static('public'));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Home page with upload form
app.get('/', (req, res) => {
  res.render('index');
});

// Upload handler with VisionFI call
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = req.file.originalname;

    const client = new VisionFi({
      serviceAccountPath: './visionfi_service_account.json',
    });

    const workflows = await client.getWorkflows();
    const workflow = workflows.data.find(
      (wf) => wf.workflow_key === 'auto_invoice_processing'
    );

    if (!workflow) {
      throw new Error('Workflow "auto_invoice_processing" not authorized.');
    }

    const result = await client.analyzeDocument(fileBuffer, {
      fileName,
      analysisType: workflow.workflow_key,
    });

    const final = await client.getResults(result.uuid, 3000, 20);
    const data = final.results.analysisResult;

    res.render('result', { data });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
