const fetch = require('node-fetch');

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const IP_CHECK_URL = "https://api.ipify.org?format=json";

module.exports = {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Only POST requests are allowed", { status: 405 });
    }

    try {
      // Check Worker's IP
      const ipResponse = await fetch(IP_CHECK_URL);
      const ipData = await ipResponse.json();
      const workerIP = ipData.ip;

      // Get data from the request
      const requestData = await request.json();

      // Check if API key is provided in the request
      if (!requestData.apiKey) {
        return new Response(JSON.stringify({ error: "API key is missing" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Prepare new request to Gemini API
      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${requestData.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData.content),
      });

      // Get response from Gemini API
      const geminiData = await geminiResponse.json();

      // Prepare response with Gemini data and Worker's IP
      const responseData = {
        geminiResponse: geminiData,
        workerIP: workerIP
      };

      // Return response
      return new Response(JSON.stringify(responseData), {
        status: geminiResponse.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  },
};
