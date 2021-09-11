/* Copyright (c) V4EX Inc. SPDX-License-Identifier: GPL-3.0-or-later */

// Purpose: 
//  - Provide login() to add new Session to database.


/**
 * @param {*} env (optional)
 */
 module.exports = ({ env }) => {
  if (env === undefined) {
    require('dotenv').config()
    env = process.env
  }

  /**
   * @param {mongoose.Model()} Session
   * @param {mongoose.Document()} registry
   * @param {String} plainTextPassword 
   * @param {function} callback 
   */
  const login = (Session, registry, plainTextPassword, callback) => {
    const bcrypt = require('bcrypt')

    registry.populate('password')
            .then(registry => {
              bcrypt.compare(plainTextPassword, registry.password.hash)
                    .then(result => {
                      if (!result) {
                        throw new Error('Invalid password.')
                      }
                      Session.create({ identity: registry.identity, registry })
                             .then(session => {
                               callback(null, session)
                             })
                             .catch(err => {
                               console.error(err)
                               callback(err)
                             })
                    })
                    .catch((err) => {
                      console.error(err)
                      callback(err)
                    })
            })
            .catch(err => {
              console.error(err)
            })
  }

  return {
    login
  }
}
