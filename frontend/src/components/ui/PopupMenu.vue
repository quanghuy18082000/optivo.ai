<template>
  <Popup
    v-model="isOpen"
    :placement="placement"
    :offset="offset"
    :width="width"
    :min-width="minWidth"
    :max-width="maxWidth"
    :close-on-click-outside="closeOnClickOutside"
    :close-on-esc="closeOnEsc"
    :close-on-select="closeOnSelect"
    @open="$emit('open')"
    @close="$emit('close')"
  >
    <template #trigger="{ toggle, isOpen }">
      <div @click.stop="toggle">
        <slot name="trigger" :is-open="isOpen"></slot>
      </div>
    </template>

    <div class="py-1">
      <slot></slot>
    </div>
  </Popup>
</template>

<script setup>
import { computed } from "vue";
import Popup from "./Popup.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  placement: {
    type: String,
    default: "bottom-start",
  },
  offset: {
    type: Number,
    default: 8,
  },
  width: {
    type: String,
    default: "48",
  },
  minWidth: {
    type: String,
    default: "12rem",
  },
  maxWidth: {
    type: String,
    default: null,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "open", "close"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>
