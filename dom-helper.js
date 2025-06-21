/**
 * DOM Helper Utilities for BalanCoffee POS System
 * Provides robust DOM manipulation and element management
 * Version: 2.0.0 - Fixed all lint errors
 */

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
    return 'unknown element';
}

// =============================================================================
// ELEMENT SELECTION AND VALIDATION
// =============================================================================

/**
 * Enhanced element finder with multiple strategies and error handling
 * @param {string} elementId - The ID of the element to find
 * @param {boolean} required - Whether the element is required (throws error if not found)
 * @returns {HTMLElement|null} The found element or null
 */
function findElement(elementId, required = false) {
    try {
        // Strategy 1: getElementById
        let element = document.getElementById(elementId);
        if (element) return element;
        
        // Strategy 2: querySelector with ID
        element = document.querySelector(`#${elementId}`);
        if (element) return element;
        
        // Strategy 3: querySelector with escaped ID (in case of special characters)
        element = document.querySelector(`[id="${elementId}"]`);
        if (element) return element;
        
        // Strategy 4: Check if element exists but has different casing
        const allElements = Array.from(document.querySelectorAll('[id]'));
        const similarElement = allElements.find(el => el.id.toLowerCase() === elementId.toLowerCase());
        if (similarElement) {
            console.warn(`⚠️ Found element with different casing: ${similarElement.id} instead of ${elementId}`);
            return similarElement;
        }
        
        // Element not found
        if (required) {
            throw new Error(`Required element #${elementId} not found in DOM`);
        }
        
        console.warn(`⚠️ Element #${elementId} not found`);
        return null;
        
    } catch (error) {
        console.error(`❌ Error finding element #${elementId}:`, error);
        if (required) throw error;
        return null;
    }
}

/**
 * Find multiple elements by class name with validation
 * @param {string} className - The class name to search for
 * @param {boolean} required - Whether at least one element is required
 * @returns {NodeList|Array} Found elements or empty array
 */
function findElementsByClass(className, required = false) {
    try {
        const elements = document.querySelectorAll(`.${className}`);
        
        if (elements.length === 0 && required) {
            throw new Error(`Required elements with class .${className} not found`);
        }
        
        return elements;
        
    } catch (error) {
        console.error(`❌ Error finding elements with class .${className}:`, error);
        if (required) throw error;
        return [];
    }
}

/**
 * Validate that an element exists and is accessible
 * @param {HTMLElement} element - The element to validate
 * @param {string} elementName - Name for error messages
 * @returns {boolean} Whether the element is valid
 */
function validateElement(element, elementName = 'element') {
    if (!element) {
        console.warn(`⚠️ ${elementName} is null or undefined`);
        return false;
    }
    
    if (!(element instanceof HTMLElement)) {
        console.warn(`⚠️ ${elementName} is not an HTMLElement`);
        return false;
    }
    
    if (!document.contains(element)) {
        console.warn(`⚠️ ${elementName} is not in the DOM`);
        return false;
    }
    
    return true;
}

// =============================================================================
// SAFE DOM MANIPULATION
// =============================================================================

/**
 * Safely set element content with validation
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} content - Content to set
 * @param {boolean} isHTML - Whether content is HTML (default: text)
 * @returns {boolean} Success status
 */
function setElementContent(elementOrId, content, isHTML = false) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
            
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        if (isHTML) {
            element.innerHTML = content || '';
        } else {
            element.textContent = content || '';
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error setting content for ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Safely get element content
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} isHTML - Whether to get HTML content (default: text)
 * @returns {string} Element content or empty string
 */
function getElementContent(elementOrId, isHTML = false) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return '';
        }
        
        return isHTML ? element.innerHTML : element.textContent;
        
    } catch (error) {
        console.error(`❌ Error getting content from ${getElementDisplayName(elementOrId)}:`, error);
        return '';
    }
}

/**
 * Safely set element attribute
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} attribute - Attribute name
 * @param {string} value - Attribute value
 * @returns {boolean} Success status
 */
