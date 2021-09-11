/* Copyright (c) V4EX Inc. SPDX-License-Identifier: GPL-3.0-or-later */

// Purpose: Provide CLI command Session to control Session in database.


/**
 * @param {*} Session (optional)
 * @param {*} mongoose (optional)
 * @param {*} modelName (optional)
 * @param {*} env (optional)
 */
 module.exports = ({ Session, mongoose, modelName, env }) => {
  Session = Session || require('../models/session')({ mongoose, modelName, env }).Session

  const { program } = require('commander')

  const done = () => {
    Session.base.connection.close()
  }

  program.command('Session')
         .description('control Session model in database')
         .option('--drop', 'Drop Session model collection in database')
         .action(function(options) {
           if (options.drop) {
             Session.collection.drop(done)
           } else {
             done()
           }
         })

}
