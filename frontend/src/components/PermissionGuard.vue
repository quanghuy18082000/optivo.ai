<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback">
    <slot name="fallback">
      <div class="text-gray-500 text-sm italic">
        You don't have permission to view this content.
      </div>
    </slot>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePermissions } from "@/composables/usePermissions";

const props = defineProps({
  // Single permission to check
  permission: {
    type: String,
    default: null,
  },

  // Multiple permissions - user needs ANY of these
  anyOf: {
    type: Array,
    default: () => [],
  },

  // Multiple permissions - user needs ALL of these
  allOf: {
    type: Array,
    default: () => [],
  },

  // Project ID for project-specific permissions
  projectId: {
    type: [String, Number],
    default: null,
  },

  // Whether to show fallback content when no permission
  showFallback: {
    type: Boolean,
    default: false,
  },

  // Invert the permission check (show when user DOESN'T have permission)
  invert: {
    type: Boolean,
    default: false,
  },
});

const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

const hasAccess = computed(() => {
  let access = false;

  // Check single permission
  if (props.permission) {
    access = hasPermission(props.permission, props.projectId);
  }

  // Check any of multiple permissions
  else if (props.anyOf.length > 0) {
    access = hasAnyPermission(props.anyOf, props.projectId);
  }

  // Check all of multiple permissions
  else if (props.allOf.length > 0) {
    access = hasAllPermissions(props.allOf, props.projectId);
  }

  // If no permissions specified, default to true
  else {
    access = true;
  }

  // Invert if needed
  return props.invert ? !access : access;
});
</script>
