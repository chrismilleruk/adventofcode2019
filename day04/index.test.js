const {
  testPasswordScheme1,
  testPasswordScheme2,
  countValidPasswords
} = require('./');

describe('Day 4: Secure Container', () => {
  describe('test password scheme 1', () => {
    // It is a six-digit number.
    // The value is within the range given in your puzzle input.
    // Two adjacent digits are the same (like 22 in 122345).
    // Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).

    // 111111 meets these criteria (double 11, never decreases).
    test('111111 meets these criteria (double 11, never decreases).', () => {
      expect(testPasswordScheme1('111111')).toBe(true);
    })

    // 223450 does not meet these criteria (decreasing pair of digits 50).
    test('223450 does not meet these criteria (decreasing pair of digits 50).', () => {
      expect(testPasswordScheme1('223450')).toBe(false);
    })

    // 123789 does not meet these criteria (no double).
    test('123789 does not meet these criteria (no double).', () => {
      expect(testPasswordScheme1('123789')).toBe(false);
    })
  });

  describe('test password scheme 2', () => {
    // 112233 meets these criteria because the digits never decrease and all repeated digits are exactly two digits long.
    test('112233 meets these criteria because the digits never decrease and all repeated digits are exactly two digits long.', () => {
      expect(testPasswordScheme2('112233')).toBe(true);
    }) 

    // 123444 no longer meets the criteria (the repeated 44 is part of a larger group of 444).
    test('123444 no longer meets the criteria (the repeated 44 is part of a larger group of 444).', () => {
      expect(testPasswordScheme2('123444')).toBe(false);
    })

    // 111122 meets the criteria (even though 1 is repeated more than twice, it still contains a double 22).
    test('111122 meets the criteria (even though 1 is repeated more than twice, it still contains a double 22).', () => {
      expect(testPasswordScheme2('111122')).toBe(true);
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
  });

  describe.skip('puzzle questions', () => {

    test('puzzle input 353096-843212, part1', () => {
      const numValid = countValidPasswords('353096', '843212', testPasswordScheme1);
      expect(numValid).toBe(579);
    })

    test('puzzle input 353096-843212, part2', () => {
      // How many different passwords within the range given in your puzzle input meet all of the criteria?
      const numValid = countValidPasswords('353096', '843212', testPasswordScheme2);
      expect(numValid).toBe(358);
    })

  });
})