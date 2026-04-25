<script setup>
import { computed } from 'vue'
import { useProjectManager } from '../composables/useProjectManager.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'list', // list | edit
  },
  projectId: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: 'btn btn-danger btn-sm',
  },
})

const {
  deletingProjectId,
  deletingProject,
  deleteProject,
  removeProject,
} = useProjectManager()

const isListMode = computed(() => props.mode === 'list')
const buttonLabel = computed(() => {
  if (isListMode.value) {
    return deletingProjectId.value === props.projectId
      ? 'Đang xóa...'
      : props.label || 'Xóa'
  }

  return deletingProject.value ? 'Đang xóa...' : props.label || 'Xóa dự án'
})

const isDisabled = computed(() => {
  return isListMode.value
    ? deletingProjectId.value === props.projectId
    : deletingProject.value
})

function handleDelete() {
  if (isListMode.value) {
    deleteProject(props.projectId)
    return
  }
  removeProject()
}
</script>

<template>
  <button type="button" :class="className" :disabled="isDisabled" @click="handleDelete">
    {{ buttonLabel }}
  </button>
</template>
