import { styleMap, StyleInfo } from 'lit-html/directives/style-map';
import { classMap, ClassInfo } from 'lit-html/directives/class-map';
import { html, TemplateResult } from 'lit-html';

import { convertOrientationToOrigin } from '../../services/converters';
import { Handle, HandleId } from '../../types';

type Actions = {
  onMouseDown: (id: HandleId, e: MouseEvent) => void;
};

function handleView(
  { id, orientation, position, cssClass, isActive, role }: Handle,
  actions: Actions,
): TemplateResult {
  const origin = convertOrientationToOrigin(orientation);

  const styles: StyleInfo = {
    [origin]: `${position}%`,
  };

  const cssClasses: ClassInfo = {
    [cssClass]: true,
    [`${cssClass}_active`]: isActive,
  };

  return html`
    <div
      class=${classMap(cssClasses)}
      style=${styleMap(styles)}
      data-role=${role}
      data-handle-id=${id}
      @dragstart=${() => false}
      @mousedown=${(e: MouseEvent) => actions.onMouseDown(id, e)}
    ></div>
  `;
}

export default handleView;
