var app = getApp()
const util = require("../../utils/util.js")

Page({
  data: {
    // 轮播数据
    banner: [],           // 首页轮播数据
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    markShow: true,       // 弹窗遮罩
    isShowRule: true,     // 活动规则弹窗
    // 轮播数据 end
    
    groupBuyData: [],     // 拼团商品数据
    hasMore: true,        // 触底是否继续加载商品列表
    page: 1,              // 拼团商品数据页数
    pageSize: 5,          // 拼团商品每页数量
    classid: '',          // 当前nav选项卡分类id ('' 表示全部)
    rushBuyNav: [         // nav导航选项数据
      {
        name: "全部",
        classid: ""
      }
    ],       
    bottomBarPosition: 0, // 导航选项底部条的left位置
    currentIndex: 0,       // 导航栏当前选项
    isFixTop: false,      // 选项卡是否悬在顶部
    topHeight: 0,         // 顶部高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGroupBuyData() // 获取拼团商品列表数据
    this.getNav() // 获取nav选项卡数据
    this.getBanner() // 获取轮播图数据
    this.getHeaderHeight()  // 获取顶部高度
  },
  // 获取顶部高度
  getHeaderHeight () {
    let topHeight = 0
    try {
      wx.createSelectorQuery().select('#swiper').boundingClientRect((rect) => {
        topHeight += rect.height
        wx.createSelectorQuery().select('#shuoming').boundingClientRect((rect) => {
          topHeight += rect.height
          this.setData({
            topHeight
          })
          console.log(topHeight)
        }).exec()
      }).exec()
    } catch (err) { }
  },
  // 
  onPageScroll: function (e) {
    if (e.scrollTop >= this.data.topHeight) {
      this.setData({
        isFixTop: true
      })
    } else {
      if (this.data.isFixTop) {
        this.setData({
          isFixTop: false
        })
      }
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
    //this.reset()
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
    this.reset()
    this.onLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { page, classid, hasMore } = this.data
    if (!hasMore) return
    page += 1
    this.setData({
      page,
      classid
    })
    this.getGroupBuyData()
  },
  onShareAppMessage() {

  },
  // 重置data数据
  reset() {
    this.setData({
      page: 1,
      classid: '',
      hasMore: true,
      groupBuyData: [],
      rushBuyNav: [{ name: "全部", classid: "" }],
      currentIndex: 0,
      banner: []
    })
  },
  // 获取拼团商品列表
  getGroupBuyData() {
    util.http({
      url: app.globalData.siteUrl + '/Main/Main/GetGroupBuyProListJson',
      data: {
        currpage: this.data.page,
        pageSize: this.data.pageSize,
        classid: this.data.classid
      },
      successBack: this.GroupBuySuccess
    })
  },

  // 获取拼团商品列表成功回调
  GroupBuySuccess(ret) {
    if (ret.data.success && ret.data.status == 1) {
      console.log(ret)
      let { groupBuyData } = this.data
      //获取商品列表长度小于pageSize 则关闭触底加载
      if (ret.data.Data.length < this.data.pageSize) {
        this.setData({
          hasMore: false
        })
      }
      let data = ret.data.Data
      data.forEach(item => groupBuyData.push(item))
      if (ret.data.success) {
        this.setData({
          groupBuyData
        })
      }
    }
  },

  // nav选项卡数据
  getNav () {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetGroupbuyClass',
      successBack: (ret) => {
        if (ret.data.success && ret.data.status == 1) {
          let { rushBuyNav } = this.data
          ret.data.Data.forEach(item => rushBuyNav.push(item))
          this.setData({
            rushBuyNav
          })
          console.log(ret)
          this.getBottomBarPosition() // 计算初始导航底部条的位置
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },

  // 点击选项页
  changeNav: function (e) {
    // nav选项卡页面效果
    let currentIndex = e.currentTarget.dataset.index || 0
    wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
      let bottomBarPosition = e.currentTarget.offsetLeft + Number(ret.width / 2)
      this.setData({
        currentIndex,
        bottomBarPosition
      })
    }).exec()
    // 点击更新拼团数据
    let {classid, page} = this.data
    classid = e.currentTarget.dataset.classid
    page = 1
    this.setData({
      page,
      classid,
      groupBuyData: []
    })
    this.getGroupBuyData()
  },
  
  // 根据导航第一个选项 定义底部条(BottomBarPosition)的位置
  getBottomBarPosition() {
    wx.createSelectorQuery().select('#nav_0').boundingClientRect((ret) => {
      let bottomBarPosition = Number(ret.width / 2)
      this.setData({
        bottomBarPosition
      })
    }).exec()
  },
  // 跳转拼团详情页
  toGroupBuy(e) {
    if (!e.currentTarget.dataset.gbid && !e.currentTarget.dataset.pid) return
    wx.navigateTo({
      url: `/pages/groupbuy/groupbuy?gbid=${e.currentTarget.dataset.gbid}&pid=${e.currentTarget.dataset.pid}`
    })
    //console.log(e)
  },
  // 隐藏或显示活动规则弹窗
  showRule () {
    this.setData({
      markShow: !this.data.markShow,
      isShowRule: !this.data.isShowRule
    })
  },
  // 获取轮播图数据
  getBanner() {
    util.http({
      url: app.globalData.siteUrl + '/Marketing/Groupbuy/GetGroupbuyBoot',
      successBack: (ret) => {
        if (ret.data.success && ret.data.status == 1) {
          let data = ret.data.Data
          let { banner, indicatorDots } = this.data
          if (data.length) {
            banner = data
          } else {
            banner = [{
              soure: "https://images.yyoungvip.com/IMG/tuan_banner.png",
              gbid: '',
              pid: ''
            }]
          }
          // 轮播图只有一张就隐藏指示点
          if (banner.length <= 1) {
            indicatorDots = false
          }
          this.setData({
            banner,
            indicatorDots
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
  golink(e) {
    var pid = e.currentTarget.dataset.pid
    var gbid = e.currentTarget.dataset.gbid
    util.and.clickAds('1005', pid, gbid)
  }
})