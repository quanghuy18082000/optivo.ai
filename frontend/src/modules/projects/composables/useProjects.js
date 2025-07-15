import { ref, computed } from "vue"
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query"
import { getProjects, deleteProject } from "../services/projectService"

export function useProjects() {
  const queryClient = useQueryClient()

  const filters = ref({
    projectName: "",
    status: "",
    startDate: "",
    endDate: "",
    memberName: ""
  })

  const queryParams = computed(() => {
    const params = {}
    
    // Map frontend filter names to API parameter names
    if (filters.value.projectName) {
      params.name = filters.value.projectName // API expects 'name' parameter
    }
    
    // Add other filter parameters as needed
    // For example, if we have status filter:
    if (filters.value.status) {
      params.status = filters.value.status
    }
    
    // If we have date range filters:
    if (filters.value.startDate) {
      params.start_date = filters.value.startDate
    }
    
    if (filters.value.endDate) {
      params.end_date = filters.value.endDate
    }
    
    // If we have member name filter:
    if (filters.value.memberName) {
      params.member_name = filters.value.memberName
    }
    
    return params
  })

  // Query for fetching projects
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects", queryParams],
    queryFn: () => getProjects(queryParams.value),
    keepPreviousData: true,
  })

  const projects = computed(() => {
    // Check if we have data in the expected format
    if (!projectsData.value) return []
    
    // Handle different possible API response structures
    if (projectsData.value.data && Array.isArray(projectsData.value.data)) {
      return projectsData.value.data
    }
    
    // If the response is directly an array
    if (Array.isArray(projectsData.value)) {
      return projectsData.value
    }
    
    console.warn('Unexpected projects data format:', projectsData.value)
    return []
  })

  // Methods
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      projectName: "",
      status: "",
      startDate: "",
      endDate: "",
      memberName: ""
    }
  }

  // Mutation for deleting a project
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => deleteProject(projectId),
    onSuccess: () => {
      // Invalidate the projects query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      // Force an immediate refetch
      refetch()
    }
  })
  
  // Function to delete a project
  const removeProject = async (projectId) => {
    try {
      return await deleteProjectMutation.mutateAsync(projectId)
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  return {
    // Data
    projects,
    filters,

    // Loading states
    isLoading,
    isDeleting: deleteProjectMutation.isLoading,

    // Errors
    error,
    deleteError: deleteProjectMutation.error,

    // Methods
    updateFilters,
    resetFilters,
    refetch,
    removeProject,
    // createNewProject,
    // updateExistingProject,
  }
}
