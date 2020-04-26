<template>
  <div class="demo">
    <form-view :formState="formState" />
  </div>
</template>

<script lang="ts">
  import FormView from '@/el-view/FormView'
  import { useFromState } from '@/el-view/FormState';
  import { ref } from '@vue/composition-api';
  import { FormItem } from '@/el-view/DynamicForm';

  export default {
    components: {
      'form-view': FormView
    },
    setup: () => {
      // todo 联动
      const formState = useFromState({
        initFormModel: {
          isShowInput: 1
        },
        formOptionGetter: () => {
          let form: FormItem[] = [
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
            }
          ];
          if (formState.formModel.value.isShowInput === 2) {
            form = form.concat([
              {
                formLabel: '输入框1',
                tagName: 'el-input',
                modelKey: 'testInput1',
                attrs: {
                  placeholder: ''
                }
              }
            ]);
          }
          return form;
        }
      });
      return {
        formState
      }
    }
  }
</script>
