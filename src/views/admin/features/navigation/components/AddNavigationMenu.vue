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
  <button type="button" class="btn btn-primary" :disabled="disabled" @click="emit('trigger')">Thêm menu</button>
</template>
