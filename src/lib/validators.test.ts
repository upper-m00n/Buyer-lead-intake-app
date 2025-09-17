import { BuyerSchema } from './validators';

describe('BuyerSchema budget validation', () => {
  it('should fail if budgetMax < budgetMin', () => {
    const result = BuyerSchema.safeParse({
      fullName: 'Test User',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: 'One',
      purpose: 'Buy',
      budgetMin: 1000000,
      budgetMax: 500000,
      timeline: 'ZeroToThreeMonths',
      source: 'Website',
      tags: [],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some(i => i.path.includes('budgetMax'))).toBe(true);
  });

  it('should pass if budgetMax >= budgetMin', () => {
    const result = BuyerSchema.safeParse({
      fullName: 'Test User',
      phone: '1234567890',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: 'One',
      purpose: 'Buy',
      budgetMin: 500000,
      budgetMax: 1000000,
      timeline: 'ZeroToThreeMonths',
      source: 'Website',
      tags: [],
    });
    expect(result.success).toBe(true);
  });
});
