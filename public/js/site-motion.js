(() => {
  const main = document.querySelector('main'), header = document.querySelector('.academic-header');
  if (!main || !header) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map(), seen = new WeakSet();
  let observer, frame = 0, currentLink;
  const progress = document.createElement('div');
  progress.className = 'site-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.append(document.createElement('span'));
  const back = document.createElement('button');
  back.type = 'button'; back.className = 'site-back-top'; back.textContent = '↑';
  back.setAttribute('aria-label', '맨 위로 이동'); back.title = '맨 위로 이동';
  back.tabIndex = -1;
  document.body.append(progress, back);
  const sectionLinks = [...document.querySelectorAll('.research-sidebar nav a[href^="#"]')].map(link => {
    const id = link.getAttribute('href').slice(1);
    return {link, section:document.getElementById(id)};
  }).filter(item => item.section);

  function updateScroll() {
    frame = 0;
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.firstElementChild.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / range))})`;
    header.classList.toggle('is-scrolled', scrollY > 16);
    const visible = scrollY > Math.max(600, innerHeight * .75);
    back.classList.toggle('is-visible', visible); back.tabIndex = visible ? 0 : -1;
    const line = header.getBoundingClientRect().bottom + Math.min(180, innerHeight * .2);
    let active, nearest = -Infinity;
    for (const item of sectionLinks) {
      if (!item.section.getClientRects().length) continue;
      const top = item.section.getBoundingClientRect().top;
      if (top <= line && top > nearest) { active = item; nearest = top; }
    }
    if (active?.link !== currentLink) {
      currentLink?.removeAttribute('aria-current');
      currentLink = active?.link;
      currentLink?.setAttribute('aria-current', 'location');
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  document.addEventListener('site-language-change', schedule);
  document.addEventListener('toggle', schedule, true);
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(main);
  back.addEventListener('click', () => {
    if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
    main.focus({preventScroll:true});
    scrollTo({top:0, behavior:reduced.matches ? 'instant' : 'smooth'});
  });

  function finish(element) {
    animations.get(element)?.cancel();
    animations.delete(element);
    seen.add(element);
    observer?.unobserve(element);
  }
  function finishRelated(target) {
    for (const element of animations.keys()) if (element.contains(target) || target.contains(element)) finish(element);
  }
  function finishAll() {
    observer?.disconnect();
    for (const element of animations.keys()) finish(element);
  }
  function revealHash() {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (!target) return;
    for (const element of main.querySelectorAll('[data-motion-reveal]')) {
      if (element.contains(target) || target.contains(element)) finish(element);
    }
  }
  function observeSections() {
    if (reduced.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
    const selectors = [
      '.hero-content', '.academic-portrait', '.kim-page > .kim-overline', '.kim-page > h1', '.kim-page > .kim-lead',
      'section > header', 'section > h2', '.container > .section-title',
      '.research-topic', '.kim-row', '.sdg-research-card', '.planned-research-card', '.company-press-card', '.company-research-card',
      '.research-entry', '.internal-tool', '.company-service-card', '.company-product-card', '.academic-activity', '.document-card',
      '.journal-manuscript > h3', '.sdg-paper > h3', '.reading-entry > h3', '.book-feature > h3'
    ];
    const selected = new Set();
    for (const candidate of main.querySelectorAll(selectors.join(','))) {
      if (candidate.closest('details,dialog,form,[hidden]')) continue;
      let element = candidate;
      if (element.getBoundingClientRect().height > innerHeight * .9) element = element.querySelector(':scope > header,:scope > h2,:scope > h3');
      if (!element || [...selected].some(parent => parent.contains(element))) continue;
      selected.add(element);
    }
    observer = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        observer.unobserve(element);
        if (seen.has(element)) continue;
        seen.add(element);
        // Native content is always visible; only the entrance itself animates.
        if (reduced.matches || element.contains(document.activeElement) || entry.boundingClientRect.top < header.getBoundingClientRect().bottom) continue;
        const mobile = innerWidth <= 600;
        try {
          const animation = element.animate(
            [{opacity:.12, transform:`translateY(${mobile ? 10 : 18}px)`}, {opacity:1, transform:'translateY(0)'}],
            {duration:mobile ? 420 : 560, delay:Math.min(order++ * 60, 120), easing:'cubic-bezier(.22,.68,.3,1)', fill:'backwards'}
          );
          animations.set(element, animation);
          animation.onfinish = () => { animations.delete(element); animation.cancel(); };
        } catch { /* Unsupported animation must never hide content. */ }
      }
    }, {threshold:.08, rootMargin:'0px 0px -28px 0px'});
    for (const element of selected) {
      element.setAttribute('data-motion-reveal', '');
      if (!seen.has(element)) observer.observe(element);
    }
    revealHash();
  }
  main.addEventListener('focusin', event => finishRelated(event.target));
  main.addEventListener('pointerdown', event => finishRelated(event.target), {passive:true});
  main.addEventListener('toggle', event => finishRelated(event.target), true);
  addEventListener('hashchange', revealHash);
  addEventListener('beforeprint', finishAll);
  addEventListener('afterprint', observeSections);
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', () => { finishAll(); if (!reduced.matches) observeSections(); schedule(); });
  observeSections();
  schedule();
})();
