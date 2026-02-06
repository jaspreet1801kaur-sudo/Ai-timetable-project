const fetch = require('node-fetch');

/**
 * Groq API Implementation (FREE & FASTEST)
 * Get API key: https://console.groq.com/
 * Free tier: 14,400 requests/day
 * Speed: ~500 tokens/second (INSANELY FAST!)
 */

/**
 * Main function to call Groq AI API
 * @param {string} prompt - The prompt to send to Groq
 * @param {number} maxTokens - Maximum tokens in response
 * @returns {Promise<string>} - Groq's response text
 */
async function callGroq(prompt, maxTokens = 1500) {
  try {
    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    console.log('⚡ Calling Groq API (Lightning Fast)...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Best free model
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text from response
    const text = data.choices?.[0]?.message?.content || '';
    
    if (!text) {
      throw new Error('No response text from Groq');
    }

    console.log('✓ Groq AI response received (that was FAST!)');
    return text.trim();

  } catch (error) {
    console.error('✗ Groq API Error:', error.message);
    throw error;
  }
}

/**
 * Call Groq with structured output
 */
async function callGroqStructured(prompt, maxTokens = 1500) {
  const structuredPrompt = `${prompt}

IMPORTANT: Provide your response in a clear, structured format with bullet points.
Keep it concise and actionable.`;

  return await callGroq(structuredPrompt, maxTokens);
}

/**
 * Handle API errors gracefully
 */
function handleAIError(error) {
  console.error('AI Error:', error);
  
  if (error.message.includes('API key')) {
    return 'AI service configuration error. Please contact support.';
  }
  
  if (error.message.includes('rate limit')) {
    return 'Daily limit reached. Please try again tomorrow.';
  }
  
  return 'AI service temporarily unavailable. Your tasks can still be added manually.';
}

/**
 * Test Groq API connection
 */
async function testGroqConnection() {
  try {
    const response = await callGroq('Say "Groq is working!" in one sentence.');
    console.log('✓ Groq API Test Success:', response);
    return true;
  } catch (error) {
    console.error('✗ Groq API Test Failed:', error.message);
    return false;
  }
}

module.exports = {
  callGroq,
  callGroqStructured,
  handleAIError,
  testGroqConnection
};