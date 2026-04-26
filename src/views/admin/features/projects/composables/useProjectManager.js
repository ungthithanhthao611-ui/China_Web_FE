import { computed, nextTick, reactive, ref } from 'vue'
import {
  createAdminEntityRecord,
  deleteAdminEntityRecord,
  listAdminEntityRecords,
  updateAdminEntityRecord,
  uploadAdminMediaAsset,
} from '@/views/admin/shared/api/adminApi.js'
import { env } from '@/shared/config/env'

// ─── Module-level singleton state ───
const API_ORIGIN = env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')
const ADMIN_FETCH_PAGE_SIZE = 100
const GALLERY_GROUP_OPTIONS = [
  { value: 'left_gallery', label: 'Gallery trái' },
  { value: 'right_gallery', label: 'Gallery phải' },
]

const loading = ref(false)
const savingProject = ref(false)
const deletingProject = ref(false)
const savingProductMapping = ref(false)
const deletingProductMappingId = ref(null)
const recentlySavedProductMappingId = ref(null)
const savingGallery = ref(false)
const deletingGalleryId = ref(null)
const uploadingCover = ref(false)
const uploadingGallery = ref(false)
const uploadingProjectAssets = ref(false)

const confirmDialog = reactive({
  visible: false,
  tone: 'danger',
  eyebrow: 'Xác nhận thao tác',
  title: 'Bạn có chắc chắn muốn tiếp tục?',
  message: '',
  confirmText: 'Xác nhận',
})
let confirmDialogResolver = null


const projectSearch = ref('')
const selectedProjectId = ref('')
const projects = ref([])
const products = ref([])
const projectProducts = ref([])
const mediaAssets = ref([])
const galleryBindings = ref([])
const languages = ref([])
const productMappingRowRefs = ref(new Map())

const projectFormErrors = ref([])
const productFormErrors = ref([])
const galleryFormErrors = ref([])

const isCreatingProject = ref(false)
const currentMode = ref('list')
const deletingProjectId = ref(null)
const uploadingMultiGallery = ref(false)
const coverPreviewUrl = ref('')

const projectForm = reactive({
  title: '', slug: '', summary: '', body: '', location: '',
  image_id: '', language_id: '', status: 'published',
  uploadTitle: '', uploadAltText: '',
})

const productForm = reactive({
  open: false, mode: 'create', editingId: null,
  product_id: '', sort_order: 10, note: '',
})

const galleryForm = reactive({
  open: false, mode: 'create', editingId: null,
  media_id: '', group_name: 'left_gallery', sort_order: 10,
  caption: '', uploadTitle: '', uploadAltText: '',
})

const coverUploadFile = ref(null)
const galleryUploadFile = ref(null)
const galleryPendingFiles = ref([])
const coverFileInputRef = ref(null)
const galleryMultiInputRef = ref(null)
const pendingProductSelections = ref([])
const productDropdownPlacement = ref('down')


// ─── Token management ───
let _tokenRef = null
let _emit = null

function setContext(tokenRef, emitFn) {
  _tokenRef = tokenRef
  _emit = emitFn
}

function normalizedToken() {
  const source = typeof _tokenRef === 'function' ? _tokenRef() : _tokenRef
  const raw = source && typeof source === 'object' && 'value' in source ? source.value : source
  return String(raw || '').trim()
}

// ─── Notify helpers ───
function notifySuccess(message) { _emit?.('notify-success', message) }
function notifyError(message) { _emit?.('notify-error', message) }
function clearNotify() { _emit?.('clear-notify') }

function closeConfirmDialog(result = false) {
  confirmDialog.visible = false
  if (confirmDialogResolver) {
    confirmDialogResolver(result)
    confirmDialogResolver = null
  }
}

