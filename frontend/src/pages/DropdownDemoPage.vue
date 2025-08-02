<template>
  <MainLayout>
    <template #header-left>
      <h1 class="text-2xl font-semibold">Dropdown Components Demo</h1>
    </template>

    <DropdownDemo />
  </MainLayout>
</template>

<script setup>
import MainLayout from "@/layouts/MainLayout.vue";
import DropdownDemo from "@/components/ui/DropdownDemo.vue";
</script>
