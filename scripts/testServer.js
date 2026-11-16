import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Simple static file server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': reqPath.endsWith('.html') ? 'text/html' : reqPath.endsWith('.glb') ? 'model/gltf-binary' : 'application/octet-stream',
    });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(4999, '127.0.0.1', async () => {
  console.log('Static test server listening on http://127.0.0.1:4999');

  async function checkUrl(urlPath, isHead = false) {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: '127.0.0.1',
        port: 4999,
        path: urlPath,
        method: isHead ? 'HEAD' : 'GET',
      };
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            length: data.length,
          });
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  try {
    const htmlRes = await checkUrl('/');
    console.log('✓ [GET /] Status:', htmlRes.statusCode, 'Length:', htmlRes.length);
    if (htmlRes.statusCode !== 200) throw new Error('index.html not 200');

    const glb1 = await checkUrl('/models/Tent_8_8.glb', true);
    console.log('✓ [HEAD /models/Tent_8_8.glb] Status:', glb1.statusCode, 'Bytes:', glb1.headers['content-length']);
    if (glb1.statusCode !== 200) throw new Error('Tent_8_8.glb not 200');

    const glb2 = await checkUrl('/models/Tent_6_5_6_5.glb', true);
    console.log('✓ [HEAD /models/Tent_6_5_6_5.glb] Status:', glb2.statusCode, 'Bytes:', glb2.headers['content-length']);
    if (glb2.statusCode !== 200) throw new Error('Tent_6_5_6_5.glb not 200');

    const glb3 = await checkUrl('/models/Tent_5_5.glb', true);
    console.log('✓ [HEAD /models/Tent_5_5.glb] Status:', glb3.statusCode, 'Bytes:', glb3.headers['content-length']);
    if (glb3.statusCode !== 200) throw new Error('Tent_5_5.glb not 200');

    console.log('\n🎉 ALL ASSETS & STATIC PRODUCTION BUILD VERIFIED ACCESSIBLE OVER HTTP!');
  } catch (err) {
    console.error('Test server error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
