import { html, TemplateResult } from 'lit-html';
import { Tooltip } from '../../types';

const className = 'range-slider__tooltip';

function tooltipView({
  origin,
  position,
  content,
  isVisible,
}: Tooltip): TemplateResult {
  const style = `
    ${origin}: ${position.value}%;
    display: ${isVisible ? 'block' : 'none'};
  `;

  return html`
    <div class=${className} style=${style}>
      ${content}
    </div>
  `;
}

export { tooltipView, className };
