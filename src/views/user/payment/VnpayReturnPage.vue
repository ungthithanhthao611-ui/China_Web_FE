<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, CheckCircle2, ClipboardList, Loader2, RotateCcw, ShoppingCart } from 'lucide-vue-next'

import { buildVnpayCartRedirectMessage, verifyVnpayReturn } from '@/views/user/services/ordersApi'
import { useCartStore } from '@/views/user/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const errorMessage = ref('')
const result = ref(null)

const isSuccess = computed(() => Boolean(result.value?.success))

function buildQueryPayload() {
  const payload = {}
  Object.entries(route.query || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      payload[key] = value[0]
      return
    }
    payload[key] = value
  })
  return payload
}

async function goBackToCart() {
  await cartStore.fetchCart()
  router.replace({
    path: '/cart',
    query: {
      payment: 'cancelled',
      message: buildVnpayCartRedirectMessage(),
    },
  })
}

async function loadReturnResult() {
  loading.value = true
  errorMessage.value = ''

  try {
    result.value = await verifyVnpayReturn(buildQueryPayload())
    await cartStore.fetchCart()

    if (!result.value?.success) {
      await goBackToCart()
      return
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Không thể xác thực kết quả thanh toán VNPAY.'
  } finally {
    loading.value = false
  }
}

function goToOrderDetail() {
  if (result.value?.order_id) {
    router.push(`/orders/${result.value.order_id}`)
    return
  }
  router.push('/profile?tab=orders')
}

onMounted(() => {
  loadReturnResult()
})
</script>

<template>
  <main class="vnpay-return-page">
    <section class="vnpay-return-card">
      <div v-if="loading" class="vnpay-return-state">
        <Loader2 class="spin" :size="34" />
        <p>Đang xác thực giao dịch VNPAY...</p>
      </div>

      <div v-else-if="errorMessage" class="vnpay-return-state vnpay-return-state--error">
        <AlertCircle :size="38" />
        <h1>Xác thực thất bại</h1>
        <p>{{ errorMessage }}</p>
        <button type="button" class="vnpay-return-button vnpay-return-button--secondary" @click="loadReturnResult">
          <RotateCcw :size="18" />
          <span>THỬ LẠI</span>
        </button>
      </div>

      <div v-else class="vnpay-return-state" :class="isSuccess ? 'vnpay-return-state--success' : 'vnpay-return-state--error'">
        <CheckCircle2 v-if="isSuccess" :size="42" />
        <AlertCircle v-else :size="42" />
        <h1>{{ isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa thành công' }}</h1>
        <p>{{ result?.message }}</p>

        <div class="vnpay-return-summary">
          <div>
            <span>Mã đơn hàng</span>
            <strong>{{ result?.order_code || '-' }}</strong>
          </div>
          <div>
            <span>Mã giao dịch</span>
            <strong>{{ result?.txn_ref || '-' }}</strong>
          </div>
          <div>
            <span>Mã phản hồi</span>
            <strong>{{ result?.response_code || '-' }}</strong>
          </div>
          <div>
            <span>Trạng thái thanh toán</span>
            <strong>{{ result?.payment_status || '-' }}</strong>
          </div>
        </div>

        <div class="vnpay-return-actions">
          <button type="button" class="vnpay-return-button" @click="goToOrderDetail">
            <ClipboardList :size="18" />
            <span>XEM ĐƠN HÀNG</span>
          </button>
          <button type="button" class="vnpay-return-button vnpay-return-button--secondary" @click="router.push('/cart')">
            <ShoppingCart :size="18" />
            <span>VỀ GIỎ HÀNG</span>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.vnpay-return-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top, rgba(45, 212, 191, 0.18), transparent 35%),
    linear-gradient(180deg, #f4f7fb 0%, #eef4ff 100%);
}

.vnpay-return-card {
  width: min(100%, 720px);
  border-radius: 28px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.14);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.vnpay-return-state {
  display: grid;
  gap: 18px;
  text-align: center;
  justify-items: center;
  color: #132238;
}

.vnpay-return-state h1 {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.2rem);
}

.vnpay-return-state p {
  margin: 0;
  max-width: 56ch;
  color: #516079;
}

.vnpay-return-state--success {
  color: #0f766e;
}

.vnpay-return-state--error {
  color: #b42318;
}

.vnpay-return-summary {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-top: 8px;
}

.vnpay-return-summary div {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  text-align: left;
}

.vnpay-return-summary span {
  font-size: 0.82rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.vnpay-return-summary strong {
  color: #0f172a;
  word-break: break-word;
}

.vnpay-return-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.vnpay-return-button {
  border: none;
  border-radius: 999px;
  padding: 14px 22px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #0f766e, #2563eb);
  cursor: pointer;
}

.vnpay-return-button--secondary {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.28);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
