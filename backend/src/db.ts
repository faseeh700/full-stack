import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for Neon
});



export const initDB = async() =>{
  const createTable = `
  CREATE TABLE IF NOT EXISTS students  (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    email VARCHAR(100) UNIQUE,
    enrollment_date DATE,
    major VARCHAR(50),
    gpa NUMERIC(3,2)
);
  `

  try {
    await pool.query(createTable);
    console.log('✅ Users table created successfully.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }


}


export default pool;
