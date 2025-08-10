<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title class="ion-text-center">
          <ion-icon :icon="leaf" class="header-icon"></ion-icon>
          EcoRecettes
        </ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="stock" href="/tabs/stock">
          <ion-icon aria-hidden="true" :icon="basket" />
          <ion-label>Stock</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="recettes" href="/tabs/recettes">
          <ion-icon aria-hidden="true" :icon="restaurant" />
          <ion-label>Recettes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="statistiques" href="/tabs/statistiques">
          <ion-icon aria-hidden="true" :icon="barChart" />
          <ion-label>Statistiques</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import { basket, restaurant, barChart, leaf } from 'ionicons/icons';
</script>

<style scoped>
.header-icon {
  margin-right: 8px;
  color: #4CAF50;
}

.custom-tab-bar {
  --background: #ffffff;
  --color: #666666;
  --color-selected: #4CAF50;
  border-top: 1px solid #e0e0e0;
}

ion-tab-button {
  --color-selected: #4CAF50;
  font-weight: 500;
}

ion-title {
  font-weight: 600;
  color: #2c3e50;
}
</style>
