<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <ion-icon :icon="leaf" class="header-icon"></ion-icon>
          Tableau de bord
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="goToSettings" fill="clear">
            <ion-icon :icon="settings" />
          </ion-button>
          <ion-button @click="handleLogout" fill="clear">
            <ion-icon :icon="logOut" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="dashboard-content">
      <!-- Message de bienvenue -->
      <div class="welcome-section">
        <h1 class="welcome-title">
          Bonjour {{ authStore.userName }} !
        </h1>
        <p class="welcome-subtitle">
          Gérez votre stock et réduisez le gaspillage alimentaire
        </p>
      </div>

      <!-- Alertes importantes -->
      <div class="alerts-section" v-if="hasAlerts">
        <ion-card color="warning" class="alert-card">
          <ion-card-content>
            <div class="alert-header">
              <ion-icon :icon="alertCircle" class="alert-icon"></ion-icon>
              <h3>Produits à surveiller</h3>
            </div>
            
            <div class="alert-stats">
              <div class="stat-item urgent">
                <span class="stat-number">{{ expiringTodayCount }}</span>
                <span class="stat-label">Expirent aujourd'hui</span>
              </div>
              <div class="stat-item warning">
                <span class="stat-number">{{ expiringSoonCount }}</span>
                <span class="stat-label">Expirent dans 3 jours</span>
              </div>
            </div>

            <ion-button 
              expand="block" 
              fill="solid" 
              color="warning"
              @click="goToStock"
              class="alert-button"
            >
              Voir le stock
              <ion-icon :icon="chevronForward" slot="end"></ion-icon>
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Statistiques rapides -->
      <div class="stats-section">
        <h2 class="section-title">Aperçu rapide</h2>
        
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <ion-icon :icon="basket" class="stat-icon primary"></ion-icon>
                <div class="stat-info">
                  <span class="stat-value">{{ totalProductsCount }}</span>
                  <span class="stat-description">Produits en stock</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <ion-icon :icon="restaurant" class="stat-icon success"></ion-icon>
                <div class="stat-info">
                  <span class="stat-value">8</span>
                  <span class="stat-description">Recettes générées</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-content">
                <ion-icon :icon="trendingUp" class="stat-icon tertiary"></ion-icon>
                <div class="stat-info">
                  <span class="stat-value">35%</span>
                  <span class="stat-description">Réduction gaspillage</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="actions-section">
        <h2 class="section-title">Actions rapides</h2>
        
        <div class="actions-grid">
          <ion-card class="action-card" @click="goToStock">
            <ion-card-content>
              <ion-icon :icon="addCircle" class="action-icon"></ion-icon>
              <h3>Ajouter un produit</h3>
              <p>Saisir manuellement</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="action-card" @click="goToRecipes">
            <ion-card-content>
              <ion-icon :icon="flash" class="action-icon"></ion-icon>
              <h3>Générer une recette</h3>
              <p>IA basée sur votre stock</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="action-card" @click="goToStatistics">
            <ion-card-content>
              <ion-icon :icon="analytics" class="action-icon"></ion-icon>
              <h3>Voir les statistiques</h3>
              <p>Analyse de votre consommation</p>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Produits récents -->
      <div class="recent-section" v-if="hasRecentProducts">
        <h2 class="section-title">Produits récents</h2>
        
        <div class="products-scroll">
          <ion-card 
            v-for="product in recentProducts" 
            :key="product.id"
            class="product-card"
            @click="viewProduct(product)"
          >
            <ion-card-content>
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p class="expiry-date" :class="getExpiryClass(product.expiryDate)">
                  Expire le {{ formatDate(product.expiryDate) }}
                </p>
              </div>
              <div class="product-status">
                <ion-badge :color="getStatusColor(product.expiryDate)">
                  {{ getStatusText(product.expiryDate) }}
                </ion-badge>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- État vide -->
      <div class="empty-state" v-if="!hasRecentProducts && !loading">
        <ion-icon :icon="leaf" class="empty-icon"></ion-icon>
        <h2>Commencez votre parcours éco-responsable !</h2>
        <p>Ajoutez vos premiers produits pour commencer à réduire le gaspillage alimentaire.</p>
        <ion-button @click="goToStock" color="primary" size="large">
          <ion-icon :icon="addCircle" slot="start"></ion-icon>
          Ajouter mes premiers produits
        </ion-button>
      </div>

      <!-- Loading -->
      <div class="loading-state" v-if="loading">
        <ion-spinner color="primary"></ion-spinner>
        <p>Chargement de vos données...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonCard, IonCardContent, IonBadge, IonSpinner
} from '@ionic/vue'
import {
  leaf, settings, logOut, alertCircle, basket, restaurant, trendingUp,
  addCircle, flash, analytics, chevronForward
} from 'ionicons/icons'
import { useAuthStore } from '../stores/authStore'
import { useStockStore } from '../stores/stockStore'

