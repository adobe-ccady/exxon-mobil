import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Accordion Legal: collapsible legal disclaimers, all items open on load.
 * block > one div per item > [title cell] [legal text cell].
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
    summary.className = 'accordion-legal-item-label';
    if (labelCell) {
      moveInstrumentation(labelCell, summary);
      // a single paragraph is unwrapped so the summary holds the title text directly
      const only = labelCell.children.length === 1 && labelCell.firstElementChild.matches('p');
      summary.append(...(only ? labelCell.firstElementChild : labelCell).childNodes);
    }

    const body = document.createElement('div');
    body.className = 'accordion-legal-item-body';
    if (bodyCell) {
      moveInstrumentation(bodyCell, body);
      body.append(...bodyCell.childNodes);
      // legal links are inline text links, never buttons
      body.querySelectorAll('.button-container, .button-wrapper')
        .forEach((p) => p.classList.remove('button-container', 'button-wrapper'));
      body.querySelectorAll('a.button')
        .forEach((a) => {
          a.classList.remove('button', 'primary', 'secondary', 'accent');
          if (!a.classList.length) a.removeAttribute('class');
        });
    }

    const details = document.createElement('details');
    details.className = 'accordion-legal-item';
    details.open = true;
    moveInstrumentation(row, details);
    details.append(summary, body);
    row.replaceWith(details);
  });
}
