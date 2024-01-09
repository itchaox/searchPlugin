<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-23 09:34
 * @LastAuthor : itchaox
 * @LastTime   : 2024-01-09 09:48
 * @desc       : 
-->

<script setup lang="ts">
  import { bitable } from '@lark-base-open/js-sdk';
  import { LarkOne, DocDetail, Like } from '@icon-park/vue-next';
  import { dayjs } from 'element-plus';
  import { records } from './records';
  import { fieldMeteListDemo } from './fieldMeteList';

  import _ from 'lodash';
  import { getGifUrl, getIconUrl } from '@/utils/util';

  import HightLightText from '@/components/HightLightText';
  import useClipboard from 'vue-clipboard3';

  // 使用插件
  const { toClipboard } = useClipboard();

  const copy = async (msg) => {
    try {
      // 复制
      await toClipboard(msg);
      ElMessage({
        message: '插件名字已复制，即将跳转至表单页面~',
        type: 'success',
        duration: 1500,
        showClose: true,
      });
      // 复制成功
    } catch (e) {
      // 复制失败
    }
  };

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
    // console.log('🚀  table:', table);

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

    tableDataList.value = await Promise.all(tableDataList.value.map(processRecord));

    filterTableDataList.value = tableDataList.value;
  }

  const tableRef = ref(null);
  const showTableTop = ref(false);

  onMounted(async () => {
    // loading.value = true;
    await initBase();
    await handleTableRecordList();
    // loading.value = false;

    // 监听 table 滚动事件
    const scrollDom = tableRef.value?.scrollBarRef?.wrapRef;
    scrollDom.addEventListener('scroll', () => {
      // 滚动距离
      let scrollTop = scrollDom?.scrollTop;
      if (scrollTop > 200) {
        showTableTop.value = true;
      } else {
        showTableTop.value = false;
      }
    });
  });

  const pluginName = ref();
  const pluginDescription = ref();
  const pluginAuthor = ref();

  // 插件描述
  const pluginInfo = ref();

  // 搜索的数据
  const inputText = ref();

  const isShowTable = ref(true);
  function search() {
    inputText.value = pluginInfo.value;

    isShowTable.value = false;

    // 先重新获取全部数据
    filterTableDataList.value = tableDataList.value;

    // if (!pluginName.value && !pluginDescription.value && !pluginAuthor.value) {
    //   filterTableDataList.value = tableDataList.value;
    //   return;
    // }

    // if (!pluginInfo.value) {
    //   filterTableDataList.value = tableDataList.value;
    //   return;
    // }

    // 筛选插件信息

    // 匹配插件名字或插件描述; 名字匹配的放前面
    filterTableDataList.value = filterTableDataList.value
      .filter((item) => {
        let _name = item.name[0].text;
        let _description = item.description[0].text;

        const nameMatch = !pluginInfo.value || _name?.includes(pluginInfo.value);
        const descriptionMatch = !pluginInfo.value || _description?.includes(pluginInfo.value);

        return nameMatch || descriptionMatch;
      })
      .sort((a, b) => {
        const aNameMatch = !pluginInfo.value || a.name[0].text?.includes(pluginInfo.value);
        const bNameMatch = !pluginInfo.value || b.name[0].text?.includes(pluginInfo.value);

        // 将匹配的数据排在前面
        if (aNameMatch && !bNameMatch) {
          return -1;
        } else if (!aNameMatch && bNameMatch) {
          return 1;
        } else {
          return 0;
        }
      });

    isShowTable.value = true;

    // 筛选视图类型和视图名字
    // filterTableDataList.value = filterTableDataList.value.filter((item) => {
    //   let _name = item.name[0].text;
    //   let _description = item.description[0].text;
    //   let _author = item.author[0].text;

    //   const nameMatch = !pluginName.value || _name?.includes(pluginName.value);
    //   const descriptionMatch = !pluginDescription.value || _description?.includes(pluginDescription.value);
    //   const authorMatch = !pluginAuthor.value || _author?.includes(pluginAuthor.value);
    //   return nameMatch && descriptionMatch && authorMatch;
    // });
  }

  function reset() {
    // pluginName.value = '';
    // pluginDescription.value = '';
    // pluginAuthor.value = '';
    pluginInfo.value = '';

    filterTableDataList.value = tableDataList.value;
  }
  const loading = ref(false);

  const activeItem = ref();

  const gifUrl = ref();
  const iconUrl = ref();

  const gifLoading = ref(false);
  const iconLoading = ref(false);

  async function detail(item) {
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
    gifLoading.value = false;
  }

  async function getActiveIconUrl(recordId) {
    activeIcon.value = await getIconUrl(recordId);
    iconLoading.value = false;
  }

  async function processRecord(record) {
    const iconUrl = await getIconUrl(record.recordId);

    return {
      ...record,
      iconUrl,
    };
  }

  // console.log(getGifUrl('recCPSfQIT'));

  /**
   * @desc  : 提交插件
   */
  function submit() {
    let url = 'https://bytedance.larkoffice.com/share/base/form/shrcnKhFtxdtBSiIUkIAp43iUug';

    window.open(url, '_blank');
  }

  /**
   * @desc  : 滚动表格
   */
  const scrollTable = (targetY) => {
    const scrollDom = tableRef.value?.scrollBarRef?.wrapRef;
    const startY = scrollDom?.scrollTop;

    // const targetY = 0;
    const duration = 500; // 动画持续时间，单位：毫秒
    let startTime;

    // 增加动画效果, 使回到顶部的过程更加丝滑、流畅
    const animateScroll = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const newY = easeInOutQuad(progress) * (targetY - startY) + startY;

      scrollDom?.scrollTo(0, newY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // 缓动函数，此处使用 easeInOutQuad，你可以根据需要选择其他缓动函数
  const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  /**
   * @desc  : 获取记录
   * @param  {any} item：链接数据对象
   * @return {any}
   */
  const getLink = (item) => {
    // 兼容文本和链接字段
    return item && (item[0]?.link || item[0]?.text);
  };

  /**
   * @desc  : 试用插件
   * @param  {any} record：记录
   * @return {any}
   */
  const tryPlugin = (record) => {
    let url = getLink(record?.detailUrl);

    window.open(url, '_blank');
  };

  /**
   * @desc  : 夸夸开发者
   */
  const good = () => {
    copy(activeItem.value?.name[0]?.text);
    setTimeout(() => {
      // 夸一夸开发者地址
      let url = 'https://bytedance.larkoffice.com/share/base/form/shrcnD8K1V3yxMaOhGfa9mYggQc';
      window.open(url, '_blank');
    }, 600);
  };

  const carouselList = ref([
    {
      image: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/yluu…zulael/ljhwZthlaukjlkulzlp/extension_banner_5.png',
      title: '业务小程序',
      desc: '一张多维表，仅需3步就可以轻松变成工作台小程序',
      url: 'https://www.feishu.cn/docx/XCQRdS9jIo8Rq8xuDCdcpbdhnpg',
    },
    {
      image: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/yluu…zulael/ljhwZthlaukjlkulzlp/extension_banner_1.png',
      title: '开发者指南',
      desc: '使用你熟悉的语言，简单、快捷实现自定义功能',
      url: 'https://feishu.feishu.cn/docx/U3wodO5eqome3uxFAC3cl0qanIe',
    },
    {
      image: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/yluu…zulael/ljhwZthlaukjlkulzlp/extension_banner_2.png',
      title: '提交插件需求',
      desc: '没找到想到的插件？提交一个需求吧。',
      url: 'https://bytedance.larkoffice.com/share/base/form/shrcnKhFtxdtBSiIUkIAp43iUug',
    },
    {
      image: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/yluu…zulael/ljhwZthlaukjlkulzlp/extension_banner_3.png',
      title: '开发者激励计划',
      desc: '召集优秀开发者，共同拓展多维表格开放能力',
      url: 'https://bytedance.larkoffice.com/wiki/O7uQw0pp6ilBxRkeeBDcv2bBnEf',
    },
    {
      image: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/yluu…zulael/ljhwZthlaukjlkulzlp/extension_banner_4.png',
      title: '开发者激励榜单',
      desc: '榜单出炉，你常用的插件上榜了吗?',
      url: 'https://feishu.feishu.cn/base/Ph2Pb2ec7aOyowsIhjpcnXbmnVy?table=ldxEi12i1tvivz3p',
    },
  ]);

  function carouselItemClick(item) {
    window.open(item.url, '_blank');
  }
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
      <!-- <el-tooltip
        placement="right"
        effect="customized"
      >
        <template #content>没找到想要的插件?<br />提交一个需求吧。</template>
        <el-icon
          class="tip-icon cursor"
          @click="submit"
          ><QuestionFilled
        /></el-icon>
      </el-tooltip> -->
    </div>

    <el-carousel
      class="carousel"
      height="120px"
      trigger="click"
      :interval="5000"
    >
      <el-carousel-item
        v-for="(item, index) in carouselList"
        :key="item.title"
        @click="carouselItemClick(item)"
      >
        <div :class="`carouse carouse-${index}`">
          <div class="carouse-title">{{ item.title }}</div>
          <div class="carouse-desc">{{ item.desc }}</div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <div class="addView-line">
      <div class="addView-line-label">插件信息:</div>
      <el-input
        style="width: 60%"
        v-model="pluginInfo"
        clearable
        placeholder="请输入插件名字或描述"
        @keydown.enter="search"
      />
    </div>

    <!-- <div class="addView-line">
      <div class="addView-line-label">插件描述:</div>
      <el-input
        style="width: 50%"
        v-model="pluginDescription"
        clearable
        size="small"
        placeholder="请输入插件描述"
      />
    </div> -->

    <!-- <div class="addView-line">
      <div class="addView-line-label">插件作者:</div>
      <el-input
        style="width: 50%"
        v-model="pluginAuthor"
        clearable
        size="small"
        placeholder="请输入插件作者"
      />
    </div> -->

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
        ref="tableRef"
        :data="filterTableDataList"
        max-height="63vh"
        empty-text="暂无数据"
      >
        <el-table-column type="index" />
        <el-table-column
          label="插件名字"
          header-align="center"
        >
          <template #default="scope">
            <!-- <span
              text
              :title="scope.row.name[0].text"
            >
              {{ scope.row.name[0].text }}
            </span> -->

            <!-- {{ scope.row.name[0].text }} -->
            <div class="plugin-name">
              <img
                v-if="scope.row.iconUrl !== '无'"
                :src="scope.row.iconUrl"
                class="plugin-icon"
              />
              <div
                class="plugin-icon"
                v-else
              ></div>

              <div>
                <HightLightText
                  :key="scope.row.recordId + Math.random()"
                  :inputText="inputText"
                  :allText="scope.row.name[0].text"
                />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="插件描述"
          min-width="100%"
          header-align="center"
        >
          <template #default="scope">
            <!-- <span
              text
              :title="scope.row.description[0].text"
            >
              {{ scope.row.description[0].text }}
            </span> -->

            <!-- {{ scope.row.description[0].text }} -->
            <div class="plugin-description">
              <HightLightText
                :key="scope.row.recordId + Math.random()"
                :inputText="inputText"
                :allText="scope.row.description[0].text"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          property="name"
          label="操作"
          width="60"
        >
          <template #default="scope">
            <!-- <doc-detail
              title="插件详情"
              class="detail-icon"
              @click="detail(scope.row)"
              theme="outline"
              size="24"
              fill="rgb(20, 86, 240)"
              strokeLinecap="square"
            />
            <doc-detail
              title="插件详情"
              class="detail-icon"
              @click="detail(scope.row)"
              theme="outline"
              size="24"
              fill="rgb(20, 86, 240)"
              strokeLinecap="square"
            /> -->
            <div class="operation">
              <div
                class="pluginDetail"
                @click="detail(scope.row)"
              >
                详情
              </div>
              <div
                class="tryPlugin"
                v-if="getLink(scope.row?.detailUrl)"
                @click="tryPlugin(scope.row)"
              >
                试用
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div
      class="table-top"
      v-show="showTableTop"
      @click="() => scrollTable(0)"
    >
      <el-icon
        color="rgb(20, 86, 240)"
        size="36"
        ><CaretTop
      /></el-icon>
    </div>

    <!-- 详情页 -->
    <el-drawer
      :model-value="modelValue"
      @closed="close"
      :show-close="false"
      size="85%"
    >
      <template #header="{ close, titleId }">
        <div
          :id="titleId"
          class="header"
        >
          插件详情
        </div>
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

          <div v-if="activeGif === '无'">暂无功能预览图</div>
          <el-image
            v-else-if="activeGif"
            :src="activeGif"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[activeGif]"
            hide-on-click-modal
            fit="cover"
          />

          <div
            v-else
            v-loading="gifLoading"
          ></div>

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

        <!-- FIXME 暂时隐藏, 因为官方表格也没展示这个 -->
        <!-- <div class="item">
          <div class="label">最后更新时间：</div>
          <div>{{ dayjs(activeItem.lastUpdateTime).format('YYYY-MM-DD HH:mm') }}</div>
        </div> -->

        <div class="item">
          <div class="label">图标：</div>

          <div v-if="activeIcon === '无'">暂无图标</div>
          <el-image
            v-else-if="activeIcon"
            style="width: 40px; height: 40px"
            :src="activeIcon"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[activeIcon]"
            hide-on-click-modal
            fit="cover"
          />

          <div
            v-else
            v-loading="iconLoading"
          ></div>

          <!-- <div v-else>暂无图标</div> -->

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
          <a
            class="link"
            v-if="getLink(activeItem?.projectUrl)"
            type="primary"
            :href="getLink(activeItem?.projectUrl)"
            target="_blank"
            >{{ getLink(activeItem?.projectUrl) }}</a
          >
          <div v-else>{{ '暂无项目地址' }}</div>
        </div>

        <div class="item">
          <div class="label">插件试用地址：</div>
          <a
            class="link"
            v-if="getLink(activeItem?.detailUrl)"
            :href="getLink(activeItem?.detailUrl)"
            target="_blank"
            >{{ getLink(activeItem?.detailUrl) }}</a
          >

          <div v-else>{{ '暂无插件试用地址' }}</div>
        </div>
        <div class="item">
          <el-tooltip
            :hide-after="0"
            placement="bottom-start"
            effect="customized"
          >
            <template #content
              >插件有帮助到你的话，<br />邀请你夸一夸插件的开发者，<br />你的鼓励是开发者开发插件的动力。</template
            >
            <div
              class="label good"
              @click="good"
            >
              <like
                theme="filled"
                size="16"
              />
              <span>我要去夸一夸开发者~</span>
            </div>
          </el-tooltip>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
  .carouse {
    width: 100%;
    height: 100%;
    margin-bottom: 10px;
    cursor: pointer;
    border-radius: 10px;
  }

  .carouse-0 {
    background: url('https://lf3-static.bytednsdoc.com/obj/eden-cn/yluuhi_uvpzulael/ljhwZthlaukjlkulzlp/_extension_banner_5.png')
        100% center / max(min(180px, 40%), 180px) no-repeat,
      linear-gradient(rgb(205, 172, 255), rgb(205, 172, 255)) rgb(205, 172, 255);
    transform: translate3d(0px, 0px, 0px);
    color: rgb(71, 52, 99);
  }

  .carouse-1 {
    background: url('https://lf3-static.bytednsdoc.com/obj/eden-cn/yluuhi_uvpzulael/ljhwZthlaukjlkulzlp/extension_banner_1.png')
        100% center / max(min(180px, 40%), 180px) no-repeat,
      linear-gradient(45deg, rgb(161, 220, 251), rgb(161, 220, 251)) rgb(161, 220, 251);
    transform: translate3d(0px, 0px, 0px);
    color: rgb(27, 88, 117);
  }

  .carouse-2 {
    background: url('https://lf3-static.bytednsdoc.com/obj/eden-cn/yluuhi_uvpzulael/ljhwZthlaukjlkulzlp/extension_banner_2.png')
        100% center / max(min(180px, 40%), 180px) no-repeat,
      linear-gradient(45deg, rgb(122, 237, 177), rgb(122, 237, 177)) rgb(122, 237, 177);
    transform: translate3d(0px, 0px, 0px);
    color: rgb(13, 102, 56);
  }

  .carouse-3 {
    background: url('https://lf3-static.bytednsdoc.com/obj/eden-cn/yluuhi_uvpzulael/ljhwZthlaukjlkulzlp/extension_banner_3.png')
        100% center / max(min(180px, 40%), 180px) no-repeat,
      linear-gradient(45deg, rgb(253, 213, 96), rgb(253, 213, 96)) rgb(253, 213, 96);
    transform: translate3d(0px, 0px, 0px);
    color: rgb(101, 54, 0);
  }

  .carouse-4 {
    background: url('https://lf3-static.bytednsdoc.com/obj/eden-cn/yluuhi_uvpzulael/ljhwZthlaukjlkulzlp/extension_banner_4.png')
        100% center / max(min(180px, 40%), 180px) no-repeat,
      linear-gradient(45deg, rgb(253, 220, 176), rgb(253, 220, 176)) rgb(253, 220, 176);
    transform: translate3d(0px, 0px, 0px);
    color: rgb(134, 77, 0);
  }

  .carouse-title {
    font-size: 20px;
    font-weight: 500;
    line-height: 30px;
    margin-bottom: 4px;
    padding-left: 24px;
    padding-top: 20px;
    text-align: left;
  }

  .carouse-desc {
    font-size: 10px;
    font-weight: 500;
    line-height: 16px;
    padding-left: 24px;
    text-align: left;
    width: 45%;
  }

  :deep(.el-carousel__button) {
    width: 7px;
    height: 7px;
    border-radius: 100%;
  }

  :deep(.is-active .el-carousel__button) {
    width: 14px;
    height: 7px;
    border-radius: 10px;
  }

  :deep(.el-carousel__arrow) {
    width: 26px;
    height: 26px;
    background-color: #00000090;
  }

  :deep(.el-carousel__arrow--left) {
    left: 10px;
  }

  :deep(.el-carousel__arrow--right) {
    right: 10px;
  }

  .home {
    font-size: 14px;
  }

  .tip {
    color: rgb(20, 86, 240);
    opacity: 0.8;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
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
    margin-top: 10px;
    margin-bottom: 8px;
  }

  .carousel {
    margin-bottom: 10px;
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

  .good {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    font-weight: 500;
    padding: 4px;
    font-size: 16px;

    span {
      margin-left: 5px;
    }

    &:hover {
      cursor: pointer;
      background-color: #3370ff1a;
    }
  }

  .detail-icon {
    cursor: pointer;
  }

  .cursor {
    cursor: pointer;
  }

  .table-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 999;
    position: absolute;
    bottom: 3%;
    right: 16%;
    border-radius: 100%;
    border: 1px solid #2955e750;
    background: #eef5fe;
    :hover {
      cursor: pointer;
      background: #2955e710;
      border-radius: 100%;
    }
  }

  .link {
    color: #245bdb;
    max-width: 60%;
    word-wrap: break-word;
    text-decoration: none;
    white-space: normal;

    &:hover {
      text-decoration: underline;
      color: #3370ff;
    }
  }

  .operation {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #3370ff;
    div {
      padding: 1px 4px;
      cursor: pointer;
      &:hover {
        background-color: #3370ff1a;
      }
    }

    .tryPlugin {
      margin-top: 5px;
    }
  }

  .plugin-name {
    display: flex;
    align-items: center;
    color: #1f2329;
    font-weight: 500;

    .plugin-icon {
      margin-right: 8px;
      min-width: 24px;
      height: 24px;
    }
  }

  .plugin-description {
    color: #646a73;
    font-size: 13px;
  }

  :deep(.el-drawer__header) {
    margin-bottom: 12px;
  }

  .header {
    font-size: 16px;
    color: rgb(20, 86, 240);
    font-weight: 500;
  }
</style>

<style>
  .el-popper.is-customized {
    padding: 6px 12px;
    background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
  }

  .el-popper.is-customized .el-popper__arrow::before {
    background: linear-gradient(45deg, #b2e68d, #bce689);
    right: 0;
  }
</style>