function askForConfirmation(options = {}) {
  const {
    tone = 'danger',
    eyebrow = 'Xác nhận thao tác',
    title = 'Bạn có chắc chắn muốn tiếp tục?',
    message = 'Hành động này sẽ được thực thi ngay sau khi bạn đồng ý.',
    confirmText = 'Xác nhận',
  } = options

  if (confirmDialogResolver) {
    confirmDialogResolver(false)
    confirmDialogResolver = null
  }

  confirmDialog.tone = tone
  confirmDialog.eyebrow = eyebrow
  confirmDialog.title = title
  confirmDialog.message = message
  confirmDialog.confirmText = confirmText
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

// ─── Utility ───
function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`
}

// ─── Computed ───
const languageOptions = computed(() =>
  [...languages.value].sort((a, b) =>
    String(a.name || a.code || '').localeCompare(String(b.name || b.code || ''), 'vi'),
  ),
)

const mediaMap = computed(() => {
  const map = new Map()
  for (const item of mediaAssets.value) map.set(String(item.id), item)
  return map
})

const productMap = computed(() => {
  const map = new Map()
  for (const item of products.value) map.set(String(item.id), item)
  return map
})

const filteredProjects = computed(() => {
  const keyword = normalizeText(projectSearch.value)
  return [...projects.value]
    .filter((item) => {
      if (!keyword) return true
      return [item.title, item.location, item.slug, item.summary]
        .map(normalizeText).join(' ').includes(keyword)
    })
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
})

const selectedProject = computed(() =>
  projects.value.find((item) => String(item.id) === String(selectedProjectId.value)) || null,
)

const selectedProjectCover = computed(() => {
  const media = mediaMap.value.get(String(projectForm.image_id || ''))
  return resolveMediaUrl(media?.url || '')
})

const totalProjectsCount = computed(() => projects.value.length)
const totalProductMappingsCount = computed(() => projectProducts.value.length)
const totalGalleryImagesCount = computed(() =>
  galleryBindings.value.filter((item) => String(item.entity_type) === 'project').length,
)

function getProjectCoverThumb(projectId) {
  const p = projects.value.find((item) => String(item.id) === String(projectId))
  if (!p || !p.image_id) return ''
  const media = mediaMap.value.get(String(p.image_id))
  return resolveMediaUrl(media?.url || '')
}

const selectedProjectProducts = computed(() =>
  [...projectProducts.value]
    .filter((item) => String(item.project_id) === String(selectedProjectId.value))
    .sort((a, b) => {
      const sortDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0)
      if (sortDiff !== 0) return sortDiff
      return Number(a.id || 0) - Number(b.id || 0)
    }),
)

const selectedProjectGallery = computed(() =>
  [...galleryBindings.value]
    .filter((item) => String(item.entity_type) === 'project')
    .filter((item) => String(item.entity_id) === String(selectedProjectId.value))
    .sort((a, b) => {
      const sortDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0)
      if (sortDiff !== 0) return sortDiff
      return Number(a.id || 0) - Number(b.id || 0)
    }),
)

const groupedGallery = computed(() =>
  GALLERY_GROUP_OPTIONS.map((group) => ({
    ...group,
    items: selectedProjectGallery.value.filter(
      (item) => String(item.group_name) === String(group.value),
    ),
  })),
)

const pendingGalleryPreviewItems = computed(() =>
  galleryPendingFiles.value.map((item, index) => ({
    id: item.id,
    name: item.file.name,
    previewUrl: item.previewUrl,
    sort_order: item.sortOrder,
    isPending: true,
    index,
  })),
)


const selectedProjectProductsCount = computed(() => selectedProjectProducts.value.length)

const pendingSelectedProjectProducts = computed(() =>
  pendingProductSelections.value
    .map((item, index) => ({
      ...item,
      key: `${item.product_id}-${index}`,
      product: productMap.value.get(String(item.product_id)),
    }))
    .filter((item) => item.product),
)

const availableProductOptions = computed(() => {
  const pendingIds = new Set(pendingProductSelections.value.map((item) => String(item.product_id)))
  const usedIds = new Set(
    selectedProjectProducts.value
      .filter((item) => productForm.mode === 'edit' ? String(item.id) !== String(productForm.editingId) : true)
      .map((item) => String(item.product_id)),
  )
  return [...products.value]
    .filter((item) => !usedIds.has(String(item.id)) && !pendingIds.has(String(item.id)))
    .sort((a, b) => String(a.name || a.title || '').localeCompare(String(b.name || b.title || ''), 'vi'))
})

const availableGalleryMediaOptions = computed(() => {
  const usedIds = new Set(
    selectedProjectGallery.value
      .filter((item) => String(item.group_name) === String(galleryForm.group_name))
      .filter((item) => galleryForm.mode === 'edit' ? String(item.id) !== String(galleryForm.editingId) : true)
      .map((item) => String(item.media_id)),
  )
  return [...mediaAssets.value]
    .filter((item) => item.asset_type === 'image')
    .filter((item) => !usedIds.has(String(item.id)))
    .sort((a, b) => String(a.title || a.file_name || '').localeCompare(String(b.title || b.file_name || ''), 'vi'))
})

function isProductAlreadySelected(productId) {
  const normalizedId = String(productId)
  const isPending = pendingProductSelections.value.some((item) => String(item.product_id) === normalizedId)
  const isSaved = selectedProjectProducts.value.some((item) => String(item.product_id) === normalizedId)
  return isPending || isSaved
}

// ─── Label helpers ───
function languageLabel(language) {
  if (!language) return 'Ngôn ngữ mặc định'
  const name = String(language.name || '').trim()
  const code = String(language.code || '').trim()
  return code ? `${name || code} · ${code}` : name || 'Ngôn ngữ mặc định'
}
function productLabel(product) {
  if (!product) return 'Sản phẩm không tồn tại'
  const name = String(product.name || product.title || '').trim()
  const sku = String(product.sku || '').trim()
  return sku ? `${name} · ${sku}` : name
}
function mediaLabel(media) {
  if (!media) return 'Ảnh không tồn tại'
  return String(media.title || media.alt_text || media.url || `Media #${media.id}`)
}
function getProductThumb(product) {
  if (!product) return ''
  return product.image_url || ''
}

// ─── Form helpers ───
function setProductMappingRowRef(mappingId, element) {
  const key = String(mappingId || '')
  const nextMap = new Map(productMappingRowRefs.value)
  element ? nextMap.set(key, element) : nextMap.delete(key)
  productMappingRowRefs.value = nextMap
}

function scrollToProductMappingRow(mappingId) {
  const key = String(mappingId || '')
  const el = productMappingRowRefs.value.get(key)
  if (el?.$el) el.$el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  else if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function clearCoverPreview() {
  if (coverPreviewUrl.value) URL.revokeObjectURL(coverPreviewUrl.value)
  coverPreviewUrl.value = ''
}

function clearPendingGalleryFiles() {
  for (const item of galleryPendingFiles.value) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  }
  galleryPendingFiles.value = []
}

function clearPendingProductSelections() {
  pendingProductSelections.value = []
}

function clearProductPickerState() {
  productSearchQuery.value = ''
  showProductDropdown.value = false
  productDropdownPlacement.value = 'down'
}

