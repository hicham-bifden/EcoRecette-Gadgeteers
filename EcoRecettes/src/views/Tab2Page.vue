<template>
  <ion-page>
    <ion-content class="recipes-page">
      <!-- Header -->
      <div class="page-header">
        <h1>Générateur de Recettes</h1>
        <p class="subtitle">Découvrez des recettes basées sur vos ingrédients</p>
      </div>

      <!-- Sélecteur d'ingrédients -->
      <div class="ingredients-section">
        <h3>Sélectionnez vos ingrédients</h3>
        <div class="ingredients-grid">
          <div 
            v-for="ingredient in availableIngredients" 
            :key="ingredient.id"
            class="ingredient-item"
            :class="{ selected: selectedIngredients.includes(ingredient.id) }"
            @click="toggleIngredient(ingredient.id)"
          >
            <ion-icon :icon="ingredient.icon" class="ingredient-icon"></ion-icon>
            <span>{{ ingredient.name }}</span>
            <ion-icon 
              :icon="selectedIngredients.includes(ingredient.id) ? checkmarkCircle : addCircle" 
              class="selection-icon"
            ></ion-icon>
          </div>
        </div>
      </div>

      <!-- Filtres de recettes -->
      <div class="filters-section">
        <h3>Filtres</h3>
        
        <div class="filter-group">
          <h4>Temps de préparation</h4>
          <div class="filter-options">
            <ion-radio-group v-model="filters.prepTime">
              <ion-item lines="none">
                <ion-radio value="15" labelPlacement="end">Moins de 15 min</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="30" labelPlacement="end">Moins de 30 min</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="60" labelPlacement="end">Plus de 30 min</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
        </div>

        <div class="filter-group">
          <h4>Difficulté</h4>
          <div class="filter-options">
            <ion-radio-group v-model="filters.difficulty">
              <ion-item lines="none">
                <ion-radio value="facile" labelPlacement="end">Facile</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="moyen" labelPlacement="end">Moyen</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="difficile" labelPlacement="end">Difficile</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
        </div>

        <div class="filter-group">
          <h4>Type de plat</h4>
          <div class="filter-options">
            <ion-radio-group v-model="filters.mealType">
              <ion-item lines="none">
                <ion-radio value="entree" labelPlacement="end">Entrée</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="plat" labelPlacement="end">Plat principal</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="dessert" labelPlacement="end">Dessert</ion-label>
              </ion-item>
            </ion-radio-group>
          </div>
        </div>

        <div class="filter-group">
          <h4>Restrictions alimentaires</h4>
          <div class="filter-options">
            <ion-item lines="none">
              <ion-checkbox v-model="filters.vegetarian" labelPlacement="end">Végétarien</ion-checkbox>
            </ion-item>
            <ion-item lines="none">
              <ion-checkbox v-model="filters.lactoseFree" labelPlacement="end">Sans lactose</ion-checkbox>
            </ion-item>
            <ion-item lines="none">
              <ion-checkbox v-model="filters.glutenFree" labelPlacement="end">Sans gluten</ion-checkbox>
            </ion-item>
          </div>
        </div>
      </div>

      <!-- Bouton de génération -->
      <div class="generate-section">
        <ion-button 
          @click="generateRecipe" 
          expand="block" 
          size="large"
          :disabled="selectedIngredients.length === 0"
          class="generate-button"
        >
          <ion-icon :icon="restaurant" slot="start"></ion-icon>
          Générer une recette
        </ion-button>
      </div>

      <!-- Résultat de la recette -->
      <div v-if="generatedRecipe" class="recipe-result">
        <h3>Votre recette</h3>
        
        <div class="recipe-card">
          <div class="recipe-header">
            <h2>{{ generatedRecipe.title }}</h2>
            <div class="recipe-meta">
              <span class="meta-item">
                <ion-icon :icon="time" class="meta-icon"></ion-icon>
                {{ generatedRecipe.prepTime }} min
              </span>
              <span class="meta-item">
                <ion-icon :icon="trendingUp" class="meta-icon"></ion-icon>
                {{ generatedRecipe.difficulty }}
              </span>
              <span class="meta-item">
                <ion-icon :icon="restaurant" class="meta-icon"></ion-icon>
                {{ generatedRecipe.mealType }}
              </span>
            </div>
          </div>

          <div class="recipe-ingredients">
            <h4>Ingrédients</h4>
            <ul>
              <li v-for="ingredient in generatedRecipe.ingredients" :key="ingredient">
                {{ ingredient }}
              </li>
            </ul>
          </div>

          <div class="recipe-instructions">
            <h4>Instructions</h4>
            <ol>
              <li v-for="(step, index) in generatedRecipe.instructions" :key="index">
                {{ step }}
              </li>
            </ol>
          </div>

          <div class="recipe-tips">
            <h4>Conseils</h4>
            <p>{{ generatedRecipe.tips }}</p>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else-if="!generatedRecipe && selectedIngredients.length > 0" class="empty-recipe">
        <ion-icon :icon="restaurantOutline" class="empty-icon"></ion-icon>
        <p>Cliquez sur "Générer une recette" pour découvrir une recette adaptée à vos ingrédients</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { 
  IonPage, IonContent, IonButton, IonIcon, IonRadioGroup, IonRadio,
  IonItem, IonCheckbox, IonLabel
} from '@ionic/vue';
import { 
  restaurant, time, trendingUp, checkmarkCircle, addCircle, restaurantOutline
} from 'ionicons/icons';

