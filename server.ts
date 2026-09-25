import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Increase body limit for image uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to get GoogleGenAI client if API key is present
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/**
 * POST /api/calculate-macros
 * Automatically calculates dish macronutrients using Gemini 3.8 Flash (photo + ingredients).
 */
app.post('/api/calculate-macros', async (req, res) => {
  const { dishName, ingredients, portion, image } = req.body;

  try {
    const ai = getGenAIClient();

    if (ai) {
      const parts: any[] = [];

      // If an image (data URL or base64) is provided, pass it to Gemini
      if (image && typeof image === 'string' && image.startsWith('data:image/')) {
        const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const dishTitle = dishName || 'Plat cuisiné';
      const alimentsText = ingredients || 'Non spécifié, analysez la photo fournie';
      const portionText = portion || 'Estimez d après les aliments ou la photo';

      const promptLines = [
        'Vous êtes un nutritionniste et chef cuisinier professionnel expert en calcul de macronutriments.',
        'Analysez ce plat en vous appuyant sur la photo fournie (si présente) et la liste des aliments/ingrédients renseignés par l utilisateur.',
        '',
        `Informations sur le plat :`,
        `- Nom du plat : ${dishTitle}`,
        `- Ingrédients / Aliments fournis : ${alimentsText}`,
        `- Portion indiquée : ${portionText}`,
        '',
        'Instructions de calcul :',
        '1. Identifiez chaque aliment/composant présent et son poids estimé en grammes.',
        '2. Calculez précisément pour l ensemble du plat :',
        '   - kcal (calories totales en nombre entier)',
        '   - protein (protéines totales en grammes)',
        '   - carbs (glucides totaux en grammes)',
        '   - fat (lipides totaux en grammes)',
        '   - fiber (fibres totales en grammes)',
        '   - estimatedPortion (ex: "380g")',
        '3. Décomposez chaque ingrédient avec son apport (name, estimatedWeight, kcal, protein, carbs, fat, fiber).',
        '4. Identifiez les allergènes majeurs parmi : gluten, lactose, crustaces, oeufs, poissons, arachides, soja, fruits-a-coque, celeri, moutarde, sesame, sulfites, lupin, mollusques.',
        '5. Donnez 2 à 4 points forts nutritionnels (ex: "Riche en protéines", "Faible en sucres").',
        '6. Rédigez une explication concise (2 à 3 phrases).',
        '',
        'Répondez STRICTEMENT en format JSON valide avec les clés suivantes :',
        '{',
        '  "kcal": 650,',
        '  "protein": 34,',
        '  "carbs": 55,',
        '  "fat": 22,',
        '  "fiber": 4,',
        '  "estimatedPortion": "380g",',
        '  "items": [',
        '    {',
        '      "name": "Bavette de boeuf",',
        '      "estimatedWeight": "180g",',
        '      "kcal": 440,',
        '      "protein": 45,',
        '      "carbs": 0,',
        '      "fat": 28,',
        '      "fiber": 0',
        '    }',
        '  ],',
        '  "detectedAllergens": ["gluten", "lactose"],',
        '  "dietaryHighlights": ["Riche en protéines"],',
        '  "explanation": "Calcul basé sur les aliments et la photo."',
        '}',
      ];

      parts.push({ text: promptLines.join('\n') });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts,
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch (jsonErr) {
          console.warn('Failed to parse Gemini JSON output:', jsonErr);
        }
      }
    }
  } catch (error) {
    console.error('Error invoking Gemini for macro calculation:', error);
  }

  // Fallback response if Gemini is unavailable
  return res.status(200).json({
    fallback: true,
    message: 'Calcul standard actif',
  });
});

/**
 * POST /api/translate
 * Automatically translates dish names, menu categories, and descriptions
 * into authentic Italian and English gastronomic terms using Gemini 3.8 Flash.
 */
app.post('/api/translate', async (req, res) => {
  const { name, description, categoryName, type } = req.body;

  try {
    const ai = getGenAIClient();
    if (ai) {
      const prompt = `Vous êtes un chef cuisinier et sommelier bilingue expert en gastronomie italienne, française et internationale.
Traduisez ces éléments de menu / carte de restaurant depuis le français vers l'italien (IT) et l'anglais (EN).
Conservez le prestige culinaire et l'authenticité gastronomique.

Éléments à traduire :
- Nom : "${name || ''}"
- Description : "${description || ''}"
- Catégorie : "${categoryName || ''}"
- Type : "${type || 'dish'}"

Répondez STRICTEMENT en format JSON valide avec les clés suivantes :
{
  "name_it": "Nom authentique en italien",
  "name_en": "Nom gourmand en anglais",
  "description_it": "Description fidèle en italien",
  "description_en": "Description fidèle en anglais",
  "category_it": "Catégorie en italien",
  "category_en": "Catégorie en anglais"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ text: prompt }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch (jsonErr) {
          console.warn('Failed to parse Gemini translation JSON:', jsonErr);
        }
      }
    }
  } catch (error) {
    console.error('Error invoking Gemini for translation:', error);
  }

  // Fallback if AI not available
  return res.status(200).json({
    fallback: true,
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gusto Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
