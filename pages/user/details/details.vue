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
        <uni-data-picker class="value" placeholder="Please Select" popup-title="Status Options" :readonly="false"
          :clearIcon="false" :localdata="optionsMap['status']" v-model="form.model.status">
        </uni-data-picker>
      </view>
      <view class="field">
        <view class="label">Address:</view>
        <input class="value" :class="{placeholder:!form.model.address,disabled:false}" placeholder="请输入"
          v-model="form.model.address" :disabled="false" />
      </view>
      <view class="field">
        <view class="label">
          <text class="required">*</text>
          <text>Avatar:</text>
        </view>
        <view class="upload" @click="handleUpload">+</view>
      </view>
      <view class="attachments" v-if="form.model.attachments?.length">
        <view class="attachment" v-for="attachment in form.model.attachments" :key="attachment.id">
          <view class="file-content">
            <view class="name">{{attachment.name}}</view>
            <view class="size-preview">
              <view class="size">{{attachment.size}}</view>
              <view class="preview" @click="()=>handlePreview(attachment.path)">预览</view>
            </view>
          </view>
          <view class="remove" @click="()=>handleRemove(attachment)">-</view>
        </view>
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
  };

  const form = reactive({
    operateType: 'add',
    userId: null,
    loading: false,
    submitLoading: false,
    model: {
      code: '',
      name: '',
      email: '',
      gender: 0,
      avatar: '',
      address: '',
      status: 'false',
    }
  });

  onLoad((options) => {
    console.log('page-user-details onLoad', options);
    form.operateType = options.operateType;
    form.userId = options.userId;
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
    console.log('getData', form.operateType, form.userId);
    const res = await userService.getUserOne(form.userId);
    form.model.code = res.code;
    form.model.name = res.name;
    form.model.email = res.email;
    form.model.gender = res.gender;
    form.model.avatar = res.avatar;
    form.model.address = res.address;
    form.model.status = res.status ? 'true' : 'false';
  }

  const handleUpload = () => {
    console.log('handleUpload');
    // #ifdef MP-WEIXIN
    wx.chooseMessageFile({
      count: 1, // 默认100
      type: 'all',
      success: (chooseMessageFileRes) => {
        console.log('chooseMessageFileRes', chooseMessageFileRes);
        const tempFile = chooseMessageFileRes.tempFiles[0];
        const fileName = tempFile.name.substring(0, tempFile.name.lastIndexOf('.'));
        const fileExtension = tempFile.name.substring(tempFile.name.lastIndexOf('.') + 1);
        if (['png', 'jpg', 'jpeg', 'pdf', 'docx', 'doc'].includes(fileExtension)) {
          form.model.attachments.push({
            id: (form.model.attachments || []).length + 1,
            name: `${fileName.length>10 ? fileName.substring(0,10) + '...' :fileName}.${fileExtension}`,
            size: `${(tempFile.size/1024/1024).toFixed(2)}M`,
            path: tempFile.path
          });
        } else {
          uni.showToast({
            title: '文件类型不符！',
            icon: 'error'
          });
        }
      },
      fail: (error) => {
        console.log('uni.chooseMedia error', JSON.stringify(error));
      }
    });
    // #endif
  }

  const handlePreview = (filePath) => {
    console.log('handlePreview', filePath);
    const tempFileExtension = filePath.substring(filePath.lastIndexOf(".") + 1)
    const fileExtension = tempFileExtension.indexOf('?') > -1 ?
      tempFileExtension.substring(0, tempFileExtension.indexOf('?')) :
      tempFileExtension;
    console.log('fileExtension', fileExtension);
    if (['png', 'jpg', 'jpeg'].includes(fileExtension)) {
      uni.previewImage({
        urls: [filePath]
      });
    } else if (['pdf', 'docx', 'doc'].includes(fileExtension)) {
      // #ifdef MP-WEIXIN
      uni.showLoading({
        title: '加载中...'
      });
      uni.downloadFile({
        url: filePath,
        success: function(res) {
          console.log('downloadFile success', res);
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              showMenu: true,
              success: (openDocumentRes) => {
                uni.hideLoading();
                console.log('打开文档成功', openDocumentRes);
              },
              fail: (openDocumentErr) => {
                console.log('openDocumentErr', openDocumentErr);
                uni.hideLoading();
                uni.showToast({
                  title: '预览文件失败',
                  icon: "error"
                });
              }
            });
          } else {
            uni.showToast({
              title: `${res.statusCode}-文件下载失败`
            });
          }
        },
        fail: (err) => {
          console.log('uni.downloadFile failed', err);
          uni.showToast({
            title: '文件下载失败',
            icon: "error",
          });
        }
      });
      // #endif
    } else {
      uni.showToast({
        title: '文件类型不支持！',
        icon: 'error'
      });
    }
  }

  const handleRemove = (attachment) => {
    console.log('handleRemove', attachment);
    form.model.attachments = form.model.attachments.filter(r => r.id !== attachment.id);
  }

  const handleCancel = () => {
    console.log('handleCancel', form.model);
    uni.navigateBack({
      delta: 1
    });
  }

  const handleSubmit = async () => {
    console.log('handleSubmit', form.model);
    console.log('appStore.getApiServer', appStore.getApiServer);
    console.log('userStore.getToken', userStore.getToken);
    try {
      form.submitLoading = true;
      if (!form.model.certificationType) {
        uni.showToast({
          icon: 'none',
          title: '证书类型不能为空'
        });
        return;
      }

      if (!form.model.certificationName) {
        uni.showToast({
          icon: 'none',
          title: '证书名称不能为空'
        });
        return;
      }

      if (!form.model.issueDate) {
        uni.showToast({
          icon: 'none',
          title: '发证日期不能为空'
        });
        return;
      }

      if (!form.model.expireDate) {
        uni.showToast({
          icon: 'none',
          title: '到期日期不能为空'
        });
        return;
      }

      if ((form.model.attachments || []).length === 0) {
        uni.showToast({
          icon: 'none',
          title: '请上传附件'
        });
        return;
      }

      var data = {
        c_type: form.model.certificationType,
        name: form.model.certificationName,
        c_sub_type: form.model.certificationAttribute,
        number: form.model.certificationCode,
        external_train_user: form.model.externalTrainUserId,
        issuing_department: form.model.issuingDepartment,
        issue_date: form.model.issueDate,
        review_date: form.model.reviewDate,
        expiry_date: form.model.expireDate,
        major: form.model.major,
        grade_column: form.model.gradeColumn,
        remark: form.model.remarks
      };
      if (!data.external_train_user) {
        delete data.external_train_user;
      }

      const addRes = await trainingCertificationService.add(data);
      await Promise.all(
        (form.model.attachments || []).map(async (r) => uploadSingleFile(addRes.id, r.path))
      );
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

  const uploadSingleFile = async (userId, tempFilePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${appStore.getApiServer}/train_staff/certificate_attachment/?menu_url=pages/training/certification/details/details`,
        filePath: tempFilePath,
        name: 'attachment',
        header: {
          'Authorization': `Bearer ${userStore.getToken}`,
        },
        formData: {
          certificate: userId
        },
        success: (uploadRes) => {
          console.log('uni.uploadFile success json', uploadRes.data);
          var resultObj = JSON.parse(uploadRes.data);
          console.log('uni.uploadFile success object', resultObj);
          if (resultObj.code === 200) {
            resolve();
          } else {
            reject(resultObj.code)
          }
        },
        fail: (error) => {
          console.log('uni.uploadFile error', JSON.stringify(error));
          reject(error);
        }
      });
    })
  }
</script>

<style lang="scss" scoped>
  .page-user-details {
    height: 100%;
    overflow: hidden;
    background-color: #eceef5;
    display: flex;
    flex-direction: column;

    .fields {
      flex: 1;
      overflow: auto;

      .field {
        background: #ffffff;
        height: 96rpx;
        padding: 0 32rpx;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        .label {
          font-size: 28rpx;
          font-weight: 400;
          color: #1A1A1A;

          .required {
            color: #FF3B30;
            margin-right: 8rpx;
          }
        }

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

        .upload {
          width: 46rpx;
          height: 42rpx;
          line-height: 42rpx;
          padding-bottom: 4rpx;
          text-align: center;
          background: #3A66F2;
          color: white;
          border-radius: 42rpx;
          font-size: 40rpx;
          font-weight: bold;
        }
      }

      .attachments {
        background: #FAFAFC;

        .attachment {
          padding: 16rpx 32rpx;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;

          .file-content {
            .name {
              font-size: 14px;
              font-weight: 400;
              color: #636366;
            }

            .size-preview {
              margin-top: 8rpx;
              display: flex;

              .size {
                font-size: 12px;
                font-weight: 400;
                color: #C7C7CC;
              }

              .preview {
                margin-left: 48rpx;
                font-size: 12px;
                font-weight: 400;
                color: #3A66F2;
              }
            }
          }

          .remove {
            width: 46rpx;
            height: 42rpx;
            line-height: 42rpx;
            padding-bottom: 4rpx;
            text-align: center;
            background: #FF3B30;
            color: white;
            border-radius: 42rpx;
            font-size: 40rpx;
            font-weight: bold;
          }
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