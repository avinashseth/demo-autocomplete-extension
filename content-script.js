(function() {
  const API_KEY = "GOOGLE_GEMINI_KEY"; // Replace with your actual API key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  async function fetchSuggestion(userText) {
    if (!userText || userText.length < 3) {
      return "";
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }],
        }),
      });
      
      const data = await response.json();

      console.log(data?.candidates?.[0]?.content?.parts?.[0]?.text);

      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      return "";
    }
  }

  async function applySuggestion(input) {
    const userText = input.dataset.userTyped || "";
    const suggestion = await fetchSuggestion(userText);

    if (
      !suggestion ||
      !userText ||
      !suggestion.toLowerCase().startsWith(userText.toLowerCase()) ||
      suggestion.length <= userText.length
    ) {
      return;
    }

    input.value = suggestion;
    input.setSelectionRange(userText.length, suggestion.length);
  }

  function onInputChange(e) {
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (start !== end) {
      input.dataset.userTyped = input.value;
    } else {
      input.dataset.userTyped = input.value;
    }

    applySuggestion(input);
  }

  function onKeyDown(e) {
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (start < end && end === input.value.length) {
      if (e.key === "Tab" || e.key === "ArrowRight") {
        e.preventDefault();
        input.setSelectionRange(input.value.length, input.value.length);
        input.dataset.userTyped = input.value;
      }
    }
  }

  function attachAutoCompleter(input) {
    if (input.classList.contains("inline-completer-attached")) return;
    input.classList.add("inline-completer-attached");
    input.dataset.userTyped = "";
    input.addEventListener("input", onInputChange);
    input.addEventListener("keydown", onKeyDown);
  }

  const observer = new MutationObserver(() => {
    const textInputs = document.querySelectorAll('[aria-label="Search"]');
    textInputs.forEach(attachAutoCompleter);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("DOMContentLoaded", () => {
    const textInputs = document.querySelectorAll('input[type="text"][name="sentence"]');
    textInputs.forEach(attachAutoCompleter);
  });
})();
