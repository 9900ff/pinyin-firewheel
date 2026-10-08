import type { TopicBankDefinition } from '../../types/game';

export default {
  id: '2',
  name: '日常联想',
  description: '从生活经验出发，熟悉但不止一种答案。',
  topics: [
    {
      id: '1',
      name: '品牌',
    },
    {
      id: '2',
      name: '游戏',
    },
    {
      id: '3',
      name: '电影 / 电视剧',
    },
    {
      id: '4',
      name: '校园里的东西',
    },
    {
      id: '5',
      name: '酒桌上能看到的东西',
    },
    {
      id: '6',
      name: '便利店里卖的东西',
    },
    {
      id: '7',
      name: '出门旅行会带的东西',
    },
    {
      id: '8',
      name: '上班会用到的东西',
    },
    {
      id: '9',
      name: '早餐会吃的东西',
    },
    {
      id: '10',
      name: '下雨天会想到的东西',
    },
    {
      id: '11',
      name: '手机里的应用',
    },
    {
      id: '12',
      name: '周末会做的事',
    },
  ],
} satisfies TopicBankDefinition;
