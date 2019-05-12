// pages/my_index/my_index.js
var app = getApp()
const util = require("../../utils/util.js")
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMsg:'',//个人信息
    uid:'',
    orderState: {
      unpay: "", //待付款
      tobesend: "", //待发货
      unreceipt: "", //待收货
      Completed: "" //已完成
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  goaddress:function(){
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.navigateTo({
          url: '/pages/other/address/address'
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '/pages/other/address/address'
      })
    }
  },
  gologin:function(){
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.hideLoading()
      })
    }
  },
  gowechat: function () {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.navigateTo({
          url: '../wechatclear/wechatclear'
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '../wechatclear/wechatclear'
      })
    }
  },
  gogrouporder:function(){
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.navigateTo({
          url: '../group_order/group_order'
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '../group_order/group_order'
      })
    }
  },
  goMyCoupon() {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.navigateTo({
          url: '../my_coupon/my_coupon'
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '../my_coupon/my_coupon'
      })
    }
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
    if (wx.getStorageSync("SessionUserID")) {
      this.setData({
        uid: wx.getStorageSync("SessionUserID")
      })
    }
    if (wx.getStorageSync("SessionUserID")){
     //获取个人信息
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetMemberJson?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID")
      },
      loading_icon: 1,
      header: 1,
      successBack: (ret) => {
        if (ret && ret.data.status == 1) {
          //在其他客户端开店后这里可以刷新开店
          if (wx.getStorageSync('fxshopid') == ''){
            if(ret.data.Data.fxshopid!=''){
              wx.setStorageSync('fxshopid', ret.data.Data.fxshopid)
            }
          }
          this.setData({
            userMsg: ret.data.Data
          })
        }
      }
    })
    //获取订单数量
    util.http({
      url: app.globalData.siteUrl + '/Main/Member/GetOrderCountJson?devicetype=5',
      data: {
        uid: wx.getStorageSync("SessionUserID"),
        wxprogram: 1
      },
      loading_icon: 1,
      header: 1,
      successBack: (ret) => {
        if (ret && ret.data.status == 1) {
          let data = ret.data.Data
          let unpay = 0
          let tobesend = 0
          let unreceipt = 0
          let Completed = 0
          data.forEach((item, idx) => {
            switch (item.state) {
              case 10: //待付款
                unpay = item.count
                break;
              case 20: //待发货
                tobesend = item.count
                Completed += item.count
                break;
              case 30: //待收货
                unreceipt = item.count
                Completed += item.count
                break;
              case 40: //已完成
                Completed += item.count
                break;
            }
          })
          this.setData({
            orderType: ret.data.Data,
            orderState: {
              unpay: unpay, //待付款
              tobesend: tobesend, //待发货
              unreceipt: unreceipt, //待收货
              Completed: Completed, //已完成
            }
          })
        }
      }
    })
    }
  },
  // 跳转我的夺宝
  goMylndiana() {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        wx.navigateTo({
          url: '/pages/mylndiana/mylndiana',
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '/pages/mylndiana/mylndiana',
      })
    }
  },
  gokanjia(){
    app.promsg('尚未开启，敬请期待！')
  },
  // 跳转我的订单
  toOrder(e) {
    let type = parseInt(e.currentTarget.dataset.type)
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.setData({
          uid: wx.getStorageSync("SessionUserID"),
          ruid: wx.getStorageSync("ruid"),
          fxshopid: wx.getStorageSync("fxshopid")
        })
        wx.navigateTo({
          url: type ? '../order/order?type=' + type : '../order/order',
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: type ? '../order/order?type=' + type : '../order/order',
      })
    }

  },
  // 跳转售后
  toAfterSale() {
    if (!wx.getStorageSync('SessionUserID')) {
      app.showLoading("登录中")
      CheckLoginStatus.checksession(() => {
        this.setData({
          uid: wx.getStorageSync("SessionUserID"),
          ruid: wx.getStorageSync("ruid"),
          fxshopid: wx.getStorageSync("fxshopid")
        })
        wx.navigateTo({
          url: '/pages/other/aftersale/aftersale',
        })
        wx.hideLoading()
      })
    } else {
      wx.navigateTo({
        url: '/pages/other/aftersale/aftersale',
      })
    }
  },
  // 跳转消息中心
  gomessagelist: function () {
    wx.navigateTo({
      url: '../messagelist/messagelist'
    })
  },
  // 跳转官方客服
  toShopGroup() {
    wx.navigateTo({
      url: '/pages/other/shopgroup/shopgroup',
    })
  },
  //跳转我的优惠券
  gomycounp(){
    wx.navigateTo({
      url: '/pages/other/mycoupon/mycoupon',
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  }
})