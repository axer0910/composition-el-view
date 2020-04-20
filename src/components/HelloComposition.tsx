import { computed, createElement, reactive, Ref } from '@vue/composition-api';

interface MyReactive {
  count: number,
  readonly double: number // computed属性返回的对象是只读的，同时返回的是一个Ref包装对象
}

const h = createElement;

/*
官方composition小例子
 */
export default {
  setup: () => {
    const state: MyReactive = reactive({
      count: 0,
      double: computed(() => state.count * 2)
    });

    function increment() {
      state.count++
    }

    return () => (
      <div>
        <el-button onClick={increment}>
          Count is: { state.count }, double is: { state.double }
        </el-button>
      </div>
    );
  }
}
