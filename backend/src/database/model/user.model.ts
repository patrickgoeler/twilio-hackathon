import { Document, model, Schema } from "mongoose"

export const DOCUMENT_NAME = "user"
export const COLLECTION_NAME = "users"

export default interface User extends Document {
    phone: string
    city: string
    interests: string[]
    job: string
    language: string
    createdAt: Date
    updatedAt: Date
    points: number
}

export const schema = new Schema(
    {
        phone: {
            type: Schema.Types.String,
            required: true,
            trim: true,
            maxlength: 100,
            unique: true,
        },
        city: {
            type: Schema.Types.String,
            required: true,
            trim: true,
        },
        interests: {
            type: [Schema.Types.String],
            required: true,
        },
        job: {
            type: Schema.Types.String,
            required: true,
        },
        language: {
            type: Schema.Types.String,
            required: true,
        },
        createdAt: {
            type: Schema.Types.Date,
            required: true,
        },
        updatedAt: {
            type: Schema.Types.Date,
            required: true,
        },
        points: {
            type: Schema.Types.Number,
            required: true,
        },
    },
    {
        versionKey: false,
    },
)

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME)
