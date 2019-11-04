import {
  fromPairs,
  clamp,
  applySpec,
  includes,
  zip,
  map,
  prop,
  aperture,
} from 'ramda';
import { isNotEmpty } from 'ramda-adjunct';
import {
  RelativePos,
  Orientation,
  Origin,
  Data,
  DataKey,
  Options,
  OptionsKey,
  OptimizedOptions,
  State,
  Handle,
  HandleId,
  Tooltip,
  Interval,
  IntervalId,
} from './types';
import {
  toArray,
  makeId,
  closestToStep,
  getRelativePosition,
  fillArrayWith,
} from './helpers';
import * as defaults from './defaults';

//
// ─── ORIENTATION TO ORIGIN ──────────────────────────────────────────────────────
//

function convertOrientationToOrigin(orientation: Orientation): Origin {
  return orientation === 'horizontal' ? 'left' : 'bottom';
}

//
// ─── OPTIONS TO DATA ────────────────────────────────────────────────────────────
//

function modifyOptionsForInternalUse(options: Options): OptimizedOptions {
  const valuesLength = toArray(options.value).length;

  const transformations: {
    [key in OptionsKey]: (op: Options) => Options[OptionsKey];
  } = {
    value: op => toArray(op.value),
    min: op => op.min,
    max: op => op.max,
    step: op => op.step,
    orientation: op => op.orientation,
    cssClass: op => op.cssClass,
    tooltips: op =>
      // tooltips length should equal values length
      fillArrayWith(valuesLength, defaults.tooltipValue, toArray(op.tooltips)),
    tooltipFormatter: op => op.tooltipFormatter,
    intervals: op =>
      // intervals length should be greater then values length by 1
      fillArrayWith(
        valuesLength + 1,
        defaults.intervalValue,
        toArray(op.intervals),
      ),
  };

  return applySpec(transformations)(options) as OptimizedOptions;
}

function convertOptionsToData(options: Options): Data {
  const optimizedOptions = modifyOptionsForInternalUse(options);

  const transformations: {
    [key in DataKey]: (op: OptimizedOptions) => Data[DataKey];
  } = {
    min: op => op.min,
    max: op => op.max,
    step: op => op.step,
    orientation: op => op.orientation,
    cssClass: op => op.cssClass,

    /** HANDLES */
    handles: op =>
      fromPairs(
        op.value.map((val, idx) => [
          makeId('handle', idx),
          clamp(op.min, op.max, closestToStep(op.step, val)),
        ]),
      ),
    handleIds: op => op.value.map((_, idx) => makeId('handle', idx)),
    activeHandleId: () => null,

    /** TOOLTIPS */
    tooltips: op =>
      fromPairs(
        op.tooltips.map((isVisible, idx) => [
          makeId('tooltip', idx),
          isVisible,
        ]),
      ),
    tooltipIds: op => op.tooltips.map((_, idx) => makeId('tooltip', idx)),
    tooltipFormatter: op => op.tooltipFormatter,
    // collisions between tooltips can only be known after render
    tooltipCollisions: () => [],

    /** INTERVALS */
    intervals: op =>
      fromPairs(
        op.intervals.map((isVisible, idx): [IntervalId, boolean] => [
          makeId('interval', idx),
          isVisible,
        ]),
      ),
    intervalIds: op => op.intervals.map((_, idx) => makeId('interval', idx)),
  };

  return applySpec(transformations)(optimizedOptions) as Data;
}

//
// ─── DATA TO OPTIONS ────────────────────────────────────────────────────────────
//

function convertDataToOptions(data: Data): Options {
  const transformations: { [key in OptionsKey]: Function } = {
    value: (d: Data) => d.handleIds.map(id => d.handles[id]),
    min: (d: Data) => d.min,
    max: (d: Data) => d.max,
    step: (d: Data) => d.step,
    orientation: (d: Data) => d.orientation,
    cssClass: (d: Data) => d.cssClass,
    tooltips: (d: Data) => d.tooltipIds.map(id => d.tooltips[id]),
    tooltipFormatter: (d: Data) => d.tooltipFormatter,
    intervals: (d: Data) => d.intervalIds.map(id => d.intervals[id]),
  };

  return applySpec(transformations)(data) as Options;
}

//
// ─── DATA TO STATE ──────────────────────────────────────────────────────────────
//

