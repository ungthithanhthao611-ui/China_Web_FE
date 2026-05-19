<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Mail,
  Lock,
  User,
  UserPlus,
  LogIn,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Phone,
} from 'lucide-vue-next'

import { useAuthStore } from '@/views/user/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const mode = ref(route.path.includes('register') ? 'register' : 'login')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  confirm_password: '',
  username: '',
  phone: '',
})

const touched = reactive({
  email: false,
  password: false,
  confirm_password: false,
  username: false,
  phone: false,
})

const fieldErrors = reactive({
  email: '',
  password: '',
  confirm_password: '',
  username: '',
  phone: '',
})

const isRegisterMode = computed(() => mode.value === 'register')

const safeRedirectPath = () => {
  const redirect = String(route.query.redirect || '').trim()
  return redirect.startsWith('/') ? redirect : '/'
}

function resetFieldState() {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = ''
  })

  Object.keys(touched).forEach((key) => {
    touched[key] = false
  })
}

function resetForm() {
  form.email = ''
  form.password = ''
  form.confirm_password = ''
  form.username = ''
  form.phone = ''
}

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
  success.value = false
  resetFieldState()
  resetForm()
  router.replace(mode.value === 'login' ? '/login' : '/register')
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

function validateEmail() {
  const value = form.email.trim()

  if (!value) return t('user.home.validationEmailRequired')

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(value)) return t('user.home.validationEmailInvalid')

  return ''
}

function validateUsername() {
  if (!isRegisterMode.value) return ''

  const value = form.username.trim()
  if (!value) return t('user.home.validationUsernameRequired')
  if (value.length < 3) return t('user.home.validationUsernameMin')

  const usernamePattern = /^[a-zA-Z0-9._-]+$/
  if (!usernamePattern.test(value)) return t('user.home.validationUsernameInvalid')

  return ''
}

function validatePhone() {
  if (!isRegisterMode.value) return ''

  const rawValue = form.phone.trim()
  const digits = normalizePhone(rawValue)

  if (!rawValue) return t('user.home.validationPhoneRequired')
  if (digits.length < 9 || digits.length > 11) return t('user.home.validationPhoneInvalid')

  return ''
}

function validatePassword() {
  const value = form.password

  if (!value) return t('user.home.validationPasswordRequired')
  if (value.length < 6) return t('user.home.validationPasswordMin')

  return ''
}

function validateConfirmPassword() {
  if (!isRegisterMode.value) return ''

  const value = form.confirm_password
  if (!value) return t('user.home.validationConfirmPasswordRequired')
  if (value !== form.password) return t('user.home.passwordMismatch')

  return ''
}

function validateField(fieldName) {
  const validators = {
    email: validateEmail,
    username: validateUsername,
    phone: validatePhone,
    password: validatePassword,
    confirm_password: validateConfirmPassword,
  }

  const validator = validators[fieldName]
  const nextError = validator ? validator() : ''
  fieldErrors[fieldName] = nextError
  return !nextError
}

function markVisibleFieldsTouched() {
  touched.email = true
  touched.password = true

  if (isRegisterMode.value) {
    touched.username = true
    touched.phone = true
    touched.confirm_password = true
  }
}

function validateForm() {
  markVisibleFieldsTouched()

  const fields = isRegisterMode.value
    ? ['email', 'username', 'phone', 'password', 'confirm_password']
    : ['email', 'password']

  const results = fields.map((field) => validateField(field))
  return results.every(Boolean)
}

function handleBlur(fieldName) {
  touched[fieldName] = true
  validateField(fieldName)

  if (fieldName === 'password' && isRegisterMode.value && touched.confirm_password) {
    validateField('confirm_password')
  }
}

function handleInput(fieldName) {
  error.value = ''

  if (fieldName === 'phone') {
    form.phone = form.phone.replace(/[^\d+\s()-]/g, '')
  }

  if (touched[fieldName] || fieldErrors[fieldName]) {
    validateField(fieldName)
  }

  if (fieldName === 'password' && isRegisterMode.value && touched.confirm_password) {
    validateField('confirm_password')
  }
}

function applyServerError(message) {
  const normalizedMessage = String(message || '').toLowerCase()
  let matchedInline = false

  if (normalizedMessage.includes('email')) {
    fieldErrors.email = message
    touched.email = true
    matchedInline = true
  }

  if (
    normalizedMessage.includes('username') ||
    normalizedMessage.includes('user name') ||
    normalizedMessage.includes('tên đăng nhập')
  ) {
    fieldErrors.username = message
    touched.username = true
    matchedInline = true
  }

  if (normalizedMessage.includes('phone') || normalizedMessage.includes('số điện thoại')) {
    fieldErrors.phone = message
    touched.phone = true
    matchedInline = true
  }

  if (normalizedMessage.includes('password') || normalizedMessage.includes('mật khẩu')) {
    fieldErrors.password = message
    touched.password = true
    matchedInline = true
  }

  return matchedInline
}

