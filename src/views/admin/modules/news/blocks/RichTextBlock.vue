<template>
  <div class="rich-text-block" :class="{ 'rich-text-block--active': selected }" @mousedown.stop>
    <EditorContent :editor="editor" class="rich-text-block__content" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { createBlockEditorExtensions } from '../editor/newsEditorHelpers'

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  syncKey: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update'])

const editor = new Editor({
  extensions: createBlockEditorExtensions(),
  content: props.block.content || '<p></p>',
  editorProps: {
    attributes: {
      class: 'prose prose-news-editor',
    },
  },
  onUpdate: ({ editor: instance }) => {
    emit('update', instance.getHTML())
  },
})

const content = computed(() => props.block.content || '<p></p>')

watch(content, (value) => {
  if (value !== editor.getHTML()) {
    editor.commands.setContent(value, false)
  }
})

watch(
  () => props.selected,
  (value) => {
    if (value) {
      editor.commands.focus()
    }
  },
)

watch(
  () => props.syncKey,
  () => {
    if (content.value !== editor.getHTML()) {
      editor.commands.setContent(content.value, false)
    }
  },
)

onBeforeUnmount(() => {
  editor.destroy()
})

defineExpose({
  editor,
})
</script>

<style scoped>
.rich-text-block {
  width: 100%;
  height: 100%;
}

.rich-text-block__content {
  width: 100%;
  height: 100%;
}

:deep(.ProseMirror) {
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 12px 14px;
  outline: none;
  color: #0f172a;
  overflow: auto;
  box-sizing: border-box;
}

:deep(.ProseMirror p) {
  margin: 0 0 0.8em;
}

:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3) {
  margin: 0 0 0.65em;
  line-height: 1.2;
  color: #0f172a;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.4em;
}
</style>
