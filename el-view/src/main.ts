import { VueConstructor } from 'vue';
import { DialogFormView, DynamicForm, FormView, ElFormItemControl } from './el-view-form';
import { Vue } from 'vue/types/vue';
import { ElForm } from 'element-ui/types/form';
import { ComponentRenderProxy } from '@vue/composition-api';

export const install = function(Vue: VueConstructor, opts = {}) {
  Vue.component('dynamic-form', DynamicForm);
  Vue.component('dialog-form', DialogFormView);
  Vue.component('form-view', FormView);
  Vue.component('el-formitem-control', ElFormItemControl);
};

export * from './el-view-form'

// 避免打包tsc -d无限死循环，排除Vue上面的所有类型，只保留组件定义的类型
export type RefComponentType<Component> = Omit<Component, keyof Vue> | null
// 用于推到render函数内this类型
export type ComponentContextData<VueProxy> = ComponentRenderProxy & VueProxy & { $props: any };
