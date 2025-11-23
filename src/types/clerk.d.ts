export interface CustomJwtSessionClaims {
  metadata: {
    role?: 'user' | 'admin'
  }
}

declare global {
  interface UserPublicMetadata {
    role?: 'user' | 'admin'
  }
}
