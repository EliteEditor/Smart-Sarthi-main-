// language.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Find the language selector dropdown
    const langSelector = document.getElementById('language-selector');

    // 2. Define the translation function
    const applyTranslations = (lang) => {
        // Find all elements that have a 'data-key' attribute
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            
            // --- THIS IS THE CORRECTED LOGIC ---
            let translation = translations[lang][key];
            
            // Only fallback to English if the key is truly UNDEFINED
            // (i.e., not present in the 'hi' or 'mr' dictionary)
            if (translation === undefined) {
                translation = translations['en'][key] || ''; // Fallback to English, or just empty
            }
            // --- END OF CORRECTION ---

            if (translation !== undefined) {
                
                // Now, this check will work correctly
                if (translation === "") {
                    element.style.display = 'none';
                } else {
                    // Otherwise, show it and set the text
                    element.style.display = ''; // Resets to default (inline, block, etc.)
                    
                    if (element.tagName === 'INPUT' && element.placeholder) {
                        element.placeholder = translation;
                    } else {
                        // Use innerHTML to respect line breaks in <pre> tags
                        element.innerHTML = translation;
                    }
                }
            }
        });
    };

    // 3. Set language on dropdown change
    if (langSelector) {
        langSelector.addEventListener('change', (event) => {
            const selectedLang = event.target.value;
            // Save the choice to local storage
            localStorage.setItem('lang', selectedLang);
            // Apply the translations
            applyTranslations(selectedLang);
        });
    }

    // 4. Check for a saved language on page load
    const savedLang = localStorage.getItem('lang') || 'en'; // Default to 'en'
    
    // Set the dropdown to the saved language
    if (langSelector) {
        langSelector.value = savedLang;
    }
    
    // Apply the saved language translations immediately
    applyTranslations(savedLang);
});