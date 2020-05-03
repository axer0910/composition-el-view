import {
  ComponentRenderProxy,
  defineComponent, onMounted, ref, Ref, SetupContext
} from '@vue/composition-api';
import { DynamicForm } from '@/el-view/DynamicForm';
import { FormViewState } from '@/el-view/FormState';
import { ElForm } from 'element-ui/types/form';
import { CreateElement } from 'vue';
import { isPromise } from '@/el-view/utils';
import { Vue } from 'vue/types/vue';
interface FormViewProps<T> {
  formState: FormViewState<T>
}

const validateElForm = (formState: FormViewState<object>) => {
  return new Promise((resolve, reject) => {
    formState.getElFormRef().validate(async(valid) => {
      if (!valid) {
        reject(new Error('form validate failed'));
      } else {
        resolve();
      }
    });
  });
};

const handleSubmitForm = async (formState: FormViewState<object>, context: ComponentRenderProxy) => {
  // ElForm验证完成后，可以继续交给onRuleValidateSuccess函数再进行异步验证（一般是提交接口）
  // 验证完成后resolve promise
  context.$emit('beforeValidate');
  try {
    await validateElForm(formState);
    if (formState.onRuleValidateSuccess) {
      const result = formState.onRuleValidateSuccess();
      if (isPromise(result)) {
        await result;
      }
    }
    formState.onFinishValidate && formState.onFinishValidate();
  } catch (e) {
    formState.onValidateError && formState.onValidateError();
  }
};

const handleResetForm = (formState: FormViewState<object>, context: FormViewComponentContext) => {
  formState.getElFormRef().resetFields();
  context.$emit('resetForm');
};

const setSubmitPromise = async (formState: FormViewState<object>, context: FormViewComponentContext) => {
  // 触发表单验证流程，并设置提交中的promise
  // 同一次提交过程只能有一个promise进行
  // todo 单元测试
  if (context.processingPromise === null) {
    context.processingPromise = handleSubmitForm(formState, context);
    await context.processingPromise;
    context.processingPromise = null;
  }
};

export type FormViewComponentContext = ComponentRenderProxy & typeof FormView.data;

export const FormView = defineComponent({
  name: 'FormView',
  props: {
    formState: Object
  },
  components: {
    'dy-form': DynamicForm
  },
  setup: (props: FormViewProps<object>, setupContext: SetupContext) => {
    onMounted(function (this: FormViewComponentContext) {
      // onMounted传入function这里的this作为2.x兼容用法
      // 3.0中，可以在setup中直接定义一个ref对象，并在模板中ref直接指向它，当模板渲染后会自动填充这个ref
      // 在composition api支持的还不是很好（jsx中不支持），所以在这里直接用this访问当前组件实例（vue3.0中onMounted等hook中不存在this）
      // 设置Element UI中Form组件ref，以便使用el-form组件中相关方法
      submitForm.value = () => {
        setSubmitPromise(props.formState, this)
      };
      resetForm.value = () => {
        handleResetForm(props.formState, this)
      };
      props.formState.setElFormRef((this.$refs.dy_form as typeof DynamicForm.data)!.elFormRef as ElForm);
    });
    const processingPromise: Ref<null | Promise<void>> = ref(null); // 正在提交中的表单promise
    const submitForm: Ref<Function> = ref(() => {});
    const resetForm: Ref<Function> = ref(() => {});
    const operations = ref({
      submitForm, resetForm
    });
    return { processingPromise, operations };
  },
  render(h: CreateElement) {
    const context = this as FormViewComponentContext;
    const props = context.$props as FormViewProps<object>;
    return (
      <div>
        {
          <div class={['el-form-view', props.formState.className]}>
            <dy-form formOption={props.formState.formOption.value}
                     formModel={props.formState.formModel.value}
                     labelWidth={props.formState.labelWidth?.value}
                     formProps={props.formState.elFormProps?.value}
                     formEvents={props.formState.elFormEvents?.value}
                     ref="dy_form"
            />
            <div class="form-view-footer">
              {
                (this as Vue).$scopedSlots.operation
                  ? (this as Vue).$scopedSlots.operation!(context.operations)
                  : (
                    <div class="option-bar">
                      <el-button type="primary" size="small" onClick={() => setSubmitPromise(props.formState, context)}>确 定</el-button>
                      <el-button size="small" onClick={() => handleResetForm(props.formState, context) }>重 置</el-button>
                    </div>
                    )
              }
            </div>
          </div>
        }
      </div>
    )
  }
});
