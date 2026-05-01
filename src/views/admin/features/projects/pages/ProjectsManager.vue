<script setup>
/**
 * ProjectsManager - Quan ly Du An.
 * Entity-key: 'projects'
 *
 * Dung chung AdminCoreManager/AdminCoreEditor nhu danh muc san pham de form
 * co cac o VI/EN/ZH va nut dich tu dong.
 */
import AdminCoreManager from '@/views/admin/shared/components/AdminCoreManager.vue'

const props = defineProps({
  token: { type: String, required: true },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['notify-success', 'notify-error', 'clear-notify'])
</script>

<template>
  <AdminCoreManager
    :token="token"
    entity-key="projects"
    :active="active"
    @notify-success="$emit('notify-success', $event)"
    @notify-error="$emit('notify-error', $event)"
    @clear-notify="$emit('clear-notify')"
  />
</template>
