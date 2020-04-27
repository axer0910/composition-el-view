<template>
  <div class="demo">
    <DynamicForm :formOption="formOption" :formModel="formModel" />
  </div>
</template>

<script lang="ts">
  import { FormItem, DynamicForm } from '@/el-view/DynamicForm';
  import { createElement, reactive, ref } from '@vue/composition-api';

  export default {
    components: {
      DynamicForm
    },
    setup: () => {
      const formModel = reactive({});
      let formOption = ref([
        {
          formLabel: '测试表单项',
          tagName: 'el-input',
          modelKey: 'test-val.test2',
          props: {
            type: 'text'
          },
          attrs: {
            placeholder: '测试表单项'
          }
        },
        {
          formLabel: '测试表单项3',
          tagName: 'el-input',
          modelKey: 'test-val.test3',
          props: {
            type: 'text'
          },
          attrs: {
            placeholder: '测试表单项'
          }
        },
        {
          formLabel: '测试表单项4',
          tagName: 'el-select',
          modelKey: 'test-val.test4',
          attrs: {
            placeholder: '测试表单项'
          },
          options: [
            {
              label: 'test1',
              value: 1
            },
            {
              label: 'test2',
              value: 2
            }
          ]
        }
      ]);
      setTimeout(() => {
        formOption.value = [];
      }, 2000);
      return {
        formOption, formModel
      }
    }
  }
</script>
