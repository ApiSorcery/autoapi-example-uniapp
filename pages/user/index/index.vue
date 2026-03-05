<template>
  <view class="page-user-index">
    <view class="search">
      <view class="total">{{`total: ${table.total}`}}</view>
      <uni-icons type="settings" size="44rpx" color="#3a66f2" @click="handleSearchTriggle">
      </uni-icons>
    </view>
    <view class="items" v-if="(table.dataList||[]).length">
      <uni-swipe-action class="uni-swipe-action" ref="swipeActionRef">
        <uni-swipe-action-item class="uni-swipe-action-item" v-for="(item,index) in table.dataList" :key="index"
          :right-options="swipeOptions" :autoClose="true" @click="(e)=>handleSwipeClick(e,item)">
          <view class="item" @click="()=>handleEdit(item)">
            <view class="header">
              <view class="name">{{`${item.name} - ${item.code}`}}</view>
              <view class="status" :style="{color:optionsMap['status'].find(r=>r.value===`${item.status}`)?.color}">
                {{optionsMap['status'].find(r=>r.value===`${item.status}`)?.text}}
              </view>
            </view>
            <view class="content">
              <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
              <view class="fields">
                <view class="field">
                  <view class="label">Gender:</view>
                  <view class="value">{{optionsMap['gender'].find(r=>r.value===item.gender)?.text}}</view>
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
      Empty
    </view>
    <view class="footer-commands">
      <view class="commands" @click="handleCommand">
        <text>Actions</text>
        <icon type="download" size="16" color="#FFFFFF" />
      </view>
    </view>
    <uni-drawer class="search-drawer" ref="searchDrawer" mode="right" :maskClick="false" :width="320">
      <view class="header">
        <view class="title">Users Query</view>
      </view>
      <view class="fields">
        <view class="field">
          <view class="label">User Code：</view>
          <uni-easyinput class="form-input" trim="all" v-model="search.model.code" placeholder="Please enter" :defaultStyle="{
    					border:'1px solid #dcdfe6',
    					borderRadius: '8rpx'
    				}">
          </uni-easyinput>
        </view>
        <view class="field">
          <view class="label">User Name：</view>
          <uni-easyinput class="form-input" trim="all" v-model="search.model.name" placeholder="Please enter" :defaultStyle="{
    					border:'1px solid #dcdfe6',
    					borderRadius: '8rpx'
    				}">
          </uni-easyinput>
        </view>
        <view class="field">
          <view class="label">Status：</view>
          <uni-data-select class="form-input" placeholder="Please select" v-model="search.model.status" :localdata="optionsMap['status']">
          </uni-data-select>
        </view>
      </view>
      <view class="footer">
        <view class="commands">
          <button size="mini" class="command" @click="handleSearchCancel">Cancel</button>
          <button size="mini" type="primary" class="command" @click="handleSearchConfirm">Query</button>
          <button size="mini" class="command" @click="handleSearchReset">Reset</button>
        </view>
      </view>
    </uni-drawer>
  </view>
</template>

