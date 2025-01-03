import { Platform, ThirdPartyAuthnProviderEnum } from '@activepieces/shared'
import { googleAuthnProvider } from './google-authn-provider'

export type AuthnProvider = {
    getLoginUrl: (hostname: string, platform: Platform) => Promise<string>
    authenticate: (
        hostname: string,
        platform: Platform,
        authorizationCode: string
    ) => Promise<FebderatedAuthnIdToken>
}

const emptyProvider: AuthnProvider = {
    getLoginUrl: async () => {
        throw new Error('No provider configured')
    },
    authenticate: async () => {
        throw new Error('No provider configured')
    },
}

export const providers: Record<ThirdPartyAuthnProviderEnum, AuthnProvider> = {
    [ThirdPartyAuthnProviderEnum.GOOGLE]: googleAuthnProvider,
    [ThirdPartyAuthnProviderEnum.SAML]: emptyProvider,
}


export type FebderatedAuthnIdToken = {
    email: string
    firstName: string
    lastName: string
}
