import { sign, verify } from "jsonwebtoken"
import { promisify } from "util"
import { PRIVATE_KEY, PUBLIC_KEY } from "../config"
import { BadTokenError, InternalError, TokenExpiredError } from "./ApiError"
import Logger from "./Logger"

export default class JWT {
    private static readPublicKey(): string {
        return PUBLIC_KEY
        // return promisify(readFile)(path.join(__dirname, "../../keys/public.pem"), "utf8")
    }

    private static readPrivateKey(): string {
        return PRIVATE_KEY
        // return promisify(readFile)(path.join(__dirname, "../../keys/private.pem"), "utf8")
    }

    public static async encode(payload: JwtPayload): Promise<string> {
        const cert = await this.readPrivateKey()
        if (!cert) throw new InternalError("Token generation failure")
        // @ts-ignore
        return promisify(sign)({ ...payload }, cert, { algorithm: "RS256" })
    }

    /**
     * This method checks the token and returns the decoded data when token is valid in all respect
     */
    public static async validate(token: string): Promise<JwtPayload> {
        const cert = await this.readPublicKey()
        try {
            // @ts-ignore
            return <JwtPayload>await promisify(verify)(token, cert)
        } catch (e) {
            Logger.debug(e)
            if (e && e.name === "TokenExpiredError") throw new TokenExpiredError()
            // throws error if the token has not been encrypted by the private key
            throw new BadTokenError()
        }
    }

    /**
     * Returns the decoded payload if the signature is valid even if it is expired
     */
    public static async decode(token: string): Promise<JwtPayload> {
        const cert = await this.readPublicKey()
        try {
            // @ts-ignore
            return <JwtPayload>await promisify(verify)(token, cert, { ignoreExpiration: true })
        } catch (e) {
            Logger.debug(e)
            throw new BadTokenError()
        }
    }
}

export class JwtPayload {
    aud: string

    sub: string

    iss: string

    iat: number

    exp: number

    prm: string

    constructor(issuer: string, audience: string, subject: string, param: string, validity: number) {
        this.iss = issuer
        this.aud = audience
        this.sub = subject
        this.iat = Math.floor(Date.now() / 1000)
        this.exp = this.iat + validity * 24 * 60 * 60
        this.prm = param
    }
}
