const app = getApp()
const utils = require('../../utils/util.js')

function noscoll() {
  //禁止遮罩层滑动
}

function closeshare(that) {
  that.setData({
    showshare: [false, true]
  })
  console.log(111)
}
//下载图片异步处理
function downImgPic(srctring) {
  return new Promise((resolve, reject) => {
    console.log(srctring)
    wx.getImageInfo({
      //src: String("https://images.yyoungvip.com/W/201807/vvv.png"),
      src: String(srctring.replace('http://', 'https://')),
      success: function(res) {
        resolve(res)
      },
      fail: function(err) {
        reject()
      }
    })
  })
}
//圆形头像
function circleImg(ctx, img, x, y, r) {
  ctx.save();
  var d = 2 * r;
  var cx = x + r;
  var cy = y + r;
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(img, x, y, d, d);
  ctx.restore();
}
//文字换行解析
function textline(str, ctx, initX, initY, lineHeight, maxWidth){
  var lineWidth = 0;
  var canvasWidth = ctx.width;
  var lastSubStrIndex = 0;
  var columns = 0;
  for (var i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;
    if (lineWidth > maxWidth && columns < 2) {//减去initX,防止边界出现的问题
      columns += 1
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
      initY += lineHeight;
      lineWidth = 0;
      lastSubStrIndex = i;
    } else if ((maxWidth - lineWidth) <= 40 && columns > 0) {
      ctx.fillText(str.substring(lastSubStrIndex, i) + "...", initX, initY);
      return;
    } else if ((maxWidth - lineWidth) >=0 && columns == 1 && i == (str.length - 1)){
      ctx.fillText(str.substring(lastSubStrIndex, i+1), initX, initY);
      return;
    }
     else if ((maxWidth - lineWidth) >0 && columns ==0&&i==(str.length-1)){
      ctx.fillText(str.substring(lastSubStrIndex, i+1), initX, initY);
      return;
    }
  }
}
//分享到朋友圈生成图片
//sharptye 1是group_detail页面 2是success_page页面 3是lndianaShare页面
//types group是拼团分享海报 lndiana是夺宝分享海报
function sharequan(that, sharptye, types) {
  var sharethis = this
  var ruid
  wx.showLoading({
    title: '生成海报中...',
    mask:true
  })
  //清空海报
  that.setData({
    haibao: ''
  })
  //关闭分享框
  that.setData({
    showshare: [true, false]
  })
  let proimg=[]
  //图片下载地址
  if (types =='group'){
    let orderid = ''
    if (sharptye == 1) {
      let ruid = that.data.options.ruid || wx.getStorageSync("SessionUserID")
      orderid = that.data.options.orderid + 'A' + ruid
    } else if (sharptye == 2){     
      orderid = that.data.msgdata.orderid + 'A' + wx.getStorageSync("SessionUserID")
    }
    utils.diz(orderid, 11, 76, function (ret) {
      if (sharptye == 1) {
        var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ret.data.nValue + '&page=pages/group_detail/group_detail&width=430&devicetype=5'
        console.log(erweima)
        proimg = [that.data.msgdata.imgphoto, that.data.msgdata.shareimg, erweima]
        // proimg = [that.data.msgdata.imgphoto, that.data.msgdata.imgphoto, that.data.msgdata.imgphoto]
      } else if (sharptye == 2) {
        var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ret.data.nValue + '&page=pages/group_detail/group_detail&width=430&devicetype=5'
        // proimg = [that.data.msgdata.resobj[0].userimg, that.data.msgdata.resobj[0].userimg, erweima]
        proimg = [that.data.msgdata.resobj[0].userimg, that.data.msgdata.gbimg, erweima]
        // proimg = [that.data.msgdata.resobj[0].userimg, that.data.msgdata.resobj[0].userimg, erweima]
      }
      //下载图片
      downImgPic(proimg[0]).then(function (res) {
        proimg.splice(0, 1, res.path)
        downImgPic(proimg[1]).then(function (ress) {
          proimg.splice(1, 1, ress.path)
          downImgPic(proimg[2]).then(function (resss) {
            proimg.splice(2, 1, resss.path)
            //拼团画画
            drawpingtuan(that, proimg, sharptye)
          }).catch(function () {
            app.promsg('二维码获取失败')
            wx.hideLoading
          })
        }).catch(function () {
          app.promsg('商品图片获取失败')
          wx.hideLoading
        })
      }).catch(function (e) {
        app.promsg('头像获取失败')
        wx.hideLoading
      })
    })
  } else if (types == 'lndiana') {
    let imgArr = []
    if (sharptye == 3) {
      // 1 用户头像  2 商品图片  3 二维码
      let str = ''
      str += that.data.options.cid || that.data.options.cloudid
      str += 'A'
      str += wx.getStorageSync("SessionUserID")
      utils.diz(str, 11, 76, function (ret) {
        var erweima = app.globalData.siteUrl + '/Main/WechatApi/GetWxacodeun?scene=' + ret.data.nValue + '&page=pages/lndiresult/lndiresult&width=430&devicetype=5'
        console.log(ret.data.nValue)
        // imgArr = [that.data.userData.userimg, that.data.msg.proimg, erweima]
        imgArr = [that.data.userData.userimg, that.data.msg.proimg, erweima]
        // 下载图片
        downImgPic(imgArr[0]).then(function (res) {
          imgArr.splice(0, 1, res.path)
          downImgPic(imgArr[1]).then(function (ress) {
            imgArr.splice(1, 1, ress.path)
            downImgPic(imgArr[2]).then(function (resss) {
              imgArr.splice(2, 1, resss.path)
              //获取图片完毕 开始画画
              console.log(imgArr)
              drawduobao(that, imgArr, sharptye)
            }).catch(function (e) {
              console.log(e)
              app.promsg('二维码获取失败')
              wx.hideLoading
            })
          }).catch(function () {
            app.promsg('商品图片获取失败')
            wx.hideLoading
          })
        }).catch(function (e) {
          app.promsg('头像获取失败')
          wx.hideLoading
        })
      }) 
    }
    
  }
}
//拼团图画画
function drawpingtuan(that, proimg, sharptye){
  let proname, gbprice, productprice, username
  if (sharptye==1){
    proname = that.data.msgdata.proname
    gbprice = that.data.msgdata.gbprice
    productprice = that.data.msgdata.productprice
    username = that.data.msgdata.realname
  } else if (sharptye == 2){
    proname = that.data.msgdata.proname
    gbprice = that.data.msgdata.gbprice
    productprice = that.data.msgdata.productprice
    username = that.data.msgdata.resobj[0].username
  }
  console.log(2)
  const ctxs = wx.createCanvasContext('canvasCircle1')
  //获取图片完成 开始画画
  ctxs.drawImage('/image/pingtuanback.jpg', 0, 0, 375, 650)
  //头像
  circleImg(ctxs, proimg[0], 148, 67, 40)
  //文字
  ctxs.setFontSize(16)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#EB6100')
  ctxs.fillText('“' + username + '”', 191, 170)
  //商品文字
  ctxs.setFontSize(20)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#666464')
  textline(proname, ctxs, 188, 210, 30, 240)
  //商品图片
  ctxs.drawImage(proimg[1], 140, 260, 100, 100)
  //拼团价
  ctxs.drawImage('/image/pintuan@3x.png', 120, 415, 58, 18)
  //价格
  ctxs.setFontSize(28)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#E69888')
  ctxs.fillText("¥" + gbprice, 150, 405)
  ctxs.setFontSize(16)
  ctxs.setTextAlign('left')
  ctxs.setFillStyle('#b2b2b2')
  var gbpricewidth = ctxs.measureText(gbprice).width
  ctxs.fillText("¥" + productprice, 160 + Number(gbpricewidth), 405)
  //原价删除线
  var productpriceWidth = ctxs.measureText("¥" + productprice).width
  ctxs.setFillStyle('#999999')
  ctxs.beginPath()
  ctxs.moveTo(160 + Number(gbpricewidth), 400)
  ctxs.lineTo(160 + Number(gbpricewidth) + Number(productpriceWidth), 400)
  ctxs.stroke()
  //二维码
  ctxs.drawImage(proimg[2], 140, 480, 100, 100)
  //结束语
  // ctxs.setFontSize(16)
  // ctxs.setTextAlign('center')
  // ctxs.setFillStyle('#999999')
  // ctxs.fillText("长按识别小程序码一起拼团吧", 191, 510)
  //最后绘画
  ctxs.draw(false, function (e) {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 375,
      height: 650,
      destWidth: 1125,
      destHeight: 1950,
      quality: 1,
      canvasId: 'canvasCircle1',
      success: function (ret) {
        wx.hideLoading()
        that.setData({
          haibao: ret.tempFilePath
        })
      }
    })
  })
}
// 夺宝海报制作
function drawduobao(that, imgArr, sharptye) {
  // console.log(that.data.msg)
  let proname, cloudPrice, proprice, username
  if (sharptye == 3) {
    proname = that.data.msg.proname
    cloudPrice = that.data.msg.cloudPrice
    proprice = that.data.msg.proprice
    username = that.data.userData.username
  }
  const ctxs = wx.createCanvasContext('canvasCircle1')
  //获取图片完成 开始画画
  ctxs.drawImage('/image/choujiangback.jpg', 0, 0, 375, 650)
  //头像
  circleImg(ctxs, imgArr[0], 148, 67, 40)
  //文字
  ctxs.setFontSize(16)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#EB6100')
  ctxs.fillText('“' + username + '”', 191, 170)
  //商品文字
  ctxs.setFontSize(20)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#666464')
  textline(proname, ctxs, 188, 210, 30, 240)
  //商品图片
  ctxs.drawImage(imgArr[1], 140, 260, 100, 100)
  //夺宝价
  ctxs.drawImage('/image/duobaojia_icon@3x.png', 120, 415, 58, 18)
  //价格
  ctxs.setFontSize(28)
  ctxs.setTextAlign('center')
  ctxs.setFillStyle('#E69888')
  ctxs.fillText("¥" + cloudPrice, 150, 405)
  ctxs.setFontSize(16)
  ctxs.setTextAlign('left')
  ctxs.setFillStyle('#B2B2B2')
  var cldpricewidth = ctxs.measureText(cloudPrice).width
  ctxs.fillText("¥" + proprice, 170 + Number(cldpricewidth), 405)
  //原价删除线
  var propriceWidth = ctxs.measureText("¥" + proprice).width
  ctxs.setFillStyle('#B2B2B2')
  ctxs.beginPath()
  ctxs.moveTo(170 + Number(cldpricewidth), 400)
  ctxs.lineTo(170 + Number(cldpricewidth) + Number(propriceWidth), 400)
  ctxs.stroke()
  //二维码
  // ctxs.drawImage(imgArr[2], 150, 400, 80, 80)
  circleImg(ctxs, imgArr[2], 140, 480, 50)
  // //结束语
  // ctxs.setFontSize(14)
  // ctxs.setTextAlign('center')
  // ctxs.setFillStyle('#999999')
  // ctxs.fillText("长按识别小程序码", 191, 520)
  // // 结束语第二段
  // ctxs.setFontSize(14)
  // ctxs.setTextAlign('center')
  // ctxs.setFillStyle('#999999')
  // ctxs.fillText("一起参加夺宝吧", 191, 540)
  //最后绘画
  ctxs.draw(false, function (e) {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 375,
      height: 650,
      destWidth: 1125,
      destHeight: 1950,
      quality: 1,
      canvasId: 'canvasCircle1',
      success: function (ret) {
        wx.hideLoading()
        that.setData({
          haibao: ret.tempFilePath
        })
      }
    })
  })
}

//保存海报
function savehaibao(that) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            //授权完成
            wx.saveImageToPhotosAlbum({
              filePath: that.data.haibao,
              success(res) {
                app.promsg('保存成功')
              }
            })
          }
        })
      } else {
        wx.saveImageToPhotosAlbum({
          filePath: that.data.haibao,
          success(res) {
            app.promsg('保存成功')
          }
        })
      }
    }
  })
}




module.exports = {
  noscoll: noscoll,
  closeshare: closeshare,
  sharequan: sharequan,
  savehaibao: savehaibao
}