function getDefaultLanguageId() {
  const normalizedLanguages = [...languages.value].sort((a, b) => {
    if (a?.is_default && !b?.is_default) return -1
    if (!a?.is_default && b?.is_default) return 1
    if (String(a?.code || '').toLowerCase() === 'vi' && String(b?.code || '').toLowerCase() !== 'vi') return -1
    if (String(a?.code || '').toLowerCase() !== 'vi' && String(b?.code || '').toLowerCase() === 'vi') return 1
    return Number(a?.id || 0) - Number(b?.id || 0)
  })

  const firstLanguage = normalizedLanguages[0]
  return firstLanguage ? String(firstLanguage.id) : '1'
}

function resetProjectForm() {
  projectForm.title = ''
  projectForm.slug = ''
  projectForm.summary = ''
  projectForm.body = ''
  projectForm.location = ''
  projectForm.image_id = ''
  projectForm.language_id = getDefaultLanguageId()
  projectForm.status = 'published'
  projectForm.uploadTitle = ''
  projectForm.uploadAltText = ''
  projectFormErrors.value = []
  coverUploadFile.value = null
  clearCoverPreview()
  clearPendingGalleryFiles()
}


function populateProjectForm(record) {
  if (!record) return
  projectForm.title = record.title || ''
  projectForm.slug = record.slug || ''
  projectForm.summary = record.summary || ''
  projectForm.body = record.body || ''
  projectForm.location = record.location || ''
  projectForm.image_id = record.image_id ? String(record.image_id) : ''
  projectForm.language_id = record.language_id ? String(record.language_id) : getDefaultLanguageId()
  projectForm.status = record.status || 'published'
  projectFormErrors.value = []
  coverUploadFile.value = null
  clearCoverPreview()
  clearPendingGalleryFiles()
}


function startCreateProject() {
  isCreatingProject.value = true
  selectedProjectId.value = ''
  clearPendingProductSelections()
  clearProductPickerState()
  resetProjectForm()
  currentMode.value = 'edit'
}

function selectProject(record) {
  isCreatingProject.value = false
  selectedProjectId.value = String(record.id)
  clearPendingProductSelections()
  clearProductPickerState()
  populateProjectForm(record)
  currentMode.value = 'edit'
}

function goToList() {
  currentMode.value = 'list'
  isCreatingProject.value = false
  selectedProjectId.value = ''
  clearPendingProductSelections()
  clearProductPickerState()
}

function goToEdit(project) { selectProject(project) }
function goToCreate() { startCreateProject() }

// ─── Validation ───
function validateProjectForm() {
  projectFormErrors.value = []
  if (!String(projectForm.title || '').trim()) projectFormErrors.value.push('Tên dự án là bắt buộc.')
  return !projectFormErrors.value.length
}

function buildProjectPayload() {
  return {
    title: String(projectForm.title || '').trim(),
    slug: slugify(projectForm.slug || projectForm.title),
    summary: String(projectForm.summary || '').trim() || null,
    body: String(projectForm.body || '').trim() || null,
    location: String(projectForm.location || '').trim() || null,
    image_id: projectForm.image_id ? Number(projectForm.image_id) : null,
    hero_image_id: null,
    language_id: Number(projectForm.language_id || getDefaultLanguageId() || 1),
    status: String(projectForm.status || 'published'),
  }
}

function resetProductForm() { Object.assign(productForm, { open: false, mode: 'create', editingId: null, product_id: '', sort_order: 10, note: '' }); productFormErrors.value = [] }
function openCreateProductForm() { resetProductForm(); productForm.open = true; productForm.sort_order = selectedProjectProducts.value.length ? Math.max(...selectedProjectProducts.value.map((i) => Number(i.sort_order || 0))) + 10 : 10 }
function openEditProductForm(record) { productForm.open = true; productForm.mode = 'edit'; productForm.editingId = record.id; productForm.product_id = String(record.product_id); productForm.sort_order = Number(record.sort_order || 0); productForm.note = record.note || ''; productFormErrors.value = [] }
function closeProductForm() { productForm.open = false; productFormErrors.value = [] }

function validateProductForm() {
  productFormErrors.value = []
  if (!selectedProjectId.value && !isCreatingProject.value) productFormErrors.value.push('Vui lòng chọn dự án.')
  if (!productForm.product_id) productFormErrors.value.push('Vui lòng chọn sản phẩm.')
  return !productFormErrors.value.length
}

function buildProductPayload() {
  return {
    project_id: Number(selectedProjectId.value),
    product_id: Number(productForm.product_id),
    sort_order: Number(productForm.sort_order || 0),
    note: String(productForm.note || '').trim() || null,
  }
}

function resetGalleryForm() { Object.assign(galleryForm, { open: false, mode: 'create', editingId: null, media_id: '', group_name: 'left_gallery', sort_order: 10, caption: '', uploadTitle: '', uploadAltText: '' }); galleryFormErrors.value = [] }
function openCreateGalleryForm(groupName = 'left_gallery') {
  resetGalleryForm(); galleryForm.open = true; galleryForm.group_name = groupName
  const groupItems = selectedProjectGallery.value.filter((i) => String(i.group_name) === String(groupName))
  galleryForm.sort_order = groupItems.length ? Math.max(...groupItems.map((i) => Number(i.sort_order || 0))) + 10 : 10
}
function openEditGalleryForm(record) { galleryForm.open = true; galleryForm.mode = 'edit'; galleryForm.editingId = record.id; galleryForm.media_id = String(record.media_id); galleryForm.group_name = record.group_name || 'left_gallery'; galleryForm.sort_order = Number(record.sort_order || 0); galleryForm.caption = record.caption || ''; galleryFormErrors.value = [] }
function closeGalleryForm() { galleryForm.open = false; galleryFormErrors.value = [] }

