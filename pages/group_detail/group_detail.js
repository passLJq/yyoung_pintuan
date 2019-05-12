// pages/group_detail/group_detail.js
var app = getApp()
const util = require("../../utils/util.js")
const sharebox = require('../../Component/sharebox/sharebox.js')
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")

var tiomeout_ores=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onec:false,//第一次进来不运行onshwo生命函数
    msgdata:'',
    commit:'',//提示语
    allping:'',//拼团一共需要多少人
    days: '',
    hours: '00',
    minutes: '00',
    seconds: '00',
    btnmessg:'',
    showshare: [false, true], //分享控制
    overtime:false,//倒计时结束了，手动变失败

    skuBoxBottom: false,
    spec: '',         // 规格数据
    gbsku: '',        // 拼团规格
    skutext: '',
    specval: '',
    skuid: '',
    gbskuid: '',
    buyPrice: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    //scene是二维码进来的
    console.log(options)
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      console.log(scene)
      util.diz(scene, 76, 11, function (ret) {
        let aall = []
        aall = ret.data.nValue.split("A")
        console.log(aall)
        //判断分享人是不是自己打开
        if (aall[1] == wx.getStorageSync('SessionUserID')){
          that.setData({
            options: {
              orderid: aall[0],
              ruid:''
            }
          })
        }else{
          that.setData({
            options: {
              orderid: aall[0],
              ruid: aall[1]
            }
          })
        }
        that.bindata()
      })
    }else{
      if (options.ruid == wx.getStorageSync('SessionUserID')){
        that.setData({
          options: {
            orderid: options.orderid
          }
        }) 
      }else{
        that.setData({
          options: options
        })
      }
      that.bindata()
    }
  },
  bindata: function (options){
    var that=this
    setTimeout(function(){
      that.data.onec = true
    },1000)
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetGBOrder?devicetype=5',
      data: {
        orderID: that.data.options.orderid,
        uid: wx.getStorageSync('SessionUserID')
      },
      successBack: (ret) => {
        console.log(ret)
        ret = ret.data
        if (ret.status==1&&ret.success) {
          clearInterval(tiomeout_ores);
          let remaintime = ''
          let commit = ''
          var agroudtimes=''
          var btnmessg=''
          var overtime=false
          if (ret.Data.gbstate == 1) {
            //有这个参数代表和没参加这个拼团
            if (!ret.Data.hasjoin){
              btnmessg='和TA一起拼'
            }else{
              btnmessg = '分享给好友'
            }
            commit = "拼团中，赶紧来和我拼团抢好物吧"
            remaintime = ret.Data.ts - ret.Data.tpgap;
            console.log(remaintime)
            //倒计时
            if (remaintime > 0) {
              agroudtimes = function (){
                if (remaintime <= 0) {
                  clearInterval(tiomeout_ores);
                //有这个参数代表和没参加这个拼团
                  if (!ret.Data.hasjoin) {
                    btnmessg = '我也发起拼团'
                    commit = "此单已失效，快去看看别的拼单吧"
                  } else {
                    btnmessg = '重新开团'
                    commit = "拼团失败，您可以重新发起拼团"
                  }
                  overtime = true
                  that.setData({
                    commit: commit,
                    btnmessg: btnmessg,
                    overtime: overtime
                  })
                  return;
                }
                var showhtml = "";
                remaintime = remaintime - 1;
                var days = parseInt(remaintime / 60 / 60 / 24); //计算剩余的天数
                var hours = parseInt(remaintime / 60 / 60 % 24); //计算剩余的小时
                var minutes = parseInt(remaintime / 60 % 60);//计算剩余的分钟
                var seconds = parseInt(remaintime % 60);//计算剩余的秒数
                if (days != 0) {
                  showhtml += days + "天";
                }
                if (hours != 0) {
                  showhtml += hours + "：";
                }
                minutes = that.checkTime(minutes);
                seconds = that.checkTime(seconds);
                that.setData({
                  days: days,
                  hours: hours,
                  minutes: minutes,
                  seconds: seconds
                })
              }
              tiomeout_ores = setInterval(agroudtimes, 1000)
              //后台有延迟 直接前端
            }else{
              clearInterval(tiomeout_ores);
              //有这个参数代表和没参加这个拼团
              if (!ret.Data.hasjoin) {
                btnmessg = '我也发起拼团'
                commit = "此单已失效，快去看看别的拼单吧"
              } else {
                btnmessg = '重新开团'
                commit = "拼团失败，您可以重新发起拼团"
              }
            }
          } else if (ret.Data.gbstate == 2) {
           //有这个参数代表和他完成拼团了
            if (!ret.Data.hasjoin) {
              btnmessg = '我也发起拼团'
              commit = '此单已成团，快去看看别的拼单吧'
            } else {
              btnmessg = '查看订单详情'
              commit = '拼团成功，商品很快就来到你身边'
            }
          } else{
            //有这个参数代表和他完成拼团了
            if (!ret.Data.hasjoin) {
              btnmessg = '我也发起拼团'
              commit = "此单已失效，快去看看别的拼单吧"
            } else {
              btnmessg = '重新开团'
              commit = "拼团失败，您可以重新发起拼团"
            }
          }
          //有几个人需要参团
          let allping = []
          for (var i = 0; i < (ret.Data.gbnum - 1); i++) {
            allping.push(1)
          }
          that.setData({
            msgdata: ret.Data,
            commit: commit,
            allping: allping,
            btnmessg: btnmessg,
            overtime: overtime
          })

          // 读规格参数
          if (ret.Data.gbskucount > 0) {
            this.getSku()
          }

        } else {
          app.promsg(ret.err)
        }
      }
    })
  },
  // 读取规格数据
  getSku() {
    var that = this
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductSkuJson',
      data: {
        productId: that.data.msgdata.proid,
        gbid: that.data.msgdata.gbid
      },
      successBack: (ret) => {
        console.log(ret)
        let data = ret.data.Data
        let bus = ''
        //拼团读另一个规格
        bus = ret.data.Data.gbsku[0].gbskuPrice.toFixed(2)
        this.setData({
          spec: ret.data.Data.spec,
          gbsku: ret.data.Data.gbsku,
          gbskuid: ret.data.Data.gbsku[0].gbroductskuid,
          sku: ret.data.Data.sku,
          skutext: ret.data.Data.sku[0].skutext,
          specval: ret.data.Data.sku[0].specval,
          skuid: ret.data.Data.sku[0].skuid,
          buyPrice: bus,
        })
      }
    })
  },
  changSku(e) {
    var that = this
    var oldspecval = this.data.specval.split(",")
    oldspecval[e.currentTarget.dataset.len] = e.currentTarget.dataset.valueid
    this.setData({
      specval: oldspecval.toString()
    })
    this.data.sku.forEach((item, idx) => {
      let bus = ''
      //拼团读另一个规格
      bus = Number(this.data.gbsku[idx].gbskuPrice).toFixed(2)
      item.specval == this.data.specval && this.setData({
        skuid: this.data.sku[idx].skuid,
        gbskuid: this.data.gbsku[idx].gbroductskuid,
        specval: this.data.sku[idx].specval,
        skutext: this.data.sku[idx].skutext,
        buyPrice: bus,
      })
    })
  },
  // 拼团
  realgbuy() {
    var that = this
    CheckLoginStatus.checksession(() => {
      // 有规格参团
      wx.navigateTo({
        url: '/pages/ordercomfirm/ordercomfirm?way=groupbuynow&buyCounts=1&skutext=' + that.data.skutext + '&skuid=' + that.data.skuid + '&gbprice=' + that.data.buyPrice + '&pid=' + that.data.msgdata.proid + '&gbid=' + that.data.msgdata.gbid + '&ogid=' + that.data.msgdata.ogid + '&gbskuid=' + that.data.gbskuid
      })
    })
  },
  checkTime: function(i){ //将0-9的数字前面加上0，例1变为01
    if(i<10) {
      i = "0" + i;
    }
    return i;
  },
  //回到首页
  goindex:function(){
      wx.switchTab({
        url: '/pages/index/index',
      })
  },
  gobuy:function(){
    var that=this
    if (that.data.msgdata.gbstate == 1 && that.data.options.ruid){
      if (that.data.msgdata.gbskucount > 0) {
        that.setData({
          skuBoxBottom: true
        })
        return
      }
      CheckLoginStatus.checksession(() => {
        that.buypro()
      })
      return
    }
    //后台有延迟 倒计时结束走这里
    if (that.data.overtime){
      wx.navigateTo({
        url: `/pages/groupbuy/groupbuy?gbid=${that.data.msgdata.gbid}&pid=${that.data.msgdata.proid}`
      })
      return
    }
    if (that.data.msgdata.gbstate==1){
      that.goshare()
    } else if (that.data.msgdata.gbstate >= 3){
      wx.navigateTo({
        url: `/pages/groupbuy/groupbuy?gbid=${that.data.msgdata.gbid}&pid=${that.data.msgdata.proid}`
      })
      //拼单完成了别人打开时
    } else if (that.data.msgdata.gbstate == 2&&that.data.options.ruid){
      wx.navigateTo({
        url: `/pages/groupbuy/groupbuy?gbid=${that.data.msgdata.gbid}&pid=${that.data.msgdata.proid}`
      })
    }
  },
  //和别人一起拼单
  buypro(){
    var that=this
    util.http({
      url: app.globalData.siteUrl + '/Main/Shopping/CheckGroupBuyStatus?devicetype=5',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        gbid: that.data.msgdata.gbid
      },
      header: 1,
      successBack: (ret) => {
        if (ret.data.status == 1 && ret.data.success) {
          let way = 'groupbuynow'
          wx.navigateTo({
            url: '/pages/ordercomfirm/ordercomfirm?way=' + way + '&buyCounts=1&skutext=' + that.data.msgdata.proskutext + '&skuid=' + that.data.msgdata.proskuid + '&gbprice=' + that.data.msgdata.gbprice + '&pid=' + that.data.msgdata.proid + '&ogid=' + that.data.msgdata.ogid + '&gbid=' + that.data.msgdata.gbid+'&ruid='+that.data.options.ruid
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  //弹出分享框
  goshare: function () {
    this.setData({
      showshare: [true, true]
    })
  },
  //关闭分享框
  closeshare: function (index) {
    //1是生成海报时观点弹出框但保留遮罩层
    if (index == 1) {
      this.setData({
        showshare: [true, false]
      })
    } else {
      sharebox.closeshare(this)
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, 1, 'group')
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.onec){
      this.bindata()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    tiomeout_ores = ''
    clearInterval(tiomeout_ores);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    tiomeout_ores = ''
    clearInterval(tiomeout_ores);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that=this
    let ruid = wx.getStorageSync('SessionUserID')
    if (that.data.options.ruid){
      ruid = that.data.options.ruid
    }
    return {
      title: '【仅剩' + that.data.msgdata.num+'个名额】'+that.data.msgdata.sharetitle,
      imageUrl: that.data.msgdata.proimage,
      path: '/pages/group_detail/group_detail?orderid=' + that.data.options.orderid+'&ruid='+ruid,
      success: function (res) {
        // 转发成功
        app.showtips('转发成功')
      },
      fail: function (res) {
        // 转发失败
        app.promsg('转发失败')
      }
    }
  }
})