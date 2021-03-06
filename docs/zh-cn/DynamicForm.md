# DynamicForm

动态生成element ui表单组件，Demo如下：
```javascript
module.exports = {
 setup(props, setupContext) {
   const formDialog = ref(null);
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
       return [
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
       const res = [
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
       return new Promise((resolve, reject) => {
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
     console.log('form dialog ref', formDialog.value.showDialog())
   });
   return {
     formState, formStateDialog, formDialog
   }
 }
}
```

<vuep template="#example"></vuep>

<script v-pre type="text/x-template" id="example">
  <template>
    <div>
    <form-view :form-state="formState">
      <template v-slot:operation="operations">
        <el-button @click="operations.submitForm">自定义提交</el-button>
        <el-button @click="operations.resetForm">自定义重置</el-button>
      </template>
    </form-view>
    <dialog-form :form-state="formStateDialog" ref="formDialog"></dialog-form>
    <el-button @click="() => {formDialog.showDialog()}">展示表单对话框</el-button>
    </div>
    
  </template>

  <script>
    Vue.use(window.vueCompositionApi.default);
    Vue.use(window.compositionElViewForm);
    const { onMounted, ref } = window.vueCompositionApi;
    const { useFromState } = window.compositionElViewForm;
    module.exports = {
     setup(props, setupContext) {
       const formDialog = ref(null);
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
           return [
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
           const res = [
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
           return new Promise((resolve, reject) => {
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
         console.log('form dialog ref', formDialog.value.showDialog())
       });
       return {
         formState, formStateDialog, formDialog
       }
     }
    }
  </script>
</script>

## Level2 ##
