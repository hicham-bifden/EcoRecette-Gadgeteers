<template>
  <ion-page>
    <ion-content class="stock-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Stock Alimentaire</h1>
          <p class="subtitle">{{ products.length }} produits en stock</p>
        </div>
        <ion-button @click="openAddModal" fill="solid" class="add-button">
          <ion-icon :icon="add" slot="start"></ion-icon>
          Ajouter
        </ion-button>
      </div>

      <div class="search-section">
        <ion-searchbar 
          v-model="searchTerm" 
          placeholder="Rechercher un produit..."
          class="search-bar"
          @ionInput="filterProducts"
          show-clear-button="focus"
        ></ion-searchbar>
      </div>

      <div class="category-filters">
        <div class="filters-wrapper">
          <ion-chip 
            v-for="category in categories" 
            :key="category.value"
            :color="selectedCategory === category.value ? 'primary' : undefined"
            @click="filterByCategory(category.value)"
            class="filter-chip"
            :class="{ 'active': selectedCategory === category.value }"
          >
            <ion-icon :icon="category.icon" slot="start"></ion-icon>
            {{ category.label }}
          </ion-chip>
        </div>
      </div>

      <div class="products-container">
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-content">
            <ion-icon :icon="basketOutline" class="empty-icon"></ion-icon>
            <h2>Aucun produit trouvé</h2>
            <p>{{ searchTerm || selectedCategory !== 'all' ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter votre premier produit' }}</p>
            <ion-button @click="openAddModal" fill="solid" size="large" class="cta-button">
              <ion-icon :icon="add" slot="start"></ion-icon>
              Ajouter un produit
            </ion-button>
          </div>
        </div>

        <div v-else class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
            :class="getExpirationClass(product.expirationDate)"
          >
            <div class="card-header">
              <div class="product-title">
                <h3>{{ product.name }}</h3>
                <span class="category-tag">{{ getCategoryLabel(product.category) }}</span>
              </div>
              <div class="product-actions">
                <ion-button @click="editProduct(product)" fill="clear" size="small" class="action-btn edit-btn">
                  <ion-icon :icon="create" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button @click="deleteProduct(product.id)" fill="clear" size="small" class="action-btn delete-btn">
                  <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </div>
            
            <div class="product-details">
              <div class="detail-item">
                <div class="detail-icon">
                  <ion-icon :icon="scale"></ion-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Quantité</span>
                  <span class="detail-value">{{ product.quantity }} {{ product.unit }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <ion-icon :icon="calendar"></ion-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Date d'achat</span>
                  <span class="detail-value">{{ formatDate(product.purchaseDate) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon expiration-icon">
                  <ion-icon :icon="warning"></ion-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Expire le</span>
                  <span class="detail-value">{{ formatDate(product.expirationDate) }}</span>
                </div>
              </div>
            </div>

            <div class="expiration-status" :class="getExpirationClass(product.expirationDate)">
              <div class="status-indicator"></div>
              <span class="status-text">{{ getExpirationText(product.expirationDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="product-modal">
        <ion-header class="modal-header">
          <ion-toolbar>
            <ion-title>
              <div class="modal-title">
                <ion-icon :icon="editingProduct ? create : add" class="title-icon"></ion-icon>
                {{ editingProduct ? 'Modifier le produit' : 'Nouveau produit' }}
              </div>
            </ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal" fill="clear">
                <ion-icon :icon="close" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="modal-content">
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="form-section">
              <h4 class="section-title">Informations générales</h4>
              
              <ion-item class="form-item">
                <ion-label position="stacked">Nom du produit *</ion-label>
                <ion-input 
                  v-model="productForm.name" 
                  placeholder="Ex: Tomates cerises"
                  required
                  class="form-input"
                ></ion-input>
              </ion-item>

              <ion-item class="form-item">
                <ion-label position="stacked">Catégorie *</ion-label>
                <ion-select 
                  v-model="productForm.category" 
                  placeholder="Choisir une catégorie"
                  required
                  class="form-input"
                >
                  <ion-select-option value="frais">
                    <ion-icon :icon="nutrition" slot="start"></ion-icon>
                    Frais
                  </ion-select-option>
                  <ion-select-option value="sec">
                    <ion-icon :icon="fastFood" slot="start"></ion-icon>
                    Sec
                  </ion-select-option>
                  <ion-select-option value="surgele">
                    <ion-icon :icon="snow" slot="start"></ion-icon>
                    Surgelé
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </div>

            <div class="form-section">
              <h4 class="section-title">Quantité</h4>
              
              <div class="quantity-row">
                <ion-item class="form-item quantity-input">
                  <ion-label position="stacked">Quantité *</ion-label>
                  <ion-input 
                    v-model="productForm.quantity" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    required
                    class="form-input"
                  ></ion-input>
                </ion-item>

                <ion-item class="form-item unit-input">
                  <ion-label position="stacked">Unité *</ion-label>
                  <ion-select 
                    v-model="productForm.unit" 
                    placeholder="Unité"
                    required
                    class="form-input"
                  >
                    <ion-select-option value="kg">kg</ion-select-option>
                    <ion-select-option value="g">g</ion-select-option>
                    <ion-select-option value="L">L</ion-select-option>
                    <ion-select-option value="ml">ml</ion-select-option>
                    <ion-select-option value="unités">unités</ion-select-option>
                  </ion-select>
                </ion-item>
              </div>
            </div>

            <div class="form-section">
              <h4 class="section-title">Dates importantes</h4>
              
              <ion-item class="form-item">
                <ion-label position="stacked">Date d'achat *</ion-label>
                <ion-datetime 
                  v-model="productForm.purchaseDate" 
                  presentation="date"
                  :max="todayISODate"
                  required
                  class="form-input"
                ></ion-datetime>
              </ion-item>

              <ion-item class="form-item">
                <ion-label position="stacked">Date de péremption *</ion-label>
                <ion-datetime 
                  v-model="productForm.expirationDate" 
                  presentation="date"
                  :min="productForm.purchaseDate || todayISODate"
                  required
                  class="form-input"
                ></ion-datetime>
              </ion-item>
            </div>

            <div class="form-actions">
              <ion-button type="button" @click="closeModal" fill="outline" size="large" class="cancel-btn">
                Annuler
              </ion-button>
              <ion-button type="submit" fill="solid" size="large" class="submit-btn">
                <ion-icon :icon="editingProduct ? checkmark : add" slot="start"></ion-icon>
                {{ editingProduct ? 'Modifier' : 'Ajouter' }}
              </ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonButton, IonIcon, IonSearchbar, IonChip,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonDatetime
} from '@ionic/vue';
import { 
  add, basketOutline, create, trash, scale, calendar, warning, 
  checkmark, close, nutrition, storefront, snow, fastFood
} from 'ionicons/icons';

const products = ref([]);
const searchTerm = ref('');
const selectedCategory = ref('all');
const isModalOpen = ref(false);
const editingProduct = ref(null);
const productForm = ref({
  name: '',
  category: '',
  quantity: 0,
  unit: '',
  purchaseDate: '',
  expirationDate: ''
});

const categories = [
  { value: 'all', label: 'Tous', icon: storefront },
  { value: 'frais', label: 'Frais', icon: nutrition },
  { value: 'sec', label: 'Sec', icon: fastFood },
  { value: 'surgele', label: 'Surgelé', icon: snow }
];

const mockProducts = [
  {
    id: 1,
    name: 'Tomates cerises',
    category: 'frais',
    quantity: 500,
    unit: 'g',
    purchaseDate: '2024-08-08',
    expirationDate: '2024-08-15'
  },
  {
    id: 2,
    name: 'Riz basmati',
    category: 'sec',
    quantity: 1,
    unit: 'kg',
    purchaseDate: '2024-08-01',
    expirationDate: '2025-08-01'
  },
  {
    id: 3,
    name: 'Poivrons rouges',
    category: 'frais',
    quantity: 300,
    unit: 'g',
    purchaseDate: '2024-08-09',
    expirationDate: '2024-08-12'
  }
];

const todayISODate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const filteredProducts = computed(() => {
  let filtered = products.value;
  
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase().trim();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(term)
    );
  }
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(product => product.category === selectedCategory.value);
  }
  
  return filtered.sort((a, b) => 
    new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
  );
});

const openAddModal = () => {
  editingProduct.value = null;
  resetForm();
  isModalOpen.value = true;
};

const editProduct = (product) => {
  editingProduct.value = product;
  productForm.value = { ...product };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
  editingProduct.value = null;
};

const resetForm = () => {
  productForm.value = {
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    purchaseDate: todayISODate.value,
    expirationDate: ''
  };
};

const saveProduct = () => {
  if (!validateForm()) return;

  if (editingProduct.value) {
    const index = products.value.findIndex(p => p.id === editingProduct.value.id);
    if (index !== -1) {
      products.value[index] = { ...productForm.value, id: editingProduct.value.id };
    }
  } else {
    const newProduct = {
      ...productForm.value,
      id: Date.now()
    };
    products.value.push(newProduct);
  }
  
  saveToStorage();
  closeModal();
};

const validateForm = () => {
  const form = productForm.value;
  if (!form.name.trim() || !form.category || !form.unit || 
      form.quantity <= 0 || !form.purchaseDate || !form.expirationDate) {
    return false;
  }
  
  if (new Date(form.expirationDate) < new Date(form.purchaseDate)) {
    return false;
  }
  
  return true;
};

const deleteProduct = (id) => {
  products.value = products.value.filter(p => p.id !== id);
  saveToStorage();
};

const filterByCategory = (category) => {
  selectedCategory.value = category;
};

const filterProducts = () => {
  // La logique est gérée par le computed filteredProducts
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getCategoryLabel = (categoryValue) => {
  const category = categories.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

const getExpirationClass = (expirationDate) => {
  if (!expirationDate) return 'ok';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(expirationDate);
  expiration.setHours(0, 0, 0, 0);
  
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiring-soon';
  return 'ok';
};

const getExpirationText = (expirationDate) => {
  if (!expirationDate) return 'N/A';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(expirationDate);
  expiration.setHours(0, 0, 0, 0);
  
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Périmé';
  if (diffDays === 0) return 'Expire aujourd\'hui';
  if (diffDays === 1) return 'Expire demain';
  if (diffDays <= 3) return `Dans ${diffDays} jours`;
  return 'Bon état';
};

const saveToStorage = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('foodStock', JSON.stringify(products.value));
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

const loadFromStorage = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('foodStock');
      if (stored) {
        products.value = JSON.parse(stored);
      } else {
        products.value = [...mockProducts];
        saveToStorage();
      }
    } else {
      products.value = [...mockProducts];
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    products.value = [...mockProducts];
  }
};

onMounted(() => {
  loadFromStorage();
  resetForm();
});
</script>

<style scoped>
.stock-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #ffffff;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0 0 32px 32px;
  padding: 32px 24px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0 0 4px 0;
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
  font-size: 14px;
  font-weight: 500;
}

.add-button {
  --background: linear-gradient(135deg, #10b981, #059669);
  --background-hover: linear-gradient(135deg, #059669, #047857);
  --color: white;
  --border-radius: 16px;
  --padding-start: 20px;
  --padding-end: 20px;
  height: 48px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
}

.search-section {
  padding: 0 24px 24px;
}

.search-bar {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 20px;
  --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --color: #1e293b;
  --placeholder-color: #64748b;
  backdrop-filter: blur(10px);
}

.category-filters {
  padding: 0 24px 32px;
}

.filters-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-chip {
  --background: rgba(255, 255, 255, 0.2);
  --color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.filter-chip.active {
  --background: rgba(255, 255, 255, 0.95);
  --color: #667eea;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.products-container {
  padding: 0 24px 40px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 24px;
}

.empty-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.empty-content p {
  margin: 0 0 32px 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.cta-button {
  --background: linear-gradient(135deg, #667eea, #764ba2);
  --color: white;
  --border-radius: 16px;
  height: 56px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.products-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.product-card.expired {
  border-left: 4px solid #ef4444;
}

.product-card.expiring-soon {
  border-left: 4px solid #f59e0b;
}

.product-card.ok {
  border-left: 4px solid #10b981;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.product-title h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.category-tag {
  display: inline-block;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  --border-radius: 12px;
  width: 40px;
  height: 40px;
}

.edit-btn {
  --background: rgba(59, 130, 246, 0.1);
  --color: #3b82f6;
}

.delete-btn {
  --background: rgba(239, 68, 68, 0.1);
  --color: #ef4444;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.expiration-icon {
  background: linear-gradient(135deg, #fef3c7, #fbbf24);
  color: #d97706;
}

.detail-content {
  flex: 1;
}

.detail-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 2px;
}

.detail-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.expiration-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.expiration-status.expired {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.expiration-status.expired .status-indicator {
  background: #ef4444;
}

.expiration-status.expiring-soon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.expiration-status.expiring-soon .status-indicator {
  background: #f59e0b;
}

.expiration-status.ok {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.expiration-status.ok .status-indicator {
  background: #10b981;
}

.product-modal ion-modal {
  --backdrop-opacity: 0.6;
}

.modal-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.modal-header ion-toolbar {
  --background: transparent;
  --color: white;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.modal-content {
  background: #f8fafc;
}

.product-form {
  padding: 32px 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.form-item {
  --background: white;
  --border-radius: 16px;
  --padding-start: 16px;
  --padding-end: 16px;
  --border-width: 1px;
  --border-color: #e2e8f0;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-input {
  --padding-top: 12px;
  --padding-bottom: 12px;
  --color: #1e293b;
}

.quantity-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.quantity-input,
.unit-input {
  margin-bottom: 0;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 40px;
}

.cancel-btn {
  --background: transparent;
  --color: #64748b;
  --border-color: #e2e8f0;
  --border-radius: 16px;
  height: 56px;
  font-weight: 600;
}

.submit-btn {
  --background: linear-gradient(135deg, #10b981, #059669);
  --color: white;
  --border-radius: 16px;
  height: 56px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    padding: 24px 20px;
    border-radius: 0 0 24px 24px;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .product-card {
    padding: 20px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .product-actions {
    align-self: flex-end;
  }
  
  .search-section {
    padding: 0 20px 20px;
  }
  
  .category-filters {
    padding: 0 20px 24px;
  }
  
  .products-container {
    padding: 0 20px 32px;
  }
  
  .empty-content {
    padding: 32px 24px;
  }
  
  .empty-content h2 {
    font-size: 20px;
  }
  
  .product-form {
    padding: 24px 20px;
  }
  
  .quantity-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-actions {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .cancel-btn {
    order: 2;
  }
  
  .submit-btn {
    order: 1;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px 16px;
  }
  
  .header-content h1 {
    font-size: 22px;
  }
  
  .search-section, 
  .category-filters, 
  .products-container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .product-form {
    padding: 20px 16px;
  }
  
  .empty-content {
    padding: 24px 16px;
  }
  
  .add-button {
    height: 44px;
    font-size: 14px;
  }
  
  .cta-button {
    height: 52px;
  }
  
  .form-actions .cancel-btn,
  .form-actions .submit-btn {
    height: 52px;
  }
}
</style>