import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getWorklogs, createWorklog, updateWorklog, deleteWorklog } from '../services/worklogService'
import { useAuthStore } from '@/modules/auth/store'

export function useWorklog(options = { fetchWorklogs: true }) {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()
  
  const filters = ref({
    projectId: null,
    category: null,
    createdAfter: '',
    createdBefore: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    size: 20,
  })

  // Get the current user ID from auth store
  const userId = computed(() => {
    return authStore.user?.id || null
  })

  const queryParams = computed(() => {
    const params = {}
  
    
    // Add project_id if selected
    if (filters.value.projectId) {
      params.project_id = filters.value.projectId
    }
    
    // Add category if selected
    if (filters.value.category) {
      params.category = filters.value.category
    }
    
    // Add date filters if available
    if (filters.value.createdAfter) {
      params.created_after = filters.value.createdAfter
    }
    
    if (filters.value.createdBefore) {
      params.created_before = filters.value.createdBefore
    }
    
    // Add sorting parameters
    params.sort_by = filters.value.sortBy
    params.sort_order = filters.value.sortOrder
    
    // Add pagination parameters
    params.page = filters.value.page
    params.size = filters.value.size
    
    return params
  })

  // Query for fetching worklogs - only initialize if fetchWorklogs is true
  const {
    data: worklogData,
    isLoading,
    error,
    refetch
  } = options.fetchWorklogs 
    ? useQuery({
        queryKey: ['worklogs', queryParams],
        queryFn: () => getWorklogs(queryParams.value),
        keepPreviousData: true,
      })
    : { data: ref(null), isLoading: ref(false), error: ref(null), refetch: () => {} }

  const worklogs = computed(() => worklogData.value?.data?.items || [])
  const pagination = computed(() => worklogData.value?.data?.pagination || {
    total: 0,
    page: 1,
    size: 20,
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
      projectId: null,
      category: null,
      createdAfter: '',
      createdBefore: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      size: 20,
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