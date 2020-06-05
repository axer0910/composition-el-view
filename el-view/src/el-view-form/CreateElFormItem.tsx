import { CompVNodeData, ElOptionTag, ElTagHandler, FormItem } from './DynamicForm';
import { createElement, Ref } from '@vue/composition-api';
import { getObjectValue, setObjectValue } from '../utils';
import { Vue } from 'vue/types/vue';
import { VNode, VNodeData } from 'vue';

const createFormItemVNode = (compVNodeData: CompVNodeData) => {
  return createElement(compVNodeData.tagName, { ...compVNodeData.componentOption }, compVNodeData.children);
};

const elTagHandlers: Map<string, ElTagHandler> = new Map<string, ElTagHandler>();

export const registerElTagHandlers = (tagName: string, elTagHandler: ElTagHandler) => {
  elTagHandlers.set(tagName, elTagHandler);
};

export function createElFormItemUtils<Context extends Vue>(formModel: {[key: string]: any}, formItem: FormItem, context: Context) {
  const getBindProps = () => {
    let props: {[key: string]: any} = {};
    if (elTagHandlers.has(formItem.tagName)) {
      // 设置定义了绑定value的prop key
      const formTagItemConf = elTagHandlers.get(formItem.tagName)!;
      const bindValuePropKey = formTagItemConf.defaultBindValuePropKey;
      if (bindValuePropKey) {
        props[bindValuePropKey] = getObjectValue(formModel, formItem.modelKey);
      } else {
        props.value = getObjectValue(formModel, formItem.modelKey)
      }
      const bindValFn = formTagItemConf.getBindValue;
      // 自定义了获取绑定值的方法
      if (bindValFn) {
        const { valuePropKey, value } = bindValFn(formItem);
        props[valuePropKey] = value;
      }
      // 设置组件默认props配置
      const { defaultProps } = formTagItemConf;
      if (defaultProps) {
        props = {
          ...props,
          ...defaultProps
        };
      }
      return props;
    } else {
      return {
        value: getObjectValue(formModel, formItem.modelKey)
      };
    }
  };
  const getBindEvents = () => {
    let events: {[key: string]: Function} = {};
    if (elTagHandlers.has(formItem.tagName)) {
      // 获取用户自定义的触发model更新的事件key
      const customDefaultInputEventName = elTagHandlers.get(formItem.tagName)!.valueChangeEventName;
      let changeEventKey;
      if (customDefaultInputEventName) {
        changeEventKey = customDefaultInputEventName;
      } else {
        changeEventKey = 'input';
      }
      events[changeEventKey] = (val: any) => {
        updateFormModel(val, formItem.modelKey);
      };
      // 获取用户自定义绑定的事件对象（emitter为触发绑定的表单model更新函数）
      const emitter = (val: any) => {
        updateFormModel(val, formItem.modelKey);
      };
      const tagEventsHandler = elTagHandlers.get(formItem.tagName)!.formItemEvents;
      if (tagEventsHandler) {
        events = {
          ...events,
          ...tagEventsHandler(formItem, emitter)
        }
      }
      return events;
    } else {
      return {
        input: (val: any) => {
          updateFormModel(val, formItem.modelKey);
        }
      };
    }
  };
  const updateFormModel = (val: any, modelKey: string) => {
    setObjectValue(formModel, modelKey, val);
    context.$emit('formChange', { ...formModel });
  };

  // 合并事件
  const mergeEvents = (componentOption: VNodeData) => {
    componentOption.on = {
      ...getBindEvents(), // 获取绑定事件
      ...componentOption.on
    };
  };

  // 合并props
  const mergeProps = (componentOption: VNodeData) => {
    componentOption.props = {
      ...getBindProps(),// 获取绑定的props（value以及其他默认props）
      ...componentOption.props
    };
  };

  // 生成表单项组件的slot内容
  const setComponentSlot = () => {
    const { options } = formItem;
    if (!options) return [];
    if (elTagHandlers.has(formItem.tagName)) {
      const { slotBuilderFn } = elTagHandlers.get(formItem.tagName)!;
      if (options && Array.isArray(options) && options.length > 0 && slotBuilderFn && typeof slotBuilderFn === 'function') {
        // 区分option对象格式，
        if (Reflect.has(options[0] as object, 'label')) {
          const slotData = slotBuilderFn(options as ElOptionTag[], formItem); // label，value的快捷定义
          return slotData.map(compVNodeData => createFormItemVNode(compVNodeData));
        }
      }
    }
    // options此时为VNode数组，直接返回渲染
    return options as VNode[];
  };

  const createElFormItem = () => {
    const { tagName, props, attrs, events, modelKey, formLabel } = formItem;
    const componentTagName = tagName;
    const componentOption: VNodeData = {
      key: modelKey,
      props: {...props},
      attrs: {...attrs},
      on: {...events}
    };
    mergeEvents(componentOption);
    mergeProps(componentOption);
    const slots = setComponentSlot();
    const h = context.$createElement;
    // elFormItemRef名字和setup返回的ref需要保持一致，一致会自动设置ref变量
    console.log('build el form item', formLabel);
    return (
      <el-form-item label={formLabel}
                    class={['dy-form-item', formItem.className]}
                    prop={formItem.modelKey}
                    error={formItem.errorMsg}
                    rules={formItem.formRules}
                    ref="elFormItemRef"
      >
        {createFormItemVNode({
          tagName: componentTagName,
          componentOption,
          children: slots
        })}
      </el-form-item>
    );
  };

  return {
    createElFormItem
  }
}
