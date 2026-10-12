(function () {
  'use strict';

  function normalize(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function titleFor(el) {
    if (!el) return 'Page section';
    if (el.matches('h1,h2,h3,h4')) return normalize(el.textContent) || 'Page section';
    var heading = el.querySelector && el.querySelector('h2,h3,h4,strong');
    if (heading) return normalize(heading.textContent) || 'Page section';
    var label = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('data-search-title'));
    return normalize(label) || 'Page section';
  }

  function textFor(el) {
    return normalize(el && el.textContent);
  }

  function makeSnippet(text, query) {
    var clean = normalize(text);
    var lower = clean.toLowerCase();
    var q = query.toLowerCase();
    var at = lower.indexOf(q);
    if (at < 0) return clean.slice(0, 150) + (clean.length > 150 ? '…' : '');
    var start = Math.max(0, at - 62);
    var end = Math.min(clean.length, at + q.length + 92);
    var snippet = clean.slice(start, end);
    return (start > 0 ? '…' : '') + snippet + (end < clean.length ? '…' : '');
  }

  function buildIndex(main) {
    var entries = [];
    var seen = new Set();
    var cards = main.querySelectorAll('article, details, [data-page-search-item]');
    cards.forEach(function (el) {
      if (el.closest('[data-page-search]')) return;
      var title = titleFor(el);
      var text = textFor(el);
      if (!text || text.length < 20) return;
      var key = title + '|' + text.slice(0, 120);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ el: el, title: title, text: text });
    });

    main.querySelectorAll('h2,h3').forEach(function (heading) {
      if (heading.closest('article,details,[data-page-search]')) return;
      var context = heading.closest('section') || heading.parentElement || heading;
      var title = titleFor(heading);
      var text = textFor(context);
      if (!text || text.length < 12) return;
      var key = title + '|' + text.slice(0, 120);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ el: heading, title: title, text: text });
    });
    return entries;
  }

  function initSearch(root, index) {
    var input = root.querySelector('[data-page-search-input]');
    var clear = root.querySelector('[data-page-search-clear]');
    var results = root.querySelector('[data-page-search-results]');
    var status = root.querySelector('[data-page-search-status]');
    if (!input || !results || !status) return;

    function closeResults() {
      results.hidden = true;
      results.replaceChildren();
      status.textContent = '';
      root.classList.remove('has-results');
    }

    function run() {
      var query = normalize(input.value);
      if (clear) clear.hidden = !query;
      if (query.length < 2) {
        closeResults();
        return;
      }
      var q = query.toLowerCase();
      var words = q.split(' ').filter(Boolean);
      var matches = index.filter(function (entry) {
        var hay = (entry.title + ' ' + entry.text).toLowerCase();
        return words.every(function (word) { return hay.indexOf(word) !== -1; });
      }).slice(0, 18);

      results.replaceChildren();
      root.classList.add('has-results');
      results.hidden = false;
      status.textContent = matches.length ? (matches.length + (matches.length === 1 ? ' match' : ' matches') + ' shown') : 'No matches on this page';

      if (!matches.length) {
        var empty = document.createElement('p');
        empty.className = 'page-search-empty';
        empty.textContent = 'No page matches found. Try a shorter or different term.';
        results.appendChild(empty);
        return;
      }

      matches.forEach(function (entry) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'page-search-result';
        var strong = document.createElement('strong');
        strong.textContent = entry.title;
        var small = document.createElement('span');
        small.textContent = makeSnippet(entry.text, query);
        button.append(strong, small);
        button.addEventListener('click', function () {
          var node=entry.el;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
          entry.el.querySelector(':scope > .container > details.gravity-more')?.setAttribute('open','');
          entry.el.style.scrollMarginTop='var(--gravity-anchor-offset,100px)';
          entry.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          entry.el.classList.add('page-search-hit');
          window.setTimeout(function () { entry.el.classList.remove('page-search-hit'); }, 2200);
          results.hidden = true;
          root.classList.remove('has-results');
        });
        results.appendChild(button);
      });
    }

    input.addEventListener('input', run);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        input.value = '';
        if (clear) clear.hidden = true;
        closeResults();
      }
    });
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        clear.hidden = true;
        closeResults();
        input.focus();
      });
    }
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) {
        results.hidden = true;
        root.classList.remove('has-results');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var main = document.querySelector('main');
    if (!main) return;
    var roots = document.querySelectorAll('[data-page-search]');
    if (!roots.length) return;
    var index = buildIndex(main);
    roots.forEach(function (root) { initSearch(root, index); });
  });
})();
