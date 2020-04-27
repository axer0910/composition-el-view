import { DynamicForm, FormItem, FormOption } from '@/el-view/DynamicForm';
import { computed, reactive, ref, Ref } from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

// formOptionGetter可直接传入formOption数组或者一个函数返回formOption
// initFormModel作为form绑定的初始数据源

export interface FormViewState<T> {
  formOption: Ref<readonly FormItem[] | readonly FormItem[][]>,
  formModel: Ref<UnwrapRef<T>>,
  updateFormModel: (newModel: T) => void,
  setFormModel: (newModel: T) => void,
  className: string,
  setDynamicFormRef: (_dyFormRef: typeof DynamicForm) => void,
  dyFormRef: typeof DynamicForm | null
}

export interface useFromStateArg<T> {
  formModel: T,
  formOption: () => FormOption | FormOption
  className?: string
}

export function useFromState<T extends object>({formModel: initFormModel, formOption: formOptionGetter, className}: useFromStateArg<T>): FormViewState<T> {
  // formOption应该是一个computed属性,getter里面包含用户自定义的生成formOption逻辑（）
  let formOption;
  let dyFormRef = null;
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

  // 设置动态表单组件引用
  const setDynamicFormRef = (_dyFormRef: any) => {
    dyFormRef = _dyFormRef;
  };

  // todo 表单验证（使用element ui自带）
  // todo 自定义提交按钮放在formview的slot里面
  // todo 怎么样对formModel进行watch，监听一个值并运行用户定义的回调（直接用watch？如何watch单个值）
  // 类型推导，传入的表单，数据能推导出一部分类型

  return {
    formOption,
    formModel: ref(reactive(formModel)),
    updateFormModel,
    setFormModel,
    className: className ? className : '',
    setDynamicFormRef,
    dyFormRef
  };
}
