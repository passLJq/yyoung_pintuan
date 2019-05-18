const app = getApp()
const util = require("../../utils/util.js")
const areaData = require('../../utils/area.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showBox: { // 属性名
			type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) {
				if (newVal != '' && newVal != null) {
					var bool = false
					if (newVal == 1) {
						bool = true
					}
					this.setData({
						showArea: bool,
						showPx: bool
					})
				}
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
		showArea: false,
		height: 0,
		areaArr: areaData,
		nav: '',
		showPx: false
  },
	ready() {
		var h = wx.getSystemInfoSync().windowHeight - 45
		this.setData({
			height: h
		})
		
	},

  /**
   * 组件的方法列表
   */
  methods: {
		close() {
			this.triggerEvent('bindArea', { 'areaCode': '' });
		},
		ontouchs(e) {
			var code = e.currentTarget.dataset.areacode
			console.log(code)
			if (!code) return
			this.triggerEvent('bindArea', {'areaCode': code })
		},
		goGroup(e) {
			var val = e.currentTarget.dataset.key
			this.setData({
				nav: val
			})
			app.promsg(e.currentTarget.dataset.key == 'O' ? '#' : e.currentTarget.dataset.key)
		}
	}
})
