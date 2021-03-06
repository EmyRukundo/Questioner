import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

class Connection {
  constructor() {
    this.pool = new Pool({
      user: process.env.USER,
      host: process.env.HOST,
      database: process.env.DATABASE,
      password: process.env.PASSWORD,
      port: process.env.PORT
    });

    this.connect = async () => this.pool.connect();


    this.userTable = `
    CREATE TABLE IF NOT EXISTS user_table (
    id UUID PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    othername VARCHAR(100),
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    phone_number CHAR(100) NOT NULL,
    registered DATE NOT NULL,
    is_admin int NOT NULL,
    password VARCHAR(100) NOT NULL
        );
        `;
    this.meetupTable = `
    CREATE TABLE IF NOT EXISTS meetup_table (
        id UUID PRIMARY KEY,
        created_on DATE NOT NULL,
        location VARCHAR(100) NOT NULL,
        topic TEXT NOT NULL,
        happening_on DATE NOT NULL
    );
    `;
    this.questionTable = `
    CREATE TABLE IF NOT EXISTS question_table (
        id UUID PRIMARY KEY,
        created_on DATE NOT NULL,
        created_by UUID REFERENCES user_table (id) ON DELETE CASCADE,
        meetup UUID REFERENCES meetup_table (id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        body TEXT NOT NULL,
        upvotes INT NOT NULL,
        downvotes INT NOT NULL
    );
    `;
    this.commentTable = `
    CREATE TABLE IF NOT EXISTS comment_table (
        id UUID PRIMARY KEY,
        created_on DATE NOT NULL,
        created_by UUID REFERENCES user_table (id) ON DELETE CASCADE,
        question UUID REFERENCES question_table (id) ON DELETE CASCADE,
        body TEXT NOT NULL
    );
    `;
    this.votersTable = `
    CREATE TABLE IF NOT EXISTS voters_table (
      id UUID PRIMARY KEY,
      created_on DATE NOT NULL,
      voted_by UUID REFERENCES user_table(id) ON DELETE CASCADE,
      quesion_id UUID REFERENCES question_table (id) ON DELETE CASCADE,
      vote CHAR(10) NOT NULL
    )`;

    this.rsvpTable = `
    CREATE TABLE IF NOT EXISTS rsvp_table (
        id UUID PRIMARY KEY,
        created_on DATE NOT NULL,
        meetup_id UUID REFERENCES meetup_table (id) ON DELETE CASCADE,
        answer VARCHAR(10) NOT NULL
    );
    `;

    this.tagTable = `
    CREATE TABLE IF NOT EXISTS tag_table (
        id UUID PRIMARY KEY,
        tag_name VARCHAR(100) NOT NULL
    );
    `;

    this.meetupImagesTable = `
    CREATE TABLE IF NOT EXISTS meetup_images_table (
        id UUID PRIMARY KEY,
        meetup UUID REFERENCES meetup_table (id) ON DELETE CASCADE,
        url VARCHAR(100) NOT NULL
    );
    `;

    this.meetupTagsTable = `
    CREATE TABLE IF NOT EXISTS meetup_tags_table (
        id UUID PRIMARY KEY,
        meetup UUID REFERENCES meetup_table (id) ON DELETE CASCADE,
        tag UUID REFERENCES tag_table (id) ON DELETE CASCADE
    );
    `;
    this.initializeDb();
  }

  async executeQuery(query, data = []) {
    const connection = await this.connect();
    try {
      // execute a query with parameter
      if (data.length) {
        return await connection.query(query, data);
      }
      // execute a query without parameter
      return await connection.query(query);
    } catch (error) {
      return error;
    } finally {
      connection.release();
    }
  }

  async initializeDb() {
    await this.executeQuery(this.userTable);
    await this.executeQuery(this.meetupTable);
    await this.executeQuery(this.questionTable);
    await this.executeQuery(this.commentTable);
    await this.executeQuery(this.meetupImagesTable);
    await this.executeQuery(this.meetupTagsTable);
    await this.executeQuery(this.rsvpTable);
    await this.executeQuery(this.tagTable);
    await this.executeQuery(this.votersTable);
  }
}
export default new Connection();