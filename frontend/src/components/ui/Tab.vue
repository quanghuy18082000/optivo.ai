<template>
  <button
    :class="[
      'px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-200',
      isSelected
        ? 'text-blue-600 border-b-2 border-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    ]"
    @click="select"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
  index: {
    type: Number,
    required: true
  }
});

const selectedIndex = inject('selectedIndex');
const setSelectedIndex = inject('setSelectedIndex');

const isSelected = computed(() => selectedIndex.value === props.index);

const select = () => {
  setSelectedIndex(props.index);
};
</script>