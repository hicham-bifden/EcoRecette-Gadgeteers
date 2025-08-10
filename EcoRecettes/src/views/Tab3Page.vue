<template>
  <ion-page>
    <ion-content class="stats-page">
      <!-- Header -->
      <div class="page-header">
        <h1>Statistiques</h1>
        <p class="subtitle">Vue d'ensemble de votre stock alimentaire</p>
      </div>

      <!-- Métriques principales -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon total">
            <ion-icon :icon="basket" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ totalProducts }}</h3>
            <p>Total produits</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon expired">
            <ion-icon :icon="warning" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ expiredProducts }}</h3>
            <p>Produits périmés</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon expiring">
            <ion-icon :icon="time" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ expiringSoonProducts }}</h3>
            <p>Expirent bientôt</p>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon ok">
            <ion-icon :icon="checkmarkCircle" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ okProducts }}</h3>
            <p>En bon état</p>
          </div>
        </div>
      </div>

      <!-- Graphique des catégories -->
      <div class="chart-section">
        <h3>Répartition par catégorie</h3>
        <div class="chart-container">
          <canvas ref="categoryChart" width="400" height="300"></canvas>
        </div>
        <div class="chart-legend">
          <div v-for="category in categoryData" :key="category.name" class="legend-item">
            <div class="legend-color" :style="{ backgroundColor: category.color }"></div>
            <span>{{ category.name }} ({{ category.value }})</span>
          </div>
        </div>
      </div>

      <!-- Graphique d'évolution -->
      <div class="chart-section">
        <h3>Évolution du stock (7 derniers jours)</h3>
        <div class="chart-container">
          <canvas ref="evolutionChart" width="400" height="300"></canvas>
        </div>
      </div>

      <!-- Statistiques détaillées -->
      <div class="detailed-stats">
        <h3>Statistiques détaillées</h3>
        
        <div class="stats-grid">
          <div class="stat-item">
            <h4>Produits les plus consommés</h4>
            <div class="stat-list">
              <div v-for="item in topConsumedProducts" :key="item.name" class="stat-row">
                <span>{{ item.name }}</span>
                <span class="stat-value">{{ item.count }}x</span>
              </div>
            </div>
          </div>

          <div class="stat-item">
            <h4>Catégorie préférée</h4>
            <div class="stat-value-large">{{ favoriteCategory.name }}</div>
            <p class="stat-description">{{ favoriteCategory.percentage }}% de votre stock</p>
          </div>

          <div class="stat-item">
            <h4>Moyenne de conservation</h4>
            <div class="stat-value-large">{{ averageConservation }} jours</div>
            <p class="stat-description">Durée moyenne avant péremption</p>
          </div>

          <div class="stat-item">
            <h4>Efficacité du stock</h4>
            <div class="stat-value-large">{{ stockEfficiency }}%</div>
            <p class="stat-description">Produits consommés vs gaspillés</p>
          </div>
        </div>
      </div>

      <!-- Conseils et recommandations -->
      <div class="recommendations">
        <h3>Conseils pour optimiser votre stock</h3>
        <div class="recommendations-list">
          <div v-for="tip in recommendations" :key="tip.id" class="recommendation-item">
            <ion-icon :icon="tip.icon" class="tip-icon" :class="tip.type"></ion-icon>
            <div class="tip-content">
              <h4>{{ tip.title }}</h4>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { 
  basket, warning, time, checkmarkCircle, leaf, water, fish, trendingUp, 
  calendar, scale, pricetag
} from 'ionicons/icons';

// Types
interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopProduct {
  name: string;
  count: number;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  icon: string;
  type: string;
}

// État réactif
const categoryChart = ref<HTMLCanvasElement>();
const evolutionChart = ref<HTMLCanvasElement>();

// Données simulées
const mockProducts = [
  { category: 'frais', expirationDate: '2024-08-15' },
  { category: 'frais', expirationDate: '2024-08-12' },
  { category: 'sec', expirationDate: '2025-08-01' },
  { category: 'frais', expirationDate: '2024-08-10' },
  { category: 'surgelé', expirationDate: '2024-12-01' },
  { category: 'sec', expirationDate: '2025-01-01' },
  { category: 'frais', expirationDate: '2024-08-08' },
  { category: 'frais', expirationDate: '2024-08-05' },
  { category: 'sec', expirationDate: '2025-03-01' },
  { category: 'surgelé', expirationDate: '2024-11-01' }
];

// Computed properties
const totalProducts = computed(() => mockProducts.length);

const expiredProducts = computed(() => {
  const today = new Date();
  return mockProducts.filter(product => 
    new Date(product.expirationDate) < today
  ).length;
});

const expiringSoonProducts = computed(() => {
  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
  return mockProducts.filter(product => {
    const expiration = new Date(product.expirationDate);
    return expiration >= today && expiration <= threeDaysFromNow;
  }).length;
});

const okProducts = computed(() => {
  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
  return mockProducts.filter(product => 
    new Date(product.expirationDate) > threeDaysFromNow
  ).length;
});

const categoryData = computed((): CategoryData[] => {
  const categories = ['frais', 'sec', 'surgelé'];
  const colors = ['#4CAF50', '#2196F3', '#FF9800'];
  
  return categories.map((category, index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: mockProducts.filter(p => p.category === category).length,
    color: colors[index]
  }));
});

