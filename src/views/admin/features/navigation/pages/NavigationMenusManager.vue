<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
import AddNavigationMenu from '@/views/admin/features/navigation/components/AddNavigationMenu.vue'
import DeleteNavigationMenu from '@/views/admin/features/navigation/components/DeleteNavigationMenu.vue'
import EditNavigationMenu from '@/views/admin/features/navigation/components/EditNavigationMenu.vue'
import { useNavigationMenusManager } from '@/views/admin/features/navigation/composables/useNavigationMenusManager'

const props = defineProps({
  token: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['notify-success', 'notify-error', 'clear-notify', 'menus-count'])

const confirmDialog = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: t('admin.common.save'),
  tone: 'primary',
  resolver: null,
})

function closeConfirmDialog(confirmed = false) {
  if (!confirmDialog.open) {
    return
  }

  confirmDialog.open = false
  const resolve = confirmDialog.resolver
  confirmDialog.resolver = null
  if (typeof resolve === 'function') {
    resolve(Boolean(confirmed))
  }
}

function openConfirmDialog({ title, message, confirmText, tone = 'primary' } = {}) {
  if (typeof confirmDialog.resolver === 'function') {
    confirmDialog.resolver(false)
    confirmDialog.resolver = null
  }

  confirmDialog.title = String(title || t('admin.common.confirm_delete'))
  confirmDialog.message = String(message || t('admin.common.confirm_delete'))
  confirmDialog.confirmText = String(confirmText || t('admin.common.save'))
  confirmDialog.tone = tone === 'danger' ? 'danger' : 'primary'
  confirmDialog.open = true

  return new Promise((resolve) => {
    confirmDialog.resolver = resolve
  })
}

const {
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
} = useNavigationMenusManager(props, emit, {
  confirmAction: openConfirmDialog,
})

async function openDeleteConfirm() {
  if (!selectedMenu.value || savingNavigation.value) {
    return
  }

  const confirmed = await openConfirmDialog({
    title: t('admin.navigation.confirm_delete_menu_title'),
    message: t('admin.navigation.confirm_delete_menu_msg', { name: selectedMenu.value?.name || t('admin.common.all') }),
    confirmText: t('admin.navigation.delete_menu'),
    tone: 'danger',
  })
  if (!confirmed) {
    return
  }
  await handleDeleteMenu()
}

defineExpose({
  refreshAll,
})
</script>

