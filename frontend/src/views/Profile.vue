<template>
    <Layout>
        <AppBar />
        <v-layout column align-center>
            <v-row no-gutters justify="center" class="mb-4">
                <h1 class="display-1">Profile</h1>
            </v-row>
            <v-form style="width:100%;" @submit.prevent="updateUser()">
                <v-card class="mx-auto" max-width="500">
                    <v-card-title>Your Information</v-card-title>
                    <v-card-text>
                        <v-text-field
                            prepend-icon="mdi-phone"
                            v-model="phone"
                            label="Phone"
                            type="tel"
                            readonly
                            hint="Please prepend your country code. E.g. +49157..."
                            required
                            :error-messages="phoneErrors()"
                            :loading="userModuleLoading()"
                            @input="$v.phone.$touch()"
                            @blur="$v.phone.$touch()"
                        ></v-text-field>
                        <v-text-field
                            prepend-icon="mdi-city"
                            v-model="city"
                            @input="$v.city.$touch()"
                            @blur="$v.city.$touch()"
                            :error-messages="cityErrors()"
                            :loading="userModuleLoading()"
                            label="City"
                            type="text"
                            required
                        ></v-text-field>
                        <v-combobox
                            v-model="interests"
                            chips
                            :deletable-chips="true"
                            :delimiters="[' ', ',']"
                            clearable
                            @blur="$v.interests.$touch()"
                            :error-messages="interestErrors()"
                            :loading="userModuleLoading()"
                            label="Your favorite hobbies or interests"
                            multiple
                            prepend-icon="mdi-table-tennis"
                        >
                        </v-combobox>
                        <v-text-field
                            prepend-icon="mdi-briefcase"
                            v-model="job"
                            label="Occupation"
                            @input="$v.job.$touch()"
                            @blur="$v.job.$touch()"
                            :error-messages="jobErrors()"
                            :loading="userModuleLoading()"
                            type="text"
                            required
                        ></v-text-field>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-select
                                    :items="languages"
                                    v-model="language"
                                    prepend-icon="mdi-translate"
                                    label="Language"
                                    readonly
                                    required
                                    v-on="on"
                                ></v-select>
                            </template>
                            <span>We only support English for now</span>
                        </v-tooltip>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn large type="submit" color="primary">Update</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>

            <v-card :loading="settingModuleLoading()" class="mx-auto mt-8" max-width="500" width="100%">
                <v-card-title>Scheduled Calls</v-card-title>
                <v-card-text>
                    <p>
                        Don't want to sit in the queue until we can find a match for you? Set up scheduled calls and our
                        schedule-wizard 🧙‍♂️ will automagically initiate calls for you in your selected time frame. Set
                        it, forget it and get matched with friendly strangers. 😊
                    </p>
                    <transition name="slide">
                        <div v-if="settingExists">
                            <h1 class="body-2 ">Selected days</h1>
                            <v-row justify="center" class="mb-4">
                                <v-btn-toggle v-model="days" dense color="secondary" background-color="gray" multiple>
                                    <v-btn small :value="1">Mon</v-btn>
                                    <v-btn small :value="2">Tue</v-btn>
                                    <v-btn small :value="3">Wed</v-btn>
                                    <v-btn small :value="4">Thu</v-btn>
                                    <v-btn small :value="5">Fri</v-btn>
                                    <v-btn small :value="6">Sat</v-btn>
                                    <v-btn small :value="0">Sun</v-btn>
                                </v-btn-toggle>
                            </v-row>
                            <v-row v-if="daysErrors[0]" justify="center">
                                <h1 class="caption error--text">{{ daysErrors[0] }}</h1></v-row
                            >
                            <v-row no-gutters>
                                <v-col cols="6" class="pr-2">
                                    <v-dialog
                                        ref="startDialog"
                                        v-model="settingStartModal"
                                        :return-value.sync="startTime"
                                        persistent
                                        width="290px"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field
                                                v-model="startTime"
                                                label="Start Time"
                                                prepend-icon="mdi-clock-outline"
                                                readonly
                                                :error-messages="startTimeErrors"
                                                v-on="on"
                                            ></v-text-field>
                                        </template>
                                        <v-time-picker v-if="settingStartModal" v-model="startTime" format="24hr">
                                            <v-spacer></v-spacer>
                                            <v-btn text color="primary" @click="settingStartModal = false"
                                                >Cancel</v-btn
                                            >
                                            <v-btn text color="primary" @click="$refs.startDialog.save(startTime)"
                                                >OK</v-btn
                                            >
                                        </v-time-picker>
                                    </v-dialog>
                                </v-col>
                                <v-col cols="6" class="pl-2">
                                    <v-dialog
                                        ref="endDialog"
                                        v-model="settingEndModal"
                                        :return-value.sync="endTime"
                                        persistent
                                        width="290px"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field
                                                v-model="endTime"
                                                label="End Time"
                                                prepend-icon="mdi-clock-outline"
                                                readonly
                                                :error-messages="endTimeErrors"
                                                v-on="on"
                                            ></v-text-field>
                                        </template>
                                        <v-time-picker v-if="settingEndModal" v-model="endTime" format="24hr">
                                            <v-spacer></v-spacer>
                                            <v-btn text color="primary" @click="settingEndModal = false">Cancel</v-btn>
                                            <v-btn text color="primary" @click="$refs.endDialog.save(endTime)"
                                                >OK</v-btn
                                            >
                                        </v-time-picker>
                                    </v-dialog>
                                </v-col>
                            </v-row>
                            <h1 class="body-2">Maximum calls per day</h1>
                            <v-slider
                                class="mt-8"
                                v-model="numPerDay"
                                min="1"
                                max="10"
                                ticks="always"
                                tick-size="2"
                                thumb-label="always"
                                track-color="orange lighten-5"
                                track-fill-color="secondary"
                                thumb-color="secondary"
                                thumb-size="24"
                                hide-details="true"
                            ></v-slider>
                        </div>
                    </transition>
                </v-card-text>

                <v-card-actions>
                    <v-btn
                        :loading="settingModuleLoading()"
                        text
                        large
                        v-if="settingCreated"
                        @click="deleteScheduleSetting"
                        >Disable<v-icon small>mdi-delete</v-icon></v-btn
                    >
                    <v-spacer></v-spacer>
                    <v-btn v-if="!settingExists && !settingCreated" @click="settingExists = true"
                        >Set up scheduled calls</v-btn
                    >
                    <v-btn
                        :loading="settingModuleLoading()"
                        large
                        v-if="settingExists && !settingCreated"
                        @click="updateScheduleSetting"
                        color="primary"
                        >Set up scheduled calls</v-btn
                    >

                    <v-btn
                        :loading="settingModuleLoading()"
                        large
                        v-if="settingCreated"
                        @click="updateScheduleSetting"
                        color="primary"
                        >Update</v-btn
                    >
                </v-card-actions>
            </v-card>
            <v-row no-gutters style="width:100%;max-width:500px;" class="mt-8" justify="space-between">
                <v-dialog v-model="showDeleteDialog" width="500">
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" :loading="userModuleLoading()" color="error" @click="showDeleteDialog = true"
                            >Delete account</v-btn
                        >
                    </template>

                    <v-card>
                        <v-card-title>
                            Are you sure?
                        </v-card-title>

                        <v-card-text>
                            You are about to delete your account. This erases everything and cannot be undone.
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="deleteEverything">
                                Delete Me
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-btn :loading="userModuleLoading()" @click="logout">Logout<v-icon>mdi-logout</v-icon></v-btn>
            </v-row>
        </v-layout>
        <BottomNav />
    </Layout>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-out;
    /* just bigger than the container */
    max-height: 300px;
}