function validateGalleryForm() {
  galleryFormErrors.value = []
  if (!selectedProjectId.value) galleryFormErrors.value.push('Vui lòng chọn dự án.')
  if (!galleryForm.media_id) galleryFormErrors.value.push('Vui lòng chọn ảnh.')
  return !galleryFormErrors.value.length
}

function buildGalleryPayload() {
  return {
    entity_type: 'project',
    entity_id: Number(selectedProjectId.value),
    media_id: Number(galleryForm.media_id),
    group_name: String(galleryForm.group_name || 'left_gallery'),
    sort_order: Number(galleryForm.sort_order || 0),
    caption: String(galleryForm.caption || '').trim() || null,
  }
}

function buildGalleryPayloadFromItem(item) {
  return { entity_type: 'project', entity_id: Number(item.entity_id), media_id: Number(item.media_id), group_name: String(item.group_name || 'main'), sort_order: Number(item.sort_order || 0), caption: item.caption || null }
}

function buildProjectAssetFolder(projectRecordOrPayload = null) {
  const slugSource = projectRecordOrPayload?.slug || projectForm.slug || projectForm.title
  const normalizedSlug = slugify(slugSource || 'project')
  return `project/${normalizedSlug}`
}

function onCoverFileSelected(event) {
  const file = event.target.files?.[0] || null
  coverUploadFile.value = file
  clearCoverPreview()
  coverPreviewUrl.value = file ? URL.createObjectURL(file) : ''
  if (coverFileInputRef.value) coverFileInputRef.value.value = ''
}

async function removeCoverImage() {
  const hasExistingCover = Boolean(projectForm.image_id)
  const hasPendingCover = Boolean(coverUploadFile.value || coverPreviewUrl.value)

  if (!hasExistingCover && !hasPendingCover) {
    return
  }

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa ảnh đại diện',
    title: 'Bạn muốn xóa ảnh đại diện?',
    message: hasExistingCover
      ? 'Ảnh đại diện hiện tại sẽ bị gỡ khỏi form. Hãy bấm lưu dự án để cập nhật thay đổi này.'
      : 'Ảnh đang chọn sẽ bị bỏ khỏi form và không được tải lên khi lưu dự án.',
    confirmText: 'Xóa ảnh',
  })

  if (!confirmed) {
    return
  }

  projectForm.image_id = ''
  coverUploadFile.value = null
  clearCoverPreview()
  notifySuccess(
    hasExistingCover
      ? 'Đã gỡ ảnh đại diện khỏi form. Hãy lưu dự án để áp dụng thay đổi.'
      : 'Đã bỏ ảnh đang chọn khỏi form.',
  )
}

function onGalleryFileSelected(event) {
  galleryUploadFile.value = event.target.files?.[0] || null
}

function appendPendingGalleryFiles(files) {
  if (!files.length) return
  const startSort = galleryPendingFiles.value.length
    ? Math.max(...galleryPendingFiles.value.map((item) => Number(item.sortOrder || 0)))
    : (selectedProjectGallery.value.length
      ? Math.max(...selectedProjectGallery.value.map((item) => Number(item.sort_order || 0)))
      : 0)

  let nextSort = startSort
  const nextItems = files.map((file) => {
    nextSort += 10
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      sortOrder: nextSort,
    }
  })

  galleryPendingFiles.value = [...galleryPendingFiles.value, ...nextItems]
}

async function removePendingGalleryFile(itemId) {
  const target = galleryPendingFiles.value.find((item) => item.id === itemId)
  if (!target) {
    return
  }

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Bỏ ảnh chờ tải',
    title: 'Bạn muốn bỏ ảnh này khỏi danh sách chờ?',
    message: `Ảnh "${target.file?.name || target.id}" sẽ không được tải lên khi lưu dự án.`,
    confirmText: 'Bỏ ảnh',
  })

  if (!confirmed) {
    return
  }

  if (target.previewUrl) URL.revokeObjectURL(target.previewUrl)
  galleryPendingFiles.value = galleryPendingFiles.value.filter((item) => item.id !== itemId)
  notifySuccess('Đã bỏ ảnh khỏi danh sách chờ.')
}


// ─── API calls ───
async function loadAllAdminEntityRecords(entityName, query = {}) {
  const token = normalizedToken()
  const items = []
  let skip = 0
  let total = Infinity

  while (skip < total) {
    const response = await listAdminEntityRecords(entityName, token, {
      ...query,
      skip,
      limit: ADMIN_FETCH_PAGE_SIZE,
    })

    const batch = Array.isArray(response?.items) ? response.items : []
    const paginationTotal = Number(response?.pagination?.total)

    items.push(...batch)

    if (Number.isFinite(paginationTotal) && paginationTotal >= 0) {
      total = paginationTotal
    } else if (batch.length < ADMIN_FETCH_PAGE_SIZE) {
      total = items.length
    }

    if (!batch.length || batch.length < ADMIN_FETCH_PAGE_SIZE) {
      break
    }

    skip += ADMIN_FETCH_PAGE_SIZE
  }

  return items
}

