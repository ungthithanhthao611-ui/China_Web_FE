export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const FIELD_GROUPS = {
  content: ["summary", "body", "description", "content", "message", "full_desc", "short_desc", "use_case"],
  media: ["image_id", "hero_image_id", "thumbnail_id", "media_id"],
};

export const BANNER_MEDIA_KEYWORDS = [
  "banner",
  "hero",
  "slider",
  "slide",
  "cover",
  "homepage",
];

export const MEDIA_NOISE_KEYWORDS = [
  "screenshot",
  "screen-shot",
  "screen shot",
  "capture",
  "tmp",
  "temp",
];

export const RELATION_ENTITIES = {
  language_id: "languages",
  category_id: null,
  project_id: "projects",
  branch_id: "branches",
  page_id: "pages",
  parent_id: null,
  block_id: "content_blocks",
};

export const ENTITY_MEDIA_RELATION_ENTITIES = {
  project_category: "project_categories",
  project: "projects",
};

export const ABOUT_SECTION_PREVIEW_MAP = {
  hero: "/about/company-introduction#page1",
  company_introduction: "/about/company-introduction#page2",
  chairman_speech: "/about/chairman-speech#page3",
  organization_chart: "/about/organization-chart#page4",
  corporate_culture: "/about/corporate-culture#page5",
  development_course: "/about/development-course#page6",
  leadership_care: "/about/leadership-care#page7",
};

export const ABOUT_BLOCK_SECTION_MAP = {
  hero_summary: "hero",
  intro_media: "company_introduction",
  intro_video: "company_introduction",
  intro_paragraphs: "company_introduction",
  speech_profile: "chairman_speech",
  speech_body: "chairman_speech",
  speech_signature: "chairman_speech",
  org_chart_image: "organization_chart",
  culture_purpose: "corporate_culture",
  culture_mission: "corporate_culture",
  culture_spirit: "corporate_culture",
  culture_values: "corporate_culture",
  culture_slogan: "corporate_culture",
  timeline: "development_course",
  leadership_care_gallery: "leadership_care",
};

export const ABOUT_SECTION_LABEL_MAP = {
  hero: "Page 1 - Hero đầu trang",
  company_introduction: "Page 2 - Giới thiệu công ty",
  chairman_speech: "Page 3 - Tầm Nhìn & Chiến Lược",
  organization_chart: "Page 4 - Sơ đồ tổ chức",
  corporate_culture: "Page 5 - Giá trị cốt lõi / Văn hóa",
  development_course: "Page 6 - Lịch sử phát triển",
  leadership_care: "Page 7 - Ban lãnh đạo",
};

export const ABOUT_BLOCK_LABEL_MAP = {
  hero_summary: "Page 1 - Hero: tiêu đề, mô tả, ảnh bìa",
  intro_media: "Page 2 - Ảnh/video giới thiệu công ty",
  intro_video: "Page 2 - Nút và link video giới thiệu",
  intro_paragraphs: "Page 2 - Nội dung giới thiệu công ty",
  speech_profile: "Page 3 - Ảnh lớn bên phải Tầm Nhìn & Chiến Lược",
  speech_body: "Page 3 - Văn bản Tầm Nhìn & Chiến Lược",
  speech_signature: "Page 3 - Thông tin ký/tên lãnh đạo nếu dùng",
  org_chart_image: "Page 4 - Sơ đồ tổ chức",
  culture_values: "Page 5 - Giá trị cốt lõi / Văn hóa",
  culture_slogan: "Page 5 - Slogan",
  timeline: "Page 6 - Lịch sử phát triển",
  leadership_care_gallery: "Page 7 - Hồ sơ ban lãnh đạo",
};

export const ABOUT_SECTION_OPTIONS = Object.entries(ABOUT_SECTION_LABEL_MAP).map(
  ([value, label]) => ({ value, label }),
);

export const ABOUT_BLOCK_OPTIONS = Object.entries(ABOUT_BLOCK_LABEL_MAP).map(
  ([value, label]) => ({ value, label }),
);

export const getAboutSectionFromBlockKey = (blockKey) => {
  const normalizedBlockKey = String(blockKey || "").trim().toLowerCase();
  if (!normalizedBlockKey) return "";
  return ABOUT_BLOCK_SECTION_MAP[normalizedBlockKey] || "";
};

