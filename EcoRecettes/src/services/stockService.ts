import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput
} from '@/types'

export class StockService {
  private readonly COLLECTION_NAME = 'products'

  // Récupère tous les produits d'un utilisateur
  async getProducts(userId: string): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('expiryDate', 'asc')
      )

      const snapshot = await getDocs(productsQuery)
      const products: Product[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate?.toDate() || new Date(),
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Product)
      })

      return products

    } catch (error: any) {
      throw new Error(`Erreur de chargement: ${error.message}`)
    }
  }

  // Récupère un produit par ID
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, this.COLLECTION_NAME, productId))
      
      if (!productDoc.exists()) {
        return null
      }

      const data = productDoc.data()
      return {
        id: productDoc.id,
        ...data,
        expiryDate: data.expiryDate?.toDate() || new Date(),
        purchaseDate: data.purchaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Product

    } catch (error: any) {
      throw new Error(`Erreur de récupération: ${error.message}`)
    }
  }

  // Ajoute un nouveau produit
  async addProduct(userId: string, productData: ProductCreateInput): Promise<Product> {
    try {
      this.validateProductData(productData)

      const firestoreData = {
        ...productData,
        userId,
        expiryDate: Timestamp.fromDate(productData.expiryDate),
        purchaseDate: Timestamp.fromDate(productData.purchaseDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData)
      const createdProduct = await this.getProductById(docRef.id)
      
      if (!createdProduct) {
        throw new Error('Erreur lors de la création du produit')
      }

      return createdProduct

    } catch (error: any) {
      throw new Error(`Erreur d'ajout: ${error.message}`)
    }
  }

  // Met à jour un produit
  async updateProduct(productId: string, updates: ProductUpdateInput): Promise<Product> {
    try {
      if (Object.keys(updates).length === 0) {
        throw new Error('Aucune donnée à mettre à jour')
      }

      const firestoreUpdates: any = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      if (updates.expiryDate) {
        firestoreUpdates.expiryDate = Timestamp.fromDate(updates.expiryDate)
      }
      if (updates.purchaseDate) {
        firestoreUpdates.purchaseDate = Timestamp.fromDate(updates.purchaseDate)
      }

      await updateDoc(doc(db, this.COLLECTION_NAME, productId), firestoreUpdates)
      const updatedProduct = await this.getProductById(productId)
      
      if (!updatedProduct) {
        throw new Error('Produit introuvable après mise à jour')
      }

      return updatedProduct

    } catch (error: any) {
      throw new Error(`Erreur de mise à jour: ${error.message}`)
    }
  }

  // Supprime un produit
  async deleteProduct(productId: string): Promise<void> {
    try {
      const existingProduct = await this.getProductById(productId)
      if (!existingProduct) {
        throw new Error('Produit introuvable')
      }

      await deleteDoc(doc(db, this.COLLECTION_NAME, productId))

    } catch (error: any) {
      throw new Error(`Erreur de suppression: ${error.message}`)
    }
  }

  // Produits expirant dans X jours
  async getExpiringProducts(userId: string, daysFromNow: number = 3): Promise<Product[]> {
    try {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + daysFromNow)

      const expiringQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('expiryDate', '<=', Timestamp.fromDate(targetDate)),
        where('expiryDate', '>', Timestamp.fromDate(new Date())),
        orderBy('expiryDate', 'asc')
      )

      const snapshot = await getDocs(expiringQuery)
      const products: Product[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate?.toDate() || new Date(),
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Product)
      })

      return products

    } catch (error: any) {
      throw new Error(`Erreur de recherche: ${error.message}`)
    }
  }

  // Produits expirés
  async getExpiredProducts(userId: string): Promise<Product[]> {
    try {
      const expiredQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('expiryDate', '<', Timestamp.fromDate(new Date())),
        orderBy('expiryDate', 'desc')
      )

      const snapshot = await getDocs(expiredQuery)
      const products: Product[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate?.toDate() || new Date(),
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Product)
      })

      return products

    } catch (error: any) {
      throw new Error(`Erreur de recherche: ${error.message}`)
    }
  }

  // Recherche par code-barres
  async getProductByBarcode(userId: string, barcode: string): Promise<Product | null> {
    try {
      const barcodeQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('barcode', '==', barcode),
        limit(1)
      )

      const snapshot = await getDocs(barcodeQuery)
      
      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      const data = doc.data()
      
      return {
        id: doc.id,
        ...data,
        expiryDate: data.expiryDate?.toDate() || new Date(),
        purchaseDate: data.purchaseDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Product

    } catch (error: any) {
      throw new Error(`Erreur de recherche: ${error.message}`)
    }
  }

  // Statistiques produits
  async getProductsStats(userId: string): Promise<{
    total: number
    expired: number
    expiringSoon: number
    fresh: number
  }> {
    try {
      const products = await this.getProducts(userId)
      const now = new Date()
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(now.getDate() + 3)

      const stats = {
        total: products.length,
        expired: 0,
        expiringSoon: 0,
        fresh: 0
      }

      products.forEach(product => {
        if (product.expiryDate < now) {
          stats.expired++
        } else if (product.expiryDate <= threeDaysFromNow) {
          stats.expiringSoon++
        } else {
          stats.fresh++
        }
      })

      return stats

    } catch (error: any) {
      throw new Error(`Erreur de statistiques: ${error.message}`)
    }
  }

  // Validation des données produit
  private validateProductData(productData: ProductCreateInput): void {
    if (!productData.name || productData.name.trim().length === 0) {
      throw new Error('Le nom du produit est obligatoire')
    }

    if (!productData.category) {
      throw new Error('La catégorie est obligatoire')
    }

    if (!productData.quantity || productData.quantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0')
    }

    if (!productData.unit) {
      throw new Error('L\'unité est obligatoire')
    }

    if (!productData.expiryDate) {
      throw new Error('La date d\'expiration est obligatoire')
    }

    if (!productData.purchaseDate) {
      throw new Error('La date d\'achat est obligatoire')
    }

    if (productData.expiryDate <= productData.purchaseDate) {
      throw new Error('La date d\'expiration doit être postérieure à la date d\'achat')
    }
  }

  // Nettoyage automatique des produits expirés
  async cleanupExpiredProducts(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const expiredQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('expiryDate', '<', Timestamp.fromDate(cutoffDate))
      )

      const snapshot = await getDocs(expiredQuery)
      let deletedCount = 0

      const deletePromises = snapshot.docs.map(async (doc) => {
        await deleteDoc(doc.ref)
        deletedCount++
      })

      await Promise.all(deletePromises)
      return deletedCount

    } catch (error: any) {
      throw new Error(`Erreur de nettoyage: ${error.message}`)
    }
  }
}

export const stockService = new StockService()