# Persistent Forms

A lightweight, zero-dependency vanilla JavaScript library for frictionless web forms. It automatically handles form persistence (saving to `localStorage` to survive page refreshes), smart URL prefilling, and non-intrusive phone number formatting.

Powered by a premium glassmorphism CSS UI based on the Deskulpt design system.

## Features & Benefits

| Feature | Advantage | Benefit | Plug & Play Instructions |
| :--- | :--- | :--- | :--- |
| **Input Persistence** | Saves form data directly to the user's browser `localStorage` in real-time. | Users never lose their typed information if they accidentally close the tab, refresh the page, or navigate away. | Add `data-persist="true"` to any `<input>`, `<textarea>`, or `<select>`. The script handles the rest automatically. |
| **Protocol Prefilling** | Automatically prepends `https://` to URLs upon input blur, avoiding typing disruptions. | Prevents form submission errors for invalid URLs without annoying the user while they are actively typing. | Use `<input type="url">` and add the `data-persist="true"` attribute. |
| **Smart Phone Formatting** | Detects and formats North American phone numbers to the standard `(555) 555-5555` format. | Ensures clean, standardized data in your backend while providing a polished experience for the user. | Use `<input type="tel">` and add the `data-persist="true"` attribute. |
| **Phone Geolocation** | Integrates with IP geolocation to auto-detect the user's country and updates the country code badge. | Reduces friction by pre-selecting the correct country prefix based on the user's IP address. | Include an element with `id="country-badge"` next to your phone input. It updates automatically. |
| **Premium CSS UI** | Ready-to-use glassmorphism styling based on the premium Deskulpt design system. | Saves hours of styling time and provides a modern, cohesive look and feel out of the box. | Include `styles.css` and use the `.pf-input` class on your form elements. |

*Note on Global Phone Formatting:* If you require accurate detection of local area codes for countries outside of North America, you can adopt [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js). It accurately detects global area codes and instantly swaps the badge to the correct flag. However, note that this library contains a massive global database and will increase load times.

## Usage (Vanilla HTML)

1. Include the `styles.css` in your `<head>`.
2. Add the `data-persist="true"` attribute to any `<input>`, `<textarea>`, or `<select>` you want to bind. Make sure the input has a `name` or `id` attribute.
3. Include `persistent-forms.js` at the bottom of your body.

```html
<link rel="stylesheet" href="styles.css">

<!-- Your form -->
<input type="text" id="first_name" name="first_name" class="pf-input" data-persist="true">
<input type="tel" name="phone" class="pf-input" data-persist="true">
<input type="url" name="website" class="pf-input" data-persist="true">

<!-- Script inclusion -->
<script type="module" src="persistent-forms.js"></script>
```

## Usage (React / Next.js)

You can import the core functions into your React application to handle state and persistence safely without causing Hydration mismatches.

```tsx
import { useEffect, useState } from 'react';
import { formatUrlPrefix, autoCorrectPhone } from './persistent-forms';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', website: '' });

  // 1. Hydrate safely on mount
  useEffect(() => {
    setFormData({
      name: localStorage.getItem('pf_user_name') || '',
      phone: localStorage.getItem('pf_user_phone') || '',
      website: localStorage.getItem('pf_user_website') || ''
    });
  }, []);

  // 2. Handle changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    localStorage.setItem(`pf_user_${name}`, value);
  };

  // 3. Handle formatting on blur
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
    />
  );
}
```

## Custom Initialization

If you don't want to use `data-persist="true"`, you can manually initialize the library by passing a CSS selector:

```javascript
import { initPersistentForms } from './persistent-forms.js';

// Bind to specific classes
initPersistentForms('.my-form-inputs');
```
