<template>
  <div class="relative datepicker-container">
    <!-- Input Field -->
    <div class="relative">
      <input
        ref="inputRef"
        :id="id"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        class="w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-gray-700 bg-white cursor-pointer"
        :class="[
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400',
          disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white',
        ]"
        @click="toggleCalendar"
        @blur="handleInputBlur"
      />

      <!-- Calendar Icon -->
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <svg
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            error
              ? 'text-red-400'
              : disabled
              ? 'text-gray-300'
              : 'text-gray-400',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <!-- Calendar Popup using Teleport -->
    <Teleport to="body">
      <div v-if="showCalendar">
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-10 datepicker-overlay"
          @click="closeCalendar"
        ></div>

        <!-- Calendar Popup -->
        <div
          ref="popupRef"
          :style="popupStyle"
          class="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px] datepicker-popup"
          @click.stop
        >
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-3">
            <button
              @click.prevent="previousMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                class="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div class="flex items-center space-x-2">
              <select
                v-model="currentMonth"
                class="px-3 py-1 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option
                  v-for="(month, index) in months"
                  :key="index"
                  :value="index"
                >
                  {{ month }}
                </option>
              </select>
              <select
                v-model="currentYear"
                class="px-3 py-1 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="year in years" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>

            <button
              @click.prevent="nextMonth"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                class="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <!-- Days of Week -->
          <div class="grid grid-cols-7 mb-2">
            <div
              v-for="day in daysOfWeek"
              :key="day"
              class="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="date in calendarDays"
              :key="`${date.year}-${date.month}-${date.day}`"
              @click="selectDate(date)"
              class="w-9 h-9 text-sm rounded-lg transition-all duration-150 flex items-center justify-center font-medium"
              :class="[
                date.isCurrentMonth
                  ? 'text-gray-900 hover:bg-blue-50'
                  : 'text-gray-400 hover:bg-gray-50',
                date.isSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : '',
                date.isToday && !date.isSelected
                  ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-200'
                  : '',
              ]"
            >
              {{ date.day }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Error Message -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import "./datepicker.css";

const props = defineProps({
  id: {
    type: String,
    default: () => `datepicker-${Math.random().toString(36).substr(2, 9)}`,
  },
  placeholder: { type: String, default: "Select date" },
  modelValue: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: "This field has an error" },
  dateFormat: { type: String, default: "DD/MM/YYYY" },
});

const emit = defineEmits(["update:modelValue", "blur"]);

const inputRef = ref(null);
const popupRef = ref(null);
const popupStyle = ref({});
const showCalendar = ref(false);
const selectedDate = ref(null);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const years = computed(() => {
  const y = new Date().getFullYear();
  return Array.from({ length: 61 }, (_, i) => y - 50 + i);
});

const displayValue = computed(() => {
  if (!selectedDate.value) return "";
  const d = selectedDate.value;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return props.dateFormat === "MM/DD/YYYY"
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`;
});

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const today = new Date();
  const days = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const isCurrentMonth = date.getMonth() === currentMonth.value;
    const isToday = date.toDateString() === today.toDateString();
    const isSelected =
      selectedDate.value &&
      date.toDateString() === selectedDate.value.toDateString();

    days.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      date,
      isCurrentMonth,
      isToday,
      isSelected,
    });
  }

  return days;
});

const toggleCalendar = () => {
  if (props.disabled) return;
  showCalendar.value = !showCalendar.value;
  if (showCalendar.value) {
    // Add class to body to prevent scrolling on mobile
    document.body.classList.add("datepicker-open");
    nextTick(() => {
      positionPopup();
      // Re-position after a short delay to ensure DOM is fully rendered
      setTimeout(() => positionPopup(), 10);
    });
  } else {
    // Remove class from body
    document.body.classList.remove("datepicker-open");
  }
};

const closeCalendar = () => {
  showCalendar.value = false;
  // Remove class from body when closing
  document.body.classList.remove("datepicker-open");
};

const handleInputBlur = () => setTimeout(() => emit("blur"), 150);

const selectDate = (dateObj) => {
  selectedDate.value = dateObj.date;
  emit("update:modelValue", dateObj.date.toISOString().split("T")[0]);
  closeCalendar();
};

const selectToday = () => {
  const today = new Date();
  selectedDate.value = today;
  currentMonth.value = today.getMonth();
  currentYear.value = today.getFullYear();
  emit("update:modelValue", today.toISOString().split("T")[0]);
  closeCalendar();
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else currentMonth.value--;
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else currentMonth.value++;
};

const positionPopup = () => {
  if (!inputRef.value) return;

  const inputRect = inputRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth < 640; // sm breakpoint

  if (isMobile) {
    // On mobile, center the popup
    popupStyle.value = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      position: "fixed",
      maxWidth: "calc(100vw - 20px)",
      width: "300px",
    };
    return;
  }

  const popupWidth = 320; // max-w-[320px]
  const popupHeight = 380; // estimated height

  // Calculate vertical position
  const spaceBelow = viewportHeight - inputRect.bottom - 10; // 10px margin
  const spaceAbove = inputRect.top - 10; // 10px margin
  const shouldOpenUp = spaceBelow < popupHeight && spaceAbove > popupHeight;

  // Calculate horizontal position
  let left = inputRect.left;
  const spaceRight = viewportWidth - inputRect.left;

  // If popup would overflow on the right, align it to the right edge of input
  if (spaceRight < popupWidth) {
    left = inputRect.right - popupWidth;
  }

  // Ensure popup doesn't go off-screen on the left
  if (left < 10) {
    left = 10;
  }

  // Ensure popup doesn't go off-screen on the right
  if (left + popupWidth > viewportWidth - 10) {
    left = viewportWidth - popupWidth - 10;
  }

  // Calculate top position
  let top;
  if (shouldOpenUp) {
    top = Math.max(10, inputRect.top - popupHeight - 5);
  } else {
    top = Math.min(viewportHeight - popupHeight - 10, inputRect.bottom + 5);
  }

  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    position: "fixed",
    transform: "none",
  };
};

const handleEscape = (e) => {
  if (e.key === "Escape") closeCalendar();
};

const updateOnResizeOrScroll = () => {
  if (showCalendar.value) positionPopup();
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const date = new Date(newValue);
      if (!isNaN(date.getTime())) {
        selectedDate.value = date;
        currentMonth.value = date.getMonth();
        currentYear.value = date.getFullYear();
      }
    } else {
      selectedDate.value = null;
    }
  },
  { immediate: true }
);

// Watch for calendar visibility changes to update positioning
watch(showCalendar, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      positionPopup();
      // Additional positioning after DOM updates
      setTimeout(() => positionPopup(), 50);
    });
  }
});

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("resize", updateOnResizeOrScroll);
  window.addEventListener("scroll", updateOnResizeOrScroll, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  window.removeEventListener("resize", updateOnResizeOrScroll);
  window.removeEventListener("scroll", updateOnResizeOrScroll, true);
  // Cleanup body class on unmount
  document.body.classList.remove("datepicker-open");
});
</script>

<style scoped>
select::-webkit-scrollbar {
  width: 4px;
}
select::-webkit-scrollbar-track {
  background: #f1f1f1;
}
select::-webkit-scrollbar-thumb {
  background: #c1c1c1;
}
select::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
