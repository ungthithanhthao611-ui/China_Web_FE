<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  formOpen: {
    type: Boolean,
    required: true,
  },
  entityKey: {
    type: String,
    required: true,
  },
  inlineEditorRef: {
    type: Object,
    default: null,
  },
  isFormModalEntity: {
    type: Boolean,
    required: true,
  },
  showInlineEditor: {
    type: Boolean,
    required: true,
  },
  inlineEditorPlacement: {
    type: String,
    required: true,
  },
  formMode: {
    type: String,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  formErrors: {
    type: Array,
    required: true,
  },
  hasMediaFields: {
    type: Boolean,
    required: true,
  },
  isVideosEntity: {
    type: Boolean,
    required: true,
  },
  isProductsEntity: {
    type: Boolean,
    default: false,
  },
  isBannerEntity: {
    type: Boolean,
    required: true,
  },
  uploadTargetField: {
    type: String,
    required: true,
  },
  mediaFieldOptions: {
    type: Array,
    required: true,
  },
  fieldLabel: {
    type: Function,
    required: true,
  },
  mediaUploadAccept: {
    type: Function,
    required: true,
  },
  uploadTitle: {
    type: String,
    required: true,
  },
  uploadAltText: {
    type: String,
    required: true,
  },
  uploading: {
    type: Boolean,
    required: true,
  },
  uploadFileName: {
    type: String,
    default: "",
  },
  uploadFileExists: {
    type: Boolean,
    default: false,
  },
  visibleFormFields: {
    type: Array,
    required: true,
  },
  isTextarea: {
    type: Function,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  isBooleanField: {
    type: Function,
    required: true,
  },
  fieldHelpText: {
    type: Function,
    required: true,
  },
  mediaOptions: {
    type: Array,
    required: true,
  },
  selectedMediaPreviewUrl: {
    type: Function,
    required: true,
  },
  selectedMediaAsset: {
    type: Function,
    required: true,
  },
  selectedMediaLabel: {
    type: Function,
    required: true,
  },
  isVideoMediaRecord: {
    type: Function,
    required: true,
  },
  relationOptions: {
    type: Object,
    required: true,
  },
  relationSelectValue: {
    type: Function,
    required: true,
  },
  isSelectField: {
    type: Function,
    required: true,
  },
  selectOptions: {
    type: Function,
    required: true,
  },
  fieldPlaceholder: {
    type: Function,
    required: true,
  },
  inputType: {
    type: Function,
    required: true,
  },
  videoUploading: {
    type: Boolean,
    required: true,
  },
  videoUploadFile: {
    type: Object,
    default: null,
  },
  videoLibraryOptions: {
    type: Array,
    required: true,
  },
  isAllowedVideoUrl: {
    type: Function,
    required: true,
  },
  videoUrlHint: {
    type: Function,
    required: true,
  },
  isDirectVideoFile: {
    type: Function,
    required: true,
  },
  resolveMediaUrl: {
    type: Function,
    required: true,
  },
  selectedRelationSummary: {
    type: Function,
    required: true,
  },
  relationPreviewPath: {
    type: Function,
    required: true,
  },
  relationPreviewLabel: {
    type: Function,
    required: true,
  },
  editingRecordId: {
    type: [String, Number, null],
    default: null,
  },
  bannerDisplayTitle: {
    type: Function,
    required: true,
  },
  bannerTypeLabel: {
    type: Function,
    required: true,
  },
  bannerOrdinal: {
    type: Function,
    required: true,
  },
  canAdjustBannerFocus: {
    type: Function,
    required: true,
  },
  bannerFocusDragging: {
    type: Boolean,
    required: true,
  },
  bannerMediaUrl: {
    type: Function,
    required: true,
  },
  bannerFormMediaRecord: {
    type: Function,
    required: true,
  },
  bannerMediaAlt: {
    type: Function,
    required: true,
  },
  bannerFormImageStyle: {
    type: Function,
    required: true,
  },
  bannerFocusIndicatorStyle: {
    type: Function,
    required: true,
  },
  previewMediaOptions: {
    type: Array,
    required: true,
  },
  isImageMedia: {
    type: Function,
    required: true,
  },
  currentFormPreviewUrl: {
    type: Function,
    required: true,
  },
  saving: {
    type: Boolean,
    required: true,
  },
  fieldGroups: {
    type: Object,
    required: true,
  },
  productInlineUploading: {
    type: String,
    default: "",
  },
  galleryUploadProgress: {
    type: String,
    default: "",
  },
});

const { locale, t } = useI18n();

const emit = defineEmits([
  "close",
  "submit",
  "file-change",
  "video-file-change",
  "upload-media",
  "upload-video",
  "update:uploadTargetField",
  "update:uploadTitle",
  "update:uploadAltText",
  "update:field",
  "update:relation-field",
  "slug-input",
  "slug-source-input",
  "video-library-select",
  "reset-banner-focus",
  "banner-focus-start",
  "banner-focus-move",
  "banner-focus-stop",
  "inline-upload",
  "remove-gallery-url",
  "auto-translate",
]);

function handleInlineFile(field, event) {
  const files = event?.target?.files;
  if (files && files.length) {
    emit("inline-upload", field, files);
    event.target.value = "";
  }
}

const isProductInlineUploadField = (field) =>
  props.isProductsEntity && (field === "image_url" || field === "gallery_urls");

