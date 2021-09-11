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
   * @param {mongoose.Document()} publicKey (optional)
   * @param {function} callback 
   */
  const login = (Session, registry, plainTextPassword, publicKey, callback) => {
    if (typeof publicKey === 'function') {
      callback = publicKey
      publicKey = undefined
    }

    const bcrypt = require('bcrypt')

    registry.populate('password')
            .then(registry => {
              // Compare password
              bcrypt.compare(plainTextPassword, registry.password.hash)
                    .then(result => {
                      if (!result) {
                        throw new Error('Invalid password.')
                      }
                      // Create new Session
                      Session.create({ identity: registry.identity, registry, publicKey })
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
