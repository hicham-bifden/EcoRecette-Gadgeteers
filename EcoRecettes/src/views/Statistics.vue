<template>
  <ion-page>
    <ion-content class="stats-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Statistiques</h1>
          <p class="subtitle">Vue d'ensemble de votre stock alimentaire</p>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card total">
          <div class="metric-icon">
            <ion-icon :icon="basket" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ totalProducts }}</h3>
            <p>Total produits</p>
          </div>
          <div class="metric-trend">
            <ion-icon :icon="trendingUp" class="trend-icon"></ion-icon>
          </div>
        </div>

        <div class="metric-card expired">
          <div class="metric-icon">
            <ion-icon :icon="warning" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ expiredProducts }}</h3>
            <p>Produits périmés</p>
          </div>
          <div class="metric-trend">
            <ion-icon :icon="trendingDown" class="trend-icon"></ion-icon>
          </div>
        </div>

        <div class="metric-card expiring">
          <div class="metric-icon">
            <ion-icon :icon="time" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ expiringSoonProducts }}</h3>
            <p>Expirent bientôt</p>
          </div>
          <div class="metric-trend">
            <ion-icon :icon="caretUp" class="trend-icon"></ion-icon>
          </div>
        </div>

        <div class="metric-card ok">
          <div class="metric-icon">
            <ion-icon :icon="checkmarkCircle" class="metric-icon-svg"></ion-icon>
          </div>
          <div class="metric-content">
            <h3>{{ okProducts }}</h3>
            <p>En bon état</p>
          </div>
          <div class="metric-trend">
            <ion-icon :icon="trendingUp" class="trend-icon"></ion-icon>
          </div>
        </div>
      </div>

      <div class="charts-container">
        <div class="chart-section">
          <div class="section-header">
            <ion-icon :icon="pieChart" class="section-icon"></ion-icon>
            <h3>Répartition par catégorie</h3>
          </div>
          <div class="chart-container">
            <canvas ref="categoryChart" width="300" height="200"></canvas>
          </div>
          <div class="chart-legend">
            <div v-for="category in categoryData" :key="category.name" class="legend-item">
              <div class="legend-color" :style="{ backgroundColor: category.color }"></div>
              <span>{{ category.name }}</span>
              <span class="legend-value">{{ category.value }}</span>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <div class="section-header">
            <ion-icon :icon="barChart" class="section-icon"></ion-icon>
            <h3>Évolution du stock</h3>
            <span class="period-badge">7 derniers jours</span>
          </div>
          <div class="chart-container">
            <canvas ref="evolutionChart" width="350" height="200"></canvas>
          </div>
          <div class="chart-info">
            <div class="info-item">
              <span class="info-label">Moyenne journalière</span>
              <span class="info-value">{{ averageDailyStock }} produits</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tendance</span>
              <span class="info-value positive">+12%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="insights-grid">
        <div class="insight-card primary">
          <div class="insight-header">
            <ion-icon :icon="trophy" class="insight-icon"></ion-icon>
            <h4>Catégorie préférée</h4>
          </div>
          <div class="insight-content">
            <div class="insight-value">{{ favoriteCategory.name }}</div>
            <div class="insight-detail">{{ favoriteCategory.percentage }}% de votre stock</div>
          </div>
        </div>

        <div class="insight-card success">
          <div class="insight-header">
            <ion-icon :icon="hourglass" class="insight-icon"></ion-icon>
            <h4>Conservation moyenne</h4>
          </div>
          <div class="insight-content">
            <div class="insight-value">{{ averageConservation }} jours</div>
            <div class="insight-detail">Durée avant péremption</div>
          </div>
        </div>

        <div class="insight-card warning">
          <div class="insight-header">
            <ion-icon :icon="speedometer" class="insight-icon"></ion-icon>
            <h4>Efficacité du stock</h4>
          </div>
          <div class="insight-content">
            <div class="insight-value">{{ stockEfficiency }}%</div>
            <div class="insight-detail">Taux d'utilisation optimal</div>
          </div>
        </div>

        <div class="insight-card info">
          <div class="insight-header">
            <ion-icon :icon="flame" class="insight-icon"></ion-icon>
            <h4>Produit populaire</h4>
          </div>
          <div class="insight-content">
            <div class="insight-value">{{ topProduct.name }}</div>
            <div class="insight-detail">{{ topProduct.count }} utilisations</div>
          </div>
        </div>
      </div>

      <div class="detailed-stats">
        <div class="section-header">
          <ion-icon :icon="analytics" class="section-icon"></ion-icon>
          <h3>Analyse détaillée</h3>
        </div>
        
        <div class="stats-grid">
          <div class="stat-section">
            <h4>
              <ion-icon :icon="list" class="stat-icon"></ion-icon>
              Produits les plus utilisés
            </h4>
            <div class="ranking-list">
              <div v-for="(item, index) in topConsumedProducts" :key="item.name" class="ranking-item">
                <div class="rank-number">{{ index + 1 }}</div>
                <div class="rank-content">
                  <span class="rank-name">{{ item.name }}</span>
                  <div class="rank-bar">
                    <div class="rank-fill" :style="{ width: (item.count / topConsumedProducts[0].count) * 100 + '%' }"></div>
                  </div>
                </div>
                <div class="rank-value">{{ item.count }}x</div>
              </div>
            </div>
          </div>

          <div class="stat-section">
            <h4>
              <ion-icon :icon="calendar" class="stat-icon"></ion-icon>
              Tendances hebdomadaires
            </h4>
            <div class="trends-list">
              <div class="trend-item">
                <span>Achats cette semaine</span>
                <div class="trend-indicator positive">
                  <ion-icon :icon="trendingUp" class="trend-mini-icon"></ion-icon>
                  <span>+23%</span>
                </div>
              </div>
              <div class="trend-item">
                <span>Consommation</span>
                <div class="trend-indicator neutral">
                  <ion-icon :icon="remove" class="trend-mini-icon"></ion-icon>
                  <span>Stable</span>
                </div>
              </div>
              <div class="trend-item">
                <span>Gaspillage</span>
                <div class="trend-indicator negative">
                  <ion-icon :icon="trendingDown" class="trend-mini-icon"></ion-icon>
                  <span>-8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="recommendations">
        <div class="section-header">
          <ion-icon :icon="bulb" class="section-icon"></ion-icon>
          <h3>Conseils personnalisés</h3>
        </div>
        <div class="recommendations-grid">
          <div v-for="tip in recommendations" :key="tip.id" class="recommendation-card" :class="tip.type">
            <div class="tip-header">
              <ion-icon :icon="tip.icon" class="tip-icon"></ion-icon>
              <h4>{{ tip.title }}</h4>
            </div>
            <p>{{ tip.description }}</p>
            <div class="tip-priority" :class="tip.priority">
              {{ formatPriority(tip.priority) }}
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { 
  basket, warning, time, checkmarkCircle, trendingUp, trendingDown, caretUp,
  pieChart, barChart, trophy, hourglass, speedometer, flame, analytics,
  list, calendar, bulb, remove, leaf, restaurant, fitness, shield
} from 'ionicons/icons';

