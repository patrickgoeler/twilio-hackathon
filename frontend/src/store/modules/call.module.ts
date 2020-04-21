import router from "@/router"
import store from "@/store"
import axios from "axios"
import { Action, getModule, Module, Mutation, VuexModule } from "vuex-module-decorators"
import UiModule from "./ui.module"

const uiState = getModule(UiModule)

export interface Call {
    _id: string
    conferenceId: string
    phone: string
    createdAt: Date
    rating: number
    completedAt: Date
    commonInterests: string[]
    guessedInterests: string[]
    points: number
    firstCall: boolean
}

@Module({ name: "Call", store, dynamic: true, namespaced: true })
export default class CallModule extends VuexModule {
    callStatus: "idle" | "queue" | "calling" = "idle"
    loading = false
    callDetail!: Call
    calls: Call[] = []
    @Mutation
    setCallStatus(newStatus: "idle" | "queue" | "calling") {
        this.callStatus = newStatus
    }
    @Mutation
    setCalls(newCalls: Call[]) {
        this.calls = newCalls
    }
    @Mutation
    setLoading(newLoading: boolean) {
        this.loading = newLoading
    }
    @Mutation
    setCallDetail(newCall: Call) {
        this.callDetail = newCall
    }

    @Action
    async submitGuesses(payload: { callId: string; guesses: string[] }) {
        try {
            this.setLoading(true)
            const body = { callId: payload.callId, submittedInterests: payload.guesses }
            const response = await axios.post(`${process.env.VUE_APP_API_URL}/calls/submit`, body)
            const { data } = response.data
            this.setLoading(false)
            return data
        } catch (error) {
            console.log(error)
            this.setLoading(false)
            return null
        }
    }

    @Action
    async submitRating(payload: { callId: string; rating: number }) {
        try {
            this.setLoading(true)
            const body = { callId: payload.callId, rating: payload.rating }
            await axios.post(`${process.env.VUE_APP_API_URL}/calls/rate`, body)
            this.setLoading(false)
        } catch (error) {
            console.log(error)
            this.setLoading(false)
        }
    }

    @Action
    async getCalls() {
        try {
            this.setLoading(true)
            const response = await axios.get(`${process.env.VUE_APP_API_URL}/calls`)
            this.setLoading(false)
            const { data } = response.data
            this.setCalls(data)
        } catch (error) {
            console.log(error)
            this.setLoading(false)
        }
    }

    @Action
    async getCall(id: string) {
        try {
            this.setLoading(true)
            const response = await axios.get(`${process.env.VUE_APP_API_URL}/calls/single/${id}`)
            this.setLoading(false)
            const { data } = response.data
            this.setCallDetail(data)
            return data
        } catch (error) {
            console.log(error)
            this.setLoading(false)
            return null
        }
    }

    @Action
    async checkQueueStatus() {
        this.setLoading(true)
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_URL}/calls/inQueue`)
            const { data } = response.data
            if (data.queue) {
                this.setCallStatus("queue")
            } else {
                // check whether in a conference
                const response = await axios.get(`${process.env.VUE_APP_API_URL}/calls/isCallActive`)
                const { data } = response.data
                if (data.callActive) {
                    this.setCallStatus("calling")
                } else {
                    this.setCallStatus("idle")
                }
            }
        } catch (error) {
            console.log(error)
            this.setCallStatus("idle")
        }
        this.setLoading(false)
    }

    @Action
    async findConference() {
        try {
            this.setLoading(true)
            const response = await axios.post(`${process.env.VUE_APP_API_URL}/conference`)
            this.setLoading(false)
            const { data } = response.data
            if (data.queue) {
                // put user in queue
                this.setCallStatus("queue")
                // const interval = setInterval(async () => {
                //     console.log("checking if still in queue")
                //     if (this.refreshQueueCounter === 5) {
                //         console.log("Queue timeout, removing user from queue")
                //         this.leaveCallQueue()
                //     } else {
                //         this.increaseQueueCounter()
                //         const response = await axios.get(`${process.env.VUE_APP_API_URL}/calls/stillInQueue`)
                //         const { data } = response.data
                //         if (data.queue === false) {
                //             // not in queue anymore, call started
                //             console.log("not in queue anymore, call must have started")
                //             this.setCallStatus("calling")
                //             this.resetInterval()
                //         }
                //     }
                // }, 5000)
                // this.setUpdateQueueInterval(interval)
            } else if (data.queue === false) {
                // call is being initiated
                this.setCallStatus("calling")
            }
        } catch (error) {
            console.log(error)
            this.setCallStatus("idle")
            this.setLoading(false)
        }
    }

    @Action
    async leaveCallQueue() {
        try {
            this.setLoading(true)
            // this.resetInterval()
            await axios.post(`${process.env.VUE_APP_API_URL}/conference/leaveQueue`)
            this.setCallStatus("idle")
            this.setLoading(false)
        } catch (error) {
            console.log(error)
            this.setCallStatus("idle")
            this.setLoading(false)
        }
    }

    @Action
    async completeCall() {
        try {
            this.setLoading(true)
            const response = await axios.get(`${process.env.VUE_APP_API_URL}/calls/isCallActive`)
            this.setLoading(false)
            const { data } = response.data
            if (data.callActive) {
                // dont allow to complete because call is still active
                console.log("call still active")
                uiState.showSnackbarMessage("Wait for your call to finish")
            } else {
                // bring user to post call screen
                console.log("call finished, navigate to post call")
                const { call } = data
                console.log(call)
                router.push(`/detail/${call._id}`)
                this.setCallStatus("idle")
            }
        } catch (error) {
            console.log(error)
            this.setLoading(false)
        }
    }
}
