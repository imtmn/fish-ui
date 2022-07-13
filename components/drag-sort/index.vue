<template>
  <movable-area class="drag-sort" :style="{height: currentListLength + 'px'}" id="drag">
    <movable-view
      v-for="(item, index) in currentList"
      :key="index"
      :x="0"
      :y="item.y"
      direction="vertical"
      disabled
      damping="40"
      class="drag-sort-item"
      :style="{'height': height + 'px'}"
      :animation="active !== index"
      :class="{'item_active': active === index, 'item_after': item.index > 0}"
      @touchstart="rowTouchstart($event, index)"
      @touchmove="rowTouchmove"
      @touchend="rowTouchend"
    >
      <view class="content" :class="{'offset_content': isLeftMove && index === swipe.index}">
        <view class="content-left">
          <view class="touch_area"><u-icon name="tags"></u-icon></view>
          <view class="context_item">{{item[listKey]}}</view>
          <view class="icon_right"></view>
        </view>
        <view class="content-btn">
          <view class="fn_btn btn_edit" @tap="editItem(item)">编辑</view>
          <view class="fn_btn btn_del" @tap="deleteItem(item)">删除</view>
        </view>
      </view>
    </movable-view>
    <movable-view
      class="touch_move"
      :x="2000"
      :y="0"
      @touchstart="touchstart"
      @touchmove="touchmove"
      @touchend="touchend"
    />
  </movable-area>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    listKey: {
      type: String,
      required: true
    },
    height: {
      type: Number,
      default: 55
    }
  },
  data () {
    return {
      currentList: [],
      active: -1, // 当前激活的item
      itemIndex: 0, // 当前激活的item的原index
      topY: 0, // 距离顶部的距离
      deviationY: 0, // 偏移量
      swipe: {
        index: -1, // 移动的下标
        distance: 100, // 滑动距离
        startX: 0,
        moveX: 0,
        endX: 0
      }
    }
  },
  methods: {
    rowTouchstart (e, index) {
      let state = e.changedTouches[0]
      this.swipe.startX = state.pageX
      this.swipe.index = index
    },
    rowTouchmove (e) {
      let state = e.changedTouches[0]
      this.swipe.moveX = state.pageX
    },
    rowTouchend (e) {
      let state = e.changedTouches[0]
    },
    deleteItem (item) {
      this.swipe.index = -1
      this.$emit('deleteItem', item)
    },
    editItem (item) {
      this.swipe.index = -1
      this.$emit('editItem', item)
    },
    onUpdateCurrentList (list) {
      this.currentList = list.map((item, index) => {
        return {
          ...item,
          sort: index,
          index,
          y: index * this.height,
          animation: true
        }
      })
    },
    touchstart (e) {
		
      // 计算y轴点击位置
      var query = wx.createSelectorQuery().in(this)
      query.select('#drag').boundingClientRect()
      query.exec((res) => {
        this.topY = res[0].top
        let touchY = e.mp.touches[0].clientY - res[0].top
        this.deviationY = touchY % this.height
        // console.log(touchY)
        for (const key in this.currentList) {
          if ((this.currentList[key].index * this.height < touchY) && ((this.currentList[key].index + 1) * this.height > touchY)) {
            this.active = Number(key)
            this.itemIndex = this.currentList[key].index
            break
          }
        }
      })
    },
    touchmove (e) {
		
      if (this.active < 0) return
      let touchY = (e.mp.touches[0].clientY - this.topY) - this.deviationY
      // console.log('touchY', touchY)
      this.currentList[this.active].y = touchY
      for (const key in this.currentList) {
        // 跳过当前操作的item
        if (this.currentList[key].index !== this.currentList[this.active].index) {
          if (this.currentList[key].index > this.currentList[this.active].index) {
            if (touchY > this.currentList[key].index * this.height - this.height / 2) {
              this.currentList[this.active].index = this.currentList[key].index
              this.currentList[key].index = this.currentList[key].index - 1
              this.currentList[key].y = this.currentList[key].index * this.height
              break
            }
          } else {
            if (touchY < this.currentList[key].index * this.height + this.height / 2) {
              this.currentList[this.active].index = this.currentList[key].index
              this.currentList[key].index = this.currentList[key].index + 1
              this.currentList[key].y = this.currentList[key].index * this.height
              break
            }
          }
        }
      }
    },
    touchend (e) {
      if ((this.itemIndex !== this.currentList[this.active].index) && (this.active > -1)) {
        this.$emit('dragSortChange', {
          // 操作值
          data: (() => {
            let data = {
              ...this.currentList[this.active]
            }
            delete data.index
            delete data.y
            delete data.animation
            return data
          })(),
          // 插队的位置前面的值
          preData: (() => {
            for (const iterator of this.currentList) {
              if (this.currentList[this.active].index - 1 === iterator.index) {
                let data = {
                  ...iterator
                }
                delete data.index
                delete data.y
                delete data.animation
                return data
              }
            }
          })(),
		  // 插队的位置后面的值
		  nextData: (() => {
		    for (const iterator of this.currentList) {
		      if (this.currentList[this.active].index + 1 === iterator.index) {
		        let data = {
		          ...iterator
		        }
		        delete data.index
		        delete data.y
		        delete data.animation
		        return data
		      }
		    }
		  })()
        })
      }
      this.currentList[this.active].animation = true
      this.currentList[this.active].y = this.currentList[this.active].index * this.height
      this.active = -1
    }
  },
  computed: {
    currentListLength () {
      return this.currentList.length * this.height
    },
    isLeftMove () {
      return this.swipe.distance < (this.swipe.startX - this.swipe.moveX)
    }
  },
  watch: {
    list: {
      immediate: true,
      deep: true,
      handler (list) {
        this.onUpdateCurrentList(list)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
@mixin flexLayout($align: center, $justify: center, $direction: row, $wrap: nowrap) {
  @if $align == 'start' {
    $align: flex-start
  }
  @if $align == 'end' {
    $align: flex-end
  }
  @if $justify == 'start' {
    $justify: flex-start
  }
  @if $justify == 'end' {
    $justify: flex-end
  }
  display: flex;
  align-items: $align;
  justify-content: $justify;
  flex-direction: $direction;
  flex-wrap: $wrap;
}

// 文字溢出隐藏... (rows - 显示行数)
@mixin overflowEllipsis($rows: 1) {
  white-space: pre-wrap;
  overflow : hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $rows;
}

.drag-sort {
  width: 100%;
  padding-bottom: 198rpx;
  &-item {
    position: absolute !important;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0;
    margin: 0;
    background: #fff;
    box-sizing: border-box;
    width: 750upx;
    overflow: hidden;
    border-top: 1px solid #EEE;
    // position: relative;
    &:first-child {
      border-top: none;
    }
    .content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      transition: .3s all;
      @include flexLayout(center, space-between);
      &-left {
        width: 750upx;
        height: 100%;
        flex: none;
        @include flexLayout(center, flex-start);
        padding: 0 15upx;
        .touch_area {
          width: 30upx;
          height: 30upx;
          background-image: url('http://static.moka.world/wxa/images/mock/icon_drag.png');
          background-size: cover;
          @include flexLayout;
        }
        .context_item {
          flex: 1;
          margin-left: 10rpx;
          @include overflowEllipsis;
        }
        .icon_right {
          width: 24upx;
          height: 24upx;
          background-image: url('http://static.moka.world/wxa/images/mock/arrow-right-bold.png');
          background-size: cover;
        }
      }
      &-btn {
        width: 0;
        flex: none;
        @include flexLayout(center, flex-start);
        transition: .3s all;
        .fn_btn {
          flex: auto;
          height: 100%;
          text-align: center;
          font-size: 32upx;
          color: #FFF;
          line-height: 110upx;
        }
        .btn_edit {
          background: #3c9cff;
        }
        .btn_del {
          background: #f56c6c;
        }
      }
    }
    .offset_content {
      width: 100%;
      .content-left {
        width: 550upx !important;
      }
      .content-btn {
        width: 200upx !important;
      }
    }
  }
}

.item_after {
  position: relative;
  &:before {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #EEE;
    color: #EEE;
    transform-origin: 0 0;
    transform: scaleY(0.5);
  }
}

.touch_move {
  height: 100%;
  width: 50px;
  transform: translateX(0px) translateY(0px) translateZ(0px) scale(1) !important;
}

.item_active {
  box-shadow: 0 0 40rpx #DDDDDD;
  z-index: 99;
}
</style>
