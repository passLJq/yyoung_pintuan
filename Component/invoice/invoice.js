const app = getApp()
const util = require("../../utils/util.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    invType: 0,           // 发票类型
    invWho: 1,            // 发票抬头
    invCon: 1,            // 发票内容
    bus: '',              // 公司名
    den: '',              // 纳税人识别号
    ema: '',              // 邮箱地址
    showPop: false,
    invoiceNumber: '',    // 纳税人识别码
    invoiceJson: ''       // 发票数据
  },
  ready() {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭
    close() {
      this.triggerEvent('close')
    },
    selectType(e) {
      var idx = e.currentTarget.dataset.index
      this.setData({
        invType: idx
      })
      console.log(idx)
    },
    selectWho(e) {
      var idx = e.currentTarget.dataset.index
      this.setData({
        invWho: idx
      })
    },
    selectCon(e) {
      var idx = e.currentTarget.dataset.index
      this.setData({
        invCon: idx
      })
    },
    getbus(e) {
      this.setData({
        bus: e.detail.value
      })
    }, 
    getnum(e) {
      this.setData({
        den: e.detail.value
      })
    }, 
    getema(e) {
      this.setData({
        ema: e.detail.value
      })
    },
    confirmInv() {
      if (this.data.invType != 0) {
        let IcompanyName = this.data.bus.replace(/^\s+/g, '') || ''
        let invoiceNumber = this.data.den.replace(/^\s+/g, '') || ''
        let invoiceEmail = this.data.ema.replace(/^\s+/g, '')
        let invoiceTitle = this.data.invWho
        let invoiceUserName = ''
        let invoiceData = this.data.invCon
        let invoiceType = this.data.invType

        if (invoiceNumber == '' && invoiceTitle == 2) return app.promsg('请输入纳税人识别号！')
        if (IcompanyName == '' && invoiceTitle == 2) return app.promsg('请输入公司名！')
        if (invoiceEmail == '') return app.promsg('请输入收票人邮箱地址！')
        if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(invoiceEmail)) return app.promsg('邮箱地址不正确，请重新输入！')
        this.setData({
          invoiceJson: {
            IcompanyName,
            invoiceUserName,
            invoiceNumber,
            invoiceEmail,
            invoiceTitle,
            invoiceData,
            invoiceType
          }
        })
        // 选择公司则弹窗确认识别号
        if (invoiceTitle == 2) {
          this.setData({
            invoiceNumber,
            showPop: true
          })
        } else {
          this.queren()
        }
      } else {
        this.triggerEvent('getInvData', '')
        this.close()
      }
    },
    closecom() {
      this.setData({
        showPop: false
      })
    },
    queren() {
      var that = this
      // console.log(that.invoiceJson)
      // return 
      this.triggerEvent('getInvData', that.data.invoiceJson)
      that.close()
    }
  }
})