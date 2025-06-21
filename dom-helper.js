/**
 * DOM Helper for BalanCoffee
 * Version: 1.0
 * 
 * This helper ensures robust DOM operations with error handling and fallbacks
 */

// Safely get element with fallback
function getElement(id, fallbackSelector = null, parent = document) {
    let element = null;
    
    try {
        // Try to get by ID first
        element = parent.getElementById(id);
        
        // If not found and fallback provided, try with fallback selector
        if (!element && fallbackSelector) {
            element = parent.querySelector(fallbackSelector);
        }
        
        return element;
    } catch (error) {
        console.error(`Error getting element '${id}':`, error);
        return null;
    }
}

// Wait for element to be available in DOM
function waitForElement(id, fallbackSelector = null, maxWaitTime = 5000, parent = document) {
    return new Promise((resolve, reject) => {
        // First check if element already exists
        const element = getElement(id, fallbackSelector, parent);
        if (element) {
            resolve(element);
            return;
        }
        
        // If not, set up a timeout for maximum wait time
        const timeout = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timed out waiting for element '${id}' after ${maxWaitTime}ms`));
        }, maxWaitTime);
        
        // Set up mutation observer to watch for element
        const observer = new MutationObserver(() => {
            const element = getElement(id, fallbackSelector, parent);
            if (element) {
                clearTimeout(timeout);
                observer.disconnect();
                resolve(element);
            }
        });
        
        // Start observing
        observer.observe(parent, {
            childList: true,
            subtree: true
        });
    });
}

// Dom ready with callback and promise support
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
    
    // Return promise for async/await support
    return new Promise(resolve => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => resolve());
        } else {
            resolve();
        }
    });
}

// Create an element with attributes and children
function createElement(tag, attributes = {}, children = []) {
    try {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    } catch (error) {
        console.error(`Error creating ${tag} element:`, error);
        return null;
    }
}

// Debug DOM structure - very useful for troubleshooting
function debugDOMStructure(element = document.body, depth = 0, maxDepth = 3) {
    if (!element || depth > maxDepth) return '';
    
    const indent = '  '.repeat(depth);
    let output = `${indent}<${element.tagName.toLowerCase()}`;
    
    // Add id if present
    if (element.id) output += ` id="${element.id}"`;
    
    // Add class if present
    if (element.className) output += ` class="${element.className}"`;
    
    output += '>\n';
    
    // Process children (only elements, not text nodes)
    for (let i = 0; i < element.children.length; i++) {
        output += debugDOMStructure(element.children[i], depth + 1, maxDepth);
    }
    
    return output;
}

// Force check DOM for specific elements, useful for debugging
function forceCheckDOM(elementIds = []) {
    const results = {};
    
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        results[id] = {
            found: !!element,
            tagName: element ? element.tagName : null,
            className: element ? element.className : null,
            parentId: element && element.parentElement ? element.parentElement.id : null,
            parentTagName: element && element.parentElement ? element.parentElement.tagName : null
        };
    });
    
    console.table(results);
    return results;
}

// Expose to global scope for easy access
window.domHelper = {
    getElement,
    waitForElement,
    domReady,
    createElement,
    debugDOMStructure,
    forceCheckDOM
};
