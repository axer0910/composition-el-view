// 外面套普通form
// slot里面套el-form-item（就和文档上用法一样）
// api支持：useElForm 接受elform所有配置规则，同时暴露elform的ref、直接暴露elform上面的methods（useElForm入参接受一个el-form的ref，便于在内部实现各种行为）
// useElForm -> stateObj -> el-form-dialog?
// rules，model均支持响应式（联动）
// 从useElForm返回中解构一个create函数，来动态生成el-form中的form-item(schema中支持json，响应式配置，就和第一版demo一样)
// 验证请求就和原来的一样
// 干掉formView组件？将promise操作封装在hook函数中
// 表格：使用类似useElTable这样的写法

import { CreateElement, VNode } from 'vue';
import { FormItem, ValidateRule } from './DynamicForm';
import {
  ComponentRenderProxy,
  defineComponent, onMounted,
  ref,
  Ref,
  watch
} from '@vue/composition-api';
import { ElForm } from 'element-ui/types/form';
import { createElFormItemUtils } from './CreateElFormItem';
import { ComponentProxyType, RefComponentType } from '../main';

interface UseElFormOption {
  elFormRef: ElForm,
  formModel: Ref<{[key: string]: any}>,
  formRules?: Ref<ValidateRule[]>,
}

interface FormItemControlOption {
  type?: string,
  label?: string,
  itemProps: {[key: string]: any},
  itemAttrs: {[key: string]: any},
  labelWidth: string,
  // todo options也支持label和value的联动
}

interface ElFormItemControlProps {
  type: string,
  name: string,
  label: string,
  control: UseControlState
}

type UseControlState = UseElFormOption & FormItemControlOption;

type ComponentContext = ComponentProxyType<ElFormItemControlProps>;

export const useElForm = (option: UseElFormOption) => {
  const control = ref(null);
  const { formModel, formRules, elFormRef } = option;
  const useControl: (option: FormItemControlOption) => UseControlState = (option: FormItemControlOption) => {
    const { type, label, itemProps, itemAttrs, labelWidth } = option;
    return {
      type,
      label,
      itemProps,
      itemAttrs,
      labelWidth,
      formModel,
      formRules,
      elFormRef
    }
  };
  watch(() => control.value, () => {
    if (control.value) {
      console.warn('mounted el form item control', control.value);
    }
  });
  return {
    useControl, formModel, formRules
  }
};

const buildFormItem = (context: ComponentContext) => {
  const { name, type, label, control } = context.$props;
  // 如果在control里定义了type和label就覆盖props上定义的
  const {
    type: formType,
    label: formItemLabel,
    itemProps,
    itemAttrs,
    labelWidth,
    formModel,
    formRules,
    elFormRef
  } = context.$props.control;
  const formItem: FormItem = {
    formLabel: formItemLabel ?? label,
    labelWidth,
    tagName: formType ?? type,
    modelKey: name,
    props: itemProps,
    attrs: itemAttrs,
    events: {},
    options: context.$slots.default as VNode[],
    // formRules: formRules // todo formRules处理
    // todo class name
  };
  const { createElFormItem } = createElFormItemUtils(formModel, formItem, context);
  return createElFormItem() as VNode;
};

export const ElFormItemControl = defineComponent({
  name: 'ElFormItemControl',
  props: {
    type: String,
    name: String,
    label: String,
    control: Object
  },
  setup(props) {
    const elFormItem: Ref<RefComponentType<ElForm>> = ref(null);
    return { elFormItem }
  },
  render(h: CreateElement) {
    const context = this as ComponentContext;
    return buildFormItem(context);
  }
});
