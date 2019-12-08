import { html } from 'lit-html';
import { assocPath, update } from 'ramda';
import { ClassInfo, classMap } from 'lit-html/directives/class-map';
import { GridOptions } from '../../../src/types';
import { Config } from '../../types';
import * as defaults from '../../../src/defaults';
import { getRandomId } from '../../helpers';

function controlGrid({ options, onUpdate }: Config) {
  const { grid } = options;
  let isVisible = defaults.gridIsVisible;
  let numCells = defaults.gridNumCells;

  if (typeof grid !== 'boolean') {
    isVisible = grid.isVisible;
    numCells = grid.numCells;
  }

  const isVisibleId = getRandomId('grid-is-visible');
  const numCellsId = getRandomId('grid-num-cells');

  const numCellsClass: ClassInfo = {
    'config-panel__control': true,
    'config-panel__control_hidden': !isVisible,
  };

  return html`
    <div class="config-panel__control">
      <label for=${isVisibleId} class="config-panel__label">
        Show Grid
      </label>
      <input
        type="checkbox"
        id=${isVisibleId}
        class="config-panel__checkbox"
        value=${isVisible}
        ?checked=${isVisible}
        @input=${(e: KeyboardEvent) =>
          onUpdate(e, options => {
            const isVisible = (e.target as HTMLInputElement).checked;
            return assocPath(['grid', 'isVisible'], isVisible, options);
          })}
      />
    </div>

    <div class=${classMap(numCellsClass)}>
      <label class="config-panel__label">
        Grid Number of Cells
      </label>
      <div class="config-panel__group">
        ${numCells.map(
          (value, idx) => html`
            <div class="config-panel__group-item">
              <label class="config-panel__group-item-label">
                ${idx + 1}:
              </label>
              <input
                type="number"
                min="1"
                id=${numCellsId.concat(idx.toString())}
                class="config-panel__input"
                value=${value}
                @input=${(e: KeyboardEvent) =>
                  onUpdate(e, options => {
                    const { numCells } = options.grid as GridOptions;
                    const newValue = (e.target as HTMLInputElement).value;
                    return assocPath(
                      ['grid', 'numCells'],
                      update(idx, parseInt(newValue, 10), numCells),
                      options,
                    );
                  })}
              />
            </div>
          `,
        )}
      </div>
    </div>
  `;
}

export default controlGrid;
