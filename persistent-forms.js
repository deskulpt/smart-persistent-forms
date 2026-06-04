/**
 * Persistent Forms - Form Input Persistence & Formatting Patterns
 * Automatically caches user inputs, pre-fills website URLs, and formats phone numbers.
 */

const STORAGE_PREFIX = 'pf_user_';

/**
 * Initializes form persistence and formatting on all elements matching the selector.
 * @param {string} selector - CSS selector for inputs to bind to. Default: 'input, textarea, select'
 */
export function initPersistentForms(selector = 'input, textarea, select') {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const inputs = document.querySelectorAll(selector);

  inputs.forEach(input => {
    // 1. Hydrate from localStorage
    const key = input.name || input.id;
    if (!key) return; // Must have a name or id to persist

    const storageKey = `${STORAGE_PREFIX}${key}`;
    const savedValue = localStorage.getItem(storageKey);
    
    if (savedValue !== null && !input.value) {
      input.value = savedValue;
    }

    // 2. Cross-Form Synchronization (Save on input)
    input.addEventListener('input', (e) => {
      localStorage.setItem(storageKey, e.target.value);
    });

    // 3. Formatting & Prefilling on Blur
    input.addEventListener('blur', (e) => {
      let val = e.target.value;
      const type = input.type.toLowerCase();
      const name = key.toLowerCase();

      // Protocol Prefill for URLs/Websites
      if (type === 'url' || name.includes('website') || name.includes('url')) {
        val = formatUrlPrefix(val);
      }

      // Telephone formatting
      if (type === 'tel' || name.includes('phone') || name.includes('mobile') || name.includes('tel')) {
        val = autoCorrectPhone(val);
      }

      // Update input and storage if modified
      if (val !== e.target.value) {
        e.target.value = val;
        localStorage.setItem(storageKey, val);
      }
    });
  });
}

/**
 * Automatically prefixes `https://` to e-commerce and retail website inputs.
 * @param {string} url 
 * @returns {string} Formatted URL
 */
export function formatUrlPrefix(url) {
  if (!url) return url;
  let formatted = url.trim();
  if (formatted.length > 0 && !/^https?:\/\//i.test(formatted)) {
    if (/^[a-zA-Z0-9]/i.test(formatted)) {
      formatted = 'https://' + formatted;
    }
  }
  return formatted;
}

/**
 * Standardize international or standard domestic telephone formats automatically.
 * 10 Digits: (XXX) XXX-XXXX
 * 11 Digits: +X (XXX) XXX-XXXX
 * @param {string} value 
 * @returns {string} Formatted phone number
 */
export function autoCorrectPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value; // Keep original input as fallback if length is atypical
}

// Auto-initialize if running in a standard browser environment and script is loaded normally
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only auto-bind if they have data-persist attribute, otherwise let user call initPersistentForms manually
    initPersistentForms('[data-persist="true"]');
  });
}