.slide-enter,
.slide-leave-to {
    opacity: 0;
    max-height: 0px;
}
</style>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator"
import { required } from "vuelidate/lib/validators"
import { validationMixin } from "vuelidate"
import BottomNav from "../components/BottomNav.vue"
import Layout from "../components/Layout.vue"
import AppBar from "../components/AppBar.vue"
import userModule from "@/store/modules/user.module"
import settingModule, { Setting } from "@/store/modules/setting.module"

const validations = {
    phone: { required },
    city: { required },
    interests: {
        required,
        minTwo: (value: string[]) => value.length > 1,
    },
    job: { required },
}

@Component({ mixins: [validationMixin], validations, components: { BottomNav, AppBar, Layout } })
export default class Profile extends Vue {
    // User
    phone = userModule.user.phone
    city = userModule.user.city
    interests = userModule.user.interests
    job = userModule.user.job
    language = userModule.user.language
    languages = ["English"]

    showDeleteDialog = false

    userModuleLoading() {
        return userModule.loading
    }
    settingModuleLoading() {
        return settingModule.loading
    }

    // Settings
    settingStartModal = false
    settingEndModal = false
    settingExists = false
    settingCreated = false

    userId = ""
    days: number[] = []
    startTime = "16:00"
    endTime = "18:00"
    numPerDay = 1

    // Setting validation
    startTimeErrors: string[] = []
    endTimeErrors: string[] = []
    daysErrors: string[] = []

