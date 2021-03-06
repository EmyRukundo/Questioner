import Connection from '../db/connect';
import Validation from '../helpers/validation';
import jsonWebToken from 'jsonwebtoken';
import uuid from 'uuid';
import joi from 'joi';


const createQuestion= (req, res) => {
  joi.validate(req.body, Validation.questionSchema, Validation.validationOption).then((result) => {
    let token = 0;
    let decodedToken = '';
    let userId = '';
    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
      decodedToken = jsonWebToken.verify(token, 'secret');
      userId = decodedToken.user[0].id;
    } else {
      return res.sendStatus(403);
    }
    const newQuestion = [
      uuid.v4(),
      new Date(),
      userId,
      req.params.id, 
      result.title,
      result.body,
      0,
      0,
    ];
    const sql = 'INSERT INTO question_table (id,created_on,created_by,meetup,title,body,upvotes,downvotes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *';

    const question = Connection.executeQuery(sql, newQuestion);
    question.then((questionResult) => {
      if (questionResult.rows.length!==0) {
        return res.status(201).json({
          status: 201,
          data: questionResult.rows,
        });
      }
      return res.status(400).json({
        status: 400,
        error: 'Question could not be created',
      });
    }).catch(error => res.status(500).json({
      status: 500,
      error: `Internal server error ${error}`,
    }));
  })
};


export default createQuestion;

