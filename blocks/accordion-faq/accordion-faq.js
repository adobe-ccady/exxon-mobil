import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Accordion FAQ: collapsible question / answer list, all items closed on load.
 * block > one div per item > [question cell] [answer cell].
 * Native <details>/<summary>: keyboard (Enter/Space) and screen reader support built in.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [labelCell, bodyCell] = [...row.children];
    if (!labelCell?.textContent.trim() && !bodyCell?.textContent.trim()
      && !row.hasAttribute('data-aue-resource')) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    if (labelCell) {
      moveInstrumentation(labelCell, summary);
      // a single paragraph is unwrapped so the summary holds the question text directly
      const only = labelCell.children.length === 1 && labelCell.firstElementChild.matches('p');
      summary.append(...(only ? labelCell.firstElementChild : labelCell).childNodes);
    }

    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    if (bodyCell) {
      moveInstrumentation(bodyCell, body);
      body.append(...bodyCell.childNodes);
    }

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    moveInstrumentation(row, details);
    details.append(summary, body);
    row.replaceWith(details);
  });
}
