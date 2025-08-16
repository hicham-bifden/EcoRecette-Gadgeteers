<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>EcoRecettes - Inscription</ion-title>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Logo et titre de bienvenue -->
      <div class="welcome-section">
        <ion-icon :icon="restaurantOutline" size="large" color="primary"></ion-icon>
        <h1>Rejoignez EcoRecettes</h1>
        <p>Créez votre compte pour commencer à réduire le gaspillage alimentaire</p>
      </div>

      <!-- Formulaire d'inscription -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Champ Nom d'affichage -->
        <ion-item>
          <ion-label position="stacked">Nom d'affichage</ion-label>
          <ion-input
            v-model="displayName"
            type="text"
            placeholder="Votre prénom ou pseudo"
            :disabled="loading"
            @ionInput="clearError"
          ></ion-input>
        </ion-item>

        <!-- Champ Email -->
        <ion-item>
          <ion-label position="stacked">Email *</ion-label>
          <ion-input
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            required
            :disabled="loading"
            @ionInput="clearError"
          ></ion-input>
        </ion-item>

        <!-- Champ Mot de passe -->
        <ion-item>
          <ion-label position="stacked">Mot de passe *</ion-label>
          <ion-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Au moins 6 caractères"
            required
            :disabled="loading"
            @ionInput="clearError"
          ></ion-input>
          <ion-button
            slot="end"
            fill="clear"
            @click="togglePassword"
            :disabled="loading"
          >
            <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Champ Confirmation mot de passe -->
        <ion-item>
          <ion-label position="stacked">Confirmer le mot de passe *</ion-label>
          <ion-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Répétez votre mot de passe"
            required
            :disabled="loading"
            @ionInput="clearError"
          ></ion-input>
          <ion-button
            slot="end"
            fill="clear"
            @click="toggleConfirmPassword"
            :disabled="loading"
          >
            <ion-icon :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- Indicateur de force du mot de passe -->
        <div v-if="password" class="password-strength">
          <ion-label>Force du mot de passe:</ion-label>
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="passwordStrengthClass"
              :style="{ width: passwordStrengthPercent + '%' }"
            ></div>
          </div>
          <ion-text :color="passwordStrengthColor">{{ passwordStrengthText }}</ion-text>
        </div>

        <!-- Message d'erreur -->
        <ion-item v-if="authStore.error" lines="none" class="error-message">
          <ion-icon :icon="alertCircleOutline" color="danger" slot="start"></ion-icon>
          <ion-label color="danger">{{ authStore.error }}</ion-label>
        </ion-item>

        <!-- Message d'erreur local (validation) -->
        <ion-item v-if="localError" lines="none" class="error-message">
          <ion-icon :icon="alertCircleOutline" color="danger" slot="start"></ion-icon>
          <ion-label color="danger">{{ localError }}</ion-label>
        </ion-item>

        <!-- Acceptation des conditions -->
        <ion-item lines="none" class="terms-item">
          <ion-checkbox
            v-model="acceptTerms"
            slot="start"
            :disabled="loading"
          ></ion-checkbox>
          <ion-label class="terms-label">
            J'accepte les <a href="#" @click.prevent="showTerms">conditions d'utilisation</a>
            et la <a href="#" @click.prevent="showPrivacy">politique de confidentialité</a>
          </ion-label>
        </ion-item>

        <!-- Bouton d'inscription -->
        <ion-button
          expand="block"
          type="submit"
          :disabled="!isFormValid || loading"
          class="register-button"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Créer mon compte</span>
        </ion-button>
      </form>

      <!-- Lien vers la connexion -->
      <div class="login-link">
        <p>Vous avez déjà un compte ?</p>
        <ion-button fill="clear" @click="goToLogin" :disabled="loading">
          Se connecter
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonCheckbox,
  IonText,
  alertController,
  toastController
} from '@ionic/vue'
import {
  restaurantOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  arrowBackOutline
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'RegisterPage',
  
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonIcon,
    IonSpinner,
    IonCheckbox,
    IonText
  },

  setup() {
    // Store d'authentification
    const authStore = useAuthStore()

    return {
      authStore
    }
  },
  
  data() {
    return {
      // Champs du formulaire
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      acceptTerms: false,
      loading: false,
      localError: '',
      
      // Icônes pour le template
      restaurantOutline,
      eyeOutline,
      eyeOffOutline,
      alertCircleOutline,
      arrowBackOutline
    }
  },

  computed: {
    // Valide l'ensemble du formulaire
    isFormValid() {
      return (
        this.email.includes('@') && 
        this.password.length >= 6 && 
        this.password === this.confirmPassword &&
        this.acceptTerms &&
        !this.localError
      )
    },

    // Calcule la force du mot de passe
    passwordStrengthPercent() {
      let score = 0
      if (this.password.length >= 6) score += 25
      if (this.password.length >= 8) score += 25
      if (/[A-Z]/.test(this.password)) score += 25
      if (/[0-9]/.test(this.password)) score += 25
      return score
    },

    passwordStrengthClass() {
      if (this.passwordStrengthPercent <= 25) return 'weak'
      if (this.passwordStrengthPercent <= 50) return 'medium'
      if (this.passwordStrengthPercent <= 75) return 'good'
      return 'strong'
    },

    passwordStrengthColor() {
      if (this.passwordStrengthPercent <= 25) return 'danger'
      if (this.passwordStrengthPercent <= 50) return 'warning'
      if (this.passwordStrengthPercent <= 75) return 'primary'
      return 'success'
    },

    passwordStrengthText() {
      if (this.passwordStrengthPercent <= 25) return 'Faible'
      if (this.passwordStrengthPercent <= 50) return 'Moyen'
      if (this.passwordStrengthPercent <= 75) return 'Bon'
      return 'Fort'
    }
  },

  watch: {
    // Surveille les changements de mot de passe pour validation
    password() {
      this.validatePasswords()
    },
    confirmPassword() {
      this.validatePasswords()
    }
  },

  mounted() {
    // Redirige si l'utilisateur est déjà connecté
    if (this.authStore.isAuthenticated()) {
      this.$router.replace({ name: 'Dashboard' })
    }
  },

  methods: {
    // Valide que les mots de passe correspondent
    validatePasswords() {
      if (this.confirmPassword && this.password !== this.confirmPassword) {
        this.localError = 'Les mots de passe ne correspondent pas'
      } else {
        this.localError = ''
      }
    },

    // Bascule l'affichage du mot de passe principal
    togglePassword() {
      this.showPassword = !this.showPassword
    },

    // Bascule l'affichage de la confirmation du mot de passe
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },

    // Efface les messages d'erreur quand l'utilisateur tape
    clearError() {
      this.authStore.clearError()
      this.localError = ''
    },

    // Gère la soumission du formulaire d'inscription
    async handleRegister() {
      if (!this.isFormValid) return

      try {
        this.loading = true
        
        // Tentative d'inscription via le store
        await this.authStore.register(
          this.email.trim(), 
          this.password, 
          this.displayName.trim() || undefined
        )
        
        console.log('Inscription réussie!')
        
        // Affiche un message de succès
        const toast = await toastController.create({
          message: 'Compte créé avec succès ! Bienvenue dans EcoRecettes !',
          duration: 3000,
          position: 'top',
          color: 'success'
        })
        await toast.present()
        
      } catch (err) {
        console.error('Erreur d\'inscription:', err)
        // L'erreur est automatiquement affichée via le store
      } finally {
        this.loading = false
      }
    },

    // Retourne à la page précédente
    goBack() {
      this.$router.back()
    },

    // Navigue vers la page de connexion
    goToLogin() {
      this.$router.push({ name: 'Login' })
    },

    // Affiche les conditions d'utilisation (placeholder)
    async showTerms() {
      const alert = await alertController.create({
        header: 'Conditions d\'utilisation',
        message: 'Les conditions d\'utilisation seront affichées ici.',
        buttons: ['OK']
      })
      await alert.present()
    },

    // Affiche la politique de confidentialité (placeholder)
    async showPrivacy() {
      const alert = await alertController.create({
        header: 'Politique de confidentialité',
        message: 'La politique de confidentialité sera affichée ici.',
        buttons: ['OK']
      })
      await alert.present()
    }
  }
}
</script>

