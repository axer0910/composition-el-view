import { CreateElement, VNode, VNodeChildren, VNodeData } from 'vue';
import { computed, createElement, onMounted, Ref, ref, SetupContext } from '@vue/composition-api';
import { getObjectValue, setObjectValue } from '@/el-view/utils';
import { defineComponent } from "@vue/composition-api";
import { Vue } from 'vue/types/vue';

export type FormOption = NullableFormItem[] | NullableFormItem[][];

interface DynamicFormProps {
  formOption: FormOption,
  formModel: {[K in keyof object]: any}
}

export interface FormItem {
  formLabel: string,
  tagName: string,
  modelKey: string
  required?: boolean,
  formRules?: Array<ValidateRule>,
  props?: { [key: string]: any },
  attrs?: { [key: string]: any },
  events?: { [key: string]: Function },
  options?: ElOptionTag[] | VNodeChildren, // options可以传jsx，支持多个node
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
  // getBindValue?: (vm: DynamicFilter, comp: DynamicFilterTagItem) => any, // 组件默认绑定值
  // getEventsHandler?: (vm: DynamicFilter, comp: DynamicFilterTagItem) => { [key: string]: any }, // 组件默认绑定事件
  slotBuilderFn?: (options: Array<ElOptionTag>, formItem: FormItem) => Array<CompVNodeData> // 将label->value的形式的配置转换slot（el-select等场景使用）
}

export interface CompVNodeData {
  tagName: string,
  componentOption?: VNodeData,
  children?: VNodeChildren
}

const elTagHandlers: Map<string, ElTagHandler> = new Map<string, ElTagHandler>();

export const registerElTagHandlers = (tagName: string, elTagHandler: ElTagHandler) => {
  elTagHandlers.set(tagName, elTagHandler);
};

const h = createElement;
let context: SetupContext;
let componentProps: DynamicFormProps;

const emitFormChange = (val: any, modelKey: string) => {
  const { formModel } = componentProps;
  setObjectValue(formModel, modelKey, val);
  context.emit('formChange', { ...formModel });
};

// 从传入的formModel中取得绑定的数据
const getDefaultBindValue = (modelKey: string) => {
  const { formModel } = componentProps;
  return {
    value: getObjectValue(formModel, modelKey)
  };
};

// 绑定更新表单后的数据，并且触发表单更新事件
const getDefaultBindEvents = (modelKey: string) => {
  return {
    input: (val: any) => {
      emitFormChange(val, modelKey);
      // todo 可以再包装个函数，给用户用，调用完后自动调用emitFormChange
    }
  };
};

// 合并事件
const mergeEvents = (componentOption: VNodeData, modelKey: string) => {
  componentOption.on = {
    ...getDefaultBindEvents(modelKey), // 默认的输入事件，将触发emit
    ...componentOption.on
  };
};

// 合并props
const mergeProps = (componentOption: VNodeData, modelKey: string) => {
  componentOption.props = {
    ...getDefaultBindValue(modelKey),
    ...componentOption.props
  };
};

// 生成表单项组件的slot内容
const setComponentSlot: (componentOption: VNodeData, formItem: FormItem) => Array<VNode> = (componentOption, formItem) => {
  const { options } = formItem;
  if (!options) return [];
  if (elTagHandlers.has(formItem.tagName)) {
    const { slotBuilderFn } = elTagHandlers.get(formItem.tagName)!;
    if (options && Array.isArray(options) && options.length > 0 && slotBuilderFn && typeof slotBuilderFn === 'function') {
      // 区分option对象格式，
      if (Reflect.has(options[0] as object, 'label')) {
        const slotData = slotBuilderFn(options as Array<ElOptionTag>, formItem); // label，value的快捷定义
        return slotData.map(compVNodeData => createFormItemVNode(compVNodeData));
      }
    }
  }
  return options as Array<VNode>; // 验证jsx和jsx数组是否支持
};

const createFormItem = (formItem: FormItem) => {
  const { tagName, props, attrs, events, modelKey, formLabel } = formItem;
  const componentTagName = tagName;
  const componentOption: VNodeData = {
    key: modelKey,
    props,
    attrs,
    on: events
  };
  mergeEvents(componentOption, formItem.modelKey);
  mergeProps(componentOption, formItem.modelKey);
  const slots = setComponentSlot(componentOption, formItem);
  return (
    <el-form-item label={formLabel}>
      {createFormItemVNode({
        tagName: componentTagName,
        componentOption,
        children: slots
      })}
    </el-form-item>
  );
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
  return createElement(compVNodeData.tagName, compVNodeData.componentOption, compVNodeData.children);
};

export const DynamicForm = defineComponent({
  props: {
    formOption: Array,
    formModel: Object
  },
  setup: (props: DynamicFormProps, setupContext: SetupContext) => {
    context = setupContext;
    componentProps = props;
    const elFormRef: Ref<null | Vue> = ref(null);
    const _form = computed(() => {
      if (props.formOption.length > 0 && !Array.isArray(props.formOption[0])) {
        return filterNullItem(normalizeForm(props.formOption as FormItem[]));
      }
      return filterNullItem(props.formOption as FormItem[][]);
    });

    onMounted(() => {
      elFormRef.value = setupContext.refs.el_form as Vue;
    });
    return {
      _form, elFormRef
    }
  },
  render(h: CreateElement) {
    const contextData = (this as typeof DynamicForm.data)!;
    return (
      <el-form ref="el_form">
        {
          contextData._form.map((formOptionRow) => (
            <div class="form-row">
              {
                formOptionRow.map(formItem => (
                  <div class="form-col">
                    {createFormItem(formItem as FormItem)}
                  </div>
                ))
              }
            </div>
          ))
        }
      </el-form>
    )
  }
});
