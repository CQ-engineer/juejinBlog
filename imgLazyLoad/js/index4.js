// 基于loading="lazy"实现的(chrome 76 已经支持)
let imgModule = (function () {
  // let columns = [...document.querySelectorAll('.column')];
  // let columns = Array.prototype.slice.call(document.querySelectorAll('.column'));
  let columns = Array.from(document.querySelectorAll('.column'));

  // 数据绑定
  function createHTML(imgData) {
      // 根据服务器返回的图片的宽高，动态计算出图片放在230容器中，高度应该怎么缩放
      // 因为我们后期要做图片的延迟加载，在没有图片之前，我们也需要知道未来图片要渲染的高度，这样才能又一个容器先占位
      imgData = imgData.map(item => {
          let { width, height } = item;
          // width/height = 230/?
          item.realHeight = 230 * height / width;
          item.realWidth = 230;
          return item;
      })
      console.log('imgData', imgData)

      // 每四个数据为一组
      for (let i = 0, length = imgData.length; i < length; i += 4) {
          let everyGroupData = imgData.slice(i, i + 4)

          /* 瀑布流思路：将每一个columns高度获取到，根据高度来进行瀑布流
             everyGroupData中img高度最大的放在高度最小的columns中，高度最小的放在高度最大的columns中
          */

          // 将columns按高度降序
          columns.sort((a, b) => {
              return b.offsetHeight - a.offsetHeight
          })

          // 将图片按高度升序
          everyGroupData.sort((a, b) => {
              return a.height - b.height
          })

          everyGroupData.forEach((item, index) => {
              let { realHeight, title, pic } = item;
              let itemBox = document.createElement('div');
              itemBox.className = "itemBox";
              itemBox.innerHTML = `<div class="imgBox" style="height:${realHeight}px">
                                  <img src="${pic}" alt="" loading="lazy">
                              </div>
                              <p>${title}</p>`
              columns[index].appendChild(itemBox);
          })
      }
  }
  return {
      async init() {
          const imgData = await utils.ajax('./data/data.json');
          createHTML(imgData)
      }
  }
})()
imgModule.init()