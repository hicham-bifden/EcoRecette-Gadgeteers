// Types et interfaces pour EcoRecettes - ÉQUIPE GADGETEERS

// ================================
// INTERFACES PRODUITS
// ================================

export interface Product {
  id: string
  name: string
  category: ProductCategory
  brand?: string
  quantity: number
  unit: ProductUnit
  purchaseDate: Date
  expiryDate: Date
  barcode?: string
  notes?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = 
  | 'fruits-legumes'
  | 'viande-poisson'
  | 'produits-laitiers'
  | 'cereales-feculents'
  | 'conserves'
  | 'surgeles'
  | 'boissons'
  | 'condiments-epices'
  | 'boulangerie-patisserie'
  | 'autres'

export type ProductUnit = 
  | 'unité'
  | 'kg'
  | 'g'
  | 'L'
  | 'mL'
  | 'paquet'
  | 'boîte'
  | 'pot'
  | 'bouteille'

export interface ProductCreateInput {
  name: string
  category: ProductCategory
  brand?: string
  quantity: number
  unit: ProductUnit
  purchaseDate: Date
  expiryDate: Date
  barcode?: string
  notes?: string
}

export interface ProductUpdateInput {
  name?: string
  category?: ProductCategory
  brand?: string
  quantity?: number
  unit?: ProductUnit
  purchaseDate?: Date
  expiryDate?: Date
  barcode?: string
  notes?: string
}

// ================================
// INTERFACES RECETTES
// ================================

export interface Recipe {
  id: string
  title: string
  description?: string
  servings: number
  prepTime: number
  cookTime: number
  difficulty: RecipeDifficulty
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]
  tags: string[]
  nutritionalInfo?: NutritionalInfo
  generatedBy: 'ai' | 'user'
  sourceProducts?: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type RecipeDifficulty = 'facile' | 'moyen' | 'difficile'

export interface RecipeIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  optional?: boolean
  productId?: string
}

export interface RecipeInstruction {
  stepNumber: number
  instruction: string
  duration?: number
  tips?: string
}

export interface NutritionalInfo {
  calories?: number
  proteins?: number
  carbohydrates?: number
  fats?: number
  fiber?: number
  sodium?: number
}

export interface RecipeGenerationRequest {
  availableProducts: string[]
  preferences?: {
    maxPrepTime?: number
    difficulty?: RecipeDifficulty
    servings?: number
    dietaryRestrictions?: string[]
    cuisineType?: string[]
    mealType?: 'petit-dejeuner' | 'dejeuner' | 'diner' | 'collation'
  }
  excludeIngredients?: string[]
}

// ================================
// INTERFACES STATISTIQUES
// ================================

export interface UserStats {
  userId: string
  totalProducts: number
  productsExpired: number
  productsConsumed: number
  wasteReductionPercent: number
  recipesGenerated: number
  favoriteCategories: ProductCategory[]
  monthlySavings?: number
  co2Saved?: number
  lastUpdated: Date
}

export interface WasteAnalytics {
  period: 'week' | 'month' | 'year'
  wastedProducts: Array<{
    productId: string
    productName: string
    category: ProductCategory
    quantity: number
    estimatedValue: number
    wasteDate: Date
  }>
  totalWasteValue: number
  mostWastedCategories: Array<{
    category: ProductCategory
    count: number
    percentage: number
  }>
  trends: Array<{
    date: Date
    wasteCount: number
    wasteValue: number
  }>
}

// ================================
// INTERFACES IA
// ================================

export interface AIProvider {
  name: string
  type: 'huggingface' | 'gemini' | 'ollama' | 'cohere'
  apiKey?: string
  baseUrl?: string
  model?: string
  isAvailable: boolean
}

export interface AIGenerationResult {
  success: boolean
  recipe?: Recipe
  error?: string
  tokensUsed?: number
  processingTime?: number
  provider: string
}

// ================================
// INTERFACES UTILISATEUR
// ================================

// Interface compatible avec authStore existant
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  createdAt?: Date
  preferences?: {
    notifications: boolean
    theme: 'light' | 'dark'
    language: string
    dietaryRestrictions: string[]
  }
}

export interface UserPreferences {
  notifications: {
    expiration: boolean
    newRecipes: boolean
    weeklyStats: boolean
    wasteAlerts: boolean
  }
  theme: 'light' | 'dark' | 'auto'
  language: 'fr' | 'en' | 'es'
  dietaryRestrictions: DietaryRestriction[]
  allergies: string[]
  cuisinePreferences: string[]
  defaultUnit: ProductUnit
  autoDeleteExpired: boolean
  reminderDays: number
}

