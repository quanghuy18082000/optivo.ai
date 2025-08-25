<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-800">{{ title }}</h3>
      <button
        v-if="!addAtBottom"
        type="button"
        class="text-blue-600 text-sm hover:text-blue-800"
        @click="onAddClick"
        :disabled="disabled"
      >
        + {{ addLabel }}
      </button>
    </div>

    <div class="grid grid-cols-12 gap-3 text-sm text-gray-500">
      <div class="col-span-3">{{ nameLabel }}</div>
      <div class="col-span-3">{{ $t("worklog.common.time") }}</div>
      <div class="col-span-5">{{ $t("worklog.common.description") }}</div>
      <div class="col-span-1 text-right"></div>
    </div>

    <div
      v-for="(row, idx) in model"
      :key="row.id"
      class="grid grid-cols-12 gap-3 items-start"
    >
      <div class="col-span-3">
        <component
          :is="nameInputIsSelect ? Autocomplete : Input"
          v-model="row.name"
          :options="nameInputIsSelect ? options : undefined"
          :placeholder="namePlaceholder"
          :disabled="disabled || row.disabled"
          :no-results-text="$t('common.search_placeholder')"
          class="w-full"
          :allow-free-input="nameInputIsSelect ? allowFreeInput : undefined"
          :error="Boolean(row.errorName)"
          :error-message="row.errorName"
          @change="onNameChange(idx)"
        />
        <p v-if="row.errorName" class="mt-1 text-xs text-red-600">
          {{ row.errorName }}
        </p>
      </div>

      <div class="col-span-3">
        <HourSlider
          v-model:hours="row.hours"
          v-model:minutes="row.minutes"
          :disabled="disabled || row.disabled"
        />
        <p v-if="row.errorTime" class="mt-1 text-xs text-red-600">
          {{ row.errorTime }}
        </p>
      </div>

      <div class="col-span-5">
        <Input
          v-model="row.desc"
          :placeholder="descPlaceholder"
          :disabled="disabled || row.disabled"
          class="w-full"
        />
        <p v-if="row.errorDesc" class="mt-1 text-xs text-red-600">
          {{ row.errorDesc }}
        </p>
      </div>
      <div class="col-span-1 flex justify-end">
        <button
          type="button"
          class="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
          :disabled="disabled"
          @click.stop="removeRow(idx)"
          aria-label="Xóa"
          title="Xóa"
        >
          <DeleteIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="addAtBottom" class="pt-2">
      <button
        type="button"
        class="text-blue-600 text-sm hover:text-blue-800"
        @click="onAddClick"
        :disabled="disabled"
      >
        + {{ addLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, nextTick } from "vue";
import Input from "@/components/ui/Input.vue";
import Autocomplete from "@/components/ui/Autocomplete.vue";
import HourSlider from "@/components/ui/HourSlider.vue";
import DeleteIcon from "@/components/icons/DeleteIcon.vue";

const props = defineProps({
  title: String,
  addLabel: { type: String, default: "" },
  nameLabel: { type: String, default: "" },
  namePlaceholder: { type: String, default: "" },
  descPlaceholder: { type: String, default: "" },
  modelValue: { type: Array, default: () => [] },
  nameInputIsSelect: { type: Boolean, default: true },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  // When true, prevents selecting the same option more than once across rows
  enforceUnique: { type: Boolean, default: true },
  // Allow free input when using Autocomplete (useful for categories)
  allowFreeInput: { type: Boolean, default: false },
  // If true, move the "+ Khác" button to the bottom of the section
  addAtBottom: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "add"]);

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

function addRow() {
  const newRow = {
    id: crypto.randomUUID(),
    name: null,
    hours: 0,
    minutes: 0,
    desc: "",
    disabled: false,
  };
  model.value = [...model.value, newRow];
}

async function onAddClick() {
  const beforeLen = Array.isArray(model.value) ? model.value.length : 0;

  // Ask parent to handle add if they listen
  emit("add");

  // Wait a tick for parent to update v-model
  await nextTick();

  const afterLen = Array.isArray(model.value) ? model.value.length : 0;

  // Only add locally if parent didn't modify the list
  if (afterLen === beforeLen) {
    addRow();
  }
}

function onNameChange(idx) {
  // ensure unique selection when using select options
  if (!props.nameInputIsSelect || !props.enforceUnique) return;
  const chosen = model.value[idx].name;
  model.value = model.value.map((r, i) => {
    if (i !== idx && r.name === chosen) {
      return { ...r, name: null };
    }
    return r;
  });
}

function removeRow(idx) {
  const next = [...model.value];
  next.splice(idx, 1);
  model.value = next;
}
</script>
