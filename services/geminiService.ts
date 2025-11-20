import { GoogleGenAI } from "@google/genai";

export const analyzeLogo = async (
  base64Image: string, 
  mimeType: string,
  additionalContext: string
): Promise<string> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Actúa como un profesor estricto pero constructivo de Artes Plásticas y Visuales de 4º año de secundaria en Bolivia.
    Tu tarea es evaluar el diseño de un logotipo enviado por un estudiante.

    ---------------------------------------------------------
    🚨 VERIFICACIÓN DE REQUISITO EXCLUYENTE (CRÍTICO) 🚨
    1. El diseño debe ser EXCLUSIVAMENTE un ANIMAL de la fauna boliviana.
    2. SI LA IMAGEN CONTIENE UNA PERSONA, ROSTRO HUMANO O SILUETA HUMANA:
       - Debes declarar el trabajo como "FUERA DE PEDIDO".
       - Indica claramente: "La consigna es diseñar un animal, no una figura humana."
       - Asigna una nota de 10/100.
       - Detén el análisis técnico detallado.
    ---------------------------------------------------------

    Contexto del estudiante: "${additionalContext}"

    Si la imagen es un ANIMAL, evalúa detalladamente considerando los siguientes criterios (20 puntos cada uno):

    1. **Síntesis de Formas:**
       - ¿La imagen ha sido simplificada a formas geométricas básicas (triángulos, círculos, cuadrados) o sigue siendo un dibujo realista?
       - Busca la aplicación de la estilización, evitando detalles innecesarios (pelaje realista, ojos complejos).

    2. **Claridad del Mensaje Visual (Iconología y Cosmovisión):**
       - ¿Se identifica claramente qué animal es?
       - ¿Transmite el significado del animal en la cosmovisión andina/amazónica? (Ej: Puma=Fuerza/Kay Pacha, Cóndor=Espiritualidad/Hanan Pacha).

    3. **Principios de Composición:**
       - **Equilibrio:** ¿Es simétrico o asimétrico? ¿Está balanceado visualmente?
       - **Contraste:** Uso de positivo/negativo.
       - **Proporción:** Relación armónica entre las partes.

    4. **Originalidad:**
       - ¿Es una propuesta creativa propia o parece una copia genérica? Uso de rasgos culturales bolivianos (cruz andina, signos escalonados) integrados en el animal.

    5. **Acabado Técnico:**
       - Limpieza del trazo, definición de líneas y presentación general.

    ---------------------------------------------------------
    FORMATO DE RESPUESTA (Markdown):

    # Evaluación de Logotipo - [Nombre del Animal]

    **Estado:** [CUMPLE / FUERA DE PEDIDO]

    **Análisis de Criterios:**
    *   **Síntesis de Formas:** [Evaluación crítica]
    *   **Claridad del Mensaje Visual:** [Evaluación del significado]
    *   **Principios de Composición:** [Evaluación de equilibrio, contraste, proporción]
    *   **Originalidad y Acabado:** [Evaluación final]

    **Fortalezas:**
    *   [Lista de puntos fuertes]

    **Correcciones y Mejoras:**
    *   [Instrucción 1: Ej. "Simplificar las garras usando triángulos..."]
    *   [Instrucción 2]

    CALIFICACIÓN FINAL: [0-100]/100
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        }
      ],
      config: {
        temperature: 0.4, 
      }
    });

    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error analyzing logo:", error);
    throw new Error("Hubo un error al comunicarse con la IA para el análisis.");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};