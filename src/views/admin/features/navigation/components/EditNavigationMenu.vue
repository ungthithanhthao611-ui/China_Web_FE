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
  <button type="button" class="btn btn-secondary" :disabled="disabled" @click="emit('trigger')">
    {{ $t('admin.navigation.edit_menu') }}
  </button>
</template>
