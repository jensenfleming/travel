const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
    axios.post('https://hooks.zapier.com/hooks/catch/404051/ier6et/', qs.stringify({
      'Fellow': ticket.fellow,
      'Country': ticket.country,
      'Dates': ticket.dates,
      'Partner': ticket.partner,
      'Budget': ticket.budget,
      'Date': Date.now(),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
  
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: '#fellows-traveling',
    text: 'Fellow added!',
    attachments: JSON.stringify([
      {
        title: `Fellow has been added by ${ticket.userEmail}`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: ticket.text,
        fields: [
          {
            title: 'Fellow Handle',
            value: ticket.fellow,
          },
          {
            title: 'Country',
            value: ticket.country,
          },
          {
            title: 'Dates',
            value: ticket.dates,
          },
          {
            title: 'Date Submitted',
            value: Date.now(),
          },
          {
            title: 'Partner',
            value: ticket.partner,
          },
          {
            title: 'Budget',
            value: ticket.budget,
          },
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const ticket = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    ticket.userId = userId;
    ticket.userEmail = result;
    ticket.fellow = submission.fellow;
    ticket.country = submission.country;
    ticket.dates = submission.dates;
    ticket.partner = submission.partner;
    ticket.budget = submission.budget;
    ticket.date = submission.date;
    sendConfirmation(ticket);

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
