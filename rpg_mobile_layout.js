/* Reuse the live event DOM on mobile rather than duplicating event IDs or handlers. */
(() => {
  const init = () => {
    const sidebar = document.getElementById('rpgInfoPanel');
    const stage = document.querySelector('.stage-panel');
    const actions = document.getElementById('characterActions');
    if (!sidebar || !stage || !actions) return;
    const sections = [...sidebar.querySelectorAll('.story-section,.situation-section,.quest-section,.encounter-section')];
    const anchors = sections.map(section => {
      const marker = document.createComment('original event section position');
      section.before(marker);
      return marker;
    });
    const panel = document.createElement('section');
    panel.className = 'mobile-current-events';
    panel.setAttribute('aria-label', 'Current events and opportunities');
    const title = document.createElement('h2');
    title.textContent = '✧ Current events';
    panel.append(title);
    actions.after(panel);
    const mq = window.matchMedia('(max-width:700px)');
    const sync = () => {
      if (mq.matches) sections.forEach(section => panel.append(section));
      else sections.forEach((section, index) => anchors[index].after(section));
      panel.hidden = !mq.matches;
    };
    mq.addEventListener?.('change', sync);
    sync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
