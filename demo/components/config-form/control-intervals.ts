import { html } from 'lit-html';
import { update, assoc } from 'ramda';
import { Config } from '../../types';
import { toArray } from '../../../src/helpers';
import { getRandomId, valueFormatter } from '../../helpers';

function controlIntervals({ options, onUpdate }: Config) {
  const { value, min, max, intervals } = options;
  const id = getRandomId('intervals');
  const values = toArray(value);

  return html`
    <div class="config-panel__control">
      <label class="config-panel__label">
        Intervals
      </label>
      <div class="config-panel__group">
        ${toArray(intervals).map((isChecked, idx) => {
          const leftValue = values[idx - 1] || min;
          const rightValue = values[idx] || max;

          return html`
            <div class="config-panel__group-item">
              <label class="config-panel__group-item-label">
                ${idx + 1}:
              </label>
              <input
                type="checkbox"
                id=${id.concat(idx.toString())}
                name="intervals"
                class="config-panel__group-item-checkbox"
                value=${isChecked}
                ?checked=${isChecked}
                @input=${(e: KeyboardEvent) =>
                  onUpdate(e, options => {
                    const newValue = (e.target as HTMLInputElement).checked;
                    const newIntervals = update(
                      idx,
                      !!newValue,
                      toArray(options.intervals),
                    );
                    return assoc('intervals', newIntervals, options);
                  })}
              />
              <span class="config-panel__group-item-desc">
                between
                <code>${valueFormatter(leftValue)}</code>
                and
                <code>${valueFormatter(rightValue)}</code>
              </span>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

export default controlIntervals;
