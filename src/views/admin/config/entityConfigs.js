export const DEFAULT_STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

export const POST_STATUS_OPTIONS = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Xuất bản chính thức' },
  { value: 'archived', label: 'Lưu trữ' },
]

export const CATEGORY_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const CONTENT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export const ENTITY_MANAGER_CONFIGS = {
  pages: {
    label: 'Pages',
    eyebrow: 'CMS page records',
    description: 'Manage canonical CMS pages. For the About flow, this table should keep the single parent page record `about`, while the detailed sub-sections are managed in Page Sections and Content Blocks.',
    titleField: 'title',
    table: ['id', 'title', 'slug', 'page_type', 'status', 'language_id', 'sort_order'],
    required: ['slug', 'language_id'],
    fields: ['slug', 'title', 'summary', 'body', 'page_type', 'language_id', 'parent_id', 'status', 'meta_title', 'meta_description', 'sort_order'],
    statusOptions: CONTENT_STATUS_OPTIONS,
    defaultStatus: 'draft',
    preview: (record) => `/${record.slug}`,
    fieldLabels: {
      slug: 'Page Slug',
      title: 'Page Title',
      summary: 'Summary',
      body: 'Body Content',
      page_type: 'Page Type',
      language_id: 'Language',
      parent_id: 'Parent Page',
      status: 'Publish Status',
      meta_title: 'SEO Meta Title',
      meta_description: 'SEO Meta Description',
      sort_order: 'Display Order',
    },
    placeholders: {
      slug: 'Example: about',
      title: 'Example: About Us',
      summary: 'Short summary of the canonical page used by SEO and public API.',
      body: 'Optional long-form body content for simple standalone pages.',
      page_type: 'Example: about',
      meta_title: 'SEO title for browser tab and search result.',
      meta_description: 'Short SEO description for the selected page.',
    },
    helpText: {
      slug: 'For the About CMS currently in use, keep this record as the canonical parent slug `about`. Do not create separate page rows for company-introduction, chairman-speech, or the other About tabs.',
      page_type: 'Use a stable group name such as about, legal, or contact so frontend and reporting can filter related pages consistently.',
      parent_id: 'Usually empty for canonical top-level pages. About currently acts as the parent page, while its detailed tabs are modeled as Page Sections.',
      status: 'Only published pages should be consumed by the public API.',
      meta_title: 'Recommended for SEO. If empty, frontend may fall back to the page title.',
      meta_description: 'Recommended for SEO and social previews.',
      sort_order: 'Use 10, 20, 30... to make future reordering easier without rewriting all records.',
    },
  },
  page_sections: {
    label: 'Page Sections',
    eyebrow: 'CMS page sections',
    description: 'Manage the structural child sections inside a canonical CMS page. For About, this table should contain the 8 real sections shown on the public page: hero, company introduction, chairman\'s speech, organization chart, corporate culture, development course, leadership care, and cooperative partner.',
    titleField: 'title',
    table: ['id', 'page_id', 'title', 'anchor', 'section_type', 'sort_order'],
    required: ['page_id'],
    fields: ['page_id', 'anchor', 'title', 'content', 'image_id', 'section_type', 'sort_order'],
    preview: (record) => {
      if (record.preview_href) {
        return record.preview_href
      }

      if (record.page_slug === 'about') {
        const aboutRouteMap = {
          hero: '/about/company-introduction#page1',
          company_introduction: '/about/company-introduction#page2',
          chairman_speech: '/about/chairman-speech#page3',
          organization_chart: '/about/organization-chart#page4',
          corporate_culture: '/about/corporate-culture#page5',
          development_course: '/about/development-course#page6',
          leadership_care: '/about/leadership-care#page7',
          cooperative_partner: '/about/cooperative-partner#page8',
        }
        return aboutRouteMap[record.anchor] || '/about/company-introduction#page1'
      }

      if (record.page_slug) {
        return `/${record.page_slug}${record.anchor ? `#${record.anchor}` : ''}`
      }

      return ''
    },
    fieldLabels: {
      page_id: 'Parent Page',
      anchor: 'Section Anchor',
      title: 'Section Title',
      content: 'Section Content',
      image_id: 'Section Image',
      section_type: 'Section Type',
      sort_order: 'Display Order',
    },
    placeholders: {
      anchor: 'Example: hero, company_introduction, chairman_speech',
      title: 'Example: Company Introduction',
      content: 'Optional section-level intro text used for mapping or short summaries.',
      section_type: 'Example: hero, content, media, timeline, gallery, partners',
    },
    helpText: {
      page_id: 'Choose the canonical parent page this section belongs to. For the current About CMS, all 8 sections should belong to the single page slug `about`.',
      anchor: 'Stable technical key used by frontend mapping and route/hash sync. For About, use anchors such as hero, company_introduction, chairman_speech, organization_chart, corporate_culture, development_course, leadership_care, cooperative_partner.',
      image_id: 'Optional section-level image. Use this only when the section itself needs a representative visual; detailed content media should usually live in Content Blocks or Content Block Items.',
      section_type: 'Recommended About values: hero, content, media, timeline, gallery, partners. Keep these stable because they describe the structural role of the section, not the detailed data block.',
      sort_order: 'Use 10, 20, 30... to control render order inside the selected page. For About, this should match the public top-to-bottom sequence.',
      content: 'Use this as a short admin-facing note describing which public section this record controls. The preview link should point editors to the mapped public route for quick verification.',
    },
  },
  content_blocks: {
    label: 'Content Blocks',
    eyebrow: 'CMS block records',
    description: 'Manage reusable content blocks attached to an entity. For About CMS, blocks should attach to entity_type = page and entity_id = the selected page id.',
    titleField: 'title',
    table: ['id', 'entity_type', 'entity_id', 'block_key', 'block_type', 'sort_order'],
    required: ['entity_type', 'entity_id', 'block_key', 'block_type'],
    fields: ['entity_type', 'entity_id', 'language_id', 'block_key', 'title', 'subtitle', 'content', 'block_type', 'sort_order'],
    relationEntities: {
      entity_id: 'pages',
    },
    fieldLabels: {
      entity_type: 'Entity Type',
      entity_id: 'Entity Record ID',
      language_id: 'Language',
      block_key: 'Block Key',
      title: 'Block Title',
      subtitle: 'Block Subtitle',
      content: 'Block Content',
      block_type: 'Block Type',
      sort_order: 'Display Order',
    },
    placeholders: {
      entity_type: 'Example: page',
      entity_id: 'ID of the related page record',
      block_key: 'Example: intro_paragraphs',
      title: 'Optional block title shown in admin or frontend',
      subtitle: 'Optional block subtitle',
      content: 'Optional long-form content for this block',
      block_type: 'Example: rich_text_list, timeline, logo_grid',
    },
    helpText: {
      entity_type: 'For About CMS, lock this value to page. Do not switch between page and pages.',
      entity_id: 'Enter the id of the page record this block belongs to. Current schema links blocks directly to the page, not to page_sections.',
      block_key: 'Stable rendering key used by frontend normalizer. About CMS keys: intro_paragraphs, speech_body, speech_media, culture_values, timeline, leadership_profiles, partner_categories, partner_logos, org_chart.',
      block_type: 'Recommended About block types: rich_text_list, media_profile, tabbed_cards, timeline, carousel_cards, tab_groups, logo_grid, image.',
      sort_order: 'Use 10, 20, 30... to control block order within the same entity.',
    },
  },
  content_block_items: {
    label: 'Content Block Items',
    eyebrow: 'CMS block items',
    description: 'Manage child items rendered inside each content block, such as paragraphs, timeline milestones, leadership cards, partner categories, and partner logos.',
    titleField: 'title',
    table: ['id', 'block_id', 'title', 'item_key', 'sort_order'],
    required: ['block_id'],
    fields: ['block_id', 'item_key', 'title', 'subtitle', 'content', 'link', 'image_id', 'metadata_json', 'sort_order'],
    fieldLabels: {
      block_id: 'Parent Block',
      item_key: 'Item Key',
      title: 'Item Title',
      subtitle: 'Item Subtitle',
      content: 'Item Content',
      link: 'External Link',
      image_id: 'Item Image',
      metadata_json: 'Metadata JSON',
      sort_order: 'Display Order',
    },
    placeholders: {
      item_key: 'Example: paragraph_1 or partner-a',
      title: 'Optional item title',
      subtitle: 'Optional subtitle such as month, category, or role',
      content: 'Main content value for this item',
      link: 'https://example.com or /internal-path',
      metadata_json: '{\n  "year": 2025,\n  "category": "strategic"\n}',
    },
    helpText: {
      block_id: 'Choose the parent block first. Items always render inside the selected content block.',
      item_key: 'Stable item identifier used by frontend mapping and QA. Keep keys lowercase and descriptive.',
      image_id: 'Optional item-level image for profiles, logos, chart assets, or timeline milestones.',
      metadata_json: 'Enter valid JSON only. Use this for custom fields such as year, month, category, badge, external_link, or other block-specific metadata.',
      sort_order: 'Use 10, 20, 30... to keep item ordering predictable inside the selected block.',
    },
  },
  banners: {
    label: 'Banners',
    eyebrow: 'Hero and section banners',
    description: 'Manage banners, CTA buttons, type, language, and display order.',
    titleField: 'title',
    table: ['id', 'title', 'banner_type', 'language_id', 'sort_order', 'is_active'],
    required: ['language_id'],
    fields: ['title', 'subtitle', 'body', 'image_id', 'focus_x', 'focus_y', 'link', 'button_text', 'banner_type', 'language_id', 'sort_order', 'is_active'],
    statusOptions: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    defaultStatus: 'active',
    previewMediaField: 'image_id',
    mediaUploadTargetField: 'image_id',
    mediaUploadAccept: 'image/*,video/*',
    cloudinaryAssetFolder: 'banner',
    fieldLabels: {
      title: 'Banner Title',
      subtitle: 'Subtitle',
      body: 'Description',
      image_id: 'Banner Image/Video',
      focus_x: 'Focus X',
      focus_y: 'Focus Y',
      link: 'CTA Link',
      button_text: 'Button Text',
      banner_type: 'Banner Type',
      language_id: 'Language',
      sort_order: 'Display Order',
      is_active: 'Status',
    },
    placeholders: {
      title: 'Example: Welcome to China Decor',
      subtitle: 'Elegant Interior Solutions',
      body: 'Write a short description for this banner.',
      link: '/about or https://example.com',
      button_text: 'Learn More',
    },
    helpText: {
      image_id: 'Upload an image (JPG, PNG, WebP) or video (MP4, WebM) for the banner background.',
      focus_x: 'Horizontal focus point for image crop (0 to 100).',
      focus_y: 'Vertical focus point for image crop (0 to 100).',
      banner_type: 'Hero = homepage slider, CTA = promotional card, Section/Page/Footer = secondary placements.',
      link: 'URL when users click on the banner or CTA button.',
      button_text: 'Text displayed on the CTA button (if any).',
      is_active: 'Only active banners are shown on the public site.',
    },
    featuredTableFields: ['image_id', 'banner_type', 'is_active'],
  },
  post_categories: {
    label: 'Post Categories',
    eyebrow: 'News taxonomy',
    description: 'Manage categories used by posts and news pages.',
    titleField: 'name',
    editorPresentation: 'modal',
    table: ['id', 'name', 'slug', 'status', 'sort_order'],
    required: ['name', 'slug'],
    fields: ['name', 'slug', 'description', 'parent_id', 'sort_order', 'status'],
    statusOptions: CATEGORY_STATUS_OPTIONS,
    defaultStatus: 'active',
  },
  posts: {
    label: 'Posts',
    eyebrow: 'News content',
    description: 'Manage post content, category, slug, publish date, SEO, and main image.',
    titleField: 'title',
    table: ['id', 'title', 'slug', 'category_id', 'status', 'published_at'],
    required: ['title', 'slug', 'language_id'],
    fields: ['title', 'slug', 'category_id', 'summary', 'body', 'published_at', 'author', 'image_id', 'language_id', 'status', 'meta_title', 'meta_description'],
    statusOptions: POST_STATUS_OPTIONS,
    defaultStatus: 'draft',
    preview: (record) => `/news/${record.slug}`,
  },
  project_categories: {
    label: 'Project Categories',
    eyebrow: 'Project taxonomy',
    description: 'Manage public Project Case categories, legacy category ids, status, and hero media bindings.',
    titleField: 'name',
    pageSize: 25,
    table: ['id', 'name', 'slug', 'status', 'sort_order'],
    required: ['name', 'slug'],
    fields: ['name', 'slug', 'description', 'parent_id', 'sort_order', 'status'],
    statusOptions: CATEGORY_STATUS_OPTIONS,
    defaultStatus: 'active',
    preview: (record) => `/project_list/${record.id}.html`,
    fieldLabels: {
      name: 'Tên Danh Mục',
      slug: 'Slug (URL)',
      description: 'Mô Tả Danh Mục',
      parent_id: 'Danh Mục Cha',
      sort_order: 'Thứ Tự Hiển Thị',
      status: 'Trạng Thái',
    },
    placeholders: {
      name: 'Ví dụ: Khách Sạn 5 Sao',
      slug: 'khach-san-5-sao',
      description: 'Mô tả ngắn hiển thị trên banner hoặc metadata danh mục.',
    },
    helpText: {
      slug: 'Used for canonical admin/project taxonomy naming. Legacy public route still uses numeric category id.',
      sort_order: 'Controls category ordering in Project Case hero slider and sidebar.',
      status: 'Only active categories are exposed by the public Project Case API.',
    },
  },
  projects: {
    label: 'Projects',
    eyebrow: 'Project content',
    description: 'Manage canonical project detail records used by Project Case sections and public project detail pages.',
    titleField: 'title',
    table: ['id', 'title', 'slug', 'category_id', 'project_year', 'status'],
    required: ['title', 'slug', 'language_id'],
    fields: ['title', 'slug', 'category_id', 'summary', 'body', 'location', 'project_year', 'image_id', 'hero_image_id', 'language_id', 'status', 'meta_title', 'meta_description'],
    statusOptions: CONTENT_STATUS_OPTIONS,
    defaultStatus: 'draft',
    preview: (record) => `/project/${record.slug}`,
    fieldLabels: {
      title: 'Tên Dự Án',
      slug: 'Slug (URL)',
      category_id: 'Danh Mục Chính',
      summary: 'Mô Tả Ngắn',
      body: 'Mô Tả Chi Tiết',
      location: 'Địa Điểm',
      project_year: 'Năm Thực Hiện',
      image_id: 'Ảnh Đại Diện',
      hero_image_id: 'Ảnh Banner',
      language_id: 'Ngôn Ngữ',
      status: 'Trạng Thái',
      meta_title: 'SEO Meta Title',
      meta_description: 'SEO Meta Description',
    },
    helpText: {
      category_id: 'Optional primary category for the generic project list/detail module. Project Case mapping is managed separately.',
      image_id: 'Used as fallback for left gallery when no entity_media left_gallery exists.',
      hero_image_id: 'Used as fallback for right gallery when no entity_media right_gallery exists.',
      status: 'Only published projects are returned by public project endpoints and Project Case aggregate API.',
    },
  },
  project_category_items: {
    label: 'Project Case Mapping',
    eyebrow: 'Category to project mapping',
    description: 'Manage Project Case ordering, anchors, layout pattern, and featured state inside each category.',
    titleField: 'anchor',
    pageSize: 25,
    table: ['id', 'category_id', 'project_id', 'anchor', 'sort_order', 'layout_variant', 'is_featured'],
    required: ['category_id', 'project_id', 'anchor', 'sort_order'],
    fields: ['category_id', 'project_id', 'sort_order', 'anchor', 'is_featured', 'layout_variant'],
    preview: (record) => `/project_list/${record.category_id}.html#${record.anchor}`,
    fieldLabels: {
      category_id: 'Project Category',
      project_id: 'Project',
      sort_order: 'Display Order',
      anchor: 'Section Anchor',
      is_featured: 'Featured Layout',
      layout_variant: 'Layout Variant',
    },
    placeholders: {
      anchor: 'Example: ctn2',
      layout_variant: 'feature or standard',
    },
    helpText: {
      category_id: 'Required. Category owning this Project Case section.',
      project_id: 'Required. Each project can only appear once inside the same category.',
      sort_order: 'Required. Public API sorts cases by this value.',
      anchor: 'Required. Must be unique within the selected category. Keep the legacy ctnX pattern for compatibility.',
      layout_variant: 'Current frontend uses feature and standard. Keep values stable unless frontend is updated.',
    },
    relationEntities: {
      category_id: 'project_categories',
      project_id: 'projects',
    },
  },
  entity_media: {
    label: 'Project Media Groups',
    eyebrow: 'Entity media binding',
    description: 'Bind hero and gallery media to Project Categories and Projects through entity_media groups.',
    titleField: 'group_name',
    pageSize: 25,
    table: ['id', 'entity_type', 'entity_id', 'group_name', 'media_id', 'sort_order'],
    required: ['entity_type', 'entity_id', 'media_id', 'group_name', 'sort_order'],
    fields: ['entity_type', 'entity_id', 'media_id', 'group_name', 'sort_order', 'caption'],
    defaultValues: {
      entity_type: 'project_category',
      group_name: 'hero_desktop',
    },
    selectOptions: {
      entity_type: [
        { value: 'project_category', label: 'Project Category' },
        { value: 'project', label: 'Project' },
      ],
      group_name: [
        { value: 'hero_desktop', label: 'Hero Desktop' },
        { value: 'hero_mobile', label: 'Hero Mobile' },
        { value: 'left_gallery', label: 'Left Gallery' },
        { value: 'right_gallery', label: 'Right Gallery' },
      ],
    },
    selectOptionsByEntityType: {
      group_name: {
        project_category: [
          { value: 'hero_desktop', label: 'Hero Desktop' },
          { value: 'hero_mobile', label: 'Hero Mobile' },
        ],
        project: [
          { value: 'left_gallery', label: 'Left Gallery' },
          { value: 'right_gallery', label: 'Right Gallery' },
        ],
      },
    },
    preview: (record) => {
      if (record.preview_href) {
        return record.preview_href
      }
      if (record.entity_type === 'project_category') {
        return `/project_list/${record.entity_id}.html`
      }
      if (record.entity_type === 'project' && record.entity_slug) {
        return `/project/${record.entity_slug}`
      }
      return ''
    },
    fieldLabels: {
      entity_type: 'Entity Type',
      entity_id: 'Entity Record ID',
      media_id: 'Media Asset',
      group_name: 'Media Group',
      sort_order: 'Display Order',
      caption: 'Caption',
    },
    placeholders: {
      entity_id: 'Select a category or project record from the dropdown',
      group_name: 'hero_desktop, hero_mobile, left_gallery, right_gallery',
      caption: 'Optional caption for future use',
    },
    helpText: {
      entity_type: 'Use project_category for category hero images, project for case galleries.',
      entity_id: 'The dropdown updates automatically based on Entity Type so you can bind media without copying numeric ids manually. Use the inline preview link to verify the target before saving.',
      group_name: 'Group options are filtered by Entity Type: project categories use hero_desktop/hero_mobile, projects use left_gallery/right_gallery.',
      sort_order: 'Controls image order inside the selected media group.',
    },
  },
  contacts: {
    label: 'Contacts',
    eyebrow: 'Contact information',
    description: 'Manage contact points, map links, phone numbers, email, and branch assignments.',
    titleField: 'name',
    table: ['id', 'name', 'contact_type', 'postal_code', 'phone', 'email', 'is_primary', 'language_id'],
    required: ['name', 'language_id', 'latitude', 'longitude'],
    fields: ['name', 'contact_type', 'address', 'postal_code', 'phone', 'email', 'map_url', 'latitude', 'longitude', 'branch_id', 'is_primary', 'language_id'],
    fieldLabels: {
      name: 'Tên Liên Hệ / Chi Nhánh',
      contact_type: 'Loại Liên Hệ',
      address: 'Địa Chỉ',
      postal_code: 'Mã Bưu Chính',
      phone: 'Số Điện Thoại',
      email: 'Email',
      map_url: 'Link Google Maps',
      latitude: 'Vĩ Độ (Lat)',
      longitude: 'Kinh Độ (Lng)',
      branch_id: 'Chi Nhánh',
      is_primary: 'Liên Hệ Chính',
      language_id: 'Ngôn Ngữ',
    }
  },
  honors: {
    label: 'Năng Lực',
    eyebrow: 'Factory profile and capability',
    description: 'Quản lý hình ảnh nhà máy, công nghệ sản xuất, công suất, chứng nhận ISO & CE và nội dung năng lực.',
    titleField: 'title',
    table: ['id', 'title', 'award_category', 'issuer', 'sort_order', 'is_active'],
    required: ['title', 'language_id'],
    fields: ['title', 'description', 'award_year', 'award_category', 'project_id', 'image_id', 'issuer', 'language_id', 'sort_order', 'is_active'],
    preview: () => '/honors',
    statusOptions: CONTENT_STATUS_OPTIONS,
    defaultStatus: 'published',
    fieldLabels: {
      title: 'Tiêu Đề',
      description: 'Mô Tả Ngắn',
      award_year: 'Năm / Mốc',
      award_category: 'Nhóm Nội Dung',
      project_id: 'Dự Án Liên Kết',
      image_id: 'Ảnh Đại Diện',
      issuer: 'Nguồn / Đơn Vị',
      language_id: 'Ngôn Ngữ',
      sort_order: 'Thứ Tự Hiển Thị',
      is_active: 'Đang Hiển Thị',
    },
    placeholders: {
      title: 'Ví dụ: Hình ảnh nhà máy',
      description: 'Mô tả ngắn cho mục năng lực này.',
      award_year: '2024',
      award_category: 'factory_images / production_technology / output / certificate',
      issuer: 'Ví dụ: Nhà máy Bắc Kinh',
    },
    helpText: {
      award_category: 'Dùng để phân nhóm nội dung năng lực: factory_images, production_technology, output, certificate.',
      image_id: 'Ảnh thực tế của nhà máy, máy móc hoặc chứng nhận. Đây là nội dung công khai của trang Năng lực.',
      sort_order: 'Dùng 10, 20, 30... để sắp xếp thứ tự hiển thị.',
      is_active: 'Chỉ mục đang hiển thị mới xuất hiện trên trang public.',
    },
  },
  videos: {
    label: 'Videos',
    eyebrow: 'Video gallery',
    description: 'Manage showcase videos with a title, direct video URL, and publish status.',
    titleField: 'title',
    table: ['id', 'title', 'video_url', 'status'],
    required: ['title', 'video_url'],
    fields: ['title', 'video_url', 'status'],
    statusOptions: CONTENT_STATUS_OPTIONS,
    defaultStatus: 'draft',
    preview: () => '/video',
    cloudinaryAssetFolder: 'videos',
    fieldLabels: {
      title: 'Video Title',
      video_url: 'Video URL',
      status: 'Publish Status',
    },
    placeholders: {
      title: 'Example: Product Demo Video',
      video_url: 'https://cdn.example.com/showcase/video.mp4 or YouTube/Vimeo embed URL',
    },
    helpText: {
      video_url: 'Use a direct MP4/WebM URL, or a valid YouTube/Vimeo/share link. The frontend will open this in the premium player modal.',
      status: 'Only videos with Published status are shown on the public page.',
    },
    featuredTableFields: ['video_url', 'status'],
  },
  media_assets: {
    label: 'Media Library',
    eyebrow: 'Uploaded assets',
    description: 'Upload, review, and update images, video files, or PDF assets used across the site.',
    titleField: 'title',
    table: ['id', 'title', 'file_name', 'asset_type', 'mime_type', 'status'],
    required: ['uuid', 'url', 'asset_type'],
    fields: ['uuid', 'file_name', 'url', 'storage_path', 'asset_type', 'mime_type', 'width', 'height', 'size', 'alt_text', 'title', 'status'],
    statusOptions: CATEGORY_STATUS_OPTIONS,
    defaultStatus: 'active',
    allowCreate: false,
    standaloneUpload: true,
  },
  site_settings: {
    label: 'Site Settings',
    eyebrow: 'Global configuration',
    description: 'Manage footer texts, contact settings, site title, and legal links.',
    titleField: 'config_key',
    table: ['id', 'config_key', 'group_name', 'language_id'],
    required: ['config_key'],
    fields: ['config_key', 'config_value', 'language_id', 'group_name', 'description'],
  },
  inquiry_submissions: {
    label: 'Yêu Cầu Từ Khách Hàng',
    editLabel: 'Trả lời',
    editorPresentation: 'modal',
    eyebrow: 'Inquiry submissions',
    description: 'Xem và xử lý các yêu cầu báo giá sản phẩm từ người dùng gửi qua form.',
    titleField: 'full_name',
    table: ['id', 'full_name', 'email', 'phone', 'subject', 'message', 'admin_response', 'status', 'created_at'],
    required: ['full_name', 'email', 'message'],
    fields: ['full_name', 'email', 'phone', 'company', 'subject', 'message', 'status', 'admin_response'],
    statusOptions: [
      { value: 'new', label: 'Mới' },
      { value: 'in_progress', label: 'Đang xử lý' },
      { value: 'replied', label: 'Đã trả lời' },
      { value: 'resolved', label: 'Đã giải quyết' },
      { value: 'spam', label: 'Spam' },
    ],
    defaultStatus: 'new',
    previewCard: (record) => ({
      badge: 'Phản hồi',
      title: record.admin_response ? 'Đã trả lời' : 'Chưa trả lời',
      summary: record.admin_response 
        ? `Nội dung: ${record.admin_response}`
        : 'Yêu cầu này chưa có nội dung phản hồi nội bộ.',
      status: record.admin_response ? 'resolved' : 'warning',
    }),
    fieldLabels: {
      full_name: 'Họ và Tên',
      email: 'Email',
      phone: 'Số Điện Thoại',
      company: 'Công Ty / Tổ Chức',
      subject: 'Chủ Đề',
      message: 'Nội Dung Yêu Cầu',
      status: 'Trạng Thái',
      created_at: 'Thời Gian Gửi',
      admin_response: 'Phản Hồi (Nội bộ)',
    },
    placeholders: {
      admin_response: 'Ghi chú nội dung bạn đã trả lời khách hàng hoặc kết quả xử lý...',
    },
    helpText: {
      admin_response: 'Thông tin này hiện chỉ hiển thị trong quản trị để bạn theo dõi lịch sử xử lý yêu cầu.',
    },
  },
  product_categories: {
    label: 'Danh Mục Sản Phẩm',
    eyebrow: 'Product taxonomy',
    description: 'Quản lý danh mục sản phẩm. Mỗi danh mục có tên, slug, mô tả và ảnh đại diện.',
    titleField: 'name',
    editorPresentation: 'modal',
    table: ['id', 'name', 'slug', 'sort_order', 'is_active'],
    required: ['name', 'slug'],
    fields: ['name', 'slug', 'description', 'image_url', 'sort_order', 'is_active'],
    fieldLabels: {
      name: 'Tên Danh Mục',
      slug: 'Slug (URL)',
      description: 'Mô Tả',
      image_url: 'Ảnh Đại Diện (URL)',
      sort_order: 'Thứ Tự Hiển Thị',
      is_active: 'Đang Hoạt Động',
    },
    placeholders: {
      name: 'Ví dụ: Sàn Gỗ',
      slug: 'san-go',
      description: 'Mô tả ngắn về danh mục sản phẩm.',
      image_url: 'https://cdn.example.com/category-thumbnail.jpg',
    },
    helpText: {
      slug: 'Dùng cho URL và lọc sản phẩm. Viết thường, không dấu, dùng dấu gạch ngang.',
      sort_order: 'Dùng 10, 20, 30... để dễ sắp xếp lại sau này.',
    },
    preview: (record) => `/products?category=${record.slug}`,
  },
  products: {
    label: 'Sản Phẩm',
    eyebrow: 'Product catalog',
    description: 'Quản lý sản phẩm: tên, mã SKU, danh mục, mô tả, kích thước, chất liệu, màu sắc, ứng dụng, video, catalog PDF.',
    titleField: 'name',
    editorPresentation: 'modal',
    table: ['id', 'image_url', 'name', 'sku', 'category_id', 'sort_order', 'is_active'],
    required: ['name', 'slug'],
    fields: [
      'name', 'slug', 'sku', 'category_id',
      'image_url',
      'gallery_urls',
      'short_desc', 'full_desc',
      'size', 'material', 'color', 'use_case',
      'video_url', 'catalog_pdf_url',
      'sort_order', 'is_active',
    ],
    fieldLabels: {
      name: 'Tên Sản Phẩm',
      slug: 'Slug (URL)',
      sku: 'Mã Sản Phẩm (SKU)',
      category_id: 'Danh Mục',
      image_url: 'Ảnh Sản Phẩm (URL)',
      gallery_urls: 'Nhiều Ảnh HD (mỗi dòng một URL)',
      short_desc: 'Mô Tả Ngắn',
      full_desc: 'Mô Tả Chi Tiết',
      size: 'Kích Thước',
      material: 'Chất Liệu',
      color: 'Màu Sắc',
      use_case: 'Ứng Dụng',
      video_url: 'Video Demo (URL)',
      catalog_pdf_url: 'Catalog PDF (URL)',
      sort_order: 'Thứ Tự',
      is_active: 'Đang Bán',
    },
    placeholders: {
      name: 'Ví dụ: Sàn Gỗ Sồi Tự Nhiên',
      slug: 'san-go-soi-tu-nhien',
      sku: 'FLR-OAK-001',
      image_url: 'https://cdn.example.com/product-image.jpg',
      short_desc: 'Mô tả ngắn hiển thị trên thẻ sản phẩm.',
      full_desc: 'Mô tả đầy đủ hiển thị trên trang chi tiết sản phẩm.',
      size: 'Ví dụ: 1220 × 150 × 15 mm',
      material: 'Ví dụ: Gỗ Sồi Trắng (Oak)',
      color: 'Ví dụ: Nâu vàng tự nhiên',
      use_case: 'Ví dụ: Phòng ngủ, phòng khách, văn phòng',
      video_url: 'https://www.youtube.com/embed/... hoặc link video trực tiếp',
      catalog_pdf_url: 'https://cdn.example.com/catalog.pdf',
    },
    helpText: {
      sku: 'Mã sản phẩm duy nhất. Nên dùng định dạng CATEGORY-TYPE-NUM.',
      category_id: 'Chọn danh mục chứa sản phẩm này.',
      image_url: 'Nhập link ảnh trực tiếp (từ Cloudinary hoặc nguồn khác). Ảnh này sẽ làm ảnh đại diện sản phẩm.',
      gallery_urls: 'Dán nhiều link ảnh HD, mỗi dòng một URL. Hệ thống sẽ tự tạo gallery ảnh cho trang chi tiết sản phẩm.',
      video_url: 'Link YouTube embed hoặc URL video (MP4). Để trống nếu không có.',
      catalog_pdf_url: 'URL file PDF catalog để khách hàng tải xuống.',
    },
    relationEntities: {
      category_id: 'product_categories',
    },
    preview: (record) => `/products/${record.slug}`,
    featuredTableFields: ['image_url', 'is_active'],
  },
}

