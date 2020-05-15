// 注册默认的一些element ui配置
import { ElOptionTag, registerElTagHandlers } from './DynamicForm';

export const registerDefaultHandlers = () => {
  registerElTagHandlers('el-select', {
    slotBuilderFn: (options: ElOptionTag[]) => {
      return options.map(option => {
        return {
          tagName: 'el-option',
          componentOption: {
            props: {
              key: option.value,
              value: option.value,
              label: option.label
            }
          }
        };
      })
    }
  });
};
