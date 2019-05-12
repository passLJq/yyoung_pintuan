const app = getApp()
const util = require("../../utils/util.js")
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
						showArea: bool
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
		areaArr: [
			{"area": "中国", "areaCode": "86" },
			{ "area": "香港", "areaCode": "852" },
			{"area": "澳门", "areaCode": "853" },
			{"area": "台湾", "areaCode": "886" },
			// {"area": "印度(测试)", "areaCode": "91"},
		]
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
		}
	}
})
