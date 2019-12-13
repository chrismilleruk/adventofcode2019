

if (require.main === module) {
  (async () => {
    let count = 0;
    for (let password of findValidPasswords('353096', '843212', testPasswordScheme1)) {
      count++;
    }
    console.log('Total for password scheme 1:', count);
    count = 0;
    for (let password of findValidPasswords('353096', '843212', testPasswordScheme2)) {
      count++;
    }
    console.log('Total for password scheme 2:', count);
  })();
}

function testPasswordScheme1(password) {
  let adjacentDigits = false;
  let containsDecrease = false;

  let passwordString = [...password];

  passwordString.reduce((previous, current) => {
    if (previous === current) {
      adjacentDigits = true;
    }
    if (current < previous) {
      containsDecrease = true;
    }
    return current;
  });

  // It is a six-digit number.
  // Two adjacent digits are the same (like 22 in 122345).
  // Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).
  return passwordString.length === 6 && adjacentDigits && !containsDecrease;
}

function testPasswordScheme2(password) {
  // An Elf just remembered one more important detail: 
  //   the two adjacent matching digits are not part of a larger group of matching digits.
  let adjacentDigits = false;
  let containsDecrease = false;

  let passwordString = [...password];

  let state = passwordString.reduce((state, current, _, str) => {
    let len = state.len;

    if (state.val !== current) {
      // look for two digits whenever we see a different letter.
      testAdjacent(state);

      // reset the len counter
      len = 1;
    } else {
      // same digits so increment the len counter
      len += 1;
    }

    if (current < state.val) {
      containsDecrease = true;
    }

    state = { val: current, len };

    return state;
  }, { val: '', len: 0 });

  // check the final two digits.]
  testAdjacent(state);

  // It is a six-digit number.
  // Two adjacent digits are the same (like 22 in 122345).
  // Going from left to right, the digits never decrease; they only ever increase or stay the same (like 111123 or 135679).
  return passwordString.length === 6 && adjacentDigits && !containsDecrease;

  function testAdjacent(state) {
    if (state.len == 2) {
      adjacentDigits = true;
    }
  }
}


function* findValidPasswords(start, end, testPasswordFn = testPasswordScheme1) {
  min = parseInt(start, 10);
  max = parseInt(end, 10);

  for (let password = min; password <= max; password += 1) {
    let strPassword = ('00000000' + String(password));
    strPassword = strPassword.slice(strPassword.length - 6);

    if (testPasswordFn(strPassword)) {
      yield password;
    }
  }
}

function countValidPasswords(start, end, testPasswordFn = testPasswordScheme1) {
  let count = 0;
  for (let password of findValidPasswords(start, end, testPasswordFn)) {
    count++;
  }
  return count;
}

module.exports = {
  testPasswordScheme1,
  testPasswordScheme2,
  countValidPasswords
};
