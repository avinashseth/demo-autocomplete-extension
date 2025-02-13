(function() {
    // List of domain suggestions
    const DOMAIN_SUGGESTIONS = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];
  
    // Create a dropdown container for suggestions
    const suggestionBox = document.createElement("div");
    suggestionBox.id = "email-autocomplete-suggestions";
    suggestionBox.style.display = "none";
    document.body.appendChild(suggestionBox);
  
    // Track which input currently has focus
    let activeInput = null;
  
    /**
     * Position the suggestionBox below the active email input
     */
    function positionSuggestionBox() {
      if (!activeInput) return;
  
      const rect = activeInput.getBoundingClientRect();
      suggestionBox.style.position = "absolute";
      suggestionBox.style.top = window.scrollY + rect.bottom + "px";
      suggestionBox.style.left = window.scrollX + rect.left + "px";
      suggestionBox.style.width = rect.width + "px";
    }
  
    /**
     * Show relevant suggestions in the dropdown
     */
    function showSuggestions(filteredSuggestions) {
      // Clear current suggestions
      suggestionBox.innerHTML = "";
  
      // Hide if no suggestions
      if (filteredSuggestions.length === 0) {
        suggestionBox.style.display = "none";
        return;
      }
  
      // Populate the suggestion dropdown
      filteredSuggestions.forEach(suggestion => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = suggestion;
  
        // When user clicks on a suggestion, complete the input
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          completeDomain(suggestion);
        });
  
        suggestionBox.appendChild(item);
      });
  
      // Make the suggestion box visible
      suggestionBox.style.display = "block";
    }
  
    /**
     * Complete the email input with the selected domain suggestion
     */
    function completeDomain(domain) {
      if (!activeInput) return;
  
      const value = activeInput.value;
      const atIndex = value.indexOf("@");
      if (atIndex !== -1) {
        // everything before '@' + '@' + domain
        activeInput.value = value.substring(0, atIndex + 1) + domain;
      }
      hideSuggestionBox();
    }
  
    /**
     * Hide the suggestion box
     */
    function hideSuggestionBox() {
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    }
  
    /**
     * Filter domain suggestions based on the text typed after '@'
     */
    function getFilteredSuggestions(inputValue) {
      const atIndex = inputValue.indexOf("@");
      if (atIndex === -1) {
        return []; // user hasn't typed '@' yet
      }
      const typedDomain = inputValue.substring(atIndex + 1).toLowerCase();
      if (!typedDomain) {
        // user just typed '@' but no domain yet, show all
        return DOMAIN_SUGGESTIONS;
      }
      return DOMAIN_SUGGESTIONS.filter(domain => domain.startsWith(typedDomain));
    }
  
    /**
     * Add event listeners to input elements of type="email"
     */
    function addListenersToEmailInputs(inputs) {
      inputs.forEach((input) => {
        // Focus event
        input.addEventListener("focus", () => {
          activeInput = input;
          positionSuggestionBox();
        });
  
        // Blur event
        input.addEventListener("blur", () => {
          // Delay hiding to allow click on suggestion
          setTimeout(() => {
            activeInput = null;
            hideSuggestionBox();
          }, 200);
        });
  
        // Keydown event to capture Tab for auto-completion
        input.addEventListener("keydown", (e) => {
          if (e.key === "Tab" && suggestionBox.style.display === "block") {
            // If suggestions are visible, pick the first one
            const firstSuggestion = suggestionBox.querySelector(".suggestion-item");
            if (firstSuggestion) {
              e.preventDefault();
              completeDomain(firstSuggestion.textContent);
            }
          }
        });
  
        // Input event (fires on every keystroke)
        input.addEventListener("input", () => {
          activeInput = input;
          positionSuggestionBox();
  
          const filtered = getFilteredSuggestions(input.value);
          showSuggestions(filtered);
        });
      });
    }
  
    /**
     * Observe DOM for dynamically added email inputs
     */
    const observer = new MutationObserver(() => {
      const emailInputs = document.querySelectorAll('input[type="email"]');
      addListenersToEmailInputs([...emailInputs]);
    });
  
    // Start observing the entire document
    observer.observe(document.body, { childList: true, subtree: true });
  
    // Also initialize listeners for any existing email inputs on load
    window.addEventListener("DOMContentLoaded", () => {
      const emailInputs = document.querySelectorAll('input[type="email"]');
      addListenersToEmailInputs([...emailInputs]);
    });
  })();
  