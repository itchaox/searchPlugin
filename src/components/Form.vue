<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-23 09:34
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-25 01:15
 * @desc       : 
-->

<script setup lang="ts">
  import { bitable } from '@lark-base-open/js-sdk';
  import { LarkOne, DocDetail } from '@icon-park/vue-next';
  import { dayjs } from 'element-plus';
  import { records } from './records';
  import { fieldMeteListDemo } from './fieldMeteList';

  import _ from 'lodash';
  import { getGifUrl, getIconUrl } from '@/utils/util';

  const fieldMeteList = ref([]);
  const tableDataList = ref([
    // {
    //   recordId: '1',
    //   name: '',
    //   description: '',
    //   gif: '',
    //   author: '',
    //   lastUpdateTime: '',
    //   icon: '',
    //   useMethod: '',
    //   projectUrl: '',
    //   detailUrl: '',
    // },
  ]);

  // 搜索后的数据
  const filterTableDataList = ref([]);

  const fieldMappings = {
    nameId: '名称_默认',
    descriptionId: '描述_默认',
    gifId: '功能预览图',
    authorId: '开发者',
    lastUpdateTimeId: '最后更新时间',
    iconId: '图标',
    useMethodId: '如何使用',
    projectUrlId: '项目地址',
    detailUrlId: '插件详情页url',
  };

  const fieldValues = {};

  let table;
  // let view;

  async function initBase() {
    // table = await bitable.base.getActiveTable();
    console.log('🚀  table:', table);

    // debugger;
    // view = await table.getViewById('vewfDutkxW');
    // fieldMeteList.value = await view.getFieldMetaList();

    // FIXME 这里暂时写死
    fieldMeteList.value = fieldMeteListDemo;

    // console.log('fieldMeteList.value', fieldMeteList.value);

    for (const [variableName, fieldName] of Object.entries(fieldMappings)) {
      // 找到字段对应的 id
      const { id } = fieldMeteList.value.find((item) => item.name === fieldName) || {};
      fieldValues[variableName] = id;
    }
  }

  async function handleTableRecordList() {
    // FIXME 获取到所有上线的插件列表

    // const { records } = await table.getRecords({
    //   pageSize: 5000,
    // });

    // FIXME 从这个打印位置直接复制
    // console.log('🚀  records:', records);

    records.forEach((item) => {
      let _recordData = {};
      for (const fieldId in item.fields) {
        for (const key in fieldValues) {
          if (fieldValues[key] === fieldId) {
            // 去掉末尾 Id
            _recordData[key.replace(/Id$/, '')] = item.fields[fieldId];
          }
        }
      }

      tableDataList.value.push({ ..._recordData, recordId: item.recordId });
    });

    filterTableDataList.value = tableDataList.value;
  }
  onMounted(async () => {
    // loading.value = true;
    await initBase();
    await handleTableRecordList();
    // loading.value = false;
  });

  const pluginName = ref();
  const pluginDescription = ref();
  const pluginAuthor = ref();

  const isSearch = ref(false);

  function search() {
    isSearch.value = true;
    // 先重新获取全部数据
    filterTableDataList.value = tableDataList.value;

    if (!pluginName.value && !pluginDescription.value && !pluginAuthor.value) {
      isSearch.value = false;
      filterTableDataList.value = tableDataList.value;
      return;
    }

    // 筛选视图类型和视图名字
    filterTableDataList.value = filterTableDataList.value.filter((item) => {
      let _name = item.name[0].text;
      let _description = item.description[0].text;
      let _author = item.author[0].text;

      const nameMatch = !pluginName.value || _name?.includes(pluginName.value);
      const descriptionMatch = !pluginDescription.value || _description?.includes(pluginDescription.value);
      const authorMatch = !pluginAuthor.value || _author?.includes(pluginAuthor.value);
      return nameMatch && descriptionMatch && authorMatch;
    });
  }

  function reset() {
    isSearch.value = false;

    pluginName.value = '';
    pluginDescription.value = '';
    pluginAuthor.value = '';

    filterTableDataList.value = tableDataList.value;
  }
  const loading = ref(false);

  const activeItem = ref();

  const gifUrl = ref();
  const iconUrl = ref();

  const gifLoading = ref(false);
  const iconLoading = ref(false);

  async function detail(item) {
    console.log('🚀  item:', item);

    modelValue.value = true;
    activeItem.value = item;

    gifLoading.value = true;
    iconLoading.value = true;

    getActiveGifUrl(item.recordId);
    getActiveIconUrl(item.recordId);

    // FIXME 处理演示动图和图标
    // TODO

    // if (item.gif) {
    //   // debugger;
    //   const attachmentFieldGif = await table.getField(item.gif[0]?.permission.fieldId);
    //   const attachmentUrlsGif = await attachmentFieldGif.getAttachmentUrls(item.gif[0]?.permission.recordId);
    //   gifUrl.value = attachmentUrlsGif[0];
    // } else {
    //   gifUrl.value = '无';
    // }
    // gifLoading.value = false;

    // if (item.icon) {
    //   const attachmentFieldIcon = await table.getField(item.icon[0]?.permission.fieldId);
    //   const attachmentUrlsIcon = await attachmentFieldIcon.getAttachmentUrls(item.icon[0]?.permission.recordId);
    //   iconUrl.value = attachmentUrlsIcon[0];
    // } else {
    //   iconUrl.value = '无';
    // }
    // iconLoading.value = false;
  }

  const modelValue = ref(false);

  function close() {
    modelValue.value = false;
    gifUrl.value = '';
    iconUrl.value = '';

    activeGif.value = '';
    activeIcon.value = '';
  }

  const activeGif = ref();
  const activeIcon = ref();

  async function getActiveGifUrl(recordId) {
    activeGif.value = await getGifUrl(recordId);
  }

  async function getActiveIconUrl(recordId) {
    activeIcon.value = await getIconUrl(recordId);
  }

  // console.log(getGifUrl('recCPSfQIT'));
