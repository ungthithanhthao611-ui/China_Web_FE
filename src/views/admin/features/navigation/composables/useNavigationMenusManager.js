import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  createNavigationMenu,
  deleteNavigationMenu,
  listAdminEntityRecords,
  listNavigationMenus,
  replaceNavigationMenuTree,
  updateNavigationMenu,
} from '@/views/admin/shared/api/adminApi.js'
import {
  createNavigationTreeHelpers,
  findNodeContextByCid,
  itemSlugFromUrl,
  toIntOrUndefined,
} from '@/views/admin/shared/utils/treeUtils'
import { publishNavigationMenusUpdated } from '@/shared/utils/navigationSync'

export function useNavigationMenusManager(props, emit, options = {}) {
  const { t } = useI18n()
  const { hydrateTree, serializeTree, createEmptyNode } = createNavigationTreeHelpers()

  const languages = ref([])
  const navMenus = ref([])
  const selectedNavMenuId = ref('')
  const navTree = ref([])

  const loadingLanguages = ref(false)
  const loadingNavigation = ref(false)
  const savingNavigation = ref(false)

  const searchKeyword = ref('')
  const statusFilter = ref('all')
  const typeFilter = ref('all')
  const currentPage = ref(1)
  const pageSize = 10

  const drawerOpen = ref(false)
  const drawerMode = ref('createMenu')
  const drawerTitle = ref('Add Menu')
  const editingNodeCid = ref('')
  const parentForNewNodeCid = ref('')

  const menuForm = reactive({
    name: '',
    location: 'header',
    language_id: '',
    is_active: true,
  })

  const nodeForm = reactive({
    title: '',
    url: '/',
    target: '',
    item_type: '',
    page_id: '',
    anchor: '',
    sort_order: 0,
  })

  const selectedMenu = computed(() =>
    navMenus.value.find((menu) => String(menu.id) === String(selectedNavMenuId.value)) || null
  )

  const flatTreeRows = computed(() => {
    const rows = []

    function walk(nodes, depth, parentTitle) {
      nodes.forEach((node) => {
        rows.push({
          node,
          depth,
          parentTitle,
          rowType: depth === 0 ? 'parent' : 'child',
        })
        walk(node.children || [], depth + 1, node.title)
      })
    }

    walk(navTree.value, 0, '')
    return rows
  })

  const filteredRows = computed(() => {
    let rows = [...flatTreeRows.value]
    const keyword = searchKeyword.value.trim().toLowerCase()

    if (keyword) {
      rows = rows.filter((row) => {
        const combined = `${row.node.title} ${row.node.url} ${row.parentTitle}`.toLowerCase()
        return combined.includes(keyword)
      })
    }

    if (typeFilter.value !== 'all') {
      rows = rows.filter((row) => row.rowType === typeFilter.value)
    }

    if (statusFilter.value !== 'all') {
      const active = statusFilter.value === 'active'
      rows = rows.filter(() => Boolean(selectedMenu.value?.is_active) === active)
    }

    return rows
  })

  const rowsCount = computed(() => filteredRows.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)))
  const pagedRows = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredRows.value.slice(start, start + pageSize)
  })
  const showingFrom = computed(() => (rowsCount.value ? (currentPage.value - 1) * pageSize + 1 : 0))
  const showingTo = computed(() => Math.min(currentPage.value * pageSize, rowsCount.value))

  function notifySuccess(message) {
    emit('notify-success', message)
  }

  function notifyError(message) {
    emit('notify-error', message)
  }

  function clearNotifications() {
    emit('clear-notify')
  }

  async function requestConfirm(payload) {
    if (typeof options.confirmAction === 'function') {
      return Boolean(await options.confirmAction(payload))
    }

    notifyError(t('admin.common.error'))
    return false
  }

  function findNodeContext(cid) {
    return findNodeContextByCid(cid, navTree.value)
  }

  function getPreferredLanguageId() {
    const normalizedLanguages = [...languages.value].sort((a, b) => {
      if (a?.is_default && !b?.is_default) return -1
      if (!a?.is_default && b?.is_default) return 1
      if (String(a?.code || '').toLowerCase() === 'vi' && String(b?.code || '').toLowerCase() !== 'vi') return -1
      if (String(a?.code || '').toLowerCase() !== 'vi' && String(b?.code || '').toLowerCase() === 'vi') return 1
      return Number(a?.id || 0) - Number(b?.id || 0)
    })

    const preferredLanguage = normalizedLanguages[0]
    return preferredLanguage ? String(preferredLanguage.id) : '1'
  }

  function resetMenuForm() {
    menuForm.name = ''
    menuForm.location = 'header'
    menuForm.language_id = getPreferredLanguageId()
    menuForm.is_active = true
  }

  function resetNodeForm() {
    nodeForm.title = ''
    nodeForm.url = '/'
    nodeForm.target = ''
    nodeForm.item_type = ''
    nodeForm.page_id = ''
    nodeForm.anchor = ''
    nodeForm.sort_order = 0
  }

  function syncMenuTree(menu) {
    if (!menu) {
      navTree.value = []
      return
    }
    navTree.value = hydrateTree(menu.items || [])
  }

  function normalizedToken() {
    return String(props.token || '').trim()
  }

  function applyFilters() {
    currentPage.value = 1
  }

  function setPage(page) {
    const safePage = Math.min(Math.max(1, page), totalPages.value)
    currentPage.value = safePage
  }

  async function loadLanguages() {
    const token = normalizedToken()
    if (!token) return

    loadingLanguages.value = true
    try {
      const response = await listAdminEntityRecords('languages', token, { skip: 0, limit: 100 })
      languages.value = (response.items || []).slice().sort((a, b) => Number(a.id) - Number(b.id))
      if (!menuForm.language_id && languages.value[0]) {
        menuForm.language_id = String(languages.value[0].id)
      }
    } catch (error) {
      notifyError(error.message || t('admin.common.error'))
    } finally {
      loadingLanguages.value = false
    }
  }

  async function loadNavigationMenus() {
    const token = normalizedToken()
    if (!token) return

    loadingNavigation.value = true
    try {
      const response = await listNavigationMenus(token)
      navMenus.value = response.items || []
      emit('menus-count', navMenus.value.length)

      if (!navMenus.value.length) {
        selectedNavMenuId.value = ''
        syncMenuTree(null)
        return
      }

      const hasSelected = navMenus.value.some((menu) => String(menu.id) === String(selectedNavMenuId.value))
      if (!hasSelected) {
        selectedNavMenuId.value = String(navMenus.value[0].id)
      } else {
        syncMenuTree(selectedMenu.value)
      }
    } catch (error) {
      notifyError(error.message || t('admin.common.error'))
    } finally {
      loadingNavigation.value = false
    }
  }

  async function refreshAll() {
    const token = normalizedToken()
    if (!token) {
      emit('menus-count', 0)
      notifyError(t('admin.common.error'))
      return
    }

    clearNotifications()
    await loadLanguages()
    await loadNavigationMenus()
  }

  function openDrawer(mode, title) {
    drawerMode.value = mode
    drawerTitle.value = title
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
    drawerMode.value = 'createMenu'
    editingNodeCid.value = ''
    parentForNewNodeCid.value = ''
  }

  async function openCreateMenuDrawer() {
    if (languages.value.length === 0) {
      await loadLanguages()
    }
    resetMenuForm()
    openDrawer('createMenu', t('admin.navigation.add_menu'))
  }

  async function openEditMenuDrawer() {
    if (!selectedMenu.value) {
      notifyError('Vui lòng chọn menu trước.')
      return
    }
    if (languages.value.length === 0) {
      await loadLanguages()
    }
    menuForm.name = selectedMenu.value.name || ''
    menuForm.location = selectedMenu.value.location || ''
    menuForm.language_id = String(selectedMenu.value.language_id || '')
    menuForm.is_active = Boolean(selectedMenu.value.is_active)
    openDrawer('editMenu', t('admin.navigation.edit_menu'))
  }

  function openCreateRootNodeDrawer() {
    if (!selectedMenu.value) {
      notifyError('Vui lòng chọn menu trước.')
      return
    }
    resetNodeForm()
    parentForNewNodeCid.value = ''
    openDrawer('createNode', t('admin.navigation.add_root'))
  }

  function openCreateChildNodeDrawer(cid) {
    if (!selectedMenu.value) {
      notifyError('Vui lòng chọn menu trước.')
      return
    }
    const context = findNodeContext(cid)
    if (!context) return

    resetNodeForm()
    parentForNewNodeCid.value = cid
    nodeForm.item_type = 'child'
    nodeForm.sort_order = (context.node.children || []).length * 10
    openDrawer('createNode', `Thêm mục con cho "${context.node.title}"`)
  }

  function openEditNodeDrawer(cid) {
    const context = findNodeContext(cid)
    if (!context) return

    editingNodeCid.value = cid
    nodeForm.title = context.node.title || ''
    nodeForm.url = context.node.url || '/'
    nodeForm.target = context.node.target || ''
    nodeForm.item_type = context.node.item_type || ''
    nodeForm.page_id = context.node.page_id ?? ''
    nodeForm.anchor = context.node.anchor || ''
    nodeForm.sort_order = context.node.sort_order ?? 0
    openDrawer('editNode', t('admin.common.edit'))
  }

  async function submitDrawer() {
    const token = normalizedToken()
    if (!token) {
      notifyError(t('admin.common.error'))
      return
    }

    if (drawerMode.value === 'createMenu') {
      if (!menuForm.name.trim()) {
        notifyError('Tên menu là bắt buộc.')
        return
      }
      if (!menuForm.language_id) {
        notifyError('Ngôn ngữ là bắt buộc.')
        return
      }

      savingNavigation.value = true
      try {
        const created = await createNavigationMenu(token, {
          name: menuForm.name.trim(),
          location: menuForm.location.trim() || null,
          language_id: Number.parseInt(menuForm.language_id, 10),
          is_active: menuForm.is_active,
        })
        await loadNavigationMenus()
        publishNavigationMenusUpdated()
        selectedNavMenuId.value = String(created.id)
        notifySuccess(t('admin.common.success'))
        closeDrawer()
      } catch (error) {
        notifyError(error.message || t('admin.common.error'))
      } finally {
        savingNavigation.value = false
      }
      return
    }

    if (drawerMode.value === 'editMenu') {
      if (!selectedMenu.value) {
        notifyError(t('admin.navigation.select_menu_scope'))
        return
      }
      if (!menuForm.name.trim()) {
        notifyError('Tên menu là bắt buộc.')
        return
      }
      if (!menuForm.language_id) {
        notifyError('Ngôn ngữ là bắt buộc.')
        return
      }

      const confirmed = await requestConfirm({
        title: 'Xác nhận cập nhật menu',
        message: `Bạn có chắc chắn muốn cập nhật menu "${menuForm.name.trim()}"?`,
        confirmText: 'Lưu thay đổi',
        tone: 'primary',
      })
      if (!confirmed) {
        return
      }

      savingNavigation.value = true
      try {
        await updateNavigationMenu(selectedMenu.value.id, token, {
          name: menuForm.name.trim(),
          location: menuForm.location.trim() || null,
          language_id: Number.parseInt(menuForm.language_id, 10),
          is_active: menuForm.is_active,
        })
        await loadNavigationMenus()
        publishNavigationMenusUpdated()
        notifySuccess(t('admin.common.success'))
        closeDrawer()
      } catch (error) {
        notifyError(error.message || t('admin.common.error'))
      } finally {
        savingNavigation.value = false
      }
      return
    }

    if (drawerMode.value === 'createNode') {
      if (!nodeForm.title.trim()) {
        notifyError('Tên mục điều hướng là bắt buộc.')
        return
      }

      const node = createEmptyNode()
      node.title = nodeForm.title.trim()
      node.url = nodeForm.url.trim() || '/'
      node.target = nodeForm.target.trim()
      node.item_type = nodeForm.item_type.trim()
      node.page_id = toIntOrUndefined(nodeForm.page_id) ?? ''
      node.anchor = nodeForm.anchor.trim()
      node.sort_order = toIntOrUndefined(nodeForm.sort_order) ?? 0

      if (!parentForNewNodeCid.value) {
        navTree.value = [...navTree.value, node]
      } else {
        const parentCtx = findNodeContext(parentForNewNodeCid.value)
        if (!parentCtx) {
          notifyError('Không tìm thấy mục cha.')
          return
        }
        parentCtx.node.children = [...(parentCtx.node.children || []), node]
      }

      notifySuccess('Đã thêm mục điều hướng tạm thời. Hãy bấm "Lưu thay đổi" để ghi vào hệ thống.')
      closeDrawer()
      return
    }

    if (drawerMode.value === 'editNode') {
      const context = findNodeContext(editingNodeCid.value)
      if (!context) {
        notifyError('Không tìm thấy mục điều hướng cần sửa.')
        return
      }
      if (!nodeForm.title.trim()) {
        notifyError('Tên mục điều hướng là bắt buộc.')
        return
      }

      const currentTitle = context.node.title || nodeForm.title.trim() || 'mục điều hướng'
      const confirmed = await requestConfirm({
        title: 'Xác nhận cập nhật mục điều hướng',
        message: `Bạn có chắc chắn muốn cập nhật mục điều hướng "${currentTitle}"?`,
        confirmText: 'Lưu thay đổi',
        tone: 'primary',
      })
      if (!confirmed) {
        return
      }

      context.node.title = nodeForm.title.trim()
      context.node.url = nodeForm.url.trim() || '/'
      context.node.target = nodeForm.target.trim()
      context.node.item_type = nodeForm.item_type.trim()
      context.node.page_id = toIntOrUndefined(nodeForm.page_id) ?? ''
      context.node.anchor = nodeForm.anchor.trim()
      context.node.sort_order = toIntOrUndefined(nodeForm.sort_order) ?? 0
      notifySuccess(t('admin.common.success'))
      closeDrawer()
    }
  }

  async function removeNode(cid) {
    const context = findNodeContext(cid)
    if (!context) return

    const nodeTitle = context.node.title || `#${context.index + 1}`
    const confirmed = await requestConfirm({
      title: 'Xác nhận xóa mục điều hướng',
      message: `Bạn có chắc chắn muốn xóa mục điều hướng "${nodeTitle}"?`,
      confirmText: t('admin.common.delete'),
      tone: 'danger',
    })
    if (!confirmed) {
      return
    }

    context.nodes.splice(context.index, 1)
    notifySuccess(t('admin.common.success'))
  }

  async function handleDeleteMenu() {
    const token = normalizedToken()
    if (!token || !selectedMenu.value) {
      notifyError(t('admin.navigation.select_menu_scope'))
      return false
    }

    const deletedMenuLabel = selectedMenu.value.name || `#${selectedMenu.value.id}`

    savingNavigation.value = true
    try {
      await deleteNavigationMenu(selectedMenu.value.id, token)
      selectedNavMenuId.value = ''
      clearNotifications()
      await loadNavigationMenus()
      publishNavigationMenusUpdated()
      notifySuccess(t('admin.common.success'))
      return true
    } catch (error) {
      notifyError(error.message || t('admin.common.error'))
      return false
    } finally {
      savingNavigation.value = false
    }
  }

  async function handleSaveTree() {
    const token = normalizedToken()
    if (!token || !selectedMenu.value) {
      notifyError(t('admin.navigation.select_menu_scope'))
      return
    }

    savingNavigation.value = true
    try {
      await replaceNavigationMenuTree(selectedMenu.value.id, token, serializeTree(navTree.value))
      await loadNavigationMenus()
      publishNavigationMenusUpdated()
      notifySuccess(t('admin.common.success'))
    } catch (error) {
      notifyError(error.message || t('admin.common.error'))
    } finally {
      savingNavigation.value = false
    }
  }

  async function handleExportXml() {
    if (!selectedMenu.value) {
      notifyError(t('admin.navigation.select_menu_scope'))
      return
    }

    try {
      const treeData = serializeTree(navTree.value)
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<navigation_menu name="${selectedMenu.value.name}" location="${selectedMenu.value.location}">
  ${treeData.map((node) => `  <item title="${node.title}" url="${node.url}" target="${node.target}" sort="${node.sort_order}" />`).join('\n')}
</navigation_menu>`

      const blob = new Blob([xmlString], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `menu_${selectedMenu.value.id || 'export'}.xml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      notifySuccess(t('admin.common.success'))
    } catch (error) {
      notifyError(error.message || t('admin.common.error'))
    }
  }

  watch(selectedNavMenuId, () => {
    syncMenuTree(selectedMenu.value)
    currentPage.value = 1
  })

  watch([searchKeyword, statusFilter, typeFilter], () => {
    currentPage.value = 1
  })

  watch(totalPages, (value) => {
    if (currentPage.value > value) {
      currentPage.value = value
    }
  })

  watch(
    () => props.token,
    async (value) => {
      if (!String(value || '').trim()) {
        languages.value = []
        navMenus.value = []
        selectedNavMenuId.value = ''
        navTree.value = []
        emit('menus-count', 0)
        closeDrawer()
        return
      }

      if (props.active) {
        await refreshAll()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.active,
    async (value) => {
      if (value && normalizedToken()) {
        await refreshAll()
      } else {
        closeDrawer()
      }
    },
    { immediate: true }
  )

  return {
    languages,
    navMenus,
    selectedNavMenuId,
    loadingLanguages,
    loadingNavigation,
    savingNavigation,
    searchKeyword,
    statusFilter,
    typeFilter,
    currentPage,
    pageSize,
    drawerOpen,
    drawerMode,
    drawerTitle,
    menuForm,
    nodeForm,
    selectedMenu,
    rowsCount,
    totalPages,
    pagedRows,
    showingFrom,
    showingTo,
    itemSlugFromUrl,
    refreshAll,
    applyFilters,
    setPage,
    openCreateMenuDrawer,
    openEditMenuDrawer,
    openCreateRootNodeDrawer,
    openCreateChildNodeDrawer,
    openEditNodeDrawer,
    closeDrawer,
    submitDrawer,
    removeNode,
    handleDeleteMenu,
    handleSaveTree,
    handleExportXml,
  }
}