function makeHandles(data: Data): Handle[] {
  const role = 'handle';
  const cssClass = `${data.cssClass}__${role}`;

  const handles = data.handleIds.map(
    (id): Handle => ({
      id,
      orientation: data.orientation,
      position: getRelativePosition(data.min, data.max, data.handles[id]),
      isActive: data.activeHandleId === id,
      cssClass,
      role,
    }),
  );

  return handles;
}

function getMergedTooltipsContent(
  data: Data,
  tooltipsToMerge: Tooltip[],
): Tooltip['content'] {
  // if 2 adjacent values belong to visible interval -> connect them with dash (-)
  // otherwise connect them with semicolon (;)
  const valuesWithConnectors = tooltipsToMerge
    .reduce(
      (acc, cur): HandleId[] => acc.concat(cur.handleIds),
      [] as HandleId[],
    )
    .map(handleId => ({
      handleIdx: data.handleIds.findIndex(id => id === handleId),
      value: data.tooltipFormatter(data.handles[handleId]),
    }))
    .flatMap(({ handleIdx, value }) => {
      const intervalId = data.intervalIds[handleIdx + 1];

      if (data.intervals[intervalId]) {
        return [value, ' - '];
      }

      return [value, '; '];
    });

  // remove last connector
  valuesWithConnectors.pop();

  return valuesWithConnectors.join('');
}

function makeTooltips(data: Data): Tooltip[] {
  const role = 'tooltip';
  const cssClass = `${data.cssClass}__${role}`;

  const tooltips = zip(data.handleIds, data.tooltipIds).map(
    ([handleId, tooltipId]): Tooltip => ({
      id: tooltipId,
      handleIds: [handleId],
      content: data.tooltipFormatter(data.handles[handleId]),
      orientation: data.orientation,
      hasCollisions: data.tooltipCollisions.some(includes(tooltipId)),
      isVisible: data.tooltips[tooltipId],
      position: getRelativePosition(data.min, data.max, data.handles[handleId]),
      cssClass,
      role: 'tooltip',
    }),
  );

  // when tooltips overlap - they are hidden
  // mergedTooltip is shown instead of group of overlapping tooltips
  const overlappingGroups: Tooltip[][] = [];
  tooltips.forEach(tooltip => {
    if (tooltip.hasCollisions) {
      if (overlappingGroups[overlappingGroups.length - 1]) {
        overlappingGroups[overlappingGroups.length - 1].push(tooltip);
      } else {
        overlappingGroups.push([tooltip]);
      }
    } else {
      overlappingGroups.push([]);
    }
  });

  const mergedTooltips = overlappingGroups.filter(isNotEmpty).map(
    (group, idx): Tooltip => ({
      id: makeId('tooltip-merged', idx),
      handleIds: group.reduce(
        (acc, cur) => acc.concat(cur.handleIds),
        [] as HandleId[],
      ),
      content: getMergedTooltipsContent(data, group),
      orientation: data.orientation,
      hasCollisions: false,
      isVisible: true,
      position: (group[group.length - 1].position + group[0].position) / 2,
      cssClass,
      role: 'tooltip-merged',
    }),
  );

  return tooltips.concat(mergedTooltips);
}

function makeIntervals(data: Data): Interval[] {
  const role = 'interval';
  const cssClass = `${data.cssClass}__${role}`;

  const handlePositions = data.handleIds.map((handleId): {
    id: HandleId;
    pos: RelativePos;
  } => ({
    id: handleId,
    pos: getRelativePosition(data.min, data.max, data.handles[handleId]),
  }));

  const allRelativePositions = [
    { id: 'first', pos: 0 },
    ...handlePositions,
    { id: 'last', pos: 100 },
  ];

  const intervals = zip(
    data.intervalIds,
    aperture(2, allRelativePositions),
  ).map(
    ([id, [start, stop]]): Interval => ({
      id,
      from: start.pos,
      to: stop.pos,
      handleIds: [start.id, stop.id],
      orientation: data.orientation,
      cssClass,
      isVisible: data.intervals[id],
      role,
    }),
  );

  return intervals;
}

function convertDataToState(data: Data): State {
  return {
    cssClass: data.cssClass,
    track: {
      orientation: data.orientation,
      cssClass: `${data.cssClass}__track`,
    },
    intervals: makeIntervals(data),
    handles: makeHandles(data),
    tooltips: makeTooltips(data),
  };
}

export {
  convertOptionsToData,
  convertDataToOptions,
  convertDataToState,
  convertOrientationToOrigin,
};
