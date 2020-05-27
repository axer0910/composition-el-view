import { VueConstructor } from 'vue';
import { DialogFormView, DynamicForm, FormView, ElFormItemControl, ElFormControl } from './el-view-form';
import { Vue } from 'vue/types/vue';
import { ElForm } from 'element-ui/types/form';
import { ComponentRenderProxy } from '@vue/composition-api';

export const install = function(Vue: VueConstructor, opts = {}) {
  Vue.component('dynamic-form', DynamicForm);
  Vue.component('dialog-form', DialogFormView);
  Vue.component('form-view', FormView);
  Vue.component('el-formitem-control', ElFormItemControl);
  Vue.component('el-form-control', ElFormControl);
};

export * from './el-view-form'

type ConvertObjectPrimitiveType<T> = T extends String ? string
    : T extends Object ? object
      : T extends Number ? number
        : T;

type ConvertProps<Props> = {
  [K in keyof Props]: ConvertObjectPrimitiveType<Props[K]>
}

// 避免打包tsc -d无限死循环，排除Vue上面的所有类型，只保留组件定义的类型
export type RefComponentType<Component> = Omit<Component, keyof Vue> | null
// 用于推导render函数内this类型
// props的类型尽量手写，不要用推导，如果render里某个用了推导出来的props会出现循环报，并报隐含any的问题
export type ComponentProxyType<Props, Data = {}> = Data & { $props: Props } & Vue;
