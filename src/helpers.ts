import {
  Options,
  Data,
  State,
  OptionsKey,
  DataKey,
  Origin,
  Position,
  Interval,
  Handle,
  Tooltip,
} from './types';
import { Maybe, Nothing, Just } from 'purify-ts/Maybe';
import {
  pipe,
  ifElse,
  always,
  pluck,
  clone,
  applySpec,
  zip,
  aperture,
} from 'ramda';
import { lengthEq } from 'ramda-adjunct';

/**
 * Query dom elements
 * @param selector css selector
 */
function $(selector: string): Maybe<HTMLElement[]> {
  // prettier-ignore
  return Maybe
    .encase(() => document.querySelectorAll(selector))
    .chain<HTMLElement[]>(
      ifElse(
        lengthEq(0),
        always(Nothing),
        pipe(
          Array.from,
          Just,
        ),
      ),
  );
}

/**
 * Convert value to array
 * @param v value to be converted
 */
function toArray<T>(v: T): T[] {
  return Array.isArray(v) ? [...v] : [v];
}

/**
 * Create new array from arr with length = neededLength and fill empty slots with value
 * @param arr initial array
 * @param neededLength new array length
 * @param value value to fill empty slots
 */
function fillArrayWith<T>(arr: T[], neededLength: number, value: T): T[] {
  if (arr.length >= neededLength) {
    return [...arr];
  }

  // fill remaining slots with value
  return arr.concat(Array(neededLength - arr.length).fill(value));
}

function convertOptionsToData(options: Options): Data {
  const clonedOptions = clone(options);

  const transformations: { [key in DataKey]: Function } = {
    spots: (op: Options) =>
      toArray(op.value).map((v, i) => ({ id: `value_${i}`, value: v })),
    min: (op: Options) => op.min,
    max: (op: Options) => op.max,
    step: (op: Options) => op.step,
    orientation: (op: Options) => op.orientation,
    tooltips: (op: Options) =>
      // TODO: maybe refactor false value to defaultTooltipValue
      fillArrayWith(toArray(op.tooltips), toArray(op.value).length, false),
    intervals: (op: Options) =>
      // TODO: maybe refactor false value to defaultIntervalValue
      fillArrayWith(toArray(op.intervals), toArray(op.value).length + 1, false),
  };

  return applySpec(transformations)(clonedOptions) as Data;
}

function convertDataToOptions(data: Data): Options {
  const clonedData = clone(data);

  const transformations: { [key in OptionsKey]: Function } = {
    value: (d: Data) => pluck('value', d.spots),
    min: (d: Data) => d.min,
    max: (d: Data) => d.max,
    step: (d: Data) => d.step,
    orientation: (d: Data) => d.orientation,
    tooltips: (d: Data) => d.tooltips,
    intervals: (d: Data) => d.intervals,
  };

  return applySpec(transformations)(clonedData) as Options;
}

function getRelativePosition(min: number, max: number, value: number): number {
  return ((value - min) / (max - min)) * 100;
}

function convertDataToState(data: Data): State {
  // origin
  const origin: Origin = data.orientation === 'horizontal' ? 'left' : 'bottom';

  // intervals
  const firstPosition: Position = { id: 'first', value: 0 };
  const lastPosition: Position = { id: 'last', value: 100 };
  const handlePositions: Position[] = data.spots.map(spot => ({
    id: spot.id,
    value: getRelativePosition(data.min, data.max, spot.value),
  }));
  const allPositions: Position[] = [
    firstPosition,
    ...handlePositions,
    lastPosition,
  ];
  const intervals: Interval[] = zip(
    data.intervals,
    aperture(2, allPositions),
  ).map(([isVisible, [from, to]]) => ({ isVisible, from, to }));

  // handles
  const handles: Handle[] = handlePositions.map(position => ({ position }));

  // tooltips
  const tooltips: Tooltip[] = zip(data.tooltips, data.spots).map(
    ([isVisible, spot]) => ({
      isVisible,
      content: String(spot.value),
      position: {
        id: spot.id,
        value: getRelativePosition(data.min, data.max, spot.value),
      },
    }),
  );

  return {
    origin,
    intervals,
    handles,
    tooltips,
  };
}

export {
  $,
  // converters
  convertOptionsToData,
  convertDataToOptions,
  convertDataToState,
};
