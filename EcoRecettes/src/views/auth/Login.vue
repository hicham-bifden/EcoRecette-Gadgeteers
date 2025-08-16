<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>EcoRecettes - Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Logo et titre de bienvenue -->
      <div class="welcome-section">
        <ion-icon :icon="restaurantOutline" size="large" color="primary"></ion-icon>
        <h1>Bienvenue dans EcoRecettes</h1>
        <p>Connectez-vous pour gérer votre stock alimentaire</p>
      </div>

      <!-- Formulaire de connexion -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Champ Email -->
        <ion-item>
          <ion-label position="stacked">Email</ion-label>
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
          <ion-label position="stacked">Mot de passe</ion-label>
          <ion-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Votre mot de passe"
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

        <!-- Message d'erreur -->
        <ion-item v-if="authStore.error" lines="none" class="error-message">
          <ion-icon :icon="alertCircleOutline" color="danger" slot="start"></ion-icon>
          <ion-label color="danger">{{ authStore.error }}</ion-label>
        </ion-item>

        <!-- Bouton de connexion -->
        <ion-button
          expand="block"
          type="submit"
          :disabled="!isFormValid || loading"
          class="login-button"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Se connecter</span>
        </ion-button>
      </form>

      <!-- Lien vers l'inscription -->
      <div class="register-link">
        <p>Pas encore de compte ?</p>
        <ion-button fill="clear" @click="goToRegister" :disabled="loading">
          Créer un compte
        </ion-button>
      </div>

      <!-- Version de démo (à retirer en production) -->
      <div class="demo-section">
        <ion-button
          fill="outline"
          expand="block"
          @click="loginDemo"
          :disabled="loading"
        >
          Connexion démo (test)
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
  IonIcon,
  IonSpinner,
  alertController
} from '@ionic/vue'
import {
  restaurantOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'LoginPage',
  
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
    IonIcon,
    IonSpinner
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
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      // Icônes pour le template
      restaurantOutline,
      eyeOutline,
      eyeOffOutline,
      alertCircleOutline
    }
  },

  computed: {
    // Valide le formulaire (email contient @ et mot de passe >= 6 caractères)
    isFormValid() {
      return this.email.includes('@') && this.password.length >= 6
    }
  },

  mounted() {
    // Redirige si l'utilisateur est déjà connecté
    if (this.authStore.isAuthenticated()) {
      this.$router.replace({ name: 'Dashboard' })
    }
  },

  methods: {
    // Bascule l'affichage du mot de passe (texte/masqué)
    togglePassword() {
      this.showPassword = !this.showPassword
    },

    // Efface le message d'erreur quand l'utilisateur tape
    clearError() {
      this.authStore.clearError()
    },

    // Gère la soumission du formulaire de connexion
    async handleLogin() {
      if (!this.isFormValid) return

      try {
        this.loading = true
        
        // Tentative de connexion via le store
        await this.authStore.login(this.email.trim(), this.password)
        
        console.log('Connexion réussie!')
        
        // Affiche un message de succès
        const alert = await alertController.create({
          header: 'Connexion réussie',
          message: `Bienvenue ${this.authStore.userName()}!`,
          buttons: ['OK']
        })
        await alert.present()
        
      } catch (err) {
        console.error('Erreur de connexion:', err)
        // L'erreur est automatiquement affichée via le store
      } finally {
        this.loading = false
      }
    },

    // Navigue vers la page d'inscription
    goToRegister() {
      this.$router.push({ name: 'Register' })
    },

    // Connexion rapide pour les tests de développement
    async loginDemo() {
      this.email = 'demo@ecorecettes.com'
      this.password = 'demo123'
      await this.handleLogin()
    }
  }
}
</script>

<style scoped>
.welcome-section {
  text-align: center;
  margin: 2rem 0 3rem 0;
}

.welcome-section ion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.welcome-section h1 {
  color: var(--ion-color-primary);
  margin: 1rem 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.welcome-section p {
  color: var(--ion-color-medium);
  margin: 0;
  font-size: 1rem;
}

.login-form {
  margin: 2rem 0;
}

.login-form ion-item {
  margin-bottom: 1rem;
}

.error-message {
  --background: rgba(var(--ion-color-danger-rgb), 0.1);
  --border-radius: 8px;
  margin: 1rem 0;
}

.login-button {
  margin-top: 2rem;
  height: 48px;
  font-weight: bold;
}

.register-link {
  text-align: center;
  margin: 3rem 0 2rem 0;
}

.register-link p {
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

.demo-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--ion-color-light);
}

/* Design responsive pour tablettes et desktop */
@media (min-width: 768px) {
  ion-content {
    --padding-start: 20%;
    --padding-end: 20%;
  }
}
</style>