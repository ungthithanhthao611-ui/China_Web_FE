<script setup>
import { computed, reactive, ref, watch } from 'vue'

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

const categoryTypeOptions = [
  { value: 'qualification_certificate', label: 'Chứng chỉ năng lực' },
  { value: 'awards_group', label: 'Nhóm giải thưởng' },
  { value: 'corporate_honors', label: 'Danh hiệu doanh nghiệp' },
  { value: 'project_honors', label: 'Danh hiệu dự án' },
  { value: 'custom', label: 'Tùy chỉnh' },
]

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
  eyebrow: 'Xác nhận thao tác',
  title: 'Bạn có chắc chắn muốn tiếp tục?',
  message: '',
  confirmText: 'Xác nhận',
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
    eyebrow = 'Xác nhận thao tác',
    title = 'Bạn có chắc chắn muốn tiếp tục?',
    message = 'Thao tác sẽ được thực thi ngay sau khi bạn xác nhận.',
    confirmText = 'Xác nhận',
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
      title: 'Quản lý danh mục năng lực',
      description: 'Tạo, sửa, xóa danh mục; đổi trạng thái; sắp xếp và quản lý phân cấp danh mục.',
    }
  }
  if (normalizedViewMode.value === 'honors') {
    return {
      title: 'Quản lý mục năng lực',
      description: 'Tạo, sửa, xóa mục năng lực; tải ảnh; ẩn/xóa mềm; đổi trạng thái và sắp xếp hiển thị.',
    }
  }
  return {
    title: 'Quản lý danh mục và mục năng lực',
    description: 'Quản trị đầy đủ module năng lực: danh mục, mục năng lực, tải ảnh, xóa mềm, đổi trạng thái và sắp xếp hiển thị.',
  }
})
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))

function categoryName(categoryId) {
  if (!categoryId) return 'Chưa phân loại'
  return categoryMap.value.get(categoryId)?.name || `Danh mục #${categoryId}`
}

