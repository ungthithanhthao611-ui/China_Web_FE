export default {
  settings: {
    eyebrow: '能力页面配置',
    title: '布局与常规信息管理',
    description: '调整 Hero、横幅、工厂信息和生产能力卡。',
    sections: {
      hero: 'Hero 与横幅',
      factory_overview: '工厂概况',
      production_capabilities: '能力卡',
      factory_gallery: '工厂图库',
    },
    hero: {
      title: 'Hero 标题',
      subtitle: 'Hero 副标题',
      is_active: '显示 Hero',
      seal_text: '徽章文字',
      seal_image: '徽章图片',
      background_image: '桌面背景图',
      banners_title: '滑动横幅列表',
      add_banner: '添加横幅',
    },
    factory: {
      title: '板块标题',
      name: '工厂名称',
      address: '地址',
      location_label: '位置标签',
      description: '概况描述',
      technology: '生产技术',
      machinery: '机械与流程',
      capacity: '生产能力',
      output: '产出描述',
      main_image: '主要板块图片',
      stats_title: '工厂统计数据',
    },
    cards: {
      add_new: '添加新卡片',
      icon: '图标 (lucide)',
      sort: '排序',
    },
    common: {
      save_all: '保存所有配置',
      saving: '保存中...',
      reset: '恢复默认值',
      confirm_save: '确认保存',
      confirm_message: '您确定要保存此板块的所有更改吗？',
      save_success: '配置保存成功。',
    }
  },
  categories: {
    label: '能力类别',
    eyebrow: '内容分类',
    description: '管理能力内容组，如：工厂图片、技术、产能、认证...',
    types: {
      qualification_certificate: '资格证书',
      awards_group: '奖项组',
      corporate_honors: '企业荣誉',
      project_honors: '项目荣誉',
      custom: '自定义',
    },
    add_new: '添加类别',
    edit: '编辑类别',
    delete: '删除类别',
    table: {
      name: '类别名称',
      type: '类型',
      status: '状态',
      actions: '操作',
    }
  },
  items: {
    label: '能力 / 认证',
    eyebrow: '能力详情',
    description: '管理奖项、ISO/CE 证书和特定能力里程碑的详情。',
    add_new: '添加项目',
    edit: '编辑项目',
    delete: '删除项目',
    fields: {
      award_year: '年份 / 时间轴',
      award_category: '能力组',
      issuer: '颁发者 / 来源',
    }
  }
}
