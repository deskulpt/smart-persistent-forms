<div align="center">
  <h1>✨ Smart Persistent Forms</h1>
  <p><strong>A zero-dependency, plug-and-play Vanilla JS library for frictionless, resilient web forms.</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](#)
  [![Size: Lightweight](https://img.shields.io/badge/Size-Lightweight-brightgreen.svg)](#)
</div>

![Persistent Forms UI](assets/ui-preview.png)

<hr/>

## 🚀 Why Smart Persistent Forms?

Have you ever filled out a long form, accidentally closed the tab, and lost everything? **Smart Persistent Forms** solves this out-of-the-box. 

Sure, your AI might casually generate bare-bones HTML forms, or you could pay a hefty monthly subscription for a SaaS product like Typeform to handle user experience. But with this lightweight library, you get the best of both worlds: your native, custom forms become **self-reliant, incredibly resilient, and 100% free**.

Just drop in the script, add `data-persist="true"` to your inputs, and you instantly get local data persistence, smart URL formatting, and intelligent phone number styling.

## ✨ Features Optimized for CRO (Conversion Rate Optimization)

Every millisecond of friction costs you leads and sales. We built this form engine specifically to eliminate the invisible barriers that cause users to abandon forms.

| Feature | CRO Advantage | Plug & Play Instructions |
| :--- | :--- | :--- |
| **💾 Zero Friction Data Retention** | Drafts save to `localStorage` in real-time. If a user accidentally closes the tab or refreshes, they don't have to start over, preserving hard-earned conversions. | Add `data-persist="true"` to any `<input>`, `<textarea>`, or `<select>`. |
| **⚡️ Lightning Fast Country Selection** | A custom combobox with semantic search. Users type "Uni" and jump straight to the United States. Eliminates the friction of scrolling through 200+ countries. | Included automatically in the country code logic. |
| **📱 Mobile-Optimized Numeric Keypads** | Triggers the large, easy-to-tap numeric dialpad on smartphones automatically, dramatically speeding up data entry for mobile traffic. | Use `<input type="tel" data-persist="true">`. |
| **🌐 Silent Protocol Correction** | Users type `apple.com` and the script asynchronously pings and prepends `https://`. Prevents harsh validation errors from blocking submissions. | Use `<input type="url" data-persist="true">`. |
| **🤝 Cross-Form Synergy** | Fills identical fields across multiple forms automatically. If they gave their email on page 1, page 2 already has it. Accelerates checkout and lead gen. | Handled automatically by the persistent storage keys. |
| **💅 High-Trust Aesthetics** | Ships with a premium, responsive glassmorphism UI. Professional, high-quality design increases perceived trust, a critical psychological factor for conversion. | Include `styles.css` and use the `.pf-input` classes. |

> **Note on Global Phone Formatting:** For accurate detection of local area codes *outside* North America, you can integrate [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js). It provides massive global coverage but comes with an increased bundle size.

---

## 📦 Quick Start (Vanilla HTML)

**1. Include the Styles**  
Drop the beautiful glassmorphism CSS into your `<head>`:
```html
<link rel="stylesheet" href="styles.css">
```

**2. Markup Your Form**  
Add the `data-persist="true"` attribute to any input you want to supercharge. Make sure they have a `name` or `id`!
```html
<form>
  <!-- Basic text input with persistence -->
  <input type="text" name="first_name" class="pf-input" data-persist="true" placeholder="First Name">
  
  <!-- URL input gets auto https:// protocol -->
  <input type="url" name="website" class="pf-input" data-persist="true" placeholder="example.com">
  
  <!-- Phone input gets formatting and geolocation -->
  <div class="pf-phone-wrapper">
    <span id="country-badge">🇺🇸 +1</span>
    <input type="tel" name="phone" class="pf-input" data-persist="true" placeholder="(555) 555-5555">
  </div>
</form>
```

**3. Include the Script**  
Add the script just before your closing `</body>` tag:
```html
<script type="module" src="persistent-forms.js"></script>
```

---

## ⚛️ Usage with React / Next.js

Using React? You can import the core functions directly to handle state safely without causing Hydration mismatches.

```tsx
import { useEffect, useState } from 'react';
import { formatUrlPrefix, autoCorrectPhone } from './persistent-forms';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', website: '' });

  // 1. Hydrate safely on mount (client-side only)
  useEffect(() => {
    setFormData({
      name: localStorage.getItem('pf_user_name') || '',
      phone: localStorage.getItem('pf_user_phone') || '',
      website: localStorage.getItem('pf_user_website') || ''
    });
  }, []);

  // 2. Handle real-time changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    localStorage.setItem(`pf_user_${name}`, value);
  };

  // 3. Handle smart formatting on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'phone') formatted = autoCorrectPhone(value);
    if (name === 'website') formatted = formatUrlPrefix(value);

    if (formatted !== value) {
      setFormData(prev => ({ ...prev, [name]: formatted }));
      localStorage.setItem(`pf_user_${name}`, formatted);
    }
  };

  return (
    <input 
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      onBlur={handleBlur}
      className="pf-input"
    />
  );
}
```

---

## 🛠 Advanced Initialization

Don't want to use data attributes? You can initialize the library manually by passing your own CSS selector:

```javascript
import { initPersistentForms } from './persistent-forms.js';

// Bind persistence to any custom class or element
initPersistentForms('.my-custom-form-class');
```

---

## 🤝 Contributing

We love contributions at www.Deskulpt.ca ! Feel free to open issues or submit pull requests. Let's make web forms frictionless for everyone.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

