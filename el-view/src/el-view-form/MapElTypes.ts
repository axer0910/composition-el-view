// 映射Element UI自带组件的props类型

import { RefComponentType } from '../main';
import { ElInput } from 'element-ui/types/input';
import { ElSelect } from 'element-ui/types/select';
import { ElCheckbox } from 'element-ui/types/checkbox';
import { ElOption } from 'element-ui/types/option';
import { ElRadio } from 'element-ui/types/radio';
import { ElCascader } from 'element-ui/types/cascader';
import { ElSwitch } from 'element-ui/types/switch';

type ElElementPropMap = {
  'el-input': RefComponentType<ElInput> & {[key: string]: any},
  'el-select': RefComponentType<ElSelect> & {[key: string]: any},
  'el-checkbox': RefComponentType<ElCheckbox> & {[key: string]: any},
  'el-option': RefComponentType<ElOption> & {[key: string]: any},
  'el-radio': RefComponentType<ElRadio> & {[key: string]: any},
  'el-cascader': RefComponentType<ElCascader> & {[key: string]: any},
  'el-switch': RefComponentType<ElSwitch> & {[key: string]: any},
  '': {[key: string]: any} // 兜底，没有找到el element的类型返回任意类型
};

export type ElPropMapKeys = keyof ElElementPropMap;

export type MapElPropsAttributes<ElTagName extends keyof ElElementPropMap> = Partial<ElElementPropMap[ElTagName]>
