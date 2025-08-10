<template>
  <ion-page>
    <ion-content class="stock-page">
      <!-- Header avec bouton d'ajout -->
      <div class="page-header">
        <h1>Stock Alimentaire</h1>
        <ion-button @click="openAddModal" fill="clear" class="add-button">
          <ion-icon :icon="add" slot="icon-only"></ion-icon>
          Ajouter
        </ion-button>
      </div>

      <!-- Barre de recherche -->
      <ion-searchbar 
        v-model="searchTerm" 
        placeholder="Rechercher un produit..."
        class="search-bar"
        @ionInput="filterProducts"
      ></ion-searchbar>

      <!-- Filtres par catégorie -->
      <div class="category-filters">
        <ion-chip 
          v-for="category in categories" 
          :key="category.value"
          :color="selectedCategory === category.value ? 'primary' : 'medium'"
          @click="filterByCategory(category.value)"
          class="filter-chip"
        >
          {{ category.label }}
        </ion-chip>
      </div>

      <!-- Liste des produits -->
      <div class="products-container">
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <ion-icon :icon="basketOutline" class="empty-icon"></ion-icon>
          <p>Aucun produit dans le stock</p>
          <ion-button @click="openAddModal" fill="outline">
            Ajouter votre premier produit
          </ion-button>
        </div>

        <div v-else class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id" 
            class="product-card"
            :class="getExpirationClass(product.expirationDate)"
          >
            <div class="product-header">
              <h3>{{ product.name }}</h3>
              <div class="product-actions">
                <ion-button @click="editProduct(product)" fill="clear" size="small">
                  <ion-icon :icon="create" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button @click="deleteProduct(product.id)" fill="clear" size="small" color="danger">
                  <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </div>
            
            <div class="product-info">
              <div class="info-row">
                <ion-icon :icon="pricetag" class="info-icon"></ion-icon>
                <span>{{ product.category }}</span>
              </div>
              <div class="info-row">
                <ion-icon :icon="scale" class="info-icon"></ion-icon>
                <span>{{ product.quantity }} {{ product.unit }}</span>
              </div>
              <div class="info-row">
                <ion-icon :icon="calendar" class="info-icon"></ion-icon>
                <span>Achat: {{ formatDate(product.purchaseDate) }}</span>
              </div>
              <div class="info-row">
                <ion-icon :icon="warning" class="info-icon"></ion-icon>
                <span>Expire: {{ formatDate(product.expirationDate) }}</span>
              </div>
            </div>

            <div class="expiration-badge" :class="getExpirationClass(product.expirationDate)">
              {{ getExpirationText(product.expirationDate) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Modal d'ajout/édition de produit -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingProduct ? 'Modifier' : 'Ajouter' }} un produit</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="modal-content">
          <form @submit.prevent="saveProduct">
            <ion-item>
              <ion-label position="stacked">Nom du produit</ion-label>
              <ion-input v-model="productForm.name" placeholder="Ex: Tomates" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Catégorie</ion-label>
              <ion-select v-model="productForm.category" placeholder="Sélectionner une catégorie" required>
                <ion-select-option value="frais">Frais</ion-select-option>
                <ion-select-option value="sec">Sec</ion-select-option>
                <ion-select-option value="surgelé">Surgelé</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Quantité</ion-label>
              <ion-input v-model="productForm.quantity" type="number" min="0" step="0.1" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Unité</ion-label>
              <ion-select v-model="productForm.unit" placeholder="Sélectionner une unité" required>
                <ion-select-option value="kg">kg</ion-select-option>
                <ion-select-option value="g">g</ion-select-option>
                <ion-select-option value="L">L</ion-select-option>
                <ion-select-option value="ml">ml</ion-select-option>
                <ion-select-option value="unités">unités</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Date d'achat</ion-label>
              <ion-datetime v-model="productForm.purchaseDate" presentation="date" required></ion-datetime>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Date de péremption</ion-label>
              <ion-datetime v-model="productForm.expirationDate" presentation="date" required></ion-datetime>
            </ion-item>

            <div class="form-actions">
              <ion-button type="submit" expand="block" color="primary">
                {{ editingProduct ? 'Modifier' : 'Ajouter' }}
              </ion-button>
            </div>
          </form>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonButton, IonIcon, IonSearchbar, IonChip,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonItem,
  IonLabel, IonInput, IonSelect, IonSelectOption, IonDatetime
} from '@ionic/vue';
import { 
  add, basketOutline, create, trash, pricetag, scale, calendar, warning 
} from 'ionicons/icons';

// Types
interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expirationDate: string;
}