<style scoped>
.welcome-section {
  text-align: center;
  margin: 1.5rem 0 2rem 0;
}

.welcome-section ion-icon {
  font-size: 3.5rem;
  margin-bottom: 0.8rem;
}

.welcome-section h1 {
  color: var(--ion-color-primary);
  margin: 0.8rem 0 0.5rem 0;
  font-size: 1.6rem;
  font-weight: bold;
}

.welcome-section p {
  color: var(--ion-color-medium);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.register-form {
  margin: 1.5rem 0;
}

.register-form ion-item {
  margin-bottom: 1rem;
}

.password-strength {
  margin: 0.5rem 1rem 1rem 1rem;
}

.strength-bar {
  height: 4px;
  background: var(--ion-color-light);
  border-radius: 2px;
  margin: 0.5rem 0;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.weak {
  background: var(--ion-color-danger);
}

.strength-fill.medium {
  background: var(--ion-color-warning);
}

.strength-fill.good {
  background: var(--ion-color-primary);
}

.strength-fill.strong {
  background: var(--ion-color-success);
}

.error-message {
  --background: rgba(var(--ion-color-danger-rgb), 0.1);
  --border-radius: 8px;
  margin: 1rem 0;
}

.terms-item {
  margin: 1.5rem 0;
}

.terms-label {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-left: 1rem;
}

.terms-label a {
  color: var(--ion-color-primary);
  text-decoration: none;
}

.terms-label a:hover {
  text-decoration: underline;
}

.register-button {
  margin-top: 1.5rem;
  height: 48px;
  font-weight: bold;
}

.login-link {
  text-align: center;
  margin: 2rem 0 1rem 0;
}

.login-link p {
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

/* Design responsive pour tablettes et desktop */
@media (min-width: 768px) {
  ion-content {
    --padding-start: 20%;
    --padding-end: 20%;
  }
}
</style>