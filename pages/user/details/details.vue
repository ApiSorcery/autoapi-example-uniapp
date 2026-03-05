<template>
  <view class="page-user-details">
    <view class="fields">
      <view class="field">
        <view class="label">
          <text class="required">*</text>
          <text>Code:</text>
        </view>
        <input class="value" :class="{placeholder:!form.model.code,disabled:form.operateType!=='add'}" placeholder="请输入"
          v-model="form.model.code" :disabled="form.operateType!=='add'" />
      </view>
      <view class="field">
        <view class="label">
          <text class="required">*</text>
          <text>Name:</text>
        </view>
        <input class="value" :class="{placeholder:!form.model.name}" placeholder="请输入" v-model="form.model.name" />
      </view>
      <view class="field">
        <view class="label">
          <text class="required">*</text>
          <text>Email:</text>
        </view>
        <input class="value" :class="{placeholder:!form.model.email}" placeholder="请输入" v-model="form.model.email" />
      </view>
      <view class="field">
        <view class="label">
          <text>Gender:</text>
        </view>
        <uni-data-picker class="value" placeholder="Please Select" popup-title="Gender Options" :readonly="false"
          :clearIcon="false" :localdata="optionsMap['gender']" v-model="form.model.gender">
        </uni-data-picker>
      </view>
      <view class="field">
        <view class="label">
          <text>Status:</text>
        </view>
        <switch class="value" :checked="form.model.status" @change="handleStatusChange"></switch>
      </view>
      <view class="multi-field">
        <view class="label">Address:</view>
        <textarea class="m-textarea" v-model="form.model.address" :auto-height="true" :maxlength="500" placeholder="请输入"
          :cursor-spacing="30" />
      </view>
      <view class="image-field">
        <view class="label">
          <text>Avatar:</text>
        </view>
        <image class="upload" mode="aspectFill" v-if="form.model.avatar" :src="form.model.avatar" @click="handleUpload">
        </image>
        <image v-else class="upload" :src="form.defaultImageBase64" @click="handleUpload"></image>
      </view>
    </view>
    <view class="commands">
      <button class="command cancel" @tap="handleCancel">取消</button>
      <button class="command confirm" type="primary" :disabled="form.loading || form.submitLoading"
        :loading="form.submitLoading" @tap="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script setup>
  import {
    computed,
    nextTick,
    onMounted,
    reactive
  } from "vue";
  import {
    onLoad
  } from '@dcloudio/uni-app';
  import * as userService from '@/services/user.js';
  import * as fileService from '@/services/file.js'

  const optionsMap = {
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
  };

  const form = reactive({
    operateType: 'add',
    loading: false,
    submitLoading: false,
    defaultImageBase64: 'data:image/png;base64,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',
    model: {
      id: undefined,
      code: '',
      name: '',
      email: '',
      gender: 0,
      avatar: '',
      address: '',
      status: false,
    }
  });

  onLoad((options) => {
    console.log('page-user-details onLoad', options);
    form.operateType = options.operateType;
    if (options.userId) {
      form.model.id = parseInt(options.userId);
    }
  })

  onMounted(async () => {
    console.log('page-user-details onMounted');
    try {
      form.loading = true;
      uni.showLoading({
        title: '加载中...'
      });
      if (form.operateType === 'edit') {
        await getData();
      }
    } finally {
      uni.hideLoading();
      form.loading = false;
    }
  })

  const getData = async () => {
    console.log('getData', form.operateType, form.model.id);
    const res = await userService.getUserOne(form.model.id);
    form.model.code = res.code;
    form.model.name = res.name;
    form.model.email = res.email;
    form.model.gender = res.gender;
    form.model.avatar = res.avatar;
    form.model.address = res.address;
    form.model.status = res.status ?? false;
  }

  const handleStatusChange = (e) => {
    console.log('handleStatusChange', e);
    form.model.status = e.detail.value;
  }

  const handleUpload = () => {
    console.log('handleUpload');
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      extension: ['.png', '.jpg', '.jpeg', '.webp'], // 可选，限制文件后缀名
      sourceType: ['album', 'camera'],
      success: async (chooseResult) => {
        const tempFilePath = chooseResult.tempFilePaths[0];
        uni.showLoading({
          title: '上传中...'
        });
        const imageId = await fileService.uploadFile({
          // #ifdef APP-PLUS
          files: chooseResult.tempFiles,
          // #endif
          // #ifdef MP-ALIPAY
          fileType: 'image',
          // #endif
          filePath: tempFilePath,
          name: 'file',
          onProgress: (progressRes) => {
            console.log('上传进度：', progressRes.progress);
            // 可以在这里更新进度条
          }
        })
        console.log('uni.uploadFile success', imageId);
        form.model.avatar = `https://www.apisorcery.com/demo-api/file/${imageId}`
        uni.hideLoading();
      },
      fail: (error) => {
        console.log('uni.chooseImage error', JSON.stringify(error));
      }
    })
  }

  const handleCancel = () => {
    console.log('handleCancel', form.model);
    uni.navigateBack({
      delta: 1
    });
  }

  const handleSubmit = async () => {
    console.log('handleSubmit', form.model);
    try {
      form.submitLoading = true;
      if (!form.model.code) {
        uni.showToast({
          icon: 'none',
          title: 'User code can not be empty'
        });
        return;
      }

      if (!form.model.name) {
        uni.showToast({
          icon: 'none',
          title: 'User name can not be empty'
        });
        return;
      }

      if (!form.model.email) {
        uni.showToast({
          icon: 'none',
          title: 'User email can not be empty'
        });
        return;
      }

      if (!form.model.avatar) {
        uni.showToast({
          icon: 'none',
          title: 'User avatar can not be empty'
        });
        return;
      }

      if (form.model.id) {
        await userService.modifyUser(form.model);
      } else {
        await userService.addUser(form.model);
      }

      uni.showToast({
        icon: "success",
        title: '提交成功',
        complete: () => {
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            });
          }, 1000)
        }
      });
    } finally {
      form.submitLoading = false;
    }
  }
