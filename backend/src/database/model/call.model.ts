import { Document, model, Schema } from "mongoose"

export const DOCUMENT_NAME = "call"
export const COLLECTION_NAME = "calls"

export default interface Call extends Document {
    callId: string
    conferenceId: string
    phone: string
    commonInterests: string[]
    rating?: number
    createdAt: Date
    completedAt?: Date
}

const schema = new Schema(
    {
        callId: {
            type: Schema.Types.String,
            required: true,
        },
        conferenceId: {
            type: Schema.Types.String,
            required: true,
        },
        phone: {
            type: Schema.Types.String,
            required: true,
        },
        commonInterests: {
            type: [Schema.Types.String],
            required: true,
        },
        rating: {
            type: Schema.Types.Number,
        },
        createdAt: {
            type: Date,
            required: true,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        versionKey: false,
    },
)

export const CallModel = model<Call>(DOCUMENT_NAME, schema, COLLECTION_NAME)