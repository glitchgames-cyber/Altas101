/**
 * DOM Helpers Utility
 * Common DOM manipulation functions
 */

const DOMHelpers = {
  /**
   * Create element with attributes
   */
  create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    }
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },

  /**
   * Show element
   */
  show(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.style.display = '';
      element.hidden = false;
    }
  },

  /**
   * Hide element
   */
  hide(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.style.display = 'none';
      element.hidden = true;
    }
  },

  /**
   * Toggle element visibility
   */
  toggle(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      if (element.style.display === 'none' || element.hidden) {
        this.show(element);
      } else {
        this.hide(element);
      }
    }
  },

  /**
   * Add class
   */
  addClass(element, className) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.add(className);
    }
  },

  /**
   * Remove class
   */
  removeClass(element, className) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.remove(className);
    }
  },

  /**
   * Toggle class
   */
  toggleClass(element, className) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.toggle(className);
    }
  },

  /**
   * Wait for element to exist
   */
  waitFor(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
};

// Export
if (typeof window !== 'undefined') {
  window.DOMHelpers = DOMHelpers;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMHelpers;
}

