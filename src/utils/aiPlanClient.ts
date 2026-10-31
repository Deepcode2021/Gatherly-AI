import type { AIPlanRequest, AIPlanResponse, CreateEventFormData } from '@/types/schemas';

export type PlanRequestPayload = AIPlanRequest | CreateEventFormData;

export type PlanRequestResult =
  | { status: 'success'; data: AIPlanResponse }
  | { status: 'apiKeyMissing'; message: string }
  | { status: 'error'; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSuccessfulPlanResponse(
  value: unknown
): value is { success: true; data: AIPlanResponse } {
  return isRecord(value) && value.success === true && isRecord(value.data);
}

function readMessage(value: unknown): string | null {
  return isRecord(value) && typeof value.message === 'string' ? value.message : null;
}

export async function requestEventPlan(
  payload: PlanRequestPayload
): Promise<PlanRequestResult> {
  try {
    const response = await fetch('/api/ai/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body: unknown = await response.json();

    if (response.ok && isSuccessfulPlanResponse(body)) {
      return { status: 'success', data: body.data };
    }

    if (isRecord(body) && body.error === 'API_KEY_MISSING') {
      return {
        status: 'apiKeyMissing',
        message:
          readMessage(body) ??
          'Gemini API key is not configured on the server. Use the offline engine or configure GEMINI_API_KEY.',
      };
    }

    return {
      status: 'error',
      message: readMessage(body) ?? 'Failed to generate event plan.',
    };
  } catch {
    return {
      status: 'error',
      message:
        'Could not connect to the AI service. You can use the instant offline plan generator instead.',
    };
  }
}
