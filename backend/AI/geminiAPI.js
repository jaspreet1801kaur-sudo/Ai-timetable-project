const fetch = require('node-fetch');

/**
 * Google Gemini API Implementation (FREE & UNLIMITED)
 * Get API key: https://aistudio.google.com/app/apikey
 */

/**
 * Main function to call Gemini AI API
 * @param {string} prompt - The prompt to send to Gemini
 * @param {number} maxTokens - Maximum tokens in response (default 1500)
 * @returns {Promise<string>} - Gemini's response text
 */
async function callGemini(prompt, maxTokens = 1500) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    console.log('🤖 Calling Google Gemini API...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('No response text from Gemini');
    }

    console.log('✓ Gemini AI response received');
    return text.trim();

  } catch (error) {
    console.error('✗ Gemini API Error:', error.message);
    throw error;
  }
}

/**
 * Call Gemini with structured output expectation
 * @param {string} prompt - The prompt
 * @param {number} maxTokens - Max tokens
 * @returns {Promise<string>} - Response text
 */
async function callGeminiStructured(prompt, maxTokens = 1500) {
  const structuredPrompt = `${prompt}

IMPORTANT: Provide your response in a clear, structured format with bullet points.
Keep it concise and actionable.`;

  return await callGemini(structuredPrompt, maxTokens);
}

/**
 * Handle API errors gracefully
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
function handleAIError(error) {
  console.error('AI Error:', error);
  
  if (error.message.includes('API key')) {
    return 'AI service configuration error. Please contact support.';
  }
  
  if (error.message.includes('quota') || error.message.includes('limit')) {
    return 'AI service is busy. Please try again in a moment.';
  }
  
  if (error.message.includes('safety')) {
    return 'Request blocked by safety filters. Please rephrase.';
  }
  
  return 'AI service temporarily unavailable. Your tasks can still be added manually.';
}

/**
 * Test Gemini API connection
 */
async function testGeminiConnection() {
  try {
    const response = await callGemini('Say "Hello, FocusFlow AI is working!" in one sentence.');
    console.log('✓ Gemini API Test Success:', response);
    return true;
  } catch (error) {
    console.error('✗ Gemini API Test Failed:', error.message);
    return false;
  }
}

module.exports = {
  callGemini,
  callGeminiStructured,
  handleAIError,
  testGeminiConnection
};