import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/ai/plan Route Handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects invalid or malformed JSON payloads with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/plan', {
      method: 'POST',
      body: 'invalid-json{',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('INVALID_JSON');
  });

  it('validates request schema and returns 422 for missing required fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/plan', {
      method: 'POST',
      body: JSON.stringify({ title: 'A' }), // Missing eventType, eventDate, etc.
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe('VALIDATION_ERROR');
  });

  it('returns 401 when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;

    const validPayload = {
      title: 'Family Gathering',
      eventType: 'birthday',
      eventDate: '2026-11-20',
      city: 'Pune',
      guestCount: 40,
      totalBudget: 50000,
      venueType: 'indoor',
    };

    const req = new NextRequest('http://localhost:3000/api/ai/plan', {
      method: 'POST',
      body: JSON.stringify(validPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('API_KEY_MISSING');
    expect(json.demoAvailable).toBe(true);
  });
});
