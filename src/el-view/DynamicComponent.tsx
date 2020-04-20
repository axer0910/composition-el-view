import { createElement } from '@vue/composition-api';
import { ComponentOptions, VNode, VNodeChildren, VNodeData } from 'vue';
import { Vue } from 'vue/types/vue';

type DynamicComponentChildren = VNodeChildren | DynamicComponentOption | DynamicComponentOption[];

export interface DynamicComponentOption {
  tag: string | VNode;
  options?: VNodeData,
  children?: DynamicComponentChildren
}

interface DynamicComponentProp {
  option: DynamicComponentOption
}

const h = createElement;

const createDynamicComponent = (dynamicComponentOption: DynamicComponentOption) => {
  const { tag, options, children } = dynamicComponentOption;
  return createElement(tag as string, options, children as VNodeChildren);
};

/*
动态创建组件：// todo 感觉这个组件意义不大，后面会删除，直接在DynamicForm组件调用createElement创建组件
tag：既可以传入字符串动态生成，也可以直接传入VNode节点
options：对应生成组件需要传入的props
children：动态组件子节点的内容，可以是普通字符串，jsx数组或节点，或者动态配置对象嵌套
 */
export default {
  props: {
    option: Object
  },
  setup: (props: DynamicComponentProp) => {
    return () => createDynamicComponent(props.option);
  }
}