function setElementAttribute(elementOrId, attribute, value) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.setAttribute(attribute, value);
        return true;
        
    } catch (error) {
        console.error(`❌ Error setting attribute ${attribute} for ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Safely toggle element visibility
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} show - Whether to show (true) or hide (false)
 * @param {string} displayType - Display type when showing (default: 'block')
 * @returns {boolean} Success status
 */
function toggleElementVisibility(elementOrId, show, displayType = 'block') {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.style.display = show ? displayType : 'none';
        return true;
        
    } catch (error) {
        console.error(`❌ Error toggling visibility for ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

// =============================================================================
// CLASS MANAGEMENT
// =============================================================================

/**
 * Safely add CSS class to element
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} className - Class name to add
 * @returns {boolean} Success status
 */
function addClass(elementOrId, className) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.classList.add(className);
        return true;
        
    } catch (error) {
        console.error(`❌ Error adding class ${className} to ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Safely remove CSS class from element
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} className - Class name to remove
 * @returns {boolean} Success status
 */
function removeClass(elementOrId, className) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.classList.remove(className);
        return true;
        
    } catch (error) {
        console.error(`❌ Error removing class ${className} from ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Safely toggle CSS class on element
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add (true) or remove (false)
 * @returns {boolean} Success status
 */
function toggleClass(elementOrId, className, force = undefined) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.classList.toggle(className, force);
        return true;
        
    } catch (error) {
        console.error(`❌ Error toggling class ${className} on ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Check if element has specific class
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} className - Class name to check
 * @returns {boolean} Whether element has the class
 */
function hasClass(elementOrId, className) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        return element.classList.contains(className);
        
    } catch (error) {
        console.error(`❌ Error checking class ${className} on ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

// =============================================================================
// EVENT HANDLING
// =============================================================================

/**
 * Safely add event listener with error handling
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} eventType - Event type (e.g., 'click', 'change')
 * @param {Function} handler - Event handler function
 * @param {object} options - Event listener options
 * @returns {boolean} Success status
 */
function addEventListenerSafe(elementOrId, eventType, handler, options = {}) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        if (typeof handler !== 'function') {
            console.error(`❌ Handler for ${eventType} on ${getElementDisplayName(elementOrId)} is not a function`);
            return false;
        }
        
        // Wrap handler with error catching
        const safeHandler = (event) => {
            try {
                handler(event);
            } catch (error) {
                console.error(`❌ Error in ${eventType} handler for ${getElementDisplayName(elementOrId)}:`, error);
            }
        };
        
        element.addEventListener(eventType, safeHandler, options);
        return true;
        
    } catch (error) {
        console.error(`❌ Error adding ${eventType} listener to ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Safely remove event listener
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @returns {boolean} Success status
 */
function removeEventListenerSafe(elementOrId, eventType, handler) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.removeEventListener(eventType, handler);
        return true;
        
    } catch (error) {
        console.error(`❌ Error removing ${eventType} listener from ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

// =============================================================================
// FORM HANDLING
// =============================================================================

/**
 * Safely get form field value
 * @param {string|HTMLElement} fieldOrId - Form field or field ID
 * @returns {string} Field value or empty string
 */
function getFieldValue(fieldOrId) {
    try {
        const field = typeof fieldOrId === 'string' 
            ? findElement(fieldOrId) 
            : fieldOrId;
        
        if (!validateElement(field, getElementDisplayName(fieldOrId))) {
            return '';
        }
        
        return field.value || '';
        
    } catch (error) {
        console.error(`❌ Error getting value from field ${getElementDisplayName(fieldOrId)}:`, error);
        return '';
    }
}

/**
 * Safely set form field value
 * @param {string|HTMLElement} fieldOrId - Form field or field ID
 * @param {string} value - Value to set
 * @returns {boolean} Success status
 */
function setFieldValue(fieldOrId, value) {
    try {
        const field = typeof fieldOrId === 'string' 
            ? findElement(fieldOrId) 
            : fieldOrId;
        
        if (!validateElement(field, getElementDisplayName(fieldOrId))) {
            return false;
        }
        
        field.value = value || '';
        
        // Trigger change event
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
        
    } catch (error) {
        console.error(`❌ Error setting value for field ${getElementDisplayName(fieldOrId)}:`, error);
        return false;
    }
}

/**
 * Clear form field
 * @param {string|HTMLElement} fieldOrId - Form field or field ID
 * @returns {boolean} Success status
 */
function clearField(fieldOrId) {
    return setFieldValue(fieldOrId, '');
}

/**
 * Enable or disable form field
 * @param {string|HTMLElement} fieldOrId - Form field or field ID
 * @param {boolean} enabled - Whether field should be enabled
 * @returns {boolean} Success status
 */
function setFieldEnabled(fieldOrId, enabled) {
    try {
        const field = typeof fieldOrId === 'string' 
            ? findElement(fieldOrId) 
            : fieldOrId;
        
        if (!validateElement(field, getElementDisplayName(fieldOrId))) {
            return false;
        }
        
        field.disabled = !enabled;
        return true;
        
    } catch (error) {
        console.error(`❌ Error setting enabled state for field ${getElementDisplayName(fieldOrId)}:`, error);
        return false;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Wait for DOM to be ready
 * @param {Function} callback - Function to execute when DOM is ready
 */
function onDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Create element safely with attributes and content
 * @param {string} tagName - HTML tag name
 * @param {object} attributes - Object of attributes to set
 * @param {string} content - Text content (optional)
 * @param {string} innerHTML - HTML content (optional)
 * @returns {HTMLElement} Created element
 */
function createElement(tagName, attributes = {}, content = '', innerHTML = '') {
    try {
        const element = document.createElement(tagName);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Set content
        if (innerHTML) {
            element.innerHTML = innerHTML;
        } else if (content) {
            element.textContent = content;
        }
        
        return element;
        
    } catch (error) {
        console.error(`❌ Error creating element ${tagName}:`, error);
        return null;
    }
}

/**
 * Append child element safely
 * @param {string|HTMLElement} parentOrId - Parent element or ID
 * @param {HTMLElement} child - Child element to append
 * @returns {boolean} Success status
 */
function appendChildSafe(parentOrId, child) {
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
        
        parent.appendChild(child);
        return true;
        
    } catch (error) {
        console.error(`❌ Error appending child to ${getElementDisplayName(parentOrId)}:`, error);
        return false;
    }
}

/**
 * Remove element safely
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @returns {boolean} Success status
 */
function removeElementSafe(elementOrId) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.remove();
        return true;
        
    } catch (error) {
        console.error(`❌ Error removing element ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Scroll to element smoothly
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {object} options - Scroll options
 * @returns {boolean} Success status
 */
function scrollToElement(elementOrId, options = { behavior: 'smooth', block: 'center' }) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        element.scrollIntoView(options);
        return true;
        
    } catch (error) {
        console.error(`❌ Error scrolling to element ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

// =============================================================================
// DEBUGGING AND DIAGNOSTICS
// =============================================================================

/**
 * Validate DOM state and report issues
 * @param {Array<string>} requiredElementIds - Array of required element IDs
 * @returns {object} Validation report
 */
function validateDOMState(requiredElementIds = []) {
    const report = {
        valid: true,
        missing: [],
        found: [],
        warnings: []
    };
    
    try {
        requiredElementIds.forEach(elementId => {
            const element = findElement(elementId);
            if (element) {
                report.found.push(elementId);
            } else {
                report.missing.push(elementId);
                report.valid = false;
            }
        });
        
        // Check for duplicate IDs
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
        
        if (duplicateIds.length > 0) {
            report.warnings.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
        }
        
        console.log('📋 DOM Validation Report:', report);
        return report;
        
    } catch (error) {
        console.error('❌ Error validating DOM state:', error);
        report.valid = false;
        return report;
    }
}

/**
 * Get element information for debugging
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @returns {object} Element information
 */
function getElementInfo(elementOrId) {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!element) {
            return { exists: false, error: 'Element not found' };
        }
        
        return {
            exists: true,
            tagName: element.tagName.toLowerCase(),
            id: element.id,
            className: element.className,
            textContent: element.textContent?.substring(0, 100) + '...',
            innerHTML: element.innerHTML?.substring(0, 100) + '...',
            attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            })),
            computedStyle: window.getComputedStyle(element).display,
            parentElement: element.parentElement?.tagName.toLowerCase(),
            childElementCount: element.childElementCount
        };
        
    } catch (error) {
        console.error(`❌ Error getting info for ${getElementDisplayName(elementOrId)}:`, error);
        return { exists: false, error: error.message };
    }
}

// =============================================================================
// ADDITIONAL HELPER FUNCTIONS FOR BALANCOFFEE
// =============================================================================

/**
 * Update element visibility with fade animation
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {boolean} show - Whether to show or hide
 * @param {number} duration - Animation duration in ms
 * @returns {Promise<boolean>} Success status
 */
function fadeElement(elementOrId, show, duration = 300) {
    return new Promise((resolve) => {
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
                // Force reflow
                // Force reflow for animation
                if (element.offsetHeight) { /* reflow */ }
                
                element.style.transition = `opacity ${duration}ms ease-in-out`;
                element.style.opacity = '1';
                
                setTimeout(() => {
                    element.style.transition = '';
                    resolve(true);
                }, duration);
            } else {
                element.style.transition = `opacity ${duration}ms ease-in-out`;
                element.style.opacity = '0';
                
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.transition = '';
                    resolve(true);
                }, duration);
            }
            
        } catch (error) {
            console.error(`❌ Error fading element ${getElementDisplayName(elementOrId)}:`, error);
            resolve(false);
        }
    });
}

