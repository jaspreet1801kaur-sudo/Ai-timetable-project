const fetch = require('node-fetch');

/**
 * HuggingFace Inference API Implementation (100% FREE)
 * Get API key: https://huggingface.co/settings/tokens
 * Free tier: Unlimited (with rate limiting)
 * Best models: mistralai/Mistral-7B-Instruct-v0.2
 */

/**
 * Main function to call HuggingFace Inference API
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - API response text
 */
async function callHuggingFace(prompt, maxTokens = 1500) {
  try {
    // Validate API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
    }

    console.log('🤗 Calling HuggingFace API...');

    // Best free model: Mistral 7B Instruct
    const model = 'mistralai/Mistral-7B-Instruct-v0.2';
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle model loading error (first request takes ~20 seconds)
      if (errorData.error?.includes('loading')) {
        console.log('⏳ Model is loading, retrying in 20 seconds...');
        await new Promise(resolve => setTimeout(resolve, 20000));
        return await callHuggingFace(prompt, maxTokens);
      }
      
      throw new Error(`HuggingFace API Error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text from response
    let text = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (data.generated_text) {
      text = data.generated_text;
    } else {
      throw new Error('Unexpected response format from HuggingFace');
    }

    console.log('✓ HuggingFace API response received');
    return text.trim();

  } catch (error) {
    console.error('✗ HuggingFace API Error:', error.message);
    throw error;
  }
}

/**
 * Call HuggingFace with structured output
 */
async function callHuggingFaceStructured(prompt, maxTokens = 1500) {
  const structuredPrompt = `${prompt}

IMPORTANT: Provide your response in a clear, structured format with bullet points.
Keep it concise and actionable.`;

  return await callHuggingFace(structuredPrompt, maxTokens);
}

/**
 * Alternative: Call HuggingFace with different model
 * For faster responses, use smaller models
 */
async function callHuggingFaceFast(prompt, maxTokens = 500) {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set');
    }

    // Faster, smaller model
    const model = 'google/flan-t5-large';
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens
          }
        })
      }
    );

    const data = await response.json();
    const text = Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
    
    return text.trim();

  } catch (error) {
    console.error('HuggingFace Fast API Error:', error.message);
    throw error;
  }
}

/**
 * Handle API errors gracefully
 */
function handleAIError(error) {
  console.error('AI Error:', error);
  
  if (error.message.includes('API key')) {
    return 'AI service configuration error. Please contact support.';
  }
  
  if (error.message.includes('loading')) {
    return 'AI model is warming up. Please try again in 20 seconds.';
  }
  
  if (error.message.includes('rate')) {
    return 'Too many requests. Please wait a moment.';
  }
  
  return 'AI service temporarily unavailable. Your tasks can still be added manually.';
}

/**
 * Test HuggingFace API connection
 */
async function testHuggingFaceConnection() {
  try {
    const response = await callHuggingFace('Say "HuggingFace is working!" in one sentence.');
    console.log('✓ HuggingFace API Test Success:', response);
    return true;
  } catch (error) {
    console.error('✗ HuggingFace API Test Failed:', error.message);
    return false;
  }
}

module.exports = {
  callHuggingFace,
  callHuggingFaceStructured,
  callHuggingFaceFast,
  handleAIError,
  testHuggingFaceConnection
};