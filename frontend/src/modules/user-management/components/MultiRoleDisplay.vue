<template>
  <div class="flex flex-wrap gap-1">
    <Badge
      v-for="role in roles"
      :key="role.id"
      variant="default"
      size="sm"
      class="text-xs"
    >
      {{ role.name }}
    </Badge>
  </div>
</template>

<script setup>
import Badge from "@/components/ui/Badge.vue";

defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
  canManage: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["manage-roles"]);

// Removed color variants - using default gray for all roles
</script>