/**
 * Toggle modal visibility with proper accessibility
 * @param {string|HTMLElement} modalOrId - Modal element or ID
 * @param {boolean} show - Whether to show or hide
 * @returns {boolean} Success status
 */
function toggleModal(modalOrId, show) {
    try {
        const modal = typeof modalOrId === 'string' 
            ? findElement(modalOrId) 
            : modalOrId;
        
        if (!validateElement(modal, getElementDisplayName(modalOrId))) {
            return false;
        }
        
        if (show) {
            modal.style.display = 'flex';
            // Force reflow
            // Force reflow for animation
            if (modal.offsetHeight) { /* reflow */ }
            modal.classList.add('show');
            
            // Focus first focusable element
            const focusable = modal.querySelector('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                setTimeout(() => focusable.focus(), 50);
            }
            
            // Trap focus in modal
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    toggleModal(modal, false);
                }
                
                if (e.key === 'Tab') {
                    const focusableElements = modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };
            
            modal.addEventListener('keydown', handleKeydown);
            modal._keydownHandler = handleKeydown;
            
        } else {
            modal.classList.remove('show');
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            // Remove event listener
            if (modal._keydownHandler) {
                modal.removeEventListener('keydown', modal._keydownHandler);
                delete modal._keydownHandler;
            }
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error toggling modal ${getElementDisplayName(modalOrId)}:`, error);
        return false;
    }
}

/**
 * Update badge count with animation
 * @param {string|HTMLElement} badgeOrId - Badge element or ID
 * @param {number} count - Count to display
 * @returns {boolean} Success status
 */
function updateBadgeCount(badgeOrId, count) {
    try {
        const badge = typeof badgeOrId === 'string' 
            ? findElement(badgeOrId) 
            : badgeOrId;
        
        if (!validateElement(badge, getElementDisplayName(badgeOrId))) {
            return false;
        }
        
        const newCount = Math.max(0, parseInt(count) || 0);
        
        if (newCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.textContent = newCount.toString();
            badge.style.display = 'inline-block';
            
            // Add pulse animation
            badge.classList.add('pulse');
            setTimeout(() => {
                badge.classList.remove('pulse');
            }, 300);
        }
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error updating badge ${getElementDisplayName(badgeOrId)}:`, error);
        return false;
    }
}

