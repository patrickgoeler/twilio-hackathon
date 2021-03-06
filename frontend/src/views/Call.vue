<template>
    <Layout>
        <AppBar />
        <v-layout column align-center>
            <div class="display-1 mb-8" style="text-align:center;" v-if="callStatus() === 'idle'">
                Ready to have a chat?
            </div>
            <div class="display-1 mb-8" style="text-align:center;" v-if="callStatus() === 'queue'">
                Looking for a call...
            </div>
            <div class="display-1 mb-8" style="text-align:center;" v-if="callStatus() === 'calling'">
                Enjoy your call!
            </div>
            <BonfireIcon
                :loading="callStatus() === 'queue' || callStatus() === 'calling'"
                class="mb-8"
                width="150"
                height="150"
                :gray="callStatus() === 'idle'"
            />

            <v-layout column>
                <p v-if="callStatus() === 'idle'" class="body-1" style="text-align:center;width:100%;max-width:500px;">
                    Please be aware that a phone number from the USA will facilitate the call (+13133951008). For our
                    fellows with a German contract in Germany, this service is free. For everyone else charges may
                    apply, so please check with your provider first.
                </p>
                <p v-if="callStatus() === 'queue'" class="body-1" style="text-align:center;width:100%;max-width:500px;">
                    Your phone will ring as soon as we find a likeminded person.<br />
                    Once your call is done, you can find it in the overview 📱
                </p>
                <p
                    v-if="callStatus() === 'calling'"
                    class="body-1"
                    style="text-align:center;width:100%;max-width:500px;"
                >
                    Try to find out what you have in common and have fun 👍
                    <br />
                    Note that only calls that exceed 2 minutes will be added to your profile to encourage meaningful
                    conversations.
                </p>
                <v-btn
                    v-if="callStatus() === 'idle'"
                    :loading="callStateLoading()"
                    color="primary"
                    class="mt-4"
                    @click="startCall()"
                    >Start Call</v-btn
                >
                <v-btn
                    v-if="callStatus() === 'queue'"
                    :loading="callStateLoading()"
                    color="red accent-4"
                    class="mt-4 white--text"
                    @click="leaveQueue()"
                    >Leave Queue</v-btn
                >
                <v-btn
                    v-if="callStatus() === 'calling'"
                    :loading="callStateLoading()"
                    color="success"
                    class="mt-4"
                    @click="completeCall()"
                    >Complete Call</v-btn
                >
                <v-btn
                    :loading="callStateLoading()"
                    color="gray lighten-5"
                    outlined
                    depressed
                    class="mt-4"
                    @click="refreshCallStatus()"
                    >Refresh Call Status</v-btn
                >
            </v-layout>
        </v-layout>
        <BottomNav />
    </Layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import BottomNav from "../components/BottomNav.vue"
import AppBar from "../components/AppBar.vue"
import Layout from "../components/Layout.vue"
import BonfireIcon from "../components/BonfireIcon.vue"
import callModule from "../store/modules/call.module"

@Component({ components: { BottomNav, AppBar, BonfireIcon, Layout } })
export default class Call extends Vue {
    callStatus() {
        return callModule.callStatus
    }

    refreshCallStatus() {
        callModule.checkQueueStatus()
    }

    callStateLoading() {
        return callModule.loading
    }

    startCall() {
        callModule.findConference()
    }

    completeCall() {
        callModule.completeCall()
    }

    leaveQueue() {
        callModule.leaveCallQueue()
    }
}
</script>
