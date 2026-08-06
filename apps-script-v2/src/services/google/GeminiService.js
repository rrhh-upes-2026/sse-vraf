/**
 * GeminiService — integración con la API de Gemini (Google AI).
 * Requiere GEMINI_API_KEY en Script Properties.
 */
var GeminiService = {
  DEFAULT_MODEL: "gemini-1.5-flash",

  generate: function (prompt, model) {
    var apiKey = Config.geminiApiKey();
    if (!apiKey) {
      var e = new Error("GEMINI_API_KEY no configurada en Script Properties.");
      e.code = "NOT_CONFIGURED";
      throw e;
    }

    var modelId = model || GeminiService.DEFAULT_MODEL;
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key=" + apiKey;

    var response = UrlFetchApp.fetch(url, {
      method:      "post",
      contentType: "application/json",
      payload:     JSON.stringify({
        contents: [{ parts: [{ text: String(prompt) }] }],
        generationConfig: { maxOutputTokens: 2048 },
      }),
      muteHttpExceptions: true,
    });

    var code = response.getResponseCode();
    if (code !== 200) {
      var e2 = new Error("Gemini API error: HTTP " + code);
      e2.code = "GEMINI_ERROR";
      throw e2;
    }

    var result = JSON.parse(response.getContentText());
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      var e3 = new Error("Gemini no retornó contenido.");
      e3.code = "GEMINI_EMPTY";
      throw e3;
    }

    return result.candidates[0].content.parts[0].text;
  },

  generateStructured: function (prompt, schema, model) {
    var rawText = GeminiService.generate(prompt + "\n\nResponde únicamente con JSON válido según este esquema: " + JSON.stringify(schema), model);
    try {
      // Extraer JSON del texto (Gemini puede incluir markdown)
      var match = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/(\{[\s\S]*\})/);
      return JSON.parse(match ? match[1] : rawText);
    } catch (e) {
      return { rawText: rawText };
    }
  },
};
