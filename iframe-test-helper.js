/**
 * Iframe Test Helper for BalanCoffee
 * Version: 1.0
 * 
 * This helper provides functions to safely access and test content within iframes
 */

// Safely access the iframe content document with error handling
function getIframeDocument(iframeId = 'app-preview') {
    try {
        const iframe = document.getElementById(iframeId);
        if (!iframe) {
            console.error(`Iframe with ID '${iframeId}' not found`);
            return null;
        }

        if (!iframe.contentDocument) {
            console.error(`Cannot access contentDocument of iframe '${iframeId}' (possible CORS issue)`);
            return null;
        }

        if (iframe.contentDocument.readyState !== 'complete') {
            console.warn(`Iframe document not fully loaded: ${iframe.contentDocument.readyState}`);
        }

        return iframe.contentDocument;
    } catch (error) {
        console.error(`Error accessing iframe document: ${error.message}`);
        return null;
    }
}

// Get element inside iframe with fallback
function getIframeElement(elementId, fallbackSelector = null, iframeId = 'app-preview') {
    try {
        const iframeDoc = getIframeDocument(iframeId);
        if (!iframeDoc) return null;

        // Try getElementById first
        let element = iframeDoc.getElementById(elementId);
        
        // If not found and fallback provided, try querySelector
        if (!element && fallbackSelector) {
            element = iframeDoc.querySelector(fallbackSelector);
        }
        
        return element;
    } catch (error) {
        console.error(`Error getting element '${elementId}' in iframe: ${error.message}`);
        return null;
    }
}

// Wait for element to be available in iframe
function waitForIframeElement(elementId, fallbackSelector = null, maxWaitTime = 5000, iframeId = 'app-preview') {
    return new Promise((resolve, reject) => {
        // Check if iframe exists
        const iframe = document.getElementById(iframeId);
        if (!iframe) {
            reject(new Error(`Iframe with ID '${iframeId}' not found`));
            return;
        }

        // Function to check element
        const checkElement = () => {
            try {
                // First check if element already exists
                const element = getIframeElement(elementId, fallbackSelector, iframeId);
                if (element) {
                    resolve(element);
                    return true;
                }
                return false;
            } catch (e) {
                // Ignore errors during check
                return false;
            }
        };

        // First try immediate check
        if (checkElement()) return;

        // Set up timeout
        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error(`Timed out waiting for element '${elementId}' in iframe after ${maxWaitTime}ms`));
        }, maxWaitTime);

        // Set up interval to check periodically
        const checkInterval = setInterval(() => {
            if (checkElement()) {
                clearTimeout(timeout);
                clearInterval(checkInterval);
            }
        }, 100);
    });
}

// Call a function inside iframe context
function callIframeFunction(functionName, ...args) {
    try {
        const iframe = document.getElementById('app-preview');
        if (!iframe || !iframe.contentWindow) {
            console.error('Cannot access iframe content window');
            return null;
        }

        const fn = iframe.contentWindow[functionName];
        if (typeof fn !== 'function') {
            console.error(`Function '${functionName}' not found in iframe context`);
            return null;
        }

        return fn.apply(iframe.contentWindow, args);
    } catch (error) {
        console.error(`Error calling function '${functionName}' in iframe: ${error.message}`);
        return null;
    }
}

// Check if window variable exists in iframe
function checkIframeVariable(variableName) {
    try {
        const iframe = document.getElementById('app-preview');
        if (!iframe || !iframe.contentWindow) return false;
        
        return typeof iframe.contentWindow[variableName] !== 'undefined';
    } catch (error) {
        console.error(`Error checking variable '${variableName}' in iframe: ${error.message}`);
        return false;
    }
}

// Force iframe to reload with cache busting
function forceReloadIframe(iframeId = 'app-preview') {
    return new Promise((resolve) => {
        const iframe = document.getElementById(iframeId);
        if (!iframe) {
            console.error(`Iframe with ID '${iframeId}' not found`);
            resolve(false);
            return;
        }

        // Get current src
        const currentSrc = iframe.src;
        
        // Add or update timestamp parameter
        const newSrc = currentSrc.includes('?') 
            ? currentSrc.replace(/([?&])_t=\d+/, '$1_t=' + Date.now())
            : `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        
        // Setup load handler
        const loadHandler = () => {
            iframe.removeEventListener('load', loadHandler);
            setTimeout(() => resolve(true), 500); // Give a little extra time for scripts to run
        };
        
        iframe.addEventListener('load', loadHandler);
        
        // Clear and set new src
        iframe.src = '';
        setTimeout(() => {
            iframe.src = newSrc;
        }, 100);
    });
}

// Debug iframe DOM structure
function debugIframeDOM(maxDepth = 3) {
    try {
        const iframeDoc = getIframeDocument();
        if (!iframeDoc || !iframeDoc.body) {
            console.error('Cannot access iframe document or body is null');
            return null;
        }

        console.group('Iframe DOM Structure:');
        console.log('readyState:', iframeDoc.readyState);
        console.log('URL:', iframeDoc.URL);
        console.log('title:', iframeDoc.title);
        
        // Print DOM structure
        let output = '';
        function traverseDOM(element, depth = 0) {
            if (depth > maxDepth) return;
            
            const indent = '  '.repeat(depth);
            const tagName = element.tagName.toLowerCase();
            const id = element.id ? `#${element.id}` : '';
            const classes = element.className && typeof element.className === 'string' 
                ? `.${element.className.split(' ').join('.')}` 
                : '';
            
            output += `${indent}<${tagName}${id}${classes}>\n`;
            
            for (let i = 0; i < element.children.length; i++) {
                traverseDOM(element.children[i], depth + 1);
            }
        }
        
        traverseDOM(iframeDoc.body);
        console.log(output);
        console.groupEnd();
        
        return output;
    } catch (error) {
        console.error('Error in debugIframeDOM:', error);
        return null;
    }
}

// Export to global scope
window.iframeTestHelper = {
    getIframeDocument,
    getIframeElement,
    waitForIframeElement,
    callIframeFunction,
    checkIframeVariable,
    forceReloadIframe,
    debugIframeDOM
};
