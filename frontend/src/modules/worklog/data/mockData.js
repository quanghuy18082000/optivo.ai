// Extended mock data with more entries for pagination testing
export const mockWorklogs = [
    {
      id: 1,
      date: '2025-04-19',
      project_name: 'Project Name 01',
      overall_progress: 75,
      entries: [
        {
          id: 1,
          category: 'Communication',
          time_spent: '25% (2h)',
          progress: 100,
        },
        {
          id: 2,
          category: 'Coding',
          time_spent: '25% (2h)',
          progress: 100,
        },
        {
          id: 3,
          category: 'Testing',
          time_spent: '12.5% (1h)',
          progress: 50,
        },
        {
          id: 4,
          category: 'Meeting',
          time_spent: '12.5% (1h)',
          progress: 50,
        },
      ],
    },
    {
      id: 2,
      date: '2025-04-19',
      project_name: 'Common',
      overall_progress: 25,
      entries: [
        {
          id: 5,
          category: 'Learning',
          time_spent: '25% (2h)',
          progress: 100,
        },
      ],
    },
    {
      id: 3,
      date: '2025-04-18',
      project_name: 'Project Name 01',
      overall_progress: 75,
      entries: [
        {
          id: 6,
          category: 'Communication',
          time_spent: '25% (2h)',
          progress: 100,
        },
        {
          id: 7,
          category: 'Coding',
          time_spent: '25% (2h)',
          progress: 100,
        },
        {
          id: 8,
          category: 'Testing',
          time_spent: '12.5% (1h)',
          progress: 50,
        },
        {
          id: 9,
          category: 'Meeting',
          time_spent: '12.5% (1h)',
          progress: 50,
        },
      ],
    },
    {
      id: 4,
      date: '2025-04-18',
      project_name: 'Common',
      overall_progress: 25,
      entries: [
        {
          id: 10,
          category: 'Learning',
          time_spent: '25% (2h)',
          progress: 100,
        },
      ],
    },
    {
      id: 5,
      date: '2025-04-17',
      project_name: 'Project Name 02',
      overall_progress: 60,
      entries: [
        {
          id: 11,
          category: 'Communication',
          time_spent: '20% (1.6h)',
          progress: 80,
        },
        {
          id: 12,
          category: 'Coding',
          time_spent: '30% (2.4h)',
          progress: 90,
        },
        {
          id: 13,
          category: 'Testing',
          time_spent: '10% (0.8h)',
          progress: 40,
        },
      ],
    },
    {
      id: 6,
      date: '2025-04-17',
      project_name: 'Project Name 01',
      overall_progress: 85,
      entries: [
        {
          id: 14,
          category: 'Coding',
          time_spent: '40% (3.2h)',
          progress: 95,
        },
        {
          id: 15,
          category: 'Testing',
          time_spent: '20% (1.6h)',
          progress: 75,
        },
      ],
    },
    {
      id: 7,
      date: '2025-04-16',
      project_name: 'Common',
      overall_progress: 40,
      entries: [
        {
          id: 16,
          category: 'Learning',
          time_spent: '30% (2.4h)',
          progress: 80,
        },
        {
          id: 17,
          category: 'Meeting',
          time_spent: '10% (0.8h)',
          progress: 100,
        },
      ],
    },
    {
      id: 8,
      date: '2025-04-16',
      project_name: 'Project Name 02',
      overall_progress: 70,
      entries: [
        {
          id: 18,
          category: 'Communication',
          time_spent: '15% (1.2h)',
          progress: 100,
        },
        {
          id: 19,
          category: 'Coding',
          time_spent: '35% (2.8h)',
          progress: 85,
        },
        {
          id: 20,
          category: 'Testing',
          time_spent: '20% (1.6h)',
          progress: 60,
        },
      ],
    },
    {
      id: 9,
      date: '2025-04-15',
      project_name: 'Project Name 01',
      overall_progress: 90,
      entries: [
        {
          id: 21,
          category: 'Coding',
          time_spent: '50% (4h)',
          progress: 100,
        },
        {
          id: 22,
          category: 'Testing',
          time_spent: '25% (2h)',
          progress: 80,
        },
        {
          id: 23,
          category: 'Communication',
          time_spent: '15% (1.2h)',
          progress: 100,
        },
      ],
    },
    {
      id: 10,
      date: '2025-04-15',
      project_name: 'Common',
      overall_progress: 30,
      entries: [
        {
          id: 24,
          category: 'Learning',
          time_spent: '20% (1.6h)',
          progress: 70,
        },
        {
          id: 25,
          category: 'Meeting',
          time_spent: '10% (0.8h)',
          progress: 100,
        },
      ],
    },
    // Add more entries for pagination testing
    {
      id: 11,
      date: '2025-04-14',
      project_name: 'Project Name 02',
      overall_progress: 65,
      entries: [
        {
          id: 26,
          category: 'Communication',
          time_spent: '25% (2h)',
          progress: 90,
        },
        {
          id: 27,
          category: 'Coding',
          time_spent: '30% (2.4h)',
          progress: 80,
        },
      ],
    },
    {
      id: 12,
      date: '2025-04-14',
      project_name: 'Project Name 01',
      overall_progress: 80,
      entries: [
        {
          id: 28,
          category: 'Testing',
          time_spent: '35% (2.8h)',
          progress: 85,
        },
        {
          id: 29,
          category: 'Meeting',
          time_spent: '15% (1.2h)',
          progress: 100,
        },
      ],
    },
  ]
  
  export const mockProjects = [
    { id: 1, name: 'Project Name 01', status: 'active', color: '#3B82F6' },
    { id: 2, name: 'Project Name 02', status: 'active', color: '#10B981' },
    { id: 3, name: 'Common', status: 'active', color: '#8B5CF6' },
    { id: 4, name: 'Project Alpha', status: 'active', color: '#F59E0B' },
    { id: 5, name: 'Project Beta', status: 'on_hold', color: '#EF4444' },
  ]
  
  export const mockCategories = [
    { id: 1, name: 'Communication', color: '#3B82F6' },
    { id: 2, name: 'Coding', color: '#10B981' },
    { id: 3, name: 'Testing', color: '#F59E0B' },
    { id: 4, name: 'Meeting', color: '#EF4444' },
    { id: 5, name: 'Learning', color: '#8B5CF6' },
    { id: 6, name: 'Documentation', color: '#06B6D4' },
    { id: 7, name: 'Planning', color: '#84CC16' },
  ]
  
  export const mockStats = {
    totalHours: 156,
    totalProjects: 5,
    totalCategories: 7,
    avgProgress: 68,
  }
  
  // Pagination utility function
  export const paginateData = (data, page = 1, limit = 5) => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = data.slice(startIndex, endIndex)
    
    return {
      items: paginatedItems,
      pagination: {
        total: data.length,
        page: page,
        limit: limit,
        total_pages: Math.ceil(data.length / limit),
      }
    }
  }
  
  // Check if filters have any active values
  export const hasActiveFilters = (filters = {}) => {
    return (filters.projectIds && filters.projectIds.length > 0) ||
           (filters.categories && filters.categories.length > 0) ||
           (filters.statuses && filters.statuses.length > 0) ||
           (filters.timePeriod && filters.timePeriod !== 'all') ||
           (filters.dateFrom && filters.dateTo)
  }
  
  // Filter utility function - only apply filters if they have values
  export const filterWorklogs = (data, filters = {}) => {
    // If no active filters, return all data
    if (!hasActiveFilters(filters)) {
      return data
    }
  
    let filteredData = [...data]
    
    // Filter by project IDs (array) - only if projectIds has values
    if (filters.projectIds && filters.projectIds.length > 0) {
      const projectNames = mockProjects
        .filter(p => filters.projectIds.includes(p.id))
        .map(p => p.name)
      filteredData = filteredData.filter(worklog => 
        projectNames.includes(worklog.project_name)
      )
    }
    
    // Filter by categories (array) - only if categories has values
    if (filters.categories && filters.categories.length > 0) {
      filteredData = filteredData.filter(worklog =>
        worklog.entries.some(entry => filters.categories.includes(entry.category))
      )
    }
    
    // Filter by status (array) - only if statuses has values
    if (filters.statuses && filters.statuses.length > 0) {
      // For demo purposes, we'll map progress to status
      filteredData = filteredData.filter(worklog => {
        const status = worklog.overall_progress >= 75 ? 'completed' : 
                      worklog.overall_progress >= 25 ? 'in_progress' : 'on_hold'
        return filters.statuses.includes(status)
      })
    }
    
    // Filter by time period - only if not 'all'
    if (filters.timePeriod && filters.timePeriod !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (filters.timePeriod) {
        case 'last_week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'last_month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'last_3_months':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        case 'custom':
          if (filters.dateFrom && filters.dateTo) {
            startDate = new Date(filters.dateFrom)
            const endDate = new Date(filters.dateTo)
            filteredData = filteredData.filter(worklog => {
              const worklogDate = new Date(worklog.date)
              return worklogDate >= startDate && worklogDate <= endDate
            })
          }
          return filteredData
      }
      
      filteredData = filteredData.filter(worklog => {
        const worklogDate = new Date(worklog.date)
        return worklogDate >= startDate
      })
    }
    
    return filteredData
  }
  
  // Mock API response structure matching the API specification
  export const getMockApiResponse = (filters = {}, page = 1, limit = 5) => {
    const filteredData = filterWorklogs(mockWorklogs, filters)
    const paginatedData = paginateData(filteredData, page, limit)
    
    return {
      data: paginatedData,
      message: "Success"
    }
  }