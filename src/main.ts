import Vue, { Component } from 'vue';
import App from './demo/FormViewDemo.vue'
import VueCompositionApi from '@vue/composition-api';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { registerHandlers } from '@/el-view/registerElDefaultHandlers';

Vue.use(VueCompositionApi); // 开启Composition Api的支持
Vue.config.productionTip = false;
Vue.use(ElementUI);

// 注册默认的一些element ui配置
registerHandlers();

new Vue({
  render: h => h(App as unknown as Component) // 这里传入composition api组件ts报错了，暂时使用强转
}).$mount('#app');
