import { defineStore } from 'pinia'
import type { User } from 'firebase/auth'

// Interface pour stocker les données complètes du profil utilisateur dans Firestore
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

export const useAuthStore = defineStore('auth', {
  // État du store (équivalent à data() dans les composants)
  state: () => ({
    user: null as User | null, // Utilisateur Firebase Auth
    userProfile: null as UserProfile | null, // Profil complet depuis Firestore
    loading: false, // État de chargement pour les opérations async
    error: null as string | null, // Messages d'erreur à afficher à l'utilisateur
    initialized: false // Indique si Firebase Auth a été initialisé
  }),

  // Propriétés calculées (équivalent à computed dans les composants)
  getters: {
    // Vérifie si l'utilisateur est connecté
    isAuthenticated(): boolean {
      return !!this.user
    },

    // Récupère le nom d'affichage de l'utilisateur
    userName(): string {
      return this.userProfile?.displayName || 
             this.user?.displayName || 
             this.user?.email?.split('@')[0] || 
             'Utilisateur'
    },

    // Récupère l'email de l'utilisateur
    userEmail(): string {
      return this.user?.email || ''
    }
  },

  // Actions (équivalent à methods dans les composants)
  actions: {
    // Définit l'utilisateur Firebase Auth
    setUser(firebaseUser: User | null) {
      this.user = firebaseUser
      if (!firebaseUser) {
        this.userProfile = null
      }
    },

    // Définit le profil utilisateur complet
    setUserProfile(profile: UserProfile | null) {
      this.userProfile = profile
    },

    // Gère l'état de chargement
    setLoading(isLoading: boolean) {
      this.loading = isLoading
    },

    // Gère les messages d'erreur
    setError(errorMessage: string | null) {
      this.error = errorMessage
    },

    // Marque Firebase comme initialisé
    setInitialized(isInitialized: boolean) {
      this.initialized = isInitialized
    },

    // Vérifie si l'utilisateur est déjà connecté au démarrage de l'app
    async checkAuthState() {
      try {
        this.setLoading(true)
        // Import dynamique pour éviter les imports circulaires
        const { authService } = await import('@/services/authService')
        
        // Initialise l'écoute des changements d'authentification
        authService.initAuthListener()
        
        // Marque comme initialisé
        this.setInitialized(true)
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'état d\'auth:', err)
        this.setError('Erreur de connexion')
      } finally {
        this.setLoading(false)
      }
    },

    // Connecte un utilisateur avec email/password
    async login(email: string, password: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        
        // Import dynamique pour éviter les imports circulaires
        const { authService } = await import('@/services/authService')
        
        // Appel du service Firebase
        await authService.login(email, password)
        
        // L'état sera mis à jour automatiquement par onAuthStateChanged
        
      } catch (err: any) {
        console.error('Erreur de connexion:', err)
        this.setError(err.message || 'Erreur de connexion')
        throw err
      } finally {
        this.setLoading(false)
      }
    },

    // Inscrit un nouvel utilisateur
    async register(email: string, password: string, displayName?: string) {
      try {
        this.setLoading(true)
        this.setError(null)
        
        // Import dynamique pour éviter les imports circulaires
        const { authService } = await import('@/services/authService')
        
        // Appel du service Firebase
        await authService.register(email, password, displayName)
        
        // L'état sera mis à jour automatiquement par onAuthStateChanged
        
      } catch (err: any) {
        console.error('Erreur d\'inscription:', err)
        this.setError(err.message || 'Erreur d\'inscription')
        throw err
      } finally {
        this.setLoading(false)
      }
    },

    // Déconnecte l'utilisateur actuel
    async logout() {
      try {
        this.setLoading(true)
        this.setError(null)
        
        // Import dynamique pour éviter les imports circulaires
        const { authService } = await import('@/services/authService')
        
        // Appel du service Firebase
        await authService.logout()
        
        // L'état sera nettoyé automatiquement par onAuthStateChanged
        
      } catch (err: any) {
        console.error('Erreur de déconnexion:', err)
        this.setError(err.message || 'Erreur de déconnexion')
      } finally {
        this.setLoading(false)
      }
    },

    // Met à jour les données du profil utilisateur
    async updateProfile(updates: Partial<UserProfile>) {
      try {
        this.setLoading(true)
        this.setError(null)
        
        if (!this.userProfile) return
        
        // Import dynamique pour éviter les imports circulaires
        const { authService } = await import('@/services/authService')
        
        // Appel du service Firebase
        await authService.updateUserProfile(updates)
        
        // L'état sera mis à jour automatiquement par le service
        
      } catch (err: any) {
        console.error('Erreur de mise à jour du profil:', err)
        this.setError(err.message || 'Erreur de mise à jour')
        throw err
      } finally {
        this.setLoading(false)
      }
    },

    // Efface le message d'erreur actuel
    clearError() {
      this.setError(null)
    }
  }
})