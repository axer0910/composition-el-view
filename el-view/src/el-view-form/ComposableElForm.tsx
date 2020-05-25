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
import { FormItem } from './DynamicForm';
import {
  ComponentRenderProxy,
  computed,
  defineComponent,
  ref,
  Ref,
  watch
} from '@vue/composition-api';
import { ElForm } from 'element-ui/types/form';
import { ComponentContextData, RefComponentType } from '../main';
import { getObjectValue, setObjectValue } from '../utils';
import { createElFormItemUtils } from './CreateElFormItem';

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

const buildFormItem = (context: ComponentContextData<typeof ElFormItemControl>) => {
  // todo props， attrs从context自动解构
  const { itemType, label, itemProps, itemAttrs, labelWidth, name } = context.$props;
  const formItem: FormItem = {
    formLabel: label,
    labelWidth,
    tagName: itemType,
    modelKey: name,
    props: itemProps,
    attrs: itemAttrs,
    events: {},
    options: context.$slots.default as VNode[],
    // todo class name
  };
  return formItem;
};

export const ElFormItemControl = defineComponent({
  name: 'ElFormItemControl',
  props: {
    itemType: String,
    itemName: String,
    itemLabel: String,
    itemProps: Object,
    itemAttrs: Object,
    itemLabelWidth: {
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
    return { elFormItem }
  },
  render(h: CreateElement) {
    const context = this as ComponentContextData<typeof ElFormItemControl>;
    console.warn(context);
    const { createElFormItem } = createElFormItemUtils(context.props.f);
    const { type, label, itemProps, itemAttrs, labelWidth } = context.$props!;
    console.log('type is', type);
    const vnodeData = getVNodeData(type + '', itemAttrs, itemProps, context.$slots.default);
    return createElFormItem(); // todo formModel注册,rules注册
  }
});
