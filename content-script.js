(function() {
  /**
   * Mock function to simulate an API call returning a suggestion
   * for the user's partial input.
   *
   * Replace this with your real endpoint, e.g.:
   *   const response = await fetch('https://your-api.com/autocomplete?text=' + userText);
   *   const data = await response.json();
   *   return data.suggestion || "";
   */
  async function fetchSuggestion(userText) {
    if (!userText || userText.length < 3) {
      return "";
    }
    const lower = userText.toLowerCase();

    // Some silly static examples:
    if (lower.startsWith("hel")) {
      return "Hello there, how can I help you today?";
    } else if (lower.startsWith("thi")) {
      return "This is a sample sentence completion.";
    } else if (lower.startsWith("goo")) {
      return "Good morning! Hope you have a great day.";
    }

    return "";
  }

  /**
   * Applies the suggestion if it starts with what the user has typed.
   * We set the input's value to the full suggestion, then
   * programmatically select the remainder (the "uncommitted" portion).
   */
  async function applySuggestion(input) {
    const userText = input.dataset.userTyped || ""; // Our stored typed text
    const suggestion = await fetchSuggestion(userText);

    if (
      !suggestion ||
      !userText ||
      !suggestion.toLowerCase().startsWith(userText.toLowerCase()) ||
      suggestion.length <= userText.length
    ) {
      return; // No valid suggestion
    }

    // Full suggestion, highlight everything after userText.length
    input.value = suggestion;
    // Programmatically highlight (select) the extra portion
    input.setSelectionRange(userText.length, suggestion.length);
  }

  /**
   * Handles user input changes:
   * - If new input overwrites the selected suggestion portion, we track that in data-user-typed.
   * - If user is just typing further, also track that.
   */
  function onInputChange(e) {
    const input = e.target;
    // If the user typed something while a portion was selected, it overwrites the suggestion.
    // Let's figure out what portion is newly typed.

    // We need to check the selection range. If there's a selection, it might be overwriting.
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // If the user typed or deleted while text was selected
    if (start !== end) {
      // The user replaced the suggestion portion with something else
      // So let's set user-typed to whatever the current input value is
      input.dataset.userTyped = input.value;
    } else {
      // If there's no selection, it means user either typed at the end or in the middle
      // But let's keep it simple and assume typed at the end
      input.dataset.userTyped = input.value;
    }

    // Attempt to fetch/apply a new suggestion
    applySuggestion(input);
  }

  /**
   * Keydown handler to accept or reject suggestion.
   * - Tab or Right Arrow => accept
   * - Other keys that change text => reject or overwrite
   */
  function onKeyDown(e) {
    const input = e.target;
    // We'll only do something special if there's a highlighted portion
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // If there's a portion highlighted (the suggestion part)
    if (start < end && end === input.value.length) {
      // The user is highlighting the tail end of the text,
      // which is presumably the suggestion
      // If they press Tab or Right Arrow => accept suggestion
      if (e.key === "Tab" || e.key === "ArrowRight") {
        e.preventDefault();
        // Accept suggestion => place cursor at end, no selection
        input.setSelectionRange(input.value.length, input.value.length);
        // Clear the "userTyped" data since we've accepted the suggestion
        input.dataset.userTyped = input.value;
      }
    }
    // If the user typed anything else, it might be typed at the highlight, thus overwriting
    // We'll handle that in the `input` event, so we don't do anything else here.
  }

  /**
   * Attaches the event listeners to a single input.
   */
  function attachAutoCompleter(input) {
    // Mark as processed
    if (input.classList.contains("inline-completer-attached")) return;
    input.classList.add("inline-completer-attached");

    // We'll store the user's typed portion in a data attribute
    input.dataset.userTyped = "";

    // onInput => track typed text & apply new suggestion
    input.addEventListener("input", onInputChange);
    // onKeyDown => handle acceptance via Tab/ArrowRight
    input.addEventListener("keydown", onKeyDown);
  }

  // -------------------------------------------------------------
  // Observe the DOM for text inputs we want to enhance
  // -------------------------------------------------------------
  const observer = new MutationObserver(() => {
    // Example: let's target an input with name="sentence"
    // Adjust selector as you like (e.g., any <input type="text">).
    const textInputs = document.querySelectorAll('input[type="text"][name="sentence"]');
    textInputs.forEach(attachAutoCompleter);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also handle any existing elements on initial load
  window.addEventListener("DOMContentLoaded", () => {
    const textInputs = document.querySelectorAll('input[type="text"][name="sentence"]');
    textInputs.forEach(attachAutoCompleter);
  });
})();
