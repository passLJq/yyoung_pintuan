// pages/other/success_page/success_page.js
var app = getApp()
const util = require("../../../utils/util.js")
const sharebox = require('../../../Component/sharebox/sharebox.js')
var tiomeout = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgdata: '',
    allping: '',//拼团一共需要多少人
    days: '',
    hours: '00',
    minutes: '00',
    seconds: '00',
    showshare: [false, true], //分享控制
    showtan: false//分享后的第二个弹窗
  },
  toIndex() {
    if (this.data.options.way == 'lndiana') {
      wx.switchTab({
        url: '/pages/lndiana/lndiana',
      })
      return
    }
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  toOrders() {
    if (this.data.options.way == 'lndiana') {
      // 需要分享就跳转分享提示页
      console.log(this.data.options.isshare)
      if (this.data.options.isshare != 0) {
        wx.redirectTo({
          url: '/pages/lndianaShare/lndianaShare?cid=' + this.data.options.cid,
        })
      } else {
        wx.redirectTo({
          url: '/pages/mylndiana/mylndiana',
        })
      }

      // wx.redirectTo({
      //   url: '/pages/mylndiana/mylndiana',
      // })
      return
    }
    wx.switchTab({
      url: '/pages/my_index/my_index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        options: options
      })
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
    var that=this
    if (this.data.options.way =='groupbuynow'){
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetMyGroupbuyDetails?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        ogid:that.data.options.ogid
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        ret = ret.data
        if (ret.status == 1 && ret.success) {
          var that = this
          clearInterval(tiomeout);
          //有几个人需要参团
          let allping = []
          for (var i = 0; i < (ret.Data[0].gbcount - 1); i++) {
            allping.push(1)
          }
          let remaintime=''
          let groudtimes=''
          remaintime = ret.Data[0].ts - ret.Data[0].resobj[0].tpgap;
          console.log(remaintime)
          //倒计时
          if (remaintime > 0) {
            groudtimes = function () {
              if (remaintime <= 0) {
                clearInterval(tiomeout);
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
            tiomeout = setInterval(groudtimes, 1000)
          }else{
            clearInterval(tiomeout);
          }
          this.setData({
            msgdata:ret.Data[0],
            allping: allping
          })
        } else {
          app.promsg(ret.err)
        }
      }
    })
  }
  },
  checkTime: function (i) { //将0-9的数字前面加上0，例1变为01
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  //弹出分享框
  goshare: function () {
    this.setData({
      showshare: [true, true],
      showtan:false
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
    sharebox.sharequan(that, 2, 'group')
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
  },
  //关闭二次弹窗
  closesharebox:function(){
    this.setData({
      showtan: false
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    tiomeout = ''
    clearInterval(tiomeout);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    tiomeout = ''
    clearInterval(tiomeout);
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
  onShareAppMessage: function () {
    var that = this
    let ruid = wx.getStorageSync('SessionUserID')
    if (that.data.options.ruid) {
      ruid = that.data.options.ruid
    }
    this.setData({
      showtan: true
    })
    that.closeshare()
    return {
      title: '【仅剩' + that.data.msgdata.count + '个名额】' +that.data.msgdata.gbtitle,
      imageUrl: that.data.msgdata.gbimg,
      path: '/pages/group_detail/group_detail?orderid=' + that.data.msgdata.orderid + '&ruid=' + ruid
    }
  }
})