const handleSubmit = async () => {
  error.value = ''

  if (!validateForm()) return

  loading.value = true

  try {
    if (mode.value === 'login') {
      await authStore.login({
        email: form.email.trim(),
        password: form.password,
      })

      success.value = true
      const redirectPath = safeRedirectPath()

      setTimeout(() => {
        router.push(redirectPath)
      }, 1500)

      return
    }

    await authStore.register({
      email: form.email.trim(),
      password: form.password,
      username: form.username.trim(),
      phone: normalizePhone(form.phone),
    })

    success.value = true

    setTimeout(() => {
      mode.value = 'login'
      success.value = false
      resetFieldState()
      resetForm()
      router.replace('/login')
    }, 2000)
  } catch (err) {
    const message =
      err?.message || (mode.value === 'login' ? t('user.home.loginError') : t('user.home.registerError'))

    const hasInlineError = applyServerError(message)
    error.value = hasInlineError ? t('user.home.validationReviewForm') : message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push(safeRedirectPath())
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <router-link to="/" class="back-home">
        <ArrowLeft :size="20" />
        <span>{{ t('user.home.home') }}</span>
      </router-link>

      <div class="auth-card">
        <div class="auth-visual">
          <div class="visual-content">
            <h1>{{ t('user.home.brandPrimary') }} {{ t('user.home.brandSecondary') }}</h1>
            <p>{{ t('user.about.sloganText') }}</p>
          </div>
          <div class="visual-overlay"></div>
        </div>

        <div class="auth-form-side">
          <div class="auth-header">
            <div class="icon-box">
              <LogIn v-if="mode === 'login'" :size="32" />
              <UserPlus v-else :size="32" />
            </div>
            <h2>{{ mode === 'login' ? t('user.home.login') : t('user.home.register') }}</h2>
            <p>{{ mode === 'login' ? t('user.home.loginWelcome') : t('user.home.registerWelcome') }}</p>
          </div>

          <div v-if="success" class="success-message">
            <CheckCircle2 :size="64" color="#d6b074" />
            <h3>{{ mode === 'login' ? t('user.home.loginSuccess') : t('user.home.registerSuccess') }}</h3>
            <p>{{ t('user.home.waitMoment') }}</p>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="form-content" novalidate>
            <div v-if="error" class="error-alert">
              <AlertCircle :size="18" />
              <span>{{ error }}</span>
            </div>

            <div class="form-group">
              <label for="register-email">{{ t('user.home.email') }}</label>
              <div class="input-wrapper" :class="{ 'is-invalid': fieldErrors.email && touched.email }">
                <Mail :size="18" class="input-icon" />
                <input
                  id="register-email"
                  v-model="form.email"
                  type="email"
                  :placeholder="t('user.home.email')"
                  :aria-invalid="Boolean(fieldErrors.email && touched.email)"
                  @blur="handleBlur('email')"
                  @input="handleInput('email')"
                />
              </div>
              <p v-if="fieldErrors.email && touched.email" class="field-error">{{ fieldErrors.email }}</p>
            </div>

            <div v-if="mode === 'register'" class="form-group">
              <label for="register-username">{{ t('user.home.username') }}</label>
              <div class="input-wrapper" :class="{ 'is-invalid': fieldErrors.username && touched.username }">
                <User :size="18" class="input-icon" />
                <input
                  id="register-username"
                  v-model="form.username"
                  type="text"
                  :placeholder="t('user.home.username')"
                  :aria-invalid="Boolean(fieldErrors.username && touched.username)"
                  @blur="handleBlur('username')"
                  @input="handleInput('username')"
                />
              </div>
              <p v-if="fieldErrors.username && touched.username" class="field-error">{{ fieldErrors.username }}</p>
            </div>

            <div v-if="mode === 'register'" class="form-group">
              <label for="register-phone">{{ t('user.home.phone') }}</label>
              <div class="input-wrapper" :class="{ 'is-invalid': fieldErrors.phone && touched.phone }">
                <Phone :size="18" class="input-icon" />
                <input
                  id="register-phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="numeric"
                  :placeholder="t('user.home.phone')"
                  :aria-invalid="Boolean(fieldErrors.phone && touched.phone)"
                  @blur="handleBlur('phone')"
                  @input="handleInput('phone')"
                />
              </div>
              <p v-if="fieldErrors.phone && touched.phone" class="field-error">{{ fieldErrors.phone }}</p>
            </div>

            <div class="form-group">
              <label for="register-password">{{ t('user.home.password') }}</label>
              <div class="input-wrapper" :class="{ 'is-invalid': fieldErrors.password && touched.password }">
                <Lock :size="18" class="input-icon" />
                <input
                  id="register-password"
                  v-model="form.password"
                  type="password"
                  :placeholder="t('user.home.password')"
                  :aria-invalid="Boolean(fieldErrors.password && touched.password)"
                  @blur="handleBlur('password')"
                  @input="handleInput('password')"
                />
              </div>
              <p v-if="fieldErrors.password && touched.password" class="field-error">{{ fieldErrors.password }}</p>
            </div>

            <div v-if="mode === 'register'" class="form-group">
              <label for="register-confirm-password">{{ t('user.home.confirmPassword') }}</label>
              <div
                class="input-wrapper"
                :class="{ 'is-invalid': fieldErrors.confirm_password && touched.confirm_password }"
              >
                <Lock :size="18" class="input-icon" />
                <input
                  id="register-confirm-password"
                  v-model="form.confirm_password"
                  type="password"
                  :placeholder="t('user.home.confirmPassword')"
                  :aria-invalid="Boolean(fieldErrors.confirm_password && touched.confirm_password)"
                  @blur="handleBlur('confirm_password')"
                  @input="handleInput('confirm_password')"
                />
              </div>
              <p v-if="fieldErrors.confirm_password && touched.confirm_password" class="field-error">
                {{ fieldErrors.confirm_password }}
              </p>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <Loader2 v-if="loading" class="spinner" :size="20" />
              <span v-else>{{ mode === 'login' ? t('user.home.login') : t('user.home.register') }}</span>
            </button>

            <div class="auth-footer">
              <p v-if="mode === 'login'">
                {{ t('user.home.noAccount') }}
                <button type="button" @click="toggleMode" class="switch-link">{{ t('user.home.registerNow') }}</button>
              </p>
              <p v-else>
                {{ t('user.home.haveAccount') }}
                <button type="button" @click="toggleMode" class="switch-link">{{ t('user.home.loginNow') }}</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-page {
  min-height: 100svh;
  background: #060b1a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: calc(var(--site-header-offset) + 20px);
  font-family: 'Inter', sans-serif;
}

.auth-container {
  width: 100%;
  max-width: 1100px;
  position: relative;
}

.back-home {
  position: absolute;
  top: -48px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(230, 220, 201, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;

  &:hover {
    color: #d6b074;
  }
}

.auth-card {
  background: #0c1831;
  border-radius: 32px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(214, 176, 116, 0.1);
  min-height: 640px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.auth-visual {
  position: relative;
  background: url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
  display: flex;
  align-items: flex-end;
  padding: 60px;

  @media (max-width: 992px) {
    display: none;
  }

  .visual-content {
    position: relative;
    z-index: 2;

    h1 {
      color: #fff;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: 2px;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      letter-spacing: 1px;
    }
  }

  .visual-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(12, 24, 49, 0.95), transparent);
    z-index: 1;
  }
}

.auth-form-side {
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 576px) {
    padding: 40px 24px;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;

  .icon-box {
    width: 64px;
    height: 64px;
    background: rgba(214, 176, 116, 0.1);
    color: #d6b074;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  h2 {
    font-size: 28px;
    color: #f5efe2;
    margin-bottom: 8px;
    font-weight: 700;
  }

  p {
    color: rgba(230, 220, 201, 0.5);
    font-size: 15px;
  }
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 14px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(230, 220, 201, 0.7);
    padding-left: 4px;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 18px;
    color: rgba(230, 220, 201, 0.3);
    transition: color 0.2s ease;
  }

  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(214, 176, 116, 0.15);
    border-radius: 14px;
    padding: 16px 16px 16px 52px;
    color: #f5efe2;
    font-size: 15px;
    transition: all 0.2s ease;

    &::placeholder {
      color: rgba(230, 220, 201, 0.28);
    }

    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.05);
      border-color: #d6b074;
      box-shadow: 0 0 0 4px rgba(214, 176, 116, 0.1);
    }
  }

  &.is-invalid {
    .input-icon {
      color: #f87171;
    }

    input {
      border-color: rgba(248, 113, 113, 0.9);
      box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.12);
      background: rgba(127, 29, 29, 0.12);
    }
  }
}

.field-error {
  margin: 0;
  padding-left: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: #f87171;
}

.submit-btn {
  margin-top: 12px;
  background: #d6b074;
  color: #0c1831;
  border: none;
  border-radius: 14px;
  padding: 18px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(214, 176, 116, 0.25);
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.auth-footer {
  text-align: center;
  margin-top: 8px;

  p {
    color: rgba(230, 220, 201, 0.5);
    font-size: 15px;
  }

  .switch-link {
    background: none;
    border: none;
    color: #d6b074;
    font-weight: 700;
    cursor: pointer;
    padding: 0 4px;
    text-decoration: underline;
    text-underline-offset: 4px;

    &:hover {
      filter: brightness(1.2);
    }
  }
}

.success-message {
  text-align: center;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  h3 {
    color: #f5efe2;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    color: rgba(230, 220, 201, 0.5);
  }
}

.spinner {
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