// Types
interface Ingredient {
  id: number;
  name: string;
  icon: string;
}

interface RecipeFilters {
  prepTime: string;
  difficulty: string;
  mealType: string;
  vegetarian: boolean;
  lactoseFree: boolean;
  glutenFree: boolean;
}

interface Recipe {
  title: string;
  prepTime: number;
  difficulty: string;
  mealType: string;
  ingredients: string[];
  instructions: string[];
  tips: string;
}

// État réactif
const selectedIngredients = ref<number[]>([]);
const generatedRecipe = ref<Recipe | null>(null);

// Filtres
const filters = reactive<RecipeFilters>({
  prepTime: '30',
  difficulty: 'facile',
  mealType: 'plat',
  vegetarian: false,
  lactoseFree: false,
  glutenFree: false
});

// Ingrédients disponibles (simulés)
const availableIngredients: Ingredient[] = [
  { id: 1, name: 'Tomates', icon: 'leaf' },
  { id: 2, name: 'Oignons', icon: 'leaf' },
  { id: 3, name: 'Ail', icon: 'leaf' },
  { id: 4, name: 'Huile d\'olive', icon: 'water' },
  { id: 5, name: 'Sel', icon: 'water' },
  { id: 6, name: 'Poivre', icon: 'water' },
  { id: 7, name: 'Riz', icon: 'leaf' },
  { id: 8, name: 'Poulet', icon: 'fish' },
  { id: 9, name: 'Fromage', icon: 'fish' },
  { id: 10, name: 'Lait', icon: 'water' },
  { id: 11, name: 'Farine', icon: 'leaf' },
  { id: 12, name: 'Œufs', icon: 'fish' }
];

// Recettes simulées
const mockRecipes: Recipe[] = [
  {
    title: 'Riz aux Légumes Sauté',
    prepTime: 25,
    difficulty: 'facile',
    mealType: 'plat',
    ingredients: [
      '200g de riz',
      '2 tomates',
      '1 oignon',
      '2 gousses d\'ail',
      '2 cuillères d\'huile d\'olive',
      'Sel et poivre'
    ],
    instructions: [
      'Faites cuire le riz selon les instructions du paquet',
      'Émincez l\'oignon et l\'ail',
      'Coupez les tomates en dés',
      'Faites revenir l\'oignon et l\'ail dans l\'huile d\'olive',
      'Ajoutez les tomates et laissez mijoter 5 minutes',
      'Mélangez avec le riz cuit et assaisonnez'
    ],
    tips: 'Vous pouvez ajouter d\'autres légumes selon vos préférences. Cette recette est parfaite pour utiliser les restes de légumes.'
  },
  {
    title: 'Salade de Tomates Fraîches',
    prepTime: 15,
    difficulty: 'facile',
    mealType: 'entree',
    ingredients: [
      '4 tomates mûres',
      '1 oignon rouge',
      '2 cuillères d\'huile d\'olive',
      'Sel et poivre',
      'Basilic frais (optionnel)'
    ],
    instructions: [
      'Lavez et coupez les tomates en tranches',
      'Émincez finement l\'oignon',
      'Disposez les tomates sur un plat',
      'Parsemez d\'oignon émincé',
      'Arrosez d\'huile d\'olive et assaisonnez',
      'Décorez avec du basilic si disponible'
    ],
    tips: 'Laissez reposer 10 minutes avant de servir pour que les saveurs se marient.'
  },
  {
    title: 'Omelette aux Légumes',
    prepTime: 20,
    difficulty: 'facile',
    mealType: 'plat',
    ingredients: [
      '3 œufs',
      '1 tomate',
      '1 oignon',
      'Fromage râpé',
      'Sel et poivre',
      'Huile d\'olive'
    ],
    instructions: [
      'Battez les œufs dans un bol',
      'Émincez l\'oignon et coupez la tomate en dés',
      'Faites revenir l\'oignon dans l\'huile',
      'Ajoutez la tomate et laissez cuire 2 minutes',
      'Versez les œufs battus et laissez cuire',
      'Ajoutez le fromage et pliez l\'omelette'
    ],
    tips: 'Ne remuez pas trop l\'omelette pendant la cuisson pour qu\'elle reste moelleuse.'
  }
];