const categoryChart = ref();
const evolutionChart = ref();

const mockProducts = [
  { category: 'frais', expirationDate: '2024-08-15' },
  { category: 'frais', expirationDate: '2024-08-12' },
  { category: 'sec', expirationDate: '2025-08-01' },
  { category: 'frais', expirationDate: '2024-08-10' },
  { category: 'surgele', expirationDate: '2024-12-01' },
  { category: 'sec', expirationDate: '2025-01-01' },
  { category: 'frais', expirationDate: '2024-08-08' },
  { category: 'frais', expirationDate: '2024-08-05' },
  { category: 'sec', expirationDate: '2025-03-01' },
  { category: 'surgele', expirationDate: '2024-11-01' },
  { category: 'frais', expirationDate: '2024-08-20' },
  { category: 'sec', expirationDate: '2025-02-01' }
];

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

const categoryData = computed(() => {
  const categories = ['frais', 'sec', 'surgele'];
  const colors = ['#10b981', '#3b82f6', '#f59e0b'];
  
  return categories.map((category, index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: mockProducts.filter(p => p.category === category).length,
    color: colors[index]
  }));
});

const topConsumedProducts = computed(() => [
  { name: 'Tomates', count: 15 },
  { name: 'Oignons', count: 12 },
  { name: 'Ail', count: 8 },
  { name: 'Riz', count: 6 },
  { name: 'Poulet', count: 4 }
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

const topProduct = computed(() => topConsumedProducts.value[0]);

const averageDailyStock = computed(() => {
  const weekData = [12, 15, 18, 14, 16, 19, 17];
  return Math.round(weekData.reduce((a, b) => a + b, 0) / weekData.length);
});

const recommendations = computed(() => [
  {
    id: 1,
    title: 'Planifiez vos achats',
    description: 'Établissez une liste de courses basée sur vos habitudes de consommation pour éviter le gaspillage.',
    icon: calendar,
    type: 'info',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Optimisez le stockage',
    description: 'Placez les produits qui expirent bientôt à l\'avant pour les utiliser en premier.',
    icon: warning,
    type: 'warning',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Conservez mieux',
    description: 'Congelez vos légumes frais en surplus pour prolonger leur durée de vie.',
    icon: leaf,
    type: 'success',
    priority: 'medium'
  },
  {
    id: 4,
    title: 'Cuisinez créatif',
    description: 'Transformez vos restes en nouvelles recettes délicieuses avec notre générateur.',
    icon: restaurant,
    type: 'primary',
    priority: 'low'
  }
]);

const formatPriority = (priority) => {
  const levels = {
    'high': 'Priorité haute',
    'medium': 'Priorité moyenne',
    'low': 'Conseil'
  };
  return levels[priority] || priority;
};

const createCategoryChart = () => {
  if (!categoryChart.value) return;
  
  const ctx = categoryChart.value.getContext('2d');
  if (!ctx) return;

  const centerX = 150;
  const centerY = 100;
  const radius = 70;
  
  ctx.clearRect(0, 0, 300, 200);
  
  let currentAngle = -Math.PI / 2;
  
  categoryData.value.forEach((category) => {
    const sliceAngle = (category.value / totalProducts.value) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = category.color;
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    currentAngle += sliceAngle;
  });
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(totalProducts.value.toString(), centerX, centerY + 4);
};

const createEvolutionChart = () => {
  if (!evolutionChart.value) return;
  
  const ctx = evolutionChart.value.getContext('2d');
  if (!ctx) return;

  const width = 350;
  const height = 200;
  const padding = 30;
  const barWidth = (width - 2 * padding) / 7;
  
  ctx.clearRect(0, 0, width, height);
  
  const data = [12, 15, 18, 14, 16, 19, 17];
  const labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  const maxValue = Math.max(...data);
  const scaleY = (height - 2 * padding) / maxValue;
  
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i * (height - 2 * padding)) / 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  
  data.forEach((value, index) => {
    const barHeight = value * scaleY;
    const x = padding + index * barWidth + barWidth * 0.2;
    const y = height - padding - barHeight;
    
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * 0.6, barHeight);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x + barWidth * 0.3, y - 8);
    ctx.fillText(labels[index], x + barWidth * 0.3, height - padding + 20);
  });
};

