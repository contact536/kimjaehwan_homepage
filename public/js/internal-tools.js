(() => {
  const previews = [...document.querySelectorAll('.internal-tool-screens')];
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const states = new Map();

  function close(details, returnFocus = false) {
    const state = states.get(details);
    clearTimeout(state.timer);
    state.pinned = false;
    details.open = false;
    if (returnFocus) details.querySelector('summary').focus();
  }

  function open(details, pinned = false) {
    for (const other of previews) if (other !== details) close(other);
    const state = states.get(details);
    clearTimeout(state.timer);
    state.pinned = pinned;
    details.open = true;
  }

  for (const details of previews) {
    const state = {pinned: false, timer: null};
    states.set(details, state);
    const summary = details.querySelector('summary');
    const closeButton = details.querySelector('.internal-tool-close');
    closeButton.hidden = false;

    details.addEventListener('pointerenter', event => {
      if (canHover.matches && event.pointerType === 'mouse') open(details, state.pinned);
    });
    details.addEventListener('pointerleave', () => {
      if (!canHover.matches || state.pinned) return;
      state.timer = setTimeout(() => {
        if (!details.contains(document.activeElement)) close(details);
      }, 180);
    });
    summary.addEventListener('click', event => {
      event.preventDefault();
      // A click pins an already-hovered preview; a second click closes it.
      if (details.open && state.pinned) close(details);
      else open(details, true);
    });
    closeButton.addEventListener('click', () => close(details, true));
    details.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!state.pinned && !details.matches(':hover') && !details.contains(document.activeElement)) close(details);
      }, 0);
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    for (const details of previews) {
      if (details.open) close(details, details.contains(document.activeElement));
    }
  });
  // Wait for click: collapsing an inline mobile preview on pointerdown moves
  // the next card before its tap can reach the summary.
  document.addEventListener('click', event => {
    for (const details of previews) if (details.open && !details.contains(event.target)) close(details);
  });
})();
