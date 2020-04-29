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
  className: string,
  setElFormRef: (_elFormRef: ElForm) => void,
  getElFormRef: () => ElForm,
}

export interface useFromStateArg<T> {
  formModel: T,
  formOption: () => FormOption
  className?: string
}

export function useFromState<T extends object>({formModel: initFormModel, formOption: formOptionGetter, className}: useFromStateArg<T>): FormViewState<T> {
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

  // todo 表单验证（使用element ui自带）
  // todo 自定义提交按钮放在formview的slot里面
  // 传入的formOption可以支持null
  // 类型推导，传入的表单，数据能推导出一部分类型

  return {
    formOption,
    formModel: ref(reactive(formModel)),
    updateFormModel,
    setFormModel,
    className: className ? className : '',
    setElFormRef,
    getElFormRef
  };
}
