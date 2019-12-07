

if (require.main === module) {
  (async () => {
    let count = 0;
    for (let password of findValidPasswords('353096', '843212')) {
      console.log(password);
      count ++;
    }
    console.log('Total', count);
  })();
}

function testPassword(password) {
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

function* findValidPasswords(start, end) {
  min = parseInt(start, 10);
  max = parseInt(end, 10);

  for (let password = min; password <= max; password += 1) {
    let strPassword = ('00000000' + String(password));
    strPassword = strPassword.slice(strPassword.length-6);
    
    if (testPassword(strPassword)) {
      yield password;
    }
  }
}

function countValidPasswords(start, end) {
  let count = 0;
  for (let password of findValidPasswords(start, end)) {
      count ++;
  }
  return count;
}

module.exports = {
  testPassword,
  countValidPasswords
};
