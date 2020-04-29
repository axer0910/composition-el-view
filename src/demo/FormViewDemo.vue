<template>
  <div class="demo">
    <form-view :formState="formState" />
  </div>
</template>

<script lang="ts">
  import FormView from '@/el-view/FormView'
  import { useFromState } from '@/el-view/FormState';
  import { NullableFormItem } from '@/el-view/DynamicForm';
  import { onMounted, watch } from '@vue/composition-api';

  export default {
    components: {
      'form-view': FormView
    },
    setup: () => {
      const formState = useFromState({
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
                attrs: {
                  placeholder: ''
                }
              }
              : null
          ];
          return res;
        }
      });
      onMounted(() => {
        formState.getElFormRef().clearValidate();
      });
      watch(() => formState.formModel.value.isShowInput, () => {
        console.warn('run change', formState.formModel.value.isShowInput);
      });
      watch(() => formState.formModel.value.testInput1, () => {
        console.warn('run change2', formState.formModel.value.isShowInput);
      });
      watch(() => formState.formModel, () => {
        console.warn('form model change', formState.formModel);
      });
      return {
        formState
      }
    }
  }
</script>