</script>

<template>
  <div class="home">
    <div class="tip">
      <lark-one
        class="tip-icon"
        theme="outline"
        strokeLinecap="square"
      />
      <span> 欢迎使用多维表格插件 </span>
    </div>
    <div class="addView-line">
      <div class="addView-line-label">插件名字:</div>
      <el-input
        style="width: 50%"
        v-model="pluginName"
        clearable
        size="small"
        placeholder="请输入插件名字"
      />
    </div>
    <div class="addView-line">
      <div class="addView-line-label">插件描述:</div>
      <el-input
        style="width: 50%"
        v-model="pluginDescription"
        clearable
        size="small"
        placeholder="请输入插件描述"
      />
    </div>

    <div class="addView-line">
      <div class="addView-line-label">插件作者:</div>
      <el-input
        style="width: 50%"
        v-model="pluginAuthor"
        clearable
        size="small"
        placeholder="请输入插件作者"
      />
    </div>

    <div class="button">
      <el-button
        type="primary"
        size="small"
        @click="search"
      >
        <el-icon><Search /></el-icon>
        <span>查询</span>
      </el-button>

      <el-button
        type="info"
        size="small"
        @click="reset"
      >
        <el-icon><Refresh /></el-icon>
        <span>重置</span>
      </el-button>
    </div>

    <!-- FIXME 走本地数据, 暂时不需要 loading -->
    <!-- v-loading="loading" -->
    <!-- element-loading-text="加载中..." -->
    <div class="table">
      <div>共 {{ filterTableDataList.length }} 个插件</div>
      <el-table
        :data="filterTableDataList"
        max-height="70vh"
        empty-text="暂无数据"
      >
        <el-table-column type="index" />
        <el-table-column label="插件名字">
          <template #default="scope">
            <span
              :class="!isSearch ? 'nowrap' : ''"
              text
              :title="scope.row.name[0].text"
            >
              {{ scope.row.name[0].text }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="插件描述">
          <template #default="scope">
            <span
              :class="!isSearch ? 'nowrap' : ''"
              text
              :title="scope.row.description[0].text"
            >
              {{ scope.row.description[0].text }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          property="name"
          label="操作"
          width="60"
        >
          <template #default="scope">
            <el-button text>
              <doc-detail
                @click="detail(scope.row)"
                theme="outline"
                size="20"
                fill="rgb(20, 86, 240)"
                strokeLinecap="square"
              />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情页 -->
    <el-drawer
      :model-value="modelValue"
      @closed="close"
      :show-close="false"
      size="85%"
    >
      <template #header="{ close, titleId }">
        <div :id="titleId">插件详情</div>
        <el-button
          type="danger"
          @click="close"
          size="small"
        >
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
          关闭
        </el-button>
      </template>

      <div class="list">
        <div class="item">
          <div class="label">插件名字：</div>
          <div>{{ activeItem.name[0].text }}</div>
        </div>
        <div class="item">
          <div class="label">插件描述：</div>
          <div>{{ activeItem.description[0].text }}</div>
        </div>
        <div class="item">
          <div class="label">插件作者：</div>
          <div>{{ activeItem.author[0].text }}</div>
        </div>

        <div class="item">
          <div class="label">功能预览图：</div>

          <el-image
            v-if="activeGif"
            :src="activeGif"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[activeGif]"
            :initial-index="0"
            fit="cover"
          />
          <div v-else>暂无功能预览图</div>

          <!-- <div v-if="gifUrl === '无'">暂无功能预览图</div>
          <el-image
            v-else-if="gifUrl"
            :src="gifUrl"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[gifUrl]"
            :initial-index="0"
            fit="cover"
          />
          <div
            v-else
            v-loading="gifLoading"
          ></div> -->
        </div>

        <div class="item">
          <div class="label">最后更新时间：</div>
          <div>{{ dayjs(activeItem.lastUpdateTime).format('YYYY-MM-DD HH:mm') }}</div>
        </div>

        <div class="item">
          <div class="label">图标：</div>

          <el-image
            v-if="activeIcon"
            style="width: 40px; height: 40px"
            :src="activeIcon"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[activeIcon]"
            :initial-index="0"
            fit="cover"
          />

          <div v-else>暂无图标</div>

          <!-- <div v-if="iconUrl === '无'">暂无图标</div>

          <el-image
            v-loading="iconLoading"
            style="width: 40px; height: 40px"
            v-else-if="iconUrl"
            :src="iconUrl"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[iconUrl]"
            :initial-index="0"
            fit="cover"
          />
          <div
            v-else
            v-loading="iconLoading"
          ></div> -->
        </div>

        <div class="item">
          <div class="label">如何使用：</div>
          <div>{{ activeItem.useMethod[0].text }}</div>
        </div>

        <div class="item">
          <div class="label">项目地址：</div>
          <el-link
            v-if="activeItem?.projectUrl && activeItem.projectUrl[0]?.link"
            type="primary"
            :href="activeItem.projectUrl[0].link"
            target="_blank"
            >{{ activeItem.projectUrl[0].link }}</el-link
          >
          <div v-else>{{ '暂无项目地址' }}</div>
        </div>

        <div class="item">
          <div class="label">插件详情页地址：</div>
          <el-link
            type="primary"
            v-if="activeItem?.detailUrl && activeItem.detailUrl[0]?.link"
            :href="activeItem?.detailUrl && activeItem.detailUrl[0]?.link"
            target="_blank"
            >{{ activeItem?.detailUrl && activeItem.detailUrl[0]?.link }}</el-link
          >

          <div v-else>{{ '暂无插件详情页地址' }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
  .home {
    font-size: 14px;
  }

  .tip {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .tip-icon {
    position: relative;
    top: 2px;
  }

  .addView-line {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .addView-line-label {
      margin-right: 10px;
      font-size: 14px;
      white-space: nowrap;
    }
  }

  .button {
    margin-bottom: 14px;
  }

  .nowrap {
    white-space: nowrap;
  }

  .list {
    /* display: flex; */
    .item {
      display: flex;
      margin-bottom: 14px;
      .label {
        min-width: 115px;
        color: rgb(20, 86, 240);
        white-space: nowrap;
      }
    }
  }
</style>
