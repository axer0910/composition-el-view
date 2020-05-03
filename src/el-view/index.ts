import { DynamicForm } from '@/el-view/DynamicForm';
import { FormView } from '@/el-view/FormView';
export { useFromState } from '@/el-view/FormState';
import * as VueCompositionApi from '@vue/composition-api';

const Components = [
  DynamicForm,
  FormView
];

export const compositionApi = VueCompositionApi;

export default Components;