const ABOUT_ITEM_FIELD_LABELS = {
  hero_summary: {
    headline: "Tieu de",
    description: "Noi dung chi tiet / Van ban",
    cover_image: "Hinh anh",
  },
  intro_media: {
    cover_image: "Hinh anh",
  },
  intro_video: {
    video_button: "Tieu de nut video",
    video_url: "Lien ket video",
  },
  speech_profile: {
    portrait: "Ảnh lớn bên phải section Tầm Nhìn & Chiến Lược",
  },
  speech_body: {
    vision: "Nội dung tầm nhìn",
    mission: "Nội dung chiến lược / sứ mệnh",
  },
  speech_signature: {
    sign_title: "Tieu de chu ky",
    sign_name: "Ten nguoi ky",
    signature_image: "Hinh anh chu ky",
  },
  org_chart_image: {
    main_chart: "Hinh anh",
  },
};

const ABOUT_ITEM_GLOBAL_LABEL_MAP = {
  headline: "Tieu de",
  description: "Noi dung chi tiet / Van ban",
  cover_image: "Hinh anh",
  company_introduction: "Menu dieu huong: Page 2 Gioi thieu cong ty",
  chairman_speech: "Menu điều hướng: Page 3 - Tầm Nhìn & Chiến Lược",
  organization_chart: "Menu dieu huong: Page 4 So do to chuc",
  corporate_culture: "Menu dieu huong: Page 5 Gia tri cot loi",
  development_course: "Menu dieu huong: Page 6 Lich su phat trien",
  leadership_care: "Menu dieu huong: Page 7 Ban lanh dao",
};

export const resolveAboutBlockDisplayName = (blockKey, fallback = "") => {
  const normalizedBlockKey = String(blockKey || "").trim().toLowerCase();
  if (!normalizedBlockKey) return String(fallback || "").trim();

  const knownLabel = ABOUT_BLOCK_LABEL_MAP[normalizedBlockKey];
  if (knownLabel) return knownLabel;

  return String(fallback || normalizedBlockKey).trim();
};

const parseNumericSuffix = (value, prefix) => {
  const match = String(value || "")
    .trim()
    .toLowerCase()
    .match(new RegExp(`^${prefix}_(\\d+)$`));
  return match ? Number(match[1]) : null;
};

const resolveDynamicAboutFieldLabel = (blockKey, itemKey) => {
  const normalizedBlockKey = String(blockKey || "").trim().toLowerCase();
  const normalizedItemKey = String(itemKey || "").trim().toLowerCase();

  const blockLabels = ABOUT_ITEM_FIELD_LABELS[normalizedBlockKey];
  if (blockLabels?.[normalizedItemKey]) {
    return blockLabels[normalizedItemKey];
  }

  const paragraphIndex =
    normalizedBlockKey === "intro_paragraphs"
      ? parseNumericSuffix(normalizedItemKey, "paragraph")
      : null;
  if (paragraphIndex) {
    return `Noi dung chi tiet / Van ban ${paragraphIndex}`;
  }

  const valueIndex =
    normalizedBlockKey === "culture_values"
      ? parseNumericSuffix(normalizedItemKey, "value")
      : null;
  if (valueIndex) {
    return `Gia tri cot loi ${valueIndex}`;
  }

  const sloganIndex =
    normalizedBlockKey === "culture_slogan"
      ? parseNumericSuffix(normalizedItemKey, "slogan")
      : null;
  if (sloganIndex) {
    return `Slogan ${sloganIndex}`;
  }

  const milestoneIndex =
    normalizedBlockKey === "timeline"
      ? parseNumericSuffix(normalizedItemKey, "milestone")
      : null;
  if (milestoneIndex) {
    return `Moc lich su ${milestoneIndex}`;
  }

  const leaderIndex =
    normalizedBlockKey === "leadership_care_gallery"
      ? parseNumericSuffix(normalizedItemKey, "leader")
      : null;
  if (leaderIndex) {
    return `Ho so lanh dao ${leaderIndex}`;
  }

  return ABOUT_ITEM_GLOBAL_LABEL_MAP[normalizedItemKey] || "";
};

export const resolveAboutItemDisplayName = ({
  blockKey,
  itemKey,
  title,
  includeBlockPrefix = true,
}) => {
  const normalizedBlockKey = String(blockKey || "").trim().toLowerCase();
  const normalizedItemKey = String(itemKey || "").trim().toLowerCase();
  const normalizedTitle = String(title || "").trim();

  const blockLabel = resolveAboutBlockDisplayName(normalizedBlockKey, "");
  const fieldLabel = resolveDynamicAboutFieldLabel(normalizedBlockKey, normalizedItemKey);

  if (includeBlockPrefix && blockLabel && fieldLabel) {
    return `${blockLabel} - ${fieldLabel}`;
  }

  if (fieldLabel) return fieldLabel;
  if (normalizedTitle) return normalizedTitle;
  if (normalizedItemKey) return normalizedItemKey;
  return "";
};
