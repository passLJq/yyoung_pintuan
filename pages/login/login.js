// pages/login/login.js
var app=getApp()
const util = require('../../utils/util.js')
var timeout = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    smspassword:'',//验证码返回的数据
    telphone:'',
    smscode  :'',//页面的验证码
    clickon:true,//点击获取验证码
    time:60,//倒计时
    isPageLogin: "",//是否是页面点击触发的
    status:1, //1代表已经用户授权 2是没授权
		showArea: 0,
		areaCode: '86',
		maxlength: 11
  },
	getArea(e) {
		var val = e.detail
		var code = val.areaCode
		var areaCode = this.data.areaCode
		if (code != '' && code != null) {
			areaCode = val.areaCode
		}
		var length = 11
		if (areaCode == 852) {
			length = 8
		} else if (areaCode == 853) {
			length = 8
		} else if (areaCode == 886) {
			length = 10
		}
		// if (timeout != '' && timeout != null) {
		// 	clearInterval(timeout)
		// }
		clearInterval(timeout)
		this.setData({
			showArea: 0,
			areaCode,
			maxlength: length,
			telphone: '',				// 清空号码
			clickon: true,		  // 重置倒计时
			time: 60
		})
	},
	showAreaBox() {
		this.setData({
			showArea: 1
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    options.isPageLogin && this.setData({
      isPageLogin: options.isPageLogin
    })
    //签到活动额标识
    if (options.type) {
      if (options.type == 'qiandao') {
        that.setData({
          qiandao: options.type
        })
      }
    }
    // this.jiancha()
  },
  // jiancha:function(){
  //   var that = this
  //   wx.getSetting({
  //     success: function (res) {
  //       if (!res.authSetting['scope.userInfo']) {
  //         console.log(1)
  //         wx.authorize({
  //           scope: 'scope.userInfo',
  //           success(ret) {
  //             that.setData({
  //               status: 1
  //             })
  //           },
  //           fail(ret) {
  //             that.setData({
  //               status: 2
  //             })
  //           }
  //         })
  //       } else {
  //         that.setData({
  //           status: 1
  //         })
  //       }
  //     },
  //     fail: function (res) {
  //       console.log(res)
  //     }
  //   })
  // },
  bindgetuserinfo:function(e){
    var that=this
    if (e.detail.userInfo) {
      that.que()
    }else{
      wx.showToast({
        title: "为了您更好的体验,请先同意授权",
        icon: 'none',
        duration: 2000
      });
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
  
  },
  bind1:function(e){
    this.setData({
      telphone: e.detail.value
    })
    console.log(this.data.telphone)
  },
  bind2: function (e) {
    this.setData({
      smscode  : e.detail.value
    })
  },
  code:function(e){
    var that = this
		var c = util.checkPhoneNum(that.data.telphone, that.data.areaCode)
		if (!c.bool) {
			app.promsg(c.err)
			return
		}
    //进来就开始倒数
    that.setData({
      clickon: false,
    })
    var star = that.data.time
    var times = function () {
      if (star > 0) {
        var a = star--
        that.setData({
          time: a
        })
      } else {
        clearInterval(timeout);
        that.setData({
          clickon: true,
          time: 60
        })
      }
    }
    timeout = setInterval(times, 1000)
    wx.request({
      url: app.globalData.siteUrl + '/main/Login/SendSMSCode',
      data: {
        telphone: that.data.telphone,
				areaNum: that.data.areaCode == 86 ? '' : that.data.areaCode
      },
      success: function (ret) {
        console.log(ret)
        var ret=ret.data
        if (ret.success) {
          if (ret.status == 1 && ret.Data != null && ret.Data != "") {
            that.setData({
              smspassword: ret.Data
            })
					} else if (ret.status == 4) {
						clearInterval(timeout);
						that.setData({
							clickon: true,
							time: 60
						})
						app.alerts(ret.err)
					} else{
            app.alerts(ret.err)
          }
        }
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },
  que:function(e){
    var that = this
		if (that.data.smscode.length < 4){
      app.promsg('请输入正确的验证码')
      return
    }
		var c = util.checkPhoneNum(that.data.telphone, that.data.areaCode)
		if (!c.bool) {
			app.promsg(c.err)
			return
		}
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.showLoading({
            title: '加载中',
            icon: 'loading',
            mask: true
          });
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (user) {
              wx.request({
                url: app.globalData.siteUrl + '/main/Login/RegisterByWeChat?devicetype=5',
                data: {
                  telphone: that.data.telphone,
                  smscode: that.data.smscode,
                  smspassword: that.data.smspassword,
                  devicetype: 5,
                  encryptedData: user.encryptedData,
                  iv: user.iv,
                  wxsessionkey: wx.getStorageSync('wxsessionkey'),
									areaNum: that.data.areaCode == 86 ? '' : that.data.areaCode
                },
                method:'POST',
                success: function (ret) {
                  wx.hideLoading()
                  console.log("开店了")
                  console.log(ret)
                  var ret=ret.data
                  if(ret.success&&ret.status==1&&ret.data!=''){
                    try {
                      wx.setStorageSync('sessionkey', ret.data.sessionkey)
                      wx.setStorageSync('SessionUserID', ret.data.userid)
                      wx.setStorageSync('fxshopid', ret.data.fxshopid)
                    } catch (e) {

                    }
                    console.log("分销ID")
                    console.log(wx.getStorageSync('fxshopid'))
                      if (!that.data.isPageLogin) {
                          wx.switchTab({
                            url: '../index/index'
                          })
                        } else {
                          wx.navigateBack({
                            delta: 1
                          }) 
                        } 
                    //开店直接到首页
                    // if (ret.data.fxshopid != '' && ret.data.fxshopid!=null){
                    //   if (!that.data.isPageLogin) {
                    //       wx.switchTab({
                    //         url: '../index/index'
                    //       })
                    //     } else {
                    //       wx.navigateBack({
                    //         delta: 1
                    //       }) 
                    //     }                       
                    //   }else{
                    //   if (!that.data.isPageLogin) {
                    //       //签到活动带标识
                    //       if (that.data.qiandao == 'qiandao') {
                    //         wx.redirectTo({
                    //           url: '../yshopset/yshopset?type=' + that.data.qiandao
                    //         })
                    //         //正常流程
                    //       } else {
                    //         wx.redirectTo({
                    //           url: '../index/index'
                    //         })
                    //       }
                    //     }else {
                    //       //优惠劵的跳转返回
                    //     let pages = getCurrentPages()
                    //     if (pages.length > 1) {
                    //       let currentPage = pages[pages.length - 2]
                    //       if (currentPage.route.indexOf("yshopapply") !== -1) {
                    //         wx.redirectTo({
                    //           url: '/pages/yshopset/yshopset'
                    //         })
                    //         return
                    //       }
                    //     }
                    //     //如果是买商品页进来登录的没开店的允许登录了直接买
                    //     if (pages[pages.length - 2].route =="pages/productdetail/productdetail"){
                    //       wx.navigateBack({
                    //         delta: 1
                    //       }) 
                    //     }else{
                    //         //微信解除绑定时在绑新的没开店的号会走这里
                    //         wx.redirectTo({
                    //           url: '/pages/yshopset/yshopset'
                    //         })
                    //     }
                    //   }
                    //   }
                  }else{
                    app.alerts(ret.err)
                  }
                  console.log(ret)
                },
                fail: function (e) {
                  wx.hideLoading()
                  that.alerts(e)
                }
              })

            }
          })
        }
      },
      fail:function(res){
        console.log(res)
      }
    })

  }
})