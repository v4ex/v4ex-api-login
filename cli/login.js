/* Copyright (c) V4EX Inc. SPDX-License-Identifier: GPL-3.0-or-later */

const identity = require('v4ex-api-identity/models/identity')

// Purpose: Provide CLI command login.


module.exports = ({ Session, mongoose, modelName, env, IdentitySettings, RegistrySettings }) => {
  Session = Session || require('../models/session')({ mongoose, modelName, env }).Session
  const { login } = require('../lib/login')({ env })

  const { Identity } = require('v4ex-api-identity/models/all-identity')(IdentitySettings || {})
  const { Registry } = require('v4ex-api-register/models/registry')(RegistrySettings || {})

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
         .option('--username <username>', 'username for identity')
         .option('--email <email>', 'email for identity')
         .action(function(plainTextPassword, options) {
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
                       login(Session, registry, plainTextPassword, (err, session) => {
                         if (err) {
                           handleError(err)
                         } else {
                           console.log(session)
                           done()
                         }
                       })
                     })
                     .catch(err => {
                       handleError(err)
                     })
           })
           .catch(err => {
             handleError(err)
           })
         })

}
