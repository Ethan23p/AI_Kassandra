import { findUserByUsername, findUserById, createUser } from './db'

export interface User {
    id: string
    username: string
    email?: string
    status: string
}

export const UserManager = {
    /**
     * Gets an existing user or creates a new one based on the username.
     * This is the entry point for person-facing identity.
     */
    async getOrCreateUserByUsername(username: string): Promise<User> {
        const existing = findUserByUsername(username)
        if (existing) {
            return existing
        }

        const newId = crypto.randomUUID()
        createUser(newId, username)

        const newUser = findUserById(newId)
        if (!newUser) throw new Error('Failed to create user')

        return newUser
    },

    /**
     * Gets a user by their internal UUID.
     * This is used by the auth middleware/session logic.
     */
    async getUserById(uuid: string): Promise<User | null> {
        return findUserById(uuid)
    }
}
