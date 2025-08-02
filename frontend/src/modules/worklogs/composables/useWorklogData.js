import { ref, computed } from 'vue'
import { format, getDaysInMonth } from 'date-fns'

/**
 * Composable for handling worklog data transformation and utilities
 */
export function useWorklogData() {
  // Format helpers
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Progress color mapping based on workload percentage
  const getProgressColor = (progress) => {
    if (!progress || progress === 0) return 'bg-gray-300' // No data

    // Convert to number if it's a string
    const numProgress = Number(progress)
    
    // Overload levels (above 120%)
    if (numProgress >= 150) return 'bg-red-600' // Severe overload (150%+) - Dark red
    if (numProgress >= 120) return 'bg-orange-500' // Overload (120-149%) - Orange

    // Normal working range (80-119%)
    if (numProgress >= 80) return 'bg-green-500' // Normal workload - Green

    // Underwork levels (below 80%)
    if (numProgress >= 50) return 'bg-yellow-500' // Light underwork (50-79%) - Yellow
    if (numProgress >= 30) return 'bg-orange-400' // Moderate underwork (30-49%) - Light orange

    // Very low work (below 30%)
    return 'bg-red-400' // Very low work - Light red
  }

  // Category color mapping
  const getCategoryStyle = (category) => {
    const styles = {
      Communication: 'bg-blue-100 text-blue-800',
      Coding: 'bg-green-100 text-green-800',
      Testing: 'bg-yellow-100 text-yellow-800',
      Meeting: 'bg-purple-100 text-purple-800',
      Design: 'bg-pink-100 text-pink-800',
      Documentation: 'bg-indigo-100 text-indigo-800',
      Research: 'bg-gray-100 text-gray-800',
      Planning: 'bg-orange-100 text-orange-800',
      Review: 'bg-teal-100 text-teal-800',
      Learning: 'bg-red-100 text-red-800',
      General: 'bg-blue-100 text-blue-800',
      Uncategorized: 'bg-gray-100 text-gray-800',
      Other: 'bg-gray-100 text-gray-800',
    }
    return styles[category] || 'bg-gray-100 text-gray-800'
  }

  // Get project name helper
  const getProjectName = (projectId) => {
    // This could be enhanced to use a project store/service
    const projectMap = {
      1: 'Website Redesign',
      2: 'Mobile App',
      3: 'API Integration',
    }
    return projectMap[projectId] || `Project ${projectId}`
  }

  // Transform standard worklog data (array format)
  const transformStandardWorklogData = (worklogs, worktimeOfday = 8) => {
    if (!worklogs || !Array.isArray(worklogs)) {
      return []
    }

    const STANDARD_WORK_DAY = worktimeOfday * 60 // Use worktimeOfday parameter

    // Group worklogs by date
    const worklogsByDate = {}

    // Process each worklog and group by date
    worklogs.forEach((worklog) => {
      const date = worklog.date || worklog.created_at
      if (!date) return

      // Initialize date group if it doesn't exist
      if (!worklogsByDate[date]) {
        worklogsByDate[date] = {
          date: date,
          formattedDate: formatDate(date),
          entries: [],
          totalDuration: 0,
          totalProgress: 0,
        }
      }

      // Calculate duration in minutes
      const durationInMinutes =
        (worklog.duration?.hours || 0) * 60 + (worklog.duration?.minutes || 0)

      // Calculate percentage of standard work day
      const percentOfDay = Math.round(
        (durationInMinutes / STANDARD_WORK_DAY) * 100
      )

      // Add to total duration for this date
      worklogsByDate[date].totalDuration += durationInMinutes


      // Create entry for this worklog
      const entry = {
        id: `${worklog.id}-entry`,
        worklog_id: worklog.id,
        project_id: worklog.project_id,
        project_name: worklog.project_name || getProjectName(worklog.project_id),
        category: worklog.category || 'Uncategorized',
        // category_type: worklog.
        duration: durationInMinutes,
        formattedDuration: formatDuration(durationInMinutes),
        percentOfDay: percentOfDay,
        time_spent: `${percentOfDay}% (${formatDuration(durationInMinutes)})`,

        progress: worklog.progress
          ? Math.round(worklog.progress * 100)
          : percentOfDay,
      }

      // Add entry to the date group
      worklogsByDate[date].entries.push(entry)
    })

    // Convert the grouped data to an array and calculate totals
    const result = Object.values(worklogsByDate).map((dateGroup) => {
      // Calculate total percentage of day (can exceed 100% for overtime)
      const totalPercentOfDay = Math.round(
        (dateGroup.totalDuration / STANDARD_WORK_DAY) * 100
      )

      // Calculate average progress across all entries
      const avgProgress =
        dateGroup.entries.length > 0
          ? Math.round(
              dateGroup.entries.reduce((sum, entry) => sum + entry.progress, 0) /
                dateGroup.entries.length
            )
          : 0

      return {
        id: dateGroup.date,
        worklog_id: dateGroup.date,
        date: dateGroup.date,
        formattedDate: dateGroup.formattedDate,
        duration: dateGroup.totalDuration,
        formattedDuration: formatDuration(dateGroup.totalDuration),
        percentOfDay: totalPercentOfDay,
        entries: dateGroup.entries,
        project: dateGroup.entries[0]?.project_name
          ? { name: dateGroup.entries[0].project_name }
          : null,
      }
    })

    // Sort by date (newest first)
    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // Transform nested worklog data
  const transformNestedWorklogData = (worklogs) => {
    if (!worklogs?.worklog) return []

    const result = []
    const worklogEntries = worklogs.worklog
    const worktimeOfday = worklogs.worktimeOfday || 8

    Object.keys(worklogEntries).forEach((date) => {
      const dayEntries = worklogEntries[date]
      if (!Array.isArray(dayEntries)) return

      let totalDuration = 0
      const entries = []

      dayEntries.forEach((projectEntry) => {
        
        // New structure: each entry is { "Project Name": [{ "Category": { progress, work_time } }] }
        Object.keys(projectEntry).forEach((projectName) => {
          const projectData = projectEntry[projectName]
          
          if (Array.isArray(projectData)) {
            projectData.forEach((categoryEntry) => {
              Object.keys(categoryEntry).forEach((category) => {
                const categoryData = categoryEntry[category]
                
                if (categoryData && typeof categoryData === 'object') {
                  const workTimeHours = categoryData.work_time || 0
                  const progress = categoryData.progress || 0
                  const isSuggested = categoryData.is_suggested ? '(AI)' : ' '
                  const durationInMinutes = Math.round(workTimeHours * 60)
                  totalDuration += durationInMinutes

                  const percentOfDay = (durationInMinutes / (worktimeOfday * 60) * 100).toFixed(1)

                  entries.push({
                    id: `${date}-${projectName}-${category}`,
                    worklog_id: `${date}-${projectName}-${category}`,
                    project_id: projectName, // Use project name as ID for now
                    project_name: projectName,
                    category: category,
                    category_type: isSuggested,
                    duration: durationInMinutes,
                    formattedDuration: formatDuration(durationInMinutes),
                    percentOfDay: percentOfDay,
                    time_spent: `${percentOfDay}% (${formatDuration(durationInMinutes)})`,
                    progress: Math.round(progress * 100),
                    workTime: workTimeHours,
                  })
                }
              })
            })
          }
        })
      })

      const totalPercentOfDay = (totalDuration / (worktimeOfday * 60) * 100).toFixed(1)

      result.push({
        id: date,
        worklog_id: date,
        date: date,
        formattedDate: formatDate(date),
        duration: totalDuration,
        formattedDuration: formatDuration(totalDuration),
        percentOfDay: totalPercentOfDay,
        entries: entries,
        project: entries[0]?.project_name ? { name: entries[0].project_name } : null,
      })
    })

    // Sort by date (newest first)
    return result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // Main transform function
  const transformWorklogData = (worklogs) => {
    if (!worklogs) return []

    // Check if we have the nested worklog structure
    if (worklogs.worklog) {
      return transformNestedWorklogData(worklogs)
    }

    // Check if we have an array of worklogs (standard API response)
    if (Array.isArray(worklogs)) {
      // Try to get worktimeOfday from the first worklog or use default 8
      const worktimeOfday = worklogs[0]?.worktimeOfday || 8
      return transformStandardWorklogData(worklogs, worktimeOfday)
    }

    // Check if we have data with worklogs array (like { data: [...], worktimeOfday: 8 })
    if (worklogs.data && Array.isArray(worklogs.data)) {
      const worktimeOfday = worklogs.worktimeOfday || 8
      return transformStandardWorklogData(worklogs.data, worktimeOfday)
    }

    return []
  }

  // Process worklog data for modal display
  const processWorklogDataForModal = (worklogData, projectId = null) => {
    if (!worklogData) return []

    const days = []
    let worklogEntries = {}

    // Handle different data structures
    if (typeof worklogData === 'object' && worklogData !== null) {
      // New structure: { worklog: { "date": [...] }, worktimeOfday: 8 }
      if (worklogData.worklog && typeof worklogData.worklog === 'object') {
        worklogEntries = worklogData.worklog
      }
      // Legacy structure: { data: {...} } or direct object
      else if (worklogData.data && typeof worklogData.data === 'object') {
        worklogEntries = worklogData.data
      } else {
        worklogEntries = worklogData
      }
    }

    if (typeof worklogEntries !== 'object' || worklogEntries === null) {
      console.error('Unexpected worklog data format:', worklogData)
      return []
    }

    // Get all unique dates and sort them (newest first)
    const allDates = Object.keys(worklogEntries).sort(
      (a, b) => new Date(b) - new Date(a)
    )

    allDates.forEach((date) => {
      const activities = []
      const dayEntries = worklogEntries[date]

      if (Array.isArray(dayEntries)) {
        dayEntries.forEach((projectEntry) => {
          // New structure: each entry is { "Project Name": [{ "Category": { progress, work_time } }] }
          Object.keys(projectEntry).forEach((projectName) => {
            const projectData = projectEntry[projectName]
            
            // Filter by project if specified
            // Support both project ID and project name filtering
            if (!projectId || 
                projectName === projectId || 
                projectName.includes(projectId) ||
                projectId.toString() === projectName ||
                projectName.toLowerCase().includes(projectId.toString().toLowerCase())) {
              if (Array.isArray(projectData)) {
                projectData.forEach((categoryEntry) => {
                  Object.keys(categoryEntry).forEach((category) => {
                    const categoryData = categoryEntry[category]
                    
                    if (categoryData && typeof categoryData === 'object') {
                      const workTimeHours = categoryData.work_time || 0
                      const progress = categoryData.progress || 0
                      const totalMinutes = Math.round(workTimeHours * 60)
                      const percentage = Math.round(progress * 100)

                      activities.push({
                        id: `${date}-${projectName}-${category}`,
                        category: category,
                        projectName: projectName,
                        timeSpent: formatDuration(totalMinutes),
                        percentage: `${percentage}%`,
                        hours: Math.floor(workTimeHours),
                        minutes: Math.round((workTimeHours % 1) * 60),
                        progress: progress,
                        workTime: workTimeHours,
                      })
                    }
                  })
                })
              }
            }
          })
        })
      }

      // Calculate total time for the day
      const totalMinutes = activities.reduce(
        (sum, activity) => sum + (activity.hours * 60 + activity.minutes),
        0
      )

      days.push({
        date: date,
        dayName: format(date, 'EEEE'),
        formattedDate: format(date, 'MMM dd, yyyy'),
        activities: activities,
        totalTime: formatDuration(totalMinutes),
      })
    })

    return days
  }

  // Calculate summary statistics
  const calculateSummaryStats = (processedData) => {
    const totalDays = processedData.length
    let totalMinutes = 0

    processedData.forEach((day) => {
      day.activities.forEach((activity) => {
        totalMinutes += activity.hours * 60 + activity.minutes
      })
    })

    const totalTimeLogged = formatDuration(totalMinutes)
    const averagePerDay = totalDays > 0 ? formatDuration(Math.round(totalMinutes / totalDays)) : '0h'

    return {
      totalDays,
      totalTimeLogged,
      averagePerDay,
    }
  }

  return {
    formatDuration,
    formatDate,
    getProgressColor,
    getCategoryStyle,
    getProjectName,
    transformWorklogData,
    transformStandardWorklogData,
    transformNestedWorklogData,
    processWorklogDataForModal,
    calculateSummaryStats,
  }
}