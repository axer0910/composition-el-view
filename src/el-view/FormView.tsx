import {
  ComponentRenderProxy,
  defineComponent, onMounted
} from '@vue/composition-api';
import { DynamicForm } from '@/el-view/DynamicForm';
import { FormViewState } from '@/el-view/FormState';
import { ElForm } from 'element-ui/types/form';
import { CreateElement } from 'vue';
interface FormViewProps<T> {
  formState: FormViewState<T>
}

export default defineComponent({
  name: 'FormView',
  props: {
    formState: Object
  },
  components: {
    'dy-form': DynamicForm
  },
  setup: (props: FormViewProps<object>) => {
    onMounted(function (this: ComponentRenderProxy) {
      // onMounted传入function这里的this作为2.x兼容用法
      // 3.0中，可以在setup中直接定义一个ref对象，并在模板中ref直接指向它，当模板渲染后会自动填充这个ref
      // 在composition api支持的还不是很好（jsx中不支持），所以在这里直接用this访问当前组件实例（vue3.0中onMounted等hook中不存在this）
      // 设置Element UI中Form组件ref，以便使用el-form组件中相关方法
      props.formState.setElFormRef((this.$refs.dy_form as typeof DynamicForm.data)!.elFormRef as ElForm);
    })
  },
  render(h: CreateElement) {
    const context = this as ComponentRenderProxy;
    const props = context.$props as FormViewProps<object>;
    // 获取formView
    return (
      <div>
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
      </div>
    )
  }
});
