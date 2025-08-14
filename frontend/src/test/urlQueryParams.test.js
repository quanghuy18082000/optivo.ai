/**
 * Test file to verify URL query parameters functionality
 */

import { buildQueryString, buildApiQueryString } from '../utils/urlQueryParams.js';

// Test the main functionality
console.log('=== Testing URL Query Parameters ===\n');

// Test 1: Simple array parameters (your requirement)
const testParams1 = {
  project_ids: [1, 2, 3],
  category_ids: [10, 20]
};

const result1 = buildApiQueryString(testParams1);
console.log('Test 1 - Array parameters:');
console.log('Input:', testParams1);
console.log('Output:', result1);
console.log('Expected: project_ids=1&project_ids=2&project_ids=3&category_ids=10&category_ids=20');
console.log('Match:', result1 === 'project_ids=1&project_ids=2&project_ids=3&category_ids=10&category_ids=20');
console.log('');

// Test 2: Mixed parameters
const testParams2 = {
  project_ids: [1, 2, 3, 4],
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  user_id: 123,
  include_archived: true
};

const result2 = buildApiQueryString(testParams2);
console.log('Test 2 - Mixed parameters:');
console.log('Input:', testParams2);
console.log('Output:', result2);
console.log('');

// Test 3: Empty and null values (should be skipped)
const testParams3 = {
  project_ids: [1, 2, 3],
  category_ids: [],
  search: '',
  user_id: null,
  page: 1
};

const result3 = buildApiQueryString(testParams3);
console.log('Test 3 - Empty/null values:');
console.log('Input:', testParams3);
console.log('Output:', result3);
console.log('Expected: project_ids=1&project_ids=2&project_ids=3&page=1');
console.log('Match:', result3 === 'project_ids=1&project_ids=2&project_ids=3&page=1');
console.log('');

// Test 4: With brackets (if needed for some APIs)
const testParams4 = {
  project_ids: [1, 2, 3]
};

const result4 = buildQueryString(testParams4, { arrayBrackets: true });
console.log('Test 4 - With brackets:');
console.log('Input:', testParams4);
console.log('Output:', result4);
console.log('Expected: project_ids[]=1&project_ids[]=2&project_ids[]=3');
console.log('Match:', result4 === 'project_ids[]=1&project_ids[]=2&project_ids[]=3');
console.log('');

// Test 5: Real-world API URL construction
const baseUrl = 'https://api.optivo.ai.stg.madlab.tech/api/worklogs/list/grouped-by-date';
const apiParams = {
  project_ids: [1, 2, 3],
  start_date: '2024-01-01',
  end_date: '2024-01-31'
};

const queryString = buildApiQueryString(apiParams);
const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

console.log('Test 5 - Real-world URL:');
console.log('Base URL:', baseUrl);
console.log('Parameters:', apiParams);
console.log('Query String:', queryString);
console.log('Full URL:', fullUrl);
console.log('Expected format: ...?project_ids=1&project_ids=2&project_ids=3&start_date=2024-01-01&end_date=2024-01-31');
console.log('');

console.log('=== All Tests Complete ===');

// Export for use in other files
export {
  testParams1,
  testParams2,
  testParams3,
  testParams4,
  result1,
  result2,
  result3,
  result4,
  fullUrl
};