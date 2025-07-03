// Mock data for worklogs
import { format, subDays, subWeeks, subMonths } from 'date-fns';

// Generate random time between min and max hours
const randomTime = (minHours, maxHours) => {
  const hours = Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
  return { hours, minutes };
};

// Format time as "Xh Ym"
const formatTimeSpent = (hours, minutes) => {
  if (hours === 0 && minutes === 0) return '0h';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Generate a random progress percentage
const randomProgress = () => Math.floor(Math.random() * 101);

// List of project names
const projectNames = [
  'Website Redesign',
  'Mobile App Development',
  'API Integration',
  'Database Migration',
  'UI/UX Improvements',
  'Performance Optimization',
  'Security Audit',
  'Content Management System',
  'E-commerce Platform',
  'Analytics Dashboard'
];

// List of categories
const categories = [
  'Coding',
  'Meeting',
  'Design',
  'Testing',
  'Documentation',
  'Research',
  'Planning',
  'Communication',
  'Learning',
  'Review'
];

// List of descriptions for each category
const descriptions = {
  'Coding': [
    'Implemented new feature',
    'Fixed bug in authentication',
    'Refactored legacy code',
    'Added unit tests',
    'Optimized database queries'
  ],
  'Meeting': [
    'Weekly team sync',
    'Client requirements discussion',
    'Sprint planning',
    'Retrospective',
    'Project kickoff'
  ],
  'Design': [
    'Created wireframes',
    'Designed UI components',
    'Updated style guide',
    'Prototyped user flow',
    'Reviewed design feedback'
  ],
  'Testing': [
    'Manual testing of new features',
    'Wrote automated tests',
    'Regression testing',
    'Performance testing',
    'Cross-browser compatibility testing'
  ],
  'Documentation': [
    'Updated API docs',
    'Created user guide',
    'Documented code',
    'Wrote release notes',
    'Updated project wiki'
  ],
  'Research': [
    'Evaluated new technologies',
    'Competitive analysis',
    'Market research',
    'Feasibility study',
    'Technical spike'
  ],
  'Planning': [
    'Task breakdown',
    'Resource allocation',
    'Timeline estimation',
    'Risk assessment',
    'Feature prioritization'
  ],
  'Communication': [
    'Client update email',
    'Team status report',
    'Stakeholder presentation',
    'Knowledge sharing session',
    'Onboarding new team member'
  ],
  'Learning': [
    'Online course on React',
    'Studying new framework',
    'Reading technical documentation',
    'Watching tutorial videos',
    'Practicing new skills'
  ],
  'Review': [
    'Code review',
    'Design review',
    'Documentation review',
    'Performance review',
    'Security review'
  ]
};

// Generate a random entry for a worklog
const generateEntry = (projectId, date) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const { hours, minutes } = randomTime(0, 4);
  const progress = randomProgress();
  const description = descriptions[category][Math.floor(Math.random() * descriptions[category].length)];
  
  return {
    id: `entry-${Math.random().toString(36).substr(2, 9)}`,
    project_id: projectId,
    category,
    description,
    hours,
    minutes,
    time_spent: formatTimeSpent(hours, minutes),
    progress,
    date
  };
};

// Generate a worklog with multiple entries
const generateWorklog = (index) => {
  // Generate date (more recent for lower indices)
  let date;
  if (index < 3) {
    date = format(subDays(new Date(), index), 'yyyy-MM-dd');
  } else if (index < 8) {
    date = format(subDays(new Date(), index + 2), 'yyyy-MM-dd');
  } else if (index < 15) {
    date = format(subWeeks(new Date(), Math.floor(index / 5)), 'yyyy-MM-dd');
  } else {
    date = format(subMonths(new Date(), Math.floor(index / 15)), 'yyyy-MM-dd');
  }

  // Generate project
  const projectId = `project-${Math.floor(Math.random() * 10) + 1}`;
  const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];
  
  // Generate 1-3 entries for this worklog
  const entryCount = Math.floor(Math.random() * 3) + 1;
  const entries = [];
  let totalHours = 0;
  let totalMinutes = 0;
  
  for (let i = 0; i < entryCount; i++) {
    const entry = generateEntry(projectId, date);
    entries.push(entry);
    totalHours += entry.hours;
    totalMinutes += entry.minutes;
  }
  
  // Convert excess minutes to hours
  if (totalMinutes >= 60) {
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
  }
  
  // Calculate overall progress as average of entry progresses
  const overallProgress = Math.floor(
    entries.reduce((sum, entry) => sum + entry.progress, 0) / entries.length
  );
  
  return {
    id: `worklog-${Math.random().toString(36).substr(2, 9)}`,
    date,
    project_id: projectId,
    project_name: projectName,
    entries,
    total_hours: totalHours,
    total_minutes: totalMinutes,
    time_spent: formatTimeSpent(totalHours, totalMinutes),
    overall_progress: overallProgress
  };
};

// Generate a list of worklogs
export const generateWorklogs = (count = 20) => {
  return Array.from({ length: count }, (_, i) => generateWorklog(i));
};

// Mock pagination
export const generatePagination = (page = 1, size = 10, totalItems = 50) => {
  return {
    page,
    size,
    total: totalItems,
    total_pages: Math.ceil(totalItems / size)
  };
};

// Mock API response
export const getMockWorklogs = (params = {}) => {
  const page = params.page || 1;
  const size = params.size || 10;
  const totalItems = 50; // Total number of mock items
  
  // Generate all worklogs
  const allWorklogs = generateWorklogs(totalItems);
  
  // Apply filters if provided
  let filteredWorklogs = [...allWorklogs];
  
  if (params.project_id) {
    filteredWorklogs = filteredWorklogs.filter(worklog => worklog.project_id === params.project_id);
  }
  
  if (params.category) {
    filteredWorklogs = filteredWorklogs.filter(worklog => 
      worklog.entries.some(entry => entry.category === params.category)
    );
  }
  
  if (params.created_after) {
    const afterDate = new Date(params.created_after);
    filteredWorklogs = filteredWorklogs.filter(worklog => new Date(worklog.date) >= afterDate);
  }
  
  if (params.created_before) {
    const beforeDate = new Date(params.created_before);
    filteredWorklogs = filteredWorklogs.filter(worklog => new Date(worklog.date) <= beforeDate);
  }
  
  // Apply sorting
  const sortBy = params.sort_by || 'date';
  const sortOrder = params.sort_order || 'desc';
  
  filteredWorklogs.sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'project_name') {
      comparison = a.project_name.localeCompare(b.project_name);
    } else if (sortBy === 'time_spent') {
      const aTime = a.total_hours * 60 + a.total_minutes;
      const bTime = b.total_hours * 60 + b.total_minutes;
      comparison = aTime - bTime;
    } else if (sortBy === 'progress') {
      comparison = a.overall_progress - b.overall_progress;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Apply pagination
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedWorklogs = filteredWorklogs.slice(startIndex, endIndex);
  
  // Create pagination info
  const pagination = {
    page,
    size,
    total: filteredWorklogs.length,
    total_pages: Math.ceil(filteredWorklogs.length / size)
  };
  
  // Return mock response
  return {
    data: {
      items: paginatedWorklogs,
      pagination
    }
  };
};

// Mock worklog by ID
export const getMockWorklogById = (id) => {
  const allWorklogs = generateWorklogs(50);
  const worklog = allWorklogs.find(w => w.id === id) || allWorklogs[0];
  
  return {
    data: worklog
  };
};