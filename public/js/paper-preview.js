(() => {
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  let viewer;
  function createViewer() {
    const dialog = document.createElement('dialog');
    dialog.className = 'paper-preview-dialog';
    dialog.setAttribute('aria-labelledby', 'paper-preview-title');
    dialog.innerHTML = '<header class="paper-preview-heading"><h2 id="paper-preview-title"></h2><button type="button" data-close aria-label="문서 미리보기 닫기" autofocus>닫기 ×</button></header><div class="paper-preview-controls" aria-label="문서 확대·축소"><button type="button" data-zoom-out aria-label="문서 축소">−</button><button type="button" data-fit>화면 맞춤</button><button type="button" data-zoom-in aria-label="문서 확대">+</button><output class="paper-preview-scale" aria-label="화면 맞춤 기준 확대 배율" aria-live="polite">100%</output></div><div class="paper-preview-viewport" tabindex="0" aria-label="문서 보기 영역"><div class="paper-preview-stage"><p class="paper-preview-load" role="status">이미지를 불러오는 중…</p><img hidden alt=""></div></div><p class="paper-preview-hint">확대 후 화면을 밀거나 스크롤해 이동할 수 있습니다.</p>';
    document.body.append(dialog);
    const img = dialog.querySelector('img');
    const viewport = dialog.querySelector('.paper-preview-viewport');
    const loading = dialog.querySelector('.paper-preview-load');
    const zoomIn = dialog.querySelector('[data-zoom-in]');
    const zoomOut = dialog.querySelector('[data-zoom-out]');
    let scale = 1, opener, ready = false, bodyOverflow, rootOverflow, pageX, pageY;
    function render() {
      zoomOut.disabled = !ready || scale <= 1;
      zoomIn.disabled = !ready || scale >= 4;
      dialog.querySelector('output').value = Math.round(scale * 100) + '%';
      if (!ready || !dialog.open) return;
      const fit = Math.min((viewport.clientWidth - 32) / img.naturalWidth, (viewport.clientHeight - 32) / img.naturalHeight, 1);
      if (fit <= 0) return;
      img.style.width = Math.floor(img.naturalWidth * fit * scale) + 'px';
      img.style.height = Math.floor(img.naturalHeight * fit * scale) + 'px';
    }
    function zoom(value) {
      scale = Math.max(1, Math.min(4, value));
      render();
      viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
    }
    img.addEventListener('load', () => {
      ready = true;
      img.hidden = false;
      loading.hidden = true;
      render();
      viewport.scrollTo(0, 0);
    });
    img.addEventListener('error', () => {
      ready = false;
      img.hidden = true;
      loading.hidden = false;
      loading.textContent = '이미지를 불러오지 못했습니다. 창을 닫고 다시 시도해 주세요.';
      render();
    });
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-fit]').addEventListener('click', () => zoom(1));
    zoomIn.addEventListener('click', () => zoom(scale + .5));
    zoomOut.addEventListener('click', () => zoom(scale - .5));
    dialog.addEventListener('keydown', event => {
      if (['+', '=', '-', '0'].includes(event.key)) {
        event.preventDefault();
        zoom(event.key === '0' ? 1 : scale + (event.key === '-' ? -.5 : .5));
      }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      if (opener?.isConnected) opener.focus({preventScroll:true});
      window.scrollTo({left:pageX, top:pageY, behavior:'instant'});
    });
    new ResizeObserver(render).observe(viewport);
    return {
      open(link, url, title) {
        opener = link;
        scale = 1;
        ready = false;
        img.hidden = true;
        img.alt = title;
        loading.hidden = false;
        loading.textContent = '이미지를 불러오는 중…';
        dialog.querySelector('h2').textContent = title;
        bodyOverflow = document.body.style.overflow;
        rootOverflow = document.documentElement.style.overflow;
        pageX = window.scrollX;
        pageY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        dialog.showModal();
        render();
        img.src = url.href;
        if (img.complete && img.naturalWidth) {
          ready = true;
          img.hidden = false;
          loading.hidden = true;
          render();
          viewport.scrollTo(0, 0);
        }
      }
    };
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    const section = link?.closest('.manuscript-preview,.sdg-preview,.conference-publication');
    if (!section || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/assets/publications/') || !/\.(png|jpe?g|webp)$/i.test(url.pathname)) return;
    const image = [...section.querySelectorAll('img')].find(img => new URL(img.src, location.href).pathname === url.pathname);
    if (!image) return;
    event.preventDefault();
    viewer ??= createViewer();
    viewer.open(link, url, image.alt || '논문 첫 페이지');
  });
})();
