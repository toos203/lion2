// ============================================
// NERMAN LION BARTENDER – CHATBOT ENGINE
// sales_script.md based conversational bot
// ============================================

(function () {
  'use strict';

  // ---- KNOWLEDGE BASE (from sales_script.md) ----
  const KB = {
    greet: "Ơ anh ghé thăm lion rồi 😄 Em là trợ lý của Nerman – anh đang tìm hiểu về Lion Bartender hay cần hỗ trợ gì không? Em biết tuốt, hỏi thẳng nha 👊",

    topics: [
      {
        id: 'price',
        keywords: ['giá', 'bao nhiêu', 'tiền', 'mua', 'mắc', 'rẻ', 'đắt', 'cost', 'price', '189', '249'],
        answer: "Giá lẻ 249k/chai 400ml anh ơi – nhưng anh đang vào đúng lúc đang có Flash Sale giảm còn <strong>189k</strong> nè. Anh để lại số Zalo em gửi voucher qua luôn, không cần quyết định ngay đâu 😎",
        cta: true
      },
      {
        id: 'diff',
        keywords: ['khác gì', 'so sánh', 'hơn', 'thường thì', 'ưu điểm', 'lợi ích', 'tại sao', 'khác biệt'],
        answer: "Khác một trời một vực anh ơi. Sữa tắm thường: tắm xong 30 phút là hết mùi. Lion Bartender: mùi lưu <strong>6-10 tiếng</strong> sau khi tắm – đi làm, gặp khách xong vẫn còn thơm. Với lại 3in1 luôn: tắm + gội + rửa mặt trong 1 chai. Gom được mấy cái vào 1 chai – tiết kiệm tiền, tiết kiệm thời gian buổi sáng luôn 👌",
        cta: false
      },
      {
        id: 'scent',
        keywords: ['mùi', 'hương', 'thơm', 'chill', 'party', 'drunk', 'mấy mùi', 'nào hợp', 'chọn mùi', 'phù hợp mùi'],
        answer: "Có 3 mùi anh:<br>🍒 <strong>Chill Time</strong> – Cherry-Sandalwood, trầm ấm, lịch lãm<br>🍋 <strong>Party Up</strong> – Lime-Caramel, bestseller, phóng khoáng<br>🔥 <strong>Drunk Time</strong> – Citrus-Musk, cá tính, gợi cảm<br><br>Anh hay dùng vào dịp nào – đi làm hay ra ngoài chơi? Em tư vấn mùi phù hợp được nè 😊",
        cta: false
      },
      {
        id: 'skin',
        keywords: ['da nhạy', 'da dầu', 'kích ứng', 'dị ứng', 'da khô', 'da thường', 'nhạy cảm', 'da mặt', 'an toàn'],
        answer: "Dùng cực kỳ tốt nha anh! Trong chai vỏ đen cực ngầu này tụi em có bổ sung bộ tứ siêu xịn: <strong>Chiết xuất Rau Má, Lô Hội, Tinh dầu Hương Thảo</strong> và <strong>Vitamin B5 (Panthenol)</strong>. Mấy thành phần này chuyên làm dịu, phục hồi da nhạy cảm và giảm mụn lưng cực kỳ đỉnh. Anh nào da dầu hay yếu tắm xong da vẫn ẩm mượt, không hề bị khô hay kích ứng xíu nào 👍",
        cta: false
      },
      {
        id: '3in1',
        keywords: ['3in1', 'ba trong một', 'gội', 'rửa mặt', 'có gội được không', 'tóc', 'gội đầu', 'chính xác', 'thật không'],
        answer: "Chắc chắn được anh! Khác với sữa tắm thông thường gây khô rít tóc, sản phẩm bên em chứa <strong>các dưỡng chất điều hòa tóc chuyên biệt</strong>, kết hợp <strong>Vitamin B5 và Lô hội</strong> siêu cấp ẩm. Anh gội xong tóc đảm bảo mượt rượi, rửa mặt xong da êm ru không khô rát. Rất xứng đáng để đưa vào chu trình tắm-gội-rửa siêu tốc buổi sáng 😄",
        cta: false
      },
      {
        id: 'shipping',
        keywords: ['ship', 'giao', 'vận chuyển', 'bao lâu', 'nhận hàng', 'freeship', 'phí ship', 'giao hàng'],
        answer: "HCM/HN: 1-2 ngày anh. Tỉnh xa: 3-5 ngày. Có tracking đơn hàng gửi qua Zalo. Anh để lại số Zalo bên em check tồn kho và xác nhận thời gian giao cụ thể nhé 📦",
        cta: false
      },
      {
        id: 'authentic',
        keywords: ['chính hãng', 'thật', 'fake', 'nhái', 'tin tưởng', 'đảm bảo', 'uy tín'],
        answer: "100% chính hãng anh ơi – Nerman là thương hiệu của <strong>Công ty Cổ phần Men Universe</strong>, MSDN: 2803052009. Mua qua website này là kênh chính hãng, không lo hàng nhái 💯",
        cta: false
      },
      {
        id: 'return',
        keywords: ['đổi', 'trả', 'hoàn tiền', 'không thích', 'lỡ mua', 'refund', 'đổi trả'],
        answer: "Anh cứ để lại số Zalo – bên em sẽ hỏi thêm về sở thích của anh và tư vấn mùi phù hợp trước khi quyết định. Còn nếu hàng có vấn đề về chất lượng thì bên em giải quyết nha – không để anh thiệt thòi đâu 🙌",
        cta: true
      },
      {
        id: 'combo',
        keywords: ['combo', 'mua nhiều', 'giảm thêm', 'set', 'bộ', '2 chai', '3 chai', 'khuyến mãi thêm'],
        answer: "Có anh! Mua 2 chai hoặc thử cả 3 mùi thì giá tốt hơn lẻ. Anh muốn em gửi bảng giá combo cụ thể qua Zalo không? Hay để anh xem thêm rồi quyết 😉",
        cta: true
      },
      {
        id: 'duration',
        keywords: ['dùng được bao lâu', 'bao lâu', 'mấy tháng', 'hết bao lâu', 'bền không', 'lâu không'],
        answer: "Chai 400ml dùng được khoảng <strong>1-1.5 tháng</strong> nếu tắm mỗi ngày. Nếu vừa tắm vừa gội thì khoảng 3-4 tuần. Tính ra 1 ngày chưa tới 10k anh 😄",
        cta: false
      },
      {
        id: 'think',
        keywords: ['để nghĩ', 'nghĩ thêm', 'lần sau', 'chưa', 'để từ từ', 'thôi', 'không mua ngay', 'cân nhắc'],
        answer: "Không cần quyết ngay đâu anh – anh để lại số Zalo, bên em giữ giá ưu đãi cho anh. Khi nào anh ready thì nhắn em là xong. Flash Sale này có giới hạn nên anh cứ điền form trước để giữ chỗ nhé 😊",
        cta: true
      },
      {
        id: 'contact',
        keywords: ['liên hệ', 'hotline', 'số điện thoại', 'zalo', 'email', 'fb', 'facebook', 'gọi'],
        answer: "Anh liên hệ được qua:<br>📞 Hotline: <strong>1900 4628</strong><br>📧 Email: hotro@nerman.asia<br>💬 Hoặc để lại số Zalo trong form bên dưới, em liên hệ ngay!",
        cta: false
      }
    ],

    fallback: "Haha câu này hơi ngoài tầm của em rồi 🙈 Anh để lại số Zalo – em nhờ team chuyên môn giải đáp cho anh trong vòng vài tiếng nhé. Hoặc gọi hotline <strong>1900 4628</strong>!",
    
    closingCta: "Anh quan tâm rồi đây 😄 Bước tiếp theo đơn giản thôi:<br>👉 Điền form bên dưới – em Zalo cho anh ngay, không cần chờ lâu. Giá ưu đãi 189k áp dụng luôn!",

    scent_adviser: {
      trigger: ['đi làm', 'văn phòng', 'gặp khách hàng', 'công sở'],
      answer_work: "Cho đi làm văn phòng hay gặp đối tác thì <strong>Chill Time</strong> là đỉnh anh ơi – mùi Cherry-Sandalwood trầm ấm, lịch lãm, không gây phiền hàng xóm 😄 Anh để lại số Zalo em order giúp nhé!",
      trigger_fun: ['đi chơi', 'hẹn hò', 'party', 'tiệc', 'bar', 'ra ngoài', 'gặp gái', 'bạn bè'],
      answer_fun: "<strong>Party Up</strong> là bestseller, anh nào hay đi chơi hẹn hò em hay gợi ý cái này nhất 🍋 Mùi Lime-Caramel bùng nổ mà không lố. Để lại số Zalo, em order ngay!",
    }
  };

  // ---- QUICK REPLY CHIPS ----
  const QUICK_REPLIES_INIT = [
    { label: '💰 Giá bao nhiêu?', topic: 'price' },
    { label: '🍋 Gợi ý chọn mùi', topic: 'scent' },
    { label: '📦 Ship bao lâu?', topic: 'shipping' },
    { label: '✅ Có chính hãng không?', topic: 'authentic' },
  ];

  const QUICK_REPLIES_SECONDARY = [
    { label: '🧴 3in1 hoạt động thế nào?', topic: '3in1' },
    { label: '🔁 Đổi trả thế nào?', topic: 'return' },
    { label: '🎁 Có combo không?', topic: 'combo' },
    { label: '📞 Liên hệ', topic: 'contact' },
  ];

  // ---- STATE ----
  let isOpen = false;
  let hasGreeted = false;
  let messageCount = 0;
  let lastCtaTopic = null;

  // ---- DOM refs ----
  const bubble = document.getElementById('chatbot-bubble');
  const chatWindow = document.getElementById('chatbot-window');
  const messagesContainer = document.getElementById('chatbot-messages');
  const quickRepliesContainer = document.getElementById('chatbot-quick-replies');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const notifBadge = document.getElementById('chatbot-notif');
  const iconChat = document.getElementById('chatbot-icon-chat');
  const iconClose = document.getElementById('chatbot-icon-close');

  if (!bubble || !chatWindow) return;

  // ---- HELPERS ----
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addMessage(text, sender = 'bot', delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        const wrap = document.createElement('div');
        wrap.className = `chatbot-msg chatbot-msg--${sender}`;
        
        if (sender === 'bot') {
          const avatar = document.createElement('div');
          avatar.className = 'chatbot-msg-avatar';
          avatar.textContent = '🦁';
          wrap.appendChild(avatar);
        }

        const bubble = document.createElement('div');
        bubble.className = 'chatbot-msg-bubble';
        bubble.innerHTML = text;
        wrap.appendChild(bubble);

        if (sender === 'bot') {
          // Typing indicator
          wrap.classList.add('typing');
          const typingDots = document.createElement('div');
          typingDots.className = 'chatbot-typing-dots';
          typingDots.innerHTML = '<span></span><span></span><span></span>';
          bubble.appendChild(typingDots);
          messagesContainer.appendChild(wrap);
          scrollToBottom();

          setTimeout(() => {
            wrap.classList.remove('typing');
            bubble.innerHTML = text;
            scrollToBottom();
            resolve();
          }, 600);
        } else {
          messagesContainer.appendChild(wrap);
          scrollToBottom();
          resolve();
        }

        messageCount++;
      }, delay);
    });
  }

  function showQuickReplies(replies) {
    quickRepliesContainer.innerHTML = '';
    quickRepliesContainer.style.display = 'flex';
    replies.forEach(r => {
      const chip = document.createElement('button');
      chip.className = 'chatbot-chip';
      chip.textContent = r.label;
      chip.addEventListener('click', () => {
        handleQuickReply(r.topic, r.label);
      });
      quickRepliesContainer.appendChild(chip);
    });
    // Ensure we scroll to bottom after showing quick replies since they reduce the chat height
    setTimeout(scrollToBottom, 50);
  }

  function hideQuickReplies() {
    quickRepliesContainer.innerHTML = '';
    quickRepliesContainer.style.display = 'none';
    scrollToBottom();
  }

  function showCtaButton(text = 'Điền form nhận ưu đãi ngay →') {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'chatbot-msg chatbot-msg--bot';
    const avatar = document.createElement('div');
    avatar.className = 'chatbot-msg-avatar';
    avatar.textContent = '🦁';
    ctaWrap.appendChild(avatar);
    const btnBubble = document.createElement('div');
    btnBubble.className = 'chatbot-msg-bubble chatbot-msg-cta';
    const ctaBtn = document.createElement('a');
    ctaBtn.href = '#order';
    ctaBtn.className = 'chatbot-cta-btn';
    ctaBtn.innerHTML = '🎁 ' + text;
    ctaBtn.addEventListener('click', () => closeChat());
    btnBubble.appendChild(ctaBtn);
    ctaWrap.appendChild(btnBubble);
    messagesContainer.appendChild(ctaWrap);
    scrollToBottom();
  }

  function findTopic(input) {
    const lower = input.toLowerCase().normalize('NFC');
    // Try to match keywords
    for (const topic of KB.topics) {
      for (const kw of topic.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return topic;
        }
      }
    }
    return null;
  }

  async function botReply(text, showCta = false, ctaText) {
    await addMessage(text, 'bot', 100);
    if (showCta) {
      setTimeout(() => showCtaButton(ctaText), 800);
    }
  }

  // ---- OPEN / CLOSE ----
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    chatWindow.setAttribute('aria-hidden', 'false');
    bubble.classList.add('active');
    iconChat.style.display = 'none';
    iconClose.style.display = 'block';

    // Hide notification
    if (notifBadge) notifBadge.style.display = 'none';

    if (!hasGreeted) {
      hasGreeted = true;
      setTimeout(async () => {
        await botReply(KB.greet);
        setTimeout(() => showQuickReplies(QUICK_REPLIES_INIT), 800);
      }, 300);
    }
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    chatWindow.setAttribute('aria-hidden', 'true');
    bubble.classList.remove('active');
    iconChat.style.display = 'block';
    iconClose.style.display = 'none';
  }

  function toggleChat() {
    if (isOpen) closeChat();
    else openChat();
  }

  // ---- SEND MESSAGE ----
  async function handleUserMessage(text) {
    if (!text.trim()) return;
    hideQuickReplies();
    await addMessage(text, 'user');
    inputEl.value = '';

    const topic = findTopic(text);

    if (topic) {
      await botReply(topic.answer, topic.cta, 'Điền form nhận ưu đãi ngay →');
      // Show secondary quick replies after 2nd answer
      if (messageCount > 4) {
        setTimeout(() => showQuickReplies(QUICK_REPLIES_SECONDARY), 900);
      } else {
        setTimeout(() => showQuickReplies(QUICK_REPLIES_INIT), 900);
      }
    } else {
      await botReply(KB.fallback, true, 'Để số Zalo – em liên hệ tư vấn →');
      setTimeout(() => showQuickReplies(QUICK_REPLIES_SECONDARY), 900);
    }
  }

  async function handleQuickReply(topicId, label) {
    hideQuickReplies();
    await addMessage(label, 'user');

    const topic = KB.topics.find(t => t.id === topicId);
    if (topic) {
      await botReply(topic.answer, topic.cta, 'Điền form nhận ưu đãi ngay →');
      // After CTA topic, show closing prompt
      if (topic.cta && lastCtaTopic && lastCtaTopic !== topicId) {
        setTimeout(async () => {
          await botReply(KB.closingCta, true, '👉 Điền form – CHỐT THÔI!');
        }, 1200);
      }
      lastCtaTopic = topicId;
      setTimeout(() => showQuickReplies(QUICK_REPLIES_SECONDARY), 900);
    } else {
      await botReply(KB.fallback, true, 'Để số Zalo – em liên hệ tư vấn →');
    }
  }

  // ---- EVENT LISTENERS ----
  bubble.addEventListener('click', toggleChat);
  bubble.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggleChat(); });
  closeBtn.addEventListener('click', closeChat);

  sendBtn.addEventListener('click', () => handleUserMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleUserMessage(inputEl.value);
  });

  // ---- AUTO-APPEAR NOTIFICATION after 5s ----
  setTimeout(() => {
    if (!isOpen && notifBadge) {
      notifBadge.style.display = 'flex';
      bubble.classList.add('pulse');
    }
  }, 5000);

  // ---- AUTO-OPEN with greeting after 12s (once) ----
  // Commented out so it doesn't annoy: Uncomment to enable
  // setTimeout(() => { if (!isOpen && !hasGreeted) openChat(); }, 12000);

})();
