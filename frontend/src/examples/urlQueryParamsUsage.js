/**
 * Examples of how to use the URL Query Parameters utility
 */

import { 
  buildQueryString, 
  parseQueryString, 
  buildUrl, 
  mergeUrlParams,
  buildApiQueryString 
} from '@/utils/urlQueryParams.js';

import { 
  getWorklogsWithFilters, 
  getProjectsWithFilters 
} from '@/modules/worklogs/services/worklogService.js';

// ===== BASIC USAGE EXAMPLES =====

console.log('=== Basic Query String Building ===');

// Simple parameters
const simpleParams = {
  page: 1,
  limit: 10,
  search: 'project name'
};

console.log('Simple params:', buildQueryString(simpleParams));
// Output: page=1&limit=10&search=project%20name

// Array parameters (the main feature!)
const arrayParams = {
  projectIds: [1, 2, 3, 4],
  categoryIds: [10, 20],
  status: ['active', 'pending']
};

console.log('Array params:', buildQueryString(arrayParams));
// Output: projectIds=1&projectIds=2&projectIds=3&projectIds=4&categoryIds=10&categoryIds=20&status=active&status=pending

// Mixed parameters
const mixedParams = {
  projectIds: [1, 2, 3, 4],
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  userId: 123,
  includeArchived: true
};

console.log('Mixed params:', buildQueryString(mixedParams));
// Output: projectIds=1&projectIds=2&projectIds=3&projectIds=4&startDate=2024-01-01&endDate=2024-01-31&userId=123&includeArchived=true

// ===== API USAGE EXAMPLES =====

console.log('\n=== API Usage Examples ===');

// Example 1: Get worklogs with multiple project filters
async function getWorklogsForProjects() {
  const filters = {
    projectIds: [1, 2, 3, 4],
    categoryIds: [10, 20],
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    userId: 123
  };
  
  // This will generate URL: /worklogs/list/grouped-by-date?projectIds=1&projectIds=2&projectIds=3&projectIds=4&categoryIds=10&categoryIds=20&startDate=2024-01-01&endDate=2024-01-31&userId=123
  
  try {
    const worklogs = await getWorklogsWithFilters(filters);
    console.log('Filtered worklogs:', worklogs);
    return worklogs;
  } catch (error) {
    console.error('Error fetching worklogs:', error);
  }
}

// Example 2: Get projects with status and team filters
async function getProjectsWithMultipleFilters() {
  const filters = {
    status: ['active', 'pending', 'on-hold'],
    teamIds: [1, 2, 3],
    search: 'web development',
    includeArchived: false
  };
  
  // This will generate URL: /projects?status=active&status=pending&status=on-hold&teamIds=1&teamIds=2&teamIds=3&search=web%20development&includeArchived=false
  
  try {
    const projects = await getProjectsWithFilters(filters);
    console.log('Filtered projects:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

// ===== URL BUILDING EXAMPLES =====

console.log('\n=== URL Building Examples ===');

// Build complete URLs
const baseUrl = 'https://api.example.com/worklogs';
const params = {
  projectIds: [1, 2, 3],
  startDate: '2024-01-01'
};

const completeUrl = buildUrl(baseUrl, params);
console.log('Complete URL:', completeUrl);
// Output: https://api.example.com/worklogs?projectIds=1&projectIds=2&projectIds=3&startDate=2024-01-01

// Merge parameters with existing URL
const existingUrl = 'https://api.example.com/worklogs?page=1&limit=10';
const newParams = {
  projectIds: [1, 2, 3],
  categoryIds: [10]
};

const mergedUrl = mergeUrlParams(existingUrl, newParams);
console.log('Merged URL:', mergedUrl);
// Output: https://api.example.com/worklogs?page=1&limit=10&projectIds=1&projectIds=2&projectIds=3&categoryIds=10

// ===== PARSING EXAMPLES =====

console.log('\n=== Query String Parsing Examples ===');

// Parse query string back to object
const queryString = 'projectIds=1&projectIds=2&projectIds=3&startDate=2024-01-01&userId=123';
const parsedParams = parseQueryString(queryString);
console.log('Parsed params:', parsedParams);
// Output: { projectIds: ['1', '2', '3'], startDate: '2024-01-01', userId: '123' }

// Parse with number conversion
const parsedWithNumbers = parseQueryString(queryString, { parseNumbers: true });
console.log('Parsed with numbers:', parsedWithNumbers);
// Output: { projectIds: [1, 2, 3], startDate: '2024-01-01', userId: 123 }

// ===== REAL WORLD USAGE IN COMPONENTS =====

console.log('\n=== Component Usage Examples ===');

// Example: In a Vue component for filtering worklogs
export const useWorklogFilters = () => {
  const filters = ref({
    projectIds: [],
    categoryIds: [],
    startDate: null,
    endDate: null,
    search: ''
  });

  const fetchFilteredWorklogs = async () => {
    // Remove empty values before sending to API
    const cleanFilters = Object.fromEntries(
      Object.entries(filters.value).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
      })
    );

    if (Object.keys(cleanFilters).length === 0) {
      // No filters, get all worklogs
      return await getWorklogs();
    }

    // Use filtered endpoint
    return await getWorklogsWithFilters(cleanFilters);
  };

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const clearFilters = () => {
    filters.value = {
      projectIds: [],
      categoryIds: [],
      startDate: null,
      endDate: null,
      search: ''
    };
  };

  return {
    filters,
    fetchFilteredWorklogs,
    updateFilters,
    clearFilters
  };
};

// ===== CONFIGURATION OPTIONS =====

console.log('\n=== Configuration Options ===');

// With array brackets (for APIs that require brackets)
const withBrackets = buildQueryString(
  { projectIds: [1, 2, 3] }, 
  { arrayBrackets: true }
);
console.log('With brackets:', withBrackets);
// Output: projectIds[]=1&projectIds[]=2&projectIds[]=3

// Skip null values (default behavior)
const withNulls = {
  projectIds: [1, 2, 3],
  categoryId: null,
  search: undefined,
  page: 1
};

console.log('Skip nulls (default):', buildQueryString(withNulls));
// Output: projectIds=1&projectIds=2&projectIds=3&page=1

console.log('Include nulls:', buildQueryString(withNulls, { skipNull: false }));
// Output: projectIds=1&projectIds=2&projectIds=3&categoryId=null&search=undefined&page=1

// API-specific configuration (recommended for API calls)
console.log('API config:', buildApiQueryString({
  projectIds: [1, 2, 3],
  search: '',
  categoryId: null,
  page: 1
}));
// Output: projectIds=1&projectIds=2&projectIds=3&page=1 (skips empty string and null)

export {
  getWorklogsForProjects,
  getProjectsWithMultipleFilters,
  useWorklogFilters
};