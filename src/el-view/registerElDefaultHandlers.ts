// 注册默认的一些element ui配置
import { ElOptionTag, registerElTagHandlers } from '@/el-view/DynamicForm';

export const registerHandlers = () => {
  registerElTagHandlers('el-select', {
    slotBuilderFn: (options: Array<ElOptionTag>) => {
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
