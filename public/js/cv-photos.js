(() => {
  const previews = [...document.querySelectorAll('.cv-photos')];
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  for (const details of previews) {
    const summary = details.querySelector('summary');
    const closeButton = details.querySelector('.cv-photo-close');
    let pinned = false;
    let timer;
    function close(returnFocus = false) {
      clearTimeout(timer);
      pinned = false;
      details.open = false;
      if (returnFocus) summary.focus();
    }
    closeButton.hidden = false;
    details.addEventListener('pointerenter', event => {
      clearTimeout(timer);
      if (canHover.matches && event.pointerType === 'mouse') details.open = true;
    });
    details.addEventListener('pointerleave', () => {
      if (!canHover.matches || pinned) return;
      timer = setTimeout(() => {
        if (!details.contains(document.activeElement)) close();
      }, 180);
    });
    summary.addEventListener('click', event => {
      event.preventDefault();
      // A click keeps the hovered gallery open; a second click collapses it.
      if (details.open && pinned) close();
      else {
        clearTimeout(timer);
        pinned = true;
        details.open = true;
      }
    });
    closeButton.addEventListener('click', () => close(true));
    details.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!pinned && !details.matches(':hover') && !details.contains(document.activeElement)) close();
      }, 0);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) close(details.contains(document.activeElement));
    });
    document.addEventListener('click', event => {
      if (details.open && !details.contains(event.target)) close();
    });
  }
})();
