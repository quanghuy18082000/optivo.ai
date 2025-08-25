<template>
  <div class="relative w-full">
    <input
      ref="inputRef"
      type="text"
      class="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
      :class="[
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      :placeholder="placeholder"
      v-model="query"
      :disabled="disabled"
      @focus="open = true"
      @keydown.down.prevent="highlightNext"
      @keydown.up.prevent="highlightPrev"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.esc.prevent="open = false"
    />

    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-y-auto"
    >
      <div
        v-for="(opt, idx) in filtered"
        :key="opt.value"
        @mousedown.prevent="select(opt)"
        class="px-3 py-2 text-sm cursor-pointer"
        :class="
          idx === highlighted ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
        "
      >
        {{ opt.label }}
      </div>
      <div v-if="filtered.length === 0" class="px-3 py-2 text-sm text-gray-500">
        {{ noResultsText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null }, // selected value (id or free text)
  options: { type: Array, default: () => [] }, // [{label, value}]
  placeholder: { type: String, default: "Type to search..." },
  noResultsText: { type: String, default: "No results available" },
  disabled: { type: Boolean, default: false },
  // Allow user to submit arbitrary text that doesn't match options
  allowFreeInput: { type: Boolean, default: false },
  // Error props for styling
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const open = ref(false);
const query = ref("");
const highlighted = ref(-1);
const inputRef = ref(null);

const selectedOption = computed(() => {
  return (
    props.options.find((o) => String(o.value) === String(props.modelValue)) ||
    null
  );
});

// Keep input text in sync with selected value when model changes externally
watch(
  () => props.modelValue,
  (v) => {
    if (selectedOption.value) {
      query.value = selectedOption.value.label;
    } else if (!open.value) {
      // If free input is allowed and modelValue is a non-empty string, keep it in the input
      if (props.allowFreeInput && typeof v === "string" && v.length > 0) {
        query.value = v;
      } else {
        query.value = "";
      }
    }
  }
);

// Filtered options by query
const filtered = computed(() => {
  const q = (query.value || "").toLowerCase().trim();
  if (!q) return props.options;
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

function select(opt) {
  emit("update:modelValue", opt.value);
  emit("change", opt);
  query.value = opt.label;
  open.value = false;
}

function highlightNext() {
  if (!open.value) open.value = true;
  if (filtered.value.length === 0) return;
  highlighted.value = (highlighted.value + 1) % filtered.value.length;
}

function highlightPrev() {
  if (!open.value) open.value = true;
  if (filtered.value.length === 0) return;
  highlighted.value =
    (highlighted.value - 1 + filtered.value.length) % filtered.value.length;
}

function selectHighlighted() {
  if (
    open.value &&
    highlighted.value >= 0 &&
    highlighted.value < filtered.value.length
  ) {
    select(filtered.value[highlighted.value]);
  } else if (props.allowFreeInput && query.value.trim().length > 0) {
    // Commit free text on Enter when no option highlighted
    emit("update:modelValue", query.value.trim());
    open.value = false;
  } else if (!props.allowFreeInput) {
    // Force select by exact label match on Enter when free input not allowed
    const q = query.value.trim();
    const match = props.options.find((o) => o.label === q);
    if (match) {
      select(match);
    } else {
      open.value = false;
    }
  }
}

function handleClickOutside(e) {
  if (!inputRef.value) return;
  if (!inputRef.value.contains(e.target)) {
    const q = query.value.trim();
    const match = props.options.find((o) => o.label === q);
    if (match) {
      // Force select exact match on blur
      emit("update:modelValue", match.value);
      emit("change", match);
      query.value = match.label;
    } else {
      if (props.allowFreeInput && q.length > 0) {
        emit("update:modelValue", q);
      } else {
        emit("update:modelValue", null);
      }
    }
    open.value = false;
  }
}

onMounted(() => {
  if (selectedOption.value) {
    query.value = selectedOption.value.label;
  } else if (props.allowFreeInput && typeof props.modelValue === "string") {
    query.value = props.modelValue;
  }
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
