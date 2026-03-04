<template>
  <view class="page-user-index">
    <view class="items" v-if="(table.dataList||[]).length">
      <uni-swipe-action class="uni-swipe-action">
        <uni-swipe-action-item class="uni-swipe-action-item" v-for="(item,index) in table.dataList" :key="index"
          :right-options="swipeOptions" :autoClose="true" @click="(e)=>handleSwipeClick(e,item)">
          <view class="item" @click="()=>handleEdit(item)">
            <view class="header">
              <view class="name">{{`${item.name} - ${item.code}`}}</view>
              <view class="status" :style="{color:optionsMap['status'].find(r=>r.value===item.status)?.color}">
                {{optionsMap['status'].find(r=>r.value===item.status)?.label}}
              </view>
            </view>
            <view class="content">
              <image class="avatar" :src="item.avatar" mode="aspectFill" ></image>
              <view class="fields">
                <view class="field">
                  <view class="label">Gender:</view>
                  <view class="value">{{optionsMap['gender'].find(r=>r.value===item.gender)?.label}}</view>
                </view>
                <view class="field">
                  <view class="label">Email:</view>
                  <view class="value">{{item.email}}</view>
                </view>
                <view class="field">
                  <view class="label">Address:</view>
                  <view class="value">{{item.address}}</view>
                </view>
                <view class="field">
                  <view class="label">Created At:</view>
                  <view class="value">{{item.createdAt}}</view>
                </view>
              </view>
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
    </view>
    <view class="items empty" v-else>
      暂无数据
    </view>
    <view class="footer-commands">
      <view class="commands">
        <view class="command" @click="handleAdd">新建用户</view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import dayjs from 'dayjs';
  import {
    reactive
  } from 'vue';
  import {
    onShow,
    onPullDownRefresh,
    onReachBottom
  } from '@dcloudio/uni-app';
  import * as userService from '@/services/user.js';

  const optionsMap = {
    status: [{
      value: true,
      label: 'Enabled',
      color: '#1677FF'
    }, {
      value: false,
      label: 'Disabled',
      color: '#FD8428'
    }],
    gender: [{
      value: 0,
      label: 'Unknown',
    }, {
      value: 1,
      label: 'Male',
    }, {
      value: 2,
      label: 'Female',
    }]
  }

  const swipeOptions = [{
    text: '删除',
    style: {
      backgroundColor: '#dd524d',
      borderRadius: '0px 4px 4px 0px'
    }
  }];

  const table = reactive({
    dataList: [],
    page: 1,
    pageSize: 10,
    totalPages: 1,
    total: 0,
  });

  onShow(async () => {
    console.log('page-index onShow')
    getList();
  });

  onPullDownRefresh(() => {
    console.log('onPullDownRefresh')
    table.page = 1;
    table.dataList = []
    getList();
    uni.stopPullDownRefresh();
  });

  onReachBottom(() => {
    console.log('onReachBottom')
    if (table.page >= table.totalPages) {
      uni.showToast({
        title: '没有更多数据了',
        icon: 'none',
        duration: 1000
      })
    } else {
      table.page++
      getList()
    }
  });

  const getList = async () => {
    try {
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      const params = {
        page: table.page,
        limit: table.pageSize
      };
      const res = await userService.getUserPaged(params);
      table.total = res.total;
      table.totalPages = Math.ceil(res.total / table.pageSize);
      const resultList = (res.results || []).map(r => {
        return {
          ...r,
          createdAt: dayjs(r.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs(r.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        };
      });
      if (table.page === 1) {
        table.dataList = resultList || [];
      } else {
        table.dataList = table.dataList.concat(resultList || []);
      }
    } finally {
      uni.hideLoading();
    }
  }

  const handleSwipeClick = async (e, item) => {
    console.log('handleSwipeClick', e, item);
    if (e.index === 0) {
      // 删除
      uni.showModal({
        title: '操作提示',
        content: '此操作将彻底删除当前记录，是否继续？',
        success: async (res) => {
          if (res.confirm) {
            await userService.removeUser(item.id);
            uni.showToast({
              icon: 'none',
              title: '操作成功',
              success: () => {
                table.dataList = table.dataList.filter(r => r.id !== item.id);
              }
            });
          }
        }
      })
    }
  }

  const handleEdit = (item) => {
    console.log('handleEdit', item);
    uni.navigateTo({
      url: `/pages/user/details/details?operateType=edit&userId=${item.id}`
    })
  }

  const handleAdd = () => {
    console.log('handleAdd');
    uni.navigateTo({
      url: '/pages/user/details/details?operateType=add'
    })
  }
</script>

<style lang="scss" scoped>
  .page-user-index {
    min-height: 100%;
    background-color: #eceef5;

    .items {
      padding-bottom: 54px;
      padding-bottom: calc(54px + constant(safe-area-inset-bottom));
      padding-bottom: calc(54px + env(safe-area-inset-bottom));

      &.empty {
        padding-bottom: 0;
        background: #ffffff;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .item {
        margin-bottom: 20rpx;
        padding: 2px 10px 0 10px;
        border: 4px;
        background: #ffffff;

        .header {
          padding: 8px 0 8px 8px;
          border-bottom: 1px solid #0000004B;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .name {
            height: 48rpx;
            line-height: 48rpx;
            font-size: 32rpx;
            color: #404040;
          }

          .status {
            padding: 8rpx 16rpx;
            border-radius: 24rpx;
            font-size: 24rpx;
            font-weight: 400;
          }
        }

        .content {
          display: flex;
          align-items: center;
          gap: 8px;

          .avatar {
            width: 100px;
            height: 100px;
            border-radius: 16px;
          }

          .fields {
            flex: 1;
            padding: 0 32rpx 16rpx 32rpx;
            overflow: hidden;

            .field {
              margin-top: 16rpx;
              height: 42rpx;
              display: flex;
              justify-content: space-between;
              align-items: center;

              .label {
                font-size: 24rpx;
                font-weight: 400;
                color: #AEAEB2;
              }

              .value {
                font-size: 26rpx;
                font-weight: 400;
                color: #636366;
              }
            }
          }

        }


        .footer {
          padding: 16rpx 32rpx;
          background: #FAFAFC;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: flex-end;

          .commands {
            .command {
              padding-left: 56rpx;
              padding-right: 56rpx;
              height: 48rpx;
              line-height: 48rpx;
              background: #3A66F2;
              border-radius: 24rpx;
              font-size: 26rpx;
              font-weight: 400;
              color: #FFFFFF;
            }
          }
        }
      }
    }

    .footer-commands {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16rpx 32rpx;
      padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
      padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
      background: #FFFFFF;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: flex-end;

      .commands {
        flex: 1;
        display: flex;

        .command {
          flex: 1;
          padding-left: 56rpx;
          padding-right: 56rpx;
          height: 72rpx;
          line-height: 72rpx;
          background: #3A66F2;
          border-radius: 24rpx;
          font-size: 28rpx;
          font-weight: 400;
          color: #FFFFFF;
          text-align: center;
        }
      }
    }
  }
</style>