function categoryTypeLabel(typeValue) {
  return categoryTypeOptions.find((item) => item.value === typeValue)?.label || typeValue || '-'
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
    <header class="panel header-panel">
      <div>
        <p class="eyebrow">Quản trị năng lực</p>
        <h2>{{ headerMeta.title }}</h2>
        <p class="subtext">{{ headerMeta.description }}</p>
      </div>
      <div class="header-actions">
        <button
          v-if="showHonorsSection"
          type="button"
          class="btn btn-secondary"
          :disabled="resyncingImages || loading"
          @click="resyncHonorImages"
        >
          {{ resyncingImages ? 'Đang đồng bộ...' : 'Đồng bộ ảnh' }}
        </button>
        <button v-if="showCategorySection" type="button" class="btn btn-secondary" @click="openCreateCategoryForm">Thêm danh mục</button>
        <button v-if="showHonorsSection" type="button" class="btn btn-primary" @click="openCreateHonorForm">Thêm mục năng lực</button>
        <button
          v-if="showCategorySection && !showHonorsSection"
          type="button"
          class="btn btn-secondary"
          :disabled="loading"
          @click="refreshAll"
        >
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </div>
    </header>

    <section v-if="showCategorySection" class="panel category-panel">
      <div class="panel-head">
        <h3>Danh mục năng lực</h3>
        <button type="button" class="btn btn-secondary" @click="openCreateCategoryForm">Tạo danh mục</button>
      </div>
      <div v-if="loading" class="empty">Đang tải danh mục...</div>
      <div v-else-if="!categories.length" class="empty">Chưa có danh mục nào.</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Loại</th>
              <th>Danh mục cha</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in categories" :key="item.id" class="category-row">
              <td data-label="Tên danh mục">{{ item.name }}</td>
              <td data-label="Slug">{{ item.slug }}</td>
              <td data-label="Loại">{{ categoryTypeLabel(item.type) }}</td>
              <td data-label="Danh mục cha">{{ categoryName(item.parent_id) }}</td>
              <td data-label="Thứ tự">{{ item.sort_order || 0 }}</td>
              <td data-label="Trạng thái">
                <span :class="statusBadgeClass(item.is_active)">{{ item.is_active ? 'Đang hiển thị' : 'Đang ẩn' }}</span>
              </td>
              <td data-label="Thao tác">
                <div class="actions">
                  <button type="button" class="btn btn-secondary" @click="openEditCategoryForm(item)">Sửa</button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="onToggleCategoryActive(item, !item.is_active)"
                  >
                    {{ item.is_active ? 'Ẩn' : 'Hiển thị' }}
                  </button>
                  <button type="button" class="btn btn-danger" @click="removeCategory(item)">Xóa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="showHonorsSection" class="panel filters-panel">
      <input v-model="filters.keyword" type="search" placeholder="Tìm theo tiêu đề, đơn vị cấp, mô tả..." />
      <select v-model="filters.categoryId">
        <option value="">Tất cả danh mục</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
      <select v-model="filters.status">
        <option value="all">Tất cả trạng thái</option>
        <option value="active">Đang hiển thị</option>
        <option value="inactive">Đang ẩn</option>
      </select>
      <select v-model.number="pageSize" :disabled="loading">
        <option :value="10">10 / trang</option>
        <option :value="20">20 / trang</option>
        <option :value="50">50 / trang</option>
      </select>
      <button type="button" class="btn btn-secondary" :disabled="loading" @click="applyHonorsFilters">
        {{ loading ? 'Đang tải...' : 'Áp dụng bộ lọc' }}
      </button>
      <button type="button" class="btn btn-secondary" :disabled="loading" @click="refreshAll">
        {{ loading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </section>

    <section v-if="showHonorsSection" class="panel table-panel">
      <div class="panel-head">
        <h3>Mục năng lực</h3>
        <button type="button" class="btn btn-primary" @click="openCreateHonorForm">Tạo mục năng lực</button>
      </div>
      <div v-if="loading" class="empty">Đang tải dữ liệu năng lực...</div>
      <div v-else-if="!honors.length" class="empty">Chưa có mục năng lực nào.</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Năm</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in honors" :key="item.id" class="honor-row">
              <td data-label="Hình ảnh">
                <img
                  v-if="item.image_url && !brokenImageIds.has(item.id)"
                  class="thumb"
                  :src="resolveImageUrl(item.image_url)"
                  :alt="item.title"
                  @error="onHonorImageError(item.id)"
                />
                <div v-else class="thumb thumb-empty">Chưa có ảnh</div>
              </td>
              <td data-label="Tiêu đề">
                <p class="title">{{ item.title }}</p>
                <p class="meta">{{ item.issued_by || 'Chưa có đơn vị cấp' }}</p>
              </td>
              <td data-label="Danh mục">{{ categoryName(item.category_id) }}</td>
              <td data-label="Năm">{{ item.year || '-' }}</td>
              <td data-label="Thứ tự">{{ item.sort_order || 0 }}</td>
              <td data-label="Trạng thái">
                <span :class="statusBadgeClass(item.is_active)">{{ item.is_active ? 'Đang hiển thị' : 'Đang ẩn' }}</span>
              </td>
              <td data-label="Thao tác">
                <div class="actions">
                  <button type="button" class="btn btn-secondary" @click="openEditHonorForm(item)">Sửa</button>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="onToggleHonorActive(item, !item.is_active)"
                  >
                    {{ item.is_active ? 'Ẩn' : 'Hiển thị' }}
                  </button>
                  <button type="button" class="btn btn-danger" @click="removeHonor(item)">Xóa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalRecords > 0" class="table-pagination">
        <p class="pagination-meta">
          Tổng {{ totalRecords }} bản ghi • Trang {{ currentPage }} / {{ totalPages }}
        </p>
        <div class="pagination-actions">
          <button type="button" class="btn btn-secondary" :disabled="loading || currentPage <= 1" @click="setPage(currentPage - 1)">
            Trước
          </button>
          <button type="button" class="btn btn-secondary" :disabled="loading || currentPage >= totalPages" @click="setPage(currentPage + 1)">
            Sau
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
                <span class="editor-head__badge">Năng Lực</span>
              </div>
              <h3>{{ honorFormMode === 'create' ? 'Tạo mục năng lực' : 'Chỉnh sửa mục năng lực' }}</h3>
              <p class="editor-head__copy">Cập nhật thông tin chi tiết, metadata và hình ảnh năng lực.</p>
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
            Lý do fallback: {{ uploadFallbackReason }}
          </p>
        </div>
        </div>

        <form class="dynamic-form" @submit.prevent="submitHonorForm">
          <label class="editor-field">
            <span>Danh mục</span>
            <select v-model="honorForm.category_id">
              <option disabled value="">Chọn danh mục</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="editor-field">
            <span>Tiêu đề</span>
            <input v-model="honorForm.title" type="text" />
          </label>

          <label class="editor-field">
            <span>Slug</span>
            <input v-model="honorForm.slug" type="text" placeholder="Không bắt buộc, sẽ tự tạo nếu để trống" />
          </label>

          <label class="editor-field">
            <span>URL hình ảnh</span>
            <input v-model="honorForm.image_url" type="text" />
          </label>

          <label class="editor-field">
            <span>Năm</span>
            <input v-model="honorForm.year" type="number" />
          </label>

          <label class="editor-field">
            <span>Đơn vị cấp</span>
            <input v-model="honorForm.issued_by" type="text" />
          </label>

          <label class="editor-field">
            <span>Kiểu hiển thị</span>
            <select v-model="honorForm.display_type">
              <option value="qualification_certificate">Chứng chỉ năng lực</option>
              <option value="corporate_honors">Danh hiệu doanh nghiệp</option>
              <option value="project_honors">Danh hiệu dự án</option>
            </select>
          </label>

          <label class="editor-field">
            <span>Thứ tự</span>
            <input v-model="honorForm.sort_order" type="number" />
          </label>

          <label class="editor-field">
            <span>Trạng thái</span>
            <select v-model="honorForm.is_active">
              <option :value="true">Đang hiển thị</option>
              <option :value="false">Đang ẩn</option>
            </select>
          </label>

          <label class="editor-field">
            <span>Nổi bật</span>
            <select v-model="honorForm.is_featured">
              <option :value="false">Không</option>
              <option :value="true">Có</option>
            </select>
          </label>

          <label class="editor-field wide">
            <span>Mô tả ngắn</span>
            <textarea v-model="honorForm.short_description" rows="4"></textarea>
          </label>

          <div class="form-actions wide">
            <button type="button" class="btn btn-secondary" @click="closeHonorForm">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Đang lưu...' : honorFormMode === 'create' ? 'Tạo mới' : 'Cập nhật' }}
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
                <span class="editor-head__badge">Danh Mục Năng Lực</span>
              </div>
              <h3>{{ categoryFormMode === 'create' ? 'Tạo danh mục' : 'Chỉnh sửa danh mục' }}</h3>
              <p class="editor-head__copy">Sắp xếp và quản lý phân cấp danh mục năng lực.</p>
            </div>
            <button type="button" class="icon-btn" @click="closeCategoryForm">×</button>
          </div>

        <div v-if="categoryFormErrors.length" class="errors">
          <p v-for="error in categoryFormErrors" :key="error">{{ error }}</p>
        </div>

        <form class="dynamic-form" @submit.prevent="submitCategoryForm">
          <label class="editor-field">
            <span>Tên danh mục</span>
            <input v-model="categoryForm.name" type="text" />
          </label>

          <label class="editor-field">
            <span>Slug</span>
            <input v-model="categoryForm.slug" type="text" placeholder="Không bắt buộc, sẽ tự tạo nếu để trống" />
          </label>

          <label class="editor-field">
            <span>Loại</span>
            <select v-model="categoryForm.type">
              <option v-for="option in categoryTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="editor-field">
            <span>Danh mục cha</span>
            <select v-model="categoryForm.parent_id">
              <option value="">Không có danh mục cha</option>
              <option v-for="item in categoryParentOptions" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </label>

          <label class="editor-field">
            <span>Thứ tự</span>
            <input v-model="categoryForm.sort_order" type="number" />
          </label>

          <label class="editor-field">
            <span>Trạng thái</span>
            <select v-model="categoryForm.is_active">
              <option :value="true">Đang hiển thị</option>
              <option :value="false">Đang ẩn</option>
            </select>
          </label>

          <label class="editor-field wide">
            <span>Mô tả</span>
            <textarea v-model="categoryForm.description" rows="4"></textarea>
          </label>

          <div class="form-actions wide">
            <button type="button" class="btn btn-secondary" @click="closeCategoryForm">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="categorySaving">
              {{ categorySaving ? 'Đang lưu...' : categoryFormMode === 'create' ? 'Tạo mới' : 'Cập nhật' }}
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
  </section>
</template>

<style scoped>
@import '@/views/admin/shared/components/AdminCoreEditor.css';
.honors-admin {
  margin-top: var(--admin-section-gap, 16px);
  display: grid;
  gap: var(--admin-section-gap, 16px);
}

.panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d7e5f2;
  border-radius: var(--admin-card-radius, 22px);
  box-shadow: var(--admin-card-shadow-soft, 0 10px 24px rgba(19, 41, 67, 0.08));
  padding: var(--admin-panel-padding, 16px);
}

.header-panel {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.panel-head h3 {
  margin: 0;
  color: #1f3850;
  font-size: var(--admin-subheading-size, clamp(20px, 1.8vw, 26px));
}

.eyebrow {
  margin: 0;
  font-size: var(--admin-label-size, 11px);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #59799c;
}

.header-panel h2 {
  margin: 4px 0 0;
  color: #203a55;
  font-size: var(--admin-heading-size, clamp(22px, 2vw, 30px));
  line-height: 1.08;
}

.subtext {
  margin: 6px 0 0;
  color: #617f9d;
  font-size: var(--admin-body-size, 14px);
  line-height: 1.55;
}

.filters-panel {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 130px auto auto;
  gap: 10px;
}

input,
select,
textarea {
  min-height: var(--admin-control-height, 42px);
  border: 1px solid #cddced;
  border-radius: var(--admin-control-radius, 14px);
  padding: 10px 12px;
  font: inherit;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.btn {
  min-height: var(--admin-button-height, 40px);
  border-radius: var(--admin-control-radius, 14px);
  border: 1px solid transparent;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #1f8ec9, #43b7e9);
}

.btn-secondary {
  color: #2f4e6f;
  background: #f3f7fb;
  border-color: #ccdbec;
}

.btn-danger {
  color: #a33345;
  background: #fff1f3;
  border-color: #edbbc4;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

th,
td {
  border-bottom: 1px solid #e4edf6;
  padding: 9px 10px;
  vertical-align: top;
  text-align: left;
  color: #24405d;
}

th {
  color: #4d6a88;
  font-size: 13px;
}

.thumb {
  width: 96px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #d7e4f1;
}

.thumb-empty {
  display: grid;
  place-items: center;
  font-size: 12px;
  color: #6f89a3;
  background: #f4f8fc;
}

.title {
  margin: 0;
  font-weight: 700;
}

.meta {
  margin: 4px 0 0;
  color: #6784a0;
  font-size: 13px;
}

.badge {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge-active {
  background: #e9f9ef;
  color: #1e7d44;
}

.badge-inactive {
  background: #fff2f4;
  color: #ad3f50;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty {
  text-align: center;
  color: #5f7a97;
  padding: 16px;
}

.table-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination-meta {
  margin: 0;
  color: #5f7a97;
  font-size: 13px;
}

.pagination-actions {
  display: flex;
  gap: 8px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 27, 42, 0.45);
  z-index: 50;
  padding: 16px;
  display: grid;
  place-items: center;
}

.form-panel,
.category-form-panel {
  width: min(980px, 100%);
  max-height: calc(100vh - 32px);
  overflow: auto;
}

.category-form-panel {
  width: min(760px, 100%);
}

.form-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-head h3 {
  margin: 0;
  color: #203a55;
  font-size: var(--admin-subheading-size, clamp(20px, 1.8vw, 26px));
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #cfdeee;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.errors {
  margin-top: 10px;
  border: 1px solid #edbcc5;
  border-radius: 12px;
  background: #fff0f3;
  color: #a13749;
  padding: 10px;
}

.errors p {
  margin: 0;
}

.upload-row {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
}

.upload-feedback {
  margin-top: 8px;
  display: grid;
  gap: 6px;
}

.upload-badge {
  display: inline-flex;
  width: fit-content;
  min-height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

.upload-badge-cloudinary {
  background: #e7f4ff;
  border-color: #b8dbfa;
  color: #1b5e8f;
}

.upload-badge-local {
  background: #fff3e9;
  border-color: #f2d3b6;
  color: #8a4d1f;
}

.upload-fallback {
  margin: 0;
  color: #8a4d1f;
  font-size: 13px;
}

.form-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  color: #486582;
  font-size: 13px;
  font-weight: 700;
}

label.wide,
.form-actions {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1100px) {
  .filters-panel {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 920px) {
  .header-panel {
    display: grid;
  }

  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 820px) {
  .upload-row,
  .form-grid,
  .form-actions {
    grid-template-columns: 1fr;
    display: grid;
  }

  .header-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .table-wrap {
    overflow: visible;
  }

  table {
    min-width: 0;
    display: block;
  }

  thead {
    display: none;
  }

  tbody {
    display: grid;
    gap: 10px;
  }

  .category-row,
  .honor-row {
    display: block;
    border: 1px solid #d7e5f2;
    border-radius: 10px;
    background: #fff;
    overflow: hidden;
  }

  .category-row td,
  .honor-row td {
    display: grid;
    grid-template-columns: minmax(95px, 38%) minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    border-bottom: 1px dashed #e4edf6;
    padding: 10px 12px;
  }

  .category-row td:last-child,
  .honor-row td:last-child {
    border-bottom: 0;
  }

  .category-row td::before,
  .honor-row td::before {
    content: attr(data-label);
    color: #5f7a97;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    line-height: 1.4;
    padding-top: 2px;
  }

  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .panel {
    padding: 12px;
  }

  .header-panel h2 {
    font-size: 26px;
  }

  .table-pagination,
  .pagination-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .pagination-actions > *,
  .header-actions > *,
  .form-actions > * {
    width: 100%;
  }

  .category-row td,
  .honor-row td {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .overlay {
    padding: 12px;
  }

  .form-panel,
  .category-form-panel {
    max-height: calc(100vh - 24px);
  }
}
</style>
