<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import { uploadAdminMediaAsset } from '@/views/admin/shared/api/adminApi.js'
import {
  createHonor,
  createHonorCategory,
  deleteHonorCategory,
  listHonorCategories,
  listHonors,
  resyncHonorsImagesToCloudinary,
  softDeleteHonor,
  toggleHonorActive,
  updateHonor,
  updateHonorCategory,
} from '@/views/admin/features/honors/api/honorsAdminApi.js'
import CoreConfirmDialog from '@/views/admin/shared/components/CoreConfirmDialog.vue'
import { env } from '@/shared/config/env'

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  viewMode: {
    type: String,
    default: 'all',
  },
})

const emit = defineEmits(['notify-success', 'notify-error', 'clear-notify'])

const API_ORIGIN = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')

const categoryTypeOptions = computed(() => [
  { value: 'qualification_certificate', label: t('admin.capability.categories.types.qualification_certificate') },
  { value: 'awards_group', label: t('admin.capability.categories.types.awards_group') },
  { value: 'corporate_honors', label: t('admin.capability.categories.types.corporate_honors') },
  { value: 'project_honors', label: t('admin.capability.categories.types.project_honors') },
  { value: 'custom', label: t('admin.capability.categories.types.custom') },
])

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const categorySaving = ref(false)
const resyncingImages = ref(false)
const brokenImageIds = ref(new Set())
const uploadStorageBackend = ref('')
const uploadFallbackReason = ref('')

const honors = ref([])
const categories = ref([])
const uploadFile = ref(null)

const filters = reactive({
  keyword: '',
  categoryId: '',
  status: 'all',
})
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

const honorFormOpen = ref(false)
const honorFormMode = ref('create')
const editingHonorId = ref(null)
const honorFormErrors = ref([])

const honorForm = reactive({
  category_id: '',
  title: '',
  slug: '',
  short_description: '',
  image_url: '',
  year: '',
  issued_by: '',
  display_type: 'qualification_certificate',
  sort_order: 0,
  is_featured: false,
  is_active: true,
  uploadTitle: '',
  uploadAltText: '',
})

const categoryFormOpen = ref(false)
const categoryFormMode = ref('create')
const editingCategoryId = ref(null)
const categoryFormErrors = ref([])

const categoryForm = reactive({
  name: '',
  slug: '',
  type: 'qualification_certificate',
  parent_id: '',
  description: '',
  sort_order: 0,
  is_active: true,
})

const confirmDialog = reactive({
  visible: false,
  tone: 'primary',
  eyebrow: t('admin.capability.settings.common.confirm_save'),
  title: t('admin.capability.settings.common.confirm_message'),
  message: '',
  confirmText: t('admin.common.confirm'),
})
let confirmDialogResolver = null

function normalizedToken() {
  return String(props.token || '').trim()
}

function clearNotify() {
  emit('clear-notify')
}

function notifySuccess(message) {
  emit('notify-success', message)
}

