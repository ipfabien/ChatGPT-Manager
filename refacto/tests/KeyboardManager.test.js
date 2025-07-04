const KeyboardManager = require('../managers/KeyboardManager');

describe('KeyboardManager', () => {
  let manager;
  let container;
  let elements;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.innerHTML = `
      <div class="tree-node-line" data-id="n1" tabindex="0"></div>
      <div class="tree-node-line" data-id="n2" tabindex="0"></div>
      <div class="tree-node-line" data-id="n3" tabindex="0"></div>
    `;
    document.body.appendChild(container);
    elements = Array.from(container.querySelectorAll('.tree-node-line'));
    manager = new KeyboardManager();
    manager.initializeKeyboardNavigation(container);
  });

  test('selectNode selectionne le bon element', () => {
    manager.selectNode('n2');
    expect(manager.selectedNodeId).toBe('n2');
    expect(elements[1].classList.contains('keyboard-selected')).toBe(true);
  });

  test('clearSelection efface la selection', () => {
    manager.selectNode('n1');
    manager.clearSelection();
    expect(manager.selectedNodeId).toBe(null);
    expect(elements[0].classList.contains('keyboard-selected')).toBe(false);
  });

  test('navigateDown selectionne l\'element suivant', () => {
    manager.selectNode('n1');
    manager.navigateDown();
    expect(manager.selectedNodeId).toBe('n2');
  });

  test('navigateUp selectionne l\'element precedent', () => {
    manager.selectNode('n2');
    manager.navigateUp();
    expect(manager.selectedNodeId).toBe('n1');
  });

  test('activateSelectedNode declenche un clic', () => {
    const spy = jest.fn();
    elements[0].addEventListener('click', spy);
    manager.selectNode('n1');
    manager.activateSelectedNode();
    expect(spy).toHaveBeenCalled();
  });

  test('handleKeyboardNavigation ArrowDown', () => {
    manager.selectNode('n1');
    const event = new window.KeyboardEvent('keydown', { key: 'ArrowDown' });
    container.dispatchEvent(event);
    expect(manager.selectedNodeId).toBe('n2');
  });

  test('handleKeyboardNavigation ArrowUp', () => {
    manager.selectNode('n2');
    const event = new window.KeyboardEvent('keydown', { key: 'ArrowUp' });
    container.dispatchEvent(event);
    expect(manager.selectedNodeId).toBe('n1');
  });

  test('handleKeyboardNavigation Escape', () => {
    manager.selectNode('n1');
    const event = new window.KeyboardEvent('keydown', { key: 'Escape' });
    container.dispatchEvent(event);
    expect(manager.selectedNodeId).toBe(null);
  });
}); 