export default {
  name: 'Dashboard',
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonCard, IonCardContent, IonBadge, IonSpinner
  },
  data() {
    return {
      loading: false,
      authStore: useAuthStore(),
      stockStore: useStockStore(),
      // Icônes
      leaf, settings, logOut, alertCircle, basket, restaurant, trendingUp,
      addCircle, flash, analytics, chevronForward
    }
  },
  computed: {
    totalProductsCount() {
      return this.stockStore.totalProducts
    },
    expiringTodayCount() {
      return this.stockStore.expiringTodayCount
    },
    expiringSoonCount() {
      return this.stockStore.expiringSoonCount
    },
    hasAlerts() {
      return this.stockStore.hasAlerts
    },
    recentProducts() {
      return this.stockStore.recentProducts
    },
    hasRecentProducts() {
      return this.recentProducts.length > 0
    }
  },
  methods: {
    goToSettings() {
      this.$router.push('/settings')
    },
    goToStock() {
      this.$router.push('/tabs/stock')
    },
    goToRecipes() {
      this.$router.push('/tabs/recettes')
    },
    goToStatistics() {
      this.$router.push('/tabs/statistiques')
    },
    async handleLogout() {
      try {
        await this.authStore.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Erreur de déconnexion:', error)
      }
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short'
      }).format(date)
    },
    getExpiryClass(expiryDate) {
      const today = new Date()
      const diffTime = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 0) return 'expired'
      if (diffDays <= 1) return 'expires-today'
      if (diffDays <= 3) return 'expires-soon'
      return 'fresh'
    },
    getStatusColor(expiryDate) {
      const today = new Date()
      const diffTime = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 0) return 'danger'
      if (diffDays <= 1) return 'warning'
      if (diffDays <= 3) return 'warning'
      return 'success'
    },
    getStatusText(expiryDate) {
      const today = new Date()
      const diffTime = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 0) return 'Expiré'
      if (diffDays <= 1) return 'Urgent'
      if (diffDays <= 3) return 'Bientôt'
      return 'Frais'
    },
    viewProduct(product) {
      console.log('Voir produit:', product.name)
    }
  },
  async mounted() {
    this.loading = true
    try {
      await this.stockStore.initialize()
    } catch (error) {
      console.error('Erreur initialisation dashboard:', error)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.dashboard-content {
  --padding-start: 16px;
  --padding-end: 16px;
}

.header-icon {
  margin-right: 8px;
  color: #4CAF50;
}

.welcome-section {
  padding: 24px 0;
  text-align: center;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  margin: -16px -16px 24px -16px;
  border-radius: 0 0 24px 24px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.alerts-section {
  margin-bottom: 24px;
}

.alert-card {
  margin: 0;
  border-left: 4px solid #ff9800;
}

.alert-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.alert-icon {
  font-size: 24px;
  color: #ff9800;
  margin-right: 12px;
}

.alert-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.alert-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 152, 0, 0.1);
}

.stat-item.urgent {
  background: rgba(244, 67, 54, 0.1);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #ff9800;
}

.stat-item.urgent .stat-number {
  color: #f44336;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.stat-card {
  margin: 0;
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 28px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.stat-icon.success {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.stat-icon.tertiary {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-description {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.actions-section {
  margin-bottom: 32px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.action-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-card ion-card-content {
  text-align: center;
  padding: 20px 16px;
}

.action-icon {
  font-size: 32px;
  color: #4CAF50;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.action-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.recent-section {
  margin-bottom: 32px;
}

.products-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.product-card {
  min-width: 200px;
  margin: 0;
  cursor: pointer;
  border-radius: 12px;
}

.product-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.expiry-date {
  font-size: 14px;
  margin: 0;
}

.expiry-date.expired {
  color: #f44336;
  font-weight: 600;
}

.expiry-date.expires-today {
  color: #ff9800;
  font-weight: 600;
}

.expiry-date.expires-soon {
  color: #ff9800;
}

.expiry-date.fresh {
  color: #4CAF50;
}

.product-status {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  color: #4CAF50;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.loading-state {
  text-align: center;
  padding: 48px 24px;
  color: #666;
}

.loading-state ion-spinner {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
}
</style>