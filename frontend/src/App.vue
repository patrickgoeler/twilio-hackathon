<template>
    <v-app>
        <v-content>
            <router-view />
            <!-- Global Snackbar managed via ui state -->
            <v-snackbar style="margin-bottom: 60px;" @input="updateSnackbar" :value="showSnackbar()">
                {{ snackbarMessage() }}
                <v-btn color="pink" text @click="updateSnackbar(false)">
                    Close
                </v-btn>
            </v-snackbar>
            <!-- sw update snackbar -->
            <v-snackbar style="margin-bottom: 60px;" v-model="snackWithButtons" :timeout="30000">
                An Update Is Available
                <v-spacer />
                <v-btn depressed color="primary" @click.stop="refreshApp">
                    Update
                </v-btn>
                <v-btn color="white" icon @click="snackWithButtons = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-snackbar>
        </v-content>
    </v-app>
</template>

<style>
/* Fix weird card default style breaking words apart */
.v-card__text,
.v-card__title {
    word-break: normal; /* maybe !important  */
}
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import store from "./store"
import uiModule from "./store/modules/ui.module"

@Component
export default class App extends Vue {
    refreshing = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registration: any
    snackWithButtons = false

    created() {
        // fetch initial data
        // module import doesnt work for some reason
        if (store.getters["User/isLoggedIn"]) {
            store.dispatch("Call/checkQueueStatus")
        }

        // Listen for swUpdated event and display refresh snackbar as required.
        document.addEventListener("swUpdated", this.showRefreshUI, { once: true })
        // Refresh all open app tabs when a new service worker is installed.
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (this.refreshing) return
            this.refreshing = true
            window.location.reload()
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showRefreshUI(e: any) {
        // Display a snackbar inviting the user to refresh/reload the app due
        // to an app update being available.
        // The new service worker is installed, but not yet active.
        // Store the ServiceWorkerRegistration instance for later use.
        this.registration = e.detail
        this.snackWithButtons = true
    }

    refreshApp() {
        this.snackWithButtons = false
        // Protect against missing registration.waiting.
        if (!this.registration || !this.registration.waiting) {
            return
        }
        this.registration.waiting.postMessage("skipWaiting")
    }

    showSnackbar() {
        return uiModule.showSnackbar
    }
    snackbarMessage() {
        return uiModule.snackbarMessage
    }
    updateSnackbar(value: boolean) {
        uiModule.setShowSnackbar(value)
    }
}
</script>
