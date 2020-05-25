// 外面套普通form
// slot里面套el-form-item（就和文档上用法一样）
// api支持：useElForm 接受elform所有配置规则，同时暴露elform的ref、直接暴露elform上面的methods（useElForm入参接受一个el-form的ref，便于在内部实现各种行为）
// useElForm -> stateObj -> el-form-dialog?
// rules，model均支持响应式（联动）
// 从useElForm返回中解构一个create函数，来动态生成el-form中的form-item(schema中支持json，响应式配置，就和第一版demo一样)
// 验证请求就和原来的一样
// 干掉formView组件？将promise操作封装在hook函数中
// 表格：使用类似useElTable这样的写法

import { CreateElement, VNode, VNodeChildren, VNodeData } from 'vue';
import { CompVNodeData, ElOptionTag, ElTagHandler, FormItem, FormOption, ValidateRule } from './DynamicForm';
import {
  ComponentRenderProxy,
  computed,
  createElement,
  defineComponent,
  ref,
  Ref,
  SetupContext,
  watch
} from '@vue/composition-api';
import { Vue } from 'vue/types/vue';
import { ElForm } from 'element-ui/types/form';
import { FormView } from './FormView';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { RefComponentType } from '../main';
import { getObjectValue } from '../utils';

export const useElForm = (options: ElForm) => {
  const elFormRef = ref(null);
  watch(() => elFormRef.value, () => {
    if (elFormRef.value) {
      console.warn('mounted el form ref', elFormRef);
    }
  });
  // todo 将el-form-item替换为自定义的form-item组件，useElForm带出来一个register给到内部注册elForm的各种prop，验证等事件
  return {
    elFormRef
    // validate: elForm.value.validate,
    // validateField: elForm.value.validateField,
    // resetFields: elForm.value.resetFields,
    // clearValidate: elForm.value.clearValidate
  }
};

type CompContextData<VueProxy> = ComponentRenderProxy & VueProxy & { $props: any };

const elTagHandlers: Map<string, ElTagHandler> = new Map<string, ElTagHandler>();

export const registerElTagHandlers = (tagName: string, elTagHandler: ElTagHandler) => {
  elTagHandlers.set(tagName, elTagHandler);
};


const createFormItemVNode = (compVNodeData: CompVNodeData) => {
  return createElement(compVNodeData.tagName, { ...compVNodeData.componentOption }, compVNodeData.children);
};

const getVNodeData = (type: string, attrs = {}, props = {}, slotContent: any): CompVNodeData => {
  return {
    tagName: type,
    componentOption: {
      props, attrs
    },
    children: slotContent
  }
};

const getBindProps = (formItem: FormItem) => {
  const { formModel } = componentProps;
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

const getBindEvents = (formItem: FormItem) => {
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
      emitFormChange(val, formItem.modelKey);
    };
    // 获取用户自定义绑定的事件对象（emitter为触发绑定的表单model更新函数）
    const emitter = (val: any) => {
      emitFormChange(val, formItem.modelKey);
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
        emitFormChange(val, formItem.modelKey);
      }
    };
  }
};

// 合并事件
const mergeEvents = (componentOption: VNodeData, formItem: FormItem) => {
  componentOption.on = {
    ...getBindEvents(formItem), // 获取绑定事件
    ...componentOption.on
  };
};

// 合并props
const mergeProps = (componentOption: VNodeData, formItem: FormItem) => {
  componentOption.props = {
    ...getBindProps(formItem),// 获取绑定的props（value以及其他默认props）
    ...componentOption.props
  };
};

const buildFormItem = (context: CompContextData<typeof ElFormItemControl>) => {
  // props， attrs从context自动解构
  const { type, label, itemProps, itemAttrs, labelWidth, name, props } = context.$props!;
  const formItem: FormItem = {
    formLabel: label,
    tagName: type,
    modelKey: name,
    props: itemProps,
    labelWidth,
    attrs,
    events
  }
  return {
    formLabel: label,
    tagName: type,
    modelKey: name,

  }
};

// 生成表单项组件的slot内容
const setComponentSlot: (componentOption: VNodeData, formItem: FormItem) => VNode[] = (componentOption, formItem) => {
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

// todo 抽离生成表单方法
// todo schema支持： default-slot, json, getter函数，普通对象
const createElFormItem = (formItem: FormItem) => {
  const { tagName, props, attrs, events, modelKey, formLabel } = formItem;
  const componentTagName = tagName;
  const componentOption: VNodeData = {
    key: modelKey,
    props: {...props},
    attrs: {...attrs},
    on: {...events}
  };
  mergeEvents(componentOption, formItem);
  mergeProps(componentOption, formItem);
  const slots = setComponentSlot(componentOption, formItem);
  return (
    <el-form-item label={formLabel} class={['dy-form-item', formItem.className]} prop={formItem.modelKey}>
      {createFormItemVNode({
        tagName: componentTagName,
        componentOption,
        children: slots
      })}
    </el-form-item>
  );
};

export const ElFormItemControl = defineComponent({
  name: 'ElFormItemControl',
  props: {
    type: String,
    name: String,
    label: String,
    itemProps: Object,
    itemAttrs: Object,
    labelWidth: {
      type: String,
      default: 'auto'
    },
    itemRules: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    const elFormItem: Ref<RefComponentType<ElForm>> = ref(null);
    const formItemSlot = computed(() => {
      return createFormItemVNode
    });
    return { elFormItem }
  },
  render(h: CreateElement) {
    const context = this as CompContextData<typeof ElFormItemControl>;
    console.warn('context props', context.$props);
    const { type, label, itemProps, itemAttrs, labelWidth } = context.$props!;
    console.log('type is', type);
    const vnodeData = getVNodeData(type + '', itemAttrs, itemProps, context.$slots.default);
    return (
      <el-form-item prop={context.$props!.name} ref="elFormItem" label={label} labelWidth={labelWidth}>
        {createFormItemVNode(vnodeData)}
      </el-form-item>
    )
  }
});
