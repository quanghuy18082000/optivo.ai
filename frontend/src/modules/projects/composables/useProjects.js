import { ref, computed } from "vue"
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query"
import { getProjects, deleteProject } from "../services/projectService"
import { useLoadingIntegration, LOADING_KEYS } from '@/composables/useLoadingIntegration.js'

export function useProjects() {
  const queryClient = useQueryClient()

  const filters = ref({
    search_text: "",
    start_date: "",
    end_date: "",
    project_ids: [],
    member_ids: []
  })

  const queryParams = computed(() => {
    const params = {}
    
    // Map frontend filter names to API parameter names
    if (filters.value.search_text) {
      params.search_text = filters.value.search_text
    }
    
    // Date range filters
    if (filters.value.start_date) {
      params.start_date = filters.value.start_date
    }
    
    if (filters.value.end_date) {
      params.end_date = filters.value.end_date
    }
    
    // Project IDs filter (array)
    if (filters.value.project_ids && filters.value.project_ids.length > 0) {
      params.project_ids = filters.value.project_ids
    }
    
    // Member IDs filter (array)
    if (filters.value.member_ids && filters.value.member_ids.length > 0) {
      params.member_ids = filters.value.member_ids
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

  // Integrate with global loading screen
  useLoadingIntegration(LOADING_KEYS.PROJECTS, isLoading)

  // Methods
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      search_text: "",
      start_date: "",
      end_date: "",
      project_ids: [],
      member_ids: []
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
