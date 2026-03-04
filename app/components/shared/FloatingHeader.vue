<script setup lang="ts">
onMounted(() => {
  const handleHeader = () => {
    const header = document.querySelector('header')
    if (header) {
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY || window.pageYOffset
        if (scrollY > 70) {
          header.style.transform = 'translateY(0)'
        } else {
          header.style.transform = 'translateY(-200px)'
        }
      })
    }
  }

  handleHeader()
})
</script>

<template>
  <header class="w-full bg-background fixed top-0 left-0 z-40">
    <SharedHeaderContent />
  </header>
</template>
