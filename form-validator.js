/**
 * Form Validator Utility
 * Provides form validation functions
 */

const FormValidator = {
  /**
   * Validate email
   */
  email(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate required field
   */
  required(value) {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  /**
   * Validate min length
   */
  minLength(value, min) {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length >= min;
    }
    return false;
  },

  /**
   * Validate max length
   */
  maxLength(value, max) {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length <= max;
    }
    return false;
  },

  /**
   * Validate number range
   */
  range(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  /**
   * Validate pattern
   */
  pattern(value, regex) {
    return regex.test(value);
  },

  /**
   * Validate form field
   */
  validateField(field, rules) {
    const errors = [];
    
    for (const rule of rules) {
      const { type, value: ruleValue, message } = rule;
      
      let isValid = true;
      
      switch (type) {
        case 'required':
          isValid = this.required(field.value);
          break;
        case 'email':
          isValid = this.email(field.value);
          break;
        case 'minLength':
          isValid = this.minLength(field.value, ruleValue);
          break;
        case 'maxLength':
          isValid = this.maxLength(field.value, ruleValue);
          break;
        case 'range':
          isValid = this.range(field.value, ruleValue.min, ruleValue.max);
          break;
        case 'pattern':
          isValid = this.pattern(field.value, ruleValue);
          break;
        case 'custom':
          isValid = ruleValue(field.value);
          break;
      }
      
      if (!isValid) {
        errors.push(message || `${type} validation failed`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate entire form
   */
  validateForm(form, rules) {
    const errors = {};
    let isValid = true;
    
    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const field = form.querySelector(`[name="${fieldName}"]`) || 
                   form.querySelector(`#${fieldName}`);
      
      if (field) {
        const validation = this.validateField(field, fieldRules);
        if (!validation.valid) {
          errors[fieldName] = validation.errors;
          isValid = false;
        }
      }
    }
    
    return {
      valid: isValid,
      errors
    };
  }
};

// Export
if (typeof window !== 'undefined') {
  window.FormValidator = FormValidator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}

