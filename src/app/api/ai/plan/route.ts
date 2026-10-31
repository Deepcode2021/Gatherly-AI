import { NextRequest, NextResponse } from 'next/server';
import { aiPlanRequestSchema } from '@/types/schemas';
import { generateEventPlanWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const GENERATION_TIMEOUT_MS = 40000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count++;
  return false;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`AI generation timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait a minute before generating another plan.',
        },
        { status: 429 }
      );
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 50000) {
      return NextResponse.json(
        { error: 'PAYLOAD_TOO_LARGE', message: 'Request payload exceeds 50KB limit.' },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const validation = aiPlanRequestSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: `${issue.path.join('.')}: ${issue.message}`,
          issues: validation.error.issues,
        },
        { status: 422 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API_KEY_MISSING',
          message:
            'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in .env.local to enable real-time generation, or use Demo Mode.',
          demoAvailable: true,
        },
        { status: 401 }
      );
    }

    const plan = await withTimeout(
      generateEventPlanWithGemini(validation.data),
      GENERATION_TIMEOUT_MS
    );

    return NextResponse.json({
      success: true,
      data: plan,
      modelUsed: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/ai/plan error:', error.message);

    if (error.message.includes('timed out')) {
      return NextResponse.json(
        {
          error: 'TIMEOUT',
          message: 'Gemini request timed out. Please try again or simplify your requirements.',
        },
        { status: 504 }
      );
    }

    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
      return NextResponse.json(
        {
          error: 'INVALID_API_KEY',
          message:
            'The configured GEMINI_API_KEY is invalid. Please check your credentials in Google AI Studio.',
        },
        { status: 401 }
      );
    }

    if (error.message.includes('AI plan schema validation failed')) {
      console.error('[API /api/ai/plan] AI output validation failure:', error.message);
      return NextResponse.json(
        {
          error: 'GENERATION_SCHEMA_FAILED',
          message:
            'The AI generated plan did not match the expected structure. Please retry or adjust parameters.',
          details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'GENERATION_FAILED',
        message: 'Failed to generate event plan. Please check inputs and try again.',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
