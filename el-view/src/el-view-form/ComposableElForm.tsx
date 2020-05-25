// 外面套普通form
// slot里面套el-form-item（就和文档上用法一样）
// api支持：useElForm 接受elform所有配置规则，同时暴露elform的ref、直接暴露elform上面的methods（useElForm入参接受一个el-form的ref，便于在内部实现各种行为）
// useElForm -> stateObj -> el-form-dialog?
// rules，model均支持响应式（联动）
// 从useElForm返回中解构一个create函数，来动态生成el-form中的form-item(schema中支持json，响应式配置，就和第一版demo一样)
// 验证请求就和原来的一样
// 干掉formView组件？将promise操作封装在hook函数中
// 表格：使用类似useElTable这样的写法

import { CreateElement, VNodeChildren } from 'vue';
import { CompVNodeData, ElOptionTag, FormItem, FormOption, ValidateRule } from './DynamicForm';
import {
  ComponentRenderProxy,
  computed,
  createElement,
  defineComponent,
  ref,
  Ref,
  SetupContext,
  watch
} from '@vue/composition-api';
import { Vue } from 'vue/types/vue';
import { ElForm } from 'element-ui/types/form';
import { FormView } from './FormView';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { RefComponentType } from '../main';
// 123

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

type CompContextData<VueProxy> = ComponentRenderProxy &  VueProxy;

const createFormItemVNode = (compVNodeData: CompVNodeData) => {
  return createElement(compVNodeData.tagName, { ...compVNodeData.componentOption }, compVNodeData.children);
};


export const ElFormItemControl = defineComponent({
  name: 'TestComp',
  props: {
    type: String,
    name: String,
    label: String,
    labelWidth: {
      type: String,
      default: 'auto'
    },
    rules: Array
  },
  setup() {
    const elFormItem: Ref<RefComponentType<ElForm>> = ref(null);
    const formItemSlot = computed(() => {
      return createFormItemVNode
    });
    return { elFormItem }
  },
  render(h: CreateElement) {
    const context = this as CompContextData<typeof ElFormItemControl>;
    // elformitem里构造组件
    return (
      <el-form-item prop={context.props!.name} ref="elFormItem">

      </el-form-item>
    )
  }
});
