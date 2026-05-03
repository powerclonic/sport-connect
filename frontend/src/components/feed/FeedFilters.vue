<template>
  <section class="flex flex-col gap-4">
    <v-text-field
      clearable
      flat
      hide-details
      :model-value="searchQuery"
      :placeholder="searchPlaceholder"
      prepend-inner-icon="mdi-magnify"
      rounded="pill"
      variant="solo-filled"
      @update:model-value="$emit('update:searchQuery', $event ?? '')"
    />

    <v-chip-group
      class="px-0.5 pb-1"
      :model-value="activeCategory"
      @update:model-value="(v) => v !== undefined && $emit('update:activeCategory', v as string)"
    >
      <v-chip
        v-for="cat in categories"
        :key="cat.key"
        class="!text-sm !font-semibold !tracking-wide !shrink-0 [font-family:var(--font-body)]"
        color="primary"
        rounded="pill"
        :value="cat.key"
        variant="tonal"
      >
        {{ cat.label }}
      </v-chip>
    </v-chip-group>
  </section>
</template>

<script setup lang="ts">
  type CategoryItem = {
    key: string
    label: string
  }

  defineProps<{
    searchPlaceholder: string
    searchQuery: string
    activeCategory: string
    categories: CategoryItem[]
  }>()

  defineEmits<{
    'update:searchQuery': [value: string]
    'update:activeCategory': [value: string]
  }>()
</script>
