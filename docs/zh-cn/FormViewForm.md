# DynamicForm

动态生成element ui表单组件，Demo如下：
```javascript

```

<vuep template="#example"></vuep>

<script v-pre type="text/x-template" id="example">
  <template>
    <dynamic-form :form-option="formOption" :form-model="formModel" />
  </template>

  <script>
    Vue.use(window.compositionElViewForm);
    const { reactive, ref } = window.vueCompositionApi;
    module.exports = {
     setup() {
       const formModel = reactive({});
       let formOption = ref([
         {
           formLabel: '测试表单项',
           tagName: 'el-input',
           modelKey: 'test2',
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
           modelKey: 'test3',
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
           modelKey: 'test4',
           attrs: {
             placeholder: '测试表单项'
           },
           props: {
             clearable: true
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
       const myVal = ref(3);
       return {
         formOption, formModel, myVal
       }
     }
    }
  </script>
</script>

## Level2 ##
