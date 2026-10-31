(() => {
  const key = 'kimjaehwan-language';
  const controls = [...document.querySelectorAll('[data-site-language]')];
  if (!controls.length) return;
  const textSources = new WeakMap(), attributeSources = new WeakMap(), linkSources = new WeakMap();
  const attributes = ['alt', 'title', 'aria-label', 'placeholder', 'data-keywords', 'data-question'];
  let language = 'ko', dictionary, loading, request = 0, observer;
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  const chosen = value => value === 'en' ? 'en' : 'ko';
  function translate(value) {
    if (language !== 'en' || !value) return value;
    const clean = normalize(value);
    const translated = dictionary?.[clean];
    if (translated) return value.replace(clean === value ? value : value.trim(), translated);
    const count = clean.match(/^(\d+)개 바로가기$/);
    if (count) return count[1] + ' shortcuts';
    const products = clean.match(/^(\d+)개 항목을 표시하고 있습니다\.$/);
    if (products) return 'Showing ' + products[1] + ' items.';
    return value;
  }
  function localizeUrl(value) {
    if (!value || value.startsWith('#')) return value;
    const url = new URL(value, location.href);
    if (url.origin !== location.origin || !(url.pathname === '/' || /^\/pages\/.*\.html$/.test(url.pathname) || url.pathname === '/index.html')) return value;
    if (language === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    return url.pathname + url.search + url.hash;
  }
  function translatedSource(current, record) {
    return record && current === record.output ? record.source : current;
  }
  function apply(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,[translate="no"],textarea')) continue;
      const source = translatedSource(node.nodeValue, textSources.get(node));
      const output = translate(source);
      textSources.set(node, {source, output});
      if (node.nodeValue !== output) node.nodeValue = output;
    }
    for (const element of root.querySelectorAll('*')) {
      if (element.closest('[translate="no"],script,style')) continue;
      const map = attributeSources.get(element) || new Map();
      const names = element.tagName === 'META' && (element.name === 'description' || element.getAttribute('property')?.startsWith('og:')) ? [...attributes, 'content'] : attributes;
      for (const name of names) {
        if (!element.hasAttribute(name)) continue;
        const source = translatedSource(element.getAttribute(name), map.get(name));
        const output = translate(source);
        map.set(name, {source, output});
        if (element.getAttribute(name) !== output) element.setAttribute(name, output);
      }
      attributeSources.set(element, map);
      if (element.matches('a[href]:not([download])')) {
        const current = element.getAttribute('href');
        const source = translatedSource(current, linkSources.get(element));
        const output = localizeUrl(source);
        linkSources.set(element, {source, output});
        if (current !== output) element.setAttribute('href', output);
      }
    }
  }
  function render() {
    observer?.disconnect();
    apply(document.documentElement);
    document.documentElement.lang = language;
    updateHeaderHeight();
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.siteLanguage === language)));
    observer?.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:[...attributes, 'content', 'href']});
  }
  function updateHeaderHeight() {
    const header = document.querySelector('.academic-header');
    if (header) document.documentElement.style.setProperty('--site-header-height', header.offsetHeight + 'px');
  }
  function notice(message) {
    document.querySelector('.language-notice')?.remove();
    const element = document.createElement('p');
    element.className = 'language-notice';
    element.role = 'status';
    element.textContent = message;
    document.body.append(element);
    setTimeout(() => element.remove(), 6000);
  }
  async function select(next, {save = false, updateUrl = false} = {}) {
    const currentRequest = ++request;
    if (next === 'en' && !dictionary) {
      try {
        loading ||= fetch('/locales/en.json').then(response => {if (!response.ok) throw Error('Translation unavailable'); return response.json();});
        dictionary = await loading;
      } catch {
        loading = null;
        if (currentRequest === request) notice('English could not be loaded. Please try again. / 영어를 불러오지 못했습니다. 다시 시도해 주세요.');
        return;
      }
    }
    if (currentRequest !== request) return;
    const headerBottom = document.querySelector('.academic-header')?.getBoundingClientRect().bottom || 0;
    const readingElement = updateUrl && scrollY > 0 ? document.elementFromPoint(innerWidth / 2, headerBottom + 24)?.closest('p,h1,h2,h3,article,section,figure') : null;
    const readingOffset = readingElement ? readingElement.getBoundingClientRect().top - headerBottom : 0;
    language = chosen(next);
    if (save) {try {localStorage.setItem(key, language);} catch { /* The URL still preserves the selection. */ }}
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.pushState(null, '', url.pathname + url.search + url.hash);
    }
    render();
    if (readingElement) {
      const newHeaderBottom = document.querySelector('.academic-header')?.getBoundingClientRect().bottom || 0;
      scrollBy({top:readingElement.getBoundingClientRect().top - newHeaderBottom - readingOffset, behavior:'instant'});
    }
    document.dispatchEvent(new CustomEvent('site-language-change', {detail:{language}}));
  }
  observer = new MutationObserver(() => render());
  const header = document.querySelector('.academic-header');
  if (header && window.ResizeObserver) new ResizeObserver(updateHeaderHeight).observe(header);
  controls.forEach(button => button.addEventListener('click', () => select(button.dataset.siteLanguage, {save:true, updateUrl:true})));
  addEventListener('popstate', () => select(chosen(new URLSearchParams(location.search).get('lang'))));
  let preference = 'ko';
  try {preference = chosen(localStorage.getItem(key));} catch { /* Private browsing may disable storage. */ }
  const query = new URLSearchParams(location.search).get('lang');
  const initial = query === 'ko' || query === 'en' ? query : preference;
  window.siteLanguage = {get current() {return language;}, t:translate, url:localizeUrl};
  select(initial).then(() => {
    if (language === 'en' && query !== 'en') {
      const url = new URL(location.href);url.searchParams.set('lang', 'en');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    if (location.hash) {
      let anchor;
      try {anchor = document.getElementById(decodeURIComponent(location.hash.slice(1)));} catch { /* Invalid fragment encoding. */ }
      if (anchor) requestAnimationFrame(() => anchor.scrollIntoView({behavior:'instant'}));
    }
  });
})();
