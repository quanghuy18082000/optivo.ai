<template>
  <div
    v-if="totalPages > 1"
    :class="[
      'flex items-center justify-between px-4 py-3 sm:px-6',
      showBorder ? 'border-t border-gray-200' : '',
    ]"
  >
    <!-- Mobile pagination -->
    <div class="flex justify-between flex-1 sm:hidden">
      <button
        @click="prevPage"
        :disabled="!hasPrevious"
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t("common.previous") }}
      </button>
      <span class="text-sm text-gray-700">
        {{ $t("common.page") }} {{ currentPage }} {{ $t("common.of") }}
        {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="!hasNext"
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t("common.next") }}
      </button>
    </div>

    <!-- Desktop pagination -->
    <div
      class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between gap-4"
    >
      <!-- Results info -->
      <div>
        <p class="text-sm text-gray-700">
          {{ $t("common.showing") }}
          <span class="font-medium">{{ startItem }}</span>
          {{ $t("common.to") }}
          <span class="font-medium">{{ endItem }}</span>
          {{ $t("common.of") }}
          <span class="font-medium">{{ total }}</span>
          {{ $t("common.results") }}
        </p>
      </div>

      <!-- Page navigation -->
      <div>
        <nav
          class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <!-- Previous button -->
          <button
            @click="prevPage"
            :disabled="!hasPrevious"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">{{ $t("common.previous") }}</span>
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Page numbers -->
          <template v-for="(page, index) in visiblePages" :key="index">
            <!-- Ellipsis -->
            <span
              v-if="page === '...'"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
            <!-- Page number -->
            <button
              v-else
              @click="goToPage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
          </template>

          <!-- Next button -->
          <button
            @click="nextPage"
            :disabled="!hasNext"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">{{ $t("common.next") }}</span>
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
  hasPrevious: {
    type: Boolean,
    default: false,
  },
  showBorder: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["page-change"]);

// Calculate start and end item numbers
const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total);
});

// Calculate visible page numbers
const visiblePages = computed(() => {
  const pages = [];
  const totalPages = props.totalPages;
  const current = props.currentPage;

  if (totalPages <= 1) {
    return [1];
  }

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Always show first page
  pages.push(1);

  if (current <= 3) {
    // Current page is near beginning: 1, 2, 3, 4, ..., last
    for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
      pages.push(i);
    }
    if (totalPages > 4) {
      pages.push("...");
    }
  } else if (current >= totalPages - 2) {
    // Current page is near end: 1, ..., last-3, last-2, last-1, last
    if (totalPages > 4) {
      pages.push("...");
    }
    for (let i = Math.max(2, totalPages - 3); i <= totalPages - 1; i++) {
      pages.push(i);
    }
  } else {
    // Current page is in middle: 1, ..., current-1, current, current+1, ..., last
    pages.push("...");
    for (let i = current - 1; i <= current + 1; i++) {
      pages.push(i);
    }
    pages.push("...");
  }

  // Always show last page if not already included
  if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
    pages.push(totalPages);
  }

  return pages;
});

// Navigation methods
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("page-change", page);
  }
};

const nextPage = () => {
  if (props.hasNext) {
    goToPage(props.currentPage + 1);
  }
};

const prevPage = () => {
  if (props.hasPrevious) {
    goToPage(props.currentPage - 1);
  }
};
</script>