const galleryUrlList = computed(() => {
  const raw = String(props.form?.gallery_urls || "");
  return raw
    .replace(/\r/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
});

const quickPreviewOpen = ref(true);

const safeConfigLabel = computed(() => {
  const labelKey = props.config?.label || "Bản ghi";
  const translated = t(labelKey);
  return translated !== labelKey ? translated : labelKey;
});
const isOrdersEntity = computed(() => props.entityKey === "orders");
const orderEditableFields = computed(() => ["status", "payment_status", "note"]);
const orderReadonlyFields = computed(() => {
  const editable = new Set(orderEditableFields.value);
  return props.visibleFormFields.filter((field) => !editable.has(field));
});
const orderStatusField = computed(() =>
  props.visibleFormFields.includes("status") ? "status" : "",
);
const orderPaymentStatusField = computed(() =>
  props.visibleFormFields.includes("payment_status") ? "payment_status" : "",
);
const orderNoteField = computed(() =>
  props.visibleFormFields.includes("note") ? "note" : "",
);
const formatMoney = (value, currency = "VND") => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};
const formatOrderDateTime = (value) => {
  if (!value) return "-";
  const text = String(value).replace("T", " ");
  return text.includes(".") ? text.split(".")[0] : text.slice(0, 19);
};
const orderFieldValue = (field) => {
  const value = props.form?.[field];
  if (
    field === "total_amount" ||
    field === "subtotal_amount" ||
    field === "shipping_fee" ||
    field === "discount_amount"
  ) {
    return formatMoney(value, props.form?.currency || "VND");
  }
  if (field === "item_count") {
    const count = Number(value || 0);
    return `${count} ${t('admin.common.editor.product')}`;
  }
  if (field === "created_at" || field === "updated_at" || field === "placed_at") {
    return formatOrderDateTime(value);
  }
  return value === null || value === undefined || String(value).trim() === "" ? "-" : String(value);
};
const orderItems = computed(() =>
  Array.isArray(props.form?.items) ? props.form.items : [],
);
const orderHasItems = computed(() => orderItems.value.length > 0);
const orderCustomerContact = computed(() => {
  const values = [props.form?.customer_phone, props.form?.customer_email]
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  return values.length ? values.join(" • ") : t('admin.common.no_data');
});
const orderAddressSummary = computed(() => {
  const address = String(props.form?.shipping_address || "").trim();
  return address || t('admin.common.no_data');
});
const orderStatusText = computed(() => {
  const value = String(props.form?.status || "").trim();
  if (!value) return t('admin.common.no_data');
  const key = `admin.entities.orders.status_options.${value}`;
  const translated = t(key);
  return translated !== key ? translated : value;
});
const orderPaymentStatusText = computed(() => {
  const value = String(props.form?.payment_status || "").trim();
  if (!value) return t('admin.common.no_data');
  const key = `admin.entities.orders.payment_status_options.${value}`;
  const translated = t(key);
  return translated !== key ? translated : value;
});
const orderPaymentMethodText = computed(() => {
  const value = String(props.form?.payment_method || "").trim();
  if (!value) return t('admin.common.no_data');
  const key = `admin.entities.orders.payment_method_options.${value}`;
  const translated = t(key);
  return translated !== key ? translated : value;
});
const orderStatusTone = computed(() => {
  const value = String(props.form?.status || "").trim().toLowerCase();
  if (value === "delivered") return "is-success";
  if (value === "cancelled") return "is-danger";
  if (["confirmed", "processing", "shipping"].includes(value)) return "is-info";
  return "is-warning";
});
const orderPaymentTone = computed(() => {
  const value = String(props.form?.payment_status || "").trim().toLowerCase();
  if (value === "paid") return "is-success";
  if (value === "refunded") return "is-danger";
  return "is-warning";
});
const orderHeroTitle = computed(
  () => String(props.form?.code || `ORD-${editingRecordId || "--"}`).trim(),
);
const orderHeroPlacedAt = computed(() => {
  if (!props.form?.placed_at) return t('admin.common.no_data');
  return new Date(props.form.placed_at).toLocaleString(locale.value);
});
const orderCustomerNameText = computed(() => orderFieldValue("customer_name"));
const orderCustomerEmailText = computed(() => orderFieldValue("customer_email"));
const orderCustomerPhoneText = computed(() => orderFieldValue("customer_phone"));
const orderNoteSummary = computed(() => {
  const note = String(props.form?.note || "").trim();
  return note || t('admin.entities.orders.fields.no_note');
});
const orderSubtotalText = computed(() =>
  formatMoney(props.form?.subtotal_amount, props.form?.currency || "VND"),
);
const orderShippingText = computed(() =>
  formatMoney(props.form?.shipping_fee, props.form?.currency || "VND"),
);
const orderDiscountText = computed(() =>
  formatMoney(props.form?.discount_amount, props.form?.currency || "VND"),
);
const orderTotalText = computed(() =>
  formatMoney(props.form?.total_amount, props.form?.currency || "VND"),
);
const orderSummaryCards = computed(() => [
  {
    key: "total_amount",
    label: t('admin.entities.orders.fields.total_amount'),
    value: orderTotalText.value,
    icon: "💳",
  },
  {
    key: "payment_method",
    label: t('admin.entities.orders.fields.payment_method'),
    value: orderPaymentMethodText.value,
    icon: "🧾",
  },
  {
    key: "note",
    label: t('admin.entities.orders.fields.note'),
    value: orderNoteSummary.value,
    icon: "📝",
  },
]);
const orderTimeline = computed(() => {
  const placedAt = orderHeroPlacedAt.value;
  return [
    {
      key: "status",
      title: orderStatusText.value,
      time: placedAt,
      description: t('admin.entities.orders.timeline.status_desc', { status: orderStatusText.value.toLowerCase() }),
      tone: orderStatusTone.value,
    },
    {
      key: "payment",
      title: orderPaymentStatusText.value,
      time: placedAt,
      description: t('admin.entities.orders.timeline.payment_desc', { status: orderPaymentStatusText.value.toLowerCase() }),
      tone: orderPaymentTone.value,
    },
    {
      key: "created",
      title: t('admin.entities.orders.timeline.placed_title'),
      time: placedAt,
      description: t('admin.entities.orders.timeline.placed_desc'),
      tone: "is-info",
    },
  ];
});
const orderMetaRows = computed(() => [
  { key: "code", label: t('admin.entities.orders.fields.code'), value: orderHeroTitle.value },
  { key: "placed_at", label: t('admin.entities.orders.fields.placed_at'), value: orderHeroPlacedAt.value },
  { key: "order_id", label: "ID", value: `#${props.form?.id || editingRecordId || "-"}` },
  { key: "payment_method", label: t('admin.entities.orders.fields.payment_method'), value: orderPaymentMethodText.value },
  { key: "payment_status", label: t('admin.entities.orders.fields.payment_status'), value: orderPaymentStatusText.value },
  { key: "admin_note", label: t('admin.entities.orders.fields.note'), value: orderNoteSummary.value },
]);
const orderItemImage = (item) => {
  const direct = String(item?.product_image_url || "").trim();
  return direct ? props.resolveMediaUrl(direct) : "";
};
const orderItemLineTotal = (item) =>
  formatMoney(item?.line_total, props.form?.currency || "VND");
