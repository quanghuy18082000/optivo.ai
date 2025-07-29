<template>
  <div class="relative">
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

    <!-- Calendar Popup -->
    <div
      v-if="showCalendar"
      ref="popupRef"
      :style="popupStyle"
      class="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[200px]"
      @click.stop
    >
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-2">
        <button
          @click.prevent="previousMonth"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-600"
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
            class="px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            class="px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <button
          @click.prevent="nextMonth"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-600"
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
      <div class="grid grid-cols-7 mb-1">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="text-center text-sm font-medium text-gray-500 py-1"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7">
        <button
          v-for="date in calendarDays"
          :key="`${date.year}-${date.month}-${date.day}`"
          @click="selectDate(date)"
          class="w-8 h-8 text-xs rounded transition-all duration-150 flex items-center justify-center"
          :class="[
            date.isCurrentMonth
              ? 'text-gray-900 hover:bg-blue-300'
              : 'text-gray-400 hover:bg-gray-300',
            date.isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : '',
            date.isToday && !date.isSelected
              ? 'bg-blue-100 text-blue-600 font-semibold'
              : '',
          ]"
        >
          {{ date.day }}
        </button>
      </div>
    </div>

    <!-- Overlay -->
    <div
      v-if="showCalendar"
      class="fixed inset-0 z-40"
      @click="closeCalendar"
    ></div>

    <!-- Error Message -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

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
  if (showCalendar.value) nextTick(() => positionPopup());
};

const closeCalendar = () => (showCalendar.value = false);

const handleInputBlur = () => setTimeout(() => emit("blur"), 150);

const selectDate = (dateObj) => {
  selectedDate.value = dateObj.date;
  emit("update:modelValue", dateObj.date.toISOString().split("T")[0]);
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
  if (!inputRef.value || !popupRef.value) return;
  const inputRect = inputRef.value.getBoundingClientRect();
  const popupHeight = popupRef.value.offsetHeight;
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - inputRect.bottom;
  const spaceAbove = inputRect.top;
  const shouldOpenUp = spaceBelow < popupHeight && spaceAbove > popupHeight;

  popupStyle.value = {
    top: shouldOpenUp ? "auto" : "100%",
    bottom: shouldOpenUp ? "100%" : "auto",
    left: "0",
    position: "absolute",
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

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("resize", updateOnResizeOrScroll);
  window.addEventListener("scroll", updateOnResizeOrScroll, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  window.removeEventListener("resize", updateOnResizeOrScroll);
  window.removeEventListener("scroll", updateOnResizeOrScroll, true);
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
