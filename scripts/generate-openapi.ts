import fs from "fs";
import path from "path";
import { document } from "../app/api/openapi";

const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const openApiPath = path.join(publicDir, "openapi.json");
fs.writeFileSync(openApiPath, JSON.stringify(document, null, 2));

console.log(`OpenAPI spec generated at ${openApiPath}`);
