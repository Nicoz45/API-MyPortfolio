
export const ROLES = {
    USER: "user",
    PREMIUM: "premium",
    MOD: "mod",
    ADMIN: "admin"
}

export const ROLE_HIERARCHY = {
    [ROLES.USER]: 1,
    [ROLES.PREMIUM]: 2,
    [ROLES.MOD]: 3,
    [ROLES.ADMIN]: 4
}

export const ROLE_LIMITS = {
    [ROLES.USER]: {
        maxProjects: 10,
        maxPrivateProjects: 3,
        maxFilesPerProject: 20,
        maxFileSize: 10 * 1024 * 1024, // 10 MB
        canCustomizeDomain: false,
    },
    [ROLES.PREMIUM]: {
        maxProjects: 50,
        maxPrivateProjects: 20,
        maxFilesPerProject: 100,
        maxFileSize: 50 * 1024 * 1024, // 50 MB
        canCustomizeDomain: true,
    },
    [ROLES.MOD]: {
        maxProjects: 50,
        maxPrivateProjects: 20,
        maxFilesPerProject: 100, 
        maxFileSize: 50 * 1024 * 1024, // 50 MB,
        canCustomizeDomain: true,
    },
    [ROLES.ADMIN]: {
        maxProjects: Infinity,
        maxPrivateProjects: Infinity,
        maxFilesPerProject: Infinity,
        maxFileSize: Infinity,
        canCustomizeDomain: true,
    }
}
