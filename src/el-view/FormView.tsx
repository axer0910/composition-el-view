import { defineComponent, onMounted, ref, SetupContext } from '@vue/composition-api';
import { CreateElement, VNode } from 'vue';
import { DynamicForm } from '@/el-view/DynamicForm';
import { FormViewState } from '@/el-view/FormState';

interface FormViewProps<T> {
  formState: FormViewState<T>
}

let renderFn: (h: CreateElement) => VNode;

export default defineComponent({
  name: 'FormView',
  props: {
    formState: Object
  },
  components: {
    'dy-form': DynamicForm
  },
  setup: (props: FormViewProps<object>, setupContext: SetupContext) =>  {
    onMounted(() => {
      setTimeout(() => {
        const dyFormRef = setupContext.refs.dy_form;
        console.warn('dy ref', setupContext.refs.dy_form);
      }, 2000);
      props.formState.setDynamicFormRef(setupContext.refs.dy_form as any)
    });
    renderFn = (h: CreateElement) => (
      <el-form ref="dy_form">
        {
          <div class={['cus-form-view', props.formState.className]}>
            <dy-form formOption={props.formState.formOption.value}
                     formModel={props.formState.formModel.value}
                     ref="dy_form"
            />
            <div class="form-view-footer">
            </div>
          </div>
        }
      </el-form>
    );
  },
  render(h: CreateElement) {
    return renderFn(h);
  }
});
