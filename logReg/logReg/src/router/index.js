import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import logReg from '@/components/logReg'
import game from '@/components/game'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/logReg',
      name: 'logReg',
      component: logReg
    },
    {
      path: '/game',
      name: 'game',
      component: game
    }
  ]
})
