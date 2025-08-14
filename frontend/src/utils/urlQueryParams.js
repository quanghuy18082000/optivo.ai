/**
 * Utility functions for handling URL query parameters
 */

/**
 * Convert an object to URL query string with proper array handling
 * @param {Object} params - The parameters object
 * @param {Object} options - Configuration options
 * @param {boolean} options.arrayBrackets - Whether to use brackets for arrays (default: false for API compatibility)
 * @param {boolean} options.skipNull - Whether to skip null/undefined values (default: true)
 * @param {boolean} options.skipEmpty - Whether to skip empty strings (default: false)
 * @returns {string} The query string (without leading ?)
 */
export function buildQueryString(params, options = {}) {
  const {
    arrayBrackets = false, // Changed default to false for API compatibility
    skipNull = true,
    skipEmpty = false,
  } = options;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Skip null/undefined values if configured
    if (skipNull && (value === null || value === undefined)) {
      return;
    }

    // Skip empty strings if configured
    if (skipEmpty && value === '') {
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return; // Skip empty arrays
      }

      value.forEach((item) => {
        if (skipNull && (item === null || item === undefined)) {
          return;
        }
        
        const paramKey = arrayBrackets ? `${key}[]` : key;
        searchParams.append(paramKey, String(item));
      });
    }
    // Handle objects (convert to JSON string)
    else if (typeof value === 'object' && value !== null) {
      searchParams.append(key, JSON.stringify(value));
    }
    // Handle primitive values
    else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Parse URL query string back to object with proper array handling
 * @param {string} queryString - The query string (with or without leading ?)
 * @param {Object} options - Configuration options
 * @param {boolean} options.parseArrays - Whether to parse array notation (default: true)
 * @param {boolean} options.parseNumbers - Whether to parse numeric strings (default: false)
 * @param {boolean} options.parseBooleans - Whether to parse boolean strings (default: false)
 * @returns {Object} The parsed parameters object
 */
export function parseQueryString(queryString, options = {}) {
  const {
    parseArrays = true,
    parseNumbers = false,
    parseBooleans = false,
  } = options;

  // Remove leading ? if present
  const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  
  if (!cleanQuery) {
    return {};
  }

  const searchParams = new URLSearchParams(cleanQuery);
  const result = {};

  for (const [key, value] of searchParams.entries()) {
    let parsedValue = value;

    // Parse numbers if configured
    if (parseNumbers && !isNaN(value) && !isNaN(parseFloat(value))) {
      parsedValue = parseFloat(value);
    }
    // Parse booleans if configured
    else if (parseBooleans && (value === 'true' || value === 'false')) {
      parsedValue = value === 'true';
    }

    // Handle array notation
    if (parseArrays && key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2); // Remove []
      
      if (!result[arrayKey]) {
        result[arrayKey] = [];
      }
      
      result[arrayKey].push(parsedValue);
    }
    // Handle regular parameters
    else {
      // If key already exists and it's not an array, convert to array
      if (result[key] !== undefined) {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(parsedValue);
      } else {
        result[key] = parsedValue;
      }
    }
  }

  return result;
}

/**
 * Build URL with query parameters
 * @param {string} baseUrl - The base URL
 * @param {Object} params - The parameters object
 * @param {Object} options - Configuration options (same as buildQueryString)
 * @returns {string} The complete URL with query string
 */
export function buildUrl(baseUrl, params = {}, options = {}) {
  const queryString = buildQueryString(params, options);
  
  if (!queryString) {
    return baseUrl;
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}

/**
 * Merge query parameters with existing URL
 * @param {string} url - The existing URL
 * @param {Object} newParams - New parameters to merge
 * @param {Object} options - Configuration options
 * @returns {string} The updated URL
 */
export function mergeUrlParams(url, newParams = {}, options = {}) {
  const [baseUrl, existingQuery] = url.split('?');
  const existingParams = existingQuery ? parseQueryString(existingQuery, options) : {};
  
  const mergedParams = { ...existingParams, ...newParams };
  
  return buildUrl(baseUrl, mergedParams, options);
}

/**
 * Remove specific parameters from URL
 * @param {string} url - The existing URL
 * @param {string[]} keysToRemove - Array of parameter keys to remove
 * @param {Object} options - Configuration options
 * @returns {string} The updated URL
 */
export function removeUrlParams(url, keysToRemove = [], options = {}) {
  const [baseUrl, existingQuery] = url.split('?');
  
  if (!existingQuery) {
    return baseUrl;
  }

  const existingParams = parseQueryString(existingQuery, options);
  
  keysToRemove.forEach(key => {
    delete existingParams[key];
  });
  
  return buildUrl(baseUrl, existingParams, options);
}

/**
 * Specialized function for API requests with common patterns
 * @param {Object} params - The parameters object
 * @returns {string} The query string formatted for API requests
 */
export function buildApiQueryString(params) {
  return buildQueryString(params, {
    arrayBrackets: false, // No brackets for API compatibility
    skipNull: true,
    skipEmpty: true,
  });
}

// Export default configuration for common use cases
export const defaultOptions = {
  api: {
    arrayBrackets: false, // No brackets for API compatibility
    skipNull: true,
    skipEmpty: true,
  },
  router: {
    arrayBrackets: false,
    skipNull: true,
    skipEmpty: false,
  },
};