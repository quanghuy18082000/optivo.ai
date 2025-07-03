import { ref, computed } from "vue"
import { useQuery, useQueryClient } from "@tanstack/vue-query"
import { getProjects } from "../services/projectService"

export function useProjects() {
  const queryClient = useQueryClient()

  const filters = ref({
    projectName: "",
    // Add more filters as needed, e.g., memberName, status, dateRange
  })

  const queryParams = computed(() => {
    const params = {}
    if (filters.value.projectName) {
      params.projectName = filters.value.projectName
    }
    // Add other filter parameters
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

  const projects = computed(() => projectsData.value?.data || [])

  // Methods
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      projectName: "",
    }
  }

  // You can add mutations for create, update, delete projects here if needed
  // const createProjectMutation = useMutation({ ... })
  // const updateProjectMutation = useMutation({ ... })
  // const deleteProjectMutation = useMutation({ ... })

  return {
    // Data
    projects,
    filters,

    // Loading states
    isLoading,

    // Errors
    error,

    // Methods
    updateFilters,
    resetFilters,
    refetch,
    // createNewProject,
    // updateExistingProject,
    // removeProject,
  }
}
