import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only proxy — mirrors the Vercel serverless function for local development
function osintProxyPlugin() {
  let apiKey;
  return {
    name: 'osint-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.OI_API_KEY || '';
    },
    configureServer(server) {
      server.middlewares.use('/api/osint', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', async () => {
          try {
            const upstream = await fetch('https://api.osint.industries/v2/request', {
              method: 'POST',
              headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey,
              },
              body,
            });
            const data = await upstream.text();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = upstream.status;
            res.end(data);
          } catch (err) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), osintProxyPlugin()],
})
