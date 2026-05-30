import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment configurations
dotenv.config();

const app = express();
const PORT = 3000;

// Parse json bodies
app.use(express.json());

// Initialize server-side Gemini client
let aiClient: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is not defined in Back-Office configurations.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
};

// API: AI-Powered Luxury Eastern Product Description Suggestion Endpoint
app.post('/api/generate-description', async (req, res) => {
  try {
    const { title, category, fabric } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title field is required for compositions.' });
      return;
    }

    const ai = getGeminiClient();
    
    // Check if key exists, otherwise let it fall back client-side gracefully
    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: 'Gemini service key not provisioned in secrets.' });
      return;
    }

    const promptText = `Compose a rich, luxury, boutique product description for a Pakistani women's premium outfit.
    Product Title: ${title}
    Category/Collection: ${category || 'Luxury Formals'}
    Fabric elements: ${fabric || 'Premium silks'}
    
    Make it feel extremely high-end, elegant, and exclusive. Use professional Eastern fashion terminology (e.g. zardozi, kora resham threads, exquisite scalloped panels, luxury silhouettes).
    Limit the description to 3 sentences. Do not use generic filler words or markdown symbols.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction: 'You are an elite, high-fashion copywriter working for Mushq Outfits, a luxury couture brand in Karachi, Pakistan.'
      }
    });

    const text = response.text;
    if (text) {
      res.json({ description: text.trim().replace(/\n/g, ' ') });
    } else {
      res.status(500).json({ error: 'No output received from Gemini core.' });
    }
  } catch (error: any) {
    console.error('Gemini composition failed:', error);
    res.status(500).json({ error: error?.message || 'Failed composing description.' });
  }
});

// Setup dynamic bundle routers
async function initializeBundling() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode: Mount Vite Middleware
    console.log('Mounting development Vite servers...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve Compiled dist outputs static
    console.log('Initializing production static hosts...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mushq Outfits fullstack server running on http://localhost:${PORT}`);
  });
}

initializeBundling();
