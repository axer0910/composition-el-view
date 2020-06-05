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
import { ComponentProxyType, DialogFormView, FormViewState, RefComponentType } from '../main';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { ElFormItem } from 'element-ui/types/form-item';
import { ElPropMapKeys, MapElPropsAttributes } from './MapElTypes';
import { isPromise } from '../utils';

// todo 映射elform上面的props类型到formProps上面

interface UseElFormOption {
  elFormRef: ElForm,
  formModel: Ref<{[key: string]: any}>,
  formRules?: Ref<ValidateRule[]>,
  formProps?: {[key: string]: any},
  formAttrs?: {[key: string]: any},
  onValidate?: () => void,
  onRuleValidateSuccess?: (currModel: {[key: string]: any}) => void,
  ruleValidateFailedMsg: string
}

interface FormItemControlOption<TagName extends string> {
  name?: string,
  type?: TagName,
  label?: string,
  itemProps: MapElPropsAttributes<TagName extends ElPropMapKeys ? TagName : ''>,
  itemAttrs: {[key: string]: any},
  labelWidth: string,
  formRules: ValidateRule[]
  // todo options也支持label和value的联动
}

interface ElFormControlProps {
  formControl: {
    formProps: {[key: string]: any},
    formAttrs: {[key: string]: any},
    formEvents: {[key: string]: Function},
    elFormRef: ElForm | null,
    _setElFormRef: (ref: ElForm) => void
  }
}

interface ElFormItemControlProps {
  type: string,
  name: string,
  label: string,
  control: ElFormItemControlState<''>
}

interface ElFormItemControlState<TagName extends string> {
  name?: string,
  type?: string,
  label?: string,
  itemProps: MapElPropsAttributes<TagName extends ElPropMapKeys ? TagName : ''>,
  itemAttrs: {[key: string]: any},
  labelWidth: string,
  formModel: {[key: string]: any},
  formRules?: ValidateRule[],
  elFormItemRef: ElFormItem | {},
  _setElFormItemRef: (ref: ElFormItem) => void
  setErrMsg: (msg: string) => void,
  errorMsg?: string, // 手动设置错误信息
  showMessage?:boolean,
  inlineMessage?: boolean,
  size?: 'medium' | 'small' | 'mini'
}

type useItemControlFn = <TagName extends string>(option: FormItemControlOption<TagName>) => ElFormItemControlState<TagName>

type FormItemComponentContext = ComponentProxyType<ElFormItemControlProps, { elFormItem: Ref<RefComponentType<ElForm>> }>;
type FormComponentContext = ComponentProxyType<ElFormControlProps>;

export const useElForm = (option: UseElFormOption) => {
  const { formModel, formProps, formAttrs, onValidate } = option;
  const elFormRef: Ref<RefComponentType<ElForm> | {}> = ref({});
  let submitPromise: Promise<void> | null = null;

  const validateRule = () => {
    console.log('el form ref is', elFormRef);
    return new Promise((resolve, reject) => {
      (elFormRef.value as ElForm).validate(async(valid) => {
        if (!valid) {
          reject(new Error(option.ruleValidateFailedMsg ?? '请检查输入'));
        } else {
          resolve();
        }
      });
    });
  };

  const submitForm = () => {
    if (submitPromise) return;
    const process = async () => {
      try {
        await validateRule();
        if (option.onRuleValidateSuccess) {
          const validateResult = option.onRuleValidateSuccess(formModel);
          if (isPromise(validateResult)) {
            await validateResult;
          }
        }
        submitPromise = null;
      } catch (e) {
        submitPromise = null;
        throw (e);
      }
    };
    submitPromise = process();
  };

  const buildFormControl = () => {
    return reactive({
      formProps: {
        model: formModel,
        ...formProps
      },
      formAttrs: {
        ...formAttrs
      },
      formEvents: {
        validate: onValidate ? onValidate : () => {}
      },
      elFormRef,
      _setElFormRef(ref: ElForm) {
        elFormRef.value = ref;
      }
    });
  };

  const useItemControl: useItemControlFn = (option) => {
    let elFormItemRef: Ref<ElFormItem | {}> = ref({});
    const { type, label, itemProps, itemAttrs, labelWidth, formRules } = option;
    let errMsg = ref('');
    // 验证响应式
    return {
      type,
      label,
      itemProps,
      itemAttrs,
      labelWidth,
      formModel,
      elFormItemRef,
      formRules,
      setErrMsg: (msg: string) => {
        errMsg.value = msg;
      },
      _setElFormItemRef(ref: ElFormItem) {
        elFormItemRef.value = ref;
      }
    }
  };

  const formControl = buildFormControl();
  // formItem也解构formItem上的方法
  return {
    formControl, useItemControl, submitForm
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
    errorMsg,
    showMessage,
    inlineMessage,
    formRules
  } = controlState;
  const formItem: FormItem = {
    formLabel: formItemLabel ?? label,
    formRules,
    labelWidth,
    tagName: formType ?? type,
    modelKey: name,
    props: itemProps,
    attrs: itemAttrs,
    events: {},
    options: context.$slots.default as VNode[],
    errorMsg,
    showMessage,
    inlineMessage,
    // todo class name
  };
  console.log('build form item', formItem)
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
    const elFormItemRef: Ref<RefComponentType<ElFormItem>> = ref(null);
    onMounted(() => {
      props.control._setElFormItemRef(elFormItemRef.value as ElFormItem);
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
      props.formControl._setElFormRef(elFormRef.value as ElForm);
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
