<template>
  <div class="markdown-renderer">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载内容喵...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="markdown-content" v-html="renderedContent"></div>
  </div>
</template>

<script>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../assets/css/color.css'; // 确保导入主题变量

export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  computed: {
    renderedContent() {
      if (!this.content) return '';
      
      try {
        // 配置 marked 选项
        marked.setOptions({
          breaks: true,
          gfm: true,
          sanitize: false,
          smartypants: true,
          highlight: (code, lang) => {
            // 如果有代码高亮库，可以在这里添加
            return `<pre><code class="language-${lang}">${code}</code></pre>`;
          }
        });
        
        // 渲染 markdown 并清理 HTML
        const rawHtml = marked(this.content);
        return DOMPurify.sanitize(rawHtml);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        return '<p>内容渲染失败</p>';
      }
    }
  }
};
</script>

<style scoped>
.markdown-renderer {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--icon-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  color: var(--error-color);
}

.error i {
  font-size: 2rem;
  margin-bottom: 10px;
}

/* Markdown 内容样式 */
.markdown-content {
  line-height: 1.6;
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 标题样式 */
.markdown-content :deep(h1) {
  font-size: 2.5rem;
  margin: 2rem 0 1rem;
  color: var(--icon-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 2rem;
  margin: 1.5rem 0 1rem;
  color: var(--icon-accent);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3rem;
}

.markdown-content :deep(h3) {
  font-size: 1.5rem;
  margin: 1.2rem 0 0.8rem;
  color: var(--text-color);
}

.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 1.2rem;
  margin: 1rem 0 0.5rem;
  color: var(--text-color);
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin: 1rem 0;
  text-align: justify;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin: 0.5rem 0;
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: var(--icon-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-bottom-color 0.3s;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--icon-primary);
}

/* 代码样式 */
.markdown-content :deep(code) {
  background: var(--code-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  color: var(--code-color);
}

.markdown-content :deep(pre) {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--text-color);
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--icon-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
  font-style: italic;
  background: var(--quote-bg);
  padding: 1rem;
  border-radius: 0 8px 8px 0;
}

/* 表格样式 */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--card-shadow);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.markdown-content :deep(th) {
  background: var(--icon-primary);
  color: var(--background-color);
  font-weight: bold;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
  background: var(--table-stripe);
}

.markdown-content :deep(tbody tr:hover) {
  background: var(--table-hover);
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--card-shadow);
  margin: 1rem 0;
}

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--icon-primary), transparent);
  margin: 2rem 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .markdown-renderer {
    padding: 15px;
  }
  
  .markdown-content :deep(h1) {
    font-size: 2rem;
  }
  
  .markdown-content :deep(h2) {
    font-size: 1.5rem;
  }
  
  .markdown-content :deep(h3) {
    font-size: 1.2rem;
  }
  
  .markdown-content :deep(pre) {
    font-size: 0.8rem;
  }
  
  .markdown-content :deep(table) {
    font-size: 0.9rem;
  }
  
  .markdown-content :deep(th),
  .markdown-content :deep(td) {
    padding: 0.5rem;
  }
}
</style> 