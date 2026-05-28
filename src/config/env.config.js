import dotenv from 'dotenv'

dotenv.config()

const ENVIRONMENT = {
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    PORT: process.env.PORT,
    DB_NAME: process.env.DB_NAME,
    DB_LOCAL_HOST: process.env.DB_LOCAL_HOST,
    JWT_SECRET: process.env.JWT_SECRET,
    LOCAL_HOST: process.env.LOCAL_HOST,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
}
export default ENVIRONMENT