async function loadProjects() { projects.value = await loadAllAdminEntityRecords('projects') }
async function loadProducts() { products.value = await loadAllAdminEntityRecords('products') }
async function loadProjectProducts() { projectProducts.value = await loadAllAdminEntityRecords('project_products') }
async function loadMediaAssets() { mediaAssets.value = await loadAllAdminEntityRecords('media_assets', { status: 'active' }) }
async function loadGalleryBindings() { galleryBindings.value = await loadAllAdminEntityRecords('entity_media') }
async function loadLanguages() {
  languages.value = await loadAllAdminEntityRecords('languages')

  if (isCreatingProject.value && !projectForm.language_id) {
    projectForm.language_id = getDefaultLanguageId()
  }
}

async function refreshAll() {
  const token = normalizedToken()
  if (!token) return
  loading.value = true
  clearNotify()
  try {
    await Promise.all([loadProjects(), loadProducts(), loadProjectProducts(), loadMediaAssets(), loadGalleryBindings(), loadLanguages()])
    if (selectedProject.value && !isCreatingProject.value) populateProjectForm(selectedProject.value)
    else if (isCreatingProject.value) resetProjectForm()
  } catch (error) {
    notifyError(error.message || 'Không thể tải dữ liệu quản trị dự án.')
  } finally { loading.value = false }
}

async function uploadCoverImage() {
  notifyError('Ảnh đại diện sẽ được tải lên khi bạn bấm lưu dự án.')
}

async function uploadGalleryImage() {
  notifyError('Ảnh gallery sẽ được tải lên khi bạn bấm lưu dự án.')
}

async function uploadPendingProjectAssets(projectRecord, token) {
  let workingProject = projectRecord
  const assetFolder = buildProjectAssetFolder(projectRecord)

  if (coverUploadFile.value) {
    uploadingCover.value = true
    const coverMedia = await uploadAdminMediaAsset(token, coverUploadFile.value, {
      title: projectForm.uploadTitle || projectRecord.title || 'project-cover',
      altText: projectForm.uploadAltText || projectRecord.title || 'project-cover',
      assetFolder,
      publicIdBase: `${projectRecord.slug || slugify(projectRecord.title)}-cover`,
    })

    workingProject = await updateAdminEntityRecord(
      'projects',
      projectRecord.id,
      {
        ...buildProjectPayload(),
        image_id: Number(coverMedia.id),
      },
      token,
    )

    projectForm.image_id = String(coverMedia.id)
    coverUploadFile.value = null
    clearCoverPreview()
  }

  if (galleryPendingFiles.value.length) {
    let maxSort = selectedProjectGallery.value.length
      ? Math.max(...selectedProjectGallery.value.map((item) => Number(item.sort_order || 0)))
      : 0

    for (const item of galleryPendingFiles.value) {
      const media = await uploadAdminMediaAsset(token, item.file, {
        title: projectRecord.title || 'project-gallery',
        altText: projectRecord.title || 'project-gallery',
        assetFolder,
        publicIdBase: `${projectRecord.slug || slugify(projectRecord.title)}-gallery-${item.sortOrder || maxSort + 10}`,
      })

      maxSort = Math.max(maxSort + 10, Number(item.sortOrder || 0))
      await createAdminEntityRecord('entity_media', {
        entity_type: 'project',
        entity_id: Number(projectRecord.id),
        media_id: Number(media.id),
        group_name: 'left_gallery',
        sort_order: maxSort,
        caption: null,
      }, token)
    }

    clearPendingGalleryFiles()
  }

  await Promise.all([loadProjects(), loadMediaAssets(), loadGalleryBindings()])
  return workingProject
}


async function persistPendingProductSelections(projectId, token) {
  if (!projectId || !pendingProductSelections.value.length) {
    return 0
  }

  const savedCount = pendingProductSelections.value.length
  const payloads = pendingProductSelections.value.map((item) => ({
    project_id: Number(projectId),
    product_id: Number(item.product_id),
    sort_order: Number(item.sort_order || 0),
    note: String(item.note || '').trim() || null,
  }))

  await Promise.all(
    payloads.map((payload) => createAdminEntityRecord('project_products', payload, token)),
  )
  clearPendingProductSelections()
  await loadProjectProducts()
  return savedCount
}

