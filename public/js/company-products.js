(() => {
  const buttons = [...document.querySelectorAll('[data-product-filter]')];
  const cards = [...document.querySelectorAll('[data-company-product]')];
  const count = document.querySelector('.company-product-count');
  if (!buttons.length || !cards.length || !count) return;

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const filter = button.dataset.productFilter;
      let visible = 0;

      for (const candidate of buttons) candidate.setAttribute('aria-pressed', String(candidate === button));
      for (const card of cards) {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible += 1;
      }

      count.textContent = `${visible}개 항목을 표시하고 있습니다.`;
    });
  }
})();