// Méthodes
const toggleIngredient = (ingredientId: number) => {
  const index = selectedIngredients.value.indexOf(ingredientId);
  if (index > -1) {
    selectedIngredients.value.splice(index, 1);
  } else {
    selectedIngredients.value.push(ingredientId);
  }
};

const generateRecipe = () => {
  if (selectedIngredients.value.length === 0) return;
  
  // Logique simple de génération basée sur les ingrédients sélectionnés
  const selectedNames = selectedIngredients.value.map(id => 
    availableIngredients.find(ing => ing.id === id)?.name
  ).filter(Boolean);
  
  // Trouver une recette qui correspond aux ingrédients
  let bestRecipe = mockRecipes[0]; // Par défaut
  
  for (const recipe of mockRecipes) {
    const matchingIngredients = recipe.ingredients.filter(ingredient =>
      selectedNames.some(name => 
        ingredient.toLowerCase().includes(name?.toLowerCase() || '')
      )
    );
    
    if (matchingIngredients.length > 0) {
      bestRecipe = recipe;
      break;
    }
  }
  
  // Appliquer les filtres
  let filteredRecipe = { ...bestRecipe };
  
  if (filters.prepTime === '15' && filteredRecipe.prepTime > 15) {
    filteredRecipe = mockRecipes.find(r => r.prepTime <= 15) || filteredRecipe;
  } else if (filters.prepTime === '30' && filteredRecipe.prepTime > 30) {
    filteredRecipe = mockRecipes.find(r => r.prepTime <= 30) || filteredRecipe;
  }
  
  if (filters.difficulty !== 'facile') {
    filteredRecipe = mockRecipes.find(r => r.difficulty === filters.difficulty) || filteredRecipe;
  }
  
  if (filters.mealType !== 'plat') {
    filteredRecipe = mockRecipes.find(r => r.mealType === filters.mealType) || filteredRecipe;
  }
  
  generatedRecipe.value = filteredRecipe;
};
</script>

<style scoped>
.recipes-page {
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

.ingredients-section {
  padding: 24px 16px;
  background: white;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.ingredients-section h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 20px;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.ingredient-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
}

.ingredient-item:hover {
  border-color: #4CAF50;
  transform: translateY(-2px);
}

.ingredient-item.selected {
  border-color: #4CAF50;
  background: #e8f5e8;
}

.ingredient-icon {
  font-size: 32px;
  color: #4CAF50;
  margin-bottom: 8px;
}

.ingredient-item span {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.selection-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
  color: #4CAF50;
}

.filters-section {
  padding: 24px 16px;
  background: white;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filters-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-group h4 {
  margin: 0 0 12px 0;
  color: #34495e;
  font-size: 16px;
  font-weight: 500;
}

.filter-options {
  padding-left: 16px;
}

.generate-section {
  padding: 0 16px 24px;
}

.generate-button {
  --background: #4CAF50;
  --color: white;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  font-weight: 600;
  height: 56px;
}

.generate-button:disabled {
  --background: #ccc;
  --box-shadow: none;
}

.recipe-result {
  padding: 0 16px 24px;
}

.recipe-result h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 20px;
  text-align: center;
}

.recipe-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recipe-header {
  text-align: center;
  margin-bottom: 24px;
}

.recipe-header h2 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 24px;
}

.recipe-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.meta-icon {
  color: #4CAF50;
}

.recipe-ingredients,
.recipe-instructions,
.recipe-tips {
  margin-bottom: 24px;
}

.recipe-ingredients h4,
.recipe-instructions h4,
.recipe-tips h4 {
  margin: 0 0 12px 0;
  color: #34495e;
  font-size: 18px;
  font-weight: 600;
}

.recipe-ingredients ul,
.recipe-instructions ol {
  margin: 0;
  padding-left: 20px;
}

.recipe-ingredients li,
.recipe-instructions li {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.5;
}

.recipe-tips p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-style: italic;
}

.empty-recipe {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .ingredients-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
