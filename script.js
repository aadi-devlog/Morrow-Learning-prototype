(() => {
      document.querySelectorAll('img[data-fallback]').forEach((image) => {
        const useFallback = () => {
          if (!image.dataset.fallbackUsed) {
            image.dataset.fallbackUsed = 'true';
            image.src = image.dataset.fallback;
          }
        };
        image.addEventListener('error', useFallback);
        if (image.complete && image.naturalWidth === 0) useFallback();
      });

      const menuButton = document.querySelector('.menu-toggle');
      const nav = document.getElementById('primary-navigation');
      const closeMenu = () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
      };
      menuButton.addEventListener('click', () => {
        const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
        nav.classList.toggle('open', !isOpen);
      });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('open')) {
          closeMenu();
          menuButton.focus();
        }
      });
      document.getElementById('year').textContent = new Date().getFullYear();

      // Analytics-ready hooks: emit interaction names only; never include form PII.
      document.querySelectorAll('[data-track]').forEach((element) => {
        element.addEventListener('click', () => {
          const detail = { name: element.dataset.track, target: element.getAttribute('href') || '' };
          window.dispatchEvent(new CustomEvent('morrow:cta', { detail }));
          if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'morrow_cta_click', ...detail });
        });
      });

      const programmeSelect = document.getElementById('programme');
      document.querySelectorAll('[data-program]').forEach((link) => {
        link.addEventListener('click', () => {
          programmeSelect.value = link.dataset.program;
        });
      });

      const form = document.getElementById('enquiry-form');
      const success = document.getElementById('form-success');
      const fields = [
        { input: document.getElementById('full-name'), error: document.getElementById('name-error'), validate: (el) => el.value.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).' },
        { input: document.getElementById('email'), error: document.getElementById('email-error'), validate: (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) ? '' : 'Enter a valid email address.' },
        { input: programmeSelect, error: document.getElementById('programme-error'), validate: (el) => el.value ? '' : 'Choose a programme or select “Not sure yet”.' },
        { input: document.getElementById('consent'), error: document.getElementById('consent-error'), validate: (el) => el.checked ? '' : 'Please agree to be contacted about this enquiry.' }
      ];
      fields.forEach(({ input, error, validate }) => {
        const eventName = input.type === 'checkbox' ? 'change' : 'input';
        input.addEventListener(eventName, () => {
          const message = validate(input);
          error.textContent = message;
          input.setAttribute('aria-invalid', String(Boolean(message)));
        });
        if (input.tagName === 'SELECT') input.addEventListener('change', () => {
          const message = validate(input);
          error.textContent = message;
          input.setAttribute('aria-invalid', String(Boolean(message)));
        });
      });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        let firstInvalid = null;
        fields.forEach(({ input, error, validate }) => {
          const message = validate(input);
          error.textContent = message;
          input.setAttribute('aria-invalid', String(Boolean(message)));
          if (message && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) {
          firstInvalid.focus();
          return;
        }
        success.textContent = 'Thank you. The form has been validated in this demonstration. No personal information was transmitted or stored. A live version must connect to the organisation’s approved enquiry system and privacy notice.';
        success.hidden = false;
        window.dispatchEvent(new CustomEvent('morrow:enquiry-demo', { detail: { programme: programmeSelect.value } }));
        if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'morrow_enquiry_demo_success', programme: programmeSelect.value });
        success.focus();
      });
    })();
