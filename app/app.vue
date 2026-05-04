<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/images/LC W@2x.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Lawyers & Clients'
const description = 'Connect with verified legal professionals for any case. Browse, compare, and hire the right lawyer quickly and confidently.'

useSeoMeta({
  title,
  description,
  image: '/images/LC W@2x.png',
  ogTitle: title,
  ogDescription: description,
  ogImage: '/images/LC W@2x.png',
  twitterImage: '/images/LC W@2x.png',
  twitterCard: 'Connect with verified lawyers and legal representatives tailored to your needs. Fast, reliable, and secure.'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
