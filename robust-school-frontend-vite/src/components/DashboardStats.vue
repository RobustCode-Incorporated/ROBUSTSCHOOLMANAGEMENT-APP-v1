<template>
  <div class="stats-container">
    <div class="stat-card" v-for="stat in stats" :key="stat.label">
      <div class="stat-number">
        <span class="icon">{{ stat.icon }}</span> {{ stat.value }}
      </div>
      <div class="stat-label">{{ stat.label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps(['stats'])
</script>

<style scoped>
.stats-container {
  display: flex;
  gap: 1rem;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.stat-card {
  flex: 1 1 22%;
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  font-size: 0.85rem;
}

.stat-number {
  font-size: 1.5rem;
  color: #0E2C5A;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.stat-label {
  margin-top: 0.4rem;
  color: #707070;
}

.icon {
  font-size: 1.6rem;
}
</style>