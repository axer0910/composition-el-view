import { defineComponent, onMounted, Ref, ref } from '@vue/composition-api';
import { CreateElement } from 'vue';
import { ComponentRenderProxy } from '@vue/composition-api/dist/component/component';
import { FormViewState } from '@/el-view/FormState';
import { FormView, FormViewComponentContext } from '@/el-view/FormView';

export type DialogFormViewRenderContext = any;
type DialogFormViewProps = any;

export const DialogFormView = defineComponent({
  name: 'DialogFormView',components: {
    'form-view': FormView
  },
  props: {
    dialogTitle: {
      type: String,
      default: '编辑'
    },
    dialogWidth: String,
    dialogClassName: String,
    formState: Object
  },
  setup: (props) => {
    const dialogVisible = ref(false);
    const showDialog = async () => {
      dialogVisible.value = true;
      // 清理表单验证
      setTimeout(() => {
        props.formState!.getElFormRef().resetFields();
      });
    };
    const hideDialog = () => {
      dialogVisible.value = false;
    };
    const submitPromise: Ref<null | Promise<void>> = ref(null);
    const submitFn = async () => {
      if (submitPromise.value) return;
      try {
        console.log('before run submit');
        submitPromise.value = formSubmit.value();
        await submitPromise.value;
        console.log('after run submit');
        hideDialog();
      } catch (e) {
        // 验证异常
        console.log('form dialog validate error', e);
      }
      submitPromise.value = null;
    };
    const formViewRef: Ref<any> = ref(null);
    const formSubmit: Ref<() => Promise<void>> = ref(() => {});
    onMounted(async () => {
      setTimeout(() => {
        formSubmit.value = formViewRef.value!.operations.submitForm;
      })
    });
    return {
      dialogVisible, showDialog, formViewRef, submitFn, hideDialog, submitPromise
    }
  },
  render(h: CreateElement) {
    // todo 右上角小叉处理
    const renderContext = this as any;
    const props = renderContext.$props as any;
    return (
      <el-dialog title={ props!.dialogTitle }
                 visible={ renderContext.dialogVisible }
                 width={ props!.dialogWidth }
                 showClose={ true }
                 className={ props!.dialogClassName }>
        <form-view formState={ props!.formState } ref="formViewRef" showOperations={false}  v-loading={ renderContext.submitPromise !== null} />
        <span slot="footer" class="dialog-footer">
          <el-button onClick={ () => { renderContext.hideDialog() } }>取 消</el-button>
          <el-button type="primary" onClick={ () => { renderContext.submitFn() } }>确 定</el-button>
        </span>
      </el-dialog>
    );
  }
});
