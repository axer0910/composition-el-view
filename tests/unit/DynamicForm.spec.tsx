import { createLocalVue, shallowMount, VueClass } from '@vue/test-utils';
import { FormItem, DynamicForm } from '@/el-view/DynamicForm';
import VueCompositionApi, { reactive, Ref, ref } from '@vue/composition-api';
import ElementUI from 'element-ui';
import { registerHandlers } from '@/el-view/registerElDefaultHandlers';
import Vue from 'vue';

describe('DynamicForm.tsx', () => {
  registerHandlers();
  const localVue = createLocalVue();
  localVue.use(VueCompositionApi);
  localVue.use(ElementUI, {
    size: 'small'
  });
  let formOption: Array<FormItem> = [
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
      formLabel: '测试下拉',
      tagName: 'el-select',
      modelKey: 'test-val.test4',
      attrs: {
        placeholder: '测试表单项'
      },
      options: [
        {
          label: '下拉1',
          value: 1
        },
        {
          label: '下拉2',
          value: 2
        }
      ]
    }
  ];
  const formModel = {};
  const wrapper = shallowMount<Vue>(DynamicForm, {
    localVue,
    propsData: {
      formOption,
      formModel: ref(reactive({})).value
    }
  });
  it('should render Dynamic Form', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('should update Dynamic Form when prop change', async (done) => {
    formOption = [
      {
        formLabel: '新的表单项',
        tagName: 'el-input',
        modelKey: 'test-val.test2',
        attrs: {
          placeholder: '新的表单项'
        }
      }
    ];
    wrapper.setProps({
      formOption,
      formModel
    });
    await Vue.nextTick();
    expect(wrapper).toMatchSnapshot();
    done();
  });
  it('should render jsx', async (done) => {
    const h = (wrapper.vm).$createElement;
    formOption = [
      {
        formLabel: 'jsx下拉选项',
        tagName: 'el-select',
        modelKey: 'test-val.test2',
        options: [
          <option value="1">test1</option>,
          <option value="2">test2</option>
        ]
      }
    ];
    wrapper.setProps({
      formOption
    });
    await Vue.nextTick();
    expect(wrapper).toMatchSnapshot();
    done();
  });
  it('should have default emit event', async (done) => {
    const elSelectStubVm = wrapper.findAll('el-select-stub').at(0).vm;
    expect(Reflect.has(elSelectStubVm.$listeners, 'input')).toBe(true);
    done();
  });
  it('default input event should emit model change', async (done) => {
    const elSelectStubVm = wrapper.findAll('el-select-stub').at(0).vm;
    const inputFn = elSelectStubVm.$listeners.input as (val: any) => void;
    inputFn(2);
    const emitted = wrapper.emitted();
    expect(emitted).toEqual({"formChange": [[{"test-val": {"test2": 2}}]]});
    done();
  });
});
