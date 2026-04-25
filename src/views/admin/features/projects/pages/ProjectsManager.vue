<script setup>
import '@/views/admin/features/projects/projects-manager.css'
import { toRef, watch } from 'vue'
import CoreConfirmDialog from '@/views/admin/shared/components/CoreConfirmDialog.vue'
import { useProjectManager } from '../composables/useProjectManager.js'
import ProjectAdd from './project_add.vue'
import ProjectsEdit from './projects_edit.vue'

const props = defineProps({
  token: { type: String, required: true },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['notify-success', 'notify-error', 'clear-notify'])

const {
  setContext,
  refreshAll,
  closeProductForm,
  closeGalleryForm,
  loading,
  currentMode,
  isCreatingProject,
  projectSearch,
  filteredProjects,
  totalProjectsCount,
  totalProductMappingsCount,
  totalGalleryImagesCount,
  getProjectCoverThumb,
  deletingProjectId,
  deleteProject,
  goToEdit,
  goToCreate,
  goToList,
  normalizedToken,
  confirmDialog,
  acceptConfirmDialog,
  cancelConfirmDialog,
} = useProjectManager()

setContext(toRef(props, 'token'), emit)

watch(
  () => props.active,
  async (active) => {
    if (active && normalizedToken()) {
      await refreshAll()
      return
    }
    closeProductForm()
    closeGalleryForm()
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
</script>

<template>
  <section class="projects-workbench">
    <header class="workbench-hero panel panel-gradient">
      <div class="hero-content-wrapper">
        <div class="hero-titles">
          <p class="eyebrow">Projects Admin Workbench</p>
          <h2>Quản trị dự án all-in-one</h2>
          <p class="subtext">
            Một màn hình tập trung để quản lý danh sách dự án, tạo mới, chỉnh sửa thông tin,
            sản phẩm sử dụng và gallery hình ảnh mà không cần sửa nhiều nơi.
          </p>
        </div>

        <div class="hero-stats">
          <div class="stat-card">
            <span>Tổng dự án</span>
            <strong>{{ totalProjectsCount }}</strong>
          </div>
          <div class="stat-card">
            <span>Lượt dùng SP</span>
            <strong>{{ totalProductMappingsCount }}</strong>
          </div>
          <div class="stat-card">
            <span>Ảnh &amp; Gallery</span>
            <strong>{{ totalGalleryImagesCount }}</strong>
          </div>
        </div>
      </div>

      <div class="hero-actions">
        <button type="button" class="btn btn-secondary" :disabled="loading" @click="refreshAll">
          {{ loading ? 'Đang tải...' : 'Làm mới dữ liệu' }}
        </button>
        <button v-if="currentMode === 'list'" type="button" class="btn btn-primary" @click="goToCreate">
          Tạo dự án mới
        </button>
        <button v-else type="button" class="btn btn-secondary" @click="goToList">
          Quay lại danh sách
        </button>
      </div>
    </header>

    <div v-if="currentMode === 'list'" class="panel section-card panel-list-view">
      <div class="section-head">
        <div>
          <h3>Tất cả dự án</h3>
          <p class="section-subtext">
            Nhấp vào "Sửa chi tiết" để quản lý thông tin, sản phẩm và gallery của dự án.
          </p>
        </div>
        <label class="field-block field-block-search">
          <input v-model="projectSearch" type="search" placeholder="Tìm theo tên, địa điểm, slug..." />
        </label>
      </div>

      <div class="table-wrap projects-main-table">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px">ID</th>
              <th style="width: 70px">Ảnh</th>
              <th>Tên dự án</th>
              <th>Địa điểm</th>
              <th>Slug</th>
              <th style="width: 180px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredProjects.length">
              <td colspan="6" class="empty-state empty-state--neutral text-center">
                Không tìm thấy dự án nào.
              </td>
            </tr>
            <tr v-for="project in filteredProjects" :key="project.id">
              <td>#{{ project.id }}</td>
              <td>
                <div class="table-thumb">
                  <img v-if="getProjectCoverThumb(project.id)" :src="getProjectCoverThumb(project.id)" alt="thumb" />
                  <div v-else class="thumb-placeholder-small"></div>
                </div>
              </td>
              <td class="font-bold">{{ project.title }}</td>
              <td>{{ project.location || '-' }}</td>
              <td><small>{{ project.slug }}</small></td>
              <td>
                <div class="row-actions">
                  <button type="button" class="btn btn-primary btn-sm" @click="goToEdit(project)">
                    Sửa chi tiết
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    :disabled="deletingProjectId === project.id"
                    @click="deleteProject(project.id)"
                  >
                    {{ deletingProjectId === project.id ? 'Đang xóa...' : 'Xóa' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="workbench-main-full">
      <ProjectAdd v-if="isCreatingProject" />
      <ProjectsEdit v-else />
    </div>

    <CoreConfirmDialog
      :visible="confirmDialog.visible"
      :dialog="confirmDialog"
      :confirm-button-class="confirmDialog.tone === 'danger' ? 'btn btn-danger' : 'btn btn-primary'"
      @cancel="cancelConfirmDialog"
      @accept="acceptConfirmDialog"
    />
  </section>
</template>
