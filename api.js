'use strict';

module.exports = {
  async getShareLink({ homey }) {
    homey.log('getShareLink()');
    return homey.settings.get('share_id');
  },
};
