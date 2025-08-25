import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getWorklogs, createWorklog, createWorklogBatch, updateWorklogBatch, deleteWorklog } from '../services/worklogService'
import { useAuthStore } from '@/modules/auth/store'
import { useLoadingIntegration, LOADING_KEYS } from '@/composables/useLoadingIntegration.js'

export function useWorklog(options = { fetchWorklogs: true }) {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()
  
  const filters = ref({
    projectIds: [],
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

    // Add user_id parameter with the current user ID
    params.user_id = userId.value
  
    // Add project_ids if selected
    if (filters.value.projectIds && filters.value.projectIds.length > 0) {
      params.project_ids = filters.value.projectIds
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

  const worklogs = computed(() => worklogData.value?.data || [])
  const pagination = computed(() => worklogData.value?.data?.pagination || {
    total: 0,
    page: 1,
    size: 20,
    total_pages: 0,
  })

  // Integrate with global loading screen
  if (options.fetchWorklogs) {
    useLoadingIntegration(LOADING_KEYS.WORKLOGS, isLoading)
  }

  // Mutations
  const createWorklogMutation = useMutation({
    mutationFn: (args) => {
      // Extract worklogData and date from the args array
      const [worklogData, date] = args;
      return createWorklog(worklogData, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['worklogs'])
    },
  })
  
  const createWorklogBatchMutation = useMutation({
    mutationFn: (args) => {
      // Extract worklogsData and date from the args array
      const [worklogsData, date] = args;
      return createWorklogBatch(worklogsData, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['worklogs'])
    },
  })

  
  const updateWorklogBatchMutation = useMutation({
    mutationFn: (args) => {
      // Extract worklogsData and date from the args array
      const [worklogsData, date] = args;
      return updateWorklogBatch(worklogsData, date);
    },
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
      projectIds: [],
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

  const createNewWorklog = (worklogData, date) => {
    // Pass the worklog data and date separately to the service function
    return createWorklogMutation.mutateAsync([worklogData, date]);
  }
  
  const createBatchWorklogs = (payload, date) => {
    // Payload is already in BE-required format { root: [...], more: [...] }
    return createWorklogBatchMutation.mutateAsync([payload, date]);
  }
  
  const updateBatchWorklogs = (payload, date) => {
    // Keep pass-through for update as well
    return updateWorklogBatchMutation.mutateAsync([payload, date]);
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
    isCreating: createWorklogMutation.isPending || createWorklogBatchMutation.isPending,
    isUpdating: updateWorklogBatchMutation.isPending,
    isDeleting: deleteWorklogMutation.isPending,
    
    // Errors
    error,
    createError: createWorklogMutation.error || createWorklogBatchMutation.error,
    updateError:  updateWorklogBatchMutation.error,
    deleteError: deleteWorklogMutation.error,
    
    // Methods
    updateFilters,
    resetFilters,
    changePage,
    refetch,
    createNewWorklog,
    createBatchWorklogs,
    updateBatchWorklogs,
    removeWorklog,
  }
}