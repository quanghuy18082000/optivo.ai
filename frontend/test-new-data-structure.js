// Test script for new data structure processing
// This simulates the processWorklogDataForModal function

console.log('🧪 Testing New Data Structure Processing...\n');

// Sample data from user
const sampleData = {
  "worklog": {
    "2025-07-15": [
      {
        "Project Alpha": [
          {
            "Meeting": {
              "progress": 0.09,
              "work_time": 0.75
            }
          }
        ]
      },
      {
        "Project Beta": [
          {
            "Testing": {
              "progress": 0.19,
              "work_time": 1.5
            }
          }
        ]
      },
      {
        "Optivo AI 31": [
          {
            "Uncategorized": {
              "progress": 1,
              "work_time": 15.5
            }
          }
        ]
      }
    ],
    "2025-07-16": [
      {
        "Project Beta": [
          {
            "Uncategorized": {
              "progress": 0.13,
              "work_time": 1.02
            }
          }
        ]
      },
      {
        "Project Gamma": [
          {
            "Uncategorized": {
              "progress": 0.53,
              "work_time": 4.25
            }
          }
        ]
      }
    ]
  },
  "worktimeOfday": 8
};

// Simulate formatDuration function
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Simulate the updated processWorklogDataForModal function
const processWorklogDataForModal = (worklogData, projectId = null) => {
  if (!worklogData) return [];

  const days = [];
  let worklogEntries = {};

  // Handle different data structures
  if (typeof worklogData === 'object' && worklogData !== null) {
    // New structure: { worklog: { "date": [...] }, worktimeOfday: 8 }
    if (worklogData.worklog && typeof worklogData.worklog === 'object') {
      worklogEntries = worklogData.worklog;
    }
  }

  console.log('📊 Processing worklog entries:', Object.keys(worklogEntries));

  // Get all unique dates and sort them (newest first)
  const allDates = Object.keys(worklogEntries).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  allDates.forEach((date) => {
    const activities = [];
    const dayEntries = worklogEntries[date];

    console.log(`\n📅 Processing date: ${date}`);
    console.log(`   Day entries:`, dayEntries.length);

    if (Array.isArray(dayEntries)) {
      dayEntries.forEach((projectEntry, index) => {
        console.log(`   📁 Project entry ${index + 1}:`, Object.keys(projectEntry));
        
        // New structure: each entry is { "Project Name": [{ "Category": { progress, work_time } }] }
        Object.keys(projectEntry).forEach((projectName) => {
          const projectData = projectEntry[projectName];
          
          console.log(`      🏗️ Project: ${projectName}`);
          
          // Filter by project if specified
          if (!projectId || projectName === projectId || projectName.includes(projectId)) {
            if (Array.isArray(projectData)) {
              projectData.forEach((categoryEntry, catIndex) => {
                console.log(`         📋 Category entry ${catIndex + 1}:`, Object.keys(categoryEntry));
                
                Object.keys(categoryEntry).forEach((category) => {
                  const categoryData = categoryEntry[category];
                  
                  if (categoryData && typeof categoryData === 'object') {
                    const workTimeHours = categoryData.work_time || 0;
                    const progress = categoryData.progress || 0;
                    const totalMinutes = Math.round(workTimeHours * 60);
                    const percentage = Math.round(progress * 100);

                    console.log(`            ⚡ ${category}: ${workTimeHours}h (${percentage}%)`);

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
                    });
                  }
                });
              });
            }
          }
        });
      });
    }

    // Calculate total time for the day
    const totalMinutes = activities.reduce(
      (sum, activity) => sum + (activity.hours * 60 + activity.minutes),
      0
    );

    console.log(`   ⏱️ Total time for ${date}: ${formatDuration(totalMinutes)}`);
    console.log(`   📊 Activities count: ${activities.length}`);

    days.push({
      date: date,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      formattedDate: new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      activities: activities,
      totalTime: formatDuration(totalMinutes),
    });
  });

  return days;
};

// Test the function
console.log('🚀 Running test...\n');
const result = processWorklogDataForModal(sampleData);

console.log('\n✅ Final Result:');
console.log(`📊 Total days processed: ${result.length}`);

result.forEach((day, index) => {
  console.log(`\n📅 Day ${index + 1}: ${day.formattedDate} (${day.dayName})`);
  console.log(`   ⏱️ Total time: ${day.totalTime}`);
  console.log(`   📋 Activities: ${day.activities.length}`);
  
  day.activities.forEach((activity, actIndex) => {
    console.log(`      ${actIndex + 1}. ${activity.category} - ${activity.projectName} - ${activity.timeSpent} (${activity.percentage})`);
  });
});

console.log('\n🎉 Test completed successfully!');

// Expected output structure
console.log('\n📋 Expected structure for each activity:');
console.log({
  id: "2025-07-15-Project Alpha-Meeting",
  category: "Meeting",
  projectName: "Project Alpha", 
  timeSpent: "45m",
  percentage: "9%",
  hours: 0,
  minutes: 45,
  progress: 0.09,
  workTime: 0.75
});