export type DietaryRestriction = 
  | 'vegetarien'
  | 'vegan'
  | 'sans-gluten'
  | 'sans-lactose'
  | 'halal'
  | 'kasher'
  | 'paleo'
  | 'keto'

export interface UserAddress {
  street?: string
  city?: string
  postalCode?: string
  country: string
}

export interface UserSubscription {
  plan: 'free' | 'premium'
  startDate: Date
  endDate?: Date
  features: string[]
}

// Interface étendue pour fonctionnalités futures
export interface ExtendedUserProfile extends UserProfile {
  phoneNumber?: string
  address?: UserAddress
  extendedPreferences?: UserPreferences
  stats?: UserStats
  subscription?: UserSubscription
  updatedAt?: Date
}

// ================================
// INTERFACES API
// ================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FilterOptions {
  category?: ProductCategory[]
  expiryDays?: number
  search?: string
  sortBy?: 'name' | 'expiryDate' | 'createdAt' | 'quantity'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// ================================
// INTERFACES NOTIFICATIONS
// ================================

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  scheduledFor?: Date
}

export type NotificationType = 
  | 'product-expiring'
  | 'product-expired'
  | 'recipe-suggestion'
  | 'waste-alert'
  | 'weekly-stats'
  | 'system-update'

// ================================
// UTILITAIRES
// ================================

export interface ExpirationStatus {
  status: 'fresh' | 'expires-soon' | 'expires-today' | 'expired'
  daysRemaining: number
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  color: 'success' | 'warning' | 'danger'
  message: string
}

// ================================
// CONSTANTES
// ================================

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  'fruits-legumes': 'Fruits & Légumes',
  'viande-poisson': 'Viande & Poisson', 
  'produits-laitiers': 'Produits laitiers',
  'cereales-feculents': 'Céréales & Féculents',
  'conserves': 'Conserves',
  'surgeles': 'Surgelés',
  'boissons': 'Boissons',
  'condiments-epices': 'Condiments & Épices',
  'boulangerie-patisserie': 'Boulangerie & Pâtisserie',
  'autres': 'Autres'
}

export const PRODUCT_UNITS: Record<ProductUnit, string> = {
  'unité': 'unité(s)',
  'kg': 'kilogramme(s)',
  'g': 'gramme(s)',
  'L': 'litre(s)', 
  'mL': 'millilitre(s)',
  'paquet': 'paquet(s)',
  'boîte': 'boîte(s)',
  'pot': 'pot(s)',
  'bouteille': 'bouteille(s)'
}

export const DIETARY_RESTRICTIONS: Record<DietaryRestriction, string> = {
  'vegetarien': 'Végétarien',
  'vegan': 'Vegan',
  'sans-gluten': 'Sans gluten',
  'sans-lactose': 'Sans lactose', 
  'halal': 'Halal',
  'kasher': 'Kasher',
  'paleo': 'Paléo',
  'keto': 'Kétogène'
}

// ================================
// FONCTIONS UTILITAIRES
// ================================

export const isProductExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate
}

export const isProductExpiringSoon = (expiryDate: Date, days: number = 3): boolean => {
  const diffTime = expiryDate.getTime() - new Date().getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays > 0
}

export const getExpirationStatus = (expiryDate: Date): ExpirationStatus => {
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      status: 'expired',
      daysRemaining: diffDays,
      urgencyLevel: 'critical',
      color: 'danger',
      message: `Expiré depuis ${Math.abs(diffDays)} jour(s)`
    }
  }

  if (diffDays === 0) {
    return {
      status: 'expires-today',
      daysRemaining: 0,
      urgencyLevel: 'critical',
      color: 'danger',
      message: 'Expire aujourd\'hui'
    }
  }

  if (diffDays <= 3) {
    return {
      status: 'expires-soon',
      daysRemaining: diffDays,
      urgencyLevel: 'high',
      color: 'warning',
      message: `Expire dans ${diffDays} jour(s)`
    }
  }

  return {
    status: 'fresh',
    daysRemaining: diffDays,
    urgencyLevel: 'low',
    color: 'success',
    message: `Frais (${diffDays} jours restants)`
  }
}