    async created() {
        if (!userModule.user._id) {
            await userModule.getUser()
            this.phone = userModule.user.phone
            this.city = userModule.user.city
            this.interests = userModule.user.interests
            this.job = userModule.user.job
            this.language = userModule.user.language
        }
        if (!settingModule.setting._id) {
            const set = await settingModule.getSetting()
            if (set && set._id) {
                this.updateLocalSetting(set)
                this.settingExists = true
                this.settingCreated = true
            }
        } else {
            this.updateLocalSetting(settingModule.setting)
            this.settingExists = true
            this.settingCreated = true
        }
    }

    increment() {
        this.numPerDay += 1
    }
    decrement() {
        if (this.numPerDay > 1) this.numPerDay -= 1
    }

    updateLocalSetting(setting: Setting) {
        this.userId = setting.userId
        this.days = setting.days

        // Convert UTC time from DB back to local time
        const localOffsetHours = new Date().getTimezoneOffset() / 60
        const startTimesUTC = setting.startTime.split(":")
        const endTimesUTC = setting.endTime.split(":")
        const startTimeLocal = `${parseInt(startTimesUTC[0]) - localOffsetHours}:${startTimesUTC[1]}`
        const endTimeLocal = `${parseInt(endTimesUTC[0]) - localOffsetHours}:${endTimesUTC[1]}`
        this.startTime = startTimeLocal

        this.endTime = endTimeLocal
        this.numPerDay = setting.numPerDay
    }

    phoneErrors() {
        const errors: string[] = []
        if (!this.$v.phone.$dirty) return errors
        !this.$v.phone.required && errors.push("Phone is required.")
        return errors
    }

    cityErrors() {
        const errors: string[] = []
        if (!this.$v.city.$dirty) return errors
        !this.$v.city.required && errors.push("City is required.")
        return errors
    }

    interestErrors() {
        const errors: string[] = []
        if (!this.$v.interests.$dirty) return errors
        !this.$v.interests.required && errors.push("Interests are required.")
        !this.$v.interests.minTwo && errors.push("You need at least two.")
        return errors
    }

    jobErrors() {
        const errors: string[] = []
        if (!this.$v.job.$dirty) return errors
        !this.$v.job.required && errors.push("Occupation is required.")
        return errors
    }

    removeInterest(chip: string) {
        const index = this.interests.indexOf(chip)
        this.interests.splice(index, 1)
    }

    async updateUser() {
        console.log("update user info")

        this.$v.$touch()
        if (!this.$v.$invalid) {
            await userModule.updateUser({ city: this.city, interests: this.interests, job: this.job })
        }
    }

    checkSettings() {
        this.daysErrors = []
        this.startTimeErrors = []
        this.endTimeErrors = []

        if (this.days.length === 0) this.daysErrors.push("Please select at least one day")
        if (this.startTime === "") this.startTimeErrors.push("Start time is required")
        if (this.endTime === "") this.endTimeErrors.push("End time is required")

        const startTimes = this.startTime.split(":")
        const endTimes = this.endTime.split(":")

        const sT = new Date()
        const eT = new Date()
        sT.setHours(parseInt(startTimes[0]), parseInt(startTimes[1]))
        eT.setHours(parseInt(endTimes[0]), parseInt(endTimes[1]))

        if (sT > eT) this.endTimeErrors.push("End time must be after start time")

        if (this.startTimeErrors[0] || this.endTimeErrors[0] || this.daysErrors[0]) return false
        return true
    }

    async updateScheduleSetting() {
        if (!this.checkSettings()) return

        console.log("update scheduled call info")
        // Convert local time from browser to UTC time for DB
        const localOffsetHours = new Date().getTimezoneOffset() / 60
        const startTimes = this.startTime.split(":")
        const endTimes = this.endTime.split(":")

        const startTimeUTC = `${parseInt(startTimes[0]) + localOffsetHours}:${startTimes[1]}`
        const endTimeUTC = `${parseInt(endTimes[0]) + localOffsetHours}:${endTimes[1]}`

        await settingModule.updateSetting({
            days: this.days,
            startTime: startTimeUTC,
            endTime: endTimeUTC,
            numPerDay: this.numPerDay,
        })
        this.settingCreated = true
    }

    async deleteScheduleSetting() {
        console.log("delete scheduled call setting")
        await settingModule.deleteSetting()
        this.settingExists = false
        this.settingCreated = false

        this.userId = ""
        this.days = []
        this.startTime = ""
        this.endTime = ""
        this.numPerDay = 1
    }

    logout() {
        userModule.logout()
    }

    deleteEverything() {
        this.showDeleteDialog = false
        userModule.deleteEverything()
    }
}
</script>
