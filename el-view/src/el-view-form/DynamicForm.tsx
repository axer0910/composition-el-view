import { CreateElement, VNode, VNodeChildren, VNodeData } from 'vue';
import { computed, createElement, onMounted, Ref, ref, SetupContext } from '@vue/composition-api';
import { getObjectValue, setObjectValue } from '../utils';
import { defineComponent } from "@vue/composition-api";
import { Vue } from 'vue/types/vue';

export type FormOption = NullableFormItem[] | NullableFormItem[][];

interface DynamicFormProps {
  formOption: FormOption,
  formModel: {[K in keyof object]: any},
  labelWidth?: String,
  formProps?: {[key: string]: any},
  formRule?: {[key: string]: ValidateRule[]},
  formEvents?: {[key: string]: Function},
}

export interface FormItem {
  formLabel: string,
  tagName: string,
  modelKey: string
  required?: boolean,
  requiredMsg?: string,
  formRules?: ValidateRule[],
  props?: { [key: string]: any },
  attrs?: { [key: string]: any },
  events?: { [key: string]: Function },
  options?: ElOptionTag[] | VNodeChildren, // options可以传jsx，支持多个node
  className?: string,
  labelWidth?: string,
  errorMsg?: string, // 手动设置错误信息
  showMessage?:boolean,
  inlineMessage?: boolean,
  size?: 'medium' | 'small' | 'mini'
}

export type NullableFormItem = FormItem | null;

// element ui 下拉框对象快捷格式
export interface ElOptionTag {
  label: string,
  value: string | number
}

export interface ValidateRule {
  validator: (rule: any, value: any, callback: (fn?: Error) => {}) => void
  required?: boolean
}

// element ui 下拉框对象格式
export interface ElOptionTag {
  label: string,
  value: string | number
}

export interface ElTagHandler { // 注册自定义的el-tag默认属性
  defaultProps?: { [key: string]: any }, // 组件默认props
  valueChangeEventName?: string // 表单项组件触发值更新的事件名称（不传默认key为input）
  defaultBindValuePropKey?: string // 表单项组件默认绑定值的key（不传默认key为value）
  getBindValue?: (formItem: FormItem) => { valuePropKey: string, value: any }, // 获取表单项组件的绑定值
  formItemEvents?: (formItem: FormItem, changeModelEmitter: (val: any) => void) => { [key: string]: Function }, // 表单项事件处理函数
  slotBuilderFn?: (options: ElOptionTag[], formItem: FormItem) => CompVNodeData[] // 将label->value的形式的配置转换slot（el-select等场景使用）
}

export interface CompVNodeData {
  tagName: string,
  componentOption?: VNodeData,
  children?: VNodeChildren
}

type ComponentContext = typeof DynamicForm.data & typeof DynamicForm.props & Vue;

const elTagHandlers: Map<string, ElTagHandler> = new Map<string, ElTagHandler>();

export const registerElTagHandlers = (tagName: string, elTagHandler: ElTagHandler) => {
  elTagHandlers.set(tagName, elTagHandler);
};

const h = createElement;
let context: SetupContext;
let componentProps: DynamicFormProps;

// 取得绑定的prop（绑定值与其他表单项组件默认props）
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
      // emitFormChange(val, formItem.modelKey);
    };
    // 获取用户自定义绑定的事件对象（emitter为触发绑定的表单model更新函数）
    const emitter = (val: any) => {
      // emitFormChange(val, formItem.modelKey);
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
        // emitFormChange(val, formItem.modelKey);
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

const getElFormContent = (context: typeof DynamicForm.data & typeof DynamicForm.props & Vue) => {
  console.warn('curr context is', context.$scopedSlots);
  if (context.$scopedSlots.default) {
    return context.$scopedSlots.default(context);
  }
  return context._form.map((formOptionRow) => (
    <div class="form-row">
      {
        formOptionRow.map(formItem => (
          <div class="form-col">
            {createElFormItem(formItem as FormItem)}
          </div>
        ))
      }
    </div>
  ));
};

// 如果是一维数组，那么以一列展示表单
const normalizeForm = (formOptions: FormItem[]) => {
  return formOptions.map((formItem) => [formItem]);
};

const filterNullItem = (formItem: FormItem[][]) => {
  return formItem.map(formRow => {
    return formRow.filter(formItem => formItem !== null);
  })
};

const createFormItemVNode = (compVNodeData: CompVNodeData) => {
  return createElement(compVNodeData.tagName, { ...compVNodeData.componentOption }, compVNodeData.children);
};

export const DynamicForm = defineComponent({
  props: {
    formOption: {
      type: Array,
      default: () => []
    },
    formModel: Object,
    labelWidth: String,
    formProps: Object,
    formEvents: Object,
    formRule: Object
  },
  setup: (props: DynamicFormProps, setupContext: SetupContext) => {
    context = setupContext;
    componentProps = props;
    const elFormRef: Ref<any> = ref(null);
    const _form = computed(() => {
      if (props.formOption.length > 0 && !Array.isArray(props.formOption[0])) {
        return filterNullItem(normalizeForm(props.formOption as FormItem[]));
      }
      return filterNullItem(props.formOption as FormItem[][]);
    });

    const formRules = props.formRule ? props.formRule : computed(() => {
      const rules: {[key: string]: object[]} = {};
      for (const row of _form.value) {
        for (const formItem of row) {
          const defaultRequiredMsg = formItem.requiredMsg ? formItem.requiredMsg : `请填写${formItem.formLabel}`;
          if (formItem.formRules) {
            rules[formItem.modelKey] = [ ...formItem.formRules ];
          } else if (formItem.required) {
            rules[formItem.modelKey] = [{ required: true, message: defaultRequiredMsg, trigger: 'blur' }];
          } else {
            rules[formItem.modelKey] = [];
          }
        }
      }
      return rules;
    });
    console.log('form rule is', formRules, props.formRule);

    return {
      _form, elFormRef, formRules
    }
  },
  render(h: CreateElement) {
    const contextData = (this as ComponentContext)!;
    const extProps = contextData.formProps ? { ...contextData.formProps } : {};
    const extEvents = contextData.formEvents ? { ...contextData.formEvents } : {};
    const formProps = {
      props: {
        rules: contextData.formRules,
        model: contextData.formModel,
        'label-width': contextData.labelWidth,
        ...extProps
      },
      on: { ...extEvents }
    };
    return (
      <el-form ref="elFormRef" { ...formProps }>
        {
          getElFormContent(contextData)
        }
      </el-form>
    )
  }
});