const orderItemUnitPrice = (item) =>
  formatMoney(item?.unit_price, props.form?.currency || "VND");
const optionLabelRenderer = computed(() =>
  typeof props.config?.optionLabel === "function"
    ? props.config.optionLabel
    : null,
);
const relationSearchKeyword = reactive({});

const relationOptionText = (option, field) => {
  if (typeof optionLabelRenderer.value === "function") {
    return String(optionLabelRenderer.value(option, field) || "").trim();
  }
  if (field === "product_id") {
    const name = String(option?.name || option?.title || option?.slug || `#${option?.id || ""}`).trim();
    const sku = String(option?.sku || "").trim();
    return sku ? `${name} [${sku}]` : name;
  }
  return String(
    option?.title ||
      option?.name ||
      option?.slug ||
      option?.sku ||
      option?.code ||
      `#${option?.id || ""}`,
  ).trim();
};

const relationSearchValue = (field) =>
  String(relationSearchKeyword?.[field] || "").trim();

const updateRelationSearch = (field, value) => {
  relationSearchKeyword[field] = String(value || "");
};

const isSearchableRelationField = (field) =>
  props.isVideosEntity && field === "product_id";

const filteredRelationOptions = (field) => {
  const options = Array.isArray(props.relationOptions?.[field])
    ? props.relationOptions[field]
    : [];
  const keyword = relationSearchValue(field).toLowerCase();
  if (!keyword) return options;

  return options.filter((option) => {
    const searchableText = `${option?.id || ""} ${relationOptionText(option, field)} ${option?.sku || ""} ${option?.slug || ""}`
      .toLowerCase()
      .trim();
    return searchableText.includes(keyword);
  });
};

const isContentBlockItemsEditor = computed(
  () => props.entityKey === "content_block_items",
);

const currentBlockOption = computed(() => {
  const options = Array.isArray(props.relationOptions?.block_id)
    ? props.relationOptions.block_id
    : [];
  const currentId = Number(props.form?.block_id);
  if (!Number.isFinite(currentId)) return null;
  return (
    options.find((option) => Number(option?.id) === currentId) || null
  );
});

const currentBlockKey = computed(() => {
  const block = currentBlockOption.value;
  return String(
    block?.block_key ||
      block?.key ||
      block?.slug ||
      block?.code ||
      "",
  ).trim();
});

const currentBlockLabel = computed(() => {
  const block = currentBlockOption.value;
  if (!block) return t('admin.common.editor.no_block_selected');
  return String(
    block?.title ||
      block?.name ||
      block?.label ||
      block?.block_key ||
      `#${block?.id || ""}`,
  ).trim();
});

const previewItemKey = computed(() => String(props.form?.item_key || "").trim());
const previewTitle = computed(() => String(props.form?.title || "").trim());
const previewSubtitle = computed(() => String(props.form?.subtitle || "").trim());
const previewContent = computed(() => String(props.form?.content || "").trim());
const previewLink = computed(() => String(props.form?.link || "").trim());
const previewSortOrder = computed(() =>
  Number.isFinite(Number(props.form?.sort_order))
    ? Number(props.form?.sort_order)
    : null,
);
const previewImageUrl = computed(() =>
  props.selectedMediaPreviewUrl("image_id") || "",
);

const timelineParts = computed(() => {
  const raw = previewSubtitle.value;
  const match = raw.match(/^(\d{4})(?:[-\/](\d{1,2}))?$/);
  if (!match) return { year: "", month: "" };
  const year = match[1];
  const month = match[2] ? String(match[2]).padStart(2, "0") : "";
  return { year, month };
});

const previewHasContent = computed(
  () =>
    Boolean(previewTitle.value) ||
    Boolean(previewSubtitle.value) ||
    Boolean(previewContent.value) ||
    Boolean(previewImageUrl.value) ||
    Boolean(previewLink.value),
);

const supportsTranslation = computed(() => ["products", "product_categories", "projects", "news_posts", "content_block_items"].includes(props.entityKey));
</script>

