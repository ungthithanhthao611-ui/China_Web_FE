import os
import shutil
import re
from pathlib import Path

src_dir = Path(r"d:\china\China_Web\src")
old_admin_dir = src_dir / "views" / "admin"
new_admin_dir = src_dir / "admin"

mapping = {
    # pages
    "AdminDashboardPage.vue": "pages/AdminDashboardPage.vue",
    "AdminLoginPage.vue": "pages/AdminLoginPage.vue",

    # shared
    "modules/core/AdminCoreEditor.vue": "shared/components/AdminCoreEditor.vue",
    "modules/core/AdminCoreEditor.css": "shared/components/AdminCoreEditor.css",
    "modules/core/AdminCoreManager.vue": "shared/components/AdminCoreManager.vue",
    "modules/core/AdminCoreManager.css": "shared/components/AdminCoreManager.css",
    "modules/core/CoreConfirmDialog.vue": "shared/components/CoreConfirmDialog.vue",
    "modules/core/CoreFilters.vue": "shared/components/CoreFilters.vue",
    "modules/core/CoreRecordsTable.vue": "shared/components/CoreRecordsTable.vue",
    "modules/core/CoreRecordsTable.css": "shared/components/CoreRecordsTable.css",
    "modules/core/CoreToolbar.vue": "shared/components/CoreToolbar.vue",
    "modules/core/CoreUploadPanel.vue": "shared/components/CoreUploadPanel.vue",
    "modules/core/useEntityManager.js": "shared/composables/useEntityManager.js",
    "api/adminApi.js": "shared/api/adminApi.js",
    "config/entityConfigs.js": "shared/config/entityConfigs.js",
    "constants/auth.js": "shared/constants/auth.js",
    "utils/treeUtils.js": "shared/utils/treeUtils.js",
    "utils/entity-manager/bannerHelpers.js": "shared/utils/entity-manager/bannerHelpers.js",
    "utils/entity-manager/constants.js": "shared/utils/entity-manager/constants.js",
    "utils/entity-manager/formHelpers.js": "shared/utils/entity-manager/formHelpers.js",
    "utils/entity-manager/previewHelpers.js": "shared/utils/entity-manager/previewHelpers.js",

    # features/about
    "modules/about/AboutManager.vue": "features/about/pages/AboutManager.vue",

    # features/contacts
    "modules/contacts/ContactsManager.vue": "features/contacts/pages/ContactsManager.vue",
    "modules/contacts/InquiriesManager.vue": "features/contacts/pages/InquiriesManager.vue",

    # features/honors
    "modules/honors/HonorsManager.vue": "features/honors/pages/HonorsManager.vue",
    "api/honorsAdminApi.js": "features/honors/api/honorsAdminApi.js",

    # features/navigation
    "modules/navigation/NavigationMenusManager.vue": "features/navigation/pages/NavigationMenusManager.vue",
    "modules/navigation/AddNavigationMenu.vue": "features/navigation/components/AddNavigationMenu.vue",
    "modules/navigation/EditNavigationMenu.vue": "features/navigation/components/EditNavigationMenu.vue",
    "modules/navigation/DeleteNavigationMenu.vue": "features/navigation/components/DeleteNavigationMenu.vue",
    "composables/useNavigationMenusManager.js": "features/navigation/composables/useNavigationMenusManager.js",

    # features/news
    "modules/news/NewsManager.vue": "features/news/pages/NewsManager.vue",
    "modules/news/NewsEditor.vue": "features/news/pages/NewsEditor.vue",
    "modules/news/blocks/GalleryBlock.vue": "features/news/components/GalleryBlock.vue",
    "modules/news/blocks/ImageBlock.vue": "features/news/components/ImageBlock.vue",
    "modules/news/blocks/RichTextBlock.vue": "features/news/components/RichTextBlock.vue",
    "modules/news/components/EditorColorPopover.vue": "features/news/components/EditorColorPopover.vue",
    "modules/news/toolbar/NewsEditorToolbar.vue": "features/news/components/NewsEditorToolbar.vue",
    "modules/news/toolbar/toolbarOptions.js": "features/news/components/toolbarOptions.js",
    "modules/news/store/editorStore.js": "features/news/store/editorStore.js",
    "modules/news/editor/newsEditorHelpers.js": "features/news/utils/newsEditorHelpers.js",
    "modules/news/extensions/textStyleExtensions.js": "features/news/utils/textStyleExtensions.js",
    "models/newsWorkflow.js": "features/news/models/newsWorkflow.js",
    "utils/news-workflow/blockFactory.js": "features/news/utils/blockFactory.js",

    # features/products
    "modules/products/ProductsManager.vue": "features/products/pages/ProductsManager.vue",
    "modules/products/CategoriesManager.vue": "features/products/pages/CategoriesManager.vue",
    "modules/products/VideosManager.vue": "features/products/pages/VideosManager.vue",

    # features/projects
    "modules/projects/ProjectsManager.vue": "features/projects/pages/ProjectsManager.vue",

    # features/system
    "modules/system/BannersManager.vue": "features/system/pages/BannersManager.vue",
    "modules/system/MediaAssetsManager.vue": "features/system/pages/MediaAssetsManager.vue",
    "modules/system/SiteSettingsManager.vue": "features/system/pages/SiteSettingsManager.vue",
}

