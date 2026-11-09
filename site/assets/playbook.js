/* SDLC Playbook: shared manifest and helpers.
 * Owned by the lead. Pages load this once, before their own inline script.
 * {{BP}} is replaced with the site base path at build time.
 *
 * Auto-rendered on every page:
 *   [data-pb-loop]   the six-stage loop (SVG), current stage lit, stages clickable
 *   [data-pb-pager]  previous / next page links
 *   [data-pb-crumbs] breadcrumb
 *   .pb-reveal       fades/slides in when scrolled into view (adds .in)
 * Helpers on window.PB:
 *   PB.tabs(root)    role=tablist with role=tab buttons + role=tabpanel panels (arrow keys, Home, End)
 *   PB.stepper(root) [data-pb-steps]: children .pb-step; buttons [data-pb-prev] [data-pb-next] [data-pb-play]
 *                    sets data-step on root and .on on the current step; fires 'pb:step' on root
 *   PB.wait(ms)      promise; resolves at once when reduced motion is on
 *   PB.reduced       true when the user prefers reduced motion
 */
(function () {
  var BP = '{{BP}}';
  var ROOT = BP;
  var PAGES = [
    { slug: '', title: 'Overview', short: 'Overview' },
    { slug: 'plan', title: 'Stage 1: Plan', short: 'Plan', stage: 1, plays: ['Capture as intent.md'] },
    { slug: 'design', title: 'Stage 2: Design', short: 'Design', stage: 2, plays: ['Requirements and design'] },
    { slug: 'build', title: 'Stage 3: Build', short: 'Build', stage: 3, plays: ['Plan mode first', 'CLAUDE.md', 'Skills as institutional knowledge', 'Parallel sessions and subagents'] },
    { slug: 'test', title: 'Stage 4: Test', short: 'Test', stage: 4, plays: ['Give Claude a feedback loop', 'Continuous evals in CI'] },
    { slug: 'deploy', title: 'Stage 5: Deploy', short: 'Deploy', stage: 5, plays: ['AI in the PR review loop', 'Hooks as approval gates', 'CI/CD integration and deployment'] },
    { slug: 'maintain', title: 'Stage 6: Maintain', short: 'Maintain', stage: 6, plays: ['Closing the loop on metrics'] },
    { slug: 'roadmap', title: 'Your transition roadmap', short: 'Roadmap' }
  ];
  var STAGES = PAGES.filter(function (p) { return p.stage; });
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function url(p) { return ROOT + '/' + (p.slug ? p.slug + '/' : ''); }
  function current() {
    var path = location.pathname.replace(/index\.html$/, '');
    var hit = PAGES[0];
    PAGES.forEach(function (p) { if (p.slug && path.indexOf(ROOT + '/' + p.slug + '/') !== -1) hit = p; });
    return hit;
  }
  var cur = current();

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* Six-stage loop */
  function renderLoop(host) {
    var size = 360, c = size / 2, r = 128, ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('class', 'pb-loop-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'The six stages as a loop: plan, design, build, test, deploy, maintain, and back to plan.' + (cur.stage ? ' Current stage: ' + cur.short + '.' : ''));
    var ring = document.createElementNS(ns, 'circle');
    ring.setAttribute('cx', c); ring.setAttribute('cy', c); ring.setAttribute('r', r);
    ring.setAttribute('class', 'pb-loop-ring');
    svg.appendChild(ring);
    var flow = ring.cloneNode(); flow.setAttribute('class', 'pb-loop-flow'); svg.appendChild(flow);
    STAGES.forEach(function (s, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / STAGES.length;
      var x = c + r * Math.cos(a), y = c + r * Math.sin(a);
      var g = document.createElementNS(ns, 'a');
      g.setAttribute('href', url(s));
      g.setAttribute('class', 'pb-loop-node' + (cur.stage === s.stage ? ' on' : ''));
      g.setAttribute('aria-label', s.title);
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 30);
      g.appendChild(dot);
      var n = document.createElementNS(ns, 'text');
      n.setAttribute('x', x); n.setAttribute('y', y - 4); n.setAttribute('class', 'n'); n.textContent = s.stage;
      var t = document.createElementNS(ns, 'text');
      t.setAttribute('x', x); t.setAttribute('y', y + 12); t.setAttribute('class', 't'); t.textContent = s.short;
      g.appendChild(n); g.appendChild(t);
      g.style.setProperty('--d', (i * 90) + 'ms');
      svg.appendChild(g);
    });
    var mid = document.createElementNS(ns, 'text');
    mid.setAttribute('x', c); mid.setAttribute('y', c - 6); mid.setAttribute('class', 'pb-loop-mid');
    mid.textContent = 'AI-native';
    var mid2 = mid.cloneNode(); mid2.setAttribute('y', c + 16); mid2.textContent = 'SDLC';
    svg.appendChild(mid); svg.appendChild(mid2);
    host.appendChild(svg);
  }

  function renderPager(host) {
    var i = PAGES.indexOf(cur), prev = PAGES[i - 1], next = PAGES[i + 1];
    host.className += ' pb-pager';
    host.innerHTML = (prev ? '<a class="prev" href="' + url(prev) + '"><small>Previous</small><b>' + prev.title + '</b></a>' : '<span></span>') +
      (next ? '<a class="next" href="' + url(next) + '"><small>Next</small><b>' + next.title + '</b></a>' : '<span></span>');
  }

  function renderCrumbs(host) {
    host.className += ' pb-crumbs';
    host.innerHTML = '<a href="https://www.bitovi.com">Bitovi</a><span aria-hidden="true">/</span><a href="' + ROOT + '/">SDLC Playbook</a>' +
      (cur.slug ? '<span aria-hidden="true">/</span><b>' + cur.title + '</b>' : '');
  }

  function renderStageNav(host) {
    host.className += ' pb-stagenav';
    host.setAttribute('aria-label', 'Playbook pages');
    host.innerHTML = PAGES.map(function (p) {
      return '<a href="' + url(p) + '"' + (p === cur ? ' aria-current="page"' : '') + '>' + (p.stage ? '<i>' + p.stage + '</i>' : '') + p.short + '</a>';
    }).join('');
  }

  function reveal() {
    var items = [].slice.call(document.querySelectorAll('.pb-reveal'));
    if (reduced || !('IntersectionObserver' in window)) { items.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    items.forEach(function (e) { io.observe(e); });
  }

  function tabs(root) {
    var list = root.querySelector('[role=tablist]') || root;
    var ts = [].slice.call(list.querySelectorAll('[role=tab]'));
    function pick(i, focus) {
      ts.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
      if (focus) ts[i].focus();
      root.dispatchEvent(new CustomEvent('pb:tab', { detail: i }));
    }
    ts.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        var n = ts.length, k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); pick((i + 1) % n, true); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); pick((i + n - 1) % n, true); }
        else if (k === 'Home') { e.preventDefault(); pick(0, true); }
        else if (k === 'End') { e.preventDefault(); pick(n - 1, true); }
      });
    });
    return { pick: pick };
  }

  function stepper(root) {
    var steps = [].slice.call(root.querySelectorAll('.pb-step'));
    var i = 0, timer = null;
    var play = root.querySelector('[data-pb-play]');
    var status = root.querySelector('[data-pb-status]');
    function go(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, j) { s.classList.toggle('on', j === i); s.classList.toggle('done', j < i); });
      root.setAttribute('data-step', i);
      if (status) status.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      var pv = root.querySelector('[data-pb-prev]'), nx = root.querySelector('[data-pb-next]');
      if (pv) pv.disabled = i === 0;
      if (nx) nx.disabled = i === steps.length - 1;
      root.dispatchEvent(new CustomEvent('pb:step', { detail: i }));
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } if (play) play.textContent = '▶ Play'; }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-pb-prev')) { stop(); go(i - 1); }
      else if (b.hasAttribute('data-pb-next')) { stop(); go(i + 1); }
      else if (b.hasAttribute('data-pb-play')) {
        if (timer) { stop(); return; }
        if (i === steps.length - 1) go(0);
        play.textContent = '❚❚ Pause';
        timer = setInterval(function () { if (i >= steps.length - 1) stop(); else go(i + 1); }, reduced ? 2600 : 2000);
      } else if (b.hasAttribute('data-pb-goto')) { stop(); go(+b.getAttribute('data-pb-goto')); }
    });
    go(0);
    return { go: go, stop: stop };
  }

  window.PB = {
    pages: PAGES, stages: STAGES, current: cur, url: url, reduced: reduced,
    tabs: tabs, stepper: stepper,
    wait: function (ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); }
  };

  function boot() {
    [].forEach.call(document.querySelectorAll('[data-pb-loop]'), renderLoop);
    [].forEach.call(document.querySelectorAll('[data-pb-pager]'), renderPager);
    [].forEach.call(document.querySelectorAll('[data-pb-crumbs]'), renderCrumbs);
    [].forEach.call(document.querySelectorAll('[data-pb-stagenav]'), renderStageNav);
    [].forEach.call(document.querySelectorAll('[data-pb-tabs]'), tabs);
    [].forEach.call(document.querySelectorAll('[data-pb-steps]'), stepper);
    reveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
