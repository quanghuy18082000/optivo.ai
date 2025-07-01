import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getWorklogs, createWorklog, updateWorklog, deleteWorklog } from '../services/worklogService'

export function useWorklog() {
  const queryClient = useQueryClient()
  
  const filters = ref({
    timePeriod: 'last_week',
    projectId: null,
    category: null,
    status: null,
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20,
  })

  const queryParams = computed(() => {
    const params = {}
    
    if (filters.value.projectId) {
      params.project_id = filters.value.projectId
    }
    
    if (filters.value.category) {
      params.category = filters.value.category
    }
    
    if (filters.value.status) {
      params.status = filters.value.status
    }
    
    // Handle time period
    if (filters.value.timePeriod === 'custom' && filters.value.dateFrom && filters.value.dateTo) {
      params.date_from = filters.value.dateFrom
      params.date_to = filters.value.dateTo
    } else if (filters.value.timePeriod !== 'custom') {
      params.time_period = filters.value.timePeriod
    }
    
    params.page = filters.value.page
    params.limit = filters.value.limit
    
    return params
  })

  // Query for fetching worklogs
  const {
    data: worklogData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['worklogs', queryParams],
    queryFn: () => getWorklogs(queryParams.value),
    keepPreviousData: true,
  })

  const worklogs = computed(() => worklogData.value?.data?.items || [])
  const pagination = computed(() => worklogData.value?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
  })

  // Mutations
  const createWorklogMutation = useMutation({
    mutationFn: createWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries(['worklogs'])
    },
  })

  const updateWorklogMutation = useMutation({
    mutationFn: ({ id, data }) => updateWorklog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['worklogs'])
    },
  })

  const deleteWorklogMutation = useMutation({
    mutationFn: deleteWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries(['worklogs'])
    },
  })

  // Methods
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
  }

  const resetFilters = () => {
    filters.value = {
      timePeriod: 'last_week',
      projectId: null,
      category: null,
      status: null,
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 20,
    }
  }

  const changePage = (page) => {
    filters.value.page = page
  }

  const createNewWorklog = (worklogData) => {
    return createWorklogMutation.mutateAsync(worklogData)
  }

  const updateExistingWorklog = (id, worklogData) => {
    return updateWorklogMutation.mutateAsync({ id, data: worklogData })
  }

  const removeWorklog = (id) => {
    return deleteWorklogMutation.mutateAsync(id)
  }

  return {
    // Data
    worklogs,
    pagination,
    filters,
    
    // Loading states
    isLoading,
    isCreating: createWorklogMutation.isPending,
    isUpdating: updateWorklogMutation.isPending,
    isDeleting: deleteWorklogMutation.isPending,
    
    // Errors
    error,
    createError: createWorklogMutation.error,
    updateError: updateWorklogMutation.error,
    deleteError: deleteWorklogMutation.error,
    
    // Methods
    updateFilters,
    resetFilters,
    changePage,
    refetch,
    createNewWorklog,
    updateExistingWorklog,
    removeWorklog,
  }
}