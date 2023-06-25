'use strict';

const Homey = require('homey');
const crypto = require('crypto');

const {
  WEBHOOK_ID, WEBHOOK_SECRET,
} = Homey.env;

class HomeyTogether extends Homey.App {

  async onInit() {
    this.share_id = await this._getShareLink();

    await this.registerWebhook();
  }

  async registerWebhook() {
    if (!this.share_id) {
      throw new Error('Missing share_id.');
    }

    const data = {
      share_id: this.share_id,
    };

    if (this._webhook) {
      await this.unregisterWebhook().catch(this.error);
    }

    this.log(`Webhook registered with share ID: ${data.share_id}`);

    // eslint-disable-next-line max-len
    this._webhook = await this.homey.cloud.createWebhook(WEBHOOK_ID, WEBHOOK_SECRET, data);
    this._webhook.on('message', this._onWebhookMessage.bind(this));
  }

  async unregisterWebhook() {
    if (this._webhook) {
      await this._webhook.unregister();
      this.log('Webhook unregistered');
    }
  }

  _generateShareLink() {
    return crypto.randomBytes(4).toString('hex');
  }

  _getShareLink() {
    let shareId = this.homey.settings.get('share_id');
    if (!shareId) {
      shareId = this._generateShareLink();
      this.homey.settings.set('share_id', shareId);
    }
    return shareId;
  }

  async _onWebhookMessage(args) {
    if (!args.body.message || !args.body.name) {
      throw new Error('Missing message or name.');
    }

    const name = args.body.name.substring(0, 80);
    const message = args.body.message.substring(0, 280);

    this.log(`Triggered webhook with name ${name} and message ${message}`);
    await this.homey.flow.getTriggerCard('aprilfools_trigger')
      .trigger({ message, name })
      .catch(this.error);
  }

}

module.exports = HomeyTogether;
