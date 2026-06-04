/**
 * Persistent Forms - Form Input Persistence & Formatting Patterns
 * Automatically caches user inputs, pre-fills website URLs, and formats phone numbers.
 */

const STORAGE_PREFIX = 'pf_user_';
const CONSENT_KEY = 'pf_ip_consent';

/**
 * Initializes form persistence and formatting on all elements matching the selector.
 * @param {string} selector - CSS selector for inputs to bind to. Default: 'input, textarea, select'
 */
function initPersistentForms(selector = 'input, textarea, select') {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const inputs = document.querySelectorAll(selector);

  // Initialize advanced features
  populateCountryDropdown();
  setupCookieConsent();
  setupAntiSpam();
  setupMessageGenerator();
  setupEmailAutocomplete();

  // If already consented, run location detection immediately
  if (localStorage.getItem(CONSENT_KEY) === 'true') {
    autoDetectLocation();
  }

  inputs.forEach(input => {
    // 1. Hydrate from localStorage
    const key = input.name || input.id;
    if (!key) return; // Must have a name or id to persist

    // Don't persist honeypot or captcha
    if (key === 'website_url_hp' || key === 'captcha') return;

    const storageKey = `${STORAGE_PREFIX}${key}`;
    const savedValue = localStorage.getItem(storageKey);
    
    if (savedValue !== null) {
      if (input.type === 'checkbox') {
        input.checked = savedValue === 'true';
      } else if (!input.value) {
        input.value = savedValue;
      }
    }

    // 2. Cross-Form Synchronization (Save on input/change)
    const saveValue = (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked.toString() : e.target.value;
      localStorage.setItem(storageKey, val);
    };
    input.addEventListener('input', saveValue);
    input.addEventListener('change', saveValue);

    // 3. Formatting & Prefilling on Blur
    input.addEventListener('blur', (e) => {
      let val = e.target.value;
      const type = input.type.toLowerCase();
      const name = key.toLowerCase();

      // Protocol Prefill for URLs/Websites
      if (type === 'url' || name.includes('website') || name.includes('url')) {
        // Show a loading visual while checking
        const originalBg = e.target.style.backgroundColor;
        e.target.style.opacity = '0.7';
        
        formatUrlPrefixAsync(val).then(resolvedUrl => {
           e.target.style.opacity = '1';
           if (e.target.value !== resolvedUrl) {
             e.target.value = resolvedUrl;
             localStorage.setItem(storageKey, resolvedUrl);
             e.target.dispatchEvent(new Event('input', { bubbles: true }));
           }
        });
      }

      // Telephone formatting
      if (type === 'tel' || name.includes('phone') || name.includes('mobile') || name.includes('tel')) {
        val = formatPhoneAndSyncDropdown(val);
      }

      // Update input and storage if modified
      if (val !== e.target.value) {
        e.target.value = val;
        localStorage.setItem(storageKey, val);
      }
    });
  });
}

function setupCookieConsent() {
  const banner = document.getElementById('pf-cookie-banner');
  if (!banner) return;
  
  if (!localStorage.getItem(CONSENT_KEY)) {
    banner.style.display = 'flex';
  }

  const acceptBtn = document.getElementById('pf-accept-cookies');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'true');
      banner.style.display = 'none';
      autoDetectLocation();
    });
  }

  const declineBtn = document.getElementById('pf-decline-cookies');
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'false');
      banner.style.display = 'none';
    });
  }
}

let targetRotation = 0;