onMounted(() => {
  setTimeout(() => {
    createCategoryChart();
    createEvolutionChart();
  }, 100);
});
</script>

<style scoped>
.stats-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #ffffff;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0 0 32px 32px;
  padding: 32px 24px 24px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 20px 24px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.metric-card.total {
  border-left: 4px solid #10b981;
}

.metric-card.expired {
  border-left: 4px solid #ef4444;
}

.metric-card.expiring {
  border-left: 4px solid #f59e0b;
}

.metric-card.ok {
  border-left: 4px solid #3b82f6;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}

.metric-card.total .metric-icon {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.metric-card.expired .metric-icon {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
}

.metric-card.expiring .metric-icon {
  background: linear-gradient(135deg, #fffbeb, #fed7aa);
}

.metric-card.ok .metric-icon {
  background: linear-gradient(135deg, #eff6ff, #bfdbfe);
}

.metric-icon-svg {
  font-size: 28px;
}

.metric-card.total .metric-icon-svg {
  color: #10b981;
}

.metric-card.expired .metric-icon-svg {
  color: #ef4444;
}

.metric-card.expiring .metric-icon-svg {
  color: #f59e0b;
}

.metric-card.ok .metric-icon-svg {
  color: #3b82f6;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 4px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.metric-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.metric-trend {
  padding: 8px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.1);
}

.trend-icon {
  font-size: 20px;
  color: #10b981;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  padding: 0 20px 24px;
}

.chart-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 24px;
  color: #667eea;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.period-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.chart-legend {
  display: grid;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.legend-item span:first-of-type {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.legend-value {
  font-weight: 600;
  color: #1e293b;
}

.chart-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.info-item {
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
}

.info-value.positive {
  color: #10b981;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 0 20px 24px;
}

.insight-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.insight-card.primary {
  border-top: 4px solid #667eea;
}

.insight-card.success {
  border-top: 4px solid #10b981;
}

.insight-card.warning {
  border-top: 4px solid #f59e0b;
}

.insight-card.info {
  border-top: 4px solid #3b82f6;
}

.insight-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.insight-icon {
  font-size: 32px;
  color: #667eea;
}

.insight-card.success .insight-icon {
  color: #10b981;
}

.insight-card.warning .insight-icon {
  color: #f59e0b;
}

.insight-card.info .insight-icon {
  color: #3b82f6;
}

.insight-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.insight-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.insight-detail {
  font-size: 14px;
  color: #64748b;
}

.detailed-stats {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  margin: 0 20px 24px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.stat-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.stat-icon {
  color: #667eea;
  font-size: 18px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.rank-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.rank-content {
  flex: 1;
}

.rank-name {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.rank-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.rank-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.rank-value {
  font-weight: 600;
  color: #10b981;
  font-size: 14px;
}

.trends-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.trend-item span:first-child {
  font-weight: 500;
  color: #374151;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.trend-indicator.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.trend-indicator.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.trend-indicator.neutral {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.trend-mini-icon {
  font-size: 12px;
}

.recommendations {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  margin: 0 20px 40px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.recommendation-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.recommendation-card.info {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.recommendation-card.warning {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb, #fed7aa);
}

.recommendation-card.success {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
}

.recommendation-card.primary {
  border-color: #667eea;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tip-icon {
  font-size: 24px;
}

.recommendation-card.info .tip-icon {
  color: #3b82f6;
}

.recommendation-card.warning .tip-icon {
  color: #f59e0b;
}

.recommendation-card.success .tip-icon {
  color: #10b981;
}

.recommendation-card.primary .tip-icon {
  color: #667eea;
}

.tip-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.recommendation-card p {
  margin: 0 0 12px 0;
  color: #4b5563;
  line-height: 1.5;
  font-size: 14px;
}

.tip-priority {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tip-priority.high {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.tip-priority.medium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.tip-priority.low {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
    border-radius: 0 0 24px 24px;
  }

  .header-content h1 {
    font-size: 24px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    padding: 0 16px 20px;
    gap: 16px;
  }

  .metric-card {
    padding: 20px;
  }

  .metric-content h3 {
    font-size: 28px;
  }

  .charts-container {
    grid-template-columns: 1fr;
    padding: 0 16px 20px;
    gap: 20px;
  }

  .chart-section {
    padding: 20px;
  }

  .chart-container canvas {
    max-width: 100%;
    height: auto;
  }

  .insights-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 16px 20px;
    gap: 16px;
  }

  .insight-card {
    padding: 20px;
  }

  .insight-value {
    font-size: 24px;
  }

  .detailed-stats {
    margin: 0 16px 20px;
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .recommendations {
    margin: 0 16px 32px;
    padding: 20px;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    padding: 0 12px 16px;
  }

  .metric-card {
    padding: 16px;
    gap: 12px;
  }

  .metric-icon {
    width: 50px;
    height: 50px;
  }

  .metric-icon-svg {
    font-size: 24px;
  }

  .metric-content h3 {
    font-size: 24px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
    padding: 0 12px 16px;
  }

  .insight-icon {
    font-size: 28px;
  }

  .insight-value {
    font-size: 20px;
  }

  .charts-container,
  .detailed-stats,
  .recommendations {
    margin-left: 12px;
    margin-right: 12px;
    padding: 16px;
  }
}
</style>