<template>
  <div class="demo">
    <form-view :formState="formState">
      <template v-slot:operation="operations">
        <el-button @click="operations.submitForm">自定义提交</el-button>
        <el-button @click="operations.resetForm">自定义重置</el-button>
      </template>
    </form-view>
  </div>
</template>

<script lang="ts">
  import { FormView } from '@/el-view/FormView';
  import { useFromState } from '@/el-view/FormState';
  import { NullableFormItem } from '@/el-view/DynamicForm';
  import { onMounted } from '@vue/composition-api';

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
      'form-view': FormView
    },
    setup: () => {
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
      onMounted(() => {
        formState.getElFormRef().clearValidate();
      });
      return {
        formState
      }
    }
  }
</script>
