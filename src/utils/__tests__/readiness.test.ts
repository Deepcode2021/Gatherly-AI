import { describe, it, expect } from 'vitest';
import { calculateEventReadiness } from '../readiness';
import { getDemoEvent } from '../demoEvent';

describe('readiness engine', () => {
  it('calculates score for demo event within expected range', () => {
    const demo = getDemoEvent();
    const result = calculateEventReadiness(demo);

    expect(result.overallScore).toBeGreaterThanOrEqual(50);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.details.length).toBe(4);
    expect(result.taskScore).toBeGreaterThan(0);
    expect(result.vendorScore).toBeGreaterThan(0);
    expect(result.budgetScore).toBeGreaterThan(0);
  });

  it('triggers budget alert when expenses exceed budget', () => {
    const demo = getDemoEvent();
    demo.totalBudget = 20000; // effective spend is ~40,000, so over budget
    const result = calculateEventReadiness(demo);

    const budgetAlert = result.criticalAlerts.find((a) => a.id === 'alert-budget-exceeded');
    expect(budgetAlert).toBeDefined();
    expect(budgetAlert?.type).toBe('danger');
  });

  it('evaluates outdoor weather risk backup advisory', () => {
    const demo = getDemoEvent();
    demo.venueType = 'outdoor';
    // Remove weather-related mitigations and ideas
    demo.risks = [];
    demo.ideas = [];

    const result = calculateEventReadiness(demo);
    const outdoorAlert = result.criticalAlerts.find((a) => a.id === 'alert-outdoor-weather');
    expect(outdoorAlert).toBeDefined();
  });
});