<template>
  <section class="nav-manager">
    <div class="ultimate-clean-workspace">
      <!-- 1. Unified Header -->
      <header class="intro-card">
        <div class="intro-copy">
          <p class="intro-eyebrow">{{ $t('admin.navigation.eyebrow') }}</p>
          <h2>{{ $t('admin.navigation.title') }}</h2>
          <p>{{ $t('admin.navigation.subtitle') }}</p>
        </div>
        <div class="intro-actions">
          <button type="button" class="btn btn-ghost btn-sm" @click="handleExportXml">{{ $t('admin.navigation.export_xml') }}</button>
          <button type="button" class="btn btn-ghost btn-sm" :disabled="loadingNavigation" @click="refreshAll">
            {{ loadingNavigation ? $t('admin.navigation.refreshing') : $t('admin.common.refresh') }}
          </button>
          <AddNavigationMenu @trigger="openCreateMenuDrawer" />
        </div>
      </header>

      <section class="editor-head" style="padding: 24px 32px 16px; border-top: 1px solid #f1f5f9;">
        <div class="toolbar-grid" style="grid-template-columns: 1.2fr 1fr 1fr 1.2fr auto; gap: 12px; width: 100%;">
          <input v-model="searchKeyword" type="text" class="form-control" :placeholder="$t('admin.navigation.search_placeholder')" />
          <select v-model="statusFilter" class="form-control">
            <option value="all">{{ $t('admin.common.all_status') }}</option>
            <option value="active">{{ $t('admin.navigation.is_active') }}</option>
            <option value="inactive">{{ $t('admin.common.hide_preview') }}</option>
          </select>
          <select v-model="typeFilter" class="form-control">
            <option value="all">{{ $t('admin.navigation.all_types') }}</option>
            <option value="parent">{{ $t('admin.navigation.parent_item') }}</option>
            <option value="child">{{ $t('admin.navigation.child_item') }}</option>
          </select>
          <select v-model="selectedNavMenuId" class="form-control">
            <option value="">{{ $t('admin.navigation.select_menu_scope') }}</option>
            <option v-for="menu in navMenus" :key="menu.id" :value="String(menu.id)">
              {{ menu.name }} ({{ menu.location || 'N/A' }})
            </option>
          </select>
          <button type="button" class="btn btn-secondary btn-sm" @click="applyFilters">{{ $t('admin.common.filter') }}</button>
        </div>
      </section>

      <section class="section-list-unified">
        <div class="table-wrap" style="padding: 0 32px 32px;">
          <table class="ultimate-table">
            <thead>
              <tr>
                <th style="width: 60px;">{{ $t('admin.navigation.stt') }}</th>
                <th>{{ $t('admin.navigation.menu_item_name') }}</th>
                <th style="width: 140px;">{{ $t('admin.navigation.type') }}</th>
                <th style="width: 180px;">{{ $t('admin.navigation.parent_menu') }}</th>
                <th style="width: 80px;">{{ $t('admin.navigation.sort_order') }}</th>
                <th style="width: 100px;">{{ $t('admin.common.status') }}</th>
                <th style="width: 220px; text-align: right;">{{ $t('admin.common.actions_col') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in pagedRows" :key="row.node._cid">
                <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
                <td>
                  <div class="table-cell-title" :style="{ paddingLeft: `${row.depth * 18}px` }">
                    <span>{{ row.node.title }}</span>
                    <p class="table-cell-subtext">{{ itemSlugFromUrl(row.node.url) }}</p>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="row.rowType === 'parent' ? 'badge-active' : 'badge-inactive'">
                    {{ row.rowType === 'parent' ? $t('admin.navigation.parent_item') : $t('admin.navigation.child_item') }}
                  </span>
                </td>
                <td>{{ row.parentTitle || '-' }}</td>
                <td>{{ row.node.sort_order ?? 0 }}</td>
                <td>
                  <span :class="selectedMenu?.is_active ? 'badge-active' : 'badge-inactive'" class="badge">
                    {{ selectedMenu?.is_active ? $t('admin.common.show_preview') : $t('admin.common.hide_preview') }}
                  </span>
                </td>
                <td class="table-actions" style="justify-content: flex-end;">
                  <button type="button" class="btn btn-ghost btn-sm" @click="openEditNodeDrawer(row.node._cid)">{{ $t('admin.common.edit') }}</button>
                  <button type="button" class="btn btn-ghost btn-sm" @click="openCreateChildNodeDrawer(row.node._cid)">{{ $t('admin.navigation.add_child') }}</button>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeNode(row.node._cid)">{{ $t('admin.common.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="table-pagination">
          <p class="pagination-meta">{{ $t('admin.navigation.showing_meta', { from: showingFrom, to: showingTo, total: rowsCount }) }}</p>
          <div class="pagination-actions">
            <button type="button" class="btn btn-secondary btn-sm" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)">{{ $t('admin.common.prev') }}</button>
            <button type="button" class="btn btn-secondary btn-sm" :disabled="currentPage >= totalPages" @click="setPage(currentPage + 1)">{{ $t('admin.common.next') }}</button>
          </div>
          <div class="footer-actions">
            <button type="button" class="btn btn-secondary btn-sm" @click="openCreateRootNodeDrawer">{{ $t('admin.navigation.add_root') }}</button>
            <EditNavigationMenu :disabled="!selectedMenu" @trigger="openEditMenuDrawer" />
            <DeleteNavigationMenu :disabled="!selectedMenu || savingNavigation" @trigger="openDeleteConfirm" />
            <button type="button" class="btn btn-primary btn-sm" :disabled="!selectedMenu || savingNavigation" @click="handleSaveTree">
              {{ $t('admin.common.save_changes') }}
            </button>
          </div>
        </footer>
      </section>
    </div>

    <transition name="confirm-fade">
      <div v-if="confirmDialog.open" class="confirm-overlay" @click="closeConfirmDialog(false)"></div>
    </transition>
    <transition name="confirm-pop">
      <div
        v-if="confirmDialog.open"
        class="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div class="confirm-modal__icon" :class="`confirm-modal__icon--${confirmDialog.tone}`">
          {{ confirmDialog.tone === 'danger' ? '!' : '?' }}
        </div>
        <h3 id="confirm-dialog-title">{{ confirmDialog.title }}</h3>
        <p>{{ confirmDialog.message }}</p>
        <div class="confirm-modal__actions">
          <button type="button" class="btn btn-ghost" @click="closeConfirmDialog(false)">{{ $t('admin.common.discard') }}</button>
          <button
            type="button"
            class="btn"
            :class="confirmDialog.tone === 'danger' ? 'btn-danger' : 'btn-primary'"
            @click="closeConfirmDialog(true)"
          >
            {{ confirmDialog.confirmText }}
          </button>
        </div>
      </div>
    </transition>
    <div v-if="drawerOpen" class="drawer-overlay" @click="closeDrawer"></div>
    <aside class="drawer" :class="{ open: drawerOpen }">
      <button type="button" class="drawer-toggle" @click="closeDrawer">&lt;</button>
      <header class="drawer-header">
        <div>
          <h3>{{ drawerTitle }}</h3>
          <p>{{ drawerMode === 'createMenu' || drawerMode === 'editMenu' ? $t('admin.navigation.menu_info') : $t('admin.navigation.node_info') }}</p>
        </div>
        <button type="button" class="close-btn" @click="closeDrawer">x</button>
      </header>

      <section class="drawer-body" v-if="drawerMode === 'createMenu' || drawerMode === 'editMenu'">
        <label>
          <span>{{ $t('admin.navigation.menu_name') }}</span>
          <input v-model="menuForm.name" type="text" :placeholder="$t('admin.navigation.menu_name')" />
        </label>
        <label>
          <span>{{ $t('admin.navigation.location') }}</span>
          <input v-model="menuForm.location" type="text" placeholder="header / footer" />
        </label>
        <label>
          <span>{{ $t('admin.navigation.language') }}</span>
          <select v-model="menuForm.language_id">
            <option value="">{{ $t('admin.navigation.select_language') }}</option>
            <option v-for="language in languages" :key="language.id" :value="String(language.id)">
              {{ language.code }} - {{ language.name }}
            </option>
          </select>
        </label>
        <label class="toggle-row">
          <input v-model="menuForm.is_active" type="checkbox" />
          <span>{{ $t('admin.navigation.is_active') }}</span>
        </label>
      </section>

      <section class="drawer-body" v-else>
        <label>
          <span>{{ $t('admin.navigation.node_title') }}</span>
          <input v-model="nodeForm.title" type="text" :placeholder="$t('admin.navigation.node_title')" />
        </label>
        <label>
          <span>{{ $t('admin.navigation.url') }}</span>
          <input v-model="nodeForm.url" type="text" placeholder="/about/history" />
        </label>
        <div class="grid-2">
          <label>
            <span>{{ $t('admin.navigation.anchor') }}</span>
            <input v-model="nodeForm.anchor" type="text" placeholder="section-id" />
          </label>
          <label>
            <span>{{ $t('admin.navigation.sort_order') }}</span>
            <input v-model="nodeForm.sort_order" type="number" placeholder="0" />
          </label>
        </div>
        <div class="grid-2">
          <label>
            <span>{{ $t('admin.navigation.type') }}</span>
            <input v-model="nodeForm.item_type" type="text" placeholder="parent/child" />
          </label>
          <label>
            <span>{{ $t('admin.navigation.target') }}</span>
            <input v-model="nodeForm.target" type="text" placeholder="_self / _blank" />
          </label>
        </div>
      </section>

      <footer class="drawer-footer">
        <button type="button" class="btn btn-ghost" @click="closeDrawer">{{ $t('admin.common.discard') }}</button>
        <button type="button" class="btn btn-primary" :disabled="savingNavigation || loadingLanguages" @click="submitDrawer">
          {{ $t('admin.common.save_changes') }}
        </button>
      </footer>
    </aside>
  </section>
</template>

<style scoped>
.nav-manager {
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

.intro-eyebrow {
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
  font-size: 13px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.table-cell-title span {
  display: block;
  font-weight: 500;
  color: #1e293b;
}

.table-cell-subtext {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.table-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.badge-active { background: #dcfce7; color: #166534; }
.badge-inactive { background: #f1f5f9; color: #475569; }

.form-control {
  height: 36px;
  padding: 0 12px;
}

.btn {
  border-radius: var(--admin-control-radius, 14px);
  border: 1px solid transparent;
  min-height: var(--admin-button-height, 40px);
  padding: 0 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.22s ease;
}

.btn-filter {
  border-color: #d7d2ff;
  background: linear-gradient(135deg, #d9d6ff 0%, #c7c2ff 100%);
  color: #363a7a;
  font-weight: 700;
  min-width: 134px;
}

.btn-ghost {
  background: transparent !important;
  border-color: transparent !important;
  color: #64748b !important;
  box-shadow: none !important;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(15, 23, 42, 0.05) !important;
  color: #334155 !important;
}

.btn-sm {
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 10px !important;
  font-size: 11px !important;
  border-radius: 6px !important;
}

.btn-secondary {
  color: #284767 !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 247, 252, 0.96)) !important;
  border-color: rgba(198, 216, 233, 0.95) !important;
}

button:disabled {
  opacity: 0.56;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

@media (max-width: 1200px) {
  .filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  table {
    min-width: 860px;
  }
}

@media (max-width: 900px) {
  .nav-manager__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .head-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination {
    order: 2;
  }

  .footer-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .drawer-header h3 {
    font-size: 30px;
  }

  table {
    min-width: 760px;
  }
}

@media (max-width: 760px) {
  .table-scroll {
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
    padding: 10px;
  }

  .nav-row {
    display: block;
    border: 1px solid #dbe4f2;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
  }

  .nav-row td {
    display: grid;
    grid-template-columns: minmax(100px, 38%) minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    border-bottom: 1px dashed #e6eef8;
    padding: 10px 12px;
  }

  .nav-row td:last-child {
    border-bottom: 0;
  }

  .nav-row td::before {
    content: attr(data-label);
    color: #73839a;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    line-height: 1.4;
    padding-top: 2px;
  }

  .table-empty-row {
    display: block;
  }

  .table-empty-row td {
    display: block;
    border: 1px solid #dbe4f2;
    border-radius: 10px;
    background: #fff;
  }

  .table-empty-row td::before {
    content: none;
  }

  .row-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 680px) {
  .head-actions .btn {
    flex: 1 1 calc(50% - 8px);
  }

  .table-footer p {
    font-size: 12px;
  }

  .footer-actions .btn {
    width: 100%;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }

  .drawer-toggle {
    display: none;
  }

  .drawer-header {
    padding: 16px;
  }

  .drawer-header h3 {
    font-size: 26px;
  }

  .drawer-body {
    padding: 14px 16px;
  }

  .drawer-footer {
    padding: 12px 16px;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  .drawer-footer .btn {
    width: 100%;
  }
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 41;
  background: rgba(10, 18, 35, 0.54);
  backdrop-filter: blur(6px);
}

.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 42;
  width: min(440px, calc(100vw - 32px));
  padding: 18px 16px 16px;
  border-radius: 18px;
  border: 1px solid #d9e4f5;
  background:
    radial-gradient(circle at top left, rgba(82, 167, 237, 0.14), transparent 48%),
    radial-gradient(circle at top right, rgba(115, 105, 234, 0.12), transparent 50%),
    #ffffff;
  box-shadow: 0 24px 54px rgba(22, 38, 70, 0.26);
  transform: translate(-50%, -50%);
  text-align: center;
}

.confirm-modal__icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 16px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
}

.confirm-modal__icon--primary {
  background: linear-gradient(135deg, #d6ebff 0%, #c7e2ff 100%);
  color: #205f9d;
}

.confirm-modal__icon--danger {
  background: linear-gradient(135deg, #ffe3e8 0%, #ffd2db 100%);
  color: #c43b57;
}

.confirm-modal h3 {
  margin: 0;
  color: #16233f;
  font-size: 20px;
  font-weight: 800;
}

.confirm-modal p {
  margin: 10px 0 0;
  color: #5d6d85;
  font-size: 14px;
  line-height: 1.6;
}

.confirm-modal strong {
  color: #1a2743;
}

.confirm-modal__actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-danger {
  border-color: #d64563;
  background: linear-gradient(135deg, #d93b59 0%, #f0627d 100%);
  color: #fff;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(217, 59, 89, 0.28);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.18s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-pop-enter-active,
.confirm-pop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.confirm-pop-enter-from,
.confirm-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -46%) scale(0.96);
}

@media (max-width: 680px) {
  .confirm-modal {
    padding: 22px 18px;
    border-radius: 20px;
  }

  .confirm-modal h3 {
    font-size: 24px;
  }

  .confirm-modal p {
    font-size: 14px;
  }

  .confirm-modal__actions {
    flex-direction: column;
  }

  .confirm-modal__actions .btn {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .nav-manager {
    padding: 12px;
  }

  .title-wrap h2 {
    font-size: 28px;
  }

  .head-actions,
  .footer-actions,
  .pagination {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }

  .head-actions .btn,
  .footer-actions .btn,
  .page-btn {
    width: 100%;
  }

  .nav-row td {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .drawer {
    width: 100vw;
    border-left-width: 0;
  }
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
}

.drawer {
  position: fixed;
  top: 0;
  right: -520px;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  z-index: 1001;
  background: #fff;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.1);
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.drawer.open {
  right: 0;
}

.drawer-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.drawer-header p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
}

.close-btn:hover {
  color: #1e293b;
}

.drawer-body {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-body label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-body label span {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.drawer-body input[type="text"],
.drawer-body input[type="number"],
.drawer-body select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.drawer-body input[type="text"]:focus,
.drawer-body input[type="number"]:focus,
.drawer-body select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-row {
  flex-direction: row !important;
  align-items: center;
  gap: 12px !important;
}

.toggle-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.drawer-footer {
  padding: 24px 32px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

