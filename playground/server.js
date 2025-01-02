const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || 1802;
const staticFolder = process.argv[3] || 'public';

// MIME types for common file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
};

fs.copyFile(path.resolve('lib', 'index.js'), path.resolve(__dirname, staticFolder, 'lib', 'index.js'), (err) => {
    if (err) {
        console.error(err);
    }
});

const server = http.createServer((req, res) => {
    // Convert URL to file path, using index.html for root path
    let filePath = path.join(__dirname, staticFolder, req.url === '/' ? 'index.html' : req.url);

    // Get file extension
    const ext = path.extname(filePath);

    // Set content type based on file extension
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404);
                res.end(`File ${filePath} not found`);
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Serving files from: ${path.resolve(staticFolder)}`);
});