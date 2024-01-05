<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-25 20:55
 * @LastAuthor : itchaox
 * @LastTime   : 2024-01-05 23:20
 * @desc       : 
-->

<script setup>
  import Form from './components/Form.vue';
  import { useTheme } from '@/hooks/useTheme';

  import GetData from './forUpdateData/GetData.vue';

  useTheme();
</script>

<template>
  <main>
    <!-- FIXME 真实组件 -->
    <Form />

    <!-- 用于获取数据的组件 -->
    <!-- <GetData /> -->
  </main>
</template>

<style scoped>
  main {
    padding: 1rem;
    padding-top: 0rem;
    height: 95vh;
  }
  h4 {
    font-size: calc(1.275rem + 0.3vw);
    margin-bottom: 1rem;
  }
  code {
    font-size: 0.875em;
    color: #d63384;
    word-wrap: break-word;
  }
</style>