async function saveProject() {
  const token = normalizedToken()
  if (!token || !validateProjectForm()) return

  const wasCreating = isCreatingProject.value
  const hasPendingAssets = Boolean(coverUploadFile.value) || galleryPendingFiles.value.length > 0
  const hasPendingProducts = pendingProductSelections.value.length > 0
  const confirmed = await askForConfirmation({
    tone: 'primary',
    eyebrow: wasCreating ? 'Tạo dự án mới' : 'Lưu thay đổi dự án',
    title: wasCreating
      ? 'Xác nhận tạo dự án mới?'
      : 'Xác nhận lưu thay đổi dự án?',
    message: hasPendingAssets || hasPendingProducts
      ? 'Dự án sẽ được lưu cùng các sản phẩm và hình ảnh bạn đã chọn.'
      : wasCreating
        ? 'Một dự án mới sẽ được tạo từ thông tin hiện tại.'
        : 'Các thay đổi của dự án sẽ được cập nhật ngay khi bạn xác nhận.',
    confirmText: wasCreating ? 'Tạo dự án' : 'Lưu thay đổi',
  })

  if (!confirmed) {
    return
  }

  savingProject.value = true
  uploadingProjectAssets.value = true
  clearNotify()

  try {
    const payload = buildProjectPayload()
    let savedProject = null

    if (wasCreating) {
      savedProject = await createAdminEntityRecord('projects', payload, token)
      isCreatingProject.value = false
      selectedProjectId.value = String(savedProject.id)
    } else {
      savedProject = await updateAdminEntityRecord('projects', selectedProject.value.id, payload, token)
    }

    if (hasPendingAssets) {
      savedProject = await uploadPendingProjectAssets(savedProject, token)
    } else {
      await loadProjects()
    }

    const savedPendingProductsCount = await persistPendingProductSelections(savedProject.id, token)
    const latestProject = projects.value.find((item) => String(item.id) === String(savedProject.id)) || savedProject
    populateProjectForm(latestProject)

    if (wasCreating) {
      notifySuccess('Đã tạo dự án thành công. Tiếp tục chọn sản phẩm sử dụng và hình ảnh gallery rồi bấm lưu dự án.')
      return
    }

    notifySuccess(
      hasPendingAssets || savedPendingProductsCount
        ? 'Đã lưu dự án, cập nhật sản phẩm và đồng bộ hình ảnh thành công.'
        : 'Đã cập nhật thông tin dự án.',
    )
    goToList()
  } catch (error) {
    notifyError(error.message || 'Không thể lưu dự án.')
  } finally {
    savingProject.value = false
    uploadingProjectAssets.value = false
    uploadingCover.value = false
    uploadingGallery.value = false
  }
}




async function removeProject() {
  const token = normalizedToken()
  if (!token || !selectedProject.value) return

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa dự án',
    title: 'Bạn muốn xóa dự án này?',
    message: `Dự án "${selectedProject.value.title}" sẽ bị xóa khỏi danh sách quản trị.`,
    confirmText: 'Xóa dự án',
  })

  if (!confirmed) {
    return
  }

  deletingProject.value = true
  clearNotify()
  try {
    await deleteAdminEntityRecord('projects', selectedProject.value.id, token)
    await Promise.all([loadProjects(), loadProjectProducts(), loadGalleryBindings()])
    notifySuccess('Đã xóa dự án.')
    goToList()
  } catch (error) {
    notifyError(error.message || 'Không thể xóa dự án.')
  } finally {
    deletingProject.value = false
  }
}

async function deleteProject(projectId) {
  const token = normalizedToken()
  if (!token) return
  const project = projects.value.find((i) => String(i.id) === String(projectId))
  if (!project) return

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa dự án',
    title: 'Bạn muốn xóa dự án này?',
    message: `Dự án "${project.title}" sẽ bị xóa khỏi danh sách quản trị.`,
    confirmText: 'Xóa dự án',
  })

  if (!confirmed) {
    return
  }

  deletingProjectId.value = projectId
  clearNotify()
  try {
    await deleteAdminEntityRecord('projects', projectId, token)
    await Promise.all([loadProjects(), loadProjectProducts(), loadGalleryBindings()])
    notifySuccess('Đã xóa dự án.')
  } catch (error) {
    notifyError(error.message || 'Không thể xóa dự án.')
  } finally {
    deletingProjectId.value = null
  }
}

async function saveProductMapping() {
  const token = normalizedToken()
  if (!token || !validateProductForm()) return

  const isCreateMode = productForm.mode === 'create'
  const selectedProduct = productMap.value.get(String(productForm.product_id))
  const confirmed = await askForConfirmation({
    tone: 'primary',
    eyebrow: isCreateMode ? 'Thêm sản phẩm vào dự án' : 'Cập nhật sản phẩm trong dự án',
    title: isCreateMode
      ? 'Xác nhận lưu sản phẩm sử dụng?'
      : 'Xác nhận cập nhật sản phẩm sử dụng?',
    message: isCreateMode
      ? `Sản phẩm "${productLabel(selectedProduct)}" sẽ được gắn vào dự án hiện tại.`
      : `Thông tin liên kết của sản phẩm "${productLabel(selectedProduct)}" sẽ được cập nhật.`,
    confirmText: isCreateMode ? 'Lưu sản phẩm' : 'Cập nhật',
  })

  if (!confirmed) {
    return
  }

  savingProductMapping.value = true
  clearNotify()
  try {
    const payload = buildProductPayload()
    if (isCreateMode) {
      const created = await createAdminEntityRecord('project_products', payload, token)
      await loadProjectProducts()
      closeProductForm()
      recentlySavedProductMappingId.value = created.id
      setTimeout(() => {
        recentlySavedProductMappingId.value = null
      }, 3000)
      notifySuccess('Đã lưu mapping sản phẩm.')
    } else {
      await updateAdminEntityRecord('project_products', productForm.editingId, payload, token)
      await loadProjectProducts()
      recentlySavedProductMappingId.value = productForm.editingId
      closeProductForm()
      setTimeout(() => {
        recentlySavedProductMappingId.value = null
      }, 3000)
      notifySuccess('Đã cập nhật mapping sản phẩm.')
    }
  } catch (error) {
    notifyError(error.message || 'Không thể lưu mapping.')
  } finally {
    savingProductMapping.value = false
  }
}