function notifyError(message) {
  emit('notify-error', message)
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

function closeConfirmDialog(result = false) {
  confirmDialog.visible = false
  if (typeof confirmDialogResolver === 'function') {
    confirmDialogResolver(Boolean(result))
    confirmDialogResolver = null
  }
}

function askForConfirmation(options = {}) {
  const {
    tone = 'primary',
    eyebrow = t('admin.capability.settings.common.confirm_save'),
    title = t('admin.capability.settings.common.confirm_message'),
    message = '',
    confirmText = t('admin.common.confirm'),
  } = options

  if (typeof confirmDialogResolver === 'function') {
    confirmDialogResolver(false)
    confirmDialogResolver = null
  }

  confirmDialog.tone = tone === 'danger' ? 'danger' : 'primary'
  confirmDialog.eyebrow = String(eyebrow || 'Xác nhận thao tác')
  confirmDialog.title = String(title || 'Bạn có chắc chắn muốn tiếp tục?')
  confirmDialog.message = String(message || 'Thao tác sẽ được thực thi ngay sau khi bạn xác nhận.')
  confirmDialog.confirmText = String(confirmText || 'Xác nhận')
  confirmDialog.visible = true

  return new Promise((resolve) => {
    confirmDialogResolver = resolve
  })
}

function acceptConfirmDialog() {
  closeConfirmDialog(true)
}

function cancelConfirmDialog() {
  closeConfirmDialog(false)
}

function onHonorImageError(honorId) {
  const next = new Set(brokenImageIds.value)
  next.add(honorId)
  brokenImageIds.value = next
}

const categoryMap = computed(() => {
  const map = new Map()
  for (const category of categories.value) {
    map.set(category.id, category)
  }
  return map
})

const categoryParentOptions = computed(() => {
  if (!editingCategoryId.value) {
    return categories.value
  }
  return categories.value.filter((item) => item.id !== editingCategoryId.value)
})
const normalizedViewMode = computed(() => {
  const mode = String(props.viewMode || '').trim().toLowerCase()
  if (mode === 'honors' || mode === 'categories' || mode === 'all') {
    return mode
  }
  return 'all'
})
const showCategorySection = computed(() => normalizedViewMode.value !== 'honors')
const showHonorsSection = computed(() => normalizedViewMode.value !== 'categories')
const headerMeta = computed(() => {
  if (normalizedViewMode.value === 'categories') {
    return {
      title: t('admin.capability.categories.label'),
      description: t('admin.capability.categories.description'),
    }
  }
  if (normalizedViewMode.value === 'honors') {
    return {
      title: t('admin.capability.items.label'),
      description: t('admin.capability.items.description'),
    }
  }
  return {
    title: t('admin.capability.items.label'),
    description: t('admin.capability.items.description'),
  }
})
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

function categoryName(categoryId) {
  if (!categoryId) return t('admin.common.no_data')
  return categoryMap.value.get(categoryId)?.name || `${t('admin.capability.categories.label')} #${categoryId}`
}

function categoryTypeLabel(typeValue) {
  return categoryTypeOptions.value.find((item) => item.value === typeValue)?.label || typeValue || '-'
}

function statusBadgeClass(isActive) {
  return isActive ? 'badge badge-active' : 'badge badge-inactive'
}

function resetUploadFeedback() {
  uploadStorageBackend.value = ''
  uploadFallbackReason.value = ''
}

function resetHonorForm() {
  honorForm.category_id = categories.value[0]?.id || ''
  honorForm.title = ''
  honorForm.slug = ''
  honorForm.short_description = ''
  honorForm.image_url = ''
  honorForm.year = ''
  honorForm.issued_by = ''
  honorForm.display_type = 'qualification_certificate'
  honorForm.sort_order = 0
  honorForm.is_featured = false
  honorForm.is_active = true
  honorForm.uploadTitle = ''
  honorForm.uploadAltText = ''
  uploadFile.value = null
  honorFormErrors.value = []
  resetUploadFeedback()
}

function openCreateHonorForm() {
  honorFormMode.value = 'create'
  editingHonorId.value = null
  resetHonorForm()
  honorFormOpen.value = true
}

function openEditHonorForm(record) {
  honorFormMode.value = 'edit'
  editingHonorId.value = record.id
  honorForm.category_id = record.category_id || ''
  honorForm.title = record.title || ''
  honorForm.slug = record.slug || ''
  honorForm.short_description = record.short_description || ''
  honorForm.image_url = record.image_url || ''
  honorForm.year = record.year || ''
  honorForm.issued_by = record.issued_by || ''
  honorForm.display_type = record.display_type || 'qualification_certificate'
  honorForm.sort_order = Number(record.sort_order || 0)
  honorForm.is_featured = Boolean(record.is_featured)
  honorForm.is_active = Boolean(record.is_active)
  honorForm.uploadTitle = ''
  honorForm.uploadAltText = ''
  uploadFile.value = null
  honorFormErrors.value = []
  resetUploadFeedback()
  honorFormOpen.value = true
}

function closeHonorForm() {
  honorFormOpen.value = false
  editingHonorId.value = null
  honorFormErrors.value = []
}

function validateHonorForm() {
  const errors = []
  if (!String(honorForm.title || '').trim()) {
    errors.push('Title is required.')
  }
  if (!honorForm.category_id) {
    errors.push('Category is required.')
  }
  if (!String(honorForm.image_url || '').trim()) {
    errors.push('Image URL is required. Upload an image or paste URL.')
  }
  if (honorForm.year && !Number.isInteger(Number(honorForm.year))) {
    errors.push('Year must be a valid integer.')
  }
  if (!Number.isFinite(Number(honorForm.sort_order))) {
    errors.push('Sort order must be a valid number.')
  }
  honorFormErrors.value = errors
  return errors.length === 0
}

function buildHonorPayload() {
  return {
    category_id: Number(honorForm.category_id),
    title: String(honorForm.title || '').trim(),
    slug: String(honorForm.slug || '').trim() || null,
    short_description: String(honorForm.short_description || '').trim() || null,
    image_url: String(honorForm.image_url || '').trim() || null,
    year: honorForm.year ? Number(honorForm.year) : null,
    issued_by: String(honorForm.issued_by || '').trim() || null,
    display_type: String(honorForm.display_type || '').trim() || null,
    sort_order: Number(honorForm.sort_order || 0),
    is_featured: Boolean(honorForm.is_featured),
    is_active: Boolean(honorForm.is_active),
  }
}

function resetCategoryForm() {
  categoryForm.name = ''
  categoryForm.slug = ''
  categoryForm.type = 'qualification_certificate'
  categoryForm.parent_id = ''
  categoryForm.description = ''
  categoryForm.sort_order = 0
  categoryForm.is_active = true
  categoryFormErrors.value = []
}

function openCreateCategoryForm() {
  categoryFormMode.value = 'create'
  editingCategoryId.value = null
  resetCategoryForm()
  categoryFormOpen.value = true
}

function openEditCategoryForm(record) {
  categoryFormMode.value = 'edit'
  editingCategoryId.value = record.id
  categoryForm.name = record.name || ''
  categoryForm.slug = record.slug || ''
  categoryForm.type = record.type || 'qualification_certificate'
  categoryForm.parent_id = record.parent_id || ''
  categoryForm.description = record.description || ''
  categoryForm.sort_order = Number(record.sort_order || 0)
  categoryForm.is_active = Boolean(record.is_active)
  categoryFormErrors.value = []
  categoryFormOpen.value = true
}

function closeCategoryForm() {
  categoryFormOpen.value = false
  editingCategoryId.value = null
  categoryFormErrors.value = []
}

function validateCategoryForm() {
  const errors = []
  if (!String(categoryForm.name || '').trim()) {
    errors.push('Category name is required.')
  }
  if (!String(categoryForm.type || '').trim()) {
    errors.push('Category type is required.')
  }
  if (!Number.isFinite(Number(categoryForm.sort_order))) {
    errors.push('Category sort order must be a valid number.')
  }
  categoryFormErrors.value = errors
  return errors.length === 0
}

function buildCategoryPayload() {
  return {
    name: String(categoryForm.name || '').trim(),
    slug: String(categoryForm.slug || '').trim() || null,
    type: String(categoryForm.type || '').trim(),
    parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : null,
    description: String(categoryForm.description || '').trim() || null,
    sort_order: Number(categoryForm.sort_order || 0),
    is_active: Boolean(categoryForm.is_active),
  }
}

async function loadCategories() {
  const token = normalizedToken()
  if (!token) return
  const response = await listHonorCategories(token, { include_deleted: false })
  categories.value = response.items || []
}

async function fetchHonorsPage() {
  const token = normalizedToken()
  if (!token) return

  let nextPage = Math.max(1, Number(currentPage.value) || 1)
  const normalizedPageSize = Math.max(1, Math.min(200, Number(pageSize.value) || 10))

  while (true) {
    const query = {
      skip: (nextPage - 1) * normalizedPageSize,
      limit: normalizedPageSize,
    }
    if (filters.categoryId) {
      query.category_id = Number(filters.categoryId)
    }
    if (filters.keyword.trim()) {
      query.keyword = filters.keyword.trim()
    }
    if (filters.status === 'active') {
      query.is_active = true
    }
    if (filters.status === 'inactive') {
      query.is_active = false
    }

    const response = await listHonors(token, query)
    const nextItems = response.items || []
    const nextTotal = response.pagination?.total || 0

    if (!nextItems.length && nextTotal > 0 && nextPage > 1) {
      nextPage -= 1
      continue
    }

    currentPage.value = nextPage
    pageSize.value = normalizedPageSize
    honors.value = nextItems
    totalRecords.value = nextTotal
    brokenImageIds.value = new Set()
    break
  }
}

async function refreshHonorsOnly({ resetPage = false } = {}) {
  if (!showHonorsSection.value) return
  const token = normalizedToken()
  if (!token) return
  if (resetPage) {
    currentPage.value = 1
  }

  loading.value = true
  clearNotify()
  try {
    await fetchHonorsPage()
  } catch (error) {
    notifyError(error.message || 'Không thể tải dữ liệu năng lực.')
  } finally {
    loading.value = false
  }
}

async function applyHonorsFilters() {
  await refreshHonorsOnly({ resetPage: true })
}

async function setPage(page) {
  const nextPage = Math.min(Math.max(1, Number(page) || 1), totalPages.value)
  if (nextPage === currentPage.value) return
  currentPage.value = nextPage
  await refreshHonorsOnly()
}

async function refreshAll() {
  const token = normalizedToken()
  if (!token) return

  loading.value = true
  clearNotify()
  try {
    await loadCategories()
    if (showHonorsSection.value) {
      await fetchHonorsPage()
    } else {
      honors.value = []
      totalRecords.value = 0
    }
  } catch (error) {
    notifyError(error.message || 'Không thể tải dữ liệu năng lực.')
  } finally {
    loading.value = false
  }
}

async function resyncHonorImages() {
  const token = normalizedToken()
  if (!token) return

  const confirmed = await askForConfirmation({
    tone: 'primary',
    eyebrow: 'Đồng bộ hình ảnh',
    title: 'Xác nhận đồng bộ lại ảnh năng lực?',
    message: 'Hệ thống sẽ đồng bộ toàn bộ ảnh năng lực chưa ở Cloudinary sang Cloudinary ngay sau khi bạn xác nhận.',
    confirmText: 'Đồng bộ ngay',
  })
  if (!confirmed) return

  resyncingImages.value = true
  clearNotify()
  try {
    const result = await resyncHonorsImagesToCloudinary(token)
    await refreshHonorsOnly()
    if (Number(result.failed || 0) > 0) {
      const firstFailure = result.failed_items?.[0]?.reason
      notifyError(
        firstFailure
          ? `Đồng bộ hoàn tất nhưng có lỗi: cập nhật ${result.updated || 0}, bỏ qua ${result.skipped || 0}, thất bại ${result.failed || 0}. Lỗi đầu tiên: ${firstFailure}`
          : `Đồng bộ hoàn tất nhưng có lỗi: cập nhật ${result.updated || 0}, bỏ qua ${result.skipped || 0}, thất bại ${result.failed || 0}.`
      )
    } else {
      notifySuccess(
        `Đã đồng bộ ảnh thành công: cập nhật ${result.updated || 0}, bỏ qua ${result.skipped || 0}, thất bại ${result.failed || 0}.`
      )
    }
  } catch (error) {
    notifyError(error.message || 'Không thể đồng bộ ảnh năng lực lên Cloudinary.')
  } finally {
    resyncingImages.value = false
  }
}

function onFileSelected(event) {
  uploadFile.value = event.target.files?.[0] || null
}

async function uploadHonorImage() {
  const token = normalizedToken()
  if (!token) return
  if (!uploadFile.value) {
    notifyError('Vui lòng chọn ảnh trước khi tải lên.')
    return
  }

  uploading.value = true
  try {
    const media = await uploadAdminMediaAsset(token, uploadFile.value, {
      title: honorForm.uploadTitle || honorForm.title,
      altText: honorForm.uploadAltText || honorForm.title,
    })
    honorForm.image_url = media.url || ''
    uploadStorageBackend.value = String(media.storage_backend || 'unknown').toLowerCase()
    uploadFallbackReason.value = String(media.fallback_reason || '')
    uploadFile.value = null
    honorForm.uploadTitle = ''
    honorForm.uploadAltText = ''
    notifySuccess(`Đã tải ảnh lên thành công (${uploadStorageBackend.value}).`)
  } catch (error) {
    resetUploadFeedback()
    notifyError(error.message || 'Tải ảnh lên thất bại.')
  } finally {
    uploading.value = false
  }
}

async function submitHonorForm() {
  const token = normalizedToken()
  if (!token || !validateHonorForm()) return

  const isCreating = honorFormMode.value === 'create'
  const confirmed = await askForConfirmation({
    tone: 'primary',
    eyebrow: isCreating ? 'Tạo mục năng lực' : 'Cập nhật mục năng lực',
    title: isCreating ? 'Xác nhận tạo mục năng lực mới?' : 'Xác nhận cập nhật mục năng lực?',
    message: isCreating
      ? `Mục năng lực "${String(honorForm.title || '').trim()}" sẽ được tạo mới.`
      : `Các thay đổi của mục năng lực "${String(honorForm.title || '').trim()}" sẽ được lưu lại.`,
    confirmText: isCreating ? 'Tạo mới' : 'Lưu thay đổi',
  })
  if (!confirmed) return

  saving.value = true
  try {
    const payload = buildHonorPayload()
    if (isCreating) {
      await createHonor(token, payload)
      notifySuccess('Đã tạo mục năng lực mới.')
    } else {
      await updateHonor(token, editingHonorId.value, payload)
      notifySuccess('Đã cập nhật mục năng lực.')
    }
    closeHonorForm()
    await refreshHonorsOnly()
  } catch (error) {
    notifyError(error.message || 'Không thể lưu mục năng lực.')
  } finally {
    saving.value = false
  }
}

async function removeHonor(record) {
  const token = normalizedToken()
  if (!token) return

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa mục năng lực',
    title: 'Xác nhận xóa mục năng lực?',
    message: `Mục năng lực "${record.title}" sẽ bị xóa mềm khỏi hệ thống quản trị.`,
    confirmText: 'Xóa mục',
  })
  if (!confirmed) return

  try {
    await softDeleteHonor(token, record.id)
    notifySuccess('Đã xóa mục năng lực.')
    await refreshHonorsOnly()
  } catch (error) {
    notifyError(error.message || 'Không thể xóa mục năng lực.')
  }
}

