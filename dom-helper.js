/**
 * DOM Helper Utilities for BalanCoffee POS System
 * Provides robust DOM manipulation and element management
 * Version: 3.0.0 - Complete system integration
 * 
 * Features:
 * - Safe DOM manipulation with error handling
 * - Element validation and existence checking
 * - Form handling with validation
 * - Event management with error wrapping
 * - Animation and transition helpers
 * - Mobile-optimized touch handling
 * - Performance monitoring and logging
 * - Full integration with BalanCoffee modules
 */

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

const DOM_HELPER_CONFIG = {
    VERSION: '3.0.0',
    DEBUG_MODE: true,
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 3000,
    TOAST_POSITION: 'top-right',
    MOBILE_BREAKPOINT: 768,
    PERFORMANCE_MONITORING: true
};

// =============================================================================
// UTILITY HELPERS
// =============================================================================

/**
 * Get display name for element or ID for logging
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @returns {string} Display name
 */
function getElementDisplayName(elementOrId) {
    if (typeof elementOrId === 'string') {
        return `#${elementOrId}`;
    }
    if (elementOrId?.id) {
        return `#${elementOrId.id}`;
    }
    if (elementOrId?.tagName) {
        return `<${elementOrId.tagName.toLowerCase()}>`;
    }
    if (elementOrId?.className) {
        return `.${elementOrId.className.split(' ')[0]}`;
    }
    return 'unknown element';
}

/**
 * Safe logging with integration to BalanCoffee debug system
 */
function safeLog(message, ...args) {
    if (DOM_HELPER_CONFIG.DEBUG_MODE) {
        if (window.Utils?.debugLog) {
            window.Utils.debugLog(`[DOM Helper] ${message}`, ...args);
        } else {
            console.log(`[DOM Helper] ${message}`, ...args);
        }
    }
}

/**
 * Safe error logging with integration to BalanCoffee debug system
 */
function safeError(message, error) {
    if (window.Utils?.debugError) {
        window.Utils.debugError(`[DOM Helper ERROR] ${message}`, error);
    } else {
        console.error(`[DOM Helper ERROR] ${message}`, error);
    }
}

/**
 * Performance measurement utility
 */
function measurePerformance(operation, fn) {
    if (!DOM_HELPER_CONFIG.PERFORMANCE_MONITORING) {
        return fn();
    }
    
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    if (endTime - startTime > 10) { // Log only if operation takes more than 10ms
        safeLog(`⏱️ ${operation} took ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
}

/**
 * Check if device is mobile
 */
function isMobileDevice() {
    return window.innerWidth <= DOM_HELPER_CONFIG.MOBILE_BREAKPOINT || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// =============================================================================
// ENHANCED ELEMENT SELECTION AND VALIDATION
// =============================================================================

/**
 * Enhanced element finder with multiple strategies and error handling
 * @param {string} elementId - The ID of the element to find
 * @param {boolean} required - Whether the element is required (throws error if not found)
 * @param {boolean} silent - Whether to suppress warnings
 * @returns {HTMLElement|null} The found element or null
 */
function findElement(elementId, required = false, silent = false) {
    return measurePerformance(`findElement(${elementId})`, () => {
        try {
            // Early return for invalid inputs
            if (!elementId || typeof elementId !== 'string') {
                if (!silent) safeError('Invalid elementId provided to findElement', elementId);
                return null;
            }

            // Strategy 1: getElementById (fastest)
            let element = document.getElementById(elementId);
            if (element) return element;
            
            // Strategy 2: querySelector with ID
            element = document.querySelector(`#${elementId}`);
            if (element) return element;
            
            // Strategy 3: querySelector with escaped ID (in case of special characters)
            const escapedId = CSS.escape ? CSS.escape(elementId) : elementId.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
            element = document.querySelector(`#${escapedId}`);
            if (element) return element;
            
            // Strategy 4: querySelector with attribute selector
            element = document.querySelector(`[id="${elementId}"]`);
            if (element) return element;
            
            // Strategy 5: Check if element exists but has different casing
            const allElements = Array.from(document.querySelectorAll('[id]'));
            const similarElement = allElements.find(el => el.id.toLowerCase() === elementId.toLowerCase());
            if (similarElement) {
                if (!silent) {
                    safeLog(`⚠️ Found element with different casing: ${similarElement.id} instead of ${elementId}`);
                }
                return similarElement;
            }
            
            // Element not found
            if (required) {
                const error = new Error(`Required element #${elementId} not found in DOM`);
                safeError('Required element not found', error);
                throw error;
            }
            
            if (!silent) {
                safeLog(`⚠️ Element #${elementId} not found`);
            }
            return null;
            
        } catch (error) {
            safeError(`Error finding element #${elementId}`, error);
            if (required) throw error;
            return null;
        }
    });
}

/**
 * Find multiple elements by selector with validation
 * @param {string} selector - The CSS selector to search for
 * @param {boolean} required - Whether at least one element is required
 * @param {HTMLElement} context - Context element to search within
 * @returns {NodeList|Array} Found elements or empty array
 */
function findElements(selector, required = false, context = document) {
    return measurePerformance(`findElements(${selector})`, () => {
        try {
            if (!selector || typeof selector !== 'string') {
                safeError('Invalid selector provided to findElements', selector);
                return [];
            }

            const elements = context.querySelectorAll(selector);
            
            if (elements.length === 0 && required) {
                const error = new Error(`Required elements with selector "${selector}" not found`);
                safeError('Required elements not found', error);
                throw error;
            }
            
            return elements;
            
        } catch (error) {
            safeError(`Error finding elements with selector "${selector}"`, error);
            if (required) throw error;
            return [];
        }
    });
}

/**
 * Find elements by class name with validation
 * @param {string} className - The class name to search for
 * @param {boolean} required - Whether at least one element is required
 * @param {HTMLElement} context - Context element to search within
 * @returns {NodeList|Array} Found elements or empty array
 */
function findElementsByClass(className, required = false, context = document) {
    const selector = `.${className}`;
    return findElements(selector, required, context);
}

/**
 * Enhanced element validation with comprehensive checks
 * @param {HTMLElement} element - The element to validate
 * @param {string} elementName - Name for error messages
 * @param {boolean} checkVisibility - Whether to check if element is visible
 * @returns {boolean} Whether the element is valid
 */
function validateElement(element, elementName = 'element', checkVisibility = false) {
    try {
        if (!element) {
            safeLog(`⚠️ ${elementName} is null or undefined`);
            return false;
        }
        
        if (!(element instanceof HTMLElement)) {
            safeLog(`⚠️ ${elementName} is not an HTMLElement (type: ${typeof element})`);
            return false;
        }
        
        if (!document.contains(element)) {
            safeLog(`⚠️ ${elementName} is not in the DOM`);
            return false;
        }
        
        if (checkVisibility) {
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                safeLog(`⚠️ ${elementName} is not visible`);
                return false;
            }
        }
        
        return true;
        
    } catch (error) {
        safeError(`Error validating element ${elementName}`, error);
        return false;
    }
}

/**
 * Wait for element to appear in DOM
 * @param {string} elementId - Element ID to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} interval - Check interval in milliseconds
 * @returns {Promise<HTMLElement|null>} Promise that resolves with element or null
 */
function waitForElement(elementId, timeout = 5000, interval = 100) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = findElement(elementId, false, true);
            if (element) {
                safeLog(`✅ Element #${elementId} found after ${Date.now() - startTime}ms`);
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime >= timeout) {
                safeLog(`⏰ Timeout waiting for element #${elementId} after ${timeout}ms`);
                resolve(null);
                return;
            }
            
            setTimeout(checkElement, interval);
        };
        
        checkElement();
    });
}

// =============================================================================
// ENHANCED SAFE DOM MANIPULATION
// =============================================================================

/**
 * Safely set element content with validation and performance optimization
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} content - Content to set
 * @param {boolean} isHTML - Whether content is HTML (default: text)
 * @param {boolean} append - Whether to append instead of replace
 * @returns {boolean} Success status
 */