function setupAntiSpam() {
  const captchaSlider = document.getElementById('captcha-slider');
  const captchaImage = document.getElementById('captcha-image');
  const captchaValid = document.getElementById('captcha-valid');

  if (captchaSlider && captchaImage && captchaValid) {
    // Generate a random initial rotation between 60 and 300 degrees
    targetRotation = Math.floor(Math.random() * 240) + 60;
    captchaImage.style.transform = `rotate(${targetRotation}deg)`;
    
    captchaSlider.addEventListener('input', (e) => {
      const userRotation = parseInt(e.target.value);
      const totalRotation = targetRotation + userRotation;
      captchaImage.style.transform = `rotate(${totalRotation}deg)`;
      
      // If total rotation is close to a multiple of 360, it's upright
      const normalized = totalRotation % 360;
      if (normalized < 15 || normalized > 345) {
        captchaValid.value = 'true';
        captchaImage.parentElement.style.borderColor = '#10b981'; // Green border
      } else {
        captchaValid.value = 'false';
        captchaImage.parentElement.style.borderColor = 'var(--pf-surface-border)'; 
      }
    });
  }

  const form = document.getElementById('pf_main_form') || document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      // Honeypot check
      const honeypot = document.getElementById('website_url_hp');
      if (honeypot && honeypot.value) {
        e.preventDefault();
        alert('Bot detected!');
        return;
      }

      // Captcha check
      const valid = document.getElementById('captcha-valid');
      if (valid && valid.value !== 'true') {
        e.preventDefault();
        alert('Please rotate the image to the upright position to verify you are human.');
        return;
      }

      // If checks pass, let form submit (or alert for demo)
      e.preventDefault();
      alert('Form submitted successfully!');
    });
  }
}

const AUTO_MESSAGES = [
  "Hello. I am interested in your services, please reach out.",
  "Hi, this is interesting, please contact me back.",
  "Greetings! I would like to request more information about what you offer.",
  "Hello, could we schedule a brief call to discuss this further?",
  "Hi there, I have a few questions and would love to connect."
];

let currentMsgIndex = -1;

function setupMessageGenerator() {
  const msgInput = document.getElementById('message');
  const prevBtn = document.getElementById('msg-prev');
  const nextBtn = document.getElementById('msg-next');
  
  if (!msgInput || !prevBtn || !nextBtn) return;
  
  const cycleMessage = (direction) => {
    if (direction === 'next') {
      currentMsgIndex = (currentMsgIndex + 1) % AUTO_MESSAGES.length;
    } else {
      currentMsgIndex = (currentMsgIndex - 1 + AUTO_MESSAGES.length) % AUTO_MESSAGES.length;
    }
    msgInput.value = AUTO_MESSAGES[currentMsgIndex];
    msgInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger persistence
  };
  
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cycleMessage('prev');
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cycleMessage('next');
  });
}

const COMMON_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "protonmail.com"
];

function setupEmailAutocomplete() {
  const emailInput = document.getElementById('email');
  const suggestionInput = document.getElementById('email-suggestion');
  if (!emailInput || !suggestionInput) return;

  emailInput.addEventListener('input', (e) => {
    const val = e.target.value;
    suggestionInput.value = '';
    
    if (!val || val.includes(' ')) return;
    
    if (val.includes('@')) {
      const parts = val.split('@');
      const prefix = parts[0];
      const domainPart = parts[1];
      
      // If typing domain after @
      if (domainPart.length > 0) {
        // Try to find a matching common domain
        const match = COMMON_DOMAINS.find(d => d.startsWith(domainPart.toLowerCase()));
        if (match) {
          // Check case so it aligns with what the user already typed
          const userTypedDomain = val.substring(val.indexOf('@') + 1);
          const completion = match.substring(userTypedDomain.length);
          suggestionInput.value = val + completion;
          return;
        }
      }
      
      // If there's a dot but no match (business email), suggest .com
      if (domainPart.includes('.')) {
        const domainSplit = domainPart.split('.');
        const tld = domainSplit[domainSplit.length - 1];
        if (tld.length > 0 && "com".startsWith(tld.toLowerCase()) && tld.toLowerCase() !== 'com') {
           const completion = "com".substring(tld.length);
           suggestionInput.value = val + completion;
           return;
        }
      }
    }
  });

  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (suggestionInput.value && suggestionInput.value.toLowerCase().startsWith(emailInput.value.toLowerCase())) {
        e.preventDefault();
        emailInput.value = suggestionInput.value;
        suggestionInput.value = '';
        emailInput.dispatchEvent(new Event('input', { bubbles: true })); // trigger persistence
      }
    }
  });
}

