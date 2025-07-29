<template>
  <div class="tab-group">
    <slot></slot>
  </div>
</template>

<script setup>
import { provide, ref } from 'vue';

const selectedIndex = ref(0);

provide('selectedIndex', selectedIndex);
provide('setSelectedIndex', (index) => {
  selectedIndex.value = index;
});
</script>