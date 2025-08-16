import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth'

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { useAuthStore, type UserProfile } from '@/stores/authStore'

// Service centralisé pour toutes les opérations d'authentification
export class AuthService {
  private authStore = useAuthStore()

  // Initialise l'écoute des changements d'état d'authentification au démarrage
  initAuthListener() {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      try {
        console.log('Changement d\'état auth:', firebaseUser?.email || 'Déconnecté')
        
        if (firebaseUser) {
          // Utilisateur connecté - charger son profil depuis Firestore
          this.authStore.setUser(firebaseUser)
          await this.loadUserProfile(firebaseUser.uid)
        } else {
          // Utilisateur déconnecté - nettoyer l'état
          this.authStore.setUser(null)
          this.authStore.setUserProfile(null)
        }
        
        // Marquer comme initialisé après le premier check
        if (!this.authStore.initialized) {
          this.authStore.setInitialized(true)
        }
        
      } catch (error) {
        console.error('Erreur lors du changement d\'état auth:', error)
        this.authStore.setError('Erreur de synchronisation')
      }
    })
  }

  // Connecte un utilisateur avec email et mot de passe
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      console.log('Tentative de connexion Firebase pour:', email)
      
      // Connexion via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Le profil sera chargé automatiquement par onAuthStateChanged
      console.log('Connexion réussie!')
      return userCredential
      
    } catch (error: any) {
      console.error('Erreur de connexion Firebase:', error)
      
      // Convertir les erreurs Firebase en messages compréhensibles
      let errorMessage = 'Erreur de connexion'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte trouvé avec cet email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email invalide'
          break
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard'
          break
        default:
          errorMessage = error.message || 'Erreur de connexion'
      }
      
      throw new Error(errorMessage)
    }
  }

  // Inscrit un nouvel utilisateur
  async register(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      console.log('Tentative d\'inscription Firebase pour:', email)
      
      // Création du compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Mise à jour du nom d'affichage si fourni
      if (displayName) {
        await updateProfile(user, { displayName })
      }
      
      // Création du profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName || undefined,
        createdAt: new Date(),
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'fr',
          dietaryRestrictions: []
        }
      }
      
      // Sauvegarder le profil dans Firestore
      await this.createUserProfile(userProfile)
      
      console.log('Inscription réussie!')
      return userCredential
      
    } catch (error: any) {
      console.error('Erreur d\'inscription Firebase:', error)
      
      // Convertir les erreurs Firebase en messages compréhensibles
      let errorMessage = 'Erreur d\'inscription'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Un compte existe déjà avec cet email'
          break
        case 'auth/invalid-email':
          errorMessage = 'Email invalide'
          break
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'L\'inscription par email est désactivée'
          break
        default:
          errorMessage = error.message || 'Erreur d\'inscription'
      }
      
      throw new Error(errorMessage)
    }
  }

  // Déconnecte l'utilisateur actuel
  async logout(): Promise<void> {
    try {
      console.log('Déconnexion Firebase en cours...')
      await signOut(auth)
      console.log('Déconnexion réussie!')
    } catch (error: any) {
      console.error('Erreur de déconnexion Firebase:', error)
      throw new Error('Erreur lors de la déconnexion')
    }
  }

  // Charge le profil utilisateur depuis Firestore
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile
        this.authStore.setUserProfile(profileData)
        console.log('Profil utilisateur chargé:', profileData.email)
      } else {
        console.warn('Aucun profil trouvé dans Firestore pour:', uid)
        // Créer un profil de base si inexistant
        await this.createBasicProfile(uid)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    }
  }

  // Crée un profil utilisateur dans Firestore
  private async createUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userProfile.uid), {
        ...userProfile,
        createdAt: serverTimestamp(), // Utilise le timestamp du serveur
        updatedAt: serverTimestamp()
      })
      
      // Mettre à jour le store local
      this.authStore.setUserProfile(userProfile)
      console.log('Profil utilisateur créé dans Firestore')
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error)
      throw error
    }
  }

  // Crée un profil de base pour les utilisateurs existants sans profil
  private async createBasicProfile(uid: string): Promise<void> {
    const user = auth.currentUser
    if (!user) return

    const basicProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || undefined,
      createdAt: new Date(),
      preferences: {
        notifications: true,
        theme: 'light',
        language: 'fr',
        dietaryRestrictions: []
      }
    }

    await this.createUserProfile(basicProfile)
  }

  // Met à jour le profil utilisateur
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté')
      }

      // Mise à jour dans Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      })

      // Mise à jour du store local
      const currentProfile = this.authStore.userProfile
      if (currentProfile) {
        this.authStore.setUserProfile({
          ...currentProfile,
          ...updates
        })
      }

      console.log('Profil mis à jour:', updates)
    } catch (error: any) {
      console.error('Erreur de mise à jour du profil:', error)
      throw new Error('Erreur lors de la mise à jour du profil')
    }
  }

  // Met à jour le nom d'affichage dans Firebase Auth
  async updateDisplayName(displayName: string): Promise<void> {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté')
      }

      // Mise à jour dans Firebase Auth
      await updateProfile(currentUser, { displayName })

      // Mise à jour dans Firestore
      await this.updateUserProfile({ displayName })

      console.log('Nom d\'affichage mis à jour:', displayName)
    } catch (error: any) {
      console.error('Erreur de mise à jour du nom:', error)
      throw new Error('Erreur lors de la mise à jour du nom')
    }
  }

  // Retourne l'utilisateur actuellement connecté
  getCurrentUser(): User | null {
    return auth.currentUser
  }

  // Vérifie si un utilisateur est connecté
  isAuthenticated(): boolean {
    return !!auth.currentUser
  }
}

// Instance singleton du service
export const authService = new AuthService()