async function onToggleHonorActive(record, nextValue) {
  const token = normalizedToken()
  if (!token) return

  try {
    await toggleHonorActive(token, record.id, nextValue)
    await refreshHonorsOnly()
    notifySuccess(nextValue ? 'Đã bật hiển thị mục năng lực.' : 'Đã tắt hiển thị mục năng lực.')
  } catch (error) {
    notifyError(error.message || 'Không thể cập nhật trạng thái mục năng lực.')
  }
}

async function submitCategoryForm() {
  const token = normalizedToken()
  if (!token || !validateCategoryForm()) return

  const isCreating = categoryFormMode.value === 'create'
  const confirmed = await askForConfirmation({
    tone: 'primary',
    eyebrow: isCreating ? 'Tạo danh mục' : 'Cập nhật danh mục',
    title: isCreating ? 'Xác nhận tạo danh mục mới?' : 'Xác nhận cập nhật danh mục?',
    message: isCreating
      ? `Danh mục "${String(categoryForm.name || '').trim()}" sẽ được tạo mới.`
      : `Các thay đổi của danh mục "${String(categoryForm.name || '').trim()}" sẽ được lưu lại.`,
    confirmText: isCreating ? 'Tạo danh mục' : 'Lưu thay đổi',
  })
  if (!confirmed) return

  categorySaving.value = true
  try {
    const payload = buildCategoryPayload()
    if (isCreating) {
      await createHonorCategory(token, payload)
      notifySuccess('Đã tạo danh mục mới.')
    } else {
      await updateHonorCategory(token, editingCategoryId.value, payload)
      notifySuccess('Đã cập nhật danh mục.')
    }
    closeCategoryForm()
    await loadCategories()
    if (showHonorsSection.value) {
      await refreshHonorsOnly()
    }
  } catch (error) {
    notifyError(error.message || 'Không thể lưu danh mục.')
  } finally {
    categorySaving.value = false
  }
}

