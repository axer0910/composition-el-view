import { FormItem, FormOption } from '@/el-view/DynamicForm';
import { computed, reactive, ref, Ref } from '@vue/composition-api';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

// formOptionGetter可直接传入formOption数组或者一个函数返回formOption
// initFormModel作为form绑定的初始数据源

export interface FormViewState<T> {
  formOption: Ref<readonly FormItem[] | readonly FormItem[][]>,
  formModel: Ref<UnwrapRef<T>>,
  updateFormModel: (newModel: T) => void,
  setFormModel: (newModel: T) => void,
  className: string
}

export interface useFromStateArg<T> {
  initFormModel: T,
  formOptionGetter: () => FormOption<keyof T>,
  className?: string
}

export function useFromState<T extends object>({initFormModel, formOptionGetter, className}: useFromStateArg<T>): FormViewState<T> {
  // formOption应该是一个computed属性,getter里面包含用户自定义的生成formOption逻辑（）
  const formOption = computed(formOptionGetter);
  let formModel = { ...initFormModel };

  // 更新表单绑定数据
  const updateFormModel = (newModel: T) => {
    formModel = { ...formModel, ...newModel};
  };

  // 设置表单新数据源
  const setFormModel = (newModel: T) => {
    formModel = { ...newModel};
  };

  // todo 表单验证（使用element ui自带）
  // todo 自定义提交按钮放在formview的slot里面
  // todo 怎么样对formModel进行watch，监听一个值并运行用户定义的回调（直接用watch？如何watch单个值）
  // todo 设置DynmaicForm的ref在里面，方便进行elementui 的操作
  // 类型推导，传入的表单，数据能推导出一部分类型

  return {
    formOption,
    formModel: ref(reactive(formModel)),
    updateFormModel,
    setFormModel,
    className: className ? className : ''
  };
}
