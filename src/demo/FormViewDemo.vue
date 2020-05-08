<template>
  <div class="demo">
    <form-view :formState="formState">
      <template v-slot:operation="operations">
        <el-button @click="operations.submitForm">自定义提交</el-button>
        <el-button @click="operations.resetForm">自定义重置</el-button>
      </template>
    </form-view>
    <dialog-form-view :formState="formStateDialog" ref="formDialog"></dialog-form-view>
    <el-button @click="() => {formDialog.showDialog()}">展示表单对话框</el-button>
  </div>
</template>

<script lang="ts">
  import { FormView } from '@/el-view/FormView';
  import { useFromState } from '@/el-view/FormState';
  import { NullableFormItem } from '@/el-view/DynamicForm';
  import { onMounted, Ref, ref, SetupContext } from '@vue/composition-api';
  import { DialogFormView, DialogFormViewRenderContext } from '@/el-view/DialogFormView';

  // demo列表
  // 表单state（配置，钩子，ElForm额外的props，on，model，onFormValidateSuccess, finishValidate, validateError）
  // onFormValidateSuccess支持promise与默认不返回
  // 验证报错
  // 表单联动
  // 表单验证（验证只会提交一次，todo loading效果?）
  // 表单watch事件
  // 自定义scope
  // 自定义的表单控件，快捷定义
  // 默认props
  export default {
    components: {
      'form-view': FormView,
      'dialog-form-view': DialogFormView
    },
    setup: (props: {}, setupContext: SetupContext) => {
      const formDialog: Ref<null | DialogFormViewRenderContext> = ref(null);
      const formState = useFromState({
        elFormProps: {
          'show-message': true
        },
        elFormEvents: {
          validate: () => {
            console.log('运行验证');
          }
        },
        formModel: {
          isShowInput: 1,
          testInput1: ''
        },
        formOption: () => {
          const res: NullableFormItem[] = [
            {
              formLabel: '测试表单联动',
              tagName: 'el-select',
              modelKey: 'isShowInput',
              attrs: {
                placeholder: ''
              },
              options: [
                {
                  label: '展示两个输入框',
                  value: 2
                },
                {
                  label: '展示两个选择框',
                  value: 1
                }
              ]
            },
            formState.formModel.value.isShowInput === 2
              ? {
                formLabel: '输入框1',
                tagName: 'el-input',
                modelKey: 'testInput1',
                required: true,
                attrs: {
                  placeholder: ''
                }
              }
              : null
          ];
          return res;
        },
        onRuleValidateSuccess: () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        },
        onFinishValidate: () => {
          console.log('validateSuccess called');
        },
        onValidateError: () => {
          console.warn('validateError called');
        }
      });
      const formStateDialog = useFromState({
        elFormProps: {
          'show-message': true
        },
        formModel: {
          testInput1: '',
          testInput2: ''
        },
        formOption: () => {
          const res: NullableFormItem[] = [
            {
              formLabel: '输入框1',
              tagName: 'el-input',
              modelKey: 'testInput1',
              required: true,
              attrs: {
                placeholder: ''
              }
            },
            {
              formLabel: '输入框2',
              tagName: 'el-input',
              modelKey: 'testInput2',
              required: true,
              attrs: {
                placeholder: '输入fail触发验证失败'
              }
            }
          ];
          return res;
        },
        onRuleValidateSuccess: (currModel) => {
          return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
              if (currModel.testInput2 === 'fail') {
                reject(new Error('你输入了fail，所有模拟验证失败'));
              } else {
                resolve('模拟验证成功');
              }
            }, 1000);
          });
        },
        onFinishValidate: (successResult) => {
          console.log('dialog validateSuccess called', setupContext.root.$message.success('验证成功'), successResult);
        },
        onValidateError: (errMsg) => {
          console.warn('dialog validateError called', setupContext.root.$message.error('验证失败: ' + errMsg));
        }
      });
      onMounted(() => {
        console.log('form dialog ref', formDialog.value!.showDialog())
      });
      return {
        formState, formStateDialog, formDialog
      }
    }
  }
</script>
