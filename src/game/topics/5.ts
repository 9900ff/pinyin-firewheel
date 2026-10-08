import type { TopicBankDefinition } from '../../types/game';

export default {
  id: '5',
  name: '成人暧昧',
  description: '含蓄双关、暧昧联想；仅适合成年人自愿参与。',
  adultOnly: true,
  topics: [
    {
      id: '1',
      name: '容易让人想歪的物品',
    },
    {
      id: '2',
      name: '听着暧昧其实很日常的动作',
    },
    {
      id: '3',
      name: '让约会升温的举动',
    },
    {
      id: '4',
      name: '适合两个人独处的地方',
    },
    {
      id: '5',
      name: '暧昧聊天里的称呼',
    },
    {
      id: '6',
      name: '让人脸红的夸奖',
    },
    {
      id: '7',
      name: '有点撩人的穿搭',
    },
    {
      id: '8',
      name: '卧室里能找到的东西',
    },
    {
      id: '9',
      name: '情侣之间的小暗号',
    },
    {
      id: '10',
      name: '让人想靠近的气味',
    },
    {
      id: '11',
      name: '电影里的暧昧场景',
    },
    {
      id: '12',
      name: '适合深夜说的双关话',
    },
  ],
} satisfies TopicBankDefinition;
