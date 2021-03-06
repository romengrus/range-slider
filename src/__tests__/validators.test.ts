import { Just, Nothing } from 'purify-ts/Maybe';
import { Left, Right } from 'purify-ts/Either';
import * as fc from 'fast-check';

import {
  // errors
  errNotValidValue,
  errNotValidMin,
  errNotValidMax,
  errNotValidStep,
  errNotValidOrientation,
  errNotValidTooltips,
  errNotValidIntervals,
  errNotValidGrid,
  errNotValidCSSClass,
  errOptionsIsNotAnObject,
  // validators
  checkValue,
  checkMin,
  checkMax,
  checkStep,
  checkOrientation,
  checkTooltips,
  checkIntervals,
  checkGrid,
  checkCSSClass,
  checkRangeSliderOptions,
} from '../validators';

describe('checkValue', () => {
  test('numbers are valid', () => {
    expect(checkValue(0)).toEqual(Nothing);
    expect(checkValue(-10)).toEqual(Nothing);
    expect(checkValue(10)).toEqual(Nothing);
    expect(checkValue(3.1415)).toEqual(Nothing);
  });

  test('array of numbers is valid', () => {
    expect(checkValue([0, 0])).toEqual(Nothing);
    expect(checkValue([-10, -50, 40])).toEqual(Nothing);
    expect(checkValue([10, 50])).toEqual(Nothing);
    expect(checkValue([3.1415, 100])).toEqual(Nothing);
  });

  test('non numeric value is not valid', () => {
    expect(checkValue('foo')).toEqual(Just(errNotValidValue()));
    expect(checkValue(true)).toEqual(Just(errNotValidValue()));
    expect(checkValue(false)).toEqual(Just(errNotValidValue()));
    expect(checkValue(null)).toEqual(Just(errNotValidValue()));
    expect(checkValue(undefined)).toEqual(Just(errNotValidValue()));
    expect(checkValue(NaN)).toEqual(Just(errNotValidValue()));
    expect(checkValue({ foo: 123 })).toEqual(Just(errNotValidValue()));
    expect(checkValue(['a', 10])).toEqual(Just(errNotValidValue()));
    expect(checkValue(['a', 'b'])).toEqual(Just(errNotValidValue()));
    expect(checkValue([true, false])).toEqual(Just(errNotValidValue()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkMin', () => {
  test('numbers are valid', () => {
    expect(checkMin(0)).toEqual(Nothing);
    expect(checkMin(-10)).toEqual(Nothing);
    expect(checkMin(10)).toEqual(Nothing);
    expect(checkMin(3.1415)).toEqual(Nothing);
  });

  test('non numeric values are not valid', () => {
    expect(checkMin('foo')).toEqual(Just(errNotValidMin()));
    expect(checkMin(true)).toEqual(Just(errNotValidMin()));
    expect(checkMin(false)).toEqual(Just(errNotValidMin()));
    expect(checkMin(null)).toEqual(Just(errNotValidMin()));
    expect(checkMin(undefined)).toEqual(Just(errNotValidMin()));
    expect(checkMin(NaN)).toEqual(Just(errNotValidMin()));
    expect(checkMin({ foo: 123 })).toEqual(Just(errNotValidMin()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkMax', () => {
  test('numbers are valid', () => {
    expect(checkMax(0)).toEqual(Nothing);
    expect(checkMax(-10)).toEqual(Nothing);
    expect(checkMax(10)).toEqual(Nothing);
    expect(checkMax(3.1415)).toEqual(Nothing);
  });

  test('non numeric values are not valid', () => {
    expect(checkMax('foo')).toEqual(Just(errNotValidMax()));
    expect(checkMax(true)).toEqual(Just(errNotValidMax()));
    expect(checkMax(false)).toEqual(Just(errNotValidMax()));
    expect(checkMax(null)).toEqual(Just(errNotValidMax()));
    expect(checkMax(undefined)).toEqual(Just(errNotValidMax()));
    expect(checkMax(NaN)).toEqual(Just(errNotValidMax()));
    expect(checkMax({ foo: 123 })).toEqual(Just(errNotValidMax()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkStep', () => {
  test('numbers are valid', () => {
    expect(checkStep(0)).toEqual(Nothing);
    expect(checkStep(-10)).toEqual(Nothing);
    expect(checkStep(10)).toEqual(Nothing);
    expect(checkStep(3.1415)).toEqual(Nothing);
  });

  test('non numeric values are not valid', () => {
    expect(checkStep('foo')).toEqual(Just(errNotValidStep()));
    expect(checkStep(true)).toEqual(Just(errNotValidStep()));
    expect(checkStep(false)).toEqual(Just(errNotValidStep()));
    expect(checkStep(null)).toEqual(Just(errNotValidStep()));
    expect(checkStep(undefined)).toEqual(Just(errNotValidStep()));
    expect(checkStep(NaN)).toEqual(Just(errNotValidStep()));
    expect(checkStep({ foo: 123 })).toEqual(Just(errNotValidStep()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkOrientation', () => {
  test('only "horizontal" & "vertical" values are valid', () => {
    expect(checkOrientation('horizontal')).toEqual(Nothing);
    expect(checkOrientation('vertical')).toEqual(Nothing);
    expect(checkOrientation('  vertical  ')).toEqual(
      Just(errNotValidOrientation()),
    );
    expect(checkOrientation('foo')).toEqual(Just(errNotValidOrientation()));
    expect(checkOrientation(123)).toEqual(Just(errNotValidOrientation()));
    expect(checkOrientation(NaN)).toEqual(Just(errNotValidOrientation()));
    expect(checkOrientation(null)).toEqual(Just(errNotValidOrientation()));
    expect(checkOrientation(undefined)).toEqual(Just(errNotValidOrientation()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkTooltips', () => {
  test('booleans are valid', () => {
    expect(checkTooltips(true)).toEqual(Nothing);
    expect(checkTooltips(false)).toEqual(Nothing);
  });

  test('array of booleans are valid', () => {
    expect(checkTooltips([false])).toEqual(Nothing);
    expect(checkTooltips([true])).toEqual(Nothing);
    expect(checkTooltips([true, false])).toEqual(Nothing);
    expect(checkTooltips([true, true, false])).toEqual(Nothing);
    expect(checkTooltips([true, false, true, false])).toEqual(Nothing);
  });

  test('non boolean values are not valid', () => {
    expect(checkTooltips('foo')).toEqual(Just(errNotValidTooltips()));
    expect(checkTooltips(null)).toEqual(Just(errNotValidTooltips()));
    expect(checkTooltips(undefined)).toEqual(Just(errNotValidTooltips()));
    expect(checkTooltips(123)).toEqual(Just(errNotValidTooltips()));
    expect(checkTooltips({ foo: true })).toEqual(Just(errNotValidTooltips()));
    expect(checkTooltips([true, 1])).toEqual(Just(errNotValidTooltips()));
    expect(checkTooltips([true, 'a'])).toEqual(Just(errNotValidTooltips()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkIntervals', () => {
  test('booleans are valid', () => {
    expect(checkIntervals(true)).toEqual(Nothing);
    expect(checkIntervals(false)).toEqual(Nothing);
  });

  test('array of booleans are valid', () => {
    expect(checkIntervals([false])).toEqual(Nothing);
    expect(checkIntervals([true])).toEqual(Nothing);
    expect(checkIntervals([true, false])).toEqual(Nothing);
    expect(checkIntervals([true, true, false])).toEqual(Nothing);
    expect(checkIntervals([true, false, true, false])).toEqual(Nothing);
  });

  test('non boolean values are not valid', () => {
    expect(checkIntervals('foo')).toEqual(Just(errNotValidIntervals()));
    expect(checkIntervals(null)).toEqual(Just(errNotValidIntervals()));
    expect(checkIntervals(undefined)).toEqual(Just(errNotValidIntervals()));
    expect(checkIntervals(123)).toEqual(Just(errNotValidIntervals()));
    expect(checkIntervals({ foo: true })).toEqual(Just(errNotValidIntervals()));
    expect(checkIntervals([true, 1])).toEqual(Just(errNotValidIntervals()));
    expect(checkIntervals([true, 'a'])).toEqual(Just(errNotValidIntervals()));
  });
});

describe('checkGrid', () => {
  test('boolean values are valid', () => {
    expect(checkGrid(true)).toEqual(Nothing);
    expect(checkGrid(false)).toEqual(Nothing);
  });

  test('object with GridOptions shape is valid', () => {
    expect(checkGrid({ isVisible: true, numCells: [2, 3, 4] })).toEqual(
      Nothing,
    );
    expect(checkGrid({ isVisible: false, numCells: [2, 3] })).toEqual(Nothing);
    expect(checkGrid({ isVisible: false, numCells: [2] })).toEqual(Nothing);
    expect(checkGrid({ isVisible: false, numCells: [] })).toEqual(Nothing);
    expect(checkGrid({ isVisible: 'foo', numCells: [] })).toEqual(
      Just(errNotValidGrid()),
    );
    expect(checkGrid({ isVisible: 'foo', numCells: 5 })).toEqual(
      Just(errNotValidGrid()),
    );
    expect(checkGrid({ isVisible: true, numCells: null })).toEqual(
      Just(errNotValidGrid()),
    );
    expect(checkGrid({ isVisible: true, numCells: undefined })).toEqual(
      Just(errNotValidGrid()),
    );
    expect(checkGrid({ isVisible: undefined, numCells: undefined })).toEqual(
      Just(errNotValidGrid()),
    );
    expect(checkGrid({})).toEqual(Just(errNotValidGrid()));
  });

  test('non boolean and non object values are not valid', () => {
    expect(checkGrid([2, 3, 5])).toEqual(Just(errNotValidGrid()));
    expect(checkGrid('foo')).toEqual(Just(errNotValidGrid()));
    expect(checkGrid(5)).toEqual(Just(errNotValidGrid()));
    expect(checkGrid(null)).toEqual(Just(errNotValidGrid()));
    expect(checkGrid(undefined)).toEqual(Just(errNotValidGrid()));
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkCSSClass', () => {
  test('should be a string that starts with a letter and contain: letters, numbers, _, -', () => {
    expect(checkCSSClass(true)).toEqual(Just(errNotValidCSSClass()));
    expect(checkCSSClass(1)).toEqual(Just(errNotValidCSSClass()));
    expect(checkCSSClass([])).toEqual(Just(errNotValidCSSClass()));

    expect(checkCSSClass('123foo')).toEqual(Just(errNotValidCSSClass()));
    expect(checkCSSClass('-foo')).toEqual(Just(errNotValidCSSClass()));
    expect(checkCSSClass('_foo')).toEqual(Just(errNotValidCSSClass()));
    expect(checkCSSClass('foo')).toEqual(Nothing);
    expect(checkCSSClass('f123')).toEqual(Nothing);
    expect(checkCSSClass('f-123_bar')).toEqual(Nothing);
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('checkRangeSliderOptions', () => {
  test('non object values are not valid', () => {
    expect(checkRangeSliderOptions('foo')).toEqual(
      Left([errOptionsIsNotAnObject()]),
    );
    expect(checkRangeSliderOptions(null)).toEqual(
      Left([errOptionsIsNotAnObject()]),
    );
    expect(checkRangeSliderOptions(undefined)).toEqual(
      Left([errOptionsIsNotAnObject()]),
    );
  });

  test('should return Right(value) for valid RangeSliderOptions', () => {
    fc.property(
      fc.record({
        value: fc.integer(),
        min: fc.integer(),
        max: fc.integer(),
        step: fc.integer(),
        orientation: fc.constantFrom(['horizontal', 'vertical']),
        tooltips: fc.array(fc.boolean()),
      }),
      v => {
        expect(checkRangeSliderOptions(v)).toEqual(Right(v));
      },
    );
  });
});