/**
 * Format and display price in elements
 * @param {string|HTMLElement} elementOrId - Element or element ID
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: '₫')
 * @returns {boolean} Success status
 */
function displayPrice(elementOrId, price, currency = '₫') {
    try {
        const element = typeof elementOrId === 'string' 
            ? findElement(elementOrId) 
            : elementOrId;
        
        if (!validateElement(element, getElementDisplayName(elementOrId))) {
            return false;
        }
        
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(price || 0);
        element.textContent = `${formattedPrice}${currency}`;
        
        return true;
        
    } catch (error) {
        console.error(`❌ Error displaying price in ${getElementDisplayName(elementOrId)}:`, error);
        return false;
    }
}

/**
 * Create and show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Display duration in ms
 * @returns {HTMLElement} Notification element
 */
function showNotificationDOM(message, type = 'info', duration = 3000) {
    try {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Create notification element
        const notification = createElement('div', {
            className: `notification notification-${type}`,
            role: 'alert',
            'aria-live': 'polite'
        });
        
        // Determine icon based on type
        let icon;
        if (type === 'success') {
            icon = 'check-circle';
        } else if (type === 'error') {
            icon = 'times-circle';
        } else if (type === 'warning') {
            icon = 'exclamation-triangle';
        } else {
            icon = 'info-circle';
        }
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Đóng thông báo">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
        
        return notification;
        
    } catch (error) {
        console.error('❌ Error showing notification:', error);
        return null;
    }
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Validate form inputs
 * @param {HTMLFormElement|string} formSelector - Form element or selector
 * @param {Object} rules - Validation rules object
 * @returns {Object} Validation result { isValid: boolean, errors: array }
 */
function validateForm(formSelector, rules = {}) {
    try {
        const form = typeof formSelector === 'string' ? 
            document.querySelector(formSelector) : formSelector;
        
        if (!form) {
            console.warn('Form not found:', formSelector);
            return { isValid: false, errors: ['Form not found'] };
        }

        const errors = [];
        
        // Default validation rules
        const defaultRules = {
            required: (value) => value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^[\d\s\-+()]+$/.test(value.replace(/\s/g, '')),
            minLength: (value, length) => value.length >= length,
            maxLength: (value, length) => value.length <= length,
            number: (value) => !isNaN(parseFloat(value)) && isFinite(value)
        };

        // Check all form inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const value = input.value;
            const inputRules = rules[input.name] || rules[input.id] || {};
            
            // Required validation
            if (inputRules.required && !defaultRules.required(value)) {
                errors.push(`${input.name || input.id || 'Field'} is required`);
            }
            
            // Email validation
            if (inputRules.email && value && !defaultRules.email(value)) {
                errors.push(`${input.name || input.id || 'Email'} is not valid`);
            }
            
            // Phone validation
            if (inputRules.phone && value && !defaultRules.phone(value)) {
                errors.push(`${input.name || input.id || 'Phone'} is not valid`);
            }
            
            // Min length validation
            if (inputRules.minLength && value && !defaultRules.minLength(value, inputRules.minLength)) {
                errors.push(`${input.name || input.id || 'Field'} must be at least ${inputRules.minLength} characters`);
            }
            
            // Max length validation
            if (inputRules.maxLength && value && !defaultRules.maxLength(value, inputRules.maxLength)) {
                errors.push(`${input.name || input.id || 'Field'} must be no more than ${inputRules.maxLength} characters`);
            }
            
            // Number validation
            if (inputRules.number && value && !defaultRules.number(value)) {
                errors.push(`${input.name || input.id || 'Field'} must be a valid number`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
        
    } catch (error) {
        console.error('Error validating form:', error);
        return { isValid: false, errors: ['Validation error occurred'] };
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export all functions for use in other modules
window.DOMHelper = {
    // Element selection
    findElement,
    findElementsByClass,
    validateElement,
    
    // Content manipulation
    setElementContent,
    getElementContent,
    setElementAttribute,
    toggleElementVisibility,
    
    // Class management
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    
    // Event handling
    addEventListenerSafe,
    removeEventListenerSafe,
    
    // Form handling
    getFieldValue,
    setFieldValue,
    clearField,
    setFieldEnabled,
    
    // Utilities
    onDOMReady,
    createElement,
    appendChildSafe,
    removeElementSafe,
    scrollToElement,
    
    // Enhanced functions
    fadeElement,
    toggleModal,
    updateBadgeCount,
    displayPrice,
    showNotificationDOM,
    debounce,
    throttle,
    
    // Debugging
    validateDOMState,
    getElementInfo,
    validateForm
};

// Also export individual functions for backward compatibility
window.findElement = findElement;
window.setElementContent = setElementContent;
window.getElementContent = getElementContent;
window.toggleElementVisibility = toggleElementVisibility;
window.addClass = addClass;
window.removeClass = removeClass;
window.toggleClass = toggleClass;
window.hasClass = hasClass;
window.fadeElement = fadeElement;
window.toggleModal = toggleModal;
window.updateBadgeCount = updateBadgeCount;
window.displayPrice = displayPrice;
window.showNotificationDOM = showNotificationDOM;
window.validateForm = validateForm;
window.debounce = debounce;
window.throttle = throttle;

console.log('✅ DOM Helper utilities v2.0 loaded successfully');
