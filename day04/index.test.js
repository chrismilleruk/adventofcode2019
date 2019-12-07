const {
  testPassword,
  countValidPasswords
} = require('./');

describe('Day 4: Secure Container', () => {
  describe('test password', () => {
    // It is a six-digit number.
    // The value is within the range given in your puzzle input.
    // Two adjacent digits are the same (like 22 in 122345).
    // Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).

    // 111111 meets these criteria (double 11, never decreases).
    test('111111 meets these criteria (double 11, never decreases).', () => {
      expect(testPassword('111111')).toBe(true);
    })

    // 223450 does not meet these criteria (decreasing pair of digits 50).
    test('223450 does not meet these criteria (decreasing pair of digits 50).', () => {
      expect(testPassword('223450')).toBe(false);
    })

    // 123789 does not meet these criteria (no double).
    test('123789 does not meet these criteria (no double).', () => {
      expect(testPassword('123789')).toBe(false);
    })
  });

  describe('count passwords', () => {

    test('extents', () => {
      expect(countValidPasswords('000000', '000000')).toBe(1);
      expect(countValidPasswords('000000', '000009')).toBe(10);
      expect(countValidPasswords('999999', '999999')).toBe(1);
      // expect(countValidPasswords('900000', '999999')).toBe(1);
    });

    test.skip('large extents', () => {
      expect(countValidPasswords('900000', '999999')).toBe(1);
    });

    test.skip('puzzle input 353096-843212', () => {
      const numValid = countValidPasswords('353096', '843212');
      expect(numValid).toBe(579);
    })
  })
})