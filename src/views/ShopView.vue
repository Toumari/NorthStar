<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamification'
import { useThemeStore } from '../stores/theme'

const store = useGamificationStore()
const themeStore = useThemeStore()

// Items grouped by type (currently only themes)
const themes = computed(() => store.SHOP_ITEMS.filter(i => i.type === 'theme'))

const handlePurchase = async (item: any) => {
    if (!confirm(`Purchase ${item.name} for ${item.cost} points?`)) return
    
    const result = await store.purchaseItem(item.id)
    if (!result.success) {
        alert(result.message) // Simple alert for MVP
    }
}

const handleEquip = (targetId: string) => {
    themeStore.setTheme(targetId)
}

const isOwned = (itemId: string) => store.unlockedItemIds.includes(itemId)
const isEquipped = (targetId: string) => themeStore.activeTheme === targetId
</script>

<template>
  <div class="shop-view">
    <header class="page-header">
      <div class="header-content">
        <h2>XP Shop</h2>
        <p class="subtitle">Spend your points on exclusive themes and customizations.</p>
      </div>
      <div class="balance-card">
        <span class="label">Available Points</span>
        <span class="amount">{{ Math.floor(store.coins) }} 🪙</span>
      </div>
    </header>

    <section class="shop-section">
      <h3>Themes</h3>
      <div class="items-grid">
        <div 
          v-for="item in themes" 
          :key="item.id" 
          class="shop-card"
          :class="{ 'owned': isOwned(item.id), 'equipped': isEquipped(item.targetId) }"
        >
          <div class="item-icon-wrapper" :class="`theme-preview-${item.targetId}`">
            <span class="item-icon">{{ item.icon }}</span>
          </div>
          
          <div class="item-details">
            <h4>{{ item.name }}</h4>
            <p>{{ item.description }}</p>
          </div>

          <div class="item-actions">
            <template v-if="isOwned(item.id)">
                <button 
                    v-if="isEquipped(item.targetId)" 
                    class="btn-equipped" 
                    disabled
                >
                    Equipped
                </button>
                <button 
                    v-else 
                    class="btn-equip" 
                    @click="handleEquip(item.targetId)"
                >
                    Equip
                </button>
            </template>
            <button 
                v-else 
                class="btn-buy" 
                @click="handlePurchase(item)"
                :disabled="store.coins < item.cost"
            >
                Buy {{ item.cost }} 🪙
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.balance-card {
  background: var(--color-surface);
  border: 1px solid var(--color-warning);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.balance-card .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
    font-weight: 700;
}

.balance-card .amount {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-warning);
}

.shop-section h3 {
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.shop-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: transform 0.2s, border-color 0.2s;
}

.shop-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
}

.shop-card.equipped {
    border-color: var(--color-primary);
    background: linear-gradient(to bottom right, var(--color-surface), var(--color-primary-light));
}

.item-icon-wrapper {
    height: 80px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background);
    margin-bottom: 0.5rem;
    font-size: 3rem;
}

/* Theme Previews */
.theme-preview-ocean { background-color: #0284c7; color: white; }
.theme-preview-sunset { background-color: #f97316; color: white; }
.theme-preview-forest { background-color: #10b981; color: white; }
.theme-preview-lavender { background-color: #8b5cf6; color: white; }

:root.dark .theme-preview-ocean { background-color: #38bdf8; }
:root.dark .theme-preview-sunset { background-color: #fbba74; }
:root.dark .theme-preview-forest { background-color: #4ade80; }
:root.dark .theme-preview-lavender { background-color: #c4b5fd; }

.item-details h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
}

.item-details p {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.9rem;
}

.item-actions {
    margin-top: auto;
}

button {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-buy {
    background-color: var(--color-surface-hover);
    color: var(--color-text);
}

.btn-buy:hover:not(:disabled) {
    background-color: var(--color-primary);
    color: white;
}

.btn-buy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-equip {
    background-color: var(--color-primary);
    color: white;
}

.btn-equip:hover {
    opacity: 0.9;
}

.btn-equipped {
    background-color: transparent;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    cursor: default;
}
</style>
