import { defineComponent, onMounted, Ref, ref, SetupContext, watch } from '@vue/composition-api';
import { CreateElement } from 'vue';
import { ComponentRenderProxy } from '@vue/composition-api/dist/component/component';
import { FormViewState } from './FormState';
import { FormView } from './FormView';
import Vue from 'vue';

export type DialogFormViewRenderContext = ComponentRenderProxy & typeof DialogFormView.data;
type DialogFormViewProps = { formState: FormViewState<object> } & typeof DialogFormView.props;

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
  setup: (props, setupContext: SetupContext) => {
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
        submitPromise.value = formSubmit.value();
        await submitPromise.value;
        hideDialog();
      } catch (e) {
        // 验证异常
        console.log('form dialog validate error', e);
      }
      submitPromise.value = null;
    };
    const formViewRef: Ref<any> = ref(null);
    const formSubmit: Ref<() => Promise<void>> = ref(() => {});
    watch(() => dialogVisible.value, async () => {
      if (dialogVisible.value) {
        await Vue.nextTick();
        formSubmit.value = formViewRef.value!.operations.submitForm;
      }
    });
    return {
      dialogVisible, showDialog, formViewRef, submitFn, hideDialog, submitPromise
    }
  },
  render(h: CreateElement) {
    // todo 右上角小叉处理
    const renderContext = this as DialogFormViewRenderContext;
    const props = renderContext.$props as DialogFormViewProps;
    return (
      <el-dialog title={ props!.dialogTitle }
                 visible={ renderContext.dialogVisible }
                 width={ props!.dialogWidth }
                 showClose={ true }
                 class={ props!.dialogClassName }>
        <form-view formState={ props!.formState } ref="formViewRef" showOperations={false} v-loading={ renderContext.submitPromise !== null} />
        <span slot="footer" class="dialog-footer">
          <el-button onClick={ () => { renderContext.hideDialog() } }>取 消</el-button>
          <el-button type="primary" onClick={ () => { renderContext.submitFn() } }>确 定</el-button>
        </span>
      </el-dialog>
    );
  }
});
