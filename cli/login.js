/* Copyright (c) V4EX Inc. SPDX-License-Identifier: GPL-3.0-or-later */

const identity = require('v4ex-api-identity/models/identity')
const publicKey = require('v4ex-api-key/models/public-key')

// Purpose: Provide CLI command login.


/**
 * @param {Object} {}
 *   - @param {mongoose.Model()} Session (optional)
 *   - @param {*} mongoose (optional)
 *   - @param {*} modelName (optional)
 *   - @param {*} env (optional)
 * @param {*} IdentitySettings (optional)
 * @param {*} RegistrySettings (optional)
 * @param {*} PublicKeySettings (optional)
 */
module.exports = ({ Session, mongoose, modelName, env } , IdentitySettings, RegistrySettings, PublicKeySettings) => {
  Session = Session || require('../models/session')({ mongoose, modelName, env }).Session
  const { login } = require('../lib/login')({ env })

  const { Identity } = require('v4ex-api-identity/models/all-identity')(IdentitySettings || {})
  const { Registry } = require('v4ex-api-register/models/registry')(RegistrySettings || {})
  const { PublicKey } = require('v4ex-api-key/models/public-key')(PublicKeySettings || {})

  const { program } = require('commander')

  const done = () => {
    Session.base.connection.close()
  }

  const handleError = (err) => {
    console.error(err)
    done()
  }

  program.command('login')
         .description('login and add new Session to database')
         .argument('<password>', 'plain password text')
         .argument('[publicKey]', 'public key in key pair')
         .option('--username <username>', 'username for identity')
         .option('--email <email>', 'email for identity')
         .action(function(plainTextPassword, publicKeyText, options) {
           let find = {}
           if (options.username) {
             find.username = options.username
           } else if (options.email) {
             find.email = options.email
           }

           Identity.findOne(find)
           .then(identity => {
             Registry.findOne({ identity })
                     .then(registry => {
                       const callback = (err, session) => {
                         if (err) {
                           handleError(err)
                         } else {
                           console.log(session)
                           done()
                         }
                       }
                       if (publicKeyText) {
                         PublicKey.create({ identity, key: publicKeyText })
                                  .then(publicKey => {
                                    login(Session, registry, plainTextPassword, publicKey, callback)
                                  })
                                  .catch(err => handleError(err))
                       } else {
                         login(Session, registry, plainTextPassword, callback)
                       }
                     })
                     .catch(err => handleError(err))
           })
           .catch(err => handleError(err))
         })

}
