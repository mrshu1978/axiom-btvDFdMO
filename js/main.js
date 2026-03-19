// Main JavaScript file
console.log('Application loaded successfully');

// Example: DOM manipulation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');

    // Add your JavaScript code here
});

// Example: Utility functions
function init() {
    // Initialize your application
}

// Call initialization when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}