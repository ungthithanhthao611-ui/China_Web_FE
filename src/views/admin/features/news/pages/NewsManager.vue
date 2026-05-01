<template>
  <div class="news-mgr" :class="{ 'news-mgr--embedded': embedded }">
    <div class="ultimate-clean-workspace">
      <!-- 1. Unified Header -->
      <header class="intro-card">
        <div class="intro-copy">
          <p class="intro-eyebrow">Nội dung & Truyền thông</p>
          <h2>Quản lý tin tức</h2>
          <p>Tạo và biên tập các bài viết tin tức, thông cáo báo chí của doanh nghiệp.</p>
        </div>
        <div class="intro-actions">
          <button class="btn btn-ghost btn-sm" @click="showCrawlModal = true">
            <Download :size="14" /> Crawl URL
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="goToCreate">
            <Plus :size="14" /> Tạo bài viết
          </button>
        </div>
      </header>

      <!-- 2. Table Area -->
      <section class="section-list-unified">
        <div class="table-wrap" style="padding: 0 32px 32px;">
          <table class="ultimate-table">
            <thead>
              <tr>
                <th style="width: 80px;">Ảnh</th>
                <th>Tiêu đề bài viết</th>
                <th style="width: 140px;">Trạng thái</th>
                <th style="width: 160px;">Ngày xuất bản</th>
                <th style="width: 120px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="loading">
                <td colspan="5" class="text-center py-12">
                  <span class="text-sub">Đang tải dữ liệu...</span>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="posts.length === 0">
                <td colspan="5" class="text-center py-12 text-sub">
                  Chưa có bài viết nào. Hãy tạo bài viết đầu tiên.
                </td>
              </tr>

              <!-- Rows -->
              <tr v-else v-for="post in posts" :key="post.id">
                <td>
                  <div class="section-thumb-clean" style="width: 60px; height: 40px;">
                    <img
                      :src="post.thumbnail_url || `https://picsum.photos/seed/${post.id}/200/200`"
                      :alt="post.title"
                      referrerpolicy="no-referrer"
                    />
                  </div>
                </td>
                <td>
                  <div class="table-cell-title">
                    <span>{{ post.title }}</span>
                    <p class="table-cell-subtext">{{ post.summary || 'Chưa có mô tả ngắn' }}</p>
                  </div>
                </td>
                <td>
                  <span :class="['badge', post.status === 'published' ? 'badge-active' : 'badge-inactive']">
                    {{ post.status === 'published' ? 'Đã đăng' : 'Bản nháp' }}
                  </span>
                </td>
                <td><span class="table-cell-subtext">{{ formatDate(post.published_at || post.created_at) }}</span></td>
                <td class="table-actions">
                  <button
                    type="button"
                    class="btn btn-secondary-inline"
                    title="Sửa bài viết"
                    @click="goToEdit(post.id)"
                  >
                    Sửa
                  </button>
                  <button class="btn btn-danger-inline" title="Xóa bài viết" @click="deleteTarget = post">
                    Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Crawl Modal -->
    <Teleport to="body">
      <div v-if="showCrawlModal" class="modal-overlay" @click.self="showCrawlModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h2>Crawl bài viết từ URL</h2>
            <button class="close-btn" @click="showCrawlModal = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <p class="text-sub mb-3">Nhập URL bài viết bạn muốn crawl vào trình biên tập:</p>
            <input
              v-model="crawlUrl"
              type="url"
              placeholder="https://example.com/article"
              class="field-input"
              @keydown.enter="submitCrawl"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost btn-sm" @click="showCrawlModal = false">Hủy</button>
            <button class="btn btn-primary btn-sm" :disabled="!crawlUrl.trim()" @click="submitCrawl">
              Bắt đầu crawl
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal-card modal-card--sm">
          <div class="modal-body text-center">
            <div class="modal-icon modal-icon--danger">
              <AlertTriangle :size="24" />
            </div>
            <h3>Xóa bài viết</h3>
            <p class="text-sub">Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer modal-footer--center">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" @click="deleteTarget = null">Hủy</button>
            <button class="btn btn-danger btn-sm" style="flex: 1;" @click="executeDelete">Xác nhận xóa</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Edit, Trash2, Download, X,
  AlertTriangle, Loader2
} from 'lucide-vue-next'
import { ADMIN_TOKEN_STORAGE_KEY } from '@/views/admin/shared/constants/auth'
import {
  listAdminEntityRecords,
  deleteAdminEntityRecord,
} from '@/views/admin/shared/api/adminApi'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || ''

const posts = ref([])
const loading = ref(false)
const showCrawlModal = ref(false)
const crawlUrl = ref('')
const deleteTarget = ref(null)

async function fetchPosts() {
  loading.value = true
  try {
    const res = await listAdminEntityRecords('news_posts', token)
    posts.value = res.items || res.data || res || []
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

function goToCreate(query = {}) {
  router.push({ name: 'AdminNewsCreate', query })
}

function goToEdit(id) {
  router.push({ name: 'AdminNewsEdit', params: { id } })
}

function submitCrawl() {
  if (!crawlUrl.value.trim()) return
  goToCreate({ crawl: crawlUrl.value.trim() })
  showCrawlModal.value = false
  crawlUrl.value = ''
}


async function executeDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteAdminEntityRecord('news_posts', deleteTarget.value.id, token)
    deleteTarget.value = null
    await fetchPosts()
  } catch (err) {
    alert('Không thể xóa bài viết: ' + err.message)
  }
}

onMounted(fetchPosts)
</script>

<style scoped>
@import '@/views/admin/shared/components/AdminCoreEditor.css';

.news-mgr {
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
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.btn-secondary-inline, .btn-danger-inline {
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

.btn-secondary-inline:hover { background: #e2e8f0; }
.btn-danger-inline:hover { background: #fecaca; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  padding: 20px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; }

.modal-body { padding: 24px; }

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.field-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.text-sub { color: #64748b; font-size: 14px; }
.mb-3 { margin-bottom: 12px; }
</style>
