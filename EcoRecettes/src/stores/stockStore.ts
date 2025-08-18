import { defineStore } from 'pinia'
import type { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput, 
  FilterOptions,
  ExpirationStatus,
  ProductCategory 
} from '../types'
import { getExpirationStatus, isProductExpired, isProductExpiringSoon } from '../types'
import { useAuthStore } from './authStore'

export const useStockStore = defineStore('stock', {
  
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null,
    initialized: false,
    
    filters: {
      category: [] as ProductCategory[],
      search: '',
      expiryDays: undefined as number | undefined,
      sortBy: 'expiryDate' as const,
      sortOrder: 'asc' as const
    } as FilterOptions
  }),

  getters: {
    
    // Compteurs principaux
    totalProducts(): number {
      return this.products.length
    },

    expiredProducts(): Product[] {
      return this.products.filter((product: Product) => isProductExpired(product.expiryDate))
    },

    expiringTodayProducts(): Product[] {
      const today = new Date()
      return this.products.filter((product: Product) => {
        const diffTime = product.expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays === 0
      })
    },

    expiringSoonProducts(): Product[] {
      return this.products.filter((product: Product) => 
        isProductExpiringSoon(product.expiryDate, 3) && !isProductExpired(product.expiryDate)
      )
    },

    // Compteurs pour Dashboard
    expiredCount(): number {
      return this.expiredProducts.length
    },

    expiringTodayCount(): number {
      return this.expiringTodayProducts.length
    },

    expiringSoonCount(): number {
      return this.expiringSoonProducts.length
    },

    // Produits récents (7 derniers jours)
    recentProducts(): Product[] {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      return this.products
        .filter((product: Product) => product.createdAt >= weekAgo)
        .sort((a: Product, b: Product) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
    },

    // Helpers UI
    hasAlerts(): boolean {
      return this.expiredCount > 0 || this.expiringTodayCount > 0 || this.expiringSoonCount > 0
    },

    isEmpty(): boolean {
      return this.totalProducts === 0
    }
  },

  actions: {
    
    // Gestion d'état
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setProducts(products: Product[]) {
      this.products = products
      this.initialized = true
    },

    clearError() {
      this.error = null
    },

    // CRUD simplifié pour tester (sans Firebase pour l'instant)
    async loadProducts() {
      try {
        this.setLoading(true)
        this.setError(null)

        const authStore = useAuthStore()
        if (!authStore.user) {
          throw new Error('Utilisateur non connecté')
        }

        // TODO: Remplacer par vraie communication Firebase
        // Pour l'instant, données de test
        const testProducts: Product[] = [
          {
            id: '1',
            name: 'Yaourts nature',
            category: 'produits-laitiers',
            quantity: 8,
            unit: 'unité',
            purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Demain
            userId: authStore.user.uid,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Lait demi-écrémé',
            category: 'produits-laitiers',
            quantity: 1,
            unit: 'L',
            purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
            userId: authStore.user.uid,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          },
          {
            id: '3',
            name: 'Pain de mie',
            category: 'boulangerie-patisserie',
            quantity: 1,
            unit: 'paquet',
            purchaseDate: new Date(),
            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
            userId: authStore.user.uid,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        this.setProducts(testProducts)
        console.log('Produits de test chargés:', testProducts.length)
        
      } catch (error: any) {
        console.error('Erreur chargement produits:', error)
        this.setError(error.message || 'Erreur lors du chargement des produits')
      } finally {
        this.setLoading(false)
      }
    },

    async addProduct(productData: ProductCreateInput) {
      try {
        this.setLoading(true)
        this.setError(null)

        const authStore = useAuthStore()
        if (!authStore.user) {
          throw new Error('Utilisateur non connecté')
        }

        // TODO: Remplacer par vraie communication Firebase
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData,
          userId: authStore.user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        this.products.unshift(newProduct)
        console.log('Produit ajouté:', newProduct.name)
        return newProduct
        
      } catch (error: any) {
        console.error('Erreur ajout produit:', error)
        this.setError(error.message || 'Erreur lors de l\'ajout du produit')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async updateProduct(productId: string, updates: ProductUpdateInput) {
      try {
        this.setLoading(true)
        this.setError(null)

        const index = this.products.findIndex((p: Product) => p.id === productId)
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...updates,
            updatedAt: new Date()
          }
        }
        
        return this.products[index]
        
      } catch (error: any) {
        console.error('Erreur mise à jour produit:', error)
        this.setError(error.message || 'Erreur lors de la mise à jour')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async deleteProduct(productId: string) {
      try {
        this.setLoading(true)
        this.setError(null)

        this.products = this.products.filter((p: Product) => p.id !== productId)
        console.log('Produit supprimé')
        
      } catch (error: any) {
        console.error('Erreur suppression produit:', error)
        this.setError(error.message || 'Erreur lors de la suppression')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Utilitaires
    getProductExpirationStatus(productId: string): ExpirationStatus | null {
      const product: Product | undefined = this.products.find((p: Product) => p.id === productId)
      return product ? getExpirationStatus(product.expiryDate) : null
    },

    getProductById(productId: string): Product | undefined {
      return this.products.find((p: Product) => p.id === productId)
    },

    async initialize() {
      if (!this.initialized) {
        await this.loadProducts()
      }
    },

    reset() {
      this.products = []
      this.loading = false
      this.error = null
      this.initialized = false
    }
  }
})