<template>
  <div
    v-if="formOpen"
    ref="inlineEditorRef"
    :class="[
      'editor-shell',
      {
        'editor-shell--modal': isFormModalEntity,
        'editor-shell--inline-top':
          showInlineEditor && inlineEditorPlacement === 'top',
      },
    ]"
    @click.self="!isFormModalEntity && emit('close')"
  >
    <aside
      :class="['editor-panel', { 'editor-panel--modal': isFormModalEntity }]"
      @click.stop
      @mousedown.stop
    >
      <div class="editor-head">
        <div class="editor-head__content">
          <div class="editor-head__badge-wrap">
            <p class="eyebrow">{{ formMode === "create" ? $t('admin.common.create') : $t('admin.common.edit') }}</p>
            <span class="editor-head__badge">{{ safeConfigLabel }}</span>
            <button
              v-if="supportsTranslation"
              type="button"
              class="btn btn-sm btn-secondary btn-translate"
              :disabled="saving"
              @click="emit('auto-translate')"
            >
              <span v-if="saving" class="spinner-tiny"></span>
              <span v-else>🪄</span>
              {{ $t('admin.about.translation.auto_translate') }}
            </button>
          </div>
          <h3>{{ formMode === "create" ? $t('admin.common.create_entity', { label: safeConfigLabel }) : $t('admin.common.edit_entity', { label: safeConfigLabel }) }}</h3>
        </div>
        <button
          type="button"
          class="icon-btn"
          aria-label="Close editor"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div v-if="formErrors.length" class="form-errors">
        <p v-for="error in formErrors" :key="error">{{ error }}</p>
      </div>

      <div v-if="hasMediaFields && !isProductsEntity" class="upload-panel-minimal">
        <div class="upload-panel-minimal__header">
          <div class="upload-panel-minimal__title">
            <span class="upload-panel-badge">{{ $t('admin.about.upload.title').toUpperCase() }}</span>
            <strong>{{ $t('admin.about.upload.title') }} Cloudinary</strong>
          </div>
        </div>

        <div class="upload-panel-grid">
          <div class="upload-panel-section">
            <div class="upload-input-group">
              <label>{{ $t('admin.common.media.target_field') }}</label>
              <select
                :value="uploadTargetField"
                class="minimal-select"
                @change="emit('update:uploadTargetField', $event.target.value)"
              >
                <option v-for="field in mediaFieldOptions" :key="field" :value="field">
                  {{ fieldLabel(field) }}
                </option>
              </select>
            </div>
            
            <div class="upload-input-group">
              <label>{{ $t('admin.common.media.select_file') }}</label>
              <div class="file-input-wrapper">
                <input 
                  type="file" 
                  :accept="mediaUploadAccept()" 
                  id="minimal-file-input"
                  @change="emit('file-change', $event)" 
                />
                <label for="minimal-file-input" class="file-input-proxy">
                  <span v-if="uploadFileName">{{ uploadFileName }}</span>
                  <span v-else>{{ $t('admin.common.media.click_to_select') }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="upload-panel-section">
            <div class="upload-input-row">
              <div class="upload-input-group">
                <label>{{ $t('admin.common.media.media_title_optional') }}</label>
                <input
                  :value="uploadTitle"
                  type="text"
                  :placeholder="$t('admin.common.media.media_title_placeholder')"
                  @input="emit('update:uploadTitle', $event.target.value)"
                />
              </div>
              <div class="upload-input-group">
                <label>{{ $t('admin.common.media.alt_text_seo') }}</label>
                <input
                  :value="uploadAltText"
                  type="text"
                  :placeholder="$t('admin.common.media.alt_text_placeholder')"
                  @input="emit('update:uploadAltText', $event.target.value)"
                />
              </div>
            </div>

            <button
              type="button"
              class="btn btn-primary btn-sm"
              style="width: 100%; margin-top: 12px;"
              :disabled="uploading || !uploadFileExists"
              @click="emit('upload-media')"
            >
              <div v-if="uploading" class="spinner-tiny"></div>
              <span>{{ uploading ? $t('admin.about.upload.uploading') : $t('admin.about.upload.upload_btn') }}</span>
            </button>
          </div>
        </div>
      </div>

      <form class="dynamic-form" @submit.prevent="emit('submit')">
        <section v-if="isOrdersEntity" class="order-editor-detail">
          <div class="order-editor-breadcrumbs">
            <span>Dashboard</span>
            <span>/</span>
            <span>{{ $t('admin.entities.orders.label') }}</span>
            <span>/</span>
            <strong>{{ $t('admin.entities.orders.detail_title') }}</strong>
          </div>

          <div class="order-editor-topbar">
            <div class="order-editor-topbar__main">
              <p class="order-editor-kicker">{{ $t('admin.entities.orders.detail_title') }}</p>
              <h4>{{ orderHeroTitle }}</h4>
              <p class="order-editor-topbar__time">🗓️ {{ $t('admin.entities.orders.fields.placed_at') }}: {{ orderHeroPlacedAt }}</p>
            </div>
            <div class="order-editor-topbar__status">
              <span>{{ $t('admin.entities.orders.fields.status') }}</span>
              <strong :class="['order-editor-status-chip', orderStatusTone]">
                {{ orderStatusText }}
              </strong>
            </div>
          </div>

          <div class="order-editor-summary-strip">
            <article
              v-for="card in orderSummaryCards"
              :key="card.key"
              class="order-editor-summary-card"
            >
              <div class="order-editor-summary-card__icon">{{ card.icon }}</div>
              <div class="order-editor-summary-card__content">
                <span>{{ card.label }}</span>
                <strong>{{ card.value }}</strong>
              </div>
            </article>
          </div>

          <div class="order-editor-dashboard-grid">
            <article class="order-editor-card order-editor-card--customer">
              <div class="order-editor-card__head order-editor-card__head--icon">
                <strong>👤 {{ $t('admin.entities.orders.customer_info') }}</strong>
              </div>
              <div class="order-editor-profile-list">
                <div class="order-editor-profile-row">
                  <span>{{ $t('admin.entities.orders.fields.customer_name') }}</span>
                  <strong>{{ orderCustomerNameText }}</strong>
                </div>
                <div class="order-editor-profile-row">
                  <span>{{ $t('admin.entities.orders.fields.customer_phone') }}</span>
                  <strong>{{ orderCustomerPhoneText }}</strong>
                </div>
                <div class="order-editor-profile-row">
                  <span>{{ $t('admin.entities.orders.fields.customer_email') }}</span>
                  <strong>{{ orderCustomerEmailText }}</strong>
                </div>
                <div class="order-editor-profile-row">
                  <span>{{ $t('admin.entities.orders.fields.shipping_address') }}</span>
                  <strong>{{ orderAddressSummary }}</strong>
                </div>
              </div>
            </article>

            <article class="order-editor-card order-editor-card--products">
              <div class="order-editor-card__head order-editor-card__head--icon">
                <strong>📦 {{ $t('admin.entities.orders.ordered_products') }}</strong>
              </div>

              <div v-if="orderHasItems" class="order-editor-table-wrap">
                <div class="order-editor-table order-editor-table--head">
                  <span>{{ $t('admin.entities.orders.fields.product') }}</span>
                  <span>{{ $t('admin.entities.orders.fields.unit_price') }}</span>
                  <span>{{ $t('admin.entities.orders.fields.quantity') }}</span>
                  <span>{{ $t('admin.entities.orders.fields.subtotal_amount') }}</span>
                </div>

                <article
                  v-for="(item, index) in orderItems"
                  :key="`${item.product_id || 'item'}-${index}`"
                  class="order-editor-table order-editor-table--row"
                >
                  <div class="order-editor-product-cell">
                    <div class="order-editor-product-thumb">
                      <img
                        v-if="orderItemImage(item)"
                        :src="orderItemImage(item)"
                        :alt="item.product_name || `${$t('admin.common.editor.product')} ${index + 1}`"
                        loading="lazy"
                      />
                      <div v-else class="order-editor-product-thumb__placeholder">
                        SP
                      </div>
                    </div>
                    <div class="order-editor-product-copy">
                      <strong>{{ item.product_name || `${$t('admin.entities.products.label')} #${index + 1}` }}</strong>
                      <small>SKU: {{ item.product_sku || $t('admin.entities.products.fields.no_sku') }}</small>
                    </div>
                  </div>
                  <strong>{{ orderItemUnitPrice(item) }}</strong>
                  <strong>{{ item.quantity || 0 }}</strong>
                  <strong class="order-editor-amount--primary">{{ orderItemLineTotal(item) }}</strong>
                </article>

                <div class="order-editor-totals">
                  <div>
                    <span>{{ $t('admin.entities.orders.fields.subtotal_amount') }}</span>
                    <strong>{{ orderSubtotalText }}</strong>
                  </div>
                  <div v-if="Number(form.discount_amount || 0) > 0">
                    <span>{{ $t('admin.entities.orders.fields.discount_amount') }}</span>
                    <strong>{{ orderDiscountText }}</strong>
                  </div>
                  <div class="order-editor-totals__grand">
                    <span>{{ $t('admin.entities.orders.fields.total_amount') }}</span>
                    <strong>{{ orderTotalText }}</strong>
                  </div>
                </div>
              </div>
              <p v-else class="order-editor-empty">{{ $t('admin.entities.orders.no_items_data') }}</p>
            </article>

            <article class="order-editor-card order-editor-card--timeline">
              <div class="order-editor-card__head order-editor-card__head--icon">
                <strong>🕘 {{ $t('admin.entities.orders.order_history') }}</strong>
              </div>
              <div class="order-editor-timeline">
                <div
                  v-for="(item, index) in orderTimeline"
                  :key="item.key"
                  class="order-editor-timeline__item"
                >
                  <div :class="['order-editor-timeline__dot', item.tone]"></div>
                  <div
                    v-if="index < orderTimeline.length - 1"
                    class="order-editor-timeline__line"
                  ></div>
                  <div class="order-editor-timeline__content">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.time }}</small>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </article>

            <article class="order-editor-card order-editor-card--meta">
              <div class="order-editor-card__head order-editor-card__head--icon">
                <strong>📋 {{ $t('admin.entities.orders.additional_info') }}</strong>
              </div>
              <div class="order-editor-meta-list">
                <div
                  v-for="row in orderMetaRows"
                  :key="row.key"
                  class="order-editor-meta-row"
                >
                  <span>{{ row.label }}</span>
                  <strong>{{ row.value }}</strong>
                </div>
              </div>
            </article>
          </div>

          <article class="order-editor-card order-editor-card--full order-editor-card--actions">
            <div class="order-editor-card__head order-editor-card__head--icon">
              <strong>⚙️ {{ $t('admin.entities.orders.update_status_title') }}</strong>
              <small>
                {{ $t('admin.entities.orders.update_status_desc') }}
              </small>
            </div>
            <div class="order-editor-actions-grid">
              <label v-if="orderStatusField" class="editor-field order-editor-field-shell">
                <span>{{ fieldLabel(orderStatusField) }}</span>
                <select
                  :value="form[orderStatusField]"
                  @change="emit('update:field', orderStatusField, $event.target.value)"
                >
                  <option value="">None</option>
                  <option
                    v-for="option in selectOptions(orderStatusField)"
                    :key="typeof option === 'string' ? option : option.value"
                    :value="typeof option === 'string' ? option : option.value"
                  >
                    {{ typeof option === 'string' ? option : option.label }}
                  </option>
                </select>
                <small v-if="fieldHelpText(orderStatusField)" class="field-help">{{ fieldHelpText(orderStatusField) }}</small>
              </label>

              <label v-if="orderPaymentStatusField" class="editor-field order-editor-field-shell">
                <span>{{ fieldLabel(orderPaymentStatusField) }}</span>
                <select
                  :value="form[orderPaymentStatusField]"
                  @change="emit('update:field', orderPaymentStatusField, $event.target.value)"
                >
                  <option value="">None</option>
                  <option
                    v-for="option in selectOptions(orderPaymentStatusField)"
                    :key="typeof option === 'string' ? option : option.value"
                    :value="typeof option === 'string' ? option : option.value"
                  >
                    {{ typeof option === 'string' ? option : option.label }}
                  </option>
                </select>
                <small v-if="fieldHelpText(orderPaymentStatusField)" class="field-help">{{ fieldHelpText(orderPaymentStatusField) }}</small>
              </label>

              <label v-if="orderNoteField" class="editor-field order-editor-note-field order-editor-field-shell">
                <span>{{ fieldLabel(orderNoteField) }}</span>
                <textarea
                  :value="form[orderNoteField]"
                  rows="5"
                  :placeholder="fieldPlaceholder(orderNoteField)"
                  @input="emit('update:field', orderNoteField, $event.target.value)"
                ></textarea>
                <small v-if="fieldHelpText(orderNoteField)" class="field-help">{{ fieldHelpText(orderNoteField) }}</small>
              </label>
            </div>
          </article>
        </section>

        <template v-else>
          <label
            v-for="field in visibleFormFields"
            :key="field"
            :class="[
              'editor-field',
              {
                wide:
                  isTextarea(field) ||
                  (isVideosEntity && (field === 'video_url' || field === 'thumbnail_id')),
              },
            ]"
          >
            <span>{{ fieldLabel(field) }}</span>

            <input
              v-if="isBooleanField(field)"
              :checked="Boolean(form[field])"
              type="checkbox"
              @change="emit('update:field', field, $event.target.checked)"
            />

            <div v-else-if="fieldGroups.media.includes(field)" class="field-stack">
              <select
                :value="form[field] ?? null"
                @change="emit('update:field', field, $event.target.value === 'null' ? null : Number($event.target.value))"
              >
                <option :value="'null'">No media</option>
                <option v-for="media in mediaOptions" :key="media.id" :value="media.id">
                  #{{ media.id }} - {{ media.title || media.file_name || media.url }}
                </option>
              </select>
              <small v-if="fieldHelpText(field)" class="field-help">{{ fieldHelpText(field) }}</small>
              <div v-if="selectedMediaPreviewUrl(field)" class="selected-media-preview">
                <video
                  v-if="isVideoMediaRecord(selectedMediaAsset(field))"
                  :src="selectedMediaPreviewUrl(field)"
                  muted
                  controls
                  playsinline
                  preload="metadata"
                ></video>
                <img
                  v-else
                  :src="selectedMediaPreviewUrl(field)"
                  :alt="selectedMediaLabel(field)"
                  loading="lazy"
                />
                <div>
                  <strong>{{ selectedMediaLabel(field) }}</strong>
                  <small v-if="form[field]">#{{ form[field] }}</small>
                  <small v-else>{{ $t('admin.common.editor.external_source') }}</small>
                </div>
              </div>
            </div>

            <div
              v-else-if="relationOptions[field] && isSearchableRelationField(field)"
              class="field-stack relation-combobox"
            >
              <input
                type="text"
                :value="relationSearchValue(field)"
                :placeholder="fieldPlaceholder(field) || 'Tim kiem san pham theo ten, SKU, slug...'"
                @input="updateRelationSearch(field, $event.target.value)"
              />
              <select
                :value="relationSelectValue(field)"
                @change="emit('update:relation-field', field, $event.target.value)"
              >
                <option value="">-- Chon san pham --</option>
                <option
                  v-for="option in filteredRelationOptions(field)"
                  :key="option.id"
                  :value="String(option.id)"
                >
                  #{{ option.id }} - {{ relationOptionText(option, field) }}
                </option>
              </select>
              <small
                v-if="relationSearchValue(field) && !filteredRelationOptions(field).length"
                class="field-help"
              >
                Khong tim thay san pham phu hop voi tu khoa.
              </small>
            </div>

            <select
              v-else-if="relationOptions[field]"
              :value="relationSelectValue(field)"
              @change="emit('update:relation-field', field, $event.target.value)"
            >
              <option value="">None</option>
              <option
                v-for="option in relationOptions[field]"
                :key="option.id"
                :value="String(option.id)"
              >
                <template v-if="optionLabelRenderer">
                  {{ optionLabelRenderer(option, field) }}
                </template>
                <template v-else>
                  #{{ option.id }} -
                  {{ option.title || option.name || option.slug || option.config_key || option.code }}
                </template>
              </option>
            </select>

            <select
              v-else-if="isSelectField(field)"
              :value="form[field]"
              @change="emit('update:field', field, $event.target.value)"
            >
              <option value="">None</option>
              <option
                v-for="option in selectOptions(field)"
                :key="typeof option === 'string' ? option : option.value"
                :value="typeof option === 'string' ? option : option.value"
              >
                {{ typeof option === "string" ? option : option.label }}
              </option>
            </select>

            <textarea
              v-else-if="isTextarea(field)"
              :value="form[field]"
              rows="5"
              :placeholder="fieldPlaceholder(field)"
              @input="emit('update:field', field, $event.target.value)"
            ></textarea>

            <div v-else-if="(isVideosEntity || isProductsEntity) && field === 'video_url'" class="field-stack">
              <div class="video-url-section">
                <div class="video-url-row">
                  <input
                    :value="form[field]"
                    :type="inputType(field)"
                    placeholder="https://... or select from library"
                    @input="emit('update:field', field, $event.target.value)"
                  />
                  <button
                    type="button"
                    class="btn btn-secondary"
                    :disabled="videoUploading"
                    @click="emit('upload-video')"
                  >
                    {{ videoUploading ? $t('admin.about.upload.uploading') : $t('admin.about.upload.upload_btn_short') }}
                  </button>
                </div>
                <div class="video-file-row">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,.mp4,.webm,.ogg,.mov,.m4v"
                    @change="emit('video-file-change', $event)"
                  />
                  <span class="video-file-row__name">
                    {{ videoUploadFile?.name || $t('admin.about.upload.no_file') }}
                  </span>
                </div>
                <small class="field-help">
                  {{ $t('admin.about.upload.video_hint') }}
                </small>
                <div class="video-library-select">
                  <select @change="emit('video-library-select', $event.target.value)">
                    <option value="">-- {{ $t('admin.about.upload.select_library') }} --</option>
                    <option v-for="media in videoLibraryOptions" :key="media.id" :value="media.url">
                      #{{ media.id }} - {{ media.title || media.file_name }}
                    </option>
                  </select>
                  <small v-if="videoLibraryOptions.length">
                    {{ $t('admin.about.upload.library_count', { count: videoLibraryOptions.length }) }}
                  </small>
                </div>
              </div>
              <small v-if="fieldHelpText(field)" class="field-help">{{ fieldHelpText(field) }}</small>
              <div
                v-if="form.video_url"
                class="video-url-helper"
                :class="{
                  'is-valid': isAllowedVideoUrl(form.video_url),
                  'is-invalid': !isAllowedVideoUrl(form.video_url),
                }"
              >
                <span>
                  {{ isAllowedVideoUrl(form.video_url) ? $t('admin.common.editor.valid_video') : $t('admin.common.editor.invalid_video') }}
                </span>
                <small>
                  {{ videoUrlHint(form.video_url) || $t('admin.common.editor.video_support_hint') }}
                </small>
              </div>
              <video
                v-if="isDirectVideoFile(form.video_url)"
                class="video-form-preview"
                :src="resolveMediaUrl(form.video_url)"
                muted
                controls
                playsinline
                preload="metadata"
              ></video>
              <a
                v-else-if="isAllowedVideoUrl(form.video_url)"
                class="video-form-link"
                :href="resolveMediaUrl(form.video_url)"
                target="_blank"
                rel="noreferrer noopener"
              >
                {{ $t('admin.common.editor.open_video') }}
              </a>
            </div>

            <div v-else-if="isProductInlineUploadField(field)" class="field-stack">
              <template v-if="field === 'image_url'">
                <input
                  :value="form[field]"
                  type="text"
                  :placeholder="fieldPlaceholder(field)"
                  @input="emit('update:field', field, $event.target.value)"
                />
                <div class="inline-upload-row">
                  <label :for="`inline-upload-${field}`" class="inline-upload-btn" :class="{ 'is-uploading': productInlineUploading === field }">
                    <div v-if="productInlineUploading === field" class="spinner-tiny"></div>
                    <span v-else>📁</span>
                    <span>{{ productInlineUploading === field ? $t('admin.common.editor.uploading') : $t('admin.common.editor.choose_file') }}</span>
                  </label>
                  <input
                    :id="`inline-upload-${field}`"
                    type="file"
                    accept="image/*"
                    class="inline-upload-input"
                    :disabled="!!productInlineUploading"
                    @change="handleInlineFile(field, $event)"
                  />
                </div>
                <small v-if="fieldHelpText(field)" class="field-help">{{ fieldHelpText(field) }}</small>
                <div
                  v-if="form[field] && /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(String(form[field]))"
                  class="url-image-preview"
                >
                  <img :src="resolveMediaUrl(form[field])" alt="Preview" loading="lazy" />
                </div>
              </template>

              <template v-else>
                <div class="inline-upload-row">
                  <label :for="`inline-upload-${field}`" class="inline-upload-btn" :class="{ 'is-uploading': productInlineUploading === field }">
                    <div v-if="productInlineUploading === field" class="spinner-tiny"></div>
                    <span v-else>📁</span>
                    <span v-if="productInlineUploading === field && galleryUploadProgress">{{ $t('admin.common.saving') }} {{ galleryUploadProgress }}...</span>
                    <span v-else-if="productInlineUploading === field">{{ $t('admin.common.saving') }}...</span>
                    <span v-else>{{ $t('admin.common.gallery_upload_btn') }}</span>
                  </label>
                  <input
                    :id="`inline-upload-${field}`"
                    type="file"
                    accept="image/*"
                    multiple
                    class="inline-upload-input"
                    :disabled="!!productInlineUploading"
                    @change="handleInlineFile(field, $event)"
                  />
                  <small class="gallery-count" v-if="galleryUrlList.length">{{ $t('admin.common.gallery_count', { count: galleryUrlList.length }) }}</small>
                </div>
                <small v-if="fieldHelpText(field)" class="field-help">{{ fieldHelpText(field) }}</small>

                <div v-if="galleryUrlList.length" class="gallery-preview-grid">
                  <div
                    v-for="(url, idx) in galleryUrlList"
                    :key="idx"
                    class="gallery-preview-item"
                  >
                    <video
                      v-if="isDirectVideoFile(url)"
                      :src="resolveMediaUrl(url)"
                      muted
                      playsinline
                      preload="metadata"
                    ></video>
                    <img v-else :src="resolveMediaUrl(url)" :alt="`Gallery ${idx + 1}`" loading="lazy" />
                    <button
                      type="button"
                      class="gallery-preview-remove"
                      :title="$t('admin.common.gallery_remove')"
                      @click="emit('remove-gallery-url', url)"
                    >×</button>
                    <small class="gallery-preview-idx">#{{ idx + 1 }}</small>
                  </div>
                </div>
                <div v-else class="gallery-empty-hint">{{ $t('admin.common.gallery_empty') }}</div>

                <details class="gallery-raw-toggle">
                  <summary>{{ $t('admin.common.edit_manual') }}</summary>
                  <textarea
                    :value="form[field]"
                    rows="3"
                    :placeholder="fieldPlaceholder(field)"
                    @input="emit('update:field', field, $event.target.value)"
                  ></textarea>
                </details>
              </template>
            </div>

            <input
              v-else
              :value="form[field]"
              :type="inputType(field) === 'url' ? 'text' : inputType(field)"
              :placeholder="field === 'slug' ? fieldPlaceholder(field) || 'auto-generated-from-name' : fieldPlaceholder(field)"
              @input="
                emit('update:field', field, $event.target.value);
                field === 'slug'
                  ? emit('slug-input')
                  : emit('slug-source-input', field)
              "
            />

            <div
              v-if="!isProductInlineUploadField(field) && inputType(field) === 'url' && form[field] && /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(String(form[field]))"
              class="url-image-preview"
            >
              <img :src="resolveMediaUrl(form[field])" alt="Preview" loading="lazy" />
            </div>

            <small
              v-if="!isProductInlineUploadField(field) && !fieldGroups.media.includes(field) && fieldHelpText(field)"
              class="field-help"
            >
              {{ fieldHelpText(field) }}
            </small>
            <small
              v-if="relationOptions[field] && selectedRelationSummary(field)"
              class="field-help field-help--selected"
            >
              {{ selectedRelationSummary(field) }}
            </small>
            <a
              v-if="relationOptions[field] && relationPreviewPath(field)"
              class="field-help field-help--selected"
              :href="relationPreviewPath(field)"
              target="_blank"
              rel="noreferrer noopener"
            >
              {{ relationPreviewLabel(field) }}
            </a>
          </label>
        </template>

        <div v-if="isBannerEntity" class="banner-form-preview">
          <p class="eyebrow">{{ $t('admin.common.live_preview') }}</p>
          <div class="banner-preview-card banner-preview-card--editor">
            <div
              class="banner-preview-card__media"
              :class="{
                'banner-preview-card__media--interactive': canAdjustBannerFocus(),
                'is-dragging': bannerFocusDragging,
              }"
              @pointerdown="emit('banner-focus-start', $event)"
              @pointermove="emit('banner-focus-move', $event)"
              @pointerup="emit('banner-focus-stop', $event)"
              @pointercancel="emit('banner-focus-stop', $event)"
              @pointerleave="emit('banner-focus-stop', $event)"
            >
              <video
                v-if="bannerMediaUrl(bannerFormMediaRecord()) && isVideoMediaRecord(bannerFormMediaRecord())"
                :src="bannerMediaUrl(bannerFormMediaRecord())"
                muted
                playsinline
                preload="metadata"
                autoplay
                loop
              ></video>
              <img
                v-else-if="bannerMediaUrl(bannerFormMediaRecord())"
                :src="bannerMediaUrl(bannerFormMediaRecord())"
                :alt="bannerMediaAlt(bannerFormMediaRecord())"
                :style="bannerFormImageStyle()"
                loading="lazy"
              />
              <div
                v-if="canAdjustBannerFocus()"
                class="banner-focus-indicator"
                :style="bannerFocusIndicatorStyle()"
              ></div>
              <div v-else class="banner-preview-card__empty">{{ $t('admin.common.banner_empty') }}</div>
              <div class="banner-preview-card__overlay"></div>
            </div>
            <div class="banner-preview-card__content">
              <div class="banner-preview-card__meta">
                <span>{{ bannerTypeLabel(form.banner_type) }}</span>
                <strong>{{ bannerOrdinal(form.sort_order || editingRecordId || 1) }}</strong>
              </div>
              <h4>
                {{ form.title || bannerDisplayTitle({ ...form, id: editingRecordId || 1 }) }}
              </h4>
              <p v-if="form.subtitle">{{ form.subtitle }}</p>
              <small>{{ form.button_text || form.link || "CTA text or link will appear here" }}</small>
            </div>
          </div>
          <div v-if="canAdjustBannerFocus()" class="banner-focus-tools">
            <small>{{ $t('admin.common.crop_hint') }}</small>
            <div class="banner-focus-tools__row">
              <small>
                X: {{ Math.round(form.focus_x ?? 50) }}% / Y: {{ Math.round(form.focus_y ?? 50) }}%
              </small>
              <button
                type="button"
                class="btn btn-secondary"
                @click="emit('reset-banner-focus')"
              >
                {{ $t('admin.common.center_btn') }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="!isBannerEntity && !isVideosEntity && !isProductsEntity && previewMediaOptions.length"
          class="media-preview-list"
        >
          <article v-for="media in previewMediaOptions" :key="media.id">
            <img
              v-if="isImageMedia(media)"
              :src="resolveMediaUrl(media.url)"
              :alt="media.alt_text || media.title || ''"
            />
            <video
              v-else-if="isVideoMediaRecord(media)"
              :src="resolveMediaUrl(media.url)"
              muted
              playsinline
              preload="metadata"
            ></video>
            <span v-else>{{ media.asset_type }}</span>
            <small>#{{ media.id }} {{ media.title || media.file_name }}</small>
          </article>
        </div>

        <div v-if="currentFormPreviewUrl()" class="selected-media-preview selected-media-preview--link">
          <div>
            <strong>{{ $t('admin.common.public_preview') }}</strong>
            <small>{{ currentFormPreviewUrl() }}</small>
          </div>
          <a :href="currentFormPreviewUrl()" target="_blank" rel="noreferrer noopener">
            {{ $t('admin.common.open_preview') }}
          </a>
        </div>

        <section
          v-if="isContentBlockItemsEditor"
          class="content-item-preview"
        >
          <div class="content-item-preview__head">
            <div>
              <strong>{{ $t('admin.common.quick_preview') }}</strong>
              <small>{{ $t('admin.common.quick_preview_desc') }}</small>
            </div>
            <button
              type="button"
              class="btn btn-secondary"
              @click="quickPreviewOpen = !quickPreviewOpen"
            >
              {{ quickPreviewOpen ? $t("admin.common.hide_preview") : $t("admin.common.show_preview") }}
            </button>
          </div>

          <div v-if="quickPreviewOpen" class="content-item-preview__body">
            <div class="content-item-preview__meta">
              <span>{{ $t('admin.common.editor.block') }}: {{ currentBlockLabel }}</span>
              <span v-if="currentBlockKey">{{ $t('admin.common.editor.block_key') }} {{ currentBlockKey }}</span>
              <span v-if="previewItemKey">{{ $t('admin.common.editor.item_key') }} {{ previewItemKey }}</span>
              <span v-if="previewSortOrder !== null">{{ $t('admin.common.editor.sort_order') }} {{ previewSortOrder }}</span>
            </div>

            <article v-if="previewHasContent" class="content-item-preview__card">
              <img
                v-if="previewImageUrl"
                :src="previewImageUrl"
                alt="Preview media"
                loading="lazy"
              />
              <div class="content-item-preview__content">
                <h4 v-if="previewTitle">{{ previewTitle }}</h4>
                <p v-if="previewSubtitle">{{ previewSubtitle }}</p>
                  <p
                    v-if="currentBlockKey === 'timeline' && timelineParts.year"
                    class="content-item-preview__timeline"
                  >
                    {{ $t('admin.common.timeline_mark') }}: {{ timelineParts.year }}{{ timelineParts.month ? `-${timelineParts.month}` : "" }}
                  </p>
                <p v-if="previewContent" class="content-item-preview__text">{{ previewContent }}</p>
                <a
                  v-if="previewLink"
                  :href="previewLink"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {{ previewLink }}
                </a>
              </div>
            </article>

            <p v-else class="content-item-preview__empty">
              {{ $t('admin.common.no_preview_data') }}
            </p>
          </div>
        </section>

        <div class="editor-footer">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="saving"
          @click="emit('close')"
        >
          {{ $t('admin.common.discard') }}
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="saving"
          @click="emit('submit')"
        >
          {{ saving ? $t("admin.common.saving") : $t("admin.common.save_changes") }}
        </button>
      </div>
      </form>
    </aside>
  </div>
</template>


<style scoped>
@import '@/views/admin/shared/components/AdminCoreEditor.css';
</style>


