import { VueConstructor } from 'vue';
import { DialogFormView, DynamicForm, FormView } from './el-view-form';

export const install = function(Vue: VueConstructor, opts = {}) {
  Vue.component('dynamic-form', DynamicForm);
  Vue.component('dialog-form', DialogFormView);
  Vue.component('form-view', FormView);
};

export * from './el-view-form'
