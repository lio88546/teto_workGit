<template>
  <div>
    <div>
      <p>玩家 : {{playerData.name}}</p>
      <p>本金 : {{playerData.money}}</p>
      <p>勝 : {{win}}敗 : {{lose}}</p>
    </div>
    <div>
      下注金額 : <el-input type="number" style="width:20em" v-model="betMoney" placeholder="請輸入想下注的金額"></el-input>
      <button @click="play">下注</button>
    </div> 
  </div>
</template>

<script>

export default {
  name: 'game',
  props:['socket','memberData'],
  data () {
    return {
      playerData : {
        name: '',
        money: 0,
        record: '',
      },
      betMoney: 150
    }
  }, 
  computed:{
    win(){
      let re = this.playerData.record.split('/');
      return re[0];
    },
    lose(){
      let re = this.playerData.record.split('/');
      return re[1];
    }
  },
  mounted() {
    //向伺服器發送的訊息，確認連接狀況良好
    this.socket.emit('condition',{condition:'game Client Connection!'});
    //接收伺服器發送的訊息，確認連接狀況良好
    this.socket.on('message', function(msg){
      console.log(msg.connection);
    });

    //複製一份玩家資料，轉存
    this.playerData = JSON.parse(JSON.stringify(this.memberData[0]));

    //接賭注結果
    this.socket.on('betResult',(data) => {
      this.playerData = data.playerData;
    });
  },
  methods:{
    //玩
    play(){
      this.betMoney = parseInt(this.betMoney);//int轉換
      this.socket.emit('bet',{'betMoney': this.betMoney})
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>