function setElementContent(elementOrId, content, isHTML = false, append = false) {
    return measurePerformance(`setElementContent(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
                
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            const safeContent = content ?? '';
            
            if (isHTML) {
                // Sanitize HTML content if available
                const sanitizedContent = window.DOMPurify ? 
                    window.DOMPurify.sanitize(safeContent) : 
                    safeContent;
                
                if (append) {
                    element.innerHTML += sanitizedContent;
                } else {
                    element.innerHTML = sanitizedContent;
                }
            } else {
                if (append) {
                    element.textContent += safeContent;
                } else {
                    element.textContent = safeContent;
                }
            }
            
            return true;
            
        } catch (error) {
            safeError(`Error setting content for ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Safely get element content with caching
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} isHTML - Whether to get HTML content (default: text)
 * @param {boolean} trim - Whether to trim whitespace
 * @returns {string} Element content or empty string
 */
function getElementContent(elementOrId, isHTML = false, trim = true) {
    return measurePerformance(`getElementContent(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return '';
            }
            
            const content = isHTML ? element.innerHTML : element.textContent;
            return trim ? content.trim() : content;
            
        } catch (error) {
            safeError(`Error getting content from ${getElementDisplayName(elementOrId)}`, error);
            return '';
        }
    });
}

/**
 * Safely set element attribute with validation
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} attribute - Attribute name
 * @param {string|number|boolean} value - Attribute value
 * @returns {boolean} Success status
 */
function setElementAttribute(elementOrId, attribute, value) {
    return measurePerformance(`setElementAttribute(${getElementDisplayName(elementOrId)}, ${attribute})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            if (!attribute || typeof attribute !== 'string') {
                safeError('Invalid attribute name', attribute);
                return false;
            }
            
            // Handle different value types
            if (value === null || value === undefined) {
                element.removeAttribute(attribute);
            } else if (typeof value === 'boolean') {
                if (value) {
                    element.setAttribute(attribute, '');
                } else {
                    element.removeAttribute(attribute);
                }
            } else {
                element.setAttribute(attribute, String(value));
            }
            
            return true;
            
        } catch (error) {
            safeError(`Error setting attribute ${attribute} for ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Safely get element attribute
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} attribute - Attribute name
 * @param {string} defaultValue - Default value if attribute doesn't exist
 * @returns {string} Attribute value or default value
 */
function getElementAttribute(elementOrId, attribute, defaultValue = '') {
    return measurePerformance(`getElementAttribute(${getElementDisplayName(elementOrId)}, ${attribute})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return defaultValue;
            }
            
            const value = element.getAttribute(attribute);
            return value !== null ? value : defaultValue;
            
        } catch (error) {
            safeError(`Error getting attribute ${attribute} from ${getElementDisplayName(elementOrId)}`, error);
            return defaultValue;
        }
    });
}

/**
 * Enhanced toggle element visibility with animation support
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} show - Whether to show (true) or hide (false)
 * @param {string} displayType - Display type when showing (default: 'block')
 * @param {boolean} animate - Whether to animate the transition
 * @returns {Promise<boolean>} Success status
 */
function toggleElementVisibility(elementOrId, show, displayType = 'block', animate = false) {
    return new Promise((resolve) => {
        measurePerformance(`toggleElementVisibility(${getElementDisplayName(elementOrId)})`, async () => {
            try {
                const element = typeof elementOrId === 'string' 
                    ? findElement(elementOrId) 
                    : elementOrId;
                
                if (!validateElement(element, getElementDisplayName(elementOrId))) {
                    resolve(false);
                    return;
                }
                
                if (animate && window.CSS && CSS.supports('transition', 'opacity 0.3s')) {
                    if (show) {
                        element.style.opacity = '0';
                        element.style.display = displayType;
                        // Force reflow
                        element.offsetHeight;
                        element.style.transition = `opacity ${DOM_HELPER_CONFIG.ANIMATION_DURATION}ms ease-in-out`;
                        element.style.opacity = '1';
                        
                        setTimeout(() => {
                            element.style.transition = '';
                            resolve(true);
                        }, DOM_HELPER_CONFIG.ANIMATION_DURATION);
                    } else {
                        element.style.transition = `opacity ${DOM_HELPER_CONFIG.ANIMATION_DURATION}ms ease-in-out`;
                        element.style.opacity = '0';
                        
                        setTimeout(() => {
                            element.style.display = 'none';
                            element.style.transition = '';
                            element.style.opacity = '';
                            resolve(true);
                        }, DOM_HELPER_CONFIG.ANIMATION_DURATION);
                    }
                } else {
                    element.style.display = show ? displayType : 'none';
                    resolve(true);
                }
                
            } catch (error) {
                safeError(`Error toggling visibility for ${getElementDisplayName(elementOrId)}`, error);
                resolve(false);
            }
        });
    });
}

/**
 * Set multiple CSS properties at once
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {object} styles - Object containing CSS properties
 * @returns {boolean} Success status
 */
