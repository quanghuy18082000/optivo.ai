import { ref, computed } from 'vue';
export function usePagination(options = {}) {
  const { defaultPageSize = 10, fetchFunction } = options;

  // Pagination state
  const pagination = ref({
    page: 1,
    size: defaultPageSize,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });

  // Computed properties
  const currentPage = computed(() => pagination.value.page);
  const pageSize = computed(() => pagination.value.size);
  const totalPages = computed(() => pagination.value.total_pages);
  const total = computed(() => pagination.value.total);
  const hasNext = computed(() => pagination.value.has_next);
  const hasPrevious = computed(() => pagination.value.has_previous);

  // Calculate start and end item numbers for display
  const startItem = computed(() => {
    return (pagination.value.page - 1) * pagination.value.size + 1;
  });

  const endItem = computed(() => {
    return Math.min(pagination.value.page * pagination.value.size, pagination.value.total);
  });

  // Methods
  const updatePagination = (newPagination) => {
    pagination.value = {
      ...pagination.value,
      ...newPagination,
    };

  };

  const goToPage = async (page) => {
    if (page >= 1 && page <= pagination.value.total_pages && page !== pagination.value.page) {
      pagination.value.page = page;
      if (fetchFunction) {
        await fetchFunction();
      }
    }
  };

  const nextPage = async () => {
    if (pagination.value.has_next) {
      await goToPage(pagination.value.page + 1);
    }
  };

  const previousPage = async () => {
    if (pagination.value.has_previous) {
      await goToPage(pagination.value.page - 1);
    }
  };

  const resetToFirstPage = () => {
    pagination.value.page = 1;
  };

  const setPageSize = async (size) => {
    pagination.value.size = size;
    pagination.value.page = 1; // Reset to first page when changing page size
    if (fetchFunction) {
      await fetchFunction();
    }
  };

  // Get pagination parameters for API calls
  const getPaginationParams = () => ({
    page: pagination.value.page,
    size: pagination.value.size,
  });


  return {
    // State
    pagination,
    
    // Computed
    currentPage,
    pageSize,
    totalPages,
    total,
    hasNext,
    hasPrevious,
    startItem,
    endItem,
    
    // Methods
    updatePagination,
    goToPage,
    nextPage,
    previousPage,
    resetToFirstPage,
    setPageSize,
    getPaginationParams,
  };
}