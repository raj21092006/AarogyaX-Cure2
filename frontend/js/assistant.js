/* ==========================================================================
   AI HEALTH ASSISTANT CONTROLLER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const suggestionPills = document.querySelectorAll(".suggestion-pill");

  function appendMessage(text, isUser = false) {
    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${isUser ? 'msg-user' : 'msg-ai'}`;
    
    if (isUser) {
      bubble.textContent = text;
    } else {
      // Improved markdown conversion for AI responses
      let html = text
        .replace(/### (.*?)(?:\n|$)/g, '<h4 style="margin-top:0.5rem; margin-bottom:0.25rem; color:var(--primary-dark);">$1</h4>')
        .replace(/• (.*?)(?:\n|$)/g, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = html;
    }
    
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleQuery(queryText) {
    appendMessage(queryText, true);
    userInput.value = "";

    // Show loading indicator
    const loadingBubble = document.createElement("div");
    loadingBubble.className = "msg-bubble msg-ai";
    loadingBubble.innerHTML = "<em>Analyzing symptoms with Gemini 3.7 Flash...</em>";
    chatMessages.appendChild(loadingBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    fetch("https://aarogyax-cure2.onrender.com/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: queryText })
    })
    .then(res => res.json())
    .then(data => {
      if (chatMessages.contains(loadingBubble)) chatMessages.removeChild(loadingBubble);
      appendMessage(data.guidance || data.message || "No response received.");
    })
    .catch(() => {
      if (chatMessages.contains(loadingBubble)) chatMessages.removeChild(loadingBubble);
      // Demo Mode fallback guidance
      let fallbackText = "### First-Aid & General Health Guidance\n• **Rest & Environment**: Move to a quiet, dimly lit room.\n• **Hydration**: Drink adequate fluids.\n• **Monitoring**: Track symptom duration and body temperature.\n\n**Disclaimer**: Guidance is for educational purposes only. Always consult a certified doctor for medical evaluation.";
      appendMessage(fallbackText);
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = userInput.value.trim();
      if (query) handleQuery(query);
    });
  }

  suggestionPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const query = pill.getAttribute("data-query");
      if (query) handleQuery(query);
    });
  });
});
