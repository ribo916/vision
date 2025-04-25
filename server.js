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
const PORT = process.env.PORT || 3000;

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Serve static files (optional)
app.use(express.static('public'));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Cache for workflow information
let workflowCache = null;
let lastWorkflowFetch = 0;
const WORKFLOW_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Function to get workflows with caching
async function getWorkflows(client) {
    const now = Date.now();
    if (workflowCache && (now - lastWorkflowFetch) < WORKFLOW_CACHE_DURATION) {
        return workflowCache;
    }

    const workflows = await client.getWorkflows();
    workflowCache = workflows;
    lastWorkflowFetch = now;
    return workflows;
}

// Function to get service account credentials
function getServiceAccountCredentials() {
    // First try Render's secret file location
    const renderSecretPath = '/etc/secrets/visionfi_service_account.json';
    if (fs.existsSync(renderSecretPath)) {
        return JSON.parse(fs.readFileSync(renderSecretPath, 'utf8'));
    }
    
    // Then try local file
    if (fs.existsSync('./visionfi_service_account.json')) {
        return JSON.parse(fs.readFileSync('./visionfi_service_account.json', 'utf8'));
    }
    
    // Finally try environment variable
    if (process.env.VISIONFI_SERVICE_ACCOUNT) {
        try {
            return JSON.parse(process.env.VISIONFI_SERVICE_ACCOUNT);
        } catch (error) {
            console.error('Error parsing VISIONFI_SERVICE_ACCOUNT environment variable:', error);
            throw new Error('Invalid VISIONFI_SERVICE_ACCOUNT environment variable format');
        }
    }
    
    throw new Error('No service account credentials found. Please provide visionfi_service_account.json as a secret file, local file, or VISIONFI_SERVICE_ACCOUNT environment variable.');
}

// Home page with upload form
app.get('/', (req, res) => {
    res.render('index');
});

// Upload handler with VisionFI call
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        console.log('📁 File received:', req.file.originalname);
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = req.file.originalname;

        console.log('🔑 Initializing VisionFi client...');
        const client = new VisionFi({
            serviceAccountJson: getServiceAccountCredentials()
        });

        console.log('📋 Fetching workflows...');
        const workflows = await getWorkflows(client);
        console.log('✅ Workflows fetched successfully');
        
        const workflow = workflows.data.find(
            (wf) => wf.workflow_key === 'auto_invoice_processing'
        );

        if (!workflow) {
            throw new Error('Workflow "auto_invoice_processing" not authorized.');
        }
        console.log('✅ Found workflow:', workflow.workflow_key);

        console.log('📤 Submitting document for analysis...');
        const result = await client.analyzeDocument(fileBuffer, {
            fileName,
            analysisType: workflow.workflow_key,
        });
        console.log('✅ Document submitted successfully');
        console.log('🔍 Analysis UUID:', result.uuid);

        console.log('⏳ Starting to poll for results...');
        // Using better polling parameters:
        // - 5000ms (5 seconds) between polls
        // - 30 attempts (2.5 minutes total)
        // - Warning after 5 attempts
        const final = await client.getResults(result.uuid, 5000, 30, 5);
        console.log('✅ Results received successfully');
        
        const data = final.results.analysisResult;
        console.log('📊 Analysis complete, rendering results...');

        res.render('result', { data });
    } catch (err) {
        console.error('❌ Error:', err);
        res.status(500).send('Something went wrong: ' + err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