/**
 * Fetch IP location to auto-detect City and Country if empty
 */
async function autoDetectLocation() {
  try {
    const cityInput = document.getElementById('city') || document.querySelector('input[name="city"]');
    const countryInput = document.getElementById('country') || document.querySelector('input[name="country"]');
    
    // Fetch if either is empty
    if ((cityInput && !cityInput.value) || (countryInput && !countryInput.value)) {
      const res = await fetch('http://ip-api.com/json/');
      if (res.ok) {
        const data = await res.json();
        if (cityInput && !cityInput.value && data.city) {
          cityInput.value = data.city;
          cityInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (countryInput && !countryInput.value && data.country) {
          countryInput.value = data.country;
          countryInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  } catch (e) {
    console.error('IP location detection failed', e);
  }
}

/**
 * Fetch country codes and populate the dropdown badge
 */
async function populateCountryDropdown() {
  const dropdown = document.getElementById('country_code');
  if (!dropdown) return;
  
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2');
    const countries = await res.json();
    
    const options = [];
    countries.forEach(c => {
      if (!c.idd || !c.idd.root) return;
      const code = c.idd.suffixes && c.idd.suffixes.length === 1 ? c.idd.root + c.idd.suffixes[0] : c.idd.root;
      options.push({
        name: c.name.common,
        flag: c.flag || '🌍',
        code: code,
        cca2: c.cca2
      });
    });
    
    options.sort((a, b) => a.name.localeCompare(b.name));
    
    const lastUsedCca2 = localStorage.getItem('pf_last_country_cca2');
    let lastUsedOpt = lastUsedCca2 ? options.find(o => o.cca2 === lastUsedCca2) : null;
    
    dropdown.innerHTML = '';
    
    if (lastUsedOpt) {
      const opt = new Option(`${lastUsedOpt.flag} ${lastUsedOpt.code}`, lastUsedOpt.code);
      opt.dataset.cca2 = lastUsedOpt.cca2;
      opt.dataset.name = lastUsedOpt.name;
      dropdown.add(opt);
      dropdown.add(new Option('---', '', false, false));
      dropdown.options[1].disabled = true;
    } else {
      // Default to +1 if no last used
      const usOpt = options.find(o => o.cca2 === 'US');
      if (usOpt) {
         const opt = new Option(`${usOpt.flag} ${usOpt.code}`, usOpt.code);
         opt.dataset.cca2 = usOpt.cca2;
         opt.dataset.name = usOpt.name;
         dropdown.add(opt);
         dropdown.add(new Option('---', '', false, false));
         dropdown.options[1].disabled = true;
      }
    }
    
    options.forEach(o => {
      const opt = new Option(`${o.flag} ${o.code} (${o.name})`, o.code);
      opt.dataset.cca2 = o.cca2;
      opt.dataset.name = o.name;
      dropdown.add(opt);
    });

    dropdown.addEventListener('change', (e) => {
      const selectedOpt = dropdown.options[dropdown.selectedIndex];
      if (selectedOpt && selectedOpt.dataset.cca2) {
         localStorage.setItem('pf_last_country_cca2', selectedOpt.dataset.cca2);
         // Update Country field value dynamically
         const countryInput = document.getElementById('country') || document.querySelector('input[name="country"]');
         if (countryInput) {
            countryInput.value = selectedOpt.dataset.name;
            countryInput.dispatchEvent(new Event('input', { bubbles: true }));
         }
         
         // Dynamically shrink/grow the dropdown to match the selected text length
         const textLen = selectedOpt.text.length;
         dropdown.style.width = `calc(${textLen}ch + 1.25rem)`;
      }
    });

    // Trigger initial resize
    dropdown.dispatchEvent(new Event('change', { bubbles: true }));

  } catch (e) {
    console.error('Failed to populate dropdown', e);
  }
}

/**
 * Automatically prefixes `https://` or `http://` by pinging the website to see what resolves.
 * @param {string} url 
 * @returns {Promise<string>} Formatted URL
 */
async function formatUrlPrefixAsync(url) {
  if (!url) return url;
  let formatted = url.trim();
  
  // If it's empty or doesn't look like a domain at all, return it
  if (formatted.length === 0 || !/[a-zA-Z0-9]/.test(formatted)) {
    return formatted;
  }
  
  // Extract core domain
  let domain = formatted.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  if (!domain) return formatted;
  
  const checkUrl = async (testUrl) => {
    try {
      // no-cors prevents CORS blocking and throws a TypeError only if network/DNS/SSL fails
      await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      return true;
    } catch (e) {
      return false;
    }
  };

  // Ping in order of preference
  if (await checkUrl(`https://${domain}`)) {
    return `https://${domain}`;
  } else if (await checkUrl(`https://www.${domain}`)) {
    return `https://www.${domain}`;
  } else if (await checkUrl(`http://${domain}`)) {
    return `http://${domain}`;
  } else if (await checkUrl(`http://www.${domain}`)) {
    return `http://www.${domain}`;
  }
  
  // Fallback if domain is unreachable or invalid
  return `https://${domain}`;
}

const CANADIAN_AREA_CODES = ["204", "226", "236", "249", "250", "263", "289", "306", "343", "365", "367", "368", "403", "416", "418", "431", "437", "438", "450", "474", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "683", "705", "709", "742", "778", "780", "807", "819", "825", "867", "873", "902", "905", "942"];

/**
 * Standardize telephone formats, detect/strip country prefixes, and guess NA area codes.
 * @param {string} value 
 * @returns {string} Formatted local phone number
 */
function formatPhoneAndSyncDropdown(value) {
  let digits = value.replace(/\D/g, '');
  const dropdown = document.getElementById('country_code');
  if (!dropdown) return value;

  // 1. If user typed a '+' prefix, detect country, update dropdown, and STRIP the prefix from `digits`
  if (value.trim().startsWith('+') && digits.length > 0) {
    const possibleCodes = [digits.substring(0, 3), digits.substring(0, 2), digits.substring(0, 1)].filter(Boolean);
    for (let code of possibleCodes) {
      let matched = false;
      for (let i = 0; i < dropdown.options.length; i++) {
        if (dropdown.options[i].value === `+${code}` && dropdown.options[i].dataset.cca2) {
          dropdown.selectedIndex = i;
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));
          matched = true;
          break;
        }
      }
      if (matched) {
        digits = digits.substring(code.length); // Strip country code
        break;
      }
    }
  } 
  // 2. Or, if no '+', check if it's 10 digits or 11 digits starting with 1
  else {
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.substring(1); // Strip the '1' country code
    }

    if (digits.length === 10) {
      const areaCode = digits.substring(0, 3);
      const isCanada = CANADIAN_AREA_CODES.includes(areaCode);
      const targetCca2 = isCanada ? 'CA' : 'US';
      
      const currentOpt = dropdown.options[dropdown.selectedIndex];
      if (!currentOpt || currentOpt.dataset.cca2 !== targetCca2) {
        for (let i = 0; i < dropdown.options.length; i++) {
          if (dropdown.options[i].dataset.cca2 === targetCca2) {
            dropdown.selectedIndex = i;
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }
    }
  }

  // Determine if the selected country uses NANP (North American Numbering Plan)
  const isNanp = dropdown.options[dropdown.selectedIndex]?.value === '+1';

  // 3. Format the remaining local digits
  if (isNanp && digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 0) {
    // Generic spaced format for international (e.g. 7911 123 456)
    const match = digits.match(/^(\d{3,4})(\d{3,4})(\d{3,4})?$/);
    if (match) {
      return match.slice(1).filter(Boolean).join(' ');
    }
    return digits; // Fallback
  }

  return value;
}

// Auto-initialize if running in a standard browser environment and script is loaded normally
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only auto-bind if they have data-persist attribute, otherwise let user call initPersistentForms manually
    initPersistentForms('[data-persist="true"]');
  });
}
