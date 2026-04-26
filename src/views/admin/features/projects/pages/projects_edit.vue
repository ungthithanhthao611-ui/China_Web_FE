<script setup>
/**
 * projects_edit.vue
 * Form chỉnh sửa dự án đầy đủ: thông tin + sản phẩm combobox + gallery grid.
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { useProjectManager } from '../composables/useProjectManager.js'

const {
  projectForm, projectFormErrors,
  slugify,
  coverPreviewUrl, selectedProjectCover, coverUploadFile,
  coverFileInputRef, uploadingProjectAssets,
  savingProject, deletingProject,
  selectedProject, selectedProjectId, selectedProjectProducts,
  selectedProjectGallery, pendingGalleryPreviewItems,
  productMap, mediaMap,
  productForm, productFormErrors, savingProductMapping,
  deletingProductMappingId, recentlySavedProductMappingId,
  availableProductOptions,
  galleryMultiInputRef,
  deletingGalleryId,
  productSearchQuery, productSearchResults, showProductDropdown, productComboRef, productDropdownPlacement,
  pendingSelectedProjectProducts,
  populateProjectForm, saveProject, goToList,
  onCoverFileSelected, removeCoverImage, removeProject,
  setProductMappingRowRef, productLabel, getProductThumb, mediaLabel,
  openEditProductForm, closeProductForm, saveProductMapping, removeProductMapping,
  onProductSearchInput, onProductSearchFocus, onProductComboClickOutside,
  toggleProductDropdown, selectProductFromSearch, removePendingProductSelection,
  clearAllPendingProductSelections,
  resolveMediaUrl, moveGalleryItem, removeGalleryBinding,
  onMultiGalleryFilesSelected, removePendingGalleryFile,
  cleanupProductSearch, isProductAlreadySelected,
} = useProjectManager()

onMounted(() => {
  document.addEventListener('mousedown', onProductComboClickOutside)
})
onBeforeUnmount(() => {
  cleanupProductSearch()
  document.removeEventListener('mousedown', onProductComboClickOutside)
})
</script>

<template>
  <section class="panel section-card">
    <div class="section-head">
      <div>
        <p class="eyebrow">Thông tin dự án</p>
        <h3>{{ selectedProject?.title || 'Thông tin dự án' }}</h3>
        <p class="section-subtext">Điền các trường bắt buộc: tên dự án, hình ảnh, địa điểm, mô tả.</p>
      </div>
      <div class="section-actions">
        <button v-if="selectedProject" type="button" class="btn btn-danger" :disabled="deletingProject" @click="removeProject">
          {{ deletingProject ? 'Đang xóa...' : 'Xóa dự án' }}
        </button>
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
          <img v-if="coverPreviewUrl" class="cover-preview" :src="coverPreviewUrl" alt="Preview" />
          <img v-else-if="selectedProjectCover" class="cover-preview" :src="selectedProjectCover" :alt="projectForm.title || 'cover'" />
          <div v-else class="cover-preview cover-preview--empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span>Chưa có ảnh đại diện</span>
          </div>
        </div>
        <input ref="coverFileInputRef" type="file" accept="image/*" class="sr-only" @change="onCoverFileSelected" />
        <div class="cover-actions">
          <button type="button" class="btn btn-secondary btn-sm" @click="coverFileInputRef?.click()">
            {{ selectedProjectCover || coverPreviewUrl ? 'Đổi ảnh' : 'Chọn ảnh' }}
          </button>
          <button v-if="selectedProjectCover || coverPreviewUrl" type="button" class="btn btn-danger btn-sm" @click="removeCoverImage">Xóa ảnh</button>
        </div>
        <p v-if="coverUploadFile" class="cover-file-name">{{ coverUploadFile.name }}</p>
        <p v-if="coverUploadFile" class="hint-text">Ảnh đại diện đang chờ lưu. Khi bấm lưu dự án, hệ thống sẽ tải ảnh này lên Cloudinary.</p>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="goToList">Quay lại danh sách</button>
      <div class="form-actions-right">
        <button type="button" class="btn btn-secondary" @click="populateProjectForm(selectedProject)">Hoàn tác</button>
        <button type="button" class="btn btn-primary" :disabled="savingProject || uploadingProjectAssets" @click="saveProject">
          {{ savingProject || uploadingProjectAssets ? 'Đang lưu & tải ảnh...' : 'Lưu thông tin dự án' }}
        </button>
      </div>
    </div>
  </section>

  <section class="panel section-card">
    <div class="section-head">
      <div>
        <p class="eyebrow">Sản phẩm sử dụng</p>
        <h3>Sản phẩm trong dự án</h3>
        <p class="section-subtext">Tìm và gắn sản phẩm đã dùng trong dự án này.</p>
      </div>
    </div>

    <div v-if="!selectedProjectId" class="empty-state empty-state--neutral">
      Vui lòng lưu dự án trước khi thêm sản phẩm sử dụng.
    </div>
    <template v-else>
      <div ref="productComboRef" class="product-search-wrap">
        <div
          v-if="showProductDropdown && productSearchResults.length && productDropdownPlacement === 'up'"
          class="product-dropdown product-dropdown--up"
        >
          <div class="product-dropdown-header">
            <strong>{{ productSearchResults.length }} sản phẩm khả dụng</strong>
            <span>Cuộn để xem thêm · bấm nhiều lần để chọn nhiều sản phẩm</span>
          </div>
          <button
            v-for="product in productSearchResults"
            :key="`up-${product.id}`"
            type="button"
            class="product-dropdown-item"
            :class="{ 'product-dropdown-item--selected': isProductAlreadySelected(product.id) }"
            @click="selectProductFromSearch(product)"
          >
            <span class="product-dropdown-check" :class="{ 'product-dropdown-check--active': isProductAlreadySelected(product.id) }">
              <svg v-if="isProductAlreadySelected(product.id)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <div class="product-dropdown-thumb">
              <img v-if="getProductThumb(product)" :src="getProductThumb(product)" :alt="product.name || product.title" />
              <div v-else class="thumb-placeholder-small"></div>
            </div>
            <div class="product-dropdown-info">
              <strong>{{ product.name || product.title }}</strong>
              <span>SKU: {{ product.sku || '-' }}</span>
            </div>
          </button>
        </div>

        <div
          v-if="showProductDropdown && !productSearchResults.length && productDropdownPlacement === 'up'"
          class="product-dropdown product-dropdown--empty product-dropdown--up"
        >
          {{ productSearchQuery.trim() ? 'Không tìm thấy sản phẩm phù hợp.' : 'Không còn sản phẩm nào để thêm.' }}
        </div>

        <label class="field-block field-block--full">
          <span>
            Tìm &amp; chọn sản phẩm
            <small class="hint-text">({{ productSearchResults.length }} sản phẩm khả dụng)</small>
          </span>
          <div class="combobox-input-wrap">
            <input
              v-model="productSearchQuery"
              type="text"
              placeholder="Gõ tên, SKU để tìm hoặc click ▼ để xem tất cả..."
              autocomplete="off"
              @input="onProductSearchInput"
              @focus="onProductSearchFocus"
            />
            <button type="button" class="combobox-toggle-btn" tabindex="-1" @mousedown.prevent="toggleProductDropdown">
              <svg :class="{ 'rotate-180': showProductDropdown }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
          </div>
        </label>
        <div v-if="pendingSelectedProjectProducts.length" class="selection-toolbar">
          <div class="selection-chip-list">
            <button
              v-for="item in pendingSelectedProjectProducts"
              :key="item.key"
              type="button"
              class="selection-chip"
              @click="removePendingProductSelection(item.product_id)"
            >
              <span>{{ productLabel(item.product) }}</span>
              <span class="selection-chip__remove">✕</span>
            </button>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="clearAllPendingProductSelections">
            Bỏ chọn tất cả
          </button>
        </div>
        <div
          v-if="showProductDropdown && productSearchResults.length && productDropdownPlacement !== 'up'"
          class="product-dropdown"
        >
          <div class="product-dropdown-header">
            <strong>{{ productSearchResults.length }} sản phẩm khả dụng</strong>
            <span>Cuộn để xem thêm · bấm nhiều lần để chọn nhiều sản phẩm</span>
          </div>
          <button
            v-for="product in productSearchResults"
            :key="`down-${product.id}`"
            type="button"
            class="product-dropdown-item"
            :class="{ 'product-dropdown-item--selected': isProductAlreadySelected(product.id) }"
            @click="selectProductFromSearch(product)"
          >
            <span class="product-dropdown-check" :class="{ 'product-dropdown-check--active': isProductAlreadySelected(product.id) }">
              <svg v-if="isProductAlreadySelected(product.id)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            <div class="product-dropdown-thumb">
              <img v-if="getProductThumb(product)" :src="getProductThumb(product)" :alt="product.name || product.title" />
              <div v-else class="thumb-placeholder-small"></div>
            </div>
            <div class="product-dropdown-info">
              <strong>{{ product.name || product.title }}</strong>
              <span>SKU: {{ product.sku || '-' }}</span>
            </div>
          </button>
        </div>
        <div
          v-if="showProductDropdown && !productSearchResults.length && productDropdownPlacement !== 'up'"
          class="product-dropdown product-dropdown--empty"
        >
          {{ productSearchQuery.trim() ? 'Không tìm thấy sản phẩm phù hợp.' : 'Không còn sản phẩm nào để thêm.' }}
        </div>
      </div>

      <div v-if="pendingSelectedProjectProducts.length" class="panel panel-inner pending-products-panel">
        <div class="section-head pending-products-head">
          <div>
            <p class="eyebrow">Sản phẩm chờ lưu</p>
            <h4>{{ pendingSelectedProjectProducts.length }} sản phẩm đã chọn</h4>
            <p class="section-subtext">Các sản phẩm này sẽ được gắn vào dự án khi bạn bấm lưu dự án.</p>
          </div>
        </div>
        <div class="product-cards-grid pending-products-grid">
          <article v-for="item in pendingSelectedProjectProducts" :key="item.key" class="product-card product-card--pending">
            <div class="product-card-thumb">
              <img v-if="getProductThumb(item.product)" :src="getProductThumb(item.product)" :alt="productLabel(item.product)" />
              <div v-else class="thumb-placeholder-small"></div>
            </div>
            <div class="product-card-body">
              <strong>{{ productLabel(item.product) }}</strong>
              <span class="product-card-sku">{{ item.product?.sku || '-' }}</span>
              <div class="product-card-meta">
                <span>STT dự kiến: {{ item.sort_order || 0 }}</span>
                <span class="updated-badge">Chờ lưu</span>
              </div>
            </div>
            <div class="product-card-actions">
              <button type="button" class="btn btn-danger btn-icon" title="Bỏ chọn sản phẩm" @click="removePendingProductSelection(item.product_id)">✕</button>
            </div>
          </article>
        </div>
      </div>

      <div v-if="savingProductMapping" class="loading-bar">Đang lưu sản phẩm...</div>

      <div v-if="!selectedProjectProducts.length && !pendingSelectedProjectProducts.length" class="empty-state empty-state--neutral">
        Chưa có sản phẩm nào. Tìm và chọn sản phẩm từ ô tìm kiếm phía trên.
      </div>
      <div v-else class="product-cards-grid">
        <article
          v-for="item in selectedProjectProducts"
          :key="item.id"
          :ref="(element) => setProductMappingRowRef(item.id, element)"
          class="product-card"
          :class="{ 'product-card--highlight': String(recentlySavedProductMappingId) === String(item.id) }"
        >
          <div class="product-card-thumb">
            <img v-if="getProductThumb(productMap.get(String(item.product_id)))" :src="getProductThumb(productMap.get(String(item.product_id)))" :alt="productLabel(productMap.get(String(item.product_id)))" />
            <div v-else class="thumb-placeholder-small"></div>
          </div>
          <div class="product-card-body">
            <strong>{{ productLabel(productMap.get(String(item.product_id))) }}</strong>
            <span class="product-card-sku">{{ productMap.get(String(item.product_id))?.sku || '-' }}</span>
            <div v-if="item.note" class="product-card-note">{{ item.note }}</div>
            <div class="product-card-meta">
              <span>Thứ tự: {{ item.sort_order || 0 }}</span>
              <span v-if="String(recentlySavedProductMappingId) === String(item.id)" class="updated-badge">Vừa cập nhật</span>
            </div>
          </div>
          <div class="product-card-actions">
            <button type="button" class="btn btn-secondary btn-sm" @click="openEditProductForm(item)">Sửa</button>
            <button type="button" class="btn btn-danger btn-sm" :disabled="deletingProductMappingId === item.id" @click="removeProductMapping(item)">
              {{ deletingProductMappingId === item.id ? '...' : 'Xóa' }}
            </button>
          </div>
        </article>
      </div>

      <div v-if="productForm.open" class="inline-form panel panel-inner">
        <h4>{{ productForm.mode === 'edit' ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h4>
        <ul v-if="productFormErrors.length" class="error-list">
          <li v-for="error in productFormErrors" :key="error">{{ error }}</li>
        </ul>
        <div class="inline-form-grid">
          <label class="field-block">
            <span>Sản phẩm</span>
            <select v-model="productForm.product_id">
              <option value="">Chọn sản phẩm</option>
              <option v-for="product in availableProductOptions" :key="product.id" :value="String(product.id)">
                {{ productLabel(product) }}
              </option>
              <option v-if="productForm.mode === 'edit' && productForm.product_id && !availableProductOptions.some((i) => String(i.id) === String(productForm.product_id))" :value="String(productForm.product_id)">
                {{ productLabel(productMap.get(String(productForm.product_id))) }}
              </option>
            </select>
          </label>
          <label class="field-block">
            <span>Thứ tự hiển thị</span>
            <input v-model.number="productForm.sort_order" type="number" min="0" step="10" />
          </label>
          <label class="field-block field-block--full">
            <span>Ghi chú ứng dụng</span>
            <textarea v-model="productForm.note" rows="3" placeholder="Ví dụ: Dùng cho sảnh chính, vách ốp..." />
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="closeProductForm">Đóng</button>
          <button type="button" class="btn btn-primary" :disabled="savingProductMapping" @click="saveProductMapping">
            {{ savingProductMapping ? 'Đang lưu...' : productForm.mode === 'create' ? 'Lưu sản phẩm' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </template>
  </section>

  <section class="panel section-card">
    <div class="section-head">
      <div>
        <p class="eyebrow">Hình ảnh dự án</p>
        <h3>Gallery dự án</h3>
        <p class="section-subtext">
          {{ selectedProjectGallery.length }} ảnh đã lưu
          <span v-if="pendingGalleryPreviewItems.length"> · {{ pendingGalleryPreviewItems.length }} ảnh chờ tải</span>
        </p>
      </div>
      <div v-if="selectedProjectId" class="section-actions">
        <input ref="galleryMultiInputRef" type="file" accept="image/*" multiple class="sr-only" @change="onMultiGalleryFilesSelected" />
        <button type="button" class="btn btn-primary" @click="galleryMultiInputRef?.click()">
          Chọn nhiều ảnh
        </button>
      </div>
    </div>

    <div v-if="!selectedProjectId" class="empty-state empty-state--neutral">Vui lòng lưu dự án trước khi thêm hình ảnh gallery.</div>
    <template v-else>
      <div v-if="pendingGalleryPreviewItems.length" class="panel panel-inner" style="margin-bottom: 16px;">
        <p class="eyebrow">Ảnh chờ lưu</p>
        <div class="gallery-grid">
          <article v-for="item in pendingGalleryPreviewItems" :key="item.id" class="gallery-card gallery-card--pending">
            <img class="gallery-thumb" :src="item.previewUrl" :alt="item.name" />
            <div class="gallery-card-body">
              <strong>{{ item.name }}</strong>
              <p>STT dự kiến: {{ item.sort_order || 0 }}</p>
              <p class="hint-text">Sẽ được upload khi bấm lưu dự án.</p>
            </div>
            <div class="gallery-card-actions">
              <button type="button" class="btn btn-danger btn-icon" title="Bỏ ảnh khỏi danh sách chờ" @click="removePendingGalleryFile(item.id)">✕</button>
            </div>
          </article>
        </div>
      </div>

      <div v-if="!selectedProjectGallery.length && !pendingGalleryPreviewItems.length" class="empty-state empty-state--neutral">Chưa có ảnh gallery cho dự án này.</div>
      <div v-else class="gallery-grid">
        <article v-for="(item, index) in selectedProjectGallery" :key="item.id" class="gallery-card">
          <img v-if="resolveMediaUrl(mediaMap.get(String(item.media_id))?.url)" class="gallery-thumb" :src="resolveMediaUrl(mediaMap.get(String(item.media_id))?.url)" :alt="mediaLabel(mediaMap.get(String(item.media_id)))" />
          <div v-else class="gallery-thumb gallery-thumb--empty">Không có ảnh</div>
          <div class="gallery-card-body">
            <strong>{{ mediaLabel(mediaMap.get(String(item.media_id))) }}</strong>
            <p>STT: {{ item.sort_order || 0 }}</p>
            <p v-if="item.caption">{{ item.caption }}</p>
          </div>
          <div class="gallery-card-actions">
            <button type="button" class="btn btn-secondary btn-icon" :disabled="index === 0" title="Di chuyển lên" @click="moveGalleryItem(item, 'up')">↑</button>
            <button type="button" class="btn btn-secondary btn-icon" :disabled="index === selectedProjectGallery.length - 1" title="Di chuyển xuống" @click="moveGalleryItem(item, 'down')">↓</button>
            <button type="button" class="btn btn-danger btn-icon" :disabled="deletingGalleryId === item.id" title="Xóa ảnh" @click="removeGalleryBinding(item)">✕</button>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* projects_edit.vue kế thừa styles từ ProjectsManager parent */
</style>
