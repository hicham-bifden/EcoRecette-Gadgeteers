<template>
  <ion-page>
    <ion-content class="recipes-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Générateur de Recettes</h1>
          <p class="subtitle">Découvrez des recettes basées sur vos ingrédients</p>
        </div>
      </div>

      <div class="ingredients-section">
        <div class="section-header">
          <ion-icon :icon="nutrition" class="section-icon"></ion-icon>
          <h3>Sélectionnez vos ingrédients</h3>
        </div>
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
            <div class="selection-indicator">
              <ion-icon 
                :icon="selectedIngredients.includes(ingredient.id) ? checkmarkCircle : addCircle" 
                class="selection-icon"
                :class="{ active: selectedIngredients.includes(ingredient.id) }"
              ></ion-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="section-header">
          <ion-icon :icon="options" class="section-icon"></ion-icon>
          <h3>Préférences</h3>
        </div>
        
        <div class="filters-grid">
          <div class="filter-group">
            <h4>
              <ion-icon :icon="time" class="filter-icon"></ion-icon>
              Temps de préparation
            </h4>
            <ion-radio-group v-model="filters.prepTime" class="radio-group">
              <ion-item class="radio-item">
                <ion-radio value="15" labelPlacement="end">Moins de 15 min</ion-radio>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="30" labelPlacement="end">Moins de 30 min</ion-radio>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="60" labelPlacement="end">Plus de 30 min</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>

          <div class="filter-group">
            <h4>
              <ion-icon :icon="trendingUp" class="filter-icon"></ion-icon>
              Difficulté
            </h4>
            <ion-radio-group v-model="filters.difficulty" class="radio-group">
              <ion-item class="radio-item">
                <ion-radio value="facile" labelPlacement="end">Facile</ion-radio>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="moyen" labelPlacement="end">Moyen</ion-radio>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="difficile" labelPlacement="end">Difficile</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>

          <div class="filter-group">
            <h4>
              <ion-icon :icon="restaurant" class="filter-icon"></ion-icon>
              Type de plat
            </h4>
            <ion-radio-group v-model="filters.mealType" class="radio-group">
              <ion-item class="radio-item">
                <ion-radio value="entree" labelPlacement="end">Entrée</ion-radio>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="plat" labelPlacement="end">Plat principal</ion-radio>
              </ion-item>
              <ion-item class="radio-item">
                <ion-radio value="dessert" labelPlacement="end">Dessert</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>

          <div class="filter-group">
            <h4>
              <ion-icon :icon="leafOutline" class="filter-icon"></ion-icon>
              Restrictions alimentaires
            </h4>
            <div class="checkbox-group">
              <ion-item class="checkbox-item">
                <ion-checkbox v-model="filters.vegetarian" slot="start"></ion-checkbox>
                <ion-label>Végétarien</ion-label>
              </ion-item>
              <ion-item class="checkbox-item">
                <ion-checkbox v-model="filters.lactoseFree" slot="start"></ion-checkbox>
                <ion-label>Sans lactose</ion-label>
              </ion-item>
              <ion-item class="checkbox-item">
                <ion-checkbox v-model="filters.glutenFree" slot="start"></ion-checkbox>
                <ion-label>Sans gluten</ion-label>
              </ion-item>
            </div>
          </div>
        </div>
      </div>

      <div class="generate-section">
        <ion-button 
          @click="generateRecipe" 
          expand="block" 
          size="large"
          :disabled="selectedIngredients.length === 0"
          class="generate-button"
        >
          <ion-icon :icon="sparkles" slot="start"></ion-icon>
          Générer une recette ({{ selectedIngredients.length }} ingrédients)
        </ion-button>
      </div>

      <div v-if="generatedRecipe" class="recipe-result">
        <div class="recipe-card">
          <div class="recipe-header">
            <h2>{{ generatedRecipe.title }}</h2>
            <div class="recipe-meta">
              <div class="meta-item">
                <ion-icon :icon="time" class="meta-icon"></ion-icon>
                <span>{{ generatedRecipe.prepTime }} min</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="trendingUp" class="meta-icon"></ion-icon>
                <span>{{ formatDifficulty(generatedRecipe.difficulty) }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="restaurant" class="meta-icon"></ion-icon>
                <span>{{ formatMealType(generatedRecipe.mealType) }}</span>
              </div>
            </div>
          </div>

          <div class="recipe-content">
            <div class="recipe-ingredients">
              <h4>
                <ion-icon :icon="list" class="content-icon"></ion-icon>
                Ingrédients
              </h4>
              <div class="ingredients-list">
                <div v-for="ingredient in generatedRecipe.ingredients" :key="ingredient" class="ingredient-line">
                  <ion-icon :icon="checkmarkCircle" class="check-icon"></ion-icon>
                  <span>{{ ingredient }}</span>
                </div>
              </div>
            </div>

            <div class="recipe-instructions">
              <h4>
                <ion-icon :icon="receiptOutline" class="content-icon"></ion-icon>
                Instructions
              </h4>
              <div class="instructions-list">
                <div v-for="(step, index) in generatedRecipe.instructions" :key="index" class="instruction-step">
                  <div class="step-number">{{ index + 1 }}</div>
                  <span>{{ step }}</span>
                </div>
              </div>
            </div>

            <div class="recipe-tips">
              <h4>
                <ion-icon :icon="bulb" class="content-icon"></ion-icon>
                Conseils du chef
              </h4>
              <div class="tips-content">
                <p>{{ generatedRecipe.tips }}</p>
              </div>
            </div>
          </div>

          <div class="recipe-actions">
            <ion-button fill="outline" @click="generateRecipe" class="action-btn">
              <ion-icon :icon="refresh" slot="start"></ion-icon>
              Nouvelle recette
            </ion-button>
            <ion-button fill="solid" @click="saveRecipe" class="action-btn">
              <ion-icon :icon="bookmark" slot="start"></ion-icon>
              Sauvegarder
            </ion-button>
          </div>
        </div>
      </div>

      <div v-else-if="!generatedRecipe && selectedIngredients.length > 0" class="empty-recipe">
        <div class="empty-content">
          <ion-icon :icon="restaurantOutline" class="empty-icon"></ion-icon>
          <h3>Prêt à cuisiner ?</h3>
          <p>Cliquez sur "Générer une recette" pour découvrir une délicieuse recette adaptée à vos ingrédients</p>
        </div>
      </div>

      <div v-else class="welcome-state">
        <div class="welcome-content">
          <ion-icon :icon="sparkles" class="welcome-icon"></ion-icon>
          <h3>Commencez votre aventure culinaire</h3>
          <p>Sélectionnez au moins un ingrédient pour générer votre première recette personnalisée</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { 
  IonPage, IonContent, IonButton, IonIcon, IonRadioGroup, IonRadio,
  IonItem, IonCheckbox, IonLabel
} from '@ionic/vue';
import { 
  restaurant, time, trendingUp, checkmarkCircle, addCircle, restaurantOutline,
  nutrition, options, leafOutline, list, receiptOutline, bulb, refresh,
  bookmark, sparkles, leaf, water, fish, egg, flame
} from 'ionicons/icons';

const selectedIngredients = ref([]);
const generatedRecipe = ref(null);

const filters = reactive({
  prepTime: '30',
  difficulty: 'facile',
  mealType: 'plat',
  vegetarian: false,
  lactoseFree: false,
  glutenFree: false
});

const availableIngredients = [
  { id: 1, name: 'Tomates', icon: nutrition },
  { id: 2, name: 'Oignons', icon: leaf },
  { id: 3, name: 'Ail', icon: leaf },
  { id: 4, name: 'Huile d\'olive', icon: water },
  { id: 5, name: 'Sel', icon: water },
  { id: 6, name: 'Poivre', icon: flame },
  { id: 7, name: 'Riz', icon: nutrition },
  { id: 8, name: 'Poulet', icon: restaurant },
  { id: 9, name: 'Fromage', icon: fish },
  { id: 10, name: 'Lait', icon: water },
  { id: 11, name: 'Farine', icon: leaf },
  { id: 12, name: 'Œufs', icon: egg },
  { id: 13, name: 'Beurre', icon: fish },
  { id: 14, name: 'Basilic', icon: leaf },
  { id: 15, name: 'Citron', icon: nutrition },
  { id: 16, name: 'Champignons', icon: leaf }
];

const mockRecipes = [
  {
    title: 'Riz aux Légumes Sauté',
    prepTime: 25,
    difficulty: 'facile',
    mealType: 'plat',
    ingredients: [
      '200g de riz basmati',
      '2 tomates moyennes',
      '1 oignon jaune',
      '2 gousses d\'ail',
      '3 cuillères à soupe d\'huile d\'olive',
      'Sel et poivre selon goût'
    ],
    instructions: [
      'Rincez le riz jusqu\'à ce que l\'eau soit claire, puis faites-le cuire selon les instructions',
      'Pendant ce temps, émincez finement l\'oignon et hachez l\'ail',
      'Coupez les tomates en dés réguliers',
      'Dans une grande poêle, chauffez l\'huile d\'olive à feu moyen',
      'Faites revenir l\'oignon et l\'ail jusqu\'à ce qu\'ils soient dorés',
      'Ajoutez les tomates et laissez mijoter 5-7 minutes',
      'Incorporez le riz cuit, mélangez délicatement et assaisonnez'
    ],
    tips: 'Pour plus de saveur, ajoutez des herbes fraîches comme le basilic ou la coriandre. Ce plat se conserve 2-3 jours au réfrigérateur.'
  },
  {
    title: 'Salade de Tomates Fraîches',
    prepTime: 15,
    difficulty: 'facile',
    mealType: 'entree',
    ingredients: [
      '4 tomates mûres variées',
      '1 oignon rouge',
      '3 cuillères à soupe d\'huile d\'olive extra vierge',
      'Sel de mer et poivre noir',
      'Basilic frais (optionnel)',
      '1 cuillère à soupe de vinaigre balsamique'
    ],
    instructions: [
      'Lavez soigneusement les tomates et coupez-les en tranches épaisses',
      'Émincez l\'oignon rouge en fines lamelles',
      'Disposez harmonieusement les tomates sur un plat de service',
      'Répartissez l\'oignon émincé sur les tomates',
      'Arrosez d\'huile d\'olive et de vinaigre balsamique',
      'Assaisonnez généreusement avec le sel et le poivre',
      'Décorez avec des feuilles de basilic ciselées'
    ],
    tips: 'Utilisez des tomates de différentes variétés pour plus de couleurs. Laissez macérer 15 minutes pour que les saveurs se développent.'
  },
  {
    title: 'Omelette Gourmande aux Légumes',
    prepTime: 20,
    difficulty: 'facile',
    mealType: 'plat',
    ingredients: [
      '4 œufs frais',
      '1 tomate ferme',
      '1 oignon doux',
      '50g de fromage râpé',
      'Sel et poivre',
      '2 cuillères à soupe d\'huile d\'olive',
      '1 noix de beurre'
    ],
    instructions: [
      'Cassez les œufs dans un saladier et battez-les énergiquement',
      'Émincez l\'oignon et coupez la tomate en petits dés',
      'Chauffez l\'huile dans une poêle antiadhésive',
      'Faites revenir l\'oignon jusqu\'à ce qu\'il soit translucide',
      'Ajoutez les dés de tomate et laissez cuire 3 minutes',
      'Versez les œufs battus et laissez prendre en soulevant les bords',
      'Parsemez de fromage, pliez l\'omelette et servez immédiatement'
    ],
    tips: 'Pour une omelette parfaite, ne remuez pas trop pendant la cuisson. La poêle doit être bien chaude mais pas brûlante.'
  },
  {
    title: 'Pâtes à l\'Ail et Huile d\'Olive',
    prepTime: 15,
    difficulty: 'facile',
    mealType: 'plat',
    ingredients: [
      '300g de spaghetti',
      '4 gousses d\'ail',
      '100ml d\'huile d\'olive extra vierge',
      'Piment rouge séché (optionnel)',
      'Parmesan râpé',
      'Persil plat frais',
      'Sel'
    ],
    instructions: [
      'Faites bouillir une grande casserole d\'eau salée',
      'Cuisez les pâtes selon les instructions, al dente',
      'Pendant ce temps, émincez finement l\'ail',
      'Chauffez l\'huile d\'olive à feu doux dans une grande poêle',
      'Ajoutez l\'ail et le piment, faites revenir sans colorer',
      'Égouttez les pâtes en réservant un peu d\'eau de cuisson',
      'Mélangez les pâtes avec l\'huile parfumée, ajoutez du parmesan et du persil'
    ],
    tips: 'L\'ail ne doit jamais brunir sous peine de devenir amer. Gardez toujours un peu d\'eau de cuisson pour lier la sauce.'
  }
];

const toggleIngredient = (ingredientId) => {
  const index = selectedIngredients.value.indexOf(ingredientId);
  if (index > -1) {
    selectedIngredients.value.splice(index, 1);
  } else {
    selectedIngredients.value.push(ingredientId);
  }
  if (generatedRecipe.value) {
    generatedRecipe.value = null;
  }
};

const generateRecipe = () => {
  if (selectedIngredients.value.length === 0) return;
  
  const selectedNames = selectedIngredients.value.map(id => 
    availableIngredients.find(ing => ing.id === id)?.name
  ).filter(Boolean);
  
  let bestRecipe = mockRecipes[0];
  let maxMatches = 0;
  
  for (const recipe of mockRecipes) {
    const matchingIngredients = recipe.ingredients.filter(ingredient =>
      selectedNames.some(name => 
        ingredient.toLowerCase().includes(name?.toLowerCase() || '')
      )
    );
    
    if (matchingIngredients.length > maxMatches) {
      maxMatches = matchingIngredients.length;
      bestRecipe = recipe;
    }
  }
  
  let filteredRecipes = mockRecipes.filter(recipe => {
    let matches = true;
    
    if (filters.prepTime === '15' && recipe.prepTime > 15) matches = false;
    if (filters.prepTime === '30' && recipe.prepTime > 30) matches = false;
    if (filters.difficulty !== recipe.difficulty && filters.difficulty !== 'facile') matches = false;
    if (filters.mealType !== recipe.mealType && filters.mealType !== 'plat') matches = false;
    
    return matches;
  });
  
  if (filteredRecipes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    bestRecipe = filteredRecipes[randomIndex];
  }
  
  generatedRecipe.value = bestRecipe;
};

const saveRecipe = () => {
  if (!generatedRecipe.value) return;
  
  try {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    const recipeToSave = {
      ...generatedRecipe.value,
      savedAt: new Date().toISOString(),
      id: Date.now()
    };
    
    savedRecipes.push(recipeToSave);
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    
    console.log('Recette sauvegardée avec succès !');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

const formatDifficulty = (difficulty) => {
  const levels = {
    'facile': 'Facile',
    'moyen': 'Moyen', 
    'difficile': 'Difficile'
  };
  return levels[difficulty] || difficulty;
};

const formatMealType = (mealType) => {
  const types = {
    'entree': 'Entrée',
    'plat': 'Plat principal',
    'dessert': 'Dessert'
  };
  return types[mealType] || mealType;
};
</script>

<style scoped>
.recipes-page {
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

.ingredients-section,
.filters-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  margin: 0 20px 24px;
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
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.ingredient-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  background: white;
}

.ingredient-item:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.ingredient-item.selected {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.ingredient-icon {
  font-size: 36px;
  color: #64748b;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.ingredient-item.selected .ingredient-icon {
  color: #10b981;
}

.ingredient-item span {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 12px;
}

.selection-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
}

.selection-icon {
  font-size: 20px;
  color: #cbd5e1;
  transition: all 0.3s ease;
}

.selection-icon.active {
  color: #10b981;
  transform: scale(1.2);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.filter-group {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
}

.filter-group h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.filter-icon {
  color: #667eea;
  font-size: 18px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-item,
.checkbox-item {
  --background: white;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --border-width: 1px;
  --border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.generate-section {
  padding: 0 20px 24px;
}

.generate-button {
  --background: linear-gradient(135deg, #10b981, #059669);
  --background-hover: linear-gradient(135deg, #059669, #047857);
  --color: white;
  --border-radius: 16px;
  --padding-start: 24px;
  --padding-end: 24px;
  height: 56px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
}

.generate-button:disabled {
  --background: #cbd5e1;
  --box-shadow: none;
  transform: none;
}

.recipe-result {
  padding: 0 20px 40px;
}

.recipe-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.recipe-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f1f5f9;
}

.recipe-header h2 {
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.recipe-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 12px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.meta-icon {
  color: #667eea;
  font-size: 16px;
}

.recipe-content > div {
  margin-bottom: 32px;
}

.recipe-content h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.content-icon {
  color: #667eea;
  font-size: 20px;
}

.ingredients-list {
  display: grid;
  gap: 12px;
}

.ingredient-line {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #10b981;
}

.check-icon {
  color: #10b981;
  font-size: 16px;
  flex-shrink: 0;
}

.ingredient-line span {
  color: #374151;
  font-weight: 500;
}

.instructions-list {
  display: grid;
  gap: 16px;
}

.instruction-step {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.instruction-step span {
  color: #374151;
  line-height: 1.6;
  font-weight: 500;
}

.tips-content {
  padding: 20px;
  background: linear-gradient(135deg, #fef3c7, #fbbf24);
  border-radius: 16px;
  border-left: 4px solid #f59e0b;
}

.tips-content p {
  margin: 0;
  color: #92400e;
  line-height: 1.6;
  font-weight: 500;
  font-style: italic;
}

.recipe-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
}

.action-btn {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
}

.action-btn[fill="outline"] {
  --border-color: #667eea;
  --color: #667eea;
}

.action-btn[fill="solid"] {
  --background: linear-gradient(135deg, #667eea, #764ba2);
  --color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.empty-recipe,
.welcome-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  margin: 0 20px 40px;
}

.empty-content,
.welcome-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.empty-icon,
.welcome-icon {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 24px;
}

.welcome-icon {
  color: #667eea;
}

.empty-content h3,
.welcome-content h3 {
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.empty-content p,
.welcome-content p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
    border-radius: 0 0 24px 24px;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .ingredients-section,
  .filters-section {
    margin: 0 16px 20px;
    padding: 20px;
  }
  
  .ingredients-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .ingredient-item {
    padding: 16px 12px;
  }
  
  .ingredient-icon {
    font-size: 28px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .filter-group {
    padding: 16px;
  }
  
  .generate-section {
    padding: 0 16px 20px;
  }
  
  .recipe-result {
    padding: 0 16px 32px;
  }
  
  .recipe-card {
    padding: 24px;
  }
  
  .recipe-header h2 {
    font-size: 24px;
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .recipe-actions {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .empty-content,
  .welcome-content {
    padding: 32px 24px;
    margin: 0 16px;
  }
}

@media (max-width: 480px) {
  .ingredients-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .ingredient-item {
    padding: 12px 8px;
  }
  
  .ingredient-item span {
    font-size: 12px;
  }
  
  .recipe-content h4 {
    font-size: 16px;
  }
  
  .instruction-step {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-number {
    align-self: flex-start;
  }
}
</style>