</script>

<style lang="scss" scoped>
  .page-user-details {
    height: 100vh;
    overflow: hidden;
    background-color: #eceef5;
    display: flex;
    flex-direction: column;

    .fields {
      flex: 1;
      overflow: auto;

      .label {
        font-size: 28rpx;
        font-weight: 400;
        color: #1A1A1A;

        .required {
          color: #FF3B30;
          margin-right: 8rpx;
        }
      }

      .field {
        background: #ffffff;
        height: 96rpx;
        padding: 0 32rpx;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        .value {
          flex: 1;
          max-width: 200px;
          font-size: 28rpx;
          font-weight: 400;
          color: #636366;
          text-align: right;

          &.disabled {
            color: #c0c0c0;
          }

          &.placeholder {
            color: #c0c0c0;
          }
        }
      }

      .multi-field {
        background: #ffffff;
        padding: 16rpx 32rpx;
        border-top: 1px solid rgba(0, 0, 0, 0.08);

        .m-textarea {
          text-align: left;
          margin-top: 10px;
          padding: 8px;
          width: calc(100% - 24px);
          min-height: 50px;
          border: 1px solid rgba(198, 203, 216, 1);
          border-radius: 4px;
          font-size: 14px;
          color: rgba(0, 0, 0, 1);

          .uni-input-placeholder {
            color: rgba(105, 114, 135, 1);
          }
        }

      }

      .image-field {
        background: #ffffff;
        padding: 16rpx 32rpx;
        border-top: 1px solid rgba(0, 0, 0, 0.08);

        .upload {
          margin-top: 10px;
          width: 100px;
          height: 100px;
          background: #3A66F2;
          color: white;
          border-radius: 80px;
        }
      }
    }

    .commands {
      margin-top: 16rpx;
      background: #FFFFFF;
      padding: 12rpx 32rpx;
      padding-bottom: calc(12rpx + constant(safe-area-inset-bottom));
      padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
      display: flex;

      .command {
        line-height: 72rpx;
        height: 72rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        color: #FFFFFF;

        &.cancel {
          width: 208rpx;
          background: #97A7E6;
        }

        &.confirm {
          margin-left: 16rpx;
          flex: 1;
          background: #3A66F2;
        }
      }
    }
  }
</style>