/**
 * Real-world demo of API calls with array parameters
 */

import { get } from '@/utils/requestClient.js';
import { getWorklogsWithFilters, getProjectsWithFilters } from '@/modules/worklogs/services/worklogService.js';

// ===== DEMO: Real API Calls =====

console.log('=== Real-world API Demo ===\n');

// Demo 1: Get worklogs for multiple projects
export async function demoGetWorklogsForMultipleProjects() {
  console.log('Demo 1: Get worklogs for multiple projects');
  
  const filters = {
    project_ids: [1, 2, 3, 4],
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    user_id: 123
  };
  
  console.log('Filters:', filters);
  console.log('Expected URL: /worklogs/list/grouped-by-date?project_ids=1&project_ids=2&project_ids=3&project_ids=4&start_date=2024-01-01&end_date=2024-01-31&user_id=123');
  
  try {
    // This will automatically generate the correct URL format
    const worklogs = await getWorklogsWithFilters(filters);
    console.log('✅ Success! Worklogs fetched:', worklogs?.data?.length || 0, 'items');
    return worklogs;
  } catch (error) {
    console.log('❌ Error (expected in demo):', error.message);
    return null;
  }
}

// Demo 2: Get projects with multiple status filters
export async function demoGetProjectsWithMultipleStatuses() {
  console.log('\nDemo 2: Get projects with multiple statuses');
  
  const filters = {
    status: ['active', 'pending', 'on-hold'],
    team_ids: [1, 2, 3],
    search: 'web development'
  };
  
  console.log('Filters:', filters);
  console.log('Expected URL: /projects?status=active&status=pending&status=on-hold&team_ids=1&team_ids=2&team_ids=3&search=web%20development');
  
  try {
    const projects = await getProjectsWithFilters(filters);
    console.log('✅ Success! Projects fetched:', projects?.data?.length || 0, 'items');
    return projects;
  } catch (error) {
    console.log('❌ Error (expected in demo):', error.message);
    return null;
  }
}

// Demo 3: Direct requestClient usage
export async function demoDirectRequestClientUsage() {
  console.log('\nDemo 3: Direct requestClient usage');
  
  const params = {
    project_ids: [1, 2, 3],
    category_ids: [10, 20],
    include_archived: false
  };
  
  console.log('Parameters:', params);
  console.log('Expected URL: /worklogs/list/grouped-by-date?project_ids=1&project_ids=2&project_ids=3&category_ids=10&category_ids=20&include_archived=false');
  
  try {
    // Direct usage of enhanced GET method
    const response = await get('/worklogs/list/grouped-by-date', params);
    console.log('✅ Success! Response received');
    return response.data;
  } catch (error) {
    console.log('❌ Error (expected in demo):', error.message);
    return null;
  }
}

// Demo 4: Complex filtering scenario
export async function demoComplexFiltering() {
  console.log('\nDemo 4: Complex filtering scenario');
  
  const complexFilters = {
    project_ids: [1, 2, 3, 4, 5],
    category_ids: [10, 20, 30],
    user_ids: [100, 200, 300],
    status: ['active', 'completed'],
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    include_archived: false,
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 50
  };
  
  console.log('Complex filters:', complexFilters);
  console.log('Expected URL format:');
  console.log('/worklogs/list/grouped-by-date?project_ids=1&project_ids=2&project_ids=3&project_ids=4&project_ids=5&category_ids=10&category_ids=20&category_ids=30&user_ids=100&user_ids=200&user_ids=300&status=active&status=completed&start_date=2024-01-01&end_date=2024-12-31&include_archived=false&sort_by=created_at&sort_order=desc&page=1&limit=50');
  
  try {
    const response = await get('/worklogs/list/grouped-by-date', complexFilters);
    console.log('✅ Success! Complex filtering worked');
    return response.data;
  } catch (error) {
    console.log('❌ Error (expected in demo):', error.message);
    return null;
  }
}

// Demo 5: Vue Composition API usage example
export function useDemoWorklogFilters() {
  const filters = {
    project_ids: [],
    category_ids: [],
    start_date: null,
    end_date: null,
    search: ''
  };

  const addProjectFilter = (projectId) => {
    if (!filters.project_ids.includes(projectId)) {
      filters.project_ids.push(projectId);
    }
  };

  const removeProjectFilter = (projectId) => {
    const index = filters.project_ids.indexOf(projectId);
    if (index > -1) {
      filters.project_ids.splice(index, 1);
    }
  };

  const addCategoryFilter = (categoryId) => {
    if (!filters.category_ids.includes(categoryId)) {
      filters.category_ids.push(categoryId);
    }
  };

  const removeCategoryFilter = (categoryId) => {
    const index = filters.category_ids.indexOf(categoryId);
    if (index > -1) {
      filters.category_ids.splice(index, 1);
    }
  };

  const setDateRange = (startDate, endDate) => {
    filters.start_date = startDate;
    filters.end_date = endDate;
  };

  const setSearch = (searchTerm) => {
    filters.search = searchTerm;
  };

  const clearFilters = () => {
    filters.project_ids = [];
    filters.category_ids = [];
    filters.start_date = null;
    filters.end_date = null;
    filters.search = '';
  };

  const fetchFilteredWorklogs = async () => {
    // Remove empty values before API call
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
      })
    );

    console.log('Fetching with filters:', cleanFilters);
    
    try {
      return await getWorklogsWithFilters(cleanFilters);
    } catch (error) {
      console.error('Error fetching filtered worklogs:', error);
      throw error;
    }
  };

  return {
    filters,
    addProjectFilter,
    removeProjectFilter,
    addCategoryFilter,
    removeCategoryFilter,
    setDateRange,
    setSearch,
    clearFilters,
    fetchFilteredWorklogs
  };
}

// Run all demos
export async function runAllDemos() {
  console.log('🚀 Running all API demos...\n');
  
  await demoGetWorklogsForMultipleProjects();
  await demoGetProjectsWithMultipleStatuses();
  await demoDirectRequestClientUsage();
  await demoComplexFiltering();
  
  console.log('\n✅ All demos completed!');
  console.log('\n📝 Summary:');
  console.log('- Arrays are formatted as: project_ids=1&project_ids=2&project_ids=3');
  console.log('- Null/undefined values are automatically skipped');
  console.log('- Empty arrays are automatically skipped');
  console.log('- Empty strings are automatically skipped');
  console.log('- All HTTP methods (GET, POST, PUT, PATCH) support query parameters');
  console.log('- URLs are properly encoded');
}

// Example Vue component usage
export const ExampleVueComponent = {
  setup() {
    const {
      filters,
      addProjectFilter,
      removeProjectFilter,
      fetchFilteredWorklogs
    } = useDemoWorklogFilters();

    // Example: Add some project filters
    addProjectFilter(1);
    addProjectFilter(2);
    addProjectFilter(3);

    // Example: Fetch data
    const loadWorklogs = async () => {
      try {
        const worklogs = await fetchFilteredWorklogs();
        console.log('Loaded worklogs:', worklogs);
      } catch (error) {
        console.error('Failed to load worklogs:', error);
      }
    };

    return {
      filters,
      addProjectFilter,
      removeProjectFilter,
      loadWorklogs
    };
  }
};

// Auto-run demos if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllDemos().catch(console.error);
}