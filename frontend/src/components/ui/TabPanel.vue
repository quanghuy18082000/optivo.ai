<template>
  <div v-show="isSelected" class="tab-panel">
    <slot></slot>
  </div>
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

const isSelected = computed(() => selectedIndex.value === props.index);
</script>