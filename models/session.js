/* Copyright (c) V4EX Inc. SPDX-License-Identifier: GPL-3.0-or-later */

const publicKey = require('v4ex-api-key/models/public-key')

// Purpose: Provide Session, SessionSchema instances.


/**
 * @param {Object} {}
 *   - @param {*} mongoose (optional)
 *   - @param {*} modelName (optional)
 *   - @param {*} env (optional)
 * @param {*} IdentitySettings (optional)
 * @param {*} RegistrySettings (optional)
 * @param {*} PublicKeySettings (optional)
 */
module.exports = ({ mongoose, modelName, env }, IdentitySettings, RegistrySettings, PublicKeySettings) => {
  const { Identity } = require('v4ex-api-identity/models/all-identity')(IdentitySettings || {})
  const { Registry } = require('v4ex-api-register/models/registry')(RegistrySettings || {})
  const { PublicKey } = require('v4ex-api-key/models/public-key')(PublicKeySettings || {})
  

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
      loggedInAt: { type: Date, immutable: true },
      publicKey: { type: mongoose.ObjectId, ref: PublicKey, unique: true, sparse: true, immutable: true }
    })
    // #1 Set loggedInAt field to current date
    SessionSchema.pre('save', function(next) {
      if (!this.loggedInAt) {
        this.loggedInAt = new Date()
      }
      next()
    })
    // #2 Save session relation in publicKey
    SessionSchema.post('save', function(session) {
      if (this.publicKey) {
        PublicKey.findByIdAndUpdate(this.publicKey, { session })
                 .then(publicKey => {})
                 .catch(err => console.error(err))
      }
    })
    Session = mongoose.model(modelName, SessionSchema)
  }


  return {
    Session,
    SessionSchema
  }
}
