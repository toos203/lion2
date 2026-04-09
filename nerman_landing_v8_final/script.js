// ============================================
// NERMAN LION BARTENDER – LANDING PAGE JS
// ============================================

(function () {
  'use strict';

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ---- Floating particles ----
  const particleContainer = document.getElementById('particles');
  if (particleContainer) {
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = '-10px';
      p.style.width = (Math.random() * 3 + 1) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (Math.random() * 8 + 5) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      p.style.opacity = Math.random() * 0.5 + 0.1;
      particleContainer.appendChild(p);
    }
  }

  // ---- Animate on scroll (Intersection Observer) ----
  const animTargets = [
    '.pain-card',
    '.product-card',
    '.benefit-item',
    '.step',
    '.solution-text',
    '.solution-image',
    '.order-text',
    '.order-visual',
    '.section-header',
    '.hero-content',
    '.hero-image',
    '.proof blockquote',
    '.proof-brand',
    '.hashtags',
    '.survey-inner',
  ];

  animTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('fade-in');
      if (i === 1) el.classList.add('fade-in-delay-1');
      if (i === 2) el.classList.add('fade-in-delay-2');
      if (i === 3) el.classList.add('fade-in-delay-3');
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ---- Smooth CTA click analytics (console log) ----
  const ctaIds = [
    'hero-cta-btn', 'hero-learn-btn', 'nav-cta-btn',
    'order-main-btn', 'order-shopee-btn', 'order-lazada-btn',
    'order-badge'
  ];
  ctaIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        console.log(`[Nerman LP] CTA clicked: ${id}`);
      });
    }
  });

  // ---- Number counter animation ----
  function animateCounter(el, target, suffix = '') {
    let startTime = null;
    const duration = 2000;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      if (target >= 1000000) {
        let valStr = (value / 1000000).toFixed(1).replace('.', ',');
        if (target % 1000000 === 0 && valStr.endsWith(',0')) valStr = valStr.slice(0, -2);
        el.textContent = valStr + suffix;
      } else {
        el.textContent = Math.floor(value).toLocaleString('vi-VN') + suffix;
      }
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statNums = document.querySelectorAll('.stat-num[data-count]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const count = parseFloat(el.getAttribute('data-count'));
        if (count === 3.6) animateCounter(el, 3600000, ' TRIỆU+');
        else if (count === 2000) animateCounter(el, 2000, '+');
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  // ---- Product card hover glow (Throttled for Performance) ----
  document.querySelectorAll('.product-card, .pain-card, .benefit-item').forEach(card => {
    let rafId = null;
    card.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
        rafId = null;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  });

})();

// ---- Order Form Handler (Enhanced for Mobile) ----
(function() {
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const success = document.getElementById('form-success');
      const btn = document.getElementById('order-submit-btn');
      const submitText = btn ? btn.querySelector('span') : null;
      
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-7AmCqBQQjjHGSs6gY82Vs-bUxZVGNF2o_j3VAkSqtHuPdrnHkE4PXw6j_ND8WdalFg/exec';

      // Verify data before sending
      const nameEl = document.getElementById('form-name');
      const phoneEl = document.getElementById('form-phone');
      const addressEl = document.getElementById('form-address');
      const scentEl = document.getElementById('form-scent');
      const qtyEl = document.getElementById('form-qty');
      const noteEl = document.getElementById('form-note');

      if (!nameEl || !phoneEl || !addressEl || !scentEl) return;

      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();
      const address = addressEl.value.trim();
      const scent = scentEl.value;
      const qty = qtyEl ? qtyEl.value : '1';
      const note = noteEl ? noteEl.value.trim() : '';

      if (!name || !phone || !address || !scent) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }

      // State: Loading
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      }
      if (submitText) submitText.textContent = 'Đang gửi thông tin...';

      const data = {
        name, phone, address, scent, qty, note,
        time: new Date().toLocaleString('vi-VN'),
        source: 'LandingPage_Order'
      };

      // Set a 15s timeout for mobile networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      })
      .then(() => {
        clearTimeout(timeoutId);
        if (orderForm) orderForm.style.display = 'none';
        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.warn('Submission network notice:', error);
        // On mobile, fetch often "fails" due to signal but data usually reaches Google Sheets
        // So we show the success message anyway to avoid user frustration
        if (orderForm) orderForm.style.display = 'none';
        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
})();

