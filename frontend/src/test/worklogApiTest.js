/**
 * Test worklog API URL generation with filters
 */

import { buildApiQueryString } from '../utils/urlQueryParams.js';

console.log('=== Testing Worklog API URL Generation ===\n');

// Test 1: Single project filter
const singleProjectParams = {
  user_id: 123,
  project_ids: [1],
  created_after: '2024-01-01',
  created_before: '2024-01-31'
};

const singleProjectQuery = buildApiQueryString(singleProjectParams);
console.log('Test 1 - Single project:');
console.log('Params:', singleProjectParams);
console.log('Query:', singleProjectQuery);
console.log('Expected: user_id=123&project_ids=1&created_after=2024-01-01&created_before=2024-01-31');
console.log('Full URL: /worklogs/list/grouped-by-date?' + singleProjectQuery);
console.log('');

// Test 2: Multiple projects filter (your main use case)
const multipleProjectParams = {
  user_id: 123,
  project_ids: [1, 2, 3, 4],
  category: 'development',
  created_after: '2024-01-01',
  created_before: '2024-01-31',
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  size: 20
};

const multipleProjectQuery = buildApiQueryString(multipleProjectParams);
console.log('Test 2 - Multiple projects:');
console.log('Params:', multipleProjectParams);
console.log('Query:', multipleProjectQuery);
console.log('Expected: user_id=123&project_ids=1&project_ids=2&project_ids=3&project_ids=4&category=development&created_after=2024-01-01&created_before=2024-01-31&sort_by=created_at&sort_order=desc&page=1&size=20');
console.log('Full URL: /worklogs/list/grouped-by-date?' + multipleProjectQuery);
console.log('');

// Test 3: With null/empty values (should be filtered out)
const paramsWithNulls = {
  user_id: 123,
  project_ids: [1, 2, 3],
  category: null,
  created_after: '2024-01-01',
  created_before: '',
  search: undefined,
  sort_by: 'created_at',
  sort_order: 'desc'
};

const filteredQuery = buildApiQueryString(paramsWithNulls);
console.log('Test 3 - With null/empty values:');
console.log('Params:', paramsWithNulls);
console.log('Query:', filteredQuery);
console.log('Expected: user_id=123&project_ids=1&project_ids=2&project_ids=3&created_after=2024-01-01&sort_by=created_at&sort_order=desc');
console.log('Full URL: /worklogs/list/grouped-by-date?' + filteredQuery);
console.log('');

// Test 4: Empty project_ids array (should be filtered out)
const emptyProjectParams = {
  user_id: 123,
  project_ids: [],
  created_after: '2024-01-01'
};

const emptyProjectQuery = buildApiQueryString(emptyProjectParams);
console.log('Test 4 - Empty project_ids array:');
console.log('Params:', emptyProjectParams);
console.log('Query:', emptyProjectQuery);
console.log('Expected: user_id=123&created_after=2024-01-01');
console.log('Full URL: /worklogs/list/grouped-by-date?' + emptyProjectQuery);
console.log('');

// Test 5: Real-world scenario from useWorklog composable
const useWorklogScenario = {
  user_id: 456,
  project_ids: [10, 20, 30],
  category: 'bug-fix',
  created_after: '2024-01-01',
  created_before: '2024-01-31',
  sort_by: 'updated_at',
  sort_order: 'asc',
  page: 2,
  size: 50
};

const useWorklogQuery = buildApiQueryString(useWorklogScenario);
console.log('Test 5 - Real useWorklog scenario:');
console.log('Params:', useWorklogScenario);
console.log('Query:', useWorklogQuery);
console.log('Full URL: /worklogs/list/grouped-by-date?' + useWorklogQuery);
console.log('');

// Test 6: Verify the exact format you requested
const yourRequestedFormat = {
  project_ids: [1, 2, 3]
};

const yourQuery = buildApiQueryString(yourRequestedFormat);
console.log('Test 6 - Your requested format:');
console.log('Params:', yourRequestedFormat);
console.log('Query:', yourQuery);
console.log('Expected: project_ids=1&project_ids=2&project_ids=3');
console.log('Match:', yourQuery === 'project_ids=1&project_ids=2&project_ids=3');
console.log('Full URL: https://api.optivo.ai.stg.madlab.tech/api/worklogs/list/grouped-by-date?' + yourQuery);
console.log('');

console.log('=== All Tests Complete ===');

// Simulate what happens in useWorklog composable
console.log('\n=== Simulating useWorklog composable ===');

const filters = {
  projectIds: [1, 2, 3, 4], // Note: camelCase in composable
  category: 'development',
  createdAfter: '2024-01-01',
  createdBefore: '2024-01-31',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  size: 20
};

const userId = 123;

// This is what happens in the composable
const queryParams = {};
queryParams.user_id = userId;

if (filters.projectIds && filters.projectIds.length > 0) {
  queryParams.project_ids = filters.projectIds; // Now it's an array, not joined string
}

if (filters.category) {
  queryParams.category = filters.category;
}

if (filters.createdAfter) {
  queryParams.created_after = filters.createdAfter;
}

if (filters.createdBefore) {
  queryParams.created_before = filters.createdBefore;
}

queryParams.sort_by = filters.sortBy;
queryParams.sort_order = filters.sortOrder;
queryParams.page = filters.page;
queryParams.size = filters.size;

const composableQuery = buildApiQueryString(queryParams);
console.log('Composable filters:', filters);
console.log('Generated queryParams:', queryParams);
console.log('Final query string:', composableQuery);
console.log('Full URL: /worklogs/list/grouped-by-date?' + composableQuery);

export {
  singleProjectQuery,
  multipleProjectQuery,
  filteredQuery,
  emptyProjectQuery,
  useWorklogQuery,
  yourQuery,
  composableQuery
};