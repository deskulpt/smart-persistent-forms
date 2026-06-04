# Persistent Forms

A lightweight, zero-dependency vanilla JavaScript library for frictionless web forms. It automatically handles form persistence (saving to `localStorage` to survive page refreshes), smart URL prefilling, and non-intrusive phone number formatting.

Powered by a premium glassmorphism CSS UI based on the Deskulpt design system.

## Features

1. **Input Persistence**: Never lose user input to a page refresh again. Inputs are synced to `localStorage` and automatically hydrated when the user returns.
2. **Protocol Prefilling**: When users type a website domain (e.g. `example.com`), it is automatically prefixed with `https://` on blur, preventing invalid URL submission errors without annoying the user while typing.
3. **Smart Phone Formatting**: Automatically detects North American area codes, strips country codes if provided in the dropdown, and formats the local number (e.g. `(555) 555-5555`) upon input blur.
   - **The Heavy Option (Global Detection):** If you require accurate detection of local area codes for countries outside of North America, you can adopt [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js). It will accurately detect global area codes (like knowing `647` is Canada) and instantly swap the badge to the correct flag. However, note that this library contains a massive global database and will cause your script to take slightly longer to load.
4. **Premium CSS UI**: A beautiful, dark-mode glassmorphism design system for modern web apps included out-of-the-box.

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
