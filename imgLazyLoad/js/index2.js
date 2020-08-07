// 基于getBoundingClientRect实现的
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
                                      <img src="" alt="" real-src="${pic}">
                                  </div>
                                  <p>${title}</p>`
                columns[index].appendChild(itemBox);
            })
        }
    }
    let itemBoxs;
    let winH = window.innerHeight || document.documentElement.clientHeight;
    function lazyFunc() {
        console.log('ok!')
        if (!itemBoxs) {   //第一次没有就获取，不用每次获取，提高性能
            itemBoxs = Array.from(document.querySelectorAll('.itemBox'));
        }
        itemBoxs.forEach(itemBox => {
            // 已经处理过则不在处理
            let isLoad = itemBox.getAttribute("isLoad");
            if (isLoad) return;
            /* getBoundingClientRect 
                left: 元素左边距浏览器左边距离
                right: 元素右边距浏览器左边距离
                top: 元素顶边距浏览器顶边距离
                bottom: 元素底边距浏览器顶边距离
            */
            let {
                top,
                bottom
            } = itemBox.getBoundingClientRect();
            if (top <= winH) {
                lazyImgFunc(itemBox);
            }
        })
    }
    function lazyImgFunc(itemBox) {
        let img = itemBox.querySelector("img"),
            trueImg = img.getAttribute("real-src");
        img.src = trueImg;
        img.onload = function () {
            // 图片加载成功
            utils.css(img, 'opacity', 1);
        }
        img.removeAttribute("real-src")
        // 记录图片已经处理过了
        itemBox.setAttribute("isLoad", true)
    }
    return {
        async init() {
            const imgData = await utils.ajax('./data/data.json');
            createHTML(imgData)
            setTimeout(lazyFunc, 500);
            // onscroll触发的频率太高了，滚动一下可能要被触发很多次，导致很多没必要的计算和处理，消耗性能=>我们需要降低onscroll的时候的触发频率 （节流）
            window.onscroll = utils.throttle(lazyFunc, 500);
        }
    }
})()
imgModule.init()