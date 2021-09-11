/* Copyright (c) V4EX Inc. SPDX-License-Identifier: GPL-3.0-or-later */

// Purpose: Provide Session, SessionSchema instances.


/**
 * @param {*} mongoose (optional)
 * @param {*} modelName (optional)
 * @param {*} env (optional)
 * @param {*} IdentitySettings (optional)
 * @param {*} RegistrySettings (optional)
 */
module.exports = ({ mongoose, modelName, env }, IdentitySettings, RegistrySettings) => {
  const { Identity } = require('v4ex-api-identity/models/all-identity')(IdentitySettings || {})
  const { Registry } = require('v4ex-api-register/models/registry')(RegistrySettings || {})

  mongoose = mongoose || require('../mongoose')({ env })
  modelName = modelName || 'Session'

  let Session, SessionSchema

  if (mongoose.modelNames().includes(modelName)) {
    Session = mongoose.model(modelName)
    SessionSchema = Session.schema
  } else {
    const Schema = mongoose.Schema
    SessionSchema = new Schema({
      identity: { type: mongoose.ObjectId, ref: Identity, immutable: true },
      registry: { type: mongoose.ObjectId, ref: Registry, immutable: true },
      loggedInAt: { type: Date, immutable: true }
    })
    SessionSchema.pre('save', function(next) {
      if (!this.loggedInAt) {
        this.loggedInAt = new Date()
      }
      next()
    })
    Session = mongoose.model(modelName, SessionSchema)
  }


  return {
    Session,
    SessionSchema
  }
}
