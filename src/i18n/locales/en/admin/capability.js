export default {
  settings: {
    eyebrow: 'Capability Page Config',
    title: 'Layout & General Info Management',
    description: 'Adjust Hero, Banners, Factory Info, and production capability cards.',
    sections: {
      hero: 'Hero & Banners',
      factory_overview: 'Factory Overview',
      production_capabilities: 'Capability Cards',
      factory_gallery: 'Factory Gallery',
    },
    hero: {
      title: 'Hero Title',
      subtitle: 'Hero Subtitle',
      is_active: 'Display Hero',
      seal_text: 'Badge Seal Text',
      seal_image: 'Badge Seal Image',
      background_image: 'Desktop Background Image',
      banners_title: 'Slider Banners List',
      add_banner: 'Add Banner',
    },
    factory: {
      title: 'Section Title',
      name: 'Factory Name',
      address: 'Address',
      location_label: 'Location Label',
      description: 'Overview Description',
      technology: 'Production Technology',
      machinery: 'Machinery & Process',
      capacity: 'Production Capacity',
      output: 'Output Description',
      main_image: 'Main Section Image',
      stats_title: 'Factory Statistics',
    },
    cards: {
      add_new: 'Add New Card',
      icon: 'Icon (lucide)',
      sort: 'Sort Order',
    },
    common: {
      save_all: 'Save All Configurations',
      saving: 'Saving...',
      reset: 'Restore Defaults',
      confirm_save: 'Confirm Save',
      confirm_message: 'Are you sure you want to save all changes for this section?',
      save_success: 'Configuration saved successfully.',
    }
  },
  categories: {
    label: 'Capability Categories',
    eyebrow: 'Content Classification',
    description: 'Manage capability content groups such as: Factory Images, Technology, Capacity, Certifications...',
    types: {
      qualification_certificate: 'Qualification Certificate',
      awards_group: 'Awards Group',
      corporate_honors: 'Corporate Honors',
      project_honors: 'Project Honors',
      custom: 'Custom',
    },
    add_new: 'Add Category',
    edit: 'Edit Category',
    delete: 'Delete Category',
    table: {
      name: 'Category Name',
      type: 'Type',
      status: 'Status',
      actions: 'Actions',
    }
  },
  items: {
    label: 'Capability / Certifications',
    eyebrow: 'Capability Details',
    description: 'Manage details of awards, ISO/CE certificates, and specific capability milestones.',
    add_new: 'Add Item',
    edit: 'Edit Item',
    delete: 'Delete Item',
    fields: {
      award_year: 'Year / Timeline',
      award_category: 'Capability Group',
      issuer: 'Issued By / Source',
    }
  }
}
