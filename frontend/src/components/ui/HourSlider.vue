<template>
  <div class="w-full">
    <div class="flex items-center gap-3">
      <input
        type="range"
        :min="0"
        :max="24"
        :step="0.25"
        :value="valueHoursFloat"
        @input="onInput"
        class="w-full h-2 rounded-lg appearance-none cursor-pointer"
        :disabled="disabled"
        :style="trackStyle"
      />
      <span class="text-sm text-gray-600 w-16 text-right">{{ display }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  hours: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:hours", "update:minutes", "blur"]);

// Convert hours+minutes to float hours for slider
const valueHoursFloat = computed(() => {
  const h = Number(props.hours || 0);
  const m = Number(props.minutes || 0);
  return h + m / 60;
});

// Percent progress based on 24h
const progressPercent = computed(() => {
  const p = (valueHoursFloat.value / 24) * 100;
  return Math.max(0, Math.min(100, p));
});

// Dynamic track gradient: black filled, gray remaining
const trackStyle = computed(() => ({
  "--progress": `${progressPercent.value}%`,
  background: `linear-gradient(to right, #111827 ${progressPercent.value}%, #e5e7eb ${progressPercent.value}%)`,
}));

const display = computed(() => {
  const totalMin = Math.round(valueHoursFloat.value * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const fraction = (m / 60).toFixed(2).slice(1); // like .25, .50
  return `${h}${fraction}h`;
});

function onInput(e) {
  const v = Number(e.target.value);
  // round to nearest 15 minutes to avoid float issues (0.25h)
  const totalMin = Math.round(v * 60);
  const rounded = Math.round(totalMin / 15) * 15;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  emit("update:hours", h);
  emit("update:minutes", m);
}
</script>

<style scoped>
/* Track styling */
input[type="range"] {
  background: linear-gradient(
    to right,
    #111827 var(--progress),
    #e5e7eb var(--progress)
  );
}

/* WebKit track */
input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #111827 var(--progress),
    #e5e7eb var(--progress)
  );
}

/* Firefox track and progress */
input[type="range"]::-moz-range-track {
  height: 8px;
  border-radius: 9999px;
  background: #e5e7eb; /* gray-200 */
}
input[type="range"]::-moz-range-progress {
  height: 8px;
  border-radius: 9999px;
  background: #111827; /* gray-900 */
}

/* Thumb styling */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #111827; /* gray-900 */
  cursor: pointer;
  margin-top: -5px; /* centers thumb relative to 8px track */
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #111827;
  cursor: pointer;
}
</style>