const topConsumedProducts = computed((): TopProduct[] => [
  { name: 'Tomates', count: 15 },
  { name: 'Oignons', count: 12 },
  { name: 'Ail', count: 8 },
  { name: 'Riz', count: 6 }
]);

const favoriteCategory = computed(() => {
  const category = categoryData.value.reduce((prev, current) => 
    prev.value > current.value ? prev : current
  );
  const percentage = Math.round((category.value / totalProducts.value) * 100);
  return { name: category.name, percentage };
});

const averageConservation = computed(() => {
  const today = new Date();
  const totalDays = mockProducts.reduce((sum, product) => {
    const expiration = new Date(product.expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + Math.max(0, diffDays);
  }, 0);
  return Math.round(totalDays / totalProducts.value);
});

const stockEfficiency = computed(() => {
  const total = totalProducts.value;
  const expired = expiredProducts.value;
  return Math.round(((total - expired) / total) * 100);
});

const recommendations = computed((): Recommendation[] => [
  {
    id: 1,
    title: 'Planifiez vos achats',
    description: 'Achetez seulement ce dont vous avez besoin pour la semaine',
    icon: 'calendar',
    type: 'info'
  },
  {
    id: 2,
    title: 'Vérifiez les dates',
    description: 'Placez les produits qui expirent bientôt devant',
    icon: 'warning',
    type: 'warning'
  },
  {
    id: 3,
    title: 'Congelez les surplus',
    description: 'Congelez les légumes frais pour prolonger leur durée',
    icon: 'leaf',
    type: 'success'
  },
  {
    id: 4,
    title: 'Utilisez les restes',
    description: 'Transformez vos restes en nouvelles recettes',
    icon: 'restaurant',
    type: 'primary'
  }
]);

// Méthodes pour les graphiques
const createCategoryChart = () => {
  if (!categoryChart.value) return;
  
  const ctx = categoryChart.value.getContext('2d');
  if (!ctx) return;

  // Simulation d'un graphique en camembert avec Canvas API
  const centerX = 200;
  const centerY = 150;
  const radius = 100;
  
  let currentAngle = 0;
  
  categoryData.value.forEach((category, index) => {
    const sliceAngle = (category.value / totalProducts.value) * 2 * Math.PI;
    
    // Dessiner la tranche
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = category.color;
    ctx.fill();
    
    // Dessiner le contour
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    currentAngle += sliceAngle;
  });
  
  // Dessiner le centre
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.stroke();
};

const createEvolutionChart = () => {
  if (!evolutionChart.value) return;
  
  const ctx = evolutionChart.value.getContext('2d');
  if (!ctx) return;

  // Simulation d'un graphique en barres avec Canvas API
  const width = 400;
  const height = 300;
  const padding = 40;
  const barWidth = (width - 2 * padding) / 7;
  
  // Effacer le canvas
  ctx.clearRect(0, 0, width, height);
  
  // Dessiner les axes
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  
  // Axe Y
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.stroke();
  
  // Axe X
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Données simulées pour l'évolution
  const data = [12, 15, 18, 14, 16, 19, 17];
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  const maxValue = Math.max(...data);
  const scaleY = (height - 2 * padding) / maxValue;
  
  // Dessiner les barres
  data.forEach((value, index) => {
    const barHeight = value * scaleY;
    const x = padding + index * barWidth + barWidth * 0.1;
    const y = height - padding - barHeight;
    
    // Barre
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    
    // Valeur
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x + barWidth * 0.4, y - 5);
    
    // Label
    ctx.fillText(labels[index], x + barWidth * 0.4, height - padding + 20);
  });
};

// Initialisation
onMounted(() => {
  setTimeout(() => {
    createCategoryChart();
    createEvolutionChart();
  }, 100);
});
</script>

<style scoped>
.stats-page {
  --background: #f8f9fa;
}

.page-header {
  text-align: center;
  padding: 24px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.total {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.metric-icon.expired {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.metric-icon.expiring {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.metric-icon.ok {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.metric-icon-svg {
  font-size: 28px;
  color: white;
}

.metric-content h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.metric-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chart-section {
  background: white;
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.chart-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  text-align: center;
}

.chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.detailed-stats {
  background: white;
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.detailed-stats h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
}

.stat-item h4 {
  margin: 0 0 16px 0;
  color: #34495e;
  font-size: 16px;
  font-weight: 500;
}

.stat-value-large {
  font-size: 32px;
  font-weight: 600;
  color: #4CAF50;
  margin-bottom: 8px;
}

.stat-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-value {
  font-weight: 500;
  color: #4CAF50;
}

.recommendations {
  background: white;
  margin: 16px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recommendations h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
  text-align: center;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
}

.tip-icon {
  font-size: 24px;
  margin-top: 4px;
}

.tip-icon.info {
  color: #2196F3;
}

.tip-icon.warning {
  color: #ff9800;
}

.tip-icon.success {
  color: #4CAF50;
}

.tip-icon.primary {
  color: #9C27B0;
}

.tip-content h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
}

.tip-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container canvas {
    max-width: 100%;
    height: auto;
  }
}
</style>
