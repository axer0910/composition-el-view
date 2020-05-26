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
  computed,
  defineComponent, onMounted,
  ref,
  Ref,
  watch
} from '@vue/composition-api';
import { ElForm } from 'element-ui/types/form';
import { ComponentContextData, RefComponentType } from '../main';
import { getObjectValue, setObjectValue } from '../utils';
import { createElFormItemUtils } from './CreateElFormItem';

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

type useControlState = UseElFormOption & FormItemControlOption;

export const useElForm = (option: UseElFormOption) => {
  const control = ref(null);
  const { formModel, formRules, elFormRef } = option;
  const hookArr: Ref<any[]> = ref([]);
  watch(() => hookArr, () => {
    console.warn('hook arr change', hookArr);
  });
  const useControl: (option: FormItemControlOption) => useControlState = (option: FormItemControlOption) => {
    const { type, label, itemProps, itemAttrs, labelWidth } = option;

    // arr.push()
    onMounted(() => {
      console.warn('in use control mounted', elFormRef);
    });
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
  // todo 将el-form-item替换为自定义的form-item组件，useElForm带出来一个register给到内部注册elForm的各种prop，验证等事件
  return {
    useControl, formModel, formRules
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
    // todo class name, rules
  };
  return formItem;
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
    onMounted(() => {
      // 从control解构配置，生成formItem
    });
    return { elFormItem }
  },
  render(h: CreateElement) {
    const context = this as ComponentContextData<typeof ElFormItemControl>;
    console.warn(context);
    // const { createElFormItem } = createElFormItemUtils(context.props.f);
    const { type, label, itemProps, itemAttrs, labelWidth } = context.$props!;
    console.log('type is', type);
    // const vnodeData = getVNodeData(type + '', itemAttrs, itemProps, context.$slots.default);
    // return createElFormItem(); // todo formModel注册,rules注册
    // todo promise提交
    return <div>test</div>;
  }
});
