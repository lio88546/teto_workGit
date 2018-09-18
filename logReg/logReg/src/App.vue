<template>
  <div id="app">
    <router-view :socket="socket" :memberData="memberData"></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
      //與伺服器建立連結
      socket : io.connect("http://192.168.30.117:8542"),
      memberData:{}
    }
  },
  mounted() {
    this.socket.on('loginMemberData', (data) => {//監聽登入成功的會員資料
      this.memberData = Object.assign(this.memberData,data.loginResult);
    });
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