// État réactif
const products = ref<Product[]>([]);
const searchTerm = ref('');
const selectedCategory = ref('all');
const isModalOpen = ref(false);
const editingProduct = ref<Product | null>(null);
const productForm = ref({
  name: '',
  category: '',
  quantity: 0,
  unit: '',
  purchaseDate: '',
  expirationDate: ''
});

// Catégories
const categories = [
  { value: 'all', label: 'Tous' },
  { value: 'frais', label: 'Frais' },
  { value: 'sec', label: 'Sec' },
  { value: 'surgelé', label: 'Surgelé' }
];

// Données simulées
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Tomates',
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
    name: 'Poivrons',
    category: 'frais',
    quantity: 300,
    unit: 'g',
    purchaseDate: '2024-08-09',
    expirationDate: '2024-08-12'
  }
];

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value;
  
  if (searchTerm.value) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(product => product.category === selectedCategory.value);
  }
  
  return filtered.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
});

// Méthodes
const openAddModal = () => {
  editingProduct.value = null;
  resetForm();
  isModalOpen.value = true;
};

const editProduct = (product: Product) => {
  editingProduct.value = product;
  productForm.value = { ...product };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
};

const resetForm = () => {
  productForm.value = {
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    purchaseDate: '',
    expirationDate: ''
  };
};

const saveProduct = () => {
  if (editingProduct.value) {
    // Modifier le produit existant
    const index = products.value.findIndex(p => p.id === editingProduct.value!.id);
    if (index !== -1) {
      products.value[index] = { ...productForm.value, id: editingProduct.value.id };
    }
  } else {
    // Ajouter un nouveau produit
    const newProduct: Product = {
      ...productForm.value,
      id: Date.now()
    };
    products.value.push(newProduct);
  }
  
  closeModal();
};

const deleteProduct = (id: number) => {
  products.value = products.value.filter(p => p.id !== id);
};

const filterByCategory = (category: string) => {
  selectedCategory.value = category;
};

const filterProducts = () => {
  // La logique de filtrage est gérée par le computed
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const getExpirationClass = (expirationDate: string) => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'expiring-soon';
  return 'ok';
};

const getExpirationText = (expirationDate: string) => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Périmé';
  if (diffDays === 0) return 'Expire aujourd\'hui';
  if (diffDays === 1) return 'Expire demain';
  if (diffDays <= 3) return `${diffDays} jours`;
  return 'OK';
};

// Initialisation
onMounted(() => {
  products.value = [...mockProducts];
});
</script>

<style scoped>
.stock-page {
  --background: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.add-button {
  --color: #4CAF50;
  font-weight: 500;
}

.search-bar {
  margin: 16px;
  --background: white;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.category-filters {
  padding: 0 16px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.filter-chip {
  --background: #f0f0f0;
  --color: #666;
  font-weight: 500;
}

.products-container {
  padding: 0 16px 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 16px;
}

.products-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.product-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: relative;
  border-left: 4px solid #4CAF50;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-card.expired {
  border-left-color: #f44336;
}

.product-card.expiring-soon {
  border-left-color: #ff9800;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.product-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.product-actions {
  display: flex;
  gap: 4px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.info-icon {
  color: #4CAF50;
  font-size: 16px;
}

.expiration-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.expiration-badge.expired {
  background: #f44336;
}

.expiration-badge.expiring-soon {
  background: #ff9800;
}

.expiration-badge.ok {
  background: #4CAF50;
}

.modal-content {
  padding: 20px;
}

.form-actions {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .add-button {
    align-self: flex-end;
  }
}
</style>
