(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Logger = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const Logger = {
    debug: (...args) => {
      if (typeof window !== 'undefined' && window.__DEBUG__ !== false) {
        console.log('[DEBUG]', ...args);
      }
    },
    warn: (...args) => {
      if (typeof window !== 'undefined' && window.__DEBUG__ !== false) {
        console.warn('[WARN]', ...args);
      }
    },
    error: (...args) => {
      if (typeof window !== 'undefined' && window.__DEBUG__ !== false) {
        console.error('[ERROR]', ...args);
      }
    }
  };
  return Logger;
})); 