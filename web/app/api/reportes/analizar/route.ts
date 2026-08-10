import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { InformeAnalizado } from "@/services/reportes";

const GAS_URL = process.env.APPS_SCRIPT_WEB_APP_URL ?? "";

const ANALYSIS_PROMPT = `Eres un analista institucional especializado en evaluación de desempeño organizacional. Analiza este informe mensual de actividades y extrae la información solicitada.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin markdown, sin explicaciones):
{
  "resumenEjecutivo": "Resumen ejecutivo de 2-3 oraciones que capture los puntos más relevantes del mes",
  "actividadesPrincipales": ["actividad 1", "actividad 2"],
  "logros": ["logro concreto 1", "logro concreto 2"],
  "desafios": ["desafío o riesgo 1", "desafío o riesgo 2"],
  "indicadoresMencionados": [
    { "nombre": "nombre del indicador", "valor": "valor si se menciona", "observacion": "contexto breve" }
  ],
  "recomendacionesIA": ["acción concreta para el siguiente mes 1", "acción concreta 2", "acción concreta 3"],
  "sentimientoGeneral": "positivo"
}

Reglas:
- actividadesPrincipales: máximo 6 ítems, los más relevantes y concretos
- logros: logros o avances mencionados explícitamente en el informe
- desafios: retos, problemas o áreas de mejora identificados
- indicadoresMencionados: solo indicadores cuantitativos con nombre y valor si está disponible; array vacío si ninguno
- recomendacionesIA: 3 acciones concretas y accionables para el mes siguiente, basadas en el análisis
- sentimientoGeneral: "positivo" si predominan logros, "negativo" si predominan problemas, "neutral" si hay balance
- Si el documento está en blanco o no es un informe de actividades, devuelve arrays vacíos y resumen indicando que el documento no contiene información suficiente`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, wsId, mesNombre, mesNum, anio, fileName } = body as {
      fileId: string;
      wsId: string;
      mesNombre: string;
      mesNum: number;
      anio: number;
      fileName: string;
    };

    if (!fileId || !wsId) {
      return NextResponse.json({ error: "fileId y wsId son requeridos" }, { status: 400 });
    }

    // 1. Fetch file as base64 from GAS
    if (!GAS_URL) {
      return NextResponse.json({ error: "GAS URL no configurada" }, { status: 500 });
    }

    const gasRes = await fetch(
      `${GAS_URL}?action=reporteBase64&fileId=${encodeURIComponent(fileId)}`,
    );
    if (!gasRes.ok) {
      return NextResponse.json({ error: "Error al obtener archivo de Drive" }, { status: 502 });
    }
    const gasData = await gasRes.json();
    if (gasData.error) {
      return NextResponse.json({ error: gasData.message }, { status: 502 });
    }

    const { content: base64Content, mime } = gasData as {
      content: string;
      mime: string;
    };

    // 2. Send to Claude for analysis
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    // Build the file content block: images use "image", everything else uses "document" (PDF)
    const isImage = mime === "image/jpeg" || mime === "image/png" || mime === "image/gif" || mime === "image/webp";
    type ImageBlock = { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string } };
    type DocumentBlock = { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } };
    const fileBlock: ImageBlock | DocumentBlock = isImage
      ? {
          type: "image",
          source: {
            type: "base64",
            media_type: (mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp"),
            data: base64Content,
          },
        }
      : {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64Content,
          },
        };

    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            fileBlock,
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    // 3. Parse Claude's JSON response
    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    let parsed: Omit<InformeAnalizado, "fileId" | "fileName" | "wsId" | "mesNombre" | "mesNum" | "anio" | "analizadoEn">;
    try {
      // Strip any accidental markdown fences
      const jsonStr = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Claude devolvió un formato inesperado", raw: rawText.slice(0, 500) },
        { status: 502 },
      );
    }

    const result: InformeAnalizado = {
      fileId,
      fileName: fileName ?? gasData.nombre ?? fileId,
      wsId,
      mesNombre: mesNombre ?? "",
      mesNum: mesNum ?? 0,
      anio: anio ?? new Date().getFullYear(),
      analizadoEn: new Date().toISOString(),
      resumenEjecutivo: parsed.resumenEjecutivo ?? "",
      actividadesPrincipales: parsed.actividadesPrincipales ?? [],
      logros: parsed.logros ?? [],
      desafios: parsed.desafios ?? [],
      indicadoresMencionados: parsed.indicadoresMencionados ?? [],
      recomendacionesIA: parsed.recomendacionesIA ?? [],
      sentimientoGeneral: parsed.sentimientoGeneral ?? "neutral",
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/reportes/analizar] error:", err);
    return NextResponse.json(
      { error: "Error al analizar el informe" },
      { status: 500 },
    );
  }
}