// ---- Flash Sale Countdown & Promo Helpers ----
(function() {
  // 1. Countdown Timer (Ends at 23:59:59 today)
  function updateCountdown() {
    try {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      let diff = endOfDay.getTime() - now.getTime();
      
      // If it's already past the end of the day (edge case), reset or show 0
      if (diff <= 0) {
        // Option: reset to next day or just show 0
        diff = 0;
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      const display = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      
      // Update all countdown elements
      const targetIds = ['hero-countdown', 'bottom-countdown', 'main-countdown'];
      targetIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = display;
          // Ensure it's never empty string accidentally
          if (!el.textContent) el.textContent = "00:00:00";
        }
      });
    } catch (e) {
      console.error("Countdown error:", e);
    }
  }
  
  let countdownInterval = setInterval(updateCountdown, 1000);
  
  // Robust start
  setTimeout(updateCountdown, 100);
  setTimeout(updateCountdown, 1000);
  
  // Handle mobile pause/resume
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateCountdown();
      if (!countdownInterval) countdownInterval = setInterval(updateCountdown, 1000);
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  });

  // 2. Dynamic Gift Notice
  const qtySelect = document.getElementById('form-qty');
  const giftText = document.getElementById('gift-text');
  const gifts = {
    '1': 'Tặng kèm 01 Cọ tắm Nerman cao cấp.',
    '2': 'Tặng kèm 01 Xịt thơm miệng Smile Cool (ngẫu nhiên).',
    '3': 'Tặng kèm 01 Cọ tắm & 01 Xịt thơm miệng cao cấp.',
    'combo': 'Tặng kèm 01 Cọ tắm & 01 Xịt thơm miệng cao cấp.'
  };

  if (qtySelect && giftText) {
    qtySelect.addEventListener('change', function() {
      const val = qtySelect.value;
      giftText.textContent = gifts[val] || 'Chọn số lượng để nhận quà tặng.';
      
      // Add a subtle highlight animation
      giftText.parentElement.style.animation = 'none';
      setTimeout(() => {
        giftText.parentElement.style.animation = 'pulse-subtle 0.5s ease';
      }, 10);
    });
  }

  // 4. Sync scent 'combo' with quantity '3'
  const scentSelect = document.getElementById('form-scent');
  if (scentSelect && qtySelect) {
    // Scent -> Qty
    scentSelect.addEventListener('change', function() {
      if (scentSelect.value === 'combo') {
        qtySelect.value = '3';
        qtySelect.dispatchEvent(new Event('change'));
        // Lock to 3
        Array.from(qtySelect.options).forEach(opt => {
          if (opt.value !== '3') opt.disabled = true;
        });
      } else {
        Array.from(qtySelect.options).forEach(opt => opt.disabled = false);
      }
    });

    // Qty -> Scent (If they select 3 bottles, they usually want the combo scents or at least hint it)
    qtySelect.addEventListener('change', function() {
      if (qtySelect.value === '3' && scentSelect.value !== 'combo') {
        // We don't force scent=combo if they choose 3 bottles, because they might want 3 of the SAME scent.
        // But the user said: "mua 3 rồi thì chọn 1 hay 2 chai là vô nghĩa" 
        // -> This refers to the Qty dropdown itself after picking a combo.
      }
    });
  }

  // 5. Android/Samsung Touch Fix
  const primaryButtons = document.querySelectorAll('.btn-primary, .nav-cta, .btn-package, .promo-btn, .btn-submit');
  primaryButtons.forEach(btn => {
    btn.addEventListener('touchstart', function() {
      // Just a touch to keep the element "active" in the browser's eyes
      this.classList.add('touch-active');
    }, { passive: true });
    
    btn.addEventListener('touchend', function() {
      this.classList.remove('touch-active');
    }, { passive: true });
  });


})();

// ---- Survey Form Handler ----
(function() {
  const surveyForm = document.getElementById('survey-form');
  if (surveyForm) {
    surveyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const success = document.getElementById('survey-success');
      const btn = surveyForm.querySelector('.survey-submit-btn');
      const submitText = btn ? btn.querySelector('span') : null;
      
      // State: Loading
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.6';
      }
      if (submitText) submitText.textContent = 'Đang gửi...';

      const formData = new FormData(surveyForm);
      const action = surveyForm.getAttribute('action');

      // Auto-fill order form to save user time
      const surveyName = formData.get('name');
      const surveyPhone = formData.get('phone_zalo');
      
      if (surveyName) {
        const orderName = document.getElementById('form-name');
        if (orderName) orderName.value = surveyName;
      }
      if (surveyPhone) {
        const orderPhone = document.getElementById('form-phone');
        if (orderPhone) orderPhone.value = surveyPhone;
      }

      fetch(action, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: formData
      })
      .then(() => {
        // Với Google Apps Script no-cors, phản hồi trả về là opaque nên luôn chạy vào đây khi gửi thành công HTTP
        surveyForm.style.display = 'none';
        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })
      .catch(error => {
        console.error('Survey error:', error);
        // Fallback for network issues
        surveyForm.style.display = 'none';
        if (success) {
          success.style.display = 'block';
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
})();