<script setup>
  import dayjs from 'dayjs';
  import {
    ref,
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
      value: 'true',
      text: 'Enabled',
      color: '#1677FF'
    }, {
      value: 'false',
      text: 'Disabled',
      color: '#FD8428'
    }],
    gender: [{
      value: 0,
      text: 'Unknown',
    }, {
      value: 1,
      text: 'Male',
    }, {
      value: 2,
      text: 'Female',
    }]
  }

  // 为 uni-swipe-action 组件定义类型
  const swipeActionRef = ref(null)
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

  const search = reactive({
    visible: false,
    model: {
      code: null,
      name: null,
      status: null,
    }
  })

  const searchDrawer = ref(null);

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
        title: 'no more data',
        icon: 'none',
        duration: 1000
      })
    } else {
      table.page++
      getList()
    }
  });


  const handleSearchTriggle = () => {
    console.log('handleSearchTriggle', searchDrawer.value)
    searchDrawer.value.open()
  }
  const handleSearchCancel = () => {
    console.log('handleSearchCancel')
    searchDrawer.value.close()
  }
  const handleSearchConfirm = async () => {
    console.log('handleSearchConfirm', search.model)
    await getList();
    searchDrawer.value.close()
  }
  const handleSearchReset = () => {
    console.log('handleSearchReset', search.model)
    search.model = {
      code: null,
      name: null,
      status: null
    }
  }

  const getList = async () => {
    try {
      uni.showLoading({
        title: 'Loading...',
        mask: true
      });
      const params = {
        page: table.page,
        limit: table.pageSize,
        ...search.model,
        status: search.model.status ? JSON.parse(search.model.status) : null
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
        title: 'Info',
        content: 'This operation will permanently delete the record. Continue?',
        success: async (res) => {
          if (res.confirm) {
            await userService.removeUser(item.id);
            uni.showToast({
              icon: 'none',
              title: 'Success',
              success: () => {
                closeAllSwipeItems();
                getList();
              }
            });
          } else {
            closeAllSwipeItems();
          }
        }
      })
    }
  }

  // 关闭所有滑动项
  const closeAllSwipeItems = () => {
    if (swipeActionRef.value) {
      swipeActionRef.value.closeAll()
    }
  }

  const handleEdit = (item) => {
    console.log('handleEdit', item);
    uni.navigateTo({
      url: `/pages/user/details/details?operateType=edit&userId=${item.id}`
    })
  }

  const handleCommand = () => {
    uni.showActionSheet({
      itemList: ['Add User', 'Export'],
      success: (res) => {
        // res.tapIndex 表示点击了第几个按钮，0是第一个，1是第二个
        if (res.tapIndex === 0) {
          handleAdd();
        } else if (res.tapIndex === 1) {
          handleExport();
        }
      },
      fail: (err) => {
        console.log('用户取消选择', err)
      }
    })
  }

  const handleAdd = () => {
    console.log('handleAdd');
    uni.navigateTo({
      url: '/pages/user/details/details?operateType=add'
    })
  }

  const handleExport = async () => {
    // #ifdef H5
    // ************ H5端：使用 Blob 处理二进制流 ************
    uni.showLoading({
      title: 'file exporting...',
      mask: true
    });
    const res = await userService.exportUsers({});
    // 创建下载链接
    const blobUrl = res.tempFilePath;
    const fileName = `users-${dayjs().format('YYYYMMDDHHmmssSSS')}.xlsx`; // 根据实际情况设置
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    uni.hideLoading();
    uni.showToast({
      title: 'Success',
      icon: 'success'
    });
    // #endif
    // #ifndef H5
    uni.showLoading({
      title: 'file exporting...',
      mask: true
    });
    const res = await userService.exportUsers({});
    // 保存文件到应用沙盒（持久化）
    uni.saveFile({
      tempFilePath: res.tempFilePath,
      success: (saveRes) => {
        uni.hideLoading();
        uni.showToast({
          title: 'Success'
        });
        console.log('文件保存路径：', saveRes.savedFilePath);

        // 可选：直接打开文件预览
        uni.openDocument({
          filePath: saveRes.savedFilePath,
          showMenu: true,
          fail: (err) => {
            console.log('打开文件失败，但已保存', err);
          }
        });
      },
      fail: (err) => {
        uni.hideLoading();
        uni.showToast({
          title: 'File Save failed',
          icon: 'none'
        });
      }
    });
    // #endif
  }
</script>

<style lang="scss" scoped>
  .page-user-index {
    min-height: 100vh;
    background-color: #eceef5;

    .search {
      background: #ffffff;
      padding: 16rpx 36rpx;
      margin-bottom: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .total {
        font-size: 28rpx;
        font-weight: 500;
      }
    }

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
      padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
      padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
      background: #FFFFFF;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: flex-end;

      .commands {
        width: 100px;
        height: 88rpx;
        background: #3A66F2;
        font-size: 28rpx;
        font-weight: 400;
        color: #FFFFFF;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
      }
    }

    .search-drawer {
      .header {
        padding: 32rpx 16rpx 0 16rpx;

        .title {
          font-size: 32rpx;
          font-weight: bold;
        }
      }

      .fields {
        padding: 0 32rpx;

        .field {
          margin-top: 32rpx;

          .label {
            font-size: 14px;
            font-weight: 400;
            color: #808080;
          }

          .form-input {
            margin-top: 12rpx;
          }
        }
      }

      .footer {
        margin-top: 48rpx;

        .commands {
          padding: 0 32rpx;
          display: flex;
          justify-content: space-between;

          .command {
            margin: 0 4rpx;
          }
        }
      }
    }
  }
</style>