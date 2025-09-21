import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

// Get API key from expo constants or environment
const API_KEY = Constants.expoConfig?.extra?.googleApiKey ||
                process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
                'YOUR_API_KEY_HERE';

console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');

const genai = new GoogleGenerativeAI(API_KEY);

interface ProfileAnalysis {
  performanceScore: number;
  traits: string[];
  lifestyle: string;
  matchingTypes: string[];
  bioSuggestion: string;
  warning?: string;
}

// System prompt for consistent behavior
const SYSTEM_PROMPT = `You are analyzing photos for "Preformly", a BRUTALLY HONEST dating app that rates people based on San Francisco tech culture stereotypes.

Your role is to be WITTY, SARCASTIC, and UNFORGIVING about performative tech culture. You're critiquing how people present themselves in the SF tech scene.

IMPORTANT SCORING CRITERIA - BE HARSH:
- Performance scores should range from 50-100 (be critical!)
- HIGHEST SCORES (95-100): Exceptionally performative, over-the-top, curated aesthetic
  * Soft/feminine high school performative = MAX SCORE
  * Perfectly staged photos with premium props
  * Obvious influencer-level curation
- HIGH SCORES (85-94): Very performative but not quite exceptional
  * Good tech culture vibes but missing some elements
- MEDIUM SCORES (65-84): Moderately performative
  * Some effort but not fully committed
- LOW SCORES (50-64): Not very performative
  * Too authentic, not curated enough
  * Missing key SF tech culture elements

BE CRITICAL AND SARCASTIC:
- Roast the lack of performative elements
- Point out what's missing for maximum performativity
- Be witty about SF tech culture stereotypes
- Don't hold back on the criticism, but keep it fun`;

export const analyzeProfileImage = async (base64Image: string): Promise<ProfileAnalysis> => {
  try {
    // Check if API key is properly set
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      throw new Error('API key not configured');
    }

    // Use Gemini 2.5 Flash for image analysis
    const model = genai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const analysisPrompt = `${SYSTEM_PROMPT}

Analyze this photo and return a JSON object with:
- performanceScore: number between 50-100 (how "performative" they look for SF tech culture - BE HARSH!)
- traits: array of exactly 3 tech culture traits (e.g., "Instagram Curator", "Startup Wannabe", "Coffee Shop Dweller", "Remote Work Warrior", "Agile Practitioner")
- lifestyle: a BRUTALLY HONEST one-line description of their lifestyle based on the photo
- matchingTypes: array of exactly 2 types they'd match with (e.g., "Influencers", "Tech Bros", "Startup Founders", "Remote Workers")
- bioSuggestion: a SARCASTIC bio full of tech buzzwords (2-3 sentences)
- warning: (optional) if score > 95, add a warning about being "peak performative"

BE CRITICAL: Score low if they're not curated enough. Roast what's missing.

Respond ONLY with valid JSON, no markdown or explanations.`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: analysisPrompt },
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg'
            }
          }
        ]
      }]
    });

    const response = result.response.text();
    console.log('AI Analysis Response:', response);

    // Parse the JSON response
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);

        // Validate the response has required fields
        if (!analysis.performanceScore || !analysis.traits || !analysis.lifestyle || !analysis.matchingTypes || !analysis.bioSuggestion) {
          throw new Error('Invalid response structure');
        }

        return analysis;
      }
      throw new Error('No JSON found in response');
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw e;
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const generatePerformativeImage = async (
  base64Image: string,
  performanceScore: number,
  customPrompt?: string
): Promise<string | null> => {
  try {
    if (!customPrompt) {
      console.log('No custom prompt provided');
      return null;
    }

    // Check if API key is properly set
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      console.error('API key not configured for image generation');
      throw new Error('API key not configured. Please set up your Google Gemini API key in app.json');
    }

    if (API_KEY.length < 20) {
      console.error('API key appears to be invalid (too short)');
      throw new Error('API key appears to be invalid. Please check your API key in app.json');
    }

    // Use Gemini 2.5 Flash Image for actual image generation
    const model = genai.getGenerativeModel({
      model: 'gemini-2.5-flash-image-preview',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const imagePrompt = `${SYSTEM_PROMPT}

Create an enhanced version of this photo that incorporates the following aesthetic: "${customPrompt}"

Make it more performative by adding tech culture elements like matcha drinks, labubu dolls, Clairo/Laufey aesthetics, etc. as requested.

Guidelines:
- Keep the same person in the photo but enhance their "performative" tech culture aesthetic
- Add the requested elements naturally into the scene
- Maintain the original photo's lighting and composition as much as possible
- Make it look realistic and well-integrated
- Focus on creating a cohesive, performative tech culture vibe

Generate the enhanced image with these modifications.`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: imagePrompt },
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg'
            }
          }
        ]
      }]
    });

    const response = result.response;
    console.log('Image generation response:', response);

    // Extract the generated image
    console.log('Response structure:', JSON.stringify(response, null, 2));
    console.log('Candidates:', response.candidates);

    for (const candidate of response.candidates || []) {
      console.log('Candidate content:', candidate.content);
      for (const part of candidate.content.parts || []) {
        console.log('Part type:', part, 'Keys:', Object.keys(part || {}));

        if (part.inlineData) {
          console.log('Found inlineData:', {
            mimeType: part.inlineData.mimeType,
            dataLength: part.inlineData.data?.length || 'undefined',
            dataPreview: part.inlineData.data?.substring(0, 50) || 'undefined'
          });

          if (part.inlineData.data) {
            console.log('Found generated image data, type:', typeof part.inlineData.data);
            console.log('Data preview:', part.inlineData.data.substring(0, 50));

            // Make sure we return a string
            if (typeof part.inlineData.data === 'string') {
              return part.inlineData.data;
            } else {
              console.warn('Image data is not a string, converting...');
              return String(part.inlineData.data);
            }
          }
        }
      }
    }

    console.log('No image data found in response');
    return null;

  } catch (error) {
    console.error('Error generating performative image:', error);
    return null;
  }
};

