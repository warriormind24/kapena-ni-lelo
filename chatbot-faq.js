/* Lightweight FAQ chatbot (client-side) */

(() => {
  const FAQs = [
    {
      q: "What do you sell?",
      a: "We supply live chickens, chicken meat, chicken pieces (portions), takeaway products, and chicken manure."
    },
    {
      q: "Do you offer delivery?",
      a: "Yes. We deliver to clients’ doorsteps across Luanshya and the wider Copperbelt."
    },
    {
      q: "How can I pay?",
      a: "Cash, mobile money, bank transfer, or cheque. Bank details are available in the Contact section."
    },
    {
      q: "Where are you located?",
      a: "Ibenga, Chinondo Road, Luanshya, Zambia."
    },
    {
      q: "Do you offer consultancy or marketing services?",
      a: "Yes. Poultry consultancy and our marketing platform are available now. Use the Services section or send a quote request in the Contact section to book."
    }
  ];

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[\u2019']/g, "'")
      .replace(/[^a-z0-9\s+]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function scoreAnswer(query, faq) {
    const q = normalize(query);
    const hay = normalize(faq.q + " " + faq.a);
    if (!q) return 0;

    // Token overlap score
    const tokens = q.split(" ").filter(Boolean);
    let overlap = 0;
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (hay.includes(t)) overlap++;
    }

    // Boost for direct question matching
    const direct = normalize(faq.q) === q;
    return overlap + (direct ? 3 : 0);
  }

  function bestMatch(query) {
    let best = null;
    let bestScore = 0;

    for (const faq of FAQs) {
      const s = scoreAnswer(query, faq);
      if (s > bestScore) {
        bestScore = s;
        best = faq;
      }
    }

    if (!best || bestScore < 2) {
      return {
        q: "Unknown",
        a: "I’m not fully sure yet. Please use the Contact section to request a quote, or message us and we’ll respond with the right details."
      };
    }

    return best;
  }

  function ensureChatUI() {
    if (document.querySelector("#faq-chat-widget")) return;

    const root = document.createElement("div");
    root.id = "faq-chat-widget";
    root.innerHTML = `
      <button class="faq-chat-launch" type="button" aria-label="Open FAQ chat">
        💬
      </button>

      <div class="faq-chat-panel" role="dialog" aria-label="FAQ chat" aria-modal="false" hidden>
          <div class="faq-chat-header">
          <div class="faq-chat-title">Kapena Ni Lelo Assistant</div>
          <button class="faq-chat-close" type="button" aria-label="Close Kapena Ni Lelo chat">×</button>
        </div>

        <div class="faq-chat-body" aria-live="polite"></div>

        <form class="faq-chat-form" autocomplete="off">
          <input class="faq-chat-input" type="text" name="q" placeholder="Ask a question… (delivery, payment, location)" aria-label="Ask a question" />
          <button class="faq-chat-send" type="submit" aria-label="Send">Send</button>
        </form>

        <div class="faq-chat-hint">Tip: try “Do you offer delivery?”</div>
      </div>
    `;

    document.body.appendChild(root);

    const style = document.createElement("style");
    style.textContent = `
      #faq-chat-widget { position: fixed; right: 18px; bottom: 20px; z-index: 60; }
      .faq-chat-launch {
        width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: pointer;
        background: linear-gradient(135deg, var(--orange), var(--orange-light));
        color: #fff; font-size: 20px; box-shadow: 0 12px 32px rgba(241,90,36,0.35);
      }
      .faq-chat-panel {
        position: absolute; right: 0; bottom: 70px; width: min(360px, calc(100vw - 36px));
        border-radius: 16px; background: rgba(255,255,255,0.98); border: 1px solid var(--border);
        box-shadow: var(--shadow);
        overflow: hidden;
      }
      .faq-chat-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 14px; background: linear-gradient(180deg, rgba(26,94,61,0.06), transparent);
      }
      .faq-chat-title { font-weight: 900; color: var(--green); }
      .faq-chat-close {
        width: 34px; height: 34px; border-radius: 50%; border: 0; cursor: pointer;
        background: rgba(26,94,61,0.08); color: var(--green); font-size: 18px;
      }
      .faq-chat-body {
        height: 260px; overflow: auto; padding: 12px 14px; display: grid; gap: 10px;
      }
      .faq-chat-msg { max-width: 92%; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--border); }
      .faq-chat-msg--bot { background: rgba(26,94,61,0.04); justify-self: start; color: var(--text); }
      .faq-chat-msg--user { background: rgba(241,90,36,0.06); justify-self: end; color: var(--text); }
      .faq-chat-form { display: grid; grid-template-columns: 1fr auto; gap: 10px; padding: 12px 14px; border-top: 1px solid var(--border); }
      .faq-chat-input {
        border: 1px solid var(--border); border-radius: 12px; padding: 12px 12px; font: inherit;
        background: var(--surface);
      }
      .faq-chat-send {
        border: 0; cursor: pointer; border-radius: 12px;
        padding: 0 14px; background: var(--green); color: #fff; font-weight: 800;
      }
      .faq-chat-hint { padding: 0 14px 14px; color: var(--muted); font-size: 12px; }
    `;
    document.head.appendChild(style);

    const launch = root.querySelector(".faq-chat-launch");
    const panel = root.querySelector(".faq-chat-panel");
    const close = root.querySelector(".faq-chat-close");
    const body = root.querySelector(".faq-chat-body");
    const form = root.querySelector(".faq-chat-form");
    const input = root.querySelector(".faq-chat-input");

    function addMsg(text, who) {
      const el = document.createElement("div");
      el.className = `faq-chat-msg faq-chat-msg--${who}`;
      el.textContent = text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }

    function open() {
      panel.hidden = false;
      launch.setAttribute("aria-expanded", "true");
      if (!body.children.length) {
        addMsg("Hi! I’m the Kapena Ni Lelo assistant. Ask me about delivery, payment, products, or our location.", "bot");
      }
      setTimeout(() => input.focus(), 50);
    }

    function closePanel() {
      panel.hidden = true;
      launch.setAttribute("aria-expanded", "false");
    }

    launch.addEventListener("click", open);
    close.addEventListener("click", closePanel);

    panel.addEventListener("click", (e) => {
      // prevent backdrop closing; none used
      e.stopPropagation();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (input.value || "").trim();
      if (!q) return;

      addMsg(q, "user");
      input.value = "";

      const best = bestMatch(q);
      addMsg(best.a, "bot");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureChatUI);
  } else {
    ensureChatUI();
  }
})();