async function removeCategory(record) {
  const token = normalizedToken()
  if (!token) return

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa danh mục',
    title: 'Xác nhận xóa danh mục?',
    message: `Danh mục "${record.name}" sẽ bị xóa mềm khỏi hệ thống quản trị.`,
    confirmText: 'Xóa danh mục',
  })
  if (!confirmed) return

  try {
    await deleteHonorCategory(token, record.id)
    notifySuccess('Đã xóa danh mục.')
    if (String(filters.categoryId) === String(record.id)) {
      filters.categoryId = ''
    }
    await loadCategories()
    if (showHonorsSection.value) {
      await refreshHonorsOnly({ resetPage: true })
    }
  } catch (error) {
    notifyError(error.message || 'Không thể xóa danh mục.')
  }
}

async function onToggleCategoryActive(record, nextValue) {
  const token = normalizedToken()
  if (!token) return

  try {
    await updateHonorCategory(token, record.id, { is_active: nextValue })
    notifySuccess(nextValue ? 'Đã bật hiển thị danh mục.' : 'Đã tắt hiển thị danh mục.')
    await loadCategories()
    if (showHonorsSection.value) {
      await refreshHonorsOnly()
    }
  } catch (error) {
    notifyError(error.message || 'Không thể cập nhật trạng thái danh mục.')
  }
}