function setElementStyles(elementOrId, styles) {
    return measurePerformance(`setElementStyles(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            if (!styles || typeof styles !== 'object') {
                safeError('Invalid styles object', styles);
                return false;
            }
            
            Object.entries(styles).forEach(([property, value]) => {
                if (value !== null && value !== undefined) {
                    element.style[property] = value;
                }
            });
            
            return true;
            
        } catch (error) {
            safeError(`Error setting styles for ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

// =============================================================================
// ENHANCED CLASS MANAGEMENT
// =============================================================================

/**
 * Safely add CSS class to element with validation
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string|Array} classNames - Class name(s) to add
 * @returns {boolean} Success status
 */
function addClass(elementOrId, classNames) {
    return measurePerformance(`addClass(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            const classes = Array.isArray(classNames) ? classNames : [classNames];
            
            classes.forEach(className => {
                if (className && typeof className === 'string') {
                    element.classList.add(className.trim());
                }
            });
            
            return true;
            
        } catch (error) {
            safeError(`Error adding class(es) ${classNames} to ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Safely remove CSS class from element
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string|Array} classNames - Class name(s) to remove
 * @returns {boolean} Success status
 */
function removeClass(elementOrId, classNames) {
    return measurePerformance(`removeClass(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            const classes = Array.isArray(classNames) ? classNames : [classNames];
            
            classes.forEach(className => {
                if (className && typeof className === 'string') {
                    element.classList.remove(className.trim());
                }
            });
            
            return true;
            
        } catch (error) {
            safeError(`Error removing class(es) ${classNames} from ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Safely toggle CSS class on element
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add (true) or remove (false)
 * @returns {boolean} Final state of the class (true if added, false if removed)
 */
function toggleClass(elementOrId, className, force = undefined) {
    return measurePerformance(`toggleClass(${getElementDisplayName(elementOrId)}, ${className})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            if (!className || typeof className !== 'string') {
                safeError('Invalid class name', className);
                return false;
            }
            
            return element.classList.toggle(className.trim(), force);
            
        } catch (error) {
            safeError(`Error toggling class ${className} on ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Check if element has specific class(es)
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string|Array} classNames - Class name(s) to check
 * @param {boolean} requireAll - Whether all classes must be present (default: false)
 * @returns {boolean} Whether element has the class(es)
 */
function hasClass(elementOrId, classNames, requireAll = false) {
    return measurePerformance(`hasClass(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            const classes = Array.isArray(classNames) ? classNames : [classNames];
            
            if (requireAll) {
                return classes.every(className => 
                    className && element.classList.contains(className.trim())
                );
            } else {
                return classes.some(className => 
                    className && element.classList.contains(className.trim())
                );
            }
            
        } catch (error) {
            safeError(`Error checking class(es) ${classNames} on ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Replace one class with another
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} oldClass - Class to remove
 * @param {string} newClass - Class to add
 * @returns {boolean} Success status
 */
function replaceClass(elementOrId, oldClass, newClass) {
    return measurePerformance(`replaceClass(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            if (oldClass) element.classList.remove(oldClass.trim());
            if (newClass) element.classList.add(newClass.trim());
            
            return true;
            
        } catch (error) {
            safeError(`Error replacing class ${oldClass} with ${newClass} on ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

// =============================================================================
// ENHANCED EVENT HANDLING
// =============================================================================

/**
 * Enhanced event listener with error handling and options
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} eventType - Event type (e.g., 'click', 'change')
 * @param {Function} handler - Event handler function
 * @param {object|boolean} options - Event listener options or useCapture
 * @returns {Function|null} Cleanup function to remove the event listener
 */
function addEventListenerSafe(elementOrId, eventType, handler, options = {}) {
    return measurePerformance(`addEventListenerSafe(${getElementDisplayName(elementOrId)}, ${eventType})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return null;
            }
            
            if (typeof handler !== 'function') {
                safeError(`Handler for ${eventType} on ${getElementDisplayName(elementOrId)} is not a function`, handler);
                return null;
            }
            
            // Create a safe wrapper that catches errors
            const safeHandler = (event) => {
                try {
                    // Add BalanCoffee specific event enhancements
                    if (window.Utils?.enhanceEvent) {
                        window.Utils.enhanceEvent(event);
                    }
                    return handler(event);
                } catch (error) {
                    safeError(`Error in ${eventType} handler for ${getElementDisplayName(elementOrId)}`, error);
                    // Prevent further event propagation on error
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            
            // Add mobile-specific touch handling
            if (isMobileDevice() && eventType === 'click') {
                element.addEventListener('touchstart', safeHandler, { passive: true, ...options });
            }
            
            element.addEventListener(eventType, safeHandler, options);
            
            // Return cleanup function
            return () => {
                element.removeEventListener(eventType, safeHandler, options);
                if (isMobileDevice() && eventType === 'click') {
                    element.removeEventListener('touchstart', safeHandler, options);
                }
            };
            
        } catch (error) {
            safeError(`Error adding ${eventType} listener to ${getElementDisplayName(elementOrId)}`, error);
            return null;
        }
    });
}

/**
 * Safely remove event listener
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {object|boolean} options - Event listener options
 * @returns {boolean} Success status
 */
function removeEventListenerSafe(elementOrId, eventType, handler, options = {}) {
    return measurePerformance(`removeEventListenerSafe(${getElementDisplayName(elementOrId)}, ${eventType})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            element.removeEventListener(eventType, handler, options);
            return true;
            
        } catch (error) {
            safeError(`Error removing ${eventType} listener from ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Add delegated event listener for dynamic content
 * @param {string|HTMLElement} parentElementOrId - Parent element or element ID
 * @param {string} selector - CSS selector for target elements
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {object} options - Event listener options
 * @returns {Function|null} Cleanup function
 */
function addDelegatedEventListener(parentElementOrId, selector, eventType, handler, options = {}) {
    return measurePerformance(`addDelegatedEventListener(${getElementDisplayName(parentElementOrId)})`, () => {
        try {
            const parentElement = typeof parentElementOrId === 'string' 
                ? findElement(parentElementOrId) 
                : parentElementOrId;
            
            if (!validateElement(parentElement, getElementDisplayName(parentElementOrId))) {
                return null;
            }
            
            const delegatedHandler = (event) => {
                const target = event.target.closest(selector);
                if (target && parentElement.contains(target)) {
                    try {
                        handler.call(target, event);
                    } catch (error) {
                        safeError(`Error in delegated ${eventType} handler`, error);
                    }
                }
            };
            
            parentElement.addEventListener(eventType, delegatedHandler, options);
            
            return () => {
                parentElement.removeEventListener(eventType, delegatedHandler, options);
            };
            
        } catch (error) {
            safeError(`Error adding delegated ${eventType} listener`, error);
            return null;
        }
    });
}

/**
 * Trigger custom event on element
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} eventType - Event type
 * @param {object} eventData - Data to pass with the event
 * @param {boolean} bubbles - Whether the event should bubble
 * @returns {boolean} Success status
 */
function triggerEvent(elementOrId, eventType, eventData = {}, bubbles = true) {
    return measurePerformance(`triggerEvent(${getElementDisplayName(elementOrId)}, ${eventType})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            const event = new CustomEvent(eventType, {
                detail: eventData,
                bubbles: bubbles,
                cancelable: true
            });
            
            element.dispatchEvent(event);
            return true;
            
        } catch (error) {
            safeError(`Error triggering ${eventType} event on ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

// =============================================================================
// ENHANCED FORM HANDLING
// =============================================================================

/**
 * Safely get form field value with type conversion
 * @param {string|HTMLElement} fieldOrId - Form field or field ID
 * @param {string} type - Expected type (string, number, boolean, array)
 * @returns {*} Field value converted to specified type
 */
function getFieldValue(fieldOrId, type = 'string') {
    return measurePerformance(`getFieldValue(${getElementDisplayName(fieldOrId)})`, () => {
        try {
            const field = typeof fieldOrId === 'string' 
                ? findElement(fieldOrId) 
                : fieldOrId;
            
            if (!validateElement(field, getElementDisplayName(fieldOrId))) {
                return getDefaultValue(type);
            }
            
            let value = field.value || '';
            
            // Handle different field types
            if (field.type === 'checkbox') {
                value = field.checked;
            } else if (field.type === 'radio') {
                const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
                const checkedRadio = Array.from(radioGroup).find(radio => radio.checked);
                value = checkedRadio ? checkedRadio.value : '';
            } else if (field.multiple && field.selectedOptions) {
                value = Array.from(field.selectedOptions).map(option => option.value);
            }
            
            // Convert to requested type
            return convertValue(value, type);
            
        } catch (error) {
            safeError(`Error getting value from field ${getElementDisplayName(fieldOrId)}`, error);
            return getDefaultValue(type);
        }
    });
}

/**
 * Safely set form field value with validation
 * @param {string|HTMLElement} fieldOrId - Form field or field ID
 * @param {*} value - Value to set
 * @param {boolean} triggerChange - Whether to trigger change event
 * @returns {boolean} Success status
 */
function setFieldValue(fieldOrId, value, triggerChange = true) {
    return measurePerformance(`setFieldValue(${getElementDisplayName(fieldOrId)})`, () => {
        try {
            const field = typeof fieldOrId === 'string' 
                ? findElement(fieldOrId) 
                : fieldOrId;
            
            if (!validateElement(field, getElementDisplayName(fieldOrId))) {
                return false;
            }
            
            const safeValue = value ?? '';
            
            // Handle different field types
            if (field.type === 'checkbox') {
                field.checked = Boolean(safeValue);
            } else if (field.type === 'radio') {
                const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
                radioGroup.forEach(radio => {
                    radio.checked = radio.value === String(safeValue);
                });
            } else if (field.multiple && Array.isArray(safeValue)) {
                Array.from(field.options).forEach(option => {
                    option.selected = safeValue.includes(option.value);
                });
            } else {
                field.value = String(safeValue);
            }
            
            // Trigger change event
            if (triggerChange) {
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            return true;
            
        } catch (error) {
            safeError(`Error setting value for field ${getElementDisplayName(fieldOrId)}`, error);
            return false;
        }
    });
}

/**
 * Clear form field(s)
 * @param {string|HTMLElement|Array} fieldOrIds - Form field(s) or field ID(s)
 * @param {boolean} triggerChange - Whether to trigger change event
 * @returns {boolean} Success status
 */
function clearField(fieldOrIds, triggerChange = true) {
    const fields = Array.isArray(fieldOrIds) ? fieldOrIds : [fieldOrIds];
    let success = true;
    
    fields.forEach(fieldOrId => {
        if (!setFieldValue(fieldOrId, '', triggerChange)) {
            success = false;
        }
    });
    
    return success;
}

/**
 * Enable or disable form field(s)
 * @param {string|HTMLElement|Array} fieldOrIds - Form field(s) or field ID(s)
 * @param {boolean} enabled - Whether field should be enabled
 * @returns {boolean} Success status
 */
function setFieldEnabled(fieldOrIds, enabled) {
    const fields = Array.isArray(fieldOrIds) ? fieldOrIds : [fieldOrIds];
    let success = true;
    
    fields.forEach(fieldOrId => {
        try {
            const field = typeof fieldOrId === 'string' 
                ? findElement(fieldOrId) 
                : fieldOrId;
            
            if (!validateElement(field, getElementDisplayName(fieldOrId))) {
                success = false;
                return;
            }
            
            field.disabled = !enabled;
            
            // Update visual state
            if (enabled) {
                removeClass(field, 'disabled');
                setElementAttribute(field, 'aria-disabled', false);
            } else {
                addClass(field, 'disabled');
                setElementAttribute(field, 'aria-disabled', true);
            }
            
        } catch (error) {
            safeError(`Error setting enabled state for field ${getElementDisplayName(fieldOrId)}`, error);
            success = false;
        }
    });
    
    return success;
}

/**
 * Validate form with comprehensive rules
 * @param {string|HTMLElement} formOrId - Form element or ID
 * @param {object} rules - Validation rules
 * @param {boolean} showErrors - Whether to show error messages
 * @returns {object} Validation result
 */
function validateForm(formOrId, rules = {}, showErrors = true) {
    return measurePerformance(`validateForm(${getElementDisplayName(formOrId)})`, () => {
        try {
            const form = typeof formOrId === 'string' 
                ? findElement(formOrId) 
                : formOrId;
            
            if (!validateElement(form, getElementDisplayName(formOrId))) {
                return { isValid: false, errors: ['Form not found'], fields: {} };
            }

            const result = {
                isValid: true,
                errors: [],
                fields: {},
                errorCount: 0
            };
            
            // Clear previous errors
            if (showErrors) {
                clearFormErrors(form);
            }
            
            // Get all form fields
            const fields = form.querySelectorAll('input, select, textarea');
            
            fields.forEach(field => {
                const fieldName = field.name || field.id;
                if (!fieldName) return;
                
                const fieldRules = rules[fieldName] || {};
                const fieldErrors = [];
                const value = getFieldValue(field);
                
                // Required validation
                if (fieldRules.required && !validateRequired(value, field.type)) {
                    fieldErrors.push(fieldRules.requiredMessage || `${fieldName} là bắt buộc`);
                }
                
                // Type-specific validations
                if (value && fieldRules.email && !validateEmail(value)) {
                    fieldErrors.push(fieldRules.emailMessage || 'Email không đúng định dạng');
                }
                
                if (value && fieldRules.phone && !validatePhone(value)) {
                    fieldErrors.push(fieldRules.phoneMessage || 'Số điện thoại không đúng định dạng');
                }
                
                if (value && fieldRules.url && !validateUrl(value)) {
                    fieldErrors.push(fieldRules.urlMessage || 'URL không đúng định dạng');
                }
                
                // Length validations
                if (fieldRules.minLength && value.length < fieldRules.minLength) {
                    fieldErrors.push(fieldRules.minLengthMessage || `${fieldName} phải có ít nhất ${fieldRules.minLength} ký tự`);
                }
                
                if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                    fieldErrors.push(fieldRules.maxLengthMessage || `${fieldName} không được vượt quá ${fieldRules.maxLength} ký tự`);
                }
                
                // Pattern validation
                if (fieldRules.pattern && !new RegExp(fieldRules.pattern).test(value)) {
                    fieldErrors.push(fieldRules.patternMessage || `${fieldName} không đúng định dạng`);
                }
                
                // Custom validation function
                if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                    const customResult = fieldRules.custom(value, field);
                    if (customResult !== true) {
                        fieldErrors.push(customResult || 'Giá trị không hợp lệ');
                    }
                }
                
                // Store field result
                result.fields[fieldName] = {
                    value: value,
                    errors: fieldErrors,
                    isValid: fieldErrors.length === 0
                };
                
                if (fieldErrors.length > 0) {
                    result.isValid = false;
                    result.errors.push(...fieldErrors);
                    result.errorCount += fieldErrors.length;
                    
                    if (showErrors) {
                        showFieldError(field, fieldErrors[0]);
                    }
                }
            });
            
            return result;
            
        } catch (error) {
            safeError('Error validating form', error);
            return { isValid: false, errors: ['Validation error occurred'], fields: {} };
        }
    });
}

// Validation helper functions
function validateRequired(value, fieldType) {
    if (fieldType === 'checkbox') return Boolean(value);
    return value && String(value).trim() !== '';
}

function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
    return /^[\d\s\-+()]+$/.test(value.replace(/\s/g, ''));
}

function validateUrl(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function getDefaultValue(type) {
    switch (type) {
        case 'number': return 0;
        case 'boolean': return false;
        case 'array': return [];
        case 'object': return {};
        default: return '';
    }
}

function convertValue(value, type) {
    switch (type) {
        case 'number': return Number(value) || 0;
        case 'boolean': return Boolean(value);
        case 'array': return Array.isArray(value) ? value : [value];
        case 'object': return typeof value === 'object' ? value : { value };
        default: return String(value);
    }
}

function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.field-error, .error-message');
    errorElements.forEach(el => el.remove());
    
    const errorFields = form.querySelectorAll('.error, .is-invalid');
    errorFields.forEach(field => {
        removeClass(field, ['error', 'is-invalid']);
        setElementAttribute(field, 'aria-invalid', false);
    });
}

function showFieldError(field, message) {
    addClass(field, 'error');
    setElementAttribute(field, 'aria-invalid', true);
    
    // Create error message element
    const errorElement = createElement('div', {
        className: 'field-error',
        role: 'alert'
    }, message);
    
    // Insert error message after field
    if (field.parentNode) {
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
}

// =============================================================================
// ENHANCED UTILITY FUNCTIONS
// =============================================================================

/**
 * Enhanced DOM ready function with loading states
 * @param {Function} callback - Function to execute when DOM is ready
 * @param {boolean} showLoading - Whether to show loading indicator
 */
function onDOMReady(callback, showLoading = false) {
    const executeCallback = () => {
        try {
            if (showLoading && window.hideLoadingScreen) {
                window.hideLoadingScreen();
            }
            callback();
            safeLog('✅ DOM ready callback executed successfully');
        } catch (error) {
            safeError('Error in DOM ready callback', error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeCallback);
    } else {
        // DOM is already ready
        setTimeout(executeCallback, 0);
    }
}

/**
 * Enhanced element creator with advanced options
 * @param {string} tagName - HTML tag name
 * @param {object} attributes - Object of attributes to set
 * @param {string} content - Text content (optional)
 * @param {string} innerHTML - HTML content (optional)
 * @param {HTMLElement} parent - Parent element to append to
 * @returns {HTMLElement} Created element
 */
function createElement(tagName, attributes = {}, content = '', innerHTML = '', parent = null) {
    return measurePerformance(`createElement(${tagName})`, () => {
        try {
            const element = document.createElement(tagName);
            
            // Set attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className' || key === 'class') {
                    element.className = value;
                } else if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else if (key === 'dataset' && typeof value === 'object') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else if (value !== null && value !== undefined) {
                    element.setAttribute(key, value);
                }
            });
            
            // Set content
            if (innerHTML) {
                element.innerHTML = window.DOMPurify ? 
                    window.DOMPurify.sanitize(innerHTML) : 
                    innerHTML;
            } else if (content) {
                element.textContent = content;
            }
            
            // Append to parent if provided
            if (parent && validateElement(parent)) {
                parent.appendChild(element);
            }
            
            return element;
            
        } catch (error) {
            safeError(`Error creating element ${tagName}`, error);
            return null;
        }
    });
}

/**
 * Safely append child element with validation
 * @param {string|HTMLElement} parentOrId - Parent element or ID
 * @param {HTMLElement} child - Child element to append
 * @param {number} position - Position to insert at (optional)
 * @returns {boolean} Success status
 */
function appendChildSafe(parentOrId, child, position = -1) {
    return measurePerformance(`appendChildSafe(${getElementDisplayName(parentOrId)})`, () => {
        try {
            const parent = typeof parentOrId === 'string' 
                ? findElement(parentOrId) 
                : parentOrId;
            
            if (!validateElement(parent, getElementDisplayName(parentOrId))) {
                return false;
            }
            
            if (!validateElement(child, 'Child element')) {
                return false;
            }
            
            if (position >= 0 && position < parent.children.length) {
                parent.insertBefore(child, parent.children[position]);
            } else {
                parent.appendChild(child);
            }
            
            return true;
            
        } catch (error) {
            safeError(`Error appending child to ${getElementDisplayName(parentOrId)}`, error);
            return false;
        }
    });
}

/**
 * Safely remove element with cleanup
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} animate - Whether to animate removal
 * @returns {Promise<boolean>} Success status
 */
function removeElementSafe(elementOrId, animate = false) {
    return new Promise((resolve) => {
        measurePerformance(`removeElementSafe(${getElementDisplayName(elementOrId)})`, async () => {
            try {
                const element = typeof elementOrId === 'string' 
                    ? findElement(elementOrId) 
                    : elementOrId;
                
                if (!validateElement(element, getElementDisplayName(elementOrId))) {
                    resolve(false);
                    return;
                }
                
                // Clean up event listeners
                if (element._eventCleanup && Array.isArray(element._eventCleanup)) {
                    element._eventCleanup.forEach(cleanup => {
                        if (typeof cleanup === 'function') cleanup();
                    });
                }
                
                if (animate && window.CSS && CSS.supports('transition', 'opacity 0.3s')) {
                    element.style.transition = `opacity ${DOM_HELPER_CONFIG.ANIMATION_DURATION}ms ease-out`;
                    element.style.opacity = '0';
                    
                    setTimeout(() => {
                        if (element.parentNode) {
                            element.remove();
                        }
                        resolve(true);
                    }, DOM_HELPER_CONFIG.ANIMATION_DURATION);
                } else {
                    element.remove();
                    resolve(true);
                }
                
            } catch (error) {
                safeError(`Error removing element ${getElementDisplayName(elementOrId)}`, error);
                resolve(false);
            }
        });
    });
}

/**
 * Enhanced scroll to element with options
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {object} options - Scroll options
 * @returns {Promise<boolean>} Success status
 */
function scrollToElement(elementOrId, options = {}) {
    return new Promise((resolve) => {
        measurePerformance(`scrollToElement(${getElementDisplayName(elementOrId)})`, () => {
            try {
                const element = typeof elementOrId === 'string' 
                    ? findElement(elementOrId) 
                    : elementOrId;
                
                if (!validateElement(element, getElementDisplayName(elementOrId))) {
                    resolve(false);
                    return;
                }
                
                const defaultOptions = {
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                };
                
                const scrollOptions = { ...defaultOptions, ...options };
                
                // Add offset for fixed headers if needed
                if (options.offset) {
                    const elementRect = element.getBoundingClientRect();
                    window.scrollTo({
                        top: window.scrollY + elementRect.top - options.offset,
                        behavior: scrollOptions.behavior
                    });
                } else {
                    element.scrollIntoView(scrollOptions);
                }
                
                // Resolve after scroll animation
                setTimeout(() => resolve(true), scrollOptions.behavior === 'smooth' ? 500 : 0);
                
            } catch (error) {
                safeError(`Error scrolling to element ${getElementDisplayName(elementOrId)}`, error);
                resolve(false);
            }
        });
    });
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @param {boolean} showNotification - Whether to show success notification
 * @returns {Promise<boolean>} Success status
 */
function copyToClipboard(text, showNotification = true) {
    return new Promise(async (resolve) => {
        try {
            // Modern clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                if (showNotification && window.UIManager?.showNotification) {
                    window.UIManager.showNotification('Đã sao chép vào clipboard', 'success');
                }
                resolve(true);
                return;
            }
            
            // Fallback for older browsers
            const textArea = createElement('textarea', {
                value: text,
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '2em',
                    height: '2em',
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent'
                }
            });
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful && showNotification && window.UIManager?.showNotification) {
                window.UIManager.showNotification('Đã sao chép vào clipboard', 'success');
            }
            
            resolve(successful);
            
        } catch (error) {
            safeError('Error copying to clipboard', error);
            resolve(false);
        }
    });
}

// =============================================================================
// ENHANCED DEBUGGING AND DIAGNOSTICS
// =============================================================================

/**
 * Enhanced DOM state validation with comprehensive reporting
 * @param {Array<string>} requiredElementIds - Array of required element IDs
 * @param {object} options - Validation options
 * @returns {object} Detailed validation report
 */
function validateDOMState(requiredElementIds = [], options = {}) {
    return measurePerformance('validateDOMState', () => {
        const defaultOptions = {
            checkVisibility: false,
            checkAccessibility: false,
            checkDuplicates: true,
            logResults: true
        };
        
        const validationOptions = { ...defaultOptions, ...options };
        
        const report = {
            timestamp: new Date().toISOString(),
            valid: true,
            missing: [],
            found: [],
            warnings: [],
            accessibility: [],
            performance: {},
            duplicates: [],
            totalElements: document.querySelectorAll('*').length
        };
        
        try {
            // Check required elements
            requiredElementIds.forEach(elementId => {
                const element = findElement(elementId, false, true);
                if (element) {
                    const elementInfo = {
                        id: elementId,
                        visible: validationOptions.checkVisibility ? 
                            window.getComputedStyle(element).display !== 'none' : null,
                        accessible: validationOptions.checkAccessibility ? 
                            checkElementAccessibility(element) : null
                    };
                    report.found.push(elementInfo);
                } else {
                    report.missing.push(elementId);
                    report.valid = false;
                }
            });
            
            // Check for duplicate IDs
            if (validationOptions.checkDuplicates) {
                const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
                const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
                
                if (duplicateIds.length > 0) {
                    report.duplicates = [...new Set(duplicateIds)];
                    report.warnings.push(`Duplicate IDs found: ${report.duplicates.join(', ')}`);
                }
            }
            
            // Performance metrics
            report.performance = {
                domElements: document.querySelectorAll('*').length,
                scriptsLoaded: document.querySelectorAll('script').length,
                stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
                images: document.querySelectorAll('img').length,
                memoryUsage: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : 'Not available'
            };
            
            // BalanCoffee specific checks
            report.balancoffeeModules = {
                utils: typeof window.Utils !== 'undefined',
                dataManager: typeof window.DataManager !== 'undefined',
                orderManager: typeof window.OrderManager !== 'undefined',
                uiManager: typeof window.UIManager !== 'undefined',
                modalManager: typeof window.ModalManager !== 'undefined',
                shiftManager: typeof window.ShiftManager !== 'undefined'
            };
            
            if (validationOptions.logResults) {
                safeLog('📋 DOM Validation Report:', report);
            }
            
            return report;
            
        } catch (error) {
            safeError('Error validating DOM state', error);
            report.valid = false;
            report.warnings.push('Validation error occurred');
            return report;
        }
    });
}

/**
 * Enhanced element information getter for debugging
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} detailed - Whether to include detailed information
 * @returns {object} Comprehensive element information
 */
function getElementInfo(elementOrId, detailed = false) {
    return measurePerformance(`getElementInfo(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId, false, true) 
                : elementOrId;
            
            if (!element) {
                return { 
                    exists: false, 
                    error: 'Element not found',
                    searchedFor: typeof elementOrId === 'string' ? elementOrId : 'Unknown'
                };
            }
            
            const computedStyle = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            
            const basicInfo = {
                exists: true,
                tagName: element.tagName.toLowerCase(),
                id: element.id || null,
                className: element.className || null,
                textContent: element.textContent?.substring(0, 100) + (element.textContent?.length > 100 ? '...' : ''),
                attributes: Array.from(element.attributes).map(attr => ({
                    name: attr.name,
                    value: attr.value
                })),
                computedDisplay: computedStyle.display,
                computedVisibility: computedStyle.visibility,
                parentElement: element.parentElement?.tagName.toLowerCase() || null,
                childElementCount: element.childElementCount,
                position: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                }
            };
            
            if (detailed) {
                return {
                    ...basicInfo,
                    innerHTML: element.innerHTML?.substring(0, 200) + (element.innerHTML?.length > 200 ? '...' : ''),
                    computedStyle: {
                        display: computedStyle.display,
                        visibility: computedStyle.visibility,
                        opacity: computedStyle.opacity,
                        zIndex: computedStyle.zIndex,
                        position: computedStyle.position,
                        backgroundColor: computedStyle.backgroundColor,
                        color: computedStyle.color,
                        fontSize: computedStyle.fontSize,
                        fontFamily: computedStyle.fontFamily
                    },
                    eventListeners: getEventListenersInfo(element),
                    accessibility: checkElementAccessibility(element),
                    performance: {
                        renderTime: measureElementRenderTime(element),
                        isInViewport: isElementInViewport(element)
                    }
                };
            }
            
            return basicInfo;
            
        } catch (error) {
            safeError(`Error getting info for ${getElementDisplayName(elementOrId)}`, error);
            return { exists: false, error: error.message };
        }
    });
}

/**
 * Performance monitoring for DOM operations
 * @returns {object} Performance metrics
 */
function getDOMPerformanceMetrics() {
    return measurePerformance('getDOMPerformanceMetrics', () => {
        try {
            const metrics = {
                timestamp: new Date().toISOString(),
                navigation: performance.getEntriesByType('navigation')[0] || {},
                memory: performance.memory ? {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                } : null,
                domStats: {
                    totalElements: document.querySelectorAll('*').length,
                    totalTextNodes: getTextNodeCount(),
                    scriptsCount: document.querySelectorAll('script').length,
                    stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]').length,
                    imagesCount: document.querySelectorAll('img').length
                },
                paintMetrics: performance.getEntriesByType('paint').reduce((acc, entry) => {
                    acc[entry.name] = entry.startTime;
                    return acc;
                }, {}),
                balancoffeeMetrics: {
                    domHelperVersion: DOM_HELPER_CONFIG.VERSION,
                    operationsPerformed: window.domHelperOperations || 0,
                    errorsEncountered: window.domHelperErrors || 0
                }
            };
            
            return metrics;
            
        } catch (error) {
            safeError('Error getting DOM performance metrics', error);
            return { error: error.message };
        }
    });
}

// Helper functions for debugging
function checkElementAccessibility(element) {
    return {
        hasAriaLabel: element.hasAttribute('aria-label'),
        hasAriaDescribedBy: element.hasAttribute('aria-describedby'),
        hasRole: element.hasAttribute('role'),
        hasTabIndex: element.hasAttribute('tabindex'),
        isFocusable: element.tabIndex >= 0,
        hasAltText: element.tagName === 'IMG' ? element.hasAttribute('alt') : null
    };
}

function getEventListenersInfo(element) {
    // This is a simplified version - real implementation would require DevTools API
    const events = [];
    
    // Check for common inline event handlers
    ['onclick', 'onchange', 'onsubmit', 'onload'].forEach(event => {
        if (element[event]) {
            events.push(event.substring(2));
        }
    });
    
    return events;
}

function measureElementRenderTime(element) {
    const start = performance.now();
    element.offsetHeight; // Force reflow
    return performance.now() - start;
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function getTextNodeCount() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let count = 0;
    while (walker.nextNode()) {
        count++;
    }
    
    return count;
}

// =============================================================================
// PERFORMANCE AND UTILITY HELPERS
// =============================================================================

/**
 * Enhanced debounce with immediate option
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func(...args);
    };
}

/**
 * Enhanced throttle with leading and trailing options
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @param {object} options - Throttle options
 * @returns {Function} Throttled function
 */
function throttle(func, limit, options = {}) {
    const defaultOptions = { leading: true, trailing: true };
    const throttleOptions = { ...defaultOptions, ...options };
    
    let inThrottle, lastFunc, lastRan;
    
    return function(...args) {
        if (!inThrottle) {
            if (throttleOptions.leading) {
                func.apply(this, args);
            }
            lastRan = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (Date.now() - lastRan >= limit) {
                    if (throttleOptions.trailing) {
                        func.apply(this, args);
                    }
                    lastRan = Date.now();
                    inThrottle = false;
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Create custom fade animation
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} show - Whether to show or hide
 * @param {number} duration - Animation duration in ms
 * @param {string} easing - CSS easing function
 * @returns {Promise<boolean>} Success status
 */
function fadeElement(elementOrId, show, duration = DOM_HELPER_CONFIG.ANIMATION_DURATION, easing = 'ease-in-out') {
    return new Promise((resolve) => {
        measurePerformance(`fadeElement(${getElementDisplayName(elementOrId)})`, () => {
            try {
                const element = typeof elementOrId === 'string' 
                    ? findElement(elementOrId) 
                    : elementOrId;
                
                if (!validateElement(element, getElementDisplayName(elementOrId))) {
                    resolve(false);
                    return;
                }
                
                if (show) {
                    element.style.opacity = '0';
                    element.style.display = 'block';
                    element.offsetHeight; // Force reflow
                    
                    element.style.transition = `opacity ${duration}ms ${easing}`;
                    element.style.opacity = '1';
                    
                    setTimeout(() => {
                        element.style.transition = '';
                        resolve(true);
                    }, duration);
                } else {
                    element.style.transition = `opacity ${duration}ms ${easing}`;
                    element.style.opacity = '0';
                    
                    setTimeout(() => {
                        element.style.display = 'none';
                        element.style.transition = '';
                        element.style.opacity = '';
                        resolve(true);
                    }, duration);
                }
                
            } catch (error) {
                safeError(`Error fading element ${getElementDisplayName(elementOrId)}`, error);
                resolve(false);
            }
        });
    });
}

// =============================================================================
// BALANCOFFEE SPECIFIC INTEGRATIONS
// =============================================================================

/**
 * Enhanced modal management for BalanCoffee
 * @param {string|HTMLElement} modalOrId - Modal element or ID
 * @param {boolean} show - Whether to show or hide
 * @param {object} options - Modal options
 * @returns {Promise<boolean>} Success status
 */
function toggleModal(modalOrId, show, options = {}) {
    return new Promise((resolve) => {
        measurePerformance(`toggleModal(${getElementDisplayName(modalOrId)})`, () => {
            try {
                const modal = typeof modalOrId === 'string' 
                    ? findElement(modalOrId) 
                    : modalOrId;
                
                if (!validateElement(modal, getElementDisplayName(modalOrId))) {
                    resolve(false);
                    return;
                }
                
                const defaultOptions = {
                    backdrop: true,
                    keyboard: true,
                    focus: true,
                    animation: true
                };
                
                const modalOptions = { ...defaultOptions, ...options };
                
                if (show) {
                    // Show modal
                    modal.style.display = 'flex';
                    if (modalOptions.animation) {
                        modal.style.opacity = '0';
                        setTimeout(() => {
                            modal.style.opacity = '1';
                            addClass(modal, 'show');
                        }, 10);
                    } else {
                        addClass(modal, 'show');
                    }
                    
                    // Add backdrop
                    if (modalOptions.backdrop) {
                        addModalBackdrop(modal);
                    }
                    
                    // Focus management
                    if (modalOptions.focus) {
                        const focusable = modal.querySelector('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
                        if (focusable) {
                            setTimeout(() => focusable.focus(), 100);
                        }
                    }
                    
                    // Keyboard handling
                    if (modalOptions.keyboard) {
                        setupModalKeyboardHandling(modal);
                    }
                    
                    // Integrate with BalanCoffee tracking
                    if (window.Utils?.trackEvent) {
                        window.Utils.trackEvent('modal_opened', { modalId: modal.id });
                    }
                    
                    setTimeout(() => resolve(true), modalOptions.animation ? DOM_HELPER_CONFIG.ANIMATION_DURATION : 0);
                    
                } else {
                    // Hide modal
                    removeClass(modal, 'show');
                    
                    setTimeout(() => {
                        modal.style.display = 'none';
                        modal.style.opacity = '';
                        
                        // Remove backdrop
                        removeModalBackdrop();
                        
                        // Clean up keyboard handling
                        cleanupModalKeyboardHandling(modal);
                        
                        // Integrate with BalanCoffee tracking
                        if (window.Utils?.trackEvent) {
                            window.Utils.trackEvent('modal_closed', { modalId: modal.id });
                        }
                        
                        resolve(true);
                        
                    }, modalOptions.animation ? DOM_HELPER_CONFIG.ANIMATION_DURATION : 0);
                }
                
            } catch (error) {
                safeError(`Error toggling modal ${getElementDisplayName(modalOrId)}`, error);
                resolve(false);
            }
        });
    });
}

/**
 * Update badge count with enhanced animation
 * @param {string|HTMLElement} badgeOrId - Badge element or ID
 * @param {number} count - Count to display
 * @param {object} options - Animation options
 * @returns {boolean} Success status
 */
function updateBadgeCount(badgeOrId, count, options = {}) {
    return measurePerformance(`updateBadgeCount(${getElementDisplayName(badgeOrId)})`, () => {
        try {
            const badge = typeof badgeOrId === 'string' 
                ? findElement(badgeOrId) 
                : badgeOrId;
            
            if (!validateElement(badge, getElementDisplayName(badgeOrId))) {
                return false;
            }
            
            const newCount = Math.max(0, parseInt(count) || 0);
            const oldCount = parseInt(badge.textContent) || 0;
            
            const defaultOptions = {
                animate: true,
                maxCount: 99,
                showZero: false
            };
            
            const badgeOptions = { ...defaultOptions, ...options };
            
            // Determine display value
            let displayValue = newCount;
            if (newCount > badgeOptions.maxCount) {
                displayValue = `${badgeOptions.maxCount}+`;
            }
            
            if (newCount === 0 && !badgeOptions.showZero) {
                badge.style.display = 'none';
            } else {
                badge.textContent = displayValue;
                badge.style.display = 'inline-block';
                
                // Add animation if count increased
                if (badgeOptions.animate && newCount > oldCount) {
                    addClass(badge, 'pulse');
                    setTimeout(() => {
                        removeClass(badge, 'pulse');
                    }, DOM_HELPER_CONFIG.ANIMATION_DURATION);
                }
            }
            
            // Update accessibility
            setElementAttribute(badge, 'aria-label', `${newCount} items`);
            
            return true;
            
        } catch (error) {
            safeError(`Error updating badge ${getElementDisplayName(badgeOrId)}`, error);
            return false;
        }
    });
}

/**
 * Enhanced price display with currency formatting
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {number} price - Price to format
 * @param {object} options - Formatting options
 * @returns {boolean} Success status
 */
function displayPrice(elementOrId, price, options = {}) {
    return measurePerformance(`displayPrice(${getElementDisplayName(elementOrId)})`, () => {
        try {
            const element = typeof elementOrId === 'string' 
                ? findElement(elementOrId) 
                : elementOrId;
            
            if (!validateElement(element, getElementDisplayName(elementOrId))) {
                return false;
            }
            
            const defaultOptions = {
                currency: '₫',
                locale: 'vi-VN',
                showCurrency: true,
                animate: false,
                prefix: '',
                suffix: ''
            };
            
            const priceOptions = { ...defaultOptions, ...options };
            
            const numericPrice = Number(price) || 0;
            
            // Format price using locale if available
            let formattedPrice;
            try {
                formattedPrice = new Intl.NumberFormat(priceOptions.locale).format(numericPrice);
            } catch {
                // Fallback formatting
                formattedPrice = numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            
            // Build final display string
            let displayText = priceOptions.prefix;
            displayText += formattedPrice;
            if (priceOptions.showCurrency) {
                displayText += priceOptions.currency;
            }
            displayText += priceOptions.suffix;
            
            // Animate if requested and price changed
            if (priceOptions.animate && element.textContent !== displayText) {
                element.style.transition = 'color 0.3s ease';
                element.style.color = '#4CAF50'; // Green for price updates
                
                setTimeout(() => {
                    element.style.color = '';
                    element.style.transition = '';
                }, 300);
            }
            
            element.textContent = displayText;
            
            // Add accessibility
            setElementAttribute(element, 'aria-label', `Giá ${formattedPrice} ${priceOptions.currency}`);
            
            return true;
            
        } catch (error) {
            safeError(`Error displaying price in ${getElementDisplayName(elementOrId)}`, error);
            return false;
        }
    });
}

/**
 * Enhanced notification system integrated with BalanCoffee
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {object} options - Notification options
 * @returns {HTMLElement} Notification element
 */
function showNotificationDOM(message, type = 'info', options = {}) {
    return measurePerformance('showNotificationDOM', () => {
        try {
            const defaultOptions = {
                duration: DOM_HELPER_CONFIG.NOTIFICATION_DURATION,
                position: DOM_HELPER_CONFIG.TOAST_POSITION,
                closable: true,
                persistent: false,
                showProgress: true
            };
            
            const notificationOptions = { ...defaultOptions, ...options };
            
            // Remove existing notifications if not persistent
            if (!notificationOptions.persistent) {
                const existingNotifications = document.querySelectorAll('.balancoffee-notification');
                existingNotifications.forEach(notification => {
                    removeElementSafe(notification, true);
                });
            }
            
            // Create notification container if it doesn't exist
            let container = findElement('notification-container');
            if (!container) {
                container = createElement('div', {
                    id: 'notification-container',
                    className: `notification-container ${notificationOptions.position}`,
                    style: {
                        position: 'fixed',
                        zIndex: '10000',
                        pointerEvents: 'none'
                    }
                });
                document.body.appendChild(container);
            }
            
            // Create notification element
            const notification = createElement('div', {
                className: `balancoffee-notification notification-${type}`,
                role: 'alert',
                'aria-live': 'polite',
                style: {
                    pointerEvents: 'auto',
                    opacity: '0',
                    transform: 'translateY(-20px)'
                }
            });
            
            // Determine icon based on type
            const icons = {
                success: 'check-circle',
                error: 'times-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            
            const icon = icons[type] || icons.info;
            
            // Build notification content
            let notificationHTML = `
                <div class="notification-content">
                    <i class="fas fa-${icon}" aria-hidden="true"></i>
                    <span class="notification-message">${message}</span>
                </div>
            `;
            
            if (notificationOptions.closable) {
                notificationHTML += `
                    <button class="notification-close" aria-label="Đóng thông báo">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            if (notificationOptions.showProgress && notificationOptions.duration > 0) {
                notificationHTML += '<div class="notification-progress"></div>';
            }
            
            notification.innerHTML = notificationHTML;
            
            // Add event listeners
            if (notificationOptions.closable) {
                const closeButton = notification.querySelector('.notification-close');
                if (closeButton) {
                    addEventListenerSafe(closeButton, 'click', () => {
                        removeElementSafe(notification, true);
                    });
                }
            }
            
            // Append to container
            container.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                notification.style.opacity = '1';
                notification.style.transform = 'translateY(0)';
            }, 10);
            
            // Auto remove if duration is set
            if (notificationOptions.duration > 0) {
                const progressBar = notification.querySelector('.notification-progress');
                if (progressBar) {
                    progressBar.style.transition = `width ${notificationOptions.duration}ms linear`;
                    setTimeout(() => {
                        progressBar.style.width = '0%';
                    }, 10);
                }
                
                setTimeout(() => {
                    if (notification.parentElement) {
                        removeElementSafe(notification, true);
                    }
                }, notificationOptions.duration);
            }
            
            // Integrate with BalanCoffee tracking
            if (window.Utils?.trackEvent) {
                window.Utils.trackEvent('notification_shown', { type, message: message.substring(0, 50) });
            }
            
            return notification;
            
        } catch (error) {
            safeError('Error showing notification', error);
            
            // Fallback to browser alert
            if (type === 'error') {
                alert(`Lỗi: ${message}`);
            } else {
                console.log(`[${type.toUpperCase()}] ${message}`);
            }
            
            return null;
        }
    });
}

// Helper functions for modal management
function addModalBackdrop(modal) {
    let backdrop = findElement('modal-backdrop');
    if (!backdrop) {
        backdrop = createElement('div', {
            id: 'modal-backdrop',
            className: 'modal-backdrop',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: '1040',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            }
        });
        
        document.body.appendChild(backdrop);
        
        // Animate in
        setTimeout(() => {
            backdrop.style.opacity = '1';
        }, 10);
        
        // Close modal on backdrop click
        addEventListenerSafe(backdrop, 'click', () => {
            if (modal && hasClass(modal, 'show')) {

                toggleModal(modal, false);
            }
        });
    }
}

function removeModalBackdrop() {
    const backdrop = findElement('modal-backdrop');
    if (backdrop) {
        backdrop.style.opacity = '0';
        setTimeout(() => {
            removeElementSafe(backdrop);
        }, 300);
    }
}

function setupModalKeyboardHandling(modal) {
    const keydownHandler = (e) => {
        if (e.key === 'Escape') {
            toggleModal(modal, false);
        }
        
        if (e.key === 'Tab') {
            trapFocus(modal, e);
        }
    };
    
    document.addEventListener('keydown', keydownHandler);
    modal._keydownHandler = keydownHandler;
}

function cleanupModalKeyboardHandling(modal) {
    if (modal._keydownHandler) {
        document.removeEventListener('keydown', modal._keydownHandler);
        delete modal._keydownHandler;
    }
}

function trapFocus(modal, event) {
    const focusableElements = modal.querySelectorAll(
        'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

// =============================================================================
// EXPORTS AND INITIALIZATION
// =============================================================================

// Initialize performance counters
window.domHelperOperations = 0;
window.domHelperErrors = 0;

// Enhanced DOMHelper namespace with full BalanCoffee integration
window.DOMHelper = {
    // Version and config
    VERSION: DOM_HELPER_CONFIG.VERSION,
    CONFIG: DOM_HELPER_CONFIG,
    
    // Core element functions
    findElement,
    findElements,
    findElementsByClass,
    validateElement,
    waitForElement,
    
    // Content manipulation
    setElementContent,
    getElementContent,
    setElementAttribute,
    getElementAttribute,
    toggleElementVisibility,
    setElementStyles,
    
    // Class management
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    replaceClass,
    
    // Event handling
    addEventListenerSafe,
    removeEventListenerSafe,
    addDelegatedEventListener,
    triggerEvent,
    
    // Form handling
    getFieldValue,
    setFieldValue,
    clearField,
    setFieldEnabled,
    validateForm,
    
    // Utilities
    onDOMReady,
    createElement,
    appendChildSafe,
    removeElementSafe,
    scrollToElement,
    copyToClipboard,
    
    // BalanCoffee specific
    toggleModal,
    updateBadgeCount,
    displayPrice,
    showNotificationDOM,
    
    // Animation helpers
    fadeElement,
    
    // Performance utilities
    debounce,
    throttle,
    measurePerformance,
    
    // Debugging and diagnostics
    validateDOMState,
    getElementInfo,
    getDOMPerformanceMetrics,
    
    // Utility helpers
    isMobileDevice,
    getElementDisplayName,
    safeLog,
    safeError
};

// Export individual functions for backward compatibility
const functionsToExport = [
    'findElement', 'setElementContent', 'getElementContent', 'toggleElementVisibility',
    'addClass', 'removeClass', 'toggleClass', 'hasClass', 'addEventListenerSafe',
    'removeEventListenerSafe', 'getFieldValue', 'setFieldValue', 'clearField',
    'setFieldEnabled', 'onDOMReady', 'createElement', 'appendChildSafe',
    'removeElementSafe', 'scrollToElement', 'fadeElement', 'toggleModal',
    'updateBadgeCount', 'displayPrice', 'showNotificationDOM', 'validateForm',
    'debounce', 'throttle', 'validateDOMState', 'getElementInfo', 'copyToClipboard'
];

functionsToExport.forEach(funcName => {
    if (window.DOMHelper[funcName]) {
        window[funcName] = window.DOMHelper[funcName];
    }
});

// Integration with BalanCoffee modules
if (typeof window !== 'undefined') {
    // Enhanced integration with existing BalanCoffee utilities
    if (window.Utils) {
        window.Utils.DOMHelper = window.DOMHelper;
        window.Utils.findElement = findElement;
        window.Utils.setElementContent = setElementContent;
        window.Utils.toggleElementVisibility = toggleElementVisibility;
    }
    
    // Integration with UI Manager
    if (window.UIManager) {
        window.UIManager.DOMHelper = window.DOMHelper;
        // Add DOM manipulation methods to UI Manager
        window.UIManager.findElement = findElement;
        window.UIManager.showNotification = showNotificationDOM;
        window.UIManager.fadeElement = fadeElement;
        window.UIManager.validateForm = validateForm;
    }
    
    // Integration with Modal Manager
    if (window.ModalManager) {
        window.ModalManager.DOMHelper = window.DOMHelper;
        window.ModalManager.toggleModal = toggleModal;
        window.ModalManager.findElement = findElement;
    }
    
    // Add performance monitoring hooks
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        window.domHelperOperations = (window.domHelperOperations || 0) + 1;
        return originalCreateElement.call(this, tagName);
    };
    
    // Global error handler for DOM operations
    window.addEventListener('error', (event) => {
        if (event.filename && event.filename.includes('dom-helper')) {
            window.domHelperErrors = (window.domHelperErrors || 0) + 1;
            safeError('DOM Helper global error caught', event.error);
        }
    });
    
    // Auto-validation on load (development mode)
    if (DOM_HELPER_CONFIG.DEBUG_MODE) {
        onDOMReady(() => {
            setTimeout(() => {
                const report = validateDOMState();
                if (!report.valid) {
                    safeLog('⚠️ DOM validation found issues on page load');
                }
            }, 1000);
        });
    }
    
    // Performance monitoring report
    if (DOM_HELPER_CONFIG.PERFORMANCE_MONITORING) {
        setInterval(() => {
            const metrics = getDOMPerformanceMetrics();
            if (window.Utils?.trackPerformance) {
                window.Utils.trackPerformance('dom_helper_metrics', metrics);
            }
        }, 30000); // Every 30 seconds
    }
}

// CSS for notifications and animations (injected only if not present)
if (typeof document !== 'undefined' && !document.getElementById('dom-helper-styles')) {
    const styles = createElement('style', {
        id: 'dom-helper-styles',
        type: 'text/css'
    });
    
    styles.textContent = `
        /* BalanCoffee DOM Helper Styles */
        .balancoffee-notification {
            position: relative;
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            min-width: 300px;
            max-width: 500px;
            backdrop-filter: blur(8px);
            transform: translateY(0);
            transition: all 0.3s ease;
        }
        
        .notification-success {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
        }
        
        .notification-error {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
        }
        
        .notification-warning {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: white;
        }
        
        .notification-info {
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
        }
        
        .notification-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            width: 100%;
            border-radius: 0 0 8px 8px;
        }
        
        .notification-container {
            position: fixed;
            z-index: 10000;
            pointer-events: none;
        }
        
        .notification-container.top-right {
            top: 20px;
            right: 20px;
        }
        
        .notification-container.top-left {
            top: 20px;
            left: 20px;
        }
        
        .notification-container.bottom-right {
            bottom: 20px;
            right: 20px;
        }
        
        .notification-container.bottom-left {
            bottom: 20px;
            left: 20px;
        }
        
        .pulse {
            animation: pulse 0.3s ease-in-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .field-error {
            color: #f44336;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        }
        
        .error, .is-invalid {
            border-color: #f44336 !important;
            box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2) !important;
        }
        
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1040;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .balancoffee-notification {
                min-width: 280px;
                max-width: calc(100vw - 40px);
                font-size: 13px;
            }
            
            .notification-container {
                left: 20px !important;
                right: 20px !important;
                width: auto;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// Final initialization message
safeLog(`✅ DOM Helper v${DOM_HELPER_CONFIG.VERSION} loaded successfully with full BalanCoffee integration`);
safeLog(`📊 Features: ${Object.keys(window.DOMHelper).length} functions available`);
safeLog(`🔧 Mobile device: ${isMobileDevice()}`);
safeLog(`🎯 Performance monitoring: ${DOM_HELPER_CONFIG.PERFORMANCE_MONITORING ? 'enabled' : 'disabled'}`);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.DOMHelper;
}

if (typeof exports !== 'undefined') {
    exports.DOMHelper = window.DOMHelper;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define('DOMHelper', [], function() {
        return window.DOMHelper;
    });
}