async function removeProductMapping(record) {
  const token = normalizedToken()
  if (!token) return

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa sản phẩm khỏi dự án',
    title: 'Bạn muốn xóa sản phẩm này?',
    message: `Sản phẩm "${productLabel(productMap.value.get(String(record?.product_id)))}" sẽ bị gỡ khỏi dự án.`,
    confirmText: 'Xóa sản phẩm',
  })

  if (!confirmed) {
    return
  }

  deletingProductMappingId.value = record.id
  clearNotify()
  try {
    await deleteAdminEntityRecord('project_products', record.id, token)
    await loadProjectProducts()
    notifySuccess('Đã xóa mapping sản phẩm.')
  } catch (error) {
    notifyError(error.message || 'Không thể xóa mapping.')
  } finally {
    deletingProductMappingId.value = null
  }
}

async function saveGalleryBinding() {
  const token = normalizedToken()
  if (!token || !validateGalleryForm()) return

  const isCreateMode = galleryForm.mode === 'create'
  const selectedMedia = mediaMap.value.get(String(galleryForm.media_id))
  const confirmed = await askForConfirmation({
    tone: 'primary',
    eyebrow: isCreateMode ? 'Thêm ảnh vào gallery' : 'Cập nhật ảnh gallery',
    title: isCreateMode
      ? 'Xác nhận lưu ảnh gallery?'
      : 'Xác nhận cập nhật ảnh gallery?',
    message: isCreateMode
      ? `Ảnh "${mediaLabel(selectedMedia)}" sẽ được thêm vào gallery của dự án.`
      : `Thông tin ảnh "${mediaLabel(selectedMedia)}" trong gallery sẽ được cập nhật.`,
    confirmText: isCreateMode ? 'Lưu ảnh' : 'Cập nhật',
  })

  if (!confirmed) {
    return
  }

  savingGallery.value = true
  clearNotify()
  try {
    const payload = buildGalleryPayload()
    if (isCreateMode) {
      await createAdminEntityRecord('entity_media', payload, token)
      await Promise.all([loadMediaAssets(), loadGalleryBindings()])
      closeGalleryForm()
      notifySuccess('Đã lưu ảnh gallery.')
    } else {
      await updateAdminEntityRecord('entity_media', galleryForm.editingId, payload, token)
      await Promise.all([loadMediaAssets(), loadGalleryBindings()])
      closeGalleryForm()
      notifySuccess('Đã cập nhật ảnh gallery.')
    }
  } catch (error) {
    notifyError(error.message || 'Không thể lưu gallery.')
  } finally {
    savingGallery.value = false
  }
}

async function removeGalleryBinding(record) {
  const token = normalizedToken()
  if (!token) return

  const confirmed = await askForConfirmation({
    tone: 'danger',
    eyebrow: 'Xóa ảnh khỏi gallery',
    title: 'Bạn muốn xóa ảnh này?',
    message: `Ảnh "${mediaLabel(mediaMap.value.get(String(record?.media_id)))}" sẽ bị gỡ khỏi gallery của dự án.`,
    confirmText: 'Xóa ảnh',
  })

  if (!confirmed) {
    return
  }

  deletingGalleryId.value = record.id
  clearNotify()
  try {
    await deleteAdminEntityRecord('entity_media', record.id, token)
    await Promise.all([loadMediaAssets(), loadGalleryBindings()])
    notifySuccess('Đã xóa ảnh gallery.')
  } catch (error) {
    notifyError(error.message || 'Không thể xóa ảnh gallery.')
  } finally {
    deletingGalleryId.value = null
  }
}

async function onMultiGalleryFilesSelected(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  appendPendingGalleryFiles(files)
  if (galleryMultiInputRef.value) galleryMultiInputRef.value.value = ''
  notifySuccess(`Đã thêm ${files.length} ảnh vào danh sách chờ. Bấm lưu dự án để tải lên Cloudinary.`)
}


async function moveGalleryItem(item, direction) {
  const items = [...selectedProjectGallery.value]
  const idx = items.findIndex((i) => String(i.id) === String(item.id))
  if (idx < 0) return
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return
  const token = normalizedToken()
  const currentSort = Number(items[idx].sort_order || 0)
  const swapSort = Number(items[swapIdx].sort_order || 0)
  try {
    await Promise.all([
      updateAdminEntityRecord('entity_media', items[idx].id, { ...buildGalleryPayloadFromItem(items[idx]), sort_order: swapSort }, token),
      updateAdminEntityRecord('entity_media', items[swapIdx].id, { ...buildGalleryPayloadFromItem(items[swapIdx]), sort_order: currentSort }, token),
    ])
    await loadGalleryBindings()
  } catch (error) { notifyError(error.message || 'Không thể thay đổi thứ tự.') }
}

// ─── Product search (combobox) ───
const productSearchQuery = ref('')
let productSearchTimer = null
const productComboRef = ref(null)
const showProductDropdown = ref(false)

const productSearchResults = computed(() => {
  const keyword = String(productSearchQuery.value || '').trim().toLowerCase()
  const usedIds = new Set(selectedProjectProducts.value.map((i) => String(i.product_id)))
  const pendingIds = new Set(pendingProductSelections.value.map((item) => String(item.product_id)))
  const available = products.value.filter((p) => !usedIds.has(String(p.id)) && !pendingIds.has(String(p.id)))
  if (!keyword) return available.slice(0, 30)
  return available.filter((p) => {
    const name = String(p.name || p.title || '').toLowerCase()
    const sku = String(p.sku || '').toLowerCase()
    return name.includes(keyword) || sku.includes(keyword)
  }).slice(0, 30)
})