watch(
  () => props.active,
  async (active) => {
    if (active && normalizedToken()) {
      await refreshAll()
    } else {
      closeHonorForm()
      closeCategoryForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.token,
  async (token) => {
    if (String(token || '').trim() && props.active) {
      await refreshAll()
    }
  },
)

watch(pageSize, async (nextSize, previousSize) => {
  if (nextSize === previousSize) return
  if (!showHonorsSection.value) return
  if (!props.active || !normalizedToken()) return
  await refreshHonorsOnly({ resetPage: true })
})
</script>

<template>
  <section class="honors-admin">
    <div class="ultimate-clean-workspace">
      <!-- 1. Unified Header -->
      <header class="intro-card">
        <div class="intro-copy">
          <p class="intro-eyebrow">{{ $t('admin.capability.items.eyebrow') }}</p>
          <h2>{{ headerMeta.title }}</h2>
          <p>{{ headerMeta.description }}</p>
        </div>
        <div class="intro-actions">
          <button
            v-if="showHonorsSection"
            type="button"
            class="btn btn-secondary btn-sm"
            :disabled="resyncingImages || loading"
            @click="resyncHonorImages"
          >
            {{ resyncingImages ? $t('admin.about.toolbar.refreshing') : $t('admin.about.toolbar.refresh') }}
          </button>
          <button v-if="showCategorySection" type="button" class="btn btn-secondary btn-sm" @click="openCreateCategoryForm">
            + {{ $t('admin.capability.categories.add_new') }}
          </button>
          <button v-if="showHonorsSection" type="button" class="btn btn-primary btn-sm" @click="openCreateHonorForm">
            + {{ $t('admin.capability.items.add_new') }}
          </button>
        </div>
      </header>

      <section v-if="showCategorySection" class="section-list-unified">
        <div class="editor-head" style="padding: 24px 32px 16px;">
          <div>
            <p class="editor-eyebrow">{{ $t('admin.capability.categories.eyebrow') }}</p>
            <h4>{{ $t('admin.capability.categories.label') }}</h4>
          </div>
        </div>
        <div v-if="loading" class="empty">{{ $t('admin.common.loading') }}</div>
        <div v-else-if="!categories.length" class="empty">{{ $t('admin.common.no_data') }}</div>
        <div v-else class="capability-category-grid">
          <article v-for="item in categories" :key="item.id" class="capability-card">
            <div class="capability-card__body">
              <div class="capability-card__main">
                <span class="capability-card__badge" :class="item.type">{{ categoryTypeLabel(item.type) }}</span>
                <h3>{{ item.name }}</h3>
                <p class="capability-card__slug">/{{ item.slug }}</p>
                <div class="capability-card__meta">
                   <span v-if="item.parent_id" class="meta-chip">{{ $t('admin.capability.items.fields.award_category') }}: {{ categoryName(item.parent_id) }}</span>
                   <span class="meta-chip">{{ $t('admin.capability.settings.cards.sort') }}: {{ item.sort_order || 0 }}</span>
                </div>
              </div>
              <div class="capability-card__actions">
                <button type="button" class="btn btn-secondary btn-sm" @click="openEditCategoryForm(item)">
                  {{ $t('admin.capability.categories.edit') }}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  @click="onToggleCategoryActive(item, !item.is_active)"
                >
                  {{ item.is_active ? $t('admin.about.section.collapse') : $t('admin.about.section.edit') }}
                </button>
                <button type="button" class="btn btn-danger btn-sm" @click="removeCategory(item)">
                   {{ $t('admin.capability.categories.delete') }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-if="showHonorsSection" class="editor-head" style="padding: 24px 32px 16px; border-top: 1px solid #f1f5f9;">
        <div class="toolbar-grid" style="grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%;">
          <input v-model="filters.keyword" type="search" class="form-control" :placeholder="$t('admin.about.toolbar.search_placeholder')" />
          <select v-model="filters.categoryId" class="form-control">
            <option value="">-- {{ $t('admin.capability.categories.label') }} --</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
          <select v-model="filters.status" class="form-control">
            <option value="all">{{ $t('admin.about.toolbar.all_status') }}</option>
            <option value="active">{{ $t('admin.about.toolbar.complete') }}</option>
            <option value="inactive">{{ $t('admin.about.toolbar.missing_content') }}</option>
          </select>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" :disabled="loading" @click="applyHonorsFilters">{{ $t('admin.about.toolbar.refresh') }}</button>
            <button type="button" class="btn btn-secondary btn-sm" :disabled="loading" @click="refreshAll">{{ $t('admin.about.toolbar.reset') }}</button>
          </div>
        </div>
      </section>

      <section v-if="showHonorsSection" class="section-list-unified">
        <div class="table-wrap">
          <table class="ultimate-table">
            <thead>
              <tr>
                <th style="width: 80px;">{{ $t('admin.about.section.blocks_count', { count: 1 }).split(' ')[1] }}</th>
                <th>{{ $t('admin.capability.items.label') }}</th>
                <th style="width: 180px;">{{ $t('admin.capability.items.fields.award_category') }}</th>
                <th style="width: 80px;">{{ $t('admin.capability.categories.table.status') }}</th>
                <th style="width: 180px;">{{ $t('admin.capability.categories.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in honors" :key="item.id" class="honor-row">
                <td>
                  <div class="section-thumb-clean" style="width: 60px; height: 40px;">
                    <img
                      v-if="item.image_url && !brokenImageIds.has(item.id)"
                      :src="resolveImageUrl(item.image_url)"
                      :alt="item.title"
                      @error="onHonorImageError(item.id)"
                    />
                    <div v-else class="section-thumb-clean__placeholder" style="font-size: 16px;">
                      <span>{{ item.title.slice(0, 1) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="table-cell-title">
                    <span>{{ item.title }}</span>
                    <p class="table-cell-subtext" style="font-weight: normal;">{{ item.issued_by || 'Chưa có đơn vị cấp' }}</p>
                  </div>
                </td>
                <td>{{ categoryName(item.category_id) }}</td>
                <td>
                  <span :class="item.is_active ? 'badge badge-active' : 'badge badge-inactive'">
                    {{ item.is_active ? $t('admin.common.active') : $t('admin.common.inactive') }}
                  </span>
                </td>
                <td class="table-actions">
                  <button type="button" class="btn btn-secondary btn-sm" @click="openEditHonorForm(item)">{{ $t('admin.common.edit') }}</button>
                  <button type="button" class="btn btn-secondary btn-sm" @click="onToggleHonorActive(item, !item.is_active)">
                    {{ item.is_active ? $t('admin.common.inactive') : $t('admin.common.active') }}
                  </button>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeHonor(item)">{{ $t('admin.common.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <div v-if="totalRecords > 0" class="table-pagination">
        <p class="pagination-meta">
          {{ $t('admin.common.total') }} {{ totalRecords }} {{ $t('admin.sidebar.activity_logs') }} • {{ $t('admin.common.page') }} {{ currentPage }} / {{ totalPages }}
        </p>
        <div class="pagination-actions">
          <button type="button" class="btn btn-secondary" :disabled="loading || currentPage <= 1" @click="setPage(currentPage - 1)">
            {{ $t('admin.common.prev') }}
          </button>
          <button type="button" class="btn btn-secondary" :disabled="loading || currentPage >= totalPages" @click="setPage(currentPage + 1)">
            {{ $t('admin.common.next') }}
          </button>
        </div>
      </div>
    </section>

    <teleport to="body">
      <div v-if="showHonorsSection && honorFormOpen" class="editor-shell editor-shell--modal" @click.self="closeHonorForm">
        <aside class="editor-panel editor-panel--modal" @click.stop>
          <div class="editor-head">
            <div class="editor-head__content">
              <div class="editor-head__badge-wrap">
                <p class="eyebrow">{{ honorFormMode === 'create' ? 'Create' : 'Edit' }}</p>
                <span class="editor-head__badge">{{ $t('admin.capability.items.label') }}</span>
              </div>
              <h3>{{ honorFormMode === 'create' ? $t('admin.capability.items.add_new') : $t('admin.capability.items.edit') }}</h3>
              <p class="editor-head__copy">{{ $t('admin.capability.items.description') }}</p>
            </div>
            <button type="button" class="icon-btn" @click="closeHonorForm">×</button>
          </div>

        <div v-if="honorFormErrors.length" class="errors">
          <p v-for="error in honorFormErrors" :key="error">{{ error }}</p>
        </div>

        <div class="upload-box">
          <div class="upload-box__head">
            <strong>Tải ảnh lên</strong>
            <p class="upload-box__copy">Chọn file ảnh từ máy để tải lên cho chứng nhận này.</p>
          </div>
          <div class="upload-row">
            <input type="file" accept="image/*" @change="onFileSelected" />
          <input v-model="honorForm.uploadTitle" type="text" placeholder="Tiêu đề ảnh tải lên" />
          <input v-model="honorForm.uploadAltText" type="text" placeholder="Alt text của ảnh" />
          <button type="button" class="btn btn-primary" :disabled="uploading" @click="uploadHonorImage">
            {{ uploading ? 'Đang tải lên...' : 'Tải ảnh lên' }}
          </button>
        </div>
        <div v-if="uploadStorageBackend" class="upload-feedback">
          <span
            class="upload-badge"
            :class="uploadStorageBackend === 'cloudinary' ? 'upload-badge-cloudinary' : 'upload-badge-local'"
          >
            Đã tải lên: {{ uploadStorageBackend }}
          </span>
          <p v-if="uploadFallbackReason" class="upload-fallback">
            Fallback reason: {{ uploadFallbackReason }}
          </p>
        </div>
        </div>

        <form class="dynamic-form" @submit.prevent="submitHonorForm">
          <label class="editor-field">
            <span>{{ $t('admin.capability.items.fields.award_category') }}</span>
            <select v-model="honorForm.category_id">
              <option disabled value="">{{ $t('admin.common.no_data') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.categories.table.name') }}</span>
            <input v-model="honorForm.title" type="text" />
          </label>

          <label class="editor-field">
            <span>Slug</span>
            <input v-model="honorForm.slug" type="text" :placeholder="$t('admin.about.toolbar.slug_placeholder')" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.about.media.media_title') }} URL</span>
            <input v-model="honorForm.image_url" type="text" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.items.fields.award_year') }}</span>
            <input v-model="honorForm.year" type="number" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.items.fields.issuer') }}</span>
            <input v-model="honorForm.issued_by" type="text" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.categories.table.type') }}</span>
            <select v-model="honorForm.display_type">
              <option value="qualification_certificate">{{ $t('admin.capability.categories.types.qualification_certificate') }}</option>
              <option value="corporate_honors">{{ $t('admin.capability.categories.types.corporate_honors') }}</option>
              <option value="project_honors">{{ $t('admin.capability.categories.types.project_honors') }}</option>
            </select>
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.settings.cards.sort') }}</span>
            <input v-model="honorForm.sort_order" type="number" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.categories.table.status') }}</span>
            <select v-model="honorForm.is_active">
              <option :value="true">{{ $t('admin.about.toolbar.complete') }}</option>
              <option :value="false">{{ $t('admin.about.toolbar.missing_content') }}</option>
            </select>
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.about.toolbar.featured') || 'Featured' }}</span>
            <select v-model="honorForm.is_featured">
              <option :value="false">{{ $t('admin.about.common.no') || 'No' }}</option>
              <option :value="true">{{ $t('admin.about.common.yes') || 'Yes' }}</option>
            </select>
          </label>

          <label class="editor-field wide">
            <span>{{ $t('admin.capability.items.fields.short_description') || 'Short Description' }}</span>
            <textarea v-model="honorForm.short_description" rows="4"></textarea>
          </label>

          <div class="form-actions wide">
            <button type="button" class="btn btn-secondary" @click="closeHonorForm">{{ $t('admin.common.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? $t('admin.common.saving') : honorFormMode === 'create' ? $t('admin.common.create') : $t('admin.common.updated_at') }}
            </button>
          </div>
        </form>
        </aside>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showCategorySection && categoryFormOpen" class="editor-shell editor-shell--modal" @click.self="closeCategoryForm">
        <aside class="editor-panel editor-panel--modal" @click.stop>
          <div class="editor-head">
            <div class="editor-head__content">
              <div class="editor-head__badge-wrap">
                <p class="eyebrow">{{ categoryFormMode === 'create' ? 'Create' : 'Edit' }}</p>
                <span class="editor-head__badge">{{ $t('admin.capability.categories.label') }}</span>
              </div>
              <h3>{{ categoryFormMode === 'create' ? $t('admin.capability.categories.add_new') : $t('admin.capability.categories.edit') }}</h3>
              <p class="editor-head__copy">{{ $t('admin.capability.categories.description') }}</p>
            </div>
            <button type="button" class="icon-btn" @click="closeCategoryForm">×</button>
          </div>

        <div v-if="categoryFormErrors.length" class="errors">
          <p v-for="error in categoryFormErrors" :key="error">{{ error }}</p>
        </div>

        <form class="dynamic-form" @submit.prevent="submitCategoryForm">
          <label class="editor-field">
            <span>{{ $t('admin.capability.categories.table.name') }}</span>
            <input v-model="categoryForm.name" type="text" />
          </label>

          <label class="editor-field">
            <span>Slug</span>
            <input v-model="categoryForm.slug" type="text" :placeholder="$t('admin.about.toolbar.slug_placeholder')" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.categories.table.type') }}</span>
            <select v-model="categoryForm.type">
              <option v-for="option in categoryTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.items.fields.award_category') }}</span>
            <select v-model="categoryForm.parent_id">
              <option value="">{{ $t('admin.common.no_data') }}</option>
              <option v-for="item in categoryParentOptions" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.settings.cards.sort') }}</span>
            <input v-model="categoryForm.sort_order" type="number" />
          </label>

          <label class="editor-field">
            <span>{{ $t('admin.capability.categories.table.status') }}</span>
            <select v-model="categoryForm.is_active">
              <option :value="true">{{ $t('admin.about.toolbar.complete') }}</option>
              <option :value="false">{{ $t('admin.about.toolbar.missing_content') }}</option>
            </select>
          </label>

          <label class="editor-field wide">
            <span>{{ $t('admin.capability.categories.description') }}</span>
            <textarea v-model="categoryForm.description" rows="4"></textarea>
          </label>

          <div class="form-actions wide">
            <button type="button" class="btn btn-secondary" @click="closeCategoryForm">{{ $t('admin.common.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="categorySaving">
              {{ categorySaving ? $t('admin.common.saving') : categoryFormMode === 'create' ? $t('admin.common.create') : $t('admin.common.updated_at') }}
            </button>
          </div>
        </form>
        </aside>
      </div>
    </teleport>

    <CoreConfirmDialog
      :visible="confirmDialog.visible"
      :dialog="confirmDialog"
      :confirm-button-class="confirmDialog.tone === 'danger' ? 'btn btn-danger' : 'btn btn-primary'"
      @cancel="cancelConfirmDialog"
      @accept="acceptConfirmDialog"
    />
    </div>
  </section>
</template>

<style scoped>
@import '@/views/admin/shared/components/AdminCoreEditor.css';

.honors-admin {
  display: grid;
  gap: 24px;
}

.ultimate-clean-workspace {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.intro-card {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.intro-copy h2 {
  margin: 4px 0;
  font-size: 22px;
  font-weight: 500;
  color: #1e293b;
}

.intro-copy p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.intro-eyebrow, .editor-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.intro-actions {
  display: flex;
  gap: 8px;
}

.section-list-unified {
  padding: 0;
}

.table-wrap {
  padding: 0 32px 32px;
  overflow-x: auto;
}

.ultimate-table {
  width: 100%;
  border-collapse: collapse;
}

.ultimate-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.ultimate-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.table-cell-title span {
  display: block;
  font-weight: 500;
  color: #1e293b;
}

.table-cell-subtext {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.table-actions {
  display: flex;
  gap: 6px;
}

.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}

.badge-active {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.table-pagination {
  margin: 16px 32px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-meta {
  color: #64748b;
  font-size: 13px;
}

.pagination-actions {
  display: flex;
  gap: 8px;
}

.form-control {
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  color: #1e293b;
  width: 100%;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.section-thumb-clean {
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  background: #f8fafc;
}

.section-thumb-clean img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section-thumb-clean__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #94a3b8;
  font-weight: 500;
}

.btn-secondary-inline, .btn-danger-inline, .btn-soft-inline {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary-inline {
  background: #f1f5f9;
  color: #475569;
}

.btn-danger-inline {
  background: #fef2f2;
  color: #dc2626;
}

.btn-soft-inline {
  background: #f0f9ff;
  color: #0369a1;
}

.btn-secondary-inline:hover { background: #e2e8f0; }
.btn-danger-inline:hover { background: #fecaca; }
.btn-soft-inline:hover { background: #e0f2fe; }

@media (max-width: 768px) {
  .intro-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
.capability-category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 24px;
  padding: 0 32px 32px;
}

.capability-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.capability-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.capability-card__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.capability-card__main {
  flex: 1;
}

.capability-card__badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.capability-card__main h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.capability-card__slug {
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
}

.capability-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-chip {
  font-size: 12px;
  background: #f8fafc;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.capability-card__actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.capability-card__actions .btn {
  flex: 1;
  justify-content: center;
}

@media (max-width: 1400px) {
  .capability-category-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 860px) {
  .capability-category-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
