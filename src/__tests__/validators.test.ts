import * as fc from 'fast-check';
import {
  checkValue,
  checkMin,
  checkMax,
  checkStep,
  checkOrientation,
  checkLocale,
  checkDirection,
  checkPadding
} from '../validators';

//
// ─── HELPERS ────────────────────────────────────────────────────────────────────
//

function anyNumberIsOk(fn: Function): void {
  fc.assert(
    fc.property(fc.integer(), v => {
      expect(fn(v)).toBe(true);
    })
  );
}

function anyNonNumberIsBad(fn: Function): void {
  // for strings
  fc.assert(
    fc.property(fc.unicode(), v => {
      expect(fn(v)).toBe(false);
    })
  );

  // for booleans
  expect(fn(true)).toBe(false);
  expect(fn(false)).toBe(false);

  // for null & undefined
  expect(fn(null)).toBe(false);
  expect(fn(undefined)).toBe(false);

  // for objects
  fc.assert(
    fc.property(fc.object(), v => {
      expect(fn(v)).toBe(false);
    })
  );
}

function anyNonEmptyArrayOfNumbersIsOk(fn: Function): void {
  fc.assert(
    fc.property(fc.array(fc.integer(), 1, 100), v => {
      expect(fn(v)).toBe(true);
    })
  );
}

function anyNonNumericArrayIsBad(fn: Function): void {
  // array of strings
  fc.assert(
    fc.property(fc.array(fc.unicode()), v => {
      expect(fn(v)).toBe(false);
    })
  );

  // array of booleans
  fc.assert(
    fc.property(fc.array(fc.boolean()), v => {
      expect(fn(v)).toBe(false);
    })
  );

  // array of null
  fc.assert(
    fc.property(fc.array(fc.constant(null)), v => {
      expect(fn(v)).toBe(false);
    })
  );

  // array of undefined
  fc.assert(
    fc.property(fc.array(fc.constant(undefined)), v => {
      expect(fn(v)).toBe(false);
    })
  );

  // array of objects
  fc.assert(
    fc.property(fc.array(fc.object()), v => {
      expect(fn(v)).toBe(false);
    })
  );
}

//
// ─── TESTS ──────────────────────────────────────────────────────────────────────
//

describe('checkValue', () => {
  test('should return true for any number', () => {
    anyNumberIsOk(checkValue);
  });

  test('should return true for any non empty array of numbers', () => {
    anyNonEmptyArrayOfNumbersIsOk(checkValue);
  });

  test('should return false for any non numeric value', () => {
    anyNonNumberIsBad(checkValue);
  });

  test('should return false for any array with non numeric values', () => {
    anyNonNumericArrayIsBad(checkValue);
  });
});

describe('checkMin', () => {
  test('should return true for any number', () => {
    anyNumberIsOk(checkMin);
  });

  test('should return false for any non numeric value', () => {
    anyNonNumberIsBad(checkMin);
  });
});

describe('checkMax', () => {
  test('should return true for any number', () => {
    anyNumberIsOk(checkMax);
  });

  test('should return false for any non numeric value', () => {
    anyNonNumberIsBad(checkMax);
  });
});

describe('checkStep', () => {
  test('should return true for any number', () => {
    anyNumberIsOk(checkStep);
  });

  test('should return false for any non numeric value', () => {
    anyNonNumberIsBad(checkStep);
  });
});

describe('checkOrientation', () => {
  test('should return true for "horizontal" & "vertical" strings', () => {
    expect(checkOrientation('horizontal')).toBe(true);
    expect(checkOrientation('vertical')).toBe(true);
    expect(checkOrientation('  vertical  ')).toBe(true);
  });

  test('should return false for any other string', () => {
    fc.assert(
      fc.property(fc.string(), v => {
        expect(checkOrientation(v)).toBe(false);
      })
    );
  });
});

describe('checkLocale', () => {
  test('should return true for strings that match locale pattern (aa-AA)', () => {
    expect(checkLocale('ru-RU')).toBe(true);
    expect(checkLocale('en-US')).toBe(true);
    expect(checkLocale('  de-DE ')).toBe(true);
  });

  test('should return false for any string that do not match the locale pattern (aa-AA)', () => {
    fc.assert(
      fc.property(fc.string(), v => {
        expect(checkLocale(v)).toBe(false);
      })
    );
  });
});

describe('checkDirection', () => {
  test('should return true for "ltr" & "rtl" strings', () => {
    expect(checkDirection('ltr')).toBe(true);
    expect(checkDirection('rtl')).toBe(true);
    expect(checkDirection('  ltr ')).toBe(true);
  });

  test('should return false for any other strings', () => {
    fc.assert(
      fc.property(fc.string().filter(v => v !== 'ltr' && v !== 'rtl'), v => {
        expect(checkDirection(v)).toBe(false);
      })
    );
  });
});

describe('checkPadding', () => {
  test('should return true for any number', () => {
    anyNumberIsOk(checkPadding);
  });

  test('should return true for any tuple of 2 numbers', () => {
    fc.assert(
      fc.property(fc.tuple(fc.integer(), fc.integer()), v => {
        expect(checkPadding(v)).toBe(true);
      })
    );
  });

  test('should return false for any non numeric value', () => {
    anyNonNumberIsBad(checkPadding);
  });

  test('should return false for any tuple of 2 values with non numeric value(s)', () => {
    // [number, string] => false
    fc.assert(
      fc.property(fc.tuple(fc.integer(), fc.string()), v => {
        expect(checkPadding(v)).toBe(false);
      })
    );

    // [object, boolean] => false
    fc.assert(
      fc.property(fc.tuple(fc.object(), fc.boolean()), v => {
        expect(checkPadding(v)).toBe(false);
      })
    );
  });
});