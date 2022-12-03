import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
//decode
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
// import { Key } from '../../auth/Jwks'
// import * as AWS from 'aws-sdk'
import { JwtPayload } from '../../auth/JwtPayload'
const logger = createLogger('auth')
// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD

const cert = `-----BEGIN CERTIFICATE-----
MIIDITCCAgmgAwIBAgIJUP7Bwov4YVK8MA0GCSqGSIb3DQEBCwUAMC4xLDAqBgNV
BAMTI2hhbmdudDczLXVkYWNpdHlkb21haW4udXMuYXV0aDAuY29tMB4XDTIyMTEy
OTA4MzgxNVoXDTM2MDgwNzA4MzgxNVowLjEsMCoGA1UEAxMjaGFuZ250NzMtdWRh
Y2l0eWRvbWFpbi51cy5hdXRoMC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
ggEKAoIBAQClRkZvO87ixtyASywjDZ7GBuC0Sy4M6NGPooz3YftSDSiTDLsppAYI
XjDCgmHqHBJJs/KF/fDobG5qR++pifmOx7hm+D8oReChtb5z5mJ11JC/yBxhSp+o
BhgTLBDy6xWm+xZMcVcxxRYjU6zgD0UFzr28U47R+gTV9p9bXHvFC9/j7Ee3P0dh
XVwwN/b5R+ryTEwKj2e6TZzd2xk786JXQg10ZNgOP7semPXuEC0/8WEBw1UOJlCJ
oYd503J9RG7atfcK7hyJAVsk1p7bkhIAoic/V/q65RpQmZ98ttXrb7wYkp1KIduN
a6yMLMWJOvU2OI9uwTsjubP7xjPvTYTvAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMB
Af8wHQYDVR0OBBYEFN7pdL3qvfNhgMh/9Y0zuF9a6/mLMA4GA1UdDwEB/wQEAwIC
hDANBgkqhkiG9w0BAQsFAAOCAQEAZGuW+LVTOl6ClIaul8BeaSqTYffAphg3koMe
yQ0L1V66cdB8HKuRvxMZtjBcKGpDFhiKL+Ttc4zfJsLj6bxFFEZNNzXCMfqfRGF2
xFDq8WM9Rejar+/pxAQ9642GQ52KgpqmDH9K0gZVOHXkIHUFCqj/7lamglfytksK
j+be6s2aD0hXed30Q1d13m7azCpP6cuxrEVu08lGvZFCNuWSMCl28Tod/Mc6iPgC
VPTQY2nSkRVzhcWX63vX5rCGDRsNqxl7O8IIO6B6pEJX+ynETT/pM2VZMA93B22e
z3CHpZ+wYi3CiAICSJq5t0z8/jrPkAqXIb8QdE31g3OpjjC8gA==
-----END CERTIFICATE-----`

// const getSecretManager = new AWS.SecretsManager()

//cache credential when refreshing page
// let cacheCredential: string
// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl =
//   'https://hangnt73-udacitydomain.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  // const secretJwk = await Axios.get(jwksUrl)
  // logger.info(secretJwk)

  // const listJwkKeys = secretJwk.data.keys
  // logger.info(listJwkKeys)

  // const signingKeys = listJwkKeys.find((key) => key.kid === jwt.header.kid)
  // logger.info(signingKeys)

  // const pemData = signingKeys.x5c[0]
  // logger.info(pemData)

  // const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`
  // // const secretCredentialItem = secretCredentialObject[secretField]
  // // const res = await Axios.get(jwksUrl)
  // // logger.info(res)
  // // const data = res['data']['keys'][0]['x5c'][0]
  // // logger.info(data)
  // // let cert = `-----BEGIN CERTIFICATE-----\n${data}\n-----END CERTIFICATE-----`
  // // logger.info(cert)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
// async function getSecretCredential() {
//   if (cacheCredential) {
//     return cacheCredential
//   }
//   const newCacheCredential = await getSecretManager
//     .getSecretValue({
//       SecretId: secretId
//     })
//     .promise()

//   cacheCredential = newCacheCredential.SecretString
//   return JSON.parse(cacheCredential)
// }
