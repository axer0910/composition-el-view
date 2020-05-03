import { FormOption, NullableFormItem } from '@/el-view/DynamicForm';
import { computed, reactive, ref, Ref } from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { ElForm } from 'element-ui/types/form';

// formOptionGetter可直接传入formOption数组或者一个函数返回formOption
// initFormModel作为form绑定的初始数据源

export interface FormViewState<T> {
  formOption: Ref<readonly NullableFormItem[] | readonly NullableFormItem[][]>,
  formModel: Ref<UnwrapRef<T>>,
  updateFormModel: (newModel: T) => void,
  setFormModel: (newModel: T) => void,
  className: Ref<string>,
  setElFormRef: (_elFormRef: ElForm) => void,
  getElFormRef: () => ElForm,
  labelWidth?: Ref<string>,
  elFormProps?: Ref<{[key: string]: any}>,
  elFormEvents?: Ref<{[key: string]: Function}>,
  onRuleValidateSuccess?: () => Promise<void> | void,
  onFinishValidate?: () => void,
  onValidateError?: () => void
}

export interface useFromStateArg<T> {
  formModel: T,
  formOption: () => FormOption
  className?: string,
  labelWidth?: string,
  elFormProps?: {[key: string]: any},
  elFormEvents?: {[key: string]: Function},
  onRuleValidateSuccess?: () => Promise<void> | void,
  onFinishValidate?: () => void,
  onValidateError?: () => void
}

export function useFromState<T extends object>(
  {formModel: initFormModel,
   formOption: formOptionGetter,
   className, labelWidth, elFormProps, elFormEvents, onRuleValidateSuccess, onFinishValidate, onValidateError
  }: useFromStateArg<T>): FormViewState<T> {
  // formOption应该是一个computed属性,getter里面包含用户自定义的生成formOption逻辑（）
  let formOption;
  let elFormRefInstance = {} as ElForm;
  if (typeof formOptionGetter === 'function') {
    formOption = computed(formOptionGetter);
  } else {
    formOption = computed(() => formOptionGetter);
  }
  let formModel = { ...initFormModel };

  // 更新表单绑定数据
  const updateFormModel = (newModel: T) => {
    formModel = { ...formModel, ...newModel};
  };

  // 设置表单新数据源
  const setFormModel = (newModel: T) => {
    formModel = { ...newModel};
  };

  // 设置ElForm组件引用
  const setElFormRef = (_elFormRef: ElForm) => {
    elFormRefInstance = _elFormRef;
  };

  // 获取ElForm组件引用
  const getElFormRef = () => elFormRefInstance;

  // 表单验证（使用element ui自带）
  // 自定义提交按钮使用暴露调用的验证事件
  // default props的处理
  // 传入的formOption可以支持null
  // 类型推导，传入的表单，数据能推导出一部分类型
  return {
    formOption,
    formModel: ref(reactive(formModel)),
    updateFormModel,
    setFormModel,
    className: ref(className ?? ''),
    setElFormRef,
    getElFormRef,
    labelWidth: ref(labelWidth ?? ''),
    elFormProps: ref(reactive(elFormProps ?? {})),
    elFormEvents: ref(reactive(elFormEvents ?? {})),
    onRuleValidateSuccess, onFinishValidate, onValidateError
  };
}
