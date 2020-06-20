function enterKey (focusEl, buttonEl, callback) {
  const focusEls = focusEl && !focusEl.length ? [focusEl] : focusEl;
  if (focusEls) {
    ['keyup'].forEach(evName => {
      focusEls.forEach(el => {
        if (el) {
          el.addEventListener(evName, (ev) => {
            if (evName === 'keyup') {
              if (ev.key !== 'Enter') return;
            }
            if (!buttonEl.disabled) callback();
          });
        }
      });
    });
  }
  ['click'].forEach(evName => {
    buttonEl.addEventListener(evName, (ev) => {
      callback();
    });
  });
}
