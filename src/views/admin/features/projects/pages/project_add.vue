<script setup>
/**
 * project_add.vue
 * Form tạo mới dự án. Chỉ chứa thông tin cơ bản + ảnh đại diện.
 * Sau khi tạo xong sẽ chuyển sang edit mode để thêm sản phẩm & gallery.
 */
import { useProjectManager } from '../composables/useProjectManager.js'

const {
  projectForm, projectFormErrors, isCreatingProject,
  slugify,
  coverPreviewUrl, selectedProjectCover, coverUploadFile,
  coverFileInputRef, uploadingProjectAssets,
  savingProject,
  resetProjectForm, saveProject, goToList,
  onCoverFileSelected, removeCoverImage,
} = useProjectManager()
</script>

<template>
  <section class="panel section-card">
    <div class="section-head">
      <div>
        <p class="eyebrow">Thông tin dự án</p>
        <h3>Tạo dự án mới</h3>
        <p class="section-subtext">Điền các trường bắt buộc: tên dự án, hình ảnh, địa điểm, mô tả.</p>
      </div>
    </div>

    <ul v-if="projectFormErrors.length" class="error-list">
      <li v-for="error in projectFormErrors" :key="error">{{ error }}</li>
    </ul>

    <div class="project-editor-grid">
      <div class="project-form-grid">
        <label class="field-block field-block--full">
          <span>Tên dự án</span>
          <input v-model="projectForm.title" type="text" placeholder="Ví dụ: Biệt thự hiện đại sử dụng đá Travertine" />
        </label>

        <label class="field-block">
          <span>Địa điểm</span>
          <input v-model="projectForm.location" type="text" placeholder="Ví dụ: TP.HCM, Việt Nam" />
        </label>

        <label class="field-block">
          <span>Slug (tự sinh)</span>
          <input :value="slugify(projectForm.slug || projectForm.title)" type="text" readonly />
        </label>

        <label class="field-block field-block--full">
          <span>Mô tả ngắn</span>
          <textarea v-model="projectForm.summary" rows="3" placeholder="Nhập mô tả ngắn cho dự án." />
        </label>

        <label class="field-block field-block--full">
          <span>Mô tả chi tiết</span>
          <textarea v-model="projectForm.body" rows="5" placeholder="Nhập mô tả chi tiết cho dự án." />
        </label>

        <label class="field-block">
          <span>Trạng thái</span>
          <select v-model="projectForm.status">
            <option value="published">Hiển thị</option>
            <option value="draft">Nháp</option>
          </select>
        </label>
      </div>

      <div class="cover-card panel panel-inner">
        <p class="eyebrow">Ảnh đại diện dự án</p>
        <div class="cover-preview-wrap">
          <img v-if="coverPreviewUrl" class="cover-preview" :src="coverPreviewUrl" alt="Preview ảnh đại diện" />
          <img v-else-if="selectedProjectCover" class="cover-preview" :src="selectedProjectCover" :alt="projectForm.title || 'project-cover'" />
          <div v-else class="cover-preview cover-preview--empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span>Chưa có ảnh đại diện</span>
          </div>
        </div>
        <input ref="coverFileInputRef" type="file" accept="image/*" class="sr-only" @change="onCoverFileSelected" />
        <div class="cover-actions">
          <button type="button" class="btn btn-secondary btn-sm" @click="coverFileInputRef?.click()">
            {{ coverPreviewUrl ? 'Đổi ảnh' : 'Chọn ảnh' }}
          </button>
          <button v-if="coverPreviewUrl || selectedProjectCover" type="button" class="btn btn-danger btn-sm" @click="removeCoverImage">Xóa ảnh</button>
        </div>
        <p v-if="coverUploadFile" class="cover-file-name">{{ coverUploadFile.name }}</p>
        <p v-if="coverUploadFile" class="hint-text">Ảnh đang được lưu tạm trên máy. Hệ thống sẽ tải lên Cloudinary khi bạn bấm tạo dự án.</p>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="goToList">Quay lại danh sách</button>
      <div class="form-actions-right">
        <button type="button" class="btn btn-secondary" @click="resetProjectForm">Hoàn tác</button>
        <button type="button" class="btn btn-primary" :disabled="savingProject || uploadingProjectAssets" @click="saveProject">
          {{ savingProject || uploadingProjectAssets ? 'Đang tạo & tải ảnh...' : 'Tạo dự án' }}
        </button>
      </div>
    </div>
  </section>

  <div class="empty-state empty-state--neutral">
    💡 Sau khi tạo dự án, bạn có thể thêm sản phẩm sử dụng và ảnh gallery trong trang chỉnh sửa.
  </div>
</template>

<style scoped>
/* project_add.vue kế thừa styles từ ProjectsManager parent */
</style>