// Test API key functionality
export const testApiKey = async (): Promise<boolean> => {
  try {
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      throw new Error('API key not configured');
    }

    if (API_KEY.length < 30 || !API_KEY.startsWith('AIza')) {
      throw new Error('API key appears to be invalid. Valid keys start with "AIza" and are ~39 characters long.');
    }

    // Use a simple text-only model to test the API key
    const model = genai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 10,
      }
    });

    const testPrompt = 'Hello - just testing if the API key works. Respond with "API key is valid".';

    const result = await model.generateContent(testPrompt);
    const response = result.response.text();

    console.log('API Key Test Response:', response);
    return response.includes('API key is valid');
  } catch (error) {
    console.error('API Key Test Failed:', error);
    throw error;
  }
};

// Chat functionality for AI conversations
export const generateChatResponse = async (
  userMessage: string,
  conversationContext?: string
): Promise<string> => {
  try {
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      throw new Error('API key not configured');
    }

    const model = genai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 1.0,
        topK: 50,
        topP: 0.98,
        maxOutputTokens: 150,
      }
    });

    const chatPrompt = `${conversationContext || ''}

they said: "${userMessage}"

respond as them texting back. be chill, flirty, natural. 1-2 sentences max. text like a real person would on a dating app - lowercase, casual, maybe an emoji if it fits. don't be robotic or overly enthusiastic. reference your actual life/interests when relevant but don't force it.`;

    const result = await model.generateContent(chatPrompt);
    const response = result.response.text();

    return response.trim();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

// Generate match suggestions based on profile
export const generateMatchSuggestions = async (
  userTraits: string[],
  performanceScore: number
): Promise<any[]> => {
  try {
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      throw new Error('API key not configured');
    }

    const model = genai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const matchPrompt = `${SYSTEM_PROMPT}

Generate 3 satirical potential matches for someone with:
- Traits: ${userTraits.join(', ')}
- Performance Score: ${performanceScore}

Return a JSON array with 3 match profiles, each containing:
- name: first name only
- age: 24-35
- role: their tech job (e.g., "Senior PM at [Unicorn]", "Founder of [Stealth Startup]")
- performanceScore: 70-100
- bio: a satirical 1-2 sentence bio full of tech buzzwords
- matchReason: why you'd match (funny and specific)
- distance: "0.X mi" (random between 0.3-2.5)

Make each profile unique and funny. Reference real SF tech culture stereotypes.

Respond ONLY with valid JSON array, no markdown or explanations.`;

    const result = await model.generateContent(matchPrompt);
    const response = result.response.text();

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON array found');
    } catch (e) {
      console.error('Failed to parse match suggestions:', e);
      return [];
    }
  } catch (error) {
    console.error('Error generating matches:', error);
    throw error;
  }
};