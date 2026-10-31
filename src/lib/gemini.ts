import { AIPlanInput, AIPlanRequest, AIPlanResponse, aiPlanResponseSchema } from '@/types/schemas';
import type { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export async function getGeminiClient(): Promise<GoogleGenAI> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  if (!cachedClient || cachedApiKey !== apiKey) {
    const { GoogleGenAI } = await import('@google/genai');
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }

  return cachedClient;
}

export function buildPromptForEvent(request: AIPlanRequest | AIPlanInput): string {
  const eventTypeLabel = request.eventType
    ? request.eventType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Celebration';

  const sectionInstruction =
    request.sectionToRegenerate && request.sectionToRegenerate !== 'all'
      ? `NOTE: The user requested a focused refresh of the "${request.sectionToRegenerate}" section. Ensure that section contains fresh, highly creative recommendations tailored to their brief while keeping overall consistency.`
      : 'Generate a comprehensive, end-to-end celebration blueprint.';

  return `
You are Gatherly AI, an expert celebration and event planner specializing in Indian and global events (weddings, milestone birthdays, anniversaries, college fests, cultural festivals, corporate events, and community gatherings).

IMPORTANT GUIDELINES:
1. All monetary amounts must be integer INR (Indian Rupees) matching the available total budget of ₹${request.totalBudget.toLocaleString('en-IN')}.
2. Label all prices as estimates. Do NOT claim you have booked any vendor or confirmed actual quotes.
3. Keep task due dates as relative integer offsets (daysBeforeEvent) relative to the event date.
4. Respect dietary requirements strictly (${request.dietary || 'Standard'}).
5. Take venue format into account (${request.venueType}) and include sensible weather/backup mitigations.
6. Provide creative, culturally grounded ideas tailored specifically to a ${eventTypeLabel} celebration (e.g. for Indian celebrations, consider regional food delicacies, ambient lighting, interactive photo walls, music setups).
7. Ensure all budget items, vendors, and tasks use the standard category identifiers specified below in the response schema.

${sectionInstruction}

USER EVENT BRIEF (Delimited untrusted user input):
<<<EVENT_TITLE>>>
${request.title}
<<<EVENT_TYPE>>>
${eventTypeLabel} (${request.eventType})
<<<EVENT_DATE>>>
${request.eventDate}
<<<CITY_LOCATION>>>
${request.city}
<<<GUEST_COUNT>>>
${request.guestCount} guests
<<<TOTAL_BUDGET_INR>>>
₹${request.totalBudget}
<<<VENUE_TYPE>>>
${request.venueType}
<<<PREFERRED_THEME>>>
${request.theme || `Creative theme tailored to ${eventTypeLabel}`}
<<<DIETARY_REQUIREMENTS>>>
${request.dietary || 'Mixed'}
<<<ACCESSIBILITY>>>
${request.accessibility || 'Standard accessibility'}
<<<KEY_PRIORITIES>>>
${request.priorities && request.priorities.length > 0 ? request.priorities.join(', ') : 'Great guest experience, staying within budget'}
<<<ADDITIONAL_NOTES>>>
${request.additionalNotes || 'None'}

RESPONSE FORMAT:
You MUST return ONLY a strictly valid JSON object conforming to the required schema:
{
  "concept": {
    "themeName": string,
    "conceptDescription": string,
    "suggestedColorPalette": string[],
    "personalizedRationale": string
  },
  "summary": {
    "approach": string,
    "keyPriorities": string[],
    "majorConsiderations": string
  },
  "budgetItems": [
    {
      "category": "venue" | "catering" | "decoration" | "photography" | "entertainment" | "transport" | "rentals" | "other",
      "description": string,
      "estimatedCost": number (integer INR),
      "basis": string,
      "assumptions": string
    }
  ],
  "tasks": [
    {
      "title": string,
      "description": string,
      "category": "venue" | "catering" | "decoration" | "guests" | "logistics" | "entertainment" | "budget" | "general",
      "priority": "high" | "medium" | "low",
      "daysBeforeEvent": number (integer e.g. 30 for 30 days before, 0 for event day),
      "estimatedDuration": string
    }
  ],
  "vendors": [
    {
      "category": "venue" | "catering" | "decoration" | "photography" | "entertainment" | "transport" | "rentals" | "other",
      "service": string,
      "bookingDeadlineDays": number,
      "targetBudget": number (integer INR),
      "questionsToAsk": string[]
    }
  ],
  "ideas": [
    {
      "title": string,
      "category": "theme" | "decor" | "activity" | "food" | "guest_experience" | "cost_saving" | "contingency",
      "description": string,
      "whyItFits": string,
      "costImpact": "low" | "medium" | "high" | "free",
      "effortLevel": "easy" | "moderate" | "challenging"
    }
  ],
  "risks": [
    {
      "risk": string,
      "severity": "low" | "medium" | "high",
      "mitigation": string,
      "alternative": string
    }
  ]
}
`.trim();
}

export function extractAndParseJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

export async function generateEventPlanWithGemini(
  request: AIPlanRequest
): Promise<AIPlanResponse> {
  const ai = await getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const prompt = buildPromptForEvent(request);

  let response;
  try {
    response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || '';
    if (
      errorMsg.includes('503') ||
      errorMsg.includes('high demand') ||
      errorMsg.includes('UNAVAILABLE')
    ) {
      console.warn(
        `[Gemini] ${modelName} returned 503 high demand. Trying fallback model ${FALLBACK_MODEL}...`
      );
      response = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
    } else {
      throw err;
    }
  }

  const text = response.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response');
  }

  let rawJson: unknown;
  try {
    rawJson = extractAndParseJson(text);
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON output:', text, parseErr);
    throw new Error('Gemini API returned invalid JSON');
  }

  const parsed = aiPlanResponseSchema.safeParse(rawJson);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    console.error('Gemini output failed schema validation:', errorDetails);
    throw new Error(`AI plan schema validation failed: ${errorDetails}`);
  }

  return parsed.data;
}
