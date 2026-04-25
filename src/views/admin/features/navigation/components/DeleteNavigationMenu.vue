<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['trigger'])
</script>

<template>
  <button type="button" class="btn btn-danger-outline" :disabled="disabled" @click="emit('trigger')">
    Xóa menu
  </button>
</template>
