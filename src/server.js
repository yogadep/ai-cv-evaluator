import 'dotenv/config';
import express from 'express';
import routes from './router.js';
import { newWeavClient, ensureSchema } from './rag.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/api', routes);

const port = Number(process.env.PORT || 8000);

(async () => {
  try {
    const weav = newWeavClient();
    await ensureSchema(weav);
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
})();
