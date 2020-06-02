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
  defineComponent, onMounted, reactive,
  ref,
  Ref, watch
} from '@vue/composition-api';
import { ElForm } from 'element-ui/types/form';
import { createElFormItemUtils } from './CreateElFormItem';
import { ComponentProxyType, DialogFormView, RefComponentType } from '../main';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { ElFormItem } from 'element-ui/types/form-item';
import { ElPropMapKeys, MapElPropsAttributes } from './MapElTypes';

// todo 映射elform上面的props类型到formProps上面

interface UseElFormOption {
  elFormRef: ElForm,
  formModel: Ref<{[key: string]: any}>,
  formRules?: Ref<ValidateRule[]>,
  formProps?: {[key: string]: any},
  formAttrs?: {[key: string]: any},
  onValidate?: () => void
}

interface FormItemControlOption<TagName extends string> {
  type?: TagName,
  label?: string,
  itemProps: MapElPropsAttributes<TagName extends ElPropMapKeys ? TagName : ''>,
  itemAttrs: {[key: string]: any},
  labelWidth: string,
  // todo options也支持label和value的联动
}

interface ElFormControlProps {
  formControl: {
    formProps: {[key: string]: any},
    formAttrs: {[key: string]: any},
    formEvents: {[key: string]: Function},
    elFormRef: ElForm | null
  }
}

interface ElFormItemControlProps {
  type: string,
  name: string,
  label: string,
  control: ElFormItemControlState<''>
}

interface ElFormItemControlState<TagName extends string> {
  type?: string,
  label?: string,
  itemProps: MapElPropsAttributes<TagName extends ElPropMapKeys ? TagName : ''>,
  itemAttrs: {[key: string]: any},
  labelWidth: string,
  formModel: {[key: string]: any},
  formRules?: {[key: string]: any},
  elFormItemRef: ElFormItem | {}
}

type UseControlState<TagName extends string> = UseElFormOption & FormItemControlOption<TagName>;

type ComponentContext = ComponentProxyType<ElFormItemControlProps>;

type useItemControlFn = <TagName extends string>(option: FormItemControlOption<TagName>) => ElFormItemControlState<TagName>

type FormItemComponentContext = ComponentProxyType<ElFormItemControlProps, { elFormItem: Ref<RefComponentType<ElForm>> }>;
type FormComponentContext = ComponentProxyType<ElFormControlProps>;

export const useElForm = (option: UseElFormOption) => {
  const { formModel, formRules, formProps, formAttrs, onValidate } = option;
  const buildFormControl = () => {
    let elFormRef: ElForm | {} = {};
    return reactive({
      formProps: {
        model: formModel,
        rules: formRules,
        ...formProps
      },
      formAttrs: {
        ...formAttrs
      },
      formEvents: {
        validate: onValidate ? onValidate : () => {}
      },
      elFormRef
    });
  };
  const useItemControl: useItemControlFn = (option) => {
    const { type, label, itemProps, itemAttrs, labelWidth } = option;
    let elFormItemRef: ElFormItem | {} = {};
    return {
      type,
      label,
      itemProps,
      itemAttrs,
      labelWidth,
      formModel,
      formRules,
      elFormItemRef
    }
  };
  const formControl = buildFormControl();
  // formItem也解构formItem上的方法
  return {
    useItemControl, formControl
  }
};

const buildFormItem = (context: FormItemComponentContext) => {
  const { name, type, label, control: controlState } = context.$props;
  // 如果在control里定义了type和label就覆盖props上定义的
  const {
    type: formType,
    label: formItemLabel,
    itemProps,
    itemAttrs,
    labelWidth,
    formModel,
    formRules
  } = controlState;
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
  setup(props: ElFormItemControlProps) {
    const elFormItemRef: Ref<RefComponentType<ElForm>> = ref(null);
    onMounted(() => {
      props.control.elFormItemRef = elFormItemRef.value as ElForm;
    });
    return { elFormItemRef }
  },
  render(h: CreateElement) {
    const context = this as FormItemComponentContext;
    return buildFormItem(context);
  }
});


export const ElFormControl = defineComponent({
  name: 'ElFormControl',
  props: {
    formControl: Object
  },
  setup(props: ElFormControlProps) {
    const elFormRef: Ref<RefComponentType<ElForm>> = ref(null);
    onMounted(() => {
      props.formControl.elFormRef = elFormRef.value as ElForm;
    });
    return { elFormRef }
  },
  render(h: CreateElement) {
    const context = this as FormComponentContext;
    const option = {
      attrs: context.$props.formControl.formAttrs,
      props: context.$props.formControl.formProps,
      on: context.$props.formControl.formEvents
    };
    return (
      <el-form {...option} ref="elFormRef">
        {context.$slots.default}
      </el-form>
    )
  }
});