export const ADMIN_SECTION_GROUPS = [
  { title: 'TỔNG QUAN', items: [{ key: 'dashboard', label: 'Bảng Điều Khiển' }] },
  { title: 'CẤU HÌNH HỆ THỐNG', items: [
    { key: 'navigation', label: 'Menu Điều Hướng' },
    { key: 'site_settings', label: 'Cài Đặt Website (Tên, Logo, Slogan)' },
    { key: 'banners', label: 'Banner & Slider' },
  ]},
  {
    title: 'COMPANY (CÔNG TY)',
    items: [
      {
        key: 'pages',
        label: 'Giới Thiệu Chung',
        description: 'Quản lý Giới thiệu, Lịch sử, Tầm nhìn, Sứ mệnh, Giá trị cốt lõi, Ban lãnh đạo, Sơ đồ tổ chức.',
        children: [
          { key: 'page_sections', label: 'Phần Trang (Sections)' },
          { key: 'content_blocks', label: 'Khối Nội Dung (Blocks)' },
          { key: 'content_block_items', label: 'Mục Chi Tiết (Items)' },
        ],
      },
    ],
  },
  {
    title: 'NĂNG LỰC',
    items: [
      {
        key: 'honors',
        label: 'Chứng Nhận & Năng Lực',
        description: 'Quản lý Chứng nhận (ISO, CE), Hình ảnh nhà máy, Công nghệ, Công suất.',
        children: [
          { key: 'media_assets', label: 'Thư Viện Ảnh Nhà Máy' },
        ],
      },
    ],
  },
  {
    title: 'SẢN PHẨM',
    items: [
      { key: 'products', label: 'Danh Sách Sản Phẩm' },
      { key: 'product_categories', label: 'Danh Mục Sản Phẩm' },
      { key: 'videos', label: 'Video Sản Phẩm' },
    ],
  },
  {
    title: 'DỰ ÁN',
    items: [
      {
        key: 'projects',
        label: 'Quản Lý Dự Án',
        children: [
          { key: 'project_categories', label: 'Danh Mục Dự Án' },
          { key: 'project_category_items', label: 'Phân Loại Dự Án' },
          { key: 'entity_media', label: 'Thư Viện Ảnh Dự Án' },
        ],
      },
    ],
  },
  {
    title: 'TIN TỨC',
    items: [
      {
        key: 'posts',
        label: 'Bài Viết & Tin Tức',
        children: [{ key: 'post_categories', label: 'Danh Mục Tin Tức' }],
      },
    ],
  },
  {
    title: 'LIÊN HỆ',
    items: [
      { key: 'contacts', label: 'Thông Tin Liên Hệ' },
      { key: 'inquiry_submissions', label: 'Phản Hồi Từ Form' },
    ],
  },
]

function flattenSectionItems(items, collector = []) {
  for (const item of items || []) {
    collector.push(item)
    if (Array.isArray(item.children) && item.children.length) {
      flattenSectionItems(item.children, collector)
    }
  }
  return collector
}

export const ADMIN_SECTION_INDEX = Object.fromEntries(ADMIN_SECTION_GROUPS.flatMap((group) => flattenSectionItems(group.items)).map((item) => [item.key, item]))
