/**
 * UNIFIED AI API WRAPPER (FREE PROVIDERS ONLY)
 * Providers supported:
 * - Gemini (Google)
 * - Groq (LLaMA)
 * - Hugging Face
 *
 * Automatic fallback if one provider fails or hits rate limits
 */

const { callGemini } = require('./geminiAPI');
const { callGroq } = require('./groqAPI');
const { callHuggingFace } = require('./huggingfaceAPI');

// Default provider order (priority-based)
const PROVIDER_ORDER = ['gemini', 'groq', 'huggingface'];

// Preferred provider from env (optional)
const PRIMARY_PROVIDER = process.env.AI_PROVIDER?.toLowerCase();

if (PRIMARY_PROVIDER && !PROVIDER_ORDER.includes(PRIMARY_PROVIDER)) {
  console.warn(`⚠️ Invalid AI_PROVIDER "${PRIMARY_PROVIDER}", using default fallback order`);
}

console.log('🤖 AI Provider Fallback Order:', PROVIDER_ORDER.join(' → '));

/**
 * Core unified AI caller with auto-fallback
 */
async function callAI(prompt, maxTokens = 1500) {
  const providers = PRIMARY_PROVIDER
    ? [PRIMARY_PROVIDER, ...PROVIDER_ORDER.filter(p => p !== PRIMARY_PROVIDER)]
    : PROVIDER_ORDER;

  for (const provider of providers) {
    try {
      console.log(`🧠 Attempting AI provider: ${provider}`);

      switch (provider) {
        case 'gemini':
          if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key missing');
          return await callGemini(prompt, maxTokens);

        case 'groq':
          if (!process.env.GROQ_API_KEY) throw new Error('Groq API key missing');
          return await callGroq(prompt, maxTokens);

        case 'huggingface':
          if (!process.env.HUGGINGFACE_API_KEY) throw new Error('HuggingFace API key missing');
          return await callHuggingFace(prompt, maxTokens);

        default:
          continue;
      }
    } catch (error) {
      console.error(`❌ ${provider} failed: ${error.message}`);
    }
  }

  throw new Error('All free AI providers are currently unavailable');
}

/**
 * Structured AI response (bullet-point focused)
 */
async function callAIStructured(prompt, maxTokens = 1500) {
  const structuredPrompt = `
${prompt}

RULES:
- Respond in bullet points
- Keep it concise
- Avoid unnecessary explanations
`;

  return await callAI(structuredPrompt, maxTokens);
}

/**
 * Human-friendly AI error handling
 */
function handleAIError(error) {
  console.error('AI ERROR:', error.message);

  if (
    error.message.includes('rate') ||
    error.message.includes('quota') ||
    error.message.includes('limit')
  ) {
    return 'AI services are busy right now. Please try again shortly.';
  }

  if (error.message.includes('API key')) {
    return 'AI service configuration error. Please contact the administrator.';
  }

  return 'All AI services are temporarily unavailable. Manual input is still available.';
}

/**
 * Current AI provider info (informational)
 */
function getAIProviderInfo() {
  return {
    providers: [
      {
        name: 'Gemini',
        free: true,
        speed: 'Fast',
        quality: 'Excellent'
      },
      {
        name: 'Groq (LLaMA)',
        free: true,
        speed: 'Ultra Fast',
        quality: 'Very Good'
      },
      {
        name: 'Hugging Face',
        free: true,
        speed: 'Moderate',
        quality: 'Good'
      }
    ],
    fallbackEnabled: true
  };
}

/**
 * Test AI system (auto-fallback aware)
 */
async function testAIConnection() {
  try {
    const response = await callAI('Reply with: AI system operational.', 50);
    return { success: true, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  callAI,
  callAIStructured,
  handleAIError,
  getAIProviderInfo,
  testAIConnection
};
