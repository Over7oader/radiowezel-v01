const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const IP_CHECK_URL = "https://api.ipify.org?format=json";

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Only POST requests are allowed", { status: 405 });
    }

    try {
      // Sprawdź IP Workera
      const ipResponse = await fetch(IP_CHECK_URL);
      const ipData = await ipResponse.json();
      const workerIP = ipData.ip;

      // Pobierz dane z żądania
      const requestData = await request.json();

      // Sprawdź, czy klucz API jest podany w żądaniu
      if (!requestData.apiKey) {
        return new Response(JSON.stringify({ error: "API key is missing" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Przygotuj nowe żądanie do API Gemini
      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${requestData.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData.content),
      });

      // Pobierz odpowiedź z API Gemini
      const geminiData = await geminiResponse.json();

      // Przygotuj odpowiedź z danymi Gemini i IP Workera
      const responseData = {
        geminiResponse: geminiData,
        workerIP: workerIP
      };

      // Zwróć odpowiedź
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
