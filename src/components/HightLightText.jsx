/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-25 19:39
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-28 05:27
 * @desc       :
 */
// HighlightText.vue
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    // 输入文本，用于匹配高亮部分
    inputText: {
      type: String,
      required: true,
    },

    // 全部文本，需要进行高亮的完整文本
    allText: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { inputText, allText } = props;

    // 定义高亮样式
    const highlightStyle = {
      color: 'rgb(20, 86, 240)',
    };

    // 高亮文本的处理逻辑
    const highlightText = () => {
      if (inputText) {
        // 使用正则表达式进行文本匹配

        const pattern = new RegExp(`(${inputText})`, 'gi');
        const parts = allText.split(pattern);

        // 遍历拆分后的文本，奇数索引部分使用高亮样式
        return parts.map((part, index) => {
          return index % 2 === 0 ? <span>{part}</span> : <span style={highlightStyle}>{part}</span>;
        });
      }
      // 如果没有输入文本，则返回原始文本数组
      return [allText];
    };

    return () => highlightText();
  },
});