function updateProductDropdownPlacement() {
  nextTick(() => {
    const wrapElement = productComboRef.value
    if (!wrapElement || typeof window === 'undefined') {
      productDropdownPlacement.value = 'down'
      return
    }

    const rect = wrapElement.getBoundingClientRect()
    const estimatedHeight = Math.min(360, Math.max(240, productSearchResults.value.length * 56))
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    productDropdownPlacement.value = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
      ? 'up'
      : 'down'
  })
}

function onProductSearchInput() {
  clearTimeout(productSearchTimer)
  productSearchTimer = setTimeout(() => {
    showProductDropdown.value = true
    updateProductDropdownPlacement()
  }, 120)
}

function onProductSearchFocus() {
  showProductDropdown.value = true
  updateProductDropdownPlacement()
}

function toggleProductDropdown() {
  showProductDropdown.value = !showProductDropdown.value
  if (showProductDropdown.value) {
    updateProductDropdownPlacement()
  }
}

function onProductComboClickOutside(event) {
  if (productComboRef.value && !productComboRef.value.contains(event.target)) {
    showProductDropdown.value = false
  }
}

function selectProductFromSearch(product) {
  if (!selectedProjectId.value) {
    notifyError('Vui lòng lưu dự án trước khi thêm sản phẩm.')
    return
  }

  const productId = String(product.id)
  const alreadyPending = pendingProductSelections.value.some((item) => String(item.product_id) === productId)
  const alreadySaved = selectedProjectProducts.value.some((item) => String(item.product_id) === productId)

  if (alreadyPending || alreadySaved) {
    notifyError('Sản phẩm này đã có trong danh sách chọn.')
    return
  }

  const nextSort = selectedProjectProducts.value.length || pendingProductSelections.value.length
    ? Math.max(
      0,
      ...selectedProjectProducts.value.map((item) => Number(item.sort_order || 0)),
      ...pendingProductSelections.value.map((item) => Number(item.sort_order || 0)),
    ) + 10
    : 10

  pendingProductSelections.value = [
    ...pendingProductSelections.value,
    {
      product_id: productId,
      sort_order: nextSort,
      note: '',
    },
  ]

  productSearchQuery.value = ''
  showProductDropdown.value = true
  updateProductDropdownPlacement()
  notifySuccess(`Đã chọn "${productLabel(product)}". Bạn có thể tiếp tục chọn thêm sản phẩm rồi bấm lưu dự án.`)
}

function removePendingProductSelection(productId) {
  pendingProductSelections.value = pendingProductSelections.value.filter(
    (item) => String(item.product_id) !== String(productId),
  )
}

function clearAllPendingProductSelections() {
  clearPendingProductSelections()
}

function cleanupProductSearch() {
  clearTimeout(productSearchTimer)
}

// ─── Export composable ───
export function useProjectManager() {
  return {
    // Context
    setContext, normalizedToken,
    // State
    loading, savingProject, deletingProject, savingProductMapping, deletingProductMappingId,
    recentlySavedProductMappingId, savingGallery, deletingGalleryId, uploadingCover, uploadingGallery,
    uploadingProjectAssets, confirmDialog,
    projectSearch, selectedProjectId, projects, products, projectProducts, mediaAssets,
    galleryBindings, languages, productMappingRowRefs,
    projectFormErrors, productFormErrors, galleryFormErrors,
    isCreatingProject, currentMode, deletingProjectId, uploadingMultiGallery, coverPreviewUrl,
    projectForm, productForm, galleryForm,
    coverUploadFile, galleryUploadFile, galleryPendingFiles, coverFileInputRef, galleryMultiInputRef,
    // Computed
    languageOptions, mediaMap, productMap, filteredProjects, selectedProject, selectedProjectCover,
    totalProjectsCount, totalProductMappingsCount, totalGalleryImagesCount,
    selectedProjectProducts, selectedProjectGallery, groupedGallery, pendingGalleryPreviewItems,
    selectedProjectProductsCount, pendingSelectedProjectProducts, availableProductOptions, availableGalleryMediaOptions,
    productSearchResults, showProductDropdown, productSearchQuery, productComboRef, productDropdownPlacement,
    // Functions
    notifySuccess, notifyError, clearNotify, normalizeText, slugify, resolveMediaUrl,
    askForConfirmation, acceptConfirmDialog, cancelConfirmDialog,
    languageLabel, productLabel, mediaLabel, getProductThumb, getProjectCoverThumb,
    setProductMappingRowRef, scrollToProductMappingRow,
    resetProjectForm, populateProjectForm, startCreateProject, selectProject,
    goToList, goToEdit, goToCreate,
    validateProjectForm, buildProjectPayload,
    resetProductForm, openCreateProductForm, openEditProductForm, closeProductForm,
    validateProductForm, buildProductPayload,
    resetGalleryForm, openCreateGalleryForm, openEditGalleryForm, closeGalleryForm,
    validateGalleryForm, buildGalleryPayload,
    onCoverFileSelected, removeCoverImage, onGalleryFileSelected,
    appendPendingGalleryFiles, removePendingGalleryFile,
    refreshAll, uploadCoverImage, uploadGalleryImage,
    saveProject, removeProject, deleteProject,
    saveProductMapping, removeProductMapping,
    saveGalleryBinding, removeGalleryBinding,
    onMultiGalleryFilesSelected, moveGalleryItem,
    onProductSearchInput, onProductSearchFocus, onProductComboClickOutside,
    toggleProductDropdown, selectProductFromSearch, removePendingProductSelection,
    clearAllPendingProductSelections, cleanupProductSearch, isProductAlreadySelected,
    GALLERY_GROUP_OPTIONS,
  }
}

