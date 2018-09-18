<template>
  <el-row :gutter="0">
    <el-col :span="6" :offset="9">
      <div v-show="member.hint!=''">
        <p style="font-size: 2.5em ; font-weight: bold">{{member.hint}}</p>
      </div>
      <div id="regs"  v-if="member.act=='regs'">
        <h2>註冊會員</h2>
        <p>帳號/暱稱：</p>
        <el-input style="width:20em" v-model="registerData.name" placeholder="請輸入帳號/暱稱"></el-input>
        <br>
        <p>密碼：</p><el-input type="password" style="width:20em" v-model="registerData.psw" placeholder="請輸入密碼"></el-input>
        <br>
        <p>本名：</p><el-input type="text" style="width:20em" v-model="registerData.realName" placeholder="請輸入您的本名"></el-input>
        <br>
        <p>性別：</p>
        <el-radio v-model="registerData.sex" label="male">男</el-radio>
        <el-radio v-model="registerData.sex" label="female">女</el-radio>
        <el-radio v-model="registerData.sex" label="other">中性</el-radio>
        <br>
        <p>年齡：</p>
        <el-select v-model="registerData.age" placeholder="請選擇年齡區間">
          <el-option
            v-for="item in ageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <br>
        <p>國家：</p>
        <el-select v-model="registerData.country" placeholder="請選擇國家">
          <el-option
            v-for="item in countryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <br>
        <p>地址：</p><el-input type="text" style="width:20em" v-model="registerData.address" placeholder="請輸入地址"></el-input>
        <br>
        <p>電話：</p><el-input type="text" style="width:20em" v-model.number="registerData.phone" placeholder="請輸入您的本名"></el-input>
        <br><br>
        <button @click="member.act='login'">返回</button> <button @click="regs()">註冊</button>
      </div>
      <div id="login" else v-if="member.act=='login'">
        <h2>會員登入</h2>
        <p>帳號/暱稱：</p>
        <el-input style="width:20em" v-model="loginData.name" placeholder="請輸入帳號/暱稱"></el-input>
        <br>
        <p>密碼：</p><el-input type="password" style="width:20em" v-model="loginData.psw" placeholder="請輸入密碼"></el-input>
        <br><br>
        <button @click="member.act='regs'">註冊</button> <button @click="login()">登入</button>
      </div>
    </el-col>
  </el-row>
</template>

<script>

export default {
  name: 'logReg',
  props:['socket'],
  data () {
    return {
      loginData:{//登入資料
        task:"",
        name:"",
        psw:""
      },
      registerData:{//註冊資料
        task:"",
        name:"",
        psw:"",
        realName:"",
        sex:"",
        age:"",
        country:"",
        address:"",
        phone:""
      },
      ageOptions: [//年齡選項
        {
          value: '<=19',
          label: '19歲(含)以下'
        }, {
          value: '20~24',
          label: '20至24歲'
        }, {
          value: '25~29',
          label: '25至29歲'
        }, {
          value: '30~34',
          label: '30至34歲'
        }, {
          value: '35~39',
          label: '35至39歲'
        }, {
          value: '>=40',
          label: '40歲(含)以上'
        }
      ],
      countryOptions:[//國家選項
        {
          value: 'taiwan',
          label: '台灣'
        }, {
          value: 'china',
          label: '中國'
        }, {
          value: 'japan',
          label: '日本'
        }, {
          value: 'USA',
          label: '美國'
        }, {
          value: 'korea',
          label: '韓國'
        }, {
          value: 'thailand',
          label: '泰國'
        }
      ],
      member:{//會員頁面控制項
        is_member:false,
        act:"login",
        hint:"",
      }
    }
  }, 
  mounted() {

    //向伺服器發送的訊息，確認連接狀況良好
    this.socket.emit('condition',{condition:'logReg Client Connection!'});
    //接收伺服器發送的訊息，確認連接狀況良好
    this.socket.on('message', function(msg){
      console.log(msg.connection);
    });

    //開啟監聽接註冊回應
    this.socket.on('regsResult',(result) => {
      this.member.act = "";
      if(result.response == 'success'){
        this.member.hint = this.registerData.name+"註冊成功，現在將導向到登入頁面";
      } else {
        this.member.hint = "註冊失敗";
      }
      setTimeout( () => {
        this.member.hint = "";
        this.member.act = "login";
      },3000);
    });
    //開啟監聽接登入回應
    this.socket.on('logResult',(result) => {
      if(result.response == 'success'){
        this.member.act = "";
        this.member.hint = this.loginData.name+"登入成功，現在將導向到遊戲頁面";
        setTimeout( () => {
          this.member.hint = "";
          this.$router.push({ path: `/game` });
          //this.member.is_member = true;
        },3000);
      } else {
        this.member.act = "";
        this.member.hint = "帳號/密碼錯誤";
        setTimeout( () => {
          this.member.hint = "";
          this.member.act = "login";
        },3000);
      }
    });
  },
  methods:{
    regs(){
      this.registerData.task = "regs";
      if(this.check(this.registerData)){
        //至server處理
        this.socket.emit('regs',this.registerData);
      } else {
        alert("ERROR");
      }
    },

    login(){
      this.loginData.task = "login";
      if(this.check(this.loginData)){
        //至server處理
        
        this.socket.emit('login',this.loginData);
      } else {
        alert("請輸入暱稱與密碼以進行登入");
      }
    },
    check(Obj){
      let con = true;
      for(name of Object.keys(Obj)){
        if(Obj[name]=="" && name!="address" && name!="phone"){
          console.log(name);
          con = false;
          break;
        }
      }
      return con;
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  h2{
    text-align: center;
  }

  #login,#regs {
    line-height: 4;
  }


  #regs p, #login p {
    display: inline;
  }
</style>
