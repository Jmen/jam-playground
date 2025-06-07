import fs from 'fs';
import path from 'path';
import { document } from '../app/api/openapi';

// Create the public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Write the OpenAPI document to a JSON file
const openApiPath = path.join(publicDir, 'openapi.json');
fs.writeFileSync(openApiPath, JSON.stringify(document, null, 2));

console.log(`OpenAPI spec generated at ${openApiPath}`);