extra_mapping = {
    src_dir / "app/layouts/AdminLayout.vue": new_admin_dir / "layout/AdminLayout.vue",
    src_dir / "app/router/admin.routes.js": new_admin_dir / "routes/admin.routes.js",
}

print("GIAI ĐOẠN 1 — PHÂN TÍCH")
abs_mapping = {}
for k, v in mapping.items():
    old_path = old_admin_dir / k
    new_path = new_admin_dir / v
    abs_mapping[old_path] = new_path
    print(f"OLD: views/admin/{k}")
    print(f"NEW: admin/{v}\n")

for old_path, new_path in extra_mapping.items():
    abs_mapping[old_path] = new_path
    print(f"OLD: {old_path.relative_to(src_dir)}")
    print(f"NEW: {new_path.relative_to(src_dir)}\n")

# Path lookup
def get_new_alias(old_abs_path):
    if old_abs_path in abs_mapping:
        rel = abs_mapping[old_abs_path].relative_to(src_dir)
        return f"@/{rel}".replace('\\', '/')
    return None

# Find all vue/js files
all_files = []
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.vue') or file.endswith('.js') or file.endswith('.css'):
            all_files.append(Path(root) / file)

# Prepare imports rewrite BEFORE moving
files_changed = set()
for file_path in all_files:
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception:
        continue
        
    new_content = content
    
    # 1. Replace relative imports
    def replace_relative(match):
        rel_str = match.group(1)
        # resolve relative path
        current_dir = file_path.parent
        target_path = (current_dir / rel_str).resolve()
        
        # does it point to one of the moved files?
        new_alias = get_new_alias(target_path)
        if new_alias:
            return new_alias
            
        # maybe it omits extension
        for ext in ['.vue', '.js', '.css']:
            if get_new_alias(target_path.with_suffix(ext)):
                return get_new_alias(target_path.with_suffix(ext))
                
        return match.group(0) # unchanged

    new_content = re.sub(r"((?:\.\./|\./)+[\w\-/\.]+)", replace_relative, new_content)
    
    # 2. Replace absolute aliases: @/views/admin/..., @/app/layouts/AdminLayout.vue, etc.
    def replace_alias(match):
        alias_str = match.group(0) # e.g. @/views/admin/api/adminApi.js
        rel_path = alias_str.replace('@/', '').replace('/', os.sep)
        target_path = src_dir / rel_path
        
        new_alias = get_new_alias(target_path)
        if new_alias:
            return new_alias
            
        for ext in ['.vue', '.js', '.css']:
            if get_new_alias(target_path.with_suffix(ext)):
                # If we matched without extension, replace without extension or with it? 
                # Let's just return the new alias with extension, it's safer.
                return get_new_alias(target_path.with_suffix(ext)).replace(ext, '') if not alias_str.endswith(ext) else get_new_alias(target_path.with_suffix(ext))

        return alias_str
        
    new_content = re.sub(r"@/(views/admin|app/layouts|app/router)/[\w\-/\.]+", replace_alias, new_content)
    
    if new_content != content:
        file_path.write_text(new_content, encoding='utf-8')
        files_changed.add(file_path)

print(f"\nFiles updated for imports: {len(files_changed)}")
for f in files_changed:
    print(f" - {f.relative_to(src_dir)}")

print("\nGIAI ĐOẠN 2 — REFACTOR CẤU TRÚC")
for old_path, new_path in abs_mapping.items():
    if old_path.exists():
        new_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(old_path), str(new_path))
    else:
        print(f"WARNING: File not found: {old_path}")

print("